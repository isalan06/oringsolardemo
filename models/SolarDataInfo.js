const { DATE } = require("mysql/lib/protocol/constants/types");

var SolarData1 = [];
var SolarEnv1 = [];

const SolarDataOP = {
    Initialize_Customer1: () => {
        console.log(new Date());
        for(var i=0;i<3;i++){
            for(var j=0;j<30;j++){
                let data_template ={
                    'csutomer_id': 1,
                    'main_location': 1,
                    'sub_location': 1,
                    'area_location': i+1,
                    'inverter_id': j+1,
                    'refresh': false,
                    'timestamp': '2000-01-01T00:00:00.000Z',
                    'total_energy_10Wh': 0,
                    'total_runtime_s': 0,
                    'life_energy_10Wh': 0,
                    'life_runtime_s': 0,
                    'ambient_temp_c': 0,
                    'boost1_temp_c': 0,
                    'boost2_temp_c': 0,
                    'day0_Wh': 0,
                    'inverter_state': 0, // 0:Standby 1:CountDown 2:On 3:No DC 4:Alarm 8:Check PV Power
                    'month0_Wh': 0,
                    'inverter_temp': 0,
                    'input_dc_total_power_w': 0,
                    'output_ac_total_power_w': 0,
                    'output1_ac_voltage_V': 0,
                    'output1_ac_current_A': 0,
                    'output1_ac_wattage_W': 0,
                    'output1_ac_freqency_Hz': 0,
                    'output2_ac_voltage_V': 0,
                    'output2_ac_current_A': 0,
                    'output2_ac_wattage_W': 0,
                    'output2_ac_freqency_Hz': 0,
                    'output3_ac_voltage_V': 0,
                    'output3_ac_current_A': 0,
                    'output3_ac_wattage_W': 0,
                    'output3_ac_freqency_Hz': 0,
                    'output1_ac_voltage_line_V': 0,
                    'output2_ac_voltage_line_V': 0,
                    'output3_ac_voltage_line_V': 0,
                    'total_apparent_power_W': 0,
                    'apparent_power_1_W': 0,
                    'apparent_power_2_W': 0,
                    'apparent_power_3_W': 0,
                };
                SolarData1.push(data_template);
            }
            let env_template ={
                'csutomer_id': 1,
                'main_location': 1,
                'sub_location': 1,
                'area_location': i+1,
                'refresh': false,
                'timestamp': '2000-01-01T00:00:00.000Z',
                'py': 0,
                'py_min': 0,
                'py_max': 0,
                'temperature': 0,
                'temperature_min': 0,
                'temperature_max': 0,
            }
            SolarEnv1.push(env_template);
        }
        
    },
    TransferJSONData: (index, data) => {
        if(data.data != null){
            var dataLength = data.data.length;
            console.log(dataLength);
            var currentDateTime = new Date().getTime();
            var correctDataCount = 0;
            for(var i=0;i<dataLength;i++){
                var idStrings = data.data[i].id.replace("GW", "").split("_");
                var gw_index = parseInt(idStrings[0])-1;
                var column_index = parseInt(idStrings[1]);
                var searchIndex = index * 30 + gw_index;
                if((data.data[i].value != null) && (data.data[i].timestamp != null)){
                    var record_timestamp = new Date(data.data[i].timestamp).getTime();
                    var intervaltime = currentDateTime - record_timestamp;
                    if(intervaltime < 7200000) {
                        var refreshTag = false;
                        var refreshTag2 = false;
                        correctDataCount++;
                        if(column_index == 31071) { SolarData1[searchIndex].total_energy_10Wh = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31073) { SolarData1[searchIndex].total_runtime_s = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31075) { SolarData1[searchIndex].life_energy_10Wh = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31077) { SolarData1[searchIndex].life_runtime_s = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31047) { SolarData1[searchIndex].inverter_state = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31079) { SolarData1[searchIndex].ambient_temp_c = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31080) { SolarData1[searchIndex].boost1_temp_c = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31081) { SolarData1[searchIndex].boost2_temp_c = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 32047) { SolarData1[searchIndex].day0_Wh = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 32111) { SolarData1[searchIndex].inverter_temp = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 31082) { SolarData1[searchIndex].month0_Wh = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 345055) { SolarData1[searchIndex].input_dc_total_power_w = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349151) { SolarData1[searchIndex].output_ac_total_power_w = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349152) { SolarData1[searchIndex].output1_ac_voltage_V = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349153) { SolarData1[searchIndex].output1_ac_current_A = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349154) { SolarData1[searchIndex].output1_ac_wattage_W = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349155) { SolarData1[searchIndex].output1_ac_freqency_Hz = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349156) { SolarData1[searchIndex].output2_ac_voltage_V = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349157) { SolarData1[searchIndex].output2_ac_current_A = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349158) { SolarData1[searchIndex].output2_ac_wattage_W = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349159) { SolarData1[searchIndex].output2_ac_freqency_Hz = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349160) { SolarData1[searchIndex].output3_ac_voltage_V = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349161) { SolarData1[searchIndex].output3_ac_current_A = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349162) { SolarData1[searchIndex].output3_ac_wattage_W = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349163) { SolarData1[searchIndex].output3_ac_freqency_Hz = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349178) { SolarData1[searchIndex].output1_ac_voltage_line_V = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349179) { SolarData1[searchIndex].output2_ac_voltage_line_V = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349180) { SolarData1[searchIndex].output3_ac_voltage_line_V = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349200) { SolarData1[searchIndex].total_apparent_power_W = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349202) { SolarData1[searchIndex].apparent_power_1_W = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349203) { SolarData1[searchIndex].apparent_power_2_W = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(column_index == 349204) { SolarData1[searchIndex].apparent_power_3_W = data.data[i].value; SolarData1[searchIndex].refresh = true; refreshTag = true;}
                        if(data.data[i].id == 'GW101_000000') { SolarEnv1[index].py = data.data[i].value; SolarEnv1[index].refresh = true; refreshTag2 = true; }
                        if(data.data[i].id == 'GW101_000001') { SolarEnv1[index].py_min = data.data[i].value; SolarEnv1[index].refresh = true; refreshTag2 = true; }
                        if(data.data[i].id == 'GW101_000002') { SolarEnv1[index].py_max = data.data[i].value; SolarEnv1[index].refresh = true; refreshTag2 = true; }
                        if(data.data[i].id == 'GW102_000000') { SolarEnv1[index].temperature = data.data[i].value; SolarEnv1[index].refresh = true; refreshTag2 = true; }
                        if(data.data[i].id == 'GW102_000001') { SolarEnv1[index].temperature_min = data.data[i].value; SolarEnv1[index].refresh = true; refreshTag2 = true; }
                        if(data.data[i].id == 'GW102_000002') { SolarEnv1[index].temperature_max = data.data[i].value; SolarEnv1[index].refresh = true; refreshTag2 = true; }
                        if(refreshTag) {
                            var columntime = new Date(SolarData1[searchIndex].timestamp).getTime();
                            if(record_timestamp > columntime){SolarData1[searchIndex].timestamp = data.data[i].timestamp;}
                        }
                        if(refreshTag2) {
                            var columntime = new Date(SolarEnv1[index].timestamp).getTime();
                            if(record_timestamp > columntime){SolarEnv1[index].timestamp = data.data[i].timestamp;}
                        }
                    }
                    
                }

                
            }
            console.log(correctDataCount);
            //console.log(SolarData1);
        }
    },
    Get_Customer1: () => {
        return SolarData1;
    },
    Reset_Customer1_Refresh: (index) => {
        SolarData1[index].refresh = false;
    },
    Get_Env1: () => {
        return SolarEnv1;
    },
    Reset_Env1_Refresh: (index) => {
        SolarEnv1[index].refresh = false;
    },
}

module.exports = SolarDataOP;