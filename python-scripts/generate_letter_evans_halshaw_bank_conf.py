import base64
from pathlib import Path

LETTER_ID = "TPD-BANK-CONF-2026-0015"
LETTER_DATE = "16 May 2026"
INVOICE_REF = "TPD-2026-0015"
INVOICE_DATE_TEXT = "25 April 2026"
INVOICE_AMOUNT = "&pound;1,055.41"

BANK_NAME = "Tide (ClearBank Ltd)"

OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\letters")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")
SIGNATURE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\signiture.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

signature_b64 = base64.b64encode(SIGNATURE_PATH.read_bytes()).decode()
signature_data_uri = f"data:image/png;base64,{signature_b64}"

# Inline styles mirror the service-invoice.html branding (Tailwind-ish neutrals,
# Tripoint blue #0284c7 accents, system font stack).
html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supplier Bank Account Confirmation - {LETTER_ID}</title>
    <style>
        @page {{ size: A4; margin: 20mm; }}
        * {{ box-sizing: border-box; }}
        body {{ margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 14px; line-height: 1.55; color: #374151; background: #fff; }}
        .letter {{ max-width: 210mm; margin: 0 auto; }}
        .header {{ display: table; width: 100%; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0284c7; }}
        .header-logo {{ display: table-cell; vertical-align: middle; width: 1%; }}
        .header-logo img {{ max-height: 150px; width: auto; display: block; }}
        .header-meta {{ display: table-cell; vertical-align: middle; text-align: right; }}
        .doc-title {{ font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px 0; }}
        .doc-subtitle {{ font-size: 13px; color: #6b7280; margin: 0; }}
        .company-block {{ margin-bottom: 24px; font-size: 12px; color: #6b7280; line-height: 1.6; }}
        .company-block strong {{ color: #374151; }}
        .company-block a {{ color: #0284c7; text-decoration: none; }}
        .meta-grid {{ display: table; width: 100%; margin-bottom: 28px; }}
        .meta-left, .meta-right {{ display: table-cell; width: 50%; vertical-align: top; }}
        .meta-right {{ text-align: right; }}
        .meta-label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 6px; }}
        .meta-value {{ font-size: 14px; color: #111827; line-height: 1.5; }}
        .meta-value strong {{ font-weight: 700; }}
        .section-title {{ font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 4px 0; }}
        .section-sub {{ font-size: 13px; color: #6b7280; margin: 0 0 20px 0; }}
        .body-copy p {{ margin: 0 0 12px 0; font-size: 14px; color: #374151; }}
        .details-grid {{ width: 100%; border-collapse: collapse; margin: 16px 0 24px 0; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }}
        .details-grid th {{ text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; background: #f0f9ff; border-bottom: 2px solid #bae6fd; width: 50%; }}
        .details-grid td {{ padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }}
        .details-grid tr:last-child td {{ border-bottom: none; }}
        .details-grid .k {{ color: #6b7280; width: 40%; }}
        .details-grid .v {{ color: #111827; font-weight: 600; }}
        .two-col {{ display: table; width: 100%; margin: 16px 0 24px 0; border-collapse: separate; border-spacing: 12px 0; }}
        .two-col .col {{ display: table-cell; width: 50%; vertical-align: top; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }}
        .two-col .col-title {{ padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; background: #f0f9ff; border-bottom: 2px solid #bae6fd; font-weight: 700; }}
        .two-col table {{ width: 100%; border-collapse: collapse; }}
        .two-col table td {{ padding: 8px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }}
        .two-col table tr:last-child td {{ border-bottom: none; }}
        .two-col table td.k {{ color: #6b7280; width: 40%; }}
        .two-col table td.v {{ color: #111827; font-weight: 600; }}
        .callout {{ margin: 20px 0; padding: 14px 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; font-size: 13px; color: #0c4a6e; }}
        .signoff {{ margin-top: 32px; }}
        .signoff .sig-img {{ display: block; max-height: 70px; width: auto; margin: 8px 0 -8px 0; }}
        .signoff .name {{ font-size: 14px; font-weight: 700; color: #111827; margin: 8px 0 2px 0; }}
        .signoff .role {{ font-size: 13px; color: #6b7280; }}
        .footer {{ margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; line-height: 1.6; }}
        .footer a {{ color: #0284c7; text-decoration: none; }}
    </style>
</head>
<body>
    <div class="letter">
        <div class="header">
            <div class="header-logo">
                <img src="{logo_data_uri}" alt="TriPoint Diagnostics" style="max-height:150px;">
            </div>
            <div class="header-meta">
                <h1 class="doc-title">Supplier Bank Account Confirmation</h1>
                <p class="doc-subtitle">In respect of Invoice {INVOICE_REF} ({INVOICE_AMOUNT} inc. VAT)</p>
            </div>
        </div>

        <div class="company-block">
            <strong>TriPoint Diagnostics Ltd</strong><br>
            Company No. 17038307<br>
            Registered office: 476 Sidcup Road, London, United Kingdom, SE9 4HA<br>
            <strong>VAT No.:</strong> 515 7327 92<br>
            Website: <a href="https://tripointdiagnostics.co.uk">tripointdiagnostics.co.uk</a><br>
            Email: contact@tripointdiagnostics.co.uk &nbsp;|&nbsp; Phone: <a href="tel:+442080586095">020 8058 6095</a>
        </div>

        <div class="meta-grid">
            <div class="meta-left">
                <div class="meta-label">To</div>
                <div class="meta-value">
                    <strong>Robert Sim</strong><br>
                    Aftersales Leader<br>
                    Evans Halshaw Ford Blackpool<br>
                    Vicarage Lane, Welbeck Avenue<br>
                    Blackpool, FY4 4ES
                </div>
            </div>
            <div class="meta-right">
                <div class="meta-label">Date</div>
                <div class="meta-value"><strong>{LETTER_DATE}</strong></div>
                <div style="margin-top:14px;">
                    <div class="meta-label">Reference</div>
                    <div class="meta-value"><strong>{LETTER_ID}</strong></div>
                </div>
            </div>
        </div>

        <div class="body-copy">
            <p>Dear Robert,</p>
            <p>
                Further to your request, I confirm in writing the bank account details for
                <strong>TriPoint Diagnostics Ltd</strong> for the receipt of payment in respect of the above
                invoice, and for any future payments to this account.
            </p>
        </div>

        <div class="two-col">
            <div class="col">
                <div class="col-title">Supplier details</div>
                <table>
                    <tr><td class="k">Legal name</td><td class="v">TriPoint Diagnostics Ltd</td></tr>
                    <tr><td class="k">Company No.</td><td class="v">17038307</td></tr>
                    <tr><td class="k">VAT No.</td><td class="v">515 7327 92</td></tr>
                    <tr><td class="k">Reg. office</td><td class="v">476 Sidcup Road,<br>London, SE9 4HA</td></tr>
                    <tr><td class="k">Phone</td><td class="v">020 8058 6095</td></tr>
                    <tr><td class="k">Email</td><td class="v">contact@tripointdiagnostics.co.uk</td></tr>
                </table>
            </div>
            <div class="col">
                <div class="col-title">Bank account details</div>
                <table>
                    <tr><td class="k">Account name</td><td class="v">TriPoint Diagnostics Ltd</td></tr>
                    <tr><td class="k">Sort code</td><td class="v">04-06-05</td></tr>
                    <tr><td class="k">Account no.</td><td class="v">30447065</td></tr>
                    <tr><td class="k">Bank</td><td class="v">{BANK_NAME}</td></tr>
                    <tr><td class="k">Reference</td><td class="v">{INVOICE_REF}</td></tr>
                    <tr><td class="k">Amount due</td><td class="v">{INVOICE_AMOUNT} (inc. VAT)</td></tr>
                </table>
            </div>
        </div>

        <div class="callout">
            These are the correct and only bank account details to be used by Evans Halshaw Ford Blackpool,
            and its parent group, for the settlement of TriPoint Diagnostics Ltd invoices. The details above
            match those issued on the original invoice <strong>{INVOICE_REF}</strong> dated {INVOICE_DATE_TEXT}.
        </div>

        <div class="body-copy">
            <p>
                For verification, please contact me directly on
                <strong>020 8058 6095</strong>, or by email at
                <strong>contact@tripointdiagnostics.co.uk</strong>. I am happy to confirm these details by
                telephone using a number obtained independently from our website.
            </p>
            <p>
                I would appreciate confirmation of receipt of this letter and a firm payment date for the
                outstanding invoice.
            </p>
        </div>

        <div class="signoff">
            <p style="margin:0;">Yours sincerely,</p>
            <img src="{signature_data_uri}" alt="Jamie Armoordon signature" class="sig-img">
            <p class="name">Jamie Armoordon</p>
            <p class="role">Director, TriPoint Diagnostics Ltd</p>
        </div>

        <div class="footer">
            TriPoint Diagnostics Ltd &bull; Company No. 17038307 &bull; VAT No. 515 7327 92<br>
            Registered office: 476 Sidcup Road, London, SE9 4HA &bull;
            <a href="https://tripointdiagnostics.co.uk">tripointdiagnostics.co.uk</a> &bull;
            020 8058 6095
        </div>
    </div>
</body>
</html>
"""

html_path = OUTPUT_DIR / f"{LETTER_ID}.html"
html_path.write_text(html, encoding="utf-8")
print(f"[OK] HTML saved: {html_path}")

from playwright.sync_api import sync_playwright

pdf_path = OUTPUT_DIR / f"{LETTER_ID}.pdf"
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(f"file:///{html_path.as_posix()}")
    page.pdf(
        path=str(pdf_path),
        format="A4",
        margin={"top": "20mm", "bottom": "20mm", "left": "20mm", "right": "20mm"},
        print_background=True,
    )
    browser.close()

print(f"[OK] PDF saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"LETTER:    {LETTER_ID}")
print(f"Subject:   Supplier Bank Account Confirmation")
print(f"Re:        Invoice {INVOICE_REF} ({INVOICE_AMOUNT.replace('&pound;', 'GBP')} inc VAT)")
print(f"To:        Robert Sim, Evans Halshaw Ford Blackpool")
print(f"Date:      {LETTER_DATE}")
print(f"Bank name: {BANK_NAME}  <-- update BANK_NAME in script before sending")
print(f"{'='*60}")
