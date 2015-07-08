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
		
		this.calculatorAction(this.container);
		this.tableAction(this.container);
	},
	
	calculatorAction : function(container) {
		selections = "<form><table><tbody><tr><td><i><b>Raw</b></i><br>" +
		"&nbsp;<i>1 Month</i><br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav'><i>3 Month Avg</i><br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-3mav-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav'><i>12 Month Avg</i><br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='raw-12mav-yoy'>Year on Year<br></td>" +
		"<td><i><b>Seasonally Adjusted</b></i><br>" +
		"&nbsp;<i>1 Month</i><br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav'><i>3 Month Avg</i><br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-3mav-yoy'>Year on Year<br>" +
		"&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav'><i>12 Month Avg</i><br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav-mom'>Month on Month<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav-qoq'>Quarter on Quarter<br>" +
		"&nbsp;&nbsp;<input class='calc-select' type='checkbox' value='sa-12mav-yoy'>Year on Year<br>" +
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
				var dom = "<div class='sidebar' style='display:inline-block; padding: 25px;'></div><div id='"+str+"' class='graph' style='display: inline-block'></div>";
				$("#graph-holder").append(dom);
				var cgraph = that.whichObj(str, $("#graph-holder").find("#" + str), that);
				cgraph.calculate(that.data);
				cgraph.plot();
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
		}
	},
	
	tableAction: function(container) {
		
	}
}

function CalculatedGraph(container, rawGraph) {
	this.raw = rawGraph;
	Graph.call(this, container);
}

inheritPrototype(CalculatedGraph, Graph);

CalculatedGraph.prototype = {
	constructor: CalculatedGraph,
	
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
		
	},
	
	calculate: function(data) {}
}

