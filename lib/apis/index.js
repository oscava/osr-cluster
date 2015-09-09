var Class = require("osr-class");
var Client = require("../core/pingpong/client");
var Task = require("../client/task");
var Apis = Class.extends({
	$:function( master ){
		master = master || {};
		this.master = { host: master.host || "127.0.0.1", port : master.port };
		this.master.url = "tcp://"+this.master.host+":"+this.master.port;
		this.client = new Client( this.master.url );
	},
	info:function( cb ){
		this.client.post("info",Date.now(),cb);
	},
	startTask:function( name, main ,config ,cb){
		var task = new Task( name, this.master );
		task.start( main, config );
		task.on("event",cb);
		task.on("exit",cb);
		task.on("error",cb);
		task.on("childprocess",cb);
	},
	stopTask:function( name , cb){
		var task = new Task( name, this.master);
		task.stop();
	},
	unregister:function( name, cb){
		this.client.post("unregister", { name: name } , cb );
	}
});

module.exports = Apis;