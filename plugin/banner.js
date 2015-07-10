var sideBar;

function Creator() {
	var domString = '<div id="plugin-sidebar">'+
	'<select id="graph-selector">' +
	'</select>' +
	'<select id="data-type">' +
	'<option value="month-year"> Month/Year </option>' +
	'<option value="string"> String </option>' +
	'</select>' +
	'<br>'+
	'<table id="point-list"></table>'+
	'<button id="submit"> Submit </button>'+
	'</div>';
  
	var gm = GraphManager();
	var pl = PointList();
	var user;
  	
	var self = {
		setUp: function() {
			console.log("Setting up!");
			self.insertDOM();
			self.getLogic();
			self.attachHandlers();
		},
		
		insertDOM: function() {
			//var contents = $('body').children();
			//$('body').prepend("<div id='plugin-contents'></div>");
			//$("#plugin-contents").prepend(contents);
			//$("#plugin-contents").css("width", window.innerWidth - 260);
		
			//width of sidebar
			var width = '250px';
			
			var html;
			if (document.documentElement) {
				html = $(document.documentElement); //just drop $ wrapper if no jQuery
			} 
			else if (document.getElementsByTagName('html') && document.getElementsByTagName('html')[0]) {
				html = $(document.getElementsByTagName('html')[0]);
			} 
			else if ($('html').length > -1) {
				html = $('html');
			} 
			else {
				alert('no html tag retrieved...!');
				throw 'no html tag retrieved son.';
			}
			
			if (html.css('position') === 'static') { //or //or getComputedStyle(html).position
				html.css('position', 'relative');//or use .style or setAttribute
			}
			
			var currentSide = html.css('right');//or getComputedStyle(html).top
			if (currentSide === 'auto') {
				currentSide = 0;
			} 
			else {
				currentSide = parseFloat($('html').css('right')); //parseFloat removes any 'px' and returns a number type
			}
			html.css({'overflow-x': 'scroll', 'white-space': 'normal'});
			$('body').width($('body').width() - currentSide - parseFloat(width));
			//$('body').children().last().after("<div id='plugin-sidebar-container'></div>");
			$('body').after("<div id='plugin-sidebar-container'></div>");
			
			var iframeId = 'plugin-sidebar-frame';
			if (document.getElementById(iframeId)) {
				alert('id:' + iframeId + 'taken please dont use this id!');
				throw 'id:' + iframeId + 'taken please dont use this id!';
			}
			$('#plugin-sidebar-container').append(
			'<iframe id="'+iframeId+'" scrolling="no" frameborder="0" allowtransparency="false" style="position: fixed; width: '+width+';border:none;'+
			'z-index: 2147483647;' +
			 'top: 0px; '+
			 'height: 100%;'+
			 'right: 0px' +
			 '"></iframe>'
			);
			document.getElementById(iframeId).contentDocument.body.innerHTML =
			'<style type="text/css">\
			html, body {' +
			'height: 100%;' +
			'width: '+width+';'+
			'z-index: 2147483647;'+
			'}                     \
			</style>' +
			domString;
			
			sideBar = $('#'+iframeId).contents();
			
			pl.initialize();
		},
		
		getLogic: function() {
			//!!!
			user="super";
			
			gm.getAllProjects(user);
		},
		
		attachHandlers: function() {
			$(document).keypress(pl.handleXY);
			
			$("#submit").click(function() {
				gm.submitToGraph(pl, user);
			});
			
			$("input").change(function() {
				$(this).parents('tr').find('input').css("background-color", "white");
			})
		},
	};
	return self;
}

function GraphManager() {
	var self = {
		getAllProjects: function(user) {
			$.get('http://127.0.0.1:8000/plugin/user/', {user: user}, function(data){
               self.renderPulldown(data);
			});
		},
		
		renderPulldown : function (data) {
			var json = JSON.parse(data);
			var insertStr = '';
			
			for (var i in json) {
				var project = json[i];
				insertStr += '<option value="' + project['projName'] + '" disabled = true><b><i>' + project['projName'] + ':</b></i></option>';
				for (var j in project['pages']) {
					var page = project['pages'][j];
					insertStr += '<option value="' + page['pageName'] + '" disabled = true><b><i>  ' + page['pageName'] + ':</b></i></option>';
					for (var k in page['graphs']) {
						var graph = page['graphs'][k];
						insertStr += '<option project="'+ project['projName'] + '" page="'+ page['pageName'] + '" value="' + graph['graphName'] + '">    ' + graph['graphName'] + '</option>'
					}
				}
				
			}
			
			$('#graph-selector').html(insertStr);
		},
		
		submitToGraph: function(pl, user) {
			var rows = pl.filterValidRows();
			valid = rows.valid;
			invalid = rows.invalid;
			
			var vals = pl.toJSON(valid);
			pl.cleanUp(valid, invalid);
			
			var selected = sideBar.find('#graph-selector option:selected');
			var project = self.stringifyAttrs($(selected).attr('project'));
			var page = self.stringifyAttrs($(selected).attr('page'));
			var graph = self.stringifyAttrs($(selected).val());
			var url = 'http://127.0.0.1:8000/plugin/user/' + user + '/project/' + project + '/page/' + page + '/graph/' + graph  + '/';
			$.get(url, vals, function(data) {
				//alert(data);
			});
		},
		
		stringifyAttrs: function(attrs) {
			var str = attrs.replace(/\s/g, '_');	
			return str;
		},
	};
	return self;
}

