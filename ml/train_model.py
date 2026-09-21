"""ML model training stub for NEERKAVAL.

This is a placeholder for training a real flood risk prediction model.
The current production system uses a transparent heuristic-based risk model
(see backend/app/ml/risk_engine.py) which is clearly labeled as "Prototype".

To train a real model:
1. Collect historical flood data (rainfall, river levels, soil moisture, elevation, slope)
2. Collect flood event labels (did flooding occur? severity?)
3. Train a model (e.g., XGBoost, Random Forest, or neural network)
4. Save the model to ml/models/flood_risk_model.pkl
5. Update backend/app/ml/risk_engine.py to load and use the trained model
6. Remove the "Prototype" label from the risk model status

Required datasets:
- IMD (India Meteorological Department) rainfall data
- River gauge data from Central Water Commission (CWC)
- DEM (Digital Elevation Model) from CARTOSAT
- Soil moisture data from SMAP or in-situ sensors
- Historical flood event records
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Uncomment when ready to train:
# import numpy as np
# import pandas as pd
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
# import joblib


def train_model():
    """Train a flood risk prediction model.

    Placeholder — implement when dataset is available.
    """
    print("=" * 60)
    print("NEERKAVAL ML Model Training")
    print("=" * 60)
    print()
    print("STATUS: Not implemented — no dataset available.")
    print()
    print("The current risk model uses transparent heuristic scoring.")
    print("It is clearly labeled as 'Prototype / Dataset Required'.")
    print()
    print("To train a real model:")
    print("  1. Collect historical flood data")
    print("  2. Prepare features: rainfall, soil moisture, elevation, slope")
    print("  3. Prepare labels: flood event records")
    print("  4. Implement training in this file")
    print("  5. Save model to ml/models/")
    print("  6. Update risk_engine.py to use the trained model")
    print()
    return None


if __name__ == "__main__":
    train_model()
