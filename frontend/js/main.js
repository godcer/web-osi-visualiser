
import { API } from './api.js';
import { UI } from './ui.js';
import { Viz } from './viz.js';

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    ui.initLog();
    ui.initChart();

    const api = new API({
        log: (msg, type) => ui.log(msg, type),
        onStart: () => ui.resetDashboard(),
        updateDashboard: (data) => ui.updateDashboard(data)
    });

    // Event Listeners
    window.startAnalysis = () => {
        const url = document.getElementById('targetUrl').value;
        api.startAnalysis(url);
    };

    window.setModel = (model) => {
        ui.setModel(model);
    };

    // 3D Viz initialization
    const viz = new Viz('viz-container');
});
