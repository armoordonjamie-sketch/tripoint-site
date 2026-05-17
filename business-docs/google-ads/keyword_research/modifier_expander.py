"""Combinatorial keyword expansion by campaign family (controlled size)."""

from __future__ import annotations

from typing import Any

from scoring import normalize_keyword

# Family -> (vehicle/modifier blocks, service blocks, geo blocks, optional symptom/qualifier)
MODIFIER_SETS: dict[str, dict[str, list[str]]] = {
    "Diagnostics & VOR": {
        "a": ["mobile", "van", "mercedes", "sprinter", "vito"],
        "b": [
            "diagnostics",
            "diagnostic",
            "fault finding",
            "warning light check",
            "engine check",
        ],
        "c": ["near me", "kent", "local", ""],
        "symptom": [
            "",
            "limp mode",
            "reduced power",
            "adblue",
            "dpf",
            "nox",
            "wont start",
        ],
    },
    "Mercedes Van Servicing": {
        "a": ["mercedes", "sprinter", "vito"],
        "b": ["service", "servicing", "brake", "brakes", "brake pads"],
        "c": ["near me", "mobile", "local", ""],
        "qual": ["", "minor", "major", "specialist"],
    },
    "Van Tuning": {
        "a": ["van", "commercial van", "sprinter", "vito", "fleet"],
        "b": [
            "remap",
            "tune",
            "tuning",
            "economy remap",
            "economy tune",
            "fuel economy remap",
        ],
        "c": ["near me", "mobile", ""],
        "qual": ["", "work", "load", "driveability"],
    },
}


def _self_repeat_filter(phrase: str) -> bool:
    parts = phrase.lower().split()
    if len(parts) < 2:
        return True
    return len(parts) == len(set(parts))


def generate_modifier_candidates(
    family: str,
    settings: Any,
) -> list[dict[str, Any]]:
    """Cartesian product for family; dedupe by normalized text."""
    spec = MODIFIER_SETS.get(family)
    if not spec:
        return []
    out: list[dict[str, Any]] = []
    seen: set[str] = set()

    if family == "Diagnostics & VOR":
        for a in spec["a"]:
            for b in spec["b"]:
                for c in spec["c"]:
                    for s in spec["symptom"]:
                        parts = [a, b]
                        if s:
                            parts.append(s)
                        if c:
                            parts.append(c)
                        raw = " ".join(p for p in parts if p).strip()
                        if not raw or not _self_repeat_filter(raw):
                            continue
                        nk = normalize_keyword(raw)
                        if not nk or nk in seen:
                            continue
                        seen.add(nk)
                        out.append(
                            {
                                "campaign_family": family,
                                "seed_ad_group_theme": "Modifier expansion",
                                "seed_keyword": raw,
                                "keyword_candidate": raw,
                                "source": "modifier_expansion",
                            }
                        )
    elif family == "Mercedes Van Servicing":
        for a in spec["a"]:
            for b in spec["b"]:
                for c in spec["c"]:
                    for q in spec["qual"]:
                        parts = [a, b]
                        if q:
                            parts.append(q)
                        if c:
                            parts.append(c)
                        raw = " ".join(p for p in parts if p).strip()
                        if not raw or not _self_repeat_filter(raw):
                            continue
                        nk = normalize_keyword(raw)
                        if not nk or nk in seen:
                            continue
                        seen.add(nk)
                        out.append(
                            {
                                "campaign_family": family,
                                "seed_ad_group_theme": "Modifier expansion",
                                "seed_keyword": raw,
                                "keyword_candidate": raw,
                                "source": "modifier_expansion",
                            }
                        )
    elif family == "Van Tuning":
        for a in spec["a"]:
            for b in spec["b"]:
                for c in spec["c"]:
                    for q in spec["qual"]:
                        parts = [a, b]
                        if q:
                            parts.append(q)
                        if c:
                            parts.append(c)
                        raw = " ".join(p for p in parts if p).strip()
                        if not raw or not _self_repeat_filter(raw):
                            continue
                        nk = normalize_keyword(raw)
                        if not nk or nk in seen:
                            continue
                        seen.add(nk)
                        out.append(
                            {
                                "campaign_family": family,
                                "seed_ad_group_theme": "Modifier expansion",
                                "seed_keyword": raw,
                                "keyword_candidate": raw,
                                "source": "modifier_expansion",
                            }
                        )

    max_n = getattr(settings, "modifier_max_candidates_per_family", 500)
    return out[:max_n]
