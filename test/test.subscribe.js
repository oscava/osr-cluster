var Subscribe = require("../").Fishing.Subscribe;

var sub = new Subscribe(4115);

sub.subscribe("demo",function(result){
	console.log(result,typeof(result));
})