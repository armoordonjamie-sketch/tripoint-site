"""Tests for Google Ads export helpers."""
from __future__ import annotations

from routes.admin_leads import _merge_qualification_ads_enrichment
from services.google_ads_export import (
    adjustment_fields_for_exported_disqualify,
    compute_ads_enrichment_fields,
)


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


def test_compute_disqualified_only_eligible_false() -> None:
    out = compute_ads_enrichment_fields({"qualification_status": "disqualified"})
    assert out == {"google_ads_eligible": "FALSE"}


def test_compute_qualified_with_gclid_sets_fields() -> None:
    row = {
        "qualification_status": "qualified",
        "gclid": "gcl-xyz",
        "google_ads_conversion_name": "",
        "google_ads_conversion_value": "",
        "google_ads_currency": "",
        "lead_value": "",
    }
    out = compute_ads_enrichment_fields(row)
    assert out["google_ads_eligible"] == "TRUE"
    assert out["google_ads_identifier_type"] == "gclid"
    assert out["google_ads_identifier_value"] == "gcl-xyz"
    assert out["google_ads_conversion_name"] == "Qualified Lead"
    assert out["google_ads_conversion_value"] == "50.0"
    assert out["google_ads_currency"] == "GBP"


def test_compute_qualified_no_click_not_eligible() -> None:
    row = {
        "qualification_status": "qualified",
        "gclid": "",
        "wbraid": "",
        "gbraid": "",
    }
    out = compute_ads_enrichment_fields(row)
    assert out == {"google_ads_eligible": "FALSE"}


def test_compute_preserves_manual_conversion_name() -> None:
    row = {
        "qualification_status": "qualified",
        "gclid": "abc",
        "google_ads_conversion_name": "Custom Action",
        "google_ads_conversion_value": "",
        "google_ads_currency": "",
        "lead_value": "",
    }
    out = compute_ads_enrichment_fields(row)
    assert "google_ads_conversion_name" not in out
    assert out["google_ads_eligible"] == "TRUE"


def test_merge_patch_qualified_populates_updates() -> None:
    old = {
        "qualification_status": "pending",
        "gclid": "gid1",
        "google_ads_conversion_name": "",
        "google_ads_conversion_value": "",
        "google_ads_currency": "",
        "lead_value": "",
        "wbraid": "",
        "gbraid": "",
    }
    updates = {"qualification_status": "qualified"}
    _merge_qualification_ads_enrichment(old, updates)
    assert updates["google_ads_eligible"] == "TRUE"
    assert updates["google_ads_identifier_type"] == "gclid"
    assert updates["google_ads_identifier_value"] == "gid1"
    assert updates["qualification_status"] == "qualified"


def test_merge_patch_disqualified_sets_not_eligible() -> None:
    old = {
        "qualification_status": "qualified",
        "gclid": "x",
        "google_ads_export_status": "ready",
    }
    updates = {"qualification_status": "disqualified"}
    _merge_qualification_ads_enrichment(old, updates)
    assert updates["google_ads_eligible"] == "FALSE"


def test_merge_respects_explicit_conversion_in_same_patch() -> None:
    old = {
        "qualification_status": "pending",
        "gclid": "z",
        "google_ads_conversion_name": "",
        "google_ads_conversion_value": "",
        "google_ads_currency": "",
        "lead_value": "",
        "wbraid": "",
        "gbraid": "",
    }
    updates = {"qualification_status": "qualified", "google_ads_conversion_name": "Manual Name"}
    _merge_qualification_ads_enrichment(old, updates)
    assert updates["google_ads_conversion_name"] == "Manual Name"
    assert updates["google_ads_eligible"] == "TRUE"
