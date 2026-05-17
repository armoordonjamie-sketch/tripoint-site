"""Normalize keywords, score intent/relevance/risk, classify, assign ad groups."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING, Any

from config import (
    AD_GROUP_RULES,
    CAMPAIGN_VOCABULARY,
    COMMERCIAL_BOOST_TERMS,
    DEFAULT_AD_GROUP_FALLBACK,
    LOCAL_INTENT_TERMS,
    NEGATIVE_RISK_PHRASES,
    NEGATIVE_RISK_TERMS,
    OFF_BRAND_MODEL_TERMS,
    OUT_OF_AREA_UK_TERMS,
    PERFORMANCE_FLUFF_TERMS,
    SERVICING_CROSSOVER_TERMS,
    TUNING_BOOST_PHRASES,
    ResearchSettings,
)
from landing_pages import score_landing_page_fit
from query_shape import has_us_geo_noise, is_query_shaped_for_include
from validation import score_source_validation

if TYPE_CHECKING:
    pass

_NON_ALNUM = re.compile(r"[^\w\s\-]", re.UNICODE)
_WS = re.compile(r"\s+")

_QUESTION_LEAD_RE = re.compile(
    r"^\s*(why|what|when|where|who|how|which)\s",
    re.IGNORECASE,
)
_QUESTION_MID_RE = re.compile(
    r"\b(is it|is an|is there|are there|can i|should i|does anyone|do i need)\b",
    re.IGNORECASE,
)
_PRICE_SHOP_RE = re.compile(
    r"\b(prices?|pricing|costs?|quotes?)\b",
    re.IGNORECASE,
)
_OUT_OF_AREA_UK_RE = re.compile(
    r"\b(" + "|".join(re.escape(t) for t in OUT_OF_AREA_UK_TERMS) + r")\b",
    re.IGNORECASE,
)

# Per-source trust applied to relevance before tier classification
SOURCE_TRUST: dict[str, float] = {
    "autocomplete": 1.0,
    "related_searches": 1.0,
    "seed": 1.0,
    "modifier_expansion": 1.0,
    "brave_suggest": 0.9,
    "organic_title": 0.7,
    "brave_web_title": 0.6,
    "paa": 0.4,
    "gsc_query": 1.0,
    "organic_result": 0.7,
}


def normalize_keyword(kw: str) -> str:
    """Lowercase, strip, collapse whitespace, drop punctuation except hyphens."""
    s = kw.strip().lower()
    s = _NON_ALNUM.sub(" ", s)
    s = _WS.sub(" ", s).strip()
    return s


def source_trust_multiplier(source_merged: str) -> float:
    """Use the highest trust among merged sources."""
    parts = {p.strip() for p in (source_merged or "").split(";") if p.strip()}
    if not parts:
        return 1.0
    best = 0.5
    for p in parts:
        best = max(best, SOURCE_TRUST.get(p, 0.85))
    return best


def _count_substring_hits(text: str, terms: list[str]) -> int:
    n = 0
    for t in terms:
        if t.lower() in text:
            n += 1
    return n


def _phrase_hits(text: str, phrases: list[str]) -> int:
    n = 0
    for p in phrases:
        if p.lower() in text:
            n += 1
    return n


def _clamp_int(x: float, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, int(round(x))))


def score_commercial_intent(normalized: str, campaign_family: str = "") -> int:
    """0-100 from commercial service/remap/diagnostics tokens."""
    if not normalized:
        return 0
    hits = _count_substring_hits(normalized, COMMERCIAL_BOOST_TERMS)
    score = min(100, hits * 12)
    if campaign_family == "Van Tuning":
        tune_hits = _count_substring_hits(normalized, TUNING_BOOST_PHRASES)
        score += min(48, tune_hits * 16)
    return _clamp_int(min(100, score))


def score_local_intent(normalized: str) -> int:
    """0-100 local / mobile / area signals."""
    if not normalized:
        return 0
    hits = _count_substring_hits(normalized, LOCAL_INTENT_TERMS)
    return _clamp_int(min(100, hits * 25))


def score_relevance(
    normalized: str,
    seed_normalized: str,
    campaign_family: str,
) -> int:
    """Overlap with seed tokens and campaign vocabulary; tuning family gets clean-term boost."""
    if not normalized:
        return 0
    seed_tokens = set(seed_normalized.split())
    overlap = len(seed_tokens & set(normalized.split()))
    vocab = CAMPAIGN_VOCABULARY.get(campaign_family, [])
    vocab_hits = _count_substring_hits(normalized, vocab)
    score = overlap * 15 + vocab_hits * 10
    if campaign_family == "Van Tuning":
        boost_hits = _count_substring_hits(normalized, TUNING_BOOST_PHRASES)
        score += min(30, boost_hits * 12)
    return _clamp_int(min(100, score))


def score_negative_risk(
    normalized: str,
    campaign_family: str,
    settings: ResearchSettings,
) -> int:
    """0-100 junk, policy, or wrong-family signals."""
    if not normalized:
        return 0
    risk = 0
    risk += _phrase_hits(normalized, NEGATIVE_RISK_PHRASES) * 35
    risk += _count_substring_hits(normalized, NEGATIVE_RISK_TERMS) * 18
    if re.search(r"\bfree\b", normalized):
        risk += 35
    risk += _count_substring_hits(normalized, OFF_BRAND_MODEL_TERMS) * 20
    risk += _count_substring_hits(normalized, PERFORMANCE_FLUFF_TERMS) * 25

    if _QUESTION_LEAD_RE.search(normalized) or _QUESTION_MID_RE.search(normalized):
        risk += 32
    if has_us_geo_noise(normalized):
        risk += 38
    if _OUT_OF_AREA_UK_RE.search(normalized):
        risk += 18

    if re.search(r"\bbest\b", normalized):
        risk += 26
    if _PRICE_SHOP_RE.search(normalized):
        risk += 26

    if campaign_family == "Mercedes Van Servicing":
        cross = _count_substring_hits(normalized, SERVICING_CROSSOVER_TERMS)
        svc = _count_substring_hits(
            normalized,
            ["service", "servicing", "brake", "pads", "mot", "interval"],
        )
        if cross > 0 and svc == 0:
            risk += 30

    return _clamp_int(min(100, risk))


def score_breadth(normalized: str, campaign_family: str) -> int:
    """0-100 how broad/generic (longer, lower vocab density => higher breadth)."""
    if not normalized:
        return 0
    words = normalized.split()
    wc = len(words)
    vocab = CAMPAIGN_VOCABULARY.get(campaign_family, [])
    hits = sum(1 for t in vocab if t.lower() in normalized)
    density = hits / max(wc, 1)
    raw = min(100, wc * 10 + max(0, 8 - int(density * 8)) * 6)
    return _clamp_int(raw)


def score_ambiguity_risk(
    normalized: str,
    campaign_family: str,
    relevance: int,
    commercial: int,
) -> int:
    """0-100: useful-looking but not clearly on-brand (middling scores, weak anchors)."""
    if not normalized:
        return 0
    anchors = [
        "sprinter",
        "vito",
        "mercedes",
        "van",
        "diagnostic",
        "diagnostics",
        "remap",
        "tune",
        "brake",
        "service",
        "adblue",
        "dpf",
    ]
    ah = sum(1 for a in anchors if a in normalized)
    mid = abs(relevance - commercial) < 25 and 35 <= relevance <= 65
    amb = 30 if mid else 10
    amb += max(0, 50 - ah * 12)
    return _clamp_int(min(100, amb))


def score_intent(commercial: int, local: int) -> int:
    """Composite intent 0-100."""
    return _clamp_int(commercial * 0.65 + local * 0.35)


def assign_ad_group(normalized: str, campaign_family: str) -> str:
    """First matching rule wins; else family default."""
    for fam, theme, patterns in AD_GROUP_RULES:
        if fam != campaign_family:
            continue
        for pat in patterns:
            if pat.search(normalized):
                return theme
    return DEFAULT_AD_GROUP_FALLBACK.get(
        campaign_family, "General"
    )


def classify_keyword(
    normalized: str,
    relevance: int,
    commercial: int,
    local: int,
    negative_risk: int,
    settings: ResearchSettings,
) -> tuple[str, str, str]:
    """
    Return (status_recommendation, recommended_match_type, notes).

    status: include | review | exclude_negative
    match: exact | phrase | negative
    """
    _ = local
    if negative_risk >= settings.threshold_negative_risk_exclude:
        return (
            "exclude_negative",
            "negative",
            "High negative-risk score or policy/junk signals.",
        )
    for phrase in NEGATIVE_RISK_PHRASES:
        if phrase.lower() in normalized:
            return (
                "exclude_negative",
                "negative",
                f"Matched risk phrase: {phrase!r}.",
            )

    strong_commercial = (
        commercial >= settings.threshold_match_exact_commercial
        and relevance >= settings.threshold_match_exact_relevance
    )
    moderate = (
        relevance >= settings.threshold_relevance_include
        and commercial >= settings.threshold_commercial_include
        and negative_risk < settings.threshold_negative_risk_soft
    )

    if moderate:
        mt = "exact" if strong_commercial else "phrase"
        return (
            "include",
            mt,
            "Good relevance and commercial intent; low risk.",
        )

    if negative_risk >= settings.threshold_negative_risk_soft:
        return (
            "review",
            "phrase",
            "Elevated risk or weak fit; manual review suggested.",
        )

    return (
        "review",
        "phrase",
        "Ambiguous relevance or commercial intent; review before adding.",
    )


def tier_to_legacy_status(tier: str) -> str:
    if tier == "include_now":
        return "include"
    if tier == "exclude_negative":
        return "exclude_negative"
    return "review"


def classify_keyword_tiered(
    normalized: str,
    adj_relevance: int,
    commercial: int,
    negative_risk: int,
    settings: ResearchSettings,
    keyword_raw: str,
    source_merged: str,
    breadth: int,
    ambiguity: int,
    source_validation_score: int,
) -> tuple[str, str, str]:
    """
    Five tiers: exclude_negative | include_now | review_high_priority |
    review_broad_test | future_test
    """
    if negative_risk >= settings.threshold_negative_risk_exclude:
        return (
            "exclude_negative",
            "negative",
            "High negative-risk score or policy/junk signals.",
        )
    for phrase in NEGATIVE_RISK_PHRASES:
        if phrase.lower() in normalized:
            return (
                "exclude_negative",
                "negative",
                f"Matched risk phrase: {phrase!r}.",
            )

    rel_th = (
        settings.broad_threshold_relevance
        if settings.broad_mode
        else settings.threshold_relevance_include
    )
    com_th = (
        settings.broad_threshold_commercial
        if settings.broad_mode
        else settings.threshold_commercial_include
    )
    soft = settings.threshold_negative_risk_soft
    sources = {s for s in source_merged.split(";") if s}

    strong_commercial = (
        commercial >= settings.threshold_match_exact_commercial
        and adj_relevance >= settings.threshold_match_exact_relevance
    )
    query_ok = is_query_shaped_for_include(
        keyword_raw, normalized, settings, source_merged
    )

    core_ok = (
        negative_risk < soft
        and adj_relevance >= rel_th
        and commercial >= com_th
    )

    if core_ok and query_ok and "paa" not in sources:
        mt = "exact" if strong_commercial else "phrase"
        note = "High fit; query-shaped; low risk."
        if source_validation_score >= 40:
            note += " Strong cross-source validation."
        return ("include_now", mt, note)

    if core_ok and query_ok and "paa" in sources:
        return (
            "review_high_priority",
            "phrase",
            "PAA / related question source; confirm before include.",
        )

    if core_ok and not query_ok:
        return (
            "review_high_priority",
            "phrase",
            "Good scores but failed query-shape gate for include.",
        )

    if (
        negative_risk >= soft
        and negative_risk < settings.threshold_negative_risk_exclude
        and adj_relevance >= int(rel_th * 0.7)
        and commercial >= int(com_th * 0.65)
    ):
        return (
            "review_high_priority",
            "phrase",
            "Elevated risk with partial commercial fit; manual review.",
        )

    if (
        negative_risk < settings.threshold_negative_risk_exclude
        and (adj_relevance >= int(rel_th * 0.55) or commercial >= int(com_th * 0.55))
        and (breadth >= 45 or ambiguity >= 50)
    ):
        return (
            "review_broad_test",
            "phrase",
            "Broader or ambiguous fit; worth testing later.",
        )

    if (
        negative_risk < settings.threshold_negative_risk_exclude
        and (adj_relevance >= 18 or commercial >= 18)
    ):
        return (
            "future_test",
            "phrase",
            "Some relevance; too broad for immediate import.",
        )

    if negative_risk < settings.threshold_negative_risk_exclude:
        return (
            "review_high_priority",
            "phrase",
            "Does not meet include or broad-test gates; review.",
        )

    return (
        "exclude_negative",
        "negative",
        "Excluded by risk or fit.",
    )


def score_row(
    keyword_candidate: str,
    seed_keyword: str,
    campaign_family: str,
    settings: ResearchSettings,
    source_merged: str = "",
    validation_ctx: dict[str, Any] | None = None,
) -> dict[str, int | str]:
    """Compute scores, tier, and legacy status fields for one candidate."""
    norm = normalize_keyword(keyword_candidate)
    seed_norm = normalize_keyword(seed_keyword)
    commercial = score_commercial_intent(norm, campaign_family)
    local = score_local_intent(norm)
    relevance = score_relevance(norm, seed_norm, campaign_family)
    neg = score_negative_risk(norm, campaign_family, settings)
    intent = score_intent(commercial, local)
    trust = source_trust_multiplier(source_merged)
    adj_rel = _clamp_int(min(100, relevance * trust))

    breadth = score_breadth(norm, campaign_family)
    ambiguity = score_ambiguity_risk(norm, campaign_family, relevance, commercial)
    landing_fit = score_landing_page_fit(norm, campaign_family)
    val_ctx = validation_ctx if validation_ctx is not None else {}
    source_val = score_source_validation(norm, val_ctx)

    sources = {s for s in source_merged.split(";") if s}

    if getattr(settings, "legacy_three_bucket", True):
        status, match_type, notes = classify_keyword(
            norm, relevance, commercial, local, neg, settings
        )
        tier_map = {
            "include": "include_now",
            "review": "review_high_priority",
            "exclude_negative": "exclude_negative",
        }
        tier_status = tier_map.get(status, "review_high_priority")
    else:
        tier_status, match_type, notes = classify_keyword_tiered(
            norm,
            adj_rel,
            commercial,
            neg,
            settings,
            keyword_candidate,
            source_merged,
            breadth,
            ambiguity,
            source_val,
        )
        status = tier_to_legacy_status(tier_status)

    if "paa" in sources:
        if status == "include":
            status = "review"
            match_type = "phrase"
            notes = "PAA / related question source; not for direct include builds."
            tier_status = "review_high_priority"
        elif status == "review" and neg < settings.threshold_negative_risk_soft:
            notes = "PAA / related question; review or use as negative/FAQ only."

    shaped_ok = is_query_shaped_for_include(
        keyword_candidate, norm, settings, source_merged
    )
    if status == "include" and not shaped_ok:
        status = "review"
        match_type = "phrase"
        notes = "Failed query-shape gate for include; review or shorten before adding."
        tier_status = "review_high_priority"

    ad_group = assign_ad_group(norm, campaign_family)
    return {
        "normalized_keyword": norm,
        "commercial_intent_score": commercial,
        "local_intent_score": local,
        "relevance_score": relevance,
        "adjusted_relevance_score": adj_rel,
        "source_trust_multiplier": round(trust, 3),
        "negative_risk_score": neg,
        "intent_score": intent,
        "landing_page_fit_score": landing_fit,
        "source_validation_score": source_val,
        "breadth_score": breadth,
        "ambiguity_risk_score": ambiguity,
        "tier_status": tier_status,
        "status_recommendation": status,
        "recommended_match_type": match_type,
        "notes": notes,
        "ad_group_theme": ad_group,
    }
