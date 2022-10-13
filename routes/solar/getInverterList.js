const getAllInvertersInformation = require('../../controllers/solar/getAllInvertersInformation');

const getInverterList=(req, res)=>{
    var inputData = req.body;

    getAllInvertersInformation((outputData)=>{
        getHistoryEnergyImplement(res, outputData);
    });


    function getHistoryEnergyImplement(res, outputData){
        res.send(JSON.stringify(outputData));
    }
}

module.exports=getInverterList;