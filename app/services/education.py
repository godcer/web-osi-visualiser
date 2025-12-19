import logging
from typing import Dict, Any

logger = logging.getLogger("app.services.education")

class EducationService:
    def __init__(self):
        self.header_explanations = {
            "Server": "Reveals the software used by the web server (e.g., Nginx, Apache). Attackers use this to find specific vulnerabilities.",
            "X-Powered-By": "Indicates the technology stack (e.g., PHP, Express). Hiding this reduces the attack surface.",
            "Strict-Transport-Security": "Enforces the use of HTTPS. Prevents downgrade attacks where a hacker forces a user to use HTTP.",
            "Content-Security-Policy": "A powerful allow-list for content sources. Prevents Cross-Site Scripting (XSS) attacks.",
            "X-Frame-Options": "Prevents 'Clickjacking' attacks by stopping the site from being embedded in an iframe.",
            "Set-Cookie": "Delivers a small piece of data to be stored by the browser. Secure flags are crucial here."
        }
        
        self.port_descriptions = {
            80: "HTTP (HyperText Transfer Protocol). Unencrypted web traffic. Vulnerable to eavesdropping.",
            443: "HTTPS (HTTP Secure). Encrypted web traffic using TLS/SSL. The standard for secure web browsing.",
            8080: "Alternative HTTP port. Often used for web proxies or caching servers.",
            8443: "Alternative HTTPS port. Often used for management interfaces or Tomcat servers.",
            21: "FTP (File Transfer Protocol). Unencrypted file transfer. Highly insecure.",
            22: "SSH (Secure Shell). Encrypted remote login. The standard for server administration.",
            25: "SMTP (Simple Mail Transfer Protocol). Used for sending emails.",
            53: "DNS (Domain Name System). Translates domain names to IP addresses."
        }
        
        self.cookie_flags = {
            "Secure": "Ensures the cookie is only sent over encrypted (HTTPS) connections. Prevents theft via packet sniffing.",
            "HttpOnly": "Prevents JavaScript from accessing the cookie. Crucial defense against XSS cookie theft.",
            "SameSite": "Controls when cookies are sent with cross-site requests. Protects against CSRF attacks."
        }

    def explain_header(self, header_name: str) -> str:
        return self.header_explanations.get(header_name, "A standard HTTP header used for metadata exchange.")

    def explain_port(self, port: int) -> str:
        return self.port_descriptions.get(port, "A network port used for specific services. Non-standard ports may indicate custom applications.")

    def explain_cookie_flag(self, flag: str) -> str:
        return self.cookie_flags.get(flag, "A security attribute for cookies.")

    def decode_cipher_suite(self, suite: str) -> Dict[str, str]:
        # Example: TLS_AES_128_GCM_SHA256
        # Example: ECDHE-RSA-AES128-GCM-SHA256
        if not suite:
            return {"description": "Unknown Cipher Suite"}
            
        parts = suite.replace("_", "-").split("-")
        
        explanation = {
            "name": suite,
            "protocol": "TLS",
            "key_exchange": "Unknown",
            "encryption": "Unknown",
            "mac": "Unknown",
            "strength": "Unknown"
        }
        
        # Simple heuristics for decoding
        if "ECDHE" in suite: explanation["key_exchange"] = "ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) - Forward Secrecy"
        elif "RSA" in suite: explanation["key_exchange"] = "RSA - No Forward Secrecy (Older)"
        
        if "AES" in suite and "128" in suite: explanation["encryption"] = "AES-128 (Advanced Encryption Standard)"
        elif "AES" in suite and "256" in suite: explanation["encryption"] = "AES-256 (Military Grade)"
        elif "CHACHA20" in suite: explanation["encryption"] = "ChaCha20 (High Performance Mobile)"
        
        if "GCM" in suite: explanation["mode"] = "GCM (Galois/Counter Mode) - Authenticated Encryption"
        elif "CBC" in suite: explanation["mode"] = "CBC (Cipher Block Chaining) - Older, potentially vulnerable"
        
        if "SHA256" in suite: explanation["mac"] = "SHA-256"
        elif "SHA384" in suite: explanation["mac"] = "SHA-384"
        
        return explanation

    def generate_journey(self, results: Dict[str, Any]) -> list:
        journey = []
        target = results.get("layer7", {}).get("http", {}).get("server", "Target Server")
        ip = results.get("layer3", {}).get("ip_address", "Unknown IP")
        
        # Step 1: User Action
        journey.append({
            "step": 1,
            "title": "User Initiates Request",
            "layer": "Layer 7 (Application)",
            "description": "You entered the URL. The browser checks its cache and prepares a request."
        })
        
        # Step 2: DNS Resolution
        journey.append({
            "step": 2,
            "title": "DNS Resolution",
            "layer": "Layer 3 (Network)",
            "description": f"Your computer asked a DNS server to find the IP address for the domain. It returned {ip}."
        })
        
        # Step 3: TCP Handshake
        latency = results.get("layer4", {}).get("latency_tcp_handshake", 0)
        journey.append({
            "step": 3,
            "title": "TCP Handshake",
            "layer": "Layer 4 (Transport)",
            "description": f"A connection was established with the server using a 3-way handshake (SYN, SYN-ACK, ACK). This took {latency}ms."
        })
        
        # Step 4: TLS Handshake
        tls_ver = results.get("layer6", {}).get("tls", {}).get("version", "TLS")
        journey.append({
            "step": 4,
            "title": "TLS Encryption",
            "layer": "Layer 6 (Presentation)",
            "description": f"The browser and server agreed on encryption keys using {tls_ver} to secure your data."
        })
        
        # Step 5: HTTP Request
        status = results.get("layer7", {}).get("http", {}).get("status_code", 200)
        journey.append({
            "step": 5,
            "title": "HTTP Request/Response",
            "layer": "Layer 7 (Application)",
            "description": f"Your browser sent a GET request. The server ({target}) processed it and sent back a {status} response."
        })
        
        return journey
