"""
Professional PDF invoice generator for TriPoint Diagnostics.
Generates invoices for deposit confirmation and completed job.
"""
from __future__ import annotations

import io
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("tripoint.invoice")

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

SITE_URL = os.getenv("SITE_URL", "https://tripointdiagnostics.co.uk")
LOGO_URL = f"{SITE_URL}/logo-no-text-light.png"
# Local logo path (PNG/JPG only; reportlab doesn't support SVG)
LOGO_PATH = os.getenv("INVOICE_LOGO_PATH")

COMPANY = {
    "name": "Tripoint Diagnostics Ltd",
    "reg": "Company No: 17038307",
    "address": "476 Sidcup Road, London, SE9 4HA",
    "email": "contact@tripointdiagnostics.co.uk",
    "phone": "020 8058 6095",
    "website": "https://tripointdiagnostics.co.uk",
}


def _fetch_logo_image() -> Image | None:
    """Fetch logo from URL or local path. Returns ReportLab Image or None."""
    if not HAS_REPORTLAB:
        return None
    try:
        import requests
        resp = requests.get(LOGO_URL, timeout=5)
        if resp.status_code == 200:
            img = Image(io.BytesIO(resp.content), width=40 * mm, height=40 * mm)
            return img
    except Exception as e:
        logger.debug("Could not fetch logo from URL: %s", e)
    if LOGO_PATH and Path(LOGO_PATH).exists() and LOGO_PATH.lower().endswith((".png", ".jpg", ".jpeg")):
        try:
            return Image(LOGO_PATH, width=40 * mm, height=40 * mm)
        except Exception as e:
            logger.debug("Could not load logo from path: %s", e)
    return None


def generate_invoice_pdf(
    booking: dict[str, Any],
    invoice_type: str,  # "deposit" | "completed"
    service_labels: str,
) -> bytes | None:
    """
    Generate a professional PDF invoice.
    Returns PDF bytes or None if reportlab is not installed.
    """
    if not HAS_REPORTLAB:
        logger.warning("reportlab not installed - cannot generate invoice PDF")
        return None

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )
    styles = getSampleStyleSheet()
    elements = []

    # Header: logo + company
    logo = _fetch_logo_image()
    company_para = Paragraph(
            f"<b>{COMPANY['name']}</b><br/>"
            f"{COMPANY['reg']}<br/>"
            f"{COMPANY['address']}<br/>"
            f"{COMPANY['email']} | {COMPANY['phone']}<br/>"
            f"{COMPANY['website']}",
            ParagraphStyle(name="Company", fontSize=9, leading=11),
        )
    if logo:
        header_data = [[logo, company_para]]
        header_table = Table(header_data, colWidths=[45 * mm, 130 * mm])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (1, 0), (1, 0), 0),
        ]))
        elements.append(header_table)
    else:
        elements.append(company_para)
    elements.append(Spacer(1, 8 * mm))

    # Invoice title and details
    invoice_date = datetime.now().strftime("%d %B %Y")
    booking_id = booking.get("id", "-")
    invoice_title = "DEPOSIT RECEIPT" if invoice_type == "deposit" else "INVOICE"
    elements.append(Paragraph(f"<b>{invoice_title}</b>", styles["Heading1"]))
    elements.append(Spacer(1, 2 * mm))

    info_data = [
        ["Invoice/Receipt No:", booking_id],
        ["Date:", invoice_date],
        ["Customer:", booking.get("full_name", "-")],
        ["Email:", booking.get("email", "-")],
        ["Phone:", booking.get("phone", "-")],
        ["Vehicle:", f"{booking.get('vehicle_reg') or '-'} ({booking.get('vehicle_make') or ''} {booking.get('vehicle_model') or ''})".strip() or "-"],
        ["Service:", service_labels],
    ]
    slot_start = booking.get("slot_start_iso")
    if slot_start:
        try:
            dt = datetime.fromisoformat(slot_start.replace("Z", "+00:00"))
            info_data.append(["Appointment:", dt.strftime("%A %d %B %Y, %H:%M")])
        except (ValueError, TypeError):
            pass

    info_table = Table(info_data, colWidths=[45 * mm, 130 * mm])
    info_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#6b7280")),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 10 * mm))

    # Line items
    deposit_pence = booking.get("deposit_amount") or 0
    balance_pence = booking.get("balance_due") or 0
    total_pence = booking.get("total_amount") or (deposit_pence + balance_pence)
    deposit_gbp = deposit_pence / 100
    balance_gbp = balance_pence / 100
    total_gbp = total_pence / 100

    if invoice_type == "deposit":
        line_data = [
            ["Description", "Amount"],
            [service_labels, f"£{total_gbp:.2f}"],
            ["Deposit (paid)", f"£{deposit_gbp:.2f}"],
            ["Balance due (pay on job completion)", f"£{balance_gbp:.2f}"],
        ]
    else:
        line_data = [
            ["Description", "Amount"],
            [service_labels, f"£{total_gbp:.2f}"],
            ["Deposit (paid)", f"£{deposit_gbp:.2f}"],
            ["Balance (paid)", f"£{balance_gbp:.2f}"],
        ]

    line_table = Table(line_data, colWidths=[120 * mm, 55 * mm])
    line_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f3f4f6")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#374151")),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#e5e7eb")),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#e5e7eb")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
    ]))
    elements.append(line_table)
    elements.append(Spacer(1, 8 * mm))

    # Total and status
    if invoice_type == "deposit":
        status_text = f"<b>Deposit received:</b> £{deposit_gbp:.2f}<br/>"
        status_text += f"<b>Balance due on completion:</b> £{balance_gbp:.2f}<br/>"
        status_text += f"<b>Total job value:</b> £{total_gbp:.2f}"
    else:
        status_text = f"<b>Total paid:</b> £{total_gbp:.2f}<br/>"
        status_text += "<b>Status:</b> Paid in full"

    elements.append(Paragraph(status_text, ParagraphStyle(name="Status", fontSize=10, leading=14)))
    elements.append(Spacer(1, 15 * mm))

    # Footer
    elements.append(Paragraph(
        "Thank you for choosing Tripoint Diagnostics. "
        "For questions about this invoice, contact us at contact@tripointdiagnostics.co.uk.",
        ParagraphStyle(name="Footer", fontSize=8, textColor=colors.HexColor("#9ca3af")),
    ))

    doc.build(elements)
    return buffer.getvalue()


def get_invoice_filename(booking_id: str, invoice_type: str) -> str:
    """Return a safe filename for the invoice PDF."""
    safe_id = "".join(c for c in booking_id if c.isalnum() or c in "-_")
    suffix = "deposit-receipt" if invoice_type == "deposit" else "invoice"
    return f"TriPoint-{suffix}-{safe_id}.pdf"
