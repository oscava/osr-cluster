var Class = require("../core/emitter");
var Client = require("../core/pingpong/client");
var Woker = Class.extends({
	tasks:{},
	$:function( name , config){
		this.name = name;
		this.config = config;
		this.config.url = "tcp://"+config.host+":"+config.port;
		this.client = new Client( this.config.url );
		this.tasknum = 0;
	},
	newtask:function( task , cb ){
		var _this = this;
		if(!cb)cb=console.log;
		if(!this.tasks[task.name]){
			this.client.post("newtask", task ,function(err, result ){
				if(!err){
					task.setWoker( _this );
					_this.tasks[task.name] = task;
					_this.tasknum ++ ;
				}
				cb(err,result);
			})
		}else{
			cb("[Task("+task.name+")] is already exists !");
		}
	},
	taskexit:function( task ,cb ){
		delete this.tasks[task.name];
		cb(null,"[Task("+task.name+")] is already exit !");
	}
});

module.exports = exports = Woker;