const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');
var base64url = require('base64url');

const addMacAddress=(req, res)=>{
    console.log('start add Mac Address');
    inputData = req.body;
    var macaddress = inputData['MacAddress'];
    //var token = require('crypto').randomBytes(20).toString('hex');
    var token = base64url(require('crypto').randomBytes(20));
    var location = inputData['Location'];
    var usecloud = inputData['UseCloud'];
    var cloudurl = inputData['CloudUrl'];
    var cloudtype = inputData['CloudType'];
    var usertoken = inputData['UserToken'];
    var longitude = inputData['Longitude'];
    var latitude = inputData['Latitude'];

    console.log('search db');

    var commandString ='SELECT COUNT(*) as DataCount FROM table_machineinfo WHERE macaddress=\'' + macaddress + '\';';
    const conn = new mysql.createConnection(DBConfig.DBConfig_gateway);
    conn.connect(  function(err){
        if(err){ conn.end(); errordata={}; errordata['result']=1; errordata['errordescription']='Cannot connect to database';  res.send(JSON.stringify(errordata));
	  	}
	  	else {
            conn.query(commandString, function(err, rows){
				if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  res.send(JSON.stringify(errordata));
                }
			  	else{
                    var count = rows[0]['DataCount'];
                    console.log(count);
                    if(count !== 0){
                        conn.end(); errordata={}; errordata['result']=3; errordata['errordescription']='There is exist mac_address: ' + macaddress; res.send(JSON.stringify(errordata));
                    }
                    else{
                        commandString = 'INSERT INTO table_machineinfo(macaddress, token, location, usecloud, cloudurl, cloudtype, usertoken, longitude, latitude) VALUES(\'';
                        commandString += macaddress + '\',\'';
                        commandString += token + '\',\'';
                        commandString += location + '\',';
                        commandString += usecloud + ',\'';
                        commandString += cloudurl + '\',';
                        commandString += cloudtype + ',\'';
                        commandString += usertoken + '\',';
                        commandString += longitude + ',';
                        commandString += latitude + ');';
                        console.log(commandString);
                        conn.query(commandString, function(err, rows){
                            if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  res.send(JSON.stringify(errordata));
                            }
                            else{
                                conn.end(); 
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
                            }
                        });
                        
                    }
                    
                }
            });
        }

    
    });
}

module.exports=addMacAddress;