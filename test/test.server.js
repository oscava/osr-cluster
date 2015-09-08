var Server = require("../").Server;

var server = new Server(4113);

server.on("hello",function(result ,cb ){
	console.log( result );
	cb( null, "ok" );
}).on("down",function(result, cb){
	console.log( result );
	cb( null, "down-ok");
})