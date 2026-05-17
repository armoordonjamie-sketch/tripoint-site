"""MCP tool registration for TriPoint Google Ads."""

from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from tools import campaigns, insights, keywords, schema_meta, search_terms, trends

_TOOL_FUNCTIONS = [
    schema_meta.describe_schema,
    schema_meta.get_date_coverage,
    schema_meta.get_business_context,
    campaigns.get_campaign_summary,
    campaigns.get_campaign_daily,
    campaigns.compare_campaigns,
    campaigns.get_campaign_momentum,
    keywords.get_top_keywords,
    keywords.get_zero_conversion_keywords,
    keywords.get_low_quality_score_keywords,
    keywords.get_keyword_trends,
    keywords.get_match_type_breakdown,
    search_terms.get_top_search_terms,
    search_terms.get_irrelevant_search_terms,
    search_terms.get_search_term_expansion,
    trends.get_weekly_trends,
    trends.get_day_of_week_breakdown,
    trends.get_monthly_summary,
    trends.get_spend_pacing,
    insights.get_anomalies,
    insights.get_account_health_summary,
    insights.get_impression_share_analysis,
    insights.run_custom_query,
]


def register_tools(mcp: FastMCP) -> int:
    for fn in _TOOL_FUNCTIONS:
        mcp.tool()(fn)
    return len(_TOOL_FUNCTIONS)
