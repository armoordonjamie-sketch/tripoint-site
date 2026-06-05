"""
Standalone "Should I Buy This Car?" verdict feature (validation experiment).

Self-contained FastAPI router. REUSES the site's existing infrastructure: it adds
NO new email provider and NO second Stripe integration:
  - Email transport: api._send_zoho_email (Zoho SMTP), imported lazily inside handlers
    so api.py can include this router at import time without a circular import.
  - Stripe: services.stripe_service (same STRIPE_SECRET_KEY / SITE_URL as the rest of
    the site). Helpers: create_verdict_priority_checkout_session, retrieve_checkout_session.

Endpoints (the frontend calls them under the /api proxy, e.g. POST /api/verdict/submit):
  POST /verdict/submit            Free verdict request -> emails admin + confirmation to user.
  POST /verdict/priority-session  Creates a £7 Stripe Checkout session for the Priority Verdict.
  POST /verdict/priority-confirm  Verifies the paid session server-side -> emails admin (PRIORITY)
                                  and the buyer. Called by the priority-thanks page on the
                                  Stripe success redirect.

To remove the experiment:
  1. Delete this file.
  2. Remove the `verdict_router` include in api.py.
  3. Remove the two functions marked "verdict experiment" in services/stripe_service.py.
"""
from __future__ import annotations

import html
import logging
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger("tripoint.verdict")
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/verdict", tags=["verdict"])

SITE_URL = os.getenv("SITE_URL", "https://tripointdiagnostics.co.uk")
PRIORITY_PRICE_PENCE = int(os.getenv("VERDICT_PRIORITY_PRICE_PENCE", "700"))
PRIORITY_LINK = f"{SITE_URL}/should-i-buy-this-car"

# Best-effort, in-memory dedupe so refreshing the priority-thanks page does not re-send
# the PRIORITY emails. (Lost on restart, acceptable for a low-volume experiment.)
_PROCESSED_PRIORITY_SESSIONS: set[str] = set()


def _admin_email() -> str:
    return (
        os.getenv("ADMIN_NOTIFY_EMAIL")
        or os.getenv("NOTIFY_EMAIL")
        or "contact@tripointdiagnostics.co.uk"
    )


def _send_email(**kwargs) -> bool:
    # Lazy import: api.py includes this router at import time, so importing
    # _send_zoho_email at module top-level would be circular. By request time
    # the api module is fully loaded.
    from api import _send_zoho_email

    return _send_zoho_email(**kwargs)


# ── Request models ───────────────────────────────────────────────────────────

class VerdictSubmitRequest(BaseModel):
    car: str = Field(min_length=3, max_length=2000)
    email: EmailStr
    note: str | None = Field(default=None, max_length=2000)


class PrioritySessionRequest(BaseModel):
    car: str | None = Field(default=None, max_length=2000)
    email: EmailStr | None = None
    note: str | None = Field(default=None, max_length=2000)


class PriorityConfirmRequest(BaseModel):
    session_id: str = Field(min_length=8, max_length=200)


# ── Email bodies ─────────────────────────────────────────────────────────────

def _user_confirmation_email() -> tuple[str, str]:
    """(html, text) for the free verdict confirmation. Copy is verbatim per brief."""
    text = (
        "Thanks - I've got your request. I'll personally go through the known faults for that "
        "model and mileage, check the MOT history, and sanity-check the price. You'll have your "
        "BUY / CAUTION / AVOID verdict back within 24 hours.\n\n"
        "If you've got the service history or photos of the engine bay / dashboard, just reply "
        "to this email and attach them.\n\n"
        f"Viewing sooner? The £7 Priority Verdict comes back within 3 hours: {PRIORITY_LINK}\n\n"
        "- TriPoint Diagnostics, mechanic, 10 years in the trade."
    )
    html_body = f"""\
<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;line-height:1.6">
  <h2 style="color:#0284c7;margin:0 0 12px">Your verdict on the car is on its way 🔧</h2>
  <p>Thanks, I've got your request. I'll personally go through the known faults for that model and
  mileage, check the MOT history, and sanity-check the price. You'll have your
  <strong>BUY / CAUTION / AVOID</strong> verdict back <strong>within 24 hours</strong>.</p>
  <p>If you've got the service history or photos of the engine bay / dashboard, just reply to this
  email and attach them.</p>
  <p>Viewing sooner? The <strong>£7 Priority Verdict</strong> comes back within 3 hours:<br>
  <a href="{PRIORITY_LINK}" style="color:#0284c7">{PRIORITY_LINK}</a></p>
  <p style="margin-top:24px">- TriPoint Diagnostics, mechanic, 10 years in the trade.</p>
</div>"""
    return html_body, text


