const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const getHourEnergyByEachInverter=(group, inverters, searchdate, func)=>{
    var inv_number = inverters.length;

    var commandString = 'SELECT ';
    commandString += 'inverter_id, r_hour, SUM(energy) AS totalenergy ';
    commandString += 'FROM (';
        commandString += 'SELECT ';
        commandString += 'r_hour, inverter_id, (energy_end - energy_start) AS energy ';
        commandString += 'FROM table_solar_hist_hour ';
        commandString += 'WHERE customer_id=' + group['customer_id'];
        commandString += ' AND main_location=' + group['main_location'];
        commandString += ' AND sub_location=' + group['sub_location'];
        commandString += ' AND r_year=' + searchdate.getFullYear();
        commandString += ' AND r_month=' + (searchdate.getMonth() + 1);
        commandString += ' AND r_day=' + searchdate.getDate();
        if(inv_number > 0){
        
        commandString += ' AND (inverter_id=';
        commandString += inverters[0];

            for(var i=1;i<inv_number;i++){
            
        commandString += ' OR inverter_id=';
        commandString += inverters[i];

            }

        commandString += ')';

        }
    commandString += ') AS RawData ' ;
    commandString += 'WHERE energy >= 0 AND energy <= 10000 ';
    commandString += 'GROUP BY inverter_id, r_hour;';

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
                        outputData['type']='Hour';
                        outputData['unit']='kWh';
                        valuedata=[];
                        for(var i=0;i<rows.length;i++){
                            if(rows[i]['inverter_id'] !== first_id_index){
                                first_id_index = rows[i]['inverter_id'];
                                id_index++;
                                detaildata={};
                                detaildata['inverter_id'] = rows[i]['inverter_id'];
                                detaildata['data']=[]
                                valuedata.push(detaildata);
                            }
                            energyvalue={};
                            energyvalue['hour']=rows[i]['r_hour'];
                            energyvalue['energy']=rows[i]['totalenergy']/100.0;
                            valuedata[id_index]['data'].push(energyvalue);
                        }
                        outputData['data']=valuedata;
                        outputData['inverternumber']=id_index+1;

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

module.exports=getHourEnergyByEachInverter;