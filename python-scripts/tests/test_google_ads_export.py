"""Tests for Google Ads export helpers."""
from __future__ import annotations

from services.google_ads_export import adjustment_fields_for_exported_disqualify


def _row(**kwargs: object) -> dict:
    base = {
        "qualification_status": "qualified",
        "google_ads_export_status": "exported",
        "google_ads_conversion_name": "Qualified Lead",
        "google_ads_conversion_value": "50",
        "gclid": "abc123",
        "lead_value": "",
        "google_ads_currency": "",
    }
    base.update(kwargs)
    return base


def test_adjustment_fields_when_exported_then_disqualified() -> None:
    old = _row()
    out = adjustment_fields_for_exported_disqualify(old)
    assert out is not None
    assert out["google_ads_export_status"] == "adjustment_required"
    assert out["google_ads_adjustment_type"] == "RETRACTION"
    assert out["google_ads_conversion_name"] == "Qualified Lead"


def test_adjustment_fields_none_when_only_ready() -> None:
    old = _row(google_ads_export_status="ready")
    assert adjustment_fields_for_exported_disqualify(old) is None


def test_adjustment_fields_none_when_not_qualified_or_won() -> None:
    old = _row(qualification_status="pending")
    assert adjustment_fields_for_exported_disqualify(old) is None


def test_adjustment_fields_won_exported() -> None:
    old = _row(qualification_status="won", google_ads_conversion_name="Won Job")
    out = adjustment_fields_for_exported_disqualify(old)
    assert out is not None
    assert out["google_ads_conversion_name"] == "Won Job"
