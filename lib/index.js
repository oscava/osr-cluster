var Class = require("osr-class");
var zmq = require("zmq");
var Cluster = Class.extends({
	wokers:{},
	Woker:require("./core/woker"),
	tasks:{},
	//构造函数
	$:function( port, ip ){
		//rep服务
		this.rep = zmq.socket("rep");
		// //pub服务
		// this.pub = zmq.socket("pub");
		
		// //pub路径
		// this.pubPath = "tcp://"+this.ip+":"+this.port+1;
		
		// //pub绑定端口
		// this.pub.bindSync(this.pubPath);
	},
	//初始化
	start:function( port , host ){
		var _this = this;
		//绑定端口
		this.port = port || 5120;
		//绑定IP
		this.host = host || "127.0.0.1";
		//rep路径
		this.repPath = "tcp://"+this.host+":"+this.port;
		//rep绑定端口
		this.rep.bindSync(this.repPath);
		console.log("[SYS]\tThe Cluster start at : %s",this.repPath);
		this.rep.on("message",function(data){
			var message;
			try{
				message = JSON.parse(data.toString());
			}catch(e){
				//不是JSON格式,抛弃
				return;
			}
			if(!message instanceof Array){
				//不是数组格式,抛弃
				return;
			}
			_this.repDeal( message );
		});
		this.heartbeat();
	},
	//请求处理
	repDeal:function( message ){
		var cmd = message.shift();
		switch(cmd){
			case "register":
				this.createWoker({ name: message.shift(), port: message.shift(), host: message.shift() });
			break;
			case "newtask":
				this.createTask({ name: message.shift(), code: message.shift(), config: message.shift() });
			break;
			case "taskmsg":
				console.log("msg",message);
			break;
			case "taskexit":
				console.log("exit",message);
			break;
			case "taskstart":
				console.log("start",message);
			break;
		}
	},
	heartbeat:function(){
		var _this = this;
		setInterval(function(){
			for(var key in _this.wokers){
				_this.wokers[key].heartbeat();
			}
		},1000);
	},
	createWoker:function( woker ){
		// this.rep.send("success");
		var key = woker.name;
		var _this = this;
		if(!this.wokers[key]){
			this.wokers[key] = new this.Woker( woker.name, woker.port, woker.host );
			this.wokers[key].on("exit",function(name,msg){
				if(_this.wokers[name]){
					_this.wokers[name] = null;
					delete _this.wokers[name];
					console.log("[SYS]\tWoker[%s] was exit : %s", name, msg);
				}
			});
			this.rep.send(JSON.stringify(["register",true]));
			console.log("[SYS]\tWoker[%s] register success",woker.name);
		}else{
			this.rep.send(JSON.stringify(["register",false, woker.name + " is already exists"]));
			console.log("[SYS]\tWoker[%s] register fail",woker.name);
		}
	},
	createTask:function( task ){
		var min;
		var woker;
		for(var key in this.wokers){
			if(!min && min!=0){
				min = this.wokers[key].tasknumber;
				woker = this.wokers[key];
			}
			if(this.wokers[key]){
				if(this.wokers[key].tasknumber<min){
					min = this.wokers[key].tasknumber;
					woker = this.wokers[key];
				}
			}
		}
		if(woker){
			woker.createTask( task );
		}
	}
});

Cluster.Woker = require("./client/woker");

Cluster.Task = require("./client/task");

module.exports = exports = Cluster;