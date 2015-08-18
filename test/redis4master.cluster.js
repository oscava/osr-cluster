var Redis = require("redis");

var Client = Redis.createClient();

Client.on("message",function(channel, message){
	console.log( channel, message);
})

Client.subscribe("cluster.master");