function makeTable() {
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
    
    return table;
}

function formatTable(table) {
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
	
	table.columns.adjust().draw();
}

function attachHandlers(table) {
	$("input[name='year']").change(function() {
		var td = $(".data");
		if ($('input#yr1').prop("checked")) {
			$.each(td, function() {
				$(this).html($(this).attr('y1'));
			});
			$("th#year-tag").html($('input#yr1').val());
		} else if ($('input#yr2').prop("checked")) {
			$.each(td, function() {
				$(this).html($(this).attr('y2'));
			});
			$("th#year-tag").html($('input#yr2').val());
		} else if ($('input#yr3').prop("checked")) {
			$.each(td, function() {
				$(this).html($(this).attr('y3'));
			});
			$("th#year-tag").html($('input#yr3').val());
		}
		formatTable(table);
	});
}

$(document).ready(function(){
	var table = makeTable();
	formatTable(table);
	attachHandlers(table);
});