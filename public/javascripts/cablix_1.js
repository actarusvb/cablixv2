
var dataset;
var datasetName;
var treeJson;
var usedLicenseCounted;
var licensedRack;
var rackData = new Object();
var curNode;


$(function(){
	// VARS
	$("body").append('<span id="contex"></span>');

	var addPach,addelement,
		aid = $( "#aid" ),
		bid = $( "#bid" ),
		lid = $( "#lid" ),
		color = $( "#color" )
		allFields = $( [] ).add( aid ).add( bid ).add( color ),
		tips = $( ".validateTips" );

	/* dialog & form */	
	addelement= $( "#dialog-form-element" ).dialog({
		autoOpen: false,
		height: 815,
		width: 480,
		modal: true,
		buttons: {
			"Add" : addElementFunc,
			Cancel: function() {
				$(".efimero").remove();
				addelement.dialog( "close" );
			}
		},
		close: function() {
			// form[ 0 ].reset();
			$(".efimero").remove();
			allFields.removeClass( "ui-state-error" );
		}
    });
	addAdderDialog= $( "#dialog-form-adder" ).dialog({
		autoOpen: false,
		height: 315,
		width: 480,
		modal: true,
		buttons: {
			"Add" : addAdderFunc,
			Cancel: function() {
				addAdderDialog.dialog( "close" );
			}
		},
		close: function() {
			// form[ 0 ].reset();
			$(".efimero").remove();
			allFields.removeClass( "ui-state-error" );
			addAdderDialog.dialog( "close" );
		}
    });
	/* listener */
	$( document ).tooltip({
		items: "img, [data-geo], [title]",
		content: function() {
        var element = $( this );
        if ( element.is( "[data-geo]" ) ) {
          var text = element.text();
          return "--";
        }
        if ( element.is( "[title]" ) ) {
          return element.attr( "title" );
        }
        if ( element.is( "img" ) ) {
          return element.attr( "alt" );
        }
      }
	});
	$( document ).on("click", 'button.datasetele', function(e){
		console.log("click %s",'A3 click button.datasetele');
		e.preventDefault();
		dataset=$( this ).attr('id');
		datasetName=$( this ).text();
		// console.log("set domain ot: "+dataset);
		displayMessage("set domain to : "+dataset);
		createDatasetTree(dataset);
	});
	$( document ).on("click", '.rack-element.fa-edit', function(event) {
		event.preventDefault();
		formEditElement.dialog( "open" );
		formEditElement.dialog({height: formEditElementDetail.rackElementMod.height,
			width: formEditElementDetail.rackElementMod.width});

		console.log("click %s",'.rack-element 5');		
		
		var values = new Object();
		values.lid = $(this).parent().next().children("table").children("tbody").children("tr:first").children("td.readonly.lid").text();
		values.model = $(this).parent().next().children("table").children("tbody").children("tr:first").children("td.editable.model").text() || 'nn';
		values.SN = $(this).parent().next().children("table").children("tbody").children("tr:first").children("td.editable.SN").text() || 'nn';
		values.lName = $(this).parent().next().children("table").children("tbody").children("tr:first").children("td.editable.lName").text() || 'nn';
		values.elementType = $(this).parent().next().children("table").children("tbody").children("tr:first").children("td.readonly.elementType").text();
		
		$("#preFormEditElement").empty();
		$("#formElementContainer").empty();
		
		$("#formElementContainer").append('<h3>Detail</h3>');
		$("#formElementContainer").append('<input type="hidden" id=from_type" name="type" value="ELEMENT" />');
		$("#formElementContainer").append('<input type="hidden" id="form_dataset" name="dataset" value="'+dataset+'" />');
		$("#formElementContainer").append('<input type="hidden" id="form_lid" name="lid" value="'+values.lid+'"/>');
		$("#formElementContainer").append('<input type="hidden" id="form_subaction" name="subaction" value="edit" />');
		$("#formElementContainer").append('<button id="delete_subaction" name="x_subaction" class="deleteElement" value="delete">Delete Me!</button>');
		
		var notList = ["position","pid","lid","pid"];		
		for( var key of ["model","SN","lName"]){
			$("#formElementContainer").append('<label for="'+key +'">'+labels["ELEMENT"][key]+'</label><input id="'+key+'" name="'+key+'" value="'+values[key]+'"/>');
		}
	});
	$( document ).on("click", '.socketViewed.fa-edit', function(event){
		event.preventDefault();
		editSocketForm(this)
	});
	$( document ).on('click', 'button.deleteElement',function(event){
		event.preventDefault();
		console.log("push delete for %s in %s collection",$("#form_lid").val(),$("#form_dataset").val());
		
		if (confirm('Are you sure you want to DELETE this thing ?')) {
			$("#form_subaction").val('DELETE');
			console.log("%s for %s in %s collection",$("#form_subaction").val(),$("#form_lid").val(),$("#form_dataset").val());
			var jqxhr = $.ajax({
				type: "POST",
				url: "/elements/json/element/delete",
				data: $("#formEditElement").serializeArray(),
				headers: {"authorization": authenticateData.token,}
			});
			jqxhr.done(function(data){
				console.log("Delete on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
				refreshAuth(data.auth);
				if(data.retvalue == 1){
					set_userMode($("#edit_mode"),'edit');
					displayMessage("edit done ok retnum: "+data.retvalue+" retstring is: "+data.retstring );
					createAndPopulateRack($(".rackIdCell").text(),actionCreateRack);

				}else{
					displayMessage("Fail to edit retnum: "+data.retvalue+" retstring is: "+data.retstring );
				}
			});

			formEditElement.dialog( "close" );
			console.log('Thing was DELETED .');
		} else {
			formEditElement.dialog( "close" );
			console.log('Thing was not DELETE .');
		}
	});
	$( document ).on("click", 'a.rack-link', function(event) {
		event.preventDefault();
		console.log("click %s",'A5');
		var element=$( this ).attr('id');
		console.log("show pp in create patch: "+element);
		$(".tabsons-rack").addClass("no-show");
		$(".tabsons-rack#"+element+"-rack").removeClass("no-show").addClass("ok-show");
		$(".tabsons-rack#"+element+"-rack  > div.pp-form").removeClass("no-show").addClass("ok-show");
	});
	$( document ).on("click", '.table-space', function(event) {
		event.preventDefault();
		console.log("click %s",'A6');
		var element=$( this ).attr('id');
		console.log("show pp in create patch: "+element);
		$(".table-space").addClass("no-show");
		$("#"+element+"-pp").removeClass("no-show").addClass("ok-show");
		
	});
	$( document ).on("click", '.pp-form', function(event) {
		event.preventDefault();
		console.log("click %s",'A7');
		var element=$( this ).attr('id');
		console.log("show element in create patch: "+element);
		$(".table-space").addClass("no-show");
		$("#"+element).removeClass("no-show").addClass("ok-show");
		$("#"+element+" > .element-space").removeClass("no-show").addClass("ok-show");
		
	});
	$( document ).on("click", 'a.free.element-space-socket', function(event) {
		event.preventDefault();
		console.log("click %s",'A8');
		var element=$( this ).attr('id');
		console.log("select socket in create patch: "+element);
		$("#bid").val(element);
		$("#rack-space").html('');
	});
	$( document ).on("mousedown",'a.busy.element-space-base', function(event) {
		event.preventDefault();
		console.log("click %s",'A10');
		event.stopImmediatePropagation();
		event.stopPropagation();
		var element=$( this ).attr('id');
		console.log('Mouse button pressed: '+event.which+'. element is: '+element);
		switch (event.which){
			case 1:
				console.log('Left Mouse button pressed. aka ask action for '+element+'|'+$( this ).attr('id')+'|');
				$("#patchId").text($( this ).attr('id'));
				patchAction.dialog('open');
				break;
			case 2:
				console.log('Middle Mouse button pressed. Doing nothing');
				break;
			case 3:
				console.log('Right Mouse button pressed.');
				break;
			default:
				alert('You have a strange Mouse!');
		}
	});
	$( document ).on("click", 'a.rack', function(event) {
		/// nooooooo
		event.preventDefault();
		console.log("BADDDDDDD !!!!  click %s",'A11');
		var element=$( this ).parent().attr('id');
		console.log("start ask for rack elements: "+element);
		$("#object-view").html('');
		$.ajax({url: '/getData/data/js/elements/'+element, async: true, success: function(result){
			$("#object-view").html(create_rack(result.myself));
			result.elements.forEach(function(value,index){
				console.log("scan list rack inside index "+index+" e position value: "+value.position);
				$.ajax({url: '/getData/data/html/elementSmall/'+value.lid, async: true, success: function(resultInner){
					if(value.elementHigh > 1){
						var maxEle=value.position-value.elementHigh;
						for(var ix=value.position;ix>maxEle;ix--){
							$("#Rk-Rack0-"+ix).remove();
						}
						$("#Nm-Rack0-"+value.position).after('<td rowspan="'+value.elementHigh+'" id="Rk-'+element+'-'+value.position+'" class="rack-view-ele-container">large</td>');
					}
					$("#Rk-"+element+"-"+value.position).removeClass('hideable');
					$("#Rk-"+element+"-"+value.position).html(resultInner);
				}});
			});
		}});
	});
	$( document ).on("click", 'span.ui-icon-lightbulb', function(event) {
		displayMessage('start ask for rack elements: I got a click func');
		console.log("click %s",'A12');
		// $(".hideable").parents('tr').hide();
		$(".hideable").parents('tr').toggle();
	});
	$( document ).on("click", 'span.ui-icon-contact', function(event) {
		displayMessage('start ask for rack elements: I got a click func');
		console.log("click %s on rack %s",'A12.1',$(".rackIdCell").text());
		window.open('/elements/html/patches/'+dataset+'/'+$(".rackIdCell").text(), 'patches details', 'window settings');
	});
	$( document ).on("click", 'span.ui-icon-circle-plus',function(event){
		event.preventDefault();
		console.log("click %s",'A13');
		console.log("add child element form for:"+$(this).attr('id'));
		$("#addeletit").append('<span class="efimero" id="zid">'+$(this).attr('id')+'</span>');
		addelement.dialog( "open" );
	});
	$( document ).on("click", 'a#password_change', function(event){
		event.preventDefault();
		console.log("click %s",'A14');
		displayMessage('ask for password change: I got a click func');
		passwordChange.dialog( "open" );
	});
	$( document ).on("click", 'div#licenseAdder',function(e){
		event.preventDefault();
		console.log("click %s",'A24');
		displayMessage('ask for add adder: I got a click func');
		$("input#adderAuthCode").val("");
		$("input#adder-dataset").val("");
		addAdderDialog.dialog("open");
	});
	$( document ).on("click", 'a#logout_cablix', function(event){
		event.preventDefault();
		console.log("click %s",'A14');
		displayMessage('Logout');
		deAuth("logout");
		location.reload(true);
	});
	$( document ).on("change", "#eleType", function(event){
		console.log("eleType change to: "+$("#eleType").val());
		console.log("click %s",'A15');
		$(".formHidden").hide();
		switch($("#eleType").val()){
			case 'SITE' :
				$("#formSite").show();
				break;
			case 'BUILD' :
				$("#formBuild").show();
				break;
			case 'FLOOR' :
				$("#formFloor").show();
				break;
			case 'ZONE' :
				$("#formZone").show();
				break;
			case 'RACK' :
				$("#formRack").show();
				$("#formCommon").show();
				break;
			case 'ELEMENT' :
				$("#formElement").show();
				$("#formCommon").show();
				break;
			
		}
	})
});
function createAndPopulateRack(rackId,actionF){
	$.ajax({
		url: '/elements/json/rack/'+dataset+'/'+rackId,
		headers: {"authorization": authenticateData.token},
		method : "GET" })
	.done(function(data	) {
		if(data.auth.token){
			console.log("OKK 0x0023 i get token %s asking who am i --- %o",data.auth.token,data);
			refreshAuth(data.auth);
			if(data.rack){
				displayMessage("get /elements/json/rack/rackId ok: A01: "+data.id+" username: "+data.auth.username);
				$.ajax({
				url: '/elements/json/rack/'+dataset+'/'+data.rack.lid+'/child',
				headers: {"authorization": authenticateData.token},
				method : "GET" }
			).done(function(datar) {
				if(datar.auth.token){
					console.log("OK ox0024 i get token %s asking who am i",datar.auth.token);
					refreshAuth(datar.auth);
					displayMessage("get 009 /elements/json/rack/"+dataset+"/"+data.rack.lid+" child ok: 01: "+datar.id+" username: "+datar.username);
					datar.rack=data.rack;
					actionF(datar);
				}
			});
			}else{
				displayMessage('A-get /elements/json/rack/'+dataset+'/'+rackId+' return no rack');
			}
		}else{
			deAuth("A01");
		}
	})
	.fail(function(err){
		console.log("i got error here A8989: "+err); 
	});
};
function addAdderFunc (){
	console.log("Add dataset is: %s & addder code is ",dataset,$("#adderAuthCode").val());
	$("#form-form-adder").append('<input type="hidden" name="dataset" id="adder-dataset" value="'+dataset+'" />');
	
	console.log("wich form ? %o",$("#form-form-adder").serialize());
	var jqxhr = $.ajax({
		type: "POST",
		url: "/admin/Wr/license",
		data: $("#form-form-adder").serializeArray(),
		headers: {"authorization": authenticateData.token,}
	});
	jqxhr.done(function(data){
		console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
		refreshAuth(data.auth);
		if(data.retvalue == 1){
			set_userMode($("#edit_mode"),'edit');
			displayMessage("edit done ok retnum: "+data.retvalue+" retstring is: "+data.retstring );
			createDatasetTree(dataset);
		}else{
			displayMessage("Fail to edit retnum: "+data.retvalue+" retstring is: "+data.retstring );
		}
	});
	addAdderDialog.dialog("close");	
}
function actionCreateRack(datar){
	rackData= {};
	$("#object-view").html('');
	$("#object-view").html(create_rack(datar.rack));
	rackData[datar.rack.lid]= new  Object();
	console.log("rack added %s",datar.rack.lid);
	datar.elements.forEach(function(value,index){
		console.log("index %o e position value: %s",index,value.position);
		createElementHtml(dataset,datar,value,'Nm','Rk','normal');		
	});
}
function createElementHtml(dataset,datar,value,jqIdA,jqIdB,mode){
	console.log("0x00F0: value: dataset %s lid %s lid2 %s >> pos %s x&y %s & %s mode %s <<<",dataset,datar.rack.lid,value.lid,value.position,jqIdA,jqIdB,mode);
	$.ajax({
		url: '/elements/html/element/'+dataset+'/'+datar.rack.lid+'/'+value.lid+'/'+mode,
		async: true,
		headers: {"authorization": authenticateData.token},
		method : "GET" }
	).done(function(resultInner){
		// console.log("resultInner: %o",resultInner);
		console.log("jqIdB %s value.position %s value.elementHigh %s",jqIdB,value.position,value.elementHigh);
		if(value.elementHigh > 1){
			var maxEle=value.position-value.elementHigh;
			for(var ix=value.position;ix>maxEle;ix--){
				$("#"+jqIdB+"-"+datar.rack.lid+"-"+ix).remove();
			}
			$("#"+jqIdA+"-"+datar.rack.lid+"-"+value.position)
				.after('<td rowspan="'+value.elementHigh+'" id="'+jqIdB+'-'+datar.rack.lid+'-'+value.position+'" class="rack-view-ele-container">large</td>');
		}
		console.log("0x00F2: add content to cell %s - %s %s",jqIdB,datar.rack.lid,value.position)
		$("#"+jqIdB+"-"+datar.rack.lid+"-"+value.position).removeClass('hideable');
		$("#"+jqIdB+"-"+datar.rack.lid+"-"+value.position).html(resultInner.htmlData);
		
		$.ajax({
			url: '/elements/json/element/'+dataset+'/'+datar.rack.lid+'/'+value.lid+'/BLOCK',
			async: true,
			headers: {"authorization": authenticateData.token},
			method : "GET" }
		).done(function(dataBlock){
			console.log("=X4545 dataBlock Rack %s Ele %s  %o",dataBlock.req.rackId ,dataBlock.req.eleId ,dataBlock);
			// rackData[dataBlock.req.rackId]= new  Object();
			rackData[dataBlock.req.rackId][dataBlock.req.eleId]= new  Object();
			
			rackData[dataBlock.req.rackId][dataBlock.req.eleId]=dataBlock.socketsData;
			if(dataBlock.socketsData !== undefined){
				dataBlock.socketsData.forEach(function(me){
					console.log("=X4545 me -> lid %s  socketData.me %o",me.lid,me);
					var addClass='smallCell ';					
					var html='';
					var sockStatus='';
									
					var alt='<table class=\'flyTable Patch\'><tr><td colspan=\'2\'>MAIN</td></tr>'
						+'<tr><td>lName</td><td class=\'lName\'>'+me.lName+'</td></tr>'
						+'<tr><td>FriendName</td><td class=\'FriendName\'>'+me.FriendName+'</td></tr>'
						+'<tr><td>lid</td><td class=\'lid\'>'+me.lid+'</td></tr>'
						+'<tr><td>pid</td><td class=\'pid\' id=\'pid-'+me.lid+'\'>'+me.pid+'</td></tr>'
						+'<tr><td>lindex</td><td>'+me.lindex+'</td></tr>'
						+'<tr><td>mtype</td><td>'+me.mtype+'</td></tr>';
					///  QUI !!!
					addClass=(me.lindex % 2 < 1)? addClass=addClass.concat(' img-vert '):addClass;

					if(me.patches.length > 0){
						sockStatus='r';
						addClass=addClass.concat(' busySocket ');
						alt = alt +'<tr><td colspan=\'2\'><hr></td></tr>'
							+'<tr><td colspan=\'2\'>Patch data</td></tr>'
							+'<tr><td>barcode</td><td>'+me.patches[0].barcode+'</td></tr>'
							+'<tr><td>lid</td><td>'+me.patches[0].lid+'</td></tr>'
							+'<tr><td>label</td><td>'+me.patches[0].label+'</td></tr>'
							+'<tr><td>FriendName</td><td>'+me.patches[0].FriendName+'</td></tr>'
							+'<tr><td>aid</td><td>'+me.patches[0].aid+'</td></tr>'
							+'<tr><td>bid</td><td>'+me.patches[0].bid+'</td></tr>'
							+'<tr><td>mtype</td><td>'+me.patches[0].mtype+'</td></tr>'
							// +'<tr><td>type</td><td>'+me.patches[0].type+'</td></tr>'
							+'<tr><td>color</td><td>'+me.patches[0].Color+'</td></tr>';
						
					}else{
						sockStatus='g';
						addClass=addClass.concat(' '+mode+' freeSocket ');
					}
					var icon='/img/'+me.mtype+'-'+sockStatus+'.png';
					alt=alt+'</table>';
					html='<span id="'+me.lid+'-'+mode+'" class="socketViewed '+addClass+'"><img alt="'+alt+'" class="'+addClass+'" src="'+icon+'" /></span>';
					// console.log("WWWWW me.lid %s mode %s",me.lid,mode);
					$("#"+me.lid+'-'+mode).replaceWith(html);
				});
		}else{
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! %s missing socketsData",dataBlock.req.eleId);
		}
		$.contextMenu({
				selector: '.socketViewed.smallCell.freeSocket', 
				callback: function(key, options) {
					switch (key){
						case 'addpatch':{
							console.log("add patch @ %s",$(this).attr('id'));
							beginAddPatch(this);
						}
						break;
						case 'editinfo':{
							console.log("Edit info @ %s",$(this).attr('id'));
							editSocketForm(this);
						}
						break;
					}
				},
				items: {
					"addpatch": {name: "Add Patch", icon: "fas far fa-plus-circle"},
					"editinfo": {name: "Edit Info", icon: "far fa-edit"},
				}
			});
			$.contextMenu({
				selector: '.socketViewed.smallCell.busySocket', 
				callback: function(key, options) {
					switch (key){
						case 'printPatch':{
							console.log("print patch @ %s",$(this).attr('id'));
							window.open('/elements/html/patch/'+dataset+'/'+$(this).attr('id').replace("-normal",""), 'patch details', 'window settings');
						}
						break;
						case 'deletePatch':{
							console.log("delete patch @ %s",$(this).attr('id').replace("-normal",""));
							$("#patchId").text($(this).attr('id').replace("-normal",""));
							delPatch.dialog("open");
						}
						break;
					}
				},
				items: {
					"deletePatch": {name: "Delete Patch", icon: "fas far fa-trash-alt fa-sm"},
					"printPatch": {name: "Print Patch", icon: "fas far fa-print fa-sm"}
				}
			});
		});
	});
}
function localEscape(string){
	return String(string).replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
	});
}
function formatTable(blockData){
	var tableS="<table class='flyTable Patch'><tr><th colspan='2'>MAIN</th></tr>";
	$.each(labelMain,function(k,v){
		tableS=tableS.concat('<tr><td>'+v+'</td><td>'+blockData[k]+'</td></tr>');
	});
	if( blockData.patchData.length !==  0){
		tableS=tableS.concat("<tr><th colspan='2'>Patch Data</th></tr>");
		$.each(patch,function(k,v){
			tableS=tableS.concat('<tr><td>'+v+'</td><td>'+blockData.patchData[0][k]+'</td></tr>');
		});
	}
	return tableS.concat('</table>');
};
function loadDatasetList(container){
	// console.log("hummm");
	$("#page").append('<div id="datasetContainer"  class="datasetCont"></div>');
	$("#datasetContainer").append('<h3>Select Dataset please</h3>');
	authenticateData.dataset.forEach(function(datasetx){
		resolveDataset(datasetx,function(resolDataset){
			$("#datasetContainer").append('<p><button id="'+datasetx+'" class="datasetele">'+resolDataset+'</button></p>');
		});
	});
}
function resolveDataset(dataval,callback){
	var jqxhr = $.ajax({
		url: '/tree/json/dataset/resolve/'+dataval,
		async: true, 
		success: function(result){
			callback(result.datasetLabel);
		}
	});
}
function updateTips( t ) {
  tips
	.text( t )
	.addClass( "ui-state-highlight" );
  setTimeout(function() {
	tips.removeClass( "ui-state-highlight", 1500 );
  }, 500 );
}
function checkLength( o, n, min, max ) {
  if ( o.val().length > max || o.val().length < min ) {
	o.addClass( "ui-state-error" );
	updateTips( "Length of " + n + " must be between " +
	  min + " and " + max + "." );
	return false;
  } else {
	return true;
  }
}
function checkRegexp( o, regexp, n ) {
  if ( !( regexp.test( o.val() ) ) ) {
	o.addClass( "ui-state-error" );
	updateTips( n );
	return false;
  } else {
	return true;
  }
}
function addElementFunc(){
	// noooooo
	var valid = true;
	displayMessage('BAD BAD BAD submited');

	allFields.removeClass( "ui-state-error" );
	$("#form-add-element").append('<input name="pid" id="pid" value="'+$("span#zid").text()+'"/>');

	if ( valid ) {
		var jqxhr = $.post("/setData/v1/post/element/add",$("#form-add-element").serialize());
		jqxhr.done(function(data){
			console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
			if(data.retvalue == 1){
				displayMessage('done');
				$.ajax({url: '/getData/data/html/element/'+$("#disp_lid").text(), async: true, success: function(result){
					$("#object-view").html(result);
				}});
			}else{
				displayMessage("error 011: "+data.retstring );
			}
		},"json");
		jqxhr.fail(function(data){
			displayMessage("error 012 retvalue is: "+data.retvalue+" retstring is "+data.retstring);
		},"json");
		addPach.dialog( "close" );
	}else{
		displayMessage('wrong data in form!');
	}
	$("input#pid").remove();
	$(".efimero").remove();
	return valid;
}
function create_rack(rackdesc){
	var rack=
		'<table class="rack-view" id="Rck-'+rackdesc.lid+'">'+
		'<tr><th></th><th><span id="roomId">'+rackdesc.pid+'</span></th></tr>'+
		'<tr class="rack-view-head">'+
		'<th colspan="1" class="rack-view-head"><span class="rackIdCell">'+rackdesc.lid+'</span></th><th class="rack-view-head"> '+rackdesc.lName+' <span class="ui-icon ui-icon-lightbulb toogleHideable"></span>||<span class="ui-icon ui-icon-contact displayPatch"></span></th>'+
		'</tr>';
	for(var i=rackdesc.hightUnit;i>0;i--){
		rack=rack.concat('<tr id="tr-'+i+'" class="ruIdCol"><td id="Nm-'+rackdesc.lid+'-'+i+'" class="rack-view-ele-id"><div class="rack-element fas fa-lockx"> '+i+'</div></td><td id="Rk-'+rackdesc.lid+'-'+i+'" class="rack-view-ele-container hideable">Free</td></tr>');
	}
	return rack.concat('</table>');
}
function createDatasetTree(currentDataset){
	// $("#datasetContainer").remove();
	$("#page").empty();
	$("#page").append('<div id="ppage">'+datasetName+':</div>');
	$("#ppage").append('<div id="licenseStatus" class="licenseStatusClass" />');
	$("#ppage").append('<div id="licenseAdder" class="licenseAdderClass"><button id="showAdderForm" class="addAdderButton">Add license</button></div>');
	$("#ppage").append(
		"<div id='cablixTreeCont' class='datasetCont'>"
			+"<div id='cablixTree'></div>"
		+"</div>");
	$("#page").append(
		"<div id='content' class='content'>"
			+"<div id='box'><div id='box'inner' class='box-inner'>"
				+"<div id='box-header'>"
					+"<h1>cablix 1.0</h1>"
				+"</div>"
				+"<div id='object-view'></div>"
			+"</div>"
		+"</div>");
	$("#page").append("<div id='rightCont' class='content'><ul id='elementTypeList'></ul></div>");

	$.ajax({
		url: '/admin/Rd/dataset/'+currentDataset,
		headers: {"authorization": authenticateData.token},
		method : "GET" })
	.done(function(data){
		if(data.auth.token){
			console.log("OKK i get token %s asking who am i",data.auth.token);
			authenticateData.token=data.auth.token;
			usedLicenseCounted=data.usedLicenseCounted;
			licensedRack=data.licensedRack;
			displayMessage("get license detail for domain ok: 01: "+data.liceseStat);
			csstype = (usedLicenseCounted < licensedRack) ?
				'greenLicense' : 'redLicense';
			$("#licenseStatus").html('<span class="'+csstype+'">'+usedLicenseCounted+'/'+licensedRack+'</span>');
			$("#licenseStatus").addClass(csstype);
		}else{
			deAuth("createDatasetTree/license")
		}	
	})
	.fail(function(err){
		console.log("i got error here 8989: "+err); 
	}); 
	$.ajax({
		url: '/tree/json/tree/'+currentDataset,
		headers: {"authorization": authenticateData.token},
		method : "GET" })
	.done(function(data	) {
		if(data.auth.token){
			console.log("OKK i get token %s asking who am i",data.auth.token);
			authenticateData.token=data.auth.token;
			displayMessage("get /user/current ok: 01: "+data.id+" username: "+data.auth.username);
			treeJson=data.tree[0];
			console.log("tree data available : %o",treeJson);
			displayMessage("tree data available");
			// $('#cablixTree').simpleTree({startCollapsed: false},data.tree).on('simpleTree:click', function(eventNode,node){
			$('#cablixTree').simpleTree({startCollapsed: false},data.tree).on('simpleTree:change', function(eventNode,node){
				console.log("click %s  \neventNode : %o \nnode: %o",'A4',eventNode,node);
				if(userMode === 'view'){
					createAndPopulateRack(node.value,actionCreateRack);
				}else if (userMode === 'edit'){
					curNode=node;
				}
			});					
		}else{
			deAuth("createDatasetTree")
		}
	})
	.fail(function(err){
		console.log("i got error here 8989: "+err); 
	}); 
	$.ajax({
		url: "/elements/json/elementTypeList/"+dataset,
		headers: {"authorization": authenticateData.token,},
		type: "GET"})
	.done(function(data){
		console.log("ok done retvalue is: "+data.retvalue+" retstring is "+data.retstring+" eee data %o",data.data);
		var elementTypeList = data.data;
		for (const [key, value] of Object.entries(elementTypeList)) {
			// console.log(key+" << e value: "+value["description"]);
			$("#elementTypeList").append('<li><b>'+key+'</b> '+value["description"]+'</li>');								
		}
	})
	.fail(function(err){
		console.log("i got error here 9087: "+err); 
	});
}
function editSocketForm(that){
	formEditElement.dialog( "open" );
	formEditElement.dialog({height: formEditElementDetail.editSocketForm.height,
		width: formEditElementDetail.editSocketForm.width});
	console.log("click %s .socketViewed mi %s AKA %s","ooooo",$(that).attr("id"),$(that).attr("id").replace("-normal",""));		
	
	$("#preFormEditElement").empty();
	$("#formElementContainer").empty();
	
	var rackId=$(".rackIdCell").text();
	var eleId = $(that).parent().parent().parent().parent().children("tbody").children("tr:first").children("td.readonly.lid").text();
	var socketId= $(that).attr("id").replace("-normal","");
	
	$("#formElementContainer").append('<h3>Detail</h3>');
	$("#formElementContainer").append('<input type="hidden" id=from_type" name="type" value="SOCKET" />');
	$("#formElementContainer").append('<input type="hidden" id="form_dataset" name="dataset" value="'+dataset+'" />');
	$("#formElementContainer").append('<input type="hidden" id="form_subaction" name="subaction" value="edit" />');
	$("#formElementContainer").append('<input type="hidden" id="pid" name="pidx" value="fake" />');
	$("#formElementContainer").append('<input  id="lid" name="lid" readonly value="'+socketId+'"/>');
	
	console.log("rackId %s eleId %s  socketId %s",rackId,eleId,socketId);
	
	var values = new Object();
	rackData[rackId][eleId].forEach(function(value,index){
		if(value.lid === socketId){
			values.lName=value.lName;
			values.FriendName=value.FriendName;
		}
	});
	for( var key of ["lName","FriendName"]){
		$("#formElementContainer").append('<label for="'+key +'">'+labels["SOCKET"][key]+'</label><input id="'+key+'" name="'+key+'" value="'+values[key]+'"/>');
	}
}
