var Woker = require("../").Woker;

var woker = new Woker( "Woker2" , { port: 5120 });
woker.on("event",function(){
	console.log(arguments);
})
woker.start( 5143 );