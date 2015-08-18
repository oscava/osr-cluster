var Redis = require("redis");

var Client = Redis.createClient();

var fs = require("fs")

var path = __dirname+"/demoQuant.js";

var data  = { cmd: "process.kill" , name: "IH-1520" };

Client.publish("clustermaster", JSON.stringify(data));