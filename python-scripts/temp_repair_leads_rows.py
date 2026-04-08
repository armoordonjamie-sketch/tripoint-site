#!/usr/bin/env python3
"""
One-off: detect and write back misaligned cell values on the Leads tab.

Several rows have a left-shift starting at user_agent: qualification tokens
(qualified/won/disqualified) landed in user_agent and all following values
are off by one column. repair_common_leads_sheet_misalignment fixes this
in-memory; this script writes the corrections back to the actual sheet cells.

  python temp_repair_leads_rows.py              # dry-run: list affected rows
  python temp_repair_leads_rows.py --apply      # write corrections to Sheets

Loads python-scripts/.env for credentials.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / ".env")

from lead_constants import LEADS_COLUMNS
from services.google_ads_export import repair_common_leads_sheet_misalignment
from services.sheets_leads import (
    _canonical_col_index,
    _col_index_to_a1,
    _get_sheets_service,
    _quote_sheet,
    ensure_leads_headers,
    get_spreadsheet_config,
)


def _read_raw_rows(service, spreadsheet_id: str, tab: str) -> list[dict[str, str]]:
    """Read Leads rows as dicts keyed by LEADS_COLUMNS (fixed index), no repair applied."""
    ensure_leads_headers(service, spreadsheet_id, tab)
    qtab = _quote_sheet(tab)
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"{qtab}!A2:ZZ50000")
        .execute()
    )
    raw_rows = result.get("values") or []
    out: list[dict[str, str]] = []
    for raw in raw_rows:
        if not raw or not any(str(c).strip() for c in raw):
            continue
        d: dict[str, str] = {}
        for i, name in enumerate(LEADS_COLUMNS):
            d[name] = str(raw[i]).strip() if i < len(raw) else ""
        eid = d.get("event_id", "").strip()
        if eid:
            out.append(d)
    return out


def _event_id_to_row_map(service, spreadsheet_id: str, tab: str) -> dict[str, int]:
    """Return {event_id: 1-based-row-number} for the Leads tab."""
    col_idx = _canonical_col_index("event_id")
    if col_idx is None:
        return {}
    col_letter = _col_index_to_a1(col_idx)
    qtab = _quote_sheet(tab)
    vals = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"{qtab}!{col_letter}2:{col_letter}50000")
        .execute()
        .get("values") or []
    )
    return {str(row[0]).strip(): i + 2 for i, row in enumerate(vals) if row and row[0]}


def _batch_write(service, spreadsheet_id: str, tab: str, value_ranges: list[dict]) -> None:
    """Single batchUpdate call for all value ranges (avoids per-cell rate limits)."""
    qtab = _quote_sheet(tab)
    _ = qtab  # used inside value_ranges already
    service.spreadsheets().values().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={
            "valueInputOption": "USER_ENTERED",
            "data": value_ranges,
        },
    ).execute()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write repaired Leads cell values back to Google Sheets."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write corrections to Sheets (default: dry-run).",
    )
    args = parser.parse_args()

    spreadsheet_id, source_tab = get_spreadsheet_config()
    if not spreadsheet_id:
        print("ERROR: GOOGLE_SHEETS_SPREADSHEET_ID missing in .env", file=sys.stderr)
        sys.exit(1)

    svc = _get_sheets_service()
    raw_rows = _read_raw_rows(svc, spreadsheet_id, source_tab)
    print(f"Leads rows read: {len(raw_rows)}")

    affected: list[tuple[str, dict[str, str]]] = []
    for raw in raw_rows:
        fixed = repair_common_leads_sheet_misalignment(dict(raw))
        diff = {
            k: fixed.get(k, "")
            for k in LEADS_COLUMNS
            if fixed.get(k, "") != raw.get(k, "")
        }
        if diff:
            eid = raw["event_id"]
            affected.append((eid, diff))

    print(f"Rows needing repair: {len(affected)}")
    for eid, diff in affected:
        print(f"  event_id={eid[:8]}… changes={list(diff.keys())}")

    if not affected:
        print("Nothing to repair.")
        return

    if not args.apply:
        print("\nDry-run. Re-run with --apply to write corrections.")
        return

    print("\nBuilding row-number index…")
    row_map = _event_id_to_row_map(svc, spreadsheet_id, source_tab)
    qtab = _quote_sheet(source_tab)

    value_ranges: list[dict] = []
    missing: list[str] = []
    for eid, diff in affected:
        row_num = row_map.get(eid)
        if row_num is None:
            missing.append(eid)
            continue
        for key, val in diff.items():
            col_idx = _canonical_col_index(key)
            if col_idx is None:
                continue
            col_letter = _col_index_to_a1(col_idx)
            cell = f"{qtab}!{col_letter}{row_num}"
            if val is None:
                val = ""
            elif isinstance(val, bool):
                val = "TRUE" if val else "FALSE"
            value_ranges.append({"range": cell, "values": [[val]]})

    if not value_ranges:
        print("No writable cells found (all unknown columns?).")
        return

    print(f"Writing {len(value_ranges)} cell(s) across {len(affected) - len(missing)} row(s) in a single batch…")
    _batch_write(svc, spreadsheet_id, source_tab, value_ranges)
    if missing:
        for eid in missing:
            print(f"  WARN: row not found for event_id={eid}")
    print(f"\nDone. {len(affected) - len(missing)} row(s) repaired, {len(missing)} not found.")


if __name__ == "__main__":
    main()
