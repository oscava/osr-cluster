var Class = require("../core/emitter");
var Server = require("../core/pingpong/server");
var Woker = require("./woker");
var Task = require("./task");
var Cluster = Class.extends({
	$:function( name ){
		this.name = name;
		this.wokers = {};
		this.tasks = {};
	},
	start: function( port, host){
		var _this = this;
		this.port = port;
		this.host = host || "127.0.0.1";
		this.server = new Server( this.port, this.host );
		this.server.on("newtask",function( task ,cb ){
			_this.newtask( task , cb );
		}).on("stoptask",function( task ,cb){
			console.log("stoptask", task );
			cb();
		}).on("register",function( woker, cb){
			_this.register( woker, cb );
		}).on("unregister",function(woker,cb){
			_this.unregister( woker, cb );
		}).on("heartbeat",function(woker,cb){
			cb(null,Date.now());
		}).on("taskexit",function( task, cb){
			_this.taskexit( task, cb);
		});
		this.emit("event","sys","["+this.name+"] start at: -["+this.port+" ]-("+new Date()+")");
	},
	register:function( woker , cb ){
		if(!cb)cb=console.log
		var result;
		if(this.wokers[woker.name]){
			result = "["+woker.name+"] is already exists";
			this.emit("event","warn",result );
			cb(result);
		}else{
			var oWoker = new Woker( woker.name, { host: woker.host, port: woker.port });
			for(var key in woker.tasks){
				oWoker.newtask(woker.tasks[key]);
			}
			result = "["+woker.name+"] register success";
			cb( null, result);
			this.wokers[woker.name] = oWoker;
			this.emit("event","new woker", result );
		}
	},
	unregister:function( woker, cb ){
		var result;
		if(this.wokers[woker.name]){
			result = "["+woker.name+"] unregister";
			this.emit("event","warn",result);
			this.wokers[woker.name] = null;
			delete this.wokers[woker.name];
			cb(null,result);
		}else{
			result = "["+woker.name+"] woker not found";
			this.emit("event","warn",result);
			cb(result);
		}
	},
	newtask:function( task ,cb ){
		if(!cb)cb=console.log;
		task  = new Task( task.name, task.main, task.config );
		var result;
		var _this = this;
		if(this.tasks[task.name]){
			result = "["+task.name+"] is already exists";
			this.emit("event","warn",result );
			cb(result);
			return;
		}
		var woker;
		var min;
		for(var key in this.wokers){
			if(this.wokers[key].tasknum == 0){
				woker = this.wokers[key];
				break;
			}else{
				if(!min){
					min = this.wokers[key].tasknum;
					woker = this.wokers[key];
				}
				if(min > this.wokers[key].tasknum){
					min = this.wokers[key].tasknum;
					woker = this.wokers[key];
				}
			}
		}
		if(woker){
			woker.newtask( task , function( err, result ){
				if(!err){
					result = result;
					_this.tasks[task.name] = task;
				}else{
					result = "分配任务出错[Task("+task.name+")] 给 [Woker("+woker.name+")],错误["+err+"]";
				}
				_this.emit("event","new task",result);
				cb(err,result);
			});
		}else{
			result = "没有找到可分配任务的 Woker!";
			this.emit("event","warn",result);
			cb(result);
		}
	},
	taskexit:function( task, cb){
		this.tasks[task.name].exit(cb);
		delete this.tasks[task.name];
	}
})

module.exports = Cluster;