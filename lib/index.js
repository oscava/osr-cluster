var Auto = function(){
	
}

Auto.PingPong = {
	Client : require("./core/pingpong/client"),
	Server : require("./core/pingpong/server")
}

Auto.Fishing = {
	Publish: require("./core/fishing/publish"),
	Subscribe: require("./core/fishing/subscribe")
}

Auto.Cluster = require("./cluster");

Auto.Client = {
	Woker: require("./client/woker"),
	Task: require("./client/task")
}

module.exports = Auto;