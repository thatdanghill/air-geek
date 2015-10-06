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
	this.complement = [];
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
	
	plot : function(){},
	
	makeTable: function(container, data) {
		// Instantiate data table
		var dt = new google.visualization.DataTable();
		
		// Add all the columns
		dt.addColumn('string','Month');
		var years = this.findAllOrderedYears(data.map(this.extractX));
		for (var i in years) {
			dt.addColumn('number', years[i]);
		}
		
		var formatter = new google.visualization.NumberFormat({pattern: this.pattern});
		
		// Add the rows
		this.addMonthRows(dt);
		
		for (var i in data) {
			var row = this.getMonthIndex(this.extractX(data[i]));
			var col = years.indexOf(this.getYear(this.extractX(data[i]))) + 1;
			dt.setFormattedValue(row,col,formatter.formatValue(this.extractY(data[i])));
		}
		
		var table = new google.visualization.Table(container);
		table.draw(dt);
	},
	
	findAllOrderedYears: function(xs) {
		var years = new Set();
		for (var i in xs) {
			years.add(this.getYear(xs[i]));
		}
		var vals = [];
		var iter = years.values();
		var next = iter.next().value;
		while(next) {
			vals.push(next);
			next = iter.next().value;
		}
		//return Array.from(years).sort();
		return vals;
	},
	
	addMonthRows: function(table) {
		table.addRows(12);
		table.setFormattedValue(0,0,"Jan");
		table.setFormattedValue(1,0,"Feb");
		table.setFormattedValue(2,0,"Mar");
		table.setFormattedValue(3,0,"Apr");
		table.setFormattedValue(4,0,"May");
		table.setFormattedValue(5,0,"Jun");
		table.setFormattedValue(6,0,"Jul");
		table.setFormattedValue(7,0,"Aug");
		table.setFormattedValue(8,0,"Sep");
		table.setFormattedValue(9,0,"Oct");
		table.setFormattedValue(10,0,"Nov");
		table.setFormattedValue(11,0,"Dec");
	},
	
	getMonthIndex: function(x) {
		var mos = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
		return mos.indexOf(x.split(" ")[0].toLowerCase()) % 12;	
	},
	
	getYear: function(x) {
		return parseInt(x.split(" ")[1]);
	},
	
	extractX: function(data) {
		return data[0];
	},
	
	extractY: function(data) {
		return data[1];
	}
}

function RawGraph(container) {
	this.title = $("meta").attr("graph");
	this.pattern = '#,###';
	this.url = window.location.href;
	Graph.call(this, container);
}

inheritPrototype(RawGraph, Graph);

