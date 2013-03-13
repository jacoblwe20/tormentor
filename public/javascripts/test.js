var socket = io.connect('http://127.0.0.1:3000');

socket.on('close', function (data) {
   console.log(data);
});
var client = Math.random() * 100 + "tester";
socket.emit("new_client", {client_id : client, tabs : []});
