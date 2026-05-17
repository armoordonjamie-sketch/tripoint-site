import base64
from pathlib import Path

INVOICE_ID = "TPD-2026-0003"
INVOICE_DATE = "28 March 2026"
DUE_DATE = "28 March 2026"

# ── Step 2: Build HTML Invoice ──────────────────────────
TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr>
                    <td>
                        <strong>Diagnostic Callout - Standard Diagnosis</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Mercedes E-Class (RF15UPA)<br>
                            Full-system diagnostic scan, live data analysis, guided fault-finding, and written outcome report.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;100.00</td>
                    <td style="text-align:right;">&pound;100.00</td>
                </tr>
"""

replacements = {
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Due on receipt",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Bash Sesay",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "",
    "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Mercedes E-Class",
    "[VEHICLE_REG]": "RF15UPA",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;100.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;20.00",
    "[TOTAL]": "&pound;120.00",
    "[AMOUNT_PAID]": "&pound;120.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Pay securely online via the link below, or by bank transfer.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Stripe (Mastercard - 5097) - thank you!</p>',
    "[NOTES]": f'<p><strong>Notes:</strong> Standard Diagnosis (&pound;120.00) paid via Stripe (Receipt #1526-0015) on 28 March 2026. Invoice settled in full.</p>',
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}

for placeholder, value in replacements.items():
    template = template.replace(placeholder, value)

# Make logo bigger
template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
template = template.replace("max-height: 40px", "max-height: 150px")

# Save filled HTML
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

html_path = OUTPUT_DIR / f"{INVOICE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML invoice saved: {html_path}")

# ── Step 3: Convert to PDF via Playwright ───────────────
from playwright.sync_api import sync_playwright

pdf_path = OUTPUT_DIR / f"{INVOICE_ID}.pdf"
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

print(f"[OK] PDF invoice saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"INVOICE: {INVOICE_ID}")
print(f"Customer: Bash Sesay | Vehicle: E-Class RF15UPA")
print(f"Subtotal:     GBP100.00")
print(f"VAT (20%):    GBP20.00")
print(f"Total:        GBP120.00")
print(f"Amount Paid:  GBP120.00 (FULLY PAID)")
print(f"Balance Due:  GBP0.00")
print(f"{'='*60}")
