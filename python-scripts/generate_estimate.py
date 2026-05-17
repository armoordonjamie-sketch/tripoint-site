import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0001"
DATE = "28 March 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr>
                    <td>
                        <strong>Parts: Genuine Mercedes NOx Sensor (Upstream of SCR Catalytic Converter)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Genuine Mercedes-Benz part.<br>
                            Includes 2-year manufacturer parts warranty.<br>
                            (Dealer cost: &pound;644.00 + VAT)
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;644.00</td>
                    <td style="text-align:right;">&pound;644.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Labour: Mobile Diagnostic Callout (1st hour)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Travel to vehicle location and first hour of labour.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;100.00</td>
                    <td style="text-align:right;">&pound;100.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Labour: Additional Time (0.6 hrs @ &pound;85/hr)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Remaining labour beyond first hour, per manufacturer standard repair times (XENTRY):
                        </span>
                    </td>
                    <td style="text-align:center;">0.6 hrs</td>
                    <td style="text-align:right;">&pound;70.83/hr</td>
                    <td style="text-align:right;">&pound;42.50</td>
                </tr>
                <tr style="background:#f9fafb;">
                    <td colspan="4" style="padding:12px 12px 4px 24px;">
                        <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600;">XENTRY Labour Breakdown (1.60 hrs total)</span>
                        <table style="width:100%;border-collapse:collapse;margin-top:6px;margin-bottom:4px;">
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;width:80px;font-weight:600;">54-0650</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">On-board power supply voltage &ndash; Maintain (when checking/testing and troubleshooting)</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.10 H</td>
                            </tr>
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;font-weight:600;">54-1011</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">Perform quick test</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.20 H</td>
                            </tr>
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;font-weight:600;">61-1144</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">Underfloor paneling, right &ndash; Remove/install</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.30 H</td>
                            </tr>
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;font-weight:600;">49-5956</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;font-weight:600;">Replace NOx sensor upstream of SCR catalytic converter</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.90 H</td>
                            </tr>
                            <tr>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;font-weight:600;">54-0992</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">Code control unit SCR (After quick test)</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.10 H</td>
                            </tr>
                        </table>
                    </td>
                </tr>
"""

replacements = {
    "Service Invoice": "Repair Estimate",
    "Diagnostic visit completion": "NOx Sensor Replacement",
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
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz E-Class (W207)",
    "[VEHICLE_REG]": "TBC",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;786.50",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;157.30",
    "[TOTAL]": "&pound;943.80",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;943.80",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the repair.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Notes:</strong> Estimate based on genuine Mercedes-Benz parts pricing and manufacturer standard repair times (1.60 hours total). Parts come with a 2-year warranty.</p>",
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

# ── Step 3: Convert to PDF via Playwright ───────────────
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
print(f"Vehicle: W207 E-Class")
print(f"Subtotal:     GBP786.50")
print(f"VAT (20%):    GBP157.30")
print(f"Total:        GBP943.80")
print(f"{'='*60}")
