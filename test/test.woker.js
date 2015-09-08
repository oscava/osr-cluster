var Woker = require("../").Client.Woker;

var woker = new Woker( "woker1", { port:2015 } );

woker.on("event",function(){
	console.log(arguments);
});

woker.start( 2016 );

// setTimeout(function(){
	
	// woker.stop();
	
// },5000);

