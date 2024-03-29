var express = require('express');
var nodeExcel = require('excel-export');
var router = express.Router();
const mysql = require('mysql');
var Chart = require('chart.js');
var fs=require('fs');
var url  = require('url');
var DBConfig = require('../config/DBConfig');

var getHistoryEnergy = require('./solar/getHistoryEnergy');
var getInverterList = require('./solar/getInverterList');

var ChargingPileTest = require('./chargingpile/chargingpiletest');
var ChargingPileOverview = require('./chargingpile/chargingpileoverview'); 
var ChargingPileManagement = require('./chargingpile/chargingpilemanagement');
var ChargingPileReport = require('./chargingpile/chargingpilereport');
var ChargingPileSetting = require('./chargingpile/chargingpilesetting');

var getTokenByMacAddress = require('./gateway/getTokenByMacAddress')
var addMacAddress = require('./gateway/addMacAddress');
var updateMachineStatus = require('./gateway/updateMachineStatus');
var addMachineCommand = require('./gateway/addMachineCommand');
var getMachineStatus = require('./gateway/getMachineStatus');


var config = DBConfig.DBConfig;

var online_count = 0;
var total_count = 0;
var today_energy = 0.0;

//const conn = new mysql.createConnection(config);

/* GET home page. */
router.get('/', function(req, res) { //, next) {
  //res.render('index', { title: 'Express' });
  res.render('login', {
  	title: 'Oring Solar Demo',
	  showMessage: ''
  });
});

router.get('/SolarSummary', function(req, res) {

	var commandString = 'SELECT SUM(energy)/1000 AS TotalEnergy FROM table_solar_hist3_month WHERE r_year=2021 GROUP BY r_year';
	

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){

		var totalenergy = 0;
		var today_total_energy = 0;
		var today_unit_energy = 0;
		var today_hour_energy = 0;
		var today_online_count = 0;
		var today_offline_count = 0;
		var today_online_prec = 0;
		var today_set_energy = 0;
		var today_eff_energy = 0;

		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err) {conn.end(); res.send('Get Data Error'); }
			  	else{
				  	if(rows.length > 0){
						totalenergy = rows[0]['TotalEnergy'];
				  	}
					else{
						totalenergy = 0;
					}


					conn.query('SELECT * FROM view_today_information;', function(err, rows){
						if(err) { conn.end(); res.send('Get Data Error 2'); }
						else{
							if(rows.length > 0){
								today_total_energy = rows[0]['Total_Energy'];
								today_unit_energy = rows[0]['Unit_Energy'];
								if(rows[0]['Hour_Energy']===null)
									today_hour_energy = 0;
								else
									today_hour_energy = rows[0]['Hour_Energy'];
								today_set_energy = rows[0]['SetUp_Energy'];
								today_eff_energy = rows[0]['Eff_Energy'];
							}
							else
							{
								today_total_energy = 0;
								today_unit_energy = 0;
								today_hour_energy = 0;
								today_set_energy = 0;
								today_eff_energy = 0;
							}

							conn.query('SELECT * FROM view_today_inverter_onlineinformation;', function(err, rows){
								if(err) {conn.end(); res.send('Get Data Error 3 - Summary'); }
								else{
									if(rows.length > 0){
										today_online_count = rows[0]['OnlineCount'];
										today_offline_count = rows[0]['OfflineCount'];
										today_online_prec = rows[0]['OnlinePrec'];

										var online_data = [];
										var online_title = ['Effort', 'Amount given'];
										online_data.push(online_title);
										var online_value = [];
										online_value.push('上線');
										online_value.push(today_online_count);
										online_data.push(online_value);
										var offline_value = [];
										offline_value.push('離線');
										offline_value.push(today_offline_count);
										online_data.push(offline_value);
										var onlineDataString = JSON.stringify(online_data);

										
									}
									else{
										
									}

									conn.query('SELECT * FROM view_today_hourenergy;', function(err, rows){
										if(err) {conn.end(); res.send('Get Data Error 4'); }
										else{
											if(rows.length > 0){
												var hourdata = [0, 0, 0, 0, 0, 
													0, 0, 0, 0, 0,
													0, 0, 0, 0, 0,
													0, 0, 0, 0, 0,
													0, 0, 0, 0];
												var hourdatas = [];
												hourdatas.push(['Hour', 'Energy']);
												
												rows.forEach( (row) => {
													var _hour_index = row['r_hour'];
													hourdata[_hour_index] = row['Total_Hour_Energy'];
												});

												for(i=0;i<24;i++){
													var _hourdata = [];
													_hourdata.push(i.toString());
													_hourdata.push(hourdata[i]);

													hourdatas.push(_hourdata);
												}

												var hourDataString = JSON.stringify(hourdatas);
												//console.log(hourDataString)
												
											}
											else{
												
											}
										}

										conn.query('SELECT * FROM view_today_area_information;', function(err, rows){
											if(err) {conn.end(); res.send('Get Data Error 5'); }
											else{
												if(rows.length > 0){
													var areainformationdata = rows;

													conn.query('SELECT * FROM view_today_abnormal_inveter;', function(err, rows){
														if(err) res.send('Get Data Error 6');
														else{
															var abnormal_inverter_list = rows;

															conn.end();
															res.render('solarsummary', {
																title: 'Oring Solar Systen Demo - Summary',
																setTotalEnergy: totalenergy,
																setTodayTotalEnergy: today_total_energy,
																setTodayUnitEnergy: today_unit_energy,
																setTodayHourEnergy: today_hour_energy,
																setTodayOnlineCount: today_online_count,
																setTodayOfflineCount: today_offline_count,
																setTodayOnlinePrec: today_online_prec,
																setOnlineChart: onlineDataString,
																setHourChart: hourDataString,
																setAreaInformation: areainformationdata,
																setAbnormalInverter: abnormal_inverter_list,
																setTodaySetupEnergy: today_set_energy,
																setTodayEffEnergy: today_eff_energy
															});
														}
													});

													
												}
												else{

												}
											}
										});
									});
								}
							});
						}
					})
				}



				
			});
		}

		

		
	});
});

router.get('/SolarLocation', function(req, res) {
	urlData = url.parse(req.url,true);
	action = urlData.pathname;
	transfer_param = urlData.query;
	area_location_index = transfer_param.AreaLocation
	
	var area_name='未知'; var image_path='';
	if(area_location_index == 1) { area_name='大義倉庫';  image_path='img/Loc1.jfif'; }
	else if(area_location_index == 2) {area_name='誠品';  image_path='img/Loc2.jfif'; }
	else if(area_location_index == 3) {area_name='兔將創意';  image_path='img/Loc3.jfif'; }

	


	var commandString = 'SELECT SUM(energy)/1000 AS TotalEnergy FROM table_solar_hist3_month WHERE r_year=2021 AND area_location=' + area_location_index + ' GROUP BY r_year';

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){

		var totalenergy = 0;
		var today_total_energy = 0;
		var today_unit_energy = 0;
		var today_hour_energy = 0;
		var today_online_count = 0;
		var today_offline_count = 0;
		var today_online_prec = 0;

		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err){conn.end(); res.send('Get Data Error'); }
			  	else{
				  	if(rows.length > 0){
						totalenergy = rows[0]['TotalEnergy'];
				  	}
					else{
						totalenergy = 0;
					}

					commandString = 'CALL pro_get_today_information(' + area_location_index + ');';
					conn.query(commandString, function(err, rows){
						if(err) {conn.end(); res.send('Get Data Error 2'); }
						else{

							if(rows.length > 1){
								today_total_energy = rows[0][0]['Total_Energy'];
								today_unit_energy = rows[0][0]['Unit_Energy'];
								today_hour_energy = rows[0][0]['Hour_Energy'];
							}
							else
							{
								today_total_energy = 0;
								today_unit_energy = 0;
								today_hour_energy = 0;
							}

							commandString = 'CALL pro_get_today_inverter_onlineinformation(' + area_location_index + ');';
							conn.query(commandString, function(err, rows){
								if(err) {conn.end(); res.send('Get Data Error 3 - Solar Location'); }
								else{
									if(rows.length > 1){
										today_online_count = rows[0][0]['OnlineCount'];
										today_offline_count = rows[0][0]['OfflineCount'];
										today_online_prec = rows[0][0]['OnlinePrec'];

										var online_data = [];
										var online_title = ['Effort', 'Amount given'];
										online_data.push(online_title);
										var online_value = [];
										online_value.push('上線');
										online_value.push(today_online_count);
										online_data.push(online_value);
										var offline_value = [];
										offline_value.push('離線');
										offline_value.push(today_offline_count);
										online_data.push(offline_value);
										var onlineDataString = JSON.stringify(online_data);

										
									}
									else{
										
									}

									commandString = 'CALL pro_get_today_hourenergy(' + area_location_index + ');';
									conn.query(commandString, function(err, rows){
										if(err) {conn.end(); res.send('Get Data Error 4'); }
										else{
											if(rows.length > 1){
												var hourdata = [0, 0, 0, 0, 0, 
													0, 0, 0, 0, 0,
													0, 0, 0, 0, 0,
													0, 0, 0, 0, 0,
													0, 0, 0, 0];
												var hourdatas = [];
												hourdatas.push(['Hour', 'Energy']);
												
												rows[0].forEach( (row) => {
													var _hour_index = row['r_hour'];
													hourdata[_hour_index] = row['Total_Hour_Energy'];
												});

												for(i=0;i<24;i++){
													var _hourdata = [];
													_hourdata.push(i.toString());
													_hourdata.push(hourdata[i]);

													hourdatas.push(_hourdata);
												}

												var hourDataString = JSON.stringify(hourdatas);

												
											}
											else{
												
											}

											//commandString = 'CALL pro_get_today_area_information(' + area_location_index + ');';
											commandString = 'CALL pro_get_current_area_inverter(' + area_location_index + ');';
											conn.query(commandString, function(err, rows){
												if(err) {conn.end(); res.send('Get Data Error 5'); }
												else{
													if(rows.length > 0){
														var areainformationdata = rows[0];

														//console.log(areainformationdata);

														commandString = 'SELECT py, temperature FROM table_solar_env WHERE area_location=' + area_location_index + ' AND timestamp > SUBDATE(NOW(), INTERVAL 1 HOUR);';
														conn.query(commandString, function(err, rows){
															if(err){conn.end(); res.send('Get Data Error 6');}
															else{
																var _get_py = 0;
																var _get_temperature = 0;
																if(rows.length > 0){
																	_get_py = rows[0]['py'];
																	_get_temperature = rows[0]['temperature'];

																	conn.end();
																	res.render('solarlocation', {
																		title: 'Oring Solar System Demo - Location',
																		setAreaLocation: area_location_index,
																		setAreaName: area_name,
																		setTotalEnergy: totalenergy,
																		setTodayTotalEnergy: today_total_energy,
																		setTodayUnitEnergy: today_unit_energy,
																		setTodayHourEnergy: today_hour_energy,
																		setTodayOnlineCount: today_online_count,
																		setTodayOfflineCount: today_offline_count,
																		setTodayOnlinePrec: today_online_prec,
																		setOnlineChart: onlineDataString,
																		setHourChart: hourDataString,
																		setAreaInformation: areainformationdata,
																		setImagePath: image_path,
																		setPy : _get_py,
																		setTemperature: _get_temperature,
																	});

																}
																else{
																	conn.end();
																	res.render('solarlocation', {
																		title: 'Oring Solar System Demo - Location',
																		setAreaLocation: area_location_index,
																		setAreaName: area_name,
																		setTotalEnergy: totalenergy,
																		setTodayTotalEnergy: today_total_energy,
																		setTodayUnitEnergy: today_unit_energy,
																		setTodayHourEnergy: today_hour_energy,
																		setTodayOnlineCount: today_online_count,
																		setTodayOfflineCount: today_offline_count,
																		setTodayOnlinePrec: today_online_prec,
																		setOnlineChart: onlineDataString,
																		setHourChart: hourDataString,
																		setAreaInformation: areainformationdata,
																		setImagePath: image_path,
																		setPy : _get_py,
																		setTemperature: _get_temperature,
																	});
																}
															}
														});

														
													}
													else{

													}
												}
											});

											
										}
									});

 								}
							});

							
						}
					});
					
				}
			});	
		}
	});

	
});

