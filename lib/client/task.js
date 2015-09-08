var Class = require("../core/emitter");
var Client = require("../core/pingpong/client");
var Task = Class.extends({
	$:function( name ){
		this.name = name;
	},
	start: function( main, config, master ){
		this.master = {};
		master = master || {};
		var _this = this;
		this.master.host = master.host || "127.0.0.1";
		this.master.port = master.port;
		this.master.url = "tcp://"+this.master.host+":"+this.master.port;
		this.client = new Client( this.master.url );
		this.client.post("newtask",{ name: this.name, main: main, config: config },function(err,result){
			_this.emit("event","newtask",err||result);
			process.exit();
		});
	}
});

module.exports = exports = Task;