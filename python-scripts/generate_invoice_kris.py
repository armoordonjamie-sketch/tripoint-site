import base64
from pathlib import Path

INVOICE_ID = "TPD-2026-0019"
INVOICE_DATE = "28 April 2026"
DUE_DATE = "28 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Diagnostics</td>
                </tr>
                <tr>
                    <td>
                        <strong>Standard Diagnostic Callout</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Full-system diagnostic scan, live data analysis, guided fault-finding, and written outcome report.<br>
                            Gearbox warning light diagnosis (flashing wrench + gear symbol).
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;100.00</td>
                    <td style="text-align:right;">&pound;100.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Gearbox Warning Diagnosis",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Due on completion",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Kris De Meyer",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "Flat 1, 7 Hector Crescent\nCatford / Bellingham\nLondon\nSE6 1DW",
    "[SERVICE_ADDRESS]": "Flat 1, 7 Hector Crescent\nLondon SE6 1DW",
    "[VEHICLE_MAKE_MODEL]": "2009 Smart ForTwo W451",
    "[VEHICLE_REG]": "LS59 UVB",
    "[ODOMETER]": "60,300 miles",
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
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Stripe &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> Gearbox warning diagnosis completed 28 April 2026. Full diagnostic report provided.</p>"
        "<p><strong>Payment:</strong> &pound;120.00 paid securely online via Stripe on 28 April 2026 (Visa ending 5566). Invoice settled in full.</p>",
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}

template = TEMPLATE_PATH.read_text(encoding="utf-8")
for k, v in replacements.items():
    template = template.replace(k, str(v))

template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
template = template.replace("max-height: 40px", "max-height: 150px")

html_path = OUTPUT_DIR / f"{INVOICE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML saved: {html_path}")

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

print(f"[OK] PDF saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"INVOICE: {INVOICE_ID}")
print(f"Customer: Kris De Meyer")
print(f"Vehicle: 2009 Smart ForTwo W451 (LS59 UVB)")
print(f"Subtotal:     GBP100.00")
print(f"VAT (20%):    GBP20.00")
print(f"Total:        GBP120.00")
print(f"Status:       PAID (Stripe, Visa ****5566)")
print(f"{'='*60}")