RawGraph.prototype = $.extend({}, RawGraph.prototype, {
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
			that.url = data['url'];
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
		this.container.find('.buttons').prepend($('#shovelicon').clone().show());
		this.container.find('.buttons').prepend($('#tableicon').clone().show());
		this.container.find('.buttons').prepend($('#calculatoricon').clone().show());
		
		this.container.find('#shovelicon').attr({href: this.url, target : "_blank"});
		
		this.calculatorAction(this.container);
		this.tableAction(this.container);
	},
	
	calculatorAction : function(container) {
		selections = "<form><table><tbody><tr><td valign='top'><input class='calc-select' type='checkbox' value='raw-view' checked><i><b>Raw</b></i><br>" +
		//"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-mom'>Month on Month<br>" +
		//"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav'><i>3 Month Avg</i><br>" +
		//"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav-mom'>Month on Month<br>" +
		//"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav'><i>12 Month Avg</i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav-yoy'>Year on Year<br></td>" +
		"<td><input class='calc-select' type='checkbox' value='sa'><i><b>Seasonally Adjusted</b></i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav'><i>3 Month Avg</i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav'><i>12 Month Avg</i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav-yoy'>Year on Year<br>" +
		"&nbsp<input class='calc-select' type='checkbox' value='index-view'><i>Index</i><br></td>"+
		"<td valign='top'><input class='calc-select' type='checkbox' value='sa-3yr'><i><b>Seasonally Adjusted 3Yr</b></i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-3mav'><i>3 Month Avg</i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-3mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-3mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-3mav-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-12mav'><i>12 Month Avg</i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-12mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-12mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3yr-12mav-yoy'>Year on Year<br>" +
		"&nbsp<input class='calc-select' type='checkbox' value='3yr-index-view'><i>Index</i><br></td>"+
		"<td valign='top'><input class='calc-select' type='checkbox' value='sa-5yr'><i><b>Seasonally Adjusted 5Yr</b></i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-3mav'><i>3 Month Avg</i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-3mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-3mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-3mav-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-12mav'><i>12 Month Avg</i><br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-12mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-12mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-5yr-12mav-yoy'>Year on Year<br>" +
		"&nbsp<input class='calc-select' type='checkbox' value='5yr-index-view'><i>Index</i><br></td>"+
		"</td></tr></tbody></table></form>";
		
		menustr = "<div id='calc-graph-list' style='background-color: #9eb3c0; padding: 15px; display:none'>" + selections + "</div>";
		container.find(".view").before(menustr);
		this.container.find('#calculatoricon').click(function(event) {
			event.preventDefault();
			$("#calc-graph-list").toggle('slow');
		});
		
		var that = this;
		$('.calc-select').change(function() {
		var str = $(this).val();
		if ($(this).prop("checked")) {
			if ($('#' + str).length) {
				$('#' + str).show();
			}
			else {
				var dom = "<div id='"+str+"' class='graph' style='padding-left: 50px'></div>";
				$("#graph-holder").append(dom);
				var cgraph = that.whichObj(str, $("#graph-holder").find("#" + str), that);
				cgraph.makeGraph();
			}
		} else {
			$('#' + str).hide();
		}
		});
	},
	
	whichObj: function(id, container, that) {
		switch(id) {
			case "raw-mom":
				return new MonthOnMonthGraph(container, that);
				break;
			case "raw-qoq":
				return new QuarterOnQuarterGraph(container, that);
				break;
			case "raw-yoy":
				return new YearOnYearGraph(container, that);
				break;
			case "raw-3mav":
				return new Raw3MavGraph(container, that);
				break;
			case "raw-3mav-mom":
				return new MonthOnMonth3MavGraph(container, that);
				break;
			case "raw-3mav-qoq":
				return new QuarterOnQuarter3MavGraph(container, that);
				break;
			case "raw-3mav-yoy":
				return new YearOnYear3MavGraph(container, that);
				break;
			case "raw-12mav":
				return new Raw12MavGraph(container, that);
				break;
			case "raw-12mav-mom":
				return new MonthOnMonth12MavGraph(container, that);
				break;
			case "raw-12mav-qoq":
				return new QuarterOnQuarter12MavGraph(container, that);
				break;
			case "raw-12mav-yoy":
				return new YearOnYear12MavGraph(container, that);
				break;
			case "sa":
				return new SeasonallyAdjustedDataGraph(container, that);
				break;
			case "sa-mom":
				return new SeasonalMonthOnMonthGraph(container, that);
				break;
			case "sa-qoq":
				return new SeasonalQuarterOnQuarterGraph(container, that);
				break;
			case "sa-yoy":
				return new SeasonalYearOnYearGraph(container, that);
				break;
			case "sa-3mav":
				return new Seasonal3MavGraph(container, that);
				break;
			case "sa-3mav-mom":
				return new SeasonalMonthOnMonth3MavGraph(container, that);
				break;
			case "sa-3mav-qoq":
				return new SeasonalQuarterOnQuarter3MavGraph(container, that);
				break;
			case "sa-3mav-yoy":
				return new SeasonalYearOnYear3MavGraph(container, that);
				break;
			case "sa-12mav":
				return new Seasonal12MavGraph(container, that);
				break;
			case "sa-12mav-mom":
				return new SeasonalMonthOnMonth12MavGraph(container, that);
				break;
			case "sa-12mav-qoq":
				return new SeasonalQuarterOnQuarter12MavGraph(container, that);
				break;
			case "sa-12mav-yoy":
				return new SeasonalYearOnYear12MavGraph(container, that);
				break;
			case "index-view":
				return new SeasonalIndexGraph(container, that);
				break;
			case "sa-3yr":
				return new SeasonallyAdjustedData3YrGraph(container, that);
				break;
			case "sa-3yr-mom":
				return new Seasonal3YrMonthOnMonthGraph(container, that);
				break;
			case "sa-3yr-qoq":
				return new Seasonal3YrQuarterOnQuarterGraph(container, that);
				break;
			case "sa-3yr-yoy":
				return new Seasonal3YrYearOnYearGraph(container, that);
				break;
			case "sa-3yr-3mav":
				return new Seasonal3Yr3MavGraph(container, that);
				break;
			case "sa-3yr-3mav-mom":
				return new Seasonal3YrMonthOnMonth3MavGraph(container, that);
				break;
			case "sa-3yr-3mav-qoq":
				return new Seasonal3YrQuarterOnQuarter3MavGraph(container, that);
				break;
			case "sa-3yr-3mav-yoy":
				return new Seasonal3YrYearOnYear3MavGraph(container, that);
				break;
			case "sa-3yr-12mav":
				return new Seasonal3Yr12MavGraph(container, that);
				break;
			case "sa-3yr-12mav-mom":
				return new Seasonal3YrMonthOnMonth12MavGraph(container, that);
				break;
			case "sa-3yr-12mav-qoq":
				return new Seasonal3YrQuarterOnQuarter12MavGraph(container, that);
				break;
			case "sa-3yr-12mav-yoy":
				return new Seasonal3YrYearOnYear12MavGraph(container, that);
				break;
			case "3yr-index-view":
				return new Seasonal3YrIndexGraph(container, that);
				break;
			case "sa-5yr":
				return new SeasonallyAdjustedData5YrGraph(container, that);
				break;
			case "sa-5yr-mom":
				return new Seasonal5YrMonthOnMonthGraph(container, that);
				break;
			case "sa-5yr-qoq":
				return new Seasonal5YrQuarterOnQuarterGraph(container, that);
				break;
			case "sa-5yr-yoy":
				return new Seasonal5YrYearOnYearGraph(container, that);
				break;
			case "sa-5yr-3mav":
				return new Seasonal5Yr3MavGraph(container, that);
				break;
			case "sa-5yr-3mav-mom":
				return new Seasonal5YrMonthOnMonth3MavGraph(container, that);
				break;
			case "sa-5yr-3mav-qoq":
				return new Seasonal5YrQuarterOnQuarter3MavGraph(container, that);
				break;
			case "sa-5yr-3mav-yoy":
				return new Seasonal5YrYearOnYear3MavGraph(container, that);
				break;
			case "sa-5yr-12mav":
				return new Seasonal5Yr12MavGraph(container, that);
				break;
			case "sa-5yr-12mav-mom":
				return new Seasonal5YrMonthOnMonth12MavGraph(container, that);
				break;
			case "sa-5yr-12mav-qoq":
				return new Seasonal5YrQuarterOnQuarter12MavGraph(container, that);
				break;
			case "sa-5yr-12mav-yoy":
				return new Seasonal5YrYearOnYear12MavGraph(container, that);
				break;
			case "5yr-index-view":
				return new IndexGraph5Yr(container, that);
				break;
		}
	},
	
	tableAction: function(container) {
		var tbstr = "<div id='graph-table' style='display: none'></div>";
		this.container.append(tbstr);
		this.makeTable($("#graph-table")[0], this.data);
		this.container.find('#tableicon').click(function() {
			$("#graph-table").toggle();
		});
	}
});

function CalculatedGraph(container, rawGraph) {
	this.raw = rawGraph;
	Graph.call(this, container);
}

inheritPrototype(CalculatedGraph, Graph);

CalculatedGraph.prototype = $.extend({}, CalculatedGraph.prototype, {
	makeGraph: function() {
		var user = $("meta").attr("user");
		if (user == '') {
			this.data = [];
			return;
		}
		
		var project = $("meta").attr("project");
		var page = $("meta").attr("page");
		var graph = this.raw.title;
		var that = this;
		$.ajax({
			url: '/complement_points/', 
			data: {user : user, project : project, page: page, graph: graph}, 
			success: function(data) {
			if (data == '') {
				return;
			}
			that.complement = data['complement'];
			that.calculate(that.raw.data);
			that.plot();
			}
		});
	},
	
	plot: function() {
		this.render();
		this.addButtons();
	},
	
	render: function() {
		var layoutstr = "<div class='title' style='display:inline-block; vertical-align: middle'><p>" + this.title + "</p></div><div class='buttons' style='display:inline-block; margin-left: 25px; vertical-align: middle'></div><div class='view' id='theone'></div>";
		this.container.append(layoutstr);
		this.drawGraph(this.data);

	},
	
	drawGraph: function(data) {
		var table = new google.visualization.DataTable();
		table.addColumn('string', "Month");
		table.addColumn('number', this.title);
		table.addRows(data);
		this.options['title'] = this.title;
		
		var chart = new google.charts.Line(this.container.find(".view").first()[0]);
		chart.draw(table, this.options);
	},
	
	addButtons: function() {
		this.container.find('.buttons').prepend($('#tableicon').clone().show());
		var tbstr = "<div id='graph-table' style='display: none'></div>";
		this.container.append(tbstr);
		this.makeTable(this.container.find("#graph-table")[0], this.data);
		var that = this;
		this.container.find('#tableicon').click(function() {
			that.container.find("#graph-table").toggle();
		});
	},
	
	calculate: function(data) {}
});

