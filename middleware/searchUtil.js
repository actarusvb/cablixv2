	
module.exports = {
	recursiveFind,
	recursiveFindToArray
};

function recursiveFind(qresult,pid,level){
	var newLevel=level+1
	var dataJs=new Array();;
	var i=0;
	qresult.forEach(function(element){
		if(element.pid === pid){
			// console.log("pid %s element name %s",pid,element.name)
			dataJs[i]=new Object();
			dataJs[i].label=element.lName + ' ('+(element.City || element.desc || '-') +')';
			dataJs[i].value=element.lid;
			dataJs[i].expanded=true;
			
			dataJs[i].type=element.type;
			dataJs[i].id='TR-'+element.lid;
			dataJs[i].lid=element.lid;
			
			var children =recursiveFind(qresult,element.lid,newLevel);
			
			if(! isEmptyObject(children)){
				dataJs[i].children=[];
				dataJs[i].children=children;
			}
			i++;
		}
	});
	return dataJs;
}
function recursiveFindToArray(qresult,pid,level){
	var dataJs=new Array();
	dataJs.push(pid);
	qresult.forEach(function(element){
		if( element.pid === pid ||
			element.aid === pid ||
			element.bid === pid){
			dataJs= dataJs.concat(recursiveFindToArray(qresult,element.lid,level+1));
		}
	});
	return dataJs;
}