function selectAll(){
	console.log("Select All");
};

router.get('/SolarInverterList', function(req, res){
	urlData = url.parse(req.url,true);
	action = urlData.pathname;
	transfer_param = urlData.query;
	area_location_index = Number(transfer_param.AreaLocation);
	inverter_id_index = Number(transfer_param.InverterID);

	var commandString = 'SELECT * FROM view_inverter_list_data;';

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){

		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err){conn.end(); res.send('Get Data Error 2'); }
				else{
					

					var cal_index_sublocation=-1;
					var cal_index_arealocation=-1;
					var inverter_list_data = [];
					var inverter_list_sublocation={};
					var inverter_list_arealocation={};
					var inverter_list_inverter={};
					
					rows.forEach(row => {
						if(row['sub_location'] != cal_index_sublocation){
							if(cal_index_sublocation != -1){
								inverter_list_data.push(inverter_list_sublocation);
							}
							inverter_list_sublocation={};
							inverter_list_sublocation['Index']=row['sub_location'];
							inverter_list_sublocation['Name']=row['sublocation_name'];
							inverter_list_sublocation['AreaList']=[];
							cal_index_sublocation=row['sub_location'];
							cal_index_arealocation = -1;
						}
						else{

						}

						if(row['area_location'] != cal_index_arealocation){
							if(cal_index_arealocation != -1){
								inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
							}

							inverter_list_arealocation = {};
							inverter_list_arealocation['Index']=row['area_location'];
							inverter_list_arealocation['Name']=row['arealocation_name'];
							inverter_list_arealocation['InverterList']=[];
							cal_index_arealocation = row['area_location'];
						} else {
							
						}
						inverter_list_inverter={};
						inverter_list_inverter['inverter_id']=row['inverter_id'];
						inverter_list_inverter['online_status']=row['online_status'];
						inverter_list_inverter['inverter_state']=row['inverter_state'];
						inverter_list_inverter['inverter_state_name']=row['inverter_state_name'];
						inverter_list_inverter['today_energy']=row['today_energy_2'];
						inverter_list_inverter['today_runtime']=row['today_runtime_2'];
						inverter_list_inverter['life_energy']=row['life_energy_2'];
						inverter_list_inverter['life_runtime']=row['life_runtime_2'];
						inverter_list_inverter['temperature_ambient']=row['temperature_ambient'];
						inverter_list_inverter['temperature_boost']=row['temperature_boost'];
						inverter_list_inverter['temperature_inverter']=row['temperature_inverter'];
						inverter_list_inverter['temperature_boost2']=row['temperature_boost2'];
						inverter_list_inverter['input_dc_total_power']=row['input_dc_total_power'];
						inverter_list_inverter['output_ac_total_power']=row['output_ac_total_power'];
						inverter_list_inverter['transferefficiency']=row['transferefficiency'] * 100.0;
						inverter_list_inverter['output_ac_voltage1']=row['output_ac_voltage1'] / 10.0;
						inverter_list_inverter['output_ac_current1']=row['output_ac_current1'] / 100.0;
						inverter_list_inverter['output_ac_wattage1']=row['output_ac_wattage1'];
						inverter_list_inverter['output_ac_frequency1']=row['output_ac_frequency1'] / 100.0;
						inverter_list_inverter['output_ac_voltage2']=row['output_ac_voltage2'] / 10.0;
						inverter_list_inverter['output_ac_current2']=row['output_ac_current2'] / 100.0;
						inverter_list_inverter['output_ac_wattage2']=row['output_ac_wattage2'];
						inverter_list_inverter['output_ac_frequency2']=row['output_ac_frequency2'] / 100.0;
						inverter_list_inverter['output_ac_voltage3']=row['output_ac_voltage3'] / 10.0;
						inverter_list_inverter['output_ac_current3']=row['output_ac_current3'] / 1000.0;
						inverter_list_inverter['output_ac_wattage3']=row['output_ac_wattage3'];
						inverter_list_inverter['output_ac_frequency3']=row['output_ac_frequency3'] / 100.0;
						inverter_list_inverter['fw_version']=row['fw_version'];
						inverter_list_inverter['fw_version2']=row['fw_version2'];
						inverter_list_inverter['fw_version3']=row['fw_version3'];
						inverter_list_inverter['fw_version4']=row['fw_version4'];
						inverter_list_inverter['fw_version5']=row['fw_version5'];
						inverter_list_arealocation['InverterList'].push(inverter_list_inverter);
						
					});

					inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
					inverter_list_data.push(inverter_list_sublocation);

					//console.log(inverter_list_data);

					//console.log(inverter_list_data[0]['AreaList'])

					commandString = 'CALL pro_get_today_hourenergy_inverter(' + area_location_index + ', ' + inverter_id_index + ');';
					conn.query(commandString, function(err, rows){
						if(err) {conn.end(); res.send('Get Data Error 4');}
						else{
							if(rows.length > 1){
								var hourdata = [0, 0, 0, 0, 0, 
									0, 0, 0, 0, 0,
									0, 0, 0, 0, 0,
									0, 0, 0, 0, 0,
									0, 0, 0, 0];
								var hourdatas = [];
								hourdatas.push(['Hour', 'Energy']);
								
								rows[0].forEach( (row) => {
									var _hour_index = row['r_hour'];
									hourdata[_hour_index] = row['Total_Hour_Energy'];
								});

								for(i=0;i<24;i++){
									var _hourdata = [];
									_hourdata.push(i);
									_hourdata.push(hourdata[i]);

									hourdatas.push(_hourdata);
								}

								var hourDataString = JSON.stringify(hourdatas);

								commandString = 'CALL pro_get_event(' + area_location_index + ', ' + inverter_id_index + ', 20);';
								conn.query(commandString, function(err, rows){
									if(err) {conn.end(); res.send('Get Data Error 4');}
									else{
										var eventlist = rows[0];
										//console.log(eventlist);

										conn.end();	
										res.render('solarinverterlist', {
											title: 'Oring Solar System Demo - Inverter List',
											setsublocationindex:1,
											setarealocationindex:area_location_index,
											setinverteridindex:inverter_id_index,
											setinverterlistdata:inverter_list_data,
											setHourChart: hourDataString,
											setEventList: eventlist,
											doSelectAll: 'SelectAll();'
										});
									}
								});

								
								
							}
							else{
								
							}
						}
					});

					
				}
			});

			
		}
	});
});

router.get('/SolarHistory', function(req, res){
	urlData = url.parse(req.url,true);
	action = urlData.pathname;
	transfer_param = urlData.query;
	area_location_index = Number(transfer_param.AreaLocation);
	inverter_id_index = Number(transfer_param.InverterID);

	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();

	var subtitle = 'Calculated on';
	var energyData = [];

	var commandString = 'SELECT * FROM view_inverter_list_data;';
	var search_id=area_location_index*100 + inverter_id_index;

	if (Number.isNaN(search_id)) search_id = 1; 

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){

		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err) { conn.end(); res.send('Get Data Error 2');}
				else{
					var cal_index_sublocation=-1;
					var cal_index_arealocation=-1;
					var inverter_list_data = [];
					var inverter_list_sublocation={};
					var inverter_list_arealocation={};
					var inverter_list_inverter={};
					
					rows.forEach(row => {
						if(row['sub_location'] != cal_index_sublocation){
							if(cal_index_sublocation != -1){
								inverter_list_data.push(inverter_list_sublocation);
							}
							inverter_list_sublocation={};
							inverter_list_sublocation['Index']=row['sub_location'];
							inverter_list_sublocation['Name']=row['sublocation_name'];
							inverter_list_sublocation['AreaList']=[];
							cal_index_sublocation=row['sub_location'];
							cal_index_arealocation = -1;
						}
						else{

						}

						if(row['area_location'] != cal_index_arealocation){
							if(cal_index_arealocation != -1){
								inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
							}

							inverter_list_arealocation = {};
							inverter_list_arealocation['Index']=row['area_location'];
							inverter_list_arealocation['Name']=row['arealocation_name'];
							inverter_list_arealocation['InverterList']=[];
							cal_index_arealocation = row['area_location'];
						} else {
							
						}
						inverter_list_inverter={};
						inverter_list_inverter['inverter_id']=row['inverter_id'];
						inverter_list_inverter['online_status']=row['online_status'];
						inverter_list_inverter['inverter_state']=row['inverter_state'];
						inverter_list_inverter['inverter_state_name']=row['inverter_state_name'];
						inverter_list_inverter['today_energy']=row['today_energy_2'];
						inverter_list_inverter['today_runtime']=row['today_runtime_2'];
						inverter_list_inverter['life_energy']=row['life_energy_2'];
						inverter_list_inverter['life_runtime']=row['life_runtime_2'];
						inverter_list_inverter['temperature_ambient']=row['temperature_ambient'];
						inverter_list_inverter['temperature_boost']=row['temperature_boost'];
						inverter_list_inverter['temperature_inverter']=row['temperature_inverter'];
						inverter_list_arealocation['InverterList'].push(inverter_list_inverter);
						
					});

					inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
					inverter_list_data.push(inverter_list_sublocation);

					var pickDateTimeArray = currentDate.split("-");
					subtitle += (' - ' + currentDate + ' by hour');
					var _year = pickDateTimeArray[0];
					var _month = pickDateTimeArray[1];
					var _day = pickDateTimeArray[2];

					commandString = 'SELECT list_table.search_id, list_table.search_name, energy_table.r_hour, energy_table.energy_hour FROM ';
					commandString += '(SELECT * FROM';
					commandString += '(SELECT (100*area_location+inverter_id) AS search_id, r_hour,  (energy_end-energy_start) AS energy_hour FROM table_solar_hist2_hour WHERE r_year=';
						commandString += _year.toString() + ' AND r_month=' + _month.toString() + ' AND r_day=' + _day.toString() + ' ) AS raw_table ';
					commandString += 'WHERE search_id=' + search_id.toString() + ') AS energy_table ';
					commandString += 'INNER JOIN (SELECT * FROM view_searchid_list) AS list_table ';
					commandString += 'ON energy_table.search_id=list_table.search_id ';
					commandString += 'ORDER BY search_id, r_hour ';
					commandString += ';';
					//console.log(commandString);
					conn.query(commandString, function(err, rows){
						if(err) { conn.end(); console.log(err); res.send('Get Data Error 3 - Solar History Get');}
						else{

							var energy_data = rows;
							//console.log(energy_data);

							var data = [0, 0, 0, 0, 0, 
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0, 0, 0, 0];
							var titleData= ['Hour', 'Energy'];
							energyData.push(titleData);

							energy_data.forEach( (row) => {
								var index = row['r_hour'];
								data[index] = row['energy_hour'];
							});
						
							for(i =0;i<data.length;i++){
								var hourData = [i.toString(), data[i]];
								energyData.push(hourData);
							}
						
							var energyDataString = JSON.stringify(energyData);

							console.log(energyDataString);

							conn.end();
							res.render('solarhistory', {
								title: 'Oring Solar System Demo - History',
								setsublocationindex:1,
								setarealocationindex:area_location_index,
								setinverteridindex:inverter_id_index,
								setinverterlistdata:inverter_list_data,
								setSelectDate: currentDate,
								setSelectType: 'Day',
								setcalcTotal: 0,
								setSingleData: 1,
								setchartdata: energyDataString,
								setcharttitle: 'Selected Inverters Energy Chart',
								setchartsubtitle: subtitle,
								setInverterList: 0,
								setPosFunction: 0,
								setCheckInverter: 0
							});
						}
					});

					

				}
			});
		}
	});

	
});



