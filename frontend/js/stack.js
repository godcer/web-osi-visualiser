
export class EncapsulationStack {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isPlaying = false;
        this.helixGroup = null;
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.classList.add('helix-stage');
        this.buildHelix();
    }

    async play(uiContext) {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (uiContext) uiContext.log("Initiating Sequence...", "info");

        // Trigger Single Rotation
        this.container.classList.remove('scanning');
        void this.container.offsetWidth; // Force Reflow
        this.container.classList.add('scanning');

        const layers = ['l7', 'l6', 'l5', 'l4', 'l3', 'l2'];

        // Lighting up layers sequence
        for (let id of layers) {
            const plate = this.container.querySelector(`.helix-plate.${id}`);
            if (plate) {
                plate.classList.add('active');
                // Flash effect
                plate.style.textShadow = "0 0 20px currentColor";
                await this.delay(600);
                plate.classList.remove('active');
                plate.style.textShadow = "";
            }
        }

        if (uiContext) uiContext.log("Data Stream Active.", "success");
        await this.delay(1000);
        this.container.classList.remove('hyper-speed');
        this.isPlaying = false;
    }

    buildHelix() {
        // Create 3D Container
        const pivot = document.createElement('div');
        pivot.className = 'helix-pivot';
        this.container.appendChild(pivot);

        // Layers Data
        const layers = [
            { id: 'l7', text: 'L7 APP', color: '#a855f7', bits: '48 54 54 50' },
            { id: 'l6', text: 'L6 PRES', color: '#6366f1', bits: '53 53 4C 56' },
            { id: 'l5', text: 'L5 SESS', color: '#3b82f6', bits: '41 55 54 48' },
            { id: 'l4', text: 'L4 TCP', color: '#06b6d4', bits: '53 59 4E 00' },
            { id: 'l3', text: 'L3 IP', color: '#10b981', bits: 'C0 A8 01 01' },
            { id: 'l2', text: 'L2 ETH', color: '#f97316', bits: 'FF FF FF FF' }
        ];

        // Build 2 Strands (Left and Right)
        const strandA = document.createElement('div');
        strandA.className = 'helix-strand strand-a';

        const strandB = document.createElement('div');
        strandB.className = 'helix-strand strand-b';

        pivot.appendChild(strandA);
        pivot.appendChild(strandB);

        // Fill Strands with "Code Rain"
        this.fillStrand(strandA);
        this.fillStrand(strandB);

        // Build the "Rungs" (Layers)
        layers.forEach((layer, index) => {
            const plate = document.createElement('div');
            plate.className = `helix-plate ${layer.id}`;
            plate.innerHTML = `
                <span class="plate-id" style="color:${layer.color}">${layer.text}</span>
                <span class="plate-bits">${layer.bits}</span>
            `;
            // Position vertically
            const y = (index * 60) - 150; // Spread from -150 to +150
            plate.style.transform = `translateY(${y}px) translateZ(0px)`;
            pivot.appendChild(plate);
        });
    }

    fillStrand(strand) {
        // Generate random hex stream
        let html = '';
        for (let i = 0; i < 20; i++) {
            const hex = Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0');
            const opacity = Math.random();
            html += `<div style="opacity:${0.2 + opacity * 0.8}">${hex}</div>`;
        }
        strand.innerHTML = html;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
