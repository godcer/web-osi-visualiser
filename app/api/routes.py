from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from app.schemas.analysis import AnalysisRequest, AnalysisResult
from app.services.analyzer import AnalyzerService
import logging
import asyncio
import json

router = APIRouter()
logger = logging.getLogger("app.api.routes")

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_url(request: AnalysisRequest):
    try:
        service = AnalyzerService(request.url)
        result = await service.analyze_all()
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                request_data = json.loads(data)
                url = request_data.get("url")
                if not url:
                    await websocket.send_json({"error": "URL is required"})
                    continue
                
                await websocket.send_json({"status": "starting", "message": f"Analyzing {url}..."})
                
                service = AnalyzerService(url)
                
                # In a real-time scenario, we might want to stream results layer by layer.
                # For now, we'll simulate progress or send the full result when done.
                # To make it "real-time" feeling, we can send partial updates if we refactor the service.
                # But per requirements, "Animates updates with WebSockets" can be achieved by sending the full JSON
                # and letting the frontend animate the cards.
                
                result = await service.analyze_all()
                await websocket.send_json({"status": "complete", "data": result})
                
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON"})
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await websocket.send_json({"error": str(e)})
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
