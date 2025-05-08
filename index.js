const express = require('express');
const path = require('path');
const fs = require('fs');

var key = fs.readFileSync(__dirname + '/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/selfsigned.crt');
var options = {
  key: key,
  cert: cert
};

app = express();
app.use(express.static('public', {dotfiles:'allow'}));

const https = require('https').createServer(options, app);
const io = require('socket.io')(https);
const port = 3200;


app.get('/', function(req, res) {
    res.redirect('index.html');
});

var cursor = {
	x: 0,
	y: 0
};	

io.on('connection', function(socket){
	console.log('a user connected to default with socket:'+socket.id);

	socket.on('reconnect', function(socket){
		console.log("reconnected:");
		debugPrint(socket);
	});

	socket.on('disconnect', function(){
		var userName = socket.username;
		console.log("disconnected:" + userName);

	});

	socket.on('update_cursor', function(msg){
		cursor = msg ;
		io.emit('receive_cursor', cursor);
	});

	socket.on('update_click', function(msg){
		cursor = msg ;
		console.log("click:  x:" + cursor.x + ", y:" + cursor.y);
		io.emit('register_click', cursor);
	});
	
	socket.on('update_sensitivity', function(msg){
		console.log("sensitivity:" + msg);
		io.emit('register_sensitivity', msg);
	});

	socket.on('register_canvas', function(width, height){
		io.emit('set_canvas', width, height);
	});
});

https.listen(port, function(){
	console.log('listening https on *:'+port);
});
