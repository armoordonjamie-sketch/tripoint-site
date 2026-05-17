"""GET endpoints for snapshots, rows, and summary."""

from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import distinct
from sqlmodel import Session, col, func, select

from auth import verify_token
from database import get_session
from models import Ad, AdGroup, AdSnapshot, Campaign, DailyMetric, Keyword, SearchTerm

router = APIRouter(prefix="/api/ads", tags=["ads"])


def resolve_snapshot_id(session: Session, snapshot_id: str | None) -> int:
    if snapshot_id is None or snapshot_id == "" or snapshot_id.lower() == "latest":
        row = session.exec(select(AdSnapshot.id).order_by(col(AdSnapshot.id).desc()).limit(1)).first()
        if row is None:
            raise HTTPException(status_code=404, detail="No snapshots found")
        return row

    try:
        sid = int(snapshot_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="snapshot_id must be an integer or 'latest'") from exc

    snap = session.get(AdSnapshot, sid)
    if snap is None:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return sid


def _count_for_snapshot(session: Session, model: type, sid: int) -> int:
    return session.exec(
        select(func.count(col(model.id))).where(model.snapshot_id == sid)
    ).one()


@router.get("/snapshots", dependencies=[Depends(verify_token)])
def list_snapshots(session: Session = Depends(get_session)) -> list[dict[str, Any]]:
    snaps = session.exec(select(AdSnapshot).order_by(col(AdSnapshot.id).desc())).all()
    out: list[dict[str, Any]] = []
    for s in snaps:
        sid = s.id
        assert sid is not None
        out.append(
            {
                "id": sid,
                "exported_at": s.exported_at.isoformat(),
                "date_range": s.date_range,
                "ingested_at": s.ingested_at.isoformat(),
                "counts": {
                    "campaigns": _count_for_snapshot(session, Campaign, sid),
                    "ad_groups": _count_for_snapshot(session, AdGroup, sid),
                    "keywords": _count_for_snapshot(session, Keyword, sid),
                    "search_terms": _count_for_snapshot(session, SearchTerm, sid),
                    "ads": _count_for_snapshot(session, Ad, sid),
                },
            }
        )
    return out


@router.get("/campaigns", dependencies=[Depends(verify_token)])
def get_campaigns(
    session: Session = Depends(get_session),
    snapshot_id: str | None = Query(default="latest"),
) -> list[dict[str, Any]]:
    sid = resolve_snapshot_id(session, snapshot_id)
    rows = session.exec(select(Campaign).where(Campaign.snapshot_id == sid)).all()
    return [r.model_dump() for r in rows]


