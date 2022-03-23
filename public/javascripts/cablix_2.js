	/* -----------------------------------------
** cablix js version.
** suppport script for edit & manage tree
** ----------------------------------------- */
var userMode="view";
var formEditElement;
var currentRackCfg = new Object();
var elementTypeList = new Object();

$(function(){
	formEditElement=$("#formEditElement").dialog({
		autoOpen: false,
		height: formEditElementDetail.base.height,
		width: formEditElementDetail.base.width,
		modal: true,
		buttons: {
			Save: saveFormC2,
			Close: function() {
				$("#formElementContainer").empty();
				formEditElement.dialog( "close" );
			}
		}
	}).on('keydown', function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
       		$("#formElementContainer").empty();
			formEditElement.dialog( "close" );
		 }                
        evt.stopPropagation();
	});
	$( document ).on("click","#edit_mode",function (e){
		e.preventDefault();
		set_userMode($(this),userMode);
	});	
	$.contextMenu({
		selector: '.simpleTree-label-editable', 
		callback: function(key, options) {
			// var myParentId=$(this).parent().attr('id').substring(3,99);
			var myParentId=$(this).attr('id');
			console.log("clicked: %s option %o id %s",key,options,myParentId); 
			switch (key){
				case 'edit':{
					console.log("wow edit %s",myParentId);
					doGet("GET","/elements/json/element/"+dataset+'/'+myParentId,function(data){
						console.log("ok done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
						if(data.retvalue == 1){
							console.log("retrived data from server for element %s -> %o",myParentId,data);
							$("#form_type").remove();
							$("#form_dataset").remove();
							$("#form_subaction").remove();
							
							$("#formElementContainer").append('<h3>Type: '+data.element.type+'</h3>');
							$("#formElementContainer").append('<input type="hidden" id="form_xinfo" name="xinfo" value="'+data.element.type+'+edit" />');
							$("#formElementContainer").append('<input type="hidden" id="form_type" name="type" value="'+data.element.type+'" />');
							$("#formElementContainer").append('<input type="hidden" id="form_dataset" name="dataset" value="'+dataset+'" />');
							$("#formElementContainer").append('<input type="hidden" id="form_subaction" name="subaction" value="edit" />');
							
							for( var key in labels[data.element.type]){
								var readonlyState = (key === 'lid' || key === 'pid' ) ? 'READONLY' : '';
								console.log(labels[data.element.type][key] + " = " + data.element[key]);
								if(key === "front_back"){
									$("#formElementContainer").append('<label for="'+key +'">'+labels[data.element.type][key]+'</label>'+
									'<input type="radio" id="'+key+'" name="'+key+'" value="F"><label for="F">Front</label>'+
									'<input type="radio" id="'+key+'" name="'+key+'" value="R"><label for="R">Rear</label>'
									);
								}else{
									$("#formElementContainer").append('<label for="'+key +'">'+labels[data.element.type][key]+'</label><input id="'+key+'" name="'+key+'" '+readonlyState+' value="'+data.element[key]+'"/>');
								}
							}
							formEditElement.dialog({height: formEditElementDetail.treeElement.height,
							width: formEditElementDetail.treeElement.width});
							formEditElement.dialog( "open" );
						}else{
							displayMessage("Fail to retrive retnum: "+data.retvalue+" retstring is: "+data.retstring );
						}
					});
				}
				break;
				case 'delete':{
					if(confirm("Are you sure do delete it?")){
						console.log("wow delete %s",myParentId);
						var jqxhr = $.ajax({
							type: "POST",
							url: "/tree/delete/element",
							data: {target: myParentId,dataset: dataset},
							headers: {"authorization": authenticateData.token,}
						});
						jqxhr.done(function(data){
							console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
							refreshAuth(data.auth);
							if(data.retvalue == 1){
								displayMessage("delete done! retnum: "+data.retvalue+" retstring is "+data.retstring);
								createDatasetTree(dataset);
							}else{
								displayMessage("Fail to delete retnum: "+data.retvalue+" retstring is: "+data.retstring );
							}
						},"json");
						jqxhr.fail(function(data){
							displayMessage("error 01a retvalue is: "+data.retvalue+" retstring is "+data.retstring);
						},"json");
					}
				}
				break;
				case 'add_children':{
					console.log("wow add children %s",myParentId);
					$("#preFormEditElement").empty();
					$("#formElementContainer").empty();
					
					var o=deepSearch(treeJson, 'lid', myParentId);
					if(o.type === 'RACK'){
						doGet("GET","/elements/json/elementTypeList/"+dataset,function(data){
							console.log("ok done retvalue is: "+data.retvalue+" retstring is "+data.retstring+" eee data %o",data.data);
							elementTypeList = data.data;
							createAndPopulateRack(myParentId,actionAddElementForm);
						});
						
					}else{
						$("#formElementContainer").append('<select name="type" id="localType" >');
						$("#localType").append('<option value="-----"></option>');
						var cison=false;
						for( var key in labels){
							if(key === 'RACK'&& usedLicenseCounted >= licensedRack){
								console.log("NO more %s licensed !",key);
								$("#localType").append('<option value="___NOT_valid">NO more '+key+' licensed !</option>');
								cison=false;
							}else{			
								console.log("add_children parts %s & %s & %s",key,o.type,cison);
								if(cison)
									$("#localType").append('<option value="'+key+'">'+key+'</option>');
								if(key === o.type)
									cison=true;
								if(key === 'RACK' )
									cison=false;
							}
						}
						$( "#localType" ).change(function() {
							$("#formElementContainer").empty();
							$("#formElementContainer").append('<h3>Type: '+$(this).find(":checked").val()+'</h3>');
							$("#formElementContainer").append('<input type="hidden" name="type" value="'+$(this).find(":checked").val()+'" />');
							$("#formElementContainer").append('<input type="hidden" name="subaction" value="add_children" />');
							$("#formElementContainer").append('<input type="hidden" id="form_dataset" name="dataset" value="'+dataset+'" />');
							
							for( var key in labels[$(this).find(":checked").val()]){
								var readonly = ( key === 'pid' ) ? 'READONLY' : '';
								
								var value = (key === 'pid') ? 'value="'+myParentId+'"' : '';
								if(key === "front_back"){
									$("#formElementContainer").append('<label for="'+key +'">'+labels[$(this).find(":checked").val()][key]+'</label>'+
									'<input type="radio" id="'+key+'" name="'+key+'" value="F"><label for="F">Front</label>'+
									'<input type="radio" id="'+key+'" name="'+key+'" value="R"><label for="R">Rear</label>'
									);
								}else{
									$("#formElementContainer").append('<label for="'+key +'">'+labels[$(this).find(":checked").val()][key]+'</label><input id="'+key+'" name="'+key+'" '+readonly+' '+value+' "/>');
								}
							}
						});
					}
					formEditElement.dialog({height: formEditElementDetail.rackElement.height,
						width: formEditElementDetail.rackElement.width});
					formEditElement.dialog( "open" );
				}
				break;
			}
		},
		items: {
			"edit": {name: "Edit", icon: "far fa-edit"},
			"delete": {name: "Delete", icon: "far fa-trash-alt"},
			"add_children": {name: "addChildren", icon: "far fa-plus-square"}
		}
	});
	function saveLicenseAdder(){
		console.log("wich form ? %o",$(this).serialize());
		var jqxhr = $.ajax({
			type: "POST",
			url: "/admin/Wr/license",
			data: $(this).serializeArray(),
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
	}
	function saveFormC2(){
		console.log("cablix_2 wich form ? %o",$(this).serialize());
		if( $(this).find('input#lid').val() && $(this).find('input#pid').val() && (! /[\s,;\.]/.test($(this).find('input#lid').val()))){		
			var jqxhr = $.ajax({
				type: "POST",
				url: "/tree/editOrSave/element/"+$(this).find('input#form_dataset').val() ,
				data: $(this).serializeArray(),
				headers: {"authorization": authenticateData.token,}
			});
			jqxhr.done(function(data){
				console.log("on done retvalue is: "+data.retvalue+" retstring is "+data.retstring);
				refreshAuth(data.auth);
				if(data.retvalue == 1){
					// set_userMode($("#edit_mode"),'edit');
					displayMessage("edit done ok retnum: "+data.retvalue+" retstring is: "+data.retstring );
					$("#formElementContainer").empty();
					formEditElement.dialog( "close" );
					// createDatasetTree(dataset);
					createAndPopulateRack($(".rackIdCell").text(),actionCreateRack);

				}else{
					displayMessage("Fail to save retnum: "+data.retvalue+" retstring is: "+data.retstring );
				}
			});
		}else{
			displayMessage('pid or lid not defined or invalid lid, stop!');
		}
	}
	function set_userMode__old(that,OLDmode){
		userMode = (OLDmode === 'view') ?
			'edit' :
			'view';
		that.removeClass("edit_mode");
		that.removeClass("edit_modered");

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
	function deepSearch (object, key, value) {
		if(Array.isArray(object)){
			console.log("is Array of %s",object.length);
			for(let ia=0;ia<object.length;ia++){
				var myObject=object[ia];
				if (myObject.hasOwnProperty(key) === true){
					if(myObject[key] === value ) return myObject;
					for (let i = 0; i < Object.keys(myObject).length; i++) {
						var myKey=Object.keys(myObject)[i];
						if (typeof myObject[myKey] === "object" && myKey === "children") {
							let o = deepSearch(myObject[myKey], key, value)
							if (o != null) return o
						}
					}
				}
			}
		}else{
			console.log("is NOT Array");
			if (object.hasOwnProperty(key) === true){
				if(object[key] === value ) return object;
				for (let i = 0; i < Object.keys(object).length; i++) {
					var myKey=Object.keys(object)[i];
					if (typeof object[Object.keys(object)[i]] === "object" && myKey === "children") {
						let o = deepSearch(object[Object.keys(object)[i]], key, value)
						if (o != null) return o
					}
				}
			}
		}
		console.log("5==> ");
		return null
	}
	function actionAddElementForm(data){
		currentRackCfg.rack=data.rack;
		currentRackCfg.elements=data.elements;

		$("#form_type").remove();
		$("#form_dataset").remove();
		$("#form_subaction").remove();

		$("#formElementContainer").append('<h3>Type: Element</h3>');
		$("#formElementContainer").append('<input type="hidden" id=from_type" name="type" value="ELEMENT" />');
		$("#formElementContainer").append('<input type="hidden" id="form_dataset" name="dataset" value="'+dataset+'" />');
		$("#formElementContainer").append('<input type="hidden" id="form_subaction" name="subaction" value="add_children" />');
		
		var used= new Object();
		currentRackCfg.elements.forEach(function(k,v){
			used[k.position]=k;
		});
		var freePosition=new Array();
		for(var i=currentRackCfg.rack.hightUnit; i > 0;i--){
			if( typeof used[i] !== 'undefined'){
				i=i-used[i].elementHigh +1;
			}else{
				freePosition.push(i);
			}
		}
				
		$("#formElementContainer").append('<select name="elementTypexxxxx" id="elementTypeSel" >');
		$("#elementTypeSel").append('<option value="" selected>--</option>');								
		for (const [key, value] of Object.entries(elementTypeList)) {
			console.log(key+" << e value: "+value["description"]);
			$("#elementTypeSel").append('<option value="'+key+'">'+value["description"]+'</option>');								
		}
		$("#elementTypeSel").on("change",function(){
			console.log($("#elementTypeSel option:checked").val());
			$("#elementType").val($("#elementTypeSel option:checked").val());
			$("#elementHigh").val(elementTypeList[$("#elementTypeSel option:checked").val()].units);
			console.log(elementTypeList[$("#elementTypeSel option:checked").val()].power);
			$("#power").val(elementTypeList[$("#elementTypeSel option:checked").val()].power);
		});
		
		$("#formElementContainer").append('<hr>');
		
		$("#formElementContainer").append('<label for="position">position</label><select name="position" id="position">');
		freePosition.forEach(function(v,k){
			$("#position").append('<option value="'+v+'">'+v+'</option>');
		});
		$("#position").on("change",function(){
			$("#lid").val(currentRackCfg.rack.lid+'-'+$("#position option:checked").val());
		});
		var notList = ["position",];
		var readOnly = ["pid","elementType","elementHigh","lid"];
		
		for( var key in labels["ELEMENT"]){
			if ( ! notList.includes(key)){ 
				var readonly = ( readOnly.includes(key) ) ? 'READONLY' : '';
				var value = (key === 'pid') ? 'value="'+currentRackCfg.rack.lid+'"' : '';
				
				if(key === "front_back"){
					$("#formElementContainer").append('<label for="'+key +'">'+labels["ELEMENT"][key]+'</label>'+'<div class="display_flex">'+
					'<input type="radio" id="'+key+'" name="'+key+'" value="F"><label for="F" class="inLinea">Front</label>'+'<br>'+
					'<input type="radio" id="'+key+'" name="'+key+'" value="R"><label for="R" class="inLinea">Rear</label>'+'</div>'
					);
				}else{
					$("#formElementContainer").append('<label for="'+key +'">'+labels["ELEMENT"][key]+'</label><input id="'+key+'" name="'+key+'" '+readonly+' '+value+' "/>');
				}
				$("#lid").val(currentRackCfg.rack.lid+'-'+$("#position option:checked").val());
			}
		}
	}
});