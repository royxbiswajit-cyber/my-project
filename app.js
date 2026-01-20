const video = document.getElementById("cam");

navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{
    video.srcObject = stream;
});

/* THREE INIT */
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('three'), antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0,2,7);

/* LIGHT */
const light = new THREE.PointLight(0x00ccff, 3, 100);
light.position.set(0,2,5);
scene.add(light);

/* HOLOGRAM EARTH */
const earthGeo = new THREE.SphereGeometry(2, 32, 32);
const earthMat = new THREE.MeshBasicMaterial({
    wireframe:true,
    color:0x00ccff
});
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

/* RINGS */
function ring(radius, speed){
    const geo = new THREE.RingGeometry(radius, radius+0.02, 128);
    const mat = new THREE.MeshBasicMaterial({
        color:0x00ccff,
        side:THREE.DoubleSide,
        wireframe:true
    });
    const m = new THREE.Mesh(geo,mat);
    m.rotation.x = Math.PI/2;
    m.userData.speed = speed;
    return m;
}

const ring1 = ring(2.6,0.01);
const ring2 = ring(3.2,0.02);
scene.add(ring1, ring2);

/* TEXT — BISWAJIT RO */
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',font=>{
    const geo = new THREE.TextGeometry('BISWAJIT RO',{
        font:font,
        size:0.35,
        height:0.01
    });
    const mat = new THREE.MeshBasicMaterial({color:0x00ccff});
    const text = new THREE.Mesh(geo,mat);
    text.position.set(-1.7,0,0);
    scene.add(text);
});

/* HAND TRACK */
let hx=0, hy=0, hz=0;

const hands = new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
hands.setOptions({maxNumHands:1,modelComplexity:1});
hands.onResults(res=>{
    if(!res.multiHandLandmarks) return;
    const p=res.multiHandLandmarks[0][9];
    hx = (p.x-0.5)*2;
    hy = (p.y-0.5)*2;
    hz = p.z;
});
const cam1 = new Camera(video,{onFrame:async()=>{await hands.send({image:video});}});
cam1.start();

/* FACE WIREFRAME */
const face = new FaceMesh({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`});
face.setOptions({maxNumFaces:1});
face.onResults(()=>{ /* hologram face projection here */ });
const cam2 = new Camera(video,{onFrame:async()=>{await face.send({image:video});}});
cam2.start();

/* LOOP */
function loop(){
    requestAnimationFrame(loop);

    earth.rotation.y += 0.002 + hx*0.02;
    earth.rotation.x += hy*0.01;

    ring1.rotation.z += ring1.userData.speed + hx*0.01;
    ring2.rotation.z -= ring2.userData.speed + hy*0.01;

    camera.position.z = 7 + hz*10;
    camera.lookAt(0,0,0);

    renderer.render(scene,camera);
}
loop();

window.onresize=()=>{
    renderer.setSize(innerWidth,innerHeight);
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
};
