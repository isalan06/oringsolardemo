const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const getMonthEnergyByEachInverter=(group, inverters, searchdate, func)=>{
    var inv_number = inverters.length;

    var commandString = 'SELECT ';
    commandString += 'inverter_id, r_month, SUM(energy) AS totalenergy ';
    commandString += ',AVG(py) AS py, AVG(temperature) AS temperature ';
    commandString += 'FROM (';
        commandString += 'SELECT ';
        commandString += 'r_month, inverter_id, (energy_end - energy_start) AS energy ';
        commandString += ',(py_start+py_end)/2 AS py, (temperature_start+temperature_end)/2 AS temperature ';
        commandString += 'FROM table_solar_hist_hour ';
        commandString += 'WHERE customer_id=' + group['customer_id'];
        commandString += ' AND main_location=' + group['main_location'];
        commandString += ' AND sub_location=' + group['sub_location'];
        commandString += ' AND area_location=' + group['area_location'];
        commandString += ' AND r_year=' + searchdate.getFullYear();
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
    commandString += 'WHERE energy > 0 AND energy <= 10000 ';
    commandString += 'GROUP BY inverter_id, r_month;';

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
                        outputData['type']='Month';
                        outputData['energy_unit']='kWh';
                        outputData['solarmeter_unit']='W/㎡';
                        outputData['temperature_unit']='°C';
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
                            energyvalue['month']=rows[i]['r_month'];
                            energyvalue['energy']=rows[i]['totalenergy']/100.0;
                            energyvalue['avg_solar']=rows[i]['py'];
                            energyvalue['avg_temperature']=rows[i]['temperature'];
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

module.exports=getMonthEnergyByEachInverter;