"""
SQLite database module for TriPoint bookings.
Uses aiosqlite for async operations.
"""
from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

try:
    import aiosqlite
except ImportError:
    aiosqlite = None  # type: ignore

from dotenv import load_dotenv

load_dotenv()

# Database path: same directory as api.py
_script_dir = Path(__file__).resolve().parent
DB_PATH = os.getenv("BOOKINGS_DB_PATH") or str(_script_dir / "bookings.db")

# Status enum values
STATUS_PENDING_DEPOSIT = "PENDING_DEPOSIT"
STATUS_DEPOSIT_PAID = "DEPOSIT_PAID"
STATUS_COMPLETED_UNPAID = "COMPLETED_UNPAID"
STATUS_COMPLETED_PAID = "COMPLETED_PAID"
STATUS_CANCELLED = "CANCELLED"

SCHEMA = """
CREATE TABLE IF NOT EXISTS bookings (
    id                      TEXT PRIMARY KEY,
    status                  TEXT NOT NULL DEFAULT 'PENDING_DEPOSIT',
    payment_link_token      TEXT NOT NULL UNIQUE,
    full_name               TEXT NOT NULL,
    email                   TEXT NOT NULL,
    phone                   TEXT NOT NULL,
    postcode                TEXT NOT NULL,
    address_line_1          TEXT,
    town_city               TEXT,
    vehicle_reg             TEXT,
    vehicle_make            TEXT,
    vehicle_model           TEXT,
    approx_mileage          TEXT,
    symptoms                TEXT,
    additional_notes        TEXT,
    safe_location           INTEGER NOT NULL DEFAULT 0,
    service_ids             TEXT NOT NULL,
    slot_start_iso          TEXT NOT NULL,
    slot_end_iso            TEXT NOT NULL,
    zone                    TEXT,
    drive_time_mins         INTEGER,
    travel_buffer           INTEGER,
    total_amount            INTEGER,
    deposit_amount          INTEGER,
    balance_due             INTEGER,
    currency                TEXT NOT NULL DEFAULT 'gbp',
    stripe_checkout_session_id TEXT,
    stripe_payment_intent_id   TEXT,
    stripe_customer_id         TEXT,
    stripe_balance_session_id  TEXT,
    calendar_event_id       TEXT,
    created_at              TEXT NOT NULL,
    updated_at              TEXT NOT NULL,
    deposit_paid_at         TEXT,
    completed_at            TEXT
);

CREATE TABLE IF NOT EXISTS payment_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id      TEXT NOT NULL,
    stripe_event_id TEXT UNIQUE,
    event_type      TEXT NOT NULL,
    amount          INTEGER,
    created_at      TEXT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_token ON bookings(payment_link_token);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_start_iso, slot_end_iso);
CREATE INDEX IF NOT EXISTS idx_payment_events_stripe ON payment_events(stripe_event_id);

CREATE TABLE IF NOT EXISTS diagnostic_reports (
    id                  TEXT PRIMARY KEY,
    booking_id          TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'DRAFT',
    share_token         TEXT UNIQUE,
    customer_name       TEXT NOT NULL,
    customer_email      TEXT NOT NULL,
    customer_phone      TEXT,
    customer_address    TEXT,
    customer_postcode   TEXT,
    report_email_sent   INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    completed_at        TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS report_vehicles (
    id                  TEXT PRIMARY KEY,
    report_id           TEXT NOT NULL,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    reg                 TEXT,
    vin                 TEXT,
    make                TEXT,
    model               TEXT,
    variant             TEXT,
    mileage             TEXT,
    drivability_status  TEXT,
    notes               TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES diagnostic_reports(id)
);

CREATE TABLE IF NOT EXISTS vehicle_faults (
    id              TEXT PRIMARY KEY,
    vehicle_id      TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    title           TEXT NOT NULL,
    severity        TEXT,
    status          TEXT,
    impact          TEXT,
    dtcs            TEXT,
    root_causes     TEXT,
    conclusion      TEXT,
    action_plan     TEXT,
    parts_required  TEXT,
    coding_required TEXT,
    explanation     TEXT,
    solution        TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES report_vehicles(id)
);

CREATE TABLE IF NOT EXISTS fault_tests (
    id          TEXT PRIMARY KEY,
    vehicle_id  TEXT NOT NULL,
    fault_id    TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    test_name   TEXT NOT NULL,
    tool_used   TEXT,
    result      TEXT,
    readings    TEXT,
    notes       TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES report_vehicles(id),
    FOREIGN KEY (fault_id) REFERENCES vehicle_faults(id)
);

CREATE TABLE IF NOT EXISTS media_assets (
    id          TEXT PRIMARY KEY,
    report_id   TEXT NOT NULL,
    vehicle_id  TEXT,
    fault_id    TEXT,
    test_id     TEXT,
    media_type  TEXT NOT NULL,
    filename    TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes  INTEGER NOT NULL,
    caption     TEXT,
    created_at  TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES diagnostic_reports(id),
    FOREIGN KEY (vehicle_id) REFERENCES report_vehicles(id),
    FOREIGN KEY (fault_id) REFERENCES vehicle_faults(id),
    FOREIGN KEY (test_id) REFERENCES fault_tests(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_booking ON diagnostic_reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON diagnostic_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_share_token ON diagnostic_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_vehicles_report ON report_vehicles(report_id);
CREATE INDEX IF NOT EXISTS idx_faults_vehicle ON vehicle_faults(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tests_vehicle ON fault_tests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_media_report ON media_assets(report_id);
"""


