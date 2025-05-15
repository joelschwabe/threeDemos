let canvas, gameContainer, renderer, camera, scene, socket, animationFrame, clock;
const animationCallbacks = [];

var cursor = {
	oriX: 0,
	oriY: 0,
    oriZ: 0,
    accX: 0,
    accY: 0,
    accZ: 0,
    acgX: 0,
    acgY: 0,
    acgZ: 0,
    gyrX: 0,
    gryY: 0,
    gryZ: 0,
    x: 0,
    y: 0,
    z: 0
};	

var orientationMap = {
	oriX: 0,
	oriY: 0,
    oriZ: 0,
    accX: 0,
    accY: 0,
    accZ: 0,
    acgX: 0,
    acgY: 0,
    acgZ: 0,
    gyrX: 0,
    gryY: 0,
    gryZ: 0
};	

var boxDelta = {
    x:0,
    y:0,
    z:0
}

let resetZero = false;
let pointerSensitivity = 50;
let movementSensitivity = 4;

$('#controller').hide();
canvas = $('#canvas')[0];
gameContainer = $('#gameMonitor')[0];

scene = new THREE.Scene();
clock = new THREE.Clock();
scene.background = new THREE.Color(0x202020);
camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
let isCameraLocked = false;
renderer = new THREE.WebGLRenderer({ antialias: true });

toggleThreeJSContainer(false);

const cursorElement = document.getElementById("cursorInfo");




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

    socket.on('register_pointer_sensitivity', function (msg) {
        pointerSensitivityRegistered(msg);
	} );

    socket.on('register_movement_sensitivity', function (msg) {
        movementSensitivityRegistered(msg);
	} );

    socket.on('set_canvas', function (width, height) {
        let canvasInfo = document.getElementById("canvasInfo")
        
        canvasInfo.innerHTML = "Canvas Width:" + width + " | Canvas Height:" + height;
        canvas = $('canvas')[0];
        canvas.width = width;
        canvas.height = height;

	} );

}

function registerAnimationCallback(fn) {
    animationCallbacks.push(fn);
    return () => {
        const index = animationCallbacks.indexOf(fn);
        if (index !== -1) animationCallbacks.splice(index, 1);
    };
}


function animate() {
    requestAnimationFrame(animate);
    for (const cb of animationCallbacks) {
        cb();
    }
    renderer.render(scene, camera);
}

animate();

viewPointer = function(){
    registerCanvas();
    $('#pointerscreen').show();
    //$('#gamescreen').hide();
    toggleThreeJSContainer(false);
    $('#controller').hide();
}

viewController = function(){
    $('#pointerscreen').hide();
    //$('#gamescreen').hide();
    toggleThreeJSContainer(false);
    $('#controller').show();
}

