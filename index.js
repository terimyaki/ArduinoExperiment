var childProcess = require('child_process'),
	fs = require('fs'),
	$ = require('jquery'),
	d3 = require('d3');

var max = 0,
	header,
	points = [],
	file = 'arduinoTest.txt',
	fileStream = require('./fileStream')(file);

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
		if(data.Resistance_Calc > max) {
			fileStream.pause();
			max = data.Resistance_Calc;
			$('#resistance').text('Resistance :  ' + max + '; Voltage 2 :  ' + data.Voltage2_Calc);
			// fileStream.resume();
			setTimeout(function(){
				fileStream.resume();
			}, 1000);
		}
		points.push(data);
	}
});

fs.watchFile(file, function(){
	fileStream.resume();
});
function createSpecs(specs){
	var header = d3.select('#header');
	Object.keys(specs).forEach(function(key){
		var info = header.append('p');
		info.text(key + ' : ' + specs[key]);
	});
}

function createGraph(){
	
}