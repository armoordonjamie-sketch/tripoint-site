"""
Google Ads API — enhanced conversions for leads (ConversionUploadService) and
enhanced conversions for web (ConversionAdjustmentUploadService / ENHANCEMENT).

Requires OAuth2 + developer token; see python-scripts/.env.example.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

logger = logging.getLogger("tripoint.google_ads_api")

LONDON = ZoneInfo("Europe/London")
_API_VERSION = (os.getenv("GOOGLE_ADS_API_VERSION") or "v23").strip()


def google_ads_api_is_configured() -> bool:
    cid = (os.getenv("GOOGLE_ADS_CUSTOMER_ID") or "").replace("-", "").strip()
    return bool(
        cid
        and (os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN") or "").strip()
        and (os.getenv("GOOGLE_ADS_CLIENT_ID") or "").strip()
        and (os.getenv("GOOGLE_ADS_CLIENT_SECRET") or "").strip()
        and (os.getenv("GOOGLE_ADS_REFRESH_TOKEN") or "").strip()
    )


def _customer_id() -> str:
    return (os.getenv("GOOGLE_ADS_CUSTOMER_ID") or "").replace("-", "").strip()


def _ads_client():  # pragma: no cover - network
    from google.ads.googleads.client import GoogleAdsClient

    cfg: dict[str, Any] = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", "").strip(),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID", "").strip(),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET", "").strip(),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN", "").strip(),
        "use_proto_plus": True,
    }
    login = (os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID") or "").replace("-", "").strip()
    if login:
        cfg["login_customer_id"] = login
    return GoogleAdsClient.load_from_dict(cfg, version=_API_VERSION)


def _conversion_action_resource_name(action_id: str) -> str:
    return f"customers/{_customer_id()}/conversionActions/{action_id.strip()}"


def _format_datetime_ads(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=LONDON)
    iso = dt.astimezone(LONDON).isoformat(timespec="seconds")
    return iso.replace("T", " ")


def conversion_datetime_string_for_row(row: dict[str, Any]) -> str | None:
    from services.ads_offline_sync import resolve_conversion_time

    s = resolve_conversion_time(row)
    if not s:
        return None
    try:
        dt = datetime.strptime(s, "%Y-%m-%d %H:%M:%S").replace(tzinfo=LONDON)
        return _format_datetime_ads(dt)
    except ValueError:
        return None


def _click_ids_present(row: dict[str, Any]) -> bool:
    return any(str(row.get(k) or "").strip() for k in ("gclid", "gbraid", "wbraid"))


def _append_hashed_user_identifiers(client: Any, target: Any, row: dict[str, Any]) -> int:
    """Appends UserIdentifier messages; returns count added."""
    n = 0
    he = str(row.get("hashed_email") or "").strip()
    hp = str(row.get("hashed_phone") or "").strip()
    if he:
        ui = client.get_type("UserIdentifier")
        ui.user_identifier_source = client.enums.UserIdentifierSourceEnum.FIRST_PARTY
        ui.hashed_email = he
        target.user_identifiers.append(ui)
        n += 1
    if hp:
        ui = client.get_type("UserIdentifier")
        ui.hashed_phone_number = hp
        target.user_identifiers.append(ui)
        n += 1
    return n


def _maybe_session_attributes(client: Any, click_conversion: Any, row: dict[str, Any]) -> None:
    if (os.getenv("GOOGLE_ADS_ENABLE_SESSION_ATTRIBUTES") or "").strip().lower() not in (
        "1",
        "true",
        "yes",
    ):
        return
    ga_s = str(row.get("ga_session_id") or "").strip()
    ga_c = str(row.get("ga_client_id") or "").strip()
    if not ga_s and not ga_c:
        return
    pairs = client.get_type("SessionAttributesKeyValuePairs")
    if ga_s:
        p = client.get_type("SessionAttributeKeyValuePair")
        p.session_attribute_key = "ga_session_id"
        p.session_attribute_value = ga_s
        pairs.key_value_pairs.append(p)
    if ga_c:
        p = client.get_type("SessionAttributeKeyValuePair")
        p.session_attribute_key = "ga_client_id"
        p.session_attribute_value = ga_c
        pairs.key_value_pairs.append(p)
    click_conversion.session_attributes_key_value_pairs = pairs


def upload_enhanced_click_conversion_for_lead(
    row: dict[str, Any],
    qualification_status: str,
) -> dict[str, Any]:
    """
    Upload one offline click conversion (enhanced conversions for leads).
    qualification_status: 'qualified' | 'won'
    """
    from services.google_ads_export import enrich_lead_row

    qs = qualification_status.strip().lower()
    if qs not in ("qualified", "won"):
        return {"attempted": False, "sent": False, "skipped_reason": "not_qualified_or_won"}

    action_id = (
        os.getenv("GOOGLE_ADS_QUALIFIED_CONVERSION_ACTION_ID", "").strip()
        if qs == "qualified"
        else os.getenv("GOOGLE_ADS_WON_CONVERSION_ACTION_ID", "").strip()
    )
    if not action_id:
        return {"attempted": False, "sent": False, "skipped_reason": "missing_conversion_action_id"}

    if not google_ads_api_is_configured():
        return {"attempted": False, "sent": False, "skipped_reason": "google_ads_api_not_configured"}

    if not _click_ids_present(row) and not (
        str(row.get("hashed_email") or "").strip() or str(row.get("hashed_phone") or "").strip()
    ):
        return {"attempted": False, "sent": False, "skipped_reason": "missing_click_id_and_user_identifiers"}

    cd = conversion_datetime_string_for_row(row)
    if not cd:
        return {"attempted": False, "sent": False, "skipped_reason": "missing_conversion_datetime"}

    enriched = enrich_lead_row(dict(row))

    try:
        client = _ads_client()
        cc = client.get_type("ClickConversion")
        cc.conversion_action = _conversion_action_resource_name(action_id)
        cc.conversion_date_time = cd
        gclid = str(row.get("gclid") or "").strip()
        gbraid = str(row.get("gbraid") or "").strip()
        wbraid = str(row.get("wbraid") or "").strip()
        if gclid:
            cc.gclid = gclid
        if gbraid:
            cc.gbraid = gbraid
        if wbraid:
            cc.wbraid = wbraid
        cv = enriched.get("computed_conversion_value")
        if cv is not None:
            try:
                cc.conversion_value = float(cv)
            except (TypeError, ValueError):
                pass
        cc.currency_code = str(enriched.get("computed_currency") or "GBP")
        oid = str(row.get("event_id") or row.get("order_id") or "").strip()
        if oid:
            cc.order_id = oid[:120]

        cc.consent.ad_user_data = client.enums.ConsentStatusEnum.GRANTED
        cc.consent.ad_personalization = client.enums.ConsentStatusEnum.GRANTED

        _append_hashed_user_identifiers(client, cc, row)
        _maybe_session_attributes(client, cc, row)

        if (os.getenv("GOOGLE_ADS_SEND_USER_IP_ADDRESS") or "").strip().lower() in ("1", "true", "yes"):
            ip = str(row.get("ip_address") or "").strip()
            if ip:
                cc.user_ip_address = ip

        svc = client.get_service("ConversionUploadService")
        response = svc.upload_click_conversions(
            customer_id=_customer_id(),
            conversions=[cc],
            partial_failure=True,
        )

        pf = getattr(response, "partial_failure_error", None)
        msg = str(getattr(pf, "message", None) or "").strip() if pf is not None else ""
        if msg:
            logger.warning("Google Ads click upload partial_failure: %s", msg[:500])
            return {"attempted": True, "sent": False, "error": msg, "partial_failure": True}

        logger.info("Google Ads click conversion uploaded event_id=%s qs=%s", row.get("event_id"), qs)
        return {"attempted": True, "sent": True, "error": None, "partial_failure": False}
    except Exception as e:
        logger.exception("Google Ads click upload failed: %s", e)
        return {"attempted": True, "sent": False, "error": str(e)[:500], "partial_failure": False}


def upload_enhanced_conversion_for_web(row: dict[str, Any]) -> dict[str, Any]:
    """
    ENHANCEMENT adjustment for a tag-measured web conversion (same order_id as gtag transaction_id).
    Opt-in via GOOGLE_ADS_WEB_ENHANCEMENT_ENABLED=1 (often inapplicable if qualification is delayed).
    """
    if (os.getenv("GOOGLE_ADS_WEB_ENHANCEMENT_ENABLED") or "").strip().lower() not in ("1", "true", "yes"):
        return {"attempted": False, "sent": False, "skipped_reason": "web_enhancement_disabled"}

    web_action_id = os.getenv("GOOGLE_ADS_WEB_CONVERSION_ACTION_ID", "").strip()
    order_id = str(row.get("order_id") or row.get("journey_id") or "").strip()
    if not web_action_id or not order_id:
        return {"attempted": False, "sent": False, "skipped_reason": "missing_web_action_or_order_id"}

    if not google_ads_api_is_configured():
        return {"attempted": False, "sent": False, "skipped_reason": "google_ads_api_not_configured"}

    if not (
        str(row.get("hashed_email") or "").strip() or str(row.get("hashed_phone") or "").strip()
    ):
        return {"attempted": False, "sent": False, "skipped_reason": "missing_hashed_user_identifiers"}

    try:
        client = _ads_client()
        adj = client.get_type("ConversionAdjustment")
        adj.adjustment_type = client.enums.ConversionAdjustmentTypeEnum.ENHANCEMENT
        adj.conversion_action = _conversion_action_resource_name(web_action_id)
        adj.order_id = order_id[:120]
        now = datetime.now(LONDON)
        adj.adjustment_date_time = _format_datetime_ads(now)

        _append_hashed_user_identifiers(client, adj, row)
        ua = str(row.get("user_agent") or "").strip()
        if ua:
            adj.user_agent = ua[:2048]

        svc = client.get_service("ConversionAdjustmentUploadService")
        response = svc.upload_conversion_adjustments(
            customer_id=_customer_id(),
            conversion_adjustments=[adj],
            partial_failure=True,
        )
        pf = getattr(response, "partial_failure_error", None)
        msg = str(getattr(pf, "message", None) or "").strip() if pf is not None else ""
        if msg:
            logger.warning("Google Ads web enhancement partial_failure: %s", msg[:500])
            return {"attempted": True, "sent": False, "error": msg, "partial_failure": True}
        return {"attempted": True, "sent": True, "error": None, "partial_failure": False}
    except Exception as e:
        logger.exception("Google Ads web enhancement failed: %s", e)
        return {"attempted": True, "sent": False, "error": str(e)[:500], "partial_failure": False}
