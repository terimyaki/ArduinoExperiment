var bluebird = require('bluebird'),
	five = require('johnny-five'),
	delAsync = bluebird.promisify(require('del'));
	fs = require('fs');

var fileName = 'arduinoTest.txt';
delAsync(fileName).then(function(){
	var writeStream = fs.createWriteStream(fileName, {encoding: 'utf8'}),
		board = new five.Board(),
		potentiometer,
		photoresistor,
		pin = 'A0',
		freq = 250,
		threshold = 5,
		resistor = 1000,
		voltageIn = 5;

	writeStream.write('ArduinoUno Pin:' + pin + ' Freq:' + freq + ' Threshold:' + threshold + ' Resistor:' + resistor + ' VoltageIn:' + voltageIn + '\n');
	writeStream.write('Time_of_Measure AR_Value Voltage_Calc Resistance_Calc\n');
	board.on('ready', function(){
		var voltageOut;
		photoresistor = new five.Sensor({
			pin : pin,
			freq : freq,
			threshold: threshold
		});
		photoresistor.on('change', function(){
			voltageOut = this.value * (voltageIn/ 1023);
			writeStream.write(Date.now() + ' ' + this.value + ' ' + voltageOut + ' ' + ((voltageOut * resistor) / (voltageIn - voltageOut))+ '\n');
		});

	});

	board.on('close', function(){
		writeStream.write('This is the end. Higher numbers were when I was covering the sensor, creating darkness.');
		writeStream.end();
		console.log('i am closing');
	});

	writeStream.on('error', function (err) {
		console.log('this is an error', err);
	});
});