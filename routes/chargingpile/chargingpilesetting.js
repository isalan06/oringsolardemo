const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

const ChargingPileSetting = (req, res) =>{

    console.log('ChargingPileSetting');

    

    console.log('Function Finished');
    //res.send('Charging Pile Setting');
    res.render('chargingpilesetting', {
        title: 'Charging Pile - Setting',
      });
}

module.exports=ChargingPileSetting