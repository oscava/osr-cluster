var zmq = require("zmq");

var pub = zmq.socket("pub");

var rep = zmq.socket("rep");

var path = "tcp://127.0.0.1:12345";

pub.bind( path, function(err){
	console.log(err);
})

rep.bind( path, function(err){
	console.log(err);
})