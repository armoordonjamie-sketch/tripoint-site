"""Campaign-level analysis tools."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

import db
from tools.dates import default_yesterday, resolve_date_range


def get_campaign_summary(
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Aggregate daily_metric for entity_type='campaign' in the date range.
    Per campaign: total_spend, total_clicks, total_impressions, total_conversions,
    avg_ctr, avg_cpc, blended_cpa, days_active. Sorted by total_spend desc.
    """
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT campaign,
           SUM(cost) AS total_spend,
           SUM(clicks) AS total_clicks,
           SUM(impressions) AS total_impressions,
           SUM(conversions) AS total_conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS avg_ctr,
           CASE WHEN SUM(clicks) > 0
                THEN SUM(cost) / SUM(clicks) ELSE NULL END AS avg_cpc,
           CASE WHEN SUM(conversions) > 0
                THEN SUM(cost) / SUM(conversions) ELSE NULL END AS blended_cpa,
           COUNT(DISTINCT date) AS days_active
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= ? AND date <= ?
    GROUP BY campaign
    ORDER BY total_spend DESC
    """
    rows = db.query(sql, (ds, de))
    return _floatify(rows)


def get_campaign_daily(
    campaign_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """Day-by-day rows for one campaign from daily_metric (entity_type campaign)."""
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT date, campaign, impressions, clicks, cost, conversions, ctr, avg_cpc,
           cost_per_conversion, impression_share
    FROM daily_metric
    WHERE entity_type = 'campaign' AND campaign = ? AND date >= ? AND date <= ?
    ORDER BY date
    """
    rows = db.query(sql, (campaign_name, ds, de))
    return _floatify(rows)


def compare_campaigns(
    start_date: str | None = None,
    end_date: str | None = None,
) -> dict[str, Any]:
    """
    Side-by-side campaigns for the period: spend, clicks, conversions, CPA,
    impression share (from latest snapshot row when available).
    Highlights lowest CPA and highest rank lost IS (proxy for IS loss).
    """
    ds, de = resolve_date_range(start_date, end_date)
    daily_sql = """
    SELECT campaign,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(conversions) > 0 THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= ? AND date <= ?
    GROUP BY campaign
    """
    daily = db.query(daily_sql, (ds, de))
    snap_sql = """
    SELECT c.name AS campaign,
           c.impression_share,
           c.budget_lost_is,
           c.rank_lost_is
    FROM campaign c
    WHERE c.snapshot_id = (SELECT MAX(id) FROM ad_snapshot)
    """
    snap = {r["campaign"]: r for r in db.query(snap_sql)}
    merged = []
    lowest_cpa: dict[str, Any] | None = None
    highest_rank_loss: dict[str, Any] | None = None
    for r in daily:
        cname = r["campaign"]
        snap_row = snap.get(cname, {})
        cpa = r["cpa"]
        rank_lost = snap_row.get("rank_lost_is") or ""
        row = {
            "campaign": cname,
            "spend": r["spend"],
            "clicks": r["clicks"],
            "conversions": r["conversions"],
            "cpa": cpa,
            "impression_share_snapshot": snap_row.get("impression_share"),
            "budget_lost_is_snapshot": snap_row.get("budget_lost_is"),
            "rank_lost_is_snapshot": snap_row.get("rank_lost_is"),
        }
        merged.append(_floatify_row(row))
        if cpa is not None and cpa > 0:
            if lowest_cpa is None or cpa < lowest_cpa["cpa"]:
                lowest_cpa = {"campaign": cname, "cpa": cpa}
        try:
            rl = float(str(rank_lost).replace("%", "").strip() or 0)
        except ValueError:
            rl = 0.0
        if highest_rank_loss is None or rl > highest_rank_loss["rank_lost_is_numeric"]:
            highest_rank_loss = {
                "campaign": cname,
                "rank_lost_is": rank_lost,
                "rank_lost_is_numeric": rl,
            }
    return {
        "period": {"start_date": ds, "end_date": de},
        "campaigns": merged,
        "highlight_lowest_cpa": lowest_cpa,
        "highlight_highest_rank_lost_impression_share": highest_rank_loss,
    }


def get_campaign_momentum(
    campaign_name: str,
    days_back: int = 7,
) -> dict[str, Any]:
    """
    Compare last N days vs the prior N days for a campaign (daily_metric campaign rows).
    Deltas for spend, clicks, conversions, CTR, CPC. Flags >20% swing as significant_change.
    """
    if days_back < 1:
        days_back = 7
    end = default_yesterday()
    last_end = end.isoformat()
    last_start = (end - timedelta(days=days_back - 1)).isoformat()
    prev_end = (end - timedelta(days=days_back)).isoformat()
    prev_start = (end - timedelta(days=days_back * 2 - 1)).isoformat()

    def agg(s: str, e: str) -> dict[str, Any]:
        sql = """
        SELECT SUM(cost) AS spend, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
               SUM(conversions) AS conversions
        FROM daily_metric
        WHERE entity_type = 'campaign' AND campaign = ? AND date >= ? AND date <= ?
        """
        r = db.query(sql, (campaign_name, s, e))
        if not r:
            return {
                "spend": 0.0,
                "clicks": 0,
                "impressions": 0,
                "conversions": 0.0,
                "ctr": None,
                "cpc": None,
            }
        x = r[0]
        imp = x["impressions"] or 0
        cl = x["clicks"] or 0
        sp = float(x["spend"] or 0)
        conv = float(x["conversions"] or 0)
        ctr = (cl / imp) if imp > 0 else None
        cpc = (sp / cl) if cl > 0 else None
        return {
            "spend": sp,
            "clicks": cl,
            "impressions": imp,
            "conversions": conv,
            "ctr": ctr,
            "cpc": cpc,
        }

    recent = agg(last_start, last_end)
    prior = agg(prev_start, prev_end)

    def delta_pct(old: float | None, new: float | None) -> tuple[float | None, bool]:
        if old is None or new is None:
            return None, False
        if old == 0:
            return None, abs(new) > 1e-6
        pct = (new - old) / abs(old) * 100.0
        return pct, abs(pct) > 20.0

    spend_d, spend_sig = delta_pct(prior["spend"], recent["spend"])
    clicks_d, clicks_sig = delta_pct(float(prior["clicks"]), float(recent["clicks"]))
    conv_d, conv_sig = delta_pct(prior["conversions"], recent["conversions"])
    ctr_d, ctr_sig = delta_pct(prior["ctr"], recent["ctr"])
    cpc_d, cpc_sig = delta_pct(prior["cpc"], recent["cpc"])

    return {
        "campaign": campaign_name,
        "days_back": days_back,
        "recent_window": {"start": last_start, "end": last_end, "metrics": recent},
        "prior_window": {"start": prev_start, "end": prev_end, "metrics": prior},
        "deltas_percent": {
            "spend": spend_d,
            "clicks": clicks_d,
            "conversions": conv_d,
            "ctr": ctr_d,
            "cpc": cpc_d,
        },
        "significant_change": {
            "spend": spend_sig,
            "clicks": clicks_sig,
            "conversions": conv_sig,
            "ctr": ctr_sig,
            "cpc": cpc_sig,
        },
    }


def _floatify(rows: list[dict]) -> list[dict]:
    return [_floatify_row(r) for r in rows]


def _floatify_row(r: dict) -> dict:
    out = {}
    for k, v in r.items():
        if isinstance(v, float):
            out[k] = round(v, 6) if v is not None else None
        else:
            out[k] = v
    return out
