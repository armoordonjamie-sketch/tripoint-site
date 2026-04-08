"""
Google Ads offline conversion export helpers (CSV + optional Sheet tab).
No live Google Ads API — import files only.
"""
from __future__ import annotations

import csv
import io
import logging
import math
import re
import uuid
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from lead_constants import ads_config

logger = logging.getLogger("tripoint.google_ads_export")

LONDON = ZoneInfo("Europe/London")


def _s(v: Any) -> str:
    if v is None:
        return ""
    return str(v).strip()


_SHA256_HEX_RE = re.compile(r"^[a-fA-F0-9]{64}$")


def _looks_like_sha256_hex(value: str) -> bool:
    return bool(_SHA256_HEX_RE.match(value))


def repair_common_leads_sheet_misalignment(row: dict[str, Any]) -> dict[str, Any]:
    """
    Undo a common Sheets corruption: five empty cells were omitted before qualification_status,
    so qualified/won/disqualified sits in user_agent, export status in qualification_status, etc.
    gclid/gbraid/wbraid in BASE columns (left of user_agent) stay correct.
    """
    r = dict(row)
    ua_raw = _s(r.get("user_agent"))
    ua = ua_raw.lower()
    qs_cell = _s(r.get("qualification_status")).lower()
    qual_tokens = frozenset({"qualified", "won", "disqualified"})
    export_qs_tokens = frozenset(
        {"ready", "exported", "disqualified_removed", "adjustment_required", "adjustment_pending"}
    )

    if ua not in qual_tokens:
        return r
    if qs_cell not in export_qs_tokens:
        return r
    # Real browser UAs are long; qualification tokens are short.
    if len(ua_raw) > 80:
        return r

    old_export_status = _s(r.get("qualification_status"))
    old_export_type_slot = _s(r.get("disqualify_reason"))
    r["qualification_status"] = ua_raw
    r["user_agent"] = ""
    r["disqualify_reason"] = ""
    r["google_ads_export_status"] = old_export_status or _s(r.get("google_ads_export_status"))
    if old_export_type_slot == "offline_export":
        r["google_ads_export_type"] = "offline_export"

    he = _s(r.get("hashed_email"))
    hp = _s(r.get("hashed_phone"))
    if he and not _looks_like_sha256_hex(he):
        if not _s(r.get("vehicle_make")):
            r["vehicle_make"] = he
        r["hashed_email"] = ""
    if hp and not _looks_like_sha256_hex(hp):
        if not _s(r.get("vehicle_model")):
            r["vehicle_model"] = hp
        r["hashed_phone"] = ""

    cfg = ads_config()
    qname = _s(cfg["qualified_conversion_name"])
    wname = _s(cfg["won_conversion_name"])
    conv_aliases = frozenset({qname, wname, "Qualified Lead", "Won Job", "Won Lead"})
    vmk = _s(r.get("vehicle_make"))
    vma = _s(r.get("vehicle_model"))
    nt = _s(r.get("notes"))

    if vmk and vmk in conv_aliases and not _s(r.get("google_ads_conversion_name")):
        r["google_ads_conversion_name"] = vmk
        r["vehicle_make"] = ""
        vmk = ""

    val_num = _parse_float(vma)
    if val_num is not None and not _s(r.get("google_ads_conversion_value")):
        r["google_ads_conversion_value"] = vma
        r["vehicle_model"] = ""
        vma = ""

    if nt in ("GBP", "USD", "EUR") and not _s(r.get("google_ads_currency")):
        r["google_ads_currency"] = nt
        r["notes"] = ""

    ge = _s(r.get("google_ads_eligible")).upper()
    if ge not in ("TRUE", "1", "YES", "FALSE", "0", "NO"):
        qsf = _s(r.get("qualification_status")).lower()
        if qsf in ("qualified", "won") and _s(r.get("gclid")):
            r["google_ads_eligible"] = "TRUE"
        elif qsf == "disqualified":
            r["google_ads_eligible"] = "FALSE"

    return r


