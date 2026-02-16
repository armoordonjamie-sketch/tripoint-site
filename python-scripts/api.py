from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from typing import Any

import requests
import WazeRouteCalculator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from zoneinfo import ZoneInfo

try:
    from google.auth.transport.requests import Request as GoogleRequest
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
except Exception:  # pragma: no cover - runtime dependency guard
    Credentials = None
    service_account = None
    GoogleRequest = None
    build = None


# Patch EU search server to use the working US endpoint
WazeRouteCalculator.WazeRouteCalculator.COORD_SERVERS["EU"] = "SearchServer/mozi"

logger = logging.getLogger("tripoint.api")
logger.setLevel(logging.INFO)

app = FastAPI(title="TriPoint Booking API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASES = {
    "Tonbridge": "TN9 1PP",
    "Eltham": "SE9 4HA",
}
REGION = "EU"
LOCAL_TZ = ZoneInfo(os.getenv("TRIPOINT_TIMEZONE", "Europe/London"))
WORKDAY_START_HOUR = 6
WORKDAY_END_HOUR = 22
BOOKING_WINDOW_DAYS = 30
EARLY_LATE_BUFFER_MINUTES = 60
EARLY_LATE_MARKERS = [m.strip().lower() for m in os.getenv("EARLY_LATE_SHIFT_MARKERS", "early shift,late shift,early/late shift").split(",") if m.strip()]
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")


@dataclass(frozen=True)
class ServiceDef:
    id: str
    label: str
    duration_minutes: int
    travel_buffer_minutes: int
    min_notice_hours: int
    zone_price: dict[str, int]


SERVICE_CATALOG: dict[str, ServiceDef] = {
    "diagnostic-callout": ServiceDef(
        id="diagnostic-callout",
        label="Diagnostic Callout (Standard)",
        duration_minutes=60,
        travel_buffer_minutes=20,
        min_notice_hours=24,
        zone_price={"A": 120, "B": 135, "C": 150},
    ),
    "vor-priority-triage": ServiceDef(
        id="vor-priority-triage",
        label="VOR / Priority Triage (Commercial)",
        duration_minutes=75,
        travel_buffer_minutes=30,
        min_notice_hours=0,
        zone_price={"A": 160, "B": 175, "C": 190},
    ),
    "emissions-fault-decision": ServiceDef(
        id="emissions-fault-decision",
        label="Emissions Fault Decision Visit (AdBlue/SCR/DPF/NOx)",
        duration_minutes=90,
        travel_buffer_minutes=35,
        min_notice_hours=24,
        zone_price={"A": 170, "B": 185, "C": 200},
    ),
    "pre-purchase-health-check": ServiceDef(
        id="pre-purchase-health-check",
        label="Pre-Purchase Digital Health Check",
        duration_minutes=75,
        travel_buffer_minutes=30,
        min_notice_hours=24,
        zone_price={"A": 160, "B": 175, "C": 190},
    ),
}


class ZoneResponse(BaseModel):
    postcode: str
    best_base_name: str
    best_base_address: str
    time_minutes: float
    distance_km: float
    zone: str
    details: dict[str, Any]


class ServicePublic(BaseModel):
    id: str
    label: str
    duration_minutes: int
    min_notice_hours: int
    zone_price: dict[str, int]


class AvailabilityResponse(BaseModel):
    postcode: str
    zone: str
    drive_time_minutes: float
    travel_buffer_minutes: int
    service_duration_minutes: int
    booking_duration_minutes: int
    fixed_price_gbp: int | None
    deposit_gbp: int | None
    manual_review_required: bool
    slots: list[str]


class BookingRequest(BaseModel):
    service_ids: list[str] = Field(min_length=1)
    slot_start_iso: str
    full_name: str = Field(min_length=2)
    email: EmailStr
    phone: str = Field(min_length=7)
    postcode: str = Field(min_length=3)
    address_line_1: str = Field(min_length=2)
    town_city: str = Field(min_length=2)
    vehicle_registration: str = Field(min_length=2)
    vehicle_make: str = Field(min_length=1)
    vehicle_model: str = Field(min_length=1)
    approximate_mileage: str = Field(min_length=1)
    symptoms: str = Field(min_length=4)
    safe_location_confirmed: bool
    additional_notes: str | None = None