@router.get("/keywords", dependencies=[Depends(verify_token)])
def get_keywords(
    session: Session = Depends(get_session),
    snapshot_id: str | None = Query(default="latest"),
    campaign: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    sid = resolve_snapshot_id(session, snapshot_id)
    stmt = select(Keyword).where(Keyword.snapshot_id == sid)
    if campaign is not None and campaign != "":
        stmt = stmt.where(Keyword.campaign == campaign)
    rows = session.exec(stmt).all()
    return [r.model_dump() for r in rows]


@router.get("/search_terms", dependencies=[Depends(verify_token)])
def get_search_terms(
    session: Session = Depends(get_session),
    snapshot_id: str | None = Query(default="latest"),
    campaign: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    sid = resolve_snapshot_id(session, snapshot_id)
    stmt = select(SearchTerm).where(SearchTerm.snapshot_id == sid)
    if campaign is not None and campaign != "":
        stmt = stmt.where(SearchTerm.campaign == campaign)
    rows = session.exec(stmt).all()
    return [r.model_dump() for r in rows]


def _parse_quality_score(qs: str) -> int | None:
    s = qs.strip()
    if not s:
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


@router.get("/summary", dependencies=[Depends(verify_token)])
def get_summary(
    session: Session = Depends(get_session),
    snapshot_id: str | None = Query(default="latest"),
) -> dict[str, Any]:
    sid = resolve_snapshot_id(session, snapshot_id)
    campaigns = session.exec(select(Campaign).where(Campaign.snapshot_id == sid)).all()
    keywords = session.exec(select(Keyword).where(Keyword.snapshot_id == sid)).all()
    search_terms = session.exec(select(SearchTerm).where(SearchTerm.snapshot_id == sid)).all()

    total_cost = sum(c.cost for c in campaigns)
    total_clicks = sum(c.clicks for c in campaigns)
    total_impressions = sum(c.impressions for c in campaigns)
    total_conversions = sum(c.conversions for c in campaigns)

    blended_cpa: float | None = None
    if total_conversions > 0:
        blended_cpa = total_cost / total_conversions

    blended_ctr: float | None = None
    if total_impressions > 0:
        blended_ctr = total_clicks / total_impressions

    kw_sorted = sorted(keywords, key=lambda k: k.cost, reverse=True)[:5]
    top_keywords_by_cost = [
        {
            "campaign": k.campaign,
            "ad_group": k.ad_group,
            "keyword": k.keyword,
            "cost": k.cost,
            "clicks": k.clicks,
            "impressions": k.impressions,
        }
        for k in kw_sorted
    ]

    st_sorted = sorted(search_terms, key=lambda t: t.cost, reverse=True)[:5]
    top_search_terms_by_cost = [
        {
            "campaign": t.campaign,
            "ad_group": t.ad_group,
            "search_term": t.search_term,
            "cost": t.cost,
            "clicks": t.clicks,
            "impressions": t.impressions,
        }
        for t in st_sorted
    ]

    low_qs_keywords: list[dict[str, Any]] = []
    for k in keywords:
        n = _parse_quality_score(k.quality_score)
        if n is not None and n < 5:
            low_qs_keywords.append(
                {
                    "campaign": k.campaign,
                    "ad_group": k.ad_group,
                    "keyword": k.keyword,
                    "quality_score": k.quality_score,
                }
            )

    return {
        "snapshot_id": sid,
        "totals": {
            "spend": total_cost,
            "clicks": total_clicks,
            "impressions": total_impressions,
            "conversions": total_conversions,
            "blended_cpa": blended_cpa,
            "blended_ctr": blended_ctr,
        },
        "top_keywords_by_cost": top_keywords_by_cost,
        "top_search_terms_by_cost": top_search_terms_by_cost,
        "keywords_quality_score_below_5": low_qs_keywords,
    }


# --- Daily history (DailyMetric) ---


def _parse_ymd(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date; use YYYY-MM-DD") from exc


def _resolve_history_date_range(
    start_date: str | None,
    end_date: str | None,
) -> tuple[str, str]:
    if (start_date is None or start_date == "") and (end_date is None or end_date == ""):
        end = datetime.now(timezone.utc).date() - timedelta(days=1)
        start = end - timedelta(days=89)
        return start.isoformat(), end.isoformat()
    if not start_date or not end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date and end_date must both be provided or both omitted",
        )
    sd = _parse_ymd(start_date)
    ed = _parse_ymd(end_date)
    if sd > ed:
        raise HTTPException(status_code=400, detail="start_date must be <= end_date")
    return start_date, end_date


def _history_list(
    session: Session,
    entity_type: str,
    campaign: str | None,
    start_date: str | None,
    end_date: str | None,
) -> list[dict[str, Any]]:
    dr_start, dr_end = _resolve_history_date_range(start_date, end_date)
    stmt = (
        select(DailyMetric)
        .where(DailyMetric.entity_type == entity_type)
        .where(DailyMetric.date >= dr_start)
        .where(DailyMetric.date <= dr_end)
    )
    if campaign is not None and campaign != "":
        stmt = stmt.where(DailyMetric.campaign == campaign)
    stmt = stmt.order_by(DailyMetric.date, DailyMetric.campaign, DailyMetric.entity_name)
    rows = session.exec(stmt).all()
    return [r.model_dump() for r in rows]


@router.get("/history/campaigns", dependencies=[Depends(verify_token)])
def history_campaigns(
    session: Session = Depends(get_session),
    campaign: str | None = Query(default=None),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    return _history_list(session, "campaign", campaign, start_date, end_date)


@router.get("/history/keywords", dependencies=[Depends(verify_token)])
def history_keywords(
    session: Session = Depends(get_session),
    campaign: str | None = Query(default=None),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    return _history_list(session, "keyword", campaign, start_date, end_date)


@router.get("/history/search_terms", dependencies=[Depends(verify_token)])
def history_search_terms(
    session: Session = Depends(get_session),
    campaign: str | None = Query(default=None),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    return _history_list(session, "search_term", campaign, start_date, end_date)


@router.get("/history/summary", dependencies=[Depends(verify_token)])
def history_summary(session: Session = Depends(get_session)) -> list[dict[str, Any]]:
    stmt = (
        select(
            DailyMetric.campaign,
            func.min(DailyMetric.date).label("first_date"),
            func.max(DailyMetric.date).label("last_date"),
            func.count(distinct(DailyMetric.date)).label("total_days"),
            func.sum(DailyMetric.cost).label("total_spend"),
            func.sum(DailyMetric.clicks).label("total_clicks"),
            func.sum(DailyMetric.conversions).label("total_conversions"),
            func.sum(DailyMetric.impressions).label("total_impressions"),
        )
        .where(DailyMetric.entity_type == "campaign")
        .group_by(DailyMetric.campaign)
    )
    rows = session.exec(stmt).all()
    out: list[dict[str, Any]] = []
    for r in rows:
        ti = r.total_impressions or 0
        tc = r.total_clicks or 0
        ts = float(r.total_spend or 0)
        avg_ctr: float | None = (tc / ti) if ti > 0 else None
        avg_cpc: float | None = (ts / tc) if tc > 0 else None
        out.append(
            {
                "campaign": r.campaign,
                "first_date": r.first_date,
                "last_date": r.last_date,
                "total_days": r.total_days,
                "total_spend": float(r.total_spend or 0),
                "total_clicks": int(r.total_clicks or 0),
                "total_conversions": float(r.total_conversions or 0),
                "avg_ctr": avg_ctr,
                "avg_cpc": avg_cpc,
            }
        )
    return out


@router.get("/history/coverage", dependencies=[Depends(verify_token)])
def history_coverage(session: Session = Depends(get_session)) -> list[dict[str, Any]]:
    stmt = (
        select(
            DailyMetric.campaign,
            DailyMetric.entity_type,
            func.min(DailyMetric.date).label("earliest_date"),
            func.max(DailyMetric.date).label("latest_date"),
            func.count(distinct(DailyMetric.date)).label("total_days"),
        )
        .group_by(DailyMetric.campaign, DailyMetric.entity_type)
        .order_by(DailyMetric.campaign, DailyMetric.entity_type)
    )
    rows = session.exec(stmt).all()
    return [
        {
            "campaign": r.campaign,
            "entity_type": r.entity_type,
            "earliest_date": r.earliest_date,
            "latest_date": r.latest_date,
            "total_days": r.total_days,
        }
        for r in rows
    ]