viewGame = function(){
    $('#pointerscreen').hide();
    //$('#gamescreen').show();
    toggleThreeJSContainer(true);
    $('#controller').hide();
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




camera.position.set(0, 2, 2);
camera.lookAt(0, 0, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
$("#gameMonitor")[0].append(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);


function createArc(radius, startAngle, endAngle, segments = 32, plane = 'XY', arcColor) {
    const curve = new THREE.EllipseCurve(
        0, 0,       // ax, ay (center)
        radius, radius, // xRadius, yRadius
        startAngle, endAngle, // startAngle, endAngle (in radians)
        false,      // clockwise
        0           // rotation
    );
    console.log("arcColor:" + arcColor);
    const points = curve.getPoints(segments);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const arcMaterial = new THREE.LineBasicMaterial({ color: arcColor }); 

    // Rotate points into correct plane
    let mesh = new THREE.Line(geometry, arcMaterial);

    if (plane === 'XY') {
        // No rotation — default XY plane
    } else if (plane === 'XZ') {
        mesh.rotation.x = Math.PI / 2;
    } else if (plane === 'YZ') {
        mesh.rotation.y = Math.PI / -2;
    }

    return mesh;
}

const arcXY = createArc(1.5, 0, Math.PI / 2, 32, 'XY', '#ff0000');  // 90° arc in XY plane
const arcXZ = createArc(1.5, 0, Math.PI / 2, 32, 'XZ', '#0000ff');  // 90° arc in XZ plane
const arcYZ = createArc(1.5, 0, Math.PI / 2, 32, 'YZ', '#00ff00');  // 90° arc in YZ plane
scene.add(arcXY);
scene.add(arcXZ);
scene.add(arcYZ);


// Axes lengths (positive and negative)
const axisLength = 5;
const tickSpacing = 1;

// Helper function to create text sprite
function makeTextSprite(message, color = 'black') {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    context.font = '48px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, size / 2, size / 2);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.5, 1); // Adjust size
    return sprite;
}

// Function to draw axis with labels
function createLabeledAxis(dir, color) {
    const material = new THREE.LineBasicMaterial({ color });
    const points = [ new THREE.Vector3().copy(dir).multiplyScalar(-axisLength), new THREE.Vector3().copy(dir).multiplyScalar(axisLength)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Add tick labels
    for (let i = -axisLength; i <= axisLength; i++) {
        if (i === 0) continue; // Skip origin
        const label = makeTextSprite(`${i}`, color);
        const position = new THREE.Vector3().copy(dir).multiplyScalar(i);
        label.position.copy(position);
        scene.add(label);
    }
}

// Create X, Y, Z labeled axes
createLabeledAxis(new THREE.Vector3(1, 0, 0), 'red');
createLabeledAxis(new THREE.Vector3(0, 1, 0), 'green');
createLabeledAxis(new THREE.Vector3(0, 0, 1), 'blue');

// Usage
//const symmetricAxes = createSymmetricAxes(2);
//scene.add(symmetricAxes);

// Add thin rectangular box in center
const geometry = new THREE.BoxGeometry(0.5, 0.05, 1);  // width, height, depth,  X, Y, Z

const textureTop = new THREE.TextureLoader().load('/img/phoneTop.png');
const textureBack = new THREE.TextureLoader().load('/img/phoneBack.png');
const textureSides = new THREE.TextureLoader().load('/img/phoneSide.png');
// Flip V on back face
textureBack.flipY = false;

const matTop = new THREE.MeshBasicMaterial({ map: textureTop });
const matBack = new THREE.MeshBasicMaterial({ map: textureBack });
const matSides = new THREE.MeshBasicMaterial({ map: textureSides });

const materials = [
    matSides, // +X
    matSides, // -X
    matTop, // +Y
    matBack, // -Y
    matSides, // +Z
    matSides // -Z
];
const box = new THREE.Mesh(geometry, materials);
scene.add(box);

// Lighting (optional, not strictly needed for MeshBasicMaterial)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);


const gridHelper = new THREE.GridHelper(10, 20); 
gridHelper.position.y = -2;
scene.add(gridHelper);


drawCursor = function (){

    cursorElement.innerHTML = "X:" + cursor.oriX + " | Y:" + cursor.oriY;
    canvas = $('canvas')[0];
    if(canvas){
        var w = canvas.width;
	    var h = canvas.height;
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, w, h);
        var p = 10;

        const x = +cursor.oriX ;
        const y = +cursor.oriY ;
        if(x > 0 && y > 0){
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
	//window.requestAnimationFrame(drawCursor);

}
registerAnimationCallback(() => {
    drawCursor();
});

var fpsOrientation = 60;
var fpsMotion = 24;
var eventListenTimeMs = Math.floor(1000 / fpsOrientation);
var eventListenTimeMs2 = Math.floor(1000 / fpsMotion);
const throttledHandler1 = throttle(handleEvent, eventListenTimeMs);
const throttledHandler2 = throttle(handleEvent2, eventListenTimeMs2);

window.addEventListener("deviceorientation", throttledHandler1);
window.addEventListener("devicemotion", throttledHandler2);

function handleEvent(event) {
    //console.log('Event fired at', Date.now(), event);
    handleOrientation(event);
}

function handleEvent2(event) {
    //console.log('Event fired at', Date.now(), event);
    handleMotion(event);
}


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

function isVisible(elem) {
    return !!(elem && elem.offsetParent !== null);
}

function handleOrientation(event) {
    if(isVisible($('#controller')[0])){
        incrementEventCount();
        if(resetZero){
            setOrientationDefault(event);
            resetZero = false;
        }
        translateToCursor(event);
    }
}

function handleMotion(event) {
    if(isVisible($('#controller')[0])){
        incrementMotionEventCount();
        translateMotion(event);
    }
    translateMotion(event);
}



function incrementEventCount(){
    let counterElement = document.getElementById("num-observed-events")
    let eventCount = parseInt(counterElement.innerHTML)
    counterElement.innerHTML = eventCount + 1;
 
}

function incrementMotionEventCount(){
    let counterElement = document.getElementById("num-observed-events-motion")
    let eventCount = parseInt(counterElement.innerHTML)
    counterElement.innerHTML = eventCount + 1;
 
}

function updateFieldIfNotNull(fieldName, value){
    if (value != null)
        document.getElementById(fieldName).innerHTML = value;
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
    $('#clickRegister')[0].innerHTML = "Clicked! x:" + msg.oriX + ", y:" + msg.oriY;
    $('#clickRegister').show();

    const interval = setInterval(() => {
        displayClickTimer--;
        if (displayClickTimer <= 0) {
          clearInterval(interval);
          $('#clickRegister').hide();

        }
    }, 1000);
}

changePointerSensitivity = function(){
    socket.emit('update_pointer_sensitivity', $('#pointerSensitivity')[0].value);
}

pointerSensitivityRegistered = function(msg){
    console.log("sensitivity:" + msg);
    pointerSensitivity = msg;
}

movementSensitivityRegistered = function(msg){
    console.log("sensitivity:" + msg);
    movementSensitivity = msg;
}

setOrientationDefault = function(event){
    orientationMap.oriX = event.beta.toFixed(2);
    orientationMap.oriY = event.gamma.toFixed(2);
    orientationMap.oriZ = event.alpha.toFixed(2);
    cursor.oriX = canvas.width/2;
    cursor.oriY = canvas.height/2;
    socket.emit('orientation_reset', orientationMap);
}

drawCursor();
connect();
onResize();

translateMotion = function(event){
      
    let precision = 1;

    let acgX = (event.accelerationIncludingGravity.x)//.toFixed(precision);
    let acgY = (event.accelerationIncludingGravity.y)//.toFixed(precision);
    let acgZ = (event.accelerationIncludingGravity.z)//.toFixed(precision);
    let accX = (event.acceleration.x)//.toFixed(precision);
    let accY = (event.acceleration.y)//.toFixed(precision);
    let accZ = (event.acceleration.z)//.toFixed(precision);
    let gryX = (event.rotationRate.alpha)//.toFixed(precision);
    let gryY = (event.rotationRate.beta)//.toFixed(precision);
    let gryZ = (event.rotationRate.gamma)//.toFixed(precision);

    if(isNumeric(accX)){
        accX = accX.toFixed(precision); 
        updateFieldIfNotNull('Accelerometer_x', accX);
        cursor.accX = accX;
    }
    if(isNumeric(accY)){
        accY = accY.toFixed(precision); 
        updateFieldIfNotNull('Accelerometer_y', accY);
        cursor.accY = accY;
    }
    if(isNumeric(accZ)){
        accZ = accZ.toFixed(precision); 
        updateFieldIfNotNull('Accelerometer_z', accZ);
        cursor.accZ = accZ;
    }
    if(isNumeric(acgX)){
        acgX = acgX.toFixed(precision); 
        updateFieldIfNotNull('Accelerometer_gx', acgX);
        cursor.acgX = acgX;
    }
    if(isNumeric(acgY)){
        acgY = acgY.toFixed(precision); 
        updateFieldIfNotNull('Accelerometer_gy', acgY);
        cursor.acgY = acgY;
    }
    if(isNumeric(acgZ)){
        acgZ = acgZ.toFixed(precision); 
        updateFieldIfNotNull('Accelerometer_gz', acgZ);
        cursor.acgZ = acgZ;
    }
    if(isNumeric(gryX)){
        gryX = gryX.toFixed(precision); 
        updateFieldIfNotNull('Gyroscope_x', gryX);
        cursor.gryX = gryX;
    }
    if(isNumeric(gryY)){
        gryY = gryY.toFixed(precision); 
        updateFieldIfNotNull('Gyroscope_y', gryY);
        cursor.gryY = gryY;
    }
    if(isNumeric(gryZ)){
        gryZ = gryZ.toFixed(precision); 
        updateFieldIfNotNull('Gyroscope_z', gryZ);
        cursor.gryZ = gryZ;
    }

}

function isNumeric(num){
    if(num == null){
        return false;
    }
    return !isNaN(num);
  }

const degToRad = degrees => degrees * (Math.PI / 180);


const springConstant = 100.0;              // How strongly it snaps back to center
const damping = 0.9;                     // How much to smooth jitter
const accelerationScale = 50.0;           // How sensitive movement is to jolts
const maxDistance = 10.0;                 // Optional: limit how far it can drift


const velocity = new THREE.Vector3();    // Integrated velocity
const position = new THREE.Vector3();  

moveBox = function (){
    let threshold = 0.5;

    const smoothingFactor = 0.1; // Tune this

    let x = (+cursor.x).toFixed(2);
    let y = (+cursor.y).toFixed(2);
    let z = (+cursor.z).toFixed(2);
    let priorCursor = JSON.parse(JSON.stringify(cursor));

    let xm = (+cursor.accX) / movementSensitivity;
    let ym = (+cursor.accY) / movementSensitivity;
    let zm = (+cursor.accZ ) / movementSensitivity;

    if(xm != null && ym != null && zm != null){
        const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), degToRad(x));
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(y));
        const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), degToRad(z));

        // Combine in WORLD order you want (X then Y then Z — or any other)
        // Important: multiplying in **reverse of intuitive order**
        const combinedQuat = new THREE.Quaternion();
        combinedQuat.multiply(qz).multiply(qy).multiply(qx);

        box.quaternion.slerp(combinedQuat, smoothingFactor);

        /*
        var dx= box.position.x + xm;
        var dy = box.position.y + ym;
        var dz = box.position.z + zm;
        */

        const accelerationInput = new THREE.Vector3(ym, zm, xm);
        
        const deltaTime = clock.getDelta(); // seconds since last frame
        
        // 1. Apply acceleration input (controller jolt)
        velocity.addScaledVector(accelerationInput, accelerationScale * deltaTime);

        // 2. Apply centering force toward (0,0,0)
        const centeringForce = position.clone().multiplyScalar(-springConstant * deltaTime);
        velocity.add(centeringForce);

        // 3. Apply damping to velocity (smooth motion)
        velocity.multiplyScalar(damping);

        // 4. Integrate velocity into position
        position.addScaledVector(velocity, deltaTime);

        // 5. Clamp max distance (optional)
        if (position.length() > maxDistance) {
            position.setLength(maxDistance);
        }
    
        box.position.lerp(position, smoothingFactor);
    }
}

