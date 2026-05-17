"""Cross-source validation: GSC + Ads exports."""

from __future__ import annotations

from typing import Any


def build_validation_context(
    gsc_data: list[dict[str, Any]] | None,
    ads_exports: dict[str, Any] | None,
) -> dict[str, Any]:
    """
    Merge signals into lookups for score_source_validation.

    gsc_data: rows with query, clicks, impressions, ctr, position (optional page).
    ads_exports: output of load_ads_exports + build_validation_index or raw exports dict.
    """
    gsc_queries: dict[str, dict[str, float | int]] = {}
    if gsc_data:
        for r in gsc_data:
            q = (r.get("query") or "").strip().lower()
            if not q:
                continue
            key = " ".join(q.split())
            prev = gsc_queries.get(key, {})
            clicks = int(r.get("clicks", 0) or 0) + int(prev.get("clicks", 0) or 0)
            imps = int(r.get("impressions", 0) or 0) + int(prev.get("impressions", 0) or 0)
            gsc_queries[key] = {
                "clicks": clicks,
                "impressions": imps,
                "ctr": float(r.get("ctr", 0) or 0),
                "position": float(r.get("position", 0) or 0),
            }

    ads_search_terms: set[str] = set()
    ads_negatives: set[str] = set()
    ads_keywords: set[str] = set()
    ads_recommendations: set[str] = set()

    if ads_exports:
        idx = ads_exports.get("_index")
        if isinstance(idx, dict):
            ads_search_terms = set(idx.get("known_search_terms", set()))
            ads_negatives = set(idx.get("known_negatives", set()))
            ads_keywords = set(idx.get("known_keywords", set()))
            ads_recommendations = set(idx.get("recommended_keywords", set()))
        else:
            from ads_script_loader import build_validation_index

            merged_idx = build_validation_index(ads_exports)
            ads_search_terms = merged_idx["known_search_terms"]
            ads_negatives = merged_idx["known_negatives"]
            ads_keywords = merged_idx["known_keywords"]
            ads_recommendations = merged_idx["recommended_keywords"]

    return {
        "gsc_queries": gsc_queries,
        "ads_search_terms": ads_search_terms,
        "ads_negatives": ads_negatives,
        "ads_keywords": ads_keywords,
        "ads_recommendations": ads_recommendations,
        "has_any": bool(gsc_queries or ads_search_terms or ads_negatives),
    }


def score_source_validation(normalized: str, validation_ctx: dict[str, Any]) -> int:
    """0-100 from GSC + Ads overlap; penalize negatives."""
    if not normalized:
        return 0
    key = normalized.strip().lower()
    score = 0
    gq = validation_ctx.get("gsc_queries") or {}
    row = gq.get(key)
    if row:
        if int(row.get("clicks", 0) or 0) > 0:
            score += 40
        else:
            score += 20

    ads_st = validation_ctx.get("ads_search_terms") or set()
    if key in ads_st:
        score += 30

    ads_rec = validation_ctx.get("ads_recommendations") or set()
    if key in ads_rec:
        score += 15

    ads_neg = validation_ctx.get("ads_negatives") or set()
    if key in ads_neg:
        score -= 30

    return max(0, min(100, score))
