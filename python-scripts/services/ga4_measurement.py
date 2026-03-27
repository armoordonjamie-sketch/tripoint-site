"""
GA4 Measurement Protocol — optional server-side events (e.g. lead_qualified).
Not wired by default; set GA4_MEASUREMENT_ID + GA4_API_SECRET to enable.
"""
from __future__ import annotations

import logging
import os
from typing import Any

import requests

logger = logging.getLogger("tripoint.ga4_mp")

_DEFAULT_CLIENT_ID = "555.555.5555"
_MAX_PARAM_STR = 500


def ga4_mp_is_configured() -> bool:
    mid = (os.getenv("GA4_MEASUREMENT_ID") or "").strip()
    secret = (os.getenv("GA4_API_SECRET") or "").strip()
    return bool(mid and secret)


def send_measurement_event(
    name: str,
    params: dict[str, Any] | None = None,
    *,
    client_id: str | None = None,
) -> bool:
    """
    POST a single event to GA4 Measurement Protocol.
    Returns True on HTTP 204/200.
    """
    mid = (os.getenv("GA4_MEASUREMENT_ID") or "").strip()
    secret = (os.getenv("GA4_API_SECRET") or "").strip()
    if not mid or not secret:
        logger.debug("GA4 MP skipped: GA4_MEASUREMENT_ID or GA4_API_SECRET not set")
        return False

    cid = client_id or _DEFAULT_CLIENT_ID
    body: dict[str, Any] = {
        "client_id": cid,
        "non_personalized_ads": True,
        "events": [{"name": name, "params": params or {}}],
    }
    url = f"https://www.google-analytics.com/mp/collect?measurement_id={mid}&api_secret={secret}"
    try:
        r = requests.post(url, json=body, timeout=10)
        if r.status_code in (200, 204):
            return True
        logger.warning("GA4 MP unexpected status %s: %s", r.status_code, r.text[:500])
        return False
    except Exception as e:
        logger.exception("GA4 MP request failed: %s", e)
        return False


def _s(v: Any, max_len: int = _MAX_PARAM_STR) -> str:
    t = str(v or "").strip()
    return t[:max_len] if len(t) > max_len else t


def _parse_float(v: Any) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def build_lead_qualification_mp_params(row: dict[str, Any]) -> dict[str, Any]:
    """
    Params for admin qualification events (no PII: no notes, emails, phone, full postcodes).
    Uses snake_case names aligned with site custom dimensions where applicable.
    """
    gcv = _parse_float(row.get("google_ads_conversion_value"))
    lv = _parse_float(row.get("lead_value"))
    qualified_lead_value: float | None = gcv if gcv is not None else lv

    params: dict[str, Any] = {
        "event_id": _s(row.get("event_id"), 80),
        "journey_id": _s(row.get("journey_id"), 80),
        "lead_channel": _s(row.get("lead_channel"), 40),
        "lead_quality": _s(row.get("qualification_status"), 40),
        "disqualify_reason": _s(row.get("disqualify_reason"), 80),
        "vehicle_make": _s(row.get("vehicle_make"), 40),
        "vehicle_model": _s(row.get("vehicle_model"), 80),
        "service_interest": _s(row.get("service_interest"), 120),
        "service_category": _s(row.get("service_category"), 80),
        "service_name": _s(row.get("service_name"), 120),
        "page_type": _s(row.get("page_type"), 80),
        "page": _s(row.get("page"), _MAX_PARAM_STR),
        "google_ads_identifier_type": _s(row.get("google_ads_identifier_type"), 40),
        "google_ads_identifier_value": _s(row.get("google_ads_identifier_value"), 200),
    }
    if lv is not None:
        params["lead_value"] = lv
    if qualified_lead_value is not None:
        params["qualified_lead_value"] = qualified_lead_value
    return params


def qualification_event_name_for_transition(old_status: str, new_status: str) -> str | None:
    """If new_status transitions into a terminal qualification, return MP event name."""
    o = (old_status or "").strip().lower()
    n = (new_status or "").strip().lower()
    if o == n:
        return None
    if n not in ("qualified", "disqualified", "won"):
        return None
    return {"qualified": "lead_qualified", "disqualified": "lead_disqualified", "won": "lead_won"}[n]


def send_admin_qualification_ga4(event_name: str, row: dict[str, Any]) -> tuple[bool, str | None]:
    """
    Send a qualification event via Measurement Protocol.
    Returns (success, reason_if_not_success).
    reason: None on HTTP success; 'ga4_not_configured' if env missing;
    'measurement_protocol_failed' if request failed (see logs).
    """
    if not ga4_mp_is_configured():
        logger.info(
            "GA4 MP not configured (GA4_MEASUREMENT_ID / GA4_API_SECRET); skipping event=%s event_id=%s",
            event_name,
            _s(row.get("event_id"), 40),
        )
        return False, "ga4_not_configured"

    params = build_lead_qualification_mp_params(row)
    cid_raw = str(row.get("ga_client_id") or "").strip()
    client_id = cid_raw if cid_raw else None

    ok = send_measurement_event(event_name, params, client_id=client_id)
    if ok:
        logger.info("GA4 MP qualification event sent: %s event_id=%s", event_name, _s(row.get("event_id"), 40))
        return True, None

    logger.warning(
        "GA4 MP qualification event failed: %s event_id=%s (sheet update already saved)",
        event_name,
        _s(row.get("event_id"), 40),
    )
    return False, "measurement_protocol_failed"
