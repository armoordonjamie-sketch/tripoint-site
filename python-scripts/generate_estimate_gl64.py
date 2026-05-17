import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0005"
DATE = "13 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts (Genuine Mercedes &amp; Bosch)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Bosch Engine ECU (A2749000800)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Refurbished unit supplied with a 1-year warranty.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;505.00</td>
                    <td style="text-align:right;">&pound;505.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Fuel Pipe (A2740703500)</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;36.03</td>
                    <td style="text-align:right;">&pound;36.03</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Clamps</strong>
                    </td>
                    <td style="text-align:center;">2</td>
                    <td style="text-align:right;">&pound;1.74</td>
                    <td style="text-align:right;">&pound;3.48</td>
                </tr>

                <!-- LABOUR & CODING -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Labour &amp; Programming
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>ECU Virginisation, SCN Coding &amp; Installation</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Programming of replacement engine control unit to vehicle via XENTRY.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;80.00</td>
                    <td style="text-align:right;">&pound;80.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Mechanical Labour (HPFP &amp; Lines)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Replace fuel pipe, remove and reinstall high-pressure fuel pump (HPFP), replace seal if required.
                        </span>
                    </td>
                    <td style="text-align:center;">3 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;255.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Repair Estimate",
    "Diagnostic visit completion": "Engine ECU & Fuel Pipe Replacement",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": ESTIMATE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Valid for 30 days",
    "[PAYMENT_TERMS]": "Estimate",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "ESTIMATE",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Evans Halshaw Ford Blackpool",
    "[CLIENT_EMAIL]": "mark.dorrans@evanshalshaw.com",
    "[CLIENT_PHONE]": "01253 699000",
    "[BILL_TO_ADDRESS]": "FAO: Mark Dorrans, Used Car Sales Leader\nVicarage Lane, Welbeck Avenue\nBlackpool, FY4 4ES",
    "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz",
    "[VEHICLE_REG]": "GL64OJB",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;879.51",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;175.90",
    "[TOTAL]": "&pound;1055.41",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;1055.41",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the repairs.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Vehicle Owner (On Record):</strong> Harry Richards, 98 Glenhurst Avenue, Bexley, DA5 3QN (s.richards98@ntlworld.com)</p><p style='margin-top:8px;'><strong>Notes:</strong> Estimate based on refurbished Bosch ECU (1-year warranty) and genuine Mercedes-Benz mechanical parts.</p>",
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
print(f"Vehicle: GL64OJB")
print(f"Labour/Coding ex VAT: GBP335.00")
print(f"Parts ex VAT:         GBP544.51")
print(f"VAT (20%):            GBP175.90")
print(f"Total inc VAT:        GBP1055.41")
print(f"{'='*60}")
