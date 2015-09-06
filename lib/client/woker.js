var Class = require("./emitter");
var zmq = require("zmq");
var promise = require("promise");
var Ocp = require("osr-childprocess");
var Woker = Class.extends({
	tasks:{},
	$ : function( name, master ){
		this.name = name;
		if(!master)master={};
		this.master = master;
		this.master.port = master.port;
		this.master.host = master.host || "127.0.0.1";
	},
	start:function( port , host ){
		this.port = port;
		this.host = host || "127.0.0.1";
		this.rep = zmq.socket("rep");
		this.setMonitor();
		this.rep.on("message",function(data){
			var message;
			try{
				message = JSON.parse( data );
			}catch(e){
				return;
			}
			if(!message instanceof Array){
				return;
			}
			_this.repDeal( message );
		})
		var _this = this;
		promise.denodeify(this.rep.bind).bind(this.rep)("tcp://"+this.host+":"+this.port).then(function(){
			return promise.denodeify(_this.post2Master).bind(_this)(JSON.stringify(["register",_this.name, _this.port, _this.host ]));
		}).then(function(data){
			if(data[1]){
				_this.emit("event","start",{ port: _this.port, host: _this.host});
			}else{
				_this.emit("event","error",data[2]);
				process.exit();
			}
		},function(err){
			_this.emit("event","error",err);
			process.exit();
		});
	},
	reconnect:function(){
		var _this = this;
		_this.post2Master(JSON.stringify(["register",_this.name, _this.port, _this.host ]),function(err,data){
			if(data[1]){
				_this.emit("event","start",{ port: _this.port, host: _this.host});
			}else{
				_this.emit("event","error",data[2]);
				process.exit();
			}
		});
	},
	post2Master:function( msg , cb ){
		if(!this.req){
			this.req = zmq.socket("req");
			var reqPath = "tcp://"+this.master.host+":"+this.master.port;
			this.req.connect(reqPath);
			this.req.on("message",function(data){
				cb(null,data.toString());
			});
			this.req.on("error",function(err){
				cb(err,null);
			});
		}
		this.req.send( msg );
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
	},
	repDeal:function( message ){
		console.log( message );
		var cmd = message.shift();
		switch( cmd ){
			case "newtask":
				this.createTask( message.shift(), message.shift(), message.shift() );
				break;
			case "heartbeat":
				this.heartbeat( message );
				break;
		}
	},
	createTask:function( name, code, config ){
		var _this = this;
		if(!this.tasks[name]){
			var oOcp = new Ocp( name );
			oOcp.on("event",function( type , msg ){
				console.log( type ,msg );
				if( type == "start" ){
					_this.rep.send(JSON.stringify(["taskstart",true,JSON.parse(msg)]));
				}else if( type == "exit"){
					if(_this.tasks[msg]){
						_this.tasks[msg] = null;
						delete _this.tasks[msg];
					}
					//_this.post2Master(JSON.stringify(["taskexit",msg]));
				}else if( type == "error"){
					oOcp.stop();
				}else{
					//_this.post2Master(JSON.stringify(["taskmsg",type,msg]));
					_this.emit("event","taskmsg",{ type: type, result: msg });
				}
			});
			oOcp.start( code, config );
		}else{
			_this.rep.send(JSON.stringify(["taskstart",false,name + " task is already exists"]));
		}
		
	},
	heartbeat:function(){
		var number = 0;
		var list = [];
		for(var key in this.tasks){
			number++;
			list.push({ name:key, starttime: this.tasks[key].starttime });
		}
		this.rep.send( JSON.stringify(["heartbeat", number, list ]) );
	},
	setMonitor:function(){
		var _this = this;
		this.monitor = zmq.socket("req");
		this.monitor.on("disconnect",function(){
			_this.disconnect = true;
		});
		this.monitor.on("connect_retry",function(){
			_this.retryconnect = true;
		});
		this.monitor.on('connect',function(){
			if(_this.disconnect && _this.retryconnect){
				_this.reconnect();
			}
		});
		this.monitor.monitor(500, 0);
		var reqPath = "tcp://"+this.master.host+":"+this.master.port;
		this.monitor.connect(reqPath);
	}
});

module.exports = Woker;