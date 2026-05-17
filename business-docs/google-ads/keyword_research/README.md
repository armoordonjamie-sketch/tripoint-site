# Keyword research (multi-source)

Python pipeline for TriPoint Google Ads planning: expands seeds via **SerpApi** (Autocomplete + Google Search), optionally **Brave Search**, **Google Search Console**, and **Google Ads Script CSV exports**; applies modifier expansion; scores relevance, commercial/local intent, risk, landing-page fit, validation, breadth, and ambiguity; classifies into **five tiers** (or legacy include/review/exclude); writes UTF-8 CSVs.

## Prerequisites

- Python 3.10+ recommended
- **SerpApi** key for the default path (`SERPAPI_API_KEY` or `SerpApi_API_KEY`)
- Optional: **Brave** (`brave_search_api_key`), **Search Console** OAuth (`google_client_id`, `google_client_id_secret`, `SEARCH_CONSOLE_SITE_URL`), **Ads exports** CSVs under `ads_exports/`

## Setup

```bash
cd business-docs/google-ads/keyword_research
pip install -r requirements.txt
```

### `.env` (this folder)

| Variable | Required | Purpose |
|----------|----------|---------|
| `SERPAPI_API_KEY` or `SerpApi_API_KEY` | Default runs | SerpApi |
| `brave_search_api_key` | Brave web search (`/web/search`, `X-Subscription-Token`) |
| `brave_suggest_api_key` or `brave_autosuggest_api_key` | Brave autosuggest (`/suggest/search`). If omitted, `brave_search_api_key` is used. If you only have the suggest key, set `brave_suggest_api_key` — it is reused for web calls unless you also set `brave_search_api_key`. |
| `google_client_id`, `google_client_id_secret` | Search Console | OAuth installed-app flow |
| `SEARCH_CONSOLE_SITE_URL` | Search Console | e.g. `sc-domain:example.com` or `https://www.example.com/` |
| `OPENROUTER_API_KEY` | Optional LLM reorganizer | OpenRouter for post-processing keyword CSVs (see below) |

First Search Console run opens a browser; token is cached as `gsc_token.json` next to the script.

### LLM keyword cleanup (optional)

After CSVs exist under `output/`, you can run the **OpenRouter + Gemini** reorganizer (clean tiers, Editor exports, non‑Mercedes tuning expansion):

```bash
pip install -r llm_keyword_reorganizer/requirements.txt
python -m llm_keyword_reorganizer --input-dir output --include-tuning-expansion
```

Or: `python run_llm_reorganizer.py --input-dir output` from this folder. Full flags and behaviour: [README_llm_keyword_reorganizer.md](README_llm_keyword_reorganizer.md).

### Google Ads Script exports

1. In Ads: **Tools → Bulk actions → Scripts**; create a script from `ads_script_export.js`.
2. Set `SPREADSHEET_URL` to a Google Sheet URL; run the script.
3. Download CSVs (or save tabs) into `ads_exports/` as:

   - `search_terms.csv`, `keywords.csv`, `negative_keywords.csv`, `recommendations.csv`, `campaign_snapshot.csv` (all optional).

## Usage

**Full run** (all seeds):

```bash
python keyword_research.py
```

**Sample** (first three seeds per family):

```bash
python keyword_research.py --sample
```

**Broad universe + tiered scoring** (softer thresholds, expanded seeds from `EXPANDED_SEED_GROUPS`):

```bash
python keyword_research.py --sample --broad-mode
```

**All optional sources** (Brave + GSC + Ads exports, if configured):

```bash
python keyword_research.py --all-sources
```

**Modifier expansion only** (no SerpApi/Brave/GSC HTTP calls):

```bash
python keyword_research.py --expansion-only --broad-mode
```

**Re-score existing master** with current validation context (GSC + Ads if configured):

```bash
python keyword_research.py --validation-only --tiered
```

### CLI flags

| Flag | Effect |
|------|--------|
| `--sample` | First 3 seeds per campaign family |
| `--output-dir DIR` | Override `ResearchSettings.output_dir` |
| `--delay SECONDS` | Delay between API calls |
| `--use-serpapi` / `--no-serpapi` | Toggle SerpApi (default: on) |
| `--use-brave` | Brave suggest + web titles |
| `--use-search-console` | GSC query report |
| `--use-ads-script-exports` | Load `ads_exports/*.csv` |
| `--all-sources` | Enables Brave, GSC, Ads exports |
| `--broad-mode` | Broad thresholds + expanded seeds + **tiered** classification |
| `--tiered` | Five-tier tiers without requiring `--broad-mode` |
| `--expansion-only` | Modifiers (+ seeds when SerpApi off) only |
| `--validation-only` | Read `output/keyword_research_master.csv`, re-score |

**Backward compatibility:** default run uses **legacy** three-way status (`include` / `review` / `exclude_negative`) with `tier_status` mapped for filtering. `--tiered` or `--broad-mode` switches on full five-tier logic.

## Configuration

Edit `config.py`:

- `ResearchSettings` — API toggles, `ads_export_dir`, thresholds, `broad_threshold_*`, `legacy_three_bucket`, `modifier_expansion` (default off; use `--modifier-expansion` or `--broad-mode`)
- `SEED_GROUPS` — core seeds per ad group
- `EXPANDED_SEED_GROUPS` — merged when `flatten_seeds(use_expanded=True)` (used in `--broad-mode`)
- `MODIFIER_SETS` in `modifier_expander.py` — combinational expansion
- `LANDING_PAGE_MAP` in `landing_pages.py` — landing fit scoring
- Risk/vocabulary lists and ad group regex rules

## Output files (`output/`)

Legacy-style files are preserved; new columns appear on the master/universe CSVs.

| File | Purpose |
|------|---------|
| `keyword_research_master.csv` | Deduped rows + scores + `tier_status` |
| `keyword_universe.csv` | Same columns as master (full universe snapshot) |
| `keywords_include.csv` | `tier_status = include_now` |
| `keywords_review.csv` | `tier_status = review_high_priority` |
| `keywords_broad_test.csv` | `review_broad_test` + `future_test` |
| `keyword_validation_summary.csv` | Per-row GSC/Ads overlap flags |
| `keyword_cluster_summary.csv` | Counts by family / ad group / tier |
| `negative_keywords.csv` | `exclude_negative` |
| `seed_expansion_summary.csv` | Per-seed tier counts |
| `serp_source_dump.csv` | SerpApi raw rows |
| `search_console_query_dump.csv` | GSC rows (if enabled) |
| `brave_source_dump.csv` | Brave rows (if enabled) |
| `google_ads_script_validation_dump.csv` | Ads match flags (if exports loaded) |
| `keywords_grouped_for_google_ads_editor.csv` | Includes only |
| `negatives_grouped_for_google_ads_editor.csv` | Negatives only |

## Notes

- Retries on 429/5xx mirror `serpapi_collector` for Brave.
- SerpApi and Brave use UK-oriented defaults (`gl`/country where applicable).
- PAA-sourced terms are capped at review tiers, not direct include.
