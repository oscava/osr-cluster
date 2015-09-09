var Class = require("../core/emitter");
var Client = require("../core/pingpong/client");
var Task = require("./task");
var Woker = Class.extends({
	tasks:{},
	$:function( name , config){
		this.name = name;
		this.config = config;
		this.config.url = "tcp://"+config.host+":"+config.port;
		this.client = new Client( this.config.url );
		this.tasknum = 0;
		this.heartbeat();
	},
	newtask:function( task , cb ){
		var _this = this;
		this.client.post("newtask", task ,function(err, result ){
			if(!err){
				_this.tasks[task.name] = task;
				_this.tasknum ++ ;
			}
			task.setWoker( _this );
			cb(err,result);
		});
	},
	taskexit:function( task ,cb ){
		delete this.tasks[task.name];
		cb(null,"[Task("+task.name+")] is already exit !");
	},
	taskstop:function( task ,cb ){
		var _this = this;
		this.client.post("taskstop", { name: task.name}, function(err, result ){
			if(!err){
				delete _this.tasks[ task.name ];
				_this.tasknum--;
			}
			cb(err,result);
		});
	},
	heartbeat:function(){
		var _this = this;
		this.interval = setInterval(function(){
			_this.client.post("heartbeat",Date.now(),function(err,result){
				if(!err){
					_this.tasknum = result.tasknum;
					for(var key in result.tasks){
						var item  = result.tasks[key];
						_this.tasks[key] = new Task( item.name, item.main, item.config );
						_this.tasks[key].setWoker( _this );
					}
				}else{
					_this.emit("exit",_this.name);
				}
			});
		},1000);
	},
	exit:function(){
		clearInterval(this.interval);
		delete this.interval;
		delete this.client;
	}
});

module.exports = exports = Woker;