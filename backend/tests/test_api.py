"""Backend tests for NEERKAVAL.

Tests cover:
- Weather service validation and caching
- Risk prediction model
- XAI engine
- SOS endpoint (no-ack verification)
- Authentication and authorization
- System status
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestRootAndHealth:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "NEERKAVAL"
        assert data["tamil_name"] == "நீர் காவல்"

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestWeatherAPI:
    def test_weather_current_returns_data(self):
        """Weather endpoint should return valid data (LIVE or CACHED)."""
        response = client.get("/api/weather/current?lat=11.0168&lon=76.9558")
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "Open-Meteo"
        assert "data_status" in data
        assert data["data_status"] in ("LIVE", "CACHED", "UNAVAILABLE")

    def test_weather_invalid_coordinates(self):
        """Invalid coordinates should return 422."""
        response = client.get("/api/weather/current?lat=999&lon=999")
        assert response.status_code == 422

    def test_weather_status(self):
        response = client.get("/api/weather/status")
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "Open-Meteo"


class TestRiskEngine:
    def test_risk_current(self):
        response = client.get("/api/risk/current?lat=11.0168&lon=76.9558")
        assert response.status_code == 200
        data = response.json()
        assert "risk_score" in data
        assert "risk_level" in data
        assert data["risk_level"] in ("NORMAL", "CAUTION", "WARNING", "HIGH", "CRITICAL")
        assert "factors" in data
        assert len(data["factors"]) == 5

    def test_model_info(self):
        response = client.get("/api/risk/model-info")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["is_prototype"] is True


class TestXAI:
    def test_public_xai(self):
        response = client.get("/api/xai/public?lat=11.0168&lon=76.9558&language=ta")
        assert response.status_code == 200
        data = response.json()
        assert "risk_label" in data
        assert "why" in data
        assert "what_to_do" in data

    def test_public_xai_english(self):
        response = client.get("/api/xai/public?lat=11.0168&lon=76.9558&language=en")
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "en"


class TestSOS:
    def test_create_sos(self):
        response = client.post("/api/emergency/sos", json={
            "request_type": "RESCUE",
            "latitude": 11.0168,
            "longitude": 76.9558,
            "message": "Need help",
            "network_status": "online"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "RECEIVED"
        assert data["acknowledged"] is False
        assert "not yet been received" in data["message"]

    def test_sos_invalid_type(self):
        response = client.post("/api/emergency/sos", json={
            "request_type": "INVALID",
        })
        assert response.status_code == 422

    def test_sos_status_check(self):
        # Create SOS first
        create_response = client.post("/api/emergency/sos", json={
            "request_type": "MEDICAL",
        })
        sos_id = create_response.json()["sos_id"]

        # Check status
        status_response = client.get(f"/api/emergency/sos/{sos_id}/status")
        assert status_response.status_code == 200
        data = status_response.json()
        assert data["status"] in ("PENDING", "ACKNOWLEDGED")


class TestAuth:
    def test_login_success(self):
        response = client.post("/api/auth/login", json={
            "username": "officer",
            "password": "neerkaval123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "OFFICER"

    def test_login_failure(self):
        response = client.post("/api/auth/login", json={
            "username": "officer",
            "password": "wrongpassword"
        })
        assert response.status_code == 401

    def test_officer_xai_requires_auth(self):
        """Officer XAI endpoint should require authentication."""
        response = client.get("/api/xai/officer?lat=11.0168&lon=76.9558")
        assert response.status_code == 401

    def test_officer_xai_with_auth(self):
        """Officer XAI should work with valid token."""
        login_response = client.post("/api/auth/login", json={
            "username": "officer",
            "password": "neerkaval123"
        })
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/xai/officer?lat=11.0168&lon=76.9558",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "risk_score" in data
        assert "factors" in data


class TestCitizenReport:
    def test_create_report(self):
        response = client.post("/api/citizen/report", json={
            "report_type": "FLOOD_WATER",
            "latitude": 11.0168,
            "longitude": 76.9558,
            "description": "Water rising"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUBMITTED"

    def test_invalid_report_type(self):
        response = client.post("/api/citizen/report", json={
            "report_type": "INVALID"
        })
        assert response.status_code == 422


class TestShelters:
    def test_nearby_shelters(self):
        response = client.get("/api/shelters/nearby?lat=11.0168&lon=76.9558")
        assert response.status_code == 200
        data = response.json()
        assert "shelters" in data
        assert data["count"] >= 0


class TestSystemStatus:
    def test_system_status(self):
        response = client.get("/api/system/status")
        assert response.status_code == 200
        data = response.json()
        assert "services" in data
        assert "weather_api" in data["services"]
        assert "database" in data["services"]
        assert "ml_model" in data["services"]


class TestRouting:
    def test_safe_route(self):
        response = client.get(
            "/api/routes/safe?start_lat=11.0168&start_lon=76.9558&dest_lat=11.0250&dest_lon=76.9650"
        )
        assert response.status_code == 200
        data = response.json()
        assert "distance_km" in data
        assert "status" in data
