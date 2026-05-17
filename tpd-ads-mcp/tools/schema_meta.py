"""Schema discovery, coverage, and business context."""

from __future__ import annotations

import json
import os
from typing import Any

import db


def describe_schema() -> dict[str, Any]:
    """Return all table names, column names and types. Use before ad-hoc analysis."""
    return db.schema_summary()


def get_date_coverage() -> list[dict[str, Any]]:
    """Earliest/latest date in daily_metric per campaign plus distinct day counts."""
    sql = """
    SELECT campaign,
           MIN(date) AS earliest_date,
           MAX(date) AS latest_date,
           COUNT(DISTINCT date) AS total_days
    FROM daily_metric
    WHERE entity_type = 'campaign'
    GROUP BY campaign
    ORDER BY campaign
    """
    rows = db.query(sql)
    return rows if rows else []


def _stats_counts() -> dict[str, Any]:
    snap = db.query("SELECT COUNT(*) AS n FROM ad_snapshot")
    dm = db.query("SELECT COUNT(*) AS n FROM daily_metric")
    camps = db.query(
        "SELECT COUNT(DISTINCT name) AS n FROM campaign WHERE snapshot_id = (SELECT MAX(id) FROM ad_snapshot)"
    )
    ag = db.query(
        "SELECT COUNT(*) AS n FROM ad_group WHERE snapshot_id = (SELECT MAX(id) FROM ad_snapshot)"
    )
    kw = db.query(
        "SELECT COUNT(*) AS n FROM keyword WHERE snapshot_id = (SELECT MAX(id) FROM ad_snapshot)"
    )
    days = db.query(
        "SELECT COUNT(DISTINCT date) AS n FROM daily_metric WHERE entity_type = 'campaign'"
    )
    return {
        "snapshots_total": snap[0]["n"] if snap else 0,
        "daily_metric_rows": dm[0]["n"] if dm else 0,
        "campaigns_latest_snapshot": camps[0]["n"] if camps else 0,
        "ad_groups_latest_snapshot": ag[0]["n"] if ag else 0,
        "keywords_latest_snapshot": kw[0]["n"] if kw else 0,
        "distinct_days_campaign_daily": days[0]["n"] if days else 0,
    }


def get_business_context() -> dict[str, Any]:
    """
    Return TPD_BUSINESS_CONTEXT from env plus high-level row/campaign counts.
    Use at the start of an analysis session.
    """
    ctx = os.getenv("TPD_BUSINESS_CONTEXT", "").strip()
    stats = _stats_counts()
    return {
        "business_context": ctx,
        "database_stats": stats,
    }


def resource_context_json() -> str:
    """JSON string for tpd://context resource."""
    return json.dumps(get_business_context(), indent=2)


def resource_campaigns_json() -> str:
    """JSON string for tpd://campaigns resource."""
    sql = """
    SELECT DISTINCT campaign AS c FROM daily_metric WHERE entity_type = 'campaign'
    UNION
    SELECT DISTINCT name AS c FROM campaign WHERE snapshot_id = (SELECT MAX(id) FROM ad_snapshot)
    ORDER BY c
    """
    rows = db.query(sql)
    names = sorted({r["c"] for r in rows if r.get("c")})
    return json.dumps({"campaign_names": names}, indent=2)