def _require_aiosqlite() -> None:
    if aiosqlite is None:
        raise RuntimeError("aiosqlite is required. Install with: pip install aiosqlite")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def generate_booking_id() -> str:
    """Generate a unique booking ID: TPD-YYYYMMDD-XXXX"""
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = secrets.token_hex(2).upper()
    return f"TPD-{date_part}-{random_part}"


def generate_payment_token() -> str:
    """Generate a cryptographically secure payment link token (43+ chars)."""
    return secrets.token_urlsafe(32)


async def init_db() -> None:
    """Create tables if they don't exist."""
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.executescript(SCHEMA)
        await conn.commit()
        # Migration: add explanation and solution to vehicle_faults (if missing)
        try:
            await conn.execute("ALTER TABLE vehicle_faults ADD COLUMN explanation TEXT")
            await conn.commit()
        except Exception:
            pass
        try:
            await conn.execute("ALTER TABLE vehicle_faults ADD COLUMN solution TEXT")
            await conn.commit()
        except Exception:
            pass


async def insert_booking(
    *,
    id: str,
    payment_link_token: str,
    full_name: str,
    email: str,
    phone: str,
    postcode: str,
    address_line_1: str,
    town_city: str,
    vehicle_reg: str,
    vehicle_make: str,
    vehicle_model: str,
    approx_mileage: str,
    symptoms: str,
    additional_notes: str | None,
    safe_location: bool,
    service_ids: str,
    slot_start_iso: str,
    slot_end_iso: str,
    zone: str | None,
    drive_time_mins: int | None,
    travel_buffer: int | None,
    total_amount: int | None,
    deposit_amount: int | None,
    balance_due: int | None,
) -> None:
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            INSERT INTO bookings (
                id, status, payment_link_token, full_name, email, phone, postcode,
                address_line_1, town_city, vehicle_reg, vehicle_make, vehicle_model,
                approx_mileage, symptoms, additional_notes, safe_location,
                service_ids, slot_start_iso, slot_end_iso, zone, drive_time_mins,
                travel_buffer, total_amount, deposit_amount, balance_due,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id, STATUS_PENDING_DEPOSIT, payment_link_token, full_name, email, phone, postcode,
                address_line_1, town_city, vehicle_reg, vehicle_make, vehicle_model,
                approx_mileage, symptoms, additional_notes or "", 1 if safe_location else 0,
                service_ids, slot_start_iso, slot_end_iso, zone, drive_time_mins,
                travel_buffer, total_amount, deposit_amount, balance_due,
                now, now,
            ),
        )
        await conn.commit()


