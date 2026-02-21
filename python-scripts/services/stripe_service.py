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
