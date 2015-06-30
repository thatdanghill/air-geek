/*
 *
 *Data in the form:
 *[[xval, yval],[xval, yval],...]
 *
 *function(data) {
    this.data = someTransformation(data);
 }
 
 */

function MonthOnMonth(data) {
    this.data = MoM(data);
    
}

function MoM(data){
    vals = []
    for (var i = 1; i < data.length; i++){
		vals[i-1] = [];
		vals[i-1][0] = data[i][0];
		vals[i-1][1] = (data[i][1]/data[i-1][1] - 1) * 100;
	}
    return vals; 
}

function YearOnYear(data){
    this.data = YoY(data)
}

function YoY(data){
    vals = []
    for (var i = 12; i < data.length; i++){
        vals[i] = [];
        vals[i][0] = data[i][0];
        vals[i][1] = (data[i][1]/data[i-12][1] - 1) * 100;
    }
    return vals;    
}

function QuarterOnQuarter(data){
    this.data = QoQ(data)   
}

function QoQ(data) {
    vals = [];
    for (var i = 5; i < data.length; i++){
        vals[i] = [];
        vals[i][0] = data[i][0];
        vals[i][1] = ((data[i][1] + data[i-1][1] + data[i-2][1])/(data[i-3][1] + data[i-4][1] + data[i-5][1]) - 1) * 100
    }
    return vals;
    
}

function ThreeMonthMovingAverage(data){
    this.data = ThreeMAV(data);
}

function ThreeMAV(data){
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
    return vals;  
    }
    
}