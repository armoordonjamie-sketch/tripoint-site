"""Load optional Google Ads Script export CSVs from a directory."""

from __future__ import annotations

import csv
import os
from typing import Any

# Expected filenames (all optional)
FILE_SEARCH_TERMS = "search_terms.csv"
FILE_KEYWORDS = "keywords.csv"
FILE_NEGATIVES = "negative_keywords.csv"
FILE_RECOMMENDATIONS = "recommendations.csv"
FILE_CAMPAIGN = "campaign_snapshot.csv"


def _read_csv_rows(path: str) -> list[dict[str, str]]:
    if not os.path.isfile(path):
        return []
    rows: list[dict[str, str]] = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        r = csv.DictReader(f)
        for row in r:
            if row:
                rows.append({k: (v or "").strip() for k, v in row.items() if k})
    return rows


def load_ads_exports(export_dir: str) -> dict[str, list[dict[str, str]]]:
    """
    Load each known CSV if present.

    Keys: search_terms, keywords, negative_keywords, recommendations, campaign_snapshot.
    """
    d = os.path.abspath(export_dir)
    return {
        "search_terms": _read_csv_rows(os.path.join(d, FILE_SEARCH_TERMS)),
        "keywords": _read_csv_rows(os.path.join(d, FILE_KEYWORDS)),
        "negative_keywords": _read_csv_rows(os.path.join(d, FILE_NEGATIVES)),
        "recommendations": _read_csv_rows(os.path.join(d, FILE_RECOMMENDATIONS)),
        "campaign_snapshot": _read_csv_rows(os.path.join(d, FILE_CAMPAIGN)),
    }


def _norm_kw(s: str) -> str:
    return " ".join((s or "").lower().split())


def build_validation_index(exports: dict[str, list[dict[str, Any]]]) -> dict[str, set[str]]:
    """Normalized lookup sets for scoring validation."""
    known_search_terms: set[str] = set()
    for row in exports.get("search_terms") or []:
        st = row.get("SearchTerm") or row.get("search_term") or row.get("Query") or ""
        if st:
            known_search_terms.add(_norm_kw(st))

    known_keywords: set[str] = set()
    for row in exports.get("keywords") or []:
        k = row.get("Keyword") or row.get("keyword") or ""
        if k:
            known_keywords.add(_norm_kw(k))

    known_negatives: set[str] = set()
    for row in exports.get("negative_keywords") or []:
        nk = row.get("NegativeKeyword") or row.get("negative_keyword") or row.get("Keyword") or ""
        if nk:
            known_negatives.add(_norm_kw(nk))

    recommended_keywords: set[str] = set()
    for row in exports.get("recommendations") or []:
        t = row.get("Text") or row.get("text") or row.get("Keyword") or ""
        if t and len(t) < 120:
            recommended_keywords.add(_norm_kw(t))

    return {
        "known_search_terms": known_search_terms,
        "known_keywords": known_keywords,
        "known_negatives": known_negatives,
        "recommended_keywords": recommended_keywords,
    }
