var childProcess = require('child_process'),
	fs = require('fs'),
	d3 = require('d3');

var max = 0,
	header,
	useData,
	file = 'arduinoTest.txt',
	fileStream = require('./fileStream')();

//Arduino start it up
var arduinoProcess = childProcess.exec('node arduino.js -f:' + file + ' -v:' + 5 + ' -r:' + 1000);

arduinoProcess.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

arduinoProcess.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

//Reading the file that is generated from the Arduino Process
fileStream.on('data', function(data){
	if(!header) {
		header = data;
		createSpecs(header);
	}
	else {
		useData = updateData(data);
		useData(updateTable);
		useData(updateGraph);
		if(data.Resistance_Calc > max) {
			fileStream.pause();
			max = data.Resistance_Calc;
			updateMax(data.Voltage2_Calc, data.Resistance_Calc);
			// fileStream.resume();
			setTimeout(function(){
				fileStream.resume();
			}, 1000);
		}
	}
});

fs.watchFile(file, function(){
	fileStream.resume();
});

function createSpecs(specs){
	var data = Object.keys(specs),
		header = d3.select('#header')
					.selectAll('div')
					.data(data)
					.enter()
					.append('div');

	header.append('h5')
		.text(function(d){return d;});

	header.insert('p')
		.text(function(d){
			var info = specs[d];
			if(isNaN(info)) return info;
			else return d3.format(',d')(parseInt(info));
		});
}

function updateMax(voltage, resistance){
	var formatVoltage = d3.format('.4f'),
		formatResistance = d3.format(',.0f');

	d3.select('#max-container .resistance > p')
		.text(formatResistance(resistance));

	d3.select('#max-container .voltage > p')
		.text(formatVoltage(voltage));
}

function updateData(data){
	if(!this.cache) this.cache = [];
	this.cache.push(data);
	return function(userFunc){
		return userFunc.call(null, [].concat(this.cache));
	};
}

function updateTable(data){
	var table = d3.select('#readings table'),
		tableHeader = ['Time','Analog Reading','Voltage 2','Variable Resistance'],
		formatTime = d3.time.format('%H:%M:%S'),
		formatVoltage = d3.format('.4f'),
		formatResistance = d3.format(',.0f'),
		dataMatrix = data.map(function(d){
			var time = formatTime(d.Time),
				ar = d.Voltage2_AR_Value,
				voltage = formatVoltage(d.Voltage2_Calc),
				resistance = formatResistance(d.Resistance_Calc);
			return [time, ar, voltage, resistance];
		});

	var tr = table.select('tbody')
				.selectAll('tr')
				.data(dataMatrix)
				.enter()
				.append('tr');

	var theader = table.select('thead tr').empty() ? table.select('thead').append('tr').attr('class', 'mdl-data-table__cell--non-numeric') : table.select('thead tr'),
		columns = theader.selectAll('th')
				.data(tableHeader)
				.enter()
				.append('th')
				.text(function(d){
					return d;
				});

	var td = tr.selectAll('td')
				.data(function(d) { return d; })
				.enter().append('td')
				.text(function(d) { return d; });
}

function updateGraph(data){
	if(!this.redraw) this.redraw = setupGraph(720, 500, data).redraw;
	var redraw = this.redraw;
	redraw(data);
}

function setupGraph(w, h, data){
	//svg size config
	var margin = {
			top : 20,
			bottom : 20, 
			left: 80,
			right: 20
		},
		width = w - margin.left - margin.right,
		height = h - margin.top -margin.bottom;

	var x = d3.time.scale().range([0, width]),
		y = d3.scale.linear().range([height, 0]),
		xAxisFunc = d3.svg.axis().scale(x).orient('bottom').ticks(5),
		yAxisFunc = d3.svg.axis().scale(y).orient('left').ticks(5),
		svg = d3.select('#graph').append('svg')
								.attr('width', width + margin.left + margin.right)
								.attr('height', height + margin.top + margin.bottom)
								.append('g')
								.attr('transform', 'translate(' + margin.left+ ',' + margin.top + ')'),
		valueline = d3.svg.line()
							.x(function(d) { return x(d.Time); })
							.y(function(d) { return y(d.Resistance_Calc); });

		// Add the valueline path. Keep reference of path so that you can update it later for transition
		var path = svg.append('path')
						.attr('class', 'line')
						.attr('d', valueline(data));

		// Scale the range of the data
		x.domain(d3.extent(data, function(d) { return d.Time; }));
		y.domain([0, d3.max(data, function(d) { return d.Resistance_Calc; })]);

		// Add the X Axis
		var xAxis = svg.append('g')
						.attr('class', 'x axis')
						.attr('transform', 'translate(0,' + height + ')')
						.call(xAxisFunc);

		// Add the Y Axis
		var yAxis = svg.append("g")
						.attr("class", "y axis")
						.call(yAxisFunc);




	function redraw(data){

		if(data){
			// Scale the range of the data
			x.domain(d3.extent(data, function(d) { return d.Time; }));
			y.domain([0, d3.max(data, function(d) { return d.Resistance_Calc; })]);

			xAxis.transition().duration(500).ease('linear').call(xAxisFunc);
			yAxis.transition().duration(500).ease('linear').call(yAxisFunc);

			path.attr("d", valueline(data))
				.attr("transform", null)
				.transition()
				.duration(500)
				.ease("linear")
				//.attr("transform", "translate(" + x(-1) + ",0)")
				//.each('end', redraw.bind(this, data)); //this is causing flickering
		}

	}

	return {
		redraw : redraw
	};
}