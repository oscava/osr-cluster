var Class = require("./emitter");
var zmq = require("zmq");
var Woker = Class.extends({
	tasks:{},
	$ : function( name, port,  host){
		this.name = name;
		this.port = port;
		this.host = host || "127.0.0.1";
	},
	start:function(){
		
	},
	post2Master:function( msg ){
		var req = zmq.socket("req");
		var reqPath = "tcp://"+this.host+":"+this.port;
		req.connect(reqPath);
		req.send( msg );
	},
	post2Task:function( taskname , msg ){
		if(this.tasks[taskname]){
			var req = zmq.socket("req");
			var reqPath = "tcp://127.0.0.1"+this.task.port;
			req.connect(reqPath);
			req.send( msg );
		}else{
			_this.emit("event","error",new Error("Task("+taskname+") not found"));
		}
	}
});

module.exports = Woker;