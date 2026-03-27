"""
Append lead tracking rows to Google Sheets (API v4).
Requires service account with Editor access to the spreadsheet.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger("tripoint.sheets_leads")

SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

LEADS_COLUMNS: list[str] = [
    "journey_id",
    "event_id",
    "occurred_at",
    "event_name",
    "lead_channel",
    "click_location",
    "nav_label",
    "nav_target",
    "contact_method",
    "lead_type",
    "form_name",
    "service_interest",
    "payment_completed",
    "page",
    "title",
    "page_type",
    "service_category",
    "service_name",
    "area_slug",
    "booking_step",
    "zone_result",
    "content_type",
    "content_id",
    "lead_value",
    "gclid",
    "gbraid",
    "wbraid",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "qualification_status",
    "disqualify_reason",
    "vehicle_make",
    "vehicle_model",
    "notes",
]


def _build_credentials():
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            "Google Sheets dependencies missing. Install google-api-python-client and google-auth."
        ) from e

    json_raw = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    path = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if json_raw:
        info = json.loads(json_raw)
        creds = service_account.Credentials.from_service_account_info(info, scopes=[SHEETS_SCOPE])
        return creds, build
    if path:
        creds = service_account.Credentials.from_service_account_file(path, scopes=[SHEETS_SCOPE])
        return creds, build
    raise RuntimeError(
        "Sheets credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or "
        "GOOGLE_SERVICE_ACCOUNT_FILE / GOOGLE_APPLICATION_CREDENTIALS."
    )


def _get_sheets_service():
    creds, build = _build_credentials()
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def _ensure_sheet_exists(spreadsheet_id: str, title: str, service: Any) -> None:
    meta = service.spreadsheets().get(spreadsheetId=spreadsheet_id, fields="sheets(properties(sheetId,title))").execute()
    for s in meta.get("sheets", []):
        props = s.get("properties") or {}
        if (props.get("title") or "") == title:
            return
    service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": [{"addSheet": {"properties": {"title": title}}}]},
    ).execute()


def _row_from_payload(payload: dict[str, Any]) -> list[Any]:
    def g(key: str) -> Any:
        v = payload.get(key)
        if v is None:
            return ""
        if isinstance(v, bool):
            return "true" if v else "false"
        return v

    return [g(c) for c in LEADS_COLUMNS]


def append_lead_row(payload: dict[str, Any]) -> None:
    spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    tab = os.getenv("GOOGLE_SHEETS_LEADS_TAB", "Leads").strip() or "Leads"
    if not spreadsheet_id:
        raise RuntimeError("GOOGLE_SHEETS_SPREADSHEET_ID is not set.")

    service = _get_sheets_service()
    _ensure_sheet_exists(spreadsheet_id, tab, service)

    rng = f"{tab}!1:1"
    existing = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=rng)
        .execute()
    )
    vals = existing.get("values") or []
    if not vals or not vals[0] or not str(vals[0][0]).strip():
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=f"{tab}!A1",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [LEADS_COLUMNS]},
        ).execute()

    data_row = _row_from_payload(payload)
    service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=f"{tab}!A1",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": [data_row]},
    ).execute()
    logger.info(
        "Sheets append ok: event_id=%s event_name=%s",
        payload.get("event_id"),
        payload.get("event_name"),
    )


def try_append_lead_row(payload: dict[str, Any]) -> tuple[bool, str | None]:
    try:
        append_lead_row(payload)
        return True, None
    except Exception as e:
        logger.exception("Sheets append failed: %s", e)
        return False, str(e)
