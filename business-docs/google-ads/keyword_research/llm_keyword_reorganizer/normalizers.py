"""Deterministic keyword normalization and pre/post exclusion rules."""

from __future__ import annotations

import re
from typing import NamedTuple

from . import config

_WS = re.compile(r"\s+")
_SMART_QUOTES = str.maketrans({
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u00b4": "'",
})
_ELLIPSIS = re.compile(r"\.{2,}|…")
_PIPE_TAIL = re.compile(r"\s*\|\s*[^|]{0,120}$")


class RuleHit(NamedTuple):
    """forced_decision is always exclude_negative when hit."""

    rule_id: str
    reason: str


def normalize_keyword_text(raw: str) -> str:
    """
    Lowercase, trim, collapse spaces, normalize quotes, light title cleanup.
    """
    s = (raw or "").strip().translate(_SMART_QUOTES).lower()
    s = _ELLIPSIS.sub(" ", s)
    # Strip trailing site-name style pipe segments once
    s = _PIPE_TAIL.sub("", s)
    s = _WS.sub(" ", s).strip()
    return s


def apply_pre_rules(original: str, normalized: str) -> RuleHit | None:
    """Return RuleHit if keyword must be exclude_negative before LLM."""
    blob = f"{original} {normalized}".lower()
    for sub in config.PRE_EXCLUDE_SUBSTRINGS:
        if sub in blob:
            return RuleHit(f"pre_substring:{sub.strip()}", f"Hard rule: matched {sub!r}")

    for pat in config.PRE_EXCLUDE_REGEX_TERMS:
        if re.search(pat, blob, re.IGNORECASE):
            return RuleHit(f"pre_regex:{pat}", f"Hard rule: matched pattern {pat!r}")

    if re.search(config.PRICE_RESEARCH_PATTERN, blob, re.IGNORECASE):
        if "service" not in blob and "remap" not in blob and "tune" not in blob:
            return RuleHit("pre_price_research", "Hard rule: price/cost research intent")

    for pat in config.PHONE_PATTERNS:
        if re.search(pat, original):
            return RuleHit("pre_phone", "Hard rule: phone-like pattern in keyword")

    # Far geo: require a far token AND absence of local hints (weak heuristic)
    has_far = any(g in blob for g in config.FAR_GEO_SUBSTRINGS)
    has_local = any(h in blob for h in config.LOCAL_SERVICE_HINTS)
    if has_far and not has_local:
        return RuleHit("pre_far_geo", "Hard rule: far UK/geo without local/mobile/Kent/SE signal")

    return None


def apply_post_rules(
    original: str,
    normalized: str,
    rewritten: str | None,
) -> RuleHit | None:
    """Re-check after LLM; include rewritten text in scan."""
    parts = [original, normalized, rewritten or ""]
    blob = " ".join(parts).lower()
    hit = apply_pre_rules(original, normalize_keyword_text(blob))
    return hit