router.post('/SolarHistory', function(req, res){
	var selectType = req.body.myComboboxArea;
	var pickDateTime = req.body.pickDateTime;
	var calcAllEnergy = req.body.testCheckbox;
	var checkInverter = req.body.checkInverter;
	var calcAllEnergy_flag = 0;
	if(calcAllEnergy != null){
		if(calcAllEnergy == 'on') calcAllEnergy_flag=1;
	}

	//console.log(calcAllEnergy_flag);

	var subtitle = 'Calculated on';
	var pickDateTimeArray = pickDateTime.split("-");
	//subtitle += (' - ' + currentDate + ' by hour');
	var newPickDateTime = pickDateTimeArray[0] + "-" + pickDateTimeArray[1];
	var newPickDateTime2 = pickDateTimeArray[0];
	var _year = pickDateTimeArray[0];
	var _month = pickDateTimeArray[1];
	var _day = pickDateTimeArray[2];


	var inv_number = 0;
	var hasonedata = 1;

	if(checkInverter != null)
	{
		if(Object.prototype.toString.call(checkInverter)!='[object Array]') inv_number = 1;
		else inv_number = checkInverter.length;
	}

	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();

	//console.log(selectType);
	//console.log(pickDateTime);
	//console.log(calcAllEnergy);
	//console.log(checkInverter);
	//console.log(inv_number);
	

	var energyData = [];

	var commandString = 'SELECT * FROM view_inverter_list_data;';
	var search_id=101;

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){

		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				var cal_index_sublocation=-1;
				var cal_index_arealocation=-1;
				var inverter_list_data = [];
				var inverter_list_sublocation={};
				var inverter_list_arealocation={};
				var inverter_list_inverter={};
					
				rows.forEach(row => {
						if(row['sub_location'] != cal_index_sublocation){
							if(cal_index_sublocation != -1){
								inverter_list_data.push(inverter_list_sublocation);
							}
							inverter_list_sublocation={};
							inverter_list_sublocation['Index']=row['sub_location'];
							inverter_list_sublocation['Name']=row['sublocation_name'];
							inverter_list_sublocation['AreaList']=[];
							cal_index_sublocation=row['sub_location'];
							cal_index_arealocation = -1;
						}
						else{

						}

						if(row['area_location'] != cal_index_arealocation){
							if(cal_index_arealocation != -1){
								inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
							}

							inverter_list_arealocation = {};
							inverter_list_arealocation['Index']=row['area_location'];
							inverter_list_arealocation['Name']=row['arealocation_name'];
							inverter_list_arealocation['InverterList']=[];
							cal_index_arealocation = row['area_location'];
						} else {
							
						}
						inverter_list_inverter={};
						inverter_list_inverter['inverter_id']=row['inverter_id'];
						inverter_list_inverter['online_status']=row['online_status'];
						inverter_list_inverter['inverter_state']=row['inverter_state'];
						inverter_list_inverter['inverter_state_name']=row['inverter_state_name'];
						inverter_list_inverter['today_energy']=row['today_energy_2'];
						inverter_list_inverter['today_runtime']=row['today_runtime_2'];
						inverter_list_inverter['life_energy']=row['life_energy_2'];
						inverter_list_inverter['life_runtime']=row['life_runtime_2'];
						inverter_list_inverter['temperature_ambient']=row['temperature_ambient'];
						inverter_list_inverter['temperature_boost']=row['temperature_boost'];
						inverter_list_inverter['temperature_inverter']=row['temperature_inverter'];
						inverter_list_arealocation['InverterList'].push(inverter_list_inverter);
						
				});

				inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
				inverter_list_data.push(inverter_list_sublocation);

				if(inv_number == 0) {
						commandString = 'SELECT list_table.search_id, list_table.search_name, energy_table.r_hour, energy_table.energy_hour FROM ';
						commandString += '(SELECT * FROM';
						commandString += '(SELECT (100*area_location+inverter_id) AS search_id, r_hour,  (energy_end-energy_start) AS energy_hour FROM table_solar_hist2_hour WHERE r_year=';
							commandString += _year.toString() + ' AND r_month=' + _month.toString() + ' AND r_day=' + _day.toString() + ' ) AS raw_table ';
						commandString += 'WHERE search_id=' + search_id.toString() + ') AS energy_table ';
						commandString += 'INNER JOIN (SELECT * FROM view_searchid_list) AS list_table ';
						commandString += 'ON energy_table.search_id=list_table.search_id ';
						commandString += 'ORDER BY search_id, r_hour ';
						commandString += ';';
						conn.query(commandString, function(err, rows){
							if(err) { conn.end(); console.log(err); res.send('Get Data Error 3 - Solar History Post');}
							else{

								var energy_data = rows;
								//console.log(energy_data);

								var data = [0, 0, 0, 0, 0, 
									0, 0, 0, 0, 0,
									0, 0, 0, 0, 0,
									0, 0, 0, 0, 0,
									0, 0, 0, 0];
								var titleData= ['Hour', 'Energy'];
								energyData.push(titleData);

								energy_data.forEach( (row) => {
									var index = row['r_hour'];
									data[index] = row['energy_hour'];
								});
						
								for(i =0;i<data.length;i++){
									var hourData = [i.toString(), data[i]];
									energyData.push(hourData);
								}
						
								var energyDataString = JSON.stringify(energyData);

								//console.log(energyDataString);
								conn.end();
								res.render('solarhistory', {
									title: 'Oring Solar System Demo - History',
									setsublocationindex:1,
									setarealocationindex:1,
									setinverteridindex:1,
									setinverterlistdata:inverter_list_data,
									setSelectDate: currentDate,
									setSelectType: 'Day',
									setcalcTotal: 0,
									setSingleData: 1,
									setchartdata: energyDataString,
									setcharttitle: 'Selected Inverters Energy Chart',
									setchartsubtitle: subtitle,
									setInverterList: 0,
									setPosFunction: 0,
									setCheckInverter: 0
								});
							}
						});

						
				} else {
					if(inv_number > 1) hasonedata = 0;

					if(calcAllEnergy_flag >= 0){
						if(selectType == 'Day'){
							subtitle += (' - ' + pickDateTime + ' by hour for selected inverters');
							commandString = 'SELECT list_table.search_id, list_table.search_name, energy_table.r_hour, energy_table.energy_hour FROM ';
							commandString += '(SELECT * FROM';
							commandString += '(SELECT (100*area_location+inverter_id) AS search_id, r_hour,  (energy_end-energy_start) AS energy_hour FROM table_solar_hist2_hour WHERE r_year=';
								commandString += _year.toString() + ' AND r_month=' + _month.toString() + ' AND r_day=' + _day.toString() + ' ) AS raw_table ';
							commandString += 'WHERE search_id=';
								if(inv_number == 1)
							    	commandString += checkInverter.toString();
								else{
									commandString += checkInverter[0].toString();
									for(var i=1;i<inv_number;i++){
										commandString += " OR search_id=";
										commandString += checkInverter[i].toString();
									}
								}
							commandString += ') AS energy_table ';
							commandString += 'INNER JOIN (SELECT * FROM view_searchid_list) AS list_table ';
							commandString += 'ON energy_table.search_id=list_table.search_id ';
							commandString += 'ORDER BY search_id, r_hour ';
							commandString += ';';

							var data = [0, 0, 0, 0, 0, 
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0, 0, 0, 0];
							var datas = [];
							var getInverter = [];
					
							var titleData= ['Hour'];

							var inverter_no = -1;
							var inverter_getid = -1;
	  						conn.query(commandString, function(err, rows){
					  			if(err) {conn.end(); res.send('Get Data Error'); }
								else{
									if(rows.length == 0){ conn.end(); res.redirect('solarhistory'); }
									else{
										rows.forEach( (row) => {
											var _inverter_id = row['search_id'];
											var inverter_title = row['search_name']
											if(inverter_getid != _inverter_id){
												inverter_getid = _inverter_id;
												getInverter.push(_inverter_id);
												titleData.push(inverter_title);
											}
										});

										energyData.push(titleData);

										var cal_inv_number = 0;

										rows.forEach( (row) => {
											var _inverter_id = row['search_id'];
											if(_inverter_id != inverter_no){
												cal_inv_number++;
												if(inverter_no != -1) datas.push(data);
												inverter_no = _inverter_id;
												data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
											}

											var index = row['r_hour'];
											data[index] = row['energy_hour'];
										});
										datas.push(data);
										conn.end();

										//console.log(datas);

										for(i =0;i<24;i++){
											var hourData = [i.toString()];
											for(var j=0; j<cal_inv_number;j++){
												hourData.push(datas[j][i]);
											}
											energyData.push(hourData);
										}
					
										var energyDataString = JSON.stringify(energyData);

										//console.log(energyDataString);
										res.render('solarhistory', {
											title: 'Oring Solar System Demo - History',
											setsublocationindex:1,
											setarealocationindex:1,
											setinverteridindex:1,
											setinverterlistdata:inverter_list_data,
											setSelectDate: pickDateTime,
											setSelectType: selectType,
											setcalcTotal: calcAllEnergy_flag,
											setSingleData: hasonedata,
											setchartdata: energyDataString,
											setcharttitle: 'Selected Inverters Energy Chart',
											setchartsubtitle: subtitle,
											setInverterList: 0,
											setPosFunction: 1,
											setCheckInverter: checkInverter
										});
									}
								}
							});
								
						}
						if(selectType == 'Month'){
							subtitle += (' - ' + newPickDateTime + ' by day for selected inverters');
							commandString = 'SELECT list_table.search_id, list_table.search_name, energy_table.r_day, energy_table.energy_day FROM ';
							commandString += '(SELECT * FROM';
							commandString += '(SELECT (100*area_location+inverter_id) AS search_id, r_day,  energy AS energy_day FROM table_solar_hist3_day WHERE r_year=';
								commandString += _year.toString() + ' AND r_month=' + _month.toString() + ' ) AS raw_table ';
							commandString += 'WHERE search_id=';
								if(inv_number == 1)
							    	commandString += checkInverter.toString();
								else{
									commandString += checkInverter[0].toString();
									for(var i=1;i<inv_number;i++){
										commandString += " OR search_id=";
										commandString += checkInverter[i].toString();
									}
								}
							commandString += ') AS energy_table ';
							commandString += 'INNER JOIN (SELECT * FROM view_searchid_list) AS list_table ';
							commandString += 'ON energy_table.search_id=list_table.search_id ';
							commandString += 'ORDER BY search_id, r_day';
							commandString += ';';

							//console.log(commandString);

							var data = [0, 0, 0, 0, 0, 
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0, 0, 0, 0, 0,
								0];
							var datas = [];
							var getInverter = [];
				
							var titleData= ['Day'];
							
							var inverter_no = -1;
							var inverter_getid = -1;
		  					conn.query(commandString, function(err, rows){
			  					if(err){ conn.end(); res.send('Get Data Error'); }
								else{
									if(rows.length == 0){ conn.end(); res.redirect('solarhistory'); }
									else{
										rows.forEach( (row) => {
											var _inverter_id = row['search_id'];
											var inverter_title = row['search_name']
											if(inverter_getid != _inverter_id){
												inverter_getid = _inverter_id;
												getInverter.push(_inverter_id);
												titleData.push(inverter_title);
											}
										});

										energyData.push(titleData);

										var cal_inv_number = 0;
										rows.forEach( (row) => {
											var _inverter_id = row['search_id'];
											if(_inverter_id != inverter_no){
												cal_inv_number++;
												if(inverter_no != -1) datas.push(data);
												inverter_no = _inverter_id;
												data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
											}

											var index = row['r_day'] - 1;
											data[index] = row['energy_day'];
										});
										datas.push(data);
										conn.end();
										for(i =0;i<31;i++){
											var dayData = [(i+1).toString()];
											for(var j=0; j<cal_inv_number;j++){
												dayData.push(datas[j][i]);
											}
											energyData.push(dayData);
										}
					
										var energyDataString = JSON.stringify(energyData);
										//console.log(energyDataString);

										res.render('solarhistory', {
											title: 'Oring Solar System Demo - History',
											setsublocationindex:1,
											setarealocationindex:1,
											setinverteridindex:1,
											setinverterlistdata:inverter_list_data,
											setSelectDate: pickDateTime,
											setSelectType: selectType,
											setcalcTotal: calcAllEnergy_flag,
											setSingleData: hasonedata,
											setchartdata: energyDataString,
											setcharttitle: 'Selected Inverters Energy Chart',
											setchartsubtitle: subtitle,
											setInverterList: 0,
											setPosFunction: 1,
											setCheckInverter: checkInverter
										});
									}
								}
								
							});
							
						}
						if(selectType == 'Year'){
							subtitle += (' - ' + newPickDateTime2 + ' by month for selected inverters');
							commandString = 'SELECT list_table.search_id, list_table.search_name, energy_table.r_month, energy_table.energy_month FROM ';
							commandString += '(SELECT * FROM';
							commandString += '(SELECT (100*area_location+inverter_id) AS search_id, r_month,  energy AS energy_month FROM table_solar_hist3_month WHERE r_year=';
								commandString += _year.toString() + ' ) AS raw_table ';
							commandString += 'WHERE search_id=';
								if(inv_number == 1)
							    	commandString += checkInverter.toString();
								else{
									commandString += checkInverter[0].toString();
									for(var i=1;i<inv_number;i++){
										commandString += " OR search_id=";
										commandString += checkInverter[i].toString();
									}
								}
							commandString += ') AS energy_table ';
							commandString += 'INNER JOIN (SELECT * FROM view_searchid_list) AS list_table ';
							commandString += 'ON energy_table.search_id=list_table.search_id ';
							commandString += 'ORDER BY search_id, r_month';
							commandString += ';';

							var data = [0, 0, 0, 0, 0, 
								0, 0, 0, 0, 0,
								0, 0];
							var datas = [];
							var getInverter = [];
				
							var titleData= ['Month'];

							var inverter_no = -1;
							var inverter_getid = -1;
		  					conn.query(commandString, function(err, rows){
			  					if(err){ conn.end(); res.send('Get Data Error');}
								else{
									if(rows.length == 0){ conn.end(); res.redirect('solarhistory'); }
									else{
										rows.forEach( (row) => {
											var _inverter_id = row['search_id'];
											var inverter_title = row['search_name'];
											if(inverter_getid != _inverter_id){
												inverter_getid = _inverter_id;
												getInverter.push(_inverter_id);
												titleData.push(inverter_title);
											}
										});

										energyData.push(titleData);

										var cal_inv_number = 0;
										rows.forEach( (row) => {
											var _inverter_id = row['search_id'];
											if(_inverter_id != inverter_no){
												cal_inv_number++;
												if(inverter_no != -1) datas.push(data);
												inverter_no = _inverter_id;
												data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
											}

											var index = row['r_month'] - 1;
											data[index] = row['energy_month'];
											}
								
					
										);
										datas.push(data);
										console.log(datas.length);
										console.log(datas);
										conn.end();
										for(i =0;i<12;i++){
											var monthData = [(i+1).toString()];
											for(var j=0; j<cal_inv_number;j++){
												monthData.push(datas[j][i]);
											}
											energyData.push(monthData);
										}
					
										var energyDataString = JSON.stringify(energyData);
			
										res.render('solarhistory', {
											title: 'Oring Solar System Demo - History',
											setsublocationindex:1,
											setarealocationindex:1,
											setinverteridindex:1,
											setinverterlistdata:inverter_list_data,
											setSelectDate: pickDateTime,
											setSelectType: selectType,
											setcalcTotal: calcAllEnergy_flag,
											setSingleData: hasonedata,
											setchartdata: energyDataString,
											setcharttitle: 'Selected Inverters Energy Chart',
											setchartsubtitle: subtitle,
											setInverterList: 0,
											setPosFunction: 1,
											setCheckInverter: checkInverter
										});
									}
								}
							});
						}
					} else {

					}
				}
			});
		}
	});

	

	//res.send('Test');
});

