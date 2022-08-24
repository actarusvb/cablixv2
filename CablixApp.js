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


var CablixApp = express();

CablixApp.use(helmet());
CablixApp.disable('x-powered-by');
CablixApp.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "'unsafe-eval'","cdnjs.cloudflare.com","cdn.datatables.net"],
      "style-src": null,
	  },
  })
);

var router = express.Router();
CablixApp.enable("trust proxy");
CablixApp.use(morgan(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms'));

CablixApp.use(bodyParser.urlencoded({ extended: false }));
CablixApp.use(bodyParser.json());

CablixApp.set('view engine', 'ejs');
CablixApp.use(express.static('public'));
CablixApp.use(express.json());

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

		CablixApp.maxConnections = 5;
		
		CablixApp.use('/utils', require('./routes/utils.route'));
		CablixApp.use('/users', require('./routes/user.route'));
		CablixApp.use('/admin', require('./routes/admin.route'));
		CablixApp.use('/tree', require('./routes/tree.route'));
		CablixApp.use('/misc', require('./routes/misc.route'));
		CablixApp.use('/elements', require('./routes/elements.route'));
		CablixApp.use('/SelfService', require('./routes/SelfService.route'));
		CablixApp.use('/SelfServiceU', require('./routes/SelfServiceUtil.route'));
		CablixApp.use('/lib',[
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
		
		CablixApp.get('/SelfService', function (req, res) {
			res.render('SelfService',{config: global.cfg});
		});
		CablixApp.get('/adm', function (req, res) {
			res.render('admin',{config: global.cfg,req});
		});
		CablixApp.get('/list', function (req, res) {
			res.render('list',{config: global.cfg});
		});


		CablixApp.get('/', function (req, res) {
			res.render('index',{config: global.cfg,req});
		});
		
		// start server
		if(global.cfg.isHttps === "true"){
			// var https = require('https');
			// https.createServer({
				// key: fs.readFileSync(config.get('certServerKeyFn')),
				// cert: fs.readFileSync(config.get('certServerCrtFn')),
				// passphrase: config.get("certPhassPhrase"),
			// }, CablixApp).listen(config.get("serverPort"), function () {
				// console.log('CablixApp listening on port: '+config.get("serverPort")+' !');
				// console.log("iAPI is %s",config.get('iAPI'));
			// });
		}else{
			var http = require('http');
			http.createServer(CablixApp).listen(global.cfg.serverPort,global.cfg.localIp ,function () {
				console.log('CablixApp listening on port: %s !',global.cfg.serverPort);
				console.log("iAPI is %s",global.cfg.iAPI);
			});
		}
	});
});
