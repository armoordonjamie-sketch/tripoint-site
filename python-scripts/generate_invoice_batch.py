"""
Fix invoice numbering to align with job ledger:
  TPD-2026-0003  Tom Wilson EZS repair    £217.50  (pre-VAT)
  TPD-2026-0004  Alan Taylor AdBlue       £200.00  (pre-VAT)
  TPD-2026-0005  Bash Sesay diagnosis     £120.00  (post-VAT, £100+£20)
  TPD-2026-0010  Aaron Upane wiper stalk  £450.00  (post-VAT)
  TPD-2026-0011  David 2x coilpack        £326.00  (post-VAT)
"""
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

BANK_TPL = '<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>' \
    '<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {inv_id}</p>'


def generate(inv_id, repl, items):
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    base = {
        "[LOGO_URL]": logo_data_uri, "[DEPOSIT_CREDIT_HTML]": "", "[FOOTER_EXTRA]": "",
        "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
        "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
        "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
        "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
        "[CURRENT_YEAR]": "2026", "[LINE_ITEMS_HTML]": items,
    }
    base.update(repl)
    for k, v in base.items():
        template = template.replace(k, v)
    template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
    template = template.replace("max-height: 40px", "max-height: 150px")
    html_path = OUTPUT_DIR / f"{inv_id}.html"
    html_path.write_text(template, encoding="utf-8")
    pdf_path = OUTPUT_DIR / f"{inv_id}.pdf"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"file:///{html_path.as_posix()}")
        page.pdf(path=str(pdf_path), format="A4",
                 margin={"top": "20mm", "bottom": "20mm", "left": "20mm", "right": "20mm"},
                 print_background=True)
        browser.close()
    return pdf_path


# ═══════════════════════════════════════════════════════════
# TPD-2026-0003 — Tom Wilson EZS Repair (pre-VAT)
# ═══════════════════════════════════════════════════════════
ID = "TPD-2026-0003"
items = """
                <tr>
                    <td>
                        <strong>Follow-Up Visit &ndash; EIS Collection &amp; Repair</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            2016 Mercedes Vito W447 (DA16ZGO)<br>
                            Travel to and from customer location, collected original EIS unit from vehicle.<br>
                            Taken back to unit for bench repair. Swapped common failure points: induction coil, IR reader, reflowed main IMU/processor.
                        </span>
                    </td>
                    <td style="text-align:center;">1.5 hrs</td>
                    <td style="text-align:right;">&pound;85.00/hr</td>
                    <td style="text-align:right;">&pound;127.50</td>
                </tr>
                <tr>
                    <td>
                        <strong>Donor EIS Unit (Parts)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Donor Electronic Ignition Switch used for replacement components.<br>
                            <em>Reduced from &pound;120.00</em>
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;"><s style="color:#9ca3af;">&pound;120.00</s><br>&pound;90.00</td>
                    <td style="text-align:right;">&pound;90.00</td>
                </tr>
"""
pdf = generate(ID, {
    "[INVOICE_ID]": ID, "[INVOICE_DATE]": "7 March 2026", "[DUE_DATE]": "14 March 2026",
    "[PAYMENT_TERMS]": "Due on receipt", "[STATUS_CLASS]": "paid", "[STATUS]": "PAID",
    "[CLIENT_FULL_NAME]": "Tom Wilson", "[CLIENT_EMAIL]": "", "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "23 New Road\nHextable\nBR8 7LS",
    "[SERVICE_ADDRESS]": "23 New Road\nHextable\nBR8 7LS",
    "[VEHICLE_MAKE_MODEL]": "2016 Mercedes-Benz Vito W447", "[VEHICLE_REG]": "DA16ZGO",
    "[ODOMETER]": "-", "[JOB_ID]": ID, "[PO_NUMBER]": "-", "[TECH_NAME]": "Jamie Armoordon",
    "[SUBTOTAL]": "&pound;217.50", "[DISCOUNT]": "None",
    "[VAT_RATE]": "N/A &ndash; below VAT threshold", "[VAT_AMOUNT]": "&pound;0.00",
    "[TOTAL]": "&pound;217.50", "[AMOUNT_PAID]": "&pound;217.50", "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.", "[BANK_DETAILS]": BANK_TPL.format(inv_id=ID),
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Stripe &ndash; thank you!</p>',
    "[NOTES]": f"<p><strong>Notes:</strong> EZS/EIS repair follow-up from diagnostic visit (TPD-2026-0002). Balance of &pound;217.50 paid via Stripe 7 March 2026. Invoice settled in full.</p>",
    "[VAT_NUMBER]": "",
}, items)
print(f"[OK] {ID} — Tom Wilson (EZS Repair) — {pdf}")

