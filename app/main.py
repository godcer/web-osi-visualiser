from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.logging_config import setup_logging
import logging

# Setup logging
setup_logging()
logger = logging.getLogger("app")

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount static files
import os
from pathlib import Path

# ... (imports)

# Define base path
BASE_DIR = Path(__file__).resolve().parent.parent

# Mount static files
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "frontend")), name="static")

@app.get("/")
async def read_index():
    return FileResponse(str(BASE_DIR / "frontend" / "index.html"))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app_name": settings.APP_NAME}

# Include API Router
from app.api.routes import router as api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
