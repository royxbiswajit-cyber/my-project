import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { createSciFiWorld } from "./sci-fi.js";

const video = document.getElementById("cam");
const canvas = document.getElementById("three");

// Start camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => video.srcObject = stream);

// Renderer & scene
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 6;

// Create world
const { earth, ring1, ring2, face } = createSciFiWorld(scene);

// Hand motion variables
let rotX = 0, rotY = 0;
let zoom = 6;

// Mediapipe Hands
const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
hands.setOptions({ maxNumHands: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });

// Map hand to rotation & zoom
hands.onResults(res => {
    if (!res.multiHandLandmarks) return;

    const finger = res.multiHandLandmarks[0][8];

    // Map finger to rotation
    const targetRotX = (finger.y - 0.5) * 5;
    const targetRotY = (finger.x - 0.5) * 5;
    rotX += (targetRotX - rotX) * 0.2;
    rotY += (targetRotY - rotY) * 0.2;

    // Pinch for zoom
    const thumb = res.multiHandLandmarks[0][4];
    const dx = finger.x - thumb.x;
    const dy = finger.y - thumb.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    zoom = 6 - (distance - 0.05) * 10; // adjust zoom scaling
    if (zoom < 3) zoom = 3;
    if (zoom > 10) zoom = 10;
});

// Connect camera to mediapipe
const camFeed = new Camera(video, { onFrame: async () => await hands.send({ image: video }), width: 640, height: 480 });
camFeed.start();

// Animate
(function animate() {
    earth.rotation.y += 0.01 + rotY * 0.02;
    earth.rotation.x += rotX * 0.02;
    ring1.rotation.z += 0.01;
    ring2.rotation.z -= 0.01;
    camera.position.z = zoom;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
})();

// Resize
window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
});
