"""
Report-related database helpers for diagnostic reports.
Uses aiosqlite, same pattern as db.py.
"""
from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import aiosqlite
except ImportError:
    aiosqlite = None  # type: ignore

from dotenv import load_dotenv

load_dotenv()

_script_dir = Path(__file__).resolve().parent
DB_PATH = os.getenv("BOOKINGS_DB_PATH") or str(_script_dir / "bookings.db")


def _require_aiosqlite() -> None:
    if aiosqlite is None:
        raise RuntimeError("aiosqlite is required. Install with: pip install aiosqlite")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def generate_report_id() -> str:
    """Generate a unique report ID: RPT-YYYYMMDD-XXXX"""
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = secrets.token_hex(2).upper()
    return f"RPT-{date_part}-{random_part}"


def generate_share_token() -> str:
    """Generate a cryptographically secure share token (43+ chars)."""
    return secrets.token_urlsafe(32)


def generate_entity_id(prefix: str = "ent") -> str:
    """Generate a unique entity ID with prefix."""
    return f"{prefix}_{secrets.token_hex(8)}"


def _row_to_dict(row: Any) -> dict[str, Any]:
    """Convert aiosqlite Row to dict."""
    return dict(row) if row else {}


def _parse_json_fields(row: dict[str, Any], fields: list[str]) -> dict[str, Any]:
    """Parse JSON text fields to Python objects."""
    out = dict(row)
    for f in fields:
        if f in out and out[f] is not None and isinstance(out[f], str):
            try:
                out[f] = json.loads(out[f])
            except json.JSONDecodeError:
                out[f] = None
    return out


# ─── Reports ────────────────────────────────────────────────────────────────