# ═══════════════════════════════════════════════════════════
# TPD-2026-0004 — Alan Taylor AdBlue (pre-VAT)
# ═══════════════════════════════════════════════════════════
ID = "TPD-2026-0004"
items = """
                <tr>
                    <td>
                        <strong>Diagnostic Callout &ndash; AdBlue System Work</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Peugeot 3008 (FF-821-HW)<br>
                            Full-system diagnostic scan, AdBlue system fault investigation, guided fault-finding, repair work carried out, and written outcome report.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;200.00</td>
                    <td style="text-align:right;">&pound;200.00</td>
                </tr>
"""
pdf = generate(ID, {
    "[INVOICE_ID]": ID, "[INVOICE_DATE]": "13 March 2026", "[DUE_DATE]": "13 March 2026",
    "[PAYMENT_TERMS]": "Due on receipt", "[STATUS_CLASS]": "paid", "[STATUS]": "PAID",
    "[CLIENT_FULL_NAME]": "Alan Taylor", "[CLIENT_EMAIL]": "alanwtaylor3@gmail.com", "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "SE23 2UD", "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Peugeot 3008", "[VEHICLE_REG]": "FF-821-HW",
    "[ODOMETER]": "-", "[JOB_ID]": ID, "[PO_NUMBER]": "-", "[TECH_NAME]": "Jamie Armoordon",
    "[SUBTOTAL]": "&pound;200.00", "[DISCOUNT]": "None",
    "[VAT_RATE]": "N/A &ndash; below VAT threshold", "[VAT_AMOUNT]": "&pound;0.00",
    "[TOTAL]": "&pound;200.00", "[AMOUNT_PAID]": "&pound;200.00", "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.", "[BANK_DETAILS]": BANK_TPL.format(inv_id=ID),
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> AdBlue system diagnostic and repair work (&pound;200.00) paid 13 March 2026. Invoice settled in full.</p>",
    "[VAT_NUMBER]": "",
}, items)
print(f"[OK] {ID} — Alan Taylor (AdBlue) — {pdf}")

# ═══════════════════════════════════════════════════════════
# TPD-2026-0005 — Bash Sesay (post-VAT, £100+£20)
# ═══════════════════════════════════════════════════════════
ID = "TPD-2026-0005"
items = """
                <tr>
                    <td>
                        <strong>Diagnostic Callout &ndash; Standard Diagnosis</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Mercedes E-Class (RF15UPA)<br>
                            Full-system diagnostic scan, live data analysis, guided fault-finding, and written outcome report.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;100.00</td>
                    <td style="text-align:right;">&pound;100.00</td>
                </tr>
"""
pdf = generate(ID, {
    "[INVOICE_ID]": ID, "[INVOICE_DATE]": "28 March 2026", "[DUE_DATE]": "28 March 2026",
    "[PAYMENT_TERMS]": "Due on receipt", "[STATUS_CLASS]": "paid", "[STATUS]": "PAID",
    "[CLIENT_FULL_NAME]": "Bash Sesay", "[CLIENT_EMAIL]": "", "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "", "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Mercedes E-Class", "[VEHICLE_REG]": "RF15UPA",
    "[ODOMETER]": "-", "[JOB_ID]": ID, "[PO_NUMBER]": "-", "[TECH_NAME]": "Jamie Armoordon",
    "[SUBTOTAL]": "&pound;100.00", "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%", "[VAT_AMOUNT]": "&pound;20.00",
    "[TOTAL]": "&pound;120.00", "[AMOUNT_PAID]": "&pound;120.00", "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.", "[BANK_DETAILS]": BANK_TPL.format(inv_id=ID),
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Stripe (Mastercard - 5097) &ndash; thank you!</p>',
    "[NOTES]": f"<p><strong>Notes:</strong> Standard Diagnosis (&pound;120.00) paid via Stripe (Receipt #1526-0015) on 28 March 2026. Invoice settled in full.</p>",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}, items)
print(f"[OK] {ID} — Bash Sesay (Diagnosis) — {pdf}")

