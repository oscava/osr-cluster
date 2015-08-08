var Emitter = require("./utils/emitter");
var Process = require("./core/process");
var Cluster = Emitter.extends({
	$:function( name ){
		this.name = name;
		console.log("[SYSTEM] --| %s",this.name,"多进程调用系统 |--");
	},
	processes:{},			//进程
	run:function( name, path, options){
		var _this = this;
		if(!this.processes[name]){
			this.processes[name] = new Process( name, options );
			this.processes[name].on("event",function(event,message){
				if("exit" == event){
					delete _this.processes[message];
				}
				_this.emit(event,name,message);
			});
		}
		if(!this.processes[name].isRunning){
			this.processes[name].start(path);
		}
	},
	stop:function( name ){
		if(!!this.processes[name]){
			this.processes[name].stop();
		}
	}
});

Cluster.ChildMain = require("./core/process/childmain");

module.exports = exports = Cluster;