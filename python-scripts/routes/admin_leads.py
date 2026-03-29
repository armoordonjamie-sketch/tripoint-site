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
    OFFLINE_EXPORT_TAB,
    QUALIFIED_EXPORT_TAB,
    ads_config,
)
from services.ads_offline_sync import run_offline_export_sync
from services.auth import verify_admin_session
from services import sheets_leads
from services.ga4_measurement import (
    qualification_event_name_for_transition,
    send_admin_qualification_ga4,
)
from services.google_ads_export import (
    adjustment_fields_for_exported_disqualify,
    build_adjustment_export_rows,
    build_qualified_export_rows,
    compute_ads_enrichment_fields,
    enrich_lead_row,
    new_batch_id,
    qualified_export_csv_string,
    adjustment_export_csv_string,
    resolve_click_identifier,
    sheet_rows_for_adjustments,
    sheet_rows_for_qualified,
)
from services.sheets_leads import (
    append_export_log_row,
    apply_leads_sheet_formatting,
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
    identifier_type: str | None,
    google_ads_eligible: bool | None,
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
    if identifier_type:
        it, _iv = resolve_click_identifier(row)
        want = identifier_type.strip().lower()
        if want == "none":
            if it is not None:
                return False
        elif (it or "").lower() != want:
            return False
    if google_ads_eligible is not None:
        enr = enrich_lead_row(dict(row))
        ads_ok = bool(enr.get("ads_exportable"))
        if google_ads_eligible and not ads_ok:
            return False
        if not google_ads_eligible and ads_ok:
            return False
    return True


# Qualification transitions that should rebuild the offline export tab (full sheet resync).
_OFFLINE_EXPORT_SYNC_STATUSES = frozenset({"qualified", "won", "disqualified"})


def _merge_qualification_ads_enrichment(old_row: dict[str, Any], updates: dict[str, Any]) -> None:
    """When qualification_status is in updates, persist derived Google Ads sheet fields (in-place)."""
    if "qualification_status" not in updates:
        return
    preview = {**old_row, **updates}
    extra = compute_ads_enrichment_fields(preview)
    for k, v in extra.items():
        if k == "google_ads_eligible":
            updates[k] = v
        else:
            updates.setdefault(k, v)


def _maybe_sync_offline_export(
    svc: Any,
    spreadsheet_id: str,
    tab: str,
    old_qs: str,
    new_qs: str,
    *,
    triggered_by: str,
) -> dict[str, Any] | None:
    """
    If qualification_status changed and either side is export-relevant, rebuild google_ads_offline_export.
    Never raises — failures are logged and returned in the dict.
    """
    o = str(old_qs or "").strip().lower()
    n = str(new_qs or "").strip().lower()
    if o == n:
        return None
    if o not in _OFFLINE_EXPORT_SYNC_STATUSES and n not in _OFFLINE_EXPORT_SYNC_STATUSES:
        return None
    try:
        return run_offline_export_sync(
            svc, spreadsheet_id, tab, force=True, triggered_by=triggered_by
        )
    except Exception as e:
        logger.exception("offline export auto-sync failed (%s): %s", triggered_by, e)
        return {"ok": False, "error": str(e), "tab": OFFLINE_EXPORT_TAB}


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


def _ga4_mp_result_to_sync_payload(ename: str, res: dict[str, Any]) -> dict[str, Any]:
    sent = bool(res.get("sent"))
    sr = None if sent else str(res.get("skipped_reason") or "")
    benign = sr in ("ga4_not_configured", "missing_ga_client_id", "missing_ga_session_id", "")
    return {
        "event": ename,
        "measurement_protocol_sent": sent,
        "skipped_reason": sr or None,
        "error": None if sent or benign else sr,
        "ga4_sync_attempted": bool(res.get("attempted")),
        "ga4_sync_sent": sent,
        "ga4_sync_skipped_reason": sr or None,
        "ga4_sync_validation_messages": list(res.get("validation_messages") or []),
        "ga4_sync_session_id_policy": res.get("session_id_policy"),
    }


def _ga4_qualification_sync_single(old_row: dict[str, Any], new_row: dict[str, Any]) -> dict[str, Any]:
    """Response fragment for PATCH; never raises."""
    no_transition = {
        "event": None,
        "measurement_protocol_sent": None,
        "skipped_reason": "no_qualification_transition",
        "error": None,
        "ga4_sync_attempted": False,
        "ga4_sync_sent": False,
        "ga4_sync_skipped_reason": "no_qualification_transition",
        "ga4_sync_validation_messages": [],
        "ga4_sync_session_id_policy": None,
    }
    old_qs = str(old_row.get("qualification_status") or "").strip().lower()
    new_qs = str(new_row.get("qualification_status") or "").strip().lower()
    ename = qualification_event_name_for_transition(old_qs, new_qs)
    if not ename:
        return no_transition
    row_mp = _row_for_ga4_qualification(new_row)
    res = send_admin_qualification_ga4(ename, row_mp)
    return _ga4_mp_result_to_sync_payload(ename, res)


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
    google_ads_export_override: str | None = None
    qualified_at: str | None = None
    won_at: str | None = None


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


class SyncOfflineExportBody(BaseModel):
    force: bool = False


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


@router.post("/google-ads/sync-offline-export")
async def sync_offline_export(payload: SyncOfflineExportBody, _: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    result = run_offline_export_sync(
        svc,
        spreadsheet_id,
        tab,
        force=payload.force,
        triggered_by="admin_api",
    )
    if not result.get("ok"):
        raise HTTPException(status_code=500, detail=result.get("errors") or ["sync failed"])
    return {"offline_export_tab": OFFLINE_EXPORT_TAB, **result}


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
    identifier_type: str | None = None,
    google_ads_eligible: bool | None = None,
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
            identifier_type=identifier_type,
            google_ads_eligible=google_ads_eligible,
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

    if "qualification_status" in updates:
        new_qs = str(updates.get("qualification_status") or "").strip().lower()
        old_qs = str(old_row.get("qualification_status") or "").strip().lower()
        now_ts = datetime.now(LONDON).isoformat()
        if new_qs == "qualified" and old_qs != "qualified":
            updates.setdefault("qualified_at", now_ts)
        if new_qs == "won" and old_qs != "won":
            updates.setdefault("won_at", now_ts)
        if new_qs == "disqualified":
            adj = adjustment_fields_for_exported_disqualify(old_row)
            if adj:
                updates.update(adj)
        _merge_qualification_ads_enrichment(old_row, updates)

    ok = update_row_by_event_id(svc, spreadsheet_id, tab, event_id, updates)
    if not ok:
        raise HTTPException(status_code=404, detail="Lead not found")
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    for r in rows:
        if str(r.get("event_id") or "").strip() == event_id:
            new_row = dict(r)
            ga4_sync = _ga4_qualification_sync_single(old_row, new_row)
            logger.info(
                "PATCH lead ga4_qualification_sync event_id=%s old_q=%s new_q=%s sync=%s",
                event_id,
                str(old_row.get("qualification_status") or "").strip(),
                str(new_row.get("qualification_status") or "").strip(),
                ga4_sync,
            )
            offline_export_sync = None
            if "qualification_status" in updates:
                offline_export_sync = _maybe_sync_offline_export(
                    svc,
                    spreadsheet_id,
                    tab,
                    str(old_row.get("qualification_status") or ""),
                    str(new_row.get("qualification_status") or ""),
                    triggered_by="admin_patch",
                )
            return {
                "ok": True,
                "lead": enrich_lead_row(new_row),
                "ga4_qualification_sync": ga4_sync,
                "offline_export_sync": offline_export_sync,
            }
    return {
        "ok": True,
        "ga4_qualification_sync": {
            "event": None,
            "measurement_protocol_sent": None,
            "skipped_reason": "lead_row_missing_after_update",
            "error": None,
            "ga4_sync_attempted": False,
            "ga4_sync_sent": False,
            "ga4_sync_skipped_reason": "lead_row_missing_after_update",
            "ga4_sync_validation_messages": [],
            "ga4_sync_session_id_policy": None,
        },
        "offline_export_sync": None,
    }


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
        "google_ads_eligible",
        "google_ads_identifier_type",
        "google_ads_identifier_value",
        "google_ads_currency",
        "qualified_at",
        "won_at",
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

    now_ts = datetime.now(LONDON).isoformat()
    updated = 0
    missing: list[str] = []
    for eid in body.event_ids:
        eid_s = str(eid).strip()
        per_updates = dict(merged)
        old = before_map.get(eid_s)
        if old and "qualification_status" in per_updates:
            new_qs = str(per_updates.get("qualification_status") or "").strip().lower()
            old_qs = str(old.get("qualification_status") or "").strip().lower()
            if new_qs == "qualified" and old_qs != "qualified":
                per_updates.setdefault("qualified_at", now_ts)
            if new_qs == "won" and old_qs != "won":
                per_updates.setdefault("won_at", now_ts)
            if new_qs == "disqualified" and old:
                adj = adjustment_fields_for_exported_disqualify(old)
                if adj:
                    per_updates.update(adj)
            if old:
                _merge_qualification_ads_enrichment(old, per_updates)
        if update_row_by_event_id(svc, spreadsheet_id, tab, eid_s, per_updates):
            updated += 1
        else:
            missing.append(eid_s)
    result = {"updated": updated, "missing_event_ids": missing}

    rows_after, _ = read_all_lead_rows(svc, spreadsheet_id, tab)
    after_map = {str(r.get("event_id") or "").strip(): dict(r) for r in rows_after}

    ga4_summary = {
        "qualification_transitions": 0,
        "measurement_protocol_succeeded": 0,
        "measurement_protocol_failed": 0,
        "skipped_ga4_not_configured": 0,
        "skipped_missing_ga_client_id": 0,
        "skipped_missing_ga_session_id": 0,
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
        res = send_admin_qualification_ga4(ename, row_mp)
        ok = bool(res.get("sent"))
        reason = res.get("skipped_reason") if not ok else None
        ev: dict[str, Any] = {
            "event_id": eid_s,
            "event": ename,
            "measurement_protocol_sent": ok,
            "ga4_sync_attempted": res.get("attempted"),
            "ga4_sync_sent": ok,
            "ga4_sync_skipped_reason": reason,
            "ga4_sync_validation_messages": list(res.get("validation_messages") or []),
            "ga4_sync_session_id_policy": res.get("session_id_policy"),
        }
        if reason == "ga4_not_configured":
            ga4_summary["skipped_ga4_not_configured"] += 1
            ev["skipped_reason"] = "ga4_not_configured"
        elif reason == "missing_ga_client_id":
            ga4_summary["skipped_missing_ga_client_id"] += 1
            ev["skipped_reason"] = reason
        elif reason == "missing_ga_session_id":
            ga4_summary["skipped_missing_ga_session_id"] += 1
            ev["skipped_reason"] = reason
        elif ok:
            ga4_summary["measurement_protocol_succeeded"] += 1
            ev["skipped_reason"] = None
        else:
            ga4_summary["measurement_protocol_failed"] += 1
            ev["skipped_reason"] = reason or "measurement_protocol_failed"
        ga4_events.append(ev)

    offline_export_sync = None
    if "qualification_status" in merged:
        try:
            offline_export_sync = run_offline_export_sync(
                svc, spreadsheet_id, tab, force=True, triggered_by="admin_bulk"
            )
        except Exception as e:
            logger.exception("offline export bulk auto-sync failed: %s", e)
            offline_export_sync = {"ok": False, "error": str(e), "tab": OFFLINE_EXPORT_TAB}

    return {
        "ok": True,
        **result,
        "ga4_qualification_sync": {
            "summary": ga4_summary,
            "events": ga4_events[:100],
        },
        "offline_export_sync": offline_export_sync,
    }


@router.post("/sync-sheet-validations")
async def sync_validations(_: dict = Depends(verify_admin_session)):
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise HTTPException(status_code=503, detail="Sheets not configured")
    svc = _service()
    apply_leads_sheet_formatting(svc, spreadsheet_id, tab)
    return {"ok": True}
