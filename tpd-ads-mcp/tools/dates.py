"""Default date ranges for tools (UTC calendar dates)."""

from __future__ import annotations

from datetime import date, timedelta, timezone


def utc_today() -> date:
    return date.today()


def default_yesterday() -> date:
    return utc_today() - timedelta(days=1)


def resolve_date_range(
    start_date: str | None,
    end_date: str | None,
) -> tuple[str, str]:
    """
    If either bound is missing, default to: end = yesterday (UTC), start = end - 29 days
    (30 inclusive days). If both provided, use them (validated).
    """
    yest = default_yesterday()
    if end_date is None:
        end_d = yest
    else:
        end_d = date.fromisoformat(end_date)
    if start_date is None:
        start_d = end_d - timedelta(days=29)
    else:
        start_d = date.fromisoformat(start_date)
    if start_d > end_d:
        raise ValueError("start_date must be on or before end_date")
    return start_d.isoformat(), end_d.isoformat()
