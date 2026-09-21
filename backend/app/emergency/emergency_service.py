"""Emergency SOS service.

Records SOS requests and manages acknowledgements.
Never fabricates rescue acknowledgements.
"""

import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.database.models import EmergencyRequest
from app.core.config import settings

logger = logging.getLogger("neerkaval.emergency")


class SMSService:
    """SMS/GSM provider abstraction.

    DevelopmentSMSProvider: Logs the request (no actual SMS sent).
    ProductionSMSProvider: Would integrate with a real SMS gateway (e.g., Twilio, MSG91).
    """

    def __init__(self, provider: str = "development", api_key: str = ""):
        self.provider = provider
        self.api_key = api_key

    def send(self, phone: str, message: str) -> dict:
        """Send an SMS. Returns status dict."""
        if self.provider == "development":
            logger.info(f"[DEV SMS] Would send to {phone}: {message}")
            return {
                "status": "SENT_TO_GATEWAY",
                "provider": "development",
                "message": "SMS request sent to gateway (development mode — no actual SMS sent)",
                "delivered": False,
            }
        # Production would call actual SMS API
        return {
            "status": "CONFIG_REQUIRED",
            "provider": self.provider,
            "message": "SMS provider credentials not configured",
            "delivered": False,
        }


sms_service = SMSService(settings.sms_provider, settings.sms_api_key)


class EmergencyService:
    """Handles SOS requests and rescue coordination."""

    def create_sos(
        self,
        db: Session,
        request_type: str,
        latitude: float | None = None,
        longitude: float | None = None,
        message: str = "",
        network_status: str = "online",
    ) -> dict:
        """Create an SOS request. Never claims rescue team is dispatched."""
        sos = EmergencyRequest(
            request_type=request_type,
            latitude=latitude,
            longitude=longitude,
            message=message,
            network_status=network_status,
            acknowledged=False,
            is_demo=False,
        )
        db.add(sos)
        db.commit()
        db.refresh(sos)

        logger.info(f"SOS request created: ID={sos.id}, type={request_type}")

        return {
            "sos_id": sos.id,
            "status": "RECEIVED",
            "message": "SOS request sent. Rescue acknowledgement has not yet been received.",
            "acknowledged": False,
            "created_at": sos.created_at.isoformat() if sos.created_at else None,
            "request_type": request_type,
            "location": {
                "latitude": latitude,
                "longitude": longitude,
            } if latitude and longitude else None,
        }

    def check_acknowledgement(self, db: Session, sos_id: int) -> dict:
        """Check if an SOS has been acknowledged."""
        sos = db.query(EmergencyRequest).filter(EmergencyRequest.id == sos_id).first()
        if not sos:
            return {"status": "NOT_FOUND", "message": "SOS request not found"}

        if sos.acknowledged:
            return {
                "status": "ACKNOWLEDGED",
                "message": "Rescue request acknowledged.",
                "acknowledged_at": sos.acknowledged_at.isoformat() if sos.acknowledged_at else None,
            }
        return {
            "status": "PENDING",
            "message": "SOS request sent. Rescue acknowledgement has not yet been received.",
            "acknowledged": False,
        }


emergency_service = EmergencyService()