async def insert_report(
    *,
    id: str,
    booking_id: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str | None = None,
    customer_address: str | None = None,
    customer_postcode: str | None = None,
) -> None:
    _require_aiosqlite()
    now = _now_iso()
    share_token = generate_share_token()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            INSERT INTO diagnostic_reports (
                id, booking_id, status, share_token,
                customer_name, customer_email, customer_phone,
                customer_address, customer_postcode,
                report_email_sent, created_at, updated_at
            ) VALUES (?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?, 0, ?, ?)
            """,
            (
                id,
                booking_id,
                share_token,
                customer_name,
                customer_email,
                customer_phone or "",
                customer_address or "",
                customer_postcode or "",
                now,
                now,
            ),
        )
        await conn.commit()


async def get_report_by_id(report_id: str) -> dict[str, Any] | None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM diagnostic_reports WHERE id = ?", (report_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return _row_to_dict(row) if row else None


async def get_report_by_share_token(share_token: str) -> dict[str, Any] | None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM diagnostic_reports WHERE share_token = ? AND status = 'COMPLETED'",
            (share_token,),
        ) as cursor:
            row = await cursor.fetchone()
            return _row_to_dict(row) if row else None


async def list_reports(
    *,
    status: str | None = None,
    q: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict[str, Any]]:
    _require_aiosqlite()
    conditions = []
    params: list[Any] = []
    if status:
        conditions.append("r.status = ?")
        params.append(status)
    if q:
        conditions.append(
            "(r.id LIKE ? OR r.customer_name LIKE ? OR r.customer_email LIKE ? OR r.booking_id LIKE ?)"
        )
        qp = f"%{q}%"
        params.extend([qp, qp, qp, qp])
    if date_from:
        conditions.append("r.created_at >= ?")
        params.append(date_from)
    if date_to:
        conditions.append("r.created_at <= ?")
        params.append(date_to)

    where = " AND ".join(conditions) if conditions else "1=1"
    sql = f"""
        SELECT r.*, b.vehicle_reg, b.vehicle_make, b.vehicle_model
        FROM diagnostic_reports r
        LEFT JOIN bookings b ON r.booking_id = b.id
        WHERE {where}
        ORDER BY r.created_at DESC
    """
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(sql, params) as cursor:
            rows = await cursor.fetchall()
            return [_row_to_dict(r) for r in rows]


async def update_report(
    report_id: str,
    *,
    status: str | None = None,
    customer_name: str | None = None,
    customer_email: str | None = None,
    customer_phone: str | None = None,
    customer_address: str | None = None,
    customer_postcode: str | None = None,
    report_email_sent: int | None = None,
    completed_at: str | None = None,
) -> None:
    _require_aiosqlite()
    now = _now_iso()
    updates = ["updated_at = ?"]
    params: list[Any] = [now]

    if status is not None:
        updates.append("status = ?")
        params.append(status)
    if customer_name is not None:
        updates.append("customer_name = ?")
        params.append(customer_name)
    if customer_email is not None:
        updates.append("customer_email = ?")
        params.append(customer_email)
    if customer_phone is not None:
        updates.append("customer_phone = ?")
        params.append(customer_phone)
    if customer_address is not None:
        updates.append("customer_address = ?")
        params.append(customer_address)
    if customer_postcode is not None:
        updates.append("customer_postcode = ?")
        params.append(customer_postcode)
    if report_email_sent is not None:
        updates.append("report_email_sent = ?")
        params.append(report_email_sent)
    if completed_at is not None:
        updates.append("completed_at = ?")
        params.append(completed_at)

    params.append(report_id)
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            f"UPDATE diagnostic_reports SET {', '.join(updates)} WHERE id = ?",
            params,
        )
        await conn.commit()


async def archive_report(report_id: str) -> None:
    """Soft delete: set status to ARCHIVED."""
    await update_report(report_id, status="ARCHIVED")


async def ensure_share_token(report_id: str) -> str:
    """Ensure report has a share_token; generate if missing. Returns the token."""
    r = await get_report_by_id(report_id)
    if not r:
        raise ValueError(f"Report {report_id} not found")
    if r.get("share_token"):
        return r["share_token"]
    token = generate_share_token()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            "UPDATE diagnostic_reports SET share_token = ?, updated_at = ? WHERE id = ?",
            (token, _now_iso(), report_id),
        )
        await conn.commit()
    return token


# ─── Vehicles ───────────────────────────────────────────────────────────────


async def insert_vehicle(
    *,
    id: str,
    report_id: str,
    sort_order: int = 0,
    reg: str | None = None,
    vin: str | None = None,
    make: str | None = None,
    model: str | None = None,
    variant: str | None = None,
    mileage: str | None = None,
    drivability_status: str | None = None,
    notes: str | None = None,
) -> None:
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            INSERT INTO report_vehicles (
                id, report_id, sort_order, reg, vin, make, model, variant,
                mileage, drivability_status, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id,
                report_id,
                sort_order,
                reg or "",
                vin or "",
                make or "",
                model or "",
                variant or "",
                mileage or "",
                drivability_status or "",
                notes or "",
                now,
                now,
            ),
        )
        await conn.commit()


async def get_vehicle_by_id(vehicle_id: str) -> dict[str, Any] | None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM report_vehicles WHERE id = ?", (vehicle_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return _row_to_dict(row) if row else None


async def list_vehicles_by_report(report_id: str) -> list[dict[str, Any]]:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM report_vehicles WHERE report_id = ? ORDER BY sort_order, created_at",
            (report_id,),
        ) as cursor:
            rows = await cursor.fetchall()
            return [_row_to_dict(r) for r in rows]


async def update_vehicle(
    vehicle_id: str,
    **kwargs: Any,
) -> None:
    allowed = {
        "sort_order", "reg", "vin", "make", "model", "variant",
        "mileage", "drivability_status", "notes",
    }
    updates = ["updated_at = ?"]
    params: list[Any] = [_now_iso()]
    for k, v in kwargs.items():
        if k in allowed:
            updates.append(f"{k} = ?")
            params.append(v)
    if len(updates) <= 1:
        return
    params.append(vehicle_id)
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            f"UPDATE report_vehicles SET {', '.join(updates)} WHERE id = ?",
            params,
        )
        await conn.commit()


async def delete_vehicle(vehicle_id: str) -> None:
    """Delete vehicle and cascade faults, tests, media."""
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        fault_ids = [
            r[0]
            async for r in conn.execute(
                "SELECT id FROM vehicle_faults WHERE vehicle_id = ?", (vehicle_id,)
            )
        ]
        for fid in fault_ids:
            await conn.execute("DELETE FROM fault_tests WHERE fault_id = ?", (fid,))
        await conn.execute("DELETE FROM vehicle_faults WHERE vehicle_id = ?", (vehicle_id,))
        await conn.execute("DELETE FROM fault_tests WHERE vehicle_id = ?", (vehicle_id,))
        await conn.execute(
            "DELETE FROM media_assets WHERE vehicle_id = ?", (vehicle_id,)
        )
        await conn.execute("DELETE FROM report_vehicles WHERE id = ?", (vehicle_id,))
        await conn.commit()


# ─── Faults ─────────────────────────────────────────────────────────────────


async def insert_fault(
    *,
    id: str,
    vehicle_id: str,
    sort_order: int = 0,
    title: str = "",
    severity: str | None = None,
    status: str | None = None,
    impact: str | None = None,
    dtcs: list | dict | None = None,
    root_causes: list | dict | None = None,
    conclusion: str | None = None,
    action_plan: list | dict | None = None,
    parts_required: list | dict | None = None,
    coding_required: list | dict | None = None,
    explanation: str | None = None,
    solution: str | None = None,
) -> None:
    _require_aiosqlite()
    now = _now_iso()
    dtcs_json = json.dumps(dtcs) if dtcs is not None else None
    root_causes_json = json.dumps(root_causes) if root_causes is not None else None
    action_plan_json = json.dumps(action_plan) if action_plan is not None else None
    parts_json = json.dumps(parts_required) if parts_required is not None else None
    coding_json = json.dumps(coding_required) if coding_required is not None else None
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            INSERT INTO vehicle_faults (
                id, vehicle_id, sort_order, title, severity, status,
                impact, dtcs, root_causes, conclusion, action_plan,
                parts_required, coding_required, explanation, solution,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id,
                vehicle_id,
                sort_order,
                title,
                severity or "",
                status or "",
                impact or "",
                dtcs_json,
                root_causes_json,
                conclusion or "",
                action_plan_json,
                parts_json,
                coding_json,
                explanation or "",
                solution or "",
                now,
                now,
            ),
        )
        await conn.commit()


async def get_fault_by_id(fault_id: str) -> dict[str, Any] | None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM vehicle_faults WHERE id = ?", (fault_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if not row:
                return None
            d = _row_to_dict(row)
            return _parse_json_fields(d, ["dtcs", "root_causes", "action_plan", "parts_required", "coding_required"])


async def list_faults_by_vehicle(vehicle_id: str) -> list[dict[str, Any]]:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM vehicle_faults WHERE vehicle_id = ? ORDER BY sort_order, created_at",
            (vehicle_id,),
        ) as cursor:
            rows = await cursor.fetchall()
            return [
                _parse_json_fields(_row_to_dict(r), ["dtcs", "root_causes", "action_plan", "parts_required", "coding_required"])
                for r in rows
            ]


async def update_fault(fault_id: str, **kwargs: Any) -> None:
    json_fields = {"dtcs", "root_causes", "action_plan", "parts_required", "coding_required"}
    allowed = {
        "sort_order", "title", "severity", "status", "impact",
        "dtcs", "root_causes", "conclusion", "action_plan",
        "parts_required", "coding_required", "explanation", "solution",
    }
    updates = ["updated_at = ?"]
    params: list[Any] = [_now_iso()]
    for k, v in kwargs.items():
        if k in allowed:
            if k in json_fields and v is not None:
                v = json.dumps(v)
            updates.append(f"{k} = ?")
            params.append(v)
    if len(updates) <= 1:
        return
    params.append(fault_id)
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            f"UPDATE vehicle_faults SET {', '.join(updates)} WHERE id = ?",
            params,
        )
        await conn.commit()


async def delete_fault(fault_id: str) -> None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute("UPDATE fault_tests SET fault_id = NULL WHERE fault_id = ?", (fault_id,))
        await conn.execute("DELETE FROM media_assets WHERE fault_id = ?", (fault_id,))
        await conn.execute("DELETE FROM vehicle_faults WHERE id = ?", (fault_id,))
        await conn.commit()


# ─── Tests ──────────────────────────────────────────────────────────────────


async def insert_test(
    *,
    id: str,
    vehicle_id: str,
    fault_id: str | None = None,
    sort_order: int = 0,
    test_name: str = "",
    tool_used: str | None = None,
    result: str | None = None,
    readings: list | dict | None = None,
    notes: str | None = None,
) -> None:
    _require_aiosqlite()
    now = _now_iso()
    readings_json = json.dumps(readings) if readings is not None else None
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            INSERT INTO fault_tests (
                id, vehicle_id, fault_id, sort_order, test_name,
                tool_used, result, readings, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id,
                vehicle_id,
                fault_id,
                sort_order,
                test_name,
                tool_used or "",
                result or "",
                readings_json,
                notes or "",
                now,
                now,
            ),
        )
        await conn.commit()


async def get_test_by_id(test_id: str) -> dict[str, Any] | None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM fault_tests WHERE id = ?", (test_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if not row:
                return None
            d = _row_to_dict(row)
            return _parse_json_fields(d, ["readings"])


async def list_tests_by_vehicle(vehicle_id: str) -> list[dict[str, Any]]:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM fault_tests WHERE vehicle_id = ? ORDER BY sort_order, created_at",
            (vehicle_id,),
        ) as cursor:
            rows = await cursor.fetchall()
            return [
                _parse_json_fields(_row_to_dict(r), ["readings"])
                for r in rows
            ]


async def update_test(test_id: str, **kwargs: Any) -> None:
    allowed = {"fault_id", "sort_order", "test_name", "tool_used", "result", "readings", "notes"}
    updates = ["updated_at = ?"]
    params: list[Any] = [_now_iso()]
    for k, v in kwargs.items():
        if k in allowed:
            if k == "readings" and v is not None:
                v = json.dumps(v)
            updates.append(f"{k} = ?")
            params.append(v)
    if len(updates) <= 1:
        return
    params.append(test_id)
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            f"UPDATE fault_tests SET {', '.join(updates)} WHERE id = ?",
            params,
        )
        await conn.commit()


async def delete_test(test_id: str) -> None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute("UPDATE media_assets SET test_id = NULL WHERE test_id = ?", (test_id,))
        await conn.execute("DELETE FROM fault_tests WHERE id = ?", (test_id,))
        await conn.commit()


# ─── Media ──────────────────────────────────────────────────────────────────


async def insert_media(
    *,
    id: str,
    report_id: str,
    vehicle_id: str | None = None,
    fault_id: str | None = None,
    test_id: str | None = None,
    media_type: str,
    filename: str,
    storage_key: str,
    content_type: str,
    size_bytes: int,
    caption: str | None = None,
) -> None:
    _require_aiosqlite()
    now = _now_iso()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            """
            INSERT INTO media_assets (
                id, report_id, vehicle_id, fault_id, test_id,
                media_type, filename, storage_key, content_type, size_bytes,
                caption, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id,
                report_id,
                vehicle_id,
                fault_id,
                test_id,
                media_type,
                filename,
                storage_key,
                content_type,
                size_bytes,
                caption or "",
                now,
            ),
        )
        await conn.commit()


