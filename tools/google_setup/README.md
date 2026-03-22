# Google Ads + GA4 Setup CLI Tool

Programmatically creates GA4 key events, Google Ads conversion actions, and links them together for TriPoint Diagnostics.

## Security

**Never commit** service account JSON keys or paste private keys in chat. If a key was exposed, **delete it** in Google Cloud → IAM → Service Accounts → Keys → Add a new key → rotate.

---

## GA4 Admin API via service account (recommended for automation)

The site’s **browser tag** (`G-M8NGL90Z1R`) is unchanged. Service account auth is only for **`tools/google_setup`** (CLI) calling the **GA4 Admin API** (key events, links), so you can run `run` / `status` **without browser OAuth** for GA4 when a JSON key is configured.

### 1. Google Cloud

1. Same or linked project: enable **Google Analytics Admin API** ([enable link](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com)).
2. Use your existing service account (e.g. `tripoint-admin@….iam.gserviceaccount.com`) or create one.
3. **Keys → Add key → JSON** and download the **full** `.json` file (not a short hex string — that is not the credential file).

### 2. Grant access in GA4 (required)

In **Google Analytics** → **Admin** (gear) → **Property access management** → **Add users** → paste the **service account email** → role **Administrator** or **Editor** → Add.

Without this step, API calls return **403 permission denied**. See `GA4_SERVICE_ACCOUNT.md` in this folder.

### 3. Point the CLI at the key file

```bash
# Linux / macOS
export GA4_SERVICE_ACCOUNT_JSON="/path/to/your-service-account.json"

# Windows PowerShell
$env:GA4_SERVICE_ACCOUNT_JSON = "C:\path\to\your-service-account.json"
```

Alternatively: `GOOGLE_APPLICATION_CREDENTIALS` (same path) works the same way.

### 4. Google Ads parts still use OAuth

Creating conversion actions in **Google Ads** still needs **OAuth** (`python setup_conversions.py auth`) plus `GOOGLE_ADS_DEVELOPER_TOKEN`. Only the **GA4** steps use the service account when `GA4_SERVICE_ACCOUNT_JSON` is set.

### 5. Smoke test

```bash
cd tools/google_setup
export GA4_SERVICE_ACCOUNT_JSON="/path/to/key.json"   # or set in env
python setup_conversions.py auth-ga4 --config config.yaml
```

Should print the property display name. If it fails with permission denied, add the service account in GA4 property access (step 2 above).

---

## Prerequisites

### 1. Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable these APIs:
   - **Google Analytics Admin API** - [Enable](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com)
   - **Google Ads API** - [Enable](https://console.cloud.google.com/apis/library/googleads.googleapis.com)

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

**Google Ads (conversion actions):** OAuth — run once:

```bash
python setup_conversions.py auth
```

Opens a browser for Google sign-in. Saves `token.json` locally.

**GA4 only:** you can skip browser auth if `GA4_SERVICE_ACCOUNT_JSON` is set; verify with:

```bash
python setup_conversions.py auth-ga4 --config config.yaml
```

### Step 2: Run Setup

**GA4 only** (service account, no browser OAuth — key events + GA4↔Ads link):

```bash
python setup_conversions.py run --config config.yaml --ga4-only
```

**Full** (also Google Ads conversion actions — needs `auth` + `GOOGLE_ADS_DEVELOPER_TOKEN`):

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

### Export `VITE_*` for the website (Google Ads API)

After `auth` and `GOOGLE_ADS_DEVELOPER_TOKEN` are set, pull conversion labels from the API and print a ready-to-paste env block:

```bash
python setup_conversions.py export-env --config config.yaml
```

Write straight to your server env file (example path):

```bash
python setup_conversions.py export-env --config config.yaml -o ../../config/frontend.env
```

Names are matched by keywords (e.g. "Contact Form" -> `VITE_GOOGLE_ADS_CONV_CONTACT`). Unmapped rows are listed so you can rename in Ads or extend `match_conversion_name_to_vite_key` in `setup_conversions.py`.

## Output: report.json

Contains:
- GA4 property info
- Google Ads conversion action resource names + IDs  
- `send_to` strings for gtag (e.g. `AW-XXXXXXX/XXXXXXXXXXX`)
- Environment variables to set in `.env`
- Manual steps remaining

### OAuth `invalid_grant` / refresh fails

Your `token.json` refresh token was **revoked** or doesn’t match `client_secret.json` (e.g. OAuth client recreated in Cloud Console). The script now **deletes** `token.json` and opens the browser again when refresh fails.

Or manually: delete `tools/google_setup/token.json`, then run `python setup_conversions.py auth` again.

## Files (gitignored)

These files are created locally and should NOT be committed:
- `client_secret.json` - OAuth credentials
- `token.json` - OAuth refresh token
- `config.yaml` - Contains account IDs
- `report.json` - Generated setup report

## Conversion Actions Created

| Name | Type | Category | Counting | Primary |
|------|------|----------|----------|---------|
| TPD - Contact Form Submit | WEBPAGE | LEAD | ONE_PER_CLICK | ★ |
| TPD - Booking Confirmed | WEBPAGE | PURCHASE | ONE_PER_CLICK | ★ |
| TPD - Phone Call Lead | WEBPAGE | LEAD | ONE_PER_CLICK | |
| TPD - Job Paid (Offline) | UPLOAD_CLICKS | PURCHASE | ONE_PER_CLICK | ★ |
