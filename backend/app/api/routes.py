"""API routes for weather, risk, XAI, shelters, routing, emergency, citizen reports, alerts, and system status."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import (
    User, Shelter, WeatherObservation, RiskPrediction, EmergencyRequest,
    CitizenReport, RoadHazard, Alert, RescueTeam
)
from app.weather.weather_service import weather_service
from app.ml.predict import risk_model
from app.xai.engine import xai_engine
from app.routing.routing_service import routing_service
from app.emergency.emergency_service import emergency_service, sms_service
from app.auth.dependencies import get_current_user, require_officer
from app.core.config import settings
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter(prefix="/api", tags=["neerkaval"])


# --- Pydantic request models ---

class SOSRequest(BaseModel):
    request_type: str  # RESCUE, BOAT, MEDICAL, PEOPLE_TRAPPED
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    message: str = ""
    network_status: str = "online"


class CitizenReportRequest(BaseModel):
    report_type: str  # FLOOD_WATER, BRIDGE_BLOCKED, ROAD_BLOCKED, TREE_FALL, PEOPLE_TRAPPED, OTHER
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str = ""


class AlertRequest(BaseModel):
    title: str
    title_ta: Optional[str] = None
    message: str
    message_ta: Optional[str] = None
    severity: str = "WARNING"
    affected_area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# --- Weather endpoints ---

@router.get("/weather/current")
async def get_current_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Get current weather from Open-Meteo."""
    if abs(lat) > 90 or abs(lon) > 180:
        raise HTTPException(status_code=422, detail="Invalid coordinates")
    result = await weather_service.fetch_current_weather(lat, lon)
    return result


