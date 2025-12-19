import time
import logging
from app.layers.application import ApplicationLayer
from app.layers.presentation import PresentationLayer
from app.layers.session import SessionLayer
from app.layers.transport import TransportLayer
from app.layers.network import NetworkLayer
from app.layers.phys_link import PhysLinkLayer
from app.services.ai_analyst import AIAnalystService
from app.services.education import EducationService

logger = logging.getLogger("app.services.analyzer")

class AnalyzerService:
    def __init__(self, target: str):
        self.target = target

    async def analyze_all(self):
        logger.info(f"Starting full analysis for {self.target}")
        start_time = time.time()
        
        # Initialize layers
        l7 = ApplicationLayer(self.target)
        l6 = PresentationLayer(self.target)
        l5 = SessionLayer(self.target)
        l4 = TransportLayer(self.target)
        l3 = NetworkLayer(self.target)
        l12 = PhysLinkLayer()

        # Execute analysis (could be async in future for parallel execution)
        # For now, we run them sequentially or wrap in threadpool if blocking is an issue.
        # Given the requirements, we'll run them directly.
        
        results = {
            "layer7": l7.analyze(),
            "layer6": l6.analyze(),
            "layer5": l5.analyze(),
            "layer4": l4.analyze(),
            "layer3": l3.analyze(),
            "layer1_2": l12.analyze(),
            "timestamp": time.time()
        }
        
        # Run AI Analysis
        ai = AIAnalystService(results)
        results["ai_analysis"] = ai.analyze()
        
        # Run Education Enrichment
        edu = EducationService()
        
        # Enrich L6
        if results["layer6"]["tls"].get("cipher_suite"):
            results["layer6"]["cipher_breakdown"] = edu.decode_cipher_suite(results["layer6"]["tls"]["cipher_suite"])
            
        # Enrich L5
        results["layer5"]["cookie_education"] = {
            "Secure": edu.explain_cookie_flag("Secure"),
            "HttpOnly": edu.explain_cookie_flag("HttpOnly")
        }
        
        # Enrich L4
        results["layer4"]["port_descriptions"] = {}
        for port in results["layer4"]["tcp_ports"]:
            results["layer4"]["port_descriptions"][port] = edu.explain_port(port)

        # Generate Journey
        results["journey"] = edu.generate_journey(results)

        logger.info(f"Analysis completed in {time.time() - start_time:.2f}s")
        return results
