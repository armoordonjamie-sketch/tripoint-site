# Google Ads + GA4 Setup CLI Tool

Programmatically creates GA4 key events, Google Ads conversion actions, and links them together for TriPoint Diagnostics.

## Prerequisites

### 1. Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable these APIs:
   - **Google Analytics Admin API** — [Enable](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com)
   - **Google Ads API** — [Enable](https://console.cloud.google.com/apis/library/googleads.googleapis.com)

### 2. OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Desktop app**
4. Download the JSON and save as `tools/google_setup/client_secret.json`

### 3. Google Ads Developer Token
1. Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Copy your developer token
3. Set environment variable:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_ADS_DEVELOPER_TOKEN = "your-token-here"

   # Linux/Mac
   export GOOGLE_ADS_DEVELOPER_TOKEN="your-token-here"
   ```

### 4. GA4 Property Access
- Your Google account must have **Editor** access on the GA4 property
- Find your Property ID in GA4: Admin → Property Settings → Property ID

### 5. Google Ads Account Access
- Your Google account must have **Admin** access on the Google Ads account
- If using a Manager (MCC) account, set `login_customer_id` in config

## Installation

```bash
cd tools/google_setup
pip install -r requirements.txt
```

## Configuration

```bash
cp config.example.yaml config.yaml
# Edit config.yaml with your IDs
```

## Usage

### Step 1: Authenticate
```bash
python setup_conversions.py auth
```
Opens a browser for Google sign-in. Saves `token.json` locally.

### Step 2: Run Setup
```bash
python setup_conversions.py run --config config.yaml
```
Creates:
- GA4 key events (submit_contact_form, confirm_booking)
- Google Ads conversion actions (Contact Form, Booking, Phone Call, Offline)
- GA4 ↔ Google Ads link

Outputs `report.json` with all IDs and env vars to set.

### Step 3: Check Status
```bash
python setup_conversions.py status --config config.yaml
```
Shows current state of GA4 key events, Google Ads conversions, and account links.

## Output: report.json

Contains:
- GA4 property info
- Google Ads conversion action resource names + IDs  
- `send_to` strings for gtag (e.g. `AW-XXXXXXX/XXXXXXXXXXX`)
- Environment variables to set in `.env`
- Manual steps remaining

## Files (gitignored)

These files are created locally and should NOT be committed:
- `client_secret.json` — OAuth credentials
- `token.json` — OAuth refresh token
- `config.yaml` — Contains account IDs
- `report.json` — Generated setup report

## Conversion Actions Created

| Name | Type | Category | Counting | Primary |
|------|------|----------|----------|---------|
| TPD - Contact Form Submit | WEBPAGE | LEAD | ONE_PER_CLICK | ★ |
| TPD - Booking Confirmed | WEBPAGE | PURCHASE | ONE_PER_CLICK | ★ |
| TPD - Phone Call Lead | WEBPAGE | LEAD | ONE_PER_CLICK | |
| TPD - Job Paid (Offline) | UPLOAD_CLICKS | PURCHASE | ONE_PER_CLICK | ★ |
