# Google Ads offline export sheet (`google_ads_offline_export`)

## Startup purge (test click IDs)

On API startup, if `GOOGLE_SHEETS_SPREADSHEET_ID` is set, the server rewrites **`google_ads_offline_export`** and **drops** any row whose `identifier_value` / `gclid` / `wbraid` / `gbraid` fails plausibility checks (e.g. `test123`, short placeholders). Real **GCLIDs** (typically 40+ chars, alphanumeric + `_`) and substantial **wbraid/gbraid** values are kept. Set **`GOOGLE_ADS_SKIP_OFFLINE_EXPORT_PURGE_ON_STARTUP=1`** to disable (recommended for some local dev setups).

## Where sync runs

- **HTTP:** `POST /admin/leads/google-ads/sync-offline-export` (admin session required). Body: `{ "force": false }`.
- **Automatic (admin):** Changing **`qualification_status`** via **`PATCH /admin/leads/{event_id}`** or **`POST /admin/leads/bulk-update`** (when `qualification_status` is in the bulk payload) triggers a full offline export rebuild with **`force: true`**. The API response includes **`offline_export_sync`** (result of `run_offline_export_sync`, or `null` when PATCH did not touch `qualification_status`). Failures are logged and returned in that object; the lead update still succeeds.
- **Implementation:** [`python-scripts/services/ads_offline_sync.py`](../python-scripts/services/ads_offline_sync.py) — `run_offline_export_sync()`.
- **Spreadsheet:** Same workbook as leads (`GOOGLE_SHEETS_SPREADSHEET_ID`). Source tab: `GOOGLE_SHEETS_LEADS_TAB` (default `Leads`). Export tab: `GOOGLE_ADS_OFFLINE_EXPORT_TAB` (default `google_ads_offline_export`).

## Behaviour (summary)

1. Read all rows from the Leads tab.
2. Keep rows that pass [`enrich_lead_row`](../python-scripts/services/google_ads_export.py) (`ads_exportable`: `qualified` or `won`, click id present, conversion name resolvable) **and** have truthy `google_ads_eligible` (`true` / `1` / `yes`, case-insensitive). Rows with **`google_ads_export_override`** set to **`exclude`** (case-insensitive) are skipped (`skipped_export_override_exclude`).
3. **Auto-enrich on qualification:** When **`qualification_status`** changes via **`PATCH /admin/leads/{event_id}`** or **`POST /admin/leads/bulk-update`**, the server merges [`compute_ads_enrichment_fields`](../python-scripts/services/google_ads_export.py) into the source row **before** the offline sync: sets **`google_ads_eligible`** to **`TRUE`** or **`FALSE`**, fills **`google_ads_identifier_type`** / **`google_ads_identifier_value`**, and fills conversion name / value / currency when those sheet cells are empty (manual overrides preserved). **`disqualified`** rows get **`google_ads_eligible=FALSE`** only. Use **`google_ads_export_override=exclude`** in the sheet or PATCH to block export for edge cases without turning off automation.
4. **Dedupe** by `export_key` (see below). If several source rows share the same key, the row with the **latest** `occurred_at` wins.
5. **Rewrite** the entire export tab (clear + replace). Idempotent: re-running produces the same set for the same source data.
6. **Source updates:** For each row written to the export tab, set `google_ads_export_status=ready`, `google_ads_export_type=offline_export`, `google_ads_export_batch_id`, identifier columns, clear `google_ads_last_error` — unless the source row is already `ready` or `exported` and `force` is false.
7. **Stale `ready` cleanup:** Source rows still marked **`ready`** but **not** present in the rebuilt export set (e.g. disqualified, lost click id, or no longer `google_ads_eligible`) get **`google_ads_export_status=disqualified_removed`**, batch id cleared. Rows marked **`exported`** or **`adjustment_required`** are not altered by this step.
8. **Exported lead later disqualified:** When admin sets **`qualification_status`** to **`disqualified`** and the row was previously **`google_ads_export_status=exported`** with **`qualified`** or **`won`**, **`PATCH`** / **`bulk-update`** automatically merge **`google_ads_export_status=adjustment_required`**, **`google_ads_adjustment_type=RETRACTION`**, ensure **`google_ads_conversion_name`** is set for the adjustment CSV, and clear **`google_ads_adjustment_value`**. Run **`POST /admin/leads/google-ads/export-adjustments`** to produce the retraction file. This does not remove the conversion inside Google Ads until you import that adjustment.
9. Append a row to `GoogleAds_Export_Log` with `export_type` `offline_export`.
10. Rewrite the **`GoogleAds_Import`** tab (see `GOOGLE_ADS_IMPORT_TAB`) with one row per `export_ready` lead, using headers in `GOOGLE_ADS_IMPORT_COLUMNS` ([`lead_constants.py`](../python-scripts/lead_constants.py)). After a deploy that changes this list, re-check **Data manager** column mappings in Google Ads.

### `GoogleAds_Import` tab (scheduled upload / Data manager)

Columns are written in this order:

