"""
Google authentication helper.

- GA4 Admin API: service account JSON (GA4_SERVICE_ACCOUNT_JSON or
  GOOGLE_APPLICATION_CREDENTIALS), else OAuth.

- Google Ads API: **same** service-account JSON when set (json_key_file_path — see Google Ads
  API docs). Otherwise OAuth + developer token.

  The service account email must have access to the Google Ads account (invite it like a user).
"""

import os
import json
from pathlib import Path
from typing import Optional

# Load tools/google_setup/.env.local and .env (paths to keys; never commit)
try:
    from dotenv import load_dotenv

    _SETUP_DIR = Path(__file__).resolve().parent
    load_dotenv(_SETUP_DIR / ".env.local")
    load_dotenv(_SETUP_DIR / ".env")
except ImportError:
    pass

from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from google_auth_oauthlib.flow import InstalledAppFlow

# Scopes needed for both GA4 Admin + Google Ads
SCOPES = [
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/adwords",
]

GA4_ONLY_SCOPES = [
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/analytics.readonly",
]

TOKEN_PATH = Path(__file__).parent / "token.json"
CLIENT_SECRETS_PATH = Path(__file__).parent / "client_secret.json"


def get_oauth_credentials() -> Credentials:
    """
    Returns OAuth 2.0 credentials, refreshing or prompting login as needed.
    Requires client_secret.json in the same directory.
    """
    creds = None

    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if creds and creds.valid:
        return creds

    if creds and creds.expired and creds.refresh_token:
        try:
            print("  Refreshing expired token...")
            creds.refresh(Request())
            TOKEN_PATH.write_text(creds.to_json())
            print(f"  Token saved to {TOKEN_PATH}")
            return creds
        except RefreshError as e:
            # invalid_grant: revoked refresh token, wrong OAuth client, or clock skew
            print(f"  Stored OAuth token no longer valid ({e!s}).")
            print("  Deleting token.json — you need to sign in again.")
            try:
                TOKEN_PATH.unlink()
            except OSError:
                pass
            creds = None

    # New login
    if not CLIENT_SECRETS_PATH.exists():
        raise FileNotFoundError(
            f"Missing {CLIENT_SECRETS_PATH}\n"
            "Download your OAuth client credentials JSON from Google Cloud Console\n"
            "and save it as 'client_secret.json' in tools/google_setup/"
        )
    print("  Opening browser for Google sign-in...")
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS_PATH), SCOPES)
    creds = flow.run_local_server(port=0)
    TOKEN_PATH.write_text(creds.to_json())
    print(f"  Token saved to {TOKEN_PATH}")
    return creds


def _service_account_json_path() -> Optional[Path]:
    """Path to GA4 service account JSON if env is set and file exists."""
    for key in ("GA4_SERVICE_ACCOUNT_JSON", "GOOGLE_APPLICATION_CREDENTIALS"):
        raw = os.environ.get(key, "").strip()
        if not raw:
            continue
        p = Path(raw).expanduser()
        if p.is_file():
            return p
    return None


def google_ads_auth_mode_message() -> str:
    """Human-readable: which credentials Google Ads API will use."""
    p = _service_account_json_path()
    if p:
        return f"Google Ads API auth: SERVICE ACCOUNT -> {p}"
    tok = TOKEN_PATH.exists()
    return (
        "Google Ads API auth: OAUTH (token.json)"
        + (" [file exists]" if tok else " [missing — run: python setup_conversions.py auth]")
        + "\n  If you see NOT_ADS_USER: the signed-in Google user has no access to this Ads account."
        "\n  Fix: set GA4_SERVICE_ACCOUNT_JSON to your GCP key path (same as GA4), OR invite that Gmail to Google Ads, OR delete token.json and run auth with an Ads user."
    )


def get_ga4_credentials():
    """
    Credentials for GA4 Admin API (property, key events, Google Ads links in GA4).

    Order:
    1. Service account JSON from GA4_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS
    2. OAuth user (token.json) — same as before

    The service account **email** must be added in GA4 → Admin → Property access management
    with at least Editor (e.g. tripoint-admin@....iam.gserviceaccount.com).
    """
    path = _service_account_json_path()
    if path:
        return service_account.Credentials.from_service_account_file(
            str(path),
            scopes=GA4_ONLY_SCOPES,
        )
    return get_oauth_credentials()


