"""
Admin API: leads from Google Sheets (read/update/export).
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from db import (
    get_google_ads_export,
    insert_google_ads_export,
    list_google_ads_exports,
)
from lead_constants import (
    ADJUSTMENTS_EXPORT_TAB,
    EDITABLE_LEAD_FIELDS,
    QUALIFIED_EXPORT_TAB,
    ads_config,
)
from services.auth import verify_admin_session
from services import sheets_leads
from services.ga4_measurement import (
    qualification_event_name_for_transition,
    send_admin_qualification_ga4,
)
from services.google_ads_export import (
    build_adjustment_export_rows,
    build_qualified_export_rows,
    enrich_lead_row,
    new_batch_id,
    qualified_export_csv_string,
    adjustment_export_csv_string,
    sheet_rows_for_adjustments,
    sheet_rows_for_qualified,
)
from services.sheets_leads import (
    append_export_log_row,
    apply_leads_sheet_formatting,
    bulk_update_rows_by_event_ids,
    get_spreadsheet_config,
    read_all_lead_rows,
    read_rows_by_journey_id,
    update_row_by_event_id,
    write_export_tab,
)

logger = logging.getLogger("tripoint.admin_leads")

router = APIRouter(prefix="/admin/leads", tags=["admin-leads"])
LONDON = ZoneInfo("Europe/London")


def _service():
    return sheets_leads._get_sheets_service()


def _parse_occurred(row: dict[str, Any]) -> datetime | None:
    raw = str(row.get("occurred_at") or "").strip()
    if not raw:
        return None
    try:
        raw2 = raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(raw2)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def _row_matches_filters(
    row: dict[str, Any],
    *,
    date_from: str | None,
    date_to: str | None,
    qualification_status: str | None,
    disqualify_reason: str | None,
    vehicle_make: str | None,
    lead_channel: str | None,
    event_name: str | None,
    service_interest: str | None,
    service_category: str | None,
    has_gclid: bool | None,
    has_any_click_id: bool | None,
    exported_to_google_ads: str | None,
    page_type: str | None,
    search: str | None,
) -> bool:
    def s(v: Any) -> str:
        return str(v or "").strip()

    occ = _parse_occurred(row)
    if date_from:
        try:
            df = datetime.fromisoformat(date_from.replace("Z", "+00:00"))
            if occ and occ < df.replace(tzinfo=occ.tzinfo):
                return False
        except Exception:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to.replace("Z", "+00:00"))
            if occ and occ > dt.replace(tzinfo=occ.tzinfo):
                return False
        except Exception:
            pass
    if qualification_status and s(row.get("qualification_status")).lower() != qualification_status.lower():
        return False
    if disqualify_reason is not None and disqualify_reason != "":
        if s(row.get("disqualify_reason")).lower() != disqualify_reason.lower():
            return False
    if vehicle_make and s(row.get("vehicle_make")) != vehicle_make:
        return False
    if lead_channel and s(row.get("lead_channel")).lower() != lead_channel.lower():
        return False
    if event_name and s(row.get("event_name")).lower() != event_name.lower():
        return False
    if service_interest and s(row.get("service_interest")).lower() != service_interest.lower():
        return False
    if service_category and s(row.get("service_category")).lower() != service_category.lower():
        return False
    if page_type and s(row.get("page_type")).lower() != page_type.lower():
        return False
    if has_gclid is True and not s(row.get("gclid")):
        return False
    if has_gclid is False and s(row.get("gclid")):
        return False
    if has_any_click_id is True:
        if not (s(row.get("gclid")) or s(row.get("gbraid")) or s(row.get("wbraid"))):
            return False
    if has_any_click_id is False:
        if s(row.get("gclid")) or s(row.get("gbraid")) or s(row.get("wbraid")):
            return False
    ex = s(row.get("google_ads_export_status")).lower()
    batch = s(row.get("google_ads_export_batch_id"))
    is_exported = ex == "exported" or bool(batch)
    if exported_to_google_ads == "yes" and not is_exported:
        return False
    if exported_to_google_ads == "no" and is_exported:
        return False
    if search:
        q = search.lower()
        blobs = [
            s(row.get("notes")),
            s(row.get("vehicle_model")),
            s(row.get("service_name")),
            s(row.get("page")),
            s(row.get("journey_id")),
            s(row.get("event_id")),
        ]
        if not any(q in b.lower() for b in blobs):
            return False
    return True


def _row_for_ga4_qualification(row: dict[str, Any]) -> dict[str, Any]:
    """Merge sheet row with computed click identifiers for MP params (no PII)."""
    e = enrich_lead_row(dict(row))
    out = dict(row)
    out["google_ads_identifier_type"] = str(
        e.get("identifier_type") or out.get("google_ads_identifier_type") or ""
    ).strip()
    out["google_ads_identifier_value"] = str(
        e.get("identifier_value") or out.get("google_ads_identifier_value") or ""
    ).strip()
    return out


def _ga4_qualification_sync_single(old_row: dict[str, Any], new_row: dict[str, Any]) -> dict[str, Any]:
    """Response fragment for PATCH; never raises."""
    old_qs = str(old_row.get("qualification_status") or "").strip().lower()
    new_qs = str(new_row.get("qualification_status") or "").strip().lower()
    ename = qualification_event_name_for_transition(old_qs, new_qs)
    if not ename:
        return {
            "event": None,
            "measurement_protocol_sent": None,
            "skipped_reason": "no_qualification_transition",
            "error": None,
        }
    row_mp = _row_for_ga4_qualification(new_row)
    ok, reason = send_admin_qualification_ga4(ename, row_mp)
    if reason == "ga4_not_configured":
        return {
            "event": ename,
            "measurement_protocol_sent": False,
            "skipped_reason": "ga4_not_configured",
            "error": None,
        }
    if ok:
        return {
            "event": ename,
            "measurement_protocol_sent": True,
            "skipped_reason": None,
            "error": None,
        }
    return {
        "event": ename,
        "measurement_protocol_sent": False,
        "skipped_reason": "measurement_protocol_failed",
        "error": reason,
    }


def _sort_key(row: dict[str, Any], sort_by: str) -> Any:
    if sort_by == "occurred_at":
        return _parse_occurred(row) or datetime.min.replace(tzinfo=timezone.utc)
    if sort_by == "lead_value":
        try:
            return float(row.get("lead_value") or 0)
        except (TypeError, ValueError):
            return 0.0
    return str(row.get(sort_by) or "")


class LeadPatchBody(BaseModel):
    qualification_status: str | None = None
    disqualify_reason: str | None = None
    vehicle_make: str | None = None
    vehicle_model: str | None = None
    notes: str | None = None
    lead_value: float | None = None
    google_ads_conversion_value: float | str | None = None
    google_ads_conversion_name: str | None = None


class BulkUpdateBody(BaseModel):
    event_ids: list[str] = Field(min_length=1)
    updates: dict[str, Any] | None = None
    # Preset actions (merged into updates)
    mark_exported: bool | None = None
    mark_not_exported: bool | None = None
    queue_qualified_export: bool | None = None
    queue_adjustment_export: str | None = None  # RETRACTION | RESTATEMENT


class ExportQualifiedBody(BaseModel):
    event_ids: list[str] | None = None
    only_not_exported: bool = True
    write_to_sheet: bool = False


class ExportAdjustmentsBody(BaseModel):
    event_ids: list[str] | None = None
    write_to_sheet: bool = False


@router.get("/google-ads/exports")
async def list_exports(_: dict = Depends(verify_admin_session)):
    rows = await list_google_ads_exports(limit=200)
    return {"exports": rows}


@router.get("/google-ads/exports/{export_id}")
async def download_export(export_id: str, _: dict = Depends(verify_admin_session)):
    row = await get_google_ads_export(export_id)
    if not row:
        raise HTTPException(status_code=404, detail="Export not found")
    return PlainTextResponse(
        content=row["csv_content"],
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="google-ads-export-{export_id}.csv"'},
    )


@router.post("/google-ads/export-qualified")
async def export_qualified(payload: ExportQualifiedBody, _: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    if payload.event_ids:
        wanted = set(payload.event_ids)
        rows = [r for r in rows if str(r.get("event_id") or "").strip() in wanted]
    export_rows = build_qualified_export_rows(rows, only_not_exported=payload.only_not_exported)
    if not export_rows:
        raise HTTPException(status_code=400, detail="No eligible rows for qualified export")
    csv_text = qualified_export_csv_string(export_rows)
    batch = new_batch_id()
    now = datetime.now(LONDON).isoformat()
    cfg = ads_config()
    triggered_by = "admin"

    for er in export_rows:
        eid = str(er.get("event_id") or "").strip()
        if not eid:
            continue
        src = next((r for r in rows if str(r.get("event_id") or "").strip() == eid), None)
        if not src:
            continue
        en = enrich_lead_row(src)
        upd = {
            "google_ads_export_status": "exported",
            "google_ads_export_type": "qualified",
            "google_ads_exported_at": now,
            "google_ads_export_batch_id": batch,
            "google_ads_currency": str(cfg["default_currency"]),
            "google_ads_eligible": "true",
            "google_ads_identifier_type": en.get("identifier_type") or "",
            "google_ads_identifier_value": en.get("identifier_value") or "",
            "google_ads_conversion_name": en.get("computed_conversion_name") or "",
            "google_ads_conversion_value": str(en.get("computed_conversion_value") or ""),
            "google_ads_last_error": "",
        }
        update_row_by_event_id(svc, spreadsheet_id, tab, eid, upd)

    target = "csv"
    if payload.write_to_sheet:
        headers, data = sheet_rows_for_qualified(export_rows)
        write_export_tab(svc, spreadsheet_id, QUALIFIED_EXPORT_TAB, headers, data)
        target = f"sheet:{QUALIFIED_EXPORT_TAB}"

    export_id = new_batch_id()
    await insert_google_ads_export(
        export_id,
        "qualified",
        len(export_rows),
        csv_text,
        target=target,
        sheet_tab_written=QUALIFIED_EXPORT_TAB if payload.write_to_sheet else None,
    )

    try:
        append_export_log_row(
            svc,
            spreadsheet_id,
            [batch, now, "qualified", len(export_rows), target, triggered_by, "success", "", ""],
        )
    except Exception as e:
        logger.warning("export log append failed: %s", e)

    return {
        "export_id": export_id,
        "batch_id": batch,
        "row_count": len(export_rows),
        "target": target,
        "download_path": f"/admin/leads/google-ads/exports/{export_id}",
    }


@router.post("/google-ads/export-adjustments")
async def export_adjustments(payload: ExportAdjustmentsBody, _: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    if payload.event_ids:
        wanted = set(payload.event_ids)
        rows = [r for r in rows if str(r.get("event_id") or "").strip() in wanted]
    export_rows = build_adjustment_export_rows(rows)
    if not export_rows:
        raise HTTPException(status_code=400, detail="No rows queued for adjustment export")
    csv_text = adjustment_export_csv_string(export_rows)
    batch = new_batch_id()
    now = datetime.now(LONDON).isoformat()
    triggered_by = "admin"

    for er in export_rows:
        eid = str(er.get("event_id") or "").strip()
        if not eid:
            continue
        update_row_by_event_id(
            svc,
            spreadsheet_id,
            tab,
            eid,
            {
                "google_ads_export_status": "adjustment_exported",
                "google_ads_export_type": "adjustment",
                "google_ads_exported_at": now,
                "google_ads_export_batch_id": batch,
                "google_ads_adjustment_type": "",
                "google_ads_last_error": "",
            },
        )

    target = "csv"
    if payload.write_to_sheet:
        headers, data = sheet_rows_for_adjustments(export_rows)
        write_export_tab(svc, spreadsheet_id, ADJUSTMENTS_EXPORT_TAB, headers, data)
        target = f"sheet:{ADJUSTMENTS_EXPORT_TAB}"

    export_id = new_batch_id()
    await insert_google_ads_export(
        export_id,
        "adjustment",
        len(export_rows),
        csv_text,
        target=target,
        sheet_tab_written=ADJUSTMENTS_EXPORT_TAB if payload.write_to_sheet else None,
    )

    try:
        append_export_log_row(
            svc,
            spreadsheet_id,
            [batch, now, "adjustment", len(export_rows), target, triggered_by, "success", "", ""],
        )
    except Exception as e:
        logger.warning("export log append failed: %s", e)

    return {
        "export_id": export_id,
        "batch_id": batch,
        "row_count": len(export_rows),
        "target": target,
        "download_path": f"/admin/leads/google-ads/exports/{export_id}",
    }


@router.get("/journey/{journey_id}")
async def get_journey(journey_id: str, _: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    rows = read_rows_by_journey_id(svc, spreadsheet_id, tab, journey_id)
    rows.sort(key=lambda r: _parse_occurred(r) or datetime.min.replace(tzinfo=timezone.utc))
    enriched = [enrich_lead_row(dict(r)) for r in rows]
    return {"journey_id": journey_id, "events": enriched}


@router.get("")
async def list_leads(
    _: dict = Depends(verify_admin_session),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    sort_by: str = Query("occurred_at"),
    sort_dir: str = Query("desc"),
    date_from: str | None = None,
    date_to: str | None = None,
    qualification_status: str | None = None,
    disqualify_reason: str | None = None,
    vehicle_make: str | None = None,
    lead_channel: str | None = None,
    event_name: str | None = None,
    service_interest: str | None = None,
    service_category: str | None = None,
    has_gclid: bool | None = None,
    has_any_click_id: bool | None = None,
    exported_to_google_ads: str | None = None,
    page_type: str | None = None,
    search: str | None = None,
):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    filtered = [
        r
        for r in rows
        if _row_matches_filters(
            r,
            date_from=date_from,
            date_to=date_to,
            qualification_status=qualification_status,
            disqualify_reason=disqualify_reason,
            vehicle_make=vehicle_make,
            lead_channel=lead_channel,
            event_name=event_name,
            service_interest=service_interest,
            service_category=service_category,
            has_gclid=has_gclid,
            has_any_click_id=has_any_click_id,
            exported_to_google_ads=exported_to_google_ads,
            page_type=page_type,
            search=search,
        )
    ]
    allowed_sort = {
        "occurred_at",
        "lead_channel",
        "event_name",
        "qualification_status",
        "lead_value",
        "journey_id",
        "event_id",
    }
    sb = sort_by if sort_by in allowed_sort else "occurred_at"
    rev = sort_dir.lower() == "desc"
    filtered.sort(key=lambda r: _sort_key(r, sb), reverse=rev)
    total = len(filtered)
    start = (page - 1) * per_page
    chunk = filtered[start : start + per_page]
    enriched = [enrich_lead_row(dict(r)) for r in chunk]
    return {
        "leads": enriched,
        "total": total,
        "page": page,
        "per_page": per_page,
        "sheet_url": os.getenv("GOOGLE_SHEETS_URL", "").strip() or None,
    }


@router.get("/{event_id}")
async def get_lead(event_id: str, _: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    for r in rows:
        if str(r.get("event_id") or "").strip() == event_id:
            return {"lead": enrich_lead_row(dict(r))}
    raise HTTPException(status_code=404, detail="Lead not found")


@router.patch("/{event_id}")
async def patch_lead(event_id: str, body: LeadPatchBody, _: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if k in EDITABLE_LEAD_FIELDS}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    svc = _service()
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    old_row = next((dict(r) for r in rows if str(r.get("event_id") or "").strip() == event_id), None)
    if not old_row:
        raise HTTPException(status_code=404, detail="Lead not found")

    ok = update_row_by_event_id(svc, spreadsheet_id, tab, event_id, updates)
    if not ok:
        raise HTTPException(status_code=404, detail="Lead not found")
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    for r in rows:
        if str(r.get("event_id") or "").strip() == event_id:
            new_row = dict(r)
            ga4_sync = _ga4_qualification_sync_single(old_row, new_row)
            return {"ok": True, "lead": enrich_lead_row(new_row), "ga4_qualification_sync": ga4_sync}
    return {"ok": True, "ga4_qualification_sync": {"event": None, "measurement_protocol_sent": None, "skipped_reason": "lead_row_missing_after_update", "error": None}}


@router.post("/bulk-update")
async def bulk_update(body: BulkUpdateBody, _: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    merged: dict[str, Any] = dict(body.updates or {})

    if body.mark_exported:
        merged.update(
            {
                "google_ads_export_status": "exported",
                "google_ads_exported_at": datetime.now(LONDON).isoformat(),
            }
        )
    if body.mark_not_exported:
        merged.update(
            {
                "google_ads_export_status": "",
                "google_ads_export_batch_id": "",
                "google_ads_exported_at": "",
            }
        )
    if body.queue_qualified_export:
        merged.setdefault("google_ads_export_type", "qualified_pending")
    if body.queue_adjustment_export in ("RETRACTION", "RESTATEMENT"):
        merged["google_ads_adjustment_type"] = body.queue_adjustment_export

    if not merged:
        raise HTTPException(status_code=400, detail="No updates")

    allowed_bulk = set(EDITABLE_LEAD_FIELDS) | {
        "google_ads_export_status",
        "google_ads_export_type",
        "google_ads_exported_at",
        "google_ads_export_batch_id",
        "google_ads_adjustment_type",
        "google_ads_adjustment_value",
    }
    for k in list(merged.keys()):
        if k not in allowed_bulk:
            merged.pop(k, None)

    rows_before, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    eid_set = {str(x).strip() for x in body.event_ids}
    before_map = {
        str(r.get("event_id") or "").strip(): dict(r)
        for r in rows_before
        if str(r.get("event_id") or "").strip() in eid_set
    }

    result = bulk_update_rows_by_event_ids(svc, spreadsheet_id, tab, body.event_ids, merged)

    rows_after, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    after_map = {str(r.get("event_id") or "").strip(): dict(r) for r in rows_after}

    ga4_summary = {
        "qualification_transitions": 0,
        "measurement_protocol_succeeded": 0,
        "measurement_protocol_failed": 0,
        "skipped_ga4_not_configured": 0,
        "skipped_no_qualification_transition": 0,
    }
    ga4_events: list[dict[str, Any]] = []
    for eid in body.event_ids:
        eid_s = str(eid).strip()
        old = before_map.get(eid_s)
        new = after_map.get(eid_s)
        if not old or not new:
            continue
        old_qs = str(old.get("qualification_status") or "").strip().lower()
        new_qs = str(new.get("qualification_status") or "").strip().lower()
        ename = qualification_event_name_for_transition(old_qs, new_qs)
        if not ename:
            ga4_summary["skipped_no_qualification_transition"] += 1
            continue
        ga4_summary["qualification_transitions"] += 1
        row_mp = _row_for_ga4_qualification(new)
        ok, reason = send_admin_qualification_ga4(ename, row_mp)
        ev: dict[str, Any] = {
            "event_id": eid_s,
            "event": ename,
            "measurement_protocol_sent": ok,
        }
        if reason == "ga4_not_configured":
            ga4_summary["skipped_ga4_not_configured"] += 1
            ev["skipped_reason"] = "ga4_not_configured"
        elif ok:
            ga4_summary["measurement_protocol_succeeded"] += 1
            ev["skipped_reason"] = None
        else:
            ga4_summary["measurement_protocol_failed"] += 1
            ev["skipped_reason"] = reason or "measurement_protocol_failed"
        ga4_events.append(ev)

    return {
        "ok": True,
        **result,
        "ga4_qualification_sync": {
            "summary": ga4_summary,
            "events": ga4_events[:100],
        },
    }


@router.post("/sync-sheet-validations")
async def sync_validations(_: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    apply_leads_sheet_formatting(svc, spreadsheet_id, tab)
    return {"ok": True}
