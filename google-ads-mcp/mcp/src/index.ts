/**
 * TPD Ads analysis MCP server — stdio transport, read-only GET wrappers.
 */

import path from "node:path";
import { config } from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v3";

config({ path: path.join(__dirname, "..", ".env") });

const BASE_URL = "https://beta.tripointdiagnostics.co.uk/api/ads/analysis";

function appendParams(
  search: URLSearchParams,
  record: Record<string, string | number | null | undefined>,
): void {
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    search.set(key, String(value));
  }
}

async function callAnalysis(
  path: string,
  query: Record<string, string | number | null | undefined>,
): Promise<string> {
  const secret = process.env.ADS_API_SECRET;
  if (!secret) {
    return "Error: ADS_API_SECRET is not set (copy mcp/.env.example to mcp/.env).";
  }

  const search = new URLSearchParams();
  appendParams(search, query);
  const qs = search.toString();
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${secret}` },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `Request failed: ${msg}`;
  }

  const body = await res.text();
  if (!res.ok) {
    return `HTTP ${res.status} ${res.statusText}\n${body}`;
  }

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

const dateRangeShape = {
  start_date: z
    .string()
    .optional()
    .describe(
      "YYYY-MM-DD. Omit with end_date for default window. If only start_date: through yesterday UTC.",
    ),
  end_date: z
    .string()
    .optional()
    .describe(
      "YYYY-MM-DD. If only end_date: 30-day window ending on this date. Both omitted: last 30 days ending yesterday.",
    ),
};

function main(): void {
  const server = new McpServer({
    name: "tpd-ads-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "get_ad_health",
    {
      description:
        "Account-level Google Ads health from daily metrics: totals, per-campaign KPIs, zero-conversion campaigns, low quality-score keyword counts, top zero-conversion search terms by spend, and latest snapshot impression-share loss fields. Use for broad diagnostics and executive summaries.",
      inputSchema: z.object(dateRangeShape),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await callAnalysis("/health", args) }],
    }),
  );

  server.registerTool(
    "get_ad_waste",
    {
      description:
        "Keywords with zero conversions and spend above min_spend in the date window; good for finding wasted spend to pause or negate.",
      inputSchema: z.object({
        ...dateRangeShape,
        campaign: z
          .string()
          .optional()
          .describe("Filter to a single campaign name; omit for all campaigns."),
        min_spend: z
          .number()
          .optional()
          .describe("Minimum keyword spend to include (default on API is 5)."),
      }),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await callAnalysis("/waste", args) }],
    }),
  );

  server.registerTool(
    "get_campaigns",
    {
      description:
        "Compare all campaigns in the window: spend, clicks, impressions, conversions, CTR, CPC, CPA, impression share. Use for ranking campaigns or building comparison tables.",
      inputSchema: z.object(dateRangeShape),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await callAnalysis("/campaigns", args) }],
    }),
  );

  server.registerTool(
    "get_trends",
    {
      description:
        "Weekly rolled-up metrics for one campaign (spend, clicks, impressions, conversions, CTR, CPA). Requires exact campaign name. Optional explicit date range or rolling `days` ending yesterday.",
      inputSchema: z.object({
        campaign: z
          .string()
          .min(1)
          .describe("Required. Exact Google Ads campaign name (API returns 400 if missing)."),
        ...dateRangeShape,
        days: z
          .number()
          .int()
          .min(1)
          .max(730)
          .optional()
          .describe(
            "Rolling window length in days ending yesterday; used only when both start_date and end_date are omitted (default 30).",
          ),
      }),
    },
    async ({ campaign, start_date, end_date, days }) => ({
      content: [
        {
          type: "text" as const,
          text: await callAnalysis("/trends", {
            campaign,
            start_date,
            end_date,
            days,
          }),
        },
      ],
    }),
  );

  server.registerTool(
    "get_anomalies",
    {
      description:
        "Day-level outliers for one campaign: spend, clicks, CTR, or CPC beyond ~2σ vs the window mean. Requires campaign name. Good for spotting spikes, drops, or data issues.",
      inputSchema: z.object({
        campaign: z
          .string()
          .min(1)
          .describe("Required. Exact Google Ads campaign name (API returns 400 if missing)."),
        ...dateRangeShape,
        days: z
          .number()
          .int()
          .min(3)
          .max(730)
          .optional()
          .describe(
            "Rolling window when dates omitted (default 30; API minimum 3). Ignored when start_date or end_date is set.",
          ),
      }),
    },
    async ({ campaign, start_date, end_date, days }) => ({
      content: [
        {
          type: "text" as const,
          text: await callAnalysis("/anomalies", {
            campaign,
            start_date,
            end_date,
            days,
          }),
        },
      ],
    }),
  );

  server.registerTool(
    "get_search_terms",
    {
      description:
        "Search terms aggregated by spend in the window with conversion totals; flags negative-keyword candidates (zero conversions). Optional campaign and min_spend filters.",
      inputSchema: z.object({
        ...dateRangeShape,
        campaign: z.string().optional().describe("Filter to one campaign; omit for all."),
        min_spend: z
          .number()
          .optional()
          .describe("Minimum term spend (default on API is 3)."),
      }),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await callAnalysis("/search_terms", args) }],
    }),
  );

  const transport = new StdioServerTransport();
  void server.connect(transport);
}

main();
