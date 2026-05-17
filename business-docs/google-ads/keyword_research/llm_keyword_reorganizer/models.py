"""Pydantic models for OpenRouter JSON responses."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

KeepDecision = Literal[
    "include_now",
    "review_high_priority",
    "review_broad_test",
    "future_test",
    "exclude_negative",
]
CampaignFamily = Literal[
    "Diagnostics & VOR",
    "Mercedes Van Servicing",
    "Van Tuning",
]
MatchTypeLabel = Literal["Exact", "Phrase", "Broad"]


class KeywordLLMItem(BaseModel):
    original_keyword: str = ""
    normalized_keyword: str = ""
    keep_decision: KeepDecision
    campaign_family: str
    ad_group_theme: str
    recommended_match_type: MatchTypeLabel = "Phrase"
    confidence: float = Field(ge=0.0, le=1.0, default=0.7)
    reason: str = ""
    negative_reason: str | None = None
    tags: list[str] = Field(default_factory=list)
    rewritten_clean_keyword: str | None = None

    @field_validator("confidence", mode="before")
    @classmethod
    def _coerce_conf(cls, v: object) -> float:
        try:
            x = float(v)
        except (TypeError, ValueError):
            return 0.5
        return max(0.0, min(1.0, x))

    @field_validator("keep_decision", mode="before")
    @classmethod
    def _coerce_kd(cls, v: object) -> str:
        s = str(v).strip().lower().replace("-", "_")
        allowed = {
            "include_now",
            "review_high_priority",
            "review_broad_test",
            "future_test",
            "exclude_negative",
        }
        if s in allowed:
            return s
        return "review_high_priority"

    @field_validator("recommended_match_type", mode="before")
    @classmethod
    def _coerce_mt(cls, v: object) -> str:
        if isinstance(v, str):
            t = v.strip().lower()
            if t == "exact":
                return "Exact"
            if t == "broad":
                return "Broad"
            return "Phrase"
        return "Phrase"

    @field_validator("campaign_family")
    @classmethod
    def _fam(cls, v: str) -> str:
        return (v or "").strip()


class BatchLLMResponse(BaseModel):
    items: list[KeywordLLMItem] = Field(default_factory=list)


class FinalKeywordRow(BaseModel):
    """Flattened row for export (also dict-friendly)."""

    model_config = {"extra": "allow"}

    original_keyword: str
    normalized_keyword: str
    campaign_family: str
    ad_group_theme: str
    seed_keyword: str = ""
    source: str = ""
    input_tier_status: str = ""
    input_recommended_match_type: str = ""
    heuristic_tags: str = ""
    pre_rule_id: str = ""
    pre_rule_reason: str = ""
    skipped_llm: bool = False
    llm_keep_decision: str = ""
    llm_recommended_match_type: str = ""
    llm_confidence: float | None = None
    llm_reason: str = ""
    llm_negative_reason: str = ""
    llm_tags: str = ""
    llm_rewritten_clean_keyword: str = ""
    final_keep_decision: str = ""
    final_recommended_match_type: str = ""
    final_negative_reason: str = ""
    post_rule_id: str = ""
    api_error: str = ""
    parse_status: str = ""
