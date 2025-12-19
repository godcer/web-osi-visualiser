
import { API } from './api.js';
import { UI } from './ui.js';
import { Viz } from './viz.js';
import { EncapsulationStack } from './stack.js';
import { AttackSim } from './attack.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core Systems
    const ui = new UI();
    ui.init();

    const viz = new Viz('viz-container');
    const stack = new EncapsulationStack('stack-container');
    stack.init();

    const attackSim = new AttackSim(ui, viz);

    // Default: Activation of Holographic Inspector
    window.holoActive = true;
    setTimeout(() => {
        viz.toggleExplodedView(true);
        ui.log("Holographic Interface Active.", "info");
    }, 800);

    // 2. Setup API
    const api = new API({
        log: (msg, type) => ui.log(msg, type),
        onStart: () => ui.resetDashboard(),
        updateDashboard: (data) => ui.updateDashboard(data)
    });

    // 3. Expose Global Functions for HTML Buttons
    window.startAnalysis = () => {
        const url = document.getElementById('targetUrl').value;
        api.startAnalysis(url);
        // Also play stack animation for effect
        stack.play(ui);
    };

    window.triggerAttack = () => {
        attackSim.trigger();
    };

    window.toggleHolo = () => {
        // Toggle Logic
        window.holoActive = !window.holoActive;
        viz.toggleExplodedView(window.holoActive);
        ui.log(window.holoActive ? "Activating Holographic Inspector..." : "Returning to Graph Mode...", "info");
    };

    window.playStack = () => {
        stack.play(ui);
    };
});
