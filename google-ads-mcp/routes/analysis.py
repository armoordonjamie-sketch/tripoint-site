"""Read-only analysis endpoints (aligned with tpd-ads-mcp insight tools)."""

from __future__ import annotations

import statistics
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlmodel import Session

from auth import verify_token
from database import get_session

router = APIRouter(prefix="/api/ads/analysis", tags=["analysis"])


def _utc_yesterday() -> date:
    return datetime.now(timezone.utc).date() - timedelta(days=1)


def _resolve_date_range(
    start_date: str | None,
    end_date: str | None,
) -> tuple[str, str]:
    """
    Resolve [start, end] inclusive:
    - Both omitted → last 30 days ending yesterday (UTC).
    - Only start_date → end = yesterday.
    - Only end_date → start = end − 29 days (30-day window).
    - Both provided → use as-is (validated).
    """
    s_empty = start_date is None or start_date == ""
    e_empty = end_date is None or end_date == ""

    if s_empty and e_empty:
        end_d = _utc_yesterday()
        start_d = end_d - timedelta(days=29)
        return start_d.isoformat(), end_d.isoformat()

    yest = _utc_yesterday()

    try:
        if not s_empty and e_empty:
            sd = date.fromisoformat(start_date)  # type: ignore[arg-type]
            ed = yest
            if sd > ed:
                raise HTTPException(
                    status_code=400,
                    detail="start_date cannot be after end_date (end defaults to yesterday UTC)",
                )
            return sd.isoformat(), ed.isoformat()

        if s_empty and not e_empty:
            ed = date.fromisoformat(end_date)  # type: ignore[arg-type]
            start_d = ed - timedelta(days=29)
            return start_d.isoformat(), ed.isoformat()

        sd = date.fromisoformat(start_date)  # type: ignore[arg-type]
        ed = date.fromisoformat(end_date)  # type: ignore[arg-type]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date; use YYYY-MM-DD") from exc

    if sd > ed:
        raise HTTPException(status_code=400, detail="start_date must be <= end_date")
    return sd.isoformat(), ed.isoformat()


