const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const addMachineCommand=(req, res)=>{
    inputData = req.body;
    var macaddress= inputData['MacAddress'];
    var command = inputData['Command'];

    var commandString = 'INSERT INTO table_machinecommand(macaddress, command, commanddata, createtime) VALUES(\'';
    commandString += macaddress + '\',\'';
    commandString += command + '\',\'';
    commandString += JSON.stringify(inputData) + '\', NOW());';

    const conn = new mysql.createConnection(DBConfig.DBConfig_gateway);
    conn.connect(  function(err){
        if(err){ conn.end(); errordata={}; errordata['result']=1; errordata['errordescription']='Cannot connect to database';  res.send(JSON.stringify(errordata));
	  	}
	  	else {
            conn.query(commandString, function(err, rows){
				if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  res.send(JSON.stringify(errordata));
                }
			  	else{
                    conn.end(); 
                    outputData={};
                    outputData['result']=0;
                    outputData['errordescription']='NA';
                    outputData['payload']=inputData;
                    res.send(JSON.stringify(outputData));
                }
            });
        }
    });

}

module.exports=addMachineCommand;