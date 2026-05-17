import base64
from pathlib import Path

INVOICE_ID = "TPD-2026-0025"
INVOICE_DATE = "12 May 2026"
DUE_DATE = "N/A"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Line items ──────────────────────────────────────────
# Standard diagnostic call-out (smoke test, DPF/EGR/turbo quick test,
# rectify misaligned intake pipe, reset learnt values).
# £120.00 ex VAT + £24.00 VAT (20%) = £144.00 inc VAT
line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Diagnostic Call-out
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Standard Mobile Diagnostic Call-out</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Includes:<br>
                            &bull; EVAP / induction smoke test<br>
                            &bull; XENTRY quick test &mdash; DPF, EGR &amp; turbocharger operation check<br>
                            &bull; Rectification of misaligned intake pipe (re-seated &amp; secured)<br>
                            &bull; Reset of intake-system learnt / adaptation values<br>
                            &bull; Post-rectification verification &amp; fault clear
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Standard Diagnostic &mdash; Intake System",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Paid on completion",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Dean Eldridge",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "95 Gordon Close\nAshford\nKent\nTN24 8RG",
    "[SERVICE_ADDRESS]": "95 Gordon Close\nAshford, Kent, TN24 8RG",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz Sprinter (W907)",
    "[VEHICLE_REG]": "KP71 YCF",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;120.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;24.00",
    "[TOTAL]": "&pound;144.00",
    "[AMOUNT_PAID]": "&pound;144.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full by Visa debit card &bull;&bull;&bull;&bull; 0013 on 12 May 2026 at 19:28 &ndash; thank you!</p>'
        '<p style="font-size:12px;color:#6b7280;margin-top:4px;">Stripe payment ID: pi_3TWL2TRzrswjZPkV1GJy3qhu</p>',
    "[NOTES]": "<p><strong>Work completed:</strong> Standard diagnostic call-out. EVAP / induction smoke test "
               "performed; XENTRY quick test carried out covering DPF, EGR and turbocharger operation. "
               "Misaligned intake pipe identified, correctly re-seated and secured. Intake-system learnt / "
               "adaptation values reset via XENTRY and verified.</p>"
               "<p style='margin-top:8px;'><strong>Payment:</strong> &pound;144.00 received in full on 12 May 2026 at 19:28 "
               "via Stripe (Visa debit &bull;&bull;&bull;&bull; 0013, Barclays Bank UK PLC). Invoice settled.</p>",
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
print(f"Customer: Dean Eldridge")
print(f"Vehicle:  KP71 YCF")
print(f"Scope:    Standard Diagnostic (smoke test, DPF/EGR/turbo,")
print(f"          intake pipe rectified, adaptations reset)")
print(f"Subtotal:        GBP120.00")
print(f"VAT (20%):       GBP24.00")
print(f"Total:           GBP144.00")
print(f"Status:          PAID (Stripe, Visa debit ****0013, 12/05/2026 19:28)")
print(f"Payment ID:      pi_3TWL2TRzrswjZPkV1GJy3qhu")
print(f"{'='*60}")
