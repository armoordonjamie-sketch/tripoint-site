"""
GA4 Measurement Protocol — optional server-side events (e.g. lead_qualified).
Not wired by default; set GA4_MEASUREMENT_ID + GA4_API_SECRET to enable.

Requires ga_client_id on the lead row. ga_session_id is required for MP sends
(policy: skip when absent so Realtime / DebugView can attach to the web session).
"""
from __future__ import annotations

import json
import logging
import os
import time
from typing import Any
from urllib.parse import urlencode, urlparse

import requests

logger = logging.getLogger("tripoint.ga4_mp")

_MAX_PARAM_STR = 500
_MAX_DEBUG_BODY_LOG = 800
_MP_COLLECT = "https://www.google-analytics.com/mp/collect"
_MP_DEBUG = "https://www.google-analytics.com/debug/mp/collect"


def ga4_mp_is_configured() -> bool:
    mid = (os.getenv("GA4_MEASUREMENT_ID") or "").strip()
    secret = (os.getenv("GA4_API_SECRET") or "").strip()
    return bool(mid and secret)


def _mp_debug_enabled() -> bool:
    return (os.getenv("GA4_MP_DEBUG") or "").strip().lower() in ("1", "true", "yes")


def build_ga4_mp_payload(
    *,
    client_id: str,
    event_name: str,
    event_params: dict[str, Any] | None = None,
    timestamp_micros: int | None = None,
) -> dict[str, Any]:
    """Canonical JSON body for GA4 Measurement Protocol (single event)."""
    ts = int(time.time() * 1_000_000) if timestamp_micros is None else int(timestamp_micros)
    return {
        "client_id": client_id,
        "timestamp_micros": str(ts),
        "non_personalized_ads": True,
        "events": [{"name": event_name, "params": dict(event_params or {})}],
    }


def build_ga4_mp_url(base: str, measurement_id: str, api_secret: str) -> str:
    """POST target with query params only (measurement_id, api_secret); values URL-encoded."""
    q = urlencode(
        {
            "measurement_id": measurement_id.strip(),
            "api_secret": api_secret.strip(),
        }
    )
    return f"{base.rstrip('/')}?{q}"


def parse_ga4_debug_validation_messages(text: str) -> tuple[list[str], bool]:
    """
    Parse debug/mp/collect JSON body.
    Returns (messages, parsed_as_json_object).
    """
    raw = (text or "").strip()
    if not raw:
        return [], False
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return [], False
    if not isinstance(data, dict):
        return [], True
    out: list[str] = []
    for vm in data.get("validationMessages") or []:
        if isinstance(vm, dict):
            desc = str(vm.get("description") or vm.get("fieldPath") or vm)
        else:
            desc = str(vm)
        if desc:
            out.append(desc)
    return out, True


