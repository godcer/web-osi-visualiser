import logging
from typing import Dict, Any, List

logger = logging.getLogger("app.services.ai_analyst")

class AIAnalystService:
    def __init__(self, analysis_data: Dict[str, Any]):
        self.data = analysis_data
        self.score = 100
        self.findings = []
        self.summary = []

    def analyze(self) -> Dict[str, Any]:
        logger.info("Starting AI Threat Analysis")
        
        # Run rule sets
        self._analyze_layer_7()
        self._analyze_layer_6()
        self._analyze_layer_5()
        self._analyze_layer_4()
        self._analyze_layer_3()
        
        # Normalize score
        self.score = max(0, min(100, self.score))
        
        # Generate Executive Summary
        self._generate_summary()
        
        return {
            "score": self.score,
            "findings": self.findings,
            "summary": self.summary,
            "risk_level": self._get_risk_level()
        }

    def _add_finding(self, severity: str, message: str, penalty: int):
        self.findings.append({
            "severity": severity,
            "message": message,
            "penalty": penalty
        })
        self.score -= penalty

    def _analyze_layer_7(self):
        l7 = self.data.get("layer7", {})
        http = l7.get("http", {})
        headers = http.get("headers", {})
        sec_headers = l7.get("security_headers", {})
        
        # Check Security Headers
        missing_headers = []
        for header, info in sec_headers.items():
            if not info.get("present"):
                missing_headers.append(header)
        
        if missing_headers:
            self._add_finding("Medium", f"Missing security headers: {', '.join(missing_headers)}", 5 * len(missing_headers))

        # CMS Detection
        cms = l7.get("cms", {})
        if cms:
            self._add_finding("Info", f"CMS Detected: {', '.join(cms.keys())}. Ensure it is patched.", 0)
            if "wordpress" in cms:
                self._add_finding("Low", "WordPress detected. frequent target for bots.", 2)

        # Server Header Leakage
        if "Server" in headers:
            self._add_finding("Low", f"Server header leaked: {headers['Server']}", 2)

    def _analyze_layer_6(self):
        l6 = self.data.get("layer6", {})
        tls = l6.get("tls", {})
        
        if not tls.get("valid"):
            self._add_finding("Critical", "TLS Certificate is invalid or missing.", 50)
            return

        # Check TLS Version
        version = tls.get("version", "")
        if "TLSv1.0" in version or "TLSv1.1" in version:
            self._add_finding("High", f"Deprecated TLS version detected: {version}", 30)
        elif "TLSv1.3" not in version and "TLSv1.2" not in version:
             self._add_finding("Medium", f"Older TLS version: {version}", 10)

        # Check Expiry
        days = tls.get("days_remaining", 0)
        if days < 7:
            self._add_finding("High", f"Certificate expires in {days} days.", 20)
        elif days < 30:
            self._add_finding("Medium", f"Certificate expires soon ({days} days).", 10)

    def _analyze_layer_5(self):
        l5 = self.data.get("layer5", {})
        cookies = l5.get("cookies", {})
        
        for name, cookie in cookies.items():
            if not cookie.get("secure"):
                self._add_finding("Medium", f"Cookie '{name}' missing 'Secure' flag.", 10)
            if not cookie.get("httponly"):
                self._add_finding("Low", f"Cookie '{name}' missing 'HttpOnly' flag.", 5)

    def _analyze_layer_4(self):
        l4 = self.data.get("layer4", {})
        ports = l4.get("tcp_ports", {})
        
        # Check for non-standard open ports
        risky_ports = [8080, 8443] # Example
        for port, status in ports.items():
            if port in risky_ports and status == "Open":
                self._add_finding("Low", f"Non-standard port {port} is open.", 5)
            if port == 80 and status == "Open":
                 self._add_finding("Info", "Port 80 (HTTP) is open. Ensure redirect to HTTPS.", 0)

    def _analyze_layer_3(self):
        l3 = self.data.get("layer3", {})
        cdn = l3.get("cdn_detection", "Unknown")
        
        if cdn != "Unknown / Direct":
            self._add_finding("Info", f"Traffic routed through {cdn} CDN. This provides DDoS protection.", 0)
            self.score += 5 # Bonus for CDN
        else:
            self._add_finding("Low", "No CDN detected. Origin IP might be exposed.", 5)

    def _get_risk_level(self) -> str:
        if self.score >= 90: return "A+ (Excellent)"
        if self.score >= 80: return "A (Good)"
        if self.score >= 70: return "B (Fair)"
        if self.score >= 60: return "C (Warning)"
        if self.score >= 50: return "D (High Risk)"
        return "F (Critical)"

    def _generate_summary(self):
        self.summary.append(f"Target analysis completed with a Security Score of {self.score}/100 ({self._get_risk_level()}).")
        
        critical_issues = [f['message'] for f in self.findings if f['severity'] in ['Critical', 'High']]
        if critical_issues:
            self.summary.append(f"CRITICAL ATTENTION REQUIRED: {'; '.join(critical_issues[:2])}.")
        
        if self.score > 80:
            self.summary.append("The target demonstrates strong security posture with modern encryption and security headers.")
        else:
            self.summary.append("Several configuration hardening opportunities were identified across the OSI stack.")
