var mysql = require('mysql');
const solardataop = require('../models/SolarDataInfo');
var DBConfig = require('../config/DBConfig');
const date = require('date-and-time');
const { connect } = require('../routes/db');

var config = DBConfig.DBConfig;

const UpdateDataToDB = {
    UpdateEnvData: () => {
        const envData = solardataop.Get_Env1();
        const conn = mysql.createConnection(config);
        conn.connect(function(err) {
            if(err){console.log('Update EnvData Data To DB error');}
            else{
                for(var i=0;i<3;i++){
                    if(envData[i].refresh){
                        let commandString = 'UPDATE table_solar_env SET ';
                        let timestamprecord = new Date(envData[i].timestamp)
                        let tiemstampString = date.format(timestamprecord, 'YYYYMMDDHHmmss');
                        let get_year = timestamprecord.getFullYear();
                        let get_month = timestamprecord.getMonth()+1;
                        let get_day = timestamprecord.getDate();

                        commandString += 'py=' + envData[i].py + ', ';
                        commandString += 'py_min=' + envData[i].py_min + ', ';
                        commandString += 'py_max=' + envData[i].py_max + ', ';
                        commandString += 'temperature=' + envData[i].temperature + ', ';
                        commandString += 'temperature_min=' + envData[i].temperature_min + ', ';
                        commandString += 'temperature_max=' + envData[i].temperature_max + ', ';
                        commandString += 'last_time=NOW(), ';
                        commandString += 'timestamp=\'' + tiemstampString + '\'';
                        commandString += 'WHERE customer_id=' + envData[i].csutomer_id + ' AND ';
                        commandString += 'main_location=' + envData[i].main_location + ' AND ';
                        commandString += 'sub_location=' + envData[i].sub_location + ' AND ';
                        commandString += 'area_location=' + envData[i].area_location + ';';
                        solardataop.Reset_Env1_Refresh(i);

                        conn.query(commandString, (error) => {
                            if(error){ console.log('Update Env Data Failure');}
                            else {

                            }

                        });
                    }
                }
            }

            console.log('Update Env Data Finished');
            conn.end();
        });
        
    },
    UpdateRegularData: () => {
        const regularData = solardataop.Get_Customer1();
        const conn = mysql.createConnection(config);
        conn.connect(function(err) {
            if(err){console.log('Update RegularData Data To DB error');}
            else{
                var updateregulardatacount = 0;
                for(var i=0;i<3;i++){
                    for(var j=0;j<30;j++){
                        var index = i * 30 + j;
                        //console.log(regularData[index].refresh);
                        if(regularData[index].refresh){
                            updateregulardatacount++;
                            let commandString = 'UPDATE table_solar_current SET ';
                            let timestamprecord = new Date(regularData[index].timestamp);
                            let tiemstampString = date.format(timestamprecord, 'YYYYMMDDHHmmss');
                            let get_year = timestamprecord.getFullYear();
                            let get_month = timestamprecord.getMonth()+1;
                            let get_day = timestamprecord.getDate();
                            //console.log(tiemstampString);
                            commandString += 'today_energy=' + regularData[index].total_energy_10Wh + ', ';
                            commandString += 'today_runtime=' + regularData[index].total_runtime_s + ', ';
                            commandString += 'life_energy=' + regularData[index].life_energy_10Wh + ', ';
                            commandString += 'life_runtime=' + regularData[index].life_runtime_s + ', ';
                            commandString += 'inverter_state=' + regularData[index].inverter_state + ', ';
                            commandString += 'temperature_ambient=' + regularData[index].ambient_temp_c + ', ';
                            commandString += 'temperature_boost=' + regularData[index].boost1_temp_c + ', ';
                            commandString += 'temperature_inverter=' + regularData[index].inverter_temp + ', ';
                            commandString += 'temperature_boost2=' + regularData[index].boost2_temp_c + ', ';
                            commandString += 'input_dc_total_power=' + regularData[index].input_dc_total_power_w + ', ';
                            commandString += 'output_ac_total_power=' + regularData[index].output_ac_total_power_w + ', ';
                            commandString += 'output_ac_voltage1=' + regularData[index].output1_ac_voltage_V + ', ';
                            commandString += 'output_ac_current1=' + regularData[index].output1_ac_current_A + ', ';
                            commandString += 'output_ac_wattage1=' + regularData[index].output1_ac_wattage_W + ', ';
                            commandString += 'output_ac_frequency1=' + regularData[index].output1_ac_freqency_Hz + ', ';
                            commandString += 'output_ac_voltage2=' + regularData[index].output2_ac_voltage_V + ', ';
                            commandString += 'output_ac_current2=' + regularData[index].output2_ac_current_A + ', ';
                            commandString += 'output_ac_wattage2=' + regularData[index].output2_ac_wattage_W + ', ';
                            commandString += 'output_ac_frequency2=' + regularData[index].output2_ac_freqency_Hz + ', ';
                            commandString += 'output_ac_voltage3=' + regularData[index].output3_ac_voltage_V + ', ';
                            commandString += 'output_ac_current3=' + regularData[index].output3_ac_current_A + ', ';
                            commandString += 'output_ac_wattage3=' + regularData[index].output3_ac_wattage_W + ', ';
                            commandString += 'output_ac_frequency3=' + regularData[index].output3_ac_freqency_Hz + ', ';
                            commandString += 'last_time=NOW(), ';
                            commandString += 'timestamp=\'' + tiemstampString + '\'';
                            commandString += 'WHERE customer_id=' + regularData[index].csutomer_id + ' AND ';
                            commandString += 'main_location=' + regularData[index].main_location + ' AND ';
                            commandString += 'sub_location=' + regularData[index].sub_location + ' AND ';
                            commandString += 'area_location=' + regularData[index].area_location + ' AND ';
                            commandString += 'inverter_id=' + regularData[index].inverter_id + ';';
                            solardataop.Reset_Customer1_Refresh(index);
                            //console.log(commandString);
                            conn.query(commandString, (error) => {
                                if(error){ console.log('Update Regular Data Failure');}
                                else {

                                }
                            });

                            let commandString_pro1 = `CALL pro_set_energy(?,?,?,?,?,?,?,?)`;

                            conn.query(commandString_pro1, 
                                    [regularData[index].csutomer_id,
                                    regularData[index].main_location,
                                    regularData[index].sub_location,
                                    regularData[index].area_location,
                                    regularData[index].inverter_id,
                                    tiemstampString,
                                    regularData[index].life_energy_10Wh,
                                    regularData[index].total_energy_10Wh,],
                                    (error, results, fields) => {
                                if(error){console.log('Update PRO_SET_ENERGY Error');}
                                else {

                                }
                                
                            });

                            let commandString_pro2 = `CALL pro_set_historyenergy_day(?,?,?,?,?,?,?,?,?)`;

                            conn.query(commandString_pro2,
                                    [
                                        regularData[index].csutomer_id,
                                        regularData[index].main_location,
                                        regularData[index].sub_location,
                                        regularData[index].area_location,
                                        regularData[index].inverter_id,
                                        get_year,
                                        get_month,
                                        get_day,
                                        regularData[index].day0_Wh,
                                    ],
                                    (error, results, fields) => {
                                if(error){console.log('Update PRO_SET_ENERGY2 Error');}
                                else {

                                }
                            });

                            let commandString_pro3 = `CALL pro_set_historyenergy_month(?,?,?,?,?,?,?,?)`;

                            conn.query(commandString_pro3,
                                    [
                                        regularData[index].csutomer_id,
                                        regularData[index].main_location,
                                        regularData[index].sub_location,
                                        regularData[index].area_location,
                                        regularData[index].inverter_id,
                                        get_year,
                                        get_month,
                                        regularData[index].month0_Wh,
                                    ],
                                    (error, results, fields) => {
                                if(error){console.log('Update PRO_SET_ENERGY3 Error');}
                                else {

                                }
                            });

                        }

                    }
                }
                
            }
            console.log('Update Regular Data: ' + updateregulardatacount);
            conn.end();
        });
    },
}

module.exports = UpdateDataToDB;
