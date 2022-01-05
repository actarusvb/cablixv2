var righeTable;
var collectionsTable;
var licenseTable;
var userDetails;
var formUser;
var formUserAdd;
	
$(function(){
	// $(".the-users").hide();
	$("body").append('<span id="context" class="no-show"></span>');
	$(".top_command#access_admin").click(function(event){
		event.preventDefault();
		console.log("click %s",'AD1');
		$("#pageAdmin").empty();
		$("#context").text("admin");
		
		if( authenticateData && authenticateData.token){   // already authenticate
			loginDialog.dialog( "close" );
			console.log("authenticateData %o",authenticateData);
			loadAdmin();
		}else{
			// let authenticateData_tmp=sessionStorage.getItem("cabjs-admin");
			console.log("authenticateData not available");
			if( sessionStorage.getItem("cabjs-admin") !== null) {
				console.log("authenticateData in local storage: %o",sessionStorage.getItem("cabjs-admin"));
				authenticateData=sessionStorage.getItem("cabjs-admin");
			}else{
				loginDialog.dialog( "open" );
			}
		}
	});
	$( document ).on("click",".fa-user-plus", function() {
		formUserAdd.dialog( "open" );
	});
	$( document ).on("click",".fa-trash", function(e){
		e.preventDefault();
		// var i=; // rowIdE1
		let userDetails=righeTable.data()[$(this).attr('id').substr(6)];
		console.log("mu schicci %s o %o",$(this).attr('id'),userDetails);
		if(window.confirm("Delete "+userDetails.cabId+' -->'+userDetails.username)){
			$.ajax({
				url: '/admin/D/'+userDetails._id,
				headers: {"authorization": authenticateData.token},
				type: 'post',
				contentType: 'application/json',
				processData: false,
				success: function( data, textStatus, jQxhr ){
					refreshAuth(data.auth);
					righeTable.ajax.reload();
					console.log("OK");
				},
				error: function( jqXhr, textStatus, errorThrown ){
					console.log( errorThrown );
				}
			});
		}else{
			righeTable.ajax.reload();
		}
	});
	$( document ).on("click",".fa-tools", function(e){
		e.preventDefault();
		var i=$(this).attr('id').substr(6); // rowIdE1
		 userDetails=righeTable.data()[i];
		console.log("userDetails block %o",userDetails);
		var valx;
		$.each(["-_id","-cabId","editUsername","editPassword","#dataset"],function(index,value){
			if(value.startsWith("-")){
				value=value.substr(1);
				valx=value;
			}else if(value.startsWith("#")){
				value=value.substr(1);
				var valx0=userDetails[value];
				userDetails[value]=valx0.join(',');
				
				valx=value;
			}else if(value === "editUsername"){
				valx="username";
			}else if(value === "editPassword"){
				valx="password";
			}
			console.log("UserDetail %s - v %s",value,userDetails[value]);
			$("input#"+value).val(userDetails[valx]);
		});
		(userDetails.isAdmin === true) ?
			$("#isAdmin").prop("checked",true) :
			$("#isAdmin").prop("checked",false);
			
		$("#datasetRbac thead").empty();
		$("#datasetRbac tbody").empty();				
		$("#datasetRbac thead").append('<tr><th>-</th><th>'+roles.join('</th><th>')+'</th></tr>');
		$.each(userDetails.dataset.split(','),function(index,val){
			var rowt='';
			// QUI 
			$("input#dataset").append('<li>'+val);
			$.each(roles,function(index,vale){
				rowt = rowt.concat($.inArray(vale,userDetails.rbac[val]) >= 0 ?
					'<td id="'+val+':'+vale+'"><i class="valTogleable fas fa-check"></i></td>' :
					'<td id="'+val+':'+vale+'"><i class="valTogleable fas fa-times"></i></td>');
			});
			$("#datasetRbac tbody").append('<tr id="dts-'+val+'"><td>'+val+'</td>'+rowt+'</tr>');
		});
		formUser.dialog('open');		
	});
	$( document ).on("click",".valTogleable", function(e){
		e.preventDefault();
		var iconx;
		var ffunc = $(this).parent().attr('id').split(/:/)[1];
		var ddomain = $(this).parent().attr('id').split(/:/)[0];
		
		if(typeof userDetails.rbac[ddomain] == "undefined"){
			userDetails.rbac[ddomain]= new Array();
		}

		if($(this).hasClass('fa-check')){
			iconx='<i class="valTogleable fas fa-times"></i>';
			userDetails.rbac[ddomain].splice( userDetails.rbac[ddomain].indexOf(ffunc),1);
		}else{
			iconx='<i class="valTogleable fas fa-check"></i>';
			userDetails.rbac[ddomain].push(ffunc);
		}
		$(this).parent().html(iconx);
	});
	formUserAdd = $( "#formUser-add" ).dialog({
		autoOpen: false,
		height: 600,
		width: 650,
		modal: true,
		buttons: {
			"Add": addUser,
			Cancel: function() {
				formUser.dialog( "close" );
			}
		},
		close: function() {
			form[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});
	formUser = $( "#formUser-form" ).dialog({
		autoOpen: false,
		height: 600,
		width: 650,
		modal: true,
		buttons: {
			"Update": updateUser,
			Cancel: function() {
				formUser.dialog( "close" );
				righeTable.ajax.reload();
			}
		},
		close: function() {
			form[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});
	form = formUser.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
		updateUser();
	});

});
function loadAdmin(){
	console.log("Auth token is :%s",authenticateData.token);
	$("#pageAdmin").append('<div id="tabsAdmin" />');
	$("#tabsAdmin").append('<ul id="tabsAdmin-ul" />');
	$("#tabsAdmin-ul").append('<li><a href="#tabsAdmin-userTable">users</a></li>');
	$("#tabsAdmin-ul").append('<li><a href="#tabsAdmin-licenseDash">license dash</a></li>');
	$("#tabsAdmin-ul").append('<li><a href="#tabsAdmin-licenseTable">license table</a></li>');
		
	$("#tabsAdmin").append('<div id="tabsAdmin-userTable" />');
	$("#tabsAdmin").append('<div id="tabsAdmin-licenseDash" />');
	$("#tabsAdmin").append('<div id="tabsAdmin-licenseTable" />');
	
	$("#tabsAdmin-userTable").append('<div id="the-userTable" class="normalDiv"><table id="userTable"><thead><tr><th>cabid</th><th>username</th><th>dataset</th></tr></thead><tbody></tbody></table></div>');
	$("#the-userTable").after('<div class="normalDiv"><i class="fas fa-user-plus"></i></div>');
	$("#the-userTable").append('<div id="the-collectionsTable" class="normalDiv"><table id="collectionsTable"><thead><tr><th>name</th></tr></thead><tbody></tbody></table></div>');
	
	$("#tabsAdmin-licenseDash").append('<div id="the-licenseDash"/>');
	// $("#tabsAdmin-licenseDash").append('<div id="the-licenseDash"/>');

	$("#tabsAdmin-licenseTable").append('<div id="the-licenseTable" class="normalDiv">'+
	'<table id="licenseTable"><thead><tr><th>id</th><th>uuid</th><th>type/size</th><th>domain</th><th>creation</th><th>burn</th><th>burner</th></tr></thead><tbody></tbody></table></div>');
	
	
	$( "#tabsAdmin" ).tabs();
	// user zone
	righeTable=$('#userTable').DataTable({
		"ajax": {
			"url": '/admin/R'
			,"dataSrc": "data"
			,"type" : "GET"
			,"beforeSend": function (xhr) {
				xhr.setRequestHeader("Authorization",authenticateData.token);
			}
		}
		,"pageLength": 50
		,"columns": [
			 { "data": "cabId" }
			,{ "data": "username" }
			,{ "data": "dataset" , "defaultContent": ""}
		]
		,"order": [[ 0, "desc" ]]
		,"columnDefs": [ {
			"targets": 0,
			"data": "cabId",
			"render": function ( data, type, row, meta ) {
				return '<button ><i class="fas fa-trash" id="rowIdT'+meta.row+'"></i></button> <button ><i class="fas fa-tools" id="rowIdE'+meta.row+'"></i></button> '+data
			}
		}]
	});
	collectionsTable=$('#collectionsTable').DataTable({
		"ajax": {
			"url": '/admin/LC'
			,"dataSrc": "data"
			,"type" : "GET"
			,"beforeSend": function (xhr) {
				xhr.setRequestHeader("Authorization",authenticateData.token);
			}
		}
		,"pageLength": 50
		,"columns": [
			 { "data": "name" }
			// ,{ "data": "options" }
			// ,{ "data": "dataset" , "defaultContent": ""}
		]
		,"order": [[ 0, "desc" ]]
		// ,"columnDefs": [ {
			// "targets": 0,
			// "data": "cabId",
			// "render": function ( data, type, row, meta ) {
				// return '<button ><i class="fas fa-trash" id="rowIdT'+meta.row+'"></i></button> <button ><i class="fas fa-tools" id="rowIdE'+meta.row+'"></i></button> '+data
			// }
		// }]
	});
	licenseTable=$("#licenseTable").DataTable({
		"ajax": {
			"url": '/admin/Rd/license/all'
			,"dataSrc": "data"
			,"type" : "GET"
			,"beforeSend": function (xhr) {
				xhr.setRequestHeader("Authorization",authenticateData.token);
			}
		}
		,"pageLength": 50
		,"columns": [
			 { "data": "id" }
			,{ "data": "uuid" }
			,{ "data": "size" }
			,{ "data": "domain", "defaultContent": ""}
			,{ "data": "creation" }
			,{ "data": "burn" , "defaultContent": ""}
			,{ "data": "burnname" , "defaultContent": ""}
		]
		,"order": [[ 0, "asc" ]]
		
	});
	
	
	// license zone
	$("#the-licenseDash").append('<div class="liBlock" id="license-last" />');
	$("#the-licenseDash").append('<div class="liBlock" id="license-g3" />');
	$("#the-licenseDash").append('<div class="liBlock" id="license-g5" />');
	$("#the-licenseDash").append('<div class="liBlock" id="license-g10" />');
	$("#the-licenseDash").append('<div class="liBlock" id="license-tot" />');
	$("#the-licenseDash").append('<br>');
	$("#the-licenseDash").append('<div class="coBlock" id="collections-tot" />');
	
	// $("#license-tot").append('<p>xxxx</p>');
	$("#collections-tot").html("Racks :<br>");
	
	$.ajax({
		url: '/admin/Rd/license/summary/lastid',
		headers: {"authorization": authenticateData.token},
		dataType: 'json',
		type: 'get',
		contentType: 'application/json',
		data: JSON.stringify(userDetails),
		processData: false,
		success: function( data, textStatus, jQxhr ){
			console.log("OK get data %o",data);
			refreshAuth(data.auth);
			$("#license-last").html('<p>Last license id: '+data.license+'</p>');
			$.each(data.listOfLicense,function(index,val){
				$.ajax({
					url: '/admin/Rd/license/summary/statLicense/'+val.sizes,
					headers: {"authorization": authenticateData.token},
					dataType: 'json',
					type: 'get',
					contentType: 'application/json',
					data: JSON.stringify(userDetails),
					processData: false,
					success: function( datas, textStatus, jQxhr ){
						console.log("OK get datas %o",datas);
						refreshAuth(datas.auth);
						$("#license-g"+val.sizes).html('<p>License size '+val.sizes+':<br><span class="liFigures">'+datas.listOfLicenseInuse.inuse+'/'+datas.listOfLicenseFree.free+'</span></p>');
					}
				});
			});
		},
		error: function( jqXhr, textStatus, errorThrown ){
			console.log( errorThrown );
		}
	});
	$.ajax({
		url: '/admin/Rd/dataset/summary',
		headers: {"authorization": authenticateData.token},
		dataType: 'json',
		type: 'get',
		contentType: 'application/json',
		data: JSON.stringify(userDetails),
		processData: false,
		success: function( data, textStatus, jQxhr ){
			console.log("OK get data %o",data);
			refreshAuth(data.auth);
			$.each(data.collections,function(index,val){
				$("#collections-tot").append('<span class="coFigures">'+data.collectionsName[index]+' : '+val+'</span><br>');
			});
		}
	});
}
var dialog, form,
	// From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
	// emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
	// namex = $("#editUsername"),
	email = $( "#email" ),
	// password = $("#password"),
	// addUsername = $( "#addUsername"),
	// dataset =  $( "#dataset" ),
	allFields = $( [] ).add( $("#editUsername") ).add( $("#password") ),
	tips = $( ".validateTips" );

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
function addUser() {
	var valid = true;
	allFields.removeClass( "ui-state-error" );

	valid = valid && checkLength( $("#addUsername"), "addUsername", 3, 16 );
	if ( valid ) {
		console.log("Add %o",userDetails);
		$.ajax({
			url: '/admin/C',
			dataType: 'json',
			headers: {"authorization": authenticateData.token},
			type: 'post',
			contentType: 'application/json',
			data: '{"username": "'+$("#addUsername").val()+'"}',
			processData: false,
			success: function( data, textStatus, jQxhr ){
				console.log("OK");
				refreshAuth(data.auth);

			},
			error: function( jqXhr, textStatus, errorThrown ){
				console.log( errorThrown );
			}
		});
		righeTable.ajax.reload();
		formUserAdd.dialog( "close" );
	}
	return valid;
}
function updateUser() {
	var valid = true;
	allFields.removeClass( "ui-state-error" );

	valid = valid && checkLength( $("#editUsername"), "username", 3, 16 );
	valid = valid && checkLength( $("#editPassword"), "password", 5, 16 );

	valid = valid && checkRegexp( $("#editUsername"), /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
	// valid = valid && checkRegexp( $("#editPassword"), /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
	
	valid = valid && checkLength( $("#dataset"), "dataset", 3, 160 );
	
	userDetails.dataset=$("#dataset").val().split(',');
	userDetails.password=$("#editPassword").val();
	userDetails.isAdmin=$("#isAdmin").prop("checked");
	if ( valid ) {
		console.log("Save %o",userDetails);
		$.ajax({
			url: '/admin/U/'+userDetails.username,
			headers: {"authorization": authenticateData.token},
			dataType: 'json',
			type: 'post',
			contentType: 'application/json',
			data: JSON.stringify(userDetails),
			processData: false,
			success: function( data, textStatus, jQxhr ){
				// $('#response pre').html( JSON.stringify( data ) );
				console.log("OK");
				refreshAuth(data.auth);

			},
			error: function( jqXhr, textStatus, errorThrown ){
				console.log( errorThrown );
			}
		});
		righeTable.ajax.reload();
		formUser.dialog( "close" );
	}
	return valid;
}
