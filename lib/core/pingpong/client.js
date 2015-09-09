var Class = require("../emitter");
var zmq = require("zmq");
var Client = Class.extends({
	$:function( url ,retrycount){
		this.url = url;	
		this.retrycount = retrycount || 2;
	},
	post:function( cmd , msg , cb ){
		if(!cb)cb = function(){};
		var req = zmq.socket("req");
		var _this = this;
		req.on("message",function(data){
			var message;
			var err;
			var result = null;
			try{
				message = JSON.parse( data );
				err = message.shift();
				result = message.shift();
			}catch(e){
				err = e;
			}finally{
				req.close();
				cb( err, result);
			}
		});
		req.on("connect_retry",function(){
			if(!this.retrycount){
				this.retrycount = 0;
			}
			this.retrycount ++ ;
			if(this.retrycount == _this.retrycount){
				this.close();
				cb(new Error("connect timeout"));
			}
		});
		req.on("error",function(e){
			if(cb)cb(e,null);
			req.close();
			req = null;
		});
		req.monitor(500,0);
		req.connect(this.url);
		req.send(JSON.stringify([ cmd , msg ]));
	}
});

module.exports = Client;