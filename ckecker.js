//
// check config and templates
//
//

const datasetCkeck ="1c1d89d5-8d6b-46ac-a21f-95252b45661e";


const assert = require('assert');
const fs = require('fs');

const mongoUtil = require( './mongoUtil' );
const sqlite3Util = require( './sqlite3Util' );
const path = require('path');

var merge = require('lodash.merge');


global.cfg={};
const directoryPaths = [path.join(__dirname, 'config'),path.join(__dirname, 'RackElements'),path.join(__dirname, 'RackElements/Elements')];
directoryPaths.forEach(function (dir){
	console.log ("to scan %s",dir);
	var files=fs.readdirSync(dir)
	
	files.forEach(function (file) {
		if(fs.lstatSync(path.join(dir,file)).isDirectory()){
			console.log("skip directory pointers %s",file);
		}else{
			console.log("Load config file %s",file);
			global.cfg=merge(global.cfg,JSON.parse(fs.readFileSync(path.join(dir,file))));
		}
	});
});

// check template for elementTypes
const templateDir="views/vistaTmpl";
for (const elemnetTypeName in global.cfg.eletypes ){
	console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-");
	console.log(elemnetTypeName);
	console.log(global.cfg.eletypes[elemnetTypeName].ports);
	console.log(fs.existsSync(path.join(templateDir,global.cfg.eletypes[elemnetTypeName].template+".ejs")) ?
	global.cfg.eletypes[elemnetTypeName].template + ".ejs Exist!" :
	global.cfg.eletypes[elemnetTypeName].template + ".ejs Missing!    =*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");

	console.log(global.cfg.eletypes[elemnetTypeName].template);
	console.log(global.cfg.eletypes[elemnetTypeName].description);
};
console.log("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
// console.log(global.cfg.eletypes);
console.log("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
// console.log("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");

mongoUtil.connectToServer( function( err ) {
	if (err){
	  console.log(err);
	}
	var mongoUtil = require( './mongoUtil' );
	var db = mongoUtil.getDb();
	var col=db.collection(datasetCkeck);
	
	console.log("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");

	// check types in dataset
	col.distinct("type",{},(function(err, types){
				if (err) {
			throw err;
		}
		types.forEach(function(type){
			console.log("TYPE %s ",type);
		});
	}));
	
	console.log("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
	// check EelementTypes in dataset
	col.find({"type" : "ELEMENT"}).toArray(function(err, elementsResult){
				if (err) {
			throw err;
		}
		elementsResult.forEach(function(elementTbc){
			console.log("=*=*=*=*=*=*=*=*=*=*=");
			console.log("%s - %s - %s",elementTbc.lid,elementTbc.elementType,global.cfg.eletypes[elementTbc.elementType]);
			// console.log( global.cfg.eletypes[elementTbc.elementType]);
		});
	});
	// check orphan
	// PATCH
	// **** aid && bid must exist
	console.log("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
	console.log("=*=*=*=*=*=*=*=*=*=*=*PATCH*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
	col.find({"type" : "PATCH"}).toArray(function(err, patchResult){
		if (err) {
			throw err;
		}
		patchResult.forEach(function(patch){
			// console.log("-.-.-.-.-.-.-.-.-.-.-");
			// console.log("Patch %s A &s B %s",patch.lid,patch.aid,patch.bid);
			checkFather (col,0,patch.lid,patch.aid);
			checkFather (col,0,patch.lid,patch.bid);
		});
	});
	// SOCKET
	// PID mist exist
	console.log("=*=*=*=*=*=*=*=*=*=*=*SOCKET*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
	col.find({"type" : "SOCKET"}).toArray(function(err, socketsResult){
		if (err) {
			throw err;
		}
		socketsResult.forEach(function(socket){
			// console.log("-.-.-.-.-.-.-.-.-.-.-");
			// console.log("SOCKET %s p %s",socket.lid,socket.pid);
			checkFather (col,0,socket.lid,socket.pid);
		});
	});
	// ELEMENT
	// PID mist exist
	console.log("=*=*=*=*=*=*=*=*=*=*=*ELEMENT*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
	col.find({"type" : "ELEMENT"}).toArray(function(err, elementsResult){
		if (err) {
			throw err;
		}
		elementsResult.forEach(function(element){
			// console.log("-.-.-.-.-.-.-.-.-.-.-");
			console.log("ELEMENT %s p %s",element.lid,element.pid);
			checkFather (col,0,element.lid,element.pid);
		});
	});
	// RACK	
	// PID mist exist
	console.log("=*=*=*=*=*=*=*=*=*=*=*RACK*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=");
	col.find({"type" : "RACK"}).toArray(function(err, racksResult){
		if (err) {
			throw err;
		}
		racksResult.forEach(function(rack){
			// console.log("-.-.-.-.-.-.-.-.-.-.-");
			console.log("rack %s p %s",rack.lid,rack.pid);
			checkFather (col,1,rack.lid,rack.pid);
		});
	});
	
	// check sons...
	col.find({"type" : "ELEMENT"}).toArray(function(err, elementsResult){
		if (err) {
			throw err;
		}
		elementsResult.forEach(function(element){
			// console.log("-.-.-.-.-.-.-.-.-.-.-");
			console.log("ELEMENT %s p %s",element.lid,element.pid);
			checkSons (col,0,element.lid,element.elementType);
		});
	});
});


// process.exit(0);

function checkFather(col,mode,lid,pid){
	col.findOne({"lid" : pid},function(err, qres){
		if (err) {
			console.log("%s %s ERR",lid,pid);
			// throw err;
		}
		(typeof qres === 'undefined' || qres === null) ?
		console.log("\t\t\t\tOrphan %s, F %s not found",lid,pid) :
		mode ? console.log("FC %s %s/%s %s OK",lid,pid,qres.lid,qres.type) : 1;
	});
}
function checkSons(col,mode,lid,eleType){
	col.countDocuments({"pid":lid},function(err,count){
		if (err) {
			console.log("%s %s ERR",lid,pid);
			// throw err;
		}
		(count) ?
		console.log("SONS %s %s ha %s figli",lid,eleType,count) :
		console.log("\t\t\tSONS %s %s ha %s figli",lid,eleType,count);
	});
}