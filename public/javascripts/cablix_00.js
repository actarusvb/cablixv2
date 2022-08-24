
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
	
	$(".rack-element").removeClass("fa-lock");
	$(".rack-element").removeClass("fa-edit");
	$(".socketViewed").removeClass("fa-lock");
	$(".socketViewed").removeClass("fa-edit");
	$(".simpleTree-label").removeClass("simpleTree-label-editable");
	$(".elementTypeItem").removeClass("elementTypeItemDrag ui-draggable ui-draggable-handle");
	
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
	$(".elementTypeItem").addClass(
		(userMode === 'view') ?
			'' :
			'elementTypeItemDrag'
	);
	
	$(".elementTypeItemDrag").draggable({
		revert: true
	});
	$(".freeElement").droppable({
		accept: ".elementTypeItemDrag",
		drop: function( event, ui ) {
			console.log("dragged helper A %s",ui.draggable.attr('id'));
			console.log("dropped helper B %s",$(this).attr('id'));
			// beginAddPatch(ui.draggable.parent()[0],$(this).parent()[0]);
		},
		activate: function( event, ui ) {
			// console.log("activate on "+ui.helper);
		}
	});
	
	displayMessage("userMode is: "+userMode);
}
function doLogin(action){
	console.log("Login serialized form: "+$('form#login_form').serialize());
	authenticateData='';
	$.post( '/users/authenticate', $('form#login_form').serialize(), function(data) {
		console.log("doLogin receive %o",data);
		if(data.auth.errno >= 0 && data.auth.token){
			console.log("Login OK %o",data);
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
function doGet(method,url,executeFunct,executeFunctName,options){
	console.log("doGet method: %s, URL: %s, executeFunctName: %s,executeFunct: %s,auth Token %s | options: %o",
		method,url,executeFunctName,executeFunct,authenticateData.token,options);
	$.ajax({
		url: url,
		headers: {"authorization": authenticateData.token},
		method : method })
	.done(function(data){
		if(data.auth.token){
			console.log("OKK i get token asking who am i & data %o",data);
			authenticateData.token=data.auth.token;
			executeFunct(data);
		}else{
			console.log("Not autheticate here 0010: %s",executeFunctName);
			deAuth(executeFunctName);
		}
	})
	.fail(function(err){
		console.log("i got error ajax here 0000 | %s",executeFunctName); 
		deAuth(executeFunctName);
	});
}
function listCurrentUser(){
	doGet("GET",'/users/current',function(data	) {
		if(data.auth.token){
			console.log("OKK i get when asking who i am :%o",data);
			refreshAuth(data.auth);
			displayMessage("get /user/current ok: 01: "+data.auth.id+" username: "+data.auth.username);
			loggedInDialog.dialog("open");
			$("#logdedInCont").empty();
			$("#logdedInCont").append('<span class="loggedindet">username: '+data.auth.username+'</span><br>');
			$("#logdedInCont").append('<span class="loggedindet">Check Code: '+data.auth.id+'</span><br>');
			$("#logdedInCont").append('<span class="loggedindet">dataset: '+data.auth.dataset+'</span><br>');
			$("#logdedInCont").append('<span class="loggedindet">patchtLabelForm: '+data.auth.patchtLabelForm+'</span><br>');
			// $("#logdedInCont").append('<p class="loggedindet">'+data.auth.rbac+'</p>');
		}else{
			deAuth("lisCurrentUser");
		}
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
	sessionStorage.setItem("cabjs-admin",JSON.stringify(_authBlock));
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
		console.log(date);

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
function displayMessage(message){
	console.log(message);
	$( "#message" ).text(message);		
	setTimeout(function () {
		$( "#message" ).text('');
	}, 3000);
}
function localEscape(string){
	return String(string).replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
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
function checkField(field,val,callback){
	console.log("checkField %s %s",field,val);
	$("#"+field+"_msg").remove();
	
	$.ajax({
		type: "GET",
		url: "/SelfService/json/field/"+field+"/"+val,
	}).done(function(datae){
		console.log("checkField 0X00C02: ok done retvalue is: %o ",datae);
		if(datae.errno === 0){
			$('#'+field).after('<span id="'+field+'_msg" <i class="far fa-thumbs-up"></i>'+datae.message+'</span>');
		}else{
			callback(field,datae.message);
		};
	}).fail(function(){
		callback(field,"error");
	});
}
function isStrongPwd(password,minLength) {
	var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var lowercase = "abcdefghijklmnopqrstuvwxyz";
	var digits = "0123456789";
	var splChars ="!@#$%&*()";
	var ucaseFlag = contains(password, uppercase);
	var lcaseFlag = contains(password, lowercase);
	var digitsFlag = contains(password, digits);
	var splCharsFlag = contains(password, splChars);

	if(password.length>= minLength && ucaseFlag && lcaseFlag && digitsFlag && splCharsFlag)
		return true;
	else
		return false;
}
function isValidDsetName(password,minLength) {
	var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var lowercase = "abcdefghijklmnopqrstuvwxyz";
	var digits = "0123456789";
	// var splChars ="!@#$%&*()";
	var splChars =" \t";
	var ucaseFlag = contains(password, uppercase);
	var lcaseFlag = contains(password, lowercase);
	var digitsFlag = contains(password, digits);
	var noSplCharsFlag = ! contains(password, splChars);

	if(password.length>= minLength && ( ucaseFlag || lcaseFlag || digitsFlag ) && noSplCharsFlag)
		return true;
	else
		return false;
}
function contains(password, allowedChars) {
	for (i = 0; i < password.length; i++) {
			var char = password.charAt(i);
			 if (allowedChars.indexOf(char) >= 0) { return true; }
		 }
	 return false;
}
function reaction(field,reason){
	console.log("reaction "+field+' '+reason);		
	$('#'+field).after('<span id="'+field+'_msg" <i class="far fa-thumbs-down"></i>'+reason+'</span>');
	$('#'+field).focus();
}
$.extend($.ui.dialog.prototype.options, { 
    create: function() {
        var $this = $(this);

        // focus first button and bind enter to it
        $this.parent().find('.ui-dialog-buttonpane button:first').focus();
        $this.keypress(function(e) {
            if( e.keyCode == $.ui.keyCode.ENTER ) {
                $this.parent().find('.ui-dialog-buttonpane button:first').click();
                return false;
            }
        });
    } 
});
