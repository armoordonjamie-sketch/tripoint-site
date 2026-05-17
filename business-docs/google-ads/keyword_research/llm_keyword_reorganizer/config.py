"""Constants, allowed taxonomies, junk rules, and system prompt for the LLM reorganizer."""

from __future__ import annotations

import importlib.util
from pathlib import Path
from typing import Final

_PKG = Path(__file__).resolve().parent
_PARENT_CONFIG = _PKG.parent / "config.py"

OPENROUTER_BASE_URL: Final[str] = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL: Final[str] = "google/gemini-3-flash-preview"
DEFAULT_TEMPERATURE: Final[float] = 0.2
CONFIDENCE_INCLUDE_THRESHOLD: Final[float] = 0.55
DEFAULT_BATCH_SIZE: Final[int] = 10

DEFAULT_CAMPAIGN_EDITOR_NAMES: Final[dict[str, str]] = {
    "Diagnostics & VOR": "Search | Diagnostics & VOR | Kent + SE London",
    "Mercedes Van Servicing": "Search | Servicing & Brakes | Kent + SE London",
    "Van Tuning": "Search | Tuning | Commercial Vans | Kent + SE London",
}

CAMPAIGN_FAMILIES: Final[tuple[str, ...]] = (
    "Diagnostics & VOR",
    "Mercedes Van Servicing",
    "Van Tuning",
)

# Live Google Ads Editor ad group strings (LLM must output these exactly).
AD_GROUPS_BY_FAMILY: Final[dict[str, tuple[str, ...]]] = {
    "Diagnostics & VOR": (
        "Standard Diagnosis",
        "VOR / Urgent Van Diagnostics",
        "Pre-Purchase Van Check",
        "AdBlue / DPF / NOx",
        "Limp Mode / Derate",
    ),
    "Mercedes Van Servicing": (
        "Mercedes Van Servicing",
        "Sprinter Servicing",
        "Vito Servicing",
        "Citan Servicing",
        "Sprinter Brakes",
        "Vito Brakes",
        "Citan Brakes",
    ),
    "Van Tuning": (
        "Van Economy Tune",
        "Van Load & Driveability Tune",
        "Fleet Van Tuning",
    ),
}

# Map alternate LLM labels to live ad group names.
AD_GROUP_ALIASES: Final[dict[str, str]] = {
    "adblue / dpf / emissions": "AdBlue / DPF / NOx",
    "adblue / dpf / nox": "AdBlue / DPF / NOx",
    "adblue/dpf/nox": "AdBlue / DPF / NOx",
}

FAMILY_FALLBACK_AD_GROUP: Final[dict[str, str]] = {
    "Diagnostics & VOR": "Standard Diagnosis",
    "Mercedes Van Servicing": "Mercedes Van Servicing",
    "Van Tuning": "Van Economy Tune",
}


def load_campaign_editor_names() -> dict[str, str]:
    """Load Editor campaign names from parent keyword_research config.py when present."""
    if not _PARENT_CONFIG.is_file():
        return dict(DEFAULT_CAMPAIGN_EDITOR_NAMES)
    spec = importlib.util.spec_from_file_location("_tripoint_kw_config", _PARENT_CONFIG)
    if spec is None or spec.loader is None:
        return dict(DEFAULT_CAMPAIGN_EDITOR_NAMES)
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
        raw = getattr(mod, "CAMPAIGN_EDITOR_NAMES", None)
        if isinstance(raw, dict) and raw:
            return {str(k): str(v) for k, v in raw.items()}
    except (OSError, ImportError, AttributeError):
        pass
    return dict(DEFAULT_CAMPAIGN_EDITOR_NAMES)


def all_allowed_ad_groups() -> frozenset[str]:
    s: set[str] = set()
    for ags in AD_GROUPS_BY_FAMILY.values():
        s.update(ags)
    return frozenset(s)


def normalize_ad_group_name(name: str) -> str:
    key = (name or "").strip().lower()
    if key in AD_GROUP_ALIASES:
        return AD_GROUP_ALIASES[key]
    return (name or "").strip()


# --- Hard exclusion: substring match on normalized + original (lowercase) ---
PRE_EXCLUDE_SUBSTRINGS: Final[tuple[str, ...]] = (
    "service reset",
    "light reset",
    "repair centre",
    "repair center",
    "service centre",
    "service center",
    " for sale",
    "opening hours",
    "forum",
    "reddit",
    "quora",
    " guide",
    "free ",
    " free",
    "pdf",
    "salary",
    "training course",
    "diy ",
    " diy",
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
    "hard cut",
    "launch control",
    "dyno only",
    "pop and bang",
    "anti lag",
)

PRE_EXCLUDE_REGEX_TERMS: Final[tuple[str, ...]] = (
    r"\breset\b",
    r"\bmot\b",
    r"\bparts\b",
    r"\bjobs\b",
    r"\bmanual\b",
    r"\bbypass\b",
    r"\bdefeat\b",
    r"\bbest\b",
    r"\btutorial\b",
    r"\bcheap(est)?\b",
)

# Price-shopping / research-only (heuristic)
PRICE_RESEARCH_PATTERN: Final[str] = r"\b(prices?|pricing|how much|cost of|average cost)\b"

