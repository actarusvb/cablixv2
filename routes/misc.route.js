
const sqlite3Util = require( '../sqlite3Util' );
const express = require("express");
const router = express.Router();
const uuid4 = require("uuid4");

// #################################################################################################################################

router.post("/json/data/add",async (req,res) => {
	console.log("/json/data/add post");
	
	var result=new Object();

	result.errno=-1;
	result.message='not done';
	
	if(addValueLux(req.body)){
		result.errno=0;
		result.message='added :';
	}else{
		result.errno=-4;
		result.message='error';
	}
	res.json(result);			
});
router.get("/uuid",function(req,res){		
	var result=new Object();
	result.retvalue=1;
	result.retstring='OK - data';
	result.uuid=uuid4();	
	res.json(result)
});
function addValueLux(req){
	var db = sqlite3Util.getDb();
	var params = [];
	var sql="insert into samples (received_time,take_time,uuid,longitude,latitude,altitude,lux) "
	+ "values( datetime('now'),'"+req.take_time+"','"+req.uuid+"',"+req.longitude+","+req.latitude+","+req.altitude+","+req.lux+")";
	
	console.log("FUNCT %s",sql);
	db.run(sql, params, function(err) {
		if (err) {
			console.error(err.message);
			return 0;
		}
	});
	sqlite3Util.closeDb();
	return 1;	
}
module.exports = router;