router.get('/SolarHistoryData', function(req, res){
	console.log('[Get]Solar History Data');
	urlData = url.parse(req.url,true);
	action = urlData.pathname;
	transfer_param = urlData.query;
	area_location_index = Number(transfer_param.AreaLocation);
	inverter_id_index = Number(transfer_param.InverterID);

	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();

	var subtitle = 'Calculated on';
	var energyData = [];

	var commandString = 'SELECT * FROM view_inverter_list_data;';
	var search_id=area_location_index*100 + inverter_id_index;

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err) { conn.end(); res.send('Get Data Error 2');}
				else{
					var cal_index_sublocation=-1;
					var cal_index_arealocation=-1;
					var inverter_list_data = [];
					var inverter_list_sublocation={};
					var inverter_list_arealocation={};
					var inverter_list_inverter={};
					
					rows.forEach(row => {
						if(row['sub_location'] != cal_index_sublocation){
							if(cal_index_sublocation != -1){
								inverter_list_data.push(inverter_list_sublocation);
							}
							inverter_list_sublocation={};
							inverter_list_sublocation['Index']=row['sub_location'];
							inverter_list_sublocation['Name']=row['sublocation_name'];
							inverter_list_sublocation['AreaList']=[];
							cal_index_sublocation=row['sub_location'];
							cal_index_arealocation = -1;
						}
						else{

						}

						if(row['area_location'] != cal_index_arealocation){
							if(cal_index_arealocation != -1){
								inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
							}

							inverter_list_arealocation = {};
							inverter_list_arealocation['Index']=row['area_location'];
							inverter_list_arealocation['Name']=row['arealocation_name'];
							inverter_list_arealocation['InverterList']=[];
							cal_index_arealocation = row['area_location'];
						} else {
							
						}
						inverter_list_inverter={};
						inverter_list_inverter['inverter_id']=row['inverter_id'];
						inverter_list_inverter['online_status']=row['online_status'];
						inverter_list_inverter['inverter_state']=row['inverter_state'];
						inverter_list_inverter['inverter_state_name']=row['inverter_state_name'];
						inverter_list_inverter['today_energy']=row['today_energy_2'];
						inverter_list_inverter['today_runtime']=row['today_runtime_2'];
						inverter_list_inverter['life_energy']=row['life_energy_2'];
						inverter_list_inverter['life_runtime']=row['life_runtime_2'];
						inverter_list_inverter['temperature_ambient']=row['temperature_ambient'];
						inverter_list_inverter['temperature_boost']=row['temperature_boost'];
						inverter_list_inverter['temperature_inverter']=row['temperature_inverter'];
						inverter_list_arealocation['InverterList'].push(inverter_list_inverter);
						
					});

					inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
					inverter_list_data.push(inverter_list_sublocation);

					var energyDataString = '';

					console.log('[Get] Finished');
					conn.end();
					res.render('solarhistorydata', {
						title: 'Oring Solar System Demo - History Data',
						setsublocationindex:1,
						setarealocationindex:1,
						setinverteridindex:1,
						setSelectDate: currentDate,
						setinverterlistdata:inverter_list_data,
						setSelectType: 'Day',
						setcalcTotal: 0,
						setSingleData: 1,
						setchartdata: energyDataString,
						setcharttitle: 'Selected Inverters Energy Chart',
						setchartsubtitle: subtitle,
						setInverterList: 0,
						setPosFunction: 0,
						setCheckInverter: 0,
						setDataIndexString: '小時',
						setTableData:[]
					});
				}
			});
		}
	});
	
});

