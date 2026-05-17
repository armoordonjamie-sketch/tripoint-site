import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0011"
DATE = "11 May 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Parts breakdown (totals £290.00 ex VAT) ─────────────
# 75.00 + 18.00 + 3.50 + 34.00 + 29.00 + 85.00 + 36.00 + 9.50 = 290.00
line_items_html = """
                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts &amp; Consumables (Genuine Mercedes &amp; OE-grade fluids)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Engine Oil 5W-30 (MB 229.52)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Fully synthetic, low-SAPS, OEM-branded oil approved to MB 229.52 spec. Priced per litre.</span>
                    </td>
                    <td style="text-align:center;">6 L</td>
                    <td style="text-align:right;">&pound;12.50 / L</td>
                    <td style="text-align:right;">&pound;75.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Oil Filter Element &amp; Seal Kit</strong><br>
                        <span style="font-size:12px;color:#6b7280;">OE oil filter cartridge with new housing O-rings.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;18.00</td>
                    <td style="text-align:right;">&pound;18.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Sump Plug Crush Washer</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Single-use aluminium crush washer.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;3.50</td>
                    <td style="text-align:right;">&pound;3.50</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Air Filter Element</strong><br>
                        <span style="font-size:12px;color:#6b7280;">OE engine air filter for B-Class W246 diesel.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;34.00</td>
                    <td style="text-align:right;">&pound;34.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Activated-Carbon Pollen Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Cabin/pollen filter with carbon layer for odour filtration.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;29.00</td>
                    <td style="text-align:right;">&pound;29.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Diesel Fuel Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">OE in-line fuel filter element. Supplied with new O-ring seals.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;85.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Brake Fluid &ndash; DOT 4 LV (MB-approved)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Low-viscosity DOT 4 brake fluid for full system flush. Priced per litre.</span>
                    </td>
                    <td style="text-align:center;">2 L</td>
                    <td style="text-align:right;">&pound;18.00 / L</td>
                    <td style="text-align:right;">&pound;36.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Screen Wash Concentrate</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Top-up of windscreen washer reservoir.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;9.50</td>
                    <td style="text-align:right;">&pound;9.50</td>
                </tr>

                <!-- LABOUR -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Labour
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Service Callout (includes first hour labour)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Travel to customer location, vehicle preparation, perform Mercedes-Benz Service B
                            (oil &amp; filter change, air filter, pollen filter, fuel filter, brake fluid flush),
                            ASSYST B service reset via XENTRY and post-service road test.
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
                            Service B is a 2.5 hr job. Time beyond the included first hour billed
                            at the standard hourly rate of &pound;85.00 + VAT.
                        </span>
                    </td>
                    <td style="text-align:center;">1.5 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;127.50</td>
                </tr>
"""

# ── Totals ──────────────────────────────────────────────
# Parts ex VAT:    290.00
# Labour ex VAT:   247.50  (120.00 callout + 127.50 additional)
# Subtotal:        537.50
# VAT (20%):       107.50
# Total inc VAT:   645.00

replacements = {
    "Service Invoice": "Estimate",
    "Diagnostic visit completion": "Mercedes-Benz B-Class &mdash; Service B",
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
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz B-Class (W246)",
    "[VEHICLE_REG]": "AK67 XMA",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;537.50",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;107.50",
    "[TOTAL]": "&pound;645.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;645.00",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the service.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Service scope &ndash; Mercedes-Benz Service B:</strong> engine oil &amp; filter change, "
               "engine air filter, pollen/cabin filter, fuel filter (O-ring seals included), "
               "full brake fluid flush (DOT 4 LV), screen wash top-up and ASSYST B service reset via XENTRY.</p>"
               "<p style='margin-top:8px;'><strong>Labour:</strong> 2.5 hrs total. Mobile callout includes the "
               "first hour of labour at &pound;120.00 + VAT; additional time is charged at the standard hourly rate of "
               "&pound;85.00 + VAT.</p>"
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

# Save HTML
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
print(f"Vehicle: Mercedes-Benz B-Class (W246) - AK67 XMA")
print(f"Service: Service B + Brake Fluid Flush")
print(f"Parts ex VAT:    GBP290.00")
print(f"Labour ex VAT:   GBP247.50  (1hr callout + 1.5hr @ GBP85)")
print(f"Subtotal:        GBP537.50")
print(f"VAT (20%):       GBP107.50")
print(f"Total inc VAT:   GBP645.00")
print(f"{'='*60}")
