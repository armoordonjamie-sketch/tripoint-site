"""
GA4 Measurement Protocol — optional server-side events (e.g. lead_qualified).
Not wired by default; set GA4_MEASUREMENT_ID + GA4_API_SECRET to enable.

Requires ga_client_id and ga_session_id on the lead row (from web capture) for
session linkage and Realtime visibility.
"""
from __future__ import annotations

import json
import logging
import os
import time
from typing import Any

import requests

logger = logging.getLogger("tripoint.ga4_mp")

_MAX_PARAM_STR = 500
_MP_COLLECT = "https://www.google-analytics.com/mp/collect"
_MP_DEBUG = "https://www.google-analytics.com/debug/mp/collect"


def ga4_mp_is_configured() -> bool:
    mid = (os.getenv("GA4_MEASUREMENT_ID") or "").strip()
    secret = (os.getenv("GA4_API_SECRET") or "").strip()
    return bool(mid and secret)


def _mp_debug_enabled() -> bool:
    return (os.getenv("GA4_MP_DEBUG") or "").strip().lower() in ("1", "true", "yes")


def send_measurement_event(
    name: str,
    params: dict[str, Any] | None = None,
    *,
    client_id: str,
    validate_only: bool = False,
) -> tuple[bool, str | None, list[str]]:
    """
    POST a single event to GA4 Measurement Protocol.
    client_id is required (no synthetic fallback).

    If GA4_MP_DEBUG=1, also POSTs to /debug/mp/collect and logs validationMessages
    (2xx on production collect does not guarantee GA4 accepted the hit).

    Returns (success, failure_reason_or_none, validation_messages_from_debug).
    """
    mid = (os.getenv("GA4_MEASUREMENT_ID") or "").strip()
    secret = (os.getenv("GA4_API_SECRET") or "").strip()
    if not mid or not secret:
        logger.debug("GA4 MP skipped: GA4_MEASUREMENT_ID or GA4_API_SECRET not set")
        return False, "ga4_not_configured", []

    ts_micros = str(int(time.time() * 1_000_000))
    body: dict[str, Any] = {
        "client_id": client_id,
        "timestamp_micros": ts_micros,
        "non_personalized_ads": True,
        "events": [{"name": name, "params": params or {}}],
    }

    validation_messages: list[str] = []

    def _parse_debug_messages(text: str) -> None:
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            return
        for vm in data.get("validationMessages") or []:
            if isinstance(vm, dict):
                desc = str(vm.get("description") or vm.get("fieldPath") or vm)
            else:
                desc = str(vm)
            if desc:
                validation_messages.append(desc)

    base = _MP_DEBUG if validate_only else _MP_COLLECT
    url = f"{base}?measurement_id={mid}&api_secret={secret}"

    if _mp_debug_enabled() and not validate_only:
        try:
            dr = requests.post(_MP_DEBUG, json=body, timeout=10)
            _parse_debug_messages(dr.text or "")
            if validation_messages:
                logger.info(
                    "GA4 MP debug validation (event=%s): %s",
                    name,
                    validation_messages,
                )
            elif dr.status_code not in (200, 204):
                logger.warning("GA4 MP debug unexpected status %s: %s", dr.status_code, (dr.text or "")[:500])
        except Exception as e:
            logger.warning("GA4 MP debug request failed: %s", e)

    try:
        r = requests.post(url, json=body, timeout=10)
        if validate_only:
            _parse_debug_messages(r.text or "")
            ok = r.status_code in (200, 204)
            return ok, None if ok else "debug_validation_failed", validation_messages

        if r.status_code in (200, 204):
            return True, None, validation_messages
        logger.warning("GA4 MP unexpected status %s: %s", r.status_code, (r.text or "")[:500])
        return False, "measurement_protocol_failed", validation_messages
    except Exception as e:
        logger.exception("GA4 MP request failed: %s", e)
        return False, "measurement_protocol_failed", validation_messages


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

    sid_raw = str(row.get("ga_session_id") or "").strip()
    session_id_param: int | str
    if sid_raw.isdigit():
        session_id_param = int(sid_raw)
    else:
        session_id_param = sid_raw

    params: dict[str, Any] = {
        "session_id": session_id_param,
        "engagement_time_msec": 1,
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


def send_admin_qualification_ga4(event_name: str, row: dict[str, Any]) -> dict[str, Any]:
    """
    Send a qualification event via Measurement Protocol.
    Returns dict with attempted, sent, skipped_reason, validation_messages.
    """
    event_id = _s(row.get("event_id"), 40)
    empty: dict[str, Any] = {
        "attempted": False,
        "sent": False,
        "skipped_reason": None,
        "validation_messages": [],
    }

    if not ga4_mp_is_configured():
        logger.warning(
            "GA4 MP not configured — set GA4_MEASUREMENT_ID and GA4_API_SECRET in python-scripts/.env "
            "(GA4 Admin > Data stream > Measurement Protocol API secrets). Skipping event=%s event_id=%s",
            event_name,
            event_id,
        )
        return {**empty, "skipped_reason": "ga4_not_configured"}

    cid_raw = str(row.get("ga_client_id") or "").strip()
    if not cid_raw:
        logger.info("GA4 MP skipped: missing_ga_client_id event_id=%s", event_id)
        return {
            "attempted": True,
            "sent": False,
            "skipped_reason": "missing_ga_client_id",
            "validation_messages": [],
        }

    sid_raw = str(row.get("ga_session_id") or "").strip()
    if not sid_raw:
        logger.info(
            "GA4 MP skipped: missing_ga_session_id event_id=%s (required for Realtime / session linkage)",
            event_id,
        )
        return {
            "attempted": True,
            "sent": False,
            "skipped_reason": "missing_ga_session_id",
            "validation_messages": [],
        }

    params = build_lead_qualification_mp_params(row)
    ok, err, val_msgs = send_measurement_event(event_name, params, client_id=cid_raw)
    if ok:
        logger.info("GA4 MP qualification event sent: %s event_id=%s", event_name, event_id)
        return {
            "attempted": True,
            "sent": True,
            "skipped_reason": None,
            "validation_messages": val_msgs,
        }

    logger.warning(
        "GA4 MP qualification event failed: %s event_id=%s reason=%s (sheet update already saved)",
        event_name,
        event_id,
        err,
    )
    return {
        "attempted": True,
        "sent": False,
        "skipped_reason": err or "measurement_protocol_failed",
        "validation_messages": val_msgs,
    }
