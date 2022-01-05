
// const config = require('config');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
var _sqlDb;

module.exports = {
	connectToServer: function (callback){
		console.log(__dirname);
		
		const dbPath = path.resolve(__dirname,global.cfg.sqliteCabDb)
		var db = new sqlite3.Database(dbPath);
		console.log(db);
		
		_sqlDb = new sqlite3.Database(db.filename, (err) => {
			if (err) {
				console.error(err.message + " fail-connect to database: "+global.cfg.sqliteCabDb );
				result={"retcode": -1,retomsg: "fail-connect to database: "+global.cfg.sqliteCabDb};
			}
			return callback( err );
		});
	},
	getDb: function(dbname) {
		return _sqlDb;
	},
	closeDb: function(){
		 // mongoClient.close();
	}
};