async def get_media_by_id(media_id: str) -> dict[str, Any] | None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM media_assets WHERE id = ?", (media_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return _row_to_dict(row) if row else None


async def list_media_by_report(report_id: str) -> list[dict[str, Any]]:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM media_assets WHERE report_id = ? ORDER BY created_at",
            (report_id,),
        ) as cursor:
            rows = await cursor.fetchall()
            return [_row_to_dict(r) for r in rows]


async def update_media(
    media_id: str,
    *,
    vehicle_id: str | None = None,
    fault_id: str | None = None,
    test_id: str | None = None,
    caption: str | None = None,
) -> None:
    updates = []
    params: list[Any] = []
    if vehicle_id is not None:
        updates.append("vehicle_id = ?")
        params.append(vehicle_id)
    if fault_id is not None:
        updates.append("fault_id = ?")
        params.append(fault_id)
    if test_id is not None:
        updates.append("test_id = ?")
        params.append(test_id)
    if caption is not None:
        updates.append("caption = ?")
        params.append(caption)
    if not updates:
        return
    params.append(media_id)
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(
            f"UPDATE media_assets SET {', '.join(updates)} WHERE id = ?",
            params,
        )
        await conn.commit()


async def delete_media(media_id: str) -> None:
    _require_aiosqlite()
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute("DELETE FROM media_assets WHERE id = ?", (media_id,))
        await conn.commit()
