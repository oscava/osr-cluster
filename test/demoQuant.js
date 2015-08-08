var ChildMain = require("../lib/core/process/childmain");
var Class = require("osr-class");
var MyChildMain = ChildMain.extends({});

MyChildMain.Model = Class.extends({
	$:function(process){
		this.process = process;
	}
})

global.Quant = MyChildMain;

module.exports = exports = MyChildMain;