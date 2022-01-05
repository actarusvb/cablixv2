let express = require("express");
let router = express.Router();
let mongoUtil = require( '../mongoUtil' );
// let config = require('config');
let ejs=require('ejs');
let path = require('path');
let sqlite3Util = require( '../sqlite3Util' );
// const https = require('https');
const uuid4 = require("uuid4");

router.post("/json/user/add",async (req,res) => {
	console.log("/json/user/add post");
	var result=new Object();

	checkNewUserData(req.body).then(function(resultF) {

		console.log(resultF);
		if(resultF[0] && resultF[1] && resultF[3] >= 0){ 
			if(resultF[3] === 0)
				createPopulateCollection(req.body,resultF);
			addUser(req.body,resultF);
			result.errno=0;
			result.message='created : '+resultF[3];
		}else{
			result.errno=-4;
			result.message='refused';
		}
		res.json(result);			
	}).catch(function(err) {
		console.log(err);
		result.errno=-1;
		result.message='Error catched';
		res.json(result);			
	});
});
function createPopulateCollection(req,check){
	var db = mongoUtil.getDb();
	db.createCollection(check[2], function(err, res) {
		if (err) throw err;
		console.log("Collection %s created!",check[2]);
		var db = mongoUtil.getDb();
		var col=db.collection(check[2]);
		col.insertOne({type: 'dataset',pid: 'self',lid: req.newdataset},function(err, resk) {
			if (err) throw err;
			console.log("document inserted %o",resk);
		});
		// col.insertOne({type: 'SITE',pid: 'root',name : req.newdataset+'M', lid: req.newdataset+'M',label: req.newdataset, value : req.newdataset},function(err, resk) {
			// if (err) throw err;
			// console.log("document inserted %o",resk);
		// });
		var db = sqlite3Util.getDb();
		var params = [];
		var sql="update adder set domain = '"+check[2]+"',burn = datetime('now'), burname='"+req.newusername+"' where uuid='"+req.activationCode+"' and domain is NULL and burn is NULL";
		
		console.log("FUNCT %s",sql);
		db.run(sql, params, function(err) {
			if (err) {
				console.error(err.message);
			}
		});
		sqlite3Util.closeDb();	
	});
}
function addUser(req,check){	
	var domain = check[2];
	var db = mongoUtil.getDb();
	var col=db.collection(global.cfg.cabUsers);
	var colCount=db.collection(global.cfg.counters);
	colCount.findOneAndUpdate( 
		{_id: 'userid'},
		{ $inc: { seq : 1 } },
		{new: true},
		function(err,doc){
			col.insertOne(
				{
					username: req.newusername,
					cabId: doc.value.seq,
					password: req.newpass1,
					dataset: [
						domain
						],
					rbac: {
						[domain] : ["treeWrite","treeRead","rackWrite","rackRead","patchWrite","patchRead"]
					},
					preference: { patchtLabelForm : 2 }
				}, function(err, resk) {
				if (err) throw err;
				console.log("1 document inserted");
			});
		}
	);
}
function checkNewUserData(body){
	return Promise.all([p1(body),p2(body),p3(body),p4(body)]).then(function(resultP){	
		console.log("Grand exit %o",resultP);
		resultP.errno=0;
		resultP.message='ok';
		return resultP;
	});
}
function p1(bodyIn){
	var db = mongoUtil.getDb();
	return new Promise ( (resolve, reject) => {
		db.collection( global.cfg.cabUsers).find({username: bodyIn.newusername}).toArray(function(err, resx) {
			if( resx.length > 0 && resx[0] && resx[0].cabId){
				resolve (false);
			}else{
				resolve( true);
			}
		});
	});
}
function p2(bodyIn){
	if( bodyIn.newpass1 === bodyIn.newpass2 ){
		return(isStrongPwd(bodyIn.newpass1,global.cfg.passwordMinLength));
	}
	return (false);
}
function p3(bodyIn){
	return new Promise ( (resolve, reject) => {
		resolve(uuid4());
	});
}
function p4(bodyIn){
	return new Promise ( (resolve, reject) => {
		var db = sqlite3Util.getDb();
		var params = [];

		var pr= new Promise((resolveP,reject)=> {
			db.all("SELECT size,domain FROM adder where uuid='"+bodyIn.activationCode+"' ", params, (err, rows) => {
				if (err) {
					res.status(400).json({"error":err.message});
					res.end();
					return;
				}
				resolveP(rows[0]);
			});
		});
		Promise.all([pr]).then(rows => {	
			console.log(rows);
			if(typeof rows === 'undefined' || rows == ''){
				resolve(-1);
			}else{
				if(rows[0].size > 0 && rows[0].domain ){
					result.message="Warm already used";
					resolve(1);
				}else if(rows[0].size >0 ){ 
					resolve(0);
				} else {
					console.log("%s %s",rows[0].size,rows[0].domain);
					resolve(-2);
				}
			}
		});
	});
}
function isStrongPwd(password,minLength) {
	var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var lowercase = "abcdefghijklmnopqrstuvwxyz";
	var digits = "0123456789";
	var splChars ="!@#$%&*()";
	var ucaseFlag = contains(password, uppercase);
	var lcaseFlag = contains(password, lowercase);
	var digitsFlag = contains(password, digits);
	var splCharsFlag = contains(password, splChars);

	if(password.length>= minLength && ucaseFlag && lcaseFlag && digitsFlag && splCharsFlag)
		return true;
	else
		return false;
}
function contains(password, allowedChars) {
	for (i = 0; i < password.length; i++) {
			var char = password.charAt(i);
			 if (allowedChars.indexOf(char) >= 0) { return true; }
		 }
	 return false;
}
module.exports = router;
