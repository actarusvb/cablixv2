
const MA = require('../middleware/myAuth');
const express = require("express");
const router = express.Router();

// #################################################################################################################################

router.post("/authenticate", MA.myLogin,function(req,res,next){
	console.log("user.route::router.post /authenticate here 022 ruser obj: %o <<<<",MA.Userblock);
	var result = new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	res.json(result);
});
router.get("/current", (r,b,n) => {MA.ckLoginNrole(r,b,n,'treeRead');},async (req, res) => {
	console.log("/current requested res id %s",MA.Userblock.id);
	try {
		var result = new Object();
		result.auth = JSON.parse(JSON.stringify(MA.Userblock));

		res.json(result);
	} catch(ex){
		console.log("user.route /current get ERROR %s",ex);
		res.json(MA.Userblock);
	}
	// return;
});
router.post("/password", (r,b,n) => {MA.ckLoginNrole(r,b,n,'treeRead');},async (req, res) => {
	console.log("/current requested res id %s",MA.Userblock.id);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	try {
		if(req.body.newPassword1 === req.body.newPassword1){
			MA.changePass(req,res, function(){
				result.auth = JSON.parse(JSON.stringify(MA.Userblock));
				result.retvalue=1;
				result.retstring="OK - password changed";
				res.json(result);
			});
		}else{
			result.op = {errno: -7,errmessage: "RUJOKE?"};
			res.json(result);
		}
	} catch(ex){
		console.log("user.route /current get ERROR %s",ex);
	
		res.json(result);
	}
	return;
});

module.exports = router;
