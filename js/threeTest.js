var renderer, scene, camera, controls, info;

var lines = [];
var MAX_POINTS = 500;
var drawCount;

var cameraX = 1;
var	cameraY = 1;
var	cameraZ = 400;
var cameraXi = 2 * (Math.random() * 10);
var	cameraYi = 2 * (Math.random() * 10);
var	cameraZi = 2 * (Math.random() * 10);
var cameraXflip = false;
var cameraYflip = false;
var cameraZflip = false;

var autoControl = true;
var focal = 40;

var numLines = 10;

init();
animate();

function init() {

	// info
	info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '30px';
	info.style.width = '100%';
	info.style.textAlign = 'left';
	info.style.color = '#fff';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';
	info.innerHTML = 'Press ~ to hide/show controls:<ul><li>a : toggle camera</li><li>- : less lines</li><li>+ : more lines</li><li>[ : decrease focal</li><li>] : increase focal</li><li>c : random bg color</li></ul>';

	document.body.appendChild( info );

	// renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	// camera
	camera = new THREE.PerspectiveCamera( focal, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( cameraX, cameraY, cameraZ );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	
	controls = new THREE.OrbitControls( camera );
	controls.update();
	makeLines(numLines);
}

function makeLines(numberOfLines){
	lines = []; //remove old lines
	scene.children = [];
	for(var i = 0; i < numberOfLines; i++){
		// geometry
		var geometry = new THREE.BufferGeometry();

		// attributes
		var positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		// drawcalls
		drawCount = 2; // draw the first 2 points, only
		geometry.setDrawRange( 0, drawCount );

		// material
		var material = new THREE.LineBasicMaterial();

		lines.push(new THREE.Line( geometry,  material ));
		lines[i].material.color.setHSL( Math.random(), 1, 0.5 );
		lines[i].material.lineWidth = Math.random() * 20;
		
		scene.add( lines[i] );
		
		updatePositions( lines[i] );
	}
}

// update positions
function updatePositions(thisLine) {

	var positions = thisLine.geometry.attributes.position.array;

	var i = x = y = z = index = 0;

	for (i = 0; i < MAX_POINTS; i ++ ) {

		positions[ index ++ ] = x;
		positions[ index ++ ] = y;
		positions[ index ++ ] = z;

		x += ( Math.random() - 0.5 ) * (Math.random() * 1000);
		y += ( Math.random() - 0.5 ) * (Math.random() * 1000);
		z += ( Math.random() - 0.5 ) * (Math.random() * 1000);

	}

}

// animate
function animate() {

	requestAnimationFrame( animate );

	drawCount = ( drawCount + 1 ) % MAX_POINTS;

	for(i=0;i < lines.length; i++){
		lines[i].geometry.setDrawRange( drawCount, drawCount + 5 );
		//lines[i].geometry.setDrawRange( 0, drawCount );
		
		//lines[i].geometry.attributes.position.needsUpdate = true;
	}
	
	if ( drawCount === 0 ) {
		// periodically, generate new data
		makeLines(numLines);
		
		cameraXi = 2 * (Math.random() * 10);
		cameraYi = 2 * (Math.random() * 10);
		cameraZi = 2 * (Math.random() * 10);

		cameraX = (( Math.random() - 0.5 ) * 2000);
		cameraY = (( Math.random() - 0.5 ) * 2000);
		cameraZ = ( (Math.random() - 0.5) * 2000);
		
		focal = (Math.random() * 30) ;
		camera.setFocalLength(focal);
		camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	}

	if(autoControl){
		if(cameraXflip == true){
			cameraX -= cameraXi;
			if(cameraX < -2000){
				cameraXflip = false;
			}
		}else{
			cameraX += cameraXi;
			if(cameraX > 2000){
				cameraXflip = true;
			}
		}
		
		if(cameraYflip == true ){
			cameraY -= cameraYi;
			if(cameraX < -2000){
				cameraYflip = false;
			}
		}else{
			cameraY += cameraYi;
			if(cameraY > 2000){
				cameraYflip = true;
			}
		}
		
		if(cameraZflip == true ){
			cameraZ -= cameraZi;
			if(cameraZ < -1500){
				cameraZflip = false;
			}		
		}else{
			cameraZ += cameraZi;
			if(cameraZ > 1500){
				cameraZflip = true;
			}
		}

		camera.position.set( cameraX, cameraY, cameraZ );
		
	}else{
		//controls.update() must be called after any manual changes to the camera's transform
		controls.update();
	}
	renderer.render( scene, camera );

}

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 65:
            autoControl = !autoControl;
            break;
		case 67:
			scene.background.setHSL( Math.random(), Math.random(), Math.random() );
			break;			
		case 187:
            numLines += 1;
            break;
		case 189:
            numLines -= 1;
            break;
		case 192:
            info.hidden = !(info.hidden);
            break;			
		case 219:
			focal -= 5;
            camera.setFocalLength(focal);
            break;
		case 221:
            focal += 5;
			camera.setFocalLength(focal);
            break;
    }
};