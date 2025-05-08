// three.js animataed line using BufferGeometry

var renderer, scene, camera;

var line = [];
var MAX_POINTS = 600;
var drawCount;

var cameraX = 1;
var	cameraY = 1;
var	cameraZ = 400;
var cameraXi = 5;
var	cameraYi = 5;
var	cameraZi = 5;
var cameraXflip = false;
var cameraYflip = false;
var cameraZflip = false;
var numLines = 5;

init();
animate();

function init() {

	// info
	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.style.color = '#fff';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';

	document.body.appendChild( info );

	// renderer
	renderer = new THREE.WebGLRenderer({ antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();

	// camera
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( cameraX, cameraY, cameraZ );
	var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

	// line
	for(i =0; i < numLines; i++){

		var geometry = new THREE.Geometry();
		for( var j = 0; j < Math.PI; j += 2 * Math.PI / 100 ) {
			var v = new THREE.Vector3( Math.cos( j ), Math.sin( j ), 0 );
			geometry.vertices.push( v );
		}
		line.push(new MeshLine());
		line[i].setGeometry( geometry, function( p ) { return 2; } ); // makes width 2 * lineWidth
		var material = new MeshLineMaterial(
			{
			color: new THREE.Color( 'red' ),
			opacity: .5,
			resolution: resolution,
			sizeAttenuation: false,
			lineWidth: 10
			}
		);
		
		var mesh = new THREE.Mesh( line[i].geometry, material ); // this syntax could definitely be improved!
		scene.add( mesh );
	}

}

// update positions
function updatePositions(thisLine) {

	var positions = thisLine.geometry.attributes.position.array;

	var x = y = z = index = 0;

	for ( var i = 0; i < MAX_POINTS; i ++ ) {

		positions[ index ++ ] = x;
		positions[ index ++ ] = y;
		positions[ index ++ ] = z;

		x += ( Math.random() - 0.5 ) * 100;
		y += ( Math.random() - 0.5 ) * 100;
		z += ( Math.random() - 0.5 ) * 100;

	}

}


// animate
function animate() {

	requestAnimationFrame( animate );

	drawCount = ( drawCount + 1 ) % MAX_POINTS;

	for(i=0;i < numLines; i++){
		line[i].geometry.setDrawRange( drawCount, drawCount + 5 );
		
		line[i].geometry.attributes.position.needsUpdate = true;
	}
	
	if ( drawCount === 0 ) {
		// periodically, generate new data
		for(i=0;i < numLines; i++){
			updatePositions(line[i]);
		}
		
		cameraX = (( Math.random() - 0.5 ) * 100);
		cameraY = (( Math.random() - 0.5 ) * 100);
		cameraZ = ( (Math.random() - 0.5) * 100);
	}

	if(cameraXflip == true){
		cameraX -= cameraXi;
		if(cameraX < 0){
			cameraZflip = false;
		}
	}else{
		cameraX += cameraXi;
		if(cameraX > 300){
			cameraZflip = true;
		}
	}
	console.log("cameraX:" + cameraX);
	
	if(cameraYflip == true ){
		cameraY -= cameraYi;
		if(cameraX < 0){
			cameraZflip = false;
		}
	}else{
		cameraY += cameraYi;
		if(cameraY > 300){
			cameraZflip = true;
		}
	}
	console.log("cameraY:" + cameraY);
	
	if(cameraZflip == true ){
		cameraZ -= cameraZi;
		if(cameraZ < 0){
			cameraZflip = false;
		}		
	}else{
		cameraZ += cameraZi;
		if(cameraZ > 300){
			cameraZflip = true;
		}
	}
	console.log("cameraZ:" + cameraZ);
	
	camera.position.set( cameraX, cameraY, cameraZ );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	renderer.render( scene, camera );

}
