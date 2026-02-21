"""
Test script for the TriPoint Email Templates API.
Sends requests to the local (or remote) API to list, preview, and send emails using the new templates.

Usage:
    python test_email_api.py --help
    python test_email_api.py --preview
    python test_email_api.py --template 02-booking-confirmation --to jamie@example.com

Environment Variables:
    EMAIL_API_BASE: Base URL of the API (default: http://localhost:8000)
    EMAIL_API_KEY: Admin key for authentication (if required by the server)
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

import requests

# Default configuration
DEFAULT_API_BASE = "http://localhost:8000"
DEFAULT_TEMPLATE = "04-job-complete"
DEFAULT_TO_EMAIL = "jamiearmoordon7@gmail.com"

# Sample data for placeholders
SAMPLE_DATA = {
    "CLIENT_FIRST_NAME": "Jamie",
    "TECH_NAME": "Jamie",
    "CURRENT_YEAR": str(datetime.now().year),
    
    # Vehicle
    "VEHICLE_REG": "AB12 CDE",
    "VEHICLE_MAKE_MODEL": "Mercedes Sprinter 314 CDI",
    "approximate_mileage": "45,000",
    
    # Location
    "POSTCODE": "TN9 1PP",
    "ADDRESS_LINE": "123 High Street, Tonbridge, TN9 1PP",
    "MAP_LINK": "https://goo.gl/maps/example",
    
    # Booking
    "BOOKING_ID": "Bk-12345",
    "BOOKING_DATE": (datetime.now() + timedelta(days=2)).strftime("%A %d %B %Y"),
    "BOOKING_TIME_WINDOW": "09:00 - 10:00",
    "ETA_WINDOW": "09:15 - 09:45",
    "BOOKING_LINK": "https://tripointdiagnostics.co.uk/booking/view/Bk-12345",
    "ICS_LINK": "https://tripointdiagnostics.co.uk/booking/event.ics",
    
    # Service
    "SERVICE_NAME": "Diagnostic Callout (Standard)",
    
    # Reports
    "REPORT_ID": "Is-9876",
    "REPORT_SUMMARY": "Identified fault in NOX sensor 2. Cleared codes, performed regeneration. Vehicle now running correctly.",
    "REPORT_LINK": "https://tripointdiagnostics.co.uk/reports/Is-9876",
    
    # Invoicing
    "INVOICE_ID": "INV-2024-001",
    "INVOICE_TOTAL": "£120.00",
    "INVOICE_DUE_DATE": (datetime.now() + timedelta(days=7)).strftime("%d %B %Y"),
    "INVOICE_LINE_ITEMS_HTML": """
        <tr>
            <td style="padding:4px 0;color:#374151;">Diagnostic Callout</td>
            <td style="padding:4px 0;text-align:right;color:#111827;">£120.00</td>
        </tr>
    """,
    
    # Payment
    "PAYMENT_LINK": "https://stripe.com/pay/example",
    "PAYMENT_METHODS": "Card (Stripe), bank transfer",
    
    # Review
    "REVIEW_LINK": "https://g.page/r/CRdMTF53rudiEBM/review",
}


def main():
    parser = argparse.ArgumentParser(description="Test Email Templates API")
    parser.add_argument("--url", default=os.getenv("EMAIL_API_BASE", DEFAULT_API_BASE), help="API Base URL")
    parser.add_argument("--key", default=os.getenv("EMAIL_API_KEY"), help="Admin API Key")
    parser.add_argument("--template", default=DEFAULT_TEMPLATE, help="Template slug to test")
    parser.add_argument("--to", default=DEFAULT_TO_EMAIL, help="Recipient email address")
    parser.add_argument("--preview", action="store_true", help="Only preview, do not send")
    parser.add_argument("--list", action="store_true", help="List available templates")
    
    args = parser.parse_args()
    
    headers = {"Content-Type": "application/json"}
    if args.key:
        headers["X-Admin-Key"] = args.key

    # 1. List Templates
    if args.list:
        print(f"Fetching templates from {args.url}...")
        try:
            resp = requests.get(f"{args.url}/api/email/templates", headers=headers)
            resp.raise_for_status()
            templates = resp.json()
            print("\nAvailable Templates:")
            print(f"{'SLUG':<30} {'HTML':<6} {'TEXT':<6} {'SUBJECT'}")
            print("-" * 80)
            for t in templates:
                print(f"{t['slug']:<30} {'Yes' if t['has_html'] else 'No':<6} {'Yes' if t['has_text'] else 'No':<6} {t['subject']}")
            return
        except Exception as e:
            print(f"Error listing templates: {e}")
            sys.exit(1)

    # 2. Preview or Send
    endpoint = "preview" if args.preview else "send-test"
    url = f"{args.url}/api/email/{endpoint}"
    if args.preview:
        url = f"{args.url}/api/email/templates/{args.template}/preview"

    print(f"\nMode: {'PREVIEW' if args.preview else 'SEND TEST EMAIL'}")
    print(f"Template: {args.template}")
    print(f"Target: {url}")
    
    payload = {
        "data": SAMPLE_DATA,
        "template": args.template,  # Used by send-test
        "to": args.to,              # Used by send-test
    }
    
    try:
        resp = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {resp.status_code}")
        
        if resp.status_code == 200:
            result = resp.json()
            print("\nResponse Summary:")
            if "status" in result:
                print(f"  Status: {result['status']}")
            if "subject" in result:
                print(f"  Subject: {result['subject']}")
            
            missing = result.get("missing_placeholders", [])
            if missing:
                print(f"\n⚠️  MISSING PLACEHOLDERS DETECTED: {missing}")
            else:
                print("\n✅ No missing placeholders.")

            if args.preview:
                print(f"\nPreview Text Content (first 500 chars):\n{'-'*40}")
                print(result.get("text", "")[:500] + "...")
                print(f"{'-'*40}")
                print(f"HTML content length: {len(result.get('html', ''))} chars")
        else:
            print(f"Error: {resp.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
