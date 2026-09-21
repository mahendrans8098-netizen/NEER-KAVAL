"""Demo data for SIH demonstration scenarios.

All demo data is clearly labeled with is_demo=True and data_status=DEMO.
Demo data is NEVER mixed with live data.
"""

from datetime import datetime, timezone


# Demo shelters (clearly labeled as DEMO)
DEMO_SHELTERS = [
    {
        "name": "Government High School",
        "name_ta": "அரசு மேல்நிலைப் பள்ளி",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "address": "Coimbatore, Tamil Nadu",
        "capacity": 500,
        "available_spaces": 320,
        "status": "OPEN",
        "has_medical": True,
        "has_water": True,
        "has_food": True,
        "is_accessible": True,
        "is_verified": False,
        "is_demo": True,
    },
    {
        "name": "Community Hall",
        "name_ta": "சமூக மண்டபம்",
        "latitude": 11.0250,
        "longitude": 76.9650,
        "address": "Near Coimbatore, Tamil Nadu",
        "capacity": 200,
        "available_spaces": 150,
        "status": "OPEN",
        "has_medical": False,
        "has_water": True,
        "has_food": True,
        "is_accessible": True,
        "is_verified": False,
        "is_demo": True,
    },
    {
        "name": "Temple Shelter",
        "name_ta": "கோவில் தங்குமிடம்",
        "latitude": 11.0100,
        "longitude": 76.9400,
        "address": "Rural area, Tamil Nadu",
        "capacity": 100,
        "available_spaces": 0,
        "status": "FULL",
        "has_medical": False,
        "has_water": True,
        "has_food": False,
        "is_accessible": False,
        "is_verified": False,
        "is_demo": True,
    },
]

# Demo road hazards
DEMO_HAZARDS = [
    {
        "hazard_type": "FLOOD_WATER",
        "latitude": 11.0150,
        "longitude": 76.9500,
        "description": "Road flooded near river bridge",
        "status": "ACTIVE",
        "is_demo": True,
    },
    {
        "hazard_type": "TREE_FALL",
        "latitude": 11.0200,
        "longitude": 76.9600,
        "description": "Tree blocking road",
        "status": "ACTIVE",
        "is_demo": True,
    },
    {
        "hazard_type": "BRIDGE_BLOCKED",
        "latitude": 11.0120,
        "longitude": 76.9480,
        "description": "Bridge under water",
        "status": "ACTIVE",
        "is_demo": True,
    },
]

# Demo rescue teams
DEMO_RESCUE_TEAMS = [
    {
        "team_name": "Rescue Team 01",
        "status": "AVAILABLE",
        "assigned_incident": None,
        "latitude": 11.0168,
        "longitude": 76.9558,
        "is_demo": True,
    },
    {
        "team_name": "Rescue Team 02",
        "status": "ON_MISSION",
        "assigned_incident": "Flood rescue - Sector A",
        "latitude": 11.0200,
        "longitude": 76.9600,
        "is_demo": True,
    },
    {
        "team_name": "Rescue Team 03",
        "status": "OFFLINE",
        "assigned_incident": None,
        "latitude": None,
        "longitude": None,
        "is_demo": True,
    },
]

# Demo alerts
DEMO_ALERTS = [
    {
        "title": "Heavy Rain Warning",
        "title_ta": "கனமழை எச்சரிக்கை",
        "message": "Heavy rainfall expected in the next 3 hours. Stay alert.",
        "message_ta": "அடுத்த 3 மணிநேரத்தில் கனமழை எதிர்பார்க்கப்படுகிறது. கவனமாக இருங்கள்.",
        "severity": "WARNING",
        "affected_area": "Coimbatore District",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "is_active": True,
        "is_demo": True,
    },
]

# Demo citizen reports
DEMO_REPORTS = [
    {
        "report_type": "FLOOD_WATER",
        "latitude": 11.0150,
        "longitude": 76.9500,
        "description": "Water level rising near bridge",
        "status": "PENDING",
        "is_demo": True,
    },
    {
        "report_type": "ROAD_BLOCKED",
        "latitude": 11.0220,
        "longitude": 76.9580,
        "description": "Road blocked by debris",
        "status": "PENDING",
        "is_demo": True,
    },
]


def seed_demo_data(db_session):
    """Seed demo data into the database if not already present."""
    from app.database.models import Shelter, RoadHazard, RescueTeam, Alert, CitizenReport

    # Check if demo data already exists
    if db_session.query(Shelter).filter(Shelter.is_demo == True).first():
        return

    for shelter_data in DEMO_SHELTERS:
        shelter = Shelter(**shelter_data)
        db_session.add(shelter)

    for hazard_data in DEMO_HAZARDS:
        hazard = RoadHazard(**hazard_data)
        db_session.add(hazard)

    for team_data in DEMO_RESCUE_TEAMS:
        team = RescueTeam(**team_data)
        db_session.add(team)

    for alert_data in DEMO_ALERTS:
        alert = Alert(**alert_data)
        db_session.add(alert)

    for report_data in DEMO_REPORTS:
        report = CitizenReport(**report_data)
        db_session.add(report)

    db_session.commit()
