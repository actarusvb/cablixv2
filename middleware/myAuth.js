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
			// console.log("ckLogin token is %s",token);
			const decoded = jwt.verify(token,privateuuid);
			// console.log("ckLogin : %o",decoded);
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
			var dataset = req.params.dataset || 'zozo';
			
			const decoded = jwt.verify(token,privateuuid);
			Userblock.id=decoded.id;
			console.log("ckLoginNrole userId %s dataset %s :: role",Userblock.id,req.params.dataset,reqRole);
			Userblock.isAdmin =decoded.isAdmin;
			Userblock.role=decoded.role;
			
			if(dataset === 'zozo')
				decoded.role[dataset]=[];
			
			Userblock.token = jwt.sign({ id: Userblock.id, role: Userblock.role, isAdmin: Userblock.isAdmin }, privateuuid);
			Userblock.msg = 'username & password OK!';
			Userblock.errno=0;
			
			if(decoded.role[dataset].includes(reqRole)){
				console.log("ckLoginNrole OK!");				
				next();
			}else if(Userblock.isAdmin){
				console.log("ckLoginNrole isAdmin OK!");				
				next();				
			}else{
				res.status(400).send("Invalid/insufficient/missing Role");
			};	
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
async function changePass(req,res,next){
	var db = mongoUtil.getDb();
	db.collection( global.cfg.cabUsers).updateOne({username: Userblock.username,password: req.body.OldPassword,},{$set :{ password: req.body.newPassword1}},function (err,result){
		if (err) {
		  throw err;
		}
		Userblock.retvalue=1;
		Userblock.retstring='ok - password changed';
		next();
	});
}