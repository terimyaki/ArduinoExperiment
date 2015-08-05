var five = require('johnny-five'),
	fs = require('fs');
var writeStream = fs.createWriteStream('arduinoTest.txt', {encoding: 'utf8'}),
	board = new five.Board(),
	photoresistor;

writeStream.write('Arduino Uno, Resistor: 10K, Pin: A0, Freq: 250\n');
board.on('ready', function(){

	photoresistor = new five.Sensor({
		pin : 'A0',
		freq : 250
	});
	// photoresistor.on('data', function(){
	// 	console.log(Date.now(), ':', this.value, ':', this.raw);
	// });

	photoresistor.on('data', function(){
		writeStream.write(Date.now() + ' ' + this.value + '\n');
	});
	// var led = new five.Led({
	// 	pin : 'A0'
	// });
	// // led.blink(500);
	// this.repl.inject({
 //    // Allow limited on/off control access to the
 //    // Led instance from the REPL.
	//     on: function() {
	//       led.on();
	//     },
	//     off: function() {
	//       led.off();
	//     }
	// });
});

board.on('close', function(){
	writeStream.write('This is the end. Higher numbers were when I was covering the sensor, creating darkness.');
	writeStream.end();
	console.log('i am closing');
});

writeStream.on('error', function (err) {
	console.log('this is an error', err);
});