function MonthOnMonthGraph(container, rawGraph) {
	this.title = "Month on Month";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(MonthOnMonthGraph, CalculatedGraph);

MonthOnMonthGraph.prototype.calculate = function(data) {
	for (var i = 1; i < data.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = data[i][0];
		this.data[i-1][1] = (data[i][1]/data[i-1][1] - 1);
	}
};


function QuarterOnQuarterGraph(container, rawGraph) {
	this.title = "Quarter on Quarter";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(QuarterOnQuarterGraph, CalculatedGraph);

QuarterOnQuarterGraph.prototype.calculate = function(data) {
    for (var i = 5; i < data.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = data[i][0];
        this.data[i-5][1] = ((data[i][1] + data[i-1][1] + data[i-2][1])/(data[i-3][1] + data[i-4][1] + data[i-5][1]) - 1);
    }
};

function YearOnYearGraph(container, rawGraph) {
	this.title = "Year on Year";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(YearOnYearGraph, CalculatedGraph);

YearOnYearGraph.prototype.calculate = function(data) {
    for (var i = 12; i < data.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = data[i][0];
        this.data[i-12][1] = (data[i][1]/data[i-12][1] - 1);
    }
};

function Raw3MavGraph(container, rawGraph) {
	this.title = "3 Month Moving Average";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Raw3MavGraph, CalculatedGraph);

Raw3MavGraph.prototype.calculate = function(data) {
	for (var i = 0; i < data.length; i++){
        this.data[i] = [];
        if (i == 0) {
            this.data[i][0] = data[i][0];
            this.data[i][1] = data[i][1];
        }
        else if (i == 1) {
            this.data[i][0] = data[i][0];
            this.data[i][1] = (data[i][1] + data[i-1][1]) / 2;
        }
        else {
            this.data[i][0] = data[i][0];
            this.data[i][1] = (data[i][1] + data[i-1][1] + data[i-2][1]) / 3;
        } 
    }
};

function MonthOnMonth3MavGraph(container, rawGraph) {
	this.title = "3 Month Average Month on Month";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(MonthOnMonth3MavGraph, CalculatedGraph);

MonthOnMonth3MavGraph.prototype.calculate = function(data) {
	var vals = [];
	for (var i = 0; i < data.length; i++){
        vals[i] = [];
        if (i == 0) {
            vals[i][0] = data[i][0];
            vals[i][1] = data[i][1];
        }
        else if (i == 1) {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1]) / 2;
        }
        else {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1] + data[i-2][1]) / 3;
        } 
    }
    for (var i = 1; i < vals.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = vals[i][0];
		this.data[i-1][1] = (vals[i][1]/vals[i-1][1] - 1);
	}
};

function QuarterOnQuarter3MavGraph(container, rawGraph) {
	this.title = "3 Month Average Quarter on Quarter";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(QuarterOnQuarter3MavGraph, CalculatedGraph);

QuarterOnQuarter3MavGraph.prototype.calculate = function(data) {
	var vals = [];
	for (var i = 0; i < data.length; i++){
        vals[i] = [];
        if (i == 0) {
            vals[i][0] = data[i][0];
            vals[i][1] = data[i][1];
        }
        else if (i == 1) {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1]) / 2;
        }
        else {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1] + data[i-2][1]) / 3;
        } 
    }
    for (var i = 5; i < vals.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = vals[i][0];
        this.data[i-5][1] = ((vals[i][1] + vals[i-1][1] + vals[i-2][1])/(vals[i-3][1] + vals[i-4][1] + vals[i-5][1]) - 1);
    }
};

function YearOnYear3MavGraph(container, rawGraph) {
	this.title = "3 Month Average Year on Year";
	this.pattern = '#.###%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(YearOnYear3MavGraph, CalculatedGraph);

YearOnYear3MavGraph.prototype.calculate = function(data) {
	var vals = [];
	for (var i = 0; i < data.length; i++){
        vals[i] = [];
        if (i == 0) {
            vals[i][0] = data[i][0];
            vals[i][1] = data[i][1];
        }
        else if (i == 1) {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1]) / 2;
        }
        else {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1] + data[i-2][1]) / 3;
        } 
    }
    for (var i = 12; i < vals.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1]/vals[i-12][1] - 1);
    }
};

function Raw12MavGraph(container, rawGraph) {
	this.pattern = '#,###';
	this.title = "12 Month Moving Average";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Raw12MavGraph, CalculatedGraph);

Raw12MavGraph.prototype.calculate = function(data) {
    for (var i = 12; i < data.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = data[i][0];
        this.data[i-12][1] = (data[i][1] + data[i-1][1] + data[i-2][1] + data[i-3][1] + data[i-4][1] + data[i-5][1] + data[i-6][1]
                      + data[i-7][1] + data[i-8][1] + data[i-9][1] + data[i-10][1] + data[i-11][1]) / 12 ;
    }
};

