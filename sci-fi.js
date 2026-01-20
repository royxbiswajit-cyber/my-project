import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

export function createSciFiWorld(scene) {

    // Grid ground
    const grid = new THREE.GridHelper(50, 100, 0x00ffff, 0x003355);
    grid.position.y = -2;
    scene.add(grid);

    // Earth sphere
    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshBasicMaterial({ wireframe: true, color: 0x00ffff })
    );
    scene.add(earth);

    // Rings
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.02, 16, 128),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
    );
    scene.add(ring);

    // Name tag
    const loader = new THREE.FontLoader();
    loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", font => {
        const text = new THREE.Mesh(
            new THREE.TextGeometry("BISWAJIT RO", { size: 0.3, height: 0.02, font }),
            new THREE.MeshBasicMaterial({ color: 0x00ffff })
        );
        text.position.set(-1.2, -1.5, 0);
        scene.add(text);
    });

    return { earth, ring };
}