router.post('/SolarHistoryData', function(req, res){
	console.log('[POST]Solar History Data');
	var selectType = req.body.myComboboxArea;
	var pickDateTime = req.body.pickDateTime;
	var checkInverter = req.body.checkInverter;

	//console.log(calcAllEnergy_flag);

	var subtitle = 'Calculated on';
	var pickDateTimeArray = pickDateTime.split("-");
	//subtitle += (' - ' + currentDate + ' by hour');
	var newPickDateTime = pickDateTimeArray[0] + "-" + pickDateTimeArray[1];
	var newPickDateTime2 = pickDateTimeArray[0];
	var _year = pickDateTimeArray[0];
	var _month = pickDateTimeArray[1];
	var _day = pickDateTimeArray[2];

	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();

	var subtitle = 'Calculated on';
	var energyData = [];

	var commandString = 'SELECT * FROM view_inverter_list_data;';
	var search_id=101;

	var inv_number = 0;
	var hasonedata = 1;

	if(checkInverter != null)
	{
		if(Object.prototype.toString.call(checkInverter)!='[object Array]') inv_number = 1;
		else inv_number = checkInverter.length;
	}

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err) { conn.end(); res.send('Get Data Error 2');}
				else{
					var cal_index_sublocation=-1;
					var cal_index_arealocation=-1;
					var inverter_list_data = [];
					var inverter_list_sublocation={};
					var inverter_list_arealocation={};
					var inverter_list_inverter={};
					
					rows.forEach(row => {
						if(row['sub_location'] != cal_index_sublocation){
							if(cal_index_sublocation != -1){
								inverter_list_data.push(inverter_list_sublocation);
							}
							inverter_list_sublocation={};
							inverter_list_sublocation['Index']=row['sub_location'];
							inverter_list_sublocation['Name']=row['sublocation_name'];
							inverter_list_sublocation['AreaList']=[];
							cal_index_sublocation=row['sub_location'];
							cal_index_arealocation = -1;
						}
						else{

						}

						if(row['area_location'] != cal_index_arealocation){
							if(cal_index_arealocation != -1){
								inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
							}

							inverter_list_arealocation = {};
							inverter_list_arealocation['Index']=row['area_location'];
							inverter_list_arealocation['Name']=row['arealocation_name'];
							inverter_list_arealocation['InverterList']=[];
							cal_index_arealocation = row['area_location'];
						} else {
							
						}
						inverter_list_inverter={};
						inverter_list_inverter['inverter_id']=row['inverter_id'];
						inverter_list_inverter['online_status']=row['online_status'];
						inverter_list_inverter['inverter_state']=row['inverter_state'];
						inverter_list_inverter['inverter_state_name']=row['inverter_state_name'];
						inverter_list_inverter['today_energy']=row['today_energy_2'];
						inverter_list_inverter['today_runtime']=row['today_runtime_2'];
						inverter_list_inverter['life_energy']=row['life_energy_2'];
						inverter_list_inverter['life_runtime']=row['life_runtime_2'];
						inverter_list_inverter['temperature_ambient']=row['temperature_ambient'];
						inverter_list_inverter['temperature_boost']=row['temperature_boost'];
						inverter_list_inverter['temperature_inverter']=row['temperature_inverter'];
						inverter_list_arealocation['InverterList'].push(inverter_list_inverter);
						
					});

					inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
					inverter_list_data.push(inverter_list_sublocation);

					var energyDataString = '';

					
					if(inv_number > 1) hasonedata = 0;
					if(inv_number == 0) {

						conn.end();
						res.render('solarhistorydata', {
							title: 'Oring Solar System Demo - History Data',
							setsublocationindex:1,
							setarealocationindex:1,
							setinverteridindex:1,
							setSelectDate: currentDate,
							setinverterlistdata:inverter_list_data,
							setSelectType: 'Day',
							setcalcTotal: 0,
							setSingleData: 1,
							setchartdata: energyDataString,
							setcharttitle: 'Selected Inverters Energy Chart',
							setchartsubtitle: subtitle,
							setInverterList: 0,
							setPosFunction: 0,
							setCheckInverter: 0,
							setDataIndexString: '小時',
							setTableData:[]
						});
					} else {
						if(selectType == 'Day'){
							commandString = 'SELECT sublocation_name, arealocation_name, inverter_id, r_hour  AS data_index, energy FROM ( SELECT * FROM ( SELECT * FROM ( SELECT (area_location * 100 + inverter_id) AS search_id, sub_location, area_location, inverter_id, r_hour, (energy_end-energy_start)/100 AS energy from table_solar_hist2_hour ';
							commandString += 'WHERE r_year=' + _year.toString() + ' AND r_month=' + _month.toString() + ' AND r_day=' + _day.toString();
							commandString += ' ) AS raw_table ';
							commandString += 'WHERE search_id=';
								if(inv_number == 1)
								    commandString += checkInverter.toString();
								else{
									commandString += checkInverter[0].toString();
									for(var i=1;i<inv_number;i++){
										commandString += " OR search_id=";
										commandString += checkInverter[i].toString();
									}
								}
							commandString += ') AS raw_table_2 INNER JOIN table_arealocation_name ON table_arealocation_name.arealocation_index=raw_table_2.area_location';
							commandString += ') AS raw_table_3 INNER JOIN table_sublocation_name ON table_sublocation_name.sublocation_Index=raw_table_3.sub_location';
							commandString += ' ORDER BY search_id, r_hour;';

							conn.query(commandString, function(err, rows){
								if(err) { conn.end(); res.send('Get Data Error 3 - Solar History Data Post');}
								else{

									conn.end();
									res.render('solarhistorydata', {
									title: 'Oring Solar System Demo - History Data',
										setsublocationindex:1,
										setarealocationindex:1,
										setinverteridindex:1,
										setSelectDate: pickDateTime,
										setinverterlistdata:inverter_list_data,
										setSelectType: selectType,
										setcalcTotal: 0,
										setSingleData: hasonedata,
										setchartdata: energyDataString,
										setcharttitle: 'Selected Inverters Energy Chart',
										setchartsubtitle: subtitle,
										setInverterList: 0,
										setPosFunction: 1,
										setCheckInverter: checkInverter,
										setDataIndexString: '小時',
										setTableData: rows
									});
								}
							});
						}
						if(selectType == 'Month'){
							commandString = 'SELECT sublocation_name, arealocation_name, inverter_id, r_day  AS data_index, energy FROM ( SELECT * FROM ( SELECT * FROM ( SELECT (area_location * 100 + inverter_id) AS search_id, sub_location, area_location, inverter_id, r_day, energy/100 AS energy from table_solar_hist3_day ';
							commandString += 'WHERE r_year=' + _year.toString() + ' AND r_month=' + _month.toString();
							commandString += ' ) AS raw_table ';
							commandString += 'WHERE search_id=';
								if(inv_number == 1)
								    commandString += checkInverter.toString();
								else{
									commandString += checkInverter[0].toString();
									for(var i=1;i<inv_number;i++){
										commandString += " OR search_id=";
										commandString += checkInverter[i].toString();
									}
								}
							commandString += ') AS raw_table_2 INNER JOIN table_arealocation_name ON table_arealocation_name.arealocation_index=raw_table_2.area_location';
							commandString += ') AS raw_table_3 INNER JOIN table_sublocation_name ON table_sublocation_name.sublocation_Index=raw_table_3.sub_location';
							commandString += ' ORDER BY search_id, r_day;';

							conn.query(commandString, function(err, rows){
								if(err) { conn.end(); res.send('Get Data Error 3-2 - Solar History Data Post');}
								else{

									conn.end();
									res.render('solarhistorydata', {
									title: 'Oring Solar System Demo - History Data',
										setsublocationindex:1,
										setarealocationindex:1,
										setinverteridindex:1,
										setSelectDate: pickDateTime,
										setinverterlistdata:inverter_list_data,
										setSelectType: selectType,
										setcalcTotal: 0,
										setSingleData: hasonedata,
										setchartdata: energyDataString,
										setcharttitle: 'Selected Inverters Energy Chart',
										setchartsubtitle: subtitle,
										setInverterList: 0,
										setPosFunction: 1,
										setCheckInverter: checkInverter,
										setDataIndexString: '日',
										setTableData: rows
									});
								}
							});
						}
						if(selectType == 'Year'){
							commandString = 'SELECT sublocation_name, arealocation_name, inverter_id, r_month  AS data_index, energy FROM ( SELECT * FROM ( SELECT * FROM ( SELECT (area_location * 100 + inverter_id) AS search_id, sub_location, area_location, inverter_id, r_month, energy/100 AS energy from table_solar_hist3_month ';
							commandString += 'WHERE r_year=' + _year.toString();
							commandString += ' ) AS raw_table ';
							commandString += 'WHERE search_id=';
								if(inv_number == 1)
								    commandString += checkInverter.toString();
								else{
									commandString += checkInverter[0].toString();
									for(var i=1;i<inv_number;i++){
										commandString += " OR search_id=";
										commandString += checkInverter[i].toString();
									}
								}
							commandString += ') AS raw_table_2 INNER JOIN table_arealocation_name ON table_arealocation_name.arealocation_index=raw_table_2.area_location';
							commandString += ') AS raw_table_3 INNER JOIN table_sublocation_name ON table_sublocation_name.sublocation_Index=raw_table_3.sub_location';
							commandString += ' ORDER BY search_id, r_month;';

							conn.query(commandString, function(err, rows){
								if(err) { conn.end(); res.send('Get Data Error 3-3 - Solar History Data Post');}
								else{

									conn.end();
									res.render('solarhistorydata', {
									title: 'Oring Solar System Demo - History Data',
										setsublocationindex:1,
										setarealocationindex:1,
										setinverteridindex:1,
										setSelectDate: pickDateTime,
										setinverterlistdata:inverter_list_data,
										setSelectType: selectType,
										setcalcTotal: 0,
										setSingleData: hasonedata,
										setchartdata: energyDataString,
										setcharttitle: 'Selected Inverters Energy Chart',
										setchartsubtitle: subtitle,
										setInverterList: 0,
										setPosFunction: 1,
										setCheckInverter: checkInverter,
										setDataIndexString: '月',
										setTableData: rows
									});
								}
							});
						}
					}
				}
			});
		}
	});
	
});

router.get('/SolarHistoryData2', function(req, res){
	console.log('[Get]Solar History Data 2');
	urlData = url.parse(req.url,true);
	action = urlData.pathname;
	transfer_param = urlData.query;
	area_location_index = Number(transfer_param.AreaLocation);
	inverter_id_index = Number(transfer_param.InverterID);

	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();

	var subtitle = 'Calculated on';
	var energyData = [];

	var commandString = 'SELECT * FROM view_inverter_list_data;';
	var search_id=area_location_index*100 + inverter_id_index;

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err) { conn.end(); res.send('Get Data Error 2');}
				else{
					var cal_index_sublocation=-1;
					var cal_index_arealocation=-1;
					var inverter_list_data = [];
					var inverter_list_sublocation={};
					var inverter_list_arealocation={};
					var inverter_list_inverter={};
					
					rows.forEach(row => {
						if(row['sub_location'] != cal_index_sublocation){
							if(cal_index_sublocation != -1){
								inverter_list_data.push(inverter_list_sublocation);
							}
							inverter_list_sublocation={};
							inverter_list_sublocation['Index']=row['sub_location'];
							inverter_list_sublocation['Name']=row['sublocation_name'];
							inverter_list_sublocation['AreaList']=[];
							cal_index_sublocation=row['sub_location'];
							cal_index_arealocation = -1;
						}
						else{

						}

						if(row['area_location'] != cal_index_arealocation){
							if(cal_index_arealocation != -1){
								inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
							}

							inverter_list_arealocation = {};
							inverter_list_arealocation['Index']=row['area_location'];
							inverter_list_arealocation['Name']=row['arealocation_name'];
							inverter_list_arealocation['InverterList']=[];
							cal_index_arealocation = row['area_location'];
						} else {
							
						}
						inverter_list_inverter={};
						inverter_list_inverter['inverter_id']=row['inverter_id'];
						inverter_list_inverter['online_status']=row['online_status'];
						inverter_list_inverter['inverter_state']=row['inverter_state'];
						inverter_list_inverter['inverter_state_name']=row['inverter_state_name'];
						inverter_list_inverter['today_energy']=row['today_energy_2'];
						inverter_list_inverter['today_runtime']=row['today_runtime_2'];
						inverter_list_inverter['life_energy']=row['life_energy_2'];
						inverter_list_inverter['life_runtime']=row['life_runtime_2'];
						inverter_list_inverter['temperature_ambient']=row['temperature_ambient'];
						inverter_list_inverter['temperature_boost']=row['temperature_boost'];
						inverter_list_inverter['temperature_inverter']=row['temperature_inverter'];
						inverter_list_arealocation['InverterList'].push(inverter_list_inverter);
						
					});

					inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
					inverter_list_data.push(inverter_list_sublocation);

					var energyDataString = '';

					console.log('[Get] Finished');
					conn.end();
					res.render('solarhistorydata2', {
						title: 'Oring Solar System Demo - History Data 2',
						setsublocationindex:1,
						setarealocationindex:1,
						setinverteridindex:1,
						setSelectDate: currentDate,
						setinverterlistdata:inverter_list_data,
						setSelectType: 'Day',
						setcalcTotal: 0,
						setSingleData: 1,
						setchartdata: energyDataString,
						setcharttitle: 'Selected Inverters Energy Chart',
						setchartsubtitle: subtitle,
						setInverterList: 0,
						setPosFunction: 0,
						setCheckInverter: 0,
						setDataIndexString: '小時',
						setTableData:[]
					});
				}
			});
		}
	});
	
});

