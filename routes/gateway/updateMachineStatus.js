const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');
var base64url = require('base64url');
const CheckMacAddressAndToken = require('../../controllers/gateway/CheckMacAddressAndToken')
const GetMachineStatus = require('../../controllers/gateway/GetMachineStatus')

const updateMachineStatus=(req, res)=>{
    inputData = req.body;
    headerData = req.headers;

    var macaddress = inputData['MacAddress'];
    var token = headerData['token']

    CheckMacAddressAndToken(macaddress, token, req, res, updateMachineStatusImplment);

    
}

const updateMachineStatusImplment=(macaddress, count, req, res)=>{
    if(count === 1){
        inputData = req.body;
        var camerastatus = inputData['CameraStatus'];
        var camerasmallimage = inputData['CameraSmallImage'];

        commandString = 'UPDATE table_machinestatus SET recordtime=NOW(), camerastatus=\'';
        commandString += camerastatus + '\', camerasmallimage=\'';
        commandString += camerasmallimage + '\'';
        commandString += ';';

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
                        GetMachineStatus(macaddress, req, res);
                    }
                });
            }
        });

        
        //res.send('1');
    }
    else if(count === 0){
        errordata={}; 
        errordata['result']=1; 
        errordata['errordescription']='The Mac-Address or Token is wrong!';  
        res.send(JSON.stringify(errordata));
    }
    else{
        errordata={}; 
        errordata['result']=2; 
        errordata['errordescription']='There is database error from execute procedure!';  
        res.send(JSON.stringify(errordata));
    }
    
    
}

module.exports=updateMachineStatus;