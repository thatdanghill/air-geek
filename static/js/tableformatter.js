$(document).ready(function(){
	$.map($("#airline-summary").find("tr"), function(r) {
		var changes = $(r).find("td").filter(":even").filter(function(index){
		return !isNaN(parseFloat($(this).html()));
	});
		$(changes).filter(function(index){
		return parseFloat($(this).html()) < 0;
	}).css("color", "red");
	$(changes).filter(function(index){
		return parseFloat($(this).html()) > 0;
	}).css("color", "green");
	$.map($(changes), function(d) {
		$(d).html($(d).html() + "%");
	});
	});

	//$('table#airline-summary').floatThead();
	
	//$('table#airline-summary').fixedHeaderTable({fixedColumn: true });
	
	var table = $('table#airline-summary').DataTable( {
        scrollY:        "400px",
        scrollX:        true,
        scrollCollapse: true,
        paging:         false
    } );
 
    new $.fn.dataTable.FixedColumns( table, {
        leftColumns: 1
    } );

    
    $(".key").css("border-right", "3px solid");

});