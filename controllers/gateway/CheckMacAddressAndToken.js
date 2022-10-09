const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const CheckMacAddressAndToken=(macaddress, token, req, res, func)=>{
    var commandString = 'SELECT COUNT(*) AS DataCount FROM table_machineinfo WHERE macaddress=\'';
    commandString += macaddress + '\' AND token=\'';
    commandString += token + '\';'

    const conn = new mysql.createConnection(DBConfig.DBConfig_gateway);
    conn.connect(  function(err){
        if(err){ conn.end(); func(-1, req, res);
	  	}
	  	else {
            conn.query(commandString, function(err, rows){
				if(err) { conn.end(); func(-1, req, res);
                }
			  	else{
                    conn.end();
                    if(rows.length > 0){
                        var count = rows[0]['DataCount'];
                        console.log(count);
                        func(macaddress, count, req, res);
                    }
                    else{
                        func(-1, req, res);
                    }
                }
            });

        }
    });
}

module.exports=CheckMacAddressAndToken;