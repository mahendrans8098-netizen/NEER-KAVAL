# NEERKAVAL — நீர் காவல்
## Real-Time Flood Safety, Explainable AI & Emergency Response Platform

### Overview

NEERKAVAL is a bilingual (Tamil/English) flood safety platform built for Smart India Hackathon (SIH). It provides:

- **Public Safety Mode** — Simple, Tamil-first citizen interface with SOS, risk assessment, shelter finding, and XAI explanations
- **Officer Control Mode** — Dashboard with live monitoring, emergency dispatch, citizen reports, and response tracking
- **Real Weather Integration** — Live Open-Meteo API with transparent caching (LIVE/CACHED/UNAVAILABLE states)
- **Prototype Risk Model** — Transparent heuristic scoring (NOT ML) with clear labeling, designed to be replaced with a trained model
- **XAI Explanations** — "Why this risk level?" and "What should I do?" in citizen language (Tamil/English)
- **PWA with Offline Support** — Service worker + IndexedDB for offline-first operation

### Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v3
- **Backend:** Python FastAPI + SQLModel
- **Database:** SQLite (local dev) / PostgreSQL (production)
- **Weather API:** Open-Meteo (free, no key required)
- **Maps:** Leaflet + OpenStreetMap
- **Auth:** JWT tokens with bcrypt password hashing

### Project Structure

```
NEERKAVAL/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── layouts/      # Public and Officer layouts
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── i18n/         # Tamil/English translations
│   │   ├── lib/          # API client, utilities
│   │   └── types/        # TypeScript types
│   ├── public/           # PWA manifest, service worker
│   └── package.json
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── models/        # Data models
│   │   ├── security/      # Auth, JWT, bcrypt
│   │   ├── weather/       # Open-Meteo integration
│   │   ├── ml/            # Risk prediction model + XAI
│   │   ├── routing/       # Safe route calculation
│   │   ├── emergency/     # Emergency response logic
│   │   ├── api/           # API routes
│   │   └── main.py        # FastAPI app entry
│   ├── tests/             # Pytest test suite (21 tests)
│   └── requirements.txt
├── ml/                # ML model training stubs
├── docker-compose.yml
└── README.md
```

### Local Development

#### Backend

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`.
API docs (Swagger): `http://localhost:8000/docs`

#### Frontend

```bash
cd frontend
npm install
npm run dev    # Development server at http://localhost:5173
npm run build  # Production build to dist/
```

### Default Credentials

| Role    | Username  | Password       |
|---------|-----------|----------------|
| Officer | officer   | neerkaval123   |
| Admin   | admin     | neerkaval123   |

### Key API Endpoints

| Endpoint                           | Method | Description                        |
|------------------------------------|--------|------------------------------------|
| `/api/weather/current`             | GET    | Current weather (LIVE/CACHED)      |
| `/api/risk/current`                | GET    | Risk prediction for location       |
| `/api/xai/public`                  | GET    | Citizen XAI explanation            |
| `/api/xai/officer`                 | GET    | Detailed XAI (auth required)       |
| `/api/emergency/sos`               | POST   | Create SOS request                 |
| `/api/emergency/sos/{id}/status`   | GET    | Check SOS acknowledgement status   |
| `/api/shelters/nearby`             | GET    | Find nearby shelters               |
| `/api/routes/safe`                 | GET    | Safe route calculation             |
| `/api/citizen/report`             | POST   | Citizen incident report            |
| `/api/system/status`               | GET    | System health status               |

### Honesty Labeling

All data states are clearly labeled:
- **LIVE** — Real-time data from Open-Meteo API
- **CACHED** — Data from cache (within 10-minute TTL)
- **UNAVAILABLE** — API failed, no cached data available
- **DEMO DATA** — Simulated data for demonstration purposes

The risk model is labeled as **"Prototype"** — it uses transparent heuristic scoring, NOT machine learning. The ML module is designed to be replaced with a trained model using the `ml/train_model.py` stub.

### Running Tests

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

### License

Built for Smart India Hackathon (SIH).
