"""
Script to generate Zoho Mail access and refresh tokens.

Instructions:
1. Go to https://api-console.zoho.eu/ (or .com if your account is US/Global).
2. Click 'Self Client'.
3. In the 'Authorization Code' tab (Generate Code):
   - Scope: ZohoMail.messages.CREATE,ZohoMail.messages.READ,ZohoMail.accounts.READ
   - Time Duration: 10 minutes
   - Scope Description: Email API
   - Click 'Create'.
4. Copy the generated code.
5. Provide it to this script when prompted.
"""

import requests
import json

# Credentials provided by user
CLIENT_ID = "1000.2X1I37F742CD4ZSHSMMAR25RK6XKVL"
CLIENT_SECRET = "92d58bae892506890cf9a23666daeb2b2b13fe0a5e"
REDIRECT_URI = "https://www.google.com"  # Self Client doesn't use redirect URI heavily but sometimes requires valid URL or blank

print("\n--- Zoho Token Generator ---")
print(f"Client ID: {CLIENT_ID}")
print("----------------------------\n")

region = input("Is your Zoho account EU (.eu) or US/Global (.com)? Enter 'eu' or 'com' [default: eu]: ").strip().lower() or "eu"
base_url = f"https://accounts.zoho.{region}"
token_url = f"{base_url}/oauth/v2/token"

print(f"\n1. Go to {base_url}/developerconsole")
print("2. Click 'Self Client'")
print("3. Generate Code with Scopes: ZohoMail.messages.CREATE,ZohoMail.messages.READ,ZohoMail.accounts.READ")
auth_code = input("\nPaste the Authorization Code here: ").strip()

if not auth_code:
    print("No code provided. Exiting.")
    exit(1)

print(f"\nRequesting tokens from {token_url}...")

try:
    resp = requests.post(token_url, data={
        "code": auth_code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    })
    
    if resp.status_code == 200:
        data = resp.json()
        print("\nSUCCESS! Here are your tokens:\n")
        
        access_token = data.get("access_token")
        refresh_token = data.get("refresh_token")
        
        print(f"ZOHO_MAIL_ACCESS_TOKEN={access_token}")
        if refresh_token:
            print(f"ZOHO_MAIL_REFRESH_TOKEN={refresh_token}")
        else:
            print("(No refresh token returned - maybe you already generated one? Check console.)")
            
        print("\nUpdates needed in .env:")
        print(f"ZOHO_MAIL_ACCESS_TOKEN={access_token}")
        # Note: TriPoint code currently only uses ACCESS_TOKEN, but refresh token is needed for long-term.
        # Ideally, the app should use refresh token to get new access tokens automatically.
        # Check if api.py supports refresh token flow? No, currently just access token.
        # But let's provide both just in case.
        
    else:
        print(f"\nError {resp.status_code}: {resp.text}")
        
except Exception as e:
    print(f"\nRequest failed: {e}")
