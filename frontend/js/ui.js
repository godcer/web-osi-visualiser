
export class UI {
    constructor() {
        this.latencyChart = null;
        this.terminal = document.getElementById('terminal-log');

        // Layer Explanations for "What it does" feature
        this.layerExplanations = {
            '7': `
**L7: Application Layer**
The interface you interact with.
- **Action**: Your browser constructs an HTTP GET request for "google.com".
- **Real-World**: Like writing a letter and putting it in an envelope.
- **Key Data**: HTTP Headers, User-Agent, Cookies.
            `,
            '6': `
**L6: Presentation Layer**
Ensures data is readable and secure.
- **Action**: Encrypts your request using TLS (SSL) so hackers can't read it.
- **Real-World**: Translating the letter into a secret code (Encryption).
- **Key Data**: TLS 1.3 Handshake, Cipher Suites.
            `,
            '5': `
**L5: Session Layer**
Maintains the conversation.
- **Action**: Opens a persistent "session" so you don't have to login on every page.
- **Real-World**: Keeping the phone line open while you talk.
- **Key Data**: Session IDs, Keep-Alive tokens.
            `,
            '4': `
**L4: Transport Layer**
Reliable delivery and error checking.
- **Action**: Breaks data into "segments". Uses TCP to ensure every piece arrives.
- **Real-World**: Numbering the pages of your letter so they can be reassembled.
- **Key Data**: Source Port (Random), Dest Port (443), Sequence Numbers.
            `,
            '3': `
**L3: Network Layer**
Routing and addressing.
- **Action**: Adds IP addresses to create "Packets". Decides the path across the internet.
- **Real-World**: Writing the "To" and "From" addresses on the envelope.
- **Key Data**: Source IP, Destination IP, TTL (Time To Live).
            `,
            '12': `
**L2: Data Link Layer**
Physical addressing for the local hop.
- **Action**: Adds MAC addresses (Ethernet Frame) to get to your Wi-Fi router.
- **Real-World**: The mail carrier knowing which specific house mailbox to put it in.
- **Key Data**: Source MAC, Gateway MAC (Router).
            `
        };

        // Attack Scenarios for Simulation (Unified DDoS Narrative)
        this.layerAttacks = {
            '7': { title: "HTTP FLOOD DETECTED", desc: "Server overwhelmed by 50,000 GET requests/sec. Service Unavailable (503)." },
            '6': { title: "SSL EXHAUSTION", desc: "CPU 100% Load. Crypto-accelerators failed attempting to decrypt bogus handshakes." },
            '5': { title: "SESSION TABLE FULL", desc: "Max concurrent sessions (1M+) reached. Valid users cannot login." },
            '4': { title: "SYN FLOOD", desc: "TCP State Exhaustion. 10,000+ half-open connections. Backlog queue full." },
            '3': { title: "BANDWIDTH SATURATION", desc: "Link capacity exceeded. Inbound traffic 10Gbps > 1Gbps Uplink." },
            '12': { title: "SWITCH BUFFER OVERFLOW", desc: "Frame buffer memory exhausted. Random packet drop (Tail Drop) active." }
        };
    }

    init() {
        this.initLog();
        this.initChart();
        this.initCardFlips();
    }

    showAttackDiagnostics() {
        document.querySelectorAll('.layer-card').forEach(card => {
            const osi = card.getAttribute('data-osi');
            const attack = this.layerAttacks[osi];

            // Robust selector: look for ID inside the specific card
            const targetDisplay = card.querySelector(`[id^="l"][id$="-content"]`);

            if (targetDisplay && attack) {
                targetDisplay.innerHTML = `
                    <div class="animate-pulse flex items-start space-x-2 text-red-400">
                         <span class="text-lg">⚠</span>
                         <div>
                             <div class="font-bold text-xs uppercase tracking-wider text-red-500 glitch" data-text="${attack.title}">${attack.title}</div>
                             <div class="text-[10px] text-red-300/80 mt-1 font-mono">${attack.desc}</div>
                         </div>
                    </div>
                 `;
                card.classList.add('attack-mode');
            }
        });

        this.log("CRITICAL: MULTI-LAYER COMPROMISE DETECTED", "error");
    }

    resetAttackDiagnostics() {
        document.querySelectorAll('.layer-card').forEach(card => card.classList.remove('attack-mode'));
        // Content will clear naturally on next scan or we can force reset text
        // For now, let's just clear
        ['7', '6', '5', '4', '3'].forEach(l => {
            const el = document.getElementById(`l${l}-content`);
            if (el) el.innerHTML = "Waiting for data...";
        });
        const l12 = document.getElementById('l12-content');
        if (l12) l12.innerHTML = "MAC / SWITCH";
    }