class BookingResponse(BaseModel):
    status: str
    message: str
    event_id: str | None = None
    zone: str
    fixed_price_gbp: int | None
    deposit_gbp: int | None


class CancelRequest(BaseModel):
    event_id: str


class RescheduleRequest(BaseModel):
    event_id: str
    slot_start_iso: str


def get_zone(minutes: float) -> str:
    if minutes <= 25:
        return "A"
    if minutes <= 45:
        return "B"
    if minutes <= 60:
        return "C"
    return "Out of area"


def calculate_single_route(start: str, end: str) -> tuple[float | None, float | None]:
    try:
        route = WazeRouteCalculator.WazeRouteCalculator(start, end, REGION)
        time_mins, distance_km = route.calc_route_info()
        return time_mins, distance_km
    except Exception as exc:
        logger.error("Error calculating route %s -> %s: %s", start, end, exc)
        return None, None


def calculate_zone_and_drive_time(postcode: str) -> ZoneResponse:
    details: dict[str, Any] = {}
    valid_results: list[dict[str, Any]] = []

    for base_name, base_address in BASES.items():
        time_mins, dist_km = calculate_single_route(base_address, postcode)
        details[base_name] = {"time": time_mins, "distance": dist_km, "address": base_address}
        if time_mins is not None:
            valid_results.append(
                {
                    "base_name": base_name,
                    "base_address": base_address,
                    "time": time_mins,
                    "distance": dist_km,
                }
            )

    if not valid_results:
        raise HTTPException(status_code=400, detail="Could not calculate routes for the provided postcode.")

    best_route = min(valid_results, key=lambda x: x["time"])
    zone = get_zone(best_route["time"])

    return ZoneResponse(
        postcode=postcode,
        best_base_name=best_route["base_name"],
        best_base_address=best_route["base_address"],
        time_minutes=round(best_route["time"], 2),
        distance_km=round(best_route["distance"], 2),
        zone=zone,
        details=details,
    )


def _require_google_client() -> None:
    if not (Credentials and service_account and GoogleRequest and build):
        raise HTTPException(
            status_code=500,
            detail="Google Calendar dependencies are missing. Install google-api-python-client and google-auth packages.",
        )


def _build_google_credentials():
    _require_google_client()
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
        return creds.with_subject(delegated_user) if delegated_user else creds

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")
    if client_id and client_secret and refresh_token:
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
            scopes=scopes,
        )
        creds.refresh(GoogleRequest())
        return creds

    raise HTTPException(
        status_code=500,
        detail="Google Calendar credentials are not configured.",
    )


