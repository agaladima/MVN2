// when the submit button is clicked for the table form on the '/data' page,
// it takes the line where there is a checkbox and pushes the lines data to firebase
$('#submitToFb').click(function(e) {
	e.preventDefault();
	//array of checked items record number
	let checked = [];
	//check if checkbox is clicked
	$('.pushToFb').each(function(index){
		if($(this).is(':checked')){

			let currentRow = $(this).closest("tr"); 
			let recNum = currentRow.find("td:eq(0)").html();
			$('.sendtofb').append('<input type="text" name="checkedItem" value="'+recNum+'"/>');
			// checked.push(recNum);
			console.log('The row record number is: '+recNum);
		}

	});
	//submit the array of record numbers
	$('.sendtofb').submit();
});


	
