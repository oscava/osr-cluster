var Class = require("osr-class");
var zmq = require("zmq");
var Task = require("./task");
var Woker = Class.extends({
	$:function( name, port, host, protocol ){
		this.name = name || "Woker_"+Date.now();
		this.port = port || 5120;
		this.pubPort = this.port+1;
		this.host = host || "localhost";
		this.protocol = protocol || "tcp";
		this.repPath = this.protocol+"://"+this.host+":"+this.port;
		this.pubPath = this.protocol+"://"+this.host+":"+this.pubPort;
		this.rep = zmq.socket("rep");
		this.pub = zmq.socket("pub");
		this.init();
	},
	init:function(){
		this.rep.bindSync(this.repPath);
		this.pub.bindSync(this.pubPath);
		var _this = this;
		this.rep.on("message",function(data){
			var message;
			try{
				message = JSON.parse( data.toString() );
			}catch(e){
				//非JSON格式,抛弃
				return;
			}
			if(!message instanceof Array){
				//非数组格式,抛弃
				return;
			}
			_this.repDeal( message );
		});
	},
	repDeal:function(message){
		var cmd = message.shift();
		switch(cmd){
			case Task.MSGID:
				new Task(message[0],message[1]).register( this );
				break;
		}
	},
	createTask:function( task ){
		
	}
})

module.exports = exports = Woker;