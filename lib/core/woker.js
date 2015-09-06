var Class = require("../client/emitter");
var zmq = require("zmq");
var Woker = Class.extends({
	$:function( name, port, host ){
		this.name = name;
		this.port = port;
		this.host = host;
		this.tasknumber = 0;
		this.timeout = true;
	},
	heartbeat:function(){
		var _this = this;
		this.post2Client(JSON.stringify(["heartbeat",Date.now()]),function(err,data){
			// console.log(err,data);
			_this.tasknumber = data[1];
			_this.tasklist = data[2];
		});
	},
	createTask:function( task , cb){
		//task { name: "", code: "", config: {} };
		this.post2Client( JSON.stringify(["newtask",task.name,task.code,task.config]) ,function( datas ){
			console.log( datas );
		});
	},
	post2Client:function( message ,cb ){
		var _this = this;
		var _this = this;
		if(!this.req){
			this.req = zmq.socket("req");
			this.req.connect("tcp://"+this.host + ":"+this.port);
			this.req.on("message",function(data){
				var message = JSON.parse(data.toString());
				cb(null,message);
			});
			this.req.on("connect_retry",function(){
				_this.timeout ++ ;
				if(_this.timeout>=5){
					_this.req.unmonitor();
					_this.emit("exit",_this.name,"timeout");
					_this.req = null;
				}
			});
			this.req.monitor(100,0);
		}
		this.req.send(message);
	}
});

module.exports = Woker;