from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class Layer7Schema(BaseModel):
    dns: Dict[str, List[str]]
    http: Dict[str, Any]
    cms: Dict[str, bool]
    security_headers: Dict[str, Any]
    robots_txt: Optional[Dict[str, Any]] = None

class Layer6Schema(BaseModel):
    tls: Dict[str, Any]
    compression: Dict[str, bool]
    cipher_breakdown: Optional[Dict[str, str]] = None

class Layer5Schema(BaseModel):
    keep_alive: bool
    cookies: Dict[str, Any]
    websocket_support: bool
    cookie_education: Optional[Dict[str, str]] = None

class Layer4Schema(BaseModel):
    tcp_ports: Dict[int, str]
    udp_quic: str
    latency_tcp_handshake: float
    port_descriptions: Optional[Dict[int, str]] = None

class Layer3Schema(BaseModel):
    ip_address: Optional[str]
    geolocation: Dict[str, str]
    ping_latency: float
    traceroute: List[Dict[str, Any]]
    cdn_detection: str

class Layer12Schema(BaseModel):
    interfaces: Dict[str, Any]
    default_gateway: Dict[str, Any]

class AISchema(BaseModel):
    score: int
    findings: List[Dict[str, Any]]
    summary: List[str]
    risk_level: str

class AnalysisResult(BaseModel):
    layer7: Layer7Schema
    layer6: Layer6Schema
    layer5: Layer5Schema
    layer4: Layer4Schema
    layer3: Layer3Schema
    layer1_2: Layer12Schema
    ai_analysis: AISchema
    journey: List[Dict[str, Any]]
    timestamp: float

class AnalysisRequest(BaseModel):
    url: str
