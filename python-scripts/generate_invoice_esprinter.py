import base64
from pathlib import Path

INVOICE_ID = "TPD-2026-0007"
INVOICE_DATE = "11 April 2026"
DUE_DATE = "18 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

# Reuse existing live Stripe link
PAYMENT_URL = "https://buy.stripe.com/00w4gB65l7aGayg4YHaZi07"
print(f"[OK] Reusing LIVE Stripe link: {PAYMENT_URL}")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <!-- LABOUR -->
                <tr>
                    <td>
                        <strong>Service B &ndash; Mercedes-Benz eSprinter (W910)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Full Service B carried out in accordance with Mercedes-Benz and TriPoint Diagnostics procedures.<br>
                            Includes: full-system diagnostic scan (XENTRY), service reminder reset, HV battery health assessment (98% SOH),
                            tyre tread &amp; pressure check (TPMS reset), brake pad &amp; disc measurement, visual health check (VHC),
                            all fluid levels checked &amp; topped up, cabin filter replacement, key battery replacement, wiper blade inspection,
                            final quick test and written diagnostic service report. All parts and consumables are genuine Mercedes.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;85.00</td>
                </tr>

                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts &amp; Consumables (Genuine Mercedes)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Key Battery</strong> <span style="background-color:#10b981;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-left:6px;vertical-align:middle;">50% OFF</span><br>
                        <span style="font-size:12px;color:#6b7280;">Replacement key fob battery fitted during service.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;"><s style="color:#ef4444;">&pound;15.00</s><br><span style="color:#10b981;font-weight:bold;">&pound;7.50</span></td>
                    <td style="text-align:right;"><span style="color:#10b981;font-weight:bold;">&pound;7.50</span></td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes Cabin Air (Dust) Filter</strong> <span style="background-color:#10b981;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-left:6px;vertical-align:middle;">50% OFF</span><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine filter inspected for debris/blockage and replaced.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;"><s style="color:#ef4444;">&pound;39.00</s><br><span style="color:#10b981;font-weight:bold;">&pound;19.50</span></td>
                    <td style="text-align:right;"><span style="color:#10b981;font-weight:bold;">&pound;19.50</span></td>
                </tr>
                <tr>
                    <td>
                        <strong>Brake Fluid (Genuine Mercedes)</strong> <span style="background-color:#10b981;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-left:6px;vertical-align:middle;">50% OFF</span><br>
                        <span style="font-size:12px;color:#6b7280;">Full brake fluid replacement using Genuine Mercedes fluid.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;"><s style="color:#ef4444;">&pound;24.00</s><br><span style="color:#10b981;font-weight:bold;">&pound;12.00</span></td>
                    <td style="text-align:right;"><span style="color:#10b981;font-weight:bold;">&pound;12.00</span></td>
                </tr>
                <tr>
                    <td>
                        <strong>Screen Wash (Genuine Mercedes)</strong> <span style="background-color:#10b981;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-left:6px;vertical-align:middle;">50% OFF</span><br>
                        <span style="font-size:12px;color:#6b7280;">Screen wash topped up to maximum.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;"><s style="color:#ef4444;">&pound;9.00</s><br><span style="color:#10b981;font-weight:bold;">&pound;4.50</span></td>
                    <td style="text-align:right;"><span style="color:#10b981;font-weight:bold;">&pound;4.50</span></td>
                </tr>
                <tr>
                    <td>
                        <strong>Coolant Top-Up (Genuine Mercedes)</strong> <span style="background-color:#10b981;color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-left:6px;vertical-align:middle;">50% OFF</span><br>
                        <span style="font-size:12px;color:#6b7280;">Coolant checked and topped up to MAX with genuine Mercedes coolant.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;"><s style="color:#ef4444;">&pound;7.34</s><br><span style="color:#10b981;font-weight:bold;">&pound;3.67</span></td>
                    <td style="text-align:right;"><span style="color:#10b981;font-weight:bold;">&pound;3.67</span></td>
                </tr>
"""

replacements = {
    "Diagnostic visit completion": "Service B &ndash; eSprinter (W910)",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Net 7 days",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Family Action FOOD Clubs",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "07966 465611",
    "[BILL_TO_ADDRESS]": "34 Wharf Rd\nLondon N1 7GR\n\nAttn: Sylvia Barnes\nFOOD Club Co-ordinator, Greenwich",
    "[SERVICE_ADDRESS]": "Customer premises, London",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz eSprinter (W910)",
    "[VEHICLE_REG]": "YF71 SGZ",
    "[ODOMETER]": "4,421 km",
    "[JOB_ID]": "TPD-008",
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;132.17",
    "[DISCOUNT]": "Applied directly to parts",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;26.43",
    "[TOTAL]": "&pound;158.60",
    "[AMOUNT_PAID]": "&pound;158.60",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Pay securely online via the link below, or by bank transfer.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> Service B completed 10 April 2026. Full diagnostic service report with photographs, measurements and XENTRY printouts provided separately. Advisory noted: broken or missing connector for one interior light in load compartment.</p>"
        "<div style='background-color:#ecfdf5;border:1px solid #10b981;padding:12px;border-radius:6px;margin-top:12px;'>"
        "<p style='font-size:13px;color:#047857;margin:0;'><strong>Charity Discount Applied:</strong> As Family Action FOOD Clubs is a charity, TriPoint Diagnostics has applied a <strong>50% discount on all parts and consumables</strong>. The remaining 50% is subsidised by TriPoint Diagnostics.</p>"
        "</div>"
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

# Force payment section onto page 2
template = template.replace('class="payment-box"', 'class="payment-box" style="page-break-before:always;"')

# Save
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

html_path = OUTPUT_DIR / f"{INVOICE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML invoice saved: {html_path}")

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

print(f"[OK] PDF invoice saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"INVOICE: {INVOICE_ID}")
print(f"Customer: Family Action FOOD Clubs")
print(f"Vehicle: eSprinter W910 YF71 SGZ")
print(f"Labour (1hr @ 85): GBP85.00 ex VAT")
print(f"Parts:              GBP47.17 ex VAT (50% Charity Discount)")
print(f"Subtotal:           GBP132.17")
print(f"VAT (20%):          GBP26.43")
print(f"Total inc VAT:      GBP158.60")
print(f"{'='*60}")
