"""Weather service — integrates with Open-Meteo API with caching and failure handling."""

import json
import logging
from datetime import datetime, timezone
from typing import Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("neerkaval.weather")

# In-memory cache for weather data
_weather_cache: dict[str, dict] = {}
# key format: f"{lat:.4f},{lon:.4f}"


class WeatherProviderError(Exception):
    """Raised when the weather provider fails."""


class WeatherService:
    """Service for fetching and caching weather data from Open-Meteo."""

    BASE_URL = settings.openmeteo_base_url
    CACHE_TTL = settings.weather_cache_ttl_seconds

    # WMO weather code descriptions
    WMO_CODES = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        56: "Light freezing drizzle", 57: "Dense freezing drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        66: "Light freezing rain", 67: "Heavy freezing rain",
        71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        85: "Slight snow showers", 86: "Heavy snow showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
    }

    def get_weather_description(self, code: int) -> str:
        return self.WMO_CODES.get(code, "Unknown")

    async def fetch_current_weather(self, lat: float, lon: float) -> dict:
        """Fetch current weather from Open-Meteo with caching and failure handling."""
        cache_key = f"{lat:.4f},{lon:.4f}"
        now = datetime.now(timezone.utc)

        # Check cache first
        cached = _weather_cache.get(cache_key)
        if cached and "retrieved_at_dt" in cached:
            cache_age = (now - cached["retrieved_at_dt"]).total_seconds()
            if cache_age < self.CACHE_TTL:
                logger.info(f"Weather cache hit for {cache_key}")
                result = cached.copy()
                result.pop("retrieved_at_dt", None)
                result["data_status"] = "CACHED"
                return result

        # Fetch from Open-Meteo
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": (
                "temperature_2m,relative_humidity_2m,apparent_temperature,"
                "precipitation,rain,showers,weather_code,wind_speed_10m,"
                "wind_direction_10m,wind_gusts_10m"
            ),
            "hourly": (
                "temperature_2m,relative_humidity_2m,precipitation,rain,showers,"
                "precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m"
            ),
            "timezone": "auto",
            "forecast_days": 2,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()

            # Validate response
            if "current" not in data:
                raise WeatherProviderError("Invalid response: missing 'current' field")

            current = data["current"]
            required_fields = [
                "temperature_2m", "relative_humidity_2m", "precipitation",
                "rain", "weather_code", "wind_speed_10m"
            ]
            for field in required_fields:
                if field not in current:
                    raise WeatherProviderError(f"Invalid response: missing field '{field}'")

            # Normalize units and build response
            result = {
                "source": "Open-Meteo",
                "latitude": lat,
                "longitude": lon,
                "observed_at": current.get("time"),
                "retrieved_at": now.isoformat(),
                "temperature_c": round(current.get("temperature_2m", 0), 1),
                "humidity_percent": current.get("relative_humidity_2m", 0),
                "apparent_temp_c": round(current.get("apparent_temperature", 0), 1),
                "precipitation_mm": current.get("precipitation", 0),
                "rain_mm": current.get("rain", 0),
                "showers_mm": current.get("showers", 0),
                "wind_kmh": round(current.get("wind_speed_10m", 0), 1),
                "wind_direction": current.get("wind_direction_10m", 0),
                "wind_gusts_kmh": round(current.get("wind_gusts_10m", 0), 1),
                "weather_code": current.get("weather_code", 0),
                "weather_description": self.get_weather_description(current.get("weather_code", 0)),
                "data_status": "LIVE",
                "hourly_forecast": self._extract_hourly(data.get("hourly", {})),
            }

            # Update cache (store datetime object, not string)
            cache_entry = result.copy()
            cache_entry["retrieved_at_dt"] = now
            _weather_cache[cache_key] = cache_entry
            logger.info(f"Weather fetched successfully for {cache_key}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Weather API HTTP error: {e.response.status_code}")
            return self._fallback_to_cache(cache_key, lat, lon)
        except (httpx.RequestError, WeatherProviderError) as e:
            logger.error(f"Weather API error: {e}")
            return self._fallback_to_cache(cache_key, lat, lon)

    def _extract_hourly(self, hourly: dict) -> list[dict]:
        """Extract next 6 hours of hourly forecast."""
        if not hourly or "time" not in hourly:
            return []
        times = hourly.get("time", [])
        result = []
        for i in range(min(6, len(times))):
            result.append({
                "time": times[i],
                "temperature_c": hourly.get("temperature_2m", [None]*len(times))[i],
                "precipitation_mm": hourly.get("precipitation", [0]*len(times))[i],
                "rain_mm": hourly.get("rain", [0]*len(times))[i],
                "precipitation_probability": hourly.get("precipitation_probability", [0]*len(times))[i],
                "weather_code": hourly.get("weather_code", [0]*len(times))[i],
                "weather_description": self.get_weather_description(
                    hourly.get("weather_code", [0]*len(times))[i]
                ),
                "wind_kmh": hourly.get("wind_speed_10m", [0]*len(times))[i],
            })
        return result

    def _fallback_to_cache(self, cache_key: str, lat: float, lon: float) -> dict:
        """Return cached data if available, otherwise an unavailable response."""
        cached = _weather_cache.get(cache_key)
        if cached:
            logger.info(f"Returning cached weather for {cache_key}")
            result = cached.copy()
            result.pop("retrieved_at_dt", None)
            result["data_status"] = "CACHED"
            return result
        return {
            "source": "Open-Meteo",
            "latitude": lat,
            "longitude": lon,
            "observed_at": None,
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "temperature_c": None,
            "humidity_percent": None,
            "apparent_temp_c": None,
            "precipitation_mm": None,
            "rain_mm": None,
            "showers_mm": None,
            "wind_kmh": None,
            "wind_direction": None,
            "wind_gusts_kmh": None,
            "weather_code": None,
            "weather_description": "Live weather temporarily unavailable",
            "data_status": "UNAVAILABLE",
            "hourly_forecast": [],
        }


weather_service = WeatherService()
