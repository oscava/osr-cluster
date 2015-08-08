var Emitter = require("../../utils/emitter");
var fs = require("fs");
var Script = require("vm").Script;
var ChildMain = Emitter.extends({
	$:function( childprocess , path , params){
		if(!params)params = {};
		this.process = childprocess;
		this.code = "var MyCode=" + fs.readFileSync(path).toString("utf8");
		this.script = new Script(this.code);
		this.script.runInThisContext();
		this.myCode = new MyCode( this.process, params.name||"my model", params.author||"cava.zhang", params.money||200000, params.options );
	},
	nextTick:function( channel, message ){
		if(this.myCode){
			var data = JSON.parse( message);
			this.myCode.receiveData( data );
		}
	}
})

module.exports = exports = ChildMain;