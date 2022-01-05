
var atRapportiTb,UsersTable,RolesTable,DatasetsTable,
passwordChange,addUserForm,addDatasetForm,tips,
emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

$(function(){
	// UI
	$( "#accordion" ).accordion({
		heightStyle: "content"
	});
	// form
	// forms
	addUserForm = $( "#dialog-add-user" ).dialog({
		autoOpen: false,
		height: 400,
		width: 580,
		modal: true,
		buttons: {
			"Add username": AddUsername($("#form-add-user")),
			Cancel: function() {
				addUserForm.dialog( "close" );
			}
		},
		close: function() {
			addUserForm[ 0 ].reset();
			allfiledUseradd.removeClass( "ui-state-error" );
		}
	});
	addDatasetForm = $( "#dialog-add-dataset" ).dialog({
	  autoOpen: false,
      height: 400,
      width: 580,
      modal: true,
      buttons: {
        "Add Dataset": addDataset,
        Cancel: function() {
          addDatasetForm.dialog( "close" );
        }
      },
      close: function() {
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
	//tables
	UsersTable=$("#UsersTable").DataTable({
		serverSide: true,
		processing: true,
        ajax: {
			url: '/getData/data/js/table/UsersTable',
			dataSrc: "items"
		}
		,dom: 'rtip'
		,pageLength: 15
		,"lengthMenu": [ [15, 25, 50, 100], [15, 25, 50, 100] ]
		,columns: [
			{
                "className":      'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''},
			{ "data": "id" },
			{ "data": "username" },
			{ "data": "info" }
		]
		// ,createdRow: function ( row, data, index ) {
			// $('td', row).eq(1).html('<button class="userId" id="userId-'+data.id+'">'+data.id+'</button>');
		// }
		, initComplete: void_InitCallback
		,"order": [[1, 'asc']]
    });
	$('#UsersTable tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = UsersTable.row( tr );
 
        if ( row.child.isShown() ) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {			
            // Open this row
			$.ajax({url: '/getData/data/js/complex/user/'+row.data().id, async: true, success: function(result){
				row.child( format(result) ).show();
			}});
            tr.addClass('shown');
							
        }
    } );
	RolesTable=$('#RolesTable').DataTable({
		serverSide: true,
		processing: true,
        ajax: {
			url: '/getData/data/js/table/RolesTable',
			dataSrc: "items"
		}
		,dom: 'rtip'
		,pageLength: 15
		,"lengthMenu": [ [15, 25, 50, 100], [15, 25, 50, 100] ]
		,columns: [
			{ "data": "id" },
			{ "data": "role" }
		]
		,createdRow: function ( row, data, index ) {
			$('td', row).eq(0).html('<div class="roleId">'+data.id+'</div>');
		}
		, initComplete: void_InitCallback
    });
	DatasetsTable=$('#DatasetsTable').DataTable({
		serverSide: true,
		processing: true,
        ajax: {
			url: '/getData/data/js/table/DatasetsTable',
			dataSrc: "items"
		}
		,dom: 'rtip'
		,pageLength: 15
		,"lengthMenu": [ [15, 25, 50, 100], [15, 25, 50, 100] ]
		,columns: [
			{ "data": "id" },
			{ "data": "dataset" }
		]
		,createdRow: function ( row, data, index ) {
			$('td', row).eq(0).html('<div class="datasetId">'+data.id+'</div>');
		}
		, initComplete: void_InitCallback
    });
	// listener
	$( document ).on("click",'button.buttonx#addUser', function(event){
		event.preventDefault();
		$(".myinput").val('');
		displayMessage('ask for addUserForm: I got a click func');
		addUserForm.dialog( "open" );
	});
	$( document ).on("click",'button.buttonx#addDataset', function(event){
		event.preventDefault();
		$(".myinput").val('');
		displayMessage('ask for addUserForm: I got a click func');
		addDatasetForm.dialog( "open" );
	});
	$( document ).on("click",'a#password_change', function(event){
		event.preventDefault();
		$(".myinput").val('');
		displayMessage('ask for password change: I got a click func');
		passwordChange.dialog( "open" );
	});
	//function
	function AddUsername(fo){
		displayMessage('in func to adduser');
		var valid = true,
		usernamef=$("#username"),
		passwordf=$("#password"),
		infof=$("#info"),
		allfiledUseradd= $( [] ).add(usernamef).add(passwordf);
		
		tips = $( ".validateTips" );

		
		allfiledUseradd.removeClass( "ui-state-error" );

		valid = valid && checkLength( usernamef, "username", 3, 16 );
		valid = valid && checkLength( passwordf, "password", 5, 16 );
		valid = valid && checkRegexp( usernamef, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
		valid = valid && checkRegexp( passwordf, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );

		if ( valid ) {
			var jqxhr = $.post("/setData/v1/post/username/add",fo.serialize());
			jqxhr.done(function(data){
				console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
				if(data.retvalue == 1){
					addUserForm.dialog( "close" );
					displayMessage("Username added! retnum: "+data.retvalue+" retstring is "+data.retstring);
				}else{
					displayMessage("Fail to add username! retnum: "+data.retvalue+" retstring is: "+data.retstring );
				}
			},"json");
			jqxhr.fail(function(data){
				displayMessage("error 015 retvalue is: "+data.retvalue+" retstring is "+data.retstring);
			},"json");
		}
		return valid;
	}
	function addDataset(){}
	function void_InitCallback(){
	};
	function format ( d ) {
		var rolex='',datasetx='';
		for (i in d.roles){
			rolex+='<tr>'+
				'<td>role id</td>'+
				'<td>'+d.roles[i].role_id+'</td>'+
				// '<td>role</td>'+
				'<td>'+d.roles[i].role+'</td>'+
			'</tr>'
		}
		for (i in d.dataset){
			datasetx+='<tr>'+
				'<td>datatset id</td>'+
				'<td>'+d.dataset[i].dataset_id+'</td>'+
				// '<td>dataset</td>'+
				'<td>'+d.dataset[i].dataset+'</td>'+
			'</tr>'
		}
				
		return '<table class="cell-border">'+
				'<tr>'+
					'<td>username</td>'+
					'<td>'+d.user[0].username+'</td>'+
				'</tr>'+
				'<tr>'+
					'<td>password</td>'+
					'<td>'+
					// d.user[0].password+
					'</td>'+
				'</tr>'+
				'<tr>'+
					'<td>Extra info</td>'+
					'<td>'+d.user[0].info+'</td>'+
				'</tr>'+
			'</table>'+
			'<table class="flyTable">'+
				rolex+
			'</table>'+
			'<table class="flyTable">'+
				datasetx+
			'</table>';
	};
	function ChangePass(){
		if($("#newPassword1").text() === $("#newPassword1").text() && checkLength( $("#newPassword1"), "password", 5, 16 )){
			checkLength( $("#newPassword1"), "password", 5, 16 );
			
			var jqxhr = $.post("/setData/v1/post/password/change",$("#form-change-password").serialize());
			jqxhr.done(function(data){
				console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
				if(data.retvalue == 1){
					passwordChange.dialog( "close" );
					displayMessage("password changed! retnum: "+data.retvalue+" retstring is "+data.retstring);
				}else{
					displayMessage("Fail to changed password! retnum: "+data.retvalue+" retstring is: "+data.retstring );
				}
			},"json");
			jqxhr.fail(function(data){
				displayMessage("error 013 retvalue is: "+data.retvalue+" retstring is "+data.retstring);
			},"json");
		}
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
	function displayMessage(message){
		console.log(message);
		$( "#message" ).text(message);		
		setTimeout(function () {
			$( "#message" ).text('');
		}, 3000);
	}
});