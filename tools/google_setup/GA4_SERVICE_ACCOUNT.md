# Same service account for GA4 Admin API + Google Ads API

Use **one** JSON key from your Google Cloud project (`GA4_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local`).

## GA4 (403 permission denied)

1. [Google Analytics](https://analytics.google.com/) → your property.
2. **Admin** → **Property access management** → **Add users** → service account email.
3. Role **Administrator** or **Editor**.

## Google Ads API (same email)

The Google Ads Python client uses `json_key_file_path` when the env points at your key file — **no browser OAuth** for `run`, `status`, `export-env` (you still need a **developer token**).

1. **Google Ads** → **Tools** → **Setup** → **Access and security** (or **Users** / **Managers** depending on UI).
2. **Invite** the **same** service account email (e.g. `something@PROJECT.iam.gserviceaccount.com`) with access to the Ads account (at least **Standard**; **Admin** if you create resources).
3. **Google Ads API Center**: [ads.google.com/aw/apicenter](https://ads.google.com/aw/apicenter) — copy **Developer token** into env:
   ```bash
   set GOOGLE_ADS_DEVELOPER_TOKEN=your-token
   ```
4. Linking Cloud ↔ Ads: follow [Google Ads API – service accounts](https://developers.google.com/google-ads/api/docs/oauth/service-accounts) if Google asks you to link the GCP project to your Ads account.

Then:

```bash
cd tools/google_setup
python setup_conversions.py status --config config.yaml
python setup_conversions.py export-env --config config.yaml
```

If Ads calls fail with permission errors, the service account is not yet invited to that Ads customer ID or the developer token is not approved (test token only works on test accounts).

## Local paths (not committed)

- Copy `env.local.example` → `.env.local` and set `GA4_SERVICE_ACCOUNT_JSON` to the JSON path.
- Add `GOOGLE_ADS_DEVELOPER_TOKEN` to `.env.local` or your shell.
- **Never commit** the JSON key.

## Error: `NOT_ADS_USER` / "Google account (@gmail.com) ... is not associated with any Ads accounts"

The tool is using **OAuth** (`token.json`) and the Google user you signed in with **is not a user on** the Google Ads customer you’re querying (`google_ads.customer_id` in `config.yaml`).

**Fix A (recommended):** Use the **same service-account JSON as GA4** so OAuth is not used:

1. Create `tools/google_setup/.env.local` (gitignored) with:
   ```env
   GA4_SERVICE_ACCOUNT_JSON=C:/path/to/your-key.json
   GOOGLE_ADS_DEVELOPER_TOKEN=your_real_token_from_ads_api_center
   ```
2. Invite the **service account email** (`...@...iam.gserviceaccount.com`) to **Google Ads** with access to that account (see section above).
3. Run `python setup_conversions.py status --config config.yaml` — you should see `Google Ads API auth: SERVICE ACCOUNT -> ...`.

**Fix B:** Keep OAuth: invite **that Gmail** to the Google Ads account (Admin / access), or delete `tools/google_setup/token.json` and run `python setup_conversions.py auth` while logged into a Google user that **already has** access to Ads `1590217709`.

Also ensure `GOOGLE_ADS_DEVELOPER_TOKEN` is the **real** token from API Center, not the placeholder text `paste-from-ads-api-center`.

---

## When OAuth is still needed

If you **remove** the service-account path from env, the tool falls back to **`token.json`** + **`client_secret.json`** (browser login via `python setup_conversions.py auth`).