function PointList() {
	
	var self = {
		initialize: function() {
			var rowTemplate = '<tr><td><input class="x" type="text"></input></td><td><input class="y" type="text"></input></td></tr>';
			sideBar.find('#point-list').append(rowTemplate);		
		},
		
		addPoint: function() {
			var rowTemplate = '<tr><td><input class="x" type="text"></input></td><td><input class="y" type="text"></input></td></tr>';
			sideBar.find('#point-list').append(rowTemplate);
			sideBar.find('.y').last().focus();
		},
		
		removeBlank: function(element) {
			element.parents('tr').remove();
		},
		
		filterValidRows: function() {
			var rows = sideBar.find('#point-list tr');
			var obj = new Object();
			var valid = new Array();
			var invalid = new Array();
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var x = sideBar.find(row).find('.x').val();
				var y = sideBar.find(row).find('.y').val();
				
				if (self.isValidPair(x,y)) {
					valid.push(row);
				}
				else invalid.push(row);
			}
			obj.valid = valid;
			obj.invalid = invalid;
			return obj;	
		},
		
		isValidPair: function(x,y) {
			var validY = (y != '' && !isNaN(y));
			var validX = false;
			var type = sideBar.find('#data-type').val();
			var moStrs = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
			
			if (type == "string") {
				validX = (x != '');
			} else if(type == "month-year") {
				var ar = x.split(" ");
				if (ar.length != 2) {
					validX = false;	
				}
				else if (moStrs.indexOf(ar[0].toLowerCase()) == -1) {
					validX = false;
				} else if (parseFloat(ar[1]) > 0) {
					validX = true;
				}
			}
			return (validY && validX);	
		},
		
		toJSON: function(rows) {
			var obj = new Object();
			var xs = new Array();
			var ys = new Array();
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				xs.push(sideBar.find(row).find('.x').val());
				ys.push(sideBar.find(row).find('.y').val());
			}
			obj.x = xs;
			obj.y = ys;
			obj.source = window.location.href;
			obj.type = sideBar.find('#data-type option:selected').val();
			return obj;
		},
		
		cleanUp: function(valid, invalid) {
			for (var i = 0; i < invalid.length; i ++) {
				if (!($(invalid[i]).find('.x').val() == '' && $(invalid[i]).find('.y').val() == '')) {
					$(invalid[i]).find('input').css("background-color", "red");
				}
			}
			for (var i = 0; i < valid.length; i++) {
				$(valid).find('input').css("background-color", "green");
				$(valid).hide({duration: 1500, done: function() {
					$(valid).remove();
					if (sideBar.find('#point-list tr').length == 0)
						self.initialize();
				}});
			}	
		},
		
		handleXY: function(e) {
			if (e.which == 13) {
				if (typeof window.getSelection != "undefined") {
					var text = window.getSelection().toString();
					var fl = parseFloat(text.replace(/,/g,''));
					if (!isNaN(fl)) {
						sideBar.find('.y').last().val(fl);
						sideBar.find('.x').last().focus();
					}
				} 
				else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
					var text = document.selection.createRange().text;
					var fl = parseFloat(text.replace(/,/g,''));
					if (!isNaN(fl)) {
						sideBar.find('.y').last().val(fl);	
						sideBar.find('.x').last().focus();
					}
				}
				
				if (sideBar.find('.x').last().is($(document.activeElement)) 
				&& sideBar.find('.x').last().val() != ''
				&& sideBar.find('.y').last().val() != '') {
					self.addPoint();
				}
				
				if (sideBar.find('.y').last().is($(document.activeElement)) 
				&& sideBar.find('.x').last().val() != ''
				&& sideBar.find('.y').last().val() != '') {
					self.addPoint();
				}

				if (sideBar.find('.y').last().is($(document.activeElement))
				&& sideBar.find('.x').last().val() == '') {
					sideBar.find('.x').last().focus();
				}	
				
				if (self.areBothBlank()) {
					self.removeBlank($(document.activeElement));
				}
			}
		},
		
		areBothBlank: function() {
			if (sideBar.find('.x').last().is($(document.activeElement)) || sideBar.find('.y').last().is($(document.activeElement))) {
				return false;
			}
			
			if (sideBar.find('.x').is($(document.activeElement)) && 
			$(document.activeElement).parent().next().children().first().val() == '' && 
			$(document.activeElement).val() == '') {
				return true;	
			}
			if (sideBar.find('.y').is($(document.activeElement)) && 
			$(document.activeElement).parent().prev().children().first().val() == '' && 
			$(document.activeElement).val() == '') {
				return true;	
			}
			
			return false;
		}
	};
	return self;
}

$(document).ready(function() {
    var creator = Creator();
    //var port = chrome.runtime.connect({name: "activation"});
    chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.status) {
				if ($('#plugin-sidebar-container').length) {
					$('#plugin-sidebar-container').show();
				} else {
					creator.setUp();
				}
			} else if (request.status == 0) {
				$('#plugin-sidebar-container').hide();
			} else {
				sendResponse({status: $('#plugin-sidebar-container:visible').length ? 1 : 0});
			}
	});
	/*port.onMessage.addListener(function(msg) {
		if (msg.status) {
			if ($('#plugin-sidebar-container')) {
				$('#plugin-sidebar-container').show();
			} else {
				creator.setUp();
			}
		} else {
			$('#plugin-sidebar-container').hide();
		}
	});*/
    //port.postMessage({});
    /*chrome.runtime.sendMessage({}, function(response) {
    	console.log("Got a response: " + response);
		if (response.status) {
			creator.setUp();
		}
  	});*/
});