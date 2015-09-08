var Client = require("../").PingPong.Client;

var client = new Client("tcp://127.0.0.1:4113");

client.post( "hello", "world" , function( data ){
	console.log("hello", arguments );
	client.post( "down", "aaaa", function(data){
		console.log("down",arguments);
	})
});