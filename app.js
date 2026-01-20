import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { createSciFiWorld } from "./sci-fi.js";

const video = document.getElementById("cam");
const canvas = document.getElementById("three");

// Camera feed
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
});

// Three.js scene
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.z = 6;

const { earth, ring } = createSciFiWorld(scene);

// Gestures
let rotX = 0, rotY = 0, zoom = 6;

// Mediapipe Hand
const hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});
hands.setOptions({ maxNumHands: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });

// On results
hands.onResults(res => {
    if (!res.multiHandLandmarks) return;

    const finger = res.multiHandLandmarks[0][8];
    rotX = (finger.y - 0.5) * 2;
    rotY = (finger.x - 0.5) * 2;
});

// Camera loop
const camFeed = new Camera(video, {
    onFrame: async () => { await hands.send({ image: video }); },
    width: 640, height: 480
});
camFeed.start();

// Animation
(function animate(){
    earth.rotation.y += rotY * 0.02;
    earth.rotation.x += rotX * 0.02;
    ring.rotation.z += 0.01;

    camera.position.z = zoom;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
})();
