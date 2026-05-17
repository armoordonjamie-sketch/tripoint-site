#!/usr/bin/env python3
"""One-off: restore 5 real GCLID leads deleted by mistake, then rebuild GoogleAds_Import."""
import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from lead_constants import LEADS_COLUMNS, GOOGLE_ADS_IMPORT_COLUMNS, GOOGLE_ADS_IMPORT_TAB
from services.google_ads_export import repair_common_leads_sheet_misalignment, new_batch_id
from services.sheets_leads import (
    _get_sheets_service,
    _quote_sheet,
    get_spreadsheet_config,
    ensure_leads_headers,
    write_export_tab,
)
from services.ads_offline_sync import (
    build_offline_export_set,
    offline_export_row_has_plausible_click_id,
    build_google_ads_import_row,
)

RESTORE_EVENT_IDS = {
    "7a82c48d-300e-4cd7-8db3-ae1f98650393",
    "e2d9696c-3cf8-4504-9ec0-a58b596c80f4",
    "7dea9ffb-4fe1-432a-bb96-6606e354b8e3",
    "603ad80c-bef9-4ba8-821f-6332f59f3424",
    "3e01a17b-cd42-4b37-86ef-f6ea15882c07",
}

CSV_PATH = Path(r"C:\Users\JamiePC\Downloads\TPD Leads - Leads.csv")

def main() -> None:
    # Read restore rows from backup CSV (preserves original order)
    restore_rows = []
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        for d in csv.DictReader(f):
            if d.get("event_id") in RESTORE_EVENT_IDS:
                restore_rows.append(d)

    print(f"Found {len(restore_rows)} rows in CSV to restore")
    for d in restore_rows:
        raw = {k: (d.get(k) or "") for k in LEADS_COLUMNS}
        fixed = repair_common_leads_sheet_misalignment(raw)
        eid = d.get("event_id", "")[:8]
        print(f"  {eid}  qs={fixed['qualification_status']}  gclid={fixed['gclid'][:50]}")

    spreadsheet_id, source_tab = get_spreadsheet_config()
    svc = _get_sheets_service()
    ensure_leads_headers(svc, spreadsheet_id, source_tab)
    qtab = _quote_sheet(source_tab)

    # Build repaired data rows in LEADS_COLUMNS order
    data_rows = []
    for d in restore_rows:
        raw = {k: (d.get(k) or "") for k in LEADS_COLUMNS}
        fixed = repair_common_leads_sheet_misalignment(raw)
        data_rows.append([fixed.get(c, "") for c in LEADS_COLUMNS])

    # Append to Leads tab
    svc.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=f"{qtab}!A1",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": data_rows},
    ).execute()
    print(f"\nOK: Appended {len(data_rows)} rows to '{source_tab}'.")

    # Rebuild GoogleAds_Import from all Leads (now includes restored rows)
    from services.sheets_leads import read_all_lead_rows
    all_leads, _ = read_all_lead_rows(svc, spreadsheet_id, source_tab)
    export_dicts, stats = build_offline_export_set(all_leads, batch_id=new_batch_id())
    plausible = [r for r in export_dicts if offline_export_row_has_plausible_click_id(r)]
    ready = [r for r in plausible if r.get("export_ready") == "true"]
    import_lines = [build_google_ads_import_row(r) for r in ready]

    print(f"\nLeads now: {len(all_leads)}  export candidates: {len(export_dicts)}  ready: {len(ready)}")
    write_export_tab(svc, spreadsheet_id, GOOGLE_ADS_IMPORT_TAB, GOOGLE_ADS_IMPORT_COLUMNS, import_lines)
    print(f"OK: Wrote {len(import_lines)} row(s) to '{GOOGLE_ADS_IMPORT_TAB}'.")
    for r in ready:
        iv = r.get("identifier_value", "")
        print(f"  {r.get('source_event_id','')[:8]}  {iv[:55]}  qs={r.get('qualification_status')}")

if __name__ == "__main__":
    main()
