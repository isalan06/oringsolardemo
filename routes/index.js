var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var Chart = require('chart.js');

var config =
	{
		host: '127.0.0.1',
		user: 'root',
		password: '12345678',
		database: 'Solar_DB',
		port: 3306
	};

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

router.get('/Test', function(req, res){
  res.send('API Test 2');
});

router.post('/PostTest', function(req, res){
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
	var commandString='CALL pro_get_totalenergy_hour(\'' + currentDate + '\');' 

	//console.log(commandString);

	var data = [0, 0, 0, 0, 0, 
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
				0, 0, 0, 0];
	
	var energyData = []
	var titleData= ['Hour', 'Energy']
	energyData.push(titleData)

	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
	  	if(err){
			conn.end();
			for(i =0;i<data.length;i++){
				var hourData = [i.toString(), data[i]];
				//console.log(hourData);
				energyData.push(hourData);
			}
		
			var energyDataString = JSON.stringify(energyData)
		
			//console.log(energyDataString);
		
			res.render('history', {
				title: 'Oring Solar Demo - History',
				setcalcTotal: 1,
				setchartdata: energyDataString,
				setcharttitle: 'Total Energy Chart',
				setchartsubtitle: 'Calculated on ' + currentDate,
				setInverterList: ['1', '2', '3', '4'],
				setSelectDate: currentDate,
				setSelectType: 'Hour'
			});
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
					conn.end();

					for(i =0;i<data.length;i++){
						var hourData = [i.toString(), data[i]];
						//console.log(hourData);
						energyData.push(hourData);
					}
				
					var energyDataString = JSON.stringify(energyData)
				
					//console.log(energyDataString);
				
					res.render('history', {
						title: 'Oring Solar Demo - History',
						setcalcTotal: 1,
						setchartdata: energyDataString,
						setcharttitle: 'Total Energy Chart',
						setchartsubtitle: 'Calculated on ' + currentDate,
						setInverterList: ['1', '2', '3', '4'],
						setSelectDate: currentDate,
						setSelectType: 'Hour'
					});

					}
			  	});
			}
	    }
  	);

	
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
				
				var commandString='SELECT inverter_id, r_hour, (energy_end-energy_start) AS energy_hour FROM (';
				commandString += 'SELECT inverter_id, r_hour, energy_start, energy_end FROM table_solar_hist2_hour WHERE r_year=' + _year + ' AND r_month=' + _month + ' AND r_day=' + _day;
				commandString += ') AS A ORDER BY inverter_id, r_hour;';
				var data = [0, 0, 0, 0, 0, 
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0];
				var datas = [];
	
				var titleData= ['Hour'];
				for(var i=0;i<inverternumbver;i++){
					var inverter_title = checkInverter[i] + '-INV';
					titleData.push(inverter_title);
				}
				energyData.push(titleData);

				const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					var inverter_no = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length == 0){ res.redirect('history'); }
							else{
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
									for(var j=0; j<datas.length;j++){
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
				var commandString='SELECT inverter_id, r_day, energy_day FROM (';
				commandString += 'SELECT inverter_id, r_day, energy_day FROM table_solar_hist2_day WHERE r_year=' + _year + ' AND r_month=' + _month;
				commandString += ') AS A ORDER BY inverter_id, r_day;';
				var data = [0, 0, 0, 0, 0, 
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0];
				var datas = [];
	
				var titleData= ['Day'];
				for(var i=0;i<inverternumbver;i++){
					var inverter_title = checkInverter[i] + '-INV';
					titleData.push(inverter_title);
				}
				energyData.push(titleData);

				const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					var inverter_no = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length == 0){ res.redirect('history'); }
							else{
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
									for(var j=0; j<datas.length;j++){
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
				var commandString='SELECT inverter_id, r_month, SUM(energy_day) AS energy_month FROM (';
				commandString += 'SELECT inverter_id, r_month, energy_day FROM table_solar_hist2_day WHERE r_year=' + _year;
				commandString += ') AS A GROUP BY r_month, inverter_id ORDER BY inverter_id, r_month;';
				var data = [0, 0, 0, 0, 0, 
					0, 0, 0, 0, 0,
					0, 0];
				var datas = [];
	
				var titleData= ['Month'];
				for(var i=0;i<inverternumbver;i++){
					var inverter_title = checkInverter[i] + '-INV';
					titleData.push(inverter_title);
				}
				energyData.push(titleData);

				const conn = new mysql.createConnection(config);
				conn.connect(  function(err){
	  			if(err){
					conn.end();
					res.send('Connect DB Error');
				}
				else
				{
					var inverter_no = -1;
		  			conn.query(commandString, function(err, rows){
			  			if(err) res.send('Get Data Error');
						else{
							if(rows.length == 0){ res.redirect('history'); }
							else{
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
									for(var j=0; j<datas.length;j++){
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

module.exports = router;
