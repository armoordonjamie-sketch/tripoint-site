# tpd-ads-mcp

MCP server wrapping the TPD ads analysis API for Claude.ai (read-only GET tools over stdio).

## Setup

```bash
cd google-ads-mcp/mcp
copy .env.example .env
```

Edit `.env` and set `ADS_API_SECRET` to match the FastAPI `ADS_API_SECRET`.

```bash
npm install
npm run build
```

## Claude Desktop — MCP servers

In **Settings → Integrations → MCP servers**, add:

```json
{
  "mcpServers": {
    "tpd-ads": {
      "command": "node",
      "args": ["C:\\Users\\JamiePC\\Desktop\\TriPoint-site\\google-ads-mcp\\mcp\\dist\\index.js"]
    }
  }
}
```

Ensure `npm run build` has been run so `dist/index.js` exists. Adjust the path if your project lives elsewhere.

The server loads **`mcp/.env`** via path relative to `dist/index.js`, so `ADS_API_SECRET` is picked up even when the client’s working directory is not `mcp/`.

## Available tools

| Tool | Description |
|------|-------------|
| `get_ad_health` | Account health rollup: totals, per-campaign metrics, zero-conversion campaigns, low QS counts, top zero-conv search terms, snapshot IS fields. |
| `get_ad_waste` | Keywords with zero conversions above a spend threshold; optional campaign filter. |
| `get_campaigns` | Side-by-side campaign performance for the date window. |
| `get_trends` | Weekly aggregates for a **single** campaign; requires `campaign`. |
| `get_anomalies` | Statistical day-level spikes/drops for a **single** campaign; requires `campaign`. |
| `get_search_terms` | Aggregated search terms with negative-keyword candidate flags. |

## Scope

This MCP server is **read-only**. It only calls GET endpoints under `/api/ads/analysis`. It does not run the FastAPI app, open SQLite directly, or call ingest routes.
