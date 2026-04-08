#!/usr/bin/env python3
"""
One-off: set Leads tab row 1 to canonical LEADS_COLUMNS (fixes mislabeled headers).

Uses python-scripts/.env for GOOGLE_SHEETS_* and service account paths.

  python temp_fix_leads_headers.py           # dry-run: print target sheet + column count
  python temp_fix_leads_headers.py --apply   # write row 1 via Sheets API
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
from services.sheets_leads import (
    _col_index_to_a1,
    _ensure_column_capacity,
    _get_sheets_service,
    _quote_sheet,
    get_spreadsheet_config,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Fix Leads sheet row 1 headers to match LEADS_COLUMNS.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually update Google Sheets (default is dry-run only).",
    )
    args = parser.parse_args()

    spreadsheet_id, tab = get_spreadsheet_config()
    if not spreadsheet_id:
        print("ERROR: GOOGLE_SHEETS_SPREADSHEET_ID is not set in .env", file=sys.stderr)
        sys.exit(1)

    n = len(LEADS_COLUMNS)
    print(f"Spreadsheet: {spreadsheet_id}")
    print(f"Tab: {tab!r}")
    print(f"Columns: {n} (indices 0..{n - 1})")
    print(f"First 5: {LEADS_COLUMNS[:5]}")
    print(f"Last 5: {LEADS_COLUMNS[-5:]}")

    if not args.apply:
        print("\nDry-run only. Re-run with --apply to write row 1.")
        return

    svc = _get_sheets_service()
    _ensure_column_capacity(svc, spreadsheet_id, tab, n)
    qtab = _quote_sheet(tab)
    end_col = _col_index_to_a1(n - 1)
    rng = f"{qtab}!A1:{end_col}1"
    svc.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=rng,
        valueInputOption="RAW",
        body={"values": [LEADS_COLUMNS]},
    ).execute()
    print(f"\nOK: Updated {rng} with canonical headers.")


if __name__ == "__main__":
    main()
