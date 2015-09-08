var Class = require("../emitter");
var zmq = require("zmq");
var Monitor = Class.extends({
	$:function( url , retrycount){
		this.url = url;
		this.retrycount = retrycount || 2;
		this.number = 0;
		this.isStart = false;
	},
	start:function(){
		if(this.isStart)return;
		var _this = this;
		if(!this.req){
			this.req = zmq.socket("req");
			this.req.on("connect",function(){
				this.retrycount = 0;
				_this.emit("connect");
			})
			this.req.on("connect_retry",function(){
				if(!this.retrycount){
					this.retrycount = 0;
				}
				this.retrycount ++ ;
				if(this.retrycount == _this.retrycount){
					this.retrycount = 0;
					_this.emit("disconnect",++_this.number);
				}
			});
			this.req.monitor( 100 , 0);
		}
		this.isStart = true;
		this.req.connect(this.url);
	},
	close:function(){
		if(this.req){
			this.req.close();
		}
	}
});

module.exports = exports = Monitor;