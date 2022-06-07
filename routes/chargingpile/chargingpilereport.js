const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const ChargingPileReport = (req, res) =>{

    console.log('ChargingPileReport');

    

    console.log('Function Finished');
    //res.send('Charging Pile Report');
    res.render('chargingpilereport', {
        title: 'Charging Pile - Report',
      });
}

module.exports=ChargingPileReport