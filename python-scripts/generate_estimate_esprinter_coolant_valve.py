import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0012"
DATE = "11 May 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Line items ──────────────────────────────────────────
# Part:   coolant switchover valve £280.00 inc VAT  ->  £233.33 ex VAT
# Labour: 2.9 hrs total
#   - Callout (incl. 1 hr labour) ........ £120.00
#   - Additional 1.9 hrs @ £85.00/hr ..... £161.50
#   Labour ex VAT total .................. £281.50
# Subtotal ex VAT .......................... £514.83
# VAT (20%) ................................ £102.97
# Total inc VAT ............................ £617.80
line_items_html = """
                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts (Genuine Mercedes-Benz)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Coolant Switchover Valve</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Coolant flow control / switchover valve for eSprinter HV battery thermal management system.<br>
                            Supplied at &pound;280.00 inc VAT (&pound;233.33 ex VAT).
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;233.33</td>
                    <td style="text-align:right;">&pound;233.33</td>
                </tr>

                <!-- LABOUR -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Labour
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Callout (includes first hour labour)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Travel to customer location, vehicle preparation, system depressurisation,
                            coolant drain/refill, valve replacement, system bleed and post-repair
                            verification via XENTRY.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Additional Labour</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Coolant switchover valve replacement is a 2.9 hr job. Time beyond the included
                            first hour billed at the standard hourly rate of &pound;85.00 + VAT.
                        </span>
                    </td>
                    <td style="text-align:center;">1.9 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;161.50</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Estimate",
    "Diagnostic visit completion": "Coolant Switchover Valve Replacement",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": ESTIMATE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Valid for 30 days",
    "[PAYMENT_TERMS]": "Estimate",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "ESTIMATE",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Customer",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "",
    "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz eSprinter (W910)",
    "[VEHICLE_REG]": "TBC",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;514.83",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;102.97",
    "[TOTAL]": "&pound;617.80",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;617.80",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the repair.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Scope:</strong> Replacement of coolant switchover valve on Mercedes-Benz eSprinter (W910). "
               "Includes coolant drain &amp; refill, system bleed, fault clearing and post-repair verification via XENTRY.</p>"
               "<p style='margin-top:8px;'><strong>Labour:</strong> 2.9 hrs total. Mobile callout includes the first hour "
               "of labour at &pound;120.00 + VAT; additional time is charged at the standard hourly rate of &pound;85.00 + VAT.</p>"
               "<p style='margin-top:8px;'><strong>Parts pricing:</strong> Part priced at &pound;280.00 inc VAT "
               "(&pound;233.33 ex VAT shown above; VAT shown in totals).</p>"
               "<p style='margin-top:8px;'>This estimate is valid for 30 days. Final invoice will reflect actual work carried out.</p>",
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

# Fix labels
template = template.replace("Invoice number", "Estimate number")
template = template.replace("Invoice date", "Estimate date")

OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\estimates")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

html_path = OUTPUT_DIR / f"{ESTIMATE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML estimate saved: {html_path}")

from playwright.sync_api import sync_playwright

pdf_path = OUTPUT_DIR / f"{ESTIMATE_ID}.pdf"
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

print(f"[OK] PDF estimate saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"ESTIMATE: {ESTIMATE_ID}")
print(f"Vehicle: Mercedes-Benz eSprinter (W910)")
print(f"Scope:   Coolant Switchover Valve Replacement (2.9 hrs)")
print(f"Parts ex VAT:    GBP233.33")
print(f"Labour ex VAT:   GBP281.50  (1hr callout + 1.9hr @ GBP85)")
print(f"Subtotal:        GBP514.83")
print(f"VAT (20%):       GBP102.97")
print(f"Total inc VAT:   GBP617.80")
print(f"{'='*60}")
