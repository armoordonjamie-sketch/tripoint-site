"""
Google Calendar operations for TriPoint bookings.
Creates events and updates colour/notes by payment status.
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from typing import Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("tripoint.calendar")

try:
    from google.auth.transport.requests import Request as GoogleRequest
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
except ImportError:
    Credentials = None
    service_account = None
    GoogleRequest = None
    build = None

from zoneinfo import ZoneInfo

LOCAL_TZ = ZoneInfo(os.getenv("TRIPOINT_TIMEZONE", "Europe/London"))
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")

# Google Calendar colour IDs
CALENDAR_COLOURS = {
    "PENDING_DEPOSIT": os.getenv("CALENDAR_COLOUR_PENDING_DEPOSIT", "5"),
    "DEPOSIT_PAID": os.getenv("CALENDAR_COLOUR_DEPOSIT_PAID", "5"),
    "COMPLETED_UNPAID": os.getenv("CALENDAR_COLOUR_COMPLETED_UNPAID", "11"),
    "COMPLETED_PAID": os.getenv("CALENDAR_COLOUR_COMPLETED_PAID", "10"),
}


def _get_service():
    if not (Credentials and service_account and GoogleRequest and build):
        raise RuntimeError("Google Calendar dependencies are missing")
    scopes = ["https://www.googleapis.com/auth/calendar"]
    service_account_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    service_account_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
    delegated_user = os.getenv("GOOGLE_DELEGATED_USER")

    if service_account_json or service_account_path:
        info = json.loads(service_account_json) if service_account_json else None
        creds = (
            service_account.Credentials.from_service_account_info(info, scopes=scopes)
            if info
            else service_account.Credentials.from_service_account_file(service_account_path, scopes=scopes)
        )
        creds = creds.with_subject(delegated_user) if delegated_user else creds
    else:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")
        if not (client_id and client_secret and refresh_token):
            raise RuntimeError("Google Calendar credentials are not configured")
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
            scopes=scopes,
        )
        creds.refresh(GoogleRequest())

    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def create_booking_event(booking: dict[str, Any], service_labels: str, travel_buffer: int) -> str:
    """
    Create a Google Calendar event for a booking.
    Returns the event ID.
    """
    service = _get_service()
    slot_start = datetime.fromisoformat(booking["slot_start_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    slot_end = datetime.fromisoformat(booking["slot_end_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)

    description = (
        f"Customer: {booking['full_name']}\n"
        f"Email: {booking['email']}\n"
        f"Phone: {booking['phone']}\n"
        f"Postcode: {booking['postcode']}\n"
        f"Address: {booking.get('address_line_1') or ''}, {booking.get('town_city') or ''}\n"
        f"Vehicle: {booking.get('vehicle_reg') or ''} ({booking.get('vehicle_make') or ''} {booking.get('vehicle_model') or ''})\n"
        f"Mileage: {booking.get('approx_mileage') or ''}\n"
        f"Symptoms: {booking.get('symptoms') or ''}\n"
        f"Notes: {booking.get('additional_notes') or 'N/A'}\n"
        f"Zone: {booking.get('zone') or ''}\n"
        f"Drive time: {booking.get('drive_time_mins') or ''} mins\n"
        f"Booking ID: {booking['id']}\n"
        f"TP_BUFFER_MINUTES:{travel_buffer}"
    )

    event_body = {
        "summary": f"Booking: {service_labels} - {booking['full_name']}",
        "description": description,
        "start": {"dateTime": slot_start.isoformat(), "timeZone": str(LOCAL_TZ)},
        "end": {"dateTime": slot_end.isoformat(), "timeZone": str(LOCAL_TZ)},
        "colorId": CALENDAR_COLOURS["DEPOSIT_PAID"],
    }

    created = service.events().insert(calendarId=CALENDAR_ID, body=event_body, sendUpdates="all").execute()
    return created.get("id", "")


def update_event_notes(event_id: str, notes: str) -> None:
    """Update an event's description."""
    service = _get_service()
    event = service.events().get(calendarId=CALENDAR_ID, eventId=event_id).execute()
    event["description"] = notes
    service.events().update(calendarId=CALENDAR_ID, eventId=event_id, body=event, sendUpdates="all").execute()


def update_event_colour(event_id: str, status: str) -> None:
    """Update an event's colour by booking status."""
    colour = CALENDAR_COLOURS.get(status, CALENDAR_COLOURS["DEPOSIT_PAID"])
    service = _get_service()
    event = service.events().get(calendarId=CALENDAR_ID, eventId=event_id).execute()
    event["colorId"] = colour
    service.events().update(calendarId=CALENDAR_ID, eventId=event_id, body=event, sendUpdates="all").execute()
