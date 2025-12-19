
export class API {
    constructor(callbacks) {
        this.ws = null;
        this.callbacks = callbacks; // log, updateDashboard
    }

    startAnalysis(url) {
        if (!url) return;

        this.callbacks.log(`Initiating scan sequence for target: ${url}`);
        this.callbacks.onStart();

        if (this.ws) this.ws.close();

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/analyze`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({ url: url }));
            this.callbacks.log("WebSocket connection established. Sending payload...");
        };

        this.ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.status === 'starting') {
                this.callbacks.log(response.message);
            } else if (response.status === 'complete') {
                this.callbacks.log("Analysis complete. Parsing results...");
                this.callbacks.updateDashboard(response.data);
            } else if (response.error) {
                this.callbacks.log(`Error: ${response.error}`, 'error');
            }
        };

        this.ws.onerror = (error) => {
            this.callbacks.log("WebSocket connection failed.", 'error');
        };
    }
}
