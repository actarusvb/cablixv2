
$(function(){	
	var righeTable=$('#userTable').DataTable( {
        "ajax": '/admin/R'
		,"dataSrc": "cabUsers"
		// ,scrollY:     300
		, "pageLength": 50
		// , "buttons": [{
            // "extend": 'excelHtml5',
            // "text": 'Save current page',
            // "exportOptions": {
                // "modifier": {
                    // "page": 'current'
                // }
            // }
        // }]
		,"columns": [
			{ "data": "cabid" }
			,{ "data": "username" }
			,{ "data": "dataset" }
			// ,{ "data": "count_id" }
			// ,{ "data": "hours" }
			// ,{ "data": "note" }
        ]
		,"order": [[ 0, "desc" ]]
		,"columnDefs": [ {
            "targets": 0,
            "data": "cabid",
			"render": function ( data, type, row, meta ) {
				return '<button id="rowIdT'+row.id+'"><i class="fas fa-trash"></i></button> <button id="rowIdE'+row.id+'"><i class="fas fa-trash"></i></button>'+data
			}
		}]
    } );
});