import requests
import logging
from urllib.parse import urlparse
from typing import Dict, Any

logger = logging.getLogger("app.layers.session")

class SessionLayer:
    def __init__(self, target: str):
        self.target = target
        self.parsed_url = urlparse(target)
        if not self.parsed_url.scheme:
            self.target = f"http://{self.target}"
        self.hostname = self.parsed_url.netloc or self.parsed_url.path

    def analyze(self) -> Dict[str, Any]:
        logger.info(f"Starting Layer 5 analysis for {self.target}")
        return {
            "keep_alive": self._check_keep_alive(),
            "cookies": self._analyze_cookies(),
            "websocket_support": self._check_websocket_support()
        }

    def _check_keep_alive(self) -> bool:
        try:
            session = requests.Session()
            response = session.head(self.target, timeout=5)
            # Check Connection header
            connection_header = response.headers.get("Connection", "").lower()
            if "keep-alive" in connection_header:
                return True
            # HTTP/1.1 defaults to keep-alive unless close is specified
            if response.raw.version == 11 and "close" not in connection_header:
                return True
            return False
        except Exception:
            return False

    def _analyze_cookies(self) -> Dict[str, Any]:
        cookie_analysis = {}
        try:
            session = requests.Session()
            response = session.get(self.target, timeout=5)
            for cookie in session.cookies:
                cookie_analysis[cookie.name] = {
                    "secure": cookie.secure,
                    "httponly": cookie.has_nonstandard_attr("HttpOnly") or cookie.has_nonstandard_attr("httponly"),
                    "domain": cookie.domain,
                    "path": cookie.path,
                    "expires": cookie.expires
                }
        except Exception as e:
            logger.error(f"Cookie analysis failed: {e}")
        return cookie_analysis

    def _check_websocket_support(self) -> bool:
        # Simple heuristic: check if Upgrade header is allowed or common WS paths exist
        # A real check would involve trying to connect via WS, but that might be intrusive.
        # We will try a simple connection attempt to the root with Upgrade headers.
        try:
            # We can't easily test WS without a known endpoint, but we can check if the server 
            # responds with 101 Switching Protocols if we try to upgrade.
            # However, most root URLs won't be WS endpoints.
            # We will just return "Unknown" or false for now unless we find a specific indicator.
            return False 
        except Exception:
            return False
