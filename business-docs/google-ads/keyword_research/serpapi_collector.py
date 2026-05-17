"""SerpApi Google Autocomplete and Google Search collection with retries."""

from __future__ import annotations

import logging
import time
from typing import Any

import requests

from config import ResearchSettings

logger = logging.getLogger(__name__)

SERPAPI_SEARCH_URL = "https://serpapi.com/search"


def _request_with_retries(
    params: dict[str, Any],
    settings: ResearchSettings,
) -> dict[str, Any]:
    """GET SerpApi with retries on 429/5xx."""
    last_error: Exception | None = None
    for attempt in range(settings.max_retries):
        try:
            resp = requests.get(
                SERPAPI_SEARCH_URL,
                params=params,
                timeout=settings.request_timeout,
            )
            if resp.status_code in (429, 500, 502, 503, 504):
                wait = 2**attempt
                logger.warning(
                    "SerpApi HTTP %s, retry in %ss (attempt %s/%s)",
                    resp.status_code,
                    wait,
                    attempt + 1,
                    settings.max_retries,
                )
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, dict) and data.get("error"):
                raise RuntimeError(str(data.get("error")))
            return data if isinstance(data, dict) else {}
        except (requests.RequestException, ValueError, RuntimeError) as e:
            last_error = e
            wait = 2**attempt
            logger.warning(
                "SerpApi request failed: %s, retry in %ss", e, wait
            )
            time.sleep(wait)
    raise RuntimeError(f"SerpApi failed after {settings.max_retries} attempts") from last_error


def fetch_autocomplete(
    seed: str,
    api_key: str,
    settings: ResearchSettings,
) -> list[dict[str, Any]]:
    """
    Call Google Autocomplete via SerpApi.

    Returns list of dicts with keys: value, suggestion_type, seed, api_endpoint.
    """
    params: dict[str, Any] = {
        "engine": "google_autocomplete",
        "q": seed,
        "gl": settings.gl,
        "hl": settings.hl,
        "api_key": api_key,
    }
    data = _request_with_retries(params, settings)
    out: list[dict[str, Any]] = []
    suggestions = data.get("suggestions")
    if not isinstance(suggestions, list):
        return out
    for item in suggestions[: settings.max_suggestions]:
        if not isinstance(item, dict):
            continue
        val = item.get("value") or item.get("query") or item.get("term")
        if not val or not isinstance(val, str):
            continue
        out.append(
            {
                "value": val.strip(),
                "suggestion_type": str(item.get("type", "")),
                "seed": seed,
                "api_endpoint": "google_autocomplete",
            }
        )
    return out


def fetch_search_results(
    seed: str,
    api_key: str,
    settings: ResearchSettings,
) -> dict[str, Any]:
    """
    Call Google Search via SerpApi; extract related searches, organic, PAA.

    Returns dict with keys: related_searches, organic_results, related_questions,
    raw_error (optional), seed, api_endpoint.
    """
    params: dict[str, Any] = {
        "engine": "google",
        "q": seed,
        "gl": settings.gl,
        "hl": settings.hl,
        "google_domain": settings.google_domain,
        "location": settings.location,
        "num": max(
            settings.max_organic,
            settings.max_related,
            10,
        ),
        "api_key": api_key,
    }
    data = _request_with_retries(params, settings)

    related_searches: list[dict[str, Any]] = []
    try:
        rs = data.get("related_searches")
        if isinstance(rs, list):
            for r in rs[: settings.max_related]:
                if not isinstance(r, dict):
                    continue
                q = r.get("query") or r.get("title")
                if q and isinstance(q, str):
                    related_searches.append({"query": q.strip()})
    except (TypeError, KeyError):
        pass

    organic_results: list[dict[str, Any]] = []
    try:
        org = data.get("organic_results")
        if isinstance(org, list):
            for o in org[: settings.max_organic]:
                if not isinstance(o, dict):
                    continue
                title = o.get("title")
                snippet = o.get("snippet") or o.get("snippet_highlighted_words")
                if isinstance(snippet, list):
                    snippet = " ".join(str(x) for x in snippet)
                link = o.get("link") or o.get("url")
                pos = o.get("position")
                organic_results.append(
                    {
                        "title": str(title).strip() if title else "",
                        "snippet": str(snippet).strip() if snippet else "",
                        "link": str(link).strip() if link else "",
                        "position": pos if isinstance(pos, int) else None,
                    }
                )
    except (TypeError, KeyError):
        pass

    related_questions: list[dict[str, Any]] = []
    try:
        rq = data.get("related_questions")
        if isinstance(rq, list):
            for q in rq:
                if not isinstance(q, dict):
                    continue
                question = q.get("question") or q.get("title")
                snippet = q.get("snippet")
                related_questions.append(
                    {
                        "question": str(question).strip() if question else "",
                        "snippet": str(snippet).strip() if snippet else "",
                    }
                )
    except (TypeError, KeyError):
        pass

    return {
        "related_searches": related_searches,
        "organic_results": organic_results,
        "related_questions": related_questions,
        "seed": seed,
        "api_endpoint": "google",
    }
