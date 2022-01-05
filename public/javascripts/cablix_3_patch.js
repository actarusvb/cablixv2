var addPatch;
var delPatch;
var patchAction;

$(function(){
	addPatch = $( "#dialog-form-patch" ).dialog({
      autoOpen: false,
      height: 850,
      width: 780,
      modal: true,
	  open: function(eventx,ui){$("#brack").focus()},
      buttons: {
        "Create patch": addPatchFunc,
        Cancel: function() {
          addPatch.dialog( "close" );
        }
      },
      close: function() {
        // form[ 0 ].reset();
        allFields.removeClass( "ui-state-error" );
      }
    });
	delPatch=$( "#dialog-path-delete-confirm" ).dialog({
      autoOpen: false,
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Delete this patch": deletePatch,
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
	$(document).on("change","#brack",function(){
		$("#elementSelCont").remove();
		$("#selRackCont").append('<span id="elementSelCont"></span>');
		var jqxhr2 = $.ajax({
			type: "GET",
			url: "/elements/json/rack/"+dataset+"/"+$("#brack").val()+"/child",
			headers: {"authorization": authenticateData.token,}
		});
		jqxhr2.done(function(datae){
			refreshAuth(datae.auth);
			console.log("0X00C02: ok done retvalue is: "+datae.auth.errno+" retstring is "+datae.auth.msg);
			if(datae.auth.errno == 0){
				$("#elementSelCont").append('<span class="fTitle2">Element</span><select id="bele" name="bele"></select>');
				$("#bele").append('<option value=""></option>');
				datae.elements.forEach(function(value,index){
					$("#bele").append('<option value="'+value.lid+'">'+value.position+' | '+value.lName+' | '+value.lid+' |'+value.elementType+'</option>');
				});
			};
		});	
	});
	$(document).on("change","#bele",function(datae){
		$("#elementDispCont").remove();
		$("#elementSelCont").append('<span id="elementDispCont"></span>');
		i=1;
		flrack='<table><tr id="tr-'+i+'"><td id="Zm-'+$("#brack").val()+'-'+i+'" class="rack-view-ele-id"><div class="rack-element ">'+i+'</div></td>'+
				'<td id="RK-'+$("#brack").val()+'-'+i+'" class="rack-view-ele-container hideable">Free</td></tr></table>';
		$("#elementDispCont").append(flrack);
		var datar= new Object();
		datar.rack= new Object();
		datar.rack.lid=$("#brack").val();
		datar.bru=$("#bele option:selected" ).text().substring(0,3);
		var valuex=new Object();
		valuex={position:"1", elementHigh:"1",lid: $("#bele").val()};
		createElementHtml(dataset,datar,valuex,'Zm','RK','patchSelect');
	});
	$( document ).on("click",".patchSelect", function(e){
		e.preventDefault();
		e.stopPropagation();

		console.log("0X00C03: gross target %s ",$(this).parent().attr("id"));
		console.log("0X00C04: net target %s",$(this).parent().attr("id").replace('-patchSelect',''));
		
		$("#bru").val($("#bele option:selected" ).text().substring(0,3).trim());
		$("#bid").val($(this).parent().attr("id").replace('-patchSelect',''));
		$("#lid").val($("#aid").val()+'::'+$("#bid").val());
		
		$("#FriendName").val($("#aid").val()+':<->:'+$("#bid").val());
		// $("#label").val($("#aid").val()+'::'+$("#bid").val());
		$("#label").val(patchtLabel());
		
		var jqxhr3 = $.ajax({
			type: "GET",
			url: "/utils/uuid"
		});
		jqxhr3.done(function(datao){
			$("#barcode").val(datao.uuid);
		});
	});
});
function beginAddPatch(start) {
	console.log("start create patch");
	console.log("click %s for %s",'A9',$(start).attr('id'));
	
	$("#rack-space").html('');
	var rack=$(start).parents('.rack-view-ele-container').attr('id').substring(3);
	$("#arack").val(rack.substring(0,rack.lastIndexOf("-")));
	$("#aru").val(rack.substring(rack.lastIndexOf("-")+1));
	$("#aele").val($("#disp_lid").text());
	$("#aid").val($(start).attr('id').replace("-normal",''));
	
	$("input.readonly").prop("disabled",true);
	$("#patchSubmit").prop('disabled', true);
	addPatch.dialog( "open" );

	var jqxhr = $.ajax({
		type: "GET",
		url: "/elements/json/zone/"+dataset+"/"+$("#roomId").text()+"/child",
		headers: {"authorization": authenticateData.token,}
	});
	jqxhr.done(function(data){
		refreshAuth(data.auth);
		console.log("0X00C00: ok done retvalue is: "+data.auth.errno+" retstring is "+data.auth.msg);
		if(data.auth.errno === 0){
			console.log("0X00C01: %o",data);
			$("#selRackCont").remove();
			$("#rack-space").append('<span id="selRackCont"><span class="fTitle1">RACK</span><select id="brack" name="brack"></select></span>');
			$("#brack").append('<option value=""></option>');
			data.elements.forEach(function(value,index){
				$("#brack").append('<option value="'+value.lid+'">'+value.lid+'</option>');
			});
		  $("#brack").focus();
		}
	});	
}	
function addPatchFunc() {
	var valid = true;
	displayMessage('submited');

	allFields.removeClass( "ui-state-error" );

	valid = valid && checkLength( $(aid), "aid", 3, 32 );
	valid = valid && checkLength( $(bid), "bid", 6, 80 );
	valid = valid && checkLength( $(Color), "Color", 3, 16 );
	valid = valid && checkLength( $(mtype), "Type", 3, 16 );
	valid = valid && checkRegexp( $(aid), /^[a-zA-Z]([-0-9a-z_/])+$/ui, "Aid may consist of a-z, 0-9, underscores, spaces and must begin with a letter. You enterd: " +$(aid).val());
	valid = valid && checkRegexp( $(bid), /^[a-zA-Z]([-0-9a-z_/])+$/ui, "Bid may consist of a-z, 0-9, underscores and must begin with a letter." );
	
	
	if ( valid ) {
		$("#form_dataset").remove()
		$("#add-Patch-Form").append('<input type="hidden" name="dataset" id="form_dataset" value="'+dataset+'"/>');
		
		
		console.log("submit patch request with %s data",$("#add-Patch-Form").serialize());
		$("input.readonly").prop("disabled",false);
		$("#patchSubmit").prop('disabled', false);
		
		var jqxhr = $.ajax({
			type: "POST",
			url: "/elements/json/patch/add",
			data: $("#add-Patch-Form").serialize(),
			headers: {"authorization": authenticateData.token,}
		});
		jqxhr.done(function(data){
			console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
			if(data.retvalue == 1){
				displayMessage('done');
				refreshAuth(data.auth);
				createAndPopulateRack($(".rackIdCell").text(),actionCreateRack);

			}else{
				displayMessage("error 011: "+data.retstring );
			}
			},"json");
		jqxhr.fail(function(data){
			displayMessage("error 012 retvalue is: "+data.retvalue+" retstring is "+data.retstring);
		},"json");
		addPatch.dialog( "close" );
	}else{
		displayMessage('wrong data in form!');
	}
	return valid;
}
function deletePatch(){
	displayMessage('delete submited');
	var jqxhr = $.ajax({
		type: "POST",
		url: "/elements/json/patch/delete/"+dataset+"/"+$("#patchId").text(),
		headers: {"authorization": authenticateData.token,}
	});	
	jqxhr.done(function(data){
		console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
		if(data.retvalue == 1){
			refreshAuth(data.auth);			
			displayMessage('done');
			createAndPopulateRack($(".rackIdCell").text(),actionCreateRack);
		}else{
			displayMessage('error 011');
		}
	},"json");
	jqxhr.fail(function(data){
		console.log("on fail retvalue is: "+data.retvalue+" retstring is "+data.retstring);
		displayMessage("error 012 retvalue is: "+data.retvalue+" retstring is "+data.retstring);
	},"json");
	delPatch.dialog("close");
}