function MonthOnMonth12MavGraph(container, rawGraph) {
	this.title = "12 Month Average Month on Month";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(MonthOnMonth12MavGraph, CalculatedGraph);

MonthOnMonth12MavGraph.prototype.calculate = function(data) {
	vals= [];
    for (var i = 12; i < data.length; i++){
        vals[i-12] = [];
        vals[i-12][0] = data[i][0];
        vals[i-12][1] = (data[i][1] + data[i-1][1] + data[i-2][1] + data[i-3][1] + data[i-4][1] + data[i-5][1] + data[i-6][1]
                      + data[i-7][1] + data[i-8][1] + data[i-9][1] + data[i-10][1] + data[i-11][1]);
    }
    for (var i = 1; i < vals.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = vals[i][0];
		this.data[i-1][1] = (vals[i][1]/vals[i-1][1] - 1);
	}
};

function QuarterOnQuarter12MavGraph(container, rawGraph) {
	this.title = "12 Month Average Quarter on Quarter";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(QuarterOnQuarter12MavGraph, CalculatedGraph);

QuarterOnQuarter12MavGraph.prototype.calculate = function(data) {
	vals= [];
    for (var i = 12; i < data.length; i++){
        vals[i-12] = [];
        vals[i-12][0] = data[i][0];
        vals[i-12][1] = (data[i][1] + data[i-1][1] + data[i-2][1] + data[i-3][1] + data[i-4][1] + data[i-5][1] + data[i-6][1]
                      + data[i-7][1] + data[i-8][1] + data[i-9][1] + data[i-10][1] + data[i-11][1]);
    }
	for (var i = 5; i < vals.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = vals[i][0];
        this.data[i-5][1] = ((vals[i][1] + vals[i-1][1] + vals[i-2][1])/(vals[i-3][1] + vals[i-4][1] + vals[i-5][1]) - 1);
    }
};

function YearOnYear12MavGraph(container, rawGraph) {
	this.title = "12 Month Average Year on Year";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(YearOnYear12MavGraph, CalculatedGraph);

YearOnYear12MavGraph.prototype.calculate = function(data) {
	vals= [];
    for (var i = 12; i < data.length; i++){
        vals[i-12] = [];
        vals[i-12][0] = data[i][0];
        vals[i-12][1] = (data[i][1] + data[i-1][1] + data[i-2][1] + data[i-3][1] + data[i-4][1] + data[i-5][1] + data[i-6][1]
                      + data[i-7][1] + data[i-8][1] + data[i-9][1] + data[i-10][1] + data[i-11][1]);
    }
    for (var i = 12; i < vals.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1]/vals[i-12][1] - 1);
    }
};

function SeasonallyAdjustedDataGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Data";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonallyAdjustedDataGraph, CalculatedGraph);

SeasonallyAdjustedDataGraph.prototype.calculate = function(data) {
	
	if (this.complement.length == 0){
		var totalYears = [];
		var seasonalRatios = [];
		var averageSeasonalRatios = [];
		for (i=0; i<data.length; i++){
			if (this.getMonthIndex(data[i][0]) == 0 && data[i+11] && this.getMonthIndex(data[i+11][0]) == 11 && this.getYear(data[i][0]) == this.getYear(data[i+11][0])){
				totalYears[Math.floor(i/12)] = [];
				totalYears[Math.floor(i/12)][0] = this.getYear(data[i][0]);
				totalYears[Math.floor(i/12)][1] = (data[i][1] + data[i+1][1] + data[i+2][1] + data[i+3][1] + data[i+4][1] + data[i+5][1]
									+ data[i+6][1] + data[i+7][1] + data[i+8][1] + data[i+9][1] + data[i+10][1] + data[i+11][1])
			}
		}
		for (i=0; i < data.length; i++) {
			for (j=0; j < totalYears.length; j++){
				if (this.getYear(data[i][0]) == totalYears[j][0]) {
					seasonalRatios[i] = [];
					seasonalRatios[i][0] = data[i][0];
					seasonalRatios[i][1] = data[i][1]/totalYears[j][1];	
				}				
			}
		}
		for (i=0; i < 12; i++) {
			averageSeasonalRatios[i] = [];
			averageSeasonalRatios[i][0] = i;
			var monthSum = 0;
			var that = this;
			seasonalRatios.filter(function(point) {
				return that.getMonthIndex(point[0]) == i;	
			}).forEach(function(point) {
					monthSum += point[1];
				});
			averageSeasonalRatios[i][1] = monthSum/totalYears.length;
		}
		for (i=0; i < data.length; i++) {
			this.data[i] = [];
			this.data[i][0] = data[i][0];
			this.data[i][1] = data[i][1]/averageSeasonalRatios[this.getMonthIndex(data[i][0])][1];
		}		
	}
	
	else{
		passenger_vols = this.complement
		var max_pass_vols = []
		
		for (i=0; i < data.length; i++) {
			for (j=0; j<passenger_vols.length; j++) {
				if (this.getMonthIndex(data[i][0]) == this.getMonthIndex(passenger_vols[j][0]) && this.getYear(data[i][0]) == this.getYear(passenger_vols[j][0])) {
					max_pass_vols[i] = []
					max_pass_vols[i][0] = data[i][0]
					max_pass_vols[i][1] = passenger_vols[j][1]/data[i][1]
				}
			}
		}
		
		var totalYearsPoss = []
		
		for (i=0; i<max_pass_vols.length; i++){
			if (this.getMonthIndex(max_pass_vols[i][0]) == 0 && max_pass_vols[i+11] && this.getMonthIndex(max_pass_vols[i+11][0]) == 11 && this.getYear(max_pass_vols[i][0]) == this.getYear(data[i+11][0])){
				totalYearsPoss[Math.floor(i/12)] = [];
				totalYearsPoss[Math.floor(i/12)][0] = this.getYear(max_pass_vols[i][0]);
				totalYearsPoss[Math.floor(i/12)][1] = (max_pass_vols[i][1] + max_pass_vols[i+1][1] + max_pass_vols[i+2][1] + max_pass_vols[i+3][1] + max_pass_vols[i+4][1] + max_pass_vols[i+5][1]
									+ max_pass_vols[i+6][1] + max_pass_vols[i+7][1] + max_pass_vols[i+8][1] + max_pass_vols[i+9][1] + max_pass_vols[i+10][1] + max_pass_vols[i+11][1])
			}
		}
		
		var totalYears = []
		
		for (i=0; i<passenger_vols.length; i++){
			if (this.getMonthIndex(data[i][0]) == 0 && passenger_vols[i+11] && this.getMonthIndex(passenger_vols[i+11][0]) == 11 && this.getYear(passenger_vols[i][0]) == this.getYear(passenger_vols[i+11][0])){
				totalYears[Math.floor(i/12)] = [];
				totalYears[Math.floor(i/12)][0] = this.getYear(passenger_vols[i][0]);
				totalYears[Math.floor(i/12)][1] = (passenger_vols[i][1] + passenger_vols[i+1][1] + passenger_vols[i+2][1] + passenger_vols[i+3][1] + passenger_vols[i+4][1] + passenger_vols[i+5][1]
									+ passenger_vols[i+6][1] + passenger_vols[i+7][1] + passenger_vols[i+8][1] + passenger_vols[i+9][1] + passenger_vols[i+10][1] + passenger_vols[i+11][1])
			}
		}
		
		var yearLoadFactor = []
		
		for (i=0; i<totalYears.length; i++) {
			for (j=0; j<totalYearsPoss.length; j++) {
				if (totalYears[i][0] == totalYearsPoss[j][0]) {
					yearLoadFactor[i] = []
					yearLoadFactor[i][0] = totalYears[i][0]
					yearLoadFactor[i][1] = totalYears[i][1]/totalYearsPoss[j][1]
					}
			}
		}
		
		var seasonalRatios = []
		
		for (i=0; i < data.length; i++) {
			for (j=0; j < yearLoadFactor.length; j++){
				if (this.getYear(data[i][0]) == yearLoadFactor[j][0]) {
					seasonalRatios[i] = [];
					seasonalRatios[i][0] = data[i][0];
					seasonalRatios[i][1] = data[i][1]/yearLoadFactor[j][1];	
				}
			}
		}
		
		var averageSeasonalRatios = []
		
		for (i=0; i < 12; i++) {
			averageSeasonalRatios[i] = [];
			averageSeasonalRatios[i][0] = i;
			var monthSum = 0;
			var that = this;
			seasonalRatios.filter(function(point) {
				return that.getMonthIndex(point[0]) == i;	
			}).forEach(function(point) {
					monthSum += point[1];
				});
			averageSeasonalRatios[i][1] = monthSum/totalYears.length;
		}
		
		for (i=0; i < data.length; i++) {
			this.data[i] = [];
			this.data[i][0] = data[i][0];
			this.data[i][1] = data[i][1]/averageSeasonalRatios[this.getMonthIndex(data[i][0])][1];
		}		//code
		
	}
	
};

function SeasonalMonthOnMonthGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Month on Month";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalMonthOnMonthGraph, SeasonallyAdjustedDataGraph);

SeasonalMonthOnMonthGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedDataGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 1; i < vals.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = vals[i][0];
		this.data[i-1][1] = (vals[i][1]/vals[i-1][1] - 1);
	}
};

function SeasonalQuarterOnQuarterGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Quarter on Quarter";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalQuarterOnQuarterGraph, SeasonallyAdjustedDataGraph);

SeasonalQuarterOnQuarterGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedDataGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 5; i < vals.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = vals[i][0];
        this.data[i-5][1] = ((vals[i][1] + vals[i-1][1] + vals[i-2][1])/(vals[i-3][1] + vals[i-4][1] + vals[i-5][1]) - 1);
    }
	
};

function SeasonalYearOnYearGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Year on Year";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalYearOnYearGraph, SeasonallyAdjustedDataGraph);

SeasonalYearOnYearGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedDataGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 12; i < vals.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1]/vals[i-12][1] - 1);
    }
};

function Seasonal3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3MavGraph, SeasonallyAdjustedDataGraph);

Seasonal3MavGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedDataGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 0; i < vals.length; i++){
        this.data[i] = [];
        if (i == 0) {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = vals[i][1];
        }
        else if (i == 1) {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = (vals[i][1] + vals[i-1][1]) / 2;
        }
        else {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1]) / 3;
        } 
    }
};

function SeasonalMonthOnMonth3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average Month on Month";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalMonthOnMonth3MavGraph, Seasonal3MavGraph);

SeasonalMonthOnMonth3MavGraph.prototype.calculate = function(data) {
	Seasonal3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 1; i < points.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = points[i][0];
		this.data[i-1][1] = (points[i][1]/points[i-1][1] - 1);
	}
};

function SeasonalQuarterOnQuarter3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average Quarter on Quarter";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalQuarterOnQuarter3MavGraph, SeasonalMonthOnMonth3MavGraph);

SeasonalQuarterOnQuarter3MavGraph.prototype.calculate = function(data) {
	SeasonalMonthOnMonth3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
		for (var i = 5; i < points.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = points[i][0];
        this.data[i-5][1] = ((points[i][1] + points[i-1][1] + points[i-2][1])/(points[i-3][1] + points[i-4][1] + points[i-5][1]) - 1);
    }
};

function SeasonalYearOnYear3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average Year on Year";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalYearOnYear3MavGraph, SeasonalMonthOnMonth3MavGraph);

SeasonalYearOnYear3MavGraph.prototype.calculate = function(data) {
	SeasonalMonthOnMonth3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 12; i < points.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = points[i][0];
        this.data[i-12][1] = (points[i][1]/points[i-12][1] - 1);
    }
};

function Seasonal12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal12MavGraph, SeasonallyAdjustedDataGraph);

Seasonal12MavGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedDataGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 12; i < vals.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1] + vals[i-3][1] + vals[i-4][1] + vals[i-5][1] + vals[i-6][1]
                      + vals[i-7][1] + vals[i-8][1] + vals[i-9][1] + vals[i-10][1] + vals[i-11][1]) / 12;
    }
};

function SeasonalMonthOnMonth12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average Month on Month";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalMonthOnMonth12MavGraph, Seasonal12MavGraph);

SeasonalMonthOnMonth12MavGraph.prototype.calculate = function(data) {
	Seasonal12MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 1; i < points.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = points[i][0];
		this.data[i-1][1] = (points[i][1]/points[i-1][1] - 1);
	}
	
};

function SeasonalQuarterOnQuarter12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average Quarter on Quarter";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalQuarterOnQuarter12MavGraph, Seasonal12MavGraph);

SeasonalQuarterOnQuarter12MavGraph.prototype.calculate = function(data) {
	Seasonal12MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 5; i < points.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = points[i][0];
        this.data[i-5][1] = ((points[i][1] + points[i-1][1] + points[i-2][1])/(points[i-3][1] + points[i-4][1] + points[i-5][1]) - 1);
    }
};

function SeasonalYearOnYear12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average Year on Year";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalYearOnYear12MavGraph, Seasonal12MavGraph);

SeasonalYearOnYear12MavGraph.prototype.calculate = function(data) {
	Seasonal12MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 12; i < points.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = points[i][0];
        this.data[i-12][1] = (points[i][1]/points[i-12][1] - 1);
    }
};


function SeasonalIndexGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Index";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalIndexGraph, SeasonallyAdjustedDataGraph);

SeasonalIndexGraph.prototype.calculate = function(data) {
    SeasonallyAdjustedDataGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	var points = [];
	for (var i = 0; i < vals.length; i++){
        points[i] = [];
        if (i == 0) {
            points[i][0] = vals[i][0];
            points[i][1] = vals[i][1];
        }
        else if (i == 1) {
            points[i][0] = vals[i][0];
            points[i][1] = (vals[i][1] + vals[i-1][1]) / 2;
        }
        else {
            points[i][0] = vals[i][0];
            points[i][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1]) / 3;
        } 
    }
	for (i=0; i < points.length; i++) {
		this.data[i] = [];
		this.data[i][0] = points[i][0];
		this.data[i][1] = (points[i][1]/points[0][1])*100
	}
};

function SeasonallyAdjustedData3YrGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonallyAdjustedData3YrGraph, CalculatedGraph);

