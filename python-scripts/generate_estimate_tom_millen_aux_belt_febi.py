import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0015"
DATE = "19 May 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Totals reconciliation ─────────────────────────────────
# Parts (inc VAT supplied by user, converted to ex VAT):
#   FEBI V-ribbed Belt Tensioner FEB177942 ... £77.26 inc  -> £64.38 ex
#   FEBI V-ribbed Belt FEB28925 .............. £10.38 inc  -> £ 8.65 ex
#   Parts subtotal ex VAT .................... £73.03
#
# Labour (XENTRY 0.9 hrs total @ £85.00/hr ex VAT):
#   13-1202  Replace V-belt (single-belt drive) .. 0.7 H
#   13-3209  Remove/install V-belt tensioner ..... 0.2 H
#   Labour subtotal ex VAT ................... £76.50
#
# Mobile callout fee ......................... WAIVED (repeat customer)
#
# Subtotal ex VAT ............................ £149.53
# VAT (20%) .................................. £ 29.91
# Total inc VAT .............................. £179.44

line_items_html = """
                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts (FEBI Bilstein - OE-quality aftermarket)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>FEBI V-ribbed Belt Tensioner</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. FEB177942<br>
                            OE-quality aftermarket auxiliary-belt tensioner assembly.
                            Supplied at &pound;77.26 inc VAT (&pound;64.38 ex VAT).
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;64.38</td>
                    <td style="text-align:right;">&pound;64.38</td>
                </tr>
                <tr>
                    <td>
                        <strong>FEBI V-ribbed Belt</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Part No. FEB28925<br>
                            OE-quality aftermarket multi-rib (poly-V) auxiliary drive belt.
                            Supplied at &pound;10.38 inc VAT (&pound;8.65 ex VAT).
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;8.65</td>
                    <td style="text-align:right;">&pound;8.65</td>
                </tr>

                <!-- LABOUR -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Labour
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Callout</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Standard mobile callout fee <strong>waived</strong> as a thank-you for repeat business.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;text-decoration:line-through;color:#9ca3af;">&pound;120.00</td>
                    <td style="text-align:right;font-weight:600;color:#065f46;">WAIVED</td>
                </tr>
                <tr>
                    <td>
                        <strong>Auxiliary Belt &amp; Tensioner Replacement</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Remove and replace auxiliary (poly-V) drive belt and belt tensioner assembly,
                            inspect pulleys, refit and verify operation. Charged at the standard hourly rate
                            of &pound;85.00 + VAT per XENTRY manufacturer times.
                        </span>
                    </td>
                    <td style="text-align:center;">0.9 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;76.50</td>
                </tr>

                <!-- XENTRY BREAKDOWN -->
                <tr style="background:#f9fafb;">
                    <td colspan="4" style="padding:12px 12px 4px 24px;">
                        <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600;">XENTRY Labour Breakdown (0.9 hrs total)</span>
                        <table style="width:100%;border-collapse:collapse;margin-top:6px;margin-bottom:4px;">
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;width:80px;font-weight:600;">13-1202</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">Replace V-belt on vehicle with single-belt drive</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.7 H</td>
                            </tr>
                            <tr>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;font-weight:600;">13-3209</td>
                                <td style="font-size:12px;color:#374151;padding:4px 8px;">Remove/install tensioning device for V-belt, replace assembly parts if necessary (V-belt removed)</td>
                                <td style="font-size:12px;color:#6b7280;padding:4px 8px;text-align:right;white-space:nowrap;">0.2 H</td>
                            </tr>
                        </table>
                    </td>
                </tr>
"""

replacements = {
    "Service Invoice": "Estimate",
    "Diagnostic visit completion": "Auxiliary Belt &amp; Tensioner Replacement (FEBI Aftermarket)",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": ESTIMATE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Valid for 30 days",
    "[PAYMENT_TERMS]": "Estimate",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "ESTIMATE",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Tom Millen (Archie's Castles &amp; Soft Play)",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "Fermain\nThe Street\nSittingbourne, Kent\nME9 8JN",
    "[SERVICE_ADDRESS]": "Fermain, The Street\nSittingbourne, ME9 8JN",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz Sprinter",
    "[VEHICLE_REG]": "KR70 PWE",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;149.53",
    "[DISCOUNT]": "Mobile callout waived (repeat customer)",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;29.91",
    "[TOTAL]": "&pound;179.44",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;179.44",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the repair.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Scope:</strong> Follow-up visit to replace the auxiliary (poly-V) drive belt and "
               "belt tensioner assembly on the Mercedes-Benz Sprinter (KR70 PWE). Pulleys will be inspected "
               "while accessible.</p>"
               "<p style='margin-top:8px;'><strong>Parts:</strong> FEBI Bilstein OE-quality aftermarket parts. "
               "FEBI is a respected German OE supplier widely used by independent specialists; their parts are "
               "manufactured to OE specification and typically come with a 2-year warranty. A Genuine "
               "Mercedes-Benz alternative is offered on estimate EST-2026-0014.</p>"
               "<p style='margin-top:8px;'><strong>Labour:</strong> 0.9 hrs total per XENTRY manufacturer times "
               "(0.7 H replace V-belt + 0.2 H tensioner R&amp;I), charged at the standard rate of &pound;85.00 + VAT "
               "per hour.</p>"
               "<p style='margin-top:8px;'><strong>Mobile callout:</strong> Standard callout fee (&pound;120.00 + VAT) "
               "<strong>waived</strong> as a thank-you for repeat business.</p>"
               "<p style='margin-top:8px;'><strong>Parts pricing note:</strong> FEBI parts priced at "
               "&pound;77.26 inc VAT (tensioner) and &pound;10.38 inc VAT (belt). Line items show ex-VAT "
               "values; total VAT shown in the totals box below.</p>"
               "<p style='margin-top:8px;'>This estimate is valid for 30 days. Final invoice will reflect actual "
               "work carried out.</p>",
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
print(f"Customer: Tom Millen (Archie's Castles & Soft Play)")
print(f"Vehicle:  Mercedes-Benz Sprinter (KR70 PWE)")
print(f"Scope:    Auxiliary belt & tensioner replacement (FEBI aftermarket)")
print(f"Parts ex VAT:    GBP73.03 (FEBI Tensioner GBP64.38 + Belt GBP8.65)")
print(f"Labour ex VAT:   GBP76.50  (0.9 hrs @ GBP85)")
print(f"Callout:         WAIVED (repeat customer)")
print(f"Subtotal ex VAT: GBP149.53")
print(f"VAT (20%):       GBP29.91")
print(f"Total inc VAT:   GBP179.44")
print(f"{'='*60}")
print(f"Compare to Genuine MB option (EST-2026-0014): GBP232.25 inc VAT")
print(f"Saving with FEBI option: GBP52.81 inc VAT")
print(f"{'='*60}")
