"""SQLModel table definitions and ingest payload schemas."""

from datetime import datetime, timezone
from typing import Literal, Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# --- Ingest payload (validated on POST; not persisted as-is) ---


class CampaignIn(SQLModel):
    id: str
    name: str
    status: str
    channel: str
    daily_budget: float = 0.0
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    conv_value: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    impression_share: str = ""
    budget_lost_is: str = ""
    rank_lost_is: str = ""
    cost_per_conversion: float = 0.0


class AdGroupIn(SQLModel):
    campaign: str
    id: str
    name: str
    status: str
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    cost_per_conversion: float = 0.0


class KeywordIn(SQLModel):
    campaign: str
    ad_group: str
    keyword: str
    match_type: str
    status: str
    quality_score: str = ""
    pred_ctr: str = ""
    ad_relevance: str = ""
    lp_experience: str = ""
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    impression_share: str = ""
    cost_per_conversion: float = 0.0


class SearchTermIn(SQLModel):
    campaign: str
    ad_group: str
    search_term: str
    match_type: str
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0


class AdIn(SQLModel):
    campaign: Optional[str] = None
    ad_group: Optional[str] = None
    ad_id: Optional[str] = None
    ad_type: Optional[str] = None
    status: Optional[str] = None
    headlines: Optional[str] = None
    descriptions: Optional[str] = None
    final_url: Optional[str] = None
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0


class IngestPayload(SQLModel):
    exported_at: datetime
    date_range: str
    campaigns: list[CampaignIn] = Field(default_factory=list)
    ad_groups: list[AdGroupIn] = Field(default_factory=list)
    keywords: list[KeywordIn] = Field(default_factory=list)
    search_terms: list[SearchTermIn] = Field(default_factory=list)
    ads: list[AdIn] = Field(default_factory=list)


# --- History backfill (daily rows; separate from snapshot ingest) ---


class DailyMetricRowIn(SQLModel):
    """One daily metric row; `entity_type` comes from parent HistoryIngestPayload."""

    date: str
    entity_name: str
    campaign: str
    ad_group: Optional[str] = None
    match_type: Optional[str] = None
    keyword: Optional[str] = None
    search_term: Optional[str] = None
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    cost_per_conversion: float = 0.0
    impression_share: Optional[str] = None
    quality_score: Optional[str] = None


class HistoryIngestPayload(SQLModel):
    entity_type: Literal["campaign", "ad_group", "keyword", "search_term"]
    rows: list[DailyMetricRowIn] = Field(default_factory=list)


# --- Tables ---


class AdSnapshot(SQLModel, table=True):
    __tablename__ = "ad_snapshot"

    id: Optional[int] = Field(default=None, primary_key=True)
    exported_at: datetime
    date_range: str
    ingested_at: datetime = Field(default_factory=utcnow)


class Campaign(SQLModel, table=True):
    __tablename__ = "campaign"

    id: Optional[int] = Field(default=None, primary_key=True)
    snapshot_id: int = Field(foreign_key="ad_snapshot.id", index=True)
    campaign_id: str = ""
    name: str = ""
    status: str = ""
    channel: str = ""
    daily_budget: float = 0.0
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    conv_value: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    impression_share: str = ""
    budget_lost_is: str = ""
    rank_lost_is: str = ""
    cost_per_conversion: float = 0.0


class AdGroup(SQLModel, table=True):
    __tablename__ = "ad_group"

    id: Optional[int] = Field(default=None, primary_key=True)
    snapshot_id: int = Field(foreign_key="ad_snapshot.id", index=True)
    campaign: str = ""
    ad_group_id: str = ""
    name: str = ""
    status: str = ""
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    cost_per_conversion: float = 0.0


class Keyword(SQLModel, table=True):
    __tablename__ = "keyword"

    id: Optional[int] = Field(default=None, primary_key=True)
    snapshot_id: int = Field(foreign_key="ad_snapshot.id", index=True)
    campaign: str = ""
    ad_group: str = ""
    keyword: str = ""
    match_type: str = ""
    status: str = ""
    quality_score: str = ""
    pred_ctr: str = ""
    ad_relevance: str = ""
    lp_experience: str = ""
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    impression_share: str = ""
    cost_per_conversion: float = 0.0


class SearchTerm(SQLModel, table=True):
    __tablename__ = "search_term"

    id: Optional[int] = Field(default=None, primary_key=True)
    snapshot_id: int = Field(foreign_key="ad_snapshot.id", index=True)
    campaign: str = ""
    ad_group: str = ""
    search_term: str = ""
    match_type: str = ""
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0


class Ad(SQLModel, table=True):
    __tablename__ = "ad"

    id: Optional[int] = Field(default=None, primary_key=True)
    snapshot_id: int = Field(foreign_key="ad_snapshot.id", index=True)
    campaign: Optional[str] = None
    ad_group: Optional[str] = None
    ad_external_id: Optional[str] = None
    ad_type: Optional[str] = None
    status: Optional[str] = None
    headlines: Optional[str] = None
    descriptions: Optional[str] = None
    final_url: Optional[str] = None
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0


class DailyMetric(SQLModel, table=True):
    __tablename__ = "daily_metric"
    __table_args__ = (
        UniqueConstraint(
            "date",
            "entity_type",
            "entity_name",
            "campaign",
            "ad_group",
            "keyword",
            "search_term",
            name="uq_daily_metric_natural_key",
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    date: str = Field(index=True)
    entity_type: str = Field(index=True)
    entity_name: str = ""
    campaign: str = Field(index=True)
    ad_group: str = ""
    match_type: Optional[str] = None
    keyword: str = ""
    search_term: str = ""
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    ctr: float = 0.0
    avg_cpc: float = 0.0
    cost_per_conversion: float = 0.0
    impression_share: Optional[str] = None
    quality_score: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
