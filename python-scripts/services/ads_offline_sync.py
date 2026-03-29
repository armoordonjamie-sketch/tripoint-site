"""
Google Ads offline export tab sync: read Leads, dedupe by export_key, rewrite OFFLINE_EXPORT_TAB.

See docs/google_ads_offline_export.md for column definitions and how to run sync locally.
"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from lead_constants import OFFLINE_EXPORT_COLUMNS, OFFLINE_EXPORT_TAB
from services.google_ads_export import (
    _occurred_at_to_london_dt,
    enrich_lead_row,
    new_batch_id,
)
from services.sheets_leads import append_export_log_row, read_all_lead_rows, update_row_by_event_id, write_export_tab

logger = logging.getLogger("tripoint.ads_offline_sync")

LONDON = ZoneInfo("Europe/London")


def _s(v: Any) -> str:
    if v is None:
        return ""
    return str(v).strip()


def google_ads_eligible_truthy(v: Any) -> bool:
    """Sheet / API value considered eligible for offline export."""
    if v is True:
        return True
    s = _s(v).lower()
    return s in ("true", "1", "yes")


def build_export_key(row: dict[str, Any], enriched: dict[str, Any]) -> str:
    """
    Stable key for deduping one offline conversion per outcome + click id + action name.
    Format: journey_id:qualification_status:conversion_name:identifier_value
    """
    jid = _s(row.get("journey_id"))
    qs = _s(row.get("qualification_status")).lower()
    cname = _s(enriched.get("computed_conversion_name"))
    id_val = _s(enriched.get("identifier_value"))
    return f"{jid}:{qs}:{cname}:{id_val}"


def _iso_to_conversion_time(raw: str) -> str:
    """Parse ISO-ish timestamp to Google Ads offline import time string (London)."""
    if not raw:
        return ""
    try:
        raw2 = raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(raw2)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=LONDON)
        return dt.astimezone(LONDON).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return ""


def resolve_conversion_time(row: dict[str, Any]) -> str:
    """
    Prefer explicit outcome timestamps; else original event time.
    qualified_at / won_at are set by admin PATCH when status transitions.
    """
    qs = _s(row.get("qualification_status")).lower()
    if qs == "qualified":
        t = _s(row.get("qualified_at"))
        if t:
            return _iso_to_conversion_time(t)
    elif qs == "won":
        t = _s(row.get("won_at"))
        if t:
            return _iso_to_conversion_time(t)
    dt = _occurred_at_to_london_dt(row)
    return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else ""


def _occurred_at_sort_ts(row: dict[str, Any]) -> float:
    dt = _occurred_at_to_london_dt(row)
    if dt is None:
        return 0.0
    return dt.timestamp()


def build_offline_export_row(
    row: dict[str, Any],
    enriched: dict[str, Any],
    *,
    batch_id: str,
) -> dict[str, Any]:
    """One export tab row (keys match OFFLINE_EXPORT_COLUMNS)."""
    conv_time = resolve_conversion_time(row)
    conv_name = _s(enriched.get("computed_conversion_name"))
    id_type = _s(enriched.get("identifier_type"))
    id_val = _s(enriched.get("identifier_value"))
    currency = _s(enriched.get("computed_currency"))
    conv_val = enriched.get("computed_conversion_value")
    val_str = "" if conv_val is None else str(conv_val)

    export_ready = "true" if (conv_name and id_val and conv_time) else "false"

    ek = build_export_key(row, enriched)
    return {
        "export_key": ek,
        "journey_id": _s(row.get("journey_id")),
        "source_event_id": _s(row.get("event_id")),
        "source_event_name": _s(row.get("event_name")),
        "qualification_status": _s(row.get("qualification_status")).lower(),
        "conversion_name": conv_name,
        "conversion_time": conv_time,
        "conversion_value": val_str,
        "currency": currency,
        "identifier_type": id_type,
        "identifier_value": id_val,
        "gclid": _s(row.get("gclid")),
        "gbraid": _s(row.get("gbraid")),
        "wbraid": _s(row.get("wbraid")),
        "ga_client_id": _s(row.get("ga_client_id")),
        "ga_session_id": _s(row.get("ga_session_id")),
        "lead_channel": _s(row.get("lead_channel")),
        "contact_method": _s(row.get("contact_method")),
        "click_location": _s(row.get("click_location")),
        "form_name": _s(row.get("form_name")),
        "service_interest": _s(row.get("service_interest")),
        "vehicle_make": _s(row.get("vehicle_make")),
        "vehicle_model": _s(row.get("vehicle_model")),
        "page": _s(row.get("page")),
        "utm_source": _s(row.get("utm_source")),
        "utm_medium": _s(row.get("utm_medium")),
        "utm_campaign": _s(row.get("utm_campaign")),
        "notes": _s(row.get("notes")),
        "source_row_status": _s(row.get("google_ads_export_status")),
        "exported_at": _s(row.get("google_ads_exported_at")),
        "export_batch_id": batch_id,
        "export_ready": export_ready,
    }


def build_offline_export_set(
    source_rows: list[dict[str, Any]],
    *,
    batch_id: str,
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """
    Filter, enrich, dedupe by export_key (latest occurred_at wins per key).
    Returns (export_row_dicts, skip_counters).
    """
    stats: dict[str, int] = {
        "skipped_not_ads_exportable": 0,
        "skipped_not_google_ads_eligible": 0,
        "skipped_export_override_exclude": 0,
        "skipped_duplicate_export_key": 0,
    }

    candidates: list[tuple[float, str, dict[str, Any], dict[str, Any]]] = []
    for row in source_rows:
        enriched = enrich_lead_row(dict(row))
        if not enriched.get("ads_exportable"):
            stats["skipped_not_ads_exportable"] += 1
            continue
        if not google_ads_eligible_truthy(row.get("google_ads_eligible")):
            stats["skipped_not_google_ads_eligible"] += 1
            continue
        override = _s(row.get("google_ads_export_override")).lower()
        if override == "exclude":
            stats["skipped_export_override_exclude"] += 1
            continue
        ts = _occurred_at_sort_ts(row)
        ek = build_export_key(row, enriched)
        candidates.append((ts, ek, dict(row), enriched))

    candidates.sort(key=lambda x: x[0], reverse=True)
    seen_keys: set[str] = set()
    out_rows: list[dict[str, Any]] = []
    for ts, ek, row, enriched in candidates:
        if ek in seen_keys:
            stats["skipped_duplicate_export_key"] += 1
            continue
        seen_keys.add(ek)
        out_rows.append(build_offline_export_row(row, enriched, batch_id=batch_id))

    out_rows.sort(key=lambda r: r["export_key"])
    return out_rows, stats


def _row_dict_to_line(r: dict[str, Any]) -> list[Any]:
    return [r.get(c, "") for c in OFFLINE_EXPORT_COLUMNS]


def run_offline_export_sync(
    service: Any,
    spreadsheet_id: str,
    source_tab: str,
    *,
    force: bool = False,
    triggered_by: str = "admin_api",
) -> dict[str, Any]:
    """
    Read source Leads, rebuild OFFLINE_EXPORT_TAB, optionally refresh source row export fields.
    """
    batch_id = new_batch_id()
    now_iso = datetime.now(LONDON).isoformat()
    errors: list[str] = []
    rows, _ = read_all_lead_rows(service, spreadsheet_id, source_tab)
    export_dicts, stats = build_offline_export_set(rows, batch_id=batch_id)
    data_lines = [_row_dict_to_line(r) for r in export_dicts]

    try:
        write_export_tab(service, spreadsheet_id, OFFLINE_EXPORT_TAB, OFFLINE_EXPORT_COLUMNS, data_lines)
    except Exception as e:
        logger.exception("offline export tab write failed: %s", e)
        return {
            "ok": False,
            "batch_id": batch_id,
            "rows_written": 0,
            "tab": OFFLINE_EXPORT_TAB,
            **stats,
            "source_rows_updated": 0,
            "source_stale_cleared": 0,
            "errors": [str(e)],
        }

    source_updated = 0
    for r in export_dicts:
        eid = _s(r.get("source_event_id"))
        if not eid:
            continue
        src = next((x for x in rows if _s(x.get("event_id")) == eid), None)
        if not src:
            continue
        st = _s(src.get("google_ads_export_status")).lower()
        if not force and st in ("ready", "exported"):
            continue
        en = enrich_lead_row(dict(src))
        ok = update_row_by_event_id(
            service,
            spreadsheet_id,
            source_tab,
            eid,
            {
                "google_ads_export_status": "ready",
                "google_ads_export_type": "offline_export",
                "google_ads_export_batch_id": batch_id,
                "google_ads_identifier_type": en.get("identifier_type") or "",
                "google_ads_identifier_value": en.get("identifier_value") or "",
                "google_ads_last_error": "",
            },
        )
        if ok:
            source_updated += 1
        else:
            msg = f"update_row_by_event_id failed event_id={eid}"
            errors.append(msg)
            logger.warning(msg)

    exported_eids = {_s(r.get("source_event_id")) for r in export_dicts if _s(r.get("source_event_id"))}
    stale_cleared = 0
    for src in rows:
        eid = _s(src.get("event_id"))
        if not eid or eid in exported_eids:
            continue
        st = _s(src.get("google_ads_export_status")).lower()
        if st != "ready":
            continue
        ok = update_row_by_event_id(
            service,
            spreadsheet_id,
            source_tab,
            eid,
            {
                "google_ads_export_status": "disqualified_removed",
                "google_ads_export_batch_id": "",
                "google_ads_last_error": "",
            },
        )
        if ok:
            stale_cleared += 1
        else:
            errors.append(f"stale_ready_clear_failed event_id={eid}")

    try:
        append_export_log_row(
            service,
            spreadsheet_id,
            [
                batch_id,
                now_iso,
                "offline_export",
                len(export_dicts),
                f"sheet:{OFFLINE_EXPORT_TAB}",
                triggered_by,
                "success" if not errors else "partial",
                "",
                "; ".join(errors) if errors else "",
            ],
        )
    except Exception as e:
        logger.warning("offline export log append failed: %s", e)

    return {
        "ok": True,
        "batch_id": batch_id,
        "rows_written": len(export_dicts),
        "tab": OFFLINE_EXPORT_TAB,
        **stats,
        "source_rows_updated": source_updated,
        "source_stale_cleared": stale_cleared,
        "errors": errors,
    }
