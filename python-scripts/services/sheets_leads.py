"""
Google Sheets lead tracking: append + admin read/update (API v4).
Requires service account with Editor access to the spreadsheet.
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

from lead_constants import (
    DISQUALIFY_REASON_OPTIONS,
    EXPORT_LOG_COLUMNS,
    EXPORT_LOG_TAB,
    LEADS_COLUMNS,
    QUALIFICATION_STATUS_OPTIONS,
    VEHICLE_MAKE_OPTIONS,
)

logger = logging.getLogger("tripoint.sheets_leads")

SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

# Re-export for callers that imported LEADS_COLUMNS from here historically
__all__ = [
    "LEADS_COLUMNS",
    "append_lead_row",
    "try_append_lead_row",
    "get_spreadsheet_config",
    "read_all_lead_rows",
    "get_header_map",
    "ensure_leads_headers",
    "update_row_by_event_id",
    "bulk_update_rows_by_event_ids",
    "read_rows_by_journey_id",
    "apply_leads_sheet_formatting",
    "append_export_log_row",
    "write_export_tab",
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


def get_spreadsheet_config() -> tuple[str, str]:
    spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    tab = os.getenv("GOOGLE_SHEETS_LEADS_TAB", "Leads").strip() or "Leads"
    return spreadsheet_id, tab


def _quote_sheet(title: str) -> str:
    if re.search(r"[^A-Za-z0-9_]", title):
        return "'" + title.replace("'", "''") + "'"
    return title


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


def _ensure_column_capacity(service: Any, spreadsheet_id: str, tab: str, min_columns: int) -> None:
    """
    Grow the sheet grid so the API allows writes up to min_columns columns (1-based width).
    Without this, values.update to e.g. AY1 fails with "exceeds grid limits" when the tab
    was created or resized to fewer columns than LEADS_COLUMNS.
    """
    if min_columns <= 0:
        return
    meta = (
        service.spreadsheets()
        .get(
            spreadsheetId=spreadsheet_id,
            fields="sheets(properties(sheetId,title,gridProperties(columnCount)))",
        )
        .execute()
    )
    sheet_id: int | None = None
    current = 0
    for s in meta.get("sheets", []):
        props = s.get("properties") or {}
        if (props.get("title") or "") != tab:
            continue
        sheet_id = props.get("sheetId")
        grid = props.get("gridProperties") or {}
        current = int(grid.get("columnCount") or 0)
        break
    if sheet_id is None:
        return
    if current >= min_columns:
        return
    need = min_columns - current
    service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={
            "requests": [
                {
                    "appendDimension": {
                        "sheetId": sheet_id,
                        "dimension": "COLUMNS",
                        "length": need,
                    }
                }
            ]
        },
    ).execute()
    logger.info("Expanded sheet %r column grid: %s -> %s", tab, current, current + need)


def _col_index_to_a1(col_idx: int) -> str:
    """0-based column index to A1 letters."""
    n = col_idx + 1
    letters = ""
    while n:
        n, r = divmod(n - 1, 26)
        letters = chr(65 + r) + letters
    return letters


def _row_from_payload(payload: dict[str, Any]) -> list[Any]:
    def g(key: str) -> Any:
        v = payload.get(key)
        if v is None:
            return ""
        if isinstance(v, bool):
            return "true" if v else "false"
        return v

    return [g(c) for c in LEADS_COLUMNS]


def get_header_map(service: Any, spreadsheet_id: str, tab: str) -> dict[str, int]:
    """Map header name -> 0-based column index."""
    qtab = _quote_sheet(tab)
    rng = f"{qtab}!1:1"
    existing = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range=rng).execute()
    vals = existing.get("values") or []
    if not vals or not vals[0]:
        return {}
    row = vals[0]
    return {str(h).strip(): i for i, h in enumerate(row) if str(h).strip()}


def ensure_leads_headers(service: Any, spreadsheet_id: str, tab: str) -> dict[str, int]:
    """
    Ensure row 1 contains all LEADS_COLUMNS in order; append missing names to the right.
    Returns header name -> column index.
    """
    _ensure_sheet_exists(spreadsheet_id, tab, service)
    qtab = _quote_sheet(tab)
    full = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"{qtab}!1:1")
        .execute()
        .get("values")
        or [[]]
    )[0]
    names_in_order = [str(c).strip() for c in full]
    if not names_in_order or not names_in_order[0]:
        _ensure_column_capacity(service, spreadsheet_id, tab, len(LEADS_COLUMNS))
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"{qtab}!A1",
            valueInputOption="RAW",
            body={"values": [LEADS_COLUMNS]},
        ).execute()
        return {name: i for i, name in enumerate(LEADS_COLUMNS)}

    missing = [c for c in LEADS_COLUMNS if c not in names_in_order]
    if not missing:
        return {n: i for i, n in enumerate(names_in_order) if n}

    required = max(len(LEADS_COLUMNS), len(names_in_order) + len(missing))
    _ensure_column_capacity(service, spreadsheet_id, tab, required)

    start_col = len(names_in_order)
    end_col = start_col + len(missing) - 1
    start_l = _col_index_to_a1(start_col)
    end_l = _col_index_to_a1(end_col)
    range_a1 = f"{qtab}!{start_l}1:{end_l}1"
    service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=range_a1,
        valueInputOption="RAW",
        body={"values": [missing]},
    ).execute()
    return get_header_map(service, spreadsheet_id, tab)


def read_all_lead_rows(service: Any, spreadsheet_id: str, tab: str) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """Read all data rows (2+) as dicts keyed by header name."""
    header_map = ensure_leads_headers(service, spreadsheet_id, tab)
    if not header_map:
        return [], {}
    qtab = _quote_sheet(tab)
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"{qtab}!A2:ZZ50000")
        .execute()
    )
    rows = result.get("values") or []
    idx_to_name: dict[int, str] = {}
    for name, idx in header_map.items():
        idx_to_name[idx] = name
    max_col = max(header_map.values()) if header_map else 0
    out: list[dict[str, Any]] = []
    for raw in rows:
        if not raw or not any(str(c).strip() for c in raw):
            continue
        d: dict[str, Any] = {}
        for i in range(max_col + 1):
            name = idx_to_name.get(i)
            if not name:
                continue
            val = raw[i] if i < len(raw) else ""
            d[name] = val
        eid = str(d.get("event_id") or "").strip()
        if eid:
            out.append(d)
    return out, header_map


def _find_row_number_for_event(
    service: Any, spreadsheet_id: str, tab: str, header_map: dict[str, int], event_id: str
) -> int | None:
    """1-based sheet row number, or None."""
    if "event_id" not in header_map:
        return None
    col = header_map["event_id"]
    col_letter = _col_index_to_a1(col)
    qtab = _quote_sheet(tab)
    # Read event_id column from row 2 down
    rng = f"{qtab}!{col_letter}2:{col_letter}50000"
    result = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range=rng).execute()
    vals = result.get("values") or []
    for i, row in enumerate(vals):
        if row and str(row[0]).strip() == event_id:
            return i + 2  # 1-based, data starts row 2
    return None


def update_row_by_event_id(
    service: Any,
    spreadsheet_id: str,
    tab: str,
    event_id: str,
    updates: dict[str, Any],
) -> bool:
    header_map = ensure_leads_headers(service, spreadsheet_id, tab)
    row_num = _find_row_number_for_event(service, spreadsheet_id, tab, header_map, event_id)
    if row_num is None:
        return False
    qtab = _quote_sheet(tab)
    for key, val in updates.items():
        if key not in header_map:
            continue
        col_idx = header_map[key]
        col_letter = _col_index_to_a1(col_idx)
        cell = f"{qtab}!{col_letter}{row_num}"
        if val is None:
            val = ""
        elif isinstance(val, bool):
            val = "true" if val else "false"
        elif isinstance(val, float):
            val = val
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=cell,
            valueInputOption="USER_ENTERED",
            body={"values": [[val]]},
        ).execute()
    return True


def bulk_update_rows_by_event_ids(
    service: Any,
    spreadsheet_id: str,
    tab: str,
    event_ids: list[str],
    updates: dict[str, Any],
) -> dict[str, Any]:
    header_map = ensure_leads_headers(service, spreadsheet_id, tab)
    updated = 0
    missing: list[str] = []
    for eid in event_ids:
        ok = update_row_by_event_id(service, spreadsheet_id, tab, eid, updates)
        if ok:
            updated += 1
        else:
            missing.append(eid)
    return {"updated": updated, "missing_event_ids": missing}


def read_rows_by_journey_id(
    service: Any, spreadsheet_id: str, tab: str, journey_id: str
) -> list[dict[str, Any]]:
    rows, _ = read_all_lead_rows(service, spreadsheet_id, tab)
    return [r for r in rows if str(r.get("journey_id") or "").strip() == journey_id]


def append_lead_row(payload: dict[str, Any]) -> None:
    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        raise RuntimeError("GOOGLE_SHEETS_SPREADSHEET_ID is not set.")

    service = _get_sheets_service()
    _ensure_sheet_exists(spreadsheet_id, tab, service)
    ensure_leads_headers(service, spreadsheet_id, tab)

    rng = f"{_quote_sheet(tab)}!1:1"
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
            range=f"{_quote_sheet(tab)}!A1",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [LEADS_COLUMNS]},
        ).execute()

    data_row = _row_from_payload(payload)
    service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=f"{_quote_sheet(tab)}!A1",
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


def _get_sheet_id(service: Any, spreadsheet_id: str, title: str) -> int | None:
    meta = service.spreadsheets().get(spreadsheetId=spreadsheet_id, fields="sheets(properties(sheetId,title))").execute()
    for s in meta.get("sheets", []):
        props = s.get("properties") or {}
        if (props.get("title") or "") == title:
            return int(props.get("sheetId", 0))
    return None


def apply_leads_sheet_formatting(service: Any, spreadsheet_id: str, tab: str) -> None:
    """Freeze header, bold row 1, dropdown validations on key columns. Idempotent."""
    _ensure_sheet_exists(spreadsheet_id, tab, service)
    ensure_leads_headers(service, spreadsheet_id, tab)
    header_map = get_header_map(service, spreadsheet_id, tab)
    sheet_id = _get_sheet_id(service, spreadsheet_id, tab)
    if sheet_id is None:
        return

    requests: list[dict[str, Any]] = []

    requests.append(
        {
            "updateSheetProperties": {
                "properties": {
                    "sheetId": sheet_id,
                    "gridProperties": {"frozenRowCount": 1},
                },
                "fields": "gridProperties.frozenRowCount",
            }
        }
    )

    requests.append(
        {
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": 0,
                    "endRowIndex": 1,
                    "startColumnIndex": 0,
                    "endColumnIndex": max(header_map.values()) + 1 if header_map else 1,
                },
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True},
                        "backgroundColor": {"red": 0.9, "green": 0.93, "blue": 0.98},
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor)",
            }
        }
    )

    def dv_for_col(col_name: str, allowed: list[str]) -> None:
        idx = header_map.get(col_name)
        if idx is None:
            return
        requests.append(
            {
                "setDataValidation": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": 1,
                        "endRowIndex": 50000,
                        "startColumnIndex": idx,
                        "endColumnIndex": idx + 1,
                    },
                    "rule": {
                        "condition": {
                            "type": "ONE_OF_LIST",
                            "values": [{"userEnteredValue": a} for a in allowed],
                        },
                        "showCustomUi": True,
                        "strict": col_name == "qualification_status",
                    },
                }
            }
        )

    dv_for_col("qualification_status", QUALIFICATION_STATUS_OPTIONS)
    dv_for_col("disqualify_reason", DISQUALIFY_REASON_OPTIONS)
    dv_for_col("vehicle_make", VEHICLE_MAKE_OPTIONS)

    if requests:
        service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body={"requests": requests}).execute()

    # Auto-resize first row of columns (best effort)
    try:
        end_idx = max(header_map.values()) + 1 if header_map else 1
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={
                "requests": [
                    {
                        "autoResizeDimensions": {
                            "dimensions": {
                                "sheetId": sheet_id,
                                "dimension": "COLUMNS",
                                "startIndex": 0,
                                "endIndex": min(end_idx, 50),
                            }
                        }
                    }
                ]
            },
        ).execute()
    except Exception as e:
        logger.warning("autoResizeDimensions skipped: %s", e)


def append_export_log_row(
    service: Any, spreadsheet_id: str, row: list[Any]
) -> None:
    _ensure_sheet_exists(spreadsheet_id, EXPORT_LOG_TAB, service)
    q = _quote_sheet(EXPORT_LOG_TAB)
    rng = f"{q}!1:1"
    existing = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range=rng).execute()
    vals = existing.get("values") or []
    if not vals or not vals[0] or not str(vals[0][0]).strip():
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"{q}!A1",
            valueInputOption="RAW",
            body={"values": [EXPORT_LOG_COLUMNS]},
        ).execute()
    service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=f"{q}!A1",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": [row]},
    ).execute()


def write_export_tab(
    service: Any,
    spreadsheet_id: str,
    tab_name: str,
    headers: list[str],
    data_rows: list[list[Any]],
) -> None:
    _ensure_sheet_exists(spreadsheet_id, tab_name, service)
    q = _quote_sheet(tab_name)
    body_rows = [headers] + data_rows
    try:
        service.spreadsheets().values().clear(spreadsheetId=spreadsheet_id, range=f"{q}!A:ZZ").execute()
    except Exception as e:
        logger.warning("clear export tab: %s", e)
    service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=f"{q}!A1",
        valueInputOption="USER_ENTERED",
        body={"values": body_rows},
    ).execute()
