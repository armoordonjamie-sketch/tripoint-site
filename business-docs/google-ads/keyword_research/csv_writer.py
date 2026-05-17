"""Write keyword research outputs as deterministic UTF-8 CSVs."""

from __future__ import annotations

import csv
import os
from collections import defaultdict
from typing import Any

from config import CAMPAIGN_EDITOR_NAMES

MASTER_COLUMNS = [
    "campaign_family",
    "ad_group_theme",
    "seed_keyword",
    "keyword_candidate",
    "source",
    "normalized_keyword",
    "tier_status",
    "intent_score",
    "local_intent_score",
    "commercial_intent_score",
    "relevance_score",
    "adjusted_relevance_score",
    "source_trust_multiplier",
    "negative_risk_score",
    "landing_page_fit_score",
    "source_validation_score",
    "breadth_score",
    "ambiguity_risk_score",
    "recommended_match_type",
    "status_recommendation",
    "notes",
]

INCLUDE_COLUMNS = [
    "campaign_family",
    "ad_group_theme",
    "keyword_candidate",
    "recommended_match_type",
    "notes",
]

NEGATIVE_COLUMNS = [
    "campaign_family",
    "ad_group_theme",
    "keyword_candidate",
    "negative_level",
    "reason",
]

SUMMARY_COLUMNS = [
    "seed_keyword",
    "campaign_family",
    "total_candidates",
    "include_count",
    "review_count",
    "negative_count",
]

DUMP_COLUMNS = [
    "seed_keyword",
    "source",
    "raw_text",
    "api_endpoint",
    "result_position",
    "title",
    "snippet",
    "link",
]

BRAVE_DUMP_COLUMNS = [
    "seed_keyword",
    "source",
    "raw_text",
    "altered_query",
    "title",
    "description",
]

VALIDATION_SUMMARY_COLUMNS = [
    "normalized_keyword",
    "campaign_family",
    "tier_status",
    "sources",
    "in_gsc",
    "gsc_clicks",
    "gsc_impressions",
    "in_ads_search_terms",
    "in_ads_negatives",
    "in_ads_recommendations",
    "source_validation_score",
]

CLUSTER_SUMMARY_COLUMNS = [
    "campaign_family",
    "ad_group_theme",
    "include_now",
    "review_high_priority",
    "review_broad_test",
    "future_test",
    "exclude_negative",
    "total",
]

EDITOR_KEYWORD_COLUMNS = ["Campaign", "Ad Group", "Keyword", "Match Type"]
EDITOR_NEGATIVE_COLUMNS = [
    "Campaign",
    "Ad Group",
    "Negative Keyword",
    "Match Type",
]


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _write_csv(path: str, fieldnames: list[str], rows: list[dict[str, Any]]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in fieldnames})


def editor_match_type(mt: str) -> str:
    """Map internal match types to Google Ads Editor style labels."""
    m = (mt or "").lower()
    if m == "exact":
        return "Exact"
    if m == "phrase":
        return "Phrase"
    if m == "negative":
        return "Phrase"
    return "Phrase"


def negative_editor_match_type(keyword: str) -> str:
    """Default negative match: Phrase if multi-token else Broad."""
    parts = keyword.strip().split()
    return "Phrase" if len(parts) > 1 else "Broad"


def negative_level(negative_risk: int, status: str) -> str:
    """campaign vs ad_group for negative keyword list."""
    if status != "exclude_negative":
        return "ad_group"
    if negative_risk >= 55:
        return "campaign"
    return "ad_group"


def _row_is_include(r: dict[str, Any]) -> bool:
    return str(r.get("tier_status", "")) == "include_now"


def _row_is_review_high(r: dict[str, Any]) -> bool:
    return str(r.get("tier_status", "")) == "review_high_priority"


def write_master_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "keyword_research_master.csv")
    _write_csv(path, MASTER_COLUMNS, rows)
    return path


def write_keyword_universe_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "keyword_universe.csv")
    _write_csv(path, MASTER_COLUMNS, rows)
    return path


def write_keywords_include_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "keywords_include.csv")
    inc = [r for r in rows if _row_is_include(r)]
    _write_csv(path, INCLUDE_COLUMNS, inc)
    return path


def write_keywords_review_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "keywords_review.csv")
    rev = [r for r in rows if _row_is_review_high(r)]
    _write_csv(path, INCLUDE_COLUMNS, rev)
    return path


