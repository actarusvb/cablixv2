
let express = require("express");
let router = express.Router();
let mongoUtil = require( '../mongoUtil' );
// let config = require('config');
let ejs=require('ejs');
let path = require('path');
let sqlite3Util = require( '../sqlite3Util' );
let https = require('https');


router.get("/json/field/:field/:val",async (req, res) => {
	console.log("/json/field/:field/:val %s :: %s | %s",req.baseUrl,req.params.field,req.params.val);
	var result=new Object();
	
	if(req.params.field === 'newusername'){
		var db = mongoUtil.getDb();
		db.collection( global.cfg.cabUsers).find({username: req.params.val}).toArray(function(err, resx) {
			if( resx.length > 0 && resx[0] && resx[0].cabId){
				result.errno=-1;
				result.message='duplicate';
				res.json(result);
				res.end();
			}else{
				result.errno=0;
				result.message='OK';
				res.json(result);
				res.end();
			}
		});
	}else if(req.params.field === 'activationCode'){
		var db = sqlite3Util.getDb();
		var params = [];

		var p1= new Promise((resolve,reject)=> {
			db.all("SELECT size,domain FROM adder where uuid='"+req.params.val+"' ", params, (err, rows) => {
				if (err) {
					res.status(400).json({"error":err.message});
					res.end();
					return;
				}
				resolve(rows[0]);
			});
		});
		Promise.all([p1]).then(rows => {	
			console.log(rows);
			if(typeof rows === 'undefined' || rows == ''){
				result.message="not found";
				result.errno=-1;
				console.log(result);
			}else{
				if(rows[0].size > 0 && rows[0].domain ){
					result.message="Warm already used";
					result.errno=0;
				}else if(rows[0].size >0 ){ 
					result.errno=0;
					result.message="ok valid";
				} else {
					console.log("%s %s",rows[0].size,rows[0].domain);
					result.errno=0;
					result.message="ok boh";
				}
			}
			console.log(result);
			res.json(result);
			res.end();
		});
	}else{
		result.errno=-3;
		result.message='unknow field';
		res.json(result);		
	}
});

module.exports = router;
