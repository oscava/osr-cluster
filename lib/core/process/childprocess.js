var Emitter = require("../../utils/emitter");
var redis = require("redis");
var argh = require("argh");
var fs = require("fs");
var urlEncode = require("urlencode");
var ChildProcess = Emitter.extends({
	$:function(){
		var argv = argh(process.argv);
		this.file = urlEncode.decode(argv["file"]);
		this.require = (urlEncode.decode(argv["require"]) || "").split(",");
		this.require.forEach(function(item,index){
			if(!item)return;
			global[item] = require(item);
		});
		this.processname = argv["name"];
		this.childMainClass = global[urlEncode.decode(argv["childmain"])];
		if(this.childMainClass){
			var config = {};
			for(var key in argv){
				if(key=="argv")continue;
				config[key] = argv[key];
			}
			this.childMain = new this.childMainClass(this,this.file,config);
		}
		//this.code = fs.readFileSync(this.file).toString();
		// this.clientSubscribe = redis.createClient(this.mqPort,this.mqHost);
		this.clientPublish = redis.createClient();
		if(this.mqOauth){
			this.clientSubscribe.oauth(this.mqOauth);
		}
	},
	run:function(){
		var _this = this;
		this.publish("sys"," The process start :[ name:",this.processname,"time:",new Date()+" ] ");
		// this.clientSubscribe.on("message",function(channel,message){
			// _this.emit("datafrommq",channel,message);
		// });
		// this.clientSubscribe.subscribe(this.mqSubscribe);
		// this.on("datafrommq",function(channel,message){
			// if(_this.childMain){
				// _this.childMain.nextTick(channel,message);
			// }
		// });
	},
	publish:function(){
		var array = Array.prototype.slice.call(arguments);
		var channel = array.shift();
		var message = array.join(" ");
		this.clientPublish.publish.apply(this.clientPublish,[this.processname+"."+channel].concat(message));
	}
});

global.myProcess = new ChildProcess({});
global.myProcess.run();