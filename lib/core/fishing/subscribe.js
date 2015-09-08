var Class = require("../emitter");
var zmq = require("zmq");
var Subscribe = Class.extends({
	$:function( port, host ){
		var _this = this;
		this.port = port;
		this.host = host || "127.0.0.1";
		this.url = "tcp://"+this.host+":"+this.port;
		this.sub = zmq.socket("sub");
		this.sub.on("message",function( channel, message ){
			var msg = JSON.parse(message);
			if(_this.fns[channel]){
				_this.fns[channel]( msg.result );
			}
		});
		this.fns = {};
		this.sub.connect(this.url);
	},
	subscribe:function( channel , cb ){
		this.fns[channel] = cb;
		this.sub.subscribe( channel );
	}
});

module.exports = Subscribe;