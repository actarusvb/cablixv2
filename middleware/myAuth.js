// const config = require('config');
const jwt = require('jsonwebtoken');
const uuid4 = require("uuid4");
var mongoUtil = require( '../mongoUtil' );
var Userblock = new Object();
var privateuuid=uuid4();
	
module.exports = {
	myLogin
	,ckLogin
	,ckLoginNrole
	,Userblock
	,changePass
};
async function myLogin(req,res,next ) {
	console.log("Login attempt for %s & pass %s",req.body.username,req.body.password);
	var db = mongoUtil.getDb();
	db.collection( global.cfg.cabUsers).find({username: req.body.username, password: req.body.password}).toArray(function(err, result) {
		if (err) {
		  throw err;
		}
		// console.log("myLogin result %o",result);
		if( result.length > 0 && result.length < 2 && result[0] && result[0].cabId){			
			Userblock.id=result[0].cabId;
			Userblock.username =req.body.username;
			Userblock.isAdmin =result[0].isAdmin;
			Userblock.role=result[0].rbac;
			Userblock.dataset = result[0].dataset;
			Userblock.patchtLabelForm =result[0].preference.patchtLabelForm;
			Userblock.token = jwt.sign({ id: Userblock.id, role: Userblock.role, isAdmin: Userblock.isAdmin }, privateuuid);
			Userblock.msg = 'username & password OK!';
			Userblock.errno=0;
			next();
		}else{
			// Userblock= new Object();
			Userblock.msg = 'wrong username or password ';
			Userblock.errno=-1;
			Userblock.token='';
			var resx = new Object();
			// resx.auth = Userblock;
			console.log("Login Failed for %s & pass %s",req.body.username,req.body.password);
			resx.auth = JSON.parse(JSON.stringify(Userblock));

			res.json(resx);
		}
	});
}
async function ckLogin(req,res,next){
	const token = req.headers["x-access-token"] || req.headers["authorization"];

	if(global.cfg.auth){
		if (!token) return res.status(401).send("Access denied. No token provided.");
		try {
			console.log("ckLogin token is %s",token);
			const decoded = jwt.verify(token,privateuuid);
			console.log("ckLogin : %o",decoded);
			Userblock.id=decoded.id;
			Userblock.role=decoded.role;
			Userblock.token = jwt.sign({ id: Userblock.id, role: Userblock.role }, privateuuid);
			Userblock.msg = 'username & password OK!';
			Userblock.errno=0;
			
			next();
		} catch (ex) {
			console.log(ex);  
			res.status(400).send("Invalid token.");
		}
	}else{
		console.log("superseed ckLogin");
		Userblock.id=7234;
		Userblock.role='admin';
		Userblock.token = jwt.sign({ id: Userblock.id, role: Userblock.role }, privateuuid);
		Userblock.msg = 'username & password OK!';
		Userblock.errno=0;
		next();
	}
}
async function ckLoginNrole(req,res,next,reqRole){
	const token = req.headers["x-access-token"] || req.headers["authorization"];

	if(global.cfg.auth){
		if (!token) return res.status(401).send("Access denied. No token provided.");
		try {
			// var dataset = req.params.dataset || 'zozo';
			
			const decoded = jwt.verify(token,privateuuid);
			Userblock.id=decoded.id;
			
			var dataset= req.params.dataset || req.body.dataset;
			console.log("ckLoginNrole01 userId %s r.q.p_dataset %s r.q.b_dataset %s -> %s:: role %s",Userblock.id,req.params.dataset,req.body.dataset,dataset,reqRole);
			
			Userblock.isAdmin =decoded.isAdmin;
			Userblock.role=decoded.role;
			
			console.log("ckLoginNrole02 Role %o // required %s",decoded.role,reqRole);
						
			if(reqRole === 'readCurrent' || reqRole === 'changePassword'){
				console.log("ckLoginNrole03A OK %s!",reqRole);				
				next();
			}else if( typeof decoded.role[dataset] !== "undefined" && decoded.role[dataset].includes(reqRole)){
				console.log("ckLoginNrole03B OK!");				
				next();
			}else if(Userblock.isAdmin){
				console.log("ckLoginNrole04 isAdmin OK!");				
				next();				
			}else{
				console.log("ckLoginNrole05 KO! insufficient or missing role|%s|%s|%s",reqRole,dataset,decoded.role[dataset]);	
				res.status(400).send("Invalid/insufficient/missing Role Ds %s|%s",dataset,decoded.role[dataset]);
			};	
		} catch (ex) {
			console.log(ex);  
			res.status(400).send("Invalid token.");
		}
	}else{
		console.log("ckLoginNrole06 superseed ckLogin");
		Userblock.id=7234;
		Userblock.role='admin';
		Userblock.token = jwt.sign({ id: Userblock.id, role: Userblock.role }, privateuuid);
		Userblock.msg = 'username & password OK!';
		Userblock.errno=0;
		next();
	}
}
async function changePass(req,res,next){
	var db = mongoUtil.getDb();
	var oldPass=req.body.currentPassword;
	var newPass=req.body.newPassword1;
	db.collection( global.cfg.cabUsers).updateOne({username: Userblock.username,'password': oldPass},{$set :{ 'password': newPass}},function (err,result){
		if (err) {
		  throw err;
		}
		Userblock.retvalue=1;
		Userblock.retstring='ok - password changed';
		next();
	});
}