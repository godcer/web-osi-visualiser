export class EncapsulationStack {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.boxes = [];
        this.isPlaying = false;
        this.currentStackGroup = null; // Container for the growing stack
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.boxes = [];
        // No pre-creation. We create on the fly or hidden.
        // Actually, let's create them hidden to ensure assets are ready.
        // We will define properties here but create DOM elements in play() or creating a group.
    }

    reset() {
        this.container.innerHTML = '';
        this.isPlaying = false;
        this.currentStackGroup = null;
    }

    async play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.container.innerHTML = ''; // Specific clear

        // Define Layer Data
        const layers = [
            { id: 'l7', text: 'L7 APP', colorClass: 'box-l7' },
            { id: 'l6', text: 'L6 PRES', colorClass: 'box-l6' },
            { id: 'l5', text: 'L5 SESS', colorClass: 'box-l5' },
            { id: 'l4', text: 'L4 TCP', colorClass: 'box-l4' },
            { id: 'l3', text: 'L3 IP', colorClass: 'box-l3' },
            { id: 'l2', text: 'L2 ETH', colorClass: 'box-l2' }
        ];

        // Create the initial "Payload" (L7)
        let currentPayload = this.createBox(layers[0]);
        await this.entranceAnimation(currentPayload);

        // Iterate through layers 1 to 5 (L6 to L2)
        for (let i = 1; i < layers.length; i++) {
            await this.delay(800);

            // 1. Create the New Outer Shell (centered, slightly larger than current payload's visual size)
            // But to do the fractal effect:
            // We turn the 'currentPayload' into a 'Payload Block'
            // We create a NEW Box that will contain the Current Payload.

            const outerShell = this.createBox(layers[i]);
            // Temporarily invisible or scaled up?
            // Let's make it appear "behind" or "surrounding"
            outerShell.style.opacity = '0';
            outerShell.style.transform = 'scale(1.2)';

            // 2. Animate the current payload shrinking to fit
            currentPayload.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            currentPayload.style.transform = 'scale(0.7)';
            currentPayload.style.zIndex = parseInt(currentPayload.style.zIndex || 10) + 1; // Keep inner on top? No, inner is inside.
            // visual: [ Outer [ Inner ] ]
            // Actually, HTML-wise: Outer must contain Inner? 
            // Or we just overlay them using absolute positioning (Russian Doll style)?

            // Better approach: DOM Nesting.
            // Move currentPayload INSIDE outerShell.

            // Wait for shrink
            // await this.delay(300); 

            // Prepare Outer Shell appearance
            outerShell.appendChild(currentPayload);
            // Now currentPayload is child. Reset its positioning to be "centered" relative to parent?
            // Flexbox on .stack-box handles centering!
            // But scale(0.7) makes it small.

            // Animate Outer Shell In
            outerShell.style.opacity = '1';
            outerShell.style.transform = 'scale(1)';
            outerShell.classList.add('snap-effect'); // Flash parent

            // Update reference
            currentPayload = outerShell;

            // Wait before next
        }

        this.isPlaying = false;
    }

    createBox(layerInfo) {
        const div = document.createElement('div');
        div.className = `stack-box ${layerInfo.colorClass}`;

        // Label Container (to ensure text stays legible and at top)
        const label = document.createElement('div');
        label.className = 'layer-label';
        label.innerText = layerInfo.text;
        div.appendChild(label);

        // Base Styling
        // We don't set fixed WH here, we let CSS handle sizing or set a base.
        // To allow nesting, we set dimensions.
        div.style.width = '240px';
        div.style.height = '100px';
        div.style.zIndex = '1'; // Base
        div.style.position = 'absolute'; // For the root one?
        // Actually for recursion, position relative is better?
        // Let's try: Root is absolute centered. Children are static/flex centered.

        // But wait, if we nest, the width constraint applies.
        // visual: Outer (240px) -> Inner (scaled 0.7 = 168px).
        // This works perfectly.

        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.justifyContent = 'center'; // Center the payload
        div.style.alignItems = 'center';

        // If it's the root, center it in container
        if (!div.parentElement) {
            this.container.appendChild(div);
            // Center in container
            div.style.left = '50%';
            div.style.top = '50%';
            div.style.marginLeft = '-120px'; // Half width
            div.style.marginTop = '-50px'; // Half height
        }

        return div;
    }

    async entranceAnimation(element) {
        // Pop in
        element.style.opacity = '0';
        element.style.transform = 'scale(0.5)';

        // Trigger reflow
        void element.offsetWidth;

        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
        element.classList.add('snap-effect');

        return new Promise(resolve => setTimeout(resolve, 500));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
