#!/usr/bin/env python3
"""
Final Google Ads Editor upload CSVs from llm_keywords_master_repaired.csv only.
No APIs, no LLM. Plain keyword text; Match Type in its own column.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

CAMPAIGN_DIAGNOSTICS = "Search | Diagnostics & VOR | Kent + SE London"
CAMPAIGN_SERVICING = "Search | Servicing & Brakes | Kent + SE London"
CAMPAIGN_TUNING = "Search | Tuning | Commercial Vans | Kent + SE London"
ALL_CAMPAIGNS: frozenset[str] = frozenset(
    {CAMPAIGN_DIAGNOSTICS, CAMPAIGN_SERVICING, CAMPAIGN_TUNING}
)

AD_GROUPS_DIAGNOSTICS: frozenset[str] = frozenset(
    {
        "Standard Diagnosis",
        "VOR / Urgent Van Diagnostics",
        "Pre-Purchase Van Check",
        "AdBlue / DPF / Emissions",
        "Limp Mode / Derate",
    }
)
AD_GROUPS_SERVICING: frozenset[str] = frozenset(
    {
        "Mercedes Van Servicing & Brakes",
        "Sprinter Servicing",
        "Vito Servicing",
        "Citan Servicing",
        "Sprinter Brakes",
        "Vito Brakes",
        "Citan Brakes",
    }
)
AD_GROUPS_TUNING: frozenset[str] = frozenset(
    {
        "Van Economy Tune",
        "Van Load & Driveability Tune",
        "Fleet Van Tuning",
    }
)
ALL_LIVE_AD_GROUPS: frozenset[str] = (
    AD_GROUPS_DIAGNOSTICS | AD_GROUPS_SERVICING | AD_GROUPS_TUNING
)

_WS = re.compile(r"\s+")
_PUNCT_ENDS = re.compile(r"^[\s\"'.,;:!?`\-]+|[\s\"'.,;:!?`\-]+$")

# Substrings for positive hard exclusion (lowercased keyword)
POSITIVE_HARD_SUBSTRINGS: tuple[str, ...] = (
    "mobile mechanic",
    "mechanic near me",
    "mercedes mechanic near me",
    "auto electrician",
    "car electrician",
    "mobile auto electrician",
    "garage near me",
    "workshop near me",
    "24 hour",
    "open now",
    "cheap",
    "cheapest",
    " free",
    "free ",
    "service reset",
    "light reset",
    " for sale",
    "opening hours",
    "phone number",
    "reddit",
    "quora",
    "forum",
    " guide",
    "diy",
    "pdf",
    "software download",
    "download software",
    "salary",
    "training course",
    "emulator",
    "stage 2",
    "stage 3",
    "pops and bangs",
    "crackle map",
    "flames",
    "hard cut",
    "launch control",
    "dyno",
    "race ",
    " racing",
    "racing ",
    "bhp gain",
    "power tune",
    "max power",
    "popcorn",
    "loud exhaust",
    "pops and bang",
)

POSITIVE_HARD_REGEX: tuple[str, ...] = (
    r"\breset\b",
    r"\bmot\b",
    r"\bparts\b",
    r"\bjobs?\b",
    r"\bmanual\b",
    r"\bbypass\b",
    r"\bdefeat\b",
    r"\bdelete\b",
    r"\btutorial\b",
    r"\bguide\b",
)

# Triplicate across all campaigns; Ad Group blank (campaign-level)
GLOBAL_NEGATIVE_SUBSTRINGS: frozenset[str] = frozenset(
    {
        "reddit",
        "quora",
        "forum",
        "for sale",
        "salary",
        "opening hours",
        "phone number",
        "software download",
        "download software",
        "training course",
        "emulator",
        "popcorn",
    }
)

# Prefer Broad for negatives when keyword matches these (substring or regex)
NEGATIVE_BROAD_SUBSTRINGS: tuple[str, ...] = (
    "mobile mechanic",
    "auto electrician",
    "car electrician",
    "stage 2",
    "stage 3",
    "pops and bangs",
    "pops and bang",
    "mot ",
    " mot",
    " free",
    "free ",
    "jobs ",
    " jobs",
    "job ",
    " pdf",
    "pdf ",
    "cheap",
    "diy",
)

NEGATIVE_BROAD_REGEX: tuple[str, ...] = (
    r"^\s*mot\s*$",
    r"^\s*free\s*$",
    r"^\s*jobs?\s*$",
    r"^\s*pdf\s*$",
    r"^\s*car\s*$",
    r"^\s*motorcycle\s*$",
    r"^\s*bike\s*$",
    r"^\s*diy\s*$",
)

DIAG_SIGNALS: tuple[str, ...] = (
    "diagnostic",
    "diagnostics",
    "fault finding",
    "warning light",
    "check engine",
    "limp mode",
    "reduced power",
    "derate",
    "adblue",
    "dpf",
    "nox",
    "scr",
    "pre purchase",
    "pre-purchase",
    "prepurchase",
    "urgent",
    "wont start",
    "won't start",
    "mercedes",
    "sprinter",
    "vito",
    "citan",
    "van diagnostic",
    "van diagnostics",
    "mobile diagnostic",
    "mobile diagnostics",
    "star diagnostic",
    "engine check",
    "fault code",
    "xentry",
)

DIAG_SIGNAL_REGEX = re.compile(
    r"\b(vor|nox|scr|dpf)\b|"
    r"diagnostic|diagnostics|fault\s+finding|warning\s+light|check\s+engine|"
    r"limp\s+mode|reduced\s+power|derate|adblue|pre[\s\-]?purchase|prepurchase|"
    r"urgent|wont\s+start|won'?t\s+start|mercedes|sprinter|vito|citan|"
    r"van\s+diagnostic|mobile\s+diagnostic|star\s+diagnostic|engine\s+check|"
    r"fault\s+code|xentry",
    re.IGNORECASE,
)

SERV_SIGNALS: tuple[str, ...] = (
    "service",
    "servicing",
    "brakes",
    "brake",
    "brake pad",
    "brake disc",
    "full service",
    "major service",
    "interim service",
    "mercedes",
    "sprinter",
    "vito",
    "citan",
    "van service",
    "mobile service",
    "mobilo",
    "service plan",
    "service book",
)

TUNE_MODELS: tuple[str, ...] = (
    "sprinter",
    "vito",
    "citan",
    "transit",
    "transit custom",
    "crafter",
    "transporter",
    "trafic",
    "vivaro",
    "movano",
    "ducato",
    "boxer",
    "relay",
    "proace",
    "primastar",
    "nv400",
    "tge",
    " daily",
    "daily ",
)

TUNE_CORE: tuple[str, ...] = (
    "economy tune",
    "economy remap",
    "load tune",
    "driveability",
    "fuel economy",
    "fuel saving",
    " mpg",
    "mpg ",
    "commercial van",
    "commercial tuning",
    "fleet van",
    "fleet ",
    " work van",
    "work van",
    "van economy",
    "van remap",
    "van tune",
    "van tuning",
    "van remapping",
    "remap van",
    "tune van",
    "mapping",
    "ecu",
    "torque tune",
)

# Unqualified generic tuning near-me (must NOT match qualifier)
TUNE_NEARME_GENERIC = re.compile(
    r"(?:^|\s)(?:ecu\s+)?(?:engine\s+)?remap\s+near\s+me|"
    r"^remap\s+near\s+me$|"
    r"^tuning\s+near\s+me$|"
    r"^ecu\s+remap\s+near\s+me$|"
    r"^engine\s+remap\s+near\s+me$",
    re.IGNORECASE,
)
TUNE_QUALIFIER = re.compile(
    r"\b(van|vans|sprinter|vito|citan|mercedes|commercial|fleet|transit|"
    r"crafter|transporter|trafic|vivaro|movano|ducato|boxer|relay|proace|"
    r"primastar|nv400|tge|daily|work\s+van)\b",
    re.IGNORECASE,
)


def _is_nanish(s: str) -> bool:
    t = (s or "").strip().lower()
    return t in ("", "nan", "none", "null")


def build_final_keyword_text(row: pd.Series) -> str:
    for col in (
        "repaired_keyword_candidate",
        "llm_rewritten_clean_keyword",
        "normalized_keyword",
        "original_keyword",
    ):
        raw = str(row.get(col, "") or "")
        if _is_nanish(raw):
            continue
        s = raw.strip().lower()
        s = _WS.sub(" ", s).strip()
        s = _strip_accidental_punct(s)
        if s and not _is_nanish(s):
            return s
    return ""


def _strip_accidental_punct(s: str) -> str:
    prev = None
    while prev != s:
        prev = s
        s = _PUNCT_ENDS.sub("", s).strip()
    return s


def campaign_family_key(camp: str) -> str:
    if camp == CAMPAIGN_DIAGNOSTICS:
        return "diagnostics"
    if camp == CAMPAIGN_SERVICING:
        return "servicing"
    if camp == CAMPAIGN_TUNING:
        return "tuning"
    return ""


def matches_positive_hard_exclude(kw: str) -> bool:
    low = kw.lower()
    for sub in POSITIVE_HARD_SUBSTRINGS:
        if sub in low:
            return True
    for pat in POSITIVE_HARD_REGEX:
        if re.search(pat, low, re.IGNORECASE):
            return True
    return False


def passes_relevance(kw: str, camp: str) -> bool:
    fam = campaign_family_key(camp)
    low = kw.lower()
    if fam == "diagnostics":
        if DIAG_SIGNAL_REGEX.search(kw):
            return True
        return any(sig in low for sig in DIAG_SIGNALS)
    if fam == "servicing":
        return any(sig in low for sig in SERV_SIGNALS)
    if fam == "tuning":
        if TUNE_NEARME_GENERIC.search(kw) and not TUNE_QUALIFIER.search(kw):
            return False
        has_model = any(m.strip() in low for m in TUNE_MODELS)
        has_core = any(c in low for c in TUNE_CORE)
        if has_core or has_model:
            return True
        if re.search(r"\b(remap|tune|tuning|mapping|ecu)\b", low):
            return bool(TUNE_QUALIFIER.search(kw))
        return False
    return False


def is_global_negative_keyword(kw: str) -> bool:
    low = kw.lower()
    return any(g in low for g in GLOBAL_NEGATIVE_SUBSTRINGS)


def normalize_positive_match_type(raw: str, kw: str) -> str:
    x = (raw or "").strip()
    xl = x.lower()
    if xl == "exact":
        return "Exact"
    if xl == "phrase":
        return "Phrase"
    if xl == "broad":
        return "Broad"
    tokens = kw.split()
    low = kw.lower()
    if len(tokens) >= 4 and re.search(
        r"\b(sprinter|vito|citan)\b", low
    ) and re.search(r"\b(service|diagnostic|brakes|remap|tune)\b", low):
        return "Exact"
    return "Phrase"


def negative_match_type_for(kw: str, stored: str) -> str:
    st = (stored or "").strip().lower()
    if st == "exact":
        return "Exact"
    if st == "broad":
        return "Broad"
    low = kw.lower()
    for pat in NEGATIVE_BROAD_REGEX:
        if re.search(pat, low, re.IGNORECASE):
            return "Broad"
    for sub in NEGATIVE_BROAD_SUBSTRINGS:
        if sub in low:
            return "Broad"
    if len(kw.split()) <= 1 and len(kw) <= 5:
        return "Broad"
    return "Phrase"


def remap_campaign_ad_group(
    row: pd.Series, kw: str
) -> tuple[str, str]:
    camp = str(row.get("repaired_campaign_name", "") or "").strip()
    ag = str(row.get("repaired_ad_group_theme", "") or "").strip()
    if camp in ALL_CAMPAIGNS and ag in ALL_LIVE_AD_GROUPS:
        return camp, ag
    fam = str(row.get("campaign_family", "") or "").strip()
    if fam == "Diagnostics & VOR":
        return CAMPAIGN_DIAGNOSTICS, "Standard Diagnosis"
    if fam == "Mercedes Van Servicing":
        return CAMPAIGN_SERVICING, "Mercedes Van Servicing & Brakes"
    if fam == "Van Tuning":
        return CAMPAIGN_TUNING, "Van Load & Driveability Tune"
    if "sprinter" in kw or "vito" in kw or "citan" in kw:
        if "tune" in kw or "remap" in kw or "ecu" in kw:
            return CAMPAIGN_TUNING, "Van Load & Driveability Tune"
        if "brake" in kw:
            return CAMPAIGN_SERVICING, "Mercedes Van Servicing & Brakes"
        return CAMPAIGN_SERVICING, "Sprinter Servicing"
    return CAMPAIGN_DIAGNOSTICS, "Standard Diagnosis"


def run_export(args: argparse.Namespace) -> dict[str, Any]:
    master = Path(args.input_master).resolve()
    out_dir = Path(args.output_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(master, dtype=str, keep_default_na=False)

    positives: list[dict[str, str]] = []
    negatives: list[dict[str, str]] = []
    audit_rows: list[dict[str, str]] = []

    drop_reasons: Counter[str] = Counter()
    promoted_reasons: Counter[str] = Counter()
    neg_sources: Counter[str] = Counter()
    dropped_from_positive = 0
    promoted_to_negative = 0

    for idx, row in df.iterrows():
        orig_kw = str(row.get("original_keyword", "") or "")
        final_kw = build_final_keyword_text(row)
        decision = str(row.get("repaired_final_keep_decision", "") or "").strip()
        stored_mt = str(row.get("repaired_match_type", "") or "").strip()
        stored_final_mt = str(row.get("final_recommended_match_type", "") or "").strip()

        if not final_kw or len(final_kw) < 3:
            drop_reasons["blank_or_short_keyword"] += 1
            audit_rows.append(
                {
                    "original_keyword": orig_kw,
                    "final_keyword_text": final_kw,
                    "final_bucket": "discarded",
                    "campaign": "",
                    "ad_group": "",
                    "match_type": "",
                    "action_taken": "discarded_blank_or_short",
                    "reason": "keyword empty or length < 3 after normalization",
                }
            )
            continue

        camp, ag = remap_campaign_ad_group(row, final_kw)

        if decision not in ("include_now", "exclude_negative") and decision in (
            "review_high_priority",
            "review_broad_test",
            "future_test",
        ):
            audit_rows.append(
                {
                    "original_keyword": orig_kw,
                    "final_keyword_text": final_kw,
                    "final_bucket": "discarded",
                    "campaign": camp,
                    "ad_group": ag,
                    "match_type": "",
                    "action_taken": "discarded_not_include_now",
                    "reason": f"decision={decision}",
                }
            )
            continue

        if decision == "include_now":
            if matches_positive_hard_exclude(final_kw):
                dropped_from_positive += 1
                promoted_to_negative += 1
                promoted_reasons["hard_exclusion"] += 1
                neg_mt = negative_match_type_for(final_kw, stored_mt or stored_final_mt)
                neg_sources["promoted_hard_exclusion"] += 1
                _add_negative_rows(
                    negatives,
                    final_kw,
                    camp,
                    ag,
                    neg_mt,
                    global_dup=is_global_negative_keyword(final_kw),
                )
                audit_rows.append(
                    {
                        "original_keyword": orig_kw,
                        "final_keyword_text": final_kw,
                        "final_bucket": "negative",
                        "campaign": camp,
                        "ad_group": ag,
                        "match_type": neg_mt,
                        "action_taken": "negative_promoted_hard_exclusion",
                        "reason": "positive_hard_exclusion_list",
                    }
                )
                continue

            if not passes_relevance(final_kw, camp):
                dropped_from_positive += 1
                promoted_to_negative += 1
                promoted_reasons["generic_quality_filter"] += 1
                neg_mt = negative_match_type_for(final_kw, stored_mt or stored_final_mt)
                neg_sources["promoted_quality_filter"] += 1
                _add_negative_rows(
                    negatives,
                    final_kw,
                    camp,
                    ag,
                    neg_mt,
                    global_dup=is_global_negative_keyword(final_kw),
                )
                audit_rows.append(
                    {
                        "original_keyword": orig_kw,
                        "final_keyword_text": final_kw,
                        "final_bucket": "negative",
                        "campaign": camp,
                        "ad_group": ag,
                        "match_type": neg_mt,
                        "action_taken": "negative_promoted_quality_filter",
                        "reason": "failed_per_campaign_relevance_signals",
                    }
                )
                continue

            pos_mt = normalize_positive_match_type(stored_mt, final_kw)
            positives.append(
                {
                    "Campaign": camp,
                    "Ad Group": ag,
                    "Keyword": final_kw,
                    "Match Type": pos_mt,
                }
            )
            audit_rows.append(
                {
                    "original_keyword": orig_kw,
                    "final_keyword_text": final_kw,
                    "final_bucket": "positive",
                    "campaign": camp,
                    "ad_group": ag,
                    "match_type": pos_mt,
                    "action_taken": "include_positive",
                    "reason": "include_now_passed_filters",
                }
            )
            continue

        if decision == "exclude_negative":
            neg_mt = negative_match_type_for(final_kw, stored_mt or stored_final_mt)
            neg_sources["master_exclude_negative"] += 1
            _add_negative_rows(
                negatives,
                final_kw,
                camp,
                ag,
                neg_mt,
                global_dup=is_global_negative_keyword(final_kw),
            )
            audit_rows.append(
                {
                    "original_keyword": orig_kw,
                    "final_keyword_text": final_kw,
                    "final_bucket": "negative",
                    "campaign": camp,
                    "ad_group": ag,
                    "match_type": neg_mt,
                    "action_taken": "negative_master_exclude",
                    "reason": str(row.get("repair_notes", "") or row.get("final_negative_reason", "") or "")[:500],
                }
            )
            continue

        audit_rows.append(
            {
                "original_keyword": orig_kw,
                "final_keyword_text": final_kw,
                "final_bucket": "discarded",
                "campaign": camp,
                "ad_group": ag,
                "match_type": "",
                "action_taken": "discarded_unknown_decision",
                "reason": f"decision={decision}",
            }
        )

    pos_df = pd.DataFrame(positives)
    if not pos_df.empty:
        pos_df = pos_df.drop_duplicates(
            subset=["Campaign", "Ad Group", "Keyword", "Match Type"], keep="first"
        )

    neg_df = pd.DataFrame(negatives)
    if not neg_df.empty:
        neg_df = neg_df.drop_duplicates(
            subset=["Campaign", "Ad Group", "Negative Keyword", "Match Type"],
            keep="first",
        )

    _validate_outputs(pos_df, neg_df)

    pos_path = out_dir / "positive_keywords_upload_ready.csv"
    neg_path = out_dir / "negative_keywords_upload_ready.csv"
    pos_df.to_csv(pos_path, index=False, encoding="utf-8")
    neg_df.to_csv(neg_path, index=False, encoding="utf-8")

    audit_path = out_dir / "final_export_audit.csv"
    pd.DataFrame(audit_rows).to_csv(audit_path, index=False, encoding="utf-8")

    summary = {
        "total_positive_rows": int(len(pos_df)),
        "total_negative_rows": int(len(neg_df)),
        "total_rows_dropped_from_positive": dropped_from_positive,
        "total_rows_promoted_to_negative": promoted_to_negative,
        "totals_by_campaign_positive": pos_df["Campaign"].value_counts().to_dict()
        if not pos_df.empty
        else {},
        "totals_by_campaign_negative": neg_df["Campaign"].value_counts().to_dict()
        if not neg_df.empty
        else {},
        "totals_by_ad_group_positive": pos_df["Ad Group"].value_counts().to_dict()
        if not pos_df.empty
        else {},
        "totals_by_ad_group_negative": neg_df["Ad Group"]
        .replace("", "(campaign_level_blank)")
        .value_counts()
        .to_dict()
        if not neg_df.empty
        else {},
        "top_positive_drop_reasons": [
            {"reason": k, "count": int(v)} for k, v in promoted_reasons.most_common(20)
        ],
        "top_negative_sources": [
            {"source": k, "count": int(v)} for k, v in neg_sources.most_common(20)
        ],
        "blank_keyword_drops": int(drop_reasons.get("blank_or_short_keyword", 0)),
    }
    for k, v in list(summary["totals_by_campaign_positive"].items()):
        summary["totals_by_campaign_positive"][str(k)] = int(v)
    for k, v in list(summary["totals_by_campaign_negative"].items()):
        summary["totals_by_campaign_negative"][str(k)] = int(v)
    for k, v in list(summary["totals_by_ad_group_positive"].items()):
        summary["totals_by_ad_group_positive"][str(k)] = int(v)
    for k, v in list(summary["totals_by_ad_group_negative"].items()):
        summary["totals_by_ad_group_negative"][str(k)] = int(v)

    with open(out_dir / "final_export_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    if args.verbose:
        logger.info("Summary: %s", json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))
    return summary


def _add_negative_rows(
    negatives: list[dict[str, str]],
    kw: str,
    camp: str,
    ag: str,
    neg_mt: str,
    *,
    global_dup: bool,
) -> None:
    if global_dup:
        for c in ALL_CAMPAIGNS:
            negatives.append(
                {
                    "Campaign": c,
                    "Ad Group": "",
                    "Negative Keyword": kw,
                    "Match Type": neg_mt,
                }
            )
        return
    negatives.append(
        {
            "Campaign": camp,
            "Ad Group": ag,
            "Negative Keyword": kw,
            "Match Type": neg_mt,
        }
    )


def _validate_outputs(pos_df: pd.DataFrame, neg_df: pd.DataFrame) -> None:
    if not pos_df.empty:
        assert set(pos_df["Campaign"].unique()) <= ALL_CAMPAIGNS
        assert set(pos_df["Ad Group"].unique()) <= ALL_LIVE_AD_GROUPS
        for col in ("Keyword",):
            assert pos_df[col].astype(str).str.strip().ne("").all()
            assert not pos_df[col].astype(str).str.lower().isin(["nan", "none"]).any()
        dup = pos_df.duplicated(
            subset=["Campaign", "Ad Group", "Keyword", "Match Type"]
        )
        assert not dup.any(), "duplicate positives"

    if not neg_df.empty:
        assert set(neg_df["Campaign"].unique()) <= ALL_CAMPAIGNS
        ags = set(neg_df["Ad Group"].astype(str).unique())
        ags.discard("")
        assert ags <= ALL_LIVE_AD_GROUPS
        for _, r in neg_df.iterrows():
            nk = str(r["Negative Keyword"]).strip()
            assert nk and nk.lower() not in ("nan", "none")
        dup = neg_df.duplicated(
            subset=["Campaign", "Ad Group", "Negative Keyword", "Match Type"]
        )
        assert not dup.any(), "duplicate negatives"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Build Editor upload CSVs from repaired master (no API)."
    )
    p.add_argument(
        "--input-master",
        type=str,
        required=True,
        help="Path to llm_keywords_master_repaired.csv",
    )
    p.add_argument(
        "--output-dir",
        type=str,
        default="final_exports",
        help="Output directory",
    )
    p.add_argument("--verbose", action="store_true")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s %(message)s",
    )
    try:
        run_export(args)
    except AssertionError as e:
        logger.error("Validation failed: %s", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
