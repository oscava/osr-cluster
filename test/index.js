var Cluster = require("../");

var cluster = new Cluster( 5120 );

cluster.start();