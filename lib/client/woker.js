var Class = require("../core/emitter");
var Client = require("../core/pingpong/client");
var Server = require("../core/pingpong/server");
var Monitor = require("../core/pingpong/monitor");
var Publish = require("../core/fishing/publish");
var OCP = require("osr-childprocess");
var portfinder = require("portfinder");
var promise = require("promise");
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
		this.tasknum = 0;
	},
	start:function( port , host ){
		var _this = this;
		this.port = port;
		this.host = host || "127.0.0.1";
		this.server = new Server( this.port, this.host );
		promise.denodeify(portfinder.getPort)({host:this.host}).then(function(port){
			_this.pubPort = port;
			_this.pub = new Publish( this.name , port , _this.host);
			return;
		});
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
		}).on("heartbeat", function( time, cb){
			cb(null,_this.getHeartbeat());
		}).on("taskstop",function( task, cb){
			_this.taskstop( task, cb);
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
			_this.client.post("heartbeat",_this.getHeartbeat(),function(err, result){
				if(err){
					console.log('[SYS]\t -= warn =- { %s }', err);
				}
			});
		},10000);
	},
	getHeartbeat:function(){
		return { tasks: this.tasks, tasknum: this.tasknum }
	},
	publish:function(channel,message){
		if(this.pub){
			this.pub.publish(channel,message);
		}
	},
	newtask:function( task, cb ){
		var _this = this;
		if(JSON.stringify(task) == "{}"){
			cb("Task 非法");
			return;
		}
		if(this.tasksl[task.name]){
			cb("[Task("+task.name+")] is already exists",{ host:this.host,port:this.pubPort,channel:task.name});
		}else{
			var ocp = new OCP( task.name );
			ocp.start( task.main, task.config );
			ocp.on("event",function( event, result ){
				if(event == "start"){
					cb( null, { host: _this.host, port: _this.pubPort, channel: task.name } );
				}else if("exit" == event){
					_this.tasknum--;
					_this.client.post("taskexit",{ name: ocp.name },function(event,result){
						console.log("[SYS]\t -= warn =- { %s }",result);
						_this.publish(ocp.name,{ event:"exit",result:result})
					});
					delete _this.tasksl[ocp.name];
					delete _this.tasks[ocp.name];
				}else{
					_this.publish(this.name,{event:event,result:result});
				}
			});
			task.childprocess = ocp;
			this.tasksl[task.name] = task;
			this.tasks[task.name] = { name: task.name, main:task.main, config: task.config };
			this.tasknum++;
		}
	},
	taskstop:function( task, cb){
		var task = this.tasksl[task.name];
		if(task){
			task.childprocess.stop();
			cb(null,"退出信号已发送");
		}else{
			cb("未找到任务["+task.name+"]");
		}
	}
});

module.exports = Woker;