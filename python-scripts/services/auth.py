"""
Admin authentication via session cookie.
"""
from __future__ import annotations

import hmac
import logging
import os
import time
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Cookie, Depends, HTTPException, Request
from itsdangerous import BadSignature, URLSafeTimedSerializer

load_dotenv()

logger = logging.getLogger("tripoint.auth")

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
SESSION_COOKIE_NAME = "tripoint_admin_session"
SESSION_MAX_AGE = 86400 * 7  # 7 days

# Simple in-memory rate limit: {ip: (count, window_start)}
_login_attempts: dict[str, tuple[int, float]] = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 5


def _get_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(SECRET_KEY, salt="admin-session", signer_kwargs={"key_derivation": "hmac"})


def create_session_token() -> str:
    """Create a signed session token."""
    return _get_serializer().dumps({"admin": True, "ts": time.time()})


def verify_session_token(token: str) -> bool:
    """Verify and decode session token. Returns True if valid."""
    try:
        data = _get_serializer().loads(token, max_age=SESSION_MAX_AGE)
        return data.get("admin") is True
    except BadSignature:
        return False
    except Exception:
        return False


def verify_admin_password(password: str) -> bool:
    """Constant-time password comparison."""
    if not ADMIN_PASSWORD:
        return False
    return hmac.compare_digest(password.encode("utf-8"), ADMIN_PASSWORD.encode("utf-8"))


def check_rate_limit(request: Request) -> None:
    """Raise 429 if too many login attempts from this IP."""
    client = request.client
    ip = client.host if client else "unknown"
    now = time.time()
    if ip in _login_attempts:
        count, window_start = _login_attempts[ip]
        if now - window_start > RATE_LIMIT_WINDOW:
            _login_attempts[ip] = (1, now)
        elif count >= RATE_LIMIT_MAX:
            raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")
        else:
            _login_attempts[ip] = (count + 1, window_start)
    else:
        _login_attempts[ip] = (1, now)


async def verify_admin_session(
    request: Request,
    tripoint_admin_session: Annotated[str | None, Cookie(alias=SESSION_COOKIE_NAME)] = None,
) -> dict:
    """FastAPI dependency: verify admin session cookie. Raises 401 if invalid."""
    if not tripoint_admin_session or not verify_session_token(tripoint_admin_session):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"authenticated": True}
