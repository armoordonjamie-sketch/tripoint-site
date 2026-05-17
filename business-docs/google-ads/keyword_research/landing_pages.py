"""Map service slugs to campaign families and score landing-page token fit."""

from __future__ import annotations

from config import CAMPAIGN_VOCABULARY

LANDING_PAGE_MAP: dict[str, dict[str, object]] = {
    "diagnostic-callout": {
        "family": "Diagnostics & VOR",
        "ad_group": "Standard Diagnosis",
        "tokens": [
            "diagnostic",
            "diagnostics",
            "fault",
            "warning",
            "mobile",
            "mercedes",
            "van",
            "sprinter",
            "vito",
            "check",
            "light",
            "engine",
            "scan",
        ],
    },
    "vor-van-diagnostics": {
        "family": "Diagnostics & VOR",
        "ad_group": "VOR / Urgent Van Diagnostics",
        "tokens": [
            "vor",
            "urgent",
            "breakdown",
            "roadside",
            "wont start",
            "van",
            "diagnostic",
            "mobile",
        ],
    },
    "pre-purchase-digital-health-check": {
        "family": "Diagnostics & VOR",
        "ad_group": "Pre-Purchase Van Check",
        "tokens": [
            "pre purchase",
            "pre-purchase",
            "inspection",
            "check",
            "van",
            "vehicle",
            "buy",
        ],
    },
    "sprinter-servicing": {
        "family": "Mercedes Van Servicing",
        "ad_group": "Sprinter Servicing",
        "tokens": [
            "sprinter",
            "service",
            "servicing",
            "minor",
            "major",
            "mobile",
            "mercedes",
            "interval",
        ],
    },
    "vito-servicing": {
        "family": "Mercedes Van Servicing",
        "ad_group": "Vito Servicing",
        "tokens": [
            "vito",
            "service",
            "servicing",
            "mobile",
            "mercedes",
        ],
    },
    "mercedes-van-servicing": {
        "family": "Mercedes Van Servicing",
        "ad_group": "Mercedes Van Servicing",
        "tokens": [
            "mercedes",
            "van",
            "service",
            "servicing",
            "commercial",
        ],
    },
    "sprinter-brakes": {
        "family": "Mercedes Van Servicing",
        "ad_group": "Sprinter Brakes",
        "tokens": [
            "sprinter",
            "brake",
            "brakes",
            "pads",
            "replacement",
        ],
    },
    "vito-brakes": {
        "family": "Mercedes Van Servicing",
        "ad_group": "Vito Brakes",
        "tokens": ["vito", "brake", "brakes", "pads"],
    },
    "van-economy-tune": {
        "family": "Van Tuning",
        "ad_group": "Van Economy Tune",
        "tokens": [
            "economy",
            "remap",
            "tune",
            "fuel",
            "mpg",
            "van",
            "commercial",
        ],
    },
    "van-load-driveability-tune": {
        "family": "Van Tuning",
        "ad_group": "Van Load & Driveability Tune",
        "tokens": [
            "load",
            "driveability",
            "drivability",
            "remap",
            "tune",
            "van",
            "towing",
        ],
    },
    "fleet-van-tuning": {
        "family": "Van Tuning",
        "ad_group": "Fleet Van Tuning",
        "tokens": ["fleet", "van", "remap", "tune", "commercial", "company"],
    },
}


def score_landing_page_fit(normalized: str, campaign_family: str) -> int:
    """0-100 token overlap with best landing page row in this family."""
    if not normalized:
        return 0
    best = 0
    for _slug, meta in LANDING_PAGE_MAP.items():
        if str(meta.get("family")) != campaign_family:
            continue
        tokens = meta.get("tokens")
        if not isinstance(tokens, list):
            continue
        hits = sum(1 for t in tokens if t.lower() in normalized)
        # Also blend family vocabulary
        vocab = CAMPAIGN_VOCABULARY.get(campaign_family, [])
        hits += sum(1 for t in vocab if t.lower() in normalized) // 2
        score = min(100, hits * 14)
        if score > best:
            best = score
    return min(100, best)