def _fetch_all(session: Session, sql: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    result = session.execute(text(sql), params or {})
    return [dict(row._mapping) for row in result]


@router.get("/health", dependencies=[Depends(verify_token)])
def analysis_health(
    session: Session = Depends(get_session),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> dict[str, Any]:
    """
    Account health: totals, per-campaign metrics (spend, clicks, impressions, conversions,
    CPA, CTR, CPC, impression_share sample), zero-conversion campaigns, low-QS keyword counts,
    top 10 zero-conversion search terms by spend, snapshot IS loss fields.
    """
    ds, de = _resolve_date_range(start_date, end_date)

    totals_sql = """
    SELECT SUM(cost) AS spend, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
           SUM(conversions) AS conversions
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= :ds AND date <= :de
    """
    totals = _fetch_all(session, totals_sql, {"ds": ds, "de": de})
    tot = totals[0] if totals else {}

    per_camp_sql = """
    SELECT campaign,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(impressions) AS impressions,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(clicks) > 0 THEN SUM(cost) / SUM(clicks) ELSE NULL END AS cpc,
           CASE WHEN SUM(conversions) > 0 THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa,
           MAX(impression_share) AS impression_share
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= :ds AND date <= :de
    GROUP BY campaign
    ORDER BY spend DESC
    """
    per_campaign = _fetch_all(session, per_camp_sql, {"ds": ds, "de": de})

    zero_conv = [r for r in per_campaign if (r.get("conversions") or 0) == 0]

    low_qs_sql = """
    SELECT campaign, COUNT(*) AS low_qs_keyword_groups
    FROM (
      SELECT campaign, keyword, ad_group
      FROM daily_metric
      WHERE entity_type = 'keyword' AND date >= :ds AND date <= :de
        AND keyword != ''
        AND quality_score != ''
        AND CAST(quality_score AS REAL) < 5
      GROUP BY campaign, keyword, ad_group
    )
    GROUP BY campaign
    """
    low_qs = _fetch_all(session, low_qs_sql, {"ds": ds, "de": de})

    waste_st_sql = """
    SELECT search_term, campaign, SUM(cost) AS spend, SUM(clicks) AS clicks
    FROM daily_metric
    WHERE entity_type = 'search_term' AND date >= :ds AND date <= :de
      AND search_term != ''
    GROUP BY search_term, campaign
    HAVING SUM(conversions) = 0
    ORDER BY spend DESC
    LIMIT 10
    """
    waste_st = _fetch_all(session, waste_st_sql, {"ds": ds, "de": de})

    is_sql = """
    SELECT name AS campaign, impression_share, budget_lost_is, rank_lost_is
    FROM campaign
    WHERE snapshot_id = (SELECT MAX(id) FROM ad_snapshot)
    ORDER BY name
    """
    is_rows = _fetch_all(session, is_sql)

    return {
        "period": {"start_date": ds, "end_date": de},
        "account_totals": {
            "spend": float(tot.get("spend") or 0),
            "clicks": int(tot.get("clicks") or 0),
            "impressions": int(tot.get("impressions") or 0),
            "conversions": float(tot.get("conversions") or 0),
        },
        "per_campaign": per_campaign,
        "campaigns_with_zero_conversions": zero_conv,
        "low_quality_score_keyword_groups_by_campaign": low_qs,
        "top_10_search_terms_by_spend_zero_conversions": waste_st,
        "impression_share_lost_snapshot_by_campaign": is_rows,
    }


@router.get("/waste", dependencies=[Depends(verify_token)])
def analysis_waste(
    session: Session = Depends(get_session),
    campaign: str | None = Query(default=None),
    min_spend: float = Query(default=5.0),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    """Keywords with spend >= min_spend and zero conversions; sorted by cost desc."""
    ds, de = _resolve_date_range(start_date, end_date)
    sql = """
    SELECT keyword, ad_group, campaign,
           SUM(cost) AS total_cost,
           SUM(clicks) AS total_clicks,
           SUM(impressions) AS total_impressions,
           MAX(match_type) AS match_type,
           MAX(quality_score) AS quality_score
    FROM daily_metric
    WHERE entity_type = 'keyword' AND date >= :ds AND date <= :de
      AND keyword != ''
    """
    params: dict[str, Any] = {"ds": ds, "de": de, "ms": float(min_spend)}
    if campaign is not None and campaign != "":
        sql += " AND campaign = :camp"
        params["camp"] = campaign
    sql += """
    GROUP BY keyword, ad_group, campaign
    HAVING SUM(conversions) = 0 AND SUM(cost) >= :ms
    ORDER BY total_cost DESC
    """
    return _fetch_all(session, sql, params)


@router.get("/campaigns", dependencies=[Depends(verify_token)])
def analysis_campaigns(
    session: Session = Depends(get_session),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    """All campaigns side by side with spend, clicks, conversions, CPA, CTR, CPC, impression_share."""
    ds, de = _resolve_date_range(start_date, end_date)
    sql = """
    SELECT campaign,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(impressions) AS impressions,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(clicks) > 0 THEN SUM(cost) / SUM(clicks) ELSE NULL END AS cpc,
           CASE WHEN SUM(conversions) > 0 THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa,
           MAX(impression_share) AS impression_share
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= :ds AND date <= :de
    GROUP BY campaign
    ORDER BY spend DESC
    """
    return _fetch_all(session, sql, {"ds": ds, "de": de})


def _require_campaign(campaign: str | None) -> str:
    if campaign is None or not str(campaign).strip():
        raise HTTPException(
            status_code=400,
            detail="Query parameter 'campaign' is required",
        )
    return campaign.strip()


@router.get("/trends", dependencies=[Depends(verify_token)])
def analysis_trends(
    session: Session = Depends(get_session),
    campaign: str | None = Query(default=None, description="Campaign name (required)"),
    days: int = Query(default=30, ge=1, le=730),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> dict[str, Any]:
    """
    Weekly aggregates for a campaign.
    Date window: use start_date and/or end_date (partial dates allowed via same rules as /health),
    or omit both to use the last `days` ending yesterday (UTC).
    """
    camp = _require_campaign(campaign)
    if (start_date is not None and start_date != "") or (end_date is not None and end_date != ""):
        ds, de = _resolve_date_range(start_date, end_date)
    else:
        end_d = _utc_yesterday()
        start_d = end_d - timedelta(days=days - 1)
        ds, de = start_d.isoformat(), end_d.isoformat()
    sql = """
    SELECT strftime('%G', date) || '-W' || strftime('%V', date) AS week,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(impressions) AS impressions,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(conversions) > 0
                THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa
    FROM daily_metric
    WHERE entity_type = 'campaign' AND campaign = :camp
      AND date >= :ds AND date <= :de
    GROUP BY strftime('%G', date) || '-W' || strftime('%V', date)
    ORDER BY 1
    """
    rows = _fetch_all(session, sql, {"camp": camp, "ds": ds, "de": de})
    return {
        "campaign": camp,
        "days": days,
        "window": {"start_date": ds, "end_date": de},
        "weekly": rows,
    }


@router.get("/search_terms", dependencies=[Depends(verify_token)])
def analysis_search_terms(
    session: Session = Depends(get_session),
    campaign: str | None = Query(default=None),
    min_spend: float = Query(default=3.0),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    """Search terms aggregated by spend; negative_keyword_candidate true when zero conversions."""
    ds, de = _resolve_date_range(start_date, end_date)
    sql = """
    SELECT search_term,
           campaign,
           ad_group,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(impressions) AS impressions,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(conversions) = 0 THEN 1 ELSE 0 END AS negative_keyword_candidate
    FROM daily_metric
    WHERE entity_type = 'search_term' AND date >= :ds AND date <= :de
      AND search_term != ''
    """
    params: dict[str, Any] = {"ds": ds, "de": de, "ms": float(min_spend)}
    if campaign is not None and campaign != "":
        sql += " AND campaign = :camp"
        params["camp"] = campaign
    sql += """
    GROUP BY search_term, campaign, ad_group
    HAVING SUM(cost) >= :ms
    ORDER BY spend DESC
    LIMIT 200
    """
    rows = _fetch_all(session, sql, params)
    return [
        {
            **r,
            "negative_keyword_candidate": bool(r.get("negative_keyword_candidate")),
        }
        for r in rows
    ]


@router.get("/anomalies", dependencies=[Depends(verify_token)])
def analysis_anomalies(
    session: Session = Depends(get_session),
    campaign: str | None = Query(default=None, description="Campaign name (required)"),
    days: int = Query(default=30, ge=3, le=730),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> dict[str, Any]:
    """
    Days where spend, clicks, CTR, or CPC is more than 2 population standard deviations
    from the mean. direction is spike or drop.
    Date window: start_date/end_date (partial allowed) or last `days` ending yesterday.
    """
    camp = _require_campaign(campaign)
    if (start_date is not None and start_date != "") or (end_date is not None and end_date != ""):
        ds, de = _resolve_date_range(start_date, end_date)
    else:
        end_d = _utc_yesterday()
        start_d = end_d - timedelta(days=days - 1)
        ds, de = start_d.isoformat(), end_d.isoformat()
    sql = """
    SELECT date, cost AS spend, clicks, impressions, ctr, avg_cpc AS cpc
    FROM daily_metric
    WHERE entity_type = 'campaign' AND campaign = :camp
      AND date >= :ds AND date <= :de
    ORDER BY date
    """
    rows = _fetch_all(session, sql, {"camp": camp, "ds": ds, "de": de})
    if not rows:
        return {
            "campaign": camp,
            "days": days,
            "window": {"start_date": ds, "end_date": de},
            "anomalies": [],
        }

    spend = [float(r["spend"] or 0) for r in rows]
    clicks = [float(r["clicks"] or 0) for r in rows]
    ctr_list = []
    for r in rows:
        imp = r.get("impressions") or 0
        cl = r.get("clicks") or 0
        ctr_list.append((cl / imp) if imp > 0 else 0.0)
    cpc_list = [float(r["cpc"] or 0) for r in rows]

    anomalies: list[dict[str, Any]] = []

    def scan(metric: str, values: list[float]) -> None:
        clean = [v for v in values if v == v]
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
                direction = "spike" if z > 0 else "drop"
                anomalies.append(
                    {
                        "date": r["date"],
                        "metric": metric,
                        "value": v,
                        "mean": round(mu, 4),
                        "std_dev": round(sigma, 4),
                        "z_score": round(z, 3),
                        "direction": direction,
                    }
                )

    scan("spend", spend)
    scan("clicks", clicks)
    scan("ctr", ctr_list)
    scan("cpc", cpc_list)

    anomalies.sort(key=lambda x: (x["date"], x["metric"]))
    return {
        "campaign": camp,
        "days": days,
        "window": {"start_date": ds, "end_date": de},
        "anomalies": anomalies,
    }
