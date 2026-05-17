#!/usr/bin/env python3
"""
Deterministic repair of LLM keyword exports from llm_keywords_master.csv only.
No APIs. Rebuilds Editor-ready CSVs with live campaign/ad group names and clean keyword text.
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

# --- Live Google Ads structure (exact strings) ---

CAMPAIGN_DIAGNOSTICS = "Search | Diagnostics & VOR | Kent + SE London"
CAMPAIGN_SERVICING = "Search | Servicing & Brakes | Kent + SE London"
CAMPAIGN_TUNING = "Search | Tuning | Commercial Vans | Kent + SE London"

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

AD_GROUP_STATIC_RENAMES: dict[str, str] = {
    "adblue / dpf / nox": "AdBlue / DPF / Emissions",
    "mercedes van servicing": "Mercedes Van Servicing & Brakes",
}

NON_LIVE_TUNING_AD_GROUPS: frozenset[str] = frozenset(
    {"Sprinter Remap", "Mobile Van Remap"}
)

_WS = re.compile(r"\s+")
_PHONE_PATTERNS = (
    r"\+44\s?7\d{2}",
    r"\b07\d{9}\b",
    r"\+1[\s\-]?\d{3}",
    r"\(\d{3}\)\s*\d{3}[\s\-]?\d{4}",
)

MASTER_COLUMNS: tuple[str, ...] = (
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
)

REPAIR_EXTRA_COLUMNS: tuple[str, ...] = (
    "repaired_keyword_candidate",
    "repaired_campaign_name",
    "repaired_ad_group_theme",
    "repaired_match_type",
    "repaired_final_keep_decision",
    "synthetic_row",
    "repair_notes",
)

MASTER_REPAIRED_COLUMNS: tuple[str, ...] = MASTER_COLUMNS + REPAIR_EXTRA_COLUMNS

HARD_SUBSTRINGS: tuple[str, ...] = (
    "service reset",
    "light reset",
    " for sale",
    "opening hours",
    "phone number",
    "reddit",
    "quora",
    "forum",
    " guide",
    "free ",
    " free",
    "pdf",
    "salary",
    "training course",
    "software download",
    "download software",
    "emulator",
    "dpf delete",
    "egr delete",
    "adblue delete",
    "def delete",
    "emissions delete",
    "stage 2",
    "stage 3",
    "pops and bangs",
    "crackle map",
    "flames",
    "hard cut",
    "launch control",
    "dyno only",
    "pop and bang",
)

HARD_REGEX: tuple[str, ...] = (
    r"\breset\b",
    r"\bmot\b",
    r"\bparts\b",
    r"\bjobs?\b",
    r"\bmanual\b",
    r"\bbypass\b",
    r"\bdefeat\b",
    r"\bdelete\b",
    r"\bdiy\b",
    r"\btutorial\b",
)

POOR_FIT_SUBSTRINGS: tuple[str, ...] = (
    "mobile mechanic",
    "mechanic near me",
    "auto electrician",
    "car electrician",
    "recovery",
    "tow truck",
    " tow ",
    "tow ",
    " garage near me",
    "garage near me",
    "workshop near me",
)

POOR_FIT_EXCEPTION_TERMS: frozenset[str] = frozenset(
    {
        "diagnostic",
        "diagnostics",
        "van diagnostic",
        "service",
        "servicing",
        "brakes",
        "brake",
        "adblue",
        "dpf",
        "remap",
        "tune",
        "tuning",
        "sprinter",
        "vito",
        "citan",
        "mercedes",
    }
)

VALID_DECISIONS: frozenset[str] = frozenset(
    {
        "include_now",
        "review_high_priority",
        "review_broad_test",
        "future_test",
        "exclude_negative",
    }
)

CITAN_SERVICING_KEYWORDS: tuple[tuple[str, str, str], ...] = (
    ("mercedes citan service", "Phrase", "include_now"),
    ("citan service", "Phrase", "include_now"),
    ("citan servicing", "Phrase", "include_now"),
    ("mobile citan servicing", "Phrase", "include_now"),
    ("citan service near me", "Phrase", "include_now"),
)
CITAN_BRAKES_KEYWORDS: tuple[tuple[str, str, str], ...] = (
    ("citan brakes", "Phrase", "review_high_priority"),
    ("mercedes citan brakes", "Phrase", "review_high_priority"),
    ("citan brake pads", "Phrase", "review_high_priority"),
    ("citan brake discs", "Phrase", "review_high_priority"),
    ("mobile citan brakes", "Phrase", "review_high_priority"),
)


def _is_nanish(s: str) -> bool:
    t = (s or "").strip().lower()
    return t in ("", "nan", "none", "null")


def clean_keyword_field(raw: str) -> str:
    """Normalize text; return empty if unusable."""
    if _is_nanish(raw):
        return ""
    s = str(raw).strip().lower()
    s = _WS.sub(" ", s).strip()
    return s


def build_repaired_keyword(row: pd.Series) -> str:
    """Fallback chain: rewrite -> normalized -> original."""
    for col in (
        "llm_rewritten_clean_keyword",
        "normalized_keyword",
        "original_keyword",
    ):
        v = clean_keyword_field(str(row.get(col, "") or ""))
        if v:
            return v
    return ""


def matches_hard_filter(kw: str) -> bool:
    low = kw.lower()
    for sub in HARD_SUBSTRINGS:
        if sub in low:
            return True
    for pat in HARD_REGEX:
        if re.search(pat, low, re.IGNORECASE):
            return True
    for pat in _PHONE_PATTERNS:
        if re.search(pat, kw, re.IGNORECASE):
            return True
    return False


def poor_fit_exception(kw: str) -> bool:
    low = kw.lower()
    return any(t in low for t in POOR_FIT_EXCEPTION_TERMS)


def matches_poor_fit_generic(kw: str) -> bool:
    if poor_fit_exception(kw):
        return False
    low = kw.lower()
    for sub in POOR_FIT_SUBSTRINGS:
        if sub.strip() in low or sub in low:
            return True
    if low.startswith("tow ") or low.endswith(" tow"):
        return True
    return False


def normalize_ad_group_incoming(ag: str) -> str:
    key = (ag or "").strip().lower()
    return AD_GROUP_STATIC_RENAMES.get(key, (ag or "").strip())


def campaign_for_ad_group(ag: str) -> str:
    if ag in AD_GROUPS_DIAGNOSTICS:
        return CAMPAIGN_DIAGNOSTICS
    if ag in AD_GROUPS_SERVICING:
        return CAMPAIGN_SERVICING
    if ag in AD_GROUPS_TUNING:
        return CAMPAIGN_TUNING
    return CAMPAIGN_DIAGNOSTICS


def family_from_editor_campaign(camp: str) -> str:
    if camp == CAMPAIGN_DIAGNOSTICS:
        return "Diagnostics & VOR"
    if camp == CAMPAIGN_SERVICING:
        return "Mercedes Van Servicing"
    if camp == CAMPAIGN_TUNING:
        return "Van Tuning"
    return ""


def remap_tuning_ad_group(kw: str) -> str:
    low = kw.lower()
    if "fleet" in low:
        return "Fleet Van Tuning"
    if re.search(
        r"\b(economy|fuel economy|mpg|fuel saving|better mpg)\b", low, re.IGNORECASE
    ):
        return "Van Economy Tune"
    return "Van Load & Driveability Tune"


def infer_family_from_keyword(kw: str) -> str:
    low = kw.lower()
    if re.search(
        r"\b(remap|tune|tuning|ecu|dpf regen tool)\b", low, re.IGNORECASE
    ) and not re.search(r"\b(service|servicing|brake|diagnostic)\b", low):
        return "Van Tuning"
    if re.search(
        r"\b(service|servicing|brake|brakes|pads|mot)\b", low, re.IGNORECASE
    ):
        return "Mercedes Van Servicing"
    return "Diagnostics & VOR"


def repair_ad_group_theme(
    row: pd.Series,
    kw: str,
    strict: bool,
) -> tuple[str, str]:
    """
    Return (repaired_ad_group, repair_note).
    """
    notes: list[str] = []
    fam = str(row.get("campaign_family", "") or "").strip()
    ag_raw = str(row.get("ad_group_theme", "") or "").strip()
    ag = normalize_ad_group_incoming(ag_raw)

    if ag in ALL_LIVE_AD_GROUPS:
        return ag, ""

    if ag in NON_LIVE_TUNING_AD_GROUPS or (
        fam == "Van Tuning" and ag not in ALL_LIVE_AD_GROUPS
    ):
        new_ag = remap_tuning_ad_group(kw)
        notes.append(f"remap_non_live_tuning:{ag_raw}->{new_ag}")
        return new_ag, ";".join(notes)

    if fam == "Van Tuning":
        new_ag = remap_tuning_ad_group(kw)
        notes.append(f"remap_van_tuning_family:{ag_raw}->{new_ag}")
        return new_ag, ";".join(notes)

    if fam == "Mercedes Van Servicing":
        if ag and ag not in ALL_LIVE_AD_GROUPS:
            notes.append(f"remap_servicing_unknown:{ag_raw}->Mercedes Van Servicing & Brakes")
        return "Mercedes Van Servicing & Brakes", ";".join(notes)

    if fam == "Diagnostics & VOR":
        if ag and ag not in ALL_LIVE_AD_GROUPS:
            notes.append(f"remap_diagnostics_unknown:{ag_raw}->Standard Diagnosis")
        return "Standard Diagnosis", ";".join(notes)

    inferred = infer_family_from_keyword(kw)
    if inferred == "Van Tuning":
        new_ag = remap_tuning_ad_group(kw)
        notes.append(f"infer_tuning_family:{ag_raw}->{new_ag}")
        return new_ag, ";".join(notes)
    if inferred == "Mercedes Van Servicing":
        notes.append(f"infer_servicing:{ag_raw}->Mercedes Van Servicing & Brakes")
        return "Mercedes Van Servicing & Brakes", ";".join(notes)
    notes.append(f"infer_diagnostics:{ag_raw}->Standard Diagnosis")
    return "Standard Diagnosis", ";".join(notes)


def normalize_match_type(raw: str, kw: str, decision: str) -> str:
    s = (raw or "").strip().lower()
    if s == "exact":
        return "Exact"
    if s == "broad":
        return "Broad"
    if s == "phrase":
        return "Phrase"
    low = kw.lower()
    tokens = low.split()
    if len(tokens) >= 4 and re.search(
        r"\b(sprinter|vito|citan)\b", low
    ) and re.search(r"\b(service|diagnostic|brakes)\b", low):
        return "Exact"
    if re.search(
        r"\b(service|diagnostic|brakes|remap|servicing)\b", low, re.IGNORECASE
    ):
        return "Phrase"
    if decision in ("review_broad_test", "future_test"):
        return "Broad"
    return "Phrase"


def negative_editor_match_type(kw: str, stored: str) -> str:
    st = (stored or "").strip().lower()
    if st == "phrase":
        return "Phrase"
    if st == "exact":
        return "Exact"
    parts = kw.split()
    return "Phrase" if len(parts) > 1 else "Broad"


def format_positive_keyword(kw: str, match_type: str) -> str:
    m = match_type.strip()
    if m == "Exact":
        return f"[{kw}]"
    if m == "Phrase":
        return f'"{kw}"'
    return kw


def format_negative_keyword(kw: str, match_type: str) -> str:
    if match_type == "Phrase":
        return f'"{kw}"'
    return kw


def _empty_master_row() -> dict[str, str]:
    return {c: "" for c in MASTER_COLUMNS}


def build_synthetic_citan_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for kw, mt, dec in CITAN_SERVICING_KEYWORDS:
        base = _empty_master_row()
        base.update(
            {
                "original_keyword": kw,
                "normalized_keyword": kw,
                "campaign_family": "Mercedes Van Servicing",
                "ad_group_theme": "Citan Servicing",
                "source": "deterministic_patch",
                "skipped_llm": "True",
                "llm_keep_decision": dec,
                "llm_recommended_match_type": mt.lower(),
                "llm_confidence": "0.9",
                "llm_reason": "synthetic_citan_patch",
                "final_keep_decision": dec,
                "final_recommended_match_type": mt.lower(),
                "parse_status": "repair_patch",
            }
        )
        base["repaired_keyword_candidate"] = kw
        base["repaired_campaign_name"] = CAMPAIGN_SERVICING
        base["repaired_ad_group_theme"] = "Citan Servicing"
        base["repaired_match_type"] = mt
        base["repaired_final_keep_decision"] = dec
        base["synthetic_row"] = "true"
        base["repair_notes"] = "synthetic_citan_servicing"
        rows.append(base)
    for kw, mt, dec in CITAN_BRAKES_KEYWORDS:
        base = _empty_master_row()
        base.update(
            {
                "original_keyword": kw,
                "normalized_keyword": kw,
                "campaign_family": "Mercedes Van Servicing",
                "ad_group_theme": "Citan Brakes",
                "source": "deterministic_patch",
                "skipped_llm": "True",
                "llm_keep_decision": dec,
                "llm_recommended_match_type": mt.lower(),
                "llm_confidence": "0.85",
                "llm_reason": "synthetic_citan_patch",
                "final_keep_decision": dec,
                "final_recommended_match_type": mt.lower(),
                "parse_status": "repair_patch",
            }
        )
        base["repaired_keyword_candidate"] = kw
        base["repaired_campaign_name"] = CAMPAIGN_SERVICING
        base["repaired_ad_group_theme"] = "Citan Brakes"
        base["repaired_match_type"] = mt
        base["repaired_final_keep_decision"] = dec
        base["synthetic_row"] = "true"
        base["repair_notes"] = "synthetic_citan_brakes"
        rows.append(base)
    return rows


def slice_export_reason(row: pd.Series) -> str:
    notes = str(row.get("repair_notes") or "").strip()
    lr = str(row.get("llm_reason") or "").strip()
    if notes and lr:
        return f"{notes} | {lr}"
    return notes or lr


def negative_export_reason(row: pd.Series) -> str:
    parts = [
        str(row.get("repair_notes") or "").strip(),
        str(row.get("final_negative_reason") or "").strip(),
        str(row.get("llm_negative_reason") or "").strip(),
        str(row.get("pre_rule_reason") or "").strip(),
    ]
    return " | ".join(p for p in parts if p)


def export_campaign_family(row: pd.Series) -> str:
    fc = family_from_editor_campaign(str(row.get("repaired_campaign_name", "")))
    if fc:
        return fc
    return str(row.get("campaign_family", "") or "")


def validate_strict(df: pd.DataFrame, col_ag: str) -> None:
    bad = sorted(
        {x for x in df[col_ag].astype(str).unique() if x and x not in ALL_LIVE_AD_GROUPS}
    )
    if bad:
        raise ValueError(
            f"--strict-live-structure: non-live ad groups remain: {bad[:20]}"
        )


def run_repair(args: argparse.Namespace) -> dict[str, Any]:
    master_path = Path(args.input_master).resolve()
    out_dir = Path(args.output_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(master_path, dtype=str, keep_default_na=False)
    total_input = len(df)

    dropped_blank: list[dict[str, Any]] = []
    repair_actions: Counter[str] = Counter()
    remapped_ag: int = 0

    rows_out: list[dict[str, Any]] = []
    for idx, row in df.iterrows():
        kw = build_repaired_keyword(row)
        if not kw or len(kw) < 2:
            dropped_blank.append(
                {
                    "row_index": int(idx),
                    "drop_reason": "blank_keyword_after_repair",
                    "normalized_keyword": str(row.get("normalized_keyword", "")),
                    "original_keyword": str(row.get("original_keyword", "")),
                    "final_keep_decision": str(row.get("final_keep_decision", "")),
                }
            )
            repair_actions["dropped_blank"] += 1
            continue

        dec = str(row.get("final_keep_decision", "") or "").strip()
        if dec not in VALID_DECISIONS:
            dec = "review_high_priority"
            repair_actions["decision_normalized"] += 1

        notes: list[str] = []
        hard = matches_hard_filter(kw)
        if hard:
            if dec != "exclude_negative":
                repair_actions["hard_filter_override"] += 1
            dec = "exclude_negative"
            notes.append("hard_filter_export_stage")

        if not hard and dec in ("include_now", "review_high_priority"):
            if matches_poor_fit_generic(kw):
                dec = "exclude_negative"
                notes.append("poor_fit_generic_intent")
                repair_actions["poor_fit_demote"] += 1

        ag, ag_note = repair_ad_group_theme(row, kw, args.strict_live_structure)
        if ag_note:
            remapped_ag += 1
            notes.append(ag_note)
        camp = campaign_for_ad_group(ag)

        mt = normalize_match_type(
            str(row.get("final_recommended_match_type", "")),
            kw,
            dec,
        )

        if "infer_" in ag_note and dec == "include_now":
            dec = "review_high_priority"
            notes.append("downgrade_include_inferred_ag")

        rec = row.to_dict()
        rec["repaired_keyword_candidate"] = kw
        rec["repaired_campaign_name"] = camp
        rec["repaired_ad_group_theme"] = ag
        rec["repaired_match_type"] = mt
        rec["repaired_final_keep_decision"] = dec
        rec["synthetic_row"] = "false"
        rec["repair_notes"] = ";".join(notes) if notes else ""
        rows_out.append(rec)

    repaired_df = pd.DataFrame(rows_out)
    if repaired_df.empty:
        repaired_df = pd.DataFrame(columns=list(MASTER_REPAIRED_COLUMNS))
    else:
        for c in MASTER_REPAIRED_COLUMNS:
            if c not in repaired_df.columns:
                repaired_df[c] = ""
        repaired_df = repaired_df[list(MASTER_REPAIRED_COLUMNS)]

    citan_added = 0
    if args.add_citan_patch_if_missing and not repaired_df.empty:
        has_cit_serv = (
            repaired_df["repaired_ad_group_theme"] == "Citan Servicing"
        ).any()
        has_cit_brk = (repaired_df["repaired_ad_group_theme"] == "Citan Brakes").any()
        synth: list[dict[str, Any]] = []
        if not has_cit_serv:
            synth.extend(
                r
                for r in build_synthetic_citan_rows()
                if r["repaired_ad_group_theme"] == "Citan Servicing"
            )
        if not has_cit_brk:
            synth.extend(
                r
                for r in build_synthetic_citan_rows()
                if r["repaired_ad_group_theme"] == "Citan Brakes"
            )
        if synth:
            citan_added = len(synth)
            synth_df = pd.DataFrame(synth)
            for c in MASTER_REPAIRED_COLUMNS:
                if c not in synth_df.columns:
                    synth_df[c] = ""
            synth_df = synth_df[list(MASTER_REPAIRED_COLUMNS)]
            repaired_df = pd.concat([repaired_df, synth_df], ignore_index=True)
            repair_actions["synthetic_citan_added"] = citan_added

    if args.strict_live_structure and not repaired_df.empty:
        validate_strict(repaired_df, "repaired_ad_group_theme")

    dedupe_cols = [
        "repaired_campaign_name",
        "repaired_ad_group_theme",
        "repaired_keyword_candidate",
        "repaired_match_type",
    ]
    before_dedupe = len(repaired_df)
    repaired_df = repaired_df.drop_duplicates(subset=dedupe_cols, keep="first")
    repair_actions["dedupe_removed"] = before_dedupe - len(repaired_df)

    master_path_out = out_dir / "llm_keywords_master_repaired.csv"
    repaired_df.to_csv(master_path_out, index=False, encoding="utf-8")

    def build_slice_df(sub: pd.DataFrame) -> pd.DataFrame:
        if sub.empty:
            return pd.DataFrame(
                columns=[
                    "campaign_family",
                    "ad_group_theme",
                    "keyword_candidate",
                    "recommended_match_type",
                    "reason",
                ]
            )
        return pd.DataFrame(
            {
                "campaign_family": sub.apply(export_campaign_family, axis=1),
                "ad_group_theme": sub["repaired_ad_group_theme"].astype(str),
                "keyword_candidate": sub["repaired_keyword_candidate"].astype(str),
                "recommended_match_type": sub["repaired_match_type"].astype(str),
                "reason": sub.apply(slice_export_reason, axis=1),
            }
        )

    inc = repaired_df[
        repaired_df["repaired_final_keep_decision"] == "include_now"
    ]
    build_slice_df(inc).to_csv(
        out_dir / "llm_keywords_include_repaired.csv",
        index=False,
        encoding="utf-8",
    )

    rev = repaired_df[
        repaired_df["repaired_final_keep_decision"] == "review_high_priority"
    ]
    build_slice_df(rev).to_csv(
        out_dir / "llm_keywords_review_repaired.csv",
        index=False,
        encoding="utf-8",
    )

    broad = repaired_df[
        repaired_df["repaired_final_keep_decision"].isin(
            ("review_broad_test", "future_test")
        )
    ]
    build_slice_df(broad).to_csv(
        out_dir / "llm_keywords_broad_test_repaired.csv",
        index=False,
        encoding="utf-8",
    )

    neg = repaired_df[
        repaired_df["repaired_final_keep_decision"] == "exclude_negative"
    ]
    if neg.empty:
        neg_out = pd.DataFrame(
            columns=[
                "campaign_family",
                "ad_group_theme",
                "keyword_candidate",
                "negative_level",
                "reason",
            ]
        )
    else:
        neg_out = pd.DataFrame(
            {
                "campaign_family": neg.apply(export_campaign_family, axis=1),
                "ad_group_theme": neg["repaired_ad_group_theme"].astype(str),
                "keyword_candidate": neg["repaired_keyword_candidate"].astype(str),
                "negative_level": "ad_group",
                "reason": neg.apply(negative_export_reason, axis=1),
            }
        )
    neg_out.to_csv(
        out_dir / "llm_negative_keywords_repaired.csv",
        index=False,
        encoding="utf-8",
    )

    pos_editor: list[dict[str, str]] = []
    for _, r in repaired_df[
        repaired_df["repaired_final_keep_decision"] == "include_now"
    ].iterrows():
        kw = str(r["repaired_keyword_candidate"])
        mt = str(r["repaired_match_type"])
        pos_editor.append(
            {
                "Campaign": str(r["repaired_campaign_name"]),
                "Ad Group": str(r["repaired_ad_group_theme"]),
                "Keyword": format_positive_keyword(kw, mt),
                "Match Type": mt,
            }
        )
    pd.DataFrame(pos_editor).to_csv(
        out_dir / "llm_keywords_grouped_for_google_ads_editor_repaired.csv",
        index=False,
        encoding="utf-8",
        columns=["Campaign", "Ad Group", "Keyword", "Match Type"],
    )

    neg_editor: list[dict[str, str]] = []
    for _, r in repaired_df[
        repaired_df["repaired_final_keep_decision"] == "exclude_negative"
    ].iterrows():
        kw = str(r["repaired_keyword_candidate"])
        nm = negative_editor_match_type(
            kw, str(r.get("final_recommended_match_type", ""))
        )
        neg_editor.append(
            {
                "Campaign": str(r["repaired_campaign_name"]),
                "Ad Group": str(r["repaired_ad_group_theme"]),
                "Negative Keyword": format_negative_keyword(kw, nm),
                "Match Type": nm,
            }
        )
    pd.DataFrame(neg_editor).to_csv(
        out_dir / "llm_negatives_grouped_for_google_ads_editor_repaired.csv",
        index=False,
        encoding="utf-8",
        columns=["Campaign", "Ad Group", "Negative Keyword", "Match Type"],
    )

    dropped_df = pd.DataFrame(dropped_blank)
    dropped_path = out_dir / "dropped_rows_audit.csv"
    dropped_df.to_csv(dropped_path, index=False, encoding="utf-8")

    by_dec = repaired_df["repaired_final_keep_decision"].value_counts().to_dict()
    by_camp = repaired_df["repaired_campaign_name"].value_counts().to_dict()
    by_ag = repaired_df["repaired_ad_group_theme"].value_counts().to_dict()

    summary = {
        "total_input_rows": total_input,
        "total_rows_after_repairs": int(len(repaired_df)),
        "total_rows_dropped_for_blank_keyword": len(dropped_blank),
        "total_rows_dropped_for_hard_filter": int(
            repair_actions.get("hard_filter_override", 0)
        ),
        "total_rows_remapped_from_non_live_ad_groups": remapped_ag,
        "total_synthetic_citan_rows_added": citan_added,
        "totals_by_final_decision": {str(k): int(v) for k, v in by_dec.items()},
        "totals_by_campaign": {str(k): int(v) for k, v in by_camp.items()},
        "totals_by_ad_group": {str(k): int(v) for k, v in by_ag.items()},
        "top_drop_reasons": [
            {"reason": k, "count": int(v)}
            for k, v in Counter(d["drop_reason"] for d in dropped_blank).most_common(20)
        ],
        "top_repair_actions": [
            {"action": k, "count": int(v)} for k, v in repair_actions.most_common()
        ],
        "dedupe_removed": int(repair_actions.get("dedupe_removed", 0)),
    }

    with open(out_dir / "repair_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    if args.verbose:
        logger.info("Wrote %s rows to master repaired", len(repaired_df))
        logger.info("Summary: %s", summary)

    return summary


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Repair LLM keyword exports from master CSV only (no API)."
    )
    p.add_argument(
        "--input-master",
        type=str,
        required=True,
        help="Path to llm_keywords_master.csv",
    )
    p.add_argument(
        "--output-dir",
        type=str,
        default="repaired_outputs",
        help="Output directory for repaired files",
    )
    p.add_argument(
        "--strict-live-structure",
        action="store_true",
        help="Fail if any row has a non-live ad group after repair",
    )
    p.add_argument(
        "--add-citan-patch-if-missing",
        action="store_true",
        help="Append synthetic Citan rows if no Citan ad groups present",
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
        summary = run_repair(args)
    except ValueError as e:
        logger.error("%s", e)
        sys.exit(1)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
