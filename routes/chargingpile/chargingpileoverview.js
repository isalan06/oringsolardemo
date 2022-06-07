const mysql = require('mysql');
var DBConfig = require('../../config/DBConfig');

var finallyFlag = false;
var overviewData = {}
var index_x = 0;
var index_x_number = 0;
var index_y = 0;
var index_y_number = 0;
var connectorDataBuffer = 0;

const ChargingPileOverview = (req, res) =>{
    res.setTimeout(60000);

    console.log('ChargingPileOverview');

    var commandString = 'SELECT `charge_box_pk`,`charge_box_id`,TIMESTAMPDIFF(MINUTE,`last_heartbeat_timestamp`, NOW()) AS LastIntervalMinutes, (TIMESTAMPDIFF(MINUTE,`last_heartbeat_timestamp`, NOW()) < 5) AS ConnectedStatus  FROM `charge_box` WHERE 1;';
	
    overviewData['Title']='Charge Box Information';
    overviewData['ChargeBox']=[];
    overviewData['Index']=0;

	const conn = new mysql.createConnection(DBConfig.DBConfig_ocpp);
	conn.connect(  function(err){
        if(err){ conn.end(); res.send('Connect DB Error');
	  	}
	  	else {
			conn.query(commandString, function(err, rows){
				if(err) { conn.end(); res.send('Get Data Error'); }
			  	else{
                    if(rows.length > 0){
                        rows.forEach( (row) => {
                            var chargeboxinfo = {};
                            chargeboxinfo['charge_box_pk']=row['charge_box_pk'];
                            chargeboxinfo['charge_box_id']=row['charge_box_id'];
                            chargeboxinfo['LastIntervalMinutes'] = row['LastIntervalMinutes'];
                            chargeboxinfo['ConnectedStatus'] = row['ConnectedStatus'];
                            chargeboxinfo['Connector']=[];
                            overviewData['ChargeBox'].push(chargeboxinfo);
                        });

                        index_x_number = overviewData['ChargeBox'].length;
                        overviewData['ChargeBox'].forEach((data) => {
                            commandString = 'SELECT * FROM (SELECT B.connector_pk As connector_pk, B.charge_box_id As charge_box_id, B.connector_id, A.`status_timestamp`, A.`status`, A.`error_code` AS error_code FROM `connector` AS B LEFT JOIN (SELECT * FROM `connector_status` newtable WHERE (`status_timestamp`=(SELECT MAX(`status_timestamp`) FROM `connector_status` WHERE `connector_pk`=newtable.connector_pk))) AS A ON B.connector_pk = A.connector_pk) AS jointable WHERE charge_box_id=\'' + data['charge_box_id'] + '\';';
                            overviewData['Index'] = 0;
                            conn.query(commandString, function(err, rows){
                                if(err) { conn.end(); res.send('Get Data Error'); }
                                else{
                                    rows.forEach((data) => {
                                        var connectorData = {};
                                        connectorData['connector_pk'] = data['connector_pk'];
                                        connectorData['connector_id'] = data['connector_id'];
                                        connectorData['status'] = data['status'];
                                        connectorData['error_code'] = data['error_code'];
                                        overviewData['ChargeBox'][overviewData['Index']]['Connector'].push(connectorData);
                                        overviewData['Index'] = overviewData['Index'] + 1;
                                    
                                    });

                                    if(overviewData['Index'] >= overviewData['ChargeBox'].length){
                                        var chargingpilenumber = index_x_number;
                                        var offlinenumber = 0;
                                        overviewData['ChargeBox'].forEach( (data) => {
                                            if(data['ConnectedStatus'] == 0) {
                                                offlinenumber++;
                                            } else {

                                            }
                                        });

                                        conn.end();
                                        console.log(overviewData);
                                        console.log(overviewData['ChargeBox'][0]['Connector'][0]);
                                        console.log(overviewData['ChargeBox'][1]['Connector'][0]);
                                        console.log('Overview Finished');
                                        //res.send('Overview');
                                        res.render('chargingpileoverview', {
                                            title: 'Charging Pile - Overview',
                                            setChargingPileData: overviewData,
                                            setChargingPileNumber: chargingpilenumber,
                                            setOfflineNumber: offlinenumber,
                                          });
                                    }
                                }   
                            });
                        });

                    }
                    //console.log(overviewData);                
                }               
            });

            

            
        }

        console.log('Page Finished');
        //res.send('Overview');
                
    });

    console.log('Function Finished');
}

module.exports=ChargingPileOverview