"""Search term analysis tools."""

from __future__ import annotations

from typing import Any

import db
from tools.dates import resolve_date_range


def get_top_search_terms(
    campaign_name: str,
    metric: str = "cost",
    limit: int = 20,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Top N search terms by metric (cost, clicks, conversions, ctr, cpa) for the campaign.
    Uses daily_metric entity_type search_term.
    """
    ds, de = resolve_date_range(start_date, end_date)
    metric = (metric or "cost").lower().strip()
    if metric not in ("cost", "clicks", "conversions", "ctr", "cpa"):
        metric = "cost"
    lim = max(1, min(int(limit), 500))

    base = """
    SELECT search_term, ad_group, campaign,
           SUM(cost) AS total_cost,
           SUM(clicks) AS total_clicks,
           SUM(impressions) AS total_impressions,
           SUM(conversions) AS total_conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(conversions) > 0
                THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa,
           MAX(match_type) AS match_type
    FROM daily_metric
    WHERE entity_type = 'search_term' AND campaign = ? AND date >= ? AND date <= ?
      AND search_term != ''
    GROUP BY search_term, ad_group, campaign
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


def get_irrelevant_search_terms(
    campaign_name: str,
    min_spend: float = 5.0,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Search terms with spend above min_spend and zero conversions — negative keyword candidates.
    matched_keyword is not stored in daily_metric; field is null (use ad_group for context).
    """
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT search_term, ad_group, campaign,
           SUM(cost) AS total_cost,
           SUM(clicks) AS total_clicks,
           SUM(impressions) AS total_impressions,
           MAX(match_type) AS match_type,
           NULL AS matched_keyword
    FROM daily_metric
    WHERE entity_type = 'search_term' AND campaign = ? AND date >= ? AND date <= ?
      AND search_term != ''
    GROUP BY search_term, ad_group, campaign
    HAVING SUM(conversions) = 0 AND SUM(cost) >= ?
    ORDER BY total_cost DESC
    """
    return db.query(sql, (campaign_name, ds, de, float(min_spend)))


def get_search_term_expansion(
    campaign_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Search terms with clicks > 0 that are not already an exact keyword (latest snapshot).
    Returns search_term, clicks, cost, conversions, exists_as_keyword (always 0 for returned rows).
    """
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT agg.search_term,
           agg.clicks,
           agg.cost,
           agg.conversions,
           0 AS exists_as_keyword
    FROM (
      SELECT search_term,
             SUM(clicks) AS clicks,
             SUM(cost) AS cost,
             SUM(conversions) AS conversions
      FROM daily_metric
      WHERE entity_type = 'search_term' AND campaign = ? AND date >= ? AND date <= ?
        AND search_term != ''
      GROUP BY search_term
      HAVING SUM(clicks) > 0
    ) AS agg
    WHERE NOT EXISTS (
      SELECT 1 FROM keyword k
      WHERE k.snapshot_id = (SELECT MAX(id) FROM ad_snapshot)
        AND k.campaign = ?
        AND LOWER(TRIM(k.keyword)) = LOWER(TRIM(agg.search_term))
    )
    ORDER BY agg.clicks DESC, agg.cost DESC
    """
    return db.query(sql, (campaign_name, ds, de, campaign_name))
