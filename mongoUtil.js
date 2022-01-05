
// const config = require('config');
const mongoClientA = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

var _db,mongoClient;

module.exports = {
	connectToServer: function (callback){
		mongoClient=mongoClientA.connect('mongodb://'+global.cfg.mongoUser+':'+global.cfg.mongoPass+'@'+ global.cfg.mongoHost+'/'+global.cfg.mongoDbName,{ useNewUrlParser: true, useUnifiedTopology: true }
			,function( err, client ) {
				if(err){
					console.log("ongoUtils fail in connect: %s WITH: %s",err,global.cfg.mongoUser+':'+global.cfg.mongoPass+'/'+global.cfg.mongoDbName);
				}
				mongoClient=client;
				_db  = client.db(global.cfg.mongoDbName);
				return callback( err );
			} 
		);
	},

	getDb: function() {
		return _db;
	},
	closeDb: function(){
		 // db.close();
	}
};
