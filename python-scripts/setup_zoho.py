import os
import sys
import requests
from dotenv import load_dotenv

# Load env but we'll inspect keys directly
load_dotenv()

if len(sys.argv) < 2:
    print("Usage: python setup_zoho.py <AUTHORIZATION_CODE>")
    sys.exit(1)

AUTH_CODE = sys.argv[1]
CLIENT_ID = os.getenv("ZOHO_CLIENT_ID")
CLIENT_SECRET = os.getenv("ZOHO_CLIENT_SECRET")

print(f"Setting up Zoho for Client ID: {CLIENT_ID}")

# 1. Exchange Code for Tokens (EU Server)
token_url = "https://accounts.zoho.eu/oauth/v2/token"
params = {
    "code": AUTH_CODE,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "grant_type": "authorization_code",
    "redirect_uri": "http://localhost" # Often required even if not used for Self Client, or ignored.
                                       # For Self Client, sometimes no redirect_uri is needed or it's implied.
}

print("Exchanging code for token...")
response = requests.post(token_url, params=params)
data = response.json()

if "error" in data:
    print(f"Error (EU): {data.get('error')} - {data.get('error_description', 'No desc')}")
    # Fallback to .com
    print("Trying .com server...")
    token_url = "https://accounts.zoho.com/oauth/v2/token"
    response = requests.post(token_url, params=params)
    data = response.json()
    if "error" in data:
         print(f"Error (COM): {data}")
         sys.exit(1)

access_token = data.get("access_token")
refresh_token = data.get("refresh_token")
api_domain = data.get("api_domain", "https://www.zoho.eu") 

print(f"Success! Access Token received.")

# 2. Get Account ID
print("Fetching Account ID...")
accounts_url = f"https://mail.zoho.eu/api/accounts"
if "zoho.com" in api_domain:
    accounts_url = "https://mail.zoho.com/api/accounts"

headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}
resp = requests.get(accounts_url, headers=headers)
acc_data = resp.json()

account_id = None
email_addr = None

if resp.status_code == 200:
    for acc in acc_data.get("data", []):
        account_id = acc.get("accountId")
        email_addr = acc.get("incomingUserName")
        print(f"Found Account: {email_addr} -> ID: {account_id}")
        break
else:
    print(f"Failed to get accounts: {resp.text}")
    sys.exit(1)

# 3. Update .env file content
print("Updating .env file...")
env_path = ".env"
with open(env_path, "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith("ZOHO_MAIL_ACCESS_TOKEN="):
        new_lines.append(f"ZOHO_MAIL_ACCESS_TOKEN={access_token}\n")
    elif line.startswith("ZOHO_MAIL_ACCOUNT_ID="):
        new_lines.append(f"ZOHO_MAIL_ACCOUNT_ID={account_id}\n")
    elif line.startswith("ZOHO_REFRESH_TOKEN="):
        pass # We'll append it
    else:
        new_lines.append(line)

new_lines.append(f"ZOHO_REFRESH_TOKEN={refresh_token}\n")

with open(env_path, "w") as f:
    f.writelines(new_lines)

print("Done! .env updated. Restarting backend is recommended.")
