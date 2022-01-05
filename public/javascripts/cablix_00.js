var loginDialog;
var loggedInDialog;
var authenticateData= new Object();
var patchtLabelForm=1;
var passwordChange;

$(function(){
	setTimeout(function(){
		console.log("start clean text");
		$('#object-view').html('');
		$("#page").empty();
		deAuth("start");
		console.log("end clean text");
	}, 1000);
	// $('nav>ul').lavazi({
		// options
		// background:"#d30043",
		// transitionTime:'1000',
		// theme:'arrow'
	// });
	$("#logout_cablix").hide();
	$("#password_change").hide();
	$("#edit_mode").hide();
	
	$(".top_command#access_cablix").click(function(event){
		event.preventDefault();
		console.log("click %s",'A1');
		$("#page").empty();
		$("#context").text("users");

		if( authenticateData && authenticateData.token){   // already authenticate
			loginDialog.dialog( "close" );
			console.log("authenticateData %o",authenticateData);
			loadDatasetList($("#page"));
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
	loggedInDialog=$( "#dialog-loggedin" ).dialog({
		autoOpen: false,
		resizable: false,
		height: "auto",
		width: 400,
		modal: true,
		buttons: {
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	loginDialog=$("#login_block").dialog({
		autoOpen: false,
		height: 215,
		width: 400,
		modal: true,
		buttons: {
			"login" : function() {
				if($("#username").val() && $("#password").val() ){ 
					doLogin(function(username){
						loginDialog.dialog( "close" );
						$("#logout_cablix").after('|<a class="top_command" id="loggedIn" href="javascript:void(0);">'+username+' Logged In!</a>');
						$(document).on("click","#loggedIn",function(){
							console.log("click %s",'A2');
							listCurrentUser();
						});
						$("#logout_cablix").show();
						$("#password_change").show();
						$("#edit_mode").show();
						$("#admin_change").show();
						$("#page").empty();
						if($("#context").text() === "admin"){
							loadAdmin($("#page"));
						}else{
							loadDatasetList($("#page"));
						}
					});
				}else{
					displayMessage("username or password can't be empty");
					$("#loginMessage").text("username or password can't be empty");
					setTimeout(function () {
						$( "#loginMessage" ).text('');
					}, 4000);
				}
			},
			"Cancel" : function() {
				loginDialog.dialog( "close" );
			}
		},
		close: function() {
			loginDialog.dialog( "close" );
		}
		
	});
	passwordChange = $( "#dialog-change-password" ).dialog({
		autoOpen: false,
		height: 400,
		width: 580,
		modal: true,
		buttons: {
			"Change password": ChangePass,
			Cancel: function() {
				passwordChange.dialog( "close" );
			}
		},
		close: function() {
		}
	});
});
function patchtLabel(){
	if(patchtLabelForm == 1){
		return $("#aid").val()+'::'+$("#bid").val();
	}else if(patchtLabelForm == 2){
		return $("#arack").val()+':'+$("#aru").val()+':'+$("#aele").val()+':'+$("#aid").val()+'::'+$("#bid").val()+':'+$("#bele").val()+':'+$("#bru").val()+':'+$("#brack").val();
	}else{
		return $("#aid").val()+':|:'+$("#bid").val();		
	}
}
function set_userMode(that,OLDmode){
	userMode = (OLDmode === 'view') ?
		'edit' :
		'view';
	that.removeClass("edit_mode");
	that.removeClass("edit_modered");

	// $(".licenseAdder").html('');
	
	$(".rack-element").removeClass("fa-lock")
	$(".rack-element").removeClass("fa-edit")
	$(".socketViewed").removeClass("fa-lock")
	$(".socketViewed").removeClass("fa-edit")		
	$(".simpleTree-label").removeClass("simpleTree-label-editable");
	
	that.addClass(
		(userMode === 'view') ?
			'edit_mode' :
			'edit_modered'
	);
	
	$(".rack-element").addClass(
		(userMode === 'view') ?
			'fa-lockx' :
			'fa-edit '
	);
	$(".socketViewed").addClass(
		(userMode === 'view') ?
			'fas ' :
			'fas fa-edit'
	);
	$(".simpleTree-label").addClass(
		(userMode === 'view') ?
			'' :
			'simpleTree-label-editable'
	);
	// $("#licenseAdder").html(
		// (userMode === 'view') ?
			// '' :
			// '<button id="showAdderForm" class="addAdderButton">Add license</button>'
	// );		
	displayMessage("userMode is: "+userMode);
}
function doLogin(action){
	console.log("Login serialized form: "+$('form#login_form').serialize());
	authenticateData='';
	$.post( '/users/authenticate', $('form#login_form').serialize(), function(data) {
		console.log("doLogin receive %o",data);
		if(data.auth.errno >= 0 && data.auth.token){
			console.log("Login OK %o",data);
			// authenticateData=data;
			if(data.auth.patchtLabelForm > 0) patchtLabelForm=data.auth.patchtLabelForm;
			refreshAuth(data.auth);
			action(data.auth.username);
		}else{
			$("#loginMessage").text("Wrong user/password");
			deAuth("doLogin 00")
		}
	},'json').fail(function() {
			deAuth("doLogin 01");
	});
}
function listCurrentUser(){
	$.ajax({
		url: '/users/current',
		headers: {"authorization": authenticateData.token},
		method : "GET"
	})
	.done(function(data	) {
		if(data.auth.token){
			console.log("OKK i get when asking who i am :%o",data);
			refreshAuth(data.auth);
			displayMessage("get /user/current ok: 01: "+data.auth.id+" username: "+data.auth.username);
			loggedInDialog.dialog("open");
			$("#logdedInCont").empty();
			$("#logdedInCont").append('<span class="loggedindet">username: '+data.auth.username+'</span><br>');
			$("#logdedInCont").append('<span class="loggedindet">id: '+data.auth.id+'</span><br>');
			$("#logdedInCont").append('<span class="loggedindet">dataset: '+data.auth.dataset+'</span><br>');
			$("#logdedInCont").append('<span class="loggedindet">patchtLabelForm: '+data.auth.patchtLabelForm+'</span><br>');
			// $("#logdedInCont").append('<p class="loggedindet">'+data.auth.rbac+'</p>');
		}else{
			deAuth("lisCurrentUser");
		}
	})
	.fail(function() {
		deAuth("listCurrentUser 02")
	});
}
function ChangePass(){
	if($("#newPassword1").text() === $("#newPassword1").text()){
		var jqxhr = $.ajax(
		{
			type: "POST",
			url: "/users/password",
			 data: $("#form-change-password").serialize(),
			headers: {"authorization": authenticateData.token}
		});
		jqxhr.done(function(data){
			console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
			if(data.auth.token){
				console.log("OK ox0024 i get token %s asking who am i",data.auth.token);
				refreshAuth(data.auth);
				if(data.retvalue == 1){
					passwordChange.dialog( "close" );
					displayMessage("password changed! retnum: "+data.retvalue+" retstring is "+data.retstring);
				}else{
					displayMessage("Fail to changed password! retnum: "+data.retvalue+" retstring is: "+data.retstring );
				}
			}else{
				deAuth("listCurrentUser 03");
			}
		},"json");
		jqxhr.fail(function(data){
			displayMessage("error 013 retvalue is: "+data.retvalue+" retstring is "+data.retstring);
		},"json");
	}
}
function deAuth(where){
	for (var member in authenticateData) delete authenticateData[member];
	$("#loggedIn").remove();
	displayMessage("authenticate error: "+where);
	sessionStorage.clear();
}
function refreshAuth(_authBlock){
	console.log("0x00A1 refreshAuth %o",_authBlock);
	authenticateData=_authBlock;
	sessionStorage.setItem("cabjs-admin",_authBlock);
}
function displayMessage(message){
	console.log(message);
	$( "#message" ).text(message);		
	setTimeout(function () {
		$( "#message" ).text('');
	}, 3000);
}
