var Class = require("../emitter");
var spawn = require("child_process").spawn;
var zmq = require("zmq");
var Process = Class.extends({
	isRunning:false,
	process:null,
	//构造函数
	$:function( name , task){
		this.name = name;
		this.path = path;
		this.task = task;
	},
	//在启动的时候
	onStart:function( port ){
		this.port = port;
		this.isRunning = true;
		this.req = zmq.socket("req");
		this.req.connect("tcp://127.0.0.1:"+this.port);
	},
	//启动
	start:function(){
		var _this = this;
		this.path = this.task.path;
		var params = [ __dirname+"/childprocess.js"];
		params.push("--port="+this.task.context.port);
		this.process = spawn('node',params).on('error',function(error){
			_this.isRunning = false;
			_this.emit("event","error",error);
		});
		this.process.on("exit",function(data){
			_this.isRunning = false;
			_this.emit("event","exit",_this.name);
		});
		this.process.stderr.on("data",function(error){
			_this.emit("event","error",error.toString());
		});
		this.process.stdout.on("data",function(data){
			_this.emit("event","print",data.toString());
		});
	},
	//停止
	stop:function(){
		if(this.isRunning && this.process){
			this.process.kill();
			this.process = null;
			delete this.process;
			delete this;
		}
	},
	//对子线程发送数据
	post:function(){
		var array = Array.prototype.slice.call(arguments);
		this.req.send(JSON.stringify(array));
	}
});

module.exports = exports = Process;