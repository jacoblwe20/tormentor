
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();
var sockets = [];

app.locals.title = "Websocket Server";

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render("index");
});

app.get("/test", function(req, res){
  res.render("test");
});

app.post("/", function(req, res){
  var data = req.body;
  console.log(data);
  if(data.close){
    for(var i = 0; i < sockets.length; i +=1){
      var socket = sockets[i];
      socket.emit("close", {time : parseFloat(data.time)});
    }
  }
  res.render("index");
});

var app_ = http.createServer(app);

app_.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require("socket.io").listen(app_);

io.sockets.on("connection", function(socket){
  //console.log(socket);
  sockets.push(socket);
});