# Obvious non-service phone patterns (UK-heavy)
PHONE_PATTERNS: Final[tuple[str, ...]] = (
    r"\+44\s?7\d{2}",
    r"\b07\d{9}\b",
    r"\+1[\s\-]?\d{3}",
    r"\(\d{3}\)\s*\d{3}[\s\-]?\d{4}",
)

# Scotland / far out-of-area when clearly geo-qualified (substring)
FAR_GEO_SUBSTRINGS: Final[tuple[str, ...]] = (
    "scotland",
    "edinburgh",
    "glasgow",
    "aberdeen",
    "dundee",
    "inverness",
    "belfast",
    "northern ireland",
    "wales cardiff",
    "swansea",
    "newcastle uk",
    "liverpool garage",
    "manchester garage",
    "birmingham garage",
)

# Kent / SE London area hints — if absent and far geo present, exclude
LOCAL_SERVICE_HINTS: Final[tuple[str, ...]] = (
    "kent",
    "london",
    "dartford",
    "maidstone",
    "gravesend",
    "tonbridge",
    "sevenoaks",
    "canterbury",
    "medway",
    "thanet",
    "south east",
    "southeast",
    "near me",
    "mobile",
    "uk",
)

SYSTEM_PROMPT: Final[str] = """You are a UK Google Ads keyword analyst for TriPoint Diagnostics.

Business context:
- Mobile vehicle diagnostics and selected repairs; Mercedes van specialist for diagnostics, servicing, and brakes.
- Geography: Kent and South East London — do not treat distant UK regions as in-area unless the query is generic (e.g. "van diagnostics" without a far-away place name).
- Tuning/remap/economy work applies to ALL sensible commercial work vans (Ford Transit, Transit Custom, VW Crafter, Transporter, Renault Trafic, Vauxhall Vivaro/Movano, Peugeot Boxer/Expert, Citroen Relay/Dispatch, Fiat Ducato, Toyota ProAce, Nissan Primastar/NV400, MAN TGE, Iveco Daily, plus Sprinter/Vito/Citan). Position tuning for business use: economy, loaded pull, driveability, fleet, work van, route use — NOT childish performance (no pops/bangs, stages, flames, launch control).
- For diagnostics and servicing/brakes, Mercedes-van relevance is appropriate; for tuning, include non-Mercedes vans when the query fits commercial van tuning intent.

Hard bans (always exclude_negative):
- Emissions delete, bypass, emulator, defeat, DPF/AdBlue/EGR "delete" style queries.
- Race / novelty tuning: stage 2/3, pops and bangs, crackle, hard cut, flames, launch control, dyno-only bragging.
- Obvious junk: forums, guides, free PDFs, jobs, training, DIY manuals, software downloads, "for sale", opening hours, phone-number spam.
- Fixed workshop directory language: repair centre/center, service centre/center (not mobile service intent).
- Service/light "reset" as a standalone intent, MOT as a primary intent, generic parts shopping.

Classification tiers (keep_decision):
- include_now: Strong service/commercial intent, clear fit, low risk, UK-appropriate.
- review_high_priority: Likely useful but ambiguous, borderline geo, or needs human confirmation.
- review_broad_test: Broader commercial van terms worth testing later.
- future_test: Tangentially relevant; too broad for immediate import.
- exclude_negative: Junk, policy risk, wrong geography when location-qualified far from Kent/SE London, or banned topics.

Match types (recommended_match_type):
- Exact: tight high-intent service queries.
- Phrase: default for most good keywords.
- Broad: only for broader but still relevant exploratory terms — use sparingly.

You MUST respond with a single JSON object only (no markdown fences), shape:
{"items":[{"original_keyword":"...","normalized_keyword":"...","keep_decision":"include_now|review_high_priority|review_broad_test|future_test|exclude_negative","campaign_family":"Diagnostics & VOR|Mercedes Van Servicing|Van Tuning","ad_group_theme":"<exact string from allowed list for that family>","recommended_match_type":"Exact|Phrase|Broad","confidence":0.0-1.0,"reason":"short","negative_reason":null or string,"tags":[],"rewritten_clean_keyword":null or string}]}

Allowed campaign_family values exactly: Diagnostics & VOR, Mercedes Van Servicing, Van Tuning.

Allowed ad_group_theme per family:
- Diagnostics & VOR: Standard Diagnosis | VOR / Urgent Van Diagnostics | Pre-Purchase Van Check | AdBlue / DPF / NOx | Limp Mode / Derate
- Mercedes Van Servicing: Mercedes Van Servicing | Sprinter Servicing | Vito Servicing | Citan Servicing | Sprinter Brakes | Vito Brakes | Citan Brakes
- Van Tuning: Van Economy Tune | Van Load & Driveability Tune | Fleet Van Tuning

Use heuristic hints provided per row (tags) as soft signals, not overrides for hard bans.
Return one JSON object per input row in the same order as given, with identical original_keyword and normalized_keyword as provided.
"""

REPAIR_USER_PROMPT: Final[str] = """The following text was not valid JSON for the schema.
Return ONLY a valid JSON object with key "items" (array) matching the schema from the system prompt.
Invalid snippet:
---
{snippet}
---
"""
