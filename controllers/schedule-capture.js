const solardataop = require('../models/SolarDataInfo');
const capturedatabyapi = require('./CaptureDataByAPI');
const updatedatatodb = require('./UpdateDataToDB');

const scheduleCaptureController = {
    Test: () => {
        console.log('Test Output');
        console.log(solardataop.Get_Customer1());
    },
    CaptureDataByAPI:() =>{
        console.log('Capture Data By API');
        capturedatabyapi.CaptureGW1();
        capturedatabyapi.CaptureGW2();
        capturedatabyapi.CaptureGW3();
    },
    CheckDataForUpdate: () => {
        console.log('Check Data For Update');
        updatedatatodb.UpdateRegularData();
        updatedatatodb.UpdateEnvData();
    },
}

module.exports = scheduleCaptureController;