def write_keywords_broad_test_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "keywords_broad_test.csv")
    tiers = {"review_broad_test", "future_test"}
    sub = [r for r in rows if str(r.get("tier_status", "")) in tiers]
    _write_csv(path, INCLUDE_COLUMNS, sub)
    return path


def write_keyword_validation_summary_csv(
    output_dir: str,
    rows: list[dict[str, Any]],
    validation_ctx: dict[str, Any] | None,
) -> str:
    path = os.path.join(output_dir, "keyword_validation_summary.csv")
    ctx = validation_ctx or {}
    gq = ctx.get("gsc_queries") or {}
    ads_st = ctx.get("ads_search_terms") or set()
    ads_neg = ctx.get("ads_negatives") or set()
    ads_rec = ctx.get("ads_recommendations") or set()
    out_rows: list[dict[str, Any]] = []
    for r in rows:
        nk = str(r.get("normalized_keyword", "")).strip().lower()
        nk2 = " ".join(nk.split())
        g = gq.get(nk2, {})
        clicks = int(g.get("clicks", 0) or 0)
        imps = int(g.get("impressions", 0) or 0)
        out_rows.append(
            {
                "normalized_keyword": nk2,
                "campaign_family": r.get("campaign_family", ""),
                "tier_status": r.get("tier_status", ""),
                "sources": r.get("source", ""),
                "in_gsc": "yes" if nk2 in gq else "",
                "gsc_clicks": clicks,
                "gsc_impressions": imps,
                "in_ads_search_terms": "yes" if nk2 in ads_st else "",
                "in_ads_negatives": "yes" if nk2 in ads_neg else "",
                "in_ads_recommendations": "yes" if nk2 in ads_rec else "",
                "source_validation_score": r.get("source_validation_score", ""),
            }
        )
    _write_csv(path, VALIDATION_SUMMARY_COLUMNS, out_rows)
    return path


def write_search_console_query_dump_csv(
    output_dir: str,
    gsc_rows: list[dict[str, Any]],
) -> str:
    path = os.path.join(output_dir, "search_console_query_dump.csv")
    cols = [
        "query",
        "page",
        "clicks",
        "impressions",
        "ctr",
        "position",
        "inferred_campaign_family",
    ]
    _write_csv(path, cols, gsc_rows)
    return path


def write_brave_source_dump_csv(
    output_dir: str,
    brave_dump_rows: list[dict[str, Any]],
) -> str:
    path = os.path.join(output_dir, "brave_source_dump.csv")
    _write_csv(path, BRAVE_DUMP_COLUMNS, brave_dump_rows)
    return path


def write_google_ads_script_validation_dump_csv(
    output_dir: str,
    match_rows: list[dict[str, Any]],
) -> str:
    path = os.path.join(output_dir, "google_ads_script_validation_dump.csv")
    cols = [
        "normalized_keyword",
        "campaign_family",
        "matched_search_term",
        "matched_negative",
        "matched_recommendation",
    ]
    _write_csv(path, cols, match_rows)
    return path


def write_keyword_cluster_summary_csv(
    output_dir: str,
    rows: list[dict[str, Any]],
) -> str:
    path = os.path.join(output_dir, "keyword_cluster_summary.csv")
    counts: dict[tuple[str, str], dict[str, int]] = defaultdict(
        lambda: defaultdict(int)
    )
    for r in rows:
        fam = str(r.get("campaign_family", ""))
        ag = str(r.get("ad_group_theme", ""))
        tier = str(r.get("tier_status", ""))
        key = (fam, ag)
        counts[key][tier] += 1
        counts[key]["total"] += 1
    out: list[dict[str, Any]] = []
    for (fam, ag) in sorted(counts.keys()):
        cc = counts[(fam, ag)]
        out.append(
            {
                "campaign_family": fam,
                "ad_group_theme": ag,
                "include_now": cc.get("include_now", 0),
                "review_high_priority": cc.get("review_high_priority", 0),
                "review_broad_test": cc.get("review_broad_test", 0),
                "future_test": cc.get("future_test", 0),
                "exclude_negative": cc.get("exclude_negative", 0),
                "total": cc.get("total", 0),
            }
        )
    _write_csv(path, CLUSTER_SUMMARY_COLUMNS, out)
    return path


