var Class = require("./emitter");
var zmq = require("zmq");
var Task = Class.extends({
	$:function( name , master){
		this.name = name;
		if(!master) master = {};
		this.master = master;
		this.master.host = master.host || "127.0.0.1";
		this.master.port = master.port ;
	},
	start:function( code , config ){
		if(!this.req){
			this.req = zmq.socket("req");
			this.req.connect("tcp://"+this.master.host+":"+this.master.port);
		}
		this.req.on("message",function(data){
			console.log( data ); 
			var message = JSON.parse( data );
			var cmd = message.shift();
			var result = message.shift();
			_this.emit( "event", cmd, result );
		})
		this.req.send(JSON.stringify(["newtask",this.name,code,config]));
	}
})

module.exports = exports = Task;