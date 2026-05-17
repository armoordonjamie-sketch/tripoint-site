"""
OpenRouter client (OpenAI-compatible SDK).

Example request body (non-streaming) for inspection:

    from openai import OpenAI
    import os

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ["OPENROUTER_API_KEY"],
    )
    completion = client.chat.completions.create(
        model="google/gemini-3-flash-preview",
        messages=[
            {"role": "system", "content": "<SYSTEM_PROMPT>"},
            {"role": "user", "content": "<USER_JSON_BATCH_PROMPT>"},
        ],
        temperature=0.2,
        extra_body={"reasoning": {"effort": "low"}},
    )
    text = completion.choices[0].message.content
    # usage = completion.usage  # prompt_tokens, completion_tokens when present
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    OpenAI,
    RateLimitError,
)
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential_jitter,
)


def _retryable_openai(exc: BaseException) -> bool:
    if isinstance(exc, (APIConnectionError, APITimeoutError, RateLimitError)):
        return True
    if isinstance(exc, APIStatusError):
        return exc.status_code in (429, 500, 502, 503, 504)
    return False

from . import config

logger = logging.getLogger(__name__)

_JSON_FENCE = re.compile(r"^```(?:json)?\s*", re.I)
_JSON_FENCE_END = re.compile(r"\s*```\s*$", re.I)


def extract_json_object(text: str) -> str:
    """Strip markdown fences; return inner JSON string."""
    t = (text or "").strip()
    t = _JSON_FENCE.sub("", t)
    t = _JSON_FENCE_END.sub("", t).strip()
    if not t.startswith("{"):
        i = t.find("{")
        if i >= 0:
            t = t[i:]
    if not t.endswith("}"):
        j = t.rfind("}")
        if j >= 0:
            t = t[: j + 1]
    return t.strip()


def build_client(api_key: str) -> OpenAI:
    return OpenAI(
        base_url=config.OPENROUTER_BASE_URL,
        api_key=api_key,
    )


class OpenRouterBatchError(RuntimeError):
    pass


@retry(
    retry=retry_if_exception(_retryable_openai),
    wait=wait_exponential_jitter(initial=2, max=60),
    stop=stop_after_attempt(5),
    reraise=True,
)
def chat_completion_json(
    client: OpenAI,
    *,
    system_prompt: str,
    user_content: str,
    reasoning_effort: str,
    timeout: float = 120.0,
) -> dict[str, Any]:
    """Call chat completions; return raw message dict + usage + optional reasoning."""
    try:
        completion = client.chat.completions.create(
            model=config.OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=config.DEFAULT_TEMPERATURE,
            timeout=timeout,
            extra_body={"reasoning": {"effort": reasoning_effort}},
        )
    except Exception as e:
        logger.error("OpenRouter request failed: %s", e)
        raise OpenRouterBatchError(str(e)) from e

    choice = completion.choices[0]
    msg = choice.message
    content = getattr(msg, "content", None) or ""
    usage: dict[str, Any] = {}
    if getattr(completion, "usage", None):
        u = completion.usage
        usage = {
            "prompt_tokens": getattr(u, "prompt_tokens", None),
            "completion_tokens": getattr(u, "completion_tokens", None),
            "total_tokens": getattr(u, "total_tokens", None),
        }
    reasoning_details = getattr(msg, "reasoning_details", None)
    if reasoning_details is None and isinstance(
        getattr(choice, "model_extra", None), dict
    ):
        reasoning_details = choice.model_extra.get("reasoning_details")

    return {
        "content": content,
        "usage": usage,
        "reasoning_details": reasoning_details,
        "model": completion.model,
        "id": getattr(completion, "id", None),
        "raw_finish": getattr(choice, "finish_reason", None),
    }


def parse_batch_json(content: str) -> dict[str, Any]:
    inner = extract_json_object(content)
    return json.loads(inner)
