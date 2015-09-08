var Publish = require("../").Fishing.Publish;

var publish = new Publish("demo",4115);

setTimeout(function(){
	publish.publish("I'm ok ");

	publish.publish({ name:"hello"});
},1000)