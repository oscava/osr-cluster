var Class = require("../core/emitter");

var Task = Class.extends({
	$:function( name, main, config ){
		this.name = name;
		this.main = main;
		this.config = config;
	},
	setWoker:function( woker ){
		this.woker = woker;
	},
	exit:function(cb){
		this.woker.taskexit( this ,cb );
	}
});

module.exports = Task;