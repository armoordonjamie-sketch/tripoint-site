import base64
from pathlib import Path

INVOICE_ID = "TPD-2026-0027"
INVOICE_DATE = "13 May 2026"
DUE_DATE = "N/A"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Totals reconciliation ─────────────────────────────────
# Parts (list, ex VAT):
#   MB Oil 5W-30 (229.52), 12L x £10.50 ......... £126.00
#   MB Oil Filter Element & Seal Kit ............ £ 18.00
#   Sump Plug Crush Washer ...................... £  3.50
#   MB Air Filter Element ....................... £ 32.00
#   MB Diesel Fuel Filter ....................... £ 55.00
#   Screen Wash Concentrate ..................... £  6.00
#   Parts subtotal (list) ....................... £240.50
#
# Labour (standard rates, ex VAT):
#   Mobile callout (incl. 1 hr labour) .......... £120.00
#   Additional 2.5 hrs @ £85.00/hr .............. £212.50
#   Labour subtotal ............................. £332.50
#
# Parts + Labour subtotal ....................... £573.00
# Less: Service B fixed-price package adjustment  -£205.90
# Net ex VAT .................................... £367.10
# VAT (20%) ..................................... £ 73.42
# Total inc VAT ................................. £440.52   (matches Stripe)

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
                        <span style="font-size:12px;color:#6b7280;">Fully synthetic, low-SAPS, OEM-branded oil. Priced per litre.</span>
                    </td>
                    <td style="text-align:center;">12 L</td>
                    <td style="text-align:right;">&pound;10.50 / L</td>
                    <td style="text-align:right;">&pound;126.00</td>
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
                        <span style="font-size:12px;color:#6b7280;">OE engine air filter.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;32.00</td>
                    <td style="text-align:right;">&pound;32.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Diesel Fuel Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">OE in-line fuel filter element. Supplied with new O-ring seals.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;55.00</td>
                    <td style="text-align:right;">&pound;55.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Screen Wash Concentrate</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Top-up of windscreen washer reservoir.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;6.00</td>
                    <td style="text-align:right;">&pound;6.00</td>
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
                            Travel to customer location, vehicle preparation, on-site Mercedes-Benz Service B
                            (oil &amp; filter change, air filter, fuel filter, coolant &amp; screen-wash check),
                            XENTRY quick test (full multi-module fault check), full service schedule
                            (brake inspection, fluid checks, tyres, lights, wipers) and ASSYST B service
                            indicator reset.
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
                            Service B labour beyond the included first hour, billed at the standard hourly
                            rate of &pound;85.00 + VAT.
                        </span>
                    </td>
                    <td style="text-align:center;">2.5 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;212.50</td>
                </tr>

                <!-- PACKAGE ADJUSTMENT -->
                <tr style="border-top:2px solid #e5e7eb;">
                    <td colspan="3" style="text-align:right;font-weight:600;">Parts + Labour subtotal (ex VAT)</td>
                    <td style="text-align:right;font-weight:600;">&pound;573.00</td>
                </tr>
                <tr style="color:#059669;">
                    <td colspan="3" style="text-align:right;font-weight:600;">
                        Service B fixed-price package adjustment
                    </td>
                    <td style="text-align:right;font-weight:600;">-&pound;205.90</td>
                </tr>
                <tr style="border-top:2px solid #e5e7eb;">
                    <td colspan="3" style="text-align:right;font-weight:700;">Net service charge (ex VAT)</td>
                    <td style="text-align:right;font-weight:700;">&pound;367.10</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Mercedes-Benz Service B Major Service",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Paid on completion",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Gary Bingham (Creative Building Services Ltd)",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "Creative Building Services Ltd\nNursery Lodge\nPleasant Valley Lane\nME15 0BB",
    "[SERVICE_ADDRESS]": "Nursery Lodge\nPleasant Valley Lane\nME15 0BB",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz",
    "[VEHICLE_REG]": "FD68 FTX",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;367.10",
    "[DISCOUNT]": "Applied inline (Service B package, cabin filter not fitted)",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;73.42",
    "[TOTAL]": "&pound;440.52",
    "[AMOUNT_PAID]": "&pound;440.52",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full by Mastercard debit &bull;&bull;&bull;&bull; 1120 on 13 May 2026 at 18:13. Thank you!</p>'
        '<p style="font-size:12px;color:#6b7280;margin-top:4px;">Stripe payment ID: pi_3TWgLJRzrswjZPkV0AhWtZ69</p>',
    "[NOTES]": "<p><strong>Work completed today (Mercedes-Benz Service B):</strong> "
               "Engine oil &amp; genuine Mercedes oil filter replaced; air filter replaced; "
               "fuel filter replaced; screen wash topped up; coolant level checked and topped up; "
               "XENTRY quick test (full multi-module fault check); full Mercedes-Benz service schedule "
               "(brake inspection, fluid checks, tyres, lights and wipers); ASSYST B service "
               "indicator reset.</p>"
               "<p style='margin-top:8px;'><strong>Cabin filter:</strong> Not fitted on this vehicle. "
               "Cabin filter portion of the quoted package not supplied or charged.</p>"
               "<p style='margin-top:8px;'><strong>Pricing:</strong> Parts and labour itemised above at "
               "standard list rates, with the Service B fixed-price package adjustment applied inline to "
               "reach the agreed bundled service price.</p>"
               "<p style='margin-top:8px;'><strong>Payment:</strong> &pound;440.52 received in full on "
               "13 May 2026 at 18:13 via Stripe (Mastercard debit &bull;&bull;&bull;&bull; 1120, Metro Bank PLC). "
               "Invoice settled.</p>",
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
print(f"Customer: Gary Bingham (Creative Building Services Ltd)")
print(f"Vehicle:  Mercedes-Benz (FD68 FTX)")
print(f"Scope:    Service B major service (cabin filter not fitted)")
print(f"Parts (list)  ex VAT: GBP240.50 (incl. 12 L oil)")
print(f"Labour (1hr callout + 2.5hr @ 85) ex VAT: GBP332.50")
print(f"Parts + Labour subtotal: GBP573.00")
print(f"Less Service B package adjustment: -GBP205.90")
print(f"Net ex VAT:                  GBP367.10")
print(f"VAT (20%):                   GBP73.42")
print(f"Total inc VAT:               GBP440.52")
print(f"Status: PAID (Stripe, Mastercard ****1120, 13/05/2026 18:13)")
print(f"Payment ID: pi_3TWgLJRzrswjZPkV0AhWtZ69")
print(f"{'='*60}")
