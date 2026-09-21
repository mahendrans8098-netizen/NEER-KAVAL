"""Safety-aware routing service.

Architecture supports flood-safe routing by considering:
1. Hazards (flooded roads, blocked bridges, tree falls)
2. Elevation (prefer higher ground)
3. Shelter availability
4. Travel distance

LIMITATION: Without a verified hazard dataset and road network graph,
this service provides estimated straight-line routing with hazard awareness.
A production system would use OSRM/GraphHopper with flood overlay data.
"""

import logging
import math
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("neerkaval.routing")


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two GPS points in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class RoutingService:
    """Safety-aware routing with hazard avoidance."""

    PROVIDER = settings.routing_provider
    STATUS = "LIMITED — Verified hazard data required for production flood-safe routing"

    def compute_safe_route(
        self,
        start_lat: float,
        start_lon: float,
        dest_lat: float,
        dest_lon: float,
        hazards: list[dict] | None = None,
    ) -> dict:
        """Compute a route with safety considerations.

        NOTE: This is a prototype. It calculates straight-line distance and
        estimated travel time, and flags nearby hazards. A production system
        would use OSRM/GraphHopper with a road network graph and flood overlay.
        """
        distance_km = haversine_distance(start_lat, start_lon, dest_lat, dest_lon)
        # Estimate walking time: ~4 km/h, driving: ~30 km/h
        walk_time_min = round(distance_km / 4 * 60)
        drive_time_min = round(distance_km / 30 * 60)

        # Check for nearby hazards
        nearby_hazards = []
        if hazards:
            for hazard in hazards:
                h_dist = haversine_distance(
                    start_lat, start_lon,
                    hazard.get("latitude", 0), hazard.get("longitude", 0)
                )
                if h_dist < 5.0:  # Within 5km
                    nearby_hazards.append({
                        **hazard,
                        "distance_km": round(h_dist, 2),
                    })

        route_segments = [
            {
                "instruction_ta": "பாதுகாப்பான பாதையில் செல்லுங்கள்",
                "instruction_en": "Follow the safe route",
                "distance_km": round(distance_km, 2),
                "direction": "forward",
            }
        ]

        # Add landmark-based instructions for rural navigation
        if nearby_hazards:
            route_segments.append({
                "instruction_ta": "தடை உள்ள பகுதியை தவிருங்கள்",
                "instruction_en": "Avoid the hazardous area ahead",
                "distance_km": 0,
                "direction": "detour",
                "hazard_type": nearby_hazards[0].get("hazard_type"),
            })

        return {
            "status": "LIMITED",
            "provider": self.PROVIDER,
            "distance_km": round(distance_km, 2),
            "estimated_walk_time_min": walk_time_min,
            "estimated_drive_time_min": drive_time_min,
            "start": {"latitude": start_lat, "longitude": start_lon},
            "destination": {"latitude": dest_lat, "longitude": dest_lon},
            "segments": route_segments,
            "nearby_hazards": nearby_hazards,
            "warning": (
                "Flood-safe routing: LIMITED — This is a straight-line estimate. "
                "Production flood-safe routing requires verified hazard data and "
                "a road network graph."
            ),
        }


routing_service = RoutingService()
