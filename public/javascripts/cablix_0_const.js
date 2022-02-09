
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
const labelMainXA={'FriendName' : 'Friend Name', 'lName' : 'Local name','lid' : 'Local ID'};
const patch={'aid' : 'Side A','bid' : 'Side B','FriendName':'FriendName','mtype':'mtype','Color':'Color','label':'label','barcode':'barcode'};
const interpatchpannel={'lid' : 'lid','sid' : 'sid','rid' : 'rid','boundle' : 'boundle','mtype':'mtype'};
const labels={
	"root": {
		"SelectDataset" : "Select Dataset/Domain",
		"AddLicense": "Add License",
		"ProgramName": "Cablix 1.1a",
	},
	"SITE": {
		"pid":"Parent ID",
		"lid":"local ID",
		"City":"City",
		"address1":"address1",
		"address2":"address2",
		"lName":"Local name",
		"country":"country"
	},
	"BUILD": {
		"pid":"Parent ID",
		"lid":"local ID",
		"lName":"Local name"
	},
	"FLOOR": {
		"pid":"Parent ID",
		"lid":"local ID",
		"lName":"Local name"
	},
	"ZONE": {
		"pid":"Parent ID",
		"lid":"local ID",
		"lName":"Local name"
	},
	"RACK": {
		"pid":"Parent ID",
		"lid":"local ID",
		"lName":"Local name",
		"hightUnit":"hightUnit",
		"front_back":"front/back"
	},
	"ELEMENT": {
		"pid":"Parent ID",
		"lid":"local ID",
		"lName":"Local name",
		"FriendName":"Friend Name",
		"position":"position",
		"model": "model",
		"SN":"SN",
		"front_back":"front/back",
		"elementType":"elementType",
		"elementHigh":"elementHigh",
		"power":"power"
	},
	"SOCKET": {
		"Title1": "MAIN",
		"Title2": "Patch Data",
		"pid":"Parent ID",
		"lid":"local ID",
		"lName":"Local name",
		"FriendName":"Friend Name",
		"lindex": "local index",
		"mtype": "media type"
	},
	"PATCH": {
		"barcode": "barcode",
		"lid":"local ID",
		"label":"label",
		"FriendName":"Friend Name",
		"aid":"A id",
		"bid":"B id",
		"mtype": "media type",
		"color": "color"
	},
	"interrack": {
		"lid":"local ID",
		"zid":"zid",
		"boundle":"boundle",
		"sid":"sid",
		"rid":"rid",
		"mtype":"mtype"
	},
	"editSocketForm": {
		"FrmDetail": "Edit Socket Details"
	},
	"menus":{
		"CreatePatch": "Create patch",
		"AlertDeletePatch": "Delete this patch"
	}
};
const portColor={
	"free": 'g',
	"busy": 'r'
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
	"hightUnit": [12,20,24,30,32,38,40,42,44,45,46],
	"elementHigh":[1,2,3,4,5,6,7,8,9,10],
	"front_back" : ['F','R'],
	"elementType": ['missing'],
	"mtype": ['missing'],
	"sfp": ["GLC-T", "GLC-FE-100FX"," GLC-FE-100LX", "GLC-BX-x","GLC-SX","GLC-LH","GLC-ZX"],
	"sfpp":["GLC-T", "GLC-FE-100FX"," GLC-FE-100LX", "GLC-BX-x","GLC-SX","GLC-LH","GLC-ZX","SFP-10G-SR","SFP-10G-LRM","SFP-10G-LR","SFP-10G-RR","SFP-10G-ZR","SFP-10G-BXD-x"],
	"GLC-T" : {
		port: "UTP"
	}
};
const dataModelXA={
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
