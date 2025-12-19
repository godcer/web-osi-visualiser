import netifaces
import logging
from typing import Dict, Any

logger = logging.getLogger("app.layers.phys_link")

class PhysLinkLayer:
    def __init__(self):
        pass

    def analyze(self) -> Dict[str, Any]:
        logger.info("Starting Layer 1 & 2 analysis (Local Interface)")
        return {
            "interfaces": self._get_interfaces_info(),
            "default_gateway": self._get_default_gateway()
        }

    def _get_interfaces_info(self) -> Dict[str, Any]:
        interfaces = {}
        for iface in netifaces.interfaces():
            addrs = netifaces.ifaddresses(iface)
            mac = addrs.get(netifaces.AF_LINK)
            ip = addrs.get(netifaces.AF_INET)
            
            if mac:
                interfaces[iface] = {
                    "mac": mac[0]['addr'],
                    "ip": ip[0]['addr'] if ip else "No IPv4"
                }
        return interfaces

    def _get_default_gateway(self) -> Dict[str, Any]:
        try:
            gws = netifaces.gateways()
            default = gws.get('default', {}).get(netifaces.AF_INET)
            if default:
                return {"gateway_ip": default[0], "interface": default[1]}
        except Exception:
            pass
        return {}
