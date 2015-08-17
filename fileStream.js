var fs = require('fs'),
	util = require('util'),
	StringDecoder = require('string_decoder').StringDecoder,
	through2 = require('through2');

var arduinoDataStream = function(file){
	file = file || 'arduinoTest2.txt';
	return fs.createReadStream(file);
};
var circuitDataParser = function(chunk, enc, done){
		var buffer = '',
			decoder = new StringDecoder('utf8');

		buffer += decoder.write(chunk);
		//split the buffer on newlines
		var lines = buffer.split(/\r?\n/);
		// return the header and send it out
		var header = lines.shift();
		header = header.split(/\s/).map(function(attr){
			return attr.split(/:/);
		}).reduce(function(prev, curr){
			prev[curr[0]] = curr[1];
			return prev;
		}, {});
		this.push(header);

		//create the object blueprint for sending out
		var keys = lines.shift().split(/\s/);
		lines.pop();
		//Each subsequent line is data, so create the objects here
		lines.forEach(function(line){
			var obj = line.split(/\s/).reduce(function(prev, curr, index){
				if(!index) curr = new Date(Number(curr));
				else curr = Number(curr);
				prev[keys[index]] = curr;
				return prev;
			}, {});

			this.push(obj);
		}.bind(this));
		//alert end of transform
		done();
	};

module.exports = function(file){
	return arduinoDataStream(file).pipe(through2.obj(circuitDataParser));
};