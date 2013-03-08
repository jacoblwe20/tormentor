
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();
var sockets = [];
var admins = [];
var clients = {};

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
  if(data.closeall){
    for(var i = 0; i < sockets.length; i +=1){
      var socket = sockets[i];
      socket.emit("close", {});
    }
  }
  if(data.id && data.tab){
    clients[data.id].socket.emit("close", {id : data.tab});
  }
  res.render("index");
});

var app_ = http.createServer(app);

app_.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require("socket.io").listen(app_);
var data = function(msg, data){
  for(var i = 0; i < admins.length; i +=1){
    var socket = admins[i];
    socket.emit(msg, data);
  }
};

io.sockets.on("connection", function(socket){
  //console.log(socket);
  var client = (Math.random() * 2342342342).toString().replace(/\./, "O");
  sockets.push(socket);
  clients[client] = {socket : socket};
  data("new_client", {client : client});

  socket.on("admin", function(){
    admins.push(socket);
    socket.emit("init", clients);
  });

  socket.on("new_tab", function(message){
    if(!clients[client].tabs) clients[client].tabs = {};
    clients[client].tabs[message.tab.id] = message.tab;
    data("new_tab", {client : client, message : message});
    console.log({client : client, tab: message.tab});
  });

  socket.on("close_tab", function(message){
    if(!clients[client].tabs) clients[client].tabs = {};
    delete clients[client].tabs[message.tabid];
    data("close_tab", {client : client, message : message});
  });

  socket.on('disconnect', function () {
    delete clients[client];
    data("disconnect", {client : client});
  });

});


