var Cluster = require("../").Cluster;

var cluster = new Cluster("demo");

cluster.on("event",function(){
	console.log(arguments);
})

cluster.start( 2015 );

// setInterval(function(){
	// console.log(cluster.wokers,cluster.tasks);
// },1000);
