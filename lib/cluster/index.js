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
			_this.stoptask( task, cb );
		}).on("register",function( woker, cb){
			_this.register( woker, cb );
		}).on("unregister",function(woker,cb){
			_this.unregister( woker, cb );
		}).on("heartbeat",function(woker,cb){
			cb(null,Date.now());
		}).on("taskexit",function( task, cb){
			_this.taskexit( task, cb);
		}).on("info",function( time, cb){
			_this.infos(cb);
		});
		this.emit("event","sys","["+this.name+"] start at: -["+this.port+" ]-("+new Date()+")");
	},
	register:function( woker , cb ){
		if(!cb)cb=console.log
		var result;
		var _this = this;
		if(this.wokers[woker.name]){
			result = "["+woker.name+"] is already exists";
			this.emit("event","warn",result );
			cb(result);
		}else{
			var oWoker = new Woker( woker.name, { host: woker.host, port: woker.port });
			oWoker.once("exit",function(){
				// console.log(this,arguments);
				_this.unregister( this, console.log );
				delete this;
			});
			for(var key in woker.tasks){
				var item = woker.tasks[key];
				var task = new Task( item.name, item.main, item.config );
				oWoker.newtask(task,console.log);
				this.tasks[task.name] = task;
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
			for(var key in this.wokers[woker.name].tasks){
				var task = this.wokers[woker.name].tasks[key];
				this.tasks[task.name] = null;
				delete this.tasks[task.name];
			}
			this.wokers[woker.name].exit();
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
	infos:function(cb){
		var result = [];
		for(var key in this.wokers){
			var woker = this.wokers[key];
			var temp = { tasks :[] , name: woker.name, config: woker.config };
			for(var sub in woker.tasks){
				var task = woker.tasks[sub];
				temp.tasks.push({ name: task.name, main: task.main, config: task.config });
			}
			result.push(temp);
		}
		cb(null,result);
	},
	newtask:function( task ,cb ){
		if(!cb)cb=console.log;
		task  = new Task( task.name, task.main, task.config );
		var result;
		var _this = this;
		if(this.tasks[task.name]){
			this.tasks[task.name].woker.newtask( task, cb );
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
	stoptask:function( task ,cb ){
		var task = this.tasks[task.name];
		if( task ){
			task.stop(cb);
		}else{
			cb("未找到任务["+task.name+"]");
		}
	},
	taskexit:function( task, cb){
		if(this.tasks[task.name]){
			this.tasks[task.name].exit(cb);
			delete this.tasks[task.name];
		}
	}
})

module.exports = Cluster;