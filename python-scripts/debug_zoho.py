import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("ZOHO_MAIL_ACCESS_TOKEN")
print(f"Using Token: {TOKEN[:5]}...{TOKEN[-5:] if TOKEN else 'None'}")

if not TOKEN:
    print("Error: ZOHO_MAIL_ACCESS_TOKEN is missing in .env")
    exit(1)

def get_account_id(region_domain):
    url = f"https://mail.zoho.{region_domain}/api/accounts"
    print(f"Checking {url}...")
    try:
        resp = requests.get(url, headers={"Authorization": f"Zoho-oauthtoken {TOKEN}"})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print("Success! Found accounts:")
            for acc in data.get("data", []):
                print(f"  - Email: {acc.get('incomingUserName')}")
                print(f"  - ACCOUNT ID (LUID): {acc.get('accountId')}")
                print(f"    (Use this LUID in your .env file)")
            return True
        else:
            print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Error: {e}")
    return False

# Try EU first (likely for UK)
if not get_account_id("eu"):
    print("\n--- Retrying with .com ---")
    get_account_id("com")
