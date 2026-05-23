"""Google Calendar tools for Carl — availability checking and booking creation."""

from __future__ import annotations

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from googleapiclient.discovery import build

load_dotenv()

TOKEN_PATH = Path(__file__).resolve().parent / "token.json"
SCOPES = ["https://www.googleapis.com/auth/calendar"]

_WORK_START_HOUR = 8
_WORK_END_HOUR = 19
_SLOT_HOURS = 2


def _timezone() -> ZoneInfo:
    return ZoneInfo(os.getenv("CARL_TIMEZONE", "Europe/London"))


def _calendar_id() -> str:
    return os.getenv("GOOGLE_CALENDAR_ID", "primary")


def get_calendar_service() -> Any:
    """
    Return an authenticated Calendar API service object.

    Auth priority:
      1. GOOGLE_SERVICE_ACCOUNT_FILE env var — uses a service account JSON key (no browser needed).
      2. token.json in project root — OAuth user credentials created by auth_setup.py.

    Raises RuntimeError if neither is available.
    """
    sa_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()
    if sa_file:
        sa_path = Path(sa_file)
        if not sa_path.is_file():
            raise RuntimeError(
                f"GOOGLE_SERVICE_ACCOUNT_FILE is set but the file was not found: {sa_file}"
            )
        from google.oauth2 import service_account
        creds = service_account.Credentials.from_service_account_file(
            str(sa_path), scopes=SCOPES
        )
        return build("calendar", "v3", credentials=creds)

    # Fall back to OAuth token.json.
    if not TOKEN_PATH.is_file():
        raise RuntimeError(
            "No calendar credentials found. Set GOOGLE_SERVICE_ACCOUNT_FILE in .env, "
            "or run auth_setup.py to create token.json."
        )

    from google.oauth2.credentials import Credentials
    creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if creds.expired and creds.refresh_token:
        from google.auth.transport.requests import Request
        creds.refresh(Request())
        TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")

    return build("calendar", "v3", credentials=creds)


def get_availability(date_str: str) -> dict[str, Any]:
    """
    Check Jamie's calendar for free 2-hour slots on the given date.

    Args:
        date_str: Date in YYYY-MM-DD format.

    Returns:
        dict with keys: date, available_slots (list of HH:MM start times), timezone.
    """
    tz = _timezone()
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return {"date": date_str, "available_slots": [], "timezone": str(tz)}

    now = datetime.now(tz=tz)

    # If asking about today and it's already past 17:00, nothing is bookable.
    if target_date == now.date() and now.hour >= 17:
        return {"date": date_str, "available_slots": [], "timezone": str(tz)}

    day_start = datetime(target_date.year, target_date.month, target_date.day,
                         _WORK_START_HOUR, 0, tzinfo=tz)
    day_end = datetime(target_date.year, target_date.month, target_date.day,
                       _WORK_END_HOUR, 0, tzinfo=tz)

    service = get_calendar_service()
    body = {
        "timeMin": day_start.isoformat(),
        "timeMax": day_end.isoformat(),
        "items": [{"id": _calendar_id()}],
    }
    result = service.freebusy().query(body=body).execute()
    busy_periods = result.get("calendars", {}).get(_calendar_id(), {}).get("busy", [])

    # Build list of busy intervals as (start, end) datetime pairs.
    busy: list[tuple[datetime, datetime]] = []
    for period in busy_periods:
        b_start = datetime.fromisoformat(period["start"]).astimezone(tz)
        b_end = datetime.fromisoformat(period["end"]).astimezone(tz)
        busy.append((b_start, b_end))

    # Walk through potential 2-hour slots within working hours.
    available: list[str] = []
    slot_start = day_start
    while slot_start + timedelta(hours=_SLOT_HOURS) <= day_end:
        slot_end = slot_start + timedelta(hours=_SLOT_HOURS)

        # Skip slots that have already started (for today).
        if slot_start <= now:
            slot_start += timedelta(hours=_SLOT_HOURS)
            continue

        # Check for overlap with any busy period.
        overlaps = any(b_start < slot_end and b_end > slot_start for b_start, b_end in busy)
        if not overlaps:
            available.append(slot_start.strftime("%H:%M"))

        slot_start += timedelta(hours=_SLOT_HOURS)

    return {
        "date": date_str,
        "available_slots": available,
        "timezone": str(tz),
    }


