import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';

let model = "gorgoile"; // Default model to load
let param = "sommets_visibles_centered"; // Default parameter to visualize

// --- Scene Setup ---
const scene = new THREE.Scene();
// Set the background color to white
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight - 70), 0.1, 1000); // Adjust aspect ratio for buttons
const renderer = new THREE.WebGLRenderer({ antialias: true });
const viewerContainer = document.getElementById('viewer-container');
const loadingMessage = document.getElementById('loading-message');

renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
viewerContainer.appendChild(renderer.domElement);

// Add OrbitControls for user interaction (rotate, zoom, pan)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth out rotation
controls.dampingFactor = 0.25;

// Add some basic lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

camera.position.z = 5; // Initial camera position

// --- Model Loading ---
const loader = new PLYLoader();
let currentModel = null;

const modelPaths = {
    A: 'https://raw.githubusercontent.com/PelissierCombescure/PelissierCombescure.github.io/main/graphics/visapp/3d/gorgoile/sommets_visibles_centered.ply',
    B: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/ply/binary/Lucy100k.ply', // Example PLY model
    C: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/ply/ascii/dolphins.ply', // Example PLY model
    D: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/ply/ascii/face.ply' // Example PLY model
};

function loadModel(m, p) {
    // if (!modelPaths[modelKey]) {
    //     console.error(`Model path for key ${modelKey} not found.`);
    //     return;
    // }

    // Show loading message
    loadingMessage.style.display = 'block';

    // Remove previous model if it exists
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.geometry.dispose();
        currentModel.material.dispose();
    }

    let path = "https://raw.githubusercontent.com/PelissierCombescure/PelissierCombescure.github.io/main/graphics/visapp/3d/"+ m +"/"+ p +".ply";
    console.log("Loading model from path:", path);

    loader.load(
        path,
        function (geometry) {
            // Center the geometry
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            // Scale the model to fit in the view
            const size = new THREE.Vector3();
            geometry.boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim; // Adjust 3 to control desired size relative to camera
            geometry.scale(scale, scale, scale);

            // const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, flatShading: true });
            const material = new THREE.MeshStandardMaterial({
                vertexColors: true, // This is the crucial line!
                flatShading: true
            });
            currentModel = new THREE.Mesh(geometry, material);

            // Try rotating around the X-axis by 180 degrees (Math.PI radians)
            if (!(param === "eyes")) {
                currentModel.rotation.x = Math.PI;
            }

            if (model === 'bimba' && param === 'saliency_limper') {
                currentModel.rotation.x = Math.PI;
            }

            scene.add(currentModel);

            // Adjust camera to fit new model
            controls.target.set(0, 0, 0); // Reset target
            camera.position.set(0, 0, 5); // Reset camera position
            controls.update();

            // Hide loading message
            loadingMessage.style.display = 'none';
        },
        function (xhr) {
            // Optional: Progress callback
            const progress = (xhr.loaded / xhr.total) * 100;
            loadingMessage.textContent = `Loading 3D Model... ${progress.toFixed(2)}%`;
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error occurred while loading the model:', error);
            loadingMessage.textContent = 'Error loading model!';
        }
    );
}

// --- Event Listeners for Buttons ---
document.getElementById('buttonGorgoile').addEventListener('click', () =>{ model = 'gorgoile'; loadModel(model, param)});

document.getElementById('buttonModelBimba').addEventListener('click', () => { model = 'bimba'; loadModel(model); console.log(model); });
document.getElementById('buttonModelC').addEventListener('click', () => { model = 'C'; loadModel(model); });
document.getElementById('buttonModelD').addEventListener('click', () => { model = 'D'; loadModel(model); });

document.getElementById('buttonIntrinsicSaliency').addEventListener('click', () =>{ param = 'saliency_limper'; console.log("xx", model, param); loadModel(model, param); console.log("xx", model, param)});
document.getElementById('buttonVisibility').addEventListener('click', () =>{ param = "sommets_visibles_centered"; console.log(model, param); loadModel(model, param)});
document.getElementById('buttonEyeSurfaceVisibility').addEventListener('click', () =>{ param = "eyes"; console.log(model, param); loadModel(model, param)});

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Only required if controls.enableDamping or controls.autoRotate are set to true
    renderer.render(scene, camera);
}
animate();

// --- Handle Window Resizing ---
window.addEventListener('resize', () => {
    camera.aspect = viewerContainer.clientWidth / (viewerContainer.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
});

// Load initial model on page load
console.log("ccc", model, param)
loadModel(model, param);