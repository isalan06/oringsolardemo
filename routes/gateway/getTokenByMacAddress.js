const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');
const UpdateMachineVersion = require('../../controllers/gateway/UpdateMachineVersion');

const getTokenByMacAddress=(req, res)=>{
    inputData = req.body;
    var macaddress = inputData['MacAddress'];
    var commandString ='SELECT macaddress, token, usecloud, usertoken, cloudurl, cloudtype FROM table_machineinfo WHERE macaddress=\'' + macaddress + '\';';
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
                        //conn.end();
                        UpdateMachineVersion(macaddress, conn, inputData, res, ()=>{
                            conn.end();
                            var token = rows[0]['token'];
                            var usecloud = rows[0]['usecloud'];
                            var usertoken = rows[0]['usertoken'];
                            var cloudurl = rows[0]['cloudurl'];
                            var cloudtype = rows[0]['cloudtype'];
                            outputData={};
                            outputData['result']=0;
                            outputData['errordescription']='NA';
                            outputData['MacAddress']=macaddress;
                            outputData['Token']=token;
                            outputData['UseCloud']=usecloud;
                            outputData['UserToken']=usertoken;
                            outputData['CloudUrl']=cloudurl;
                            outputData['CloudType']=cloudtype;

                            res.send(JSON.stringify(outputData));
                        });
                    }
                    else{
                        
                        commandString='INSERT INTO table_unregistermacaddress VALUES(NOW(), \'' + macaddress + '\');';
                        conn.query(commandString, function(err, rows){
                            conn.end(); errordata={}; errordata['result']=3; errordata['errordescription']='There is no Mac Address (' + macaddress + ") in system." ;  res.send(JSON.stringify(errordata));
                        
                        });
                    }
                }
            });
            
        }
    });

    
}

module.exports=getTokenByMacAddress