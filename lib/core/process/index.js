var Emitter = require("../../utils/emitter");
var spawn = require("child_process").spawn;
var redis = require("redis");
var urlEncode = require("urlencode");
var Process = Emitter.extends({
	name:		"process",
	isRunning:	false,						//是否运行中
	process:	null,						//进程
	$:function(name,config, cluster){				//构造函数
		this.name = name;
		if(!config){
			config = {};
		}
		this.require = config.require;
		this.childMain = config.childMain||"";
		this.config = config;
		this.cluster = cluster;
	},
	start:		function(path){		//启动
		var _this = this;
		this.path = path;
		if(!this.isRunning && !this.process){
			this.isRunning = true;
			var array = [];
			array.push("--file="+ urlEncode(path));
			array.push("--name="+ urlEncode(this.name));
			// if(!!this.require){
				// array.push("--require="+urlEncode(this.require.join(",")));
			// }
			// if(!!this.childMain){
				// array.push("--childmain="+urlEncode(this.childMain));
			// }
			for(var key in this.config){
				var _key = urlEncode(key);
				var _value = this.config[key];
				if(_value instanceof Array){
					_value = _value.join(",");
				}
				_value = urlEncode(_value);
				array.push("--"+key+"="+_value);
			}
			var params = [__dirname+"/childprocess.js"].concat(array);
			this.process = spawn('node',params).on("error",function(error){
				_this.isRunning = false;
				_this.emit("event","error",error);
			});
			this.process.on("exit",function(data){
				_this.emit("event","exit",_this.name);
			});
			this.process.stderr.on("data",function(error){
				_this.emit("event","error",error.toString());
			})
			this.process.stdout.on("data",function(data){
				console.log(data.toString());
			})
			this.client = redis.createClient( this.cluster.mq.port, this.cluster.mq.host );
			if(this.cluster.mq.auth){
				this.client.auth( this.cluster.mq.auth );
			}
			if(this.mqauth){
				this.client.auth(this.mqauth);
			}
			this.client.on("pmessage",function(pattern,channel,message){
				var type = channel.substr(channel.lastIndexOf(".")+1);
				_this.emit(type,message);
				_this.emit("event",type,message);
			});
			this.client.psubscribe(this.name+".*");
			this.startTime = Date.now();
		}
	},
	stop:		function(){					//停止
		if(this.isRunning && this.process){
			//this.emit("event","exit",this.name);
			this.process.kill();
			this.client.punsubscribe(this.name+".*",console.log);
			this.client.end();
			this.client = null;
			this.process = null;
			delete this.client;
			delete this.process;
			delete this;
		}
	}
})

module.exports = exports = Process;