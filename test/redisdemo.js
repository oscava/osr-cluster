// var redis = require("redis");

// var clientPublish = redis.createClient();

// var clientSubscribe = redis.createClient();

// clientSubscribe.psubscribe("*",function(err,channel){
	// console.log("--<",err,channel);
// })

// clientSubscribe.on("pmessage",function(channel, message){
	// console.log(channel, message);
	// console.log("---->");
// })


// setInterval(function(){
	
	// clientPublish.publish("41","ccsaa",redis.print);
	
// },1000)

var b = function(){
	console.log(arguments);
	console.log(Array.prototype.slice.call(arguments));
}
b("a","b","c");