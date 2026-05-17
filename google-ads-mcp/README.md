# tpd-ads-api

FastAPI service that ingests Google Ads exports and daily history into **SQLite**, then serves snapshot queries, raw history rows, and read-only **analysis** endpoints (aligned with the `tpd-ads-mcp` insight tools).

## Stack

- Python **3.11+**
- FastAPI, Uvicorn, SQLModel, SQLite

## Install

```bash
cd google-ads-mcp
pip install -r requirements.txt
```

## Configuration

Copy `.env.example` to `.env`:

| Variable | Purpose |
|----------|---------|
| `ADS_API_SECRET` | Shared secret; every request must send `Authorization: Bearer <value>`. |
| `DATABASE_URL` | Default `sqlite:///./tpd_ads.db` — database file is created relative to the process working directory. |

If `ADS_API_SECRET` is unset, protected routes return **500** on purpose (misconfiguration).

## Run

```bash
uvicorn main:app --port 5173 --reload
```

Interactive docs: **http://localhost:5173/docs** (Swagger) and **/redoc**.

Port **5173** matches a typical setup behind a Cloudflare tunnel (e.g. `beta.tripointdiagnostics.co.uk`).

## Authentication

All routes below require:

```http
Authorization: Bearer <ADS_API_SECRET>
```

## Date query parameters

### Analysis routes (`/api/ads/analysis/*`)

Optional `start_date` and `end_date` (`YYYY-MM-DD`). Rules:

| You pass | Resulting range |
|----------|------------------|
| Neither | Last **30** days ending **yesterday** (UTC). |
| Only `start_date` | From that day through **yesterday** (UTC). |
| Only `end_date` | **30**-day window ending on `end_date`. |
| Both | Inclusive window; `start_date` ≤ `end_date`. |

### History list routes (`/api/ads/history/campaigns`, `keywords`, `search_terms`)

Optional `start_date` / `end_date` use a **stricter** rule: **both omitted** → last **90** days ending yesterday (UTC); **if you pass one, you must pass both** (otherwise **400**).

`GET /api/ads/history/summary` and `GET /api/ads/history/coverage` take no date filters.

## Endpoints

### Snapshot pipeline (latest export)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ads/ingest` | Full export payload → one `ad_snapshot` plus child rows (`campaign`, `ad_group`, `keyword`, `search_term`, `ad`). |
| GET | `/api/ads/snapshots` | List snapshots with per-table row counts. |
| GET | `/api/ads/campaigns` | Campaign rows; `snapshot_id` default `latest`. |
| GET | `/api/ads/keywords` | Keyword rows; optional `campaign`. |
| GET | `/api/ads/search_terms` | Search term rows; optional `campaign`. |
| GET | `/api/ads/summary` | Rolled-up totals, top keywords/search terms by cost, keywords with quality score below 5. |

### Daily history (`daily_metric` table)

Idempotent backfill: same natural key (date + entity + dimensions) is skipped on re-post.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ads/ingest/history` | Body: `entity_type` (`campaign`, `ad_group`, `keyword`, `search_term`) and `rows`. Response: `received`, `inserted`, `skipped`. |
| GET | `/api/ads/history/campaigns` | Daily campaign rows; optional `campaign`, `start_date`, `end_date` (see history date rules). |
| GET | `/api/ads/history/keywords` | Same for keywords. |
| GET | `/api/ads/history/search_terms` | Same for search terms. |
| GET | `/api/ads/history/summary` | Per-campaign aggregates over all stored daily campaign rows. |
| GET | `/api/ads/history/coverage` | Min/max dates and distinct day counts per campaign and `entity_type` (for scripts to skip loaded days). |

### Analysis (reads `daily_metric`; uses analysis date rules)

Base path: `/api/ads/analysis`.

| Method | Path | Query notes |
|--------|------|-------------|
| GET | `/health` | Account-style rollup: totals, per-campaign metrics, zero-conversion campaigns, low-QS counts, top zero-conv search terms, latest snapshot IS fields. |
| GET | `/campaigns` | Campaign comparison for the date window. |
| GET | `/waste` | Keywords with zero conversions and spend ≥ `min_spend` (default `5`); optional `campaign`. |
| GET | `/search_terms` | Aggregated search terms; optional `campaign`, `min_spend` (default `3`). |
| GET | `/trends` | **`campaign` required.** Weekly buckets. Optional `start_date` / `end_date`, or omit both and use `days` (default `30`, max `730`) ending yesterday. |
| GET | `/anomalies` | **`campaign` required.** Day-level z-score style flags. Same date options as `trends`; `days` default `30` (min `3`). |

Missing or blank `campaign` on `trends` / `anomalies` returns **400** with `Query parameter 'campaign' is required`.

## Google Ads Scripts

- **Snapshot export** → POST `/api/ads/ingest`: configure [`code.gs`](code.gs) (`API_ENDPOINT`, secret header).
- **Daily history backfill** → POST `/api/ads/ingest/history`: [`tpd_ads_history.js`](tpd_ads_history.js) (`CONFIG.API_BASE`, `ADS_API_SECRET`). Uses `GET /api/ads/history/coverage` to avoid re-fetching days; duplicates are ignored server-side.

`AdsApp.report()` can miss rows on very long `segments.date` ranges. The history script chunks queries (`GAQL_MAX_DAYS_PER_QUERY`, default 180). If a run returns zero rows, lower that value (e.g. 90).

## Cloudflare tunnel

Point the public hostname to `http://localhost:5173` (or wherever Uvicorn runs). The script URL must match the tunnel host and path (`/api/ads/ingest` or `/api/ads/ingest/history`), and the bearer token must match `ADS_API_SECRET`.

## Ingest JSON shape (snapshot)

POST `/api/ads/ingest` with `Content-Type: application/json`:

```json
{
  "exported_at": "2026-04-08T07:00:00Z",
  "date_range": "LAST_7_DAYS",
  "campaigns": [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "channel": "string",
      "daily_budget": 0.0,
      "impressions": 0,
      "clicks": 0,
      "cost": 0.0,
      "conversions": 0.0,
      "conv_value": 0.0,
      "ctr": 0.0,
      "avg_cpc": 0.0,
      "impression_share": "string",
      "budget_lost_is": "string",
      "rank_lost_is": "string",
      "cost_per_conversion": 0.0
    }
  ],
  "ad_groups": [],
  "keywords": [],
  "search_terms": [],
  "ads": []
}
```

Arrays may be empty. Extend nested objects per your export schema.

## Database migration note

If an older `tpd_ads.db` has no `daily_metric` table, remove the file or migrate so `SQLModel.metadata.create_all` can create it on startup.
