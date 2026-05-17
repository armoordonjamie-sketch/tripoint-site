"""Google Search Console Search Analytics via OAuth2 (installed app)."""

from __future__ import annotations

import json
import logging
import os
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from config import CAMPAIGN_VOCABULARY

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]


def _script_dir() -> Path:
    return Path(__file__).resolve().parent


def _token_path() -> Path:
    return _script_dir() / "gsc_token.json"


def _client_config_from_env() -> dict[str, Any]:
    cid = os.environ.get("google_client_id", "").strip()
    secret = os.environ.get("google_client_id_secret", "").strip()
    if not cid or not secret:
        raise RuntimeError(
            "Missing google_client_id or google_client_id_secret in environment / .env"
        )
    return {
        "installed": {
            "client_id": cid,
            "client_secret": secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"],
        }
    }


def get_gsc_credentials() -> Credentials:
    """Load or refresh OAuth token; run browser flow on first use."""
    token_file = _token_path()
    creds: Credentials | None = None
    if token_file.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
        except (ValueError, json.JSONDecodeError):
            creds = None
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        token_file.write_text(creds.to_json(), encoding="utf-8")
        return creds
    flow = InstalledAppFlow.from_client_config(_client_config_from_env(), SCOPES)
    creds = flow.run_local_server(port=0)
    token_file.write_text(creds.to_json(), encoding="utf-8")
    logger.info("Saved Search Console OAuth token to %s", token_file)
    return creds


def fetch_search_console_queries(
    site_url: str,
    settings: Any,
    days_back: int = 90,
    end_lag_days: int = 3,
) -> list[dict[str, Any]]:
    """
    Pull query + page rows from Search Analytics.

    Optional filter: page URL contains /services/ (dimension filter).
    """
    if not site_url or not str(site_url).strip():
        raise RuntimeError("SEARCH_CONSOLE_SITE_URL is not set")
    site = str(site_url).strip()
    end = date.today() - timedelta(days=end_lag_days)
    start = end - timedelta(days=days_back)
    body: dict[str, Any] = {
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "dimensions": ["query", "page"],
        "rowLimit": min(5000, getattr(settings, "gsc_row_limit", 5000)),
    }
    if getattr(settings, "gsc_filter_services_pages_only", True):
        body["dimensionFilterGroups"] = [
            {
                "filters": [
                    {
                        "dimension": "page",
                        "operator": "contains",
                        "expression": "/services/",
                    }
                ]
            }
        ]
    creds = get_gsc_credentials()
    service = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
    resp = service.searchanalytics().query(siteUrl=site, body=body).execute()
    rows = resp.get("rows") or []
    out: list[dict[str, Any]] = []
    for r in rows:
        if not isinstance(r, dict):
            continue
        keys = r.get("keys")
        if not isinstance(keys, list) or len(keys) < 2:
            continue
        q, page = keys[0], keys[1]
        out.append(
            {
                "query": str(q).strip(),
                "page": str(page).strip(),
                "clicks": int(r.get("clicks", 0) or 0),
                "impressions": int(r.get("impressions", 0) or 0),
                "ctr": float(r.get("ctr", 0) or 0),
                "position": float(r.get("position", 0) or 0),
            }
        )
    return out


def match_gsc_row_to_family(
    query_normalized: str,
    families: list[str] | None = None,
) -> str:
    """Pick campaign family with best vocabulary overlap on normalized query."""
    if families is None:
        families = list(CAMPAIGN_VOCABULARY.keys())
    best_fam = families[0] if families else "Diagnostics & VOR"
    best_score = -1
    for fam in families:
        vocab = CAMPAIGN_VOCABULARY.get(fam, [])
        score = sum(1 for t in vocab if t.lower() in query_normalized)
        if score > best_score:
            best_score = score
            best_fam = fam
    return best_fam


def match_gsc_to_seeds(
    gsc_rows: list[dict[str, Any]],
    seed_families: list[str] | None = None,
) -> list[dict[str, Any]]:
    """Copy each GSC row and set inferred_campaign_family from vocabulary overlap."""
    families = seed_families or list(CAMPAIGN_VOCABULARY.keys())
    out: list[dict[str, Any]] = []
    for r in gsc_rows:
        q = str(r.get("query", "")).strip().lower()
        nq = " ".join(q.split())
        fam = match_gsc_row_to_family(nq, families)
        row = dict(r)
        row["inferred_campaign_family"] = fam
        out.append(row)
    return out
