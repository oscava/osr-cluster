// var Process = require("../lib/core/process");
// var path = __dirname+"/demoQuant.js";
// var myProcess = new Process("demoEE",{mqSubscribe:"ZJS",require:[path],childMain:path});

// myProcess.start(__dirname+"/democode.js");

// myProcess.on("exit",function(data){
	// console.log("exit",data);
// });

// myProcess.on("log",function(msg){
	// console.log("log",msg);
// });
// myProcess.on("error",function(msg){
	// console.log("error",msg);
// });
// myProcess.on("info",function(msg){
	// console.log("info",msg);
// });
// myProcess.on("result",function(msg){
	// console.log("result",msg);
// });

// myProcess.on("sys",function(msg){
	// console.log("[SYS]",msg);
// })

// myProcess.on("buy",function(msg){
	// console.log("[BUY]",msg);
// })

var path = __dirname+"/demoQuant.js";

var Cluster = require("../");

var cluster = new Cluster("股指期货",);

cluster.on("sys",function(processname, message){
	console.log("[SYSTEM]","[ FROM:",processname,"]",message);
});

cluster.on("buy",function(processname, message){
	console.log("[--BUY-]","[ FROM:",processname,"]",message);
})

cluster.on("exit",function(processname, message){
	console.log("[-EXIT-]","[ FROM:",processname,"]",message);
})

cluster.on("error",function( processname, message){
	console.log("[-ERROR]","[ FROM:",processname,"]",message);
})

cluster.on("master",function( message){
	console.log("[-MASTER]", JSON.stringify(message) );
})

cluster.run("IH1508-5M-RGR",__dirname+"/democode.js",{ require:[ path ], childmain: path });
// cluster.run("IH1509-1M-RGR",__dirname+"/democode.js",{ mqSubscribe:"ZJS" , require:[ path ], childMain: path });
