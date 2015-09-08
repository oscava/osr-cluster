var Class = require("../core/emitter");
var Client = require("../core/pingpong/client");
var Server = require("../core/pingpong/server");
var Monitor = require("../core/pingpong/monitor");
var OCP = require("osr-childprocess");
var Woker = Class.extends({
	$:function( name, master ){
		this.name = name;
		master = master || {};
		this.master = {};
		this.master.host = master.host || "127.0.0.1";
		this.master.port = master.port ;
		this.master.url = "tcp://"+this.master.host+":"+this.master.port;
		this.client = new Client(this.master.url);
		this.monitor = new Monitor(this.master.url);
		this.tasks = {};
		this.tasksl = {};
	},
	start:function( port , host ){
		var _this = this;
		this.port = port;
		this.host = host || "127.0.0.1";
		this.server = new Server( this.port, this.host );
		this.monitor.on("connect",function(){
			_this.client.post("register", { port: _this.port, host: _this.host, name: _this.name, tasks: _this.tasks },function(err,result){
				if(err){
					console.log("[SYS]\t -= err  =- { %s }",err)
					process.exit();
				}else{
					console.log("[SYS]\t -= info =- { %s }", result);
				}
				_this.heartbeat();
			});
		});
		this.monitor.on("disconnect",function(count){
			console.log("[SYS]\t -= warn =- { 和主服务器断开连接,正在尝试第%s次重连 }",count);
		});
		this.monitor.start();
		this.server.on("newtask",function( task ,cb){
			_this.newtask( task, cb);
		});
	},
	stop:function(){
		this.client.post("unregister",{ name: this.name }, function(err, result){
			console.log("[SYS]\t -= warn =- { %s }", err||result);
			process.exit();
		});
	},
	heartbeat:function(){
		var _this = this;
		setInterval(function(){
			_this.client.post("heartbeat",{ tasks: _this.tasks, name: _this.name },function(err, result){
				if(err){
					console.log('[SYS]\t -= warn =- { %s }', err);
				}
			});
		},1000);
	},
	newtask:function( task, cb ){
		var _this = this;
		if(JSON.stringify(task) == "{}"){
			cb("Task 非法");
			return;
		}
		if(this.tasksl[task.name]){
			cb("[Task("+task.name+")] is already exists");
		}else{
			var ocp = new OCP( task.name );
			ocp.start( task.main );
			ocp.on("event",function( event, result ){
				if(event == "start"){
					cb( null, result );
				}else if("exit" == event){
					_this.client.post("taskexit",{ name: ocp.name },function(){
						console.log(arguments);
					});
					delete _this.tasksl[ocp.name];
					delete _this.tasks[ocp.name];
				}
				//console.log(JSON.stringify(arguments));
			});
			this.tasksl[task.name] = ocp;
			this.tasks[task.name] = {};
		}
	}
});

module.exports = Woker;