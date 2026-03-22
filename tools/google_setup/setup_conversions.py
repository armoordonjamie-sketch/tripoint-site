#!/usr/bin/env python3
"""
TriPoint Diagnostics - Google Ads + GA4 Setup CLI

Usage:
    python setup_conversions.py auth                    # Authenticate (Google Ads API OAuth)
    python setup_conversions.py run --config config.yaml  # Create conversions
    python setup_conversions.py export-env --config config.yaml  # Dump VITE_* from Ads API
    python setup_conversions.py status --config config.yaml  # Check current state
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import click
import yaml

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

REPORT_PATH = Path(__file__).parent / "report.json"


def clean_customer_id(cid: str) -> str:
    """Strip dashes from customer ID → '123-456-7890' → '1234567890'."""
    return cid.replace("-", "")


def load_config(config_path: str) -> dict:
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def save_report(report: dict):
    REPORT_PATH.write_text(json.dumps(report, indent=2, default=str))
    click.echo(f"\nReport saved to {REPORT_PATH}")


# ---------------------------------------------------------------------------
# GA4 Admin API
# ---------------------------------------------------------------------------

def ga4_get_property(creds, property_id: str) -> dict:
    """Fetch GA4 property details."""
    from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
    from google.analytics.admin_v1beta.types import GetPropertyRequest

    client = AnalyticsAdminServiceClient(credentials=creds)
    prop = client.get_property(
        request=GetPropertyRequest(name=f"properties/{property_id}")
    )
    return {
        "name": prop.name,
        "display_name": prop.display_name,
        "time_zone": prop.time_zone,
        "currency_code": prop.currency_code,
        "industry_category": str(prop.industry_category) if prop.industry_category else None,
        "create_time": str(prop.create_time),
    }


def ga4_list_key_events(creds, property_id: str) -> list[dict]:
    """List existing key events (conversions) for the property."""
    from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
    from google.analytics.admin_v1beta.types import ListKeyEventsRequest

    client = AnalyticsAdminServiceClient(credentials=creds)
    result = []
    try:
        response = client.list_key_events(
            request=ListKeyEventsRequest(parent=f"properties/{property_id}")
        )
        for ke in response:
            result.append({
                "name": ke.name,
                "event_name": ke.event_name,
                "create_time": str(ke.create_time),
                "deletable": ke.deletable,
                "custom": ke.custom,
            })
    except Exception as e:
        click.echo(f"  Warning: Could not list key events: {e}")
    return result


def ga4_create_key_event(creds, property_id: str, event_name: str) -> dict | None:
    """Mark an event as a Key Event (conversion) in GA4."""
    from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
    from google.analytics.admin_v1beta.types import CreateKeyEventRequest, KeyEvent

    client = AnalyticsAdminServiceClient(credentials=creds)

    key_event = KeyEvent(
        event_name=event_name,
        counting_method=KeyEvent.CountingMethod.ONCE_PER_EVENT,
    )

    try:
        created = client.create_key_event(
            request=CreateKeyEventRequest(
                parent=f"properties/{property_id}",
                key_event=key_event,
            )
        )
        return {
            "name": created.name,
            "event_name": created.event_name,
            "create_time": str(created.create_time),
        }
    except Exception as e:
        error_msg = str(e)
        if "ALREADY_EXISTS" in error_msg or "already exists" in error_msg.lower():
            click.echo(f"    Key event '{event_name}' already exists (OK)")
            return {"event_name": event_name, "status": "already_exists"}
        click.echo(f"    Error creating key event '{event_name}': {e}")
        return {"event_name": event_name, "status": "error", "error": error_msg}


def ga4_list_google_ads_links(creds, property_id: str) -> list[dict]:
    """List existing Google Ads links for the GA4 property."""
    from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
    from google.analytics.admin_v1beta.types import ListGoogleAdsLinksRequest

    client = AnalyticsAdminServiceClient(credentials=creds)
    result = []
    try:
        response = client.list_google_ads_links(
            request=ListGoogleAdsLinksRequest(parent=f"properties/{property_id}")
        )
        for link in response:
            result.append({
                "name": link.name,
                "customer_id": link.customer_id,
                "can_manage_clients": link.can_manage_clients,
                "ads_personalization_enabled": link.ads_personalization_enabled,
                "create_time": str(link.create_time),
            })
    except Exception as e:
        click.echo(f"  Warning: Could not list Google Ads links: {e}")
    return result


def ga4_create_google_ads_link(creds, property_id: str, customer_id: str) -> dict | None:
    """Create a Google Ads link in GA4."""
    from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
    from google.analytics.admin_v1beta.types import (
        CreateGoogleAdsLinkRequest,
        GoogleAdsLink,
    )

    client = AnalyticsAdminServiceClient(credentials=creds)

    link = GoogleAdsLink(
        customer_id=clean_customer_id(customer_id),
        ads_personalization_enabled=True,
    )

    try:
        created = client.create_google_ads_link(
            request=CreateGoogleAdsLinkRequest(
                parent=f"properties/{property_id}",
                google_ads_link=link,
            )
        )
        return {
            "name": created.name,
            "customer_id": created.customer_id,
            "ads_personalization_enabled": created.ads_personalization_enabled,
            "create_time": str(created.create_time),
        }
    except Exception as e:
        error_msg = str(e)
        if "ALREADY_EXISTS" in error_msg or "already exists" in error_msg.lower():
            click.echo(f"    Google Ads link already exists for {customer_id} (OK)")
            return {"customer_id": customer_id, "status": "already_exists"}
        click.echo(f"    Error creating Google Ads link: {e}")
        return {"customer_id": customer_id, "status": "error", "error": error_msg}


# ---------------------------------------------------------------------------
# Google Ads API
# ---------------------------------------------------------------------------

def ads_create_conversion_action(ads_client, customer_id: str, conv_config: dict) -> dict:
    """Create a single conversion action in Google Ads."""
    from google.ads.googleads.client import GoogleAdsClient

    service = ads_client.get_service("ConversionActionService")
    enums = ads_client.enums

    operation = ads_client.get_type("ConversionActionOperation")
    action = operation.create

    action.name = conv_config["name"]
    action.status = getattr(enums.ConversionActionStatusEnum.ConversionActionStatus, "ENABLED")

    # Type
    conv_type = conv_config.get("type", "WEBPAGE").upper()
    if conv_type == "UPLOAD_CLICKS":
        action.type_ = getattr(enums.ConversionActionTypeEnum.ConversionActionType, "UPLOAD_CLICKS")
    else:
        action.type_ = getattr(enums.ConversionActionTypeEnum.ConversionActionType, "WEBPAGE")

    # Category
    cat = conv_config.get("category", "LEAD").upper()
    category_map = {
        "LEAD": getattr(enums.ConversionActionCategoryEnum.ConversionActionCategory, "LEAD"),
        "PURCHASE": getattr(enums.ConversionActionCategoryEnum.ConversionActionCategory, "PURCHASE"),
        "SIGNUP": getattr(enums.ConversionActionCategoryEnum.ConversionActionCategory, "SIGNUP"),
        "PAGE_VIEW": getattr(enums.ConversionActionCategoryEnum.ConversionActionCategory, "PAGE_VIEW"),
        "DEFAULT": getattr(enums.ConversionActionCategoryEnum.ConversionActionCategory, "DEFAULT"),
    }
    action.category = category_map.get(
        cat, getattr(enums.ConversionActionCategoryEnum.ConversionActionCategory, "DEFAULT")
    )

    # Counting
    counting = conv_config.get("counting_type", "ONE_PER_CLICK").upper()
    if counting == "MANY_PER_CLICK":
        action.counting_type = getattr(enums.ConversionActionCountingTypeEnum.ConversionActionCountingType, "MANY_PER_CLICK")
    else:
        action.counting_type = getattr(enums.ConversionActionCountingTypeEnum.ConversionActionCountingType, "ONE_PER_CLICK")

    # Primary / secondary
    primary = conv_config.get("primary", True)
    action.primary_for_goal = primary

    # Value settings
    if conv_config.get("variable_value"):
        action.value_settings.default_value = conv_config.get("default_value", 0.0)
        action.value_settings.always_use_default_value = False
    else:
        action.value_settings.default_value = 1.0
        action.value_settings.always_use_default_value = True

    # View-through and click-through windows
    action.view_through_lookback_window_days = 1
    action.click_through_lookback_window_days = 30

    # Attribution model
    try:
        action.attribution_model_settings.attribution_model = (
            getattr(enums.AttributionModelEnum.AttributionModel, "GOOGLE_ADS_LAST_CLICK")
        )
    except Exception:
        pass  # Older API versions may not support this field

    try:
        cid = clean_customer_id(customer_id)
        response = service.mutate_conversion_actions(
            customer_id=cid,
            operations=[operation],
        )
        result = response.results[0]
        resource_name = result.resource_name

        # Extract the conversion action ID from the resource name
        # Format: customers/{customer_id}/conversionActions/{conversion_action_id}
        action_id = resource_name.split("/")[-1]

        return {
            "name": conv_config["name"],
            "resource_name": resource_name,
            "action_id": action_id,
            "status": "created",
        }
    except Exception as e:
        error_msg = str(e)
        if "DUPLICATE_NAME" in error_msg or "already exists" in error_msg.lower():
            click.echo(f"    Conversion '{conv_config['name']}' already exists (OK)")
            return {"name": conv_config["name"], "status": "already_exists"}
        click.echo(f"    Error creating conversion '{conv_config['name']}': {e}")
        return {"name": conv_config["name"], "status": "error", "error": error_msg}


def _parse_send_to_from_snippet(event_snippet: str) -> str | None:
    """Extract AW-xxx/label from gtag conversion snippet."""
    if not event_snippet:
        return None
    for pattern in (
        r"['\"]send_to['\"]:\s*['\"]([^'\"]+)['\"]",
        r"'send_to':\s*'([^']+)'",
        r"send_to['\"]?\s*:\s*['\"](AW-[^'\"]+)['\"]",
    ):
        m = re.search(pattern, event_snippet)
        if m:
            return m.group(1).strip()
    return None


def label_from_send_to(send_to: str | None) -> str | None:
    """Label segment only (after last /), for VITE_GOOGLE_ADS_CONV_*."""
    if not send_to or "/" not in send_to:
        return None
    return send_to.split("/")[-1].strip()


def ads_list_conversion_actions(ads_client, customer_id: str) -> list[dict]:
    """List existing conversion actions."""
    service = ads_client.get_service("GoogleAdsService")
    cid = clean_customer_id(customer_id)

    query = """
        SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.type,
            conversion_action.status,
            conversion_action.category,
            conversion_action.tag_snippets,
            conversion_action.primary_for_goal
        FROM conversion_action
        WHERE conversion_action.status = 'ENABLED'
    """

    results = []
    try:
        response = service.search(customer_id=cid, query=query)
        for row in response:
            ca = row.conversion_action
            send_to = None
            if ca.tag_snippets:
                for snippet in ca.tag_snippets:
                    if snippet.event_snippet and "send_to" in snippet.event_snippet:
                        send_to = _parse_send_to_from_snippet(snippet.event_snippet)
                        if send_to:
                            break

            results.append({
                "id": ca.id,
                "name": ca.name,
                "type": str(ca.type_.name) if ca.type_ else None,
                "status": str(ca.status.name) if ca.status else None,
                "category": str(ca.category.name) if ca.category else None,
                "primary_for_goal": ca.primary_for_goal,
                "send_to": send_to,
            })
    except Exception as e:
        click.echo(f"  Warning: Could not list conversions: {e}")
    return results


# Substrings in conversion action name (lowercase) -> VITE env key (first match wins)
_ADS_NAME_TO_VITE: list[tuple[tuple[str, ...], str]] = [
    (("whatsapp",), "VITE_GOOGLE_ADS_CONV_WHATSAPP"),
    (("contact form",), "VITE_GOOGLE_ADS_CONV_CONTACT"),
    (("phone call", "phone"), "VITE_GOOGLE_ADS_CONV_PHONE"),
    (("email",), "VITE_GOOGLE_ADS_CONV_EMAIL"),
    (("availability",), "VITE_GOOGLE_ADS_CONV_BOOKING_AVAILABILITY"),
    (("slot",), "VITE_GOOGLE_ADS_CONV_BOOKING_SLOT"),
    (("job paid", "payment", "deposit"), "VITE_GOOGLE_ADS_CONV_PAYMENT"),
    (("booking confirmed",), "VITE_GOOGLE_ADS_CONV_BOOKING"),
    (("book now",), "VITE_GOOGLE_ADS_CONV_BOOK_NOW"),
]


def match_conversion_name_to_vite_key(name: str) -> str | None:
    nl = name.lower()
    for keywords, vite_key in _ADS_NAME_TO_VITE:
        if any(k in nl for k in keywords):
            return vite_key
    return None


# ---------------------------------------------------------------------------
# CLI Commands
# ---------------------------------------------------------------------------

@click.group()
def cli():
    """TriPoint Diagnostics - Google Ads + GA4 Setup CLI"""
    pass


@cli.command()
def auth():
    """Authenticate with Google APIs (opens browser)."""
    from google_auth import run_auth_flow

    success = run_auth_flow()
    if success:
        click.echo("\nNext steps:")
        click.echo("  1. Set GOOGLE_ADS_DEVELOPER_TOKEN env var")
        click.echo("  2. Copy config.example.yaml -> config.yaml and fill in IDs")
        click.echo("  3. Run: python setup_conversions.py run --config config.yaml")


@cli.command("auth-ga4")
@click.option("--config", "config_path", required=True, help="Path to config.yaml (uses ga4.property_id)")
def auth_ga4_cmd(config_path: str):
    """Verify GA4 Admin API access. Set GA4_SERVICE_ACCOUNT_JSON to the service account JSON path."""
    from google_auth import get_ga4_credentials, _service_account_json_path

    path = _service_account_json_path()
    if path:
        click.echo(f"Using service account JSON: {path}")
    else:
        click.echo("No GA4_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS - will use OAuth (token.json).")

    config = load_config(config_path)
    property_id = (config.get("ga4") or {}).get("property_id", "").strip()
    if not property_id:
        click.echo("ERROR: Set ga4.property_id in config.yaml")
        raise SystemExit(1)

    creds = get_ga4_credentials()
    click.echo(f"Fetching GA4 property {property_id}...")
    try:
        prop = ga4_get_property(creds, property_id)
        click.echo(f"  OK: {prop['display_name']} ({prop['time_zone']})")
    except Exception as e:
        click.echo(f"  FAILED: {e}")
        click.echo(
            "  -> Add the service account email in GA4: Admin -> Property access management (Editor+)."
        )
        raise SystemExit(1)


@cli.command()
@click.option("--config", "config_path", required=True, help="Path to config.yaml")
@click.option(
    "--ga4-only",
    "ga4_only",
    is_flag=True,
    help="Skip Google Ads API (no OAuth). GA4 key events + GA4<->Ads link use service account only.",
)
def run(config_path: str, ga4_only: bool):
    """Create GA4 key events, Google Ads conversions, and link accounts."""
    from google_auth import get_ga4_credentials, get_google_ads_client_config, google_ads_auth_mode_message

    config = load_config(config_path)
    creds_ga4 = get_ga4_credentials()

    if ga4_only:
        click.echo("\n  Mode: --ga4-only (no Google Ads API / OAuth)")

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "ga4": {},
        "google_ads": {},
        "links": {},
        "env_vars": {},
        "manual_steps": [],
    }

    # -----------------------------------------------------------------------
    # Step 1: GA4 Property
    # -----------------------------------------------------------------------
    ga4_config = config.get("ga4", {})
    property_id = ga4_config.get("property_id", "")

    if property_id:
        click.echo(f"\n{'='*60}")
        click.echo("Step 1: GA4 Property")
        click.echo(f"{'='*60}")

        click.echo(f"\n  Fetching property {property_id}...")
        try:
            prop_info = ga4_get_property(creds_ga4, property_id)
            report["ga4"]["property"] = prop_info
            click.echo(f"  [OK] {prop_info['display_name']} ({prop_info['time_zone']})")
        except Exception as e:
            click.echo(f"  [ERR] Could not fetch property: {e}")
            report["ga4"]["property"] = {"error": str(e)}

        # Key Events
        click.echo("\n  Creating key events...")
        key_events_config = config.get("ga4_key_events", [])
        key_events_results = []

        # List existing first
        existing_ke = ga4_list_key_events(creds_ga4, property_id)
        existing_names = {ke["event_name"] for ke in existing_ke}

        for event_name in key_events_config:
            if event_name in existing_names:
                click.echo(f"    [OK] '{event_name}' already marked as key event")
                key_events_results.append({
                    "event_name": event_name,
                    "status": "already_exists",
                })
            else:
                click.echo(f"    Creating key event '{event_name}'...")
                result = ga4_create_key_event(creds_ga4, property_id, event_name)
                if result:
                    key_events_results.append(result)

        report["ga4"]["key_events"] = key_events_results
    else:
        click.echo("\n  Skipping GA4 (no property_id in config)")
        report["manual_steps"].append("Set ga4.property_id in config.yaml")

    # -----------------------------------------------------------------------
    # Step 2: Google Ads Conversions
    # -----------------------------------------------------------------------
    ads_config = config.get("google_ads", {})
    customer_id = ads_config.get("customer_id", "")

    if customer_id and ga4_only:
        click.echo(f"\n{'='*60}")
        click.echo("Step 2: Google Ads Conversions - SKIPPED (--ga4-only)")
        click.echo(f"{'='*60}")
        click.echo(
            "  Run later: python setup_conversions.py run --config config.yaml\n"
            "  (needs GOOGLE_ADS_DEVELOPER_TOKEN; same service-account JSON as GA4 is OK — no browser OAuth)"
        )
        report["manual_steps"].append(
            "Google Ads conversion actions: re-run `run` without --ga4-only (developer token + SA JSON or OAuth)"
        )

    if customer_id and not ga4_only:
        click.echo(f"\n{'='*60}")
        click.echo("Step 2: Google Ads Conversions")
        click.echo(f"{'='*60}")

        for line in google_ads_auth_mode_message().split("\n"):
            click.echo(f"  {line}")

        try:
            from google.ads.googleads.client import GoogleAdsClient

            ads_client_config = get_google_ads_client_config(ads_config)
            ads_client = GoogleAdsClient.load_from_dict(ads_client_config)

            # List existing
            click.echo("\n  Checking existing conversion actions...")
            existing = ads_list_conversion_actions(ads_client, customer_id)
            existing_names = {c["name"] for c in existing}
            click.echo(f"  Found {len(existing)} existing conversions")

            # Create new ones
            conversions_config = config.get("google_ads_conversions", [])
            conversions_results = []

            for conv in conversions_config:
                name = conv["name"]
                if name in existing_names:
                    # Find existing entry with send_to
                    existing_entry = next(
                        (c for c in existing if c["name"] == name), {}
                    )
                    click.echo(f"    [OK] '{name}' already exists")
                    conversions_results.append({
                        "name": name,
                        "status": "already_exists",
                        "send_to": existing_entry.get("send_to"),
                        "id": existing_entry.get("id"),
                    })
                else:
                    click.echo(f"    Creating '{name}'...")
                    result = ads_create_conversion_action(
                        ads_client, customer_id, conv
                    )
                    conversions_results.append(result)

            report["google_ads"]["customer_id"] = customer_id
            report["google_ads"]["conversions"] = conversions_results

            # Re-list to get send_to labels for newly created ones
            click.echo("\n  Fetching send_to labels...")
            updated = ads_list_conversion_actions(ads_client, customer_id)
            send_to_map = {}
            for c in updated:
                if c.get("send_to"):
                    send_to_map[c["name"]] = c["send_to"]

            report["google_ads"]["send_to_map"] = send_to_map

        except EnvironmentError as e:
            click.echo(f"\n  [ERR] {e}")
            report["google_ads"]["error"] = str(e)
            report["manual_steps"].append("Set GOOGLE_ADS_DEVELOPER_TOKEN env var")
        except ImportError:
            click.echo("\n  [ERR] google-ads package not installed")
            click.echo("    Run: pip install google-ads")
            report["google_ads"]["error"] = "google-ads not installed"
        except Exception as e:
            click.echo(f"\n  [ERR] Google Ads API error: {e}")
            report["google_ads"]["error"] = str(e)

    elif not customer_id:
        click.echo("\n  Skipping Google Ads (no customer_id in config)")
        report["manual_steps"].append("Set google_ads.customer_id in config.yaml")

    # -----------------------------------------------------------------------
    # Step 3: Link Google Ads ↔ GA4
    # -----------------------------------------------------------------------
    if property_id and customer_id:
        click.echo(f"\n{'='*60}")
        click.echo("Step 3: Link Google Ads <-> GA4")
        click.echo(f"{'='*60}")

        # Check existing links
        existing_links = ga4_list_google_ads_links(creds_ga4, property_id)
        linked_cids = {link["customer_id"] for link in existing_links}
        clean_cid = clean_customer_id(customer_id)

        if clean_cid in linked_cids:
            click.echo(f"  [OK] Link already exists (GA4 <-> AW-{clean_cid})")
            report["links"]["status"] = "already_linked"
        else:
            click.echo(f"  Creating link GA4 property {property_id} <-> AW-{clean_cid}...")
            result = ga4_create_google_ads_link(creds_ga4, property_id, customer_id)
            report["links"]["result"] = result
            if result and result.get("status") != "error":
                report["links"]["status"] = "linked"
                click.echo("  [OK] Link created successfully")
            else:
                report["links"]["status"] = "failed"

        report["links"]["existing"] = existing_links

    # -----------------------------------------------------------------------
    # Step 4: Build env vars + summary
    # -----------------------------------------------------------------------
    click.echo(f"\n{'='*60}")
    click.echo("Setup Report")
    click.echo(f"{'='*60}")

    # Determine IDs (measurement ID is from GA4 Admin -> Data streams, NOT property_id)
    ads_id = f"AW-{clean_customer_id(customer_id)}" if customer_id else "AW-XXXX"
    ga4_cfg = config.get("ga4", {})
    measurement_id = (ga4_cfg.get("measurement_id") or "").strip()
    if not measurement_id:
        measurement_id = "(set ga4.measurement_id in config.yaml — e.g. G-M8NGL90Z1R from Data streams)"

    # Try to find send_to labels
    send_to = report.get("google_ads", {}).get("send_to_map", {})
    label_contact = ""
    label_booking = ""

    for name, st in send_to.items():
        if "Contact" in name:
            label_contact = st.split("/")[-1] if "/" in st else st
        elif "Booking" in name:
            label_booking = st.split("/")[-1] if "/" in st else st

    env_vars = {
        "VITE_GOOGLE_ADS_ID": ads_id,
        "VITE_GA4_MEASUREMENT_ID": measurement_id,
        "VITE_GOOGLE_ADS_LABEL_CONTACT": label_contact or "(check Google Ads UI)",
        "VITE_GOOGLE_ADS_LABEL_BOOKING": label_booking or "(check Google Ads UI)",
    }
    report["env_vars"] = env_vars

    click.echo("\n  Environment variables to set:")
    for key, value in env_vars.items():
        click.echo(f"    {key}={value}")

    # Manual steps
    if not label_contact or not label_booking:
        report["manual_steps"].append(
            "Get conversion labels from Google Ads UI: "
            "Tools > Measurement > Conversions > click conversion > Tag setup > Use Google Tag"
        )

    report["manual_steps"].extend([
        "Verify events in GA4 DebugView (visit site with ?debug_tracking=1)",
        "Verify conversions in Google Ads > Tools > Measurement > Conversions",
        "For offline conversion import (Job Paid): upload via Google Ads API or UI",
    ])

    click.echo("\n  Manual steps remaining:")
    for i, step in enumerate(report["manual_steps"], 1):
        click.echo(f"    {i}. {step}")

    save_report(report)


@cli.command()
@click.option("--config", "config_path", required=True, help="Path to config.yaml")
def status(config_path: str):
    """Check current state of GA4 and Google Ads setup."""
    from google_auth import (
        get_ga4_credentials,
        get_google_ads_client_config,
        google_ads_auth_mode_message,
    )

    config = load_config(config_path)
    creds_ga4 = get_ga4_credentials()

    ga4_config = config.get("ga4", {})
    ads_config = config.get("google_ads", {})
    property_id = ga4_config.get("property_id", "")
    customer_id = ads_config.get("customer_id", "")

    # GA4 Status
    if property_id:
        click.echo(f"\n{'='*60}")
        click.echo("GA4 Property Status")
        click.echo(f"{'='*60}")

        try:
            prop = ga4_get_property(creds_ga4, property_id)
            click.echo(f"  Property: {prop['display_name']}")
            click.echo(f"  Timezone: {prop['time_zone']}")
        except Exception as e:
            click.echo(f"  Error: {e}")

        click.echo("\n  Key Events:")
        key_events = ga4_list_key_events(creds_ga4, property_id)
        if key_events:
            for ke in key_events:
                click.echo(f"    - {ke['event_name']} (created: {ke['create_time'][:10]})")
        else:
            click.echo("    (none found)")

        click.echo("\n  Google Ads Links:")
        links = ga4_list_google_ads_links(creds_ga4, property_id)
        if links:
            for link in links:
                click.echo(
                    f"    - AW-{link['customer_id']} "
                    f"(personalization: {link['ads_personalization_enabled']})"
                )
        else:
            click.echo("    (none found)")

    # Google Ads Status
    if customer_id:
        click.echo(f"\n{'='*60}")
        click.echo("Google Ads Conversion Actions")
        click.echo(f"{'='*60}")
        for line in google_ads_auth_mode_message().split("\n"):
            click.echo(f"  {line}")

        try:
            from google.ads.googleads.client import GoogleAdsClient

            ads_client_config = get_google_ads_client_config(ads_config)
            ads_client = GoogleAdsClient.load_from_dict(ads_client_config)
            conversions = ads_list_conversion_actions(ads_client, customer_id)

            if conversions:
                for c in conversions:
                    primary = "*" if c.get("primary_for_goal") else " "
                    send = f" -> {c['send_to']}" if c.get("send_to") else ""
                    click.echo(f"  {primary} {c['name']} ({c['type']}, {c['category']}){send}")
            else:
                click.echo("  (no enabled conversions found)")

        except Exception as e:
            click.echo(f"  Error: {e}")

    # Check for report
    if REPORT_PATH.exists():
        click.echo(f"\n  Last report: {REPORT_PATH}")
        report = json.loads(REPORT_PATH.read_text())
        click.echo(f"  Generated: {report.get('generated_at', 'unknown')}")


@cli.command("export-env")
@click.option("--config", "config_path", required=True, help="Path to config.yaml")
@click.option(
    "--output",
    "-o",
    "output_path",
    default=None,
    help="Write env fragment to this file (e.g. ../../config/frontend.env)",
)
def export_env_cmd(config_path: str, output_path: str | None):
    """
    Google Ads API: list conversion actions, map names to VITE_GOOGLE_ADS_CONV_* and print.

    Requires: GOOGLE_ADS_DEVELOPER_TOKEN. Uses same service-account JSON as GA4 when set, else OAuth.
    """
    from google_auth import get_google_ads_client_config, google_ads_auth_mode_message

    config = load_config(config_path)
    ads_config = config.get("google_ads", {})
    customer_id = ads_config.get("customer_id", "").strip()
    if not customer_id:
        click.echo("ERROR: Set google_ads.customer_id in config.yaml")
        raise SystemExit(1)

    ga4_cfg = config.get("ga4", {})
    measurement_id = (ga4_cfg.get("measurement_id") or "").strip()

    for line in google_ads_auth_mode_message().split("\n"):
        click.echo(line)
    click.echo("")

    try:
        from google.ads.googleads.client import GoogleAdsClient

        ads_client_config = get_google_ads_client_config(ads_config)
        ads_client = GoogleAdsClient.load_from_dict(ads_client_config)
        conversions = ads_list_conversion_actions(ads_client, customer_id)
    except Exception as e:
        click.echo(f"ERROR: {e}")
        raise SystemExit(1)

    awid = f"AW-{clean_customer_id(customer_id)}"
    lines = [
        "# Generated by: python setup_conversions.py export-env --config config.yaml",
        "# Paste into config/frontend.env (deploy) or tripoint-frontend/.env.production, then rebuild.",
        "",
        f"VITE_GOOGLE_ADS_ID={awid}",
    ]
    if measurement_id:
        lines.append(f"VITE_GA4_MEASUREMENT_ID={measurement_id}")
    else:
        lines.append("# VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX   # add ga4.measurement_id to config.yaml")

    lines.append("")
    lines.append("# Conversion labels (after AW-.../) — from Google Ads API")

    mapped: dict[str, str] = {}
    unmapped: list[dict] = []

    for c in conversions:
        send_to = c.get("send_to")
        label = label_from_send_to(send_to) if send_to else None
        name = c.get("name") or ""
        vk = match_conversion_name_to_vite_key(name)
        if vk and label:
            if vk not in mapped:
                mapped[vk] = label
            else:
                click.echo(
                    f"  Note: duplicate {vk} from '{name}', keeping first label {mapped[vk]}",
                    err=True,
                )
        elif not send_to or not label:
            unmapped.append({"name": name, "reason": "no send_to in tag_snippets (open in Ads UI)"})
        else:
            unmapped.append({"name": name, "send_to": send_to, "reason": "name not matched; edit export-env rules"})

    vite_order = [
        "VITE_GOOGLE_ADS_CONV_WHATSAPP",
        "VITE_GOOGLE_ADS_CONV_EMAIL",
        "VITE_GOOGLE_ADS_CONV_PHONE",
        "VITE_GOOGLE_ADS_CONV_CONTACT",
        "VITE_GOOGLE_ADS_CONV_BOOKING_AVAILABILITY",
        "VITE_GOOGLE_ADS_CONV_BOOKING_SLOT",
        "VITE_GOOGLE_ADS_CONV_PAYMENT",
        "VITE_GOOGLE_ADS_CONV_BOOKING",
        "VITE_GOOGLE_ADS_CONV_BOOK_NOW",
    ]
    for vk in vite_order:
        if vk in mapped:
            lines.append(f"{vk}={mapped[vk]}")

    for vk, lab in sorted(mapped.items()):
        if vk not in vite_order:
            lines.append(f"{vk}={lab}")

    text = "\n".join(lines) + "\n"

    click.echo("\n" + "=" * 60)
    click.echo("Vite env fragment (Google Ads API)")
    click.echo("=" * 60 + "\n")
    click.echo(text)

    if unmapped:
        click.echo("Unmapped or missing tag (fix in Ads UI or name matching rules):\n")
        for u in unmapped:
            click.echo(f"  - {u}")

    if output_path:
        out = Path(output_path).expanduser().resolve()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        click.echo(f"Wrote: {out}\n")


if __name__ == "__main__":
    cli()
