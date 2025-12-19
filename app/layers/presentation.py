import ssl
import socket
import logging
from urllib.parse import urlparse
from typing import Dict, Any
import datetime

logger = logging.getLogger("app.layers.presentation")

class PresentationLayer:
    def __init__(self, target: str):
        self.parsed_url = urlparse(target)
        self.hostname = self.parsed_url.netloc or self.parsed_url.path
        # Remove port if present for SSL check
        if ":" in self.hostname:
            self.hostname = self.hostname.split(":")[0]

    def analyze(self) -> Dict[str, Any]:
        logger.info(f"Starting Layer 6 analysis for {self.hostname}")
        results = {
            "tls": self._analyze_tls(),
            "compression": self._check_compression()
        }
        return results

    def _analyze_tls(self) -> Dict[str, Any]:
        tls_info = {}
        context = ssl.create_default_context()
        try:
            with socket.create_connection((self.hostname, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=self.hostname) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    version = ssock.version()
                    
                    # Extract Subject Alternative Names
                    san = []
                    for item in cert.get('subjectAltName', []):
                        if item[0] == 'DNS':
                            san.append(item[1])

                    # Extract Issuer
                    issuer = dict(x[0] for x in cert['issuer'])
                    
                    # Extract Expiry
                    not_after = cert['notAfter']
                    # Parse date format: 'May 24 12:00:00 2024 GMT'
                    expiry_date = datetime.datetime.strptime(not_after, '%b %d %H:%M:%S %Y %Z')
                    days_remaining = (expiry_date - datetime.datetime.utcnow()).days

                    tls_info = {
                        "version": version,
                        "cipher_suite": cipher[0],
                        "protocol": cipher[1],
                        "bits": cipher[2],
                        "issuer": issuer.get('organizationName') or issuer.get('commonName'),
                        "expiry": not_after,
                        "days_remaining": days_remaining,
                        "san": san,
                        "valid": True
                    }
        except Exception as e:
            logger.error(f"TLS Analysis failed: {e}")
            tls_info = {
                "valid": False,
                "error": str(e)
            }
        return tls_info

    def _check_compression(self) -> Dict[str, bool]:
        # This is usually checked via HTTP headers in Layer 7, but conceptually fits Layer 6 (Presentation/Encoding)
        # We can check if the server supports compression by making a request with Accept-Encoding
        import requests
        compression = {
            "gzip": False,
            "br": False,
            "deflate": False
        }
        try:
            target = f"https://{self.hostname}"
            headers = {"Accept-Encoding": "gzip, br, deflate"}
            response = requests.head(target, headers=headers, timeout=5)
            content_encoding = response.headers.get("Content-Encoding", "")
            
            if "gzip" in content_encoding:
                compression["gzip"] = True
            if "br" in content_encoding:
                compression["br"] = True
            if "deflate" in content_encoding:
                compression["deflate"] = True
                
        except Exception:
            pass
            
        return compression
