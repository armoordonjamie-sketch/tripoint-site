"""Email template loader, renderer, and manager for TriPoint Diagnostics.

Reads HTML/TXT templates from the email-templates/ directory,
renders them by replacing [PLACEHOLDER] tokens with provided data,
and exposes a clean interface for the API layer.
"""

from __future__ import annotations

import html
import os
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

# ── Subject-line suggestions (from README.md table) ──────────────────────────

SUBJECT_SUGGESTIONS: dict[str, str] = {
    "01-enquiry-auto-reply": "Thanks for getting in touch - TriPoint Diagnostics",
    "02-booking-confirmation": "Booking confirmed - [SERVICE_NAME] on [BOOKING_DATE]",
    "03-on-the-way": "We're on the way - ETA [ETA_WINDOW]",
    "04-job-complete": "Job complete - your diagnostic report for [VEHICLE_REG]",
    "05-payment-received": "Payment received - thank you, [CLIENT_FIRST_NAME]",
    "06-review-request": "How did we do? Quick feedback for [VEHICLE_REG]",
    "07-overdue-invoice": "Friendly reminder - invoice [INVOICE_ID] is now overdue",
    "08-deposit-pending": "Slot reserved - pay deposit to confirm [SERVICE_NAME] on [BOOKING_DATE]",
    "09-deposit-confirmed": "Deposit received - your booking is confirmed",
    "10-balance-request": "Payment requested - remaining balance for [VEHICLE_REG]",
    "11-report-ready": "Your diagnostic report is ready - [VEHICLE_REG]",
}

# Placeholders whose values are trusted pre-built HTML (never escaped)
HTML_FRAGMENT_PLACEHOLDERS = frozenset({
    "INVOICE_LINE_ITEMS_HTML",
    "QUOTE_LINE_ITEMS_HTML",
})

# Regex to match [ALL_CAPS_UNDERSCORES] placeholders
_PLACEHOLDER_RE = re.compile(r"\[([A-Z][A-Z0-9_]*)\]")


@dataclass
class TemplateRecord:
    slug: str
    html: str | None = None
    text: str | None = None
    subject: str = ""


@dataclass
class RenderResult:
    slug: str
    subject: str
    html: str
    text: str
    missing_placeholders: list[str] = field(default_factory=list)


class EmailTemplateService:
    """Loads and renders email templates from disk with in-memory caching."""

    def __init__(self, templates_dir: str | Path | None = None):
        if templates_dir is None:
            # Default: ../email-templates/ relative to this script
            templates_dir = Path(__file__).resolve().parent.parent / "email-templates"
        self._dir = Path(templates_dir)
        self._cache: dict[str, TemplateRecord] | None = None

    # ── Cache management ─────────────────────────────────────────────────

    def _ensure_cache(self) -> None:
        if self._cache is not None:
            return
        self._cache = {}
        if not self._dir.is_dir():
            return
        # Discover templates by finding .html files and matching .txt
        for html_path in sorted(self._dir.glob("*.html")):
            slug = html_path.stem
            txt_path = self._dir / f"{slug}.txt"
            record = TemplateRecord(
                slug=slug,
                html=html_path.read_text(encoding="utf-8"),
                text=txt_path.read_text(encoding="utf-8") if txt_path.exists() else None,
                subject=SUBJECT_SUGGESTIONS.get(slug, ""),
            )
            self._cache[slug] = record

    def reload(self) -> None:
        """Force reload templates from disk."""
        self._cache = None
        self._ensure_cache()

    # ── Public API ───────────────────────────────────────────────────────

    def list_templates(self) -> list[dict[str, Any]]:
        self._ensure_cache()
        assert self._cache is not None
        return [
            {
                "slug": rec.slug,
                "has_html": rec.html is not None,
                "has_text": rec.text is not None,
                "subject": rec.subject,
            }
            for rec in self._cache.values()
        ]

    def get_template(self, slug: str) -> TemplateRecord | None:
        self._ensure_cache()
        assert self._cache is not None
        return self._cache.get(slug)

    def render(self, slug: str, data: dict[str, str]) -> RenderResult | None:
        record = self.get_template(slug)
        if record is None:
            return None

        # Auto-inject CURRENT_YEAR if not provided
        if "CURRENT_YEAR" not in data:
            data = {**data, "CURRENT_YEAR": str(datetime.now().year)}

        rendered_html = self._replace(record.html or "", data, escape_html=True)
        rendered_text = self._replace(record.text or "", data, escape_html=False)
        rendered_subject = self._replace(record.subject, data, escape_html=False)

        # Find remaining unreplaced placeholders
        all_remaining = set()
        for content in (rendered_html, rendered_text, rendered_subject):
            all_remaining.update(_PLACEHOLDER_RE.findall(content))

        return RenderResult(
            slug=slug,
            subject=rendered_subject,
            html=rendered_html,
            text=rendered_text,
            missing_placeholders=sorted(all_remaining),
        )

    # ── Internal ─────────────────────────────────────────────────────────

    @staticmethod
    def _replace(template: str, data: dict[str, str], *, escape_html: bool) -> str:
        def replacer(match: re.Match) -> str:
            key = match.group(1)
            if key not in data:
                return match.group(0)  # Leave unknown placeholders as-is
            value = data[key]
            if escape_html and key not in HTML_FRAGMENT_PLACEHOLDERS:
                value = html.escape(value)
            return value

        return _PLACEHOLDER_RE.sub(replacer, template)
