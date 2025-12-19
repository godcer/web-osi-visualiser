import socket
import time
import logging
from urllib.parse import urlparse
from typing import Dict, Any, List

logger = logging.getLogger("app.layers.transport")

class TransportLayer:
    def __init__(self, target: str):
        self.parsed_url = urlparse(target)
        self.hostname = self.parsed_url.netloc or self.parsed_url.path
        if ":" in self.hostname:
            self.hostname = self.hostname.split(":")[0]

    def analyze(self) -> Dict[str, Any]:
        logger.info(f"Starting Layer 4 analysis for {self.hostname}")
        return {
            "tcp_ports": self._check_tcp_ports(),
            "udp_quic": self._check_quic(),
            "latency_tcp_handshake": self._measure_tcp_handshake()
        }

    def _check_tcp_ports(self) -> Dict[int, str]:
        ports = [80, 443, 8080, 8443]
        results = {}
        for port in ports:
            try:
                with socket.create_connection((self.hostname, port), timeout=1) as sock:
                    results[port] = "Open"
            except (socket.timeout, ConnectionRefusedError):
                results[port] = "Closed/Filtered"
            except Exception as e:
                results[port] = f"Error: {e}"
        return results

    def _check_quic(self) -> bool:
        # QUIC runs on UDP 443. Hard to verify without a QUIC client.
        # We can check if UDP 443 is reachable (though often firewalled/unresponsive to empty packets).
        # A better check is looking for 'Alt-Svc' header in Layer 7, but here we can try a basic UDP socket send.
        # For now, we will rely on the Application layer to report Alt-Svc, 
        # but here we can just report if UDP 443 seems "open" (rarely works due to no ACK in UDP).
        # We will return None (Unknown) as true QUIC check requires a client handshake.
        return "Check 'Alt-Svc' header in Application Layer"

    def _measure_tcp_handshake(self) -> float:
        start = time.time()
        try:
            # Default to 443 if available, else 80
            port = 443
            with socket.create_connection((self.hostname, port), timeout=2):
                pass
        except:
            try:
                port = 80
                with socket.create_connection((self.hostname, port), timeout=2):
                    pass
            except:
                return -1.0
        end = time.time()
        return round((end - start) * 1000, 2) # ms
