"""SQLAlchemy ORM models for NEERKAVAL."""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database.database import Base
import enum


class RoleEnum(str, enum.Enum):
    CITIZEN = "CITIZEN"
    OFFICER = "OFFICER"
    RESCUE = "RESCUE"
    ADMIN = "ADMIN"


class RiskLevel(str, enum.Enum):
    NORMAL = "NORMAL"
    CAUTION = "CAUTION"
    WARNING = "WARNING"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DataStatus(str, enum.Enum):
    LIVE = "LIVE"
    CACHED = "CACHED"
    FORECAST = "FORECAST"
    DEMO = "DEMO"
    UNAVAILABLE = "UNAVAILABLE"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(200))
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(RoleEnum), default=RoleEnum.CITIZEN, nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    name_ta = Column(String(200))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text)
    capacity = Column(Integer, default=0)
    available_spaces = Column(Integer, default=0)
    status = Column(String(50), default="OPEN")  # OPEN, FULL, CLOSED
    has_medical = Column(Boolean, default=False)
    has_water = Column(Boolean, default=True)
    has_food = Column(Boolean, default=True)
    is_accessible = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class WeatherObservation(Base):
    __tablename__ = "weather_observations"
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature_c = Column(Float)
    humidity_percent = Column(Float)
    apparent_temp_c = Column(Float)
    precipitation_mm = Column(Float)
    rain_mm = Column(Float)
    wind_kmh = Column(Float)
    wind_direction = Column(Float)
    wind_gusts_kmh = Column(Float)
    weather_code = Column(Integer)
    observed_at = Column(DateTime)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source = Column(String(100), default="Open-Meteo")
    data_status = Column(String(20), default="LIVE")
    is_demo = Column(Boolean, default=False)


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    ward_id = Column(String(50))
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(SAEnum(RiskLevel), nullable=False)
    lead_time_minutes = Column(Integer)
    peak_time = Column(String(10))
    factors_json = Column(Text)  # JSON string of factors
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"
    id = Column(Integer, primary_key=True, index=True)
    request_type = Column(String(50), nullable=False)  # RESCUE, BOAT, MEDICAL, PEOPLE_TRAPPED
    latitude = Column(Float)
    longitude = Column(Float)
    message = Column(Text)
    network_status = Column(String(50))
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(50), nullable=False)  # FLOOD_WATER, BRIDGE_BLOCKED, etc.
    latitude = Column(Float)
    longitude = Column(Float)
    description = Column(Text)
    status = Column(String(50), default="PENDING")  # PENDING, REVIEWED, RESOLVED
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RoadHazard(Base):
    __tablename__ = "road_hazards"
    id = Column(Integer, primary_key=True, index=True)
    hazard_type = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, CLEARED
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    title_ta = Column(String(200))
    message = Column(Text, nullable=False)
    message_ta = Column(Text)
    severity = Column(String(50), default="WARNING")
    affected_area = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RescueTeam(Base):
    __tablename__ = "rescue_teams"
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), nullable=False)
    status = Column(String(50), default="AVAILABLE")  # AVAILABLE, ON_MISSION, OFFLINE
    assigned_incident = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)
    is_demo = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class SystemEvent(Base):
    __tablename__ = "system_events"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    message = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    action = Column(String(200), nullable=False)
    details = Column(Text)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
