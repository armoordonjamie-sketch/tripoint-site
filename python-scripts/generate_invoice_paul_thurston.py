import base64
from pathlib import Path

INVOICE_ID = "TPD-2026-0029"
INVOICE_DATE = "18 May 2026"
DUE_DATE = "N/A"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# £135.00 ex VAT + £27.00 VAT (20%) = £162.00 inc VAT
line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Diagnostic Call-out
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Standard Mobile Diagnostic Call-out (Zone B)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Engine Management Light (EML) and limp-mode investigation following recent fuel filter change.<br>
                            Includes:<br>
                            &bull; Full multi-module XENTRY systems scan<br>
                            &bull; Live data review (fuel rail pressure, MAF, boost, injector deviations)<br>
                            &bull; Visual inspection of fuel system / induction route<br>
                            &bull; Fault diagnosis and verbal report with recommended next steps
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;135.00</td>
                    <td style="text-align:right;">&pound;135.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Standard Diagnostic (Zone B) - EML / Limp Mode",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Paid on completion",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Paul Thurston",
    "[CLIENT_EMAIL]": "paulrt2510@gmail.com",
    "[CLIENT_PHONE]": "07739 460043",
    "[BILL_TO_ADDRESS]": "15 Runnymede Road\nStanford-le-Hope\nSS17 0JY",
    "[SERVICE_ADDRESS]": "Customer workplace, RM20 3XD",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz GLA 220d",
    "[VEHICLE_REG]": "Y6 PRT",
    "[ODOMETER]": "67,000 miles (approx.)",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;135.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;27.00",
    "[TOTAL]": "&pound;162.00",
    "[AMOUNT_PAID]": "&pound;162.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full by Visa debit card &bull;&bull;&bull;&bull; 1719 on 18 May 2026 at 17:46. Thank you!</p>'
        '<p style="font-size:12px;color:#6b7280;margin-top:4px;">Stripe payment ID: pm_1TYUJSRzrswjZPkVYjfYxMbv</p>',
    "[NOTES]": "<p><strong>Visit summary:</strong> Standard mobile diagnostic call-out (Zone B) attending vehicle "
               "on-site at RM20 3XD. Vehicle presenting EML and limp-mode condition that developed a couple of miles "
               "after a recent fuel filter change. Full multi-module XENTRY scan performed, live data reviewed and "
               "fuel-system / induction route visually inspected. Findings and recommended next steps discussed with "
               "customer on-site.</p>"
               "<p style='margin-top:8px;'><strong>This invoice:</strong> Covers the standard diagnostic visit only "
               "(&pound;135.00 + VAT = &pound;162.00 inc VAT). Any follow-up parts or labour will be quoted and "
               "invoiced separately.</p>"
               "<p style='margin-top:8px;'><strong>Payment:</strong> &pound;162.00 received in full on 18 May 2026 at "
               "17:46 via Stripe (Visa debit &bull;&bull;&bull;&bull; 1719, Lloyds Bank Plc). Invoice settled.</p>",
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}

for placeholder, value in replacements.items():
    template = template.replace(placeholder, str(value))

# Make logo bigger
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
print(f"Customer: Paul Thurston")
print(f"Vehicle:  Mercedes-Benz GLA 220d (Y6 PRT) ~67k mi")
print(f"Scope:    Standard Diagnostic (Zone B) - EML / limp mode")
print(f"          after recent fuel filter change")
print(f"Subtotal:        GBP135.00")
print(f"VAT (20%):       GBP27.00")
print(f"Total:           GBP162.00")
print(f"Status:          PAID (Stripe, Visa debit ****1719, 18/05/2026 17:46)")
print(f"Payment ID:      pm_1TYUJSRzrswjZPkVYjfYxMbv")
print(f"{'='*60}")
