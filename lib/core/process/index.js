var Emitter = require("../../utils/emitter");
var spawn = require("child_process").spawn;
var redis = require("redis");
var urlEncode = require("urlencode");
var Process = Emitter.extends({
	name:		"process",
	isRunning:	false,						//是否运行中
	process:	null,						//进程
	$:function(name,params){				//构造函数
		this.name = name;
		if(!params){
			params = {};
		}
		this.require = params.require;
		this.childMain = params.childMain||"";
	},
	start:		function(path){		//启动
		var _this = this;
		if(!this.isRunning && !this.process){
			this.isRunning = true;
			var array = [];
			array.push("--file="+ urlEncode(path));
			if(!!this.require){
				array.push("--require="+urlEncode(this.require.join(",")));
			}
			if(!!this.childMain){
				array.push("--childmain="+urlEncode(this.childMain));
			}
			var params = [__dirname+"/childprocess.js"].concat(array);
			this.process = spawn('node',params).on("error",function(error){
				_this.isRunning = false;
				_this.emit("event","error",error);
			});
			this.process.on("exit",function(data){
				_this.emit("event","exit",data);
			});
			this.process.stderr.on("data",function(error){
				_this.emit("event","error",error.toString());
			})
			this.process.stdout.on("data",function(data){
				console.log(data.toString());
			})
			this.client = redis.createClient(this.mqPort,this.mqHost);
			if(this.mqOauth){
				this.client.oauth(this.mqOauth);
			}
			this.client.on("pmessage",function(pattern,channel,message){
				var type = channel.substr(channel.lastIndexOf(".")+1);
				_this.emit(type,message);
				_this.emit("event",type,message);
			});
			this.client.psubscribe(this.name+".*");
		}
	},
	stop:		function(){					//停止
		if(this.isRunning && this.process){
			this.emit("event","exit",this.name);
			this.process.kill();
			delete this;
		}
	}
})

module.exports = exports = Process;