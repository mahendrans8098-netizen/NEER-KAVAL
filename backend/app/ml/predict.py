"""Prototype flood risk prediction engine.

IMPORTANT: This is a prototype model using a transparent heuristic approach.
It is NOT a scientifically validated ML model. The model status is clearly
labeled as 'Prototype / Dataset Required'.

A real production model would require:
- Validated historical flood event datasets
- Terrain elevation data (DEM)
- Soil moisture/saturation data
- River gauge data
- Trained and evaluated ML model (e.g., Gradient Boosting, Random Forest)

This prototype provides a real integration interface that can be replaced
with a production model without changing the API contract.
"""

import logging
import math
from datetime import datetime, timezone
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("neerkaval.ml")


class RiskFactor:
    """A single contributing factor to flood risk."""
    def __init__(self, name: str, value: float, contribution: float, description: str = ""):
        self.name = name
        self.value = value  # 0-100 normalized
        self.contribution = contribution  # 0.0-1.0 weight
        self.description = description

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "value": round(self.value, 1),
            "contribution": round(self.contribution, 3),
            "description": self.description,
        }


class PrototypeRiskModel:
    """
    Prototype flood risk model using transparent heuristic scoring.

    This model uses a weighted combination of:
    - Recent rainfall intensity
    - Forecast precipitation
    - Soil saturation (estimated)
    - Terrain slope (estimated)
    - Elevation factor (estimated)

    All factor weights are documented and explainable.
    """

    MODEL_STATUS = "Prototype / Dataset Required"
    MODEL_VERSION = "0.1.0-prototype"

    # Factor weights (must sum to ~1.0)
    WEIGHTS = {
        "rainfall_intensity": 0.30,
        "forecast_precipitation": 0.25,
        "soil_saturation": 0.20,
        "slope_instability": 0.15,
        "elevation_factor": 0.10,
    }

    def predict(
        self,
        lat: float,
        lon: float,
        precipitation_mm: float = 0,
        rain_mm: float = 0,
        forecast_precipitation: float = 0,
        soil_saturation: float = 50,
        slope: float = 5,
        elevation: float = 200,
    ) -> dict:
        """
        Compute flood risk from environmental factors.

        Args:
            precipitation_mm: Current precipitation in mm
            rain_mm: Current rainfall in mm
            forecast_precipitation: Expected precipitation next 3h in mm
            soil_saturation: Estimated soil saturation 0-100%
            slope: Terrain slope in degrees
            elevation: Elevation in meters

        Returns:
            Risk prediction dict with score, level, factors, and timing
        """
        # Normalize rainfall intensity (0-100 scale)
        # 0mm = 0, 50mm+ = 100
        rainfall_intensity = min(100, (precipitation_mm + rain_mm) * 2)

        # Normalize forecast precipitation (0-100)
        # 0mm = 0, 30mm+ = 100
        forecast_score = min(100, forecast_precipitation * 3.3)

        # Soil saturation already 0-100
        soil_score = soil_saturation

        # Slope: higher slope = more runoff risk
        # 0 degrees = 0, 30+ degrees = 100
        slope_score = min(100, slope * 3.3)

        # Elevation: lower elevation = higher flood risk
        # 0m = 100, 500m+ = 0
        elevation_score = max(0, 100 - (elevation / 5))

        # Compute weighted risk score
        factors = [
            RiskFactor(
                "rainfall_intensity", rainfall_intensity,
                self.WEIGHTS["rainfall_intensity"],
                "Current rainfall rate in the area"
            ),
            RiskFactor(
                "forecast_precipitation", forecast_score,
                self.WEIGHTS["forecast_precipitation"],
                "Expected rainfall in next 3 hours"
            ),
            RiskFactor(
                "soil_saturation", soil_score,
                self.WEIGHTS["soil_saturation"],
                "Soil moisture level — saturated soil cannot absorb more water"
            ),
            RiskFactor(
                "slope_instability", slope_score,
                self.WEIGHTS["slope_instability"],
                "Terrain steepness — steeper slopes cause faster runoff"
            ),
            RiskFactor(
                "elevation_factor", elevation_score,
                self.WEIGHTS["elevation_factor"],
                "Low elevation areas are more prone to flooding"
            ),
        ]

        risk_score = sum(f.value * f.contribution for f in factors)
        risk_score = round(min(100, max(0, risk_score)))

        # Determine risk level
        if risk_score < 20:
            risk_level = "NORMAL"
        elif risk_score < 40:
            risk_level = "CAUTION"
        elif risk_score < 60:
            risk_level = "WARNING"
        elif risk_score < 80:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # Estimate lead time (only if risk is elevated)
        lead_time_minutes = None
        peak_time = None
        if risk_score >= 40:
            # Rough estimate: higher risk = less time
            lead_time_minutes = max(30, int(240 - risk_score * 1.5))
            now = datetime.now(timezone.utc)
            peak = now.timestamp() + (lead_time_minutes * 60)
            peak_dt = datetime.fromtimestamp(peak, tz=timezone.utc)
            peak_time = peak_dt.strftime("%H:%M")

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "lead_time_minutes": lead_time_minutes,
            "peak_time": peak_time,
            "factors": [f.to_dict() for f in factors],
            "model_status": self.MODEL_STATUS,
            "model_version": self.MODEL_VERSION,
            "is_prototype": True,
        }

    def get_model_info(self) -> dict:
        """Return model metadata and status."""
        return {
            "status": self.MODEL_STATUS,
            "version": self.MODEL_VERSION,
            "type": "prototype_heuristic",
            "features": list(self.WEIGHTS.keys()),
            "weights": self.WEIGHTS,
            "is_prototype": True,
            "note": (
                "This is a transparent prototype model using documented heuristics. "
                "A production model requires validated historical flood datasets, "
                "terrain elevation data (DEM), soil moisture data, and river gauge data."
            ),
        }


class ProductionMLModel:
    """Placeholder for a future production ML model.

    This class demonstrates the abstraction pattern. When a validated
    model is available, replace PrototypeRiskModel with this class
    (or a trained sklearn/xgboost model) without changing the API.
    """
    MODEL_STATUS = "Production model not configured — requires validated training data"

    def predict(self, **kwargs) -> dict:
        raise NotImplementedError(
            "Production ML model requires validated training data and model serialization. "
            "Use PrototypeRiskModel for demonstration."
        )


# Factory: select model based on configuration
def get_risk_model():
    if settings.ml_model_status == "production":
        return ProductionMLModel()
    return PrototypeRiskModel()


risk_model = get_risk_model()
