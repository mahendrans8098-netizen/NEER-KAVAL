# NEERKAVAL ML Module

This directory contains ML model training and prediction stubs for the NEERKAVAL flood risk prediction system.

## Current Status

The current production system uses a **transparent heuristic-based risk model** (see `backend/app/ml/risk_engine.py`). It is clearly labeled as "Prototype / Dataset Required" in all API responses and UI.

## To Train a Real Model

1. Collect datasets:
   - IMD rainfall data (historical)
   - CWC river gauge data
   - CARTOSAT DEM (elevation)
   - Soil moisture (SMAP or in-situ)
   - Historical flood event records

2. Run training:
   ```bash
   python ml/train_model.py
   ```

3. The trained model will be saved to `ml/models/`

4. Update `backend/app/ml/risk_engine.py` to load and use the trained model

5. Remove the "Prototype" label from the risk model status

## Files

- `train_model.py` — Training script stub
- `predict.py` — Prediction interface
- `models/` — Directory for trained model files (created by training)