SeasonallyAdjustedData3YrGraph.prototype.calculate = function(data) {
	if (this.complement.length == 0){
	var totalYears = [];
	var seasonalRatios = [];
	var averageSeasonalRatios = [];
	for (i=0; i<data.length; i++){
		if (this.getMonthIndex(data[i][0]) == 0 && data[i+11] && this.getMonthIndex(data[i+11][0]) == 11 && this.getYear(data[i][0]) == this.getYear(data[i+11][0])){
			totalYears[Math.floor(i/12)] = [];
			totalYears[Math.floor(i/12)][0] = this.getYear(data[i][0]);
			totalYears[Math.floor(i/12)][1] = (data[i][1] + data[i+1][1] + data[i+2][1] + data[i+3][1] + data[i+4][1] + data[i+5][1]
								+ data[i+6][1] + data[i+7][1] + data[i+8][1] + data[i+9][1] + data[i+10][1] + data[i+11][1])
		}
	}
	if (totalYears.length <2) {
		alert("More years required");
    }
		
	
	for (i=0; i < data.length; i++) {
		for (j=0; j < totalYears.length; j++){
			if (this.getYear(data[i][0]) == totalYears[j][0]) {
				seasonalRatios[i] = [];
				seasonalRatios[i][0] = data[i][0];
				seasonalRatios[i][1] = data[i][1]/totalYears[j][1];	
			}				
		}
	}
	
	for(i=0; i < data.length; i++){
		averageSeasonalRatios[i] = [];
		averageSeasonalRatios[i][0] = data[i][0]
		if (seasonalRatios[i] == undefined) {
			if (seasonalRatios[i+12] == undefined) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i-12][1] + seasonalRatios[i-24][1] + seasonalRatios[i-36][1])/3;
			}
			else {
				averageSeasonalRatios[i][1] = (seasonalRatios[i+12][1] + seasonalRatios[i+24][1] + seasonalRatios[i+36][1])/3;	
				}
		}
		else {
			if (seasonalRatios[i-24]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1] + seasonalRatios[i-24][1])/3;
			}
			else if (seasonalRatios[i-12] && seasonalRatios[i+12]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1] + seasonalRatios[i+12][1])/3;
			}
			else {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i+24][1] + seasonalRatios[i+12][1])/3;	
			}		
		}	
	}	
	for (i=0; i < data.length; i++) {
		this.data[i] = [];
		this.data[i][0] = data[i][0]
		this.data[i][1] = data[i][1]/averageSeasonalRatios[i][1]	
	}
	}
	
	else{
		passenger_vols = this.complement
		var max_pass_vols = []
		
		for (i=0; i < data.length; i++) {
			for (j=0; j<passenger_vols.length; j++) {
				if (this.getMonthIndex(data[i][0]) == this.getMonthIndex(passenger_vols[j][0]) && this.getYear(data[i][0]) == this.getYear(passenger_vols[j][0])) {
					max_pass_vols[i] = []
					max_pass_vols[i][0] = data[i][0]
					max_pass_vols[i][1] = passenger_vols[j][1]/data[i][1]
				}
			}
		}
		
		var totalYearsPoss = []
		
		for (i=0; i<max_pass_vols.length; i++){
			if (this.getMonthIndex(max_pass_vols[i][0]) == 0 && max_pass_vols[i+11] && this.getMonthIndex(max_pass_vols[i+11][0]) == 11 && this.getYear(max_pass_vols[i][0]) == this.getYear(data[i+11][0])){
				totalYearsPoss[Math.floor(i/12)] = [];
				totalYearsPoss[Math.floor(i/12)][0] = this.getYear(max_pass_vols[i][0]);
				totalYearsPoss[Math.floor(i/12)][1] = (max_pass_vols[i][1] + max_pass_vols[i+1][1] + max_pass_vols[i+2][1] + max_pass_vols[i+3][1] + max_pass_vols[i+4][1] + max_pass_vols[i+5][1]
									+ max_pass_vols[i+6][1] + max_pass_vols[i+7][1] + max_pass_vols[i+8][1] + max_pass_vols[i+9][1] + max_pass_vols[i+10][1] + max_pass_vols[i+11][1])
			}
		}
		
		var totalYears = []
		
		for (i=0; i<passenger_vols.length; i++){
			if (this.getMonthIndex(data[i][0]) == 0 && passenger_vols[i+11] && this.getMonthIndex(passenger_vols[i+11][0]) == 11 && this.getYear(passenger_vols[i][0]) == this.getYear(passenger_vols[i+11][0])){
				totalYears[Math.floor(i/12)] = [];
				totalYears[Math.floor(i/12)][0] = this.getYear(passenger_vols[i][0]);
				totalYears[Math.floor(i/12)][1] = (passenger_vols[i][1] + passenger_vols[i+1][1] + passenger_vols[i+2][1] + passenger_vols[i+3][1] + passenger_vols[i+4][1] + passenger_vols[i+5][1]
									+ passenger_vols[i+6][1] + passenger_vols[i+7][1] + passenger_vols[i+8][1] + passenger_vols[i+9][1] + passenger_vols[i+10][1] + passenger_vols[i+11][1])
			}
		}
		
		var yearLoadFactor = []
		
		for (i=0; i<totalYears.length; i++) {
			for (j=0; j<totalYearsPoss.length; j++) {
				if (totalYears[i][0] == totalYearsPoss[j][0]) {
					yearLoadFactor[i] = []
					yearLoadFactor[i][0] = totalYears[i][0]
					yearLoadFactor[i][1] = totalYears[i][1]/totalYearsPoss[j][1]
					}
			}
		}
		
		var seasonalRatios = []
		
		for (i=0; i < data.length; i++) {
			for (j=0; j < yearLoadFactor.length; j++){
				if (this.getYear(data[i][0]) == yearLoadFactor[j][0]) {
					seasonalRatios[i] = [];
					seasonalRatios[i][0] = data[i][0];
					seasonalRatios[i][1] = data[i][1]/yearLoadFactor[j][1];	
				}
			}
		}
		
		var averageSeasonalRatios = []
		
		for(i=0; i < data.length; i++){
		averageSeasonalRatios[i] = [];
		averageSeasonalRatios[i][0] = data[i][0]
		if (seasonalRatios[i] == undefined) {
			if (seasonalRatios[i+12] == undefined) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i-12][1] + seasonalRatios[i-24][1] + seasonalRatios[i-36][1])/3;
			}
			else {
				averageSeasonalRatios[i][1] = (seasonalRatios[i+12][1] + seasonalRatios[i+24][1] + seasonalRatios[i+36][1])/3;	
				}
		}
		else {
			if (seasonalRatios[i-24]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1] + seasonalRatios[i-24][1])/3;
			}
			else if (seasonalRatios[i-12] && seasonalRatios[i+12]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1] + seasonalRatios[i+12][1])/3;
			}
			else {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i+24][1] + seasonalRatios[i+12][1])/3;	
			}		
		}	
	}
		
		for (i=0; i < data.length; i++) {
			this.data[i] = [];
			this.data[i][0] = data[i][0];
			this.data[i][1] = data[i][1]/averageSeasonalRatios[this.getMonthIndex(data[i][0])][1];
		}		//code
		
	}
	
	
};

function Seasonal3YrMonthOnMonthGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr MoM";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrMonthOnMonthGraph, SeasonallyAdjustedData3YrGraph);

