const MA = require('../middleware/myAuth');
const express = require("express");
const router = express.Router();
const uuid4 = require("uuid4");

router.get("/uuid",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req,res) => {		
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	result.retvalue=1;
	result.retstring='OK - data';

	result.uuid=uuid4();	
	res.json(result);

});

module.exports = router;
