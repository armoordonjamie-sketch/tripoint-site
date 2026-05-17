"""Time-series and pacing tools."""

from __future__ import annotations

import calendar
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

import db
from tools.dates import resolve_date_range

_LONDON = ZoneInfo("Europe/London")


def get_weekly_trends(
    campaign_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """Aggregate daily_metric campaign rows by ISO week (year + week)."""
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT strftime('%G', date) || '-W' || strftime('%V', date) AS iso_week,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(impressions) AS impressions,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(conversions) > 0
                THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa
    FROM daily_metric
    WHERE entity_type = 'campaign' AND campaign = ? AND date >= ? AND date <= ?
    GROUP BY iso_week
    ORDER BY iso_week
    """
    return db.query(sql, (campaign_name, ds, de))


def get_day_of_week_breakdown(
    campaign_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    Average spend, clicks, conversions by weekday (Monday=1 .. Sunday=7) using SQLite %u.
    """
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT CAST(strftime('%u', date) AS INTEGER) AS weekday,
           COUNT(*) AS day_count,
           SUM(cost) AS sum_spend,
           SUM(clicks) AS sum_clicks,
           SUM(conversions) AS sum_conversions,
           SUM(cost) / COUNT(*) AS avg_spend,
           CAST(SUM(clicks) AS REAL) / COUNT(*) AS avg_clicks,
           CAST(SUM(conversions) AS REAL) / COUNT(*) AS avg_conversions
    FROM daily_metric
    WHERE entity_type = 'campaign' AND campaign = ? AND date >= ? AND date <= ?
    GROUP BY weekday
    ORDER BY weekday
    """
    return db.query(sql, (campaign_name, ds, de))


def get_monthly_summary(
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[dict[str, Any]]:
    """Month-by-month totals across all campaigns (daily_metric campaign rows)."""
    ds, de = resolve_date_range(start_date, end_date)
    sql = """
    SELECT strftime('%Y-%m', date) AS month,
           SUM(cost) AS spend,
           SUM(clicks) AS clicks,
           SUM(impressions) AS impressions,
           SUM(conversions) AS conversions,
           CASE WHEN SUM(impressions) > 0
                THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE NULL END AS ctr,
           CASE WHEN SUM(conversions) > 0
                THEN SUM(cost) / SUM(conversions) ELSE NULL END AS cpa
    FROM daily_metric
    WHERE entity_type = 'campaign' AND date >= ? AND date <= ?
    GROUP BY month
    ORDER BY month
    """
    return db.query(sql, (ds, de))


def get_spend_pacing(
    campaign_name: str,
    current_month_budget: float,
) -> dict[str, Any]:
    """
    Month-to-date spend in Europe/London calendar month vs monthly budget.
    Projects month-end spend at current daily rate; labels pacing status.
    """
    budget = float(current_month_budget)
    now = datetime.now(_LONDON)
    today = now.date()
    month_start = today.replace(day=1)
    _, dim = calendar.monthrange(today.year, today.month)
    month_end = today.replace(day=dim)

    start_s = month_start.isoformat()
    end_s = today.isoformat()

    sql = """
    SELECT SUM(cost) AS spend, COUNT(DISTINCT date) AS days_with_data
    FROM daily_metric
    WHERE entity_type = 'campaign' AND campaign = ? AND date >= ? AND date <= ?
    """
    rows = db.query(sql, (campaign_name, start_s, end_s))
    spend = float(rows[0]["spend"] or 0) if rows else 0.0
    days_with_data = int(rows[0]["days_with_data"] or 0) if rows else 0

    days_elapsed = today.day
    days_in_month = dim
    daily_rate = spend / days_elapsed if days_elapsed > 0 else 0.0
    projected = daily_rate * days_in_month

    if budget <= 0:
        status = "unknown"
    elif projected > budget * 1.05:
        status = "over-pacing"
    elif projected < budget * 0.95:
        status = "under-pacing"
    else:
        status = "on-track"

    return {
        "campaign": campaign_name,
        "timezone": "Europe/London",
        "month": today.strftime("%Y-%m"),
        "month_start": start_s,
        "today": end_s,
        "month_end": month_end.isoformat(),
        "days_elapsed_in_month": days_elapsed,
        "days_in_month": days_in_month,
        "spend_mtd": spend,
        "days_with_daily_rows": days_with_data,
        "avg_daily_spend_assumed": round(daily_rate, 4),
        "current_month_budget": budget,
        "projected_month_end_spend": round(projected, 2),
        "pacing_status": status,
    }
