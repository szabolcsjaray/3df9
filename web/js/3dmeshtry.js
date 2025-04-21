var mesh;
var renderer;
var scene;
var camera;
var edges;

function init() {
    // Set up scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("t").appendChild(renderer.domElement);

    // 1. Define custom grid points (vertices)
    // Example: A 2x2 grid with custom heights
    const vertices = new Float32Array([
        // x, y, z coordinates
        0, 0, -0.3,    // Vertex 0 (bottom-left)
        1, 0, 0,    // Vertex 1 (bottom-right)
        0, 1, 1.5,  // Vertex 2 (top-left)
        1, 1, 0.2   // Vertex 3 (top-right)
    ]);

    // 2. Define edges by specifying triangle indices
    // Two triangles to form a quad: (0, 1, 2) and (1, 3, 2)
    const indices = new Uint16Array([
        0, 1, 2,    // First triangle
        1, 3, 2     // Second triangle
    ]);

    // 3. Create BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); // 3 values per vertex (x, y, z)
    geometry.setIndex(new THREE.BufferAttribute(indices, 1)); // 1 value per index

    // 4. Create material
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide, // Render both sides of the surface
        wireframe: false        // Set to true to see the edges
    });

    // 5. Create mesh
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 6. Optional: Add edges visualization
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    scene.add(edges);

    // 7. Position camera
    camera.position.set(1, 1, 2);
    camera.lookAt(0, 0, 0);


    animate();
}

let counter = 0;

// 8. Animation loop
function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.01;
    mesh.rotation.x += 0.02;
    edges.rotation.y += 0.01;
    edges.rotation.x += 0.02;
    renderer.render(scene, camera);
    counter++;
    if (counter % 100 == 0) {
        let d = new Date();
        console.log(counter + " - " + d.getSeconds() + "." + d.getMilliseconds());
    }
}

window.onload = init;