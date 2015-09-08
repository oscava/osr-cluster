var Class = require("../emitter");
var zmq = require("zmq");
var Server = Class.extends({
	$:function( port , host ){
		this.host = host || "127.0.0.1";
		this.port = port;
		this.path = "tcp://"+this.host+":"+this.port;
		this.init();
	},
	init:function(){
		var _this = this;
		this.rep = zmq.socket("rep");
		this.rep.bindSync(this.path);
		this.rep.on("message",function(data){
			var message = JSON.parse( data );
			var cmd = message.shift();
			var result = message.shift();
			var _rep = this;
			var fn = function( err , result ){
				_rep.send(JSON.stringify([ err, result ]));
			}
			if(_this.listeners(cmd).length == 0){
				fn("["+cmd+"]命令未找到");
				return;
			}
			_this.emit(cmd,result,fn);
		});
	}
});

module.exports = exports = Server;