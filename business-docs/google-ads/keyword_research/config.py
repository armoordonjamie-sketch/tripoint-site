"""Configuration: seeds, SerpApi defaults, scoring terms, ad group rules, campaign names."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Final

# Google Ads Editor campaign names (must match live account)
CAMPAIGN_EDITOR_NAMES: Final[dict[str, str]] = {
    "Diagnostics & VOR": "Search | Diagnostics & VOR | Kent + SE London",
    "Mercedes Van Servicing": "Search | Servicing & Brakes | Kent + SE London",
    "Van Tuning": "Search | Tuning | Commercial Vans | Kent + SE London",
}

# Nested: campaign family -> list of {ad_group_theme, seeds}
SEED_GROUPS: dict[str, list[dict[str, Any]]] = {
    "Diagnostics & VOR": [
        {
            "ad_group_theme": "Standard Diagnosis",
            "seeds": [
                "mobile mercedes diagnostics",
                "mercedes diagnostics near me",
                "van diagnostics near me",
                "warning light diagnosis",
            ],
        },
        {
            "ad_group_theme": "Pre-Purchase Van Check",
            "seeds": [
                "pre purchase vehicle check",
                "pre purchase van check",
            ],
        },
        {
            "ad_group_theme": "VOR / Urgent Van Diagnostics",
            "seeds": [
                "urgent van diagnostics",
                "van wont start diagnosis",
            ],
        },
        {
            "ad_group_theme": "Limp Mode / Derate",
            "seeds": [
                "sprinter limp mode",
                "sprinter reduced power",
                "vito limp mode",
            ],
        },
        {
            "ad_group_theme": "AdBlue / DPF / NOx",
            "seeds": [
                "adblue warning sprinter",
                "sprinter adblue countdown",
                "sprinter dpf fault",
            ],
        },
    ],
    "Mercedes Van Servicing": [
        {
            "ad_group_theme": "Sprinter Servicing",
            "seeds": [
                "mercedes sprinter service",
                "sprinter service near me",
                "mobile sprinter service",
                "sprinter minor service",
                "sprinter major service",
            ],
        },
        {
            "ad_group_theme": "Vito Servicing",
            "seeds": [
                "mercedes vito service",
                "mobile vito service",
            ],
        },
        {
            "ad_group_theme": "Mercedes Van Servicing",
            "seeds": ["mercedes van service"],
        },
        {
            "ad_group_theme": "Sprinter Brakes",
            "seeds": ["sprinter brakes", "sprinter brake pads"],
        },
        {
            "ad_group_theme": "Vito Brakes",
            "seeds": ["vito brakes"],
        },
    ],
    "Van Tuning": [
        {
            "ad_group_theme": "Van Economy Tune",
            "seeds": [
                "van economy remap",
                "van economy tune",
                "fuel economy remap van",
            ],
        },
        {
            "ad_group_theme": "Van Load & Driveability Tune",
            "seeds": ["van load tune"],
        },
        {
            "ad_group_theme": "Sprinter Remap",
            "seeds": [
                "commercial van remap",
                "sprinter remap",
                "sprinter van remap",
            ],
        },
        {
            "ad_group_theme": "Vito Remap",
            "seeds": ["vito remap", "vito van remap"],
        },
        {
            "ad_group_theme": "Fleet Van Tuning",
            "seeds": ["fleet van tuning", "fleet van remap"],
        },
        {
            "ad_group_theme": "Mobile Van Remap",
            "seeds": [
                "mobile van remap",
                "sprinter economy remap",
                "vito economy remap",
                "work van remap near me",
            ],
        },
    ],
}

# Extra seed groups merged when broad_mode / expanded seeds (same shape as SEED_GROUPS entries)
EXPANDED_SEED_GROUPS: dict[str, list[dict[str, Any]]] = {
    "Diagnostics & VOR": [
        {
            "ad_group_theme": "Standard Diagnosis",
            "seeds": [
                "auto diagnostics near me",
                "vehicle diagnostics near me",
                "check engine light van",
                "warning light van",
                "mobile fault finding",
                "mobile auto electrician van",
                "van engine management light",
                "van breakdown diagnosis",
                "same day van diagnostics",
                "mobile mercedes specialist",
            ],
        },
    ],
    "Mercedes Van Servicing": [
        {
            "ad_group_theme": "Sprinter Servicing",
            "seeds": [
                "mobile van service",
                "van service near me",
                "mercedes specialist service",
                "sprinter brake replacement",
                "vito brake replacement",
                "van brakes near me",
                "sprinter MOT",
                "mercedes van MOT",
            ],
        },
    ],
    "Van Tuning": [
        {
            "ad_group_theme": "Mobile Van Remap",
            "seeds": [
                "van remap near me",
                "van tuning near me",
                "mobile remap service",
                "fuel economy remap",
                "economy tune van",
                "work van remap",
                "commercial van tuning",
                "sprinter torque tune",
                "vito economy tune",
                "van driveability remap",
            ],
        },
    ],
}


def _merge_seed_groups(
    base: dict[str, list[dict[str, Any]]],
    extra: dict[str, list[dict[str, Any]]],
) -> dict[str, list[dict[str, Any]]]:
    merged: dict[str, list[dict[str, Any]]] = {}
    for fam, groups in base.items():
        merged[fam] = [dict(g) for g in groups]
    for fam, groups in extra.items():
        if fam not in merged:
            merged[fam] = []
        merged[fam].extend([dict(g) for g in groups])
    return merged


def flatten_seeds(use_expanded: bool = False) -> list[dict[str, str]]:
    """Return list of {campaign_family, seed_ad_group_theme, seed_keyword}."""
    groups = (
        _merge_seed_groups(SEED_GROUPS, EXPANDED_SEED_GROUPS)
        if use_expanded
        else SEED_GROUPS
    )
    out: list[dict[str, str]] = []
    for family, gl in groups.items():
        for g in gl:
            theme = str(g["ad_group_theme"])
            for s in g["seeds"]:
                out.append(
                    {
                        "campaign_family": family,
                        "seed_ad_group_theme": theme,
                        "seed_keyword": s,
                    }
                )
    return out


@dataclass
class ResearchSettings:
    """Runtime settings for SerpApi calls and outputs."""

    location: str = "Kent, England, United Kingdom"
    gl: str = "uk"
    hl: str = "en"
    google_domain: str = "google.co.uk"
    output_dir: str = "output"
    max_suggestions: int = 10
    max_related: int = 8
    max_organic: int = 10
    include_autocomplete: bool = True
    include_search: bool = True
    include_related: bool = True
    include_paa: bool = True
    request_delay: float = 1.5
    max_retries: int = 3
    request_timeout: int = 30
    # Query-shape limits for include (see query_shape.py)
    max_words_include: int = 10
    max_chars_include: int = 72
    max_words_include_seed: int = 12
    max_chars_include_seed: int = 90
    # Classification thresholds (tweak in one place)
    threshold_negative_risk_exclude: int = 38
    threshold_negative_risk_soft: int = 18
    threshold_relevance_include: int = 58
    threshold_commercial_include: int = 42
    threshold_match_exact_commercial: int = 60
    threshold_match_exact_relevance: int = 68
    # Multi-source pipeline
    use_serpapi: bool = True
    use_brave: bool = False
    use_search_console: bool = False
    use_ads_exports: bool = False
    broad_mode: bool = False
    ads_export_dir: str = "ads_exports"
    search_console_site_url: str = ""
    modifier_expansion: bool = False
    brave_suggest_count: int = 10
    brave_web_count: int = 10
    gsc_row_limit: int = 5000
    gsc_filter_services_pages_only: bool = True
    modifier_max_candidates_per_family: int = 500
    # Softer thresholds when broad_mode
    broad_threshold_relevance: int = 35
    broad_threshold_commercial: int = 20
    # Legacy three-bucket classification (include/review/exclude) when True
    legacy_three_bucket: bool = True


# Commercial-intent token boosts (substring match on normalized text)
COMMERCIAL_BOOST_TERMS: list[str] = [
    "near me",
    "service",
    "servicing",
    "diagnostics",
    "diagnostic",
    "remap",
    "tune",
    "tuning",
    "brakes",
    "brake",
    "inspection",
    "check",
    "mobile",
    "urgent",
    "van",
    "sprinter",
    "vito",
    "mercedes",
    "commercial",
    "fleet",
    "repair",
    "garage",
    "mechanic",
    "specialist",
]

LOCAL_INTENT_TERMS: list[str] = [
    "near me",
    "kent",
    "london",
    "south east",
    "southeast",
    "dartford",
    "maidstone",
    "gravesend",
    "tonbridge",
    "mobile",
    "local",
]

# Negative-risk phrases (checked first, whole phrase in normalized string)
NEGATIVE_RISK_PHRASES: list[str] = [
    "how to",
    "how much",
    "why are",
    "why is",
    "what is",
    "when should",
    "when do",
    "is it cheaper",
    "is an ",
    "is it ",
    "stage 2",
    "stage 3",
    "pops and bangs",
    "launch control",
    "crackle",
    "flames",
    "dpf delete",
    "egr delete",
    "adblue delete",
    "emissions delete",
    "def delete",
    "noob",
    "open now",
    "service reset",
    "light reset",
    "service kit",
    "service intervals",
    "compare deals",
    "verified reviews",
    "book car diagnostics",
    "average drivers save",
    "no pre-payment",
    "how often should",
    "how often do",
    # Directory / fixed-location workshop intent (not tight mobile-service queries)
    "repair centre",
    "repair center",
    "service centre",
    "service center",
]

# UK cities/regions outside Kent + SE London focus — light scoring penalty only (see scoring.py)
OUT_OF_AREA_UK_TERMS: list[str] = [
    "derby",
    "birmingham",
    "manchester",
    "leeds",
    "liverpool",
    "bristol",
    "glasgow",
    "edinburgh",
    "cardiff",
]

NEGATIVE_RISK_TERMS: list[str] = [
    "jobs",
    "job",
    "salary",
    "course",
    "training",
    "free",
    "diy",
    "manual",
    "pdf",
    "software",
    "download",
    "bypass",
    "emulator",
    "youtube",
    "tutorial",
    "forum",
    "ebay",
    "second hand",
    "used part",
    "cheap",
    "cheapest",
    "review",
    "reviews",
    "limo",
    "dodge",
    "freightliner",
    "compare",
    "quote from",
    "trustpilot",
    "directory",
    "aggregator",
    "calculator",
]

# Car models / niches outside Mercedes van focus (tuning/diagnostics noise)
OFF_BRAND_MODEL_TERMS: list[str] = [
    "bmw",
    "audi",
    "vw golf",
    "golf gti",
    "ford focus",
    "civic",
    "subaru",
    "nissan gtr",
    "amg gt",
    "porsche",
    "ferrari",
    "lamborghini",
]

# Extra relevance boost when present (Van Tuning family only)
TUNING_BOOST_PHRASES: list[str] = [
    "van economy remap",
    "van economy tune",
    "economy remap",
    "economy tune",
    "fuel economy",
    "van load tune",
    "fuel economy remap",
    "commercial van remap",
    "sprinter remap",
    "vito remap",
    "sprinter van remap",
    "vito van remap",
    "fleet van tuning",
    "fleet van remap",
    "mobile van remap",
    "work van remap",
    "sprinter economy remap",
    "vito economy remap",
    "economy remap van",
]

# Generic performance fluff for tuning (commercial van focus)
PERFORMANCE_FLUFF_TERMS: list[str] = [
    "pop and bang",
    "anti lag",
    "2 step",
    "burble",
    "max power",
    "racing",
    "track day",
    "dyno only",
    "horsepower gain",
    "0-60",
]

# Servicing family: crossover with diagnostics/remap (avoid wrong bucket)
SERVICING_CROSSOVER_TERMS: list[str] = [
    "diagnostic",
    "diagnostics",
    "fault code",
    "star diagnosis",
    "xentry",
    "remap",
    "ecu tune",
    "dpf regen tool",
]

# Campaign vocabulary for relevance (per family)
CAMPAIGN_VOCABULARY: dict[str, list[str]] = {
    "Diagnostics & VOR": [
        "diagnostic",
        "diagnostics",
        "vor",
        "limp",
        "adblue",
        "dpf",
        "nox",
        "warning",
        "check",
        "sprinter",
        "vito",
        "van",
        "mercedes",
        "pre purchase",
        "start",
        "urgent",
        "mobile",
        "engine",
        "fault",
        "light",
    ],
    "Mercedes Van Servicing": [
        "service",
        "servicing",
        "sprinter",
        "vito",
        "van",
        "mercedes",
        "brake",
        "pads",
        "minor",
        "major",
        "mobile",
        "near me",
    ],
    "Van Tuning": [
        "remap",
        "tune",
        "tuning",
        "economy",
        "fuel",
        "load",
        "commercial",
        "fleet",
        "sprinter",
        "vito",
        "van",
        "mobile",
        "driveability",
    ],
}

# Ordered rules: first match wins. Each rule: (campaign_family, ad_group_theme, patterns)
# Patterns are regex strings tested against normalized keyword (lowercase).
def _compile_ad_group_rules() -> list[tuple[str, str, list[re.Pattern[str]]]]:
    rules: list[tuple[str, str, list[re.Pattern[str]]]] = []

    def pats(*patterns: str) -> list[re.Pattern[str]]:
        return [re.compile(pt, re.IGNORECASE) for pt in patterns]

    d = "Diagnostics & VOR"
    rules.append(
        (
            d,
            "Pre-Purchase Van Check",
            pats(
                r"pre[\s-]?purchase",
                r"pre[\s-]?buy",
                r"vehicle inspection before buy",
                r"buying a van",
            ),
        )
    )
    rules.append(
        (
            d,
            "VOR / Urgent Van Diagnostics",
            pats(
                r"\bvor\b",
                r"urgent",
                r"wont start",
                r"won't start",
                r"breakdown",
                r"roadside",
            ),
        )
    )
    rules.append(
        (
            d,
            "Limp Mode / Derate",
            pats(
                r"limp mode",
                r"reduced power",
                r"derate",
                r"limited performance",
            ),
        )
    )
    rules.append(
        (
            d,
            "AdBlue / DPF / NOx",
            pats(
                r"adblue",
                r"\bdpf\b",
                r"nox",
                r"scr",
                r"def fluid",
            ),
        )
    )
    rules.append(
        (
            d,
            "Standard Diagnosis",
            pats(
                r"diagnostic",
                r"warning light",
                r"fault",
                r"scan",
                r"mercedes",
            ),
        )
    )

    s = "Mercedes Van Servicing"
    rules.append(
        (
            s,
            "Sprinter Brakes",
            pats(r"sprinter.*brake", r"brake.*sprinter", r"sprinter.*pad"),
        )
    )
    rules.append(
        (s, "Vito Brakes", pats(r"vito.*brake", r"brake.*vito", r"vito.*pad"))
    )
    rules.append(
        (
            s,
            "Sprinter Servicing",
            pats(
                r"sprinter.*service",
                r"service.*sprinter",
                r"sprinter.*mot",
                r"sprinter.*interval",
            ),
        )
    )
    rules.append(
        (
            s,
            "Vito Servicing",
            pats(r"vito.*service", r"service.*vito"),
        )
    )
    rules.append(
        (
            s,
            "Mercedes Van Servicing",
            pats(r"mercedes.*van", r"van.*service", r"mercedes.*service"),
        )
    )

    t = "Van Tuning"
    rules.append(
        (
            t,
            "Van Economy Tune",
            pats(
                r"economy",
                r"fuel saving",
                r"mpg",
                r"fuel consumption",
            ),
        )
    )
    rules.append(
        (
            t,
            "Van Load & Driveability Tune",
            pats(
                r"load",
                r"driveability",
                r"drivability",
                r"towing",
                r"heavy load",
            ),
        )
    )
    rules.append(
        (
            t,
            "Fleet Van Tuning",
            pats(r"fleet", r"multiple van", r"company van"),
        )
    )
    rules.append(
        (
            t,
            "Mobile Van Remap",
            pats(r"mobile.*remap", r"mobile.*tune", r"remap.*mobile"),
        )
    )
    rules.append(
        (
            t,
            "Sprinter Remap",
            pats(
                r"sprinter.*remap",
                r"remap.*sprinter",
                r"sprinter.*tune",
                r"commercial van (remap|tune)",
                r"commercial.*van.*remap",
            ),
        )
    )
    rules.append(
        (t, "Vito Remap", pats(r"vito.*remap", r"remap.*vito", r"vito.*tune"))
    )
    rules.append(
        (
            t,
            "Van Economy Tune",
            pats(r"van.*remap", r"van.*tune", r"ecu remap"),
        )
    )

    return rules


AD_GROUP_RULES: list[tuple[str, str, list[re.Pattern[str]]]] = _compile_ad_group_rules()

DEFAULT_AD_GROUP_FALLBACK: dict[str, str] = {
    "Diagnostics & VOR": "Standard Diagnosis",
    "Mercedes Van Servicing": "Mercedes Van Servicing",
    "Van Tuning": "Van Economy Tune",
}
