
export class EncapsulationStack {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.boxes = [];
        this.isPlaying = false;
        this.currentStep = 0;
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = '';

        // Create Boxes (Initially Hidden/Positioned)
        this.dataBox = this.createBox('DATA (L7)', 'box-data', 0);
        this.tcpBox = this.createBox('TCP Header (L4)', 'box-tcp', 50);
        this.ipBox = this.createBox('IP Header (L3)', 'box-ip', 100);
        this.ethBox = this.createBox('Ethernet (L2)', 'box-eth', 150);

        this.boxes = [this.dataBox, this.tcpBox, this.ipBox, this.ethBox];
        this.reset();
    }

    createBox(text, className, topOffset) {
        const div = document.createElement('div');
        div.className = `stack-box ${className}`;
        div.innerText = text;
        div.style.top = '20px'; // Start top
        this.container.appendChild(div);
        return div;
    }

    reset() {
        this.boxes.forEach(box => {
            box.style.opacity = '0';
            box.style.top = '20px';
            box.style.transform = 'scale(1)';
        });
        this.currentStep = 0;
        this.isPlaying = false;
    }

    async play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.reset();

        // Step 1: Data Appears
        await this.animateBox(this.dataBox, 40, 1);

        // Step 2: Drop into TCP is visualized by TCP appearing around it and both moving down
        await this.delay(800);
        await this.animateBox(this.tcpBox, 100, 1);
        this.dataBox.style.top = '110px'; // Move data inside TCP visually
        this.dataBox.style.zIndex = 11;

        // Step 3: IP
        await this.delay(800);
        await this.animateBox(this.ipBox, 180, 1);
        this.tcpBox.style.top = '190px';
        this.dataBox.style.top = '200px';

        // Step 4: Ethernet
        await this.delay(800);
        await this.animateBox(this.ethBox, 280, 1);
        this.ipBox.style.top = '290px';
        this.tcpBox.style.top = '300px';
        this.dataBox.style.top = '310px';

        this.isPlaying = false;
    }

    animateBox(element, top, opacity) {
        return new Promise(resolve => {
            element.style.opacity = opacity;
            element.style.top = `${top}px`;
            setTimeout(resolve, 600);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
