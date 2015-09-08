var Task = require("../").Client.Task;

var task = new Task( "taskname2" );

task.on("event",function(){
	console.log(arguments);
})

task.start( "osr-quant" ,{ config: "config995" }, { port: 2015 });