def write_negative_keywords_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "negative_keywords.csv")
    neg_rows: list[dict[str, Any]] = []
    for r in rows:
        if str(r.get("tier_status", "")) != "exclude_negative":
            continue
        risk = int(r.get("negative_risk_score") or 0)
        neg_rows.append(
            {
                "campaign_family": r.get("campaign_family", ""),
                "ad_group_theme": r.get("ad_group_theme", ""),
                "keyword_candidate": r.get("keyword_candidate", ""),
                "negative_level": negative_level(
                    risk, str(r.get("status_recommendation", ""))
                ),
                "reason": r.get("notes", ""),
            }
        )
    _write_csv(path, NEGATIVE_COLUMNS, neg_rows)
    return path


def write_seed_summary_csv(
    output_dir: str,
    summary_rows: list[dict[str, Any]],
) -> str:
    path = os.path.join(output_dir, "seed_expansion_summary.csv")
    _write_csv(path, SUMMARY_COLUMNS, summary_rows)
    return path


def write_serp_source_dump_csv(
    output_dir: str,
    dump_rows: list[dict[str, Any]],
) -> str:
    path = os.path.join(output_dir, "serp_source_dump.csv")
    _write_csv(path, DUMP_COLUMNS, dump_rows)
    return path


def write_editor_keywords_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "keywords_grouped_for_google_ads_editor.csv")
    out: list[dict[str, str]] = []
    for r in rows:
        if not _row_is_include(r):
            continue
        fam = str(r.get("campaign_family", ""))
        campaign = CAMPAIGN_EDITOR_NAMES.get(fam, fam)
        mt = editor_match_type(str(r.get("recommended_match_type", "phrase")))
        kw = str(r.get("keyword_candidate", ""))
        if mt == "Exact":
            kw_fmt = f"[{kw}]"
        elif mt == "Phrase":
            kw_fmt = f'"{kw}"'
        else:
            kw_fmt = kw
        out.append(
            {
                "Campaign": campaign,
                "Ad Group": str(r.get("ad_group_theme", "")),
                "Keyword": kw_fmt,
                "Match Type": mt,
            }
        )
    _write_csv(path, EDITOR_KEYWORD_COLUMNS, out)
    return path


def write_editor_negatives_csv(output_dir: str, rows: list[dict[str, Any]]) -> str:
    path = os.path.join(output_dir, "negatives_grouped_for_google_ads_editor.csv")
    out: list[dict[str, str]] = []
    for r in rows:
        if str(r.get("tier_status", "")) != "exclude_negative":
            continue
        fam = str(r.get("campaign_family", ""))
        campaign = CAMPAIGN_EDITOR_NAMES.get(fam, fam)
        kw = str(r.get("keyword_candidate", ""))
        nm = negative_editor_match_type(kw)
        if nm == "Phrase":
            neg_kw = f'"{kw}"'
        else:
            neg_kw = kw
        out.append(
            {
                "Campaign": campaign,
                "Ad Group": str(r.get("ad_group_theme", "")),
                "Negative Keyword": neg_kw,
                "Match Type": nm,
            }
        )
    _write_csv(path, EDITOR_NEGATIVE_COLUMNS, out)
    return path


def write_all_csvs(
    output_dir: str,
    master_rows: list[dict[str, Any]],
    dump_rows: list[dict[str, Any]],
    summary_rows: list[dict[str, Any]],
    *,
    validation_ctx: dict[str, Any] | None = None,
    gsc_rows: list[dict[str, Any]] | None = None,
    brave_dump_rows: list[dict[str, Any]] | None = None,
    ads_match_rows: list[dict[str, Any]] | None = None,
) -> list[str]:
    _ensure_dir(output_dir)
    paths = [
        write_master_csv(output_dir, master_rows),
        write_keyword_universe_csv(output_dir, master_rows),
        write_keywords_include_csv(output_dir, master_rows),
        write_keywords_review_csv(output_dir, master_rows),
        write_keywords_broad_test_csv(output_dir, master_rows),
        write_keyword_validation_summary_csv(
            output_dir, master_rows, validation_ctx
        ),
        write_negative_keywords_csv(output_dir, master_rows),
        write_seed_summary_csv(output_dir, summary_rows),
        write_serp_source_dump_csv(output_dir, dump_rows),
        write_keyword_cluster_summary_csv(output_dir, master_rows),
        write_editor_keywords_csv(output_dir, master_rows),
        write_editor_negatives_csv(output_dir, master_rows),
    ]
    if gsc_rows:
        paths.append(write_search_console_query_dump_csv(output_dir, gsc_rows))
    if brave_dump_rows:
        paths.append(write_brave_source_dump_csv(output_dir, brave_dump_rows))
    if ads_match_rows is not None:
        paths.append(
            write_google_ads_script_validation_dump_csv(output_dir, ads_match_rows)
        )
    return paths