| Column | Source |
|--------|--------|
| `Parameters:TimeZone` | Always `Europe/London` (aligns with conversion time interpretation). |
| `Google Click ID` | `gclid` from the lead row. |
| `Conversion Name` | Resolved conversion action name. |
| `Conversion Time` | `qualified_at` / `won_at` / `occurred_at`, formatted as `YYYY-MM-DD HH:MM:SS Europe/London` when no offset was present. |
| `Conversion Value` / `Conversion Currency` | From enrichment / sheet. |
| `Hashed Email` / `Hashed Phone Number` | From lead track payload (SHA-256 hex). |
| `Order ID` | Lead `order_id` when set. |
| `WBRAID` / `GBRAID` | From attribution. |
| `User agent` | Browser UA from lead track (or request header fallback on `/api/leads/track`). |
| `User IP address` | Client IP from the tracking request (`X-Forwarded-For` aware). Google may not use IP for matching in the UK/EEA/CH; see [offline import policy](https://support.google.com/google-ads/answer/2998031). |
| `Session attributes` | Optional base64 JSON (`landing_page_user_agent`, `landing_page_url` from `SITE_URL` + `page`, `session_start_time_usec` from `occurred_at`). Empty if nothing could be built. |

**Recording on ingest:** `/api/leads/track` already persists `gclid`, `wbraid`, `gbraid`, `hashed_email`, `hashed_phone`, `order_id`, `user_agent`, `ip_address`, `ga_client_id`, `ga_session_id`, and UTM fields into the **Leads** sheet. Hashed PII is only present when the frontend sends it (e.g. contact/booking flows that hash and include those fields).

## Export key

`export_key` is deterministic:

`{journey_id}:{qualification_status}:{conversion_name}:{identifier_value}`

- `conversion_name` is the resolved name (sheet override or [`ads_config()`](../python-scripts/lead_constants.py) default).
- `identifier_value` is the chosen click id (`gclid` > `wbraid` > `gbraid`), same as `enrich_lead_row`.

## Conversion name and value mapping

- Prefer `google_ads_conversion_name` on the lead row; if empty, use env-driven defaults from `ads_config()`:
  - `GOOGLE_ADS_QUALIFIED_CONVERSION_NAME` (default `Qualified Lead`)
  - `GOOGLE_ADS_WON_CONVERSION_NAME` (default `Won Job`)
- Value: `google_ads_conversion_value` if set, else `lead_value`, else default qualified/won value from env (`GOOGLE_ADS_DEFAULT_QUALIFIED_VALUE` / `GOOGLE_ADS_DEFAULT_WON_VALUE`).
- Currency: row `google_ads_currency` or `GOOGLE_ADS_DEFAULT_CURRENCY`.

`source_event_name` is the raw `event_name` (e.g. `generate_lead`); **not** used as the Google Ads conversion action name.

## Conversion time (`conversion_time`)

1. If `qualification_status` is `qualified` and `qualified_at` is set → use `qualified_at` (London `YYYY-MM-DD HH:MM:SS`).
2. Else if `won` and `won_at` is set → use `won_at`.
3. Else → use `occurred_at` from the winning source row.

`qualified_at` / `won_at` are appended to the Leads schema and set automatically when an admin changes status to `qualified` / `won` via `PATCH` or bulk-update (unless already present in the request). Older rows without these columns populated fall back to `occurred_at`.

## Export tab columns

Order is defined in `OFFLINE_EXPORT_COLUMNS` in [`lead_constants.py`](../python-scripts/lead_constants.py):

`export_key`, `journey_id`, `source_event_id`, `source_event_name`, `qualification_status`, `conversion_name`, `conversion_time`, `conversion_value`, `currency`, `identifier_type`, `identifier_value`, `gclid`, `gbraid`, `wbraid`, `ga_client_id`, `ga_session_id`, `lead_channel`, `contact_method`, `click_location`, `form_name`, `service_interest`, `vehicle_make`, `vehicle_model`, `page`, `utm_source`, `utm_medium`, `utm_campaign`, `notes`, `source_row_status`, `exported_at`, `export_batch_id`, `export_ready`

- `export_ready`: `true` when `conversion_name`, `identifier_value`, and `conversion_time` are all non-empty.
- `exported_at` / `source_row_status`: copied from the source row for audit (`google_ads_exported_at`, `google_ads_export_status`).
- `export_batch_id`: UUID for this sync run.

## Local run

From repo root (with Sheets env set and service account able to edit the spreadsheet):

```bash
cd python-scripts
# Optional: export GOOGLE_SHEETS_* and GOOGLE_SERVICE_ACCOUNT_*
python -c "
from services.sheets_leads import _get_sheets_service, get_spreadsheet_config
from services.ads_offline_sync import run_offline_export_sync
svc = _get_sheets_service()
sid, tab = get_spreadsheet_config()
print(run_offline_export_sync(svc, sid, tab, force=False, triggered_by='cli'))
"
```

Or call the admin API after logging in.

## Backfill

1. Ensure Leads sheet has new headers (`qualified_at`, `won_at`, **`google_ads_export_override`**) — they are merged automatically on next read via `ensure_leads_headers`.
2. For existing qualified/won rows, either run **`POST .../sync-offline-export`** with **`force: true`**, or touch **`qualification_status`** once in admin (same value) so PATCH re-runs auto-enrich + sync — either path repopulates **`google_ads_eligible`** and related fields for exportable leads.
3. Optional: run `POST .../sync-offline-export` on a schedule or after bulk sheet edits outside the admin API.

## Tests

```bash
cd python-scripts
python -m pytest tests/test_ads_offline_sync.py tests/test_google_ads_export.py -v
```

## Follow-up

- Optional: cron or external scheduler hitting the sync endpoint on an interval.
- Retractions/restatements continue to use `POST /admin/leads/google-ads/export-adjustments` and `GoogleAds_Adjustments_Export`; not mixed into this tab. Rows auto-marked **`adjustment_required`** are picked up by that export when **`google_ads_adjustment_type`** is **`RETRACTION`**.
