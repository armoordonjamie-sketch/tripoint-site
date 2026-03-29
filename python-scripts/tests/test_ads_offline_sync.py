"""Unit tests for Google Ads offline export tab builder (no Sheets API)."""
from __future__ import annotations

from lead_constants import OFFLINE_EXPORT_COLUMNS
from services.ads_offline_sync import (
    build_export_key,
    build_offline_export_row,
    build_offline_export_set,
    google_ads_eligible_truthy,
)


def _base_row(**kwargs: object) -> dict:
    r = {
        "journey_id": "j1",
        "event_id": "e1",
        "occurred_at": "2025-03-15T10:00:00+00:00",
        "event_name": "generate_lead",
        "qualification_status": "qualified",
        "google_ads_eligible": "true",
        "gclid": "CjwKabc",
        "gbraid": "",
        "wbraid": "",
        "lead_channel": "booking",
        "contact_method": "",
        "click_location": "",
        "form_name": "booking_form",
        "service_interest": "mot",
        "vehicle_make": "Mercedes",
        "vehicle_model": "",
        "page": "/booking",
        "utm_source": "google",
        "utm_medium": "cpc",
        "utm_campaign": "brand",
        "notes": "",
        "google_ads_export_status": "",
        "google_ads_exported_at": "",
        "ga_client_id": "",
        "ga_session_id": "",
        "google_ads_currency": "",
        "google_ads_conversion_name": "",
        "google_ads_conversion_value": "",
        "lead_value": "",
    }
    r.update(kwargs)
    return r


def test_google_ads_eligible_truthy() -> None:
    assert google_ads_eligible_truthy("true")
    assert google_ads_eligible_truthy("TRUE")
    assert google_ads_eligible_truthy("1")
    assert google_ads_eligible_truthy(True)
    assert not google_ads_eligible_truthy("")
    assert not google_ads_eligible_truthy("false")


def test_qualified_lead_with_gclid() -> None:
    from services.google_ads_export import enrich_lead_row

    row = _base_row()
    en = enrich_lead_row(row)
    out = build_offline_export_row(row, en, batch_id="batch-1")
    assert out["source_event_id"] == "e1"
    assert out["source_event_name"] == "generate_lead"
    assert out["qualification_status"] == "qualified"
    assert out["gclid"] == "CjwKabc"
    assert out["identifier_type"] == "gclid"
    assert out["identifier_value"] == "CjwKabc"
    assert out["conversion_name"]
    assert out["export_ready"] == "true"
    assert all(c in out for c in OFFLINE_EXPORT_COLUMNS)


def test_won_lead_with_gclid() -> None:
    from services.google_ads_export import enrich_lead_row

    row = _base_row(qualification_status="won", event_id="e2")
    en = enrich_lead_row(row)
    out = build_offline_export_row(row, en, batch_id="b")
    assert out["qualification_status"] == "won"
    assert out["export_ready"] == "true"


def test_row_skipped_no_identifier() -> None:
    row = _base_row(gclid="", wbraid="", gbraid="", event_id="e3")
    rows, stats = build_offline_export_set([row], batch_id="x")
    assert rows == []
    assert stats["skipped_not_ads_exportable"] >= 1


def test_disqualified_row_excluded() -> None:
    row = _base_row(qualification_status="disqualified", event_id="e4")
    rows, stats = build_offline_export_set([row], batch_id="x")
    assert rows == []
    assert stats["skipped_not_ads_exportable"] >= 1


def test_disqualified_after_qualified_excluded() -> None:
    """Same lead data: when status flips to disqualified, it drops out of the export set."""
    qualified = _base_row(
        event_id="e-dq",
        qualification_status="qualified",
        google_ads_export_status="ready",
    )
    rows_q, _ = build_offline_export_set([qualified], batch_id="b1")
    assert len(rows_q) == 1

    disqualified = dict(qualified, qualification_status="disqualified")
    rows_d, _ = build_offline_export_set([disqualified], batch_id="b2")
    assert rows_d == []


def test_re_qualification_updates_row() -> None:
    """qualified -> disqualified -> qualified again yields one export row with latest values."""
    q1 = _base_row(
        event_id="e-re",
        qualification_status="qualified",
        lead_value="10",
        occurred_at="2025-03-10T10:00:00+00:00",
    )
    rows_a, _ = build_offline_export_set([q1], batch_id="a")
    assert len(rows_a) == 1

    dq = dict(q1, qualification_status="disqualified")
    assert build_offline_export_set([dq], batch_id="b")[0] == []

    q2 = dict(q1, qualification_status="qualified", lead_value="99", occurred_at="2025-03-20T10:00:00+00:00")
    rows, _ = build_offline_export_set([q2], batch_id="c")
    assert len(rows) == 1
    assert rows[0]["conversion_value"] == "99.0"
    assert rows[0]["source_event_id"] == "e-re"


def test_duplicate_prevention() -> None:
    r1 = _base_row(
        event_id="e-a",
        occurred_at="2025-03-10T10:00:00+00:00",
        journey_id="j-dup",
    )
    r2 = _base_row(
        event_id="e-b",
        occurred_at="2025-03-20T10:00:00+00:00",
        journey_id="j-dup",
    )
    rows, stats = build_offline_export_set([r1, r2], batch_id="dup")
    assert len(rows) == 1
    assert rows[0]["source_event_id"] == "e-b"
    assert stats["skipped_duplicate_export_key"] == 1


def test_update_existing_export_row_latest_value_wins() -> None:
    """Same export_key: later occurred_at wins; recomputing set reflects new conversion_value."""
    r1 = _base_row(
        event_id="e1",
        lead_value="100",
        occurred_at="2025-03-10T10:00:00+00:00",
    )
    rows1, _ = build_offline_export_set([r1], batch_id="batch-a")
    assert len(rows1) == 1
    assert rows1[0]["conversion_value"] == "100.0"

    r1b = _base_row(
        event_id="e1",
        lead_value="150",
        occurred_at="2025-03-25T10:00:00+00:00",
    )
    rows2, _ = build_offline_export_set([r1b], batch_id="batch-b")
    assert len(rows2) == 1
    assert rows2[0]["conversion_value"] == "150.0"
    assert rows2[0]["export_batch_id"] == "batch-b"


def test_build_export_key_stable() -> None:
    from services.google_ads_export import enrich_lead_row

    row = _base_row()
    en = enrich_lead_row(row)
    k1 = build_export_key(row, en)
    k2 = build_export_key(row, en)
    assert k1 == k2
    assert "j1" in k1
    assert "qualified" in k1
    assert "CjwKabc" in k1
