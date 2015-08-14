var ChildMain = require("../lib/core/process/childmain");
var Class = require("osr-class");
var MyChildMain = ChildMain.extends({});
MyChildMain.Model = Class.extends({
	init:function(){
		//数据获取，或者其他操作，请自行添加
		//通过this.myCode得到你的代码对象,请注意
		//such as :
		//      this.myCode.nextTick( current );
	}
})

global.Quant = MyChildMain;

module.exports = exports = MyChildMain;