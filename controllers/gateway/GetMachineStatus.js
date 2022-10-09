const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const GetMachineStatus=(macaddress ,body, res)=>{
    var commandString = 'SELECT command, commanddata FROM table_machinecommand WHERE isfinished=0 AND macaddress=\'';
    commandString += macaddress + '\' ORDER BY createtime DESC LIMIT 1';
    const conn = new mysql.createConnection(DBConfig.DBConfig_gateway);
    conn.connect(  function(err){
        if(err){ conn.end(); errordata={}; errordata['result']=1; errordata['errordescription']='Cannot connect to database';  res.send(JSON.stringify(errordata));
	  	}
	  	else {
            conn.query(commandString, function(err, rows){
				if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  res.send(JSON.stringify(errordata));
                }
			  	else{
                    
                    if(rows.length > 0){
                        let _command = rows[0]['command'];
                        let _commandpayload = rows[0]['commanddata'];
                        commandString = 'UPDATE table_machinecommand SET transfertime=NOW(), isfinished=1 WHERE macaddress=\'';
                        commandString += macaddress + '\';'
                        conn.query(commandString, function(err, rows){
                            if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  res.send(JSON.stringify(errordata));
                            }
                            else{
                                conn.end();
                                let commandData = {};
                                commandData['result']=0;
                                commandData['errordescription']='NA';
                                commandData['iscommand']=1;
                                commandData['command']=_command;
                                commandData['commandpayload']=JSON.parse(_commandpayload);
                                res.send(JSON.stringify(commandData));
                            }
                        });

                        
                    }
                    else{
                        conn.end();
                        let commandData = {};
                        commandData['result']=0;
                        commandData['errordescription']='NA';
                        commandData['iscommand']=0;
                        commandData['command']='';
                        commandData['commandpayload']=JSON.stringify({ command: 'NA', commandindex: 0});
                        res.send(JSON.stringify(commandData));
                    }
                }
            });
        }
    });
}

module.exports=GetMachineStatus;