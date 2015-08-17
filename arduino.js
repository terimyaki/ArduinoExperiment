var bluebird = require('bluebird'),
	five = require('johnny-five'),
	delAsync = bluebird.promisify(require('del'));
	fs = require('fs');

function setAndRun(){
	var opts = createOptions(),
		file = opts.file,
		voltage = parseInt(opts.voltage),
		firstResistor = parseInt(opts.resistor);

	var fileName = 'arduinoTest.txt' || file;
	return delAsync(fileName).then(function(){
		var writeStream = fs.createWriteStream(fileName, {encoding: 'utf8'}),
			board = new five.Board(),
			photoresistor,
			pin = 'A0',
			freq = 250,
			threshold = 5,
			resistor = firstResistor || 1000,
			voltageIn = voltage || 5;

		writeStream.write('Arduino:Uno Pin:' + pin + ' Freq:' + freq + ' Threshold:' + threshold + ' Resistor:' + resistor + ' VoltageIn:' + voltageIn + '\n');
		writeStream.write('Time Voltage1 Voltage2_AR_Value Voltage2_Calc Resistance_Calc\n');
		board.on('ready', function(){
			var voltageOut;
			photoresistor = new five.Sensor({
				pin : pin,
				freq : freq,
				threshold: threshold
			});
			photoresistor.on('change', function(){
				voltageOut = this.value * (voltageIn/ 1023);
				writeStream.write(Date.now() + ' ' + voltageIn + ' ' + this.value + ' ' + voltageOut + ' ' + ((voltageOut * resistor) / (voltageIn - voltageOut))+ '\n');
			});

		});
		writeStream.on('error', function (err) {
			console.log('this is an error', err);
		});
	});
}

function createOptions(){
	var flags = {
			v : 'voltage',
			r : 'resistor',
			f : 'file'
		};

	return process.argv.slice(2).map(function(input){
		var arg = input.split(/:/),
			flag = arg[0][1],
			value = arg[1];
		return [flags[flag], value];
	}).reduce(function(options, curr){
		if(curr[0]) options[curr[0]] = curr[1];
		return options;
	}, {});
}

setAndRun();