def _log_malformed_debug_response(
    *,
    url_for_path_only: str,
    status_code: int,
    response_text: str,
    had_query_params: bool,
    json_body_sent: bool,
) -> None:
    """Log non-JSON or unexpected debug responses; never log secrets (path has no query)."""
    path = urlparse(url_for_path_only).path or url_for_path_only
    preview = (response_text or "")[:_MAX_DEBUG_BODY_LOG]
    logger.warning(
        "GA4 MP debug response not usable JSON: status=%s endpoint_path=%s "
        "query_params_on_request=%s json_body_sent=%s body_truncated=%r",
        status_code,
        path,
        had_query_params,
        json_body_sent,
        preview,
    )


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

    Uses one canonical payload (build_ga4_mp_payload) for both:
    - https://www.google-analytics.com/mp/collect
    - https://www.google-analytics.com/debug/mp/collect

    POST, query params measurement_id + api_secret, Content-Type application/json, JSON body.

    If GA4_MP_DEBUG=1, also POSTs to debug/mp/collect before collect and logs validationMessages.

    Returns (success, failure_reason_or_none, validation_messages_from_debug).
    """
    mid = (os.getenv("GA4_MEASUREMENT_ID") or "").strip()
    secret = (os.getenv("GA4_API_SECRET") or "").strip()
    if not mid or not secret:
        logger.debug("GA4 MP skipped: GA4_MEASUREMENT_ID or GA4_API_SECRET not set")
        return False, "ga4_not_configured", []

    body = build_ga4_mp_payload(client_id=client_id, event_name=name, event_params=params)
    collect_url = build_ga4_mp_url(_MP_COLLECT, mid, secret)
    debug_url = build_ga4_mp_url(_MP_DEBUG, mid, secret)
    headers = {"Content-Type": "application/json"}

    validation_messages: list[str] = []

    def run_debug_hit() -> requests.Response:
        return requests.post(debug_url, json=body, headers=headers, timeout=10)

    if _mp_debug_enabled() and not validate_only:
        try:
            dr = run_debug_hit()
            msgs, json_ok = parse_ga4_debug_validation_messages(dr.text or "")
            validation_messages.extend(msgs)
            if not json_ok:
                _log_malformed_debug_response(
                    url_for_path_only=debug_url,
                    status_code=dr.status_code,
                    response_text=dr.text or "",
                    had_query_params=True,
                    json_body_sent=True,
                )
            elif dr.status_code not in (200, 204):
                logger.warning(
                    "GA4 MP debug unexpected HTTP status %s: body_truncated=%r",
                    dr.status_code,
                    (dr.text or "")[:_MAX_DEBUG_BODY_LOG],
                )
            logger.info(
                "GA4 MP debug validation (event=%s): messages=%s",
                name,
                validation_messages if validation_messages else [],
            )
        except Exception as e:
            logger.warning("GA4 MP debug request failed: %s", e)

    try:
        if validate_only:
            r = run_debug_hit()
            msgs, json_ok = parse_ga4_debug_validation_messages(r.text or "")
            validation_messages = msgs
            logger.info(
                "GA4 MP debug validation (validate_only event=%s): messages=%s",
                name,
                validation_messages if validation_messages else [],
            )
            if not json_ok:
                _log_malformed_debug_response(
                    url_for_path_only=debug_url,
                    status_code=r.status_code,
                    response_text=r.text or "",
                    had_query_params=True,
                    json_body_sent=True,
                )
                return False, "debug_validation_failed", validation_messages
            if r.status_code not in (200, 204):
                logger.warning(
                    "GA4 MP debug validate_only unexpected status %s: body_truncated=%r",
                    r.status_code,
                    (r.text or "")[:_MAX_DEBUG_BODY_LOG],
                )
                return False, "debug_validation_failed", validation_messages
            if validation_messages:
                return False, "debug_validation_failed", validation_messages
            return True, None, validation_messages

        r = requests.post(collect_url, json=body, headers=headers, timeout=10)
        if r.status_code in (200, 204):
            return True, None, validation_messages
        logger.warning("GA4 MP unexpected status %s: %s", r.status_code, (r.text or "")[:_MAX_DEBUG_BODY_LOG])
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
    Returns dict with attempted, sent, skipped_reason, validation_messages, session_id_policy.
    """
    event_id = _s(row.get("event_id"), 40)

    def pack(
        *,
        attempted: bool,
        sent: bool,
        skipped_reason: str | None,
        validation_messages: list[str],
        session_id_policy: str | None,
    ) -> dict[str, Any]:
        return {
            "attempted": attempted,
            "sent": sent,
            "skipped_reason": skipped_reason,
            "validation_messages": validation_messages,
            "session_id_policy": session_id_policy,
        }

    if not ga4_mp_is_configured():
        logger.warning(
            "GA4 MP not configured — set GA4_MEASUREMENT_ID and GA4_API_SECRET in python-scripts/.env "
            "(GA4 Admin > Data stream > Measurement Protocol API secrets). Skipping event=%s event_id=%s",
            event_name,
            event_id,
        )
        return pack(
            attempted=False,
            sent=False,
            skipped_reason="ga4_not_configured",
            validation_messages=[],
            session_id_policy="not_applicable",
        )

    cid_raw = str(row.get("ga_client_id") or "").strip()
    if not cid_raw:
        logger.info("GA4 MP skipped: missing_ga_client_id event_id=%s", event_id)
        return pack(
            attempted=True,
            sent=False,
            skipped_reason="missing_ga_client_id",
            validation_messages=[],
            session_id_policy="not_applicable",
        )

    sid_raw = str(row.get("ga_session_id") or "").strip()
    if not sid_raw:
        logger.info(
            "GA4 MP policy: ga_session_id is required on the lead row for Realtime/DebugView session "
            "linkage; skipping send when absent. event_id=%s",
            event_id,
        )
        return pack(
            attempted=True,
            sent=False,
            skipped_reason="missing_ga_session_id",
            validation_messages=[],
            session_id_policy="required_skipped_missing_ga_session_id",
        )

    params = build_lead_qualification_mp_params(row)
    ok, err, val_msgs = send_measurement_event(event_name, params, client_id=cid_raw)
    if ok:
        logger.info("GA4 MP qualification event sent: %s event_id=%s", event_name, event_id)
        return pack(
            attempted=True,
            sent=True,
            skipped_reason=None,
            validation_messages=val_msgs,
            session_id_policy="included_in_event_params",
        )

    logger.warning(
        "GA4 MP qualification event failed: %s event_id=%s reason=%s (sheet update already saved)",
        event_name,
        event_id,
        err,
    )
    return pack(
        attempted=True,
        sent=False,
        skipped_reason=err or "measurement_protocol_failed",
        validation_messages=val_msgs,
        session_id_policy="included_in_event_params",
    )
