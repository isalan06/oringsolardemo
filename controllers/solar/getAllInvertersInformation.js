const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const getAllInvertersInformation=(func)=>{
    var commandString = 'SELECT ';
    commandString += 'customer_id, main_location, sub_location, area_location, arealocation_name, inverter_id ';
    commandString += 'FROM (';
        commandString += 'SELECT ';
        commandString += 'customer_id, main_location, sub_location, area_location, inverter_id ';
        commandString += 'FROM table_solar_current';
    commandString += ') AS grouptable ';
    commandString += 'JOIN ('
        commandString += 'SELECT ';
        commandString += 'arealocation_index, arealocation_name '
        commandString += 'FROM table_arealocation_name'
    commandString += ') AS nametable ';
    commandString += 'ON grouptable.area_location=nametable.arealocation_index';
    commandString += ';';

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
                        groupdata=[];
                        for(var i=0;i<rows.length;i++){
                            if(rows[i]['area_location'] !== first_id_index){
                                first_id_index = rows[i]['area_location'];
                                id_index++;
                                detaildata={};
                                detaildata['areaname'] = rows[i]['arealocation_name'];
                                detaildata['customer_id']=rows[i]['customer_id'];
                                detaildata['main_location']=rows[i]['main_location'];
                                detaildata['sub_location']=rows[i]['sub_location'];
                                detaildata['area_location']=rows[i]['area_location'];
                                detaildata['inverters']=[]
                                groupdata.push(detaildata);
                            }
                            groupdata[id_index]['inverters'].push(rows[i]['inverter_id']);
                        }
                        outputData['group']=groupdata;

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

module.exports=getAllInvertersInformation;