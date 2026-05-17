import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0002"
DATE = "10 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <!-- SECTION: DIAGNOSTIC CALLOUT -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Stage 1 &ndash; On-Site Diagnostic Callout
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Diagnostic Callout &ndash; Rough Running / EML</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            2022 Mercedes Sprinter 2.1 4x4 Campervan (OM651)<br>
                            Suspected injector / wiring fault.<br>
                            Full-system diagnostic scan, live data analysis, injector deviation test,
                            wiring checks, guided fault-finding, and written diagnostic report.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;130.00</td>
                    <td style="text-align:right;">&pound;130.00</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align:right;font-size:12px;color:#6b7280;padding:4px 12px;">
                        <em>VAT (20%)</em>
                    </td>
                    <td style="text-align:right;font-size:12px;color:#6b7280;padding:4px 12px;">
                        &pound;26.00
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Vehicle Health Check</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Complimentary multi-point vehicle health check included with diagnostic visit.<br>
                            Covers all major systems: engine, transmission, brakes, suspension, electrics.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">FOC</td>
                    <td style="text-align:right;font-weight:600;color:#065f46;">FREE</td>
                </tr>

                <!-- SECTION: REPAIR ESTIMATE -->
                <tr style="background:#fefce8;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#854d0e;font-weight:700;">
                        Stage 2 &ndash; Repair Estimate (If Injector Confirmed Faulty)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Parts: Genuine Mercedes Injector for Common Rail</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. A651 070 30 87<br>
                            Genuine Mercedes-Benz fuel injector &ndash; OM651 engine.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;275.00</td>
                    <td style="text-align:right;">&pound;275.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Parts: Injector Washer</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. A611 017 00 60
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;1.10</td>
                    <td style="text-align:right;">&pound;1.10</td>
                </tr>
                <tr>
                    <td>
                        <strong>Parts: Spherical Collar</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. A001 990 26 07
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;3.25</td>
                    <td style="text-align:right;">&pound;3.25</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align:right;font-size:12px;color:#6b7280;padding:6px 12px;">
                        <em>Parts VAT (20%)</em>
                    </td>
                    <td style="text-align:right;font-size:12px;color:#6b7280;padding:6px 12px;">
                        &pound;55.87
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Labour: Injector Replacement &amp; Coding (1 hr @ &pound;85 + VAT)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Remove and replace fuel injector, perform quick test, clear faults and verify operation.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;85.00</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align:right;font-size:12px;color:#6b7280;padding:4px 12px;">
                        <em>Labour VAT (20%)</em>
                    </td>
                    <td style="text-align:right;font-size:12px;color:#6b7280;padding:4px 12px;">
                        &pound;17.00
                    </td>
                </tr>

                <!-- XENTRY BREAKDOWN -->
                <tr style="background:#f9fafb;">
                    <td colspan="4" style="padding:12px 12px 4px 24px;">
                        <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600;">XENTRY Labour Breakdown (1.0 hrs total)</span>
                        <table style="width:100%;border-collapse:collapse;margin-top:6px;margin-bottom:4px;">
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;width:80px;font-weight:600;">07-6929</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">Replace one fuel injector (after check)</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.8 H</td>
                            </tr>
                            <tr>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;font-weight:600;">54-1011</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">Perform quick test</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.2 H</td>
                            </tr>
                        </table>
                    </td>
                </tr>
"""

# Totals:
# Diagnostic callout:  120.00
# Parts (ex VAT):      279.35
# Parts VAT:            55.87
# Labour (ex VAT):      85.00
# Labour VAT:            17.00
# Total:               557.22

replacements = {
    "Service Invoice": "Repair Estimate",
    "Diagnostic visit completion": "Diagnostic &amp; Injector Replacement",
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
    "[VEHICLE_MAKE_MODEL]": "2022 Mercedes-Benz Sprinter 2.1 4x4 (OM651)",
    "[VEHICLE_REG]": "TBC",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;494.35",
    "[DISCOUNT]": "&pound;0.00",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;98.87",
    "[TOTAL]": "&pound;593.22",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;593.22",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the visit.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": """<table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <tr style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;">
            <td style="padding:10px 16px;font-size:13px;color:#0369a1;">
                <strong>Stage 1 &ndash; Diagnostic Callout (Zone B):</strong> &pound;156.00 inc. VAT<br>
                <span style="font-size:12px;color:#6b7280;">Payable on arrival. Includes vehicle health check.</span>
            </td>
        </tr>
        <tr style="background:#fefce8;border:1px solid #fde68a;">
            <td style="padding:10px 16px;font-size:13px;color:#854d0e;">
                <strong>Stage 2 &ndash; Injector Repair (if needed):</strong> &pound;437.22 inc. VAT<br>
                <span style="font-size:12px;color:#6b7280;">Only proceeds with your authorisation after diagnostic results.</span>
            </td>
        </tr>
    </table>""",
    "[NOTES]": "<p><strong>Notes:</strong> This is a two-stage estimate. Stage 1 (diagnostic) is confirmed and payable on arrival. Stage 2 (injector replacement) will only proceed with your authorisation after diagnosis. All genuine Mercedes-Benz parts carry a 2-year manufacturer warranty. Repair labour times are based on manufacturer standard times (XENTRY).</p>"
        "",
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

# Save
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
print(f"Vehicle: 2022 Sprinter 2.1 4x4 OM651")
print(f"Stage 1 (Diagnostic):     GBP156.00 inc VAT (Zone B)")
print(f"Stage 2 (Repair est.):    GBP437.22 inc VAT")
print(f"Total Estimate:           GBP593.22 inc VAT")
print(f"{'='*60}")
