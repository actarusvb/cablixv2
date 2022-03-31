

$(function(){

	newUserDialog = $( "#modulo" ).dialog({
      autoOpen: true,
      height: 570,
      width: 370,
      modal: true,
      buttons: {
        "Create an account": addUser,
        "Cancel": function() {
          newUserDialog.dialog( "close" );
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
    form = newUserDialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addUser();
    }); 
    $( "#create-user" ).button().on( "click", function() {
      newUserDialog.dialog( "open" );
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
				newUserDialog.dialog('close');
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
		
		if(isStrongPwd($('#'+field).val(),passwordMinLen)){
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
		
		if(isValidDsetName($('#'+field).val(),datasetNameMinLen)){
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
});