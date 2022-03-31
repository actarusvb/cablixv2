const MA = require('../middleware/myAuth');
const SE = require('../middleware/searchUtil');
const express = require("express");
const router = express.Router();
var mongoUtil = require( '../mongoUtil' );
var merge = require('lodash.merge');

// const config = require('config');
let ejs=require('ejs');
var path = require('path');

router.get("/json/rack/:dataset/:rackId",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z01 %s requested id %s for dataset %s rack %s",req.baseUrl,MA.Userblock.id,req.params.dataset,req.params.rackId);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
		
	col.find({'type' : "RACK",'lid': req.params.rackId}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result.rack=qresult[0];	
		
		res.json(result);
	});
});
router.get("/json/rack/:dataset/:pid/child",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z02 url %s requested id %s for dataset %s pid %s<",req.baseUrl,MA.Userblock.id,req.params.dataset,req.params.pid);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
		
	col.find({'type': "ELEMENT",'pid': req.params.pid}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result.elements=qresult;

		res.json(result);
	});
});
router.get("/json/zone/:dataset/:pid/child",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z03 %s requested id %s for dataset %s rack %s",req.baseUrl,MA.Userblock.id,req.params.dataset,req.params.pid);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
		
	col.find({'type' : "RACK",'pid': req.params.pid}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result.elements=qresult;	
		
		res.json(result);
	});
});
router.get("/json/element/brother-cousin/:dataset/:rackId/:elePid/:eleId",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z04 %s + json/brother-cousin requested from userid %s for dataset %s  rackId %s + elePid %s + eleId %s",
		req.baseUrl,MA.Userblock.id,req.params.dataset,req.params.rackId,req.params.elePid,req.params.eleId);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));
	
	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
	
	var group = new Object();
	
	await col.find({'lid': req.params.rackId}).toArray(await function(errA, myRackArray){
		if (errA) {
			throw err;
		}
		group[myRackArray[0].pid] = myRackArray[0].pid;
		console.log("one %o",myRackArray[0]);
		col.find({'pid': myRackArray[0].pid}).toArray(function(errB, racksArray){
			if (errB) {
				throw err;
			}
			racksArray.forEach(function(lllll){
				group[myRackArray[0].pid][lllll.lid]=JSON.parse(JSON.stringify(lllll));
				console.log("two %o",lllll);
				console.log("two group %o",group);
				col.find({'pid': lllll.lid}).toArray(function(errC, elements){
					if (errC) {
						throw err;
					}
					elements.forEach(function(element){
						console.log("three %o",elements);
						col.find({'pid': elements[0].lid}).toArray(function(errD, qresultD){
							if (errC) {
								throw err;
							}					
							result.retvalue=1;
							result.retstring='OK - data';
							result.element=qresultD;	
							// res.json(result);
						});
					});
				});
			});
		});
	});
});
router.get("/json/element/:dataset/:rackId/:eleId",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z05 %s requested id %s for dataset %s rack %s element %s",req.baseUrl,MA.Userblock.id,req.params.dataset,req.params.rackId,req.params.eleId);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
		
	col.find({'type' : "ELEMENT",'lid': req.params.eleId}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		// console.log(">> qresult: %o",qresult);
		result.rack=qresult[0];	
		// console.log("00004 %s ret res is %o",req.baseUrl,result);
		res.json(result);
	});
});
router.get("/json/element/:dataset/:eleId",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req,res) =>{
	console.log("z06 %s requested from id %s for dataset %s  element %s",req.baseUrl,MA.Userblock.id,req.params.dataset,req.params.eleId);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
		
	col.find({"lid": req.params.eleId}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result.retvalue=1;
		result.retstring='OK - data';
		result.element=qresult[0];	
		res.json(result);
	});
});
router.get("/html/element/:dataset/:rackId/:eleId/:sockIdPrf",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log(
		"z07 %s requested id %s for dataset %s rack %s element %s + prefix %s<",
		req.baseUrl,
		MA.Userblock.id,
		req.params.dataset,
		req.params.rackId,
		req.params.eleId,
		req.params.sockIdPrf
		);
		
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	result.req=new Object();
	result.req.url=req.baseUrl;
	result.req.dataset=req.params.dataset;
	result.req.rackId=req.params.rackId;
	result.req.eleId=req.params.eleId;	
	
	var db = mongoUtil.getDb();
	var mode=new Object();
	mode.HeadDisplay=false;
	mode.shortHeadDisplay=true;
	mode.additionalCSS='additionalCSS';

	try {
		db.collection(req.params.dataset).find({'type' : "ELEMENT",'lid': req.params.eleId}).toArray(function(err,qresults){
			if (err) {
				console.log("error at 00077 ::%s::",err);
			}
			// console.log("z00bz we have %o",qresults);
			
			qresults.forEach(function(qresult,idx){
				result.rack=JSON.parse(JSON.stringify(qresult));
				result.sockets=new Object();
				result.det=new Object();

				// console.log(qresult);
				var elemntType=global.cfg.eletypes[qresult.elementType];
				console.log( elemntType.length === 0 ? "!!!!!!!!!!!!!!!!!!!! Elementype Empty" : "Element exist");
				result.configElement=elemntType;
				// console.log(elemntType);
				// STEFANO !!!!!!!
				for(let gbase=0;gbase<elemntType.ports.length;gbase++){
					let uindex=elemntType.ports[gbase].pstart;
					for(let i=elemntType.ports[gbase].indexStart; i< elemntType.ports[gbase].indexStart+elemntType.ports[gbase].pstop;i++){
						var pname = elemntType.ports[gbase].pname;
						result.sockets['s'+i]='<span id="'+qresult.lid+pname+uindex+'-'+req.params.sockIdPrf+'" class="socketBLANK"></span>';
						uindex++;
					}
				}
				ejs.renderFile(
					path.join(process.cwd() ,'views','vistaTmpl',elemntType.template+'.ejs')
					,{data: qresults,socket: result.sockets,info: result.rack,mode: mode,elementType : elemntType }
					,{ delimiter: '%'}
					,function(err, str){
						if (err) {
							console.log("I got an error in rendering file %s!!! error is %s",path.join(process.cwd() ,'views','vistaTmpl',result.rack.elementType+'.ejs'),err);
							// throw err;
						}
						result.htmlData=str;
						res.json(result);
					}
				);
			});
		});
	} catch (error){
		console.log("it was an error ? %o",error);
	}	
});
router.get("/json/element/:dataset/:rackId/:eleId/BLOCK",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z08 %s requested id %s for dataset %s rack %s element %s socket BLOCK!<",
		req.baseUrl,MA.Userblock.id,req.params.dataset,req.params.rackId,req.params.eleId);

	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	result.req=new Object();
	result.req.url=req.baseUrl;
	result.req.dataset=req.params.dataset;
	result.req.rackId=req.params.rackId;
	result.req.eleId=req.params.eleId;
	// result.req.socketId=req.params.socketId;
	
	var db = mongoUtil.getDb();
		
	let getSocketPromise=getSocket(db,req.params.dataset,result.req.eleId);
	getSocketPromise.then(function(socketsData){
		if(socketsData.length > 0){
			result.socketsData=socketsData;
		}else{
			console.log("z08 Socket.data empty!!!");
		}
		res.json(result);
	});
});
router.get("/json/elementTypeListOld/:dataset",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z10 %s requested id %s for dataset %s <",req.baseUrl,MA.Userblock.id,req.params.dataset);

	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	result.req=new Object();
	result.req.url=req.baseUrl;
	
	result.req.dataset=req.params.dataset;
	result.data=global.cfg.eletypes;

	result.retvalue=1;
	result.retstring="OK - data";
	
	res.json(result);
});
router.get("/json/elementTypeList/:dataset",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackRead');},async (req, res) => {
	console.log("z10 %s requested id %s for dataset %s <",req.baseUrl,MA.Userblock.id,req.params.dataset);

	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	result.req=new Object();
	result.req.url=req.baseUrl;
	
	result.req.dataset=req.params.dataset;
	
	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
		
	col.find({'type' : "eleConfig"}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result.rack=qresult[0];
		result.data=global.cfg.eletypes;
		if(typeof qresult[0] !== "undefined"){
			result.data2=qresult[0].eletypes;
		}
		// console.log("i got as config %o",qresult[0]);
		
		result.retvalue=1;
		result.retstring="OK - data";
		
		res.json(result);
	});
});
router.get("/html/patch/:dataset/:onesideId",async (req, res) => {
	console.log("z88 %s requested patch id %s for dataset %s socket %s<",
		req.baseUrl,0,req.params.dataset,req.params.onesideId);

	var result=new Object();
	// result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	result.req=new Object();
	result.req.url=req.baseUrl;
	result.req.dataset=req.params.dataset;
	result.req.onesideId=req.params.onesideId;
	
	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
	// rtype: 'patch',
	col.find({ $or : [{aid : req.params.onesideId },{bid : req.params.onesideId },{barcode : req.params.onesideId }]}).toArray( function(err, qresults) {
		if (err) {
			fail(9988,"fail in find");
			return reject(err)
		}
		console.log("find %d records for %s",qresults.length,req.params.onesideId);
		if(qresults.length > 0){
			console.log("result  999 %o",qresults[0]);
			qresults[0]['dataset']=req.params.dataset;
			res.render('patch_2',{config: global.cfg, patch: qresults[0]});
		}else{
			res.render('bad');
		}
	});
});
router.get("/html/patches/:dataset/:rackId",async (req, res) => {
	console.log("z88 %s requested ALL patches for rack id %s for dataset %s<",
		req.baseUrl,req.params.rackId,req.params.dataset);

	var result=new Object();
	// result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	result.req=new Object();
	result.req.url=req.baseUrl;
	result.req.dataset=req.params.dataset;
	result.req.onesideId=req.params.onesideId;
	
	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
	
	col.find({$or : [{"arack": req.params.rackId},{"brack": req.params.rackId}]}).toArray( function(err, qresults) {
		if (err) {
			fail(9988,"fail in find");
			return reject(err)
		}
		console.log("find %d records for %s",qresults.length,req.params.onesideId);
		if(qresults.length > 0){
			console.log("result  999 %o",qresults[0]);
			res.render('allPatches',{config: global.cfg, patches: qresults, info: req.params});
		}else{
			res.render('bad');
		}
	});
});
router.get("/iAPI/"+global.iAPI+"/json/element/populate/:dataset/:pid/:pidType/:startLid/:stopLid/:postfix/:lindex/:eleType/:modular",async (req,res) => {
	console.log("W78 %s requested <",req.url);
	
	var result=new Object();

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
	
	var insertBlocks = [];
	
	console.log("req.params %o",req.params);

	for (i=parseInt(req.params.startLid);i<= parseInt(req.params.stopLid);i++){
		insertBlocks.push({
			"lid" : req.params.pid+ req.params.postfix + i,
			"type" : "SOCKET",
			"H" : "D",
			"pid" : req.params.pid,
			"lName" : "pt"+i,
			"FriendName" : "ptAs"+i,
			"lindex" : parseInt(req.params.lindex)+i-1,
			"mtype" : req.params.eleType,
			"modular" : req.params.modular
			
		});
	}
	console.log("++++++++++++++++++++++++++++");
	console.log("insertMany block %o",insertBlocks);
	console.log("----------------------------");
	
	col.insertMany(insertBlocks,function(err, roz) {
		result.retvalue=1;
		result.retstring='OK - data';
		result.element=insertBlocks;	
		res.json(result);
	});
});
router.post("/json/element/delete",(r,b,n) => {MA.ckLoginNrole(r,b,n,'rackWrite');},async (req,res) =>{
	console.log("D10 %s requested id %s for dataset %s for %s<",req.baseUrl,MA.Userblock.id,req.body.dataset,req.body.lid);
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.body.dataset);

	result.req=new Object();
	result.req.url=req.baseUrl;
	result.req.dataset=req.body.dataset;
	
	var rx= new Object();
	col.find({"type" : { $in: ["SOCKET","interrack","PATCH","patch"]}}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		var list=new Array();
		list=SE.recursiveFindToArray(qresult,req.body.lid,0);
		col.deleteMany({"lid" : { $in: list}},function(err, q2){
			if (err) {
				throw err;
			}
			result.retvalue=1;
			result.retstring='OK - test';
			res.json(result);
		});
	});
});
router.post("/json/patch/add",(r,b,n) => {MA.ckLoginNrole(r,b,n,'patchWrite');},async (req,res) =>{
	console.log("z10 %s requested id %s for dataset %s <",req.baseUrl,MA.Userblock.id,req.body.dataset);
	console.log("z10::: we have %o",req.body);
	
	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.body.dataset);

	result.req=new Object();
	result.req.url=req.baseUrl;
	
	checkPatchExist(db.collection(req.body.dataset),req.body.aid,req.body.bid,fail(1001,'patch exist'),
		checkEleExist(db.collection(req.body.dataset),req.body.aid,
			checkEleExist(db.collection(req.body.dataset),req.body.bid,
				checkSideCompatibility(db.collection(req.body.dataset),req.body.aid,req.body.bid,
					addPatch(db.collection(req.body.dataset),req.body)
				,fail(1003,'element not compatible'))
			,fail(1002,'element aid missing')),
		fail(1002,'element bid missing'))
	);
	function addPatch(col,b){
		var p = {rtype : "patch", type : "PATCH"};
		global.cfg.patchFieldName.split(",").forEach(function(a,i){
			p[a]=b[a];
		});
		
		col.insertOne(p,function(err, rex) {
			if (err) throw err;
			
			console.log("p document inserted %o",p);
			logAction(req.body.dataset,req.body.dataset+" ADD PATCH "+p.lid);
			
			result.retvalue=1;
			result.retstring="OK - inserted";
			res.json(result);
		});
	}
	function checkSideCompatibility(col,faid,fbid,okCallback,failCallback){
		// !!!!!!!!!!
		okCallback;
		// failCallback;
	}
	function checkEleExist(col,flid,okCallback,failCallback){
		col.find({lid : flid }).toArray( function(err, qresult) {
		if (err) {
				fail(9999,"fail in find");
				return reject(err)
			}
			// console.log("9999 qresult: %o",qresult);
			(qresult.lenght < 1) ?
				failCallback :
				okCallback;
		});
	}
	function checkPatchExist(col,faid,fbid,failCallback,okCallback){
		// check if patches already exist with aib or bid
		col.find({rtype: 'PATCH', $or : [{aid : faid },{bid : faid },{aid : fbid },{bid : fbid }]}).toArray( function(err, qresult) {
			if (err) {
				fail(9998,"fail in find");
				return reject(err)
			}
			console.log("9998 qresult: %o",qresult);
			(qresult.lenght > 0) ?
				failCallback :
				okCallback;
		});
	}
	function fail(errnum,errstring){
		var result=new Object();
		result.retvalue=errnum;
		console.log("Fail func we have %d msg %s",errnum,errstring);
		result.retstring=errstring;

	}
});
router.post("/json/patch/delete/:col/:onesideId",(r,b,n) => {MA.ckLoginNrole(r,b,n,'patchWrite');},async (req,res) =>{
	console.log("z12 %s requested id %s for dataset %s <",req.baseUrl,MA.Userblock.id,req.params.onesideId);

	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.col);

	result.req=new Object();
	result.req.url=req.baseUrl;
	
	col.deleteMany({rtype: 'patch', $or : [{aid : req.params.onesideId },{bid : req.params.onesideId }]}, (err,qresult) => {
		if (err) {
			fail(9989,"fail in delete many");
			return reject(err)
		}
		console.log("9989 deleteMany qresult: %o",qresult.result);
		logAction(req.body.dataset,req.body.dataset+" DEL PATCH "+req.params.onesideId);
		result.retvalue=1;
		result.delNum=qresult.result.n; 
		result.retstring="OK - delete: "+result.delNum;

		res.json(result);
	});
});
function getSocket (db,collectionInUse,pid) {
	return new Promise(function(resolve, reject) {		
		db.collection(collectionInUse).aggregate([
		{ 
			$match:  
			{ type: "SOCKET",
				"pid": pid
			}
		},
		{
			$lookup:
			{
					from: collectionInUse,
					let: { ppid : "$lid" },
					pipeline: [
						{ $match:
							{
								$expr:{
									$or: [
										{$eq: ["$aid","$$ppid"]},
										{$eq: ["$bid","$$ppid"]},
									]
								}
							}
						}],
					as: "patches"
			}
		}
		]).toArray( function(err, docs) {
			if (err) {
				console.log(err);
				return reject(err);
			}
			resolve(docs);
		});
	});
}
function getSocket_old (dbcol,pid) {
  return new Promise(function(resolve, reject) {
		dbcol.find({'pid':pid}).toArray( function(err, docs) {
			if (err) {
				console.log(err);
				return reject(err);
			}
			resolve(docs);
		});
	});
}
function getSocketAdapter (dbcol,pid,socket) {
  return new Promise(function(resolve, reject) {
     dbcol.find({type: 'ADAPTER', pid: socket.lid }).forEach("")
	 .toArray( function(err, docs) {
      if (err) {
        return reject(err)
      }
    })
  })
}
function getPatch (dbcol,lid) {
     dbcol.find({rtype: 'PATCH', $or : [{aid : lid },{bid : lid }]}).toArray( function(err, docs) {
      if (err) {
        return reject(err)
      }
	  return docs;
    });
  // });
}
function logAction(dataset,msg){	
		var db = mongoUtil.getDb();
		console.log("log is %s",global.cfg.log);
		var collog=db.collection("_log");
		
		var p = {
			type : "log",
			date: new Date().toISOString(),
			message: msg
		};
		collog.insertOne(p,function(err, rex) {
			if (err) throw err;
			console.log("p document inserted %o",p);
		});
}
module.exports = router;
