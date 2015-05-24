$(document).ready(function() {
	$("#activate").click(function(){
		chrome.windows.create({url: "plugin/body.html", focused: true}, function(){});
	});
});