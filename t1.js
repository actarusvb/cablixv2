const express = require('express');
const jwt = require('jsonwebtoken');
const assert = require('assert');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoUtil = require( './mongoUtil' );
const sqlite3Util = require( './sqlite3Util' );
const path = require('path');
const morgan = require('morgan');
var merge = require('lodash.merge');
var helmet = require('helmet')

var u="Maeflo";
var d="myNewDataset";

var mod=false;
    mod=true;
var key='rbac.'+d;

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

mongoUtil.connectToServer( function( err ) {
	if (err){
	  console.log(err);
	}
	sqlite3Util.connectToServer(function(err){
		if (err){
			console.log(err);
			console.log("Fail to open here");
			process.exit()
		}
		setTimeout(function(){process.exit(0)}, 3000);
		
		/* test code here */
		console.log("Test Begin");
		var db = mongoUtil.getDb();
		
		(mod ) && db.collection( global.cfg.cabUsers).updateOne(
			{username: u},
			{ $push: { dataset: d } }
		);
		
		// { $set: { resume: { url: "http://i.imgur.com/UFX0yXs.jpg" } } }
		
		(mod ) && db.collection( global.cfg.cabUsers).updateOne(
			{"username": u},
			{ '$set': {
					[key] : [
						  'treeWrite',
						  'treeRead',
						  'rackWrite',
						  'rackRead',
						  'patchWrite',
						  'patchRead'
						]
					
				}
			}
		);

		
		db.collection( global.cfg.cabUsers).find({username: u}).toArray(function(err, resx) {
			resx.forEach(function(user){
				console.log("=*=*=*=*=*=*=*=*=*=*=");
				console.log("%s ",user.username);
				console.log("%o",user);
			});
			// process.exit(0)
		});
		/* end test code here */		
	});
});
