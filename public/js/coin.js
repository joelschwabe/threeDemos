var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.z = 100;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
var coin_sides_geo =  new THREE.CylinderGeometry( 10.0, 10.0, 1.0, 100.0, 10.0, true );
var coin_cap_geo = new THREE.Geometry();
var r = 10.0;
for (var i=0; i<100; i++) {
  var a = i * 1/100 * Math.PI * 2;
  var z = Math.sin(a);
  var x = Math.cos(a);
  var a1 = (i+1) * 1/100 * Math.PI * 2;
  var z1 = Math.sin(a1);
  var x1 = Math.cos(a1);
  coin_cap_geo.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(x*r, 0, z*r),
    new THREE.Vector3(x1*r, 0, z1*r)
  );
  coin_cap_geo.faceVertexUvs[0].push([
    new THREE.Vector2(0.5, 0.5),
    new THREE.Vector2(x/2+0.5, z/2+0.5),
    new THREE.Vector2(x1/2+0.5, z1/2+0.5)
  ]);
  coin_cap_geo.faces.push(new THREE.Face3(i*3, i*3+1, i*3+2));
}
coin_cap_geo.computeVertexNormals();
coin_cap_geo.computeFaceNormals();

var coin_sides_texture =  new THREE.TextureLoader().load('img/side.png');
var coin_cap_texture =  new THREE.TextureLoader().load('img/Bitcoin.png');

var coin_sides_mat =  new THREE.MeshBasicMaterial({map:coin_sides_texture});
var coin_sides =  new THREE.Mesh( coin_sides_geo, coin_sides_mat );

var coin_cap_mat = new THREE.MeshBasicMaterial({map:coin_cap_texture});
var coin_cap_top = new THREE.Mesh( coin_cap_geo, coin_cap_mat );
var coin_cap_bottom = new THREE.Mesh( coin_cap_geo, coin_cap_mat );

coin_cap_top.position.y = 0.5;
coin_cap_bottom.position.y = -0.5;
coin_cap_top.rotation.x = Math.PI;

var coin = new THREE.Object3D();
coin.add(coin_sides);
coin.add(coin_cap_top);
coin.add(coin_cap_bottom);

scene.add(coin);
var controls = new THREE.OrbitControls( camera, renderer.domElement ); //need that second param otherwise the controls are based off the window instead of the canvas
controls.update();	

var animate = function () {
	requestAnimationFrame( animate );

	coin.rotation.x += 0.1;
	coin.rotation.y += 0.07;

	renderer.render( scene, camera );
	controls.update();
};

animate();