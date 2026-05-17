"""Load environment variables from the shared keyword_research/.env (and optional local .env)."""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv

_PKG_DIR = Path(__file__).resolve().parent
_KEYWORD_RESEARCH_DIR = _PKG_DIR.parent


def load_llm_env(*, override_local: bool = True) -> None:
    """
    Load dotenv files in a sensible order:

    1. ``keyword_research/.env`` — shared with SerpApi, Brave, Google OAuth, OpenRouter, etc.
    2. ``llm_keyword_reorganizer/.env`` — optional overrides (only if override_local is True).

    Call this at CLI startup before reading ``OPENROUTER_API_KEY``.
    """
    load_dotenv(_KEYWORD_RESEARCH_DIR / ".env")
    if override_local:
        load_dotenv(_PKG_DIR / ".env", override=True)
