var zmq = require("zmq");

var pub = zmq.socket("pub");

var sub = zmq.socket("sub");

pub.bindSync("tcp://127.0.0.1:1234");

sub.connect("tcp://127.0.0.1:1234");

sub.on("message",function(topic,message){
	
	console.log("--->",topic.toString(),message.toString());
	
});

sub.subscribe("demo");

setInterval(function(){
	
	pub.send(['demo','hello world'],console.log);
	
},500);