registerAnimationCallback(() => {
    moveBox();
});

translateToCursor = function(event){
    
    var previousX = +cursor.oriX;
    var previousY = +cursor.oriY;
    var previousZ = +cursor.oriZ;

    xDelta = event.beta.toFixed(2) - orientationMap.oriX;
    zDelta = event.alpha.toFixed(2) - orientationMap.oriZ;
    cursor.oriY = ((canvas.height/2) - (xDelta * pointerSensitivity)).toFixed(0); //need to swap y for X for plane mapping
    cursor.oriX = ((canvas.width/2) - (zDelta  * pointerSensitivity)).toFixed(0); //need to swap x for Z for plane mapping

    cursor.x = event.beta.toFixed(2);  // -180 -> 180
    cursor.z = event.gamma.toFixed(2) * -1; // -90 -> 90   flip z and y but modify
    cursor.y = event.alpha.toFixed(2); // 0 -> 360 

    if(previousX != cursor.oriX || previousY != cursor.oriY){
    //if(true){
        updateFieldIfNotNull('Orientation_a', event.alpha.toFixed(2)); //z-axis, across
        updateFieldIfNotNull('Orientation_b', event.beta.toFixed(2)); //x-axis, up and down
        updateFieldIfNotNull('Orientation_g', event.gamma.toFixed(2)); 
        socket.emit('update_cursor', cursor);
    }else{
        //console.log("No movement");
    }
    
}




// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'l') {  // press L (case-insensitive)
      isCameraLocked = !isCameraLocked;
      controls.enabled = !isCameraLocked;
  
      console.log(`Camera ${isCameraLocked ? 'LOCKED' : 'UNLOCKED'}`);
      console.log(`Position: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`);
      console.log(`Rotation (radians): x=${camera.rotation.x.toFixed(2)}, y=${camera.rotation.y.toFixed(2)}, z=${camera.rotation.z.toFixed(2)}`);
    }
  });


function toggleThreeJSContainer(show) {
    if (show) {
        gameContainer.style.display = 'block';

        // Ensure canvas & camera resize correctly
        const width = gameContainer.clientWidth;
        const height = gameContainer.clientHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    } else {
        gameContainer.style.display = 'none';
    }   
}