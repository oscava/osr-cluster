var Class = require("osr-class");
var argh = require("argh");
var zmq = require("zmq");
var ChildProcess = Class.extends({
	$:function(params){
		this.port = parseInt(params.port);
		this.fpPort = parseInt(params.fpPort);
		this.reqPath = "tcp://127.0.0.1:"+this.port;
		this.req = zmq.socket("req");
		this.req.connect(this.reqPath);
		this.name = params.name;
		this.repPath = "tcp://127.0.0.1:"+this.fpPort;
	},
	start:function(){
		var _this = this;
		this.req.on("message",function(data){
			var message;
			try{
				message = JSON.parse(data);
			}catch(e){
				return;
			}
			if(!message instanceof Array){
				return;
			}
			_this.reqDeal( message );
		});
		this.req.send("");
		
	},
	reqDeal:function( message ){
		var cmd = message.shift();
		switch(cmd){
			case ChildProcess.PROCESS_INIT:
				this.processInit( message.shift() );
				break;
		}
	},
	//处理初始化
	processInit:function( config ){
		this.config = config;
		this.models = {};
		var _this = this;
		var status = true;
		var text = "success";
		if(this.config.require){
			this.config.require.forEach(function(item,index){
				_this[item] = require(item);
			});
		}
		if(this.config.main){
			this.mainClass = this.models[this.config.main];
		}else{
			status = false;
			text = "main-class:["+this.config.main+"] not found";
		}
		if(this.mainClass){
			this.main = new this.mainClass();
		}else{
			status = false;
			text = "main-class not found";
		}
		if(this.main){
			var f = this.main.init( config );
			if(f!="success"){
				status = false;
				text = f;
			}
		}else{
			status = false;
			text = "the.main not found";
		}
		this.req.send(JSON.stringify([ChildProcess.PROCESS_INIT,status,text]));
	}
});

ChildProcess.PROCESS_INIT = 11001;

new ChildProcess(argh(process.argv)).start();