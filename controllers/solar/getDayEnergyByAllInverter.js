const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const getDayEnergyByAllInverter=(group, searchdate, func)=>{

    var commandString = 'SELECT ';
    commandString += 'r_day, SUM(energy) AS totalenergy ';
    commandString += ',AVG(py) AS py, AVG(temperature) AS temperature ';
    commandString += 'FROM (';
        commandString += 'SELECT ';
        commandString += 'r_day, (energy_end - energy_start) AS energy ';
        commandString += ',(py_start+py_end)/2 AS py, (temperature_start+temperature_end)/2 AS temperature ';
        commandString += 'FROM table_solar_hist_hour ';
        commandString += 'WHERE customer_id=' + group['customer_id'];
        commandString += ' AND main_location=' + group['main_location'];
        commandString += ' AND sub_location=' + group['sub_location'];
        commandString += ' AND area_location=' + group['area_location'];
        commandString += ' AND r_year=' + searchdate.getFullYear();
        commandString += ' AND r_month=' + (searchdate.getMonth() + 1);
        
    commandString += ') AS RawData ' ;
    commandString += 'WHERE energy > 0 AND energy <= 10000 ';
    commandString += 'GROUP BY r_day;';

    const conn = new mysql.createConnection(DBConfig.DBConfig_solar);
    conn.connect(  function(err){
        if(err){ conn.end(); errordata={}; errordata['result']=1; errordata['errordescription']='Cannot connect to database';  func(errordata);
        }
        else {
            conn.query(commandString, function(err, rows){
				if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  func(errordata);
                }
			  	else{
                    conn.end();

                    let first_id_index = -1;
                    let id_index = -1

                    if(rows.length > 0){
                        outputData={};
                        outputData['result']=0;
                        outputData['errordescription']='NA';
                        outputData['type']='Day';
                        outputData['energy_unit']='kWh';
                        outputData['solarmeter_unit']='W/㎡';
                        outputData['temperature_unit']='°C';
                        valuedata=[];
                        for(var i=0;i<rows.length;i++){
                            energyvalue={};
                            energyvalue['day']=rows[i]['r_day'];
                            energyvalue['energy']=rows[i]['totalenergy']/100.0;
                            energyvalue['avg_solar']=rows[i]['py'];
                            energyvalue['avg_temperature']=rows[i]['temperature'];
                            valuedata.push(energyvalue);
                        }
                        outputData['data']=valuedata;

                        func(outputData);
                    }
                    else{
                        errordata={}; errordata['result']=3; errordata['errordescription']='There is no data in database' ;  func(errordata);
                    }

                    
                }
            });
        }
    });
}

module.exports=getDayEnergyByAllInverter;