    initCardFlips() {
        document.querySelectorAll('.layer-card').forEach(card => {
            // Add Info Button
            const header = card.querySelector('.flex.justify-between');
            if (header) {
                const btn = document.createElement('button');
                btn.innerHTML = 'ℹ️ INFO';
                btn.className = "text-[10px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 px-2 py-1 rounded ml-2 transition-colors z-20 relative font-bold";
                btn.title = "See what happens here";
                btn.onclick = (e) => {
                    e.stopPropagation(); // Prevent card click
                    this.flipCard(card);
                };
                header.appendChild(btn);
            }

            // Wrap content in card-inner/front/back structure
            const content = card.innerHTML;
            card.innerHTML = '';

            const inner = document.createElement('div');
            inner.className = 'card-inner';

            const front = document.createElement('div');
            front.className = 'card-front p-0'; // Restore padding logic if needed, but p-0 from HTML is safer
            front.innerHTML = content;

            const back = document.createElement('div');
            back.className = 'card-back';
            const osi = card.getAttribute('data-osi');
            const explanation = this.layerExplanations[osi] || 'Details not available.';

            // Markdown rendering (simple replace for bold/list)
            const formattedHTML = explanation
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/- (.*)/g, '<li class="ml-4 text-slate-300">$1</li>');

            back.innerHTML = `
                <div class="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                    <span class="text-xs font-mono text-emerald-400">LAYER INTELLIGENCE</span>
                    <button class="text-xs text-slate-400 hover:text-white" onclick="this.closest('.layer-card').classList.remove('flipped'); event.stopPropagation();">Close ✕</button>
                </div>
                <div class="text-xs leading-relaxed space-y-2 font-sans opacity-90">
                    ${formattedHTML}
                </div>
            `;

            inner.appendChild(front);
            inner.appendChild(back);
            card.appendChild(inner);

            // Re-bind flip button in the new DOM
            const newBtn = front.querySelector('button[title="See what happens here"]');
            if (newBtn) {
                newBtn.onclick = (e) => {
                    e.stopPropagation();
                    card.classList.add('flipped');
                };
            }
        });
    }

    flipCard(card) {
        card.classList.toggle('flipped');
    }

    // highlightCode removed as no longer needed


    initLog() {
        this.log("> System initialized...");
    }

    log(msg, type = 'info') {
        const div = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        let color = 'text-emerald-500/80';
        if (type === 'error') color = 'text-red-400 font-bold';
        if (type === 'warn') color = 'text-yellow-400';
        if (type === 'attack') color = 'text-red-500 font-mono font-bold bg-red-900/20';

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
                labels: Array(20).fill(''),
                datasets: [{
                    label: 'Latency (ms)',
                    data: Array(20).fill(0),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { display: false }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    setModel(model) {
        // ... (Keep existing logic or simplify)
        // For showcase, we might stick to OSI as default
        console.log("Switching model to", model);
    }

    updateDashboard(data) {
        // --- Layer 7: Application ---
        const l7 = data.layer7;
        const l7el = document.getElementById('l7-content');
        if (l7el && l7) {
            const robotsStatus = l7.robots_txt ? (l7.robots_txt.present ? 'Found' : 'Missing') : 'Unknown';
            l7el.innerHTML = `
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
                 <div class="space-y-1">
                     <div class="flex justify-between text-xs text-slate-400"><span>Content-Type:</span> <span class="text-slate-200">${l7.http.content_type || '-'}</span></div>
                     <div class="flex justify-between text-xs text-slate-400"><span>Robots.txt:</span> <span class="${l7.robots_txt && l7.robots_txt.present ? 'text-emerald-400' : 'text-slate-600'}">${robotsStatus}</span></div>
                </div>
            `;
        }

        // --- Layer 6: Presentation ---
        const l6 = data.layer6; // Assuming backend sends this, fallback if not
        const l6el = document.getElementById('l6-content');
        if (l6el) {
            // Mock data if L6 is empty (since simple HTTP scans might not yield deep TLS info without specific headers)
            const tlsVer = l6?.tls?.version || "TLS 1.3 (Simulated)";
            const cipher = l6?.tls?.cipher || "AES_256_GCM_SHA384";
            l6el.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                        <span class="text-indigo-300">Protocol</span>
                        <span class="font-mono text-white">${tlsVer}</span>
                    </div>
                    <div class="text-[10px] text-slate-500 uppercase mt-1">Cipher Suite</div>
                    <div class="font-mono text-xs text-indigo-400 break-all">${cipher}</div>
                </div>
            `;
        }

        // --- Layer 5: Session ---
        const l5 = data.layer5;
        const l5el = document.getElementById('l5-content');
        if (l5el) {
            const cookies = l7?.http?.headers['set-cookie'] ? "Present" : "None";
            const keepAlive = l7?.http?.headers['connection'] === 'keep-alive' ? "Active" : "Closed";
            l5el.innerHTML = `
                 <div class="grid grid-cols-2 gap-2">
                    <div class="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                        <div class="text-[10px] text-slate-500">Cookies</div>
                        <div class="font-mono text-blue-400 text-xs">${cookies}</div>
                    </div>
                    <div class="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                        <div class="text-[10px] text-slate-500">Keep-Alive</div>
                        <div class="font-mono text-emerald-400 text-xs">${keepAlive}</div>
                    </div>
                </div>
            `;
        }

        // --- Layer 4: Transport ---
        const l4 = data.layer4; // tcp info
        const l4el = document.getElementById('l4-content');
        if (l4el && l4) {
            // Backend returns { tcp_ports: {80: "Open", ...}, latency_tcp_handshake: 12.5 }
            const openPorts = Object.keys(l4.tcp_ports || {}).filter(p => l4.tcp_ports[p] === 'Open');
            const mainPort = openPorts.length > 0 ? openPorts[0] : (l4.tcp_ports ? Object.keys(l4.tcp_ports)[0] : 'Unknown');
            const status = l4.tcp_ports && l4.tcp_ports[mainPort] === 'Open' ? 'ESTABLISHED' : 'CLOSED';
            const latency = l4.latency_tcp_handshake > 0 ? l4.latency_tcp_handshake + 'ms' : 'Timeout';

            l4el.innerHTML = `
                <div class="flex justify-between mb-2">
                    <span class="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold">TCP</span>
                    <span class="text-[10px] text-slate-500 font-mono">RTT: ${latency}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div class="text-slate-400">SRC: <span class="text-white">Random</span></div>
                    <div class="text-slate-400">DST: <span class="text-cyan-400">${mainPort}</span></div>
                </div>
                <div class="mt-2 text-[10px] flex gap-1">
                    <span class="px-1 ${status === 'ESTABLISHED' ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-800 text-slate-400'} rounded">SYN</span>
                    <span class="px-1 ${status === 'ESTABLISHED' ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-800 text-slate-400'} rounded">ACK</span>
                    <span class="px-1 bg-slate-800 rounded text-slate-400">FIN</span>
                </div>
            `;
        }

        // --- Layer 3: Network ---
        const l3 = data.layer3;
        const l3el = document.getElementById('l3-content');
        if (l3el && l3) {
            // Backend returns { ip_address: "...", geolocation: {...}, cdn_detection: "..." }
            const geo = l3.geolocation || {};
            const flag = geo.country === 'Unknown' ? '🏳️' : '📍';

            l3el.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                        <span class="text-[10px] text-slate-500">TARGET IP</span>
                        <span class="font-mono text-emerald-400 text-xs">${l3.ip_address || "Unresolved"}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-slate-300">
                        <span class="text-emerald-500">${flag}</span>
                        <span>${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}</span>
                    </div>
                    <div class="text-[10px] text-slate-500 font-mono ml-6">
                        CDN: ${l3.cdn_detection || 'None'}
                    </div>
                </div>
            `;
        }

        // --- Layer 2: Data Link ---
        const l2el = document.getElementById('l12-content');
        if (l2el) {
            // L2 data usually local, so we mock the gateway/interface interaction
            l2el.innerHTML = `
                <div class="flex justify-between text-[10px] font-mono mb-1">
                    <span class="text-orange-300">DST MAC (GW)</span>
                </div>
                <div class="text-xs text-slate-300 font-mono mb-2">00:50:56:C0:00:08</div>
                <div class="flex justify-between text-[10px] text-slate-500">
                    <span>Frame: Ethernet II</span>
                    <span>MTU: 1500</span>
                </div>
             `;
        }
    }

    resetDashboard() {
        document.querySelectorAll('[id$="-content"]').forEach(el => {
            el.innerHTML = '<div class="animate-pulse h-20 bg-slate-800/50 rounded border border-slate-700/50"></div>';
        });
    }
}
