import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

const video = document.getElementById("cam");
const canvas = document.getElementById("three");

// Start camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
});

// Three.js setup
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.z = 3;

// Object
const object = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({ wireframe: true, color: 0x33ffdd })
);
scene.add(object);

// Resize
addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
});

// Mediapipe Hands
const hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});
hands.setOptions({
    maxNumHands: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

// On hand tracking result
hands.onResults(res => {
    if (!res.multiHandLandmarks) return;

    const finger = res.multiHandLandmarks[0][8]; // index tip

    // Convert Mediapipe coords → 3D coords
    const x = (finger.x - 0.5) * 4;
    const y = -(finger.y - 0.5) * 4;

    object.position.x = x;
    object.position.y = y;
});

// Attach mediapipe to camera
const camFeed = new Camera(video, {
    onFrame: async () => { await hands.send({ image: video }); },
    width: 640, height: 480
});
camFeed.start();

// Render loop
(function animate(){
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
})();
