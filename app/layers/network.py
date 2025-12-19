import socket
import logging
import time
import subprocess
import platform
import re
from urllib.parse import urlparse
from typing import Dict, Any, List
import geoip2.database

logger = logging.getLogger("app.layers.network")

class NetworkLayer:
    def __init__(self, target: str):
        self.parsed_url = urlparse(target)
        self.hostname = self.parsed_url.netloc or self.parsed_url.path
        if ":" in self.hostname:
            self.hostname = self.hostname.split(":")[0]
        self.ip_address = self._resolve_ip()

    def analyze(self) -> Dict[str, Any]:
        logger.info(f"Starting Layer 3 analysis for {self.hostname}")
        return {
            "ip_address": self.ip_address,
            "geolocation": self._get_geolocation(),
            "ping_latency": self._ping_host(),
            "traceroute": self._traceroute(),
            "cdn_detection": self._detect_cdn()
        }

    def _resolve_ip(self) -> str:
        try:
            return socket.gethostbyname(self.hostname)
        except Exception:
            return None

    def _get_geolocation(self) -> Dict[str, str]:
        # Placeholder: In a real app, we would use a GeoIP database file.
        # For this implementation, we'll return a stub or use a public API if allowed.
        # Since we can't guarantee the DB file exists, we will return a placeholder note.
        return {
            "country": "Unknown (GeoIP DB missing)",
            "city": "Unknown",
            "asn": "Unknown"
        }

    def _ping_host(self) -> float:
        if not self.ip_address:
            return -1.0
        
        param = '-n' if platform.system().lower() == 'windows' else '-c'
        command = ['ping', param, '1', self.ip_address]
        
        try:
            start = time.time()
            subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
            end = time.time()
            return round((end - start) * 1000, 2)
        except Exception:
            return -1.0

    def _traceroute(self) -> List[Dict[str, Any]]:
        # Simplified traceroute using scapy or system command.
        # System command is safer/easier without root.
        hops = []
        # This is slow, so we might skip or limit it in a real-time app.
        # We will return a placeholder for the "fast" analysis.
        return [{"hop": 1, "ip": "Traceroute skipped for speed", "rtt": "0ms"}]

    def _detect_cdn(self) -> str:
        # Basic reverse DNS check
        try:
            hostname, _, _ = socket.gethostbyaddr(self.ip_address)
            if "cloudflare" in hostname:
                return "Cloudflare"
            if "akamai" in hostname:
                return "Akamai"
            if "google" in hostname:
                return "Google Cloud"
            if "aws" in hostname or "amazon" in hostname:
                return "AWS"
            return "Unknown / Direct"
        except Exception:
            return "Unknown"