def create_booking(
    date_str: str,
    time_str: str,
    customer_name: str,
    customer_phone: str,
    postcode: str,
    vehicle: str,
    fault_summary: str,
) -> dict[str, Any]:
    """
    Create a 2-hour confirmed booking on Jamie's Google Calendar.

    Returns a dict with success flag and event details, or success=False with error.
    """
    tz = _timezone()
    try:
        start_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M").replace(tzinfo=tz)
    except ValueError as exc:
        return {"success": False, "error": f"Invalid date/time format: {exc}"}

    end_dt = start_dt + timedelta(hours=_SLOT_HOURS)
    summary = f"TPD \u2014 {customer_name} \u2014 {vehicle}"
    description = (
        f"Customer: {customer_name}\n"
        f"Phone: {customer_phone}\n"
        f"Postcode: {postcode}\n"
        f"Vehicle: {vehicle}\n"
        f"Fault / job: {fault_summary}\n"
        f"Booked via: Carl (website chatbot)"
    )

    event_body = {
        "summary": summary,
        "description": description,
        "start": {"dateTime": start_dt.isoformat(), "timeZone": str(tz)},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": str(tz)},
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 24 * 60},
                {"method": "popup", "minutes": 60},
            ],
        },
    }

    try:
        service = get_calendar_service()
        event = service.events().insert(calendarId=_calendar_id(), body=event_body).execute()
        return {
            "success": True,
            "event_id": event.get("id", ""),
            "summary": event.get("summary", summary),
            "start": event["start"]["dateTime"],
            "end": event["end"]["dateTime"],
        }
    except Exception as exc:
        return {"success": False, "error": str(exc)}


from zone_tool import ZONE_TOOL, execute_zone_tool  # noqa: E402

CALENDAR_TOOLS: list[dict[str, Any]] = [
    ZONE_TOOL,
    {
        "type": "function",
        "function": {
            "name": "get_availability",
            "description": (
                "Check Jamie's calendar for available 2-hour appointment slots on a given date. "
                "Use this when a customer asks about availability, wants to book, or asks when "
                "Jamie can come out."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "date_str": {
                        "type": "string",
                        "description": (
                            "The date to check in YYYY-MM-DD format. If the customer says "
                            "'tomorrow' or 'next Monday', convert to the correct date before calling."
                        ),
                    }
                },
                "required": ["date_str"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_booking",
            "description": (
                "Create a confirmed booking on Jamie's calendar. Only call this after the customer "
                "has confirmed a specific date and time slot and you have all required details."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "date_str": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format",
                    },
                    "time_str": {
                        "type": "string",
                        "description": "Start time in HH:MM format, 24-hour",
                    },
                    "customer_name": {"type": "string"},
                    "customer_phone": {"type": "string"},
                    "postcode": {"type": "string"},
                    "vehicle": {
                        "type": "string",
                        "description": "Make, model, year and registration if known",
                    },
                    "fault_summary": {
                        "type": "string",
                        "description": "Brief description of the fault or job",
                    },
                },
                "required": [
                    "date_str",
                    "time_str",
                    "customer_name",
                    "customer_phone",
                    "postcode",
                    "vehicle",
                    "fault_summary",
                ],
            },
        },
    },
]


def execute_tool(name: str, arguments: dict[str, Any]) -> str:
    """Dispatch a tool call by name and return the result as a JSON string."""
    try:
        if name == "get_availability":
            result_dict = get_availability(**arguments)
            return json.dumps(result_dict)
        elif name == "create_booking":
            result_dict = create_booking(**arguments)
            return json.dumps(result_dict)
        elif name == "get_zone_and_price":
            return execute_zone_tool(arguments)
        else:
            return json.dumps({"error": f"Unknown tool: {name}"})
    except Exception as exc:
        return json.dumps({"error": str(exc)})
