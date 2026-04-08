#!/usr/bin/env python3
"""
One-off: clear GoogleAds_Import and refill from Leads using only plausible click IDs.

Uses the same rules as offline_export_row_has_plausible_click_id (length + blocklist;
real gclid/wbraid/gbraid patterns). Does not change the Leads tab.

  python temp_rebuild_google_ads_import.py              # dry-run: counts only
  python temp_rebuild_google_ads_import.py --apply      # rewrite GoogleAds_Import
  python temp_rebuild_google_ads_import.py --apply --also-offline
      # also rewrite google_ads_offline_export with the same filtered rows

Loads python-scripts/.env (GOOGLE_SHEETS_*, service account).
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

from lead_constants import GOOGLE_ADS_IMPORT_COLUMNS, GOOGLE_ADS_IMPORT_TAB, OFFLINE_EXPORT_COLUMNS, OFFLINE_EXPORT_TAB
from services.ads_offline_sync import (
    build_google_ads_import_row,
    build_offline_export_set,
    offline_export_row_has_plausible_click_id,
)
from services.google_ads_export import new_batch_id
from services.sheets_leads import _get_sheets_service, get_spreadsheet_config, read_all_lead_rows, write_export_tab


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild GoogleAds_Import from Leads (plausible click IDs only).")
    parser.add_argument("--apply", action="store_true", help="Write to Sheets (default: dry-run).")
    parser.add_argument(
        "--also-offline",
        action="store_true",
        help=f"Also rewrite {OFFLINE_EXPORT_TAB!r} with the same filtered export rows.",
    )
    args = parser.parse_args()

    spreadsheet_id, source_tab = get_spreadsheet_config()
    if not spreadsheet_id:
        print("ERROR: GOOGLE_SHEETS_SPREADSHEET_ID missing in .env", file=sys.stderr)
        sys.exit(1)

    svc = _get_sheets_service()
    rows, _ = read_all_lead_rows(svc, spreadsheet_id, source_tab)
    batch_id = new_batch_id()
    export_dicts, stats = build_offline_export_set(rows, batch_id=batch_id)

    plausible = [r for r in export_dicts if offline_export_row_has_plausible_click_id(r)]
    skipped_click = len(export_dicts) - len(plausible)

    ready = [r for r in plausible if r.get("export_ready") == "true"]
    not_ready = len(plausible) - len(ready)

    import_lines = [build_google_ads_import_row(r) for r in ready]

    print(f"Leads rows read: {len(rows)}")
    print(f"Export candidates (eligible + deduped): {len(export_dicts)}  stats={stats}")
    print(f"After plausible click-id filter: {len(plausible)}  (dropped {skipped_click} implausible)")
    print(f"export_ready true: {len(ready)}  (dropped {not_ready} missing name/time/etc.)")
    print(f"GoogleAds_Import data rows to write: {len(import_lines)}")
    print(f"Tab: {GOOGLE_ADS_IMPORT_TAB!r}")

    if not args.apply:
        print("\nDry-run. Re-run with --apply to clear and rewrite the import tab.")
        return

    write_export_tab(svc, spreadsheet_id, GOOGLE_ADS_IMPORT_TAB, GOOGLE_ADS_IMPORT_COLUMNS, import_lines)
    print(f"\nOK: Wrote {len(import_lines)} row(s) to {GOOGLE_ADS_IMPORT_TAB!r} (header + data).")

    if args.also_offline:
        data_lines = [[r.get(c, "") for c in OFFLINE_EXPORT_COLUMNS] for r in plausible]
        write_export_tab(svc, spreadsheet_id, OFFLINE_EXPORT_TAB, OFFLINE_EXPORT_COLUMNS, data_lines)
        print(f"OK: Wrote {len(data_lines)} row(s) to {OFFLINE_EXPORT_TAB!r}.")


if __name__ == "__main__":
    main()
