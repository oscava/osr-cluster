var Woker = require("../").Client.Woker;

var woker = new Woker( "woker2", { port:2015 } );

woker.on("event",function(){
	console.log(arguments);
});

woker.start( 2017 );

// setTimeout(function(){
	
	// woker.stop();
	
// },5000);

