"""Cross-entity insights, anomalies, and custom read-only SQL."""

from __future__ import annotations

import re
import statistics
from datetime import timedelta
from typing import Any

import db
from tools.dates import default_yesterday, resolve_date_range

_MAX_CUSTOM_ROWS = 500


def get_anomalies(
    campaign_name: str,
    lookback_days: int = 30,
) -> dict[str, Any]:
    """
    For spend, clicks, CTR, CPC on daily campaign rows: mean and stdev over lookback.
    Flags days more than 2 sigma from mean as spike (high) or drop (low).
    """
    if lookback_days < 3:
        lookback_days = 30
    end = default_yesterday()
    start = end - timedelta(days=lookback_days - 1)
    sql = """
    SELECT date, cost AS spend, clicks, impressions, ctr, avg_cpc AS cpc
    FROM daily_metric
    WHERE entity_type = 'campaign' AND campaign = ? AND date >= ? AND date <= ?
    ORDER BY date
    """
    rows = db.query(sql, (campaign_name, start.isoformat(), end.isoformat()))
    if not rows:
        return {
            "campaign": campaign_name,
            "lookback_days": lookback_days,
            "window": {"start": start.isoformat(), "end": end.isoformat()},
            "anomalies": [],
            "note": "no daily rows in window",
        }

    def series(key: str) -> list[float]:
        out = []
        for r in rows:
            v = r.get(key)
            if v is None:
                out.append(float("nan"))
            else:
                out.append(float(v))
        return out

    def derived_ctr() -> list[float]:
        out = []
        for r in rows:
            imp = r.get("impressions") or 0
            cl = r.get("clicks") or 0
            out.append((cl / imp) if imp > 0 else 0.0)
        return out

    spend = [float(r["spend"] or 0) for r in rows]
    clicks = [float(r["clicks"] or 0) for r in rows]
    ctr_list = derived_ctr()
    cpc_list = [float(r["cpc"] or 0) for r in rows]

    anomalies: list[dict[str, Any]] = []

    def scan(name: str, values: list[float]) -> None:
        clean = [v for v in values if v == v]  # drop nan
        if len(clean) < 3:
            return
        mu = statistics.mean(clean)
        try:
            sigma = statistics.pstdev(clean)
        except statistics.StatisticsError:
            return
        if sigma == 0:
            return
        for i, r in enumerate(rows):
            v = values[i]
            if v != v:
                continue
            z = (v - mu) / sigma
            if abs(z) > 2:
                kind = "spike" if z > 0 else "drop"
                anomalies.append(
                    {
                        "date": r["date"],
                        "metric": name,
                        "value": v,
                        "mean": round(mu, 4),
                        "stdev": round(sigma, 4),
                        "z_score": round(z, 3),
                        "kind": kind,
                    }
                )

    scan("spend", spend)
    scan("clicks", clicks)
    scan("ctr", ctr_list)
    scan("cpc", cpc_list)

    anomalies.sort(key=lambda x: (x["date"], x["metric"]))
    return {
        "campaign": campaign_name,
        "lookback_days": lookback_days,
        "window": {"start": start.isoformat(), "end": end.isoformat()},
        "anomalies": anomalies,
    }


