import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_analyze_endpoint():
    # Mocking the service would be better, but for integration test we can try a real call 
    # or just check if endpoint exists and validates input.
    # We'll test validation failure.
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/analyze", json={"url": ""})
    # Should fail validation or return error
    assert response.status_code == 422 or response.status_code == 500

@pytest.mark.asyncio
async def test_root_static():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