function MonthOnMonthGraph(container, rawGraph) {
	this.title = "Month on Month";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(MonthOnMonthGraph, CalculatedGraph);

MonthOnMonthGraph.prototype.calculate = function(data) {
	for (var i = 1; i < data.length; i++) {
		this.data[i-1] = [];
		this.data[i-1][0] = data[i][0];
		this.data[i-1][1] = (data[i][1]/data[i-1][1] - 1) * 100;
	}
};


function QuarterOnQuarterGraph(container, rawGraph) {
	this.title = "Quarter on Quarter";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(QuarterOnQuarterGraph, CalculatedGraph);

QuarterOnQuarterGraph.prototype.calculate = function(data) {
	vals = [];
    for (var i = 5; i < data.length; i++){
        vals[i] = [];
        vals[i][0] = data[i][0];
        vals[i][1] = ((data[i][1] + data[i-1][1] + data[i-2][1])/(data[i-3][1] + data[i-4][1] + data[i-5][1]) - 1) * 100
    }
    this.data = vals;
};

function YearOnYearGraph(container, rawGraph) {
	this.title = "Year on Year";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(YearOnYearGraph, CalculatedGraph);

YearOnYearGraph.prototype.calculate = function(data) {
	vals = []
    for (var i = 12; i < data.length; i++){
        vals[i] = [];
        vals[i][0] = data[i][0];
        vals[i][1] = (data[i][1]/data[i-12][1] - 1) * 100;
    }
    this.data = vals;
};

function Raw3MavGraph(container, rawGraph) {
	this.title = "3 Month Moving Average";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Raw3MavGraph, CalculatedGraph);

Raw3MavGraph.prototype.calculate = function(data) {
	vals = []
    for (var i = 0; i+12 < data.length; i++){
        vals[i] = [];
        if (i == 0) {
            vals[i][0] = data[i][0];
            vals[i][1] = data[i][1];
        }
        if (i == 1) {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1]) / 2;
        }
        else {
            vals[i][0] = data[i][0];
            vals[i][1] = (data[i][1] + data[i-1][1] + data[i-2][1]) / 3;
        }
    }
    this.data = vals;
};

function MonthOnMonth3MavGraph(container, rawGraph) {
	this.title = "3 Month Average Month on Month";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(MonthOnMonth3MavGraph, CalculatedGraph);

MonthOnMonth3MavGraph.prototype.calculate = function(data) {
	
};

function QuarterOnQuarter3MavGraph(container, rawGraph) {
	this.title = "3 Month Average Quarter on Quarter";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(QuarterOnQuarter3MavGraph, CalculatedGraph);

QuarterOnQuarter3MavGraph.prototype.calculate = function(data) {
	
};

function YearOnYear3MavGraph(container, rawGraph) {
	this.title = "3 Month Average Year on Year";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(YearOnYear3MavGraph, CalculatedGraph);

YearOnYear3MavGraph.prototype.calculate = function(data) {
	
};

function Raw12MavGraph(container, rawGraph) {
	this.title = "12 Month Moving Average";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Raw12MavGraph, CalculatedGraph);

Raw12MavGraph.prototype.calculate = function(data) {
	
};

function MonthOnMonth12MavGraph(container, rawGraph) {
	this.title = "12 Month Average Month on Month";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(MonthOnMonth12MavGraph, CalculatedGraph);

MonthOnMonth12MavGraph.prototype.calculate = function(data) {
	
};

function QuarterOnQuarter12MavGraph(container, rawGraph) {
	this.title = "12 Month Average Quarter on Quarter";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(QuarterOnQuarter12MavGraph, CalculatedGraph);

QuarterOnQuarter12MavGraph.prototype.calculate = function(data) {
	
};

function YearOnYear12MavGraph(container, rawGraph) {
	this.title = "12 Month Average Year on Year";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(YearOnYear12MavGraph, CalculatedGraph);

YearOnYear12MavGraph.prototype.calculate = function(data) {
	
};

function SeasonalMonthOnMonthGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Month on Month";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalMonthOnMonthGraph, CalculatedGraph);

SeasonalMonthOnMonthGraph.prototype.calculate = function(data) {
	
};

function SeasonalQuarterOnQuarterGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Quarter on Quarter";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalQuarterOnQuarterGraph, CalculatedGraph);

SeasonalQuarterOnQuarterGraph.prototype.calculate = function(data) {
	
};

function SeasonalYearOnYearGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted Year on Year";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalYearOnYearGraph, CalculatedGraph);

SeasonalYearOnYearGraph.prototype.calculate = function(data) {
	
};

function Seasonal3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal3MavGraph, CalculatedGraph);

Seasonal3MavGraph.prototype.calculate = function(data) {
	
};

function SeasonalMonthOnMonth3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average Month on Month";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalMonthOnMonth3MavGraph, CalculatedGraph);

SeasonalMonthOnMonth3MavGraph.prototype.calculate = function(data) {
	
};

function SeasonalQuarterOnQuarter3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average Quarter on Quarter";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalQuarterOnQuarter3MavGraph, CalculatedGraph);

SeasonalQuarterOnQuarter3MavGraph.prototype.calculate = function(data) {
	
};

function SeasonalYearOnYear3MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 3 Month Average Year on Year";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalYearOnYear3MavGraph, CalculatedGraph);

SeasonalYearOnYear3MavGraph.prototype.calculate = function(data) {
	
};

function Seasonal12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(Seasonal12MavGraph, CalculatedGraph);

Seasonal12MavGraph.prototype.calculate = function(data) {
	
};

function SeasonalMonthOnMonth12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average Month on Month";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalMonthOnMonth12MavGraph, CalculatedGraph);

SeasonalMonthOnMonth12MavGraph.prototype.calculate = function(data) {
	
};

function SeasonalQuarterOnQuarter12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average Quarter on Quarter";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalQuarterOnQuarter12MavGraph, CalculatedGraph);

SeasonalQuarterOnQuarter12MavGraph.prototype.calculate = function(data) {
	
};

function SeasonalYearOnYear12MavGraph(container, rawGraph) {
	this.title = "Seasonally Adjusted 12 Month Average Year on Year";
	CalculatedGraph.call(this, container, rawGraph);
}

inheritPrototype(SeasonalYearOnYear12MavGraph, CalculatedGraph);

SeasonalYearOnYear12MavGraph.prototype.calculate = function(data) {
	
};

google.load('visualization', '1.0', {packages:['line', 'table']});
google.setOnLoadCallback(setUp);