def _buyer_priority_email() -> str:
    return (
        '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;'
        'color:#1f2937;line-height:1.6">'
        '<h2 style="color:#0284c7;margin:0 0 12px">Priority Verdict confirmed ⚡</h2>'
        "<p>Payment received, thank you. Your <strong>Priority Verdict</strong> is at the front "
        "of the queue and I'll have your full written, fault-by-fault report (plus the price I'd "
        "negotiate to) back to you <strong>within 3 hours</strong>.</p>"
        "<p>If you've got the service history or photos of the engine bay / dashboard, just reply "
        "and attach them.</p>"
        '<p style="margin-top:24px">- TriPoint Diagnostics, mechanic, 10 years in the trade.</p>'
        "</div>"
    )


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/submit")
async def verdict_submit(payload: VerdictSubmitRequest):
    """Free verdict request: ALWAYS notify admin, then confirm to the user."""
    car = payload.car.strip()
    note = (payload.note or "").strip()
    if not car:
        raise HTTPException(status_code=400, detail="Please paste the listing or enter the reg and price.")

    # (b) ALWAYS email admin. raise_for_status=True => an SMTP failure returns 500 so the
    # user can retry, rather than us silently losing the lead.
    note_line = f"<p><strong>Worry:</strong> {html.escape(note)}</p>" if note else ""
    admin_html = (
        "<p><strong>🆓 New FREE verdict request</strong></p>"
        f"<p><strong>Car:</strong> {html.escape(car)}<br>"
        f"<strong>Email:</strong> {html.escape(str(payload.email))}</p>"
        f"{note_line}"
    )
    _send_email(
        subject=f"🆓 Free verdict request: {car[:60]}",
        html_body=admin_html,
        to_emails=[_admin_email()],
        reply_to=str(payload.email),
        raise_for_status=True,
    )

    # (c) Confirmation to the user (best-effort, never block the lead on this).
    user_html, user_text = _user_confirmation_email()
    try:
        _send_email(
            subject="Your verdict on the car is on its way 🔧",
            html_body=user_html,
            to_emails=[str(payload.email)],
            text_body=user_text,
            reply_to="contact@tripointdiagnostics.co.uk",
        )
    except Exception as e:  # pragma: no cover
        logger.warning("verdict: user confirmation email failed: %s", e)

    return {"status": "sent"}


@router.post("/priority-session")
async def verdict_priority_session(payload: PrioritySessionRequest):
    """Create a £7 one-off Stripe Checkout session for the Priority Verdict."""
    from services.stripe_service import create_verdict_priority_checkout_session

    car = (payload.car or "").strip()
    note = (payload.note or "").strip()
    email = str(payload.email) if payload.email else None
    try:
        result = create_verdict_priority_checkout_session(
            amount_pence=PRIORITY_PRICE_PENCE,
            customer_email=email,
            car=car,
            note=note,
        )
    except Exception as e:
        logger.exception("verdict: failed to create priority checkout session: %s", e)
        raise HTTPException(status_code=502, detail="Could not start checkout. Please try again.")
    return {"checkout_url": result["url"]}


@router.post("/priority-confirm")
async def verdict_priority_confirm(payload: PriorityConfirmRequest):
    """
    Verify a Priority Verdict payment server-side (so the success page cannot be spoofed),
    then email admin (flagged PRIORITY) and the buyer. Idempotent against page refresh.
    """
    from services.stripe_service import retrieve_checkout_session

    session = retrieve_checkout_session(payload.session_id)
    if not session:
        return {"confirmed": False}

    paid = session.get("payment_status") == "paid" or session.get("status") == "complete"
    meta = session.get("metadata") or {}
    if not paid or meta.get("payment_type") != "verdict_priority":
        return {"confirmed": False}

    car = (meta.get("car") or "").strip()
    note = (meta.get("note") or "").strip()
    email = (
        (session.get("customer_details") or {}).get("email")
        or session.get("customer_email")
        or meta.get("email")
        or ""
    )

    if payload.session_id in _PROCESSED_PRIORITY_SESSIONS:
        return {"confirmed": True, "duplicate": True, "car": car}
    _PROCESSED_PRIORITY_SESSIONS.add(payload.session_id)

    # Email admin, flagged PRIORITY.
    note_line = f"<p><strong>Worry:</strong> {html.escape(note)}</p>" if note else ""
    admin_html = (
        f"<p><strong>⚡ PRIORITY verdict: PAID (£{PRIORITY_PRICE_PENCE / 100:.2f})</strong></p>"
        f"<p><strong>Car:</strong> {html.escape(car) or '-'}<br>"
        f"<strong>Email:</strong> {html.escape(email) or '-'}</p>"
        f"{note_line}"
        "<p>Turnaround target: <strong>3 hours</strong>.</p>"
    )
    try:
        _send_email(
            subject=f"⚡ PRIORITY verdict (PAID): {car[:60] or 'used car'}",
            html_body=admin_html,
            to_emails=[_admin_email()],
            reply_to=email or None,
        )
    except Exception as e:  # pragma: no cover
        logger.warning("verdict: priority admin email failed: %s", e)

    # Confirmation to the buyer (best-effort).
    if email:
        try:
            _send_email(
                subject="Your Priority Verdict is being prepared ⚡",
                html_body=_buyer_priority_email(),
                to_emails=[email],
                reply_to="contact@tripointdiagnostics.co.uk",
            )
        except Exception as e:  # pragma: no cover
            logger.warning("verdict: priority buyer email failed: %s", e)

    return {"confirmed": True, "car": car}
