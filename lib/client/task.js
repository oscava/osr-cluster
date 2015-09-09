var Class = require("../core/emitter");
var Client = require("../core/pingpong/client");
var Subscribe = require("../core/fishing/subscribe");
var Publish = require("../core/fishing/publish");
var Task = Class.extends({
	$:function( name ,master ){
		this.name = name;
		var _this = this;
		this.master = {};
		master = master || {};
		this.master.host = master.host || "127.0.0.1";
		this.master.port = master.port;
		this.master.url = "tcp://"+this.master.host+":"+this.master.port;
		this.client = new Client( this.master.url );
	},
	start: function( main, config ){
		var _this = this;
		this.client.post("newtask",{ name: this.name, main: main, config: config },function(err,result){
			_this.emit("event","newtask",err||result);
			if(result){
				_this.sub = new Subscribe( result.port ,result.host);
				_this.sub.subscribe(result.channel,function( data ){
					_this.emit(data.event,data.result);
				})
			}
		});
	},
	stop:function(){
		this.client.post("stoptask",{ name: this.name }, function(err,result){
			console.log("-->stoptask",err,result);
		})
	}
});

module.exports = exports = Task;