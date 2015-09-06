var Task = require("../").Task;

var task = new Task( 'task1' ,{ host: "127.0.0.1", port: 5120 });

task.on("event",function( ){
	console.log(arguments);
})

task.start('console.log("hello")',{ config: "config" });