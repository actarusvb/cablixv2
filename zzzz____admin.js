var express = require('express');
var https = require('https');

const config = require('config');
const jwt = require('jsonwebtoken');
const assert = require('assert');
const fs = require('fs');
const bodyParser = require('body-parser');
var mongoUtil = require( './mongoUtil' );
var sqlite3Util = require( './sqlite3Util' );


global.iAPI ='86asds3-sad4-786213';

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

var listfs = JSON.parse(fs.readFileSync('list.json', 'utf8'));

mongoUtil.connectToServer( function( err ) {
	if (err){
	  console.log(err);
	}
	sqlite3Util.connectToServer(function(err){
		if (err){
			console.log(err);
		}
		app.use(function (req, res, next) {
			console.log('Time:', Date.now()+"\turl: "+req.method+' '+req.originalUrl+' Token:'+req.headers.authorization);
			// console.log("tutt req.headers: %o",req.headers);
			next();
		});
		
		app.use('/utils', require('./routes/utils.route'));
		app.use('/users', require('./routes/user.route'));
		app.use('/admin', require('./routes/admin.route'));
		
		app.use('/lib',[
			express.static(__dirname + '/node_modules/jquery/dist/')
			,express.static(__dirname + '/node_modules/datatables.net/js/')
			,express.static(__dirname + '/node_modules/datatables.net-buttons/js/')
			,express.static(__dirname + '/node_modules/datatables-buttons/js/')
			,express.static(__dirname + '/node_modules/jquery-ui-dist/')
			,express.static(__dirname + '/node_modules/jquery-contextmenu/dist/')
			,express.static(__dirname + '/node_modules/@esciencecenter/simple-tree/')
			,express.static(__dirname + '/node_modules/jszip/dist/')
			,express.static(__dirname + '/node_modules/jsbarcode/dist/')
			,express.static(__dirname + '/node_modules/qrcodejs/')
			// ,express.static(__dirname + '/node_modules//dist/')da
		]);
				
		app.get('/', function (req, res) {
			res.render('admin',{config: config});
		});
		
		// start server
		https.createServer({
			key: fs.readFileSync(config.get('certServerKeyFn')),
			cert: fs.readFileSync(config.get('certServerCrtFn')),
			passphrase: config.get("certPhassPhrase"),
		}, app).listen(config.get("adminServerPort"), function () {
			console.log('admin app listening on port: '+config.get("adminServerPort")+' !');
			console.log("iAPI is %s",global.iAPI);
		});
	});
});
