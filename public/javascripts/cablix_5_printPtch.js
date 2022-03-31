

$(function(){
	var patches=$('#patchesTable').DataTable( {
		dom: 'Bfrtip'
		// ,scrollY:     300
		,pageLength: 150
		, buttons: [
            'copy', 'csv', 'excel', 'pdf'
        ]
    });
});