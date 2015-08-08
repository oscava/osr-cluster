/**
	Author:		cava.zhang
	Email:		admin@cavacn.com
	Date:		2015-08-07 10:55:13
	
	触发器类型的Class父类
*/
var EventEmitter = require("events").EventEmitter;
var Class = require("osr-class");
var Emitter = Class.extends(EventEmitter);
module.exports = exports = Emitter;