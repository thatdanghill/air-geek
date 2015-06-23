function formatTable() {
	$.each($(".percentage"), function(index) {
		if (!isNaN(parseFloat($(this).html())) && parseFloat($(this).html()) > 0) {
			$(this).css("color", "green");
		} else if (!isNaN(parseFloat($(this).html())) && parseFloat($(this).html()) < 0) {
			$(this).css("color", "red");
		}
		if (!isNaN(parseFloat($(this).html()))) {
			$(this).html($(this).html()+"%");
		}
	});
	
}

$(document).ready(function(){
	formatTable();
	$('table#airline-summary').floatThead();
});
