const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const ChargingPileManagement = (req, res) =>{

    console.log('ChargingPileManagement');

    

    console.log('Function Finished');
    //res.send('Charging Pile Management');
    res.render('chargingpilemanagement', {
        title: 'Charging Pile - Management',
      });
}

module.exports=ChargingPileManagement