def _parse_float(v: Any) -> float | None:
    if v is None or v == "":
        return None
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    if math.isnan(x) or math.isinf(x):
        return None
    return x


def resolve_click_identifier(row: dict[str, Any]) -> tuple[str | None, str | None]:
    """Return (identifier_type, identifier_value) with gclid > wbraid > gbraid priority."""
    gclid = _s(row.get("gclid"))
    wbraid = _s(row.get("wbraid"))
    gbraid = _s(row.get("gbraid"))
    if gclid:
        return "gclid", gclid
    if wbraid:
        return "wbraid", wbraid
    if gbraid:
        return "gbraid", gbraid
    return None, None


def enrich_lead_row(row: dict[str, Any]) -> dict[str, Any]:
    """Add computed fields for API responses (does not mutate sheet row)."""
    cfg = ads_config()
    id_type, id_val = resolve_click_identifier(row)
    has_click_id = id_type is not None
    qs = _s(row.get("qualification_status")).lower()
    conv_name_override = _s(row.get("google_ads_conversion_name"))
    conv_val_override = _parse_float(row.get("google_ads_conversion_value"))
    lead_val = _parse_float(row.get("lead_value"))

    if qs == "qualified":
        default_name = str(cfg["qualified_conversion_name"])
        default_val = float(cfg["default_qualified_value"])
    elif qs == "won":
        default_name = str(cfg["won_conversion_name"])
        default_val = float(cfg["default_won_value"])
    else:
        default_name = ""
        default_val = 0.0

    conversion_name = conv_name_override or default_name

    if conv_val_override is not None:
        value_for_export = conv_val_override
    elif lead_val is not None:
        value_for_export = lead_val
    else:
        value_for_export = default_val
    if isinstance(value_for_export, float) and (math.isnan(value_for_export) or math.isinf(value_for_export)):
        value_for_export = default_val

    ads_exportable = False
    ineligible_reason = ""
    export_reason = ""

    if qs not in ("qualified", "won"):
        ineligible_reason = "qualification_not_exportable"
    elif not has_click_id:
        ineligible_reason = "missing_click_identifier"
    elif not conversion_name:
        ineligible_reason = "missing_conversion_name"
    else:
        ads_exportable = True
        export_reason = f"status_{qs}"

    adj_t = _s(row.get("google_ads_adjustment_type")).upper()
    needs_adjustment = adj_t in ("RETRACTION", "RESTATEMENT")

    out = dict(row)
    out["has_click_id"] = has_click_id
    out["identifier_type"] = id_type or ""
    out["identifier_value"] = id_val or ""
    out["ads_exportable"] = ads_exportable
    out["needs_adjustment"] = needs_adjustment
    out["export_reason"] = export_reason
    out["ineligible_reason"] = ineligible_reason if not ads_exportable else ""
    out["computed_conversion_name"] = conversion_name
    out["computed_conversion_value"] = value_for_export
    out["computed_currency"] = _s(row.get("google_ads_currency")) or str(cfg["default_currency"])
    return out


def _sheet_conversion_value_empty(row: dict[str, Any]) -> bool:
    v = row.get("google_ads_conversion_value")
    if v is None:
        return True
    if isinstance(v, str) and not v.strip():
        return True
    return False


