var fs = require('fs'),
	StringDecoder = require('string_decoder').StringDecoder,
	util = require('util'),
	stream = require('stream'),
	Transform = stream.Transform;

var arduinoDataStream = fs.createReadStream('arduinoTest2.txt');
arduinoDataStream.setEncoding('utf8');

arduinoDataStream.on('readable', function(){
	var chunk,
		line = '',
		counter = 0;
	while(null !== (chunk = arduinoDataStream.read(1))){
		if (/\n/.test(chunk)){
			console.log('Line ' + counter + ': ' + line);
			line = '';
			counter++;
		} else line += chunk;
	}
});

function CircuitDataParser(opts){
	// allow use without new
	if (!(this instanceof Upper)) {
		return new CircuitDataParser(options);
	}
	var options = opts || {};
	options.readableObjectMode = true;
	// init Transform
	Transform.call(this, options);

	this._buffer = '';
	this._decoder = new StringDecoder('utf8');
}

util.inherits(CircuitDataParser, Transform);
CircuitDataParser.prototype._transform = function(chunk, enc, cb){
	console.log('these are the arguments', [].slice.call(arguments, 0));
};

CircuitDataParser.prototype._flush = function(cb) {
};