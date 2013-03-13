(function(exports){

	var clients;
	var content = $(".content");
	var Cookie = function(){
		var cookie = decodeURIComponent(document.cookie);
		var obj = {};
		cookie = cookie.split(/\=/g);
		obj[cookie[0]] = cookie[1];
		return obj;
	}();
	var view = "<ul>"+
		"{{#clients}}" +
		"<li data-id={{id}} >" +
			"{{id}}" +
			"<ul>" +
			"{{#tabs}}" +
			"<li data-id={{id}}>" +
				"{{url}} &nbsp;&nbsp;&nbsp;&nbsp;" +
				"<a href=# class=close >Close</a>" + 
			"</li>" +
			"{{/tabs}}" + 
			"</ul>" +
		"{{/clients}}" +
	"</ul>";
	var reformat = function(){
		var clis = [];
		for(var key in clients){
			var client = clients[key];
			var tabs = [];
			if(client.tabs){
				for(var index in client.tabs){
					tabs.push({id : index, url : client.tabs[index].url});
				}
			}
			clis.push({id : key, tabs : tabs});
		}
		return clis;
	};
	var refresh = function(){
		var data = {clients : reformat()};
		content.html(Mustache.render(view, data));
	};
	var socket = io.connect("http://sudo.servebeer.com");

	content.on("click", ".close", function(){
		var parent = $(this).parent("li");
		var obj = {
			tab : parent.data("id"),
			id : parent.parent("ul").parent("li").data("id")
		};

		socket.emit("close", obj);
	});

	socket.emit("admin", {admin : true});

	socket.on('close', function (data) {
	   console.log(data);
	});

	socket.on("init", function(data){
		clients = data.clients;
		refresh();
	});

	socket.on("new_tab", function(data){
		if(!clients[data.client].tabs) clients[data.client].tabs = {};
		clients[data.client].tabs[data.message.tab.id] = data.message.tab;
		refresh();
	});

	socket.on("close_tab", function(data){
		//onsole.log(data);
		if(!clients[data.client].tabs) clients[data.client].tabs = {};
		delete clients[data.client].tabs[data.message.tabid];
		refresh();
	});

	socket.on("new_client", function(data){
		//console.log(data);
		clients[data.client_id] = {tabs : data.tabs};
		refresh();
	});

	socket.on("url_change", function(data){
		//console.log(data);
		if(clients[data.client].tabs[data.message.tabid]){
			clients[data.client].tabs[data.message.tabid].url = data.message.url;
			refresh();
		}
	});

	socket.on("disconnect", function(data){
		//console.log(data);
		delete clients[data.client];
		refresh();
	});

	exports.views = view;
	exports.clients = clients;


}(this))