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

var dataset="1c1d89d5-8d6b-46ac-a21f-95252b45661e";
var cabId=52;

var mod=false;
    mod=true;

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
		setTimeout(function(){process.exit(0)}, 6000);
		
		/* test code here */
		console.log("Test Begin");
		var mDb = mongoUtil.getDb();
		var sDb = sqlite3Util.getDb();
		var params = [];

		mDb.collection( global.cfg.cabUsers).find({cabId: cabId}).toArray(function(err, resx) {
			resx.forEach(function(user){
				console.log("=*=*=*=*=*=*=*=*=*=*=");
				console.log("%s ",user.username);
				console.log("%o",user);
			});
		});
		sDb.all('SELECT * FROM adder where domain="'+dataset+'"', params, (err, rows) => {
			if (err) {
				console.log("error %s",err.message);
				return;
			}
			rows.forEach(function(line){
				console.log("A>> %o",line);
			});
		});
		
		setTimeout(function(){
			var resx=mDb.collection( global.cfg.cabUsers).deleteOne({cabId: cabId});
			console.log("mongo deleted %s",resx.deletedCount);
			resx=mDb.collection(dataset).drop(function(err, delOK) {
				if (err) throw err;
				if (delOK) console.log("Collection deleted");
				// db.close();
			  });
			
			sDb.run('update adder SET domain=null, burn=null, burname=null WHERE domain="'+dataset+'"', function(err) {
            if(err){
                console.log("%o",err);
            }
            else{
                console.log("Successful");
            }
		});
		}, 3000);
	});
});
