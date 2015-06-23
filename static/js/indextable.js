function formatTable() {
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
	
}

$(document).ready(function(){
	formatTable();
	$('table#airline-summary').floatThead();
});
