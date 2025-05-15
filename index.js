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

var phone = {
	x: 0,
	y: 0,
	z: 0
}

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


	/** 
		PHONE CURSOR
	**/
	socket.on('update_cursor', function(msg){
		//debugObject(msg);
		io.emit('receive_cursor', msg);
	});

	socket.on('update_click', function(msg){
		io.emit('register_click', msg);
	});
	
	socket.on('update_pointer_sensitivity', function(msg){
		console.log("pointer sensitivity:" + msg);
		io.emit('register_pointer_sensitivity', msg);
	});

	socket.on('update_movement_sensitivity', function(msg){
		console.log("movement sensitivity:" + msg);
		io.emit('register_movement_sensitivity', msg);
	});

	socket.on('register_canvas', function(width, height){
		io.emit('set_canvas', width, height);
	});

	socket.on('orientation_reset', function(msg){
		console.log("orientation_reset:");
		//debugObject(msg);
	});

	socket.on('debug_remote',  function(msg){
		debugObject(msg);
	});
	/** 
		PHONE WAVE
	**/

	//receive phone position

	//recieve static scene positions
		//These are stored but they don't move every tick (or ever?)

	//send static scene positions


	//recieve dynamic scene positions
		//do processing

	//send dynamic scene positions
		//This would include all active objects in the scene

	
});

https.listen(port, function(){
	console.log('listening https on *:'+port);
});

function debugObject(obj, label = 'Debug') {
    console.log(`--- ${label} ---`);
    console.log(JSON.stringify(obj, null, 2));
}