from __future__ import annotations

import html
import json
import logging
import os
import re
from pathlib import Path
from urllib.parse import quote
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from typing import Any

import requests
import smtplib
import ssl
from email.message import EmailMessage
import WazeRouteCalculator
from fastapi import Cookie, FastAPI, File, Form, HTTPException, Header, Depends, Request, Response, UploadFile

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

load_dotenv()

from email_templates import EmailTemplateService
from db import (
    STATUS_CANCELLED,
    STATUS_COMPLETED_PAID,
    STATUS_COMPLETED_UNPAID,
    STATUS_DEPOSIT_PAID,
    STATUS_PENDING_DEPOSIT,
    expire_old_pending_bookings,
    generate_booking_id,
    generate_payment_token,
    get_blocked_slot_intervals,
    get_booking_by_id,
    get_booking_by_stripe_session,
    get_booking_by_token,
    init_db,
    insert_booking,
    payment_event_exists,
    record_payment_event,
    set_stripe_balance_session,
    set_stripe_deposit_session,
    update_booking_balance_paid,
    update_booking_deposit_paid,
)

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

# Email template service - resolve path from this file so it works regardless of CWD
_templates_dir = os.getenv("EMAIL_TEMPLATES_DIR") or str(
    Path(__file__).resolve().parent.parent / "email-templates"
)
template_service = EmailTemplateService(templates_dir=_templates_dir)
logger.info("Email templates dir: %s (exists=%s)", _templates_dir, Path(_templates_dir).exists())


app = FastAPI(title="TriPoint Booking API")


