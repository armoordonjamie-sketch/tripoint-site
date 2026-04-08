"""Normalize and SHA-256 hash PII for Google Ads enhanced conversions (match browser helpers)."""

from __future__ import annotations

import hashlib
import re


def normalize_and_hash(value: str) -> str:
    s = re.sub(r"\s+", "", value.strip().lower())
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def normalize_and_hash_email(email: str) -> str:
    normalized = email.strip().lower()
    parts = normalized.split("@")
    if len(parts) > 1 and parts[1] in ("gmail.com", "googlemail.com"):
        local = parts[0].replace(".", "")
        plus = local.find("+")
        if plus >= 0:
            local = local[:plus]
        normalized = f"{local}@{parts[1]}"
    normalized = re.sub(r"\s+", "", normalized)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def normalize_phone_e164_uk(phone: str) -> str:
    t = phone.strip()
    digits = re.sub(r"\D", "", t)
    if digits.startswith("44"):
        return f"+{digits}"
    if digits.startswith("0") and len(digits) >= 10:
        return f"+44{digits[1:]}"
    if t.startswith("+"):
        return f"+{digits}"
    return f"+{digits}"


def normalize_and_hash_phone(phone: str) -> str:
    return normalize_and_hash(normalize_phone_e164_uk(phone))
