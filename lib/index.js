var Emitter = require("./utils/emitter");
var Process = require("./core/process");
var fs = require("fs");
var Redis = require("redis");
var urlEncode = require("urlencode");
var Cluster = Emitter.extends({
	$:function( name , config){
		this.name = name;
		console.log("[SYSTEM] --| %s",this.name,"多进程调用系统 |--");
		var _this = this;
		this.config = config || {};
		this._rootpath = this.config.rootPath || __dirname+"/../tmp";
		this._logpath = this._rootpath + "/log/";
		this._codepath = this._rootpath + "/code/";
		this.mq = {
			host:this.config.mqHost || "127.0.0.1",
			port:this.config.mqPost || 6379,
			oauth: this.config.oauth
		};
		this.client = Redis.createClient( this.mq.port, this.mq.host );
		this.clientPublish = Redis.createClient( this.mq.port, this.mq.host );
		this.client.on("message",function( channel, datas ){
			try{
				datas = JSON.parse( datas );
				_this.emit("4::master", datas.cmd, datas );
			}catch(e){
				_this.emit("2::master",{ method: "error", datas: datas, error: e });
			}
		});
		this.client.subscribe("clustermaster")
		if(this.mq.oauth){
			this.client.oauth( this.mq.oauth );
		}
		this.on("2::master",function( message ){
			_this.publish2Master( message );
			_this.emit("master", message );
		});
		this.on("4::master",function( cmd, datas ){
			_this.dealMsg( cmd, datas );
		});
	},
	processes:{},			//进程
	run:function( name, path, config ){
		var _this = this;
		if(!this.processes[name]){
			var process = new Process( name, config , this);
			process.on("event",function(event,message){
				if("exit" == event){
					_this.emit("2::master",{ method: "process.exit", name: message, endTime: Date.now() });
					_this.processes[message] = null;
					delete _this.processes[message];
				}
				_this.emit(event,name,message);
				_this.publish2Client( this.name, { event: event, message: message } );
			});
			this.processes[name] = process;
		}
		if(!this.processes[name].isRunning){
			this.processes[name].start(path);
			this.emit("2::master",{ method: "process.new", pid: this.processes[name].process.pid, name: name , startTime: this.processes[name].startTime });
			// console.log(this.processes[name].process.pid);
		}
		// console.log(this.processes[name]);
	},
	stop:function( name ){
		if(!!this.processes[name]){
			this.processes[name].stop();
		}
	},
	dealMsg:function( cmd, datas ){
		switch( cmd ){
			case "process.new":
				this.runAsText( datas.name, datas.codes, datas.config );
			break;
			case "process.kill":
				this.stop( datas.name );
			break;
			case "cluster.status":
				this.status( data.oauth );
			break;
		}
	},
	runAsText:function( name , codes, config){
		var path = this._codepath + urlEncode(name)+".js";
		var f = fs.writeFileSync( path , codes );
		this.run( urlEncode(name), path, config);
	},
	publish2Master:function(){
		var array = Array.prototype.slice.call(arguments);
		array.forEach(function(item,index){
			if("object" == typeof(item)){
				array[index] = JSON.stringify(item);
			}
		});
		this.clientPublish.publish.apply(this.clientPublish,["cluster.master"].concat(array.join(" ")));
	},
	publish2Client:function(){
		var array = Array.prototype.slice.call(arguments);
		var channel = "childprocess."+array.shift();
		array.forEach(function(item,index){
			if("object" == typeof(item)){
				array[index] = JSON.stringify(item);
			}
		});
		this.clientPublish.publish.apply(this.clientPublish,[channel].concat(array.join(" ")));
	},
	status:function( oauth ){
		if(oauth == "cavacn"){
			var _p = [];
			for(var key in this.processes){
				var process = this.processes[key];
				_p.push({ name: process.name, path: process.path ,startTime: process.startTime });
			}
			this.publish2Master({ method:"status", result: _p });
		}
	}
});

Cluster.ChildMain = require("./core/process/childmain");

module.exports = exports = Cluster;