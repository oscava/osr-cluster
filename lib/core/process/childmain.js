var Emitter = require("../../utils/emitter");
var fs = require("fs");
var Script = require("vm").Script;
var ChildMain = Emitter.extends({
	$:function( childprocess , path , config){
		if(!config)config = {};
		this.process = childprocess;
		this.code = "var MyCode=" + fs.readFileSync(path).toString("utf8");
		this.script = new Script(this.code);
		this.script.runInThisContext();
		this.myCode = new MyCode( this.process );
		this.init( config );
	},
	init:function( config ){
		console.log(config);
	}
	// nextTick:function( channel, message ){
		// if(this.myCode){
			// var data = JSON.parse( message);
			// this.myCode.receiveData( data );
		// }
	// }
})

module.exports = exports = ChildMain;