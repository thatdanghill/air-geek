function setUp() {
	var graphManager = new GraphManager($("#graph-holder"));
	graphManager.initialize();
}

function inheritPrototype(childObject, parentObject) {
	    var copyOfParent = Object.create(parentObject.prototype);
	    copyOfParent.constructor = childObject;
	   childObject.prototype = copyOfParent;
}

function GraphManager(container) {
	this.container = container;
}

GraphManager.prototype = {
	constructor: GraphManager,
	initialize : function() {
		this.container.prepend("<div id='raw-container' class='graph'></div>");
		var raw = new RawGraph($("#raw-container"));
		raw.plot();
	},
}

function Graph(container) {
	this.container = container;
	this.data = [];
	this.options = {	
		'width' : 750,
		'height' : 450,
		'chartArea.width' : 500,
		'chartArea.height' : 350,
		'legend': {position: 'none'}
		
	};
}

Graph.prototype = {
	constructor: Graph,
	plot : function(){}
}

function RawGraph(container) {
	this.title = $("meta").attr("graph");
	Graph.call(this, container);
}

inheritPrototype(RawGraph, Graph);

RawGraph.prototype = {
	constructor: RawGraph,
	plot: function() {
		var user = $("meta").attr("user");
		if (user == '') {
			this.data = [];
			return;
		}
		
		var project = $("meta").attr("project");
		var page = $("meta").attr("page");
		var graph = this.title;
		var that = this;
		
		$.ajax({
			url: '/all_points/', 
			data: {user : user, project : project, page: page, graph: graph}, 
			success: function(data) {
			if (data == '') {
				that.data = [];
				return;
			}
			that.data = data['points'];
			that.render();
			that.addButtons();
			}
		});
	},

	render : function() {
		var rawGraphLayoutStr = "<div class='title' style='display:inline-block; vertical-align: middle'><p>" + this.title + "</p></div><div class='buttons' style='display:inline-block; margin-left: 25px; vertical-align: middle'></div><div class='view' id='raw-view'></div>";
		this.container.prepend(rawGraphLayoutStr);
		this.drawGraph(this.data);
	},
	
	drawGraph : function(data) {
		var table = new google.visualization.DataTable();
		table.addColumn('string', "Month");
		table.addColumn('number', this.title);
		table.addRows(data);
		this.options['title'] = this.title;
		
		var chart = new google.charts.Line(document.getElementById('raw-view'));
		chart.draw(table, this.options);
	},
	
	addButtons : function() {
		this.container.find('.buttons').prepend($('#tableicon').clone().show());
		this.container.find('.buttons').prepend($('#calculatoricon').clone().show());
		
		var that = this;
		//!!! FIX
		this.container.find('#calculatoricon').click(function() {
			var momstr = "<div id='mom-container' class='graph'></div>";
			$("#graph-holder").prepend(momstr);
			var mom = new MonthOnMonthGraph($("#graph-holder").find("#mom-container"), that);
			mom.calculate(that.data);
			mom.plot();
		});
	}
}

function CalculatedGraph(container, rawGraph) {
	this.raw = rawGraph;
	Graph.call(this, container);
}

inheritPrototype(CalculatedGraph, Graph);

CalculatedGraph.prototype = {
	constructor: CalculatedGraph,
	plot: function() {},
	calculate: function(data) {}
}

function MonthOnMonthGraph(container, rawGraph) {
	this.title = "Month on Month";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(MonthOnMonthGraph, CalculatedGraph);

MonthOnMonthGraph.prototype = {
	constructor: MonthOnMonthGraph,
	plot: function() {
		this.render();
		this.addButtons();
	},
	
	calculate: function(data) {
		for (var i = 1; i < data.length; i++) {
			this.data[i-1] = [];
			this.data[i-1][0] = data[i][0];
			this.data[i-1][1] = (data[i][1]/data[i-1][1] - 1) * 100;
		}
	},
	
	render: function() {
		var momGraphLayoutStr = "<div class='title' style='display:inline-block; vertical-align: middle'><p>" + this.title + "</p></div><div class='buttons' style='display:inline-block; margin-left: 25px; vertical-align: middle'></div><div class='view' id='mom-view'></div>";
		this.container.append(momGraphLayoutStr);
		this.drawGraph(this.data);
	},
	
	drawGraph: function(data) {
		var table = new google.visualization.DataTable();
		table.addColumn('string', "Month");
		table.addColumn('number', this.title);
		table.addRows(data);
		this.options['title'] = this.title;
		
		var chart = new google.charts.Line(document.getElementById('mom-view'));
		chart.draw(table, this.options);
	},
	
	addButtons: function() {
		
	}
	
}

google.load('visualization', '1.0', {packages:['line', 'table']});
google.setOnLoadCallback(setUp);