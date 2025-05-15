
// Set up scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

let isCameraLocked = false;
let animationFrame;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

function createSymmetricAxes(size) {
    const group = new THREE.Group();
    const materialX = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const materialY = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const materialZ = new THREE.LineBasicMaterial({ color: 0x0000ff });
  
    const pointsX = [ new THREE.Vector3(-size, 0, 0), new THREE.Vector3(size, 0, 0) ];
    const pointsY = [ new THREE.Vector3(0, -size, 0), new THREE.Vector3(0, size, 0) ];
    const pointsZ = [ new THREE.Vector3(0, 0, -size), new THREE.Vector3(0, 0, size) ];
  
    const geomX = new THREE.BufferGeometry().setFromPoints(pointsX);
    const geomY = new THREE.BufferGeometry().setFromPoints(pointsY);
    const geomZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
  
    group.add(new THREE.Line(geomX, materialX));
    group.add(new THREE.Line(geomY, materialY));
    group.add(new THREE.Line(geomZ, materialZ));
  
    return group;
}
  
  // Usage
  const symmetricAxes = createSymmetricAxes(2);
  scene.add(symmetricAxes);

// Add thin rectangular box in center
const geometry = new THREE.BoxGeometry(1, 0.05, 0.5);  // width, height, depth

const textureTop = new THREE.TextureLoader().load('/img/phoneTop.png');
const textureBack = new THREE.TextureLoader().load('/img/phoneBack.png');
const textureSides = new THREE.TextureLoader().load('/img/phoneSide.png');
const matTop = new THREE.MeshBasicMaterial({ map: textureTop });
const matBack = new THREE.MeshBasicMaterial({ map: textureBack });
const matSides = new THREE.MeshBasicMaterial({ map: textureSides });

const materials = [
  matSideA, // +X
  matSideA, // -X
  matTopBottom, // +Y
  matTopBottom, // -Y
  matSideB, // +Z
  matSideB, // -Z
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


// Animate
function animate() {
  renderer.render(scene, camera);
  animationFrame = requestAnimationFrame(animate);
}
animate();
//cancelAnimationFrame(animationFrame);

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