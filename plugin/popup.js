$(document).ready(function() {
	//var port = chrome.tabs.connect(2, {name: "activation"});;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		for (i in tabs) {
			console.log("Activate msg: " + i);
			chrome.tabs.sendMessage(tabs[i].id, {}, function(response) {
				if (response.status) {
					$("#activate").html("Deactivate");
				} else {
					$("#activate").html("Activate");
				}
			});	
		}
	});
	/*chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		for (var i = 0; i < tabs.length; i ++) {
			port = chrome.tabs.connect(tabs[i].id, {name: "activation"});
		}
	});*/
	$("#activate").click(function(){
		if ($("#activate").html() == "Activate") {
			$("#activate").html("Deactivate");
			//port.postMessage({status: 1});
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				for (i in tabs) {
					chrome.tabs.sendMessage(tabs[i].id, {status: 1}, function(response) {
					});	
				}
			});
		} else {
			$("#activate").html("Activate");
			//port.postMessage({status: 0});
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				for (i in tabs) {
					chrome.tabs.sendMessage(tabs[i].id, {status: 0}, function(response) {
					});	
				}
			});
		}
	});
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			var status = $("#activate").html() == "Activate" ? 0 : 1;
			sendResponse({status: status});
	});
	/*port.onMessage.addListener(function(msg) {
		console.log("Listening!");
		var status = $("#activate").html() == "Activate" ? 0 : 1;
		port.postMessage({status: status});
	});*/
});