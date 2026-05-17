import base64
from pathlib import Path

REMITTANCE_ID = "REM-2026-0001"
DATE = "27 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Subcontractor Work</td>
                </tr>
                <tr>
                    <td>
                        <strong>Subcontractor labour</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Battery replacement on Mercedes-Benz V-Class W447 K9 DDH.<br>
                            Reference: TPD-2026-0018
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;60.00</td>
                    <td style="text-align:right;">&pound;60.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Remittance Advice",
    "Diagnostic visit completion": "Payment Confirmation",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": REMITTANCE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Bank Transfer",
    "[PAYMENT_TERMS]": "Completed",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID OUT",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Harrison Watling",
    "[CLIENT_EMAIL]": "07974448022",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "11 Fletcher Road\nStaplehurst\nTN12 0LP\nUnited Kingdom",
    "[SERVICE_ADDRESS]": "Tripoint Diagnostics Ltd\n476 Sidcup Road\nLondon, SE9 4HA",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz V-Class W447",
    "[VEHICLE_REG]": "K9 DDH",
    "[ODOMETER]": "-",
    "[JOB_ID]": "TPD-2026-0018",
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Harrison Watling",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;60.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "0%",
    "[VAT_AMOUNT]": "&pound;0.00",
    "[TOTAL]": "&pound;60.00",
    "[AMOUNT_PAID]": "&pound;60.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Payment has been processed successfully.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Notes:</strong> This document serves as confirmation that TriPoint Diagnostics Ltd has processed a bank transfer of &pound;60.00 to you for the referenced subcontractor work.</p>",
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}

template = TEMPLATE_PATH.read_text(encoding="utf-8")
for k, v in replacements.items():
    template = template.replace(k, str(v))

template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
template = template.replace("max-height: 40px", "max-height: 150px")

# Alter the hardcoded labels to match a Remittance Advice
template = template.replace("Invoice number", "Remittance ref")
template = template.replace("Invoice date", "Payment date")
template = template.replace("Due date", "Payment method")
template = template.replace("Payment terms", "Payment status")
template = template.replace("Bill to", "Paid to")
template = template.replace("Service address", "Remittance from")

html_path = OUTPUT_DIR / f"{REMITTANCE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML saved: {html_path}")

from playwright.sync_api import sync_playwright

pdf_path = OUTPUT_DIR / f"{REMITTANCE_ID}.pdf"
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
print(f"REMITTANCE: {REMITTANCE_ID}")
print(f"Paid To: Harrison Watling")
print(f"Amount: GBP60.00")
print(f"Date: 27 April 2026")
print(f"Ref: TPD-2026-0018")
print(f"{'='*60}")
