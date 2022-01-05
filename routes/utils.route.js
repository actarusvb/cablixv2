
const express = require("express");
const router = express.Router();
const uuid4 = require("uuid4");

router.get("/uuid",function(req,res){		
	var result=new Object();
	result.retvalue=1;
	result.retstring='OK - data';
	// console.log(">> qresult: %o",qresult);
	result.uuid=uuid4();	
	res.json(result);

});

module.exports = router;
