#!/usr/bin/env python3
"""
One-off: delete Leads rows whose gclid/gbraid/wbraid matches a blocklist of test IDs,
then clear GoogleAds_Import (which only contained rows derived from those test click IDs).

  python temp_remove_test_leads.py              # dry-run: show what would be deleted
  python temp_remove_test_leads.py --apply      # delete from Leads + clear GoogleAds_Import

Row deletion uses a single batchUpdate with deleteDimension requests (bottom-to-top so
indices don't shift mid-batch). GoogleAds_Import is rewritten to header-only.
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

from lead_constants import GOOGLE_ADS_IMPORT_COLUMNS, GOOGLE_ADS_IMPORT_TAB, LEADS_COLUMNS
from services.sheets_leads import (
    _get_sheets_service,
    _quote_sheet,
    ensure_leads_headers,
    get_spreadsheet_config,
    write_export_tab,
)

# ── Test click IDs to purge ────────────────────────────────────────────────────
BLOCKED_CLICK_IDS: frozenset[str] = frozenset(
    {
        # Short test IDs
        "test123",
        "test-gclid-123",
        "test-auto-001",
        "test-auto-002",
        "test-auto-003",
        "test-auto-004",
        "test-auto-005",
        "0AAAAAtest-gbraid-only",
        # Long IDs confirmed as test/unwanted by owner
        "Cj0KCQjwp7jOBhDGARIsABe7C4d_5tUJeEwnrU5doICIw4HlfuOGq95pzOTa64Y34TJ_G6nxsaTjhtgaAk-8EALw_wcB",
        "EAIaIQobChMI17qI_qHHkwMVV5lQBh3oJA4wEAAYAyAAEgJ9MPD_BwE",
        "EAIaIQobChMI-sqgkNbPkwMVVpJQBh073h_0EAAYBCAAEgIbQvD_BwE",
        "CjwKCAjwvqjOBhAGEiwAngeQnUcwAc97nVC68cv7lOMnG93jhe4M7ERf26uDZe5PKdTv-chHeYsnchoCZ3kQAvD_BwE",
    }
)

CLICK_ID_COLS = ("gclid", "gbraid", "wbraid")


def _get_sheet_id(service, spreadsheet_id: str, title: str) -> int | None:
    meta = (
        service.spreadsheets()
        .get(spreadsheetId=spreadsheet_id, fields="sheets(properties(sheetId,title))")
        .execute()
    )
    for s in meta.get("sheets", []):
        props = s.get("properties") or {}
        if (props.get("title") or "") == title:
            return int(props.get("sheetId", 0))
    return None


def _row_click_ids(row: dict[str, str]) -> set[str]:
    return {(row.get(c) or "").strip() for c in CLICK_ID_COLS} - {""}


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Delete test-click-ID rows from Leads and clear GoogleAds_Import."
    )
    parser.add_argument("--apply", action="store_true", help="Actually delete (default: dry-run).")
    args = parser.parse_args()

    spreadsheet_id, source_tab = get_spreadsheet_config()
    if not spreadsheet_id:
        print("ERROR: GOOGLE_SHEETS_SPREADSHEET_ID missing in .env", file=sys.stderr)
        sys.exit(1)

    svc = _get_sheets_service()
    ensure_leads_headers(svc, spreadsheet_id, source_tab)

    # ── Read all data rows (raw, fixed-column mapping) ──────────────────────
    qtab = _quote_sheet(source_tab)
    raw_data = (
        svc.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"{qtab}!A2:ZZ50000")
        .execute()
        .get("values") or []
    )

    # Build (sheet_row_1based, row_dict) list — skip blank rows
    rows_indexed: list[tuple[int, dict[str, str]]] = []
    for i, raw in enumerate(raw_data, start=2):
        if not raw or not any(str(c).strip() for c in raw):
            continue
        d: dict[str, str] = {}
        for j, name in enumerate(LEADS_COLUMNS):
            d[name] = str(raw[j]).strip() if j < len(raw) else ""
        if d.get("event_id"):
            rows_indexed.append((i, d))

    print(f"Leads rows read: {len(rows_indexed)}")

    # ── Identify rows to delete ──────────────────────────────────────────────
    to_delete: list[tuple[int, dict[str, str]]] = []
    for row_num, d in rows_indexed:
        if _row_click_ids(d) & BLOCKED_CLICK_IDS:
            to_delete.append((row_num, d))

    print(f"Rows to delete from Leads: {len(to_delete)}")
    for row_num, d in to_delete:
        cid = next(iter(_row_click_ids(d) & BLOCKED_CLICK_IDS), "?")
        print(
            f"  row {row_num:>4}  event={d.get('event_id','')[:8]}  "
            f"click_id={cid[:50]}  qs={d.get('qualification_status','')}"
        )

    if not to_delete:
        print("Nothing to delete.")
        return

    if not args.apply:
        print(f"\nDry-run. Re-run with --apply to delete {len(to_delete)} row(s) and clear GoogleAds_Import.")
        return

    # ── Delete rows: single batchUpdate with deleteDimension (bottom-to-top) ─
    sheet_id = _get_sheet_id(svc, spreadsheet_id, source_tab)
    if sheet_id is None:
        print(f"ERROR: sheet '{source_tab}' not found.", file=sys.stderr)
        sys.exit(1)

    # Sort descending so deleting a row doesn't shift the index of rows above it
    delete_requests = []
    for row_num, _ in sorted(to_delete, key=lambda x: x[0], reverse=True):
        delete_requests.append(
            {
                "deleteDimension": {
                    "range": {
                        "sheetId": sheet_id,
                        "dimension": "ROWS",
                        "startIndex": row_num - 1,  # 0-based
                        "endIndex": row_num,         # exclusive
                    }
                }
            }
        )

    print(f"\nDeleting {len(delete_requests)} row(s) from Leads in one batch…")
    svc.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": delete_requests},
    ).execute()
    print(f"OK: {len(delete_requests)} row(s) deleted from '{source_tab}'.")

    # ── Clear GoogleAds_Import to header-only ───────────────────────────────
    print(f"Clearing '{GOOGLE_ADS_IMPORT_TAB}' (header row only)…")
    write_export_tab(svc, spreadsheet_id, GOOGLE_ADS_IMPORT_TAB, GOOGLE_ADS_IMPORT_COLUMNS, [])
    print(f"OK: '{GOOGLE_ADS_IMPORT_TAB}' reset to header row only.")


if __name__ == "__main__":
    main()
