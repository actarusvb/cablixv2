const MA = require('../middleware/myAuth');
// const config = require('config');
const express = require("express");
const router = express.Router();
var https = require('https');
var mongoUtil = require( '../mongoUtil' );

router.get("/json/treex/:dataset/:datasetName",(r,b,n) => {MA.ckLoginNrole(r,b,n,'treeRead');},async (req, res) => {
	console.log("/json/tree/:dataset requested id %s for dataset %s -> %s",MA.Userblock.id,req.params.dataset,req.params.datasetName);

	var result=new Object();
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);

	col.find({'type' : { $in: ["Dataset","SITE","BUILD","FLOOR","ZONE","RACK"]}}).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		result.tree=[];
		result.tree[0]=new Object();
		// var children =recursiveFind(qresult,'root',0);
		// if(children.label !== 
		result.tree[0].children =recursiveFind(qresult,'root',0);
		result.tree[0].label=req.params.datasetName;
		result.tree[0].value='root';
		result.tree[0].type='root';
		result.tree[0].id='TR-root';
		result.tree[0].lid='root';
		
		res.json(result);
	});
});
router.get("/json/dataset/resolve/:dataset",async (req,res) => {
	console.log("/json/dataset/resolve/:dataset %s",req.baseUrl,req.params.dataset);
	var result=new Object();

	var db = mongoUtil.getDb();
	var col=db.collection(req.params.dataset);
	col.find({'type' : 'dataset' }).toArray(function(err, qresult){
		if (err) {
			throw err;
		}
		console.log(qresult);
		if(Object.keys(qresult).length === 0 ){
			result.datasetLabel='-'+req.params.dataset+'-';
		}else{	
			result.datasetLabel=qresult[0].lid;	
		}
		res.json(result);
	});
});
router.post("/delete/element",(r,b,n) => {MA.ckLoginNrole(r,b,n,'treeWrite');},async (req, res) => {
	console.log("/delete/element requested id %s for dataset %s",MA.Userblock.id,req.body.dataset,req.body.target);

	var result=new Object();;
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(req.body.dataset);
	
  const existingElement = await col.findOne({ lid: req.body.target });
      if (existingElement != null) {
		  console.log("/delete/element target: %s obj : %o",req.body.target,existingElement);
		await col.updateMany({pid: existingElement.lid},{$set: { pid: existingElement.pid}});
		await col.deleteOne({ lid: req.body.target });
		result.retvalue=1;
		result.retstring="OK - deleted";
		
		res.json(result);
      }
});
router.post("/editOrSave/element/:dataset",(r,b,n) => {MA.ckLoginNrole(r,b,n,'treeWrite');},async (req, res) => {
	console.log("W77 POST /editOrSave/element requested id %s for dataset %s > ",MA.Userblock.id,req.body.dataset,req.params.dataset);

	var dataset = req.body.dataset || req.params.dataset;
	var result=new Object();;
	result.auth = JSON.parse(JSON.stringify(MA.Userblock));

	var db = mongoUtil.getDb();
	var col=db.collection(dataset);
	
	var datapack=JSON.parse(JSON.stringify(req.body));
	delete datapack.dataset;
	if(datapack.subaction === 'edit'){
		delete datapack.subaction;
		await col.updateOne({lid: datapack.lid},{$set: datapack });
	}else if(datapack.subaction === 'add_children'){
		delete datapack.subaction
		var ret = await col.insertOne(datapack);
		// console.log("W77 Insert in %s ret %o",req.body.dataset,ret);
		if(datapack.type === 'ELEMENT'){
			var eleModel = new Object();
			eleModel = global.cfg.eletypes[datapack.elementType];
			console.log("W77 %s -> eleMOdel: %o",datapack.elementType,eleModel);
			console.log("W77 eleMOdel: %s",eleModel.ports.length);
			if(eleModel.ports.length > 0){
				eleModel.ports.forEach(function(v,k){
					console.log("W77 v %o",v);
					var populateIn={};
					populateIn.dataset=req.body.dataset;
					populateIn.lid=datapack.lid;
					populateIn.elementType=datapack.elementType;
					populateIn.pstart=v.pstart;
					populateIn.pstop=v.pstop;
					populateIn.pname=v.pname;
					populateIn.pfriend=v.pfriend || "ptAs";
					
					populateIn.indexStart=v.indexStart;
					populateIn.ConnectType=v.ConnectType;
					populateIn.modular=v.modular;
					populateIn.pstart=v.pstart;
					populatePort(populateIn);
					var url = '/'+[
							'elements',
							'iAPI',
							global.cfg.iAPI,
							'json',
							'element',
							'populate',
							req.body.dataset,
							datapack.lid,
							datapack.elementType,
							v.pstart,
							v.pstop,
							v.pname,
							v.indexStart,
							v.ConnectType,
							v.modular,
							populateIn.pfriend
							].join('/')
					console.log("W77 get Url is %s",url);
					var options = {
						hostname: global.cfg.ServerName,
						// protocol: 'https:',
						port: 8000,
						path: url,
						method : 'GET',
						rejectUnauthorized: false
					}
					options.agent = new https.Agent(options);
				});
			}
		}
	}else{
		console.log("W77  editOrSave: subaction unk %s",datapack.subaction );
		result.retvalue=-1;
		result.retstring="KO - action ???";
		return;
	}
	console.log("W77 datapack is %o",datapack );
	
	result.retvalue=1;
	result.retstring="OK - saved!";
	res.json(result);
});	
function populatePort(populateData){
	console.log("W78 %o requested <",populateData);

	var db = mongoUtil.getDb();
	var col=db.collection(populateData.dataset);

	var insertBlocks = [];
	
	for (i=parseInt(populateData.pstart);i<= parseInt(populateData.pstop);i++){
		insertBlocks.push({
			"lid" : populateData.lid+ populateData.pname + i,
			"type" : "SOCKET",
			"H" : "D",
			"pid" : populateData.lid,
			"lName" : "pt"+i,
			"FriendName" : populateData.pfriend+i,
			"lindex" : parseInt(populateData.indexStart)+i-1,
			"mtype" : populateData.ConnectType
		});
	}
	console.log("insertMany block %o",insertBlocks);
	col.insertMany(insertBlocks,function(err, roz) {
		if(err) console.log(err);
		console.log("Insert Finish");
	});
}
function recursiveFind(qresult,pid,level){
	var newLevel=level+1
	var dataJs=new Array();;
	var i=0;
	qresult.forEach(function(element){
		if(element.pid === pid){
			// console.log("pid %s element name %s",pid,element.name)
			dataJs[i]=new Object();
			dataJs[i].label=element.lName + ' ('+(element.City || element.desc || '-') +')';
			dataJs[i].value=element.lid;
			dataJs[i].expanded=true;
			
			dataJs[i].type=element.type;
			dataJs[i].id='TR-'+element.lid;
			dataJs[i].lid=element.lid;
			
			var children =recursiveFind(qresult,element.lid,newLevel);
			
			if(! isEmptyObject(children)){
				dataJs[i].children=[];
				dataJs[i].children=children;
			}
			i++;
		}
	});
	return dataJs;
}
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

module.exports = router;
