"""Prediction interface for NEERKAVAL ML model.

This module provides the interface for making predictions with a trained model.
Currently, it delegates to the heuristic-based risk engine.

When a real model is trained, replace the predict() function to load and use
the trained model file.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))


def predict(rainfall, soil_moisture, elevation, slope, river_distance):
    """Predict flood risk using the trained model.

    Currently delegates to the heuristic risk engine.
    Replace this with model.predict() when a trained model is available.
    """
    from app.ml.risk_engine import risk_engine
    return risk_engine.predict(
        rainfall=rainfall,
        soil_moisture=soil_moisture,
        elevation=elevation,
        slope=slope,
        river_distance=river_distance,
    )


if __name__ == "__main__":
    result = predict(rainfall=5.0, soil_moisture=0.6, elevation=500, slope=10, river_distance=1.5)
    print(f"Risk score: {result['risk_score']}")
    print(f"Risk level: {result['risk_level']}")
    print(f"Model: {result['model_version']}")
