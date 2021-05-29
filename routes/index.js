var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var Chart = require('chart.js');

var config =
	{
		host: '34.80.153.164',
		user: 'root',
		password: '!QAZxsw2',
		database: 'Solar_DB',
		port: 3306
	};

var online_count = 0;
var total_count = 0;
var today_energy = 0.0;

//const conn = new mysql.createConnection(config);

/* GET home page. */
router.get('/', function(req, res) { //, next) {
  //res.render('index', { title: 'Express' });
  res.render('login', {
  	title: 'Oring Solar Demo',
	  showMessage: ''
  });
});

router.get('/Test', function(req, res){
  res.send('API Test 2');
});

router.post('/PostTest', function(req, res){
  res.send('POST Test');
});
router.post('/PostTest2', function(req, res){
  res.send('POST Test 2');
});

router.get('/Information', function(req, res){
	res.render('information', {
		title: 'Oring Solar Demo - Information'
	});
});
router.post('/Information', function(req, res){
	res.render('information', {
		title: 'Oring Solar Demo - Information'
	});
});
router.get('/History', function(req, res){
	res.render('history', {
		title: 'Oring Solar Demo - History',
		setchart: false
	});
});
router.get('/History2?Type=:type', function(req, res){
	res.send('History2')
});
router.get('/Summary', function(req, res){
	online_count = 0;
	total_count = 0;
	today_energy = 0.0;

	let data1, data2, data3;
	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
	  	if(err){
			conn.end();
			res.send('Connect DB Error');
			}
		else
		{
		  	conn.query('CALL pro_get_summary();', function(err, rows){
			  	if(err) res.send('Get Data Error');
				else{
					rows[0].forEach( (row) => {
						var online = row['Online'];
						var energy = row['today_energy'];
						if(online === 1) {
							online_count++;
							today_energy += energy
						}
						total_count++;
						
						}
					);
				
					conn.end();

					data1 = online_count;
					data2 = total_count;
					data3 = today_energy / 100.0;

					res.render('summary', {
						title: 'Oring Solar Demo - Summary',
						i_online_count: data1,
						i_total_count: data2,
						i_today_energy: data3,
						i_data: rows
					  });
					}
			  	});
			}
	    }
  	);
	
	
});
router.post('/Summary' , function(req, res){

	var data = [];
	const conn = new mysql.createConnection(config);
	conn.connect(  function(err){
	  	if(err){
			conn.end();
			res.send('Connect DB Error');
			}
		else
		{
		  	conn.query('CALL pro_get_summary();', function(err, rows){
			  	if(err) res.send('Get Data Error');
				else{
					rows[0].forEach( (row) => {
						var online = Number(row['Online']);
						var energy = Number(row['today_energy']);
						data.push(row);
						if(online === 1) {
							online_count++;
							today_energy += energy
						}
						total_count++;
						
						}
					);
				
					conn.end();
					res.send('Get Data Success' + total_count + " - " + online_count + " - " + today_energy + " : " + rows);
					//SetData(online_count, total_count, today_energy);
					}
			  	});
				
			}
	    }
  	);

	  //res.send('Get Data Success' + total_count + " - " + online_count + " - " + today_energy + " : " + data);  
	/*res.render('summary', {
		title: 'Oring Solar Demo - Summary'
	  });*/
});

function SetData(setonelinecount, settotalcount, settodayenergy){
	online_count = setonelinecount;
	total_count = settotalcount;
	today_energy = settodayenergy;
}

router.post('/CheckUser', function(req, res){
  var organ = req.body['txtOrgan'],
  	user = req.body['txtUser'],
	pass = req.body['txtPass'];
  if( organ === 'Test' && user === 'Test' && pass === 'Test'){
	res.redirect('/summary');
  }
  else{
    //res.send('Check User Failure');
    	res.render('login', {
		title: 'ORing Solar Demo',
		showMessage: '身分驗證錯誤'
	});
  }

});

router.get('/TestDB', function(req, res){
  const conn = new mysql.createConnection(config);
	conn.connect(
	  function(err){
	  	if(err){
			conn.end();
			res.send('Connect DB Error');
		}
		else
		{
		  //conn.query('SELECT * FROM table_solar_current',
		  conn.query('CALL pro_get_summary();',
			  function(err, rows){
			  	if(err) res.send('Get Data Error');
				else{
					var length = Object.keys(rows).length;
					var resultString = 'Selected ' + length + ' row(s)\n';
					rows[0].forEach( (row) => {
						resultString += row['inverter_id'];
						resultString += " - ";
						resultString += JSON.stringify(row);
					}
					);
				
					conn.end();
					res.send(resultString);
				}
			  });
		  
		}
	  }
  );
});

function readData()
{
  var  returnString = 'Connect DB Success2';

  conn.query('SELECT * from table_solar_current',
	  function(err, results){
	    if(err) returnString = 'Get Data Error';
	    else {
	      returnString = 'Selectd ' + results.length + ' row(s)';
	    }
		 
	  }
  );
  //returnString = 'ABC';
  return returnString;
};

module.exports = router;
