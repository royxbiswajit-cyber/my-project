const video = document.getElementById("cam");
const canvas3D = document.getElementById("three");

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video:true });
    video.srcObject = stream;
}
startCamera();

/* THREEJS INIT */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas3D,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera3D = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera3D.position.set(0, 2, 7);

scene.add(new THREE.AmbientLight(0x00ffff, 0.4));
scene.add(new THREE.PointLight(0x00ccff, 2));

/* EARTH */
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2, 48, 48),
    new THREE.MeshBasicMaterial({wireframe:true, color:0x00ccff})
);
scene.add(earth);

/* RINGS */
function ring(r, s){
    const m = new THREE.Mesh(
        new THREE.RingGeometry(r, r+0.03, 128),
        new THREE.MeshBasicMaterial({color:0x00ccff, wireframe:true, side:THREE.DoubleSide})
    );
    m.rotation.x = Math.PI / 2;
    m.userData.speed = s;
    return m;
}
const r1 = ring(2.6, 0.01);
const r2 = ring(3.2, 0.02);
scene.add(r1, r2);

/* NAME TEXT */
const loader = new THREE.FontLoader();
loader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    font => {
        const t = new THREE.Mesh(
            new THREE.TextGeometry("BISWAJIT RO", {font, size:0.35, height:0.005}),
            new THREE.MeshBasicMaterial({color:0x00ccff})
        );
        t.position.set(-1.7, 0, 0);
        scene.add(t);
    }
);

/* HAND INPUT */
let hx=0, hy=0, hz=0;
const hands = new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
hands.setOptions({maxNumHands:1, modelComplexity:1});

hands.onResults(r=>{
    if(!r.multiHandLandmarks) return;
    const p = r.multiHandLandmarks[0][9];
    hx = (p.x-0.5)*2;
    hy = (p.y-0.5)*2;
    hz = p.z;
});

let handsReady=false;
const camH = new Camera(video,{onFrame:async()=>{
    await hands.send({image:video});
    handsReady=true;
}});
camH.start();

/* FACE MESH */
const face = new FaceMesh({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`});
face.setOptions({maxNumFaces:1});

/* LOOP */
function tick(){
    requestAnimationFrame(tick);

    if(handsReady){
        earth.rotation.y += 0.003 + hx*0.02;
        earth.rotation.x += hy*0.01;
        r1.rotation.z += r1.userData.speed + hx*0.01;
        r2.rotation.z -= r2.userData.speed + hy*0.01;
        camera3D.position.z = 7 + hz*12;
        camera3D.lookAt(0,0,0);
    }

    renderer.render(scene, camera3D);
}
tick();

window.onresize = ()=>{
    renderer.setSize(innerWidth, innerHeight);
    camera3D.aspect = innerWidth/innerHeight;
    camera3D.updateProjectionMatrix();
};
