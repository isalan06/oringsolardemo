const mysql = require('mysql');

const UpdateMachineVersion=(macaddress, conn, inputData, res, func)=>{
    var programversion = inputData['ProgramVersion'];
    var parameterversion = inputData['ParameterVersion'];
    var cameraversion = inputData['CameraVersion'];
    var communicationversion = inputData['CommunicationVersion'];
    var cloudversion = inputData['CloudVersion'];

    commandString = 'UPDATE table_machineinfo SET programversion=\'';
    commandString += programversion + '\', parameterversion=\'';
    commandString += parameterversion + '\', cameraversion=\'';
    commandString += cameraversion + '\', communicationversion=\'';
    commandString += communicationversion + '\', cloudversion=\'';
    commandString += cloudversion + '\' WHERE macaddress=\'';
    commandString += macaddress + '\';'
    
    conn.query(commandString, function(err, rows){
        if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  res.send(JSON.stringify(errordata));
        }
        else{
            func();
        }
    });

}

module.exports=UpdateMachineVersion;