import socket
import requests
import logging
from urllib.parse import urlparse
import dns.resolver
from typing import Dict, Any, List

logger = logging.getLogger("app.layers.application")

class ApplicationLayer:
    def __init__(self, target: str):
        self.target = target
        self.parsed_url = urlparse(target)
        self.hostname = self.parsed_url.netloc or self.parsed_url.path
        self.scheme = self.parsed_url.scheme or "http"
        
        # Ensure target has scheme for requests
        if not self.parsed_url.scheme:
            self.target = f"http://{self.target}"

    def analyze(self) -> Dict[str, Any]:
        logger.info(f"Starting Layer 7 analysis for {self.target}")
        results = {
            "dns": self._analyze_dns(),
            "http": self._analyze_http(),
            "cms": {}, # Placeholder, populated in _analyze_http or separate method
            "security_headers": {},
            "robots_txt": self._fetch_robots_txt()
        }
        return results

    def _fetch_robots_txt(self) -> Dict[str, Any]:
        try:
            robots_url = f"{self.scheme}://{self.hostname}/robots.txt"
            response = requests.get(robots_url, timeout=5)
            if response.status_code == 200:
                return {
                    "present": True,
                    "content": response.text[:500] + "..." if len(response.text) > 500 else response.text,
                    "url": robots_url
                }
            return {"present": False, "status": response.status_code}
        except Exception:
            return {"present": False, "error": "Failed to fetch"}

    def _analyze_dns(self) -> Dict[str, List[str]]:
        records = {}
        try:
            for qtype in ['A', 'AAAA', 'CNAME', 'MX', 'TXT']:
                try:
                    answers = dns.resolver.resolve(self.hostname, qtype)
                    records[qtype] = [str(r) for r in answers]
                except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.LifetimeTimeout):
                    pass
        except Exception as e:
            logger.error(f"DNS Analysis failed: {e}")
            records["error"] = str(e)
        return records

    def _analyze_http(self) -> Dict[str, Any]:
        http_info = {}
        try:
            response = requests.get(self.target, timeout=10, allow_redirects=True)
            http_info = {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "cookies": response.cookies.get_dict(),
                "encoding": response.encoding,
                "content_type": response.headers.get("Content-Type"),
                "server": response.headers.get("Server"),
                "redirect_history": [r.url for r in response.history]
            }
            
            # CMS Detection (Basic Fingerprinting)
            http_info["cms"] = self._detect_cms(response)
            
            # Security Headers
            http_info["security_headers"] = self._check_security_headers(response.headers)
            
        except requests.RequestException as e:
            logger.error(f"HTTP Analysis failed: {e}")
            http_info["error"] = str(e)
        
        return http_info

    def _detect_cms(self, response: requests.Response) -> Dict[str, bool]:
        content = response.text.lower()
        headers = response.headers
        
        cms = {
            "wordpress": "wp-content" in content or "wordpress" in headers.get("X-Powered-By", "").lower(),
            "laravel": "laravel" in headers.get("X-Powered-By", "").lower() or "laravel_session" in response.cookies,
            "nextjs": "_next" in content or "x-nextjs-cache" in headers.get("X-Powered-By", "").lower() or "__next" in content,
            "django": "csrftoken" in response.cookies,
        }
        # Filter only detected CMS
        return {k: v for k, v in cms.items() if v}

    def _check_security_headers(self, headers: Dict[str, str]) -> Dict[str, Any]:
        security_headers = {
            "Content-Security-Policy": headers.get("Content-Security-Policy"),
            "Strict-Transport-Security": headers.get("Strict-Transport-Security"),
            "X-Frame-Options": headers.get("X-Frame-Options"),
            "X-Content-Type-Options": headers.get("X-Content-Type-Options"),
            "Referrer-Policy": headers.get("Referrer-Policy"),
            "Permissions-Policy": headers.get("Permissions-Policy")
        }
        
        analysis = {}
        for header, value in security_headers.items():
            analysis[header] = {
                "present": value is not None,
                "value": value
            }
        return analysis
