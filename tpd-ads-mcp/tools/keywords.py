"""Keyword analysis tools."""

from __future__ import annotations

from typing import Any

import db
from tools.dates import resolve_date_range


def get_top_keywords(
    campaign_name: str,
    metric: str = "cost",
    limit: int = 20,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Top N keywords by metric for the campaign and period (daily_metric entity keyword).
    metric: cost, clicks, conversions, ctr, cpa.
    Includes quality_score, match_type, impression_share (aggregated as max text sample).
    """
    ds, de = resolve_date_range(start_date, end_date)
    metric = (metric or "cost").lower().strip()
    if metric not in ("cost", "clicks", "conversions", "ctr", "cpa"):
        metric = "cost"
    lim = max(1, min(int(limit), 500))

    base = """
    SELECT keyword, ad_group, campaign,
           SUM(cost) AS total_cost,
           SUM(clicks) AS total_clicks,
           SUM(impressions) AS total_impressions,
           SUM(conversions) AS total_conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(conversions) > 0
                THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa,
           MAX(match_type) AS match_type,
           MAX(quality_score) AS quality_score,
           MAX(impression_share) AS impression_share
    FROM daily_metric
    WHERE entity_type = 'keyword' AND campaign = ? AND date >= ? AND date <= ?
      AND keyword != ''
    GROUP BY keyword, ad_group, campaign
    """
    order = {
        "cost": "total_cost DESC",
        "clicks": "total_clicks DESC",
        "conversions": "total_conversions DESC",
        "ctr": "ctr DESC",
        "cpa": "cpa ASC",
    }[metric]
    sql = base + " ORDER BY " + order + f" LIMIT {lim}"
    return db.query(sql, (campaign_name, ds, de))


def get_zero_conversion_keywords(
    campaign_name: str,
    min_spend: float = 5.0,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Keywords with spend over min_spend (default £5) and zero conversions in the period.
    Sorted by cost desc. Primary waste finder.
    """
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT keyword, ad_group, campaign,
           SUM(cost) AS total_cost,
           SUM(clicks) AS total_clicks,
           SUM(impressions) AS total_impressions,
           MAX(match_type) AS match_type,
           MAX(quality_score) AS quality_score
    FROM daily_metric
    WHERE entity_type = 'keyword' AND campaign = ? AND date >= ? AND date <= ?
      AND keyword != ''
    GROUP BY keyword, ad_group, campaign
    HAVING SUM(conversions) = 0 AND SUM(cost) >= ?
    ORDER BY total_cost DESC
    """
    return db.query(sql, (campaign_name, ds, de, float(min_spend)))


def get_low_quality_score_keywords(
    campaign_name: str,
    threshold: int = 5,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """Keywords with numeric quality_score strictly below threshold. Includes cost and clicks."""
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT keyword, ad_group, campaign,
           MAX(quality_score) AS quality_score,
           SUM(cost) AS total_cost,
           SUM(clicks) AS total_clicks,
           SUM(impressions) AS total_impressions,
           MAX(match_type) AS match_type
    FROM daily_metric
    WHERE entity_type = 'keyword' AND campaign = ? AND date >= ? AND date <= ?
      AND keyword != ''
      AND quality_score != ''
      AND CAST(quality_score AS REAL) < ?
    GROUP BY keyword, ad_group, campaign
    ORDER BY total_cost DESC
    """
    return db.query(sql, (campaign_name, ds, de, int(threshold)))


def get_keyword_trends(
    keyword_text: str,
    campaign_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """Daily performance for one keyword text within a campaign."""
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT date, keyword, ad_group, campaign, impressions, clicks, cost, conversions,
           ctr, avg_cpc, cost_per_conversion, impression_share, quality_score, match_type
    FROM daily_metric
    WHERE entity_type = 'keyword' AND campaign = ? AND keyword = ?
      AND date >= ? AND date <= ?
    ORDER BY date
    """
    return db.query(sql, (campaign_name, keyword_text, ds, de))


def get_match_type_breakdown(
    campaign_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """Spend, clicks, conversions, CTR, CPA by match_type for a campaign."""
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT COALESCE(NULLIF(TRIM(match_type), ''), '(unknown)') AS match_type,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(impressions) AS impressions,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(conversions) > 0
                THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa
    FROM daily_metric
    WHERE entity_type = 'keyword' AND campaign = ? AND date >= ? AND date <= ?
    GROUP BY 1
    ORDER BY spend DESC
    """
    return db.query(sql, (campaign_name, ds, de))
