var Redis = require("redis");

var Client = Redis.createClient();

var fs = require("fs")

var path = __dirname+"/demoQuant.js";

var data  = { cmd: "process.new", name:"IH-1520", codes:fs.readFileSync("./democode.js").toString("utf8"), config: { require: [path] ,childmain: path } };

Client.publish("clustermaster", JSON.stringify(data));