@app.on_event("startup")
async def startup_event():
    await init_db()
    # Mount media storage for report uploads
    from pathlib import Path
    from services.media_storage import MEDIA_DIR
    media_path = Path(MEDIA_DIR)
    media_path.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(media_path)), name="media")


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
SITE_URL = os.getenv("SITE_URL", "https://tripointdiagnostics.co.uk")
PENDING_BOOKING_TTL_MINS = int(os.getenv("PENDING_BOOKING_TTL_MINS", "30"))


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
    "vor-van-diagnostics": ServiceDef(
        id="vor-van-diagnostics",
        label="VOR Van Diagnostics",
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
    "adblue-countdown": ServiceDef(
        id="adblue-countdown",
        label="AdBlue Countdown Fix",
        duration_minutes=90,
        travel_buffer_minutes=35,
        min_notice_hours=24,
        zone_price={"A": 170, "B": 185, "C": 200},
    ),
    "dpf-regeneration-decision": ServiceDef(
        id="dpf-regeneration-decision",
        label="DPF Warning Light Diagnostic",
        duration_minutes=90,
        travel_buffer_minutes=35,
        min_notice_hours=24,
        zone_price={"A": 170, "B": 185, "C": 200},
    ),
    "nox-scr-diagnostics": ServiceDef(
        id="nox-scr-diagnostics",
        label="NOx Sensor & SCR Diagnostics",
        duration_minutes=90,
        travel_buffer_minutes=35,
        min_notice_hours=24,
        zone_price={"A": 170, "B": 185, "C": 200},
    ),
    "sprinter-limp-mode": ServiceDef(
        id="sprinter-limp-mode",
        label="Sprinter Limp Mode Diagnostic",
        duration_minutes=60,
        travel_buffer_minutes=20,
        min_notice_hours=24,
        zone_price={"A": 120, "B": 135, "C": 150},
    ),
    "intermittent-electrical-faults": ServiceDef(
        id="intermittent-electrical-faults",
        label="Intermittent Electrical Diagnostic",
        duration_minutes=60,
        travel_buffer_minutes=20,
        min_notice_hours=24,
        zone_price={"A": 120, "B": 135, "C": 150},
    ),
    "mercedes-xentry-diagnostics": ServiceDef(
        id="mercedes-xentry-diagnostics",
        label="Mercedes Xentry Diagnostics & Coding",
        duration_minutes=60,
        travel_buffer_minutes=20,
        min_notice_hours=24,
        zone_price={"A": 120, "B": 135, "C": 150},
    ),
    "pre-purchase-health-check": ServiceDef(
        id="pre-purchase-health-check",
        label="Pre-Purchase Digital Health Check",
        duration_minutes=75,
        travel_buffer_minutes=30,
        min_notice_hours=24,
        zone_price={"A": 160, "B": 175, "C": 190},
    ),
    "fleet-health-check": ServiceDef(
        id="fleet-health-check",
        label="Fleet Diagnostic Health Check",
        duration_minutes=60,
        travel_buffer_minutes=20,
        min_notice_hours=24,
        zone_price={"A": 120, "B": 135, "C": 150},
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


class Slot(BaseModel):
    iso: str
    available: bool


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
    slots: list[Slot]


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
    symptoms: str = Field(min_length=2)
    safe_location_confirmed: bool
    additional_notes: str | None = None


class BookingResponse(BaseModel):
    status: str
    message: str
    event_id: str | None = None
    payment_url: str | None = None
    booking_id: str | None = None
    zone: str
    fixed_price_gbp: int | None
    deposit_gbp: int | None


class CancelRequest(BaseModel):
    event_id: str


class RescheduleRequest(BaseModel):
    event_id: str
    slot_start_iso: str


class TemplatePreviewRequest(BaseModel):
    data: dict[str, str] = Field(default_factory=dict)


class SendTestEmailRequest(BaseModel):
    to: EmailStr
    template: str
    data: dict[str, str] = Field(default_factory=dict)
    force: bool = False


class DepositSessionRequest(BaseModel):
    token: str = Field(min_length=10)


class AdminLoginRequest(BaseModel):
    password: str = Field(min_length=1)


class CreateReportRequest(BaseModel):
    booking_id: str = Field(min_length=1)


class ReportPatchRequest(BaseModel):
    status: str | None = None
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    customer_address: str | None = None
    customer_postcode: str | None = None


class VehicleCreateRequest(BaseModel):
    reg: str | None = None
    vin: str | None = None
    make: str | None = None
    model: str | None = None
    variant: str | None = None
    mileage: str | None = None
    drivability_status: str | None = None
    notes: str | None = None


class VehiclePatchRequest(BaseModel):
    sort_order: int | None = None
    reg: str | None = None
    vin: str | None = None
    make: str | None = None
    model: str | None = None
    variant: str | None = None
    mileage: str | None = None
    drivability_status: str | None = None
    notes: str | None = None


class FaultCreateRequest(BaseModel):
    title: str = Field(min_length=1)
    severity: str | None = None
    status: str | None = None
    impact: str | None = None
    dtcs: list | dict | None = None
    root_causes: list | dict | None = None
    conclusion: str | None = None
    action_plan: list | dict | None = None
    parts_required: list | dict | None = None
    coding_required: list | dict | None = None
    explanation: str | None = None
    solution: str | None = None


class FaultPatchRequest(BaseModel):
    sort_order: int | None = None
    title: str | None = None
    severity: str | None = None
    status: str | None = None
    impact: str | None = None
    dtcs: list | dict | None = None
    root_causes: list | dict | None = None
    conclusion: str | None = None
    action_plan: list | dict | None = None
    parts_required: list | dict | None = None
    coding_required: list | dict | None = None
    explanation: str | None = None
    solution: str | None = None


class TestCreateRequest(BaseModel):
    fault_id: str | None = None
    test_name: str = Field(min_length=1)
    tool_used: str | None = None
    result: str | None = None
    readings: list | dict | None = None
    notes: str | None = None


class TestPatchRequest(BaseModel):
    fault_id: str | None = None
    sort_order: int | None = None
    test_name: str | None = None
    tool_used: str | None = None
    result: str | None = None
    readings: list | dict | None = None
    notes: str | None = None


class MediaPatchRequest(BaseModel):
    vehicle_id: str | None = None
    fault_id: str | None = None
    test_id: str | None = None
    caption: str | None = None


class ContactSubmitRequest(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    phone: str = Field(min_length=7)
    postcode: str = Field(min_length=3)
    message: str = Field(min_length=10)
    safe_location_confirmed: bool
    vehicle_registration: str | None = None


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
        
        items = result.get("items", [])
        logger.info(f"DEBUG: Fetched {len(items)} events from calendar '{CALENDAR_ID}' for window {window_start} - {window_end}")
        for event in items:
            logger.info(f"DEBUG: Found event: {event.get('summary', 'No Title')} ({event.get('start')}) Transparency: {event.get('transparency', 'opaque')}")
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
) -> list[Slot]:
    slots: list[Slot] = []
    horizon_end = now_local + timedelta(days=BOOKING_WINDOW_DAYS)
    notice_cutoff = now_local + timedelta(hours=min_notice_hours)

    for day_offset in range(BOOKING_WINDOW_DAYS + 1):
        current_day = start_day + timedelta(days=day_offset)
        # Weekends? (Optional: keep simple, just 6-22 every day)
        day_start = datetime.combine(current_day, time(hour=WORKDAY_START_HOUR, tzinfo=LOCAL_TZ))
        day_end = datetime.combine(current_day, time(hour=WORKDAY_END_HOUR, tzinfo=LOCAL_TZ))

        # Reset cursor to start of day for consistency in grid? 
        # User said "show all slots for this week". If I show slots from 6am when it's 4pm, 
        # it helps them see "oh, mornings are usually an option".
        # Let's start cursor at day_start.
        cursor = day_start

        while cursor < day_end:
            booking_start = cursor
            booking_end = booking_start + timedelta(minutes=service_duration_mins)
            blocked_start = booking_start - timedelta(minutes=travel_buffer_mins)
            blocked_end = booking_end + timedelta(minutes=travel_buffer_mins)

            is_available = True
            
            # Check 1: In the past?
            if booking_start < now_local:
                is_available = False
            
            # Check 2: Too soon (min notice)?
            elif booking_start < notice_cutoff:
                is_available = False
            
            # Check 3: Beyond horizon?
            elif booking_start > horizon_end:
                 is_available = False

            # Check 4: Calendar conflict?
            if is_available:
                conflict = any(blocked_start < existing_end and blocked_end > existing_start for existing_start, existing_end in blocked_intervals)
                if conflict:
                    is_available = False

            slots.append(Slot(iso=booking_start.isoformat(), available=is_available))
            cursor += timedelta(minutes=30)

    return slots


def _send_zoho_email(
    subject: str,
    html_body: str,
    to_emails: list[str],
    text_body: str | None = None,
    reply_to: str | None = None,
    raise_for_status: bool = False,
    attachments: list[tuple[str, bytes, str]] | None = None,
) -> bool:
    smtp_host = os.getenv("ZOHO_SMTP_HOST", "smtp.zoho.eu")
    smtp_port = int(os.getenv("ZOHO_SMTP_PORT", 465))
    smtp_user = os.getenv("ZOHO_SMTP_USER")
    smtp_pass = os.getenv("ZOHO_SMTP_PASS")
    # from_email fallback
    from_email = os.getenv("ZOHO_FROM_EMAIL", smtp_user)

    if not (smtp_user and smtp_pass):
         logger.warning("Zoho SMTP not configured - skipping outbound email")
         return False

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = ", ".join(to_emails)
        
        if reply_to:
            msg["Reply-To"] = reply_to

        # Set plain text body first
        if text_body:
             msg.set_content(text_body)
        else:
             msg.set_content("This email requires an HTML-compatible viewer.")

        # Add HTML version
        msg.add_alternative(html_body, subtype="html")

        # Add attachments
        if attachments:
            for filename, content, mimetype in attachments:
                msg.add_attachment(content, maintype=mimetype.split("/")[0], subtype=mimetype.split("/")[-1], filename=filename)

        context = ssl.create_default_context()
        
        logger.info(f"Connecting to SMTP {smtp_host}:{smtp_port} as {smtp_user}...")
        
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            
        logger.info(f"Email sent successfully to {to_emails}")
        return True

    except Exception as exc:
        logger.error(f"Failed sending Zoho email (SMTP): {exc}")
        if raise_for_status:
            raise HTTPException(status_code=500, detail=f"Failed sending email: {exc}")
        return False



def verify_admin_key(x_admin_key: str | None = Header(default=None)):
    """Dependency to check admin key for sensitive endpoints."""
    # SKIP if env var not set (dev mode convenience)
    admin_secret = os.getenv("ADMIN_KEY")
    if not admin_secret:
        return
    
    if x_admin_key != admin_secret:
        raise HTTPException(status_code=401, detail="Invalid admin key")



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
    await expire_old_pending_bookings(PENDING_BOOKING_TTL_MINS)
    calendar_intervals = _fetch_busy_intervals(window_start, window_end)
    db_intervals = await get_blocked_slot_intervals(window_start, window_end, travel_buffer)
    blocked_intervals = list(calendar_intervals) + list(db_intervals)
    slots = _generate_available_slots(now_local, start_day, service_duration, travel_buffer, min_notice, blocked_intervals)

    example_start = next((datetime.fromisoformat(s.iso) for s in slots if s.available), now_local)

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
        slots=slots,
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
    drive_time_mins = int(round(zone_data.time_minutes))
    total_pence = (fixed_price or 0) * 100
    deposit_pence = (deposit or 0) * 100
    balance_pence = total_pence - deposit_pence

    booking_id = generate_booking_id()
    payment_token = generate_payment_token()
    payment_url = f"{SITE_URL}/pay/{payment_token}"

    await insert_booking(
        id=booking_id,
        payment_link_token=payment_token,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        postcode=payload.postcode,
        address_line_1=payload.address_line_1,
        town_city=payload.town_city,
        vehicle_reg=payload.vehicle_registration,
        vehicle_make=payload.vehicle_make,
        vehicle_model=payload.vehicle_model,
        approx_mileage=payload.approximate_mileage,
        symptoms=payload.symptoms,
        additional_notes=payload.additional_notes,
        safe_location=payload.safe_location_confirmed,
        service_ids=",".join(payload.service_ids),
        slot_start_iso=slot_start.isoformat(),
        slot_end_iso=slot_end.isoformat(),
        zone=zone_data.zone,
        drive_time_mins=drive_time_mins,
        travel_buffer=travel_buffer,
        total_amount=total_pence,
        deposit_amount=deposit_pence,
        balance_due=balance_pence,
    )

    tech_name = os.getenv("TECH_NAME", "TriPoint Team")
    client_first_name = payload.full_name.strip().split()[0] if payload.full_name.strip() else "there"
    vehicle_make_model = f"{payload.vehicle_make} {payload.vehicle_model}".strip() or "-"
    service_labels = ", ".join(s.label for s in services)
    booking_date = slot_start.strftime("%A %d %B %Y")
    booking_time_window = f"{slot_start.strftime('%H:%M')} – {slot_end.strftime('%H:%M')}"

    template_data = {
        "CLIENT_FIRST_NAME": client_first_name,
        "BOOKING_ID": booking_id,
        "SERVICE_NAME": service_labels,
        "BOOKING_DATE": booking_date,
        "BOOKING_TIME_WINDOW": booking_time_window,
        "VEHICLE_MAKE_MODEL": vehicle_make_model,
        "VEHICLE_REG": payload.vehicle_registration,
        "POSTCODE": payload.postcode,
        "PAYMENT_LINK": payment_url,
        "DEPOSIT_GBP": str(deposit or 0),
        "TECH_NAME": tech_name,
    }

    result = template_service.render("08-deposit-pending", template_data)
    if result:
        _send_zoho_email(
            subject=result.subject,
            html_body=result.html,
            to_emails=[payload.email],
            text_body=result.text,
            reply_to="contact@tripointdiagnostics.co.uk",
        )
        _send_zoho_email(
            subject=f"New booking (pending deposit): {payload.full_name} ({payload.postcode})",
            html_body=result.html,
            to_emails=["contact@tripointdiagnostics.co.uk"],
        )
    else:
        customer_html = (
            f"<h2>Slot reserved</h2><p>Hi {payload.full_name},</p>"
            f"<p>We've reserved your slot for {slot_start.strftime('%A %d %B %Y, %H:%M')}.</p>"
            f"<p>Please pay your deposit of £{deposit} to confirm: <a href='{payment_url}'>{payment_url}</a></p>"
            f"<p>Service(s): {service_labels}<br/>Zone: {zone_data.zone}<br/>Fixed price: £{fixed_price}<br/>Deposit: £{deposit}</p>"
            "<p>Thanks,<br/>TriPoint Diagnostics</p>"
        )
        _send_zoho_email("Slot reserved - pay deposit to confirm", customer_html, [payload.email])
        _send_zoho_email(f"New booking (pending deposit): {payload.full_name} ({payload.postcode})", customer_html, ["contact@tripointdiagnostics.co.uk"])

    return BookingResponse(
        status="pending_deposit",
        message="Slot reserved. Please pay your deposit to confirm your booking.",
        payment_url=payment_url,
        booking_id=booking_id,
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


@app.post("/contact/submit")
async def contact_submit(payload: ContactSubmitRequest):
    if not payload.safe_location_confirmed:
        raise HTTPException(status_code=400, detail="Safe working location confirmation is required")

    tech_name = os.getenv("TECH_NAME", "TriPoint Team")
    client_first_name = payload.name.strip().split()[0] if payload.name.strip() else "there"
    vehicle_reg = (payload.vehicle_registration or "").strip().upper() or "-"

    template_data = {
        "CLIENT_FIRST_NAME": client_first_name,
        "VEHICLE_MAKE_MODEL": "Not specified",
        "VEHICLE_REG": vehicle_reg,
        "POSTCODE": payload.postcode,
        "SERVICE_NAME": "General enquiry",
        "TECH_NAME": tech_name,
    }

    result = template_service.render("01-enquiry-auto-reply", template_data)
    if not result:
        raise HTTPException(status_code=500, detail="Email template not found")

    logger.info("Sending contact auto-reply to %s using 01-enquiry-auto-reply (html_len=%d)", payload.email, len(result.html))
    _send_zoho_email(
        subject=result.subject,
        html_body=result.html,
        to_emails=[payload.email],
        text_body=result.text,
        reply_to="contact@tripointdiagnostics.co.uk",
        raise_for_status=True,
    )

    vehicle_line = f"<br/><strong>Vehicle:</strong> {html.escape(vehicle_reg)}" if vehicle_reg != "-" else ""
    internal_html = (
        f"<p><strong>New contact form submission</strong></p>"
        f"<p><strong>Name:</strong> {html.escape(payload.name)}<br/>"
        f"<strong>Email:</strong> {html.escape(payload.email)}<br/>"
        f"<strong>Phone:</strong> {html.escape(payload.phone)}<br/>"
        f"<strong>Postcode:</strong> {html.escape(payload.postcode)}{vehicle_line}</p>"
        f"<p><strong>Message:</strong></p><p>{html.escape(payload.message)}</p>"
    )
    _send_zoho_email(
        subject=f"Contact form: {payload.name} ({payload.postcode})",
        html_body=internal_html,
        to_emails=["contact@tripointdiagnostics.co.uk"],
    )

    return {"status": "sent", "message": "Thank you for your message. We'll be in touch shortly."}


# ── Admin endpoints ──────────────────────────────────────────────────────

from services.auth import (
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE,
    check_rate_limit,
    create_session_token,
    verify_admin_password,
    verify_admin_session,
    verify_session_token,
)


@app.post("/admin/login")
async def admin_login(payload: AdminLoginRequest, request: Request, response: Response):
    """Admin login: set session cookie on success."""
    check_rate_limit(request)
    if not verify_admin_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_session_token()
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        secure=os.getenv("ENVIRONMENT", "development") == "production",
        samesite="lax",
        path="/",
    )
    return {"authenticated": True}


@app.get("/admin/session")
async def admin_session(
    tripoint_admin_session: str | None = Cookie(None, alias=SESSION_COOKIE_NAME),
):
    """Check if admin session is valid."""
    if not tripoint_admin_session or not verify_session_token(tripoint_admin_session):
        return {"authenticated": False}
    return {"authenticated": True}


@app.post("/admin/logout", response_model=dict)
async def admin_logout(response: Response):
    """Clear admin session cookie."""
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return {"authenticated": False}


@app.get("/admin/bookings")
async def admin_list_bookings(
    status: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = 200,
    _: dict = Depends(verify_admin_session),
):
    """List bookings for admin dashboard."""
    from db import list_bookings

    rows = await list_bookings(status=status, date_from=date_from, date_to=date_to, limit=limit)
    return {"bookings": rows}


@app.post("/admin/bookings/{booking_id}/complete")
async def admin_complete_booking(
    booking_id: str,
    _: dict = Depends(verify_admin_session),
):
    """Mark booking as job completed (COMPLETED_UNPAID)."""
    from db import update_booking_status
    from services.calendar_service import update_event_colour

    booking = await get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.get("status") != STATUS_DEPOSIT_PAID:
        raise HTTPException(status_code=400, detail="Can only complete bookings with deposit paid")
    await update_booking_status(booking_id, STATUS_COMPLETED_UNPAID)
    event_id = booking.get("calendar_event_id")
    if event_id:
        try:
            update_event_colour(event_id, STATUS_COMPLETED_UNPAID)
        except Exception as e:
            logger.warning("Failed to update calendar colour: %s", e)
    return {"status": STATUS_COMPLETED_UNPAID, "booking_id": booking_id}


@app.post("/admin/bookings/{booking_id}/mark-paid")
async def admin_mark_paid(
    booking_id: str,
    _: dict = Depends(verify_admin_session),
):
    """Admin override: mark balance as paid without Stripe."""
    from db import record_payment_event, update_booking_status
    from services.calendar_service import update_event_colour

    booking = await get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.get("status") != STATUS_COMPLETED_UNPAID:
        raise HTTPException(status_code=400, detail="Can only mark paid for completed-unpaid bookings")
    await record_payment_event(booking_id, f"admin-mark-paid-{booking_id}", "admin_mark_paid", booking.get("balance_due"))
    await update_booking_status(booking_id, STATUS_COMPLETED_PAID)
    event_id = booking.get("calendar_event_id")
    if event_id:
        try:
            update_event_colour(event_id, STATUS_COMPLETED_PAID)
        except Exception as e:
            logger.warning("Failed to update calendar colour: %s", e)
    return {"status": STATUS_COMPLETED_PAID, "booking_id": booking_id}


@app.post("/admin/bookings/{booking_id}/generate-balance-link")
async def admin_generate_balance_link(
    booking_id: str,
    _: dict = Depends(verify_admin_session),
):
    """Generate balance payment link and optionally send email."""
    from db import get_booking_by_id

    booking = await get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.get("status") != STATUS_COMPLETED_UNPAID:
        raise HTTPException(status_code=400, detail="Can only generate balance link for completed-unpaid bookings")
    token = booking.get("payment_link_token")
    if not token:
        raise HTTPException(status_code=404, detail="Payment token not found")
    payment_url = f"{SITE_URL}/pay/{token}"
    tech_name = os.getenv("TECH_NAME", "TriPoint Team")
    client_first_name = (booking.get("full_name") or "").strip().split()[0] or "there"
    vehicle_make_model = f"{booking.get('vehicle_make') or ''} {booking.get('vehicle_model') or ''}".strip() or "-"
    service_labels = ", ".join(SERVICE_CATALOG[s].label for s in (booking.get("service_ids") or "").split(",") if s in SERVICE_CATALOG) or "Diagnostic"
    balance_gbp = (booking.get("balance_due") or 0) // 100
    template_data = {
        "CLIENT_FIRST_NAME": client_first_name,
        "BOOKING_ID": booking_id,
        "SERVICE_NAME": service_labels,
        "VEHICLE_MAKE_MODEL": vehicle_make_model,
        "VEHICLE_REG": booking.get("vehicle_reg") or "",
        "BALANCE_GBP": str(balance_gbp),
        "PAYMENT_LINK": payment_url,
        "TECH_NAME": tech_name,
    }
    result = template_service.render("10-balance-request", template_data)
    if result:
        _send_zoho_email(result.subject, result.html, [booking["email"]], result.text, reply_to="contact@tripointdiagnostics.co.uk")
    return {"payment_url": payment_url, "payment_page_url": payment_url, "email_sent": bool(result)}


# ── Report endpoints ───────────────────────────────────────────────────────

import report_db
from services.media_storage import MEDIA_DIR, get_serve_url, save_upload, delete_file


@app.post("/admin/reports")
async def admin_create_report(
    payload: CreateReportRequest,
    _: dict = Depends(verify_admin_session),
):
    """Create a new report from a booking."""
    booking = await get_booking_by_id(payload.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    report_id = report_db.generate_report_id()
    full_name = booking.get("full_name") or ""
    address = (booking.get("address_line_1") or "").strip()
    if booking.get("town_city"):
        address = f"{address}, {booking.get('town_city')}".strip(", ")
    await report_db.insert_report(
        id=report_id,
        booking_id=payload.booking_id,
        customer_name=full_name,
        customer_email=booking.get("email") or "",
        customer_phone=booking.get("phone") or "",
        customer_address=address or None,
        customer_postcode=booking.get("postcode") or "",
    )
    return {"id": report_id, "status": "DRAFT"}


@app.get("/admin/reports")
async def admin_list_reports(
    status: str | None = None,
    q: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    _: dict = Depends(verify_admin_session),
):
    """List reports with optional filters."""
    rows = await report_db.list_reports(status=status, q=q, date_from=date_from, date_to=date_to)
    return {"reports": rows}


@app.get("/admin/reports/{report_id}")
async def admin_get_report(
    report_id: str,
    _: dict = Depends(verify_admin_session),
):
    """Get full nested report (vehicles, faults, tests, media)."""
    report = await report_db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    vehicles = await report_db.list_vehicles_by_report(report_id)
    result = dict(report)
    result["vehicles"] = []
    for v in vehicles:
        faults = await report_db.list_faults_by_vehicle(v["id"])
        tests = await report_db.list_tests_by_vehicle(v["id"])
        v_copy = dict(v)
        v_copy["faults"] = faults
        v_copy["tests"] = tests
        result["vehicles"].append(v_copy)
    media = await report_db.list_media_by_report(report_id)
    for m in media:
        m["url"] = get_serve_url(m["storage_key"])
    result["media"] = media
    return result


@app.patch("/admin/reports/{report_id}")
async def admin_patch_report(
    report_id: str,
    payload: ReportPatchRequest,
    _: dict = Depends(verify_admin_session),
):
    """Update report. When status changes to COMPLETED, send email (idempotent)."""
    report = await report_db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "status" in updates and updates["status"] == "COMPLETED":
        now = datetime.now(timezone.utc).isoformat()
        updates["completed_at"] = now
        if report.get("report_email_sent", 0) == 0:
            share_token = await report_db.ensure_share_token(report_id)
            report_link = f"{SITE_URL}/report/{share_token}"
            vehicles = await report_db.list_vehicles_by_report(report_id)
            vehicle_reg = vehicles[0].get("reg") if vehicles else ""
            vehicle_make_model = ""
            if vehicles:
                v = vehicles[0]
                vehicle_make_model = f"{v.get('make') or ''} {v.get('model') or ''}".strip()
            if not vehicle_reg and report.get("booking_id"):
                b = await get_booking_by_id(report["booking_id"])
                if b:
                    vehicle_reg = b.get("vehicle_reg") or ""
                    vehicle_make_model = f"{b.get('vehicle_make') or ''} {b.get('vehicle_model') or ''}".strip()
            service_labels = "Diagnostic"
            if report.get("booking_id"):
                b = await get_booking_by_id(report["booking_id"])
                if b:
                    service_ids = (b.get("service_ids") or "").split(",")
                    service_labels = ", ".join(SERVICE_CATALOG[s].label for s in service_ids if s in SERVICE_CATALOG) or "Diagnostic"
            client_first = (report.get("customer_name") or "").strip().split()[0] or "there"
            tech_name = os.getenv("TECH_NAME", "TriPoint Team")
            template_data = {
                "CLIENT_FIRST_NAME": client_first,
                "BOOKING_ID": report.get("booking_id", ""),
                "VEHICLE_REG": vehicle_reg,
                "VEHICLE_MAKE_MODEL": vehicle_make_model or "-",
                "SERVICE_NAME": service_labels,
                "REPORT_LINK": report_link,
                "TECH_NAME": tech_name,
                "CURRENT_YEAR": str(datetime.now().year),
            }
            result = template_service.render("11-report-ready", template_data)
            if result:
                _send_zoho_email(
                    result.subject,
                    result.html,
                    [report["customer_email"]],
                    result.text,
                    reply_to="contact@tripointdiagnostics.co.uk",
                )
            updates["report_email_sent"] = 1
    if updates:
        await report_db.update_report(
            report_id,
            **{k: v for k, v in updates.items() if k in ("status", "customer_name", "customer_email", "customer_phone", "customer_address", "customer_postcode", "report_email_sent", "completed_at")},
        )
    return await admin_get_report(report_id)


@app.delete("/admin/reports/{report_id}")
async def admin_delete_report(
    report_id: str,
    _: dict = Depends(verify_admin_session),
):
    """Soft delete: set status to ARCHIVED."""
    report = await report_db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    await report_db.archive_report(report_id)
    return {"status": "ARCHIVED"}


@app.post("/admin/reports/{report_id}/vehicles")
async def admin_create_vehicle(
    report_id: str,
    payload: VehicleCreateRequest,
    _: dict = Depends(verify_admin_session),
):
    report = await report_db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    vehicle_id = report_db.generate_entity_id("veh")
    vehicles = await report_db.list_vehicles_by_report(report_id)
    sort_order = max((v.get("sort_order", 0) for v in vehicles), default=0) + 1
    await report_db.insert_vehicle(
        id=vehicle_id,
        report_id=report_id,
        sort_order=sort_order,
        reg=payload.reg,
        vin=payload.vin,
        make=payload.make,
        model=payload.model,
        variant=payload.variant,
        mileage=payload.mileage,
        drivability_status=payload.drivability_status,
        notes=payload.notes,
    )
    return {"id": vehicle_id}


@app.patch("/admin/vehicles/{vehicle_id}")
async def admin_patch_vehicle(
    vehicle_id: str,
    payload: VehiclePatchRequest,
    _: dict = Depends(verify_admin_session),
):
    vehicle = await report_db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    updates = payload.model_dump(exclude_unset=True)
    if updates:
        await report_db.update_vehicle(vehicle_id, **updates)
    return {"id": vehicle_id}


@app.delete("/admin/vehicles/{vehicle_id}")
async def admin_delete_vehicle(
    vehicle_id: str,
    _: dict = Depends(verify_admin_session),
):
    vehicle = await report_db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    await report_db.delete_vehicle(vehicle_id)
    return {"deleted": True}


@app.post("/admin/vehicles/{vehicle_id}/faults")
async def admin_create_fault(
    vehicle_id: str,
    payload: FaultCreateRequest,
    _: dict = Depends(verify_admin_session),
):
    vehicle = await report_db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    fault_id = report_db.generate_entity_id("flt")
    faults = await report_db.list_faults_by_vehicle(vehicle_id)
    sort_order = max((f.get("sort_order", 0) for f in faults), default=0) + 1
    await report_db.insert_fault(
        id=fault_id,
        vehicle_id=vehicle_id,
        sort_order=sort_order,
        title=payload.title,
        severity=payload.severity,
        status=payload.status,
        impact=payload.impact,
        dtcs=payload.dtcs,
        root_causes=payload.root_causes,
        conclusion=payload.conclusion,
        action_plan=payload.action_plan,
        parts_required=payload.parts_required,
        coding_required=payload.coding_required,
        explanation=payload.explanation,
        solution=payload.solution,
    )
    return {"id": fault_id}


@app.patch("/admin/faults/{fault_id}")
async def admin_patch_fault(
    fault_id: str,
    payload: FaultPatchRequest,
    _: dict = Depends(verify_admin_session),
):
    fault = await report_db.get_fault_by_id(fault_id)
    if not fault:
        raise HTTPException(status_code=404, detail="Fault not found")
    updates = payload.model_dump(exclude_unset=True)
    if updates:
        await report_db.update_fault(fault_id, **updates)
    return {"id": fault_id}


@app.delete("/admin/faults/{fault_id}")
async def admin_delete_fault(
    fault_id: str,
    _: dict = Depends(verify_admin_session),
):
    fault = await report_db.get_fault_by_id(fault_id)
    if not fault:
        raise HTTPException(status_code=404, detail="Fault not found")
    await report_db.delete_fault(fault_id)
    return {"deleted": True}


@app.post("/admin/vehicles/{vehicle_id}/tests")
async def admin_create_test(
    vehicle_id: str,
    payload: TestCreateRequest,
    _: dict = Depends(verify_admin_session),
):
    vehicle = await report_db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    test_id = report_db.generate_entity_id("tst")
    tests = await report_db.list_tests_by_vehicle(vehicle_id)
    sort_order = max((t.get("sort_order", 0) for t in tests), default=0) + 1
    await report_db.insert_test(
        id=test_id,
        vehicle_id=vehicle_id,
        fault_id=payload.fault_id,
        sort_order=sort_order,
        test_name=payload.test_name,
        tool_used=payload.tool_used,
        result=payload.result,
        readings=payload.readings,
        notes=payload.notes,
    )
    return {"id": test_id}


@app.patch("/admin/tests/{test_id}")
async def admin_patch_test(
    test_id: str,
    payload: TestPatchRequest,
    _: dict = Depends(verify_admin_session),
):
    test = await report_db.get_test_by_id(test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    updates = payload.model_dump(exclude_unset=True)
    if updates:
        await report_db.update_test(test_id, **updates)
    return {"id": test_id}


@app.delete("/admin/tests/{test_id}")
async def admin_delete_test(
    test_id: str,
    _: dict = Depends(verify_admin_session),
):
    test = await report_db.get_test_by_id(test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    await report_db.delete_test(test_id)
    return {"deleted": True}


@app.post("/admin/reports/{report_id}/media")
async def admin_upload_media(
    report_id: str,
    file: UploadFile = File(...),
    vehicle_id: str | None = Form(None),
    fault_id: str | None = Form(None),
    test_id: str | None = Form(None),
    caption: str | None = Form(None),
    _: dict = Depends(verify_admin_session),
):
    """Upload media to a report. Optional vehicle_id, fault_id, test_id to tag."""
    report = await report_db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    try:
        meta = await save_upload(file, report_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    media_id = report_db.generate_entity_id("med")
    await report_db.insert_media(
        id=media_id,
        report_id=report_id,
        vehicle_id=vehicle_id,
        fault_id=fault_id,
        test_id=test_id,
        media_type=meta["media_type"],
        filename=meta["filename"],
        storage_key=meta["storage_key"],
        content_type=meta["content_type"],
        size_bytes=meta["size_bytes"],
        caption=caption,
    )
    return {
        "id": media_id,
        "url": get_serve_url(meta["storage_key"]),
        **meta,
    }


@app.patch("/admin/media/{media_id}")
async def admin_patch_media(
    media_id: str,
    payload: MediaPatchRequest,
    _: dict = Depends(verify_admin_session),
):
    media = await report_db.get_media_by_id(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    updates = payload.model_dump(exclude_unset=True)
    if updates:
        await report_db.update_media(media_id, **updates)
    return {"id": media_id}


@app.delete("/admin/media/{media_id}")
async def admin_delete_media(
    media_id: str,
    _: dict = Depends(verify_admin_session),
):
    media = await report_db.get_media_by_id(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    delete_file(media["storage_key"])
    await report_db.delete_media(media_id)
    return {"deleted": True}


@app.get("/reports/share/{share_token}")
async def public_get_report_by_share(share_token: str):
    """Public endpoint: get completed report by share token. No auth."""
    report = await report_db.get_report_by_share_token(share_token)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or not yet completed")
    vehicles = await report_db.list_vehicles_by_report(report["id"])
    result = {
        "id": report["id"],
        "status": report["status"],
        "customer_name": report["customer_name"],
        "customer_email": report["customer_email"],
        "customer_phone": report["customer_phone"],
        "customer_address": report["customer_address"],
        "customer_postcode": report["customer_postcode"],
        "completed_at": report.get("completed_at"),
        "vehicles": [],
    }
    for v in vehicles:
        faults = await report_db.list_faults_by_vehicle(v["id"])
        tests = await report_db.list_tests_by_vehicle(v["id"])
        v_public = {
            "id": v["id"],
            "reg": v["reg"],
            "vin": v["vin"],
            "make": v["make"],
            "model": v["model"],
            "variant": v["variant"],
            "mileage": v["mileage"],
            "drivability_status": v["drivability_status"],
            "notes": v["notes"],
            "faults": faults,
            "tests": tests,
        }
        result["vehicles"].append(v_public)
    media = await report_db.list_media_by_report(report["id"])
    result["media"] = [
        {
            "id": m["id"],
            "media_type": m["media_type"],
            "filename": m["filename"],
            "content_type": m["content_type"],
            "caption": m.get("caption"),
            "url": get_serve_url(m["storage_key"]),
            "vehicle_id": m.get("vehicle_id"),
            "fault_id": m.get("fault_id"),
            "test_id": m.get("test_id"),
        }
        for m in media
    ]
    return result


# ── Payment endpoints ─────────────────────────────────────────────────────

@app.get("/payments/{token}/details")
async def get_payment_details(token: str):
    """Public endpoint: get booking summary for payment page."""
    booking = await get_booking_by_token(token)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or link expired")
    status = booking.get("status", "")
    if status == STATUS_CANCELLED:
        raise HTTPException(status_code=410, detail="This booking has been cancelled")
    if status not in (STATUS_PENDING_DEPOSIT, STATUS_DEPOSIT_PAID, STATUS_COMPLETED_UNPAID, STATUS_COMPLETED_PAID):
        raise HTTPException(status_code=400, detail="Invalid booking status")
    service_ids = (booking.get("service_ids") or "").split(",")
    service_labels = ", ".join(SERVICE_CATALOG[s].label for s in service_ids if s in SERVICE_CATALOG) or "Diagnostic"
    slot_start = datetime.fromisoformat(booking["slot_start_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    slot_end = datetime.fromisoformat(booking["slot_end_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    deposit_pence = booking.get("deposit_amount") or 0
    balance_pence = booking.get("balance_due") or 0
    return {
        "booking_id": booking["id"],
        "status": status,
        "full_name": booking["full_name"],
        "service_name": service_labels,
        "slot_start": slot_start.isoformat(),
        "slot_end": slot_end.isoformat(),
        "booking_date": slot_start.strftime("%A %d %B %Y"),
        "booking_time_window": f"{slot_start.strftime('%H:%M')} – {slot_end.strftime('%H:%M')}",
        "vehicle_reg": booking.get("vehicle_reg") or "",
        "vehicle_make_model": f"{booking.get('vehicle_make') or ''} {booking.get('vehicle_model') or ''}".strip(),
        "deposit_gbp": deposit_pence // 100,
        "balance_gbp": balance_pence // 100,
        "total_gbp": (deposit_pence + balance_pence) // 100 if deposit_pence or balance_pence else None,
    }


@app.post("/payments/deposit-session")
async def create_deposit_session(payload: DepositSessionRequest):
    """Create Stripe Checkout session for deposit payment."""
    from services.stripe_service import create_deposit_checkout_session

    booking = await get_booking_by_token(payload.token)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or link expired")
    if booking.get("status") != STATUS_PENDING_DEPOSIT:
        raise HTTPException(status_code=400, detail="Deposit has already been paid or booking is no longer valid")
    deposit_pence = booking.get("deposit_amount") or 0
    if deposit_pence <= 0:
        raise HTTPException(status_code=400, detail="Deposit amount not set")
    service_ids = (booking.get("service_ids") or "").split(",")
    service_labels = ", ".join(SERVICE_CATALOG[s].label for s in service_ids if s in SERVICE_CATALOG) or "Diagnostic"
    slot_start = datetime.fromisoformat(booking["slot_start_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    description = f"Deposit for {service_labels} - {slot_start.strftime('%A %d %B %Y')}"
    result = create_deposit_checkout_session(
        booking_id=booking["id"],
        token=payload.token,
        amount_pence=deposit_pence,
        customer_email=booking["email"],
        description=description,
    )
    await set_stripe_deposit_session(booking["id"], result["id"])
    return {"checkout_url": result["url"]}


@app.post("/payments/balance-session")
async def create_balance_session(payload: DepositSessionRequest):
    """Create Stripe Checkout session for balance payment (customer-facing, no admin auth)."""
    from services.stripe_service import create_balance_checkout_session

    booking = await get_booking_by_token(payload.token)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or link expired")
    if booking.get("status") != STATUS_COMPLETED_UNPAID:
        raise HTTPException(status_code=400, detail="Balance payment is not available for this booking")
    balance_pence = booking.get("balance_due") or 0
    if balance_pence <= 0:
        raise HTTPException(status_code=400, detail="No balance due")
    service_ids = (booking.get("service_ids") or "").split(",")
    service_labels = ", ".join(SERVICE_CATALOG[s].label for s in service_ids if s in SERVICE_CATALOG) or "Diagnostic"
    slot_start = datetime.fromisoformat(booking["slot_start_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
    description = f"Balance for {service_labels} - {slot_start.strftime('%A %d %B %Y')}"
    result = create_balance_checkout_session(
        booking_id=booking["id"],
        token=payload.token,
        amount_pence=balance_pence,
        customer_email=booking["email"],
        description=description,
    )
    await set_stripe_balance_session(booking["id"], result["id"])
    return {"checkout_url": result["url"]}


@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: str | None = Header(None, alias="Stripe-Signature")):
    """Handle Stripe webhooks. Must receive raw body for signature verification."""
    from services.stripe_service import verify_webhook_signature
    from services.calendar_service import create_booking_event, update_event_colour

    payload = await request.body()
    event = verify_webhook_signature(payload, stripe_signature)
    if not event:
        raise HTTPException(status_code=400, detail="Invalid signature")
    if event.get("type") != "checkout.session.completed":
        return {"received": True}
    session = event.get("data", {}).get("object", {})
    session_id = session.get("id")
    metadata = session.get("metadata") or {}
    booking_id = metadata.get("booking_id")
    payment_type = metadata.get("payment_type")
    if not booking_id or not payment_type:
        logger.warning("Stripe webhook: missing metadata booking_id or payment_type")
        return {"received": True}
    stripe_event_id = event.get("id", "")
    if await payment_event_exists(stripe_event_id):
        return {"received": True}
    booking = await get_booking_by_stripe_session(session_id)
    if not booking:
        booking = await get_booking_by_id(booking_id)
    if not booking:
        logger.warning("Stripe webhook: booking not found for %s", booking_id)
        return {"received": True}
    amount = session.get("amount_total") or 0
    if payment_type == "deposit":
        if booking.get("status") != STATUS_PENDING_DEPOSIT:
            await record_payment_event(booking_id, stripe_event_id, "checkout.session.completed", amount)
            return {"received": True}
        inserted = await record_payment_event(booking_id, stripe_event_id, "checkout.session.completed", amount)
        if not inserted:
            return {"received": True}
        service_ids = (booking.get("service_ids") or "").split(",")
        service_labels = ", ".join(SERVICE_CATALOG[s].label for s in service_ids if s in SERVICE_CATALOG) or "Diagnostic"
        travel_buffer = booking.get("travel_buffer") or 30
        try:
            event_id = create_booking_event(booking, service_labels, travel_buffer)
        except Exception as e:
            logger.exception("Failed to create calendar event: %s", e)
            event_id = None
        await update_booking_deposit_paid(
            booking_id=booking_id,
            stripe_checkout_session_id=session_id,
            stripe_payment_intent_id=session.get("payment_intent"),
            stripe_customer_id=session.get("customer") or (session.get("customer_details") or {}).get("email"),
            calendar_event_id=event_id,
        )
        tech_name = os.getenv("TECH_NAME", "TriPoint Team")
        client_first_name = (booking.get("full_name") or "").strip().split()[0] or "there"
        vehicle_make_model = f"{booking.get('vehicle_make') or ''} {booking.get('vehicle_model') or ''}".strip() or "-"
        slot_start = datetime.fromisoformat(booking["slot_start_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
        slot_end = datetime.fromisoformat(booking["slot_end_iso"].replace("Z", "+00:00")).astimezone(LOCAL_TZ)
        deposit_gbp = (booking.get("deposit_amount") or 0) // 100
        slot_start_utc = slot_start.astimezone(timezone.utc)
        slot_end_utc = slot_end.astimezone(timezone.utc)
        dt_fmt = "%Y%m%dT%H%M%SZ"
        dates_param = f"{slot_start_utc.strftime(dt_fmt)}/{slot_end_utc.strftime(dt_fmt)}"
        event_title = quote(f"TriPoint: {service_labels} - {booking.get('full_name')}")
        ics_link = f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={event_title}&dates={dates_param}&details=Booking%20ID%3A%20{booking_id}&location={quote(booking.get('postcode') or '')}"
        booking_link = f"{SITE_URL}/booking"
        template_data = {
            "CLIENT_FIRST_NAME": client_first_name,
            "BOOKING_ID": booking_id,
            "SERVICE_NAME": service_labels,
            "BOOKING_DATE": slot_start.strftime("%A %d %B %Y"),
            "BOOKING_TIME_WINDOW": f"{slot_start.strftime('%H:%M')} – {slot_end.strftime('%H:%M')}",
            "VEHICLE_MAKE_MODEL": vehicle_make_model,
            "VEHICLE_REG": booking.get("vehicle_reg") or "",
            "POSTCODE": booking.get("postcode") or "",
            "BOOKING_LINK": booking_link,
            "ICS_LINK": ics_link,
            "DEPOSIT_GBP": str(deposit_gbp),
            "TECH_NAME": tech_name,
        }
        result = template_service.render("09-deposit-confirmed", template_data)
        if result:
            attachments = []
            try:
                from invoice_pdf import generate_invoice_pdf, get_invoice_filename
                pdf_bytes = generate_invoice_pdf(booking, "deposit", service_labels)
                if pdf_bytes:
                    attachments.append((get_invoice_filename(booking_id, "deposit"), pdf_bytes, "application/pdf"))
            except Exception as e:
                logger.warning("Could not generate deposit invoice PDF: %s", e)
            _send_zoho_email(result.subject, result.html, [booking["email"]], result.text, reply_to="contact@tripointdiagnostics.co.uk", attachments=attachments or None)
    elif payment_type == "balance":
        if booking.get("status") != STATUS_COMPLETED_UNPAID:
            await record_payment_event(booking_id, stripe_event_id, "checkout.session.completed", amount)
            return {"received": True}
        inserted = await record_payment_event(booking_id, stripe_event_id, "checkout.session.completed", amount)
        if not inserted:
            return {"received": True}
        await update_booking_balance_paid(booking_id=booking_id, stripe_balance_session_id=session_id)
        event_id = booking.get("calendar_event_id")
        if event_id:
            try:
                update_event_colour(event_id, STATUS_COMPLETED_PAID)
            except Exception as e:
                logger.warning("Failed to update calendar colour: %s", e)
        tech_name = os.getenv("TECH_NAME", "TriPoint Team")
        client_first_name = (booking.get("full_name") or "").strip().split()[0] or "there"
        balance_gbp = (booking.get("balance_due") or 0) // 100
        template_data = {
            "CLIENT_FIRST_NAME": client_first_name,
            "BOOKING_ID": booking_id,
            "SERVICE_NAME": ", ".join(SERVICE_CATALOG[s].label for s in (booking.get("service_ids") or "").split(",") if s in SERVICE_CATALOG) or "Diagnostic",
            "VEHICLE_MAKE_MODEL": f"{booking.get('vehicle_make') or ''} {booking.get('vehicle_model') or ''}".strip() or "-",
            "VEHICLE_REG": booking.get("vehicle_reg") or "",
            "TECH_NAME": tech_name,
            "INVOICE_ID": booking_id,
            "INVOICE_LINE_ITEMS_HTML": f"Balance payment: £{balance_gbp}<br>",
            "INVOICE_TOTAL": f"£{balance_gbp}",
            "REPORT_LINK": f"{SITE_URL}/booking",
        }
        result = template_service.render("05-payment-received", template_data)
        if result:
            attachments = []
            try:
                from invoice_pdf import generate_invoice_pdf, get_invoice_filename
                service_labels = ", ".join(SERVICE_CATALOG[s].label for s in (booking.get("service_ids") or "").split(",") if s in SERVICE_CATALOG) or "Diagnostic"
                pdf_bytes = generate_invoice_pdf(booking, "completed", service_labels)
                if pdf_bytes:
                    attachments.append((get_invoice_filename(booking_id, "completed"), pdf_bytes, "application/pdf"))
            except Exception as e:
                logger.warning("Could not generate completed invoice PDF: %s", e)
            _send_zoho_email(result.subject, result.html, [booking["email"]], result.text, reply_to="contact@tripointdiagnostics.co.uk", attachments=attachments or None)
    return {"received": True}


@app.get("/api/email/templates", dependencies=[Depends(verify_admin_key)])
async def list_email_templates():
    return template_service.list_templates()


@app.get("/api/email/templates/{slug}", dependencies=[Depends(verify_admin_key)])
async def get_email_template(slug: str, format: str | None = None):
    record = template_service.get_template(slug)
    if not record:
        raise HTTPException(status_code=404, detail=f"Template '{slug}' not found")
    
    if format == "html":
        return {"content": record.html or ""}
    if format == "text":
        return {"content": record.text or ""}
    
    return {
        "slug": record.slug,
        "subject": record.subject,
        "html": record.html,
        "text": record.text,
    }


@app.post("/api/email/templates/{slug}/preview", dependencies=[Depends(verify_admin_key)])
async def preview_email_template(slug: str, payload: TemplatePreviewRequest):
    result = template_service.render(slug, payload.data)
    if not result:
        raise HTTPException(status_code=404, detail=f"Template '{slug}' not found")
    
    return {
        "slug": result.slug,
        "subject": result.subject,
        "html": result.html,
        "text": result.text,
        "missing_placeholders": result.missing_placeholders,
    }


@app.post("/api/email/send-test", dependencies=[Depends(verify_admin_key)])

async def send_test_email(payload: SendTestEmailRequest):
    result = template_service.render(payload.template, payload.data)
    if not result:
        raise HTTPException(status_code=404, detail=f"Template '{payload.template}' not found")
    
    # Send via existing Zoho integration
    # Send via existing Zoho integration
    _send_zoho_email(
        subject=result.subject,
        html_body=result.html,
        to_emails=[payload.to],
        text_body=result.text,
        reply_to="contact@tripointdiagnostics.co.uk",
        raise_for_status=True,
    )
    
    return {
        "status": "sent",
        "to": payload.to,
        "template": payload.template,
        "missing_placeholders": result.missing_placeholders,
    }



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
