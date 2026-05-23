import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0016"
DATE = "21 May 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Pricing notes (NOT shown on invoice) ─────────────────
# Mercedes-Benz Tonbridge trade prices ex VAT (per screenshot):
#   A000 905 85 03  Pressure Sensor ........ £60.40 -> +10% -> £66.44
#   A906 490 10 39  Pressure Line .......... £ 9.10 -> +10% -> £10.01
#   A906 490 11 39  Pressure Line .......... £11.50 -> +10% -> £12.65
#   A000 905 39 05  Temperature Sensor ..... £88.48 -> +10% -> £97.33
#   Parts subtotal ex VAT (with 10% markup) .......... £186.43
#
# Labour (XENTRY-guided repair + DPF regen):
#   1.3 hr @ £85.00/hr ex VAT .............. £110.50
#
# Mobile callout fee ......................... NOT APPLIED (repeat work)
#
# Subtotal ex VAT ............................ £296.93
# VAT (20%) .................................. £ 59.39
# Total inc VAT .............................. £356.32

line_items_html = """
                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts (Genuine Mercedes-Benz)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz DPF Differential Pressure Sensor</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. A000 905 85 03<br>
                            OE differential pressure sensor for diesel particulate filter (DPF) monitoring.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;66.44</td>
                    <td style="text-align:right;">&pound;66.44</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Pressure Line</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. A906 490 10 39<br>
                            OE DPF differential-pressure sensor hose / line.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;10.01</td>
                    <td style="text-align:right;">&pound;10.01</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Pressure Line</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. A906 490 11 39<br>
                            OE DPF differential-pressure sensor hose / line.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;12.65</td>
                    <td style="text-align:right;">&pound;12.65</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Exhaust Gas Temperature Sensor</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. A000 905 39 05<br>
                            OE exhaust-gas temperature (EGT) sensor for DPF / aftertreatment monitoring.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;97.33</td>
                    <td style="text-align:right;">&pound;97.33</td>
                </tr>

                <!-- LABOUR -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Labour
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>DPF Sensor &amp; Lines Replacement + Service Regeneration</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Remove and replace DPF differential pressure sensor, both pressure lines and the
                            exhaust gas temperature sensor. Clear stored fault codes, reset relevant
                            adaptations and perform XENTRY-guided service (forced) regeneration to verify
                            DPF function. Includes road test and post-repair quick test.
                        </span>
                    </td>
                    <td style="text-align:center;">1.3 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;110.50</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Estimate",
    "Diagnostic visit completion": "DPF Sensor &amp; Lines Replacement + Service Regeneration",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": ESTIMATE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Valid for 30 days",
    "[PAYMENT_TERMS]": "Estimate",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "ESTIMATE",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Alexandra Security Ltd",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "FAO: Bruce Dickson\nAlexandra Security Ltd\nUnit 1 Perimeter Works\nWhetsted Road\nFive Oak Green\nTonbridge, Kent\nTN12 6PZ",
    "[SERVICE_ADDRESS]": "Unit 1 Perimeter Works\nWhetsted Road, Five Oak Green\nTonbridge, Kent, TN12 6PZ",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz Sprinter 314 Chassis Long (W906, 2016)",
    "[VEHICLE_REG]": "NK17 OFR",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;296.93",
    "[DISCOUNT]": "None (no callout fee on repeat work)",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;59.39",
    "[TOTAL]": "&pound;356.32",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;356.32",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the repair.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Scope (follow-up to invoice TPD-2026-0030):</strong> Replace DPF differential "
               "pressure sensor, both DPF pressure lines and the exhaust-gas temperature (EGT) sensor on "
               "the Mercedes-Benz Sprinter 314 (NK17 OFR). Clear stored fault codes, reset relevant "
               "adaptations and perform a XENTRY-guided service (forced) regeneration to verify correct "
               "DPF operation. Includes road test and post-repair quick test.</p>"
               "<p style='margin-top:8px;'><strong>Vehicle:</strong> Mercedes-Benz Sprinter 314 Chassis Long, "
               "registration NK17 OFR, VIN <strong>WDB9061352N709852</strong>, model year 2016.</p>"
               "<p style='margin-top:8px;'><strong>Parts:</strong> Genuine Mercedes-Benz parts throughout.</p>"
               "<p style='margin-top:8px;'><strong>Labour:</strong> 1.3 hrs at the standard hourly rate of "
               "&pound;85.00 + VAT. No mobile callout fee applied on repeat work.</p>"
               "<p style='margin-top:8px;'>This estimate is valid for 30 days. Final invoice will reflect "
               "actual work carried out.</p>",
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
print(f"ESTIMATE: {ESTIMATE_ID}  (follow-up to TPD-2026-0030)")
print(f"Customer: Alexandra Security Ltd - FAO Bruce Dickson")
print(f"Vehicle:  Mercedes-Benz Sprinter 314 W906 (NK17 OFR)")
print(f"Scope:    DPF pressure sensor, lines, EGT sensor + regen")
print(f"Parts ex VAT (with 10% markup vs MB Tonbridge trade): GBP186.43")
print(f"  A000 905 85 03 Pressure Sensor (GBP60.40 +10%): GBP66.44")
print(f"  A906 490 10 39 Pressure Line   (GBP 9.10 +10%): GBP10.01")
print(f"  A906 490 11 39 Pressure Line   (GBP11.50 +10%): GBP12.65")
print(f"  A000 905 39 05 Temp Sensor     (GBP88.48 +10%): GBP97.33")
print(f"Labour ex VAT (1.3 hrs @ GBP85):                    GBP110.50")
print(f"Callout:                                            NOT APPLIED (repeat work)")
print(f"Subtotal ex VAT:                                    GBP296.93")
print(f"VAT (20%):                                          GBP59.39")
print(f"Total inc VAT:                                      GBP356.32")
print(f"{'='*60}")
