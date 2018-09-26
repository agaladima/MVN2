// $('.pushToFb').click(function (e) {

// 	// body...
// 	e.preventDefault();
// 	//if the button is clicked, check its index position and use that position to pass other line data
// 	// for (var i = 0; i < pos.length; i++) {
// 	// 	pos[i]
// 	// };
// 	// var text = $(e.target).rowIndex;
// 	// alert(text);
// 	//alert($(this).closest('td').parent()[0].sectionRowIndex);
	// var currentRow=$(this).closest("tr"); 
	// var title = currentRow.find("td:eq(0)").html();
	// var source = currentRow.find("td:eq(1)").html();
	// var link = currentRow.find("#linkurl").attr('href');

// 	$('.news-clicked').append('<input type="hidden" name="newstitle" value="'+title+'" /> ');
// 	$('.news-clicked').append('<input type="hidden" name="newssource" value="'+source+'" /> ');
// 	$('.news-clicked').append('<input type="hidden" name="newslink" value="'+link+'" /> ');
// 	$('.news-clicked').submit();
// });

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
	
