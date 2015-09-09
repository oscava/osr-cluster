var Apis = require("../").Apis;

var apis = new Apis({ port: 2015 });

apis.info(function(err,result){
	console.log(err,result);
});