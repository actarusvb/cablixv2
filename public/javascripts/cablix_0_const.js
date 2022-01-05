
const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};
const types=["SITE","BUILD","FLOOR","ZONE","RACK","ELEMENT","SOCKET","interrack","PATCH"];
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var roles=["treeWrite","treeRead","rackWrite","rackRead","patchWrite","patchRead"];
const labelMain={'FriendName' : 'FriendName', 'lName' : 'Local name','lid' : 'Local ID'};
const patch={'aid' : 'Side A','bid' : 'Side B','FriendName':'FriendName','mtype':'mtype','Color':'Color','label':'label','barcode':'barcode'};
const interpatchpannel={'lid' : 'lid','sid' : 'sid','rid' : 'rid','boundle' : 'boundle','mtype':'mtype'};
const labels={
	"root": {},
	"SITE": {"pid":"Parent ID","lid":"local ID","City":"City","address1":"address1","address2":"address2","lName":"Local name","country":"country"},
	"BUILD": {"pid":"Parent ID","lid":"local ID","lName":"Local name"},
	"FLOOR": {"pid":"Parent ID","lid":"local ID","lName":"Local name"},
	"ZONE": {"pid":"Parent ID","lid":"local ID","lName":"Local name"},
	"RACK": {"pid":"Parent ID","lid":"local ID","lName":"Local name","hightUnit":"hightUnit","front_back":"front/back"},
	"ELEMENT": {
		"pid":"Parent ID",
		"lid":"local ID",
		"lName":"Local name",
		"position":"position",
		"model": "model",
		"SN":"SN",
		"front_back":"front/back",
		"elementType":"elementType",
		"elementHigh":"elementHigh"
	},
	"SOCKET": {"pid":"Parent ID","lid":"local ID","lName":"Local name","FriendName":"FriendName","lindex":"lindex","mtype":"mtype"},
	"interrack": {"lid":"local ID","zid":"zid","boundle":"boundle","sid":"sid","rid":"rid","mtype":"mtype"}
};
const formEditElementDetail={
	"base":{
		"height" : 730,
		"width" : 400},
	"editSocketForm": {
		"height" : 300,
		"width" : 400},
	"rackElement": {
		"height" : 700,
		"width" : 400},
	"rackElementMod": {
		"height" : 350,
		"width" : 400},
	"treeElement":{
		"height" : 730,
		"width" : 400 }
};
const validValue={
	"type": ["SITE","BUILD","FLOOR","ZONE","RACK","ELEMENT","SOCKET","interrack"],
	"hightUnit": [12,20,24,30,32,38,40,42,44,45],
	"elementHigh":[1,2,3,4,5,6,7,8,9,10],
	"front_back" : ['F','R'],
	"elementType": ['missing'],
	"mtype": ['missing']
};
const dataModel={
	"City":{
		"type": "text",
		"len": 20
	},
	"address1":{
		"type": "text",
		"len": 30
	},
	"address2":{
		"type": "text",
		"len": 30
	},
	"country":{
		"type": "text",
		"len": 30
	},
	"pid":{
		"type": "text",
		"len": 10
	},
	"lid":{
		"type": "text",
		"len": 10
	},
	"lName":{
		"type": "text",
		"len": 30
	},
	"position":{
		"type": "text",
		"len": 2,
		"numberOnly": true
	},
	"elementType":{
		"type": "select"
	},
	"elementHigh":{
		"type": "select"
	},
	"mtype":{
		"type": "select"
	},
	"type" : {
		"type": "select"
	},
	"hightUnit": {
		"type": "select"
	},
	"front_back": {
		"type": "select"
	}
};
