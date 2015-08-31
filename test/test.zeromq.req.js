var zmq = require("zmq");

var req = zmq.socket("req");

var path = 'tcp://127.0.0.1:12345';

req.connect( path );

req.on("message",function(data){
	console.log(data.toString(),i);
});
var i = 0;
setInterval(function(){
	req.send("Time"+Date.now());
	i++;
},100);