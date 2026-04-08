"""Tests for Google Ads enhanced-conversion hashing helpers."""
from __future__ import annotations

from services.hash_user_data import normalize_and_hash, normalize_and_hash_email, normalize_and_hash_phone


def test_normalize_and_hash_email_gmail_strips_dots_and_plus() -> None:
    h1 = normalize_and_hash_email("Jane.Doe+Shopping@gmail.com")
    h2 = normalize_and_hash_email("janedoe@gmail.com")
    assert h1 == h2


def test_normalize_and_hash_email_other_domain_keeps_plus() -> None:
    h1 = normalize_and_hash_email("user.name+NYC@Example.com")
    assert len(h1) == 64


def test_normalize_and_hash_phone_uk() -> None:
    h = normalize_and_hash_phone("07123 456789")
    assert len(h) == 64


def test_normalize_and_hash_strips_space() -> None:
    assert normalize_and_hash("  AbC ") == normalize_and_hash("abc")