router.post('/SolarHistoryData2', function(req, res){
	console.log('[POST]Solar History Data 2');
	var pickDateTime = req.body.pickDateTime;
	var checkInverter = req.body.checkInverter;

	//console.log(calcAllEnergy_flag);

	var subtitle = 'Calculated on';
	var pickDateTimeArray = pickDateTime.split("-");
	//subtitle += (' - ' + currentDate + ' by hour');
	var newPickDateTime = pickDateTimeArray[0] + "-" + pickDateTimeArray[1];
	var newPickDateTime2 = pickDateTimeArray[0];
	var _year = pickDateTimeArray[0];
	var _month = pickDateTimeArray[1];
	var _day = pickDateTimeArray[2];

	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();

	var subtitle = 'Calculated on';
	var energyData = [];

	var commandString = 'SELECT * FROM view_inverter_list_data;';
	var search_id=101;

	var inv_number = 0;
	var hasonedata = 1;

	if(checkInverter != null)
	{
		if(Object.prototype.toString.call(checkInverter)!='[object Array]') inv_number = 1;
		else inv_number = checkInverter.length;
	}

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
		if(err){
			conn.end();
			res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err) { conn.end(); res.send('Get Data Error 2');}
				else{
					var cal_index_sublocation=-1;
					var cal_index_arealocation=-1;
					var inverter_list_data = [];
					var inverter_list_sublocation={};
					var inverter_list_arealocation={};
					var inverter_list_inverter={};
					
					rows.forEach(row => {
						if(row['sub_location'] != cal_index_sublocation){
							if(cal_index_sublocation != -1){
								inverter_list_data.push(inverter_list_sublocation);
							}
							inverter_list_sublocation={};
							inverter_list_sublocation['Index']=row['sub_location'];
							inverter_list_sublocation['Name']=row['sublocation_name'];
							inverter_list_sublocation['AreaList']=[];
							cal_index_sublocation=row['sub_location'];
							cal_index_arealocation = -1;
						}
						else{

						}

						if(row['area_location'] != cal_index_arealocation){
							if(cal_index_arealocation != -1){
								inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
							}

							inverter_list_arealocation = {};
							inverter_list_arealocation['Index']=row['area_location'];
							inverter_list_arealocation['Name']=row['arealocation_name'];
							inverter_list_arealocation['InverterList']=[];
							cal_index_arealocation = row['area_location'];
						} else {
							
						}
						inverter_list_inverter={};
						inverter_list_inverter['inverter_id']=row['inverter_id'];
						inverter_list_inverter['online_status']=row['online_status'];
						inverter_list_inverter['inverter_state']=row['inverter_state'];
						inverter_list_inverter['inverter_state_name']=row['inverter_state_name'];
						inverter_list_inverter['today_energy']=row['today_energy_2'];
						inverter_list_inverter['today_runtime']=row['today_runtime_2'];
						inverter_list_inverter['life_energy']=row['life_energy_2'];
						inverter_list_inverter['life_runtime']=row['life_runtime_2'];
						inverter_list_inverter['temperature_ambient']=row['temperature_ambient'];
						inverter_list_inverter['temperature_boost']=row['temperature_boost'];
						inverter_list_inverter['temperature_inverter']=row['temperature_inverter'];
						inverter_list_arealocation['InverterList'].push(inverter_list_inverter);
						
					});

					inverter_list_sublocation['AreaList'].push(inverter_list_arealocation);
					inverter_list_data.push(inverter_list_sublocation);

					var energyDataString = '';

					
					if(inv_number > 1) hasonedata = 0;
					if(inv_number == 0) {

						conn.end();
						res.render('solarhistorydata2', {
							title: 'Oring Solar System Demo - History Data 2',
							setsublocationindex:1,
							setarealocationindex:1,
							setinverteridindex:1,
							setSelectDate: currentDate,
							setinverterlistdata:inverter_list_data,
							setSelectType: 'Day',
							setcalcTotal: 0,
							setSingleData: 1,
							setchartdata: energyDataString,
							setcharttitle: 'Selected Inverters Energy Chart',
							setchartsubtitle: subtitle,
							setInverterList: 0,
							setPosFunction: 0,
							setCheckInverter: 0,
							setDataIndexString: '小時',
							setTableData:[]
						});
					} else {
						
							commandString = 'SELECT ';
							commandString += 'sublocation_name, arealocation_name, inverter_id,DATE_FORMAT(record_time, "%Y%m%d%H%i%s") AS record_time, ';
							commandString += 'inputdcvoltage1, inputdccurrent1, inputdcwattage1, inputdcvoltage2, inputdccurrent2, inputdcwattage2,inputdcvoltage3, inputdccurrent3, inputdcwattage3, ';
							commandString += 'inputdcvoltage4, inputdccurrent4, inputdcwattage4, inputdcvoltage5, inputdccurrent5, inputdcwattage5,inputdcvoltage6, inputdccurrent6, inputdcwattage6 ';
							commandString += 'FROM(SELECT * FROM(SELECT * FROM(';
							commandString += 'SELECT (area_location * 100 + inverter_id) AS search_id, sub_location, area_location, inverter_id, table_solar_dcinput_temp.timestamp AS record_time, ';
							commandString += 'inputdcvoltage1, inputdccurrent1, inputdcwattage1, inputdcvoltage2, inputdccurrent2, inputdcwattage2,inputdcvoltage3, inputdccurrent3, inputdcwattage3, ';
							commandString += 'inputdcvoltage4, inputdccurrent4, inputdcwattage4, inputdcvoltage5, inputdccurrent5, inputdcwattage5,inputdcvoltage6, inputdccurrent6, inputdcwattage6 ';
							commandString += 'FROM table_solar_dcinput_temp ';
							commandString += 'WHERE r_year=' + _year.toString() + ' AND r_month=' + _month.toString() + ' AND r_day=' + _day.toString();
							commandString += ' ) AS raw_table ';
							commandString += 'WHERE search_id=';
								if(inv_number == 1)
								    commandString += checkInverter.toString();
								else{
									commandString += checkInverter[0].toString();
									for(var i=1;i<inv_number;i++){
										commandString += " OR search_id=";
										commandString += checkInverter[i].toString();
									}
								}
							commandString += ') AS raw_table_2 INNER JOIN table_arealocation_name ON table_arealocation_name.arealocation_index=raw_table_2.area_location';
							commandString += ') AS raw_table_3 INNER JOIN table_sublocation_name ON table_sublocation_name.sublocation_Index=raw_table_3.sub_location';
							commandString += ' ORDER BY area_location, inverter_id, record_time;';

							//console.log(commandString);

							conn.query(commandString, function(err, rows){
								if(err) { conn.end(); res.send('Get Data Error 3 - Solar History Data 2 Post');}
								else{

									conn.end();
									res.render('solarhistorydata2', {
									title: 'Oring Solar System Demo - History Data 2',
										setsublocationindex:1,
										setarealocationindex:1,
										setinverteridindex:1,
										setSelectDate: pickDateTime,
										setinverterlistdata:inverter_list_data,
										setSelectType: 'Day',
										setcalcTotal: 0,
										setSingleData: hasonedata,
										setchartdata: energyDataString,
										setcharttitle: 'Selected Inverters DC Input Chart Chart',
										setchartsubtitle: subtitle,
										setInverterList: 0,
										setPosFunction: 1,
										setCheckInverter: checkInverter,
										setDataIndexString: '小時',
										setTableData: rows
									});
								}
							});
						
					}
				}
			});
		}
	});
	
});

router.get('/Test', function(req, res){
  res.send('API Test 2');
});

router.get('/TestComponent', function(req, res){
	res.render('test', {
		title: 'Test'
	});
});

router.post('/PostTest', function(req, res){
	console.log('PostTest');
  res.send('POST Test');
});
router.post('/PostTest2', function(req, res){
  res.send('POST Test 2');
});

