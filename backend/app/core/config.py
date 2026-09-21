"""Application configuration loaded from environment variables."""

import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    app_name: str = "NEERKAVAL"
    app_env: str = "development"
    app_port: int = 8000
    app_mode: str = "LIVE"  # LIVE or DEMO

    database_url: str = "sqlite:///./neerkaval.db"

    openmeteo_base_url: str = "https://api.open-meteo.com/v1/forecast"
    weather_cache_ttl_seconds: int = 600

    geocoding_provider: str = "Open-Meteo"
    routing_provider: str = "OSRM"

    sms_provider: str = "development"
    sms_api_key: str = ""

    jwt_secret: str = "change-this-in-production-use-a-strong-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    cors_origins: str = "*"

    ml_model_status: str = "prototype"
    ml_model_path: str = "./models/flood_risk_model.pkl"

    @field_validator("app_mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        v = v.upper().strip()
        if v not in ("LIVE", "DEMO"):
            return "LIVE"
        return v

    @property
    def cors_origin_list(self) -> List[str]:
        if self.cors_origins == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