# ═══════════════════════════════════════════════════════════
# TPD-2026-0010 — Aaron Upane (post-VAT)
# ═══════════════════════════════════════════════════════════
ID = "TPD-2026-0010"
items = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Parts</td>
                </tr>
                <tr>
                    <td>
                        <strong>Steering Column Switch Assembly (Wiper Stalk)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Mercedes-Benz CLA (KM21 JUK)<br>Replacement steering column switch assembly including wiper stalk.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;254.00</td>
                    <td style="text-align:right;">&pound;254.00</td>
                </tr>
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Labour</td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Callout &amp; Installation</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Travel to customer location (Charlton, SE7), removal of old switch assembly, fitment of replacement, functional test and calibration.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;121.00</td>
                    <td style="text-align:right;">&pound;121.00</td>
                </tr>
"""
pdf = generate(ID, {
    "[INVOICE_ID]": ID, "[INVOICE_DATE]": "14 April 2026", "[DUE_DATE]": "14 April 2026",
    "[PAYMENT_TERMS]": "Due on receipt", "[STATUS_CLASS]": "paid", "[STATUS]": "PAID",
    "[CLIENT_FULL_NAME]": "Aaron Upane", "[CLIENT_EMAIL]": "anyaupane@hotmail.com", "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "Charlton\nLondon SE7", "[SERVICE_ADDRESS]": "Charlton, London SE7",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz CLA", "[VEHICLE_REG]": "KM21 JUK",
    "[ODOMETER]": "-", "[JOB_ID]": ID, "[PO_NUMBER]": "-", "[TECH_NAME]": "Jamie Armoordon",
    "[SUBTOTAL]": "&pound;375.00", "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%", "[VAT_AMOUNT]": "&pound;75.00",
    "[TOTAL]": "&pound;450.00", "[AMOUNT_PAID]": "&pound;450.00", "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.", "[BANK_DETAILS]": BANK_TPL.format(inv_id=ID),
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> &pound;30.00 deposit paid via Stripe on 13 April 2026. Remaining balance of &pound;420.00 paid 14 April 2026. Invoice settled in full.</p>",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}, items)
print(f"[OK] {ID} — Aaron Upane (Wiper Stalk) — {pdf}")

# ═══════════════════════════════════════════════════════════
# TPD-2026-0011 — David 2x Coilpack (post-VAT)
# ═══════════════════════════════════════════════════════════
ID = "TPD-2026-0011"
items = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Parts</td>
                </tr>
                <tr>
                    <td>
                        <strong>Ignition Coil (Coilpack)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Mercedes-Benz GLA 200 AMG Line Premium Plus (AD17 BJX)<br>Replacement ignition coils.</span>
                    </td>
                    <td style="text-align:center;">2</td>
                    <td style="text-align:right;">&pound;56.72</td>
                    <td style="text-align:right;">&pound;113.44</td>
                </tr>
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Labour</td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Callout &amp; Coilpack Replacement</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Travel to customer location, removal of engine cover, replacement of 2x ignition coils, post-repair functional check &amp; fault code clearing.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;158.23</td>
                    <td style="text-align:right;">&pound;158.23</td>
                </tr>
"""
pdf = generate(ID, {
    "[INVOICE_ID]": ID, "[INVOICE_DATE]": "15 April 2026", "[DUE_DATE]": "15 April 2026",
    "[PAYMENT_TERMS]": "Due on receipt", "[STATUS_CLASS]": "paid", "[STATUS]": "PAID",
    "[CLIENT_FULL_NAME]": "David", "[CLIENT_EMAIL]": "leytonpolishcraft@gmail.com", "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "RM1 4XR", "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "2017 Mercedes-Benz GLA 200 AMG Line Premium Plus", "[VEHICLE_REG]": "AD17 BJX",
    "[ODOMETER]": "-", "[JOB_ID]": ID, "[PO_NUMBER]": "-", "[TECH_NAME]": "Jamie Armoordon",
    "[SUBTOTAL]": "&pound;271.67", "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%", "[VAT_AMOUNT]": "&pound;54.33",
    "[TOTAL]": "&pound;326.00", "[AMOUNT_PAID]": "&pound;326.00", "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.", "[BANK_DETAILS]": BANK_TPL.format(inv_id=ID),
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> Follow-up repair from diagnostic visit (TPD-2026-0009). 2x coilpack replacement completed. Payment received 15 April 2026. Invoice settled in full.</p>",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}, items)
print(f"[OK] {ID} — David (2x Coilpack) — {pdf}")

print(f"\n{'='*60}")
print("BATCH COMPLETE — 5 invoices regenerated with correct IDs")
print(f"{'='*60}")