def _get_calendar_service():
    creds = _build_google_credentials()
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _parse_google_dt(raw: dict[str, Any]) -> datetime:
    if "dateTime" in raw:
        return datetime.fromisoformat(raw["dateTime"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    return datetime.fromisoformat(f"{raw['date']}T00:00:00+00:00").astimezone(LOCAL_TZ)


def _extract_event_buffer_minutes(event: dict[str, Any]) -> int:
    summary = (event.get("summary") or "").lower()
    description = (event.get("description") or "")

    if any(marker in summary for marker in EARLY_LATE_MARKERS):
        return EARLY_LATE_BUFFER_MINUTES

    match = re.search(r"TP_BUFFER_MINUTES:(\d+)", description)
    if match:
        return int(match.group(1))
    return 0


def _is_busy_event(event: dict[str, Any]) -> bool:
    if event.get("status") == "cancelled":
        return False
    if event.get("transparency") == "transparent":
        return False
    return True


def _fetch_busy_intervals(window_start: datetime, window_end: datetime) -> list[tuple[datetime, datetime]]:
    service = _get_calendar_service()
    page_token = None
    intervals: list[tuple[datetime, datetime]] = []

    while True:
        result = (
            service.events()
            .list(
                calendarId=CALENDAR_ID,
                timeMin=window_start.astimezone(timezone.utc).isoformat(),
                timeMax=window_end.astimezone(timezone.utc).isoformat(),
                singleEvents=True,
                orderBy="startTime",
                pageToken=page_token,
            )
            .execute()
        )

        for event in result.get("items", []):
            if not _is_busy_event(event):
                continue

            start = _parse_google_dt(event["start"])
            end = _parse_google_dt(event["end"])
            buffer_minutes = _extract_event_buffer_minutes(event)
            intervals.append((start - timedelta(minutes=buffer_minutes), end + timedelta(minutes=buffer_minutes)))

        page_token = result.get("nextPageToken")
        if not page_token:
            break

    return intervals


def _round_to_half_hour(dt: datetime) -> datetime:
    minute = 30 if dt.minute >= 30 else 0
    rounded = dt.replace(minute=minute, second=0, microsecond=0)
    if rounded < dt:
        rounded += timedelta(minutes=30)
    return rounded


def _service_bundle(service_ids: list[str]) -> list[ServiceDef]:
    unknown = [service_id for service_id in service_ids if service_id not in SERVICE_CATALOG]
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unknown service ids: {', '.join(unknown)}")
    return [SERVICE_CATALOG[s] for s in service_ids]


def _compute_booking_requirements(service_ids: list[str], drive_time_minutes: float) -> tuple[int, int, int]:
    services = _service_bundle(service_ids)
    service_duration = sum(service.duration_minutes for service in services)
    service_buffer = sum(service.travel_buffer_minutes for service in services)
    zone_travel_component = int(round(drive_time_minutes))
    travel_buffer = max(30, min(180, zone_travel_component + service_buffer))
    return service_duration, travel_buffer, service_duration + travel_buffer


def _calc_fixed_price(service_ids: list[str], zone: str, start_local: datetime) -> int | None:
    if zone not in {"A", "B", "C"}:
        return None

    services = _service_bundle(service_ids)
    base_price = sum(s.zone_price[zone] for s in services)

    if start_local.hour < 8 or start_local.hour >= 19:
        base_price += 20
    if start_local.hour == 21 and any(s.id == "diagnostic-callout" for s in services):
        base_price += 40

    return base_price


def _calc_deposit(service_ids: list[str], zone: str) -> int | None:
    if zone not in {"A", "B", "C"}:
        return None
    if zone == "C" or "vor-priority-triage" in service_ids:
        return 50
    return 30


def _generate_available_slots(
    now_local: datetime,
    start_day: date,
    service_duration_mins: int,
    travel_buffer_mins: int,
    min_notice_hours: int,
    blocked_intervals: list[tuple[datetime, datetime]],
) -> list[datetime]:
    slots: list[datetime] = []
    horizon_end = now_local + timedelta(days=BOOKING_WINDOW_DAYS)
    notice_cutoff = now_local + timedelta(hours=min_notice_hours)

    for day_offset in range(BOOKING_WINDOW_DAYS + 1):
        current_day = start_day + timedelta(days=day_offset)
        day_start = datetime.combine(current_day, time(hour=WORKDAY_START_HOUR, tzinfo=LOCAL_TZ))
        day_end = datetime.combine(current_day, time(hour=WORKDAY_END_HOUR, tzinfo=LOCAL_TZ))

        cursor = _round_to_half_hour(day_start)
        while cursor < day_end:
            booking_start = cursor
            booking_end = booking_start + timedelta(minutes=service_duration_mins)
            blocked_start = booking_start - timedelta(minutes=travel_buffer_mins)
            blocked_end = booking_end + timedelta(minutes=travel_buffer_mins)

            if booking_start >= notice_cutoff and booking_end <= day_end and booking_start <= horizon_end:
                conflict = any(blocked_start < existing_end and blocked_end > existing_start for existing_start, existing_end in blocked_intervals)
                if not conflict:
                    slots.append(booking_start)
            cursor += timedelta(minutes=30)

    return slots


def _send_zoho_email(subject: str, html_body: str, to_emails: list[str]) -> None:
    access_token = os.getenv("ZOHO_MAIL_ACCESS_TOKEN")
    account_id = os.getenv("ZOHO_MAIL_ACCOUNT_ID")
    from_email = os.getenv("ZOHO_FROM_EMAIL", "contact@tripointdiagnostics.co.uk")

    if not (access_token and account_id):
        logger.warning("Zoho email not configured - skipping outbound email")
        return

    try:
        response = requests.post(
            f"https://mail.zoho.com/api/accounts/{account_id}/messages",
            headers={"Authorization": f"Zoho-oauthtoken {access_token}"},
            data={
                "fromAddress": from_email,
                "toAddress": ",".join(to_emails),
                "subject": subject,
                "content": html_body,
                "mailFormat": "html",
            },
            timeout=15,
        )
        response.raise_for_status()
    except Exception as exc:
        logger.error("Failed sending Zoho email: %s", exc)


@app.get("/calculate-zone", response_model=ZoneResponse)
async def calculate_zone(postcode: str):
    return calculate_zone_and_drive_time(postcode)


@app.get("/booking/services", response_model=list[ServicePublic])
async def get_services():
    return [
        ServicePublic(
            id=service.id,
            label=service.label,
            duration_minutes=service.duration_minutes,
            min_notice_hours=service.min_notice_hours,
            zone_price=service.zone_price,
        )
        for service in SERVICE_CATALOG.values()
    ]


@app.get("/booking/availability", response_model=AvailabilityResponse)
async def get_booking_availability(postcode: str, service_ids: str, from_date: str | None = None):
    service_list = [sid.strip() for sid in service_ids.split(",") if sid.strip()]
    if not service_list:
        raise HTTPException(status_code=400, detail="At least one service must be selected")

    zone_data = calculate_zone_and_drive_time(postcode)
    service_duration, travel_buffer, _ = _compute_booking_requirements(service_list, zone_data.time_minutes)
    min_notice = max(SERVICE_CATALOG[s].min_notice_hours for s in service_list)
    now_local = datetime.now(tz=LOCAL_TZ)

    start_day = now_local.date()
    if from_date:
        start_day = max(start_day, date.fromisoformat(from_date))

    if zone_data.zone == "Out of area":
        return AvailabilityResponse(
            postcode=postcode,
            zone=zone_data.zone,
            drive_time_minutes=zone_data.time_minutes,
            travel_buffer_minutes=travel_buffer,
            service_duration_minutes=service_duration,
            booking_duration_minutes=service_duration + travel_buffer,
            fixed_price_gbp=None,
            deposit_gbp=None,
            manual_review_required=True,
            slots=[],
        )

    window_start = datetime.combine(start_day, time(hour=WORKDAY_START_HOUR, tzinfo=LOCAL_TZ)) - timedelta(hours=4)
    window_end = window_start + timedelta(days=BOOKING_WINDOW_DAYS + 2)
    blocked_intervals = _fetch_busy_intervals(window_start, window_end)
    slots = _generate_available_slots(now_local, start_day, service_duration, travel_buffer, min_notice, blocked_intervals)

    example_start = slots[0] if slots else now_local
    return AvailabilityResponse(
        postcode=postcode,
        zone=zone_data.zone,
        drive_time_minutes=zone_data.time_minutes,
        travel_buffer_minutes=travel_buffer,
        service_duration_minutes=service_duration,
        booking_duration_minutes=service_duration + travel_buffer,
        fixed_price_gbp=_calc_fixed_price(service_list, zone_data.zone, example_start),
        deposit_gbp=_calc_deposit(service_list, zone_data.zone),
        manual_review_required=False,
        slots=[slot.isoformat() for slot in slots],
    )


@app.post("/booking/reserve", response_model=BookingResponse)
async def reserve_booking(payload: BookingRequest):
    if not payload.safe_location_confirmed:
        raise HTTPException(status_code=400, detail="Safe working location confirmation is required")

    zone_data = calculate_zone_and_drive_time(payload.postcode)
    services = _service_bundle(payload.service_ids)
    service_duration, travel_buffer, _ = _compute_booking_requirements(payload.service_ids, zone_data.time_minutes)

    slot_start = datetime.fromisoformat(payload.slot_start_iso.replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    if slot_start.minute not in (0, 30):
        raise HTTPException(status_code=400, detail="Bookings must start on :00 or :30")

    min_notice = max(service.min_notice_hours for service in services)
    if slot_start < datetime.now(tz=LOCAL_TZ) + timedelta(hours=min_notice):
        raise HTTPException(status_code=400, detail=f"Minimum notice for selected service is {min_notice} hours")

    fixed_price = _calc_fixed_price(payload.service_ids, zone_data.zone, slot_start)
    deposit = _calc_deposit(payload.service_ids, zone_data.zone)

    if zone_data.zone == "Out of area":
        _send_zoho_email(
            "Manual booking review required (out of area)",
            f"<p>Out-of-area booking request for {payload.full_name} ({payload.postcode}). Drive time: {zone_data.time_minutes} mins.</p>",
            ["contact@tripointdiagnostics.co.uk"],
        )
        return BookingResponse(
            status="pending_manual_review",
            message="Drive time exceeds 60 minutes. We've received your request and will contact you with a quote.",
            zone=zone_data.zone,
            fixed_price_gbp=None,
            deposit_gbp=None,
        )

    slot_end = slot_start + timedelta(minutes=service_duration)
    service = _get_calendar_service()
    event_body = {
        "summary": f"Booking: {', '.join(service.label for service in services)} - {payload.full_name}",
        "description": (
            f"Customer: {payload.full_name}\n"
            f"Email: {payload.email}\n"
            f"Phone: {payload.phone}\n"
            f"Postcode: {payload.postcode}\n"
            f"Address: {payload.address_line_1}, {payload.town_city}\n"
            f"Vehicle: {payload.vehicle_registration} ({payload.vehicle_make} {payload.vehicle_model})\n"
            f"Mileage: {payload.approximate_mileage}\n"
            f"Symptoms: {payload.symptoms}\n"
            f"Notes: {payload.additional_notes or 'N/A'}\n"
            f"Zone: {zone_data.zone}\n"
            f"Drive time: {zone_data.time_minutes} mins\n"
            f"Fixed price: £{fixed_price}\n"
            f"Deposit: £{deposit}\n"
            f"TP_BUFFER_MINUTES:{travel_buffer}"
        ),
        "start": {"dateTime": slot_start.isoformat(), "timeZone": str(LOCAL_TZ)},
        "end": {"dateTime": slot_end.isoformat(), "timeZone": str(LOCAL_TZ)},
        "attendees": [{"email": payload.email}],
    }

    created = service.events().insert(calendarId=CALENDAR_ID, body=event_body, sendUpdates="all").execute()

    customer_subject = "Your TriPoint booking is confirmed"
    customer_html = (
        f"<h2>Booking confirmed</h2><p>Hi {payload.full_name},</p>"
        f"<p>Your booking is confirmed for {slot_start.strftime('%A %d %B %Y, %H:%M')}.</p>"
        f"<p>Service(s): {', '.join(service.label for service in services)}<br/>"
        f"Zone: {zone_data.zone}<br/>"
        f"Fixed price: £{fixed_price}<br/>"
        f"Deposit: £{deposit}</p>"
        "<p>Thanks,<br/>TriPoint Diagnostics</p>"
    )
    _send_zoho_email(customer_subject, customer_html, [payload.email])

    internal_subject = f"New booking: {payload.full_name} ({payload.postcode})"
    _send_zoho_email(internal_subject, customer_html, ["contact@tripointdiagnostics.co.uk"])

    return BookingResponse(
        status="confirmed",
        message="Booking confirmed and added to calendar.",
        event_id=created.get("id"),
        zone=zone_data.zone,
        fixed_price_gbp=fixed_price,
        deposit_gbp=deposit,
    )


@app.post("/booking/cancel")
async def cancel_booking(payload: CancelRequest):
    service = _get_calendar_service()
    service.events().delete(calendarId=CALENDAR_ID, eventId=payload.event_id, sendUpdates="all").execute()
    return {"status": "cancelled", "event_id": payload.event_id}


@app.post("/booking/reschedule")
async def reschedule_booking(payload: RescheduleRequest):
    service = _get_calendar_service()
    event = service.events().get(calendarId=CALENDAR_ID, eventId=payload.event_id).execute()
    start = datetime.fromisoformat(payload.slot_start_iso.replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    old_start = _parse_google_dt(event["start"])
    old_end = _parse_google_dt(event["end"])
    duration = old_end - old_start
    end = start + duration

    event["start"] = {"dateTime": start.isoformat(), "timeZone": str(LOCAL_TZ)}
    event["end"] = {"dateTime": end.isoformat(), "timeZone": str(LOCAL_TZ)}

    updated = service.events().update(calendarId=CALENDAR_ID, eventId=payload.event_id, body=event, sendUpdates="all").execute()
    return {"status": "rescheduled", "event_id": updated.get("id"), "start": start.isoformat()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
