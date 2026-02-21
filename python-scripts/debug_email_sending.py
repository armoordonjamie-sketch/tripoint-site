import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("ZOHO_MAIL_ACCESS_TOKEN")
ACCOUNT_ID = os.getenv("ZOHO_MAIL_ACCOUNT_ID")
FROM_EMAIL = os.getenv("ZOHO_FROM_EMAIL", "contact@tripointdiagnostics.co.uk")

print(f"Token: {TOKEN[:5]}...")
print(f"Account ID: {ACCOUNT_ID}")
print(f"From: {FROM_EMAIL}")


# 2. Fetch Account Info First to get valid "fromAddress"
def get_account_info(region):
    url = f"https://mail.zoho.{region}/api/accounts"
    print(f"\nChecking Account Info: {url} ...")
    try:
        resp = requests.get(url, headers={"Authorization": f"Zoho-oauthtoken {TOKEN}"})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            for acc in data.get("data", []):
                return acc
    except Exception as e:
        print(f"Error fetching account: {e}")
    return None

account = get_account_info("eu")
region = "eu"

if not account:
    print("Trying .com...")
    account = get_account_info("com")
    region = "com"

if not account:
    print("Could not fetch account info from EU or COM. Token might be invalid.")
    exit(1)

valid_email = account.get("incomingUserName")
valid_id = account.get("accountId")

print(f"Using Authenticated Email: {valid_email}")
print(f"Using Account ID: {valid_id}")
print(f"Region: {region}")

# 3. Try Sending
url = f"https://mail.zoho.{region}/api/accounts/{valid_id}/messages"
headers = {"Authorization": f"Zoho-oauthtoken {TOKEN}"}
data = {
    "fromAddress": valid_email, # MUST match authenticated user
    "toAddress": valid_email,
    "subject": "Test Email from Script (Verified Address)",
    "content": "Working!",
    "mailFormat": "html",
}

print(f"\nSending to {url}...")
resp = requests.post(url, headers=headers, json=data)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.text}")