def compute_ads_enrichment_fields(row: dict[str, Any]) -> dict[str, Any]:
    """
    Sheet columns to persist when qualification (or related context) changes.
    Disqualified rows are never eligible for the offline export tab; qualified/won rows
    get google_ads_eligible TRUE only when enrich_lead_row says ads_exportable.
    """
    qs = _s(row.get("qualification_status")).lower()
    if qs == "disqualified":
        return {"google_ads_eligible": "FALSE"}

    en = enrich_lead_row(dict(row))
    if not en.get("ads_exportable"):
        # Still persist conversion name/value/currency for the Leads sheet and admin UI.
        # Offline export / Google import rows remain gated on click id in enrich_lead_row.
        out: dict[str, Any] = {"google_ads_eligible": "FALSE"}
        if qs in ("qualified", "won"):
            if not _s(row.get("google_ads_conversion_name")):
                out["google_ads_conversion_name"] = _s(en.get("computed_conversion_name"))
            if _sheet_conversion_value_empty(row):
                out["google_ads_conversion_value"] = str(en.get("computed_conversion_value") or 0)
            if not _s(row.get("google_ads_currency")):
                out["google_ads_currency"] = _s(en.get("computed_currency"))
        return out

    out = {
        "google_ads_eligible": "TRUE",
        "google_ads_identifier_type": _s(en.get("identifier_type")),
        "google_ads_identifier_value": _s(en.get("identifier_value")),
    }
    if not _s(row.get("google_ads_conversion_name")):
        out["google_ads_conversion_name"] = _s(en.get("computed_conversion_name"))
    if _sheet_conversion_value_empty(row):
        out["google_ads_conversion_value"] = str(en.get("computed_conversion_value") or 0)
    if not _s(row.get("google_ads_currency")):
        out["google_ads_currency"] = _s(en.get("computed_currency"))
    return out


def adjustment_fields_for_exported_disqualify(old_row: dict[str, Any]) -> dict[str, Any] | None:
    """
    When a lead was already uploaded to Google Ads (sheet status exported) as qualified/won and
    admin sets qualification to disqualified, queue an offline RETRACTION and surface ops state.

    Call with the pre-update row (still qualified/won + exported). Returns fields to merge into PATCH/bulk.
    """
    old_qs = _s(old_row.get("qualification_status")).lower()
    if old_qs not in ("qualified", "won"):
        return None
    ex = _s(old_row.get("google_ads_export_status")).lower()
    if ex != "exported":
        return None
    cfg = ads_config()
    en = enrich_lead_row(dict(old_row))
    conv = _s(old_row.get("google_ads_conversion_name")) or _s(en.get("computed_conversion_name"))
    if not conv:
        conv = str(cfg["qualified_conversion_name"]) if old_qs == "qualified" else str(cfg["won_conversion_name"])
    return {
        "google_ads_export_status": "adjustment_required",
        "google_ads_adjustment_type": "RETRACTION",
        "google_ads_adjustment_value": "",
        "google_ads_conversion_name": conv,
        "google_ads_last_error": "",
    }


def _occurred_at_to_london_dt(row: dict[str, Any]) -> datetime | None:
    raw = _s(row.get("occurred_at"))
    if not raw:
        return None
    try:
        raw2 = raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(raw2)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=LONDON)
        return dt.astimezone(LONDON)
    except Exception:
        return None


def build_qualified_export_rows(
    rows: list[dict[str, Any]],
    *,
    only_not_exported: bool = True,
) -> list[dict[str, Any]]:
    """Build rows for Google Ads click conversion import CSV."""
    cfg = ads_config()
    currency = str(cfg["default_currency"])
    out: list[dict[str, Any]] = []
    for row in rows:
        enriched = enrich_lead_row(row)
        if not enriched.get("ads_exportable"):
            continue
        if only_not_exported:
            st = _s(row.get("google_ads_export_status")).lower()
            batch = _s(row.get("google_ads_export_batch_id"))
            if st == "exported" or batch:
                continue
        id_type = enriched.get("identifier_type") or ""
        id_val = enriched.get("identifier_value") or ""
        dt = _occurred_at_to_london_dt(row)
        conv_time = dt.strftime("%Y-%m-%d %H:%M:%S") if dt else ""
        out.append(
            {
                "Parameters:TimeZone": "Europe/London",
                "Google Click ID": id_val if id_type == "gclid" else "",
                "WBRAID": id_val if id_type == "wbraid" else "",
                "GBRAID": id_val if id_type == "gbraid" else "",
                "Conversion Name": enriched.get("computed_conversion_name") or "",
                "Conversion Time": conv_time,
                "Conversion Value": str(enriched.get("computed_conversion_value") or 0),
                "Conversion Currency": currency,
                "event_id": _s(row.get("event_id")),
            }
        )
    return out