async def get_booking_by_token(token: str) -> dict[str, Any] | None:
    """Get booking by payment_link_token. Returns None if not found."""
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM bookings WHERE payment_link_token = ?", (token,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def get_booking_by_id(booking_id: str) -> dict[str, Any] | None:
    """Get booking by id. Returns None if not found."""
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def get_booking_by_stripe_session(session_id: str) -> dict[str, Any] | None:
    """Get booking by stripe_checkout_session_id or stripe_balance_session_id."""
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            """
            SELECT * FROM bookings
            WHERE stripe_checkout_session_id = ? OR stripe_balance_session_id = ?
            """,
            (session_id, session_id),
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def update_booking_deposit_paid(
    booking_id: str,
    stripe_checkout_session_id: str,
    stripe_payment_intent_id: str | None = None,
    stripe_customer_id: str | None = None,
    calendar_event_id: str | None = None,
) -> None:
    """Update booking to DEPOSIT_PAID after deposit payment."""
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            UPDATE bookings SET
                status = ?,
                stripe_checkout_session_id = ?,
                stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id),
                stripe_customer_id = COALESCE(?, stripe_customer_id),
                calendar_event_id = COALESCE(?, calendar_event_id),
                deposit_paid_at = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                STATUS_DEPOSIT_PAID,
                stripe_checkout_session_id,
                stripe_payment_intent_id,
                stripe_customer_id,
                calendar_event_id,
                now,
                now,
                booking_id,
            ),
        )
        await conn.commit()


async def update_booking_balance_paid(
    booking_id: str,
    stripe_balance_session_id: str,
) -> None:
    """Update booking to COMPLETED_PAID after balance payment."""
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            UPDATE bookings SET
                status = ?,
                stripe_balance_session_id = ?,
                balance_due = 0,
                completed_at = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (STATUS_COMPLETED_PAID, stripe_balance_session_id, now, now, booking_id),
        )
        await conn.commit()


async def update_booking_status(
    booking_id: str,
    status: str,
    calendar_event_id: str | None = None,
    stripe_checkout_session_id: str | None = None,
    stripe_balance_session_id: str | None = None,
) -> None:
    """Generic status update."""
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        updates = ["status = ?", "updated_at = ?"]
        params: list[Any] = [status, now]

        if calendar_event_id is not None:
            updates.append("calendar_event_id = ?")
            params.append(calendar_event_id)
        if stripe_checkout_session_id is not None:
            updates.append("stripe_checkout_session_id = ?")
            params.append(stripe_checkout_session_id)
        if stripe_balance_session_id is not None:
            updates.append("stripe_balance_session_id = ?")
            params.append(stripe_balance_session_id)

        if status == STATUS_COMPLETED_UNPAID or status == STATUS_COMPLETED_PAID:
            updates.append("completed_at = ?")
            params.append(now)

        params.append(booking_id)
        await conn.execute(
            f"UPDATE bookings SET {', '.join(updates)} WHERE id = ?",
            params,
        )
        await conn.commit()


async def set_stripe_deposit_session(booking_id: str, session_id: str) -> None:
    """Store Stripe Checkout session ID before redirect (for deposit)."""
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            UPDATE bookings SET
                stripe_checkout_session_id = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (session_id, now, booking_id),
        )
        await conn.commit()


async def set_stripe_balance_session(booking_id: str, session_id: str) -> None:
    """Store Stripe Checkout session ID for balance payment."""
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            UPDATE bookings SET
                stripe_balance_session_id = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (session_id, now, booking_id),
        )
        await conn.commit()


