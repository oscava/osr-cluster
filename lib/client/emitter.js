var EventEmitter = require("events").EventEmitter;
var Class = require("osr-class");

var Emitter = Class.extends(EventEmitter);

module.exports = Emitter;