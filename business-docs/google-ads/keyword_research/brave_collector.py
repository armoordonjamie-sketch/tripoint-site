"""Brave Search API: suggest + web search with retries (UK)."""

from __future__ import annotations

import logging
import time
from typing import Any

import requests

from config import ResearchSettings

logger = logging.getLogger(__name__)

BRAVE_SUGGEST_URL = "https://api.search.brave.com/res/v1/suggest/search"
BRAVE_WEB_URL = "https://api.search.brave.com/res/v1/web/search"


def _brave_get(
    url: str,
    params: dict[str, Any],
    api_key: str,
    settings: ResearchSettings,
) -> dict[str, Any]:
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": api_key,
    }
    last_error: Exception | None = None
    for attempt in range(settings.max_retries):
        try:
            resp = requests.get(
                url,
                headers=headers,
                params=params,
                timeout=settings.request_timeout,
            )
            if resp.status_code in (429, 500, 502, 503, 504):
                wait = 2**attempt
                logger.warning(
                    "Brave HTTP %s, retry in %ss (%s/%s)",
                    resp.status_code,
                    wait,
                    attempt + 1,
                    settings.max_retries,
                )
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            return data if isinstance(data, dict) else {}
        except (requests.RequestException, ValueError) as e:
            last_error = e
            wait = 2**attempt
            logger.warning("Brave request failed: %s, retry in %ss", e, wait)
            time.sleep(wait)
    raise RuntimeError(f"Brave API failed after {settings.max_retries} attempts") from last_error


def fetch_brave_suggest(
    seed: str,
    api_key: str,
    settings: ResearchSettings,
) -> list[dict[str, Any]]:
    """Return suggestion rows: value, seed, source=brave_suggest."""
    count = getattr(settings, "brave_suggest_count", 10)
    params: dict[str, Any] = {
        "q": seed,
        "country": "GB",
        "count": count,
    }
    data = _brave_get(BRAVE_SUGGEST_URL, params, api_key, settings)
    out: list[dict[str, Any]] = []
    # Response shape: { "query": { "original": "..." }, "results": [ { "query": "..." } ] }
    results = data.get("results")
    if not isinstance(results, list):
        return out
    for item in results:
        if isinstance(item, str):
            val = item.strip()
        elif isinstance(item, dict):
            val = (item.get("query") or item.get("value") or "").strip()
        else:
            continue
        if val:
            out.append(
                {
                    "value": val,
                    "seed": seed,
                    "source": "brave_suggest",
                }
            )
    return out


def fetch_brave_web(
    seed: str,
    api_key: str,
    settings: ResearchSettings,
) -> dict[str, Any]:
    """
    Web search; return titles, descriptions, optional altered query.

    Keys: titles, descriptions, altered_query, seed, raw (optional subset).
    """
    count = getattr(settings, "brave_web_count", 10)
    params: dict[str, Any] = {
        "q": seed,
        "country": "GB",
        "count": count,
    }
    data = _brave_get(BRAVE_WEB_URL, params, api_key, settings)
    titles: list[str] = []
    descriptions: list[str] = []
    altered: str = ""
    try:
        qmeta = data.get("query")
        if isinstance(qmeta, dict):
            alt = qmeta.get("altered")
            if isinstance(alt, str):
                altered = alt.strip()
    except (TypeError, AttributeError):
        pass
    try:
        web = data.get("web")
        if isinstance(web, dict):
            results = web.get("results") or []
            if isinstance(results, list):
                for r in results:
                    if not isinstance(r, dict):
                        continue
                    t = r.get("title")
                    d = r.get("description")
                    if t and isinstance(t, str):
                        titles.append(t.strip())
                    if d and isinstance(d, str):
                        descriptions.append(d.strip())
    except (TypeError, KeyError):
        pass
    return {
        "titles": titles,
        "descriptions": descriptions,
        "altered_query": altered,
        "seed": seed,
    }
