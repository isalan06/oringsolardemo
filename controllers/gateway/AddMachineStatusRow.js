const mysql = require('mysql');

const AddMachineStatusRow=(macaddress, conn, inputData, res, func)=>{

    commandString = 'INSERT INTO table_machinestatus(macaddress, recordtime, camerastatus, dht22status, thermalstatus, accelgaugestatus) VALUES(\'';
    commandString += macaddress + '\', NOW(), \'Stop\', \'Stop\', \'Stop\', \'Stop\');';

    conn.query(commandString, function(err, rows){
        if(err) { conn.end(); errordata={}; errordata['result']=2; errordata['errordescription']='Cannot execute command: ' + commandString;  res.send(JSON.stringify(errordata));
        }
        else{
            func();
        }
    });
}

module.exports=AddMachineStatusRow;