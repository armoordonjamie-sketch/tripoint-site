# LLM keyword reorganizer (OpenRouter + Gemini 3 Flash)

Python CLI that reads TriPoint keyword research CSVs, applies deterministic junk/geo rules, optionally generates non-Mercedes tuning candidates, classifies keywords in batches via **OpenRouter** (`google/gemini-3-flash-preview`), and writes cleaner **Google Ads Editor**–ready exports.

## Setup

From `business-docs/google-ads/keyword_research/`:

```bash
pip install -r llm_keyword_reorganizer/requirements.txt
```

Add to the **existing** shared `.env` in this folder (same file as SerpApi / Brave):

```env
OPENROUTER_API_KEY=your_key_here
```

`load_llm_env()` loads `keyword_research/.env` first, then optional `llm_keyword_reorganizer/.env` overrides.

## How to run

Always run **as a module** from the `keyword_research` directory so imports resolve:

```bash
cd business-docs/google-ads/keyword_research
python -m llm_keyword_reorganizer --help
# equivalent:
python run_llm_reorganizer.py --help
```

### Example (full options)

```bash
python -m llm_keyword_reorganizer \
  --input-dir output \
  --output-dir llm_keyword_reorganizer/outputs \
  --batch-size 10 \
  --include-tuning-expansion \
  --verbose
```

### Smoke test (no API spend)

```bash
python -m llm_keyword_reorganizer --dry-run --max-keywords 100
```

### Resume after interrupt

```bash
python -m llm_keyword_reorganizer --resume \
  --input-dir output \
  --output-dir llm_keyword_reorganizer/outputs
```

## Outputs (under `--output-dir`)

| File | Purpose |
|------|---------|
| `llm_keywords_master.csv` | Full audit trail + LLM fields |
| `llm_keywords_include.csv` | `include_now` |
| `llm_keywords_review.csv` | `review_high_priority` |
| `llm_keywords_broad_test.csv` | `review_broad_test` + `future_test` |
| `llm_negative_keywords.csv` | `exclude_negative` |
| `llm_keywords_grouped_for_google_ads_editor.csv` | Positive keywords |
| `llm_negatives_grouped_for_google_ads_editor.csv` | Negatives |
| `llm_batch_audit.jsonl` | Per-batch metadata, usage, errors |
| `llm_run_summary.json` | Aggregates |

Default folders: `llm_keyword_reorganizer/outputs`, `checkpoints`, `logs`.

## How it works (short)

1. **Load** `keyword_universe.csv` or `keyword_research_master.csv`, merge optional slices, join `keyword_validation_summary.csv` when present.
2. **Normalize** text (lowercase, quotes, light title cleanup); **dedupe** on `(normalized_keyword, campaign_family)`.
3. **Pre-rules** force `exclude_negative` (junk, far geo, MOT, resets, etc.) — **no LLM call** for those rows.
4. **Optional** codegen tuning rows (`--include-tuning-expansion`) for non-Mercedes work vans.
5. **Batches** of N rows → OpenRouter chat completion → **Pydantic** JSON validation; one **repair** retry on parse failure.
6. **Post-rules** re-check exclusions; **confidence** clamp downgrades weak `include_now`; **ad group** coerced to allowed list; **rewrite dedupe** demotes duplicates.
7. **Export** CSVs + JSON summary.

## Assumptions

- OpenRouter exposes `google/gemini-3-flash-preview` and accepts `extra_body["reasoning"]["effort"]` (ignored safely if unsupported).
- Input CSV columns match the current keyword research pipeline (`keyword_candidate`, `normalized_keyword`, `campaign_family`, etc.).
- Editor **campaign** names match live Google Ads via parent `config.py` `CAMPAIGN_EDITOR_NAMES` when that file exists.
- Ad group strings align with the account (internal list uses **`AdBlue / DPF / NOx`** as live name).

## Likely next improvements

- Parallel batches with global rate limiting.
- Streaming responses + partial JSON recovery.
- Embedding-based near-duplicate merge before LLM.
- Cost/token budget caps per run.
- Prompt A/B via CLI flag.

## Where to tweak

| What | Where |
|------|--------|
| System prompt + business rules | `llm_keyword_reorganizer/config.py` → `SYSTEM_PROMPT` |
| Pre/post exclusion lists | `config.py` → `PRE_EXCLUDE_*`, `FAR_GEO_*`, `PHONE_PATTERNS` |
| Normalization | `normalizers.py` |
| Heuristic tags for prompts | `heuristics.py` |
| Tuning vehicle seeds / modifiers | `tuning_expansion.py` |
| Confidence threshold | `config.py` → `CONFIDENCE_INCLUDE_THRESHOLD`; post logic in `pipeline.py` → `finalize_row` |
| Model / temperature / base URL | `config.py` |
| OpenRouter request wrapper | `openrouter_client.py` (includes commented example request body) |

## CLI flags

`--input-dir`, `--output-dir`, `--checkpoint-dir`, `--log-dir`, `--batch-size` (default 10), `--max-keywords`, `--campaign-filter`, `--ad-group-filter`, `--include-tuning-expansion`, `--resume`, `--dry-run`, `--verbose`, `--reasoning-effort` (`low`/`medium`/`high`), `--timeout`, `--no-progress`.
