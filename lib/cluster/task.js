var Class = require("osr-class");
//任务
var Task = Class.extends({
	//构造函数
	$:function( name, content ){
		this.name = name;
		this.content = content;
	},
	//注册
	register:function(context){
		this.context = context;
		this.context.createTask( this );
	}
});

Task.MSGID = 10002;

module.exports = exports = Task;