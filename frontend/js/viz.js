
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class Viz {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        this.nodes = [];
        this.particles = [];

        this.initScene();
        this.animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            if (!this.container) return;
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }

    initScene() {
        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Grid (Cyberpunk style)
        const gridHelper = new THREE.GridHelper(50, 50, 0x1e293b, 0x0f172a);
        this.scene.add(gridHelper);

        // Nodes (Client -> Shield -> Cloud -> Server)
        this.createNode(-10, 0, 0, 0x3b82f6, "Client");
        this.createNode(-3, 0, 0, 0xf59e0b, "Firewall");
        this.createNode(3, 0, 0, 0x10b981, "Gateway");
        this.createNode(10, 0, 0, 0x8b5cf6, "Server");

        // Connections
        this.createConnection(new THREE.Vector3(-10, 0, 0), new THREE.Vector3(-3, 0, 0));
        this.createConnection(new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0));
        this.createConnection(new THREE.Vector3(3, 0, 0), new THREE.Vector3(10, 0, 0));

        this.camera.position.z = 15;
        this.camera.position.y = 5;
        this.camera.lookAt(0, 0, 0);
    }

    createNode(x, y, z, color, label) {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.2,
            wireframe: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        this.scene.add(sphere);
        this.nodes.push(sphere);

        // Inner Core
        const coreGeom = new THREE.IcosahedronGeometry(0.5, 0);
        const coreMat = new THREE.MeshBasicMaterial({ color: color });
        const core = new THREE.Mesh(coreGeom, coreMat);
        sphere.add(core);

        // TODO: Add Label Sprite
    }

    createConnection(start, end) {
        const material = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
        const points = [];
        points.push(start);
        points.push(end);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
    }

    spawnParticle() {
        // Create a data packet particle traveling through the nodes
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const particle = new THREE.Mesh(geometry, material);

        particle.position.set(-10, 0, 0); // Start at Client
        this.scene.add(particle);

        this.particles.push({
            mesh: particle,
            path: [-10, 10], // x range
            speed: 0.1 + Math.random() * 0.1
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate nodes
        this.nodes.forEach(node => {
            node.rotation.x += 0.005;
            node.rotation.y += 0.005;
        });

        // Move particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.mesh.position.x += p.speed;

            // Pulse effect
            p.mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.3);

            if (p.mesh.position.x > p.path[1]) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }

        // Randomly spawn particles
        if (Math.random() > 0.98) {
            this.spawnParticle();
        }

        this.renderer.render(this.scene, this.camera);
    }
}
