"""
Google authentication helper.

Handles OAuth 2.0 for Google Ads API and service-account / OAuth for GA4 Admin API.
Stores tokens in local token.json (gitignored).
"""

import os
import json
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# Scopes needed for both GA4 Admin + Google Ads
SCOPES = [
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/adwords",
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

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("  Refreshing expired token...")
            creds.refresh(Request())
        else:
            if not CLIENT_SECRETS_PATH.exists():
                raise FileNotFoundError(
                    f"Missing {CLIENT_SECRETS_PATH}\n"
                    "Download your OAuth client credentials JSON from Google Cloud Console\n"
                    "and save it as 'client_secret.json' in tools/google_setup/"
                )
            print("  Opening browser for Google sign-in...")
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CLIENT_SECRETS_PATH), SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Save for next run
        TOKEN_PATH.write_text(creds.to_json())
        print(f"  Token saved to {TOKEN_PATH}")

    return creds


def get_google_ads_config(creds: Credentials) -> dict:
    """
    Build the config dict that google-ads client expects.
    Reads developer token from env var GOOGLE_ADS_DEVELOPER_TOKEN.
    """
    developer_token = os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN")
    if not developer_token:
        raise EnvironmentError(
            "Missing GOOGLE_ADS_DEVELOPER_TOKEN environment variable.\n"
            "Get your developer token from Google Ads API Center:\n"
            "https://ads.google.com/aw/apicenter"
        )

    config = {
        "developer_token": developer_token,
        "use_proto_plus": True,
        # OAuth credentials from our token
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "refresh_token": creds.refresh_token,
    }

    login_customer_id = os.environ.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID")
    if login_customer_id:
        config["login_customer_id"] = login_customer_id.replace("-", "")

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
