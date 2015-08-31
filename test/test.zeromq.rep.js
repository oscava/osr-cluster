var zmq = require("zmq");

var rep = zmq.socket("rep");

var path = 'tcp://127.0.0.1:12345';
rep.bind(path, function(err){
	console.log('bound!');
	rep.on('message',function(data){
		console.log("-->",data.toString());
		rep.send("***"+data);
	})
})