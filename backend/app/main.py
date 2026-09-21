"""NEERKAVAL — நீர் காவல்
Real-Time Flood Safety, Explainable AI & Emergency Response Platform

FastAPI application entry point.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import init_db
from app.services.demo_data import seed_demo_data
from app.database.database import SessionLocal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("neerkaval")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("NEERKAVAL starting up...")
    logger.info(f"Mode: {settings.app_mode}")

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Seed demo data
    with SessionLocal() as db:
        seed_demo_data(db)
    logger.info("Demo data seeded")

    # Seed default officer user if not exists
    from app.database.models import User
    from app.core.security import hash_password
    with SessionLocal() as db:
        if not db.query(User).filter(User.username == "officer").first():
            officer = User(
                username="officer",
                full_name="Demo Officer",
                hashed_password=hash_password("neerkaval123"),
                role="OFFICER",
                phone="+91 90000 00000",
                is_active=True,
            )
            admin = User(
                username="admin",
                full_name="Demo Admin",
                hashed_password=hash_password("neerkaval123"),
                role="ADMIN",
                phone="+91 90000 00001",
                is_active=True,
            )
            db.add(officer)
            db.add(admin)
            db.commit()
            logger.info("Default officer and admin users created")

    logger.info("NEERKAVAL ready")
    yield
    logger.info("NEERKAVAL shutting down...")


app = FastAPI(
    title="NEERKAVAL",
    description="Real-Time Flood Safety, Explainable AI & Emergency Response Platform — நீர் காவல்",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
# A wildcard origin is invalid together with credentialed requests (browsers
# reject it), so only enable credentials when explicit origins are configured.
_cors_origins = settings.cors_origin_list
_allow_credentials = _cors_origins != ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
from app.api.routes import router
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "NEERKAVAL",
        "tamil_name": "நீர் காவல்",
        "tagline": "Predict. Explain. Guide. Save Lives.",
        "version": "1.0.0",
        "mode": settings.app_mode,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()}
