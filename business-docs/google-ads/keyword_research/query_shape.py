"""Heuristics: whether text looks like a Google Ads query vs SERP prose."""

from __future__ import annotations

import re

from config import ResearchSettings

# Title candidates: allow slightly longer than final include (SERP titles truncate)
_MAX_TITLE_WORDS = 12
_MAX_TITLE_CHARS = 60

_ELLIPSIS = re.compile(r"\.{2,}|…")
# UK 07…, spaced digit groups, +44, US +1 style, long digit runs
_PHONE_RE = re.compile(
    r"(?:\+44\s?7\d{3}\s?\d{6}|\+44\s?\d{10,11}|0\s?7\d{3}\s?\d{6}|"
    r"\+1[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{4}|"
    r"\b\d{4}\s+\d{3}\s+\d{3,4}\b|"
    r"\b07\d{9}\b|"
    r"\(\d{3}\)\s*\d{3}[\s\-]?\d{4})",
    re.IGNORECASE,
)

# Obvious marketing / directory prose (substring on raw or normalized)
PROSE_MARKERS = re.compile(
    r"\b(we come to you|we serve|we charge|our workshop|average drivers save|"
    r"no pre-payment|verified reviews|compare deals|in under \d+ seconds|"
    r"professional company|years experience|qualified technician|"
    r"trusted servicing|book car diagnostics)\b",
    re.IGNORECASE,
)

# Non-UK geo noise (common in autocomplete when query is ambiguous)
_US_CA_CITY_TERMS: list[str] = [
    "san diego",
    "los angeles",
    "new york",
    "chicago",
    "houston",
    "phoenix",
    "philadelphia",
    "san antonio",
    "dallas",
    "san jose",
    "austin",
    "jacksonville",
    "fort worth",
    "columbus",
    "charlotte",
    "indianapolis",
    "seattle",
    "denver",
    "boston",
    "detroit",
    "miami",
    "atlanta",
    "las vegas",
    "portland",
    "california",
    "texas",
    "florida",
    "arizona",
]


def is_query_shaped_organic_title(text: str) -> bool:
    """
    Gate before promoting an organic title to keyword_candidate.

    Rejects long prose, questions, ellipsis, phones, heavy punctuation.
    """
    t = (text or "").strip()
    if len(t) < 3 or len(t) > _MAX_TITLE_CHARS:
        return False
    if "?" in t:
        return False
    if _ELLIPSIS.search(t) or "…" in t:
        return False
    if _PHONE_RE.search(t):
        return False
    words = t.split()
    if len(words) > _MAX_TITLE_WORDS:
        return False
    # Multiple commas usually indicates listy marketing copy
    if t.count(",") > 1:
        return False
    # Sentence-like: period not at end only
    stripped = t.rstrip(".")
    if "." in stripped:
        return False
    if PROSE_MARKERS.search(t):
        return False
    return True


def is_query_shaped_for_include(
    keyword_raw: str,
    normalized: str,
    settings: ResearchSettings,
    source_merged: str,
) -> bool:
    """
    Stricter gate for status include: short, no questions, no phones/ellipsis/prose.

    Seed-only rows use a slightly relaxed word limit (seeds are curated).
    """
    raw = (keyword_raw or "").strip()
    norm = (normalized or "").strip()
    if not norm:
        return False
    if "?" in raw:
        return False
    if _ELLIPSIS.search(raw) or "…" in raw:
        return False
    if _PHONE_RE.search(raw):
        return False
    if PROSE_MARKERS.search(raw) or PROSE_MARKERS.search(norm):
        return False

    words = norm.split()
    max_words = settings.max_words_include_seed if _is_seed_only(source_merged) else settings.max_words_include
    if len(words) > max_words:
        return False
    max_chars = settings.max_chars_include_seed if _is_seed_only(source_merged) else settings.max_chars_include
    if len(raw) > max_chars:
        return False

    # Long clause-like commas
    if raw.count(",") > 1:
        return False

    return True


def _is_seed_only(source_merged: str) -> bool:
    parts = [p for p in source_merged.split(";") if p]
    return len(parts) == 1 and parts[0] == "seed"


def has_us_geo_noise(normalized: str) -> bool:
    """True if obvious US/NA city or state names appear (UK-local account)."""
    low = normalized.lower()
    return any(term in low for term in _US_CA_CITY_TERMS)
