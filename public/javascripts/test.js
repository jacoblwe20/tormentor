var socket = io.connect('http://sudo.servebeer.com:8080');

socket.on('close', function (data) {
   console.log(data);
});
