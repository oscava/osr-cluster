var Class = require("../../utils/class");
var spawn = require("child_process").spawn;
var Process = Class.extends({
	isRunning:	false,				//是否运行中
	process:	null,				//进程
	start:		function(path){		//启动
		if(this.isRunning){
			this.process = spawn('node',[__dirname+"/childprocess.js",])
		}
	},
	stop:		function(){			//停止
		if(this.isRunning && this.process){
			this.process.exit("SIGNUP");
		}
	}
})

module.exports = exports = Process;