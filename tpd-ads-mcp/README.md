# tpd-ads-mcp

Model Context Protocol (stdio) server exposing the TriPoint Diagnostics **Google Ads SQLite** database (`tpd_ads.db`) to Claude for read-only analysis.

## Requirements

- Python 3.11+
- Existing DB produced by [google-ads-mcp](../google-ads-mcp/) FastAPI ingest + history scripts

## Install

```bash
cd tpd-ads-mcp
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `DB_PATH` to the absolute or relative path of `tpd_ads.db`.

## Run (manual test)

```bash
# From tpd-ads-mcp with .env configured
python server.py
```

The process speaks MCP over **stdio**; it will appear to hang when run alone — use Claude Desktop (below) or an MCP client.

## Claude Desktop

Add this block to your **Claude Desktop** `claude_desktop_config.json` (adjust paths if your user folder differs):

```json
{
  "mcpServers": {
    "tpd-ads": {
      "command": "python",
      "args": ["C:/Users/JamiePC/Desktop/TriPoint-site/tpd-ads-mcp/server.py"],
      "env": {
        "DB_PATH": "C:/Users/JamiePC/Desktop/TriPoint-site/google-ads-mcp/tpd_ads.db",
        "TPD_BUSINESS_CONTEXT": "TriPoint Diagnostics is a premium mobile diagnostics and repair business covering Kent and SE London, specialising in Mercedes-Benz vans."
      }
    }
  }
}
```

You can rely on `server.py` loading `.env` from the `tpd-ads-mcp` folder instead of duplicating `TPD_BUSINESS_CONTEXT` in JSON if you prefer.

## Example prompts

- “Give me a full account health summary for the last 30 days.”
- “Which keywords are wasting budget with no conversions?”
- “Show me the day-of-week breakdown for the Servicing campaign.”
- “Are there any anomalies in the Diagnostics campaign this month?”
- “What search terms should I add as negative keywords?”
- “Compare all campaigns for the last 7 days.”
- “Show me weekly trends for the Tuning campaign since launch.”

## Behaviour

- **Read-only** SQLite (`mode=ro`). Custom SQL must be `SELECT` / `WITH` only; mutating keywords are rejected.
- Amounts in the DB are already **GBP** floats from ingest — do not re-convert from micros.
- **Resources:** `tpd://context`, `tpd://campaigns` (campaign name list).

## Project layout

- `server.py` — FastMCP stdio entrypoint
- `db.py` — URI read-only connection, `query()`, `schema_summary()`, SQL guard
- `tools/` — one module per area (`campaigns`, `keywords`, `search_terms`, `trends`, `insights`) plus `schema_meta.py`
