"""Generate non-Mercedes commercial van tuning candidates for LLM review."""

from __future__ import annotations

from typing import Any

from .normalizers import normalize_keyword_text

TUNING_VEHICLE_SEEDS: tuple[str, ...] = (
    "ford transit",
    "ford transit custom",
    "vw crafter",
    "volkswagen crafter",
    "vw transporter",
    "volkswagen transporter",
    "renault trafic",
    "renault master",
    "vauxhall vivaro",
    "vauxhall movano",
    "fiat ducato",
    "peugeot boxer",
    "peugeot expert",
    "citroen relay",
    "citroen dispatch",
    "toyota proace",
    "nissan primastar",
    "nissan nv400",
    "man tge",
    "iveco daily",
)

TUNING_MODIFIERS: tuple[str, ...] = (
    "tune",
    "tuning",
    "remap",
    "economy tune",
    "economy remap",
    "van remap",
    "fleet remap",
    "driveability tune",
    "load tune",
)


def generate_tuning_rows(
    existing_keys: set[tuple[str, str]],
) -> list[dict[str, Any]]:
    """
    Cartesian product vehicle × modifier; skip (normalized, Van Tuning) already present.
    Returns list of row dicts compatible with pipeline merge.
    """
    out: list[dict[str, Any]] = []
    for veh in TUNING_VEHICLE_SEEDS:
        for mod in TUNING_MODIFIERS:
            phrase = f"{veh} {mod}".strip()
            nk = normalize_keyword_text(phrase)
            key = (nk, "Van Tuning")
            if key in existing_keys:
                continue
            existing_keys.add(key)
            out.append(
                {
                    "campaign_family": "Van Tuning",
                    "ad_group_theme": "Van Economy Tune",
                    "seed_keyword": phrase,
                    "keyword_candidate": phrase,
                    "source": "tuning_expansion_codegen",
                    "normalized_keyword": nk,
                    "tier_status": "",
                    "recommended_match_type": "",
                    "notes": "",
                }
            )
    return out
