"""Write LLM reorganizer CSV and JSON outputs."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd

LLM_MASTER_COLUMNS: list[str] = [
    "original_keyword",
    "normalized_keyword",
    "campaign_family",
    "ad_group_theme",
    "seed_keyword",
    "source",
    "input_tier_status",
    "input_recommended_match_type",
    "input_notes",
    "heuristic_tags",
    "pre_rule_id",
    "pre_rule_reason",
    "skipped_llm",
    "llm_keep_decision",
    "llm_recommended_match_type",
    "llm_confidence",
    "llm_reason",
    "llm_negative_reason",
    "llm_tags",
    "llm_rewritten_clean_keyword",
    "final_keep_decision",
    "final_recommended_match_type",
    "final_negative_reason",
    "post_rule_id",
    "parse_status",
    "api_error",
]

SLICE_COLUMNS: list[str] = [
    "campaign_family",
    "ad_group_theme",
    "keyword_candidate",
    "recommended_match_type",
    "reason",
]

NEGATIVE_EXPORT_COLUMNS: list[str] = [
    "campaign_family",
    "ad_group_theme",
    "keyword_candidate",
    "negative_level",
    "reason",
]

EDITOR_KW_COLUMNS: list[str] = ["Campaign", "Ad Group", "Keyword", "Match Type"]
EDITOR_NEG_COLUMNS: list[str] = [
    "Campaign",
    "Ad Group",
    "Negative Keyword",
    "Match Type",
]


def _ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def _editor_kw_format(kw: str, match_type: str) -> str:
    m = (match_type or "phrase").strip().lower()
    if m == "exact":
        return f"[{kw}]"
    if m == "phrase":
        return f'"{kw}"'
    return kw


def _negative_editor_mt(kw: str) -> str:
    return "Phrase" if len(kw.split()) > 1 else "Broad"


def _negative_fmt(kw: str, mt: str) -> str:
    if mt == "Phrase":
        return f'"{kw}"'
    return kw


def _slice_match_type_label(raw: str) -> str:
    x = (raw or "phrase").lower()
    if x == "exact":
        return "Exact"
    if x == "broad":
        return "Broad"
    return "Phrase"


def _keyword_field_usable(value: Any) -> bool:
    if value is None:
        return False
    s = str(value).strip()
    if not s:
        return False
    if s.lower() in ("nan", "none", "null"):
        return False
    return True


def kw_col(r: dict[str, Any]) -> str:
    """Best keyword text for exports: rewrite, then normalized, then original (skip NaN placeholders)."""
    for key in (
        "llm_rewritten_clean_keyword",
        "normalized_keyword",
        "original_keyword",
    ):
        v = r.get(key)
        if _keyword_field_usable(v):
            return str(v).strip()
    return ""


def export_all(
    output_dir: Path,
    rows: list[dict[str, Any]],
    campaign_editor_names: dict[str, str],
    *,
    audit_path: Path,
    summary_path: Path,
) -> list[Path]:
    _ensure_dir(output_dir)
    df = pd.DataFrame(rows)
    if df.empty:
        df = pd.DataFrame(columns=LLM_MASTER_COLUMNS)

    # Ensure columns exist
    for c in LLM_MASTER_COLUMNS:
        if c not in df.columns:
            df[c] = ""

    paths: list[Path] = []

    master_path = output_dir / "llm_keywords_master.csv"
    df[LLM_MASTER_COLUMNS].to_csv(master_path, index=False, encoding="utf-8")
    paths.append(master_path)

    def reason_col(r: dict[str, Any]) -> str:
        return str(r.get("llm_reason") or r.get("final_negative_reason") or "")

    # Slices
    for name, pred in [
        ("llm_keywords_include.csv", lambda d: d.get("final_keep_decision") == "include_now"),
        (
            "llm_keywords_review.csv",
            lambda d: d.get("final_keep_decision") == "review_high_priority",
        ),
        (
            "llm_keywords_broad_test.csv",
            lambda d: d.get("final_keep_decision")
            in ("review_broad_test", "future_test"),
        ),
    ]:
        sub = [
            {
                "campaign_family": r.get("campaign_family", ""),
                "ad_group_theme": r.get("ad_group_theme", ""),
                "keyword_candidate": kw_col(r),
                "recommended_match_type": _slice_match_type_label(
                    str(r.get("final_recommended_match_type", "phrase"))
                ),
                "reason": reason_col(r),
            }
            for r in rows
            if pred(r)
        ]
        p = output_dir / name
        pd.DataFrame(sub, columns=SLICE_COLUMNS).to_csv(
            p, index=False, encoding="utf-8"
        )
        paths.append(p)

    neg_rows = [
        {
            "campaign_family": r.get("campaign_family", ""),
            "ad_group_theme": r.get("ad_group_theme", ""),
            "keyword_candidate": kw_col(r),
            "negative_level": "ad_group",
            "reason": str(
                r.get("final_negative_reason")
                or r.get("llm_negative_reason")
                or r.get("pre_rule_reason")
                or ""
            ),
        }
        for r in rows
        if r.get("final_keep_decision") == "exclude_negative"
    ]
    neg_path = output_dir / "llm_negative_keywords.csv"
    pd.DataFrame(neg_rows, columns=NEGATIVE_EXPORT_COLUMNS).to_csv(
        neg_path, index=False, encoding="utf-8"
    )
    paths.append(neg_path)

    # Editor positives
    ed_kw: list[dict[str, str]] = []
    for r in rows:
        if r.get("final_keep_decision") != "include_now":
            continue
        fam = str(r.get("campaign_family", ""))
        camp = campaign_editor_names.get(fam, fam)
        kw = kw_col(r)
        mt = str(r.get("final_recommended_match_type", "phrase")).lower()
        ed_mt = "Exact" if mt == "exact" else ("Broad" if mt == "broad" else "Phrase")
        ed_kw.append(
            {
                "Campaign": camp,
                "Ad Group": str(r.get("ad_group_theme", "")),
                "Keyword": _editor_kw_format(kw, mt),
                "Match Type": ed_mt,
            }
        )
    ekp = output_dir / "llm_keywords_grouped_for_google_ads_editor.csv"
    pd.DataFrame(ed_kw, columns=EDITOR_KW_COLUMNS).to_csv(
        ekp, index=False, encoding="utf-8"
    )
    paths.append(ekp)

    ed_neg: list[dict[str, str]] = []
    for r in rows:
        if r.get("final_keep_decision") != "exclude_negative":
            continue
        fam = str(r.get("campaign_family", ""))
        camp = campaign_editor_names.get(fam, fam)
        kw = kw_col(r)
        nm = _negative_editor_mt(kw)
        ed_neg.append(
            {
                "Campaign": camp,
                "Ad Group": str(r.get("ad_group_theme", "")),
                "Negative Keyword": _negative_fmt(kw, nm),
                "Match Type": nm,
            }
        )
    enp = output_dir / "llm_negatives_grouped_for_google_ads_editor.csv"
    pd.DataFrame(ed_neg, columns=EDITOR_NEG_COLUMNS).to_csv(
        enp, index=False, encoding="utf-8"
    )
    paths.append(enp)

    # Audit / summary paths returned for logging (already appended by caller)
    _ = audit_path
    _ = summary_path
    return paths


def append_audit_line(audit_path: Path, record: dict[str, Any]) -> None:
    _ensure_dir(audit_path.parent)
    with open(audit_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def write_summary(summary_path: Path, summary: dict[str, Any]) -> None:
    _ensure_dir(summary_path.parent)
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
