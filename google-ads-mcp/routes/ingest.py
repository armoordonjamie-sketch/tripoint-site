"""POST /api/ads/ingest — receive Google Ads export payloads."""

from fastapi import APIRouter, Depends
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlmodel import Session

from auth import verify_token
from database import get_session
from models import (
    Ad,
    AdGroup,
    AdSnapshot,
    Campaign,
    DailyMetric,
    DailyMetricRowIn,
    HistoryIngestPayload,
    IngestPayload,
    Keyword,
    SearchTerm,
    utcnow,
)

router = APIRouter(prefix="/api/ads", tags=["ads"])

_HISTORY_CHUNK = 1000
_UK_COLS = (
    "date",
    "entity_type",
    "entity_name",
    "campaign",
    "ad_group",
    "keyword",
    "search_term",
)


def _norm_optional_str(val: str | None) -> str | None:
    if val is None or val == "":
        return None
    return val


def _key_str(val: str | None) -> str:
    """Empty string for absent values so SQLite UNIQUE enforces one row per natural key."""
    if val is None or val == "":
        return ""
    return val


def _history_row_mapping(row: DailyMetricRowIn, entity_type: str) -> dict:
    ts = utcnow()
    return {
        "date": row.date,
        "entity_type": entity_type,
        "entity_name": row.entity_name,
        "campaign": row.campaign,
        "ad_group": _key_str(row.ad_group),
        "match_type": _norm_optional_str(row.match_type),
        "keyword": _key_str(row.keyword),
        "search_term": _key_str(row.search_term),
        "impressions": row.impressions,
        "clicks": row.clicks,
        "cost": row.cost,
        "conversions": row.conversions,
        "ctr": row.ctr,
        "avg_cpc": row.avg_cpc,
        "cost_per_conversion": row.cost_per_conversion,
        "impression_share": _norm_optional_str(row.impression_share),
        "quality_score": _norm_optional_str(row.quality_score),
        "created_at": ts,
    }


@router.post("/ingest/history", dependencies=[Depends(verify_token)])
def ingest_history(
    payload: HistoryIngestPayload,
    session: Session = Depends(get_session),
) -> dict:
    received = len(payload.rows)
    if received == 0:
        return {"received": 0, "inserted": 0, "skipped": 0}

    entity_type = payload.entity_type
    mappings = [_history_row_mapping(r, entity_type) for r in payload.rows]
    table = DailyMetric.__table__
    inserted = 0
    for i in range(0, len(mappings), _HISTORY_CHUNK):
        chunk = mappings[i : i + _HISTORY_CHUNK]
        stmt = (
            sqlite_insert(table)
            .values(chunk)
            .on_conflict_do_nothing(index_elements=list(_UK_COLS))
            .returning(table.c.id)
        )
        result = session.execute(stmt)
        inserted += len(result.fetchall())

    session.commit()
    return {"received": received, "inserted": inserted, "skipped": received - inserted}


@router.post("/ingest", dependencies=[Depends(verify_token)])
def ingest_ads(payload: IngestPayload, session: Session = Depends(get_session)) -> dict:
    snapshot = AdSnapshot(exported_at=payload.exported_at, date_range=payload.date_range)
    session.add(snapshot)
    session.commit()
    session.refresh(snapshot)
    sid = snapshot.id
    assert sid is not None

    for c in payload.campaigns:
        session.add(
            Campaign(
                snapshot_id=sid,
                campaign_id=c.id,
                name=c.name,
                status=c.status,
                channel=c.channel,
                daily_budget=c.daily_budget,
                impressions=c.impressions,
                clicks=c.clicks,
                cost=c.cost,
                conversions=c.conversions,
                conv_value=c.conv_value,
                ctr=c.ctr,
                avg_cpc=c.avg_cpc,
                impression_share=c.impression_share,
                budget_lost_is=c.budget_lost_is,
                rank_lost_is=c.rank_lost_is,
                cost_per_conversion=c.cost_per_conversion,
            )
        )

    for g in payload.ad_groups:
        session.add(
            AdGroup(
                snapshot_id=sid,
                campaign=g.campaign,
                ad_group_id=g.id,
                name=g.name,
                status=g.status,
                impressions=g.impressions,
                clicks=g.clicks,
                cost=g.cost,
                conversions=g.conversions,
                ctr=g.ctr,
                avg_cpc=g.avg_cpc,
                cost_per_conversion=g.cost_per_conversion,
            )
        )

    for k in payload.keywords:
        session.add(
            Keyword(
                snapshot_id=sid,
                campaign=k.campaign,
                ad_group=k.ad_group,
                keyword=k.keyword,
                match_type=k.match_type,
                status=k.status,
                quality_score=k.quality_score,
                pred_ctr=k.pred_ctr,
                ad_relevance=k.ad_relevance,
                lp_experience=k.lp_experience,
                impressions=k.impressions,
                clicks=k.clicks,
                cost=k.cost,
                conversions=k.conversions,
                ctr=k.ctr,
                avg_cpc=k.avg_cpc,
                impression_share=k.impression_share,
                cost_per_conversion=k.cost_per_conversion,
            )
        )

    for st in payload.search_terms:
        session.add(
            SearchTerm(
                snapshot_id=sid,
                campaign=st.campaign,
                ad_group=st.ad_group,
                search_term=st.search_term,
                match_type=st.match_type,
                impressions=st.impressions,
                clicks=st.clicks,
                cost=st.cost,
                conversions=st.conversions,
                ctr=st.ctr,
                avg_cpc=st.avg_cpc,
            )
        )

    for a in payload.ads:
        session.add(
            Ad(
                snapshot_id=sid,
                campaign=a.campaign,
                ad_group=a.ad_group,
                ad_external_id=a.ad_id,
                ad_type=a.ad_type,
                status=a.status,
                headlines=a.headlines,
                descriptions=a.descriptions,
                final_url=a.final_url,
                impressions=a.impressions,
                clicks=a.clicks,
                cost=a.cost,
                conversions=a.conversions,
                ctr=a.ctr,
                avg_cpc=a.avg_cpc,
            )
        )

    session.commit()

    return {
        "snapshot_id": sid,
        "exported_at": payload.exported_at.isoformat(),
        "date_range": payload.date_range,
        "stored": {
            "campaigns": len(payload.campaigns),
            "ad_groups": len(payload.ad_groups),
            "keywords": len(payload.keywords),
            "search_terms": len(payload.search_terms),
            "ads": len(payload.ads),
        },
    }