def _clean_customer_id(cid: str) -> str:
    return cid.replace("-", "").strip()


def _validate_developer_token(raw: str) -> str:
    """
    Real tokens are alphanumeric-ish; placeholders break gRPC (illegal header value).
    """
    t = raw.strip()
    if not t:
        raise EnvironmentError(
            "GOOGLE_ADS_DEVELOPER_TOKEN is empty. Set it to the value from Google Ads API Center only."
        )
    low = t.lower()
    if "<" in t or ">" in t:
        raise EnvironmentError(
            "GOOGLE_ADS_DEVELOPER_TOKEN must not include < or >. "
            "Copy only the token string from https://ads.google.com/aw/apicenter — not placeholder text."
        )
    if "paste" in low or "not the word" in low or "real token" in low:
        raise EnvironmentError(
            "GOOGLE_ADS_DEVELOPER_TOKEN still looks like instructions, not your actual token. "
            "Open API Center, copy the developer token (one line, no spaces), set e.g. "
            '$env:GOOGLE_ADS_DEVELOPER_TOKEN = "AbCdEf123..."'
        )
    return t


def get_google_ads_client_config(ads_config: Optional[dict] = None) -> dict:
    """
    Build the dict for ``GoogleAdsClient.load_from_dict()``.

    1. If ``GA4_SERVICE_ACCOUNT_JSON`` / ``GOOGLE_APPLICATION_CREDENTIALS`` points to a JSON key
       (same file as GA4): use ``json_key_file_path`` — no browser OAuth.
    2. Else: OAuth via ``token.json`` + ``client_secret.json``.

    Always requires ``GOOGLE_ADS_DEVELOPER_TOKEN`` (Google Ads API Center).

    ``ads_config`` may contain ``login_customer_id`` for MCC (optional).
    """
    raw_dt = os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN")
    if not raw_dt:
        raise EnvironmentError(
            "Missing GOOGLE_ADS_DEVELOPER_TOKEN environment variable.\n"
            "Get your developer token from Google Ads API Center:\n"
            "https://ads.google.com/aw/apicenter"
        )
    developer_token = _validate_developer_token(raw_dt)

    ads_config = ads_config or {}
    path = _service_account_json_path()
    if path:
        config = {
            "developer_token": developer_token,
            "use_proto_plus": True,
            "json_key_file_path": str(path),
        }
        login = ads_config.get("login_customer_id") or os.environ.get(
            "GOOGLE_ADS_LOGIN_CUSTOMER_ID", ""
        )
        if login:
            config["login_customer_id"] = _clean_customer_id(str(login))
        return config

    creds = get_oauth_credentials()
    config = {
        "developer_token": developer_token,
        "use_proto_plus": True,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "refresh_token": creds.refresh_token,
    }

    login = ads_config.get("login_customer_id") or os.environ.get(
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID", ""
    )
    if login:
        config["login_customer_id"] = _clean_customer_id(str(login))

    return config


def run_auth_flow():
    """Interactive auth flow - called by `setup_conversions.py auth`."""
    print("\n=== Google API Authentication ===\n")

    if not CLIENT_SECRETS_PATH.exists():
        print(f"ERROR: {CLIENT_SECRETS_PATH} not found.")
        print()
        print("Steps to create it:")
        print("1. Go to https://console.cloud.google.com/apis/credentials")
        print("2. Create an OAuth 2.0 Client ID (Desktop application)")
        print("3. Download the JSON and save it as:")
        print(f"   {CLIENT_SECRETS_PATH}")
        return False

    creds = get_oauth_credentials()
    print()
    print("Authentication successful!")
    print(f"Token saved to: {TOKEN_PATH}")

    # Print the refresh token so user can set env var if needed
    if creds.refresh_token:
        print()
        print("Refresh token (for env var GOOGLE_ADS_REFRESH_TOKEN):")
        print(f"  {creds.refresh_token}")

    return True
