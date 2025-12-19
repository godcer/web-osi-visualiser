
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
        this.explodedGroup = new THREE.Group();

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
        // Fog for depth
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0x3b82f6, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        // Cyber Grid Floor
        const gridHelper = new THREE.GridHelper(100, 100, 0x1e293b, 0x0f172a);
        this.scene.add(gridHelper);

        // Standard Graph Mode
        this.initGraphMode();
    }

    initGraphMode() {
        this.createNode(-10, 2, 0, 0x3b82f6, "Client");
        this.createNode(0, 2, 0, 0xf59e0b, "Network");
        this.createNode(10, 2, 0, 0x8b5cf6, "Server");

        // Simple Lines
        const material = new THREE.LineBasicMaterial({ color: 0x475569 });
        const points = [
            new THREE.Vector3(-10, 2, 0),
            new THREE.Vector3(10, 2, 0)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
    }

    toggleExplodedView(enable) {
        if (enable) {
            this.scene.clear(); // Clear graph
            this.initScene(); // Re-add lights/grid

            // Build Exploded Stack
            this.createLayerPlate(0, 6, 0, 0xa855f7, "App Data");
            this.createLayerPlate(0, 4, 0, 0x06b6d4, "TCP Header");
            this.createLayerPlate(0, 2, 0, 0x10b981, "IP Header");
            this.createLayerPlate(0, 0, 0, 0xf97316, "Ethernet");

            // Connection lines
            const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
            const points = [new THREE.Vector3(0, 6, 0), new THREE.Vector3(0, 0, 0)];
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat);
            this.scene.add(line);

            // Controls
            this.camera.position.set(5, 5, 10);
            this.camera.lookAt(0, 3, 0);

        } else {
            this.scene.clear();
            this.initScene(); // Re-init graph
        }
    }

    createLayerPlate(x, y, z, color, label) {
        const geometry = new THREE.BoxGeometry(4, 0.5, 4);
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: color }));
        line.position.set(x, y, z);

        // Inner Glass
        const mat = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.position.set(x, y, z);

        this.scene.add(line);
        this.scene.add(mesh);

        // Floating slightly
        this.nodes.push(line);
    }

    createNode(x, y, z, color, label) {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            wireframe: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        this.scene.add(sphere);
        this.nodes.push(sphere);
    }

    spawnAttackParticles() {
        for (let i = 0; i < 5; i++) {
            const geo = new THREE.SphereGeometry(0.1);
            const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const p = new THREE.Mesh(geo, mat);
            p.position.set((Math.random() - 0.5) * 20, (Math.random()) * 10, (Math.random() - 0.5) * 10);
            this.scene.add(p);
            this.particles.push({
                mesh: p,
                vel: new THREE.Vector3((Math.random() - 0.5) * 0.5, -0.1, (Math.random() - 0.5) * 0.5)
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate nodes
        this.nodes.forEach((node, idx) => {
            node.rotation.y += 0.01 * (idx % 2 === 0 ? 1 : -1);
        });

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.mesh.position.add(p.vel);
            if (p.mesh.position.y < 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}
