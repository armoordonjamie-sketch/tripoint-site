"""Lightweight tags and bias hints for LLM prompts (soft signals only)."""

from __future__ import annotations

import re

_NEAR_ME = re.compile(r"\bnear me\b", re.I)
_MOBILE = re.compile(r"\bmobile\b", re.I)
_MERCEDES_MODELS = re.compile(
    r"\b(sprinter|vito|citan|mercedes)\b",
    re.I,
)
_NON_MERCEDES_VANS = re.compile(
    r"\b(transit custom|transit|vw crafter|crafter|transporter|t6|t5|"
    r"trafic|master|vivaro|movano|combo|"
    r"ducato|boxer|expert|relay|dispatch|jumper|"
    r"proace|pro ace|primastar|nv400|nv300|"
    r"man tge|iveco daily|daily van)\b",
    re.I,
)
_PRE_PURCHASE = re.compile(r"pre[\s-]?purchase|pre[\s-]?buy", re.I)
_LIMP = re.compile(
    r"\b(limp mode|reduced power|derate|limited performance)\b",
    re.I,
)
_EMISSIONS = re.compile(r"\b(adblue|dpf|nox|scr|egr)\b", re.I)
_BRAKES = re.compile(r"\b(brake|brakes|pads|discs)\b", re.I)
_SERVICING = re.compile(
    r"\b(service|servicing|minor service|major service|interval)\b",
    re.I,
)
_FLEET = re.compile(r"\bfleet\b", re.I)
_URGENT = re.compile(r"\b(urgent|vor|wont start|won't start|breakdown)\b", re.I)


def compute_heuristic_tags(original: str, normalized: str) -> list[str]:
    text = f"{original} {normalized}"
    tags: list[str] = []
    if _NEAR_ME.search(text):
        tags.append("local_intent_near_me")
    if _MOBILE.search(text):
        tags.append("mobile_intent")
    if _MERCEDES_MODELS.search(text):
        tags.append("mercedes_or_model")
    if _NON_MERCEDES_VANS.search(text):
        tags.append("non_mercedes_work_van")
    if _PRE_PURCHASE.search(text):
        tags.append("bias_pre_purchase_check")
    if _LIMP.search(text):
        tags.append("bias_limp_derate")
    if _EMISSIONS.search(text):
        tags.append("bias_adblue_dpf_emissions")
    if _BRAKES.search(text):
        tags.append("bias_brakes")
    if _SERVICING.search(text):
        tags.append("bias_servicing")
    if _FLEET.search(text):
        tags.append("bias_fleet")
    if _URGENT.search(text):
        tags.append("bias_vor_urgent")
    return tags


def bias_hint_line(tags: list[str]) -> str:
    if not tags:
        return ""
    return "Heuristic hints: " + ", ".join(tags)
