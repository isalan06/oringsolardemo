const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const getMachineStatus=(req, res)=>{
    inputData = req.body;

    var macaddress = inputData['MacAddress'];
    var commandString ='SELECT camerastatus, dht22status, thermalstatus, accelgaugestatus, camerasmallimage, sensordata, parameter, cameraparameter, machineoperation, cloudparameter, odparameter FROM table_machinestatus WHERE macaddress=\'' + macaddress + '\' LIMIT 1;';
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
                        outputData={};
                        let status={}
                        status['camera']=rows[0]['camerastatus'];
                        status['dht22']=rows[0]['dht22status'];
                        status['thermal']=rows[0]['thermalstatus'];
                        status['accelgauge']=rows[0]['accelgaugestatus'];
                        outputData['status']=status;
                        outputData['camerasmallimage']=rows[0]['camerasmallimage'];
                        outputData['sensordata']=JSON.parse(rows[0]['sensordata']);
                        outputData['parameter']=JSON.parse(rows[0]['parameter']);
                        outputData['cameraparameter']=JSON.parse(rows[0]['cameraparameter']);
                        outputData['machineoperation']=JSON.parse(rows[0]['machineoperation']);
                        outputData['cloudparameter']=JSON.parse(rows[0]['cloudparameter']);
                        outputData['odparameter']=JSON.parse(rows[0]['odparameter']);
                        res.send(JSON.stringify(outputData));
                    }
                    else{
                        conn.end(); errordata={}; errordata['result']=3; errordata['errordescription']='There is no data ( Mac Address :' + macaddress + ") in system." ;  res.send(JSON.stringify(errordata));
                    }
                }
            });
        }
    });
}

module.exports=getMachineStatus;