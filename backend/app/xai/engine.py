"""Explainable AI (XAI) engine — translates risk predictions into human-readable explanations.

Public mode: Simple Tamil/English explanations with icons and short sentences.
Officer mode: Technical factor breakdown with contributions and trend analysis.
"""

import logging
from typing import Optional

logger = logging.getLogger("neerkaval.xai")

# Factor display configurations
FACTOR_CONFIG = {
    "rainfall_intensity": {
        "icon": "🌧️",
        "label_ta": "கனமழை",
        "label_en": "Heavy Rain",
        "high_ta": "மழை அதிகரித்து வருகிறது.",
        "high_en": "Rainfall is increasing.",
        "medium_ta": "மழை தொடர்கிறது.",
        "medium_en": "Rain is continuing.",
        "low_ta": "மழை குறைவாக உள்ளது.",
        "low_en": "Rainfall is low.",
    },
    "forecast_precipitation": {
        "icon": "⛈️",
        "label_ta": "மழை கணிப்பு",
        "label_en": "Rain Forecast",
        "high_ta": "அடுத்த சில மணிநேரத்தில் அதிக மழை எதிர்பார்க்கப்படுகிறது.",
        "high_en": "Heavy rain expected in the next few hours.",
        "medium_ta": "மழை தொடரக்கூடும்.",
        "medium_en": "Rain may continue.",
        "low_ta": "கணிசமான மழை எதிர்பார்க்கப்படவில்லை.",
        "low_en": "No significant rain expected.",
    },
    "soil_saturation": {
        "icon": "🌱",
        "label_ta": "மண் ஈரம்",
        "label_en": "Soil Saturation",
        "high_ta": "மண் ஏற்கனவே அதிக ஈரமாக உள்ளது. மேலும் தண்ணீரை உறிஞ்ச முடியாமல் இருக்கலாம்.",
        "high_en": "Soil is already saturated and may not absorb more water.",
        "medium_ta": "மண்ணில் ஈரம் உள்ளது.",
        "medium_en": "Soil has moderate moisture.",
        "low_ta": "மண் உலர்வாக உள்ளது.",
        "low_en": "Soil is relatively dry.",
    },
    "slope_instability": {
        "icon": "⛰️",
        "label_ta": "சரிவு",
        "label_en": "Slope",
        "high_ta": "சரிவு அதிகம். நீர் வேகமாக கீழே செல்லலாம்.",
        "high_en": "Steep slope — water may flow rapidly downhill.",
        "medium_ta": "சரிவு மிதமான அளவு உள்ளது.",
        "medium_en": "Moderate slope present.",
        "low_ta": "பகுதி பெரும்பாலும் சமதளமாக உள்ளது.",
        "low_en": "Area is mostly flat.",
    },
    "elevation_factor": {
        "icon": "📍",
        "label_ta": "உயரம்",
        "label_en": "Elevation",
        "high_ta": "இந்த பகுதி தாழ்வாக உள்ளது. வெள்ளம் சேரக்கூடும்.",
        "high_en": "This is a low-lying area — water may accumulate.",
        "medium_ta": "மிதமான உயரம் உள்ளது.",
        "medium_en": "Moderate elevation.",
        "low_ta": "உயரமான பகுதி — வெள்ள அபாயம் குறைவு.",
        "low_en": "Higher elevation — lower flood risk.",
    },
}

