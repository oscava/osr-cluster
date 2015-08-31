var Class = require("osr-class");
var zmq = require("zmq");
var Woker = require("./cluster/woker");
var Task = require("./cluster/task");
var Cluster = Class.extends({
	wokers:{},
	tasks:{},
	//构造函数
	$:function( port, ip ){
		//绑定端口
		this.port = port || 5120;
		//绑定IP
		this.ip = ip || "localhost";
		//rep服务
		this.rep = zmq.socket("rep");
		// //pub服务
		// this.pub = zmq.socket("pub");
		//rep路径
		this.repPath = "tcp://"+this.ip+":"+this.port;
		// //pub路径
		// this.pubPath = "tcp://"+this.ip+":"+this.port+1;
		//rep绑定端口
		this.rep.bindSync(this.repPath);
		// //pub绑定端口
		// this.pub.bindSync(this.pubPath);
		this.init();
	},
	//初始化
	init:function(){
		var _this = this;
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
	},
	//请求处理
	repDeal:function( message ){
		var cmd = message.shift();
		switch(cmd){
			case Woker.MSGID:
				//工作者~~~工作者名称
				new	Woker( message[0] , message[1], message[2], message[3] ).register(this); 
				break;
			case Task.MSGID:
				//任务~~~~任务名称,内容,参数
				new Task( message[0], message[1],message[2]).register(this);
				break;
		}
	},
	createWoker:function( woker ){
		
	},
	createTask:function( task ){
		
	}
});

module.exports = exports = Cluster;