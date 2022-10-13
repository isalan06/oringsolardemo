const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');
const getHourEnergyByEachInverter = require('../../controllers/solar/getHourEnergyByEachInverter');
const getDayEnergyByEachInverter = require('../../controllers/solar/getDayEnergyByEachInverter');
const getMonthEnergyByEachInverter = require('../../controllers/solar/getMonthEnergyByEachInverter');
const getHourEnergyByAllInverter = require('../../controllers/solar/getHourEnergyByAllInverter');
const getDayEnergyByAllInverter = require('../../controllers/solar/getDayEnergyByAllInverter');
const getMonthEnergyByAllInverter = require('../../controllers/solar/getMonthEnergyByAllInverter');

const getHistoryEnergy=(req, res)=>{
    var inputData = req.body;

    var group = inputData['group'];
    var selectall = inputData['selectall'];
    var inverters = inputData['inverters'];
    var datatype = inputData['datatype'];
    var error = false;
    var searchdate
    try{
        searchdate = new Date(new Date(inputData['searchdate']).getTime() + (8 * 60 * 60 * 1000));
    }
    catch{
        error = true;
        errordata={}; errordata['result']=5; errordata['errordescription']='The [searchdate] is error string : ' + inputData['searchdate']; res.send(JSON.stringify(errordata));
    }

    if(!error)
    {
        if(selectall === 0){
            if(datatype === 'Hour')
                getHourEnergyByEachInverter(group ,inverters, searchdate, (outputData)=>{
                    getHistoryEnergyImplement(res, outputData);
                });
            else if(datatype === 'Day')
                getDayEnergyByEachInverter(group ,inverters, searchdate, (outputData)=>{
                    getHistoryEnergyImplement(res, outputData);
            });
            else if(datatype === 'Month')
                getMonthEnergyByEachInverter(group ,inverters, searchdate, (outputData)=>{
                    getHistoryEnergyImplement(res, outputData);
            });
            else{
                errordata={}; errordata['result']=4; errordata['errordescription']='The [datatype] is error string : ' + datatype + '. There are three types for [datatype]: Hour, Day, Month.'; res.send(JSON.stringify(errordata));
            }
         
        }
        else{
            if(datatype === 'Hour')
                getHourEnergyByAllInverter(group, searchdate, (outputData)=>{
                    getHistoryEnergyImplement(res, outputData);
                });
            else if(datatype === 'Day')
                getDayEnergyByAllInverter(group, searchdate, (outputData)=>{
                    getHistoryEnergyImplement(res, outputData);
            });
            else if(datatype === 'Month')
                getMonthEnergyByAllInverter(group, searchdate, (outputData)=>{
                    getHistoryEnergyImplement(res, outputData);
            });
            else{
                errordata={}; errordata['result']=4; errordata['errordescription']='The [datatype] is error string : ' + datatype + '. There are three types for [datatype]: Hour, Day, Month.'; res.send(JSON.stringify(errordata));
            }
        }
    }

    function getHistoryEnergyImplement(res, outputData){
        res.send(JSON.stringify(outputData));
    }

    
}

module.exports=getHistoryEnergy;