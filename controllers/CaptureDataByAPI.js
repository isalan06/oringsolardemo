const options = require('../config/APIConfig');
const solardataop = require('../models/SolarDataInfo');

const CaptureDataByAPI = {
    CaptureGW1: () => {
        var request = require('request');
        request(options.GW1Option, function(error, response) {
            if(error) console.log('API Error');//throw new Error(error);
            //console.log(response.body);
            else {
                var jsonData = JSON.parse(response.body);
                solardataop.TransferJSONData(0, jsonData);
            }
        });
    },
    CaptureGW2: () => {
        var request = require('request');
        request(options.GW2Option, function(error, response) {
            if(error) console.log('API Error');//throw new Error(error);
            //console.log(response.body);
            else {
                var jsonData = JSON.parse(response.body);
                solardataop.TransferJSONData(1, jsonData);
            }
        });
    },
    CaptureGW3: () => {
        var request = require('request');
        request(options.GW3Option, function(error, response) {
            if(error) console.log('API Error');//throw new Error(error);
            //console.log(response.body);
            else {
                var jsonData = JSON.parse(response.body);
                solardataop.TransferJSONData(2, jsonData);
            }
        });
    },
}

module.exports = CaptureDataByAPI