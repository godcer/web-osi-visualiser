
export class AttackSim {
    constructor(ui, viz) {
        this.ui = ui;
        this.viz = viz;
        this.active = false;
        this.interval = null;
    }

    trigger() {
        if (this.active) return;
        this.active = true;
        document.body.classList.add('attack-mode');

        this.ui.log("⚠️ DDOS SIGNATURE DETECTED ⚠️", "attack");
        this.ui.log("Source: 192.168.1.X (Botnet)", "attack");

        // Show Attack details on cards
        this.ui.showAttackDiagnostics();

        // Spike the chart
        let i = 0;
        this.interval = setInterval(() => {
            const chart = this.ui.latencyChart;
            if (chart) {
                chart.data.datasets[0].data.push(Math.random() * 500 + 200); // Massive spike
                chart.data.datasets[0].borderColor = '#ef4444';
                chart.data.datasets[0].backgroundColor = 'rgba(239, 68, 68, 0.2)';
                chart.data.labels.push('!!!');
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
                chart.update();
            }

            // Random Logs
            if (Math.random() > 0.7) {
                this.ui.log(`DROP: Packet #${Math.floor(Math.random() * 90000)}`, "attack");
            }

            // Viz Particles
            if (this.viz) {
                // We'll expose a method in Viz to spawn chaos
                this.viz.spawnAttackParticles();
            }

            i++;
            if (i > 100) this.stop(); // Auto stop after ~10s
        }, 100);
    }

    stop() {
        this.active = false;
        clearInterval(this.interval);
        document.body.classList.remove('attack-mode');
        this.ui.log("Attack mitigated. Firewalls active.", "info");

        // Reset cards
        this.ui.resetAttackDiagnostics();

        // Reset Chart Color
        const chart = this.ui.latencyChart;
        if (chart) {
            chart.data.datasets[0].borderColor = '#3b82f6';
            chart.data.datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }
    }
}
