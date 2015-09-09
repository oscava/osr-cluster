var Task = require("../").Client.Task;

var task = new Task( "taskname" ,{ port: 2015 });

task.on("event",function(){
	console.log(arguments);
});

task.on("childprocess",function(result){
	console.log(Date.now());
});

task.on("error",function(){
	console.log(arguments);
})

task.on("exit",function(){
	console.log("exit",arguments);
})

var fs = require("fs");

var code = fs.readFileSync("./code.js").toString();

task.start( "osr-quant" ,{ code: code, subscribe :{ url: "tcp://127.0.0.1:2223", channel: "demo" } });

setTimeout(function(){
	task.stop();
},5000);