function formatTable() {
	$.each($(".percentage"), function(index) {
		if (!isNaN(parseFloat($(this).html())) && parseFloat($(this).html()) > 0) {
			$(this).css("color", "green");
		} else if (!isNaN(parseFloat($(this).html())) && parseFloat($(this).html()) < 0) {
			$(this).css("color", "red");
		}
	});
	
}

$(document).ready(function(){
	formatTable();
	$('table#airline-summary').floatThead();
});