def build_adjustment_export_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cfg = ads_config()
    currency = str(cfg["default_currency"])
    now = datetime.now(LONDON)
    adj_time = now.strftime("%Y-%m-%d %H:%M:%S")
    out: list[dict[str, Any]] = []
    for row in rows:
        adj_type = _s(row.get("google_ads_adjustment_type")).upper()
        if adj_type not in ("RETRACTION", "RESTATEMENT"):
            continue
        id_type, id_val = resolve_click_identifier(row)
        if not id_val:
            continue
        conv_name = _s(row.get("google_ads_conversion_name")) or _s(row.get("computed_conversion_name"))
        if not conv_name:
            qs = _s(row.get("qualification_status")).lower()
            if qs == "qualified":
                conv_name = str(cfg["qualified_conversion_name"])
            elif qs == "won":
                conv_name = str(cfg["won_conversion_name"])
        restated = _parse_float(row.get("google_ads_adjustment_value"))
        if adj_type == "RETRACTION":
            adj_val = 0.0
        else:
            adj_val = restated if restated is not None else _parse_float(row.get("google_ads_conversion_value")) or 0.0
        out.append(
            {
                "Google Click ID": id_val if id_type == "gclid" else "",
                "WBRAID": id_val if id_type == "wbraid" else "",
                "GBRAID": id_val if id_type == "gbraid" else "",
                "Conversion Name": conv_name,
                "Adjustment Time": adj_time,
                "Adjustment Type": adj_type,
                "Adjusted Value": str(adj_val),
                "Adjusted Currency": currency,
                "event_id": _s(row.get("event_id")),
            }
        )
    return out


def export_rows_to_csv(fieldnames: list[str], rows: list[dict[str, Any]]) -> str:
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore")
    w.writeheader()
    for r in rows:
        w.writerow({k: r.get(k, "") for k in fieldnames})
    return buf.getvalue()


def qualified_csv_fieldnames() -> list[str]:
    return [
        "Parameters:TimeZone",
        "Google Click ID",
        "WBRAID",
        "GBRAID",
        "Conversion Name",
        "Conversion Time",
        "Conversion Value",
        "Conversion Currency",
    ]


def adjustment_csv_fieldnames() -> list[str]:
    return [
        "Google Click ID",
        "WBRAID",
        "GBRAID",
        "Conversion Name",
        "Adjustment Time",
        "Adjustment Type",
        "Adjusted Value",
        "Adjusted Currency",
    ]


def new_batch_id() -> str:
    return str(uuid.uuid4())


def qualified_export_csv_string(export_rows: list[dict[str, Any]]) -> str:
    fn = qualified_csv_fieldnames()
    # drop event_id from CSV output
    clean = [{k: r[k] for k in fn if k in r} for r in export_rows]
    return export_rows_to_csv(fn, clean)


def adjustment_export_csv_string(export_rows: list[dict[str, Any]]) -> str:
    fn = adjustment_csv_fieldnames()
    clean = [{k: r[k] for k in fn if k in r} for r in export_rows]
    return export_rows_to_csv(fn, clean)


def sheet_rows_for_qualified(export_rows: list[dict[str, Any]]) -> tuple[list[str], list[list[Any]]]:
    headers = qualified_csv_fieldnames()
    data: list[list[Any]] = []
    for r in export_rows:
        data.append([r.get(h, "") for h in headers])
    return headers, data


def sheet_rows_for_adjustments(export_rows: list[dict[str, Any]]) -> tuple[list[str], list[list[Any]]]:
    headers = adjustment_csv_fieldnames()
    data = [[r.get(h, "") for h in headers] for r in export_rows]
    return headers, data
