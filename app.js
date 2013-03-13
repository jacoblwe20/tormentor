
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , URI = process.env.TORMENTOR || "http://127.0.0.1"
  , PORT = process.env.PORT || 3000;

var app = express();
var sockets = {};
var admins = [];
var clients = {};
var close = function(data){
  // if(data.closeall){
  //   for(var i = 0; i < sockets.length; i +=1){
  //     var socket = sockets[i];
  //     socket.emit("close", {});
  //   }
  // }
  if(data.id && data.tab){
    console.log(["sending signal", data])
    sockets[data.id].emit("close", {id : data.tab});
  }
};

app.locals.title = "Websocket Server";

app.configure(function(){
  app.set('port', PORT);
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
  res.cookie("uri", "http://sudo.servebeer.com:8080" );
  res.render("index");
});

app.get("/test", function(req, res){
  res.render("test");
});

var app_ = http.createServer(app);

app_.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require("socket.io").listen(app_);
var data = function(msg, data){
  for(var i = 0; i < admins.length; i += 1){
    var socket = admins[i];
    socket.emit(msg, data);
  }
};

io.sockets.on("connection", function(socket){
  //console.log(socket);
  var client = (Math.random() * 2342342342).toString().replace(/\./, "O");
  // either need to send out client id to client or retrieve the client id from the client so that we can have persistant data
  socket.on("new_client", function(message){
    var client = message.client_id;

    clients[client] = {tabs : message.tabs};
    sockets[client] = socket;
    data("new_client", message);


    socket.on("new_tab", function(message){
      if(!clients[client].tabs) clients[client].tabs = {};
      clients[client].tabs[message.tab.id] = message.tab;
      data("new_tab", {client : client, message : message});
      //console.log({client : client, tab: message.tab});
    });

    socket.on("close_tab", function(message){
      if(!clients[client].tabs) clients[client].tabs = {};
      delete clients[client].tabs[message.tabid];
      data("close_tab", {client : client, message : message});
    });

    socket.on("url_change", function(message){
      clients[client].tabs[message.tabid].url = message.url;
      data("url_change", {client : client, message : message});
    });

    socket.on('disconnect', function () {
      delete clients[client];
      data("disconnect", {client : client});
    });

  });

  socket.on("admin", function(){
    admins.push(socket);
    socket.emit("init", {clients : clients});
    socket.on("close", function(data){
      close(data);
      //console.log("closing");
    });
  });

});


