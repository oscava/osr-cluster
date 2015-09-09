var Class = require("../emitter");
var zmq = require("zmq");
var Publish = Class.extends({
	$:function( channel, port, host ){
		this.channel = channel;
		this.port = port;
		this.host = host || "127.0.0.1";
		this.path = "tcp://"+this.host+":"+this.port;
		this.pub = zmq.socket("pub");
		console.log(this.path);
		this.pub.bindSync(this.path);
	},
	publish:function( channel ,message){
		if(!message){
			message = channel;
			channel = this.channel;
		}
		this.pub.send([ channel , JSON.stringify({ result: message }) ]);
	}
});

module.exports = Publish;