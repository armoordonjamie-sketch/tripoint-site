import os
import requests
from dotenv import load_dotenv

load_dotenv()

access_token = os.getenv("ZOHO_MAIL_ACCESS_TOKEN")
if not access_token:
    print("Error: ZOHO_MAIL_ACCESS_TOKEN not found in .env")
    exit(1)

regions = {
    "eu": "https://mail.zoho.eu/api/accounts",
    "com": "https://mail.zoho.com/api/accounts",
    "in": "https://mail.zoho.in/api/accounts",
    "au": "https://mail.zoho.com.au/api/accounts", # Correction: .com.au
}

print(f"Checking account info with token: {access_token[:10]}...")

found = False
for region, url in regions.items():
    try:
        resp = requests.get(url, headers={"Authorization": f"Zoho-oauthtoken {access_token}"}, timeout=5)
        print(f"[{region.upper()}] Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print("\nSUCCESS! Found account details:")
            print(f"Region: {region}")
            
            # Print accounts found
            accounts = data.get("data", [])
            for acc in accounts:
                print(f"Account ID: {acc.get('accountId')}")
                print(f"Email: {acc.get('primaryEmailAddress')}")
                print("-" * 20)
            
            found = True
            break
        elif resp.status_code == 401:
            print(f"[{region.upper()}] Unauthorized (Token invalid for this region or expired?)")
        else:
            print(f"[{region.upper()}] Error: {resp.text[:100]}")
            
    except Exception as e:
        print(f"[{region.upper()}] Request failed: {e}")

if not found:
    print("\nCould not find valid account info. Check if token is expired (401) or region is unusual.")
