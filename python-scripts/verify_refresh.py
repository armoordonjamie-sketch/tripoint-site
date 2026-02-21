import os
import requests
from dotenv import load_dotenv

load_dotenv()

refresh_token = os.getenv("ZOHO_MAIL_REFRESH_TOKEN")
client_id = os.getenv("ZOHO_CLIENT_ID")
client_secret = os.getenv("ZOHO_CLIENT_SECRET")
region = os.getenv("ZOHO_MAIL_REGION", "eu").lower()

if not (refresh_token and client_id and client_secret):
    print("Error: Missing credentials in .env")
    exit(1)

base_domain = "zoho.eu" if region == "eu" else "zoho.com"
token_url = f"https://accounts.{base_domain}/oauth/v2/token"

print(f"Refreshing token ({region})...")
try:
    resp = requests.post(token_url, data={
        "refresh_token": refresh_token,
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "refresh_token"
    }, timeout=10)
    
    if resp.status_code == 200:
        data = resp.json()
        new_token = data.get("access_token")
        if new_token:
            print("SUCCESS! Generated new access token.")
            print(f"Token: {new_token[:10]}...")
            
            # Verify the new token
            acc_url = f"https://mail.{base_domain}/api/accounts"
            acc_resp = requests.get(acc_url, headers={"Authorization": f"Zoho-oauthtoken {new_token}"})
            if acc_resp.status_code == 200:
                 print("Account verification successful.")
                 for acc in acc_resp.json().get("data", []):
                     print(f"Found Account: {acc.get('primaryEmailAddress')} (ID: {acc.get('accountId')})")
            else:
                 print(f"Token valid but account check failed ({acc_resp.status_code}).")
        else:
            print(f"Failed: No access token in response. Body: {data}")
    else:
        print(f"Refresh Failed ({resp.status_code}): {resp.text}")

except Exception as e:
    print(f"Error: {e}")
