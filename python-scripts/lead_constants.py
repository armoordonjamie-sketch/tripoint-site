"""
Shared lead / Google Ads enums and column definitions for Sheets + admin API.
Keep frontend src/types/leads.ts in sync.
"""
from __future__ import annotations

import os

QUALIFICATION_STATUS_OPTIONS: list[str] = ["pending", "qualified", "disqualified", "won"]

DISQUALIFY_REASON_OPTIONS: list[str] = [
    "wrong_vehicle_make",
    "wrong_service",
    "wrong_area",
    "price_shopping",
    "spam",
    "no_response",
    "other",
]

VEHICLE_MAKE_OPTIONS: list[str] = ["Mercedes", "Other", "Unknown"]

EDITABLE_LEAD_FIELDS: list[str] = [
    "qualification_status",
    "disqualify_reason",
    "vehicle_make",
    "vehicle_model",
    "notes",
    "lead_value",
    "google_ads_conversion_value",
    "google_ads_conversion_name",
]

# Original tracking columns (before Google Ads ops extensions)
BASE_LEADS_COLUMNS: list[str] = [
    "journey_id",
    "event_id",
    "occurred_at",
    "event_name",
    "lead_channel",
    "click_location",
    "nav_label",
    "nav_target",
    "contact_method",
    "lead_type",
    "form_name",
    "service_interest",
    "payment_completed",
    "page",
    "title",
    "page_type",
    "service_category",
    "service_name",
    "area_slug",
    "booking_step",
    "zone_result",
    "content_type",
    "content_id",
    "lead_value",
    "gclid",
    "gbraid",
    "wbraid",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "qualification_status",
    "disqualify_reason",
    "vehicle_make",
    "vehicle_model",
    "notes",
]

GOOGLE_ADS_EXTRA_COLUMNS: list[str] = [
    "google_ads_export_status",
    "google_ads_export_type",
    "google_ads_conversion_name",
    "google_ads_conversion_value",
    "google_ads_currency",
    "google_ads_exported_at",
    "google_ads_export_batch_id",
    "google_ads_adjustment_type",
    "google_ads_adjustment_value",
    "google_ads_last_error",
    "google_ads_eligible",
    "google_ads_identifier_type",
    "google_ads_identifier_value",
]

# Optional: GA client_id for Measurement Protocol continuity (future client-side capture)
LEAD_ATTRIBUTION_EXTRA_COLUMNS: list[str] = ["ga_client_id"]

# Full header row for the Leads tab (append path uses this)
LEADS_COLUMNS: list[str] = (
    list(BASE_LEADS_COLUMNS) + list(GOOGLE_ADS_EXTRA_COLUMNS) + list(LEAD_ATTRIBUTION_EXTRA_COLUMNS)
)

EXPORT_LOG_TAB = "GoogleAds_Export_Log"
EXPORT_LOG_COLUMNS: list[str] = [
    "batch_id",
    "created_at",
    "export_type",
    "row_count",
    "target",
    "triggered_by",
    "status",
    "notes",
    "error",
]

QUALIFIED_EXPORT_TAB = "GoogleAds_Qualified_Export"
ADJUSTMENTS_EXPORT_TAB = "GoogleAds_Adjustments_Export"


def ads_config() -> dict[str, str | float]:
    return {
        "qualified_conversion_name": os.getenv("GOOGLE_ADS_QUALIFIED_CONVERSION_NAME", "Qualified Lead"),
        "won_conversion_name": os.getenv("GOOGLE_ADS_WON_CONVERSION_NAME", "Won Job"),
        "default_currency": os.getenv("GOOGLE_ADS_DEFAULT_CURRENCY", "GBP"),
        "default_qualified_value": float(os.getenv("GOOGLE_ADS_DEFAULT_QUALIFIED_VALUE", "50")),
        "default_won_value": float(os.getenv("GOOGLE_ADS_DEFAULT_WON_VALUE", "200")),
    }
