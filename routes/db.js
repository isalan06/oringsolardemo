var mysql   = require('mysql');
var connection = mysql.createConnection({
    host: 'isalan06.asuscomm.com',
	user: 'alan',
	password: '12345678',
	database: 'solar_db',
	port:  13306
});

module.exports = connection;