function Creator() {
	var domString = '<div id="plugin-sidebar-container">' +
	'<div id="plugin-sidebar">'+
	'<select id="graph-selector">' +
	'</select>' +
	'<br>'+
	'<table id="point-list"></table>'+
	'<button id="submit"> Submit </button>'+
	'</div></div>';
  
	var gm = GraphManager();
	var pl = PointList();
	var user;
  	
	var self = {
		setUp: function() {
			self.insertDOM();
			self.getLogic();
			self.attachHandlers();
		},
		
		insertDOM: function() {
			var contents = $('body').children();
			$('body').prepend("<div id='plugin-contents'></div>");
			$("#plugin-contents").prepend(contents);
			$("#plugin-contents").css("width", window.innerWidth - 260);
			$('body').children().last().after(domString);
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
			$.get('http://127.0.0.1:8000/user/', {user: user}, function(data){
               self.renderPulldown(data);
			});
		},
		
		renderPulldown : function (data) {
			json = JSON.parse(data);
			var insertStr = '';
			
			for (var i in json) {
				var project = json[i];
				insertStr += '<option value=' + project['projName'] + ' disabled = true><b><i>' + project['projName'] + ':</b></i></option>';
				for (var j in project['pages']) {
					var page = project['pages'][j];
					insertStr += '<option value=' + page['pageName'] + ' disabled = true><b><i>  ' + page['pageName'] + ':</b></i></option>';
					for (var k in page['graphs']) {
						var graph = page['graphs'][k];
						insertStr += '<option project='+ project['projName'] + ' page='+ page['pageName'] + ' value=' + graph['graphName'] + '>    ' + graph['graphName'] + '</option>'
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
			
			var selected = $('#graph-selector option:selected');
			var url = 'http://127.0.0.1:8000/user/' + user + '/project/' + $(selected).attr('project') + '/page/' + $(selected).attr('page') + '/graph/' + $(selected).val()  + '/';
			$.get(url, vals, function(data) {
				//alert(data);
			});
		}
	};
	return self;
}

function PointList() {
	
	var self = {
		initialize: function() {
			var rowTemplate = '<tr><td><input class="x" type="text"></input></td><td><input class="y" type="text"</input></td></tr>';
			$('#point-list').append(rowTemplate);		
		},
		
		addPoint: function() {
			var rowTemplate = '<tr><td><input class="x" type="text"></input></td><td><input class="y" type="text"</input></td></tr>';
			$('#point-list').append(rowTemplate);
			$('.y').last().focus();
		},
		
		removeBlank: function(element) {
			element.parents('tr').remove();
		},
		
		filterValidRows: function() {
			var rows = $('#point-list tr');
			var obj = new Object();
			var valid = new Array();
			var invalid = new Array();
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var x = $(row).find('.x').val();
				var y = $(row).find('.y').val();
				
				if (x != '' && y != '' && !isNaN(y)) {
					valid.push(row);
				}
				else invalid.push(row);
			}
			obj.valid = valid;
			obj.invalid = invalid;
			return obj;	
		},
		
		toJSON: function(rows) {
			var obj = new Object();
			var xs = new Array();
			var ys = new Array();
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				xs.push($(row).find('.x').val());
				ys.push($(row).find('.y').val());
			}
			obj.x = xs;
			obj.y = ys;
			return obj;
		},
		
		cleanUp: function(valid, invalid) {
			for (var i = 0; i < invalid.length; i ++) {
				$(invalid).find('input').css("background-color", "red");
			}
			for (var i = 0; i < valid.length; i++) {
				$(valid).find('input').css("background-color", "green");
				$(valid).hide({duration: 1500, done: function() {
					$(valid).remove();
					if ($('#point-list tr').length == 0)
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
						$('.y').last().val(fl);
						$('.x').last().focus();
					}
				} 
				else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
					var text = document.selection.createRange().text;
					var fl = parseFloat(text.replace(/,/g,''));
					if (!isNaN(fl)) {
						$('.y').last().val(fl);	
						$('.x').last().focus();
					}
				} 
				
				if ($('.x').last().is($(document.activeElement)) 
				&& $('.x').last().val() != ''
				&& $('.y').last().val() != '') {
					self.addPoint();
				}
				
				if (self.areBothBlank()) {
					self.removeBlank($(document.activeElement));
				}
			}
		},
		
		areBothBlank: function() {
			if ($('.x').last().is($(document.activeElement)) || $('.y').last().is($(document.activeElement))) {
				return false;
			}
			
			if ($('.x').is($(document.activeElement)) && 
			$(document.activeElement).parent().next().children().first().val() == '' && 
			$(document.activeElement).val() == '') {
				return true;	
			}
			if ($('.y').is($(document.activeElement)) && 
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
    creator.setUp();
});