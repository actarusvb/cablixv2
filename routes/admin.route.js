const MA = require('../middleware/myAuth');
// const config = require('config');
const express = require("express");
const router = express.Router();
var mongoUtil = require( '../mongoUtil' );
var sqlite3Util = require( '../sqlite3Util' );
const ObjectID = require('mongodb').ObjectID;

// C R U D
router.post("/C"			,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/C requested user ",req.body.username);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(global.cfg.cabUsers);
	col.find({"username" : req.body.username}).toArray(function (err,qresult){
		if (err) {
			throw err;
		}
		if(  qresult.length > 0){
			console.log("user %s exist",req.body.username);
			res.json({"retcode": -1,retomsg: "ko- userExist"});
		}else{
			// let datax=req.body;
			var colCount=db.collection(global.cfg.counters);
			colCount.findOneAndUpdate( 
				{_id: 'userid'},
				{ $inc: { seq : 1 } },
				{new: true},
				function(err,doc){
					col.insertOne({username: req.body.username,cabId: doc.value.seq, dataset: [],rbac: {} }, function(err, resk) {
						if (err) throw err;
						console.log("1 document inserted %o",resk);
						result.retcode=1;
						result.retomsg= "ok- np";
						res.json(result);
					});
				}
			);
		}
	});
});
router.get("/R/:id"			,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/R requested one user %s",req.params.id);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	
	var db = mongoUtil.getDb();
	var col=db.collection(global.cfg.cabUsers);
		
	col.find({$or : [{"_id" : req.params.id},{"username" : req.params.id}]}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result={"retcode": 1,retomsg: "ok-data"};
		result.data=qresult;
		res.json(result);
	});
	mongoUtil.closeDb();
});
router.get("/R"				,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/R requested all user ");
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	var db = mongoUtil.getDb();
	var col=db.collection(global.cfg.cabUsers);
		
	col.find({}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result={"retcode": 1,retomsg: "ok-data"};
		result.data=qresult;
		res.json(result);
	});
	mongoUtil.closeDb();
});
router.post("/U/:username"	,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/U/:%s post for %s",req.params.username,req.body._id);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	
	var newData=req.body;
	newData._id=new ObjectID(newData._id);
	var db = mongoUtil.getDb();
	var col=db.collection(global.cfg.cabUsers);
	console.log("newData %o:",newData);
	col.updateOne({"_id" : newData._id }, {$set : newData}, function(err, resp) {
		if (err) throw err;
		console.log("1 document updated");
		result.retcode= 1;
		result.retomsg= "ok- np";
		res.json(result);
	});
	mongoUtil.closeDb();
});
router.post("/D/:id"		,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/D/:%s",req.params.id);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(cabUsers);
	let id=new ObjectID(req.params.id);
	col.deleteOne({"_id" : id },function(err, resp) {
		if (err) throw err;
		console.log("1 document deleted");
		result={"retcode": 1,retomsg: "ok- np"}
		res.json(result);
	});
	mongoUtil.closeDb();
});
router.get("/RD/customerTable",(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/RD/customerTable",req.params.id);
	
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	var db = mongoUtil.getDb();
	var col=db.collection(global.cfg.cabCustomers);
		
	col.find({}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result={"retcode": 1,retomsg: "ok-data"};
		result.data=qresult;
		res.json(result);
	});
	mongoUtil.closeDb();

});
router.get("/Rd/license/summary/lastid",async (req, res) => {
	// MA.ckLogin,
	console.log("/Rd/license/summary requested license summary");
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	var db = sqlite3Util.getDb();

	var params = [];
	db.serialize(function(){

		db.all("SELECT MAX(id) as ids FROM adder", params, (err, rows) => {
			if (err) {
				res.status(400).json({"error":err.message});
				return;
			}
			result.retcode=1;
			result.retomsg="ok-data";
			result.license=rows[0].ids;
		});
		db.all("SELECT distinct size AS sizes FROM adder", params, (err, rows) => {
			if (err) {
				res.status(400).json({"error":err.message});
				return;
			}
			result.listOfLicense=rows;
			res.json(result);
		});
	});
	sqlite3Util.closeDb();
});
router.get("/Rd/license/summary/statLicense/:tlic"
							,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/Rd/license/summary/statLicense/:tlic %s summary",req.params.tlic);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	result.retcode=1;
	result.retomsg="ok-data";
	
	var db = sqlite3Util.getDb();
	
	var params = [];
	db.serialize(function(){
		db.all("SELECT count(id) AS free FROM adder where burn is NULL and size="+req.params.tlic, params, (err, rows) => {
			if (err) {
				res.status(400).json({"error":err.message});
				return;
			}
			result.listOfLicenseFree=rows[0];
			// console.log("out %o",rows[0])
		});
		// db.all("SELECT count(id) AS inuse FROM adder where burn is not NULL and size="+req.params.tlic, params, (err, rows) => {
		db.all("SELECT count(id) AS tutti FROM adder where size="+req.params.tlic, params, (err, rows) => {
			if (err) {
				res.status(400).json({"error":err.message});
				return;
			}
			result.listOfLicenseInuse=rows[0];
			res.json(result);
		});
	});
	sqlite3Util.closeDb();
});
router.get("/Rd/dataset/summary", (r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/Rd/dataset/summary summary");
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	
	result.collections=[];
	var db = mongoUtil.getDb();
	db.listCollections()
		.toArray().then(cols => {
			var p=[];var n=[];
			cols.forEach(function(colla){
				if( ! colla.name.startsWith("_") && colla.name !=="system.js"){
					n.push(colla.name);
					p.push(db.collection(colla.name).countDocuments({"type":"RACK"}));
				}
			});
			result.collectionsName=n;
			Promise.all(p).then(datax => {
				result.collections=datax;
				result.retcode=1;
				result.retomsg="ok-data";
				res.json(result);
			});
		
	});
	mongoUtil.closeDb();
});
router.get("/Rd/dataset/:dataset",(r,b,n) => {MA.ckLoginNrole(r,b,n,'treeRead');},async (req, res) => {
	console.log("/Rd/dataset/dataset %s",req.params.dataset);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	
	result.liceseStat={};
	var dbmongo = mongoUtil.getDb();
	var dbsql = sqlite3Util.getDb();
	
	var params = [];
	var p1= new Promise((resolve,reject)=> {
		dbsql.all('SELECT IFNULL(sum(size),0) AS license FROM adder where domain ="'+req.params.dataset+'"', params, (err, rows) => {
			if (err) {
				res.status(400).json({"error":err.message});
				return;
			}
			console.log("RD dataset sql %o",rows);
			resolve(rows[0]);
		});
	});	
	var p2= new Promise((resolve,reject)=> {
		dbmongo.collection(req.params.dataset).countDocuments({"type":"RACK"},function(err,data){
			if (err) {
				res.status(400).json({"error":err.message});
				return;
			}
			console.log("RD dataset mongo %o",data);
			resolve(data);
		});
	});
	Promise.all([p1,p2]).then(values => {
		console.log("moh _ %o",values);
		result.licensedRack=values[0].license;
		result.usedLicenseCounted=values[1];
		result.retcode=1;
		result.retomsg="ok-data";
		res.json(result);
	});
	mongoUtil.closeDb();
});
router.get("/Rd/license/all",(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/Rd/license/all");
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	result.retcode=1;
	result.retomsg="ok-data";
	
	var db = sqlite3Util.getDb();
	
	var params = [];
	db.serialize(function(){
		db.all("SELECT * FROM adder", params, (err, rows) => {
			if (err) {
				res.status(400).json({"error":err.message});
				return;
			}
			result.data=rows;
			res.json(result);
		});
	});
	sqlite3Util.closeDb();
});
router.post("/Wr/license"	,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/Wr/license %s dataset %s",req.body.adderAuthCode,req.body.dataset);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	result.retcode=1;
	result.retomsg="ok-data";
	
	var db = sqlite3Util.getDb();
	// var params = ['Ansi C', 'C'];
	var params = [];
	var sql="update adder set domain = '"+req.body.dataset+"',burn = datetime('now'), burname='"+result.auth.username+"' where uuid='"+req.body.adderAuthCode+"' and domain is NULL and burn is NULL";
	
	console.log("FUNCT %s",sql);
	db.run(sql, params, function(err) {
		if (err) {
			console.error(err.message);
			res.status(400).json({"error":err.message});
			return console.error(err.message);
		}
		console.log(`Row(s) updated: ${this.changes}`);
		console.log("Row(s) updated: %o",this);
		result.data=this.changes;
		res.json(result);
	});
	sqlite3Util.closeDb();
});
router.get("/LC"			,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/LC requested all collections");
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	var db = mongoUtil.getDb();
	db.listCollections().toArray(function(err, qresult) {
		if (err) {
			throw err;
		}
		result={"retcode": 1,retomsg: "ok-data"};
		result.data=qresult;
		res.json(result);
	});
});
router.get("/CK/:dataset"			,(r,b,n) => {MA.ckLoginNrole(r,b,n,'isAdmin');},async (req, res) => {
	console.log("/admin/CK/:dataset ck if %s exist",req.params.dataset);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	var db = mongoUtil.getDb();
	db.listCollections({name: req.params.dataset})
    .next(function(err, collinfo) {
        if (collinfo) {
			result.retcode=1;
			result.retomsg="ok-data";
			result.dataset=req.params.dataset;
			res.json(result);
        }else{
			result.retcode=1;
			result.retomsg="ok-data";
			result.dataset='';
			res.json(result);
		}
    });
});
module.exports = router;
