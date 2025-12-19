
export class UI {
    constructor() {
        this.latencyChart = null;
        this.terminal = document.getElementById('terminal-log');
    }

    initLog() {
        // Initial log message
        this.log("> System initialized...");
    }

    log(msg, type = 'info') {
        const div = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        let color = 'text-emerald-500/80';
        if (type === 'error') color = 'text-red-400';
        if (type === 'warn') color = 'text-yellow-400';

        div.className = `${color} hover:bg-white/5 px-1 rounded`;
        div.innerHTML = `<span class="opacity-50">[${timestamp}]</span> ${msg}`;
        this.terminal.appendChild(div);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    initChart() {
        const ctx = document.getElementById('latencyChart').getContext('2d');
        this.latencyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'TCP Handshake (ms)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: { display: false }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    resetDashboard() {
        document.querySelectorAll('[id$="-content"]').forEach(el => {
            el.innerHTML = '<div class="animate-pulse h-20 bg-slate-800/50 rounded border border-slate-700/50"></div>';
        });
        document.getElementById('ai-summary').innerHTML = '<p class="opacity-50 animate-pulse">Analyzing threat vectors...</p>';
        document.getElementById('ai-score').innerText = '--';
        document.getElementById('score-circle').style.strokeDashoffset = 377;
        document.getElementById('journey-timeline').innerHTML = '<div class="text-slate-500 text-sm italic animate-pulse">Tracing request journey...</div>';
    }

    updateDashboard(data) {
        // Update Packet Viz
        document.getElementById('viz-mac').innerText = "XX:XX:XX:XX:XX:XX";
        document.getElementById('viz-ip').innerText = data.layer3.ip_address || 'Unknown';
        document.getElementById('viz-host').innerText = data.layer7.http.server || 'Unknown';

        // AI Score Animation
        const score = data.ai_analysis.score;
        const offset = 377 - (377 * score) / 100;
        document.getElementById('score-circle').style.strokeDashoffset = offset;

        let currentScore = 0;
        const interval = setInterval(() => {
            if (currentScore >= score) {
                clearInterval(interval);
                document.getElementById('ai-score').innerText = score;
            } else {
                currentScore++;
                document.getElementById('ai-score').innerText = currentScore;
            }
        }, 20);

        document.getElementById('ai-grade').innerText = data.ai_analysis.risk_level;

        // AI Findings
        const findingsHtml = data.ai_analysis.findings.map(f => {
            let color = 'text-slate-300';
            if (f.severity === 'Critical') color = 'text-red-400';
            if (f.severity === 'High') color = 'text-orange-400';
            if (f.severity === 'Medium') color = 'text-yellow-400';
            return `<div class="flex gap-2 text-[10px] border-b border-slate-800 pb-1 last:border-0">
                <span class="${color} font-bold w-12 shrink-0">${f.severity}</span>
                <span>${f.message}</span>
            </div>`;
        }).join('');

        document.getElementById('ai-summary').innerHTML = `
            <div class="mb-2 font-semibold text-blue-300 border-b border-blue-500/20 pb-1">Executive Summary</div>
            <p class="mb-3 leading-relaxed">${data.ai_analysis.summary.join(' ')}</p>
            <div class="mb-2 font-semibold text-blue-300 border-b border-blue-500/20 pb-1">Key Findings</div>
            <div class="space-y-1">${findingsHtml || '<div class="text-slate-500">No significant findings.</div>'}</div>
        `;

        // Journey Timeline
        if (data.journey) {
            const journeyHtml = data.journey.map((step) => `
            <div class="relative pl-8 pb-6 last:pb-0">
                <div class="timeline-line"></div>
                <div class="timeline-dot"></div>
                <div class="bg-slate-900/50 p-3 rounded border border-slate-800">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs font-bold text-blue-400">${step.title}</span>
                        <span class="text-[10px] text-slate-500">${step.layer}</span>
                    </div>
                    <p class="text-xs text-slate-300 leading-snug">${step.description}</p>
                </div>
            </div>
            `).join('');
            document.getElementById('journey-timeline').innerHTML = `<div class="pt-2">${journeyHtml}</div>`;
        }

        // Layer 7
        const l7 = data.layer7;
        const robotsStatus = l7.robots_txt ? (l7.robots_txt.present ? 'Found' : 'Missing') : 'Unknown';
        document.getElementById('l7-content').innerHTML = `
            <div class="grid grid-cols-2 gap-2 mb-2">
                <div class="bg-slate-900/50 p-2 rounded border border-slate-800">
                    <div class="text-[10px] text-slate-500 uppercase">Server</div>
                    <div class="font-mono text-emerald-400 truncate text-xs" title="${l7.http.server}">${l7.http.server || 'Unknown'}</div>
                </div>
                <div class="bg-slate-900/50 p-2 rounded border border-slate-800">
                    <div class="text-[10px] text-slate-500 uppercase">Status</div>
                    <div class="font-mono text-blue-400 text-xs">${l7.http.status_code}</div>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center border-b border-slate-800 pb-1">
                    <span class="text-xs text-slate-400">Robots.txt</span>
                    <span class="text-xs ${l7.robots_txt && l7.robots_txt.present ? 'text-emerald-400' : 'text-slate-600'}">${robotsStatus}</span>
                </div>
                <div class="text-[10px] text-slate-500 uppercase">Tech Stack</div>
                <div class="flex flex-wrap gap-1">
                    ${Object.keys(l7.cms).length ? Object.keys(l7.cms).map(c => `<span class="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded text-[10px] uppercase">${c}</span>`).join('') : '<span class="text-slate-600 text-[10px]">None detected</span>'}
                </div>
            </div>
        `;

        // Layer 6
        const l6 = data.layer6;
        const cipher = l6.cipher_breakdown || {};
        document.getElementById('l6-content').innerHTML = `
            <div class="space-y-2 font-mono text-xs">
                <div class="flex justify-between border-b border-slate-800 pb-1">
                    <span class="text-slate-500">Protocol</span>
                    <span class="text-indigo-300">${l6.tls.version || 'N/A'}</span>
                </div>
                <div class="bg-slate-900/50 p-2 rounded border border-slate-800 space-y-1">
                    <div class="text-[10px] text-slate-500 uppercase mb-1">Cipher Breakdown</div>
                    <div class="flex justify-between"><span class="text-slate-600">Key Ex:</span> <span class="text-indigo-200">${cipher.key_exchange || 'Unknown'}</span></div>
                    <div class="flex justify-between"><span class="text-slate-600">Enc:</span> <span class="text-indigo-200">${cipher.encryption || 'Unknown'}</span></div>
                    <div class="flex justify-between"><span class="text-slate-600">MAC:</span> <span class="text-indigo-200">${cipher.mac || 'Unknown'}</span></div>
                </div>
                <div class="flex justify-between mt-2">
                    <span class="text-slate-500">Expires</span>
                    <span class="${l6.tls.days_remaining < 30 ? 'text-red-400' : 'text-emerald-400'}">${l6.tls.days_remaining} days</span>
                </div>
            </div>
        `;

        // Layer 5
        const l5 = data.layer5;
        document.getElementById('l5-content').innerHTML = `
            <div class="grid grid-cols-2 gap-2 mb-2">
                <div class="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                    <div class="text-[10px] text-slate-500 uppercase">Keep-Alive</div>
                    <div class="${l5.keep_alive ? 'text-emerald-400' : 'text-red-400'} font-bold text-sm">${l5.keep_alive ? 'ACTIVE' : 'CLOSED'}</div>
                </div>
                <div class="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                    <div class="text-[10px] text-slate-500 uppercase">Cookies</div>
                    <div class="text-blue-400 font-bold text-sm">${Object.keys(l5.cookies).length}</div>
                </div>
            </div>
            <div class="text-[10px] text-slate-400 italic">
                ${l5.cookie_education ? Object.values(l5.cookie_education).join(' ') : 'No cookie warnings.'}
            </div>
        `;

        // Layer 4
        const l4 = data.layer4;
        const portDescriptions = l4.port_descriptions || {};
        document.getElementById('l4-content').innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between text-xs font-mono">
                    <span class="text-slate-500">Handshake RTT</span>
                    <span class="text-cyan-300">${l4.latency_tcp_handshake}ms</span>
                </div>
                <div class="grid grid-cols-4 gap-1 mt-2">
                    ${Object.entries(l4.tcp_ports).map(([port, status]) => `
                    <div class="text-center bg-slate-900/50 border border-slate-800 rounded p-1 tooltip-trigger relative" title="${status}">
                        <div class="text-[9px] text-slate-500">${port}</div>
                        <div class="w-1.5 h-1.5 rounded-full mx-auto mt-1 ${status === 'Open' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500'}"></div>
                        <div class="tooltip-content hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 text-[10px] text-slate-300 p-2 rounded border border-slate-700 z-20">
                            ${portDescriptions[port] || 'Unknown Service'}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Update Chart
        if (l4.latency_tcp_handshake > 0) {
            const now = new Date().toLocaleTimeString();
            this.latencyChart.data.labels.push(now);
            this.latencyChart.data.datasets[0].data.push(l4.latency_tcp_handshake);
            if (this.latencyChart.data.labels.length > 10) {
                this.latencyChart.data.labels.shift();
                this.latencyChart.data.datasets[0].data.shift();
            }
            this.latencyChart.update();
        }

        // Layer 3
        const l3 = data.layer3;
        document.getElementById('l3-content').innerHTML = `
            <div class="space-y-2 text-xs font-mono">
                <div class="flex justify-between border-b border-slate-800 pb-1">
                    <span class="text-slate-500">IP Address</span>
                    <span class="text-emerald-300">${l3.ip_address || 'N/A'}</span>
                </div>
                <div class="flex justify-between border-b border-slate-800 pb-1">
                    <span class="text-slate-500">Location</span>
                    <span class="text-emerald-300 truncate max-w-[120px]">${l3.geolocation.country}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">CDN</span>
                    <span class="text-orange-300">${l3.cdn_detection}</span>
                </div>
            </div>
        `;

        // Layer 1 & 2
        const l12 = data.layer1_2;
        const ifaceCount = Object.keys(l12.interfaces).length;
        document.getElementById('l12-content').innerHTML = `
            <div class="space-y-2 text-xs font-mono">
                <div class="flex justify-between border-b border-slate-800 pb-1">
                    <span class="text-slate-500">Interfaces</span>
                    <span class="text-orange-300">${ifaceCount} Active</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">Gateway</span>
                    <span class="text-orange-300 truncate max-w-[120px]">${l12.default_gateway.gateway_ip || 'Unknown'}</span>
                </div>
            </div>
        `;
    }

    setModel(model) {
        const btnOsi = document.getElementById('btn-osi');
        const btnTcp = document.getElementById('btn-tcpip');

        if (model === 'osi') {
            btnOsi.className = "px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white transition-all";
            btnTcp.className = "px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white transition-all";
        } else {
            btnTcp.className = "px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white transition-all";
            btnOsi.className = "px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white transition-all";
        }

        document.querySelectorAll('.layer-card').forEach(card => {
            const tcpLayer = card.getAttribute('data-tcp');
            const titleEl = card.querySelector('h2');

            if (model === 'tcpip') {
                titleEl.innerText = `TCP/IP: ${tcpLayer}`;
            } else {
                const osiLayer = card.getAttribute('data-osi');
                let name = "Unknown";
                if (osiLayer == 7) name = "Application";
                if (osiLayer == 6) name = "Presentation";
                if (osiLayer == 5) name = "Session";
                if (osiLayer == 4) name = "Transport";
                if (osiLayer == 3) name = "Network";
                if (osiLayer == 12) name = "Physical";
                titleEl.innerText = `Layer ${osiLayer}: ${name}`;
            }
        });
    }
}