def get_account_health_summary(
    start_date: str | None = None,
    end_date: str | None = None,
) -> dict[str, Any]:
    """
    Account-level snapshot: totals, CPA by campaign, zero-conversion campaigns,
    low quality score keyword counts, top wasted search terms, IS loss from latest snapshot.
    """
    ds, de = resolve_date_range(start_date, end_date)

    totals_sql = """
    SELECT SUM(cost) AS spend, SUM(clicks) AS clicks, SUM(conversions) AS conversions
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= ? AND date <= ?
    """
    totals = db.query(totals_sql, (ds, de))
    tot = totals[0] if totals else {}

    cpa_sql = """
    SELECT campaign,
           SUM(cost) AS spend,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(conversions) > 0 THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= ? AND date <= ?
    GROUP BY campaign
    ORDER BY spend DESC
    """
    cpa_rows = db.query(cpa_sql, (ds, de))

    zero_conv = [r for r in cpa_rows if (r.get("conversions") or 0) == 0]

    low_qs_sql = """
    SELECT campaign, COUNT(*) AS low_qs_keyword_groups
    FROM (
      SELECT campaign, keyword, ad_group
      FROM daily_metric
      WHERE entity_type = 'keyword' AND date >= ? AND date <= ?
        AND keyword != ''
        AND quality_score != ''
        AND CAST(quality_score AS REAL) < 5
      GROUP BY campaign, keyword, ad_group
    )
    GROUP BY campaign
    """
    low_qs = db.query(low_qs_sql, (ds, de))

    waste_st_sql = """
    SELECT search_term, campaign, SUM(cost) AS spend, SUM(clicks) AS clicks
    FROM daily_metric
    WHERE entity_type = 'search_term' AND date >= ? AND date <= ?
      AND search_term != ''
    GROUP BY search_term, campaign
    HAVING SUM(conversions) = 0
    ORDER BY spend DESC
    LIMIT 5
    """
    waste_st = db.query(waste_st_sql, (ds, de))

    is_sql = """
    SELECT name AS campaign, impression_share, budget_lost_is, rank_lost_is
    FROM campaign
    WHERE snapshot_id = (SELECT MAX(id) FROM ad_snapshot)
    ORDER BY name
    """
    is_rows = db.query(is_sql)

    return {
        "period": {"start_date": ds, "end_date": de},
        "account_totals": {
            "spend": float(tot.get("spend") or 0),
            "clicks": int(tot.get("clicks") or 0),
            "conversions": float(tot.get("conversions") or 0),
        },
        "cpa_by_campaign": cpa_rows,
        "campaigns_with_zero_conversions": zero_conv,
        "low_quality_score_keyword_groups_by_campaign": low_qs,
        "top_5_search_terms_by_spend_zero_conversions": waste_st,
        "impression_share_snapshot_by_campaign": is_rows,
    }


def get_impression_share_analysis(
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Per campaign per day: impression_share from daily_metric; budget_lost_is and rank_lost_is
    repeated from the latest snapshot campaign row (not available per day in this schema).
    """
    ds, de = resolve_date_range(start_date, end_date)
    daily_sql = """
    SELECT date, campaign, impression_share
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= ? AND date <= ?
    ORDER BY campaign, date
    """
    daily = db.query(daily_sql, (ds, de))
    snap = {
        r["campaign"]: r
        for r in db.query(
            """
            SELECT name AS campaign, budget_lost_is, rank_lost_is
            FROM campaign WHERE snapshot_id = (SELECT MAX(id) FROM ad_snapshot)
            """
        )
    }
    out = []
    for r in daily:
        c = r["campaign"]
        s = snap.get(c, {})
        out.append(
            {
                "date": r["date"],
                "campaign": c,
                "impression_share": r.get("impression_share"),
                "budget_lost_is_snapshot": s.get("budget_lost_is"),
                "rank_lost_is_snapshot": s.get("rank_lost_is"),
            }
        )
    return out


def run_custom_query(sql: str) -> dict[str, Any]:
    """
    Run a read-only SELECT (or WITH) capped at 500 rows. Prefer named tools when possible.
    """
    s = (sql or "").strip().rstrip(";")
    if not s:
        return {"rows": [], "truncated": False, "warning": None}
    lower = s.lower()
    if not re.search(r"\blimit\s+\d", lower):
        s = s + " LIMIT " + str(_MAX_CUSTOM_ROWS + 1)
    rows = db.query(s)
    truncated = len(rows) > _MAX_CUSTOM_ROWS
    if truncated:
        rows = rows[:_MAX_CUSTOM_ROWS]
    return {
        "rows": rows,
        "truncated": truncated,
        "warning": (
            "Result truncated to " + str(_MAX_CUSTOM_ROWS) + " rows."
            if truncated
            else None
        ),
        "row_count_returned": len(rows),
    }
