
const fs = require('fs');
const path = require('path');

const string2srch = "container top_command top_commandx edit_mode ui-icon ui-icon-pencil job_id MsgSpace MainPage licPage labelX licenseStatusClass greenLicense licenseAdderClass addAdderButton datasetCont simpleTree-mainContainer simpleTree-nodeContainer simpleTree-indent simpleTree-toggle simpleTree-label simpleTree-childCountBadge badge badge-pill badge-secondary simpleTree-childrenContainer simpleTree-selected content box-inner rack-view rack-view-head rackIdCell ui-icon-lightbulb toogleHideable ui-icon-contact displayPatch ruIdCol rack-view-ele-id rack-element2 fas fa-lockx rack-element rack-view-ele-container rackDevice sockets readonly lid editable model SN lName elementType additionalCSS socketViewed smallCell busySocket socket img-vert normal freeSocket ui-draggable ui-draggable-handle ui-droppable Blank-Panel-u1 hideable freeElement elementTypeItem ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-dialog-buttons ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-dialog-title ui-button ui-button-icon-only ui-dialog-titlebar-close ui-button-icon ui-icon-closethick ui-button-icon-space dialog-loggedin ui-dialog-content ui-icon-alert forloggedin ui-dialog-buttonpane ui-dialog-buttonset ui-resizable login_form ui-resizable-handle ui-resizable-n ui-resizable-e ui-resizable-s ui-resizable-w ui-resizable-se ui-icon-gripsmall-diagonal-se ui-resizable-sw ui-resizable-ne ui-resizable-nw dialog-change-password dialog-form-element dialog-form-adder ui-helper-hidden-accessible flyTable Patch header lbl val FriendName pid lindex mtype barcode label aid bid type Color context-menu-list context-menu-root context-menu-item context-menu-icon context-menu-icon--fa5 far fa-edit fa-trash-alt fa-plus-square dialog-form-patch validateTips i-input i-mandatory text maybehide submit_patch patch_alert fa-plus-circle fa-sm fa-print".split(" ");


const directoryPaths = [path.join(__dirname, 'public','css')];

directoryPaths.forEach(function (dir){
	console.log ("to scan %s",dir);
	var files=fs.readdirSync(dir)
	
	files.forEach(function (file) {
		if ( fs.lstatSync(path.join(dir,file)).isFile() ){
			fs.readFile(path.join(dir,file), function (err, data) {
				// console.log("## -> %s",file);
				if (err) throw err;
				string2srch.forEach(function (strg){
					strg='.'+strg;
					// console.log(strg);
					if(data.indexOf(strg) >= 0){
						console.log("%s \tin\t%s",strg,file);
					}
				});
			});
		}
	});
});
