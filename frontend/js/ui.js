
export class UI {
    constructor() {
        this.latencyChart = null;
        this.terminal = document.getElementById('terminal-log');

        // Code Snippets for "Reveal" feature
        this.codeSnippets = {
            '7': `
// layer7_application.py
def analyze_http(packet):
    if packet.haslayer(HTTP):
        return {
            "method": packet[HTTP].Method,
            "host": packet[HTTP].Host,
            "user_agent": packet[HTTP].User_Agent
        }
            `,
            '6': `
// layer6_presentation.py
def check_tls(packet):
    if packet.haslayer(TLS):
        # Extract Cipher and Version
        version = packet[TLS].version
        cipher = packet[TLS].cipher_suite
        return {"version": version, "cipher": cipher}
    return None
            `,
            '5': `
// layer5_session.py
def inspect_cookies(headers):
    cookies = SimpleCookie()
    cookies.load(headers.get('Cookie', ''))
    return {
        k: {"secure": v['secure']} 
        for k, v in cookies.items()
    }
            `,
            '4': `
// layer4_transport.py
def analyze_tcp(packet):
    flags = packet[TCP].flags
    win_size = packet[TCP].window
    # Check for SYN Flood signature
    if flags == 'S':
        return {"status": "SYN_SENT", "risk": "Medium"}
    return {"status": "ESTABLISHED"}
            `,
            '3': `
// layer3_network.py
def get_geoip(ip_addr):
    try:
        reader = geoip2.database.Reader('GeoLite2.mmdb')
        resp = reader.city(ip_addr)
        return {
            "country": resp.country.name,
            "lat": resp.location.latitude,
            "lon": resp.location.longitude
        }
    except: return None
            `,
            '12': `
// layer2_datalink.py
def get_mac_vendor(mac):
    # OUI Lookup
    oui = mac[:8].upper()
    return mac_db.get(oui, "Unknown Vendor")
            `
        };
    }

    init() {
        this.initLog();
        this.initChart();
        this.initCardFlips();
    }

    initCardFlips() {
        document.querySelectorAll('.layer-card').forEach(card => {
            // Add Flip Button if not exists
            const header = card.querySelector('.flex.justify-between');
            if (header) {
                const btn = document.createElement('button');
                btn.innerHTML = '&lt; / &gt;'; // Code Icon
                btn.className = "text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded ml-2 transition-colors z-20 relative";
                btn.title = "View Source Code";
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
            front.className = 'card-front p-6'; // Restore padding
            front.innerHTML = content;

            const back = document.createElement('div');
            back.className = 'card-back';
            const osi = card.getAttribute('data-osi');
            const code = this.codeSnippets[osi] || '// No code available for this layer';
            back.innerHTML = `
                <div class="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                    <span class="text-xs font-mono text-blue-400">SOURCE CODE</span>
                    <button class="text-xs text-slate-400 hover:text-white" onclick="this.closest('.layer-card').classList.remove('flipped'); event.stopPropagation();">Close ✕</button>
                </div>
                <pre class="text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed"><code class="language-python">${this.highlightCode(code)}</code></pre>
            `;

            inner.appendChild(front);
            inner.appendChild(back);
            card.appendChild(inner);

            // Re-bind flip button in the new DOM
            const newBtn = front.querySelector('button[title="View Source Code"]');
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

    highlightCode(code) {
        // Simple regex highlighter
        return code
            .replace(/(def|return|if|else|for|in|try|except)/g, '<span class="code-keyword">$1</span>')
            .replace(/([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, '<span class="code-func">$1</span>')
            .replace(/(".*?")/g, '<span class="code-string">$1</span>')
            .replace(/(#.*)/g, '<span class="code-comment">$1</span>');
    }

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