Seasonal3YrMonthOnMonthGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData3YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 1; i < vals.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = vals[i][0];
		this.data[i-1][1] = (vals[i][1]/vals[i-1][1] - 1);
	}
};

function Seasonal3YrQuarterOnQuarterGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr QoQ";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrQuarterOnQuarterGraph, SeasonallyAdjustedData3YrGraph);

Seasonal3YrQuarterOnQuarterGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData3YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 5; i < vals.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = vals[i][0];
        this.data[i-5][1] = ((vals[i][1] + vals[i-1][1] + vals[i-2][1])/(vals[i-3][1] + vals[i-4][1] + vals[i-5][1]) - 1);
    }
	
};

function Seasonal3YrYearOnYearGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr YoY";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrYearOnYearGraph, SeasonallyAdjustedData3YrGraph);

Seasonal3YrYearOnYearGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData3YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	 for (var i = 12; i < vals.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1]/vals[i-12][1] - 1);
    }
	
};

function Seasonal3Yr3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 3MAV";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3Yr3MavGraph, SeasonallyAdjustedData3YrGraph);

Seasonal3Yr3MavGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData3YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 0; i < vals.length; i++){
        this.data[i] = [];
        if (i == 0) {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = vals[i][1];
        }
        else if (i == 1) {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = (vals[i][1] + vals[i-1][1]) / 2;
        }
        else {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1]) / 3;
        } 
    }
	
};

function Seasonal3YrMonthOnMonth3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 3MAV MoM";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrMonthOnMonth3MavGraph, Seasonal3Yr3MavGraph);

Seasonal3YrMonthOnMonth3MavGraph.prototype.calculate = function(data) {
	Seasonal3Yr3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 1; i < points.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = points[i][0];
		this.data[i-1][1] = (points[i][1]/points[i-1][1] - 1);
	}
};


function Seasonal3YrQuarterOnQuarter3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 3MAV QoQ";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrQuarterOnQuarter3MavGraph, Seasonal3Yr3MavGraph);

Seasonal3YrQuarterOnQuarter3MavGraph.prototype.calculate = function(data) {
	Seasonal3Yr3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 5; i < points.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = points[i][0];
        this.data[i-5][1] = ((points[i][1] + points[i-1][1] + points[i-2][1])/(points[i-3][1] + points[i-4][1] + points[i-5][1]) - 1);
    }
	
};

function Seasonal3YrYearOnYear3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 3MAV YoY";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrYearOnYear3MavGraph, Seasonal3Yr3MavGraph);

Seasonal3YrYearOnYear3MavGraph.prototype.calculate = function(data) {
	Seasonal3Yr3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];

	for (var i = 12; i < points.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = points[i][0];
        this.data[i-12][1] = (points[i][1]/points[i-12][1] - 1);
    }
};	



function Seasonal3Yr12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 12MAV";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3Yr12MavGraph, SeasonallyAdjustedData3YrGraph);

Seasonal3Yr12MavGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData3YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
		for (var i = 12; i < data.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1] + vals[i-3][1] + vals[i-4][1] + vals[i-5][1] + vals[i-6][1]
                      + vals[i-7][1] + vals[i-8][1] + vals[i-9][1] + vals[i-10][1] + vals[i-11][1]) / 12 ;
    }	
};


function Seasonal3YrMonthOnMonth12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 12MAV MoM";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrMonthOnMonth12MavGraph, Seasonal3Yr12MavGraph);

Seasonal3YrMonthOnMonth12MavGraph.prototype.calculate = function(data) {
	Seasonal3Yr12MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];	
	for (var i = 1; i < points.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = points[i][0];
		this.data[i-1][1] = (points[i][1]/points[i-1][1] - 1);
	}
};

function Seasonal3YrQuarterOnQuarter12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 12MAV QoQ";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrQuarterOnQuarter12MavGraph, Seasonal3Yr12MavGraph);

Seasonal3YrQuarterOnQuarter12MavGraph.prototype.calculate = function(data) {
	Seasonal3Yr12MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];		
	for (var i = 5; i < points.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = points[i][0];
        this.data[i-5][1] = ((points[i][1] + points[i-1][1] + points[i-2][1])/(points[i-3][1] + points[i-4][1] + points[i-5][1]) - 1);
    }
};

function Seasonal3YrYearOnYear12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr 12MAV YoY";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrYearOnYear12MavGraph, Seasonal3Yr12MavGraph);

Seasonal3YrYearOnYear12MavGraph.prototype.calculate = function(data) {
	Seasonal3Yr12MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];	
	for (var i = 12; i < points.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = points[i][0];
        this.data[i-12][1] = (points[i][1]/points[i-12][1] - 1);
	}
};


function Seasonal3YrIndexGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3Yr Index";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3YrIndexGraph, SeasonallyAdjustedData3YrGraph);

Seasonal3YrIndexGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData3YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];	
	var points = [];	
	for (var i = 0; i < vals.length; i++){
        points[i] = [];
        if (i == 0) {
            points[i][0] = vals[i][0];
            points[i][1] = vals[i][1];
        }
        else if (i == 1) {
            points[i][0] = vals[i][0];
            points[i][1] = (vals[i][1] + vals[i-1][1]) / 2;
        }
        else {
            points[i][0] = vals[i][0];
            points[i][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1]) / 3;
        } 
    }
	
	for (i=0; i < points.length; i++) {
		this.data[i] = [];
		this.data[i][0] = points[i][0];
		this.data[i][1] = (points[i][1]/points[0][1])*100
	}
	
};


function SeasonallyAdjustedData5YrGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonallyAdjustedData5YrGraph, CalculatedGraph);

