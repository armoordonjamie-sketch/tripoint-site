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

    cid = client_id or "555.555.5555"
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
