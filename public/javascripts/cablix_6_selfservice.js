

$(function(){

dialog = $( "#modulo" ).dialog({
      autoOpen: true,
      height: 550,
      width: 350,
      modal: true,
      buttons: {
        "Create an account": addUser,
        "Cancel": function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        form[ 0 ].reset();
        // allFields.removeClass( "ui-state-error" );
      }
	  ,open: function() {
		$(this).dialog('widget').find('button:first').prop('disabled',true);
		// $(this).dialog('widget').find('button:last').prop('disabled', true);
      },
    });
    form = dialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addUser();
    }); 
    $( "#create-user" ).button().on( "click", function() {
      dialog.dialog( "open" );
    });

	function addUser(){
		console.log("addUser requested");
		var valid = true;
		displayMessage('submited');	
		
		console.log("submit selfServiceForm request with %s data",$("#selfServiceForm").serialize());
		
		var jqxhr = $.ajax({
			type: "POST",
			url: "/SelfServiceU/json/user/add",
			data: $("#selfServiceForm").serialize(),
		});
		jqxhr.done(function(data){
			console.log("on done errno is: "+data.errno+" message is "+data.message);
			if(data.errno === 0){
				displayMessage('done');
				dialog.dialog('close');
			}else{
				displayMessage("error 9998: "+data.errno );
				valid=false;
			}
		},"json");
		jqxhr.fail(function(data){
			displayMessage("error 9999 errno is: "+data.errno+" message is "+data.message);
			valid=false;
		},"json");
		return valid;
	}
	$("#newusername").on("change",function(e){
		field='newusername';
		console.log("new %s %s",field,$('#'+field).val());
		$('#'+field+'_msg').remove();		

		checkField(field,$("#newusername").val(),reaction);
	});
	$('#newpass1').on("change",function(e){
		field='newpass1';
		console.log("new %s %s",field,$('#'+field).val());
		$('#'+field+'_msg').remove();		
		
		if(isStrongPwd($('#'+field).val(),8)){
			$('#'+field).after('<span id="'+field+'_msg" <i class="far fa-thumbs-up"></i>'+'</span>');
		}else{
			reaction(field,"Password must contain, digit,upper & lower case letter and a symbol like !@#$%&*() and more than 8 char");
		} 
	});
	$('#newpass2').on("change",function(e){
		field='newpass2';
		console.log("new %s %s",field,$('#'+field).val());
		$('#'+field+'_msg').remove();		
		
		if($("#newpass1").val() === $("#newpass2").val()){
			$('#'+field).after('<span id="'+field+'_msg" <i class="far fa-thumbs-up"></i>'+'</span>');
		}else{
			reaction(field,"Password don't match!");
		}
	});
	$('#newdataset').on("change",function(e){
		field='newdataset';
		console.log("new %s %s",field,$('#'+field).val());
		$('#'+field+'_msg').remove();		
		
		if(isValidDsetName($('#'+field).val(),3)){
			$('#'+field).after('<span id="'+field+'_msg" <i class="far fa-thumbs-up"></i>'+'</span>');
		}else{
			reaction(field,"Invalid Name! valid name are minumum 3 chars with A-Z,a-z,0-9 <strong>no</strong> spaces or symbol");
		}
	});
	$('#activationCode').on("change",function(e){
		field='activationCode';
		console.log("new %s %s",field,$('#'+field).val());
		$('#'+field+'_msg').remove();		
		
		checkField(field,$('#'+field).val(),reaction);
	});
	function reaction(field,reason){
		console.log("reaction "+field+' '+reason);		
		$('#'+field).after('<span id="'+field+'_msg" <i class="far fa-thumbs-down"></i>'+reason+'</span>');
		$('#'+field).focus();
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
});