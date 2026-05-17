import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0006"
DATE = "18 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts &amp; Equipment
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Fox EP11-H 10.36kWh Battery with Heater</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Additional Fox ESS high-voltage battery module for integration with existing system.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;2,000.00</td>
                    <td style="text-align:right;">&pound;2,000.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Fox HV Junction Box for EP Batteries</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Required junction box for connecting additional EP battery to existing HV string.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;186.00</td>
                    <td style="text-align:right;">&pound;186.00</td>
                </tr>

                <!-- LABOUR -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Installation Labour
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Installation Labour</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Supply and install battery module and junction box, integrate with existing Fox ESS system, commission and test.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;85.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Estimate",
    "Diagnostic visit completion": "Fox ESS Battery Storage &ndash; Supply &amp; Installation",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": ESTIMATE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Valid for 14 days",
    "[PAYMENT_TERMS]": "Estimate",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "ESTIMATE",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Renganaden Armoordon",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "476 Sidcup Road\nLondon, SE9 4HA\nUK",
    "[SERVICE_ADDRESS]": "476 Sidcup Road\nLondon, SE9 4HA",
    "[VEHICLE_MAKE_MODEL]": "N/A &ndash; Battery Storage Installation",
    "[VEHICLE_REG]": "N/A",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;2,271.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "0%",
    "[VAT_AMOUNT]": "&pound;0.00",
    "[TOTAL]": "&pound;2,271.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;2,271.00",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to confirm and schedule installation.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Scope of Works:</strong> Supply and install 1 &times; additional Fox ESS EP11-H battery with 1 &times; Fox HV Junction Box for integration with existing system.</p>"
        "<p style='margin-top:8px;'><strong>Notes:</strong></p>"
        "<ul style='margin:4px 0 0 16px;font-size:13px;color:#374151;'>"
        "<li>Estimate based on adding 1 &times; Fox EP11-H battery and 1 &times; Fox HV Junction Box to an existing compatible system.</li>"
        "<li>Price assumes straightforward installation using suitable existing system configuration and location.</li>"
        "<li>Any additional materials, remedial works, or unforeseen installation issues would be discussed before any extra cost is incurred.</li>"
        "<li>Estimate subject to final compatibility check and confirmation on site.</li>"
        "</ul>"
        "<p style='margin-top:10px;font-size:12px;color:#6b7280;'><em>This estimate is valid for 14 days from the date above.</em></p>",
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

# Fix labels
template = template.replace("Invoice number", "Estimate number")
template = template.replace("Invoice date", "Estimate date")

# Replace vehicle-specific labels for this non-vehicle estimate
template = template.replace("Vehicle / Reg", "Property / Ref")

# Save filled HTML
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\estimates")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

html_path = OUTPUT_DIR / f"{ESTIMATE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML estimate saved: {html_path}")

# ── Convert to PDF via Playwright ───────────────
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
print(f"Customer: Renganaden Armoordon")
print(f"Property: 476 Sidcup Road, London, SE9 4HA")
print(f"Parts:        GBP2,186.00")
print(f"Labour:       GBP85.00")
print(f"VAT (0%):     GBP0.00")
print(f"Total:        GBP2,271.00")
print(f"{'='*60}")
