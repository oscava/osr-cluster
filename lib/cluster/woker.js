var Class = require("osr-class");
var zmq = require("zmq");
//工作者
var Woker = Class.extends({
	//构造函数
	$:function( name, port, host, protocol){
		this.protocol = protocol || "tcp";
		this.name = name;
		this.port = port;
		this.host = host;
		this.path = this.protocol+"://"+this.host+":"+this.port;
	},
	//注册
	register:function(context){
		this.context = context;
		this.context.createWoker( this );
	},
	//发送请求
	post:function(){
		var array = Array.prototype.slice.call(arguments);
		this.req.send(JSON.stringify(array));
	}
});

Woker.MSGID = 10001;

module.exports = exports = Woker;