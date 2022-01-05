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

var app = express();
var router = express.Router();
app.enable("trust proxy");
app.use(morgan(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

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
// console.log("CFG %o",global.cfg);

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

		app.maxConnections = 5;
		
		// app.use(function (req, res, next) {
			// console.log('Time:', Date.now()+"\turl:"+req.method+' '+req.originalUrl);
			// next();
		// });

		app.use('/utils', require('./routes/utils.route'));
		app.use('/users', require('./routes/user.route'));
		app.use('/admin', require('./routes/admin.route'));
		app.use('/tree', require('./routes/tree.route'));
		app.use('/misc', require('./routes/misc.route'));
		app.use('/elements', require('./routes/elements.route'));
		app.use('/SelfService', require('./routes/SelfService.route'));
		app.use('/SelfServiceU', require('./routes/SelfServiceUtil.route'));
		app.use('/lib',[
			express.static(__dirname + '/node_modules/jquery/dist/')
			,express.static(__dirname + '/node_modules/datatables.net/js/')
			,express.static(__dirname + '/node_modules/datatables.net-buttons/js/')
			,express.static(__dirname + '/node_modules/datatables-buttons/js/')
			,express.static(__dirname + '/node_modules/jquery-ui-dist/')
			,express.static(__dirname + '/node_modules/jquery-contextmenu/dist/')
			,express.static(__dirname + '/node_modules/@actarusvb/simpleTree/')
			,express.static(__dirname + '/node_modules/jszip/dist/')
			,express.static(__dirname + '/node_modules/jsbarcode/dist/')
			,express.static(__dirname + '/node_modules/qrcodejs/')
		]);
		
		app.get('/SelfService', function (req, res) {
			res.render('SelfService',{config: global.cfg});
		});
		app.get('/adm', function (req, res) {
			res.render('admin',{config: global.cfg});
		});
		app.get('/list', function (req, res) {
			res.render('list',{config: global.cfg});
		});


		app.get('/', function (req, res) {
			res.render('index',{config: global.cfg});
		});
		
		// start server
		if(global.cfg.isHttps === "true"){
			// var https = require('https');
			// https.createServer({
				// key: fs.readFileSync(config.get('certServerKeyFn')),
				// cert: fs.readFileSync(config.get('certServerCrtFn')),
				// passphrase: config.get("certPhassPhrase"),
			// }, app).listen(config.get("serverPort"), function () {
				// console.log('app listening on port: '+config.get("serverPort")+' !');
				// console.log("iAPI is %s",config.get('iAPI'));
			// });
		}else{
			var http = require('http');
			http.createServer(app).listen(global.cfg.serverPort,global.cfg.localIp ,function () {
				console.log('app listening on port: %s !',global.cfg.serverPort);
				console.log("iAPI is %s",global.cfg.iAPI);
			});
		}
	});
});