router.get('/Information', function(req, res){
	res.render('information', {
		title: 'Oring Solar Demo - Information'
	});
});
router.post('/Information', function(req, res){
	res.render('information', {
		title: 'Oring Solar Demo - Information'
	});
});
router.get('/History', function(req, res){
	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();
	//var commandString='CALL pro_get_totalenergy_hour(\'' + currentDate + '\');' 

	//console.log(commandString);

	var checkInverter = [1,2,3,4];
	var caltotalenergy = 0;
	var energyData = []
	//var titleData= ['Hour', 'Energy']
	//energyData.push(titleData)
	var subtitle = 'Calculated on';

	var inverternumbver = checkInverter.length;
	var pickDateTimeArray = currentDate.split("-");
	var newPickDateTime = pickDateTimeArray[0] + "-" + pickDateTimeArray[1];
	subtitle += (' - ' + newPickDateTime + ' by hour for selected inverters');
	var _year = pickDateTimeArray[0];
	var _month = pickDateTimeArray[1];
	var _day = pickDateTimeArray[2];
				
	var commandString='SELECT inverter_id, r_hour, ((energy_end-energy_start)/100.0) AS energy_hour FROM (';
	commandString += 'SELECT inverter_id, r_hour, energy_start, energy_end FROM table_solar_hist2_hour WHERE r_year=' + _year + ' AND r_month=' + _month + ' AND r_day=' + _day;
	commandString += ' AND ( inverter_id=' + checkInverter[0];
	for(var k=1;k<inverternumbver;k++){
		commandString += ' OR inverter_id=' + checkInverter[k];
	}
	commandString += ')) AS A ORDER BY inverter_id, r_hour;';

	var data = [0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,
		0, 0, 0, 0];
	var datas = [];
	var getInverter = [];
	
	var titleData= ['Hour'];

	console.log("1");

	const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					console.log(commandString);

					var inverter_no = -1;
					var inverter_getid = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length < 0){ res.redirect('history'); }
							else{
								//datas = [];
								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(inverter_getid != _inverter_id){
										inverter_getid = _inverter_id;
										getInverter.push(_inverter_id);
									}
								});
								inverternumbver = getInverter.length;
								for(var i=0;i<inverternumbver;i++){
									var inverter_title = getInverter[i] + '-INV';
									titleData.push(inverter_title);
								}
								energyData.push(titleData);

								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(_inverter_id != inverter_no){
										if(inverter_no != -1) datas.push(data);
										inverter_no = _inverter_id;
										data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
									}

									var index = row['r_hour'];
									data[index] = row['energy_hour'];
									}
								
					
								);
								if(data != null)
									datas.push(data);
								conn.end();
								for(i =0;i<24;i++){
									var hourData = [i.toString()];
									for(var j=0; j<inverternumbver;j++){
										hourData.push(datas[j][i]);
									}
									energyData.push(hourData);
								}
					
								var energyDataString = JSON.stringify(energyData);
			
								//console.log(energyDataString);

								res.render('history', {
									title: 'Oring Solar Demo - History',
									setcalcTotal: caltotalenergy,
									setchartdata: energyDataString,
									setcharttitle: 'Selected Inverters Energy Chart',
									setchartsubtitle: subtitle,
									setInverterList: checkInverter,
									setSelectDate: currentDate,
									setSelectType: 'Hour'
							});
							}
						}
			  		});
				
				}
			});

	

	
});
router.post('/History2', function(req, res){
	var selectType = req.body.selectType;
	var pickDateTime = req.body.pickDateTime;
	var calcAllEnergy = req.body.testCheckbox;
	var checkInverter = req.body.checkInverter;

	var currentDate = new Date().getFullYear() + '-' + (((new Date().getMonth() + 1) < 10) ? "0" : "") + (new Date().getMonth() + 1).toString() + 
	"-" + (((new Date().getDate()) < 10) ? "0" : "") + (new Date().getDate()).toString();

	var energyData = [];
	var subtitle = 'Calculated on';
	var caltotalenergy = 0;

	console.log(req.body);

	if(calcAllEnergy == 'on'){
		//console.log('Get Total Energy');
		caltotalenergy = 1;
		if(selectType == 'Hour'){
			//console.log('Get Hour Data');
			subtitle += (' - ' + pickDateTime + ' by hour');
			var commandString='CALL pro_get_totalenergy_hour(\'' + pickDateTime + '\');';
			//console.log(commandString);
			var data = [0, 0, 0, 0, 0, 
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0];
	
			var titleData= ['Hour', 'Energy'];
			energyData.push(titleData);

			const conn = new mysql.createConnection(config);
			conn.connect(  function(err){
	  		if(err){
				conn.end();
				res.send('Connect DB Error');
			}
			else
			{
		  		conn.query(commandString, function(err, rows){
			  		if(err) res.send('Get Data Error');
					else{
						rows[0].forEach( (row) => {
							var index = row['r_hour'];
							data[index] = row['total_energy_hour'];
							}
					
						);
						//console.log(data);
						conn.end();
						for(i =0;i<data.length;i++){
							var hourData = [i.toString(), data[i]];
							energyData.push(hourData);
						}
					
						var energyDataString = JSON.stringify(energyData)
			
						res.render('history', {
							title: 'Oring Solar Demo - History',
							setcalcTotal: caltotalenergy,
							setchartdata: energyDataString,
							setcharttitle: 'Total Energy Chart',
							setchartsubtitle: subtitle,
							setInverterList: checkInverter,
							setSelectDate: pickDateTime,
							setSelectType: selectType
						});
					}
			  	});
				
			}
	    	});
			

		}
		else if(selectType == 'Day'){
			//console.log('Get Day Data');
			var pickDateTimeArray = pickDateTime.split("-");
			var newPickDateTime = pickDateTimeArray[0] + "-" + pickDateTimeArray[1];
			subtitle += (' - ' + newPickDateTime + ' by Day');
			var commandString='CALL pro_get_totalenergy_day(\'' + pickDateTime + '\');';
			//console.log(commandString);
			var data = [0, 0, 0, 0, 0, 
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0];
	
			var titleData= ['Day', 'Energy'];
			energyData.push(titleData);

			const conn = new mysql.createConnection(config);
			conn.connect(  function(err){
	  		if(err){
				conn.end();
				res.send('Connect DB Error');
			}
			else
			{
		  		conn.query(commandString, function(err, rows){
			  		if(err) res.send('Get Data Error');
					else{
						rows[0].forEach( (row) => {
							var index = row['r_day'] - 1;
							data[index] = row['total_energy_day'];
							}
					
						);
						//console.log(data);
						conn.end();
						for(i =0;i<data.length;i++){
							var dayData = [(i+1).toString(), data[i]];
							energyData.push(dayData);
						}
					
						var energyDataString = JSON.stringify(energyData)
			
						res.render('history', {
							title: 'Oring Solar Demo - History',
							setcalcTotal: caltotalenergy,
							setchartdata: energyDataString,
							setcharttitle: 'Total Energy Chart',
							setchartsubtitle: subtitle,
							setInverterList: checkInverter,
							setSelectDate: pickDateTime,
							setSelectType: selectType
						});
					}
			  	});
				
			}
	    	});
			

		}
		else if(selectType == 'Month'){
			//console.log('Get Month Data');
			var pickDateTimeArray = pickDateTime.split("-");
			var newPickDateTime = pickDateTimeArray[0];
			subtitle += (' - ' + newPickDateTime + ' by Month');
			var commandString='CALL pro_get_totalenergy_month(\'' + pickDateTime + '\');';
			//console.log(commandString);
			var data = [0, 0, 0, 0, 0, 
				0, 0, 0, 0, 0,
				0, 0];
	
			var titleData= ['Month', 'Energy'];
			energyData.push(titleData);

			const conn = new mysql.createConnection(config);
			conn.connect(  function(err){
	  		if(err){
				conn.end();
				res.send('Connect DB Error');
			}
			else
			{
		  		conn.query(commandString, function(err, rows){
			  		if(err) res.send('Get Data Error');
					else{
						rows[0].forEach( (row) => {
							var index = row['r_month'] - 1;
							data[index] = row['total_energy_month'];
							}
					
						);
						//console.log(data);
						conn.end();
						for(i =0;i<data.length;i++){
							var monthData = [(i+1).toString(), data[i]];
							energyData.push(monthData);
						}
					
						var energyDataString = JSON.stringify(energyData)
			
						res.render('history', {
							title: 'Oring Solar Demo - History',
							setcalcTotal: caltotalenergy,
							setchartdata: energyDataString,
							setcharttitle: 'Total Energy Chart',
							setchartsubtitle: subtitle,
							setInverterList: checkInverter,
							setSelectDate: pickDateTime,
							setSelectType: selectType
						});
					}
			  	});
				
			}
	    	});
			

		}
		else if(selectType == 'Year'){
			//console.log('Get Year Data');
			subtitle += (' - all date by Year');
			var commandString='CALL pro_get_totalenergy_year();';
			//console.log(commandString);
			var data = [0];
	
			var titleData= ['Year', 'Energy'];
			energyData.push(titleData);

			const conn = new mysql.createConnection(config);
			conn.connect(  function(err){
	  		if(err){
				conn.end();
				res.send('Connect DB Error');
			}
			else
			{
		  		conn.query(commandString, function(err, rows){
					var yearTitle = [2000]
			  		if(err) res.send('Get Data Error');
					else{
						rows[0].forEach( (row) => {
							yearTitle[0] = row['r_year'];
							data[0] = row['total_energy_year'];
							}
					
						);
						//console.log(data);
						conn.end();
						for(i =0;i<data.length;i++){
							var yearData = [yearTitle[i].toString(), data[i]];
							energyData.push(yearData);
						}
					
						var energyDataString = JSON.stringify(energyData)
			
						res.render('history', {
							title: 'Oring Solar Demo - History',
							setcalcTotal: caltotalenergy,
							setchartdata: energyDataString,
							setcharttitle: 'Total Energy Chart',
							setchartsubtitle: subtitle,
							setInverterList: checkInverter,
							setSelectDate: pickDateTime,
							setSelectType: selectType
						});
					}
			  	});
				
			}
	    	});
			

		}
		else{
			res.send('Select Type Error!!');
		}
	}else{
		console.log('Get Each Energy');
		caltotalenergy = 0;
		console.log(checkInverter);
		if(selectType == 'Hour'){
			if(checkInverter == undefined){
				console.log('No Inverter Selected');
				res.redirect('history');
			}else{
				var inverternumbver = checkInverter.length;
				var pickDateTimeArray = pickDateTime.split("-");
				var newPickDateTime = pickDateTimeArray[0] + "-" + pickDateTimeArray[1];
				subtitle += (' - ' + newPickDateTime + ' by hour for selected inverters');
				var _year = pickDateTimeArray[0];
				var _month = pickDateTimeArray[1];
				var _day = pickDateTimeArray[2];
				
				var commandString='SELECT inverter_id, r_hour, ((energy_end-energy_start)/100.0) AS energy_hour FROM (';
				commandString += 'SELECT inverter_id, r_hour, energy_start, energy_end FROM table_solar_hist2_hour WHERE r_year=' + _year + ' AND r_month=' + _month + ' AND r_day=' + _day;
				commandString += ' AND ( inverter_id=' + checkInverter[0];
				for(var k=1;k<inverternumbver;k++){
					commandString += ' OR inverter_id=' + checkInverter[k];
				}
				commandString += ')) AS A ORDER BY inverter_id, r_hour;';
				var data = [0, 0, 0, 0, 0, 
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0];
				var datas = [];
				var getInverter = [];
	
				var titleData= ['Hour'];
				

				const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					var inverter_no = -1;
					var inverter_getid = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length == 0){ res.redirect('history'); }
							else{
								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(inverter_getid != _inverter_id){
										inverter_getid = _inverter_id;
										getInverter.push(_inverter_id);
									}
								});
								inverternumbver = getInverter.length;
								for(var i=0;i<inverternumbver;i++){
									var inverter_title = getInverter[i] + '-INV';
									titleData.push(inverter_title);
								}
								energyData.push(titleData);

								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(_inverter_id != inverter_no){
										if(inverter_no != -1) datas.push(data);
										inverter_no = _inverter_id;
										data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
									}

									var index = row['r_hour'];
									data[index] = row['energy_hour'];
									}
								
					
								);
								datas.push(data);
								conn.end();
								for(i =0;i<24;i++){
									var hourData = [i.toString()];
									for(var j=0; j<inverternumbver;j++){
										hourData.push(datas[j][i]);
									}
									energyData.push(hourData);
								}
					
								var energyDataString = JSON.stringify(energyData);
			
								res.render('history', {
									title: 'Oring Solar Demo - History',
									setcalcTotal: caltotalenergy,
									setchartdata: energyDataString,
									setcharttitle: 'Selected Inverters Energy Chart',
									setchartsubtitle: subtitle,
									setInverterList: checkInverter,
									setSelectDate: pickDateTime,
									setSelectType: selectType
							});
							}
						}
			  		});
				
				}
	    	});
			}
		}
		else if(selectType == 'Day'){
			if(checkInverter == undefined){
				console.log('No Inverter Selected');
				res.redirect('history');
			}else{
				var inverternumbver = checkInverter.length;
				subtitle += (' - ' + pickDateTime + ' by day for selected inverters');
				var pickDateTimeArray = pickDateTime.split("-");
				var _year = pickDateTimeArray[0];
				var _month = pickDateTimeArray[1];
				var _day = pickDateTimeArray[2];
				var commandString='SELECT inverter_id, r_day, (energy/1000.0) AS energy_day FROM (';
				commandString += 'SELECT inverter_id, r_day, energy FROM table_solar_hist3_day WHERE area_location=1 AND r_year=' + _year + ' AND r_month=' + _month;
				commandString += ' AND ( inverter_id=' + checkInverter[0];
				for(var k=1;k<inverternumbver;k++){
					commandString += ' OR inverter_id=' + checkInverter[k];
				}
				commandString += ')) AS A ORDER BY inverter_id, r_day;';
				var data = [0, 0, 0, 0, 0, 
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0];
				var datas = [];
				var getInverter = [];
	
				var titleData= ['Day'];

				const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					var inverter_no = -1;
					var inverter_getid = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length == 0){ res.redirect('history'); }
							else{
								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(inverter_getid != _inverter_id){
										inverter_getid = _inverter_id;
										getInverter.push(_inverter_id);
									}
								});
								inverternumbver = getInverter.length;
								for(var i=0;i<inverternumbver;i++){
									var inverter_title = getInverter[i] + '-INV';
									titleData.push(inverter_title);
								}
								energyData.push(titleData);

								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(_inverter_id != inverter_no){
										if(inverter_no != -1) datas.push(data);
										inverter_no = _inverter_id;
										data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
									}

									var index = row['r_day'] - 1;
									data[index] = row['energy_day'];
									}
								
					
								);
								datas.push(data);
								conn.end();
								for(i =0;i<31;i++){
									var dayData = [(i+1).toString()];
									for(var j=0; j<inverternumbver;j++){
										dayData.push(datas[j][i]);
									}
									energyData.push(dayData);
								}
					
								var energyDataString = JSON.stringify(energyData);
			
								res.render('history', {
									title: 'Oring Solar Demo - History',
									setcalcTotal: caltotalenergy,
									setchartdata: energyDataString,
									setcharttitle: 'Selected Inverters Energy Chart',
									setchartsubtitle: subtitle,
									setInverterList: checkInverter,
									setSelectDate: pickDateTime,
									setSelectType: selectType
								});
							}
						}
			  		});
				
				}
	    	});
			}
		}
		else if(selectType == 'Month'){
			if(checkInverter == undefined){
				console.log('No Inverter Selected');
				res.redirect('history');
			}else{
				var inverternumbver = checkInverter.length;
				subtitle += (' - ' + pickDateTime + ' by month for selected inverters');
				var pickDateTimeArray = pickDateTime.split("-");
				var _year = pickDateTimeArray[0];
				var _month = pickDateTimeArray[1];
				var _day = pickDateTimeArray[2];
				var commandString='SELECT inverter_id, r_month, (SUM(energy)/1000.0) AS energy_month FROM (';
				commandString += 'SELECT inverter_id, r_month, energy FROM table_solar_hist3_month WHERE area_location=1 AND r_year=' + _year;
				commandString += ' AND ( inverter_id=' + checkInverter[0];
				for(var k=1;k<inverternumbver;k++){
					commandString += ' OR inverter_id=' + checkInverter[k];
				}
				commandString += ')) AS A GROUP BY r_month, inverter_id ORDER BY inverter_id, r_month;';
				var data = [0, 0, 0, 0, 0, 
					0, 0, 0, 0, 0,
					0, 0];
				var datas = [];
				var getInverter = [];
	
				var titleData= ['Month'];

				const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					var inverter_no = -1;
					var inverter_getid = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length == 0){ res.redirect('history'); }
							else{
								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(inverter_getid != _inverter_id){
										inverter_getid = _inverter_id;
										getInverter.push(_inverter_id);
									}
								});
								inverternumbver = getInverter.length;
								for(var i=0;i<inverternumbver;i++){
									var inverter_title = getInverter[i] + '-INV';
									titleData.push(inverter_title);
								}
								energyData.push(titleData);

								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(_inverter_id != inverter_no){
										if(inverter_no != -1) datas.push(data);
										inverter_no = _inverter_id;
										data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
									}

									var index = row['r_month'] - 1;
									data[index] = row['energy_month'];
									}
								
					
								);
								datas.push(data);
								console.log(datas.length);
								console.log(datas);
								conn.end();
								for(i =0;i<12;i++){
									var monthData = [(i+1).toString()];
									for(var j=0; j<inverternumbver;j++){
										monthData.push(datas[j][i]);
									}
									energyData.push(monthData);
								}
					
								var energyDataString = JSON.stringify(energyData);
			
								res.render('history', {
									title: 'Oring Solar Demo - History',
									setcalcTotal: caltotalenergy,
									setchartdata: energyDataString,
									setcharttitle: 'Selected Inverters Energy Chart',
									setchartsubtitle: subtitle,
									setInverterList: checkInverter,
									setSelectDate: pickDateTime,
									setSelectType: selectType
								});
							}
						}
			  		});
				
				}
	    	});
			}
		}
		else if(selectType == 'Year'){
			if(checkInverter == undefined){
				console.log('No Inverter Selected');
				res.redirect('history');
			}else{
				var inverternumbver = checkInverter.length;
				subtitle += (' - ' + pickDateTime + ' by year for selected inverters');
				var pickDateTimeArray = pickDateTime.split("-");
				var _year = pickDateTimeArray[0];
				var _month = pickDateTimeArray[1];
				var _day = pickDateTimeArray[2];
				var commandString='SELECT inverter_id, r_year, (SUM(energy_day)/100.0) AS energy_year FROM (';
				commandString += 'SELECT inverter_id, r_year, energy_day FROM table_solar_hist2_day';
				commandString += ' WHERE inverter_id=' + checkInverter[0];
				for(var k=1;k<inverternumbver;k++){
					commandString += ' OR inverter_id=' + checkInverter[k];
				}
				commandString += ') AS A GROUP BY r_year, inverter_id ORDER BY inverter_id, r_year;';
				var data = [0];
				var datas = [];
				var getInverter = [];
	
				var titleData= ['Year'];

				const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					var inverter_no = -1;
					var inverter_getid = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length == 0){ res.redirect('history'); }
							else{
								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(inverter_getid != _inverter_id){
										inverter_getid = _inverter_id;
										getInverter.push(_inverter_id);
									}
								});
								inverternumbver = getInverter.length;
								for(var i=0;i<inverternumbver;i++){
									var inverter_title = getInverter[i] + '-INV';
									titleData.push(inverter_title);
								}
								energyData.push(titleData);

								rows.forEach( (row) => {
									var _inverter_id = row['inverter_id'];
									if(_inverter_id != inverter_no){
										if(inverter_no != -1) datas.push(data);
										inverter_no = _inverter_id;
										data = [0];
									}

									var index = row['r_year'] - 1;
									data[0] = row['energy_year'];
									}
								
					
								);
								datas.push(data);
								console.log(datas.length);
								console.log(datas);
								conn.end();
								for(i =0;i<1;i++){
									var yearData = [(i+2021).toString()];
									for(var j=0; j<inverternumbver;j++){
										yearData.push(datas[j][i]);
									}
									energyData.push(yearData);
								}
					
								var energyDataString = JSON.stringify(energyData);
			
								res.render('history', {
									title: 'Oring Solar Demo - History',
									setcalcTotal: caltotalenergy,
									setchartdata: energyDataString,
									setcharttitle: 'Selected Inverters Energy Chart',
									setchartsubtitle: subtitle,
									setInverterList: checkInverter,
									setSelectDate: pickDateTime,
									setSelectType: selectType
								});
							}
						}
			  		});
				
				}
	    	});
			}
		}
	}

	//res.send('History2-' + selectType + '-' + pickDateTime + ' - ' + calcAllEnergy + ' - ')
	
});
router.get('/Summary', function(req, res){
	online_count = 0;
	total_count = 0;
	today_energy = 0.0;

	let data1, data2, data3;
	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
	  	if(err){
			conn.end();
			res.send('Connect DB Error');
			}
		else
		{
		  	conn.query('CALL pro_get_summary();', function(err, rows){
			  	if(err) res.send('Get Data Error');
				else{
					rows[0].forEach( (row) => {
						var online = row['Online'];
						var energy = row['today_energy'];
						if(online === 1) {
							online_count++;
							today_energy += energy
						}
						total_count++;
						
						}
					);
				
					conn.end();

					data1 = online_count;
					data2 = total_count;
					data3 = today_energy / 100.0;

					res.render('summary', {
						title: 'Oring Solar Demo - Summary',
						i_online_count: data1,
						i_total_count: data2,
						i_today_energy: data3,
						i_data: rows
					  });
				}
			});
		}
	});
	
	
});
router.post('/Summary' , function(req, res){

	var data = [];
	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
	  	if(err){
			conn.end();
			res.send('Connect DB Error');
			}
		else
		{
		  	conn.query('CALL pro_get_summary();', function(err, rows){
			  	if(err) res.send('Get Data Error');
				else{
					rows[0].forEach( (row) => {
						var online = Number(row['Online']);
						var energy = Number(row['today_energy']);
						data.push(row);
						if(online === 1) {
							online_count++;
							today_energy += energy
						}
						total_count++;
						
						}
					);
				
					conn.end();
					res.send('Get Data Success' + total_count + " - " + online_count + " - " + today_energy + " : " + rows);
					//SetData(online_count, total_count, today_energy);
					}
			  	});
				
			}
	    }
  	);

	  //res.send('Get Data Success' + total_count + " - " + online_count + " - " + today_energy + " : " + data);  
	/*res.render('summary', {
		title: 'Oring Solar Demo - Summary'
	  });*/
});

