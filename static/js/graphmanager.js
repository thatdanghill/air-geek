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
		raw.getData();
		raw.render();
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
	getData : function(){},
	render:function(){}
}

function RawGraph(container) {
	this.title = $("meta").attr("graph");
	Graph.call(this, container);
}

inheritPrototype(RawGraph, Graph);

RawGraph.prototype = {
	constructor: RawGraph,
	getData : function() {
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
			async: false,
			success: function(data) {
			if (data == '') {
				that.data = [];
				return;
			}
			that.data = data['points'];
			}
		});
	},
	
	render : function() {
		var rawGraphLayoutStr = "<div class='title' style='display:inline-block'><p><b>" + this.title + "</b></p></div><div class='buttons' style='display:inline-block'></div><div class='view' id='raw-view'></div>";
		this.container.prepend(rawGraphLayoutStr);
		this.drawGraph(this.data);
		this.addButtons();
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
		
	}
}

function CalculatedGraph(container) {
	Graph.call(this, container);
}

inheritPrototype(CalculatedGraph, Graph);

google.load('visualization', '1.0', {packages:['line', 'table']});
google.setOnLoadCallback(setUp);