async def record_payment_event(
    booking_id: str,
    stripe_event_id: str,
    event_type: str,
    amount: int | None = None,
) -> bool:
    """
    Record a payment event for idempotency. Returns True if inserted, False if duplicate.
    """
    _require_aiosqlite()
    now = _now_iso()
    try:
        async with aiosqlite.connect(DB_PATH) as conn:
            await conn.execute(
                """
                INSERT INTO payment_events (booking_id, stripe_event_id, event_type, amount, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (booking_id, stripe_event_id, event_type, amount, now),
            )
            await conn.commit()
            return True
    except Exception as e:
        if "UNIQUE" in str(e) or "unique" in str(e).lower():
            return False
        raise


async def payment_event_exists(stripe_event_id: str) -> bool:
    """Check if we've already processed this Stripe event."""
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        async with conn.execute(
            "SELECT 1 FROM payment_events WHERE stripe_event_id = ?", (stripe_event_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return row is not None


async def get_blocked_slot_intervals(
    window_start: datetime,
    window_end: datetime,
    travel_buffer_minutes: int,
) -> list[tuple[datetime, datetime]]:
    """
    Get blocked intervals from DB bookings (PENDING_DEPOSIT and DEPOSIT_PAID).
    Returns list of (blocked_start, blocked_end) in local time.
    """
    _require_aiosqlite()
    from zoneinfo import ZoneInfo

    tz = ZoneInfo(os.getenv("TRIPOINT_TIMEZONE", "Europe/London"))
    ws = window_start.isoformat()
    we = window_end.isoformat()

    intervals: list[tuple[datetime, datetime]] = []
    async with aiosqlite.connect(DB_PATH) as conn:
        async with conn.execute(
            """
            SELECT slot_start_iso, slot_end_iso, travel_buffer
            FROM bookings
            WHERE status IN (?, ?)
            AND slot_end_iso > ?
            AND slot_start_iso < ?
            """,
            (STATUS_PENDING_DEPOSIT, STATUS_DEPOSIT_PAID, ws, we),
        ) as cursor:
            async for row in cursor:
                slot_start_s, slot_end_s, buf = row
                buf = buf or travel_buffer_minutes
                try:
                    start = datetime.fromisoformat(slot_start_s.replace("Z", "+00:00")).astimezone(tz)
                    end = datetime.fromisoformat(slot_end_s.replace("Z", "+00:00")).astimezone(tz)
                    blocked_start = start - timedelta(minutes=buf)
                    blocked_end = end + timedelta(minutes=buf)
                    intervals.append((blocked_start, blocked_end))
                except (ValueError, TypeError):
                    continue
    return intervals


async def expire_old_pending_bookings(ttl_minutes: int = 30) -> int:
    """
    Expire PENDING_DEPOSIT bookings older than ttl_minutes.
    Returns count of expired rows.
    """
    _require_aiosqlite()
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=ttl_minutes)).isoformat()
    async with aiosqlite.connect(DB_PATH) as conn:
        cursor = await conn.execute(
            """
            UPDATE bookings SET status = ? WHERE status = ? AND created_at < ?
            """,
            (STATUS_CANCELLED, STATUS_PENDING_DEPOSIT, cutoff),
        )
        await conn.commit()
        return cursor.rowcount or 0


async def list_bookings(
    status: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = 200,
) -> list[dict[str, Any]]:
    """List bookings for admin dashboard with optional filters."""
    _require_aiosqlite()
    conditions = []
    params: list[Any] = []

    if status:
        conditions.append("status = ?")
        params.append(status)
    if date_from:
        conditions.append("slot_start_iso >= ?")
        params.append(date_from)
    if date_to:
        conditions.append("slot_start_iso <= ?")
        params.append(date_to)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    params.append(limit)

    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            f"""
            SELECT * FROM bookings {where}
            ORDER BY slot_start_iso DESC
            LIMIT ?
            """,
            params,
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]
