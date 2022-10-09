const DBConfig = {
    DBConfig: {
        host: '127.0.0.1',
		user: 'root',
		password: '12345678',
		database: 'solar_db',
		port:  3306
    },
    DBConfig_test: {
        host: 'isalan06.asuscomm.com',
	    user: 'root',
	    password: '12345678',
	    database: 'solar_db',
	    port:  13306
    },
    DBConfig_ocpp: {
        host: 'localhost',
	    user: 'ocpp',
	    password: 'ocpp',
	    database: 'stevedb',
	    port:  3306
    },
	DBConfig_gateway:{
		host: '211.75.141.1',
		user: 'root',
		password: '12345678',
		database: 'gateway',
		port: 43306
	},
	DBConfig_gateway_Remote:{
		host: '211.75.141.1',
		user: 'root',
		password: '12345678',
		database: 'gateway',
		port: 43306
	},
    
}

module.exports=DBConfig