function SetData(setonelinecount, settotalcount, settodayenergy){
	online_count = setonelinecount;
	total_count = settotalcount;
	today_energy = settodayenergy;
}

router.post('/CheckUser', function(req, res){
  var organ = req.body['txtOrgan'],
  	user = req.body['txtUser'],
	pass = req.body['txtPass'];
  if( organ === 'Test' && user === 'Test' && pass === 'Test'){
	res.redirect('/summary');
  }
  else{
    //res.send('Check User Failure');
    	res.render('login', {
		title: 'ORing Solar Demo',
		showMessage: '身分驗證錯誤'
	});
  }

});

router.get('/GetAPPFile', function(req, res){
	try{
		var aasa = fs.readFileSync(__dirname + '\\apple-app-site-association');
	}
	catch(error)
	{

		console.log(error);
	}
	res.set('Content-Type', 'application/json');
    res.status(200).send(aasa);
	//res.send('Test')
})

router.get('/TestDB', function(req, res){
  const conn = new mysql.createConnection(config);
	conn.connect(
	  function(err){
	  	if(err){
			conn.end();
			res.send('Connect DB Error');
		}
		else
		{
		  //conn.query('SELECT * FROM table_solar_current',
		  conn.query('CALL pro_get_summary();',
			  function(err, rows){
			  	if(err) res.send('Get Data Error');
				else{
					var length = Object.keys(rows).length;
					var resultString = 'Selected ' + length + ' row(s)\n';
					rows[0].forEach( (row) => {
						resultString += row['inverter_id'];
						resultString += " - ";
						resultString += JSON.stringify(row);
					}
					);
				
					conn.end();
					res.send(resultString);
				}
			  });
		  
		}
	  }
  );
});

function readData()
{
  var  returnString = 'Connect DB Success2';

  conn.query('SELECT * from table_solar_current',
	  function(err, results){
	    if(err) returnString = 'Get Data Error';
	    else {
	      returnString = 'Selectd ' + results.length + ' row(s)';
	    }
		 
	  }
  );
  //returnString = 'ABC';
  return returnString;
};

router.get('/Excel2', function(req, res){
	console.log('B')
	var conf ={};
    conf.name = "mysheet";
  	conf.cols = [{
		caption:'string',
        type:'string',
	},{
		caption:'date',
		type:'date',
	},{
		caption:'bool',
		type:'bool'
	},{
		caption:'number',
		 type:'number'				
  	}];
  	conf.rows = [
 		['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
 		["e", new Date(2012, 4, 1), false, 2.7182],
        ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
        ["null date", null, true, 1.414]  
  	];
  	var result = nodeExcel.execute(conf);
	console.log('C');
  	res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  	res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
  	res.end(result, 'binary');
	console.log("A");
});

router.post('/ExportExcel', function(req, res){
	console.log('Export Excel');
	var exportdata_titlecolumn = JSON.parse(req.body.titlecolumn);
	var exportdata_rawdata = JSON.parse(req.body.tabledata);
	//console.log(exportdata_titlecolumn);
	//console.log(exportdata_rawdata);
	
	var conf = {};
	conf.anme = "Report";
	conf.cols = [{
		caption:exportdata_titlecolumn['Column_1'],
        type:'string',
	},{
		caption:exportdata_titlecolumn['Column_2'],
        type:'string',
	},{
		caption:exportdata_titlecolumn['Column_3'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_4'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_5'],
        type:'number',				
  	}];

	conf.rows = [];
	exportdata_rawdata.forEach((row) => {
		var rowdata = [];
		rowdata.push(row['sublocation_name']);
		rowdata.push(row['arealocation_name']);
		rowdata.push(row['inverter_id']);
		rowdata.push(row['data_index']);
		rowdata.push(row['energy']);
		conf.rows.push(rowdata);
	});

	//console.log(conf);

	var result = nodeExcel.execute(conf);
  	res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  	res.setHeader("Content-Disposition", "attachment; filename=" + req.body.filenamepath);
  	res.end(result, 'binary');

	//res.send('Test');
});

router.post('/ExportExcel2', function(req, res){
	console.log('Export Excel 2');
	//console.log(req.body.titlecolumn);
	var exportdata_titlecolumn = JSON.parse(req.body.titlecolumn);
	//console.log(exportdata_titlecolumn);
	//console.log(req.body.tabledata);
	var exportdata_rawdata = JSON.parse(req.body.tabledata);
	//console.log(exportdata_rawdata);
	
	
	var conf = {};
	conf.anme = "Report";
	conf.cols = [{
		caption:exportdata_titlecolumn['Column_1'],
        type:'string',
	},{
		caption:exportdata_titlecolumn['Column_2'],
        type:'string',
	},{
		caption:exportdata_titlecolumn['Column_3'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_4'],
        type:'string',
	},{
		caption:exportdata_titlecolumn['Column_5'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_6'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_7'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_8'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_9'],
        type:'number',
	},{
		caption:exportdata_titlecolumn['Column_10'],
        type:'number',				
  	}];

	console.log('Export Excel 2 - 1');

	conf.rows = [];
	exportdata_rawdata.forEach((row) => {
		var rowdata = [];
		rowdata.push(row['sublocation_name']);
		rowdata.push(row['arealocation_name']);
		rowdata.push(row['inverter_id']);
		rowdata.push(row['record_time']);
		rowdata.push(row['inputdcvoltage1']);
		rowdata.push(row['inputdccurrent1']);
		rowdata.push(row['inputdcwattage1']);
		rowdata.push(row['inputdcvoltage2']);
		rowdata.push(row['inputdccurrent2']);
		rowdata.push(row['inputdcwattage2']);
		conf.rows.push(rowdata);
	});

	console.log(conf);

	var result = nodeExcel.execute(conf);
  	res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  	res.setHeader("Content-Disposition", "attachment; filename=" + req.body.filenamepath);
  	res.end(result, 'binary');

	//res.send('Test');
});

router.get('/Solar/GetHistoryEnergy', getHistoryEnergy);

router.get('/Solar/GetInverterList', getInverterList);

router.get('/ChargingPileTest', ChargingPileTest);

router.get('/ChargingPileOverview', ChargingPileOverview);

router.get('/ChargingPileManagement', ChargingPileManagement);

router.get('/ChargingPileReport', ChargingPileReport);

router.get('/ChargingPileSetting', ChargingPileSetting);

router.post('/Gateway/GetTokenByMacAddress', getTokenByMacAddress);

router.post('/Gateway/AddMacAddress', addMacAddress);

router.post('/Gateway/UpdateMachineStatus', updateMachineStatus);

router.post('/Gateway/AddMachineCommand', addMachineCommand);

router.post('/Gateway/GetMachineStatus', getMachineStatus);

module.exports = router;
