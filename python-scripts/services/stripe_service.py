"""
Stripe Checkout session creation and webhook verification for TriPoint.
"""
from __future__ import annotations

import logging
import os
from typing import Any

import stripe
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("tripoint.stripe")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_SUCCESS_URL_BASE = os.getenv("STRIPE_SUCCESS_URL_BASE") or os.getenv("SITE_URL", "https://tripointdiagnostics.co.uk")


def _require_stripe() -> None:
    if not stripe.api_key:
        raise ValueError("STRIPE_SECRET_KEY is not configured")


def create_deposit_checkout_session(
    booking_id: str,
    token: str,
    amount_pence: int,
    customer_email: str,
    description: str,
) -> dict[str, Any]:
    """
    Create a Stripe Checkout Session for deposit payment.
    Returns the session dict with 'url' and 'id'.
    """
    _require_stripe()
    success_url = f"{STRIPE_SUCCESS_URL_BASE}/pay/{token}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{STRIPE_SUCCESS_URL_BASE}/pay/{token}"

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": amount_pence,
                    "product_data": {
                        "name": "Booking deposit",
                        "description": description,
                        "images": [],
                    },
                },
                "quantity": 1,
            }
        ],
        customer_email=customer_email,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "booking_id": booking_id,
            "token": token,
            "payment_type": "deposit",
        },
    )
    return {"id": session.id, "url": session.url}


def create_balance_checkout_session(
    booking_id: str,
    token: str,
    amount_pence: int,
    customer_email: str,
    description: str,
) -> dict[str, Any]:
    """
    Create a Stripe Checkout Session for balance payment.
    Returns the session dict with 'url' and 'id'.
    """
    _require_stripe()
    success_url = f"{STRIPE_SUCCESS_URL_BASE}/pay/{token}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{STRIPE_SUCCESS_URL_BASE}/pay/{token}"

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": amount_pence,
                    "product_data": {
                        "name": "Booking balance",
                        "description": description,
                        "images": [],
                    },
                },
                "quantity": 1,
            }
        ],
        customer_email=customer_email,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "booking_id": booking_id,
            "token": token,
            "payment_type": "balance",
        },
    )
    return {"id": session.id, "url": session.url}


# ── "Should I Buy This Car?" verdict experiment ──────────────────────────────
# Self-contained one-off charge for the £7 Priority Verdict. No booking record is
# involved, so confirmation is verified server-side via retrieve_checkout_session()
# (see routes/verdict.py) rather than the booking-coupled /webhooks/stripe handler.
# To remove the experiment, delete these two functions.

def create_verdict_priority_checkout_session(
    amount_pence: int,
    customer_email: str | None,
    car: str = "",
    note: str = "",
) -> dict[str, Any]:
    """
    Create a one-off Stripe Checkout Session for the £7 Priority Verdict.
    Carries the car details + note as metadata. Returns {'id', 'url'}.
    """
    _require_stripe()
    success_url = (
        f"{STRIPE_SUCCESS_URL_BASE}/should-i-buy-this-car/priority-thanks"
        "?session_id={CHECKOUT_SESSION_ID}"
    )
    cancel_url = f"{STRIPE_SUCCESS_URL_BASE}/should-i-buy-this-car"

    kwargs: dict[str, Any] = dict(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": amount_pence,
                    "product_data": {
                        "name": "Priority Verdict",
                        "description": (
                            "Full written used-car verdict: fault-by-fault breakdown plus a "
                            "price I'd negotiate to, back within 3 hours."
                        ),
                    },
                },
                "quantity": 1,
            }
        ],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "payment_type": "verdict_priority",
            "car": (car or "")[:480],
            "note": (note or "")[:480],
        },
    )
    if customer_email:
        kwargs["customer_email"] = customer_email
        kwargs["metadata"]["email"] = customer_email[:480]

    session = stripe.checkout.Session.create(**kwargs)
    return {"id": session.id, "url": session.url}


def retrieve_checkout_session(session_id: str) -> dict[str, Any] | None:
    """
    Retrieve a Checkout Session for server-side payment verification.
    Returns the Stripe session object (dict-like) or None on failure.
    """
    _require_stripe()
    try:
        return stripe.checkout.Session.retrieve(session_id)
    except Exception as e:  # pragma: no cover - network/SDK guard
        logger.warning("Could not retrieve checkout session %s: %s", session_id, e)
        return None


def verify_webhook_signature(payload: bytes, signature: str | None) -> dict[str, Any] | None:
    """
    Verify Stripe webhook signature and return the event dict.
    Returns None if verification fails.
    """
    if not STRIPE_WEBHOOK_SECRET:
        logger.warning("STRIPE_WEBHOOK_SECRET not configured; webhook verification skipped")
        return None
    if not signature:
        return None
    try:
        event = stripe.Webhook.construct_event(payload, signature, STRIPE_WEBHOOK_SECRET)
        return event
    except stripe.SignatureVerificationError as e:
        logger.warning("Stripe webhook signature verification failed: %s", e)
        return None
    except Exception as e:
        logger.exception("Stripe webhook error: %s", e)
        return None