SeasonallyAdjustedData5YrGraph.prototype.calculate = function(data) {
	var totalYears = [];
	var seasonalRatios = [];
	var averageSeasonalRatios = [];
	for (i=0; i<data.length; i++){
		if (this.getMonthIndex(data[i][0]) == 0 && data[i+11] && this.getMonthIndex(data[i+11][0]) == 11 && this.getYear(data[i][0]) == this.getYear(data[i+11][0])){
			totalYears[Math.floor(i/12)] = [];
			totalYears[Math.floor(i/12)][0] = this.getYear(data[i][0]);
			totalYears[Math.floor(i/12)][1] = (data[i][1] + data[i+1][1] + data[i+2][1] + data[i+3][1] + data[i+4][1] + data[i+5][1]
								+ data[i+6][1] + data[i+7][1] + data[i+8][1] + data[i+9][1] + data[i+10][1] + data[i+11][1])
		}
	}
	if (totalYears.length <4) {
		  alert("More years required");
    }
		
	
	for (i=0; i < data.length; i++) {
		for (j=0; j < totalYears.length; j++){
			if (this.getYear(data[i][0]) == totalYears[j][0]) {
				seasonalRatios[i] = [];
				seasonalRatios[i][0] = data[i][0];
				seasonalRatios[i][1] = data[i][1]/totalYears[j][1];	
			}				
		}
	}
	for(i=0; i < data.length; i++){
		averageSeasonalRatios[i] = [];
		averageSeasonalRatios[i][0] = data[i][0]
		if (seasonalRatios[i] == undefined) {
			if (seasonalRatios[i+12] == undefined) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i-12][1] + seasonalRatios[i-24][1]
											   + seasonalRatios[i-36][1] + seasonalRatios[i-48][1] + seasonalRatios[i-60][1])/5;
			}
			else {
				averageSeasonalRatios[i][1] = (seasonalRatios[i+12][1] + seasonalRatios[i+24][1]
											   + seasonalRatios[i+36][1]+ seasonalRatios[i+48][1] + seasonalRatios[i+60][1])/5;	
				}
		}
		else {
			if (seasonalRatios[i-48]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1]
											   + seasonalRatios[i-24][1] + seasonalRatios[i-36][1] + seasonalRatios[i-48][1])/5;
			}
			else if (seasonalRatios[i-36] && seasonalRatios[i+12]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1] + seasonalRatios[i+12][1]
											   + seasonalRatios[i-24][1] + seasonalRatios[i-36][1])/5;
			}
			else if (seasonalRatios[i-24] && seasonalRatios[i+24]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1] + seasonalRatios[i+12][1]
											   + seasonalRatios[i-24][1] + seasonalRatios[i+24][1])/5;
			}
			else if (seasonalRatios[i-12] && seasonalRatios[i+36]) {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i-12][1] + seasonalRatios[i+12][1]
											   + seasonalRatios[i+24][1] + seasonalRatios[i+36][1])/5;
			}
			else {
				averageSeasonalRatios[i][1] = (seasonalRatios[i][1] + seasonalRatios[i+24][1] + seasonalRatios[i+12][1]
											   + seasonalRatios[i+36][1] + seasonalRatios[i+48][1])/5;	
			}
		}	
	}
	for (i=0; i < data.length; i++) {
		this.data[i] = [];
		this.data[i][0] = data[i][0]
		this.data[i][1] = data[i][1]/averageSeasonalRatios[i][1]	
	}
	
};


function Seasonal5YrMonthOnMonthGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr MoM";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5YrMonthOnMonthGraph, SeasonallyAdjustedData5YrGraph);

Seasonal5YrMonthOnMonthGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData5YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];	
	
	for (var i = 1; i < vals.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = vals[i][0];
		this.data[i-1][1] = (vals[i][1]/vals[i-1][1] - 1);
	}
};


function Seasonal5YrQuarterOnQuarterGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr QoQ";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5YrQuarterOnQuarterGraph, SeasonallyAdjustedData5YrGraph);

Seasonal5YrQuarterOnQuarterGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData5YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];	
	for (var i = 5; i < vals.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = vals[i][0];
        this.data[i-5][1] = ((vals[i][1] + vals[i-1][1] + vals[i-2][1])/(vals[i-3][1] + vals[i-4][1] + vals[i-5][1]) - 1);
    }
	
	
};

function Seasonal5YrYearOnYearGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr YoY";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5YrYearOnYearGraph, SeasonallyAdjustedData5YrGraph);

Seasonal5YrYearOnYearGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData5YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];	
	for (var i = 12; i < vals.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1]/vals[i-12][1] - 1);
	}
	
};


function Seasonal5Yr3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr 3MAV";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5Yr3MavGraph, SeasonallyAdjustedData5YrGraph);

Seasonal5Yr3MavGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData5YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];	
	for (var i = 0; i < vals.length; i++){
        this.data[i] = [];
        if (i == 0) {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = vals[i][1];
        }
        else if (i == 1) {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = (vals[i][1] + vals[i-1][1]) / 2;
        }
        else {
            this.data[i][0] = vals[i][0];
            this.data[i][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1]) / 3;
        } 
    }
	
	
};
	

function Seasonal5YrMonthOnMonth3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr 3MAV MoM";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5YrMonthOnMonth3MavGraph, Seasonal5Yr3MavGraph);

Seasonal5YrMonthOnMonth3MavGraph.prototype.calculate = function(data) {
	Seasonal5Yr3MavGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	for (var i = 1; i < points.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = points[i][0];
		this.data[i-1][1] = (points[i][1]/points[i-1][1] - 1);
	}
};

function Seasonal5YrQuarterOnQuarter3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr 3MAV QoQ";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5YrQuarterOnQuarter3MavGraph, Seasonal5Yr3MavGraph);

Seasonal5YrQuarterOnQuarter3MavGraph.prototype.calculate = function(data) {
	Seasonal5Yr3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 5; i < points.length; i++){
        this.data[i-5] = [];
        this.data[i-5][0] = points[i][0];
        this.data[i-5][1] = ((points[i][1] + points[i-1][1] + points[i-2][1])/(points[i-3][1] + points[i-4][1] + points[i-5][1]) - 1);
    }
};

function Seasonal5YrYearOnYear3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr 3MAV YoY";
	this.pattern = '#.##%';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5YrYearOnYear3MavGraph, Seasonal5Yr3MavGraph);

Seasonal5YrYearOnYear3MavGraph.prototype.calculate = function(data) {
	Seasonal5Yr3MavGraph.prototype.calculate.call(this, data);
	var points = this.data;
	this.data = [];
	for (var i = 12; i < points.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = points[i][0];
        this.data[i-12][1] = (points[i][1]/points[i-12][1] - 1);
	}
};

function Seasonal5Yr12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 5Yr 12MAV";
	this.pattern = '#,###';
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal5Yr12MavGraph, SeasonallyAdjustedData5YrGraph);

Seasonal5Yr12MavGraph.prototype.calculate = function(data) {
	SeasonallyAdjustedData5YrGraph.prototype.calculate.call(this, data);
	var vals = this.data;
	this.data = [];
	
	for (var i = 12; i < vals.length; i++){
        this.data[i-12] = [];
        this.data[i-12][0] = vals[i][0];
        this.data[i-12][1] = (vals[i][1] + vals[i-1][1] + vals[i-2][1] + vals[i-3][1] + vals[i-4][1] + vals[i-5][1] + vals[i-6][1]
                      + vals[i-7][1] + vals[i-8][1] + vals[i-9][1] + vals[i-10][1] + vals[i-11][1]) / 12 ;
    }
	
	
};


		

google.load('visualization', '1.0', {packages:['line', 'table']});
google.setOnLoadCallback(setUp);