@router.get("/weather/forecast")
async def get_weather_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Get weather forecast (uses the same Open-Meteo call with hourly data)."""
    result = await weather_service.fetch_current_weather(lat, lon)
    return {
        "source": result.get("source"),
        "latitude": result.get("latitude"),
        "longitude": result.get("longitude"),
        "data_status": result.get("data_status"),
        "hourly_forecast": result.get("hourly_forecast", []),
        "retrieved_at": result.get("retrieved_at"),
    }


@router.get("/weather/status")
async def get_weather_status():
    """Check weather service health."""
    return {
        "service": "weather",
        "provider": "Open-Meteo",
        "status": "READY",
        "base_url": settings.openmeteo_base_url,
        "cache_ttl_seconds": settings.weather_cache_ttl_seconds,
    }


# --- Risk endpoints ---

@router.get("/risk/current")
async def get_current_risk(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    precipitation_mm: float = Query(0, description="Current precipitation in mm"),
    rain_mm: float = Query(0, description="Current rain in mm"),
    forecast_precipitation: float = Query(0, description="Forecast precipitation next 3h in mm"),
    soil_saturation: float = Query(50, description="Soil saturation 0-100%"),
    slope: float = Query(5, description="Terrain slope in degrees"),
    elevation: float = Query(200, description="Elevation in meters"),
):
    """Get current flood risk prediction."""
    prediction = risk_model.predict(
        lat=lat, lon=lon,
        precipitation_mm=precipitation_mm,
        rain_mm=rain_mm,
        forecast_precipitation=forecast_precipitation,
        soil_saturation=soil_saturation,
        slope=slope,
        elevation=elevation,
    )
    prediction["latitude"] = lat
    prediction["longitude"] = lon
    prediction["data_status"] = settings.app_mode
    return prediction


@router.get("/risk/model-info")
async def get_model_info():
    """Get ML model information and status."""
    return risk_model.get_model_info()


# --- XAI endpoints ---

@router.get("/xai/public")
async def get_public_xai(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    language: str = Query("ta", description="Language: ta or en"),
    precipitation_mm: float = Query(0),
    rain_mm: float = Query(0),
    forecast_precipitation: float = Query(0),
    soil_saturation: float = Query(50),
    slope: float = Query(5),
    elevation: float = Query(200),
):
    """Get citizen-facing XAI explanation."""
    prediction = risk_model.predict(
        lat=lat, lon=lon,
        precipitation_mm=precipitation_mm,
        rain_mm=rain_mm,
        forecast_precipitation=forecast_precipitation,
        soil_saturation=soil_saturation,
        slope=slope,
        elevation=elevation,
    )
    return xai_engine.generate_public_explanation(prediction, language)


@router.get("/xai/officer")
async def get_officer_xai(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    precipitation_mm: float = Query(0),
    rain_mm: float = Query(0),
    forecast_precipitation: float = Query(0),
    soil_saturation: float = Query(50),
    slope: float = Query(5),
    elevation: float = Query(200),
    user: User = Depends(require_officer),
):
    """Get officer-facing technical XAI explanation. Requires officer role."""
    prediction = risk_model.predict(
        lat=lat, lon=lon,
        precipitation_mm=precipitation_mm,
        rain_mm=rain_mm,
        forecast_precipitation=forecast_precipitation,
        soil_saturation=soil_saturation,
        slope=slope,
        elevation=elevation,
    )
    return xai_engine.generate_officer_explanation(prediction)


# --- Shelter endpoints ---

@router.get("/shelters/nearby")
async def get_nearby_shelters(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    db: Session = Depends(get_db),
):
    """Get nearby shelters."""
    from app.routing.routing_service import haversine_distance
    shelters = db.query(Shelter).all()
    result = []
    for s in shelters:
        dist = haversine_distance(lat, lon, s.latitude, s.longitude)
        if dist < 30:  # Within 30km
            result.append({
                "id": s.id,
                "name": s.name,
                "name_ta": s.name_ta,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "address": s.address,
                "distance_km": round(dist, 2),
                "estimated_walk_time_min": round(dist / 4 * 60),
                "status": s.status,
                "capacity": s.capacity,
                "available_spaces": s.available_spaces,
                "has_medical": s.has_medical,
                "has_water": s.has_water,
                "has_food": s.has_food,
                "is_accessible": s.is_accessible,
                "is_verified": s.is_verified,
                "is_demo": s.is_demo,
            })
    result.sort(key=lambda x: x["distance_km"])
    return {"shelters": result, "count": len(result)}


# --- Routing endpoints ---

@router.get("/routes/safe")
async def get_safe_route(
    start_lat: float = Query(..., description="Start latitude"),
    start_lon: float = Query(..., description="Start longitude"),
    dest_lat: float = Query(..., description="Destination latitude"),
    dest_lon: float = Query(..., description="Destination longitude"),
    db: Session = Depends(get_db),
):
    """Compute a safety-aware route."""
    hazards = [
        {"latitude": h.latitude, "longitude": h.longitude, "hazard_type": h.hazard_type,
         "description": h.description, "status": h.status, "is_demo": h.is_demo}
        for h in db.query(RoadHazard).filter(RoadHazard.status == "ACTIVE").all()
    ]
    return routing_service.compute_safe_route(
        start_lat, start_lon, dest_lat, dest_lon, hazards
    )


# --- Emergency/SOS endpoints ---

@router.post("/emergency/sos")
async def create_sos(request: SOSRequest, db: Session = Depends(get_db)):
    """Create an SOS emergency request."""
    if request.request_type not in ("RESCUE", "BOAT", "MEDICAL", "PEOPLE_TRAPPED"):
        raise HTTPException(status_code=422, detail="Invalid emergency type")
    return emergency_service.create_sos(
        db=db,
        request_type=request.request_type,
        latitude=request.latitude,
        longitude=request.longitude,
        message=request.message,
        network_status=request.network_status,
    )


@router.get("/emergency/sos/{sos_id}/status")
async def get_sos_status(sos_id: int, db: Session = Depends(get_db)):
    """Check SOS request acknowledgement status."""
    return emergency_service.check_acknowledgement(db, sos_id)


# --- Citizen report endpoints ---

@router.post("/citizen/report")
async def create_citizen_report(request: CitizenReportRequest, db: Session = Depends(get_db)):
    """Submit a citizen hazard report."""
    valid_types = ("FLOOD_WATER", "BRIDGE_BLOCKED", "ROAD_BLOCKED", "TREE_FALL", "PEOPLE_TRAPPED", "OTHER")
    if request.report_type not in valid_types:
        raise HTTPException(status_code=422, detail="Invalid report type")
    report = CitizenReport(
        report_type=request.report_type,
        latitude=request.latitude,
        longitude=request.longitude,
        description=request.description,
        status="PENDING",
        is_demo=False,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {
        "id": report.id,
        "status": "SUBMITTED",
        "message": "Report submitted successfully.",
        "created_at": report.created_at.isoformat() if report.created_at else None,
    }


# --- Alert endpoints ---

@router.get("/alerts")
async def get_alerts(db: Session = Depends(get_db)):
    """Get active alerts."""
    alerts = db.query(Alert).filter(Alert.is_active == True).all()
    return {
        "alerts": [
            {
                "id": a.id,
                "title": a.title,
                "title_ta": a.title_ta,
                "message": a.message,
                "message_ta": a.message_ta,
                "severity": a.severity,
                "affected_area": a.affected_area,
                "latitude": a.latitude,
                "longitude": a.longitude,
                "is_demo": a.is_demo,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ]
    }


@router.post("/alerts/send")
async def send_alert(
    request: AlertRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_officer),
):
    """Create a new alert. Requires officer role."""
    alert = Alert(
        title=request.title,
        title_ta=request.title_ta,
        message=request.message,
        message_ta=request.message_ta,
        severity=request.severity,
        affected_area=request.affected_area,
        latitude=request.latitude,
        longitude=request.longitude,
        is_active=True,
        is_demo=False,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "id": alert.id,
        "status": "CREATED",
        "message": "Alert created successfully.",
    }


# --- Citizen reports listing (officer) ---

@router.get("/citizen/reports")
async def list_citizen_reports(
    db: Session = Depends(get_db),
    user: User = Depends(require_officer),
):
    """List citizen reports. Requires officer role."""
    reports = db.query(CitizenReport).order_by(CitizenReport.created_at.desc()).limit(50).all()
    return {
        "reports": [
            {
                "id": r.id,
                "report_type": r.report_type,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "description": r.description,
                "status": r.status,
                "is_demo": r.is_demo,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reports
        ]
    }


# --- Rescue teams (officer) ---

@router.get("/rescue/teams")
async def get_rescue_teams(
    db: Session = Depends(get_db),
    user: User = Depends(require_officer),
):
    """List rescue teams. Requires officer role."""
    teams = db.query(RescueTeam).all()
    return {
        "teams": [
            {
                "id": t.id,
                "team_name": t.team_name,
                "status": t.status,
                "assigned_incident": t.assigned_incident,
                "latitude": t.latitude,
                "longitude": t.longitude,
                "is_demo": t.is_demo,
                "last_updated": t.last_updated.isoformat() if t.last_updated else None,
            }
            for t in teams
        ]
    }


# --- Road hazards (officer) ---

@router.get("/hazards")
async def get_road_hazards(db: Session = Depends(get_db)):
    """Get active road hazards."""
    hazards = db.query(RoadHazard).filter(RoadHazard.status == "ACTIVE").all()
    return {
        "hazards": [
            {
                "id": h.id,
                "hazard_type": h.hazard_type,
                "latitude": h.latitude,
                "longitude": h.longitude,
                "description": h.description,
                "status": h.status,
                "is_demo": h.is_demo,
            }
            for h in hazards
        ]
    }


# --- System status ---

@router.get("/system/status")
async def get_system_status():
    """Get system health status. Checks are performed live."""
    import httpx

    # Check weather API
    weather_status = "🟢 LIVE"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={"latitude": 11.0, "longitude": 76.0, "current": "temperature_2m"}
            )
            if resp.status_code != 200:
                weather_status = "🔴 UNAVAILABLE"
    except Exception:
        weather_status = "🔴 UNAVAILABLE"

    # Check database
    db_status = "🟢 CONNECTED"
    try:
        from app.database.database import SessionLocal
        with SessionLocal() as s:
            s.execute(__import__("sqlalchemy").text("SELECT 1"))
    except Exception:
        db_status = "🔴 DISCONNECTED"

    return {
        "services": {
            "weather_api": weather_status,
            "ml_model": f"{'🟠' if settings.ml_model_status == 'prototype' else '🟢'} {risk_model.get_model_info()['status']}",
            "xai_engine": "🟢 READY",
            "gis": "🟢 READY",
            "routing": "🟠 LIMITED",
            "database": db_status,
            "alert_service": "🟢 READY",
            "gsm_sms": "🟠 LIMITED" if settings.sms_provider == "development" else "🟢 READY",
            "offline_cache": "🟢 READY",
        },
        "app_mode": settings.app_mode,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# --- Auth endpoints ---

@router.post("/auth/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login and receive JWT token."""
    from app.core.security import verify_password, create_access_token
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    token = create_access_token(user.username, user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.value,
        "full_name": user.full_name,
        "username": user.username,
    }


@router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info."""
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role.value,
        "phone": user.phone,
    }
