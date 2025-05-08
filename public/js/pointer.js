var canvas, socket;

var cursor = {
	x: 0,
	y: 0
};	

var orientationMap = {
    x: 0,
    y: 0,
    z: 0
}
var resetZero = false;
var sensitivity = 50;

$('#controller').hide();
canvas = $('canvas')[0];

var cursorElement = document.getElementById("cursorInfo");

connect = function(){
	if (socket) {
		socket.destroy();
		delete socket;
		socket = null;
	}

	socket = io();

	socket.on( 'connect', function () {
		console.log( 'connected to server' );
	} );

	socket.on( 'disconnect', function () {
		console.log( 'disconnected from server' );
		window.setTimeout( 'connect()', 5000 );
	} );

    socket.on( 'receive_cursor', function (msg) {
        cursor = msg;
		//console.log(cursor);
	} );

    socket.on('register_click', function (msg) {
        clickRegistered(msg);
	} );

    socket.on('register_sensitivity', function (msg) {
        sensitivityRegistered(msg);
	} );

    socket.on('set_canvas', function (width, height) {
        let canvasInfo = document.getElementById("canvasInfo")
        
        canvasInfo.innerHTML = "Canvas Width:" + width + " | Canvas Height:" + height;
        canvas = $('canvas')[0];
        canvas.width = width;
        canvas.height = height;

	} );

}


viewMonitor = function(){
    registerCanvas();
    $('#monitor').show();
    $('#controller').hide();
}

viewController = function(){
    $('#monitor').hide();
    $('#controller').show();
}

registerCanvas = function(){
    onResize();
    socket.emit('register_canvas', canvas.width, canvas.height);
}

onResize = function () {
    canvas = $('canvas')[0];
	canvas.width = (window.innerWidth);
	canvas.height = (window.innerHeight);
}


drawCursor = function (){

    cursorElement.innerHTML = "X:" + cursor.x + " | Y:" + cursor.y;
    canvas = $('canvas')[0];
    if(canvas){
        var w = canvas.width;
	    var h = canvas.height;
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, w, h);
        var p = 10;

        const x = +cursor.x ;
        const y = +cursor.y ;
        if(x > 0 && y > 0){
            console.log("p,x,y:" + p + "," + x + "," + y);
            console.log
            context.setTransform(1, 0, 0, 1, 0, 0); // reset transform
            context.beginPath(); //draw crosshair
            context.moveTo(x , y);
            context.lineTo(x - p, y);
            context.moveTo(x , y);
            context.lineTo(x + p, y);
            context.moveTo(x , y);
            context.lineTo(x , y - p);
            context.moveTo(x , y);
            context.lineTo(x , y + p);
            context.strokeStyle = "red";
            context.lineWidth = 2;
            context.stroke(); 
            context.closePath();
        }
    }
	window.requestAnimationFrame(drawCursor);
	
}


var fps = 40;
var eventListenTimeMs = Math.floor(1000 / fps);

const throttledHandler1 = throttle(handleEvent, eventListenTimeMs);
//const throttledHandler2 = throttle(handleEvent2, eventListenTimeMs);

window.addEventListener("deviceorientation", throttledHandler1);
//window.addEventListener("devicemotion", throttledHandler2);

function handleEvent(event) {
    //console.log('Event fired at', Date.now(), event);
    handleOrientation(event);
}
/*
function handleEvent2(event) {
    console.log('Event fired at', Date.now(), event);
    handleMotion(event);
}
*/

function throttle(callback, limitMs) {
    let lastCall = 0;
    return function(event) {
        const now = Date.now();
        if (now - lastCall >= limitMs) {
            lastCall = now;
            callback(event);
        }
        // else: drop event
    };
}

function handleOrientation(event) {
    updateFieldIfNotNull('Orientation_a', event.alpha); //z-axis, across
    updateFieldIfNotNull('Orientation_b', event.beta); //x-axis, up and down
    //('Orientation_g', event.gamma); ignore gamma updates (y-axis , phone spin across length)
    incrementEventCount();
    if(resetZero){
        setOrientationDefault(event);
        resetZero = false;
    }
    translateToCursor(event);
}
/*
function handleMotion(event) {
    updateFieldIfNotNull('Accelerometer_gx', event.accelerationIncludingGravity.x);
    updateFieldIfNotNull('Accelerometer_gy', event.accelerationIncludingGravity.y);
    updateFieldIfNotNull('Accelerometer_gz', event.accelerationIncludingGravity.z);

    updateFieldIfNotNull('Accelerometer_x', event.acceleration.x);
    updateFieldIfNotNull('Accelerometer_y', event.acceleration.y);
    updateFieldIfNotNull('Accelerometer_z', event.acceleration.z);

    updateFieldIfNotNull('Accelerometer_i', event.interval, 2);

    updateFieldIfNotNull('Gyroscope_z', event.rotationRate.alpha);
    updateFieldIfNotNull('Gyroscope_x', event.rotationRate.beta);
    updateFieldIfNotNull('Gyroscope_y', event.rotationRate.gamma);
    incrementEventCount();
}
*/

function incrementEventCount(){
    let counterElement = document.getElementById("num-observed-events")
    let eventCount = parseInt(counterElement.innerHTML)
    counterElement.innerHTML = eventCount + 1;
 
}

function updateFieldIfNotNull(fieldName, value, precision=2){
    if (value != null)
        document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}

resetZeroFlip = function(){
    resetZero = true;
}

clickPointer = function(){
    socket.emit('update_click', cursor);
}

clickRegistered = function(msg){
    var displayClickTimer = 3;
    socket.emit('register_click', cursor);
    console.log(msg);
    $('#clickRegister')[0].innerHTML = "Clicked! x:" + msg.x + ", y:" + msg.y;
    $('#clickRegister').show();

    const interval = setInterval(() => {
        displayClickTimer--;
        if (displayClickTimer <= 0) {
          clearInterval(interval);
          $('#clickRegister').hide();

        }
    }, 1000);
}

changeSensitivity = function(){
    socket.emit('update_sensitivity', $('#sensitivity')[0].value);
}

sensitivityRegistered = function(msg){
    console.log("sensitivity:" + msg);
    sensitivity = msg;
}

setOrientationDefault = function(event){
    orientationMap.x = event.beta.toFixed(2);
    orientationMap.y = event.gamma.toFixed(2);
    orientationMap.z = event.alpha.toFixed(2);
    cursor.x = canvas.width/2;
    cursor.y = canvas.height/2;
    socket.emit('orientation_reset', orientationMap);
}

drawCursor();
connect();
onResize();
translateToCursor = function(event){
    xDelta = event.beta.toFixed(2) - orientationMap.x;
    zDelta = event.alpha.toFixed(2) - orientationMap.z;

    var previousX = cursor.x;
    var previousY = cursor.y;
    cursor.x = ((canvas.width/2) - (zDelta  * sensitivity)).toFixed(0); //flip z and x ?
    cursor.y = ((canvas.height/2) - (xDelta * sensitivity)).toFixed(0);
    if(previousX != cursor.x && previousY != cursor.y){
        socket.emit('update_cursor', cursor);
    }else{
        //console.log("No movement");
    }
    
}