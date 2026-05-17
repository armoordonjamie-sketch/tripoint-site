import base64
from pathlib import Path

INVOICE_ID = "TPD-2026-0006"
INVOICE_DATE = "3 April 2026"
DUE_DATE = "3 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr>
                    <td>
                        <strong>VOR Diagnostic Callout &ndash; Auxiliary Belt Failure</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Mercedes E-Class (W213)<br>
                            Vehicle off-road &ndash; auxiliary drive belt failure.<br>
                            Removed failed belt, cleaned all pulleys, inspected all pulleys and bearings.<br>
                            Identified alternator one-way clutch fault causing excessive belt wear.<br>
                            Fitted replacement auxiliary drive belt, performed quick test, cleared stored fault codes,
                            verified charging system output (14.5 V at battery).
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;190.00</td>
                    <td style="text-align:right;">&pound;190.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Parts: Genuine Mercedes Poly-V Belt</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Genuine Mercedes-Benz auxiliary Poly-V drive belt, fitted on-site.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;29.00</td>
                    <td style="text-align:right;">&pound;29.00</td>
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
    "[CLIENT_FULL_NAME]": "Customer",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "",
    "[SERVICE_ADDRESS]": "Featherstone Terrace Car Park\nFeatherstone Terrace, Southall UB2",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz E-Class (W213)",
    "[VEHICLE_REG]": "WF17VWD",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;219.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;43.80",
    "[TOTAL]": "&pound;262.80",
    "[AMOUNT_PAID]": "&pound;262.80",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Pay securely online via the link below, or by bank transfer.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Stripe (Mastercard &bull;&bull;&bull;&bull; 0347) &ndash; thank you!</p>',
    "[NOTES]": '<p><strong>Notes:</strong> VOR diagnostic callout and belt replacement (&pound;262.80) paid via Stripe on 3 April 2026. Invoice settled in full.</p>',
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

# Convert to PDF
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
print(f"Customer: TBC | Vehicle: E-Class W207 WF17VWD")
print(f"Subtotal:     GBP219.00")
print(f"VAT (20%):    GBP43.80")
print(f"Total:        GBP262.80")
print(f"Amount Paid:  GBP262.80 (FULLY PAID)")
print(f"Balance Due:  GBP0.00")
print(f"{'='*60}")