RISK_LEVEL_CONFIG = {
    "NORMAL": {
        "color": "#22a559",
        "icon": "🟢",
        "label_ta": "பாதுகாப்பான",
        "label_en": "NORMAL",
        "action_ta": "எந்த அபாயமும் இல்லை. வழக்கம் போல் இருங்கள்.",
        "action_en": "No danger. Carry on as normal.",
    },
    "CAUTION": {
        "color": "#eab308",
        "icon": "🟡",
        "label_ta": "கவனம் தேவை",
        "label_en": "CAUTION",
        "action_ta": "கவனமாக இருங்கள். வானிலை மாற்றங்களை கவனியுங்கள்.",
        "action_en": "Stay alert. Monitor weather changes.",
    },
    "WARNING": {
        "color": "#f97316",
        "icon": "🟠",
        "label_ta": "எச்சரிக்கை",
        "label_en": "WARNING",
        "action_ta": "பாதுகாப்பான இடத்திற்கு தயாராகுங்கள்.",
        "action_en": "Prepare to move to a safe location.",
    },
    "HIGH": {
        "color": "#dc2626",
        "icon": "🔴",
        "label_ta": "வெள்ள அபாயம்",
        "label_en": "HIGH RISK",
        "action_ta": "உடனே பாதுகாப்பான இடத்திற்கு செல்லுங்கள்.",
        "action_en": "Move to safety immediately.",
    },
    "CRITICAL": {
        "color": "#991b1b",
        "icon": "🔴",
        "label_ta": "மிக அபாயம்",
        "label_en": "CRITICAL",
        "action_ta": "உடனே உயரமான இடத்திற்கு செல்லுங்கள். அவசர உதவி கோருங்கள்.",
        "action_en": "Move to higher ground immediately. Seek emergency help.",
    },
}


class XAIEngine:
    """Generates human-readable explanations from risk predictions."""

    def generate_public_explanation(self, prediction: dict, language: str = "ta") -> dict:
        """Generate simple, citizen-facing explanation."""
        risk_level = prediction.get("risk_level", "NORMAL")
        level_config = RISK_LEVEL_CONFIG.get(risk_level, RISK_LEVEL_CONFIG["NORMAL"])

        factors = prediction.get("factors", [])
        simplified_factors = []
        for factor in factors:
            config = FACTOR_CONFIG.get(factor["name"], {})
            value = factor.get("value", 0)
            if value >= 60:
                severity = "high"
            elif value >= 30:
                severity = "medium"
            else:
                severity = "low"

            simplified_factors.append({
                "icon": config.get("icon", "⚠️"),
                "label": config.get(f"label_{language}", factor["name"]),
                "description": config.get(f"{severity}_{language}", ""),
                "value": value,
            })

        return {
            "risk_icon": level_config["icon"],
            "risk_label": level_config[f"label_{language}"],
            "risk_color": level_config["color"],
            "what": prediction.get("risk_level", "UNKNOWN"),
            "why": simplified_factors,
            "when": {
                "peak_time": prediction.get("peak_time"),
                "lead_time_minutes": prediction.get("lead_time_minutes"),
            },
            "what_to_do": level_config[f"action_{language}"],
            "language": language,
        }

    def generate_officer_explanation(self, prediction: dict) -> dict:
        """Generate technical, officer-facing explanation."""
        risk_level = prediction.get("risk_level", "NORMAL")
        level_config = RISK_LEVEL_CONFIG.get(risk_level, RISK_LEVEL_CONFIG["NORMAL"])

        factors = prediction.get("factors", [])
        factor_details = []
        for factor in factors:
            config = FACTOR_CONFIG.get(factor["name"], {})
            factor_details.append({
                "name": factor["name"],
                "display_name": config.get("label_en", factor["name"]),
                "icon": config.get("icon", "⚠️"),
                "observed_value": factor.get("value", 0),
                "contribution": factor.get("contribution", 0),
                "description": factor.get("description", ""),
            })

        # Determine trend (simplified — would come from time-series in production)
        risk_score = prediction.get("risk_score", 0)
        if risk_score >= 60:
            trend = "INCREASING"
        elif risk_score >= 30:
            trend = "STABLE"
        else:
            trend = "DECREASING"

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_icon": level_config["icon"],
            "risk_color": level_config["color"],
            "factors": factor_details,
            "trend": trend,
            "lead_time_minutes": prediction.get("lead_time_minutes"),
            "peak_time": prediction.get("peak_time"),
            "model_status": prediction.get("model_status", "Unknown"),
            "model_version": prediction.get("model_version", "Unknown"),
            "is_prototype": prediction.get("is_prototype", True),
        }


xai_engine = XAIEngine()
