# Setup:
#   python -m venv venv
#   source venv/bin/activate   (Windows: venv\Scripts\activate)
#   pip install -r requirements.txt
#   cp .env.example .env
#   # Add your OPENROUTER_API_KEY to .env
#   python main.py
#
# Then open test_client/index.html in a browser.
# The API runs at http://localhost:8000
# API docs at http://localhost:8000/docs

from __future__ import annotations

import asyncio
import json
import os
import re
import sys
import traceback
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from attachments import (
    MAX_FILES_PER_MESSAGE,
    build_user_content,
    ensure_uploads_dir,
    save_upload_file,
    validate_upload,
)
from calendar_tools import CALENDAR_TOOLS, execute_tool, get_calendar_service
from carl_prompt import CARL_SYSTEM_PROMPT
from database import (
    create_session,
    get_all_sessions,
    get_attachment_by_id,
    get_session_detail,
    get_session_history,
    init_db,
    is_lead_notified,
    log_message,
    mark_lead_notified,
    save_attachment,
    session_exists,
)
from notifications import _has_phone as _notification_has_phone, send_lead_notification

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError(
        "OPENROUTER_API_KEY is not set. Copy .env.example to .env and add your API key."
    )

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_ID = "anthropic/claude-sonnet-4-5"
BASE_DIR = Path(__file__).resolve().parent

_CALENDAR_AVAILABLE = False

carl_router = APIRouter()

class SessionSummary(BaseModel):
    session_id: str
    created_at: str
    message_count: int


class AttachmentInfo(BaseModel):
    id: int
    filename: str
    mime_type: str
    size_bytes: int
    created_at: str


class MessageDetail(BaseModel):
    role: str
    content: str
    timestamp: str
    tokens_used: int | None = None
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    attachments: list[AttachmentInfo] = []



@carl_router.get("/health")
async def health() -> dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "ok",
        "model": MODEL_ID,
        "temperature": 0.4,
        "max_tokens": 512,
    }


@carl_router.get("/sessions", response_model=list[SessionSummary])
async def list_sessions() -> list[dict[str, Any]]:
    """Return recent sessions for review."""
    return get_all_sessions(limit=50)


@carl_router.get("/sessions/{session_id}", response_model=list[MessageDetail])
async def session_detail(session_id: str) -> list[dict[str, Any]]:
    """Return full conversation for a session."""
    messages = get_session_detail(session_id)
    if not messages and not session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    return messages


@carl_router.get("/attachments/{attachment_id}")
async def get_attachment(attachment_id: int) -> FileResponse:
    """Serve a stored attachment file."""
    record = get_attachment_by_id(attachment_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Attachment not found")

    file_path = BASE_DIR / record["file_path"]
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Attachment file not found on disk")

    return FileResponse(
        path=file_path,
        media_type=record["mime_type"],
        filename=record["filename"],
    )


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def _history_to_api_messages(history: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert stored history into OpenRouter message format."""
    api_messages: list[dict[str, Any]] = []
    for entry in history:
        role = entry["role"]
        text = entry["content"]
        attachments = entry.get("attachments") or []

        if role == "user" and attachments:
            content = build_user_content(text, attachments)
        else:
            content = text

        api_messages.append({"role": role, "content": content})
    return api_messages


def _openrouter_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tripointdiagnostics.co.uk",
        "X-Title": "TriPoint Diagnostics Carl",
    }


def _sse_event(event: str, data: dict[str, Any]) -> str:
    """Format a Server-Sent Events message."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


_UNAVAILABLE_MSG = "Carl is temporarily unavailable. Please call 020 8058 6095."
_MAX_TOOL_ITERATIONS = 3

# Strip tool-call XML that occasionally leaks into the streamed text.
_TOOL_TAG_RE = re.compile(
    r"<(get_availability|create_booking|get_zone_and_price)[\s\S]*?</\1>", re.MULTILINE
)

# Em/en dash replacement — the model ignores the system-prompt rule often enough
# that we enforce it in the pipeline. " — " and " – " become ", "; bare dashes
# become a hyphen so compound words survive (e.g. "Xentry-based").
def _strip_dashes(text: str) -> str:
    text = text.replace(" \u2014 ", ", ")   # em dash with spaces → comma
    text = text.replace("\u2014", ", ")      # bare em dash → comma
    text = text.replace(" \u2013 ", ", ")   # en dash with spaces → comma
    text = text.replace("\u2013", "-")       # bare en dash → hyphen
    return text

# Strip sentences where the model narrates its own tool-calling process.
# These should never reach the customer.
_TOOL_NARRATION_RE = re.compile(
    r"[^.!?\n]*"
    r"(?:I(?:'ll| will| need to| am going to| can)?\s+(?:use|call|check|run|invoke|query|calculate)\s+"
    r"(?:the\s+)?(?:get_availability|create_booking|get_zone_and_price|calendar tool|availability tool|zone tool|distance tool|postcode tool)"
    r"|let me (?:check|use|call|run|do that|look that up|calculate)"
    r"|I(?:'ll| will) (?:check|look up|calculate) (?:the\s+)?(?:calendar|availability|zone|postcode|distance)"
    r"|checking (?:the\s+)?(?:calendar|availability|zone|postcode|distance) (?:for|now)"
    r")"
    r"[^.!?\n]*[.!?\n]?",
    re.IGNORECASE,
)


_TOOL_LABELS: dict[str, str] = {
    "get_availability": "Checking availability...",
    "create_booking": "Creating booking...",
    "get_zone_and_price": "Calculating zone...",
}


async def _resolve_tool_calls_streaming(
    messages: list[dict[str, Any]],
) -> AsyncIterator[str]:
    """
    Run up to _MAX_TOOL_ITERATIONS non-streaming rounds to resolve tool calls,
    yielding SSE tool_status events for each tool that fires so the frontend
    can show an animated status label to the customer.

    Yields SSE strings throughout, then a final internal sentinel event
    ``_resolved`` with the finished message list and last tool name.
    If any error occurs, yields only ``_resolved`` with the original messages unchanged.
    """
    working_messages = list(messages)
    last_tool_called: str | None = None
    payload_base = {
        "model": MODEL_ID,
        "max_tokens": 512,
        "temperature": 0.4,
        "top_p": 0.9,
        "frequency_penalty": 0.3,
        "provider": {"order": ["Anthropic"], "allow_fallbacks": False},
        "tools": CALENDAR_TOOLS,
    }

    for _ in range(_MAX_TOOL_ITERATIONS):

        payload = {**payload_base, "messages": working_messages}
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    OPENROUTER_URL,
                    headers=_openrouter_headers(),
                    json=payload,
                )
        except Exception as exc:
            print(f"Tool resolution HTTP error: {exc}", file=sys.stderr)
            yield _sse_event("_resolved", {"messages": messages, "tool_called": None})
            return

        if response.status_code != 200:
            print(
                f"Tool resolution upstream error {response.status_code}: {response.text}",
                file=sys.stderr,
            )
            yield _sse_event("_resolved", {"messages": messages, "tool_called": None})
            return

        try:
            data = response.json()
        except Exception:
            yield _sse_event("_resolved", {"messages": messages, "tool_called": None})
            return

        choice = (data.get("choices") or [{}])[0]
        message_data = choice.get("message", {})
        content = message_data.get("content", "")
        tool_calls = message_data.get("tool_calls")

        tool_use_blocks: list[dict[str, Any]] = []
        if isinstance(content, list):
            tool_use_blocks = [b for b in content if b.get("type") == "tool_use"]

        if not tool_calls and not tool_use_blocks:
            break

        if tool_calls:
            working_messages.append({
                "role": "assistant",
                "content": content,
                "tool_calls": tool_calls,
            })
            for tool_call in tool_calls:
                tool_name = tool_call.get("function", {}).get("name", "")
                tool_args_str = tool_call.get("function", {}).get("arguments", "{}")
                tool_id = tool_call.get("id", "")
                try:
                    tool_input = json.loads(tool_args_str)
                except Exception:
                    tool_input = {}
                last_tool_called = tool_name
                label = _TOOL_LABELS.get(tool_name, "Working...")
                print(f"Tool call (OpenAI format): {tool_name}({tool_input})", file=sys.stderr)
                yield _sse_event("tool_status", {"label": label, "tool": tool_name})
                await asyncio.sleep(0.01)  # Force Uvicorn to flush the socket
                result_str = await asyncio.to_thread(execute_tool, tool_name, tool_input)
                working_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_id,
                    "name": tool_name,
                    "content": result_str,
                })
        else:
            working_messages.append({"role": "assistant", "content": content})
            tool_results: list[dict[str, Any]] = []
            for block in tool_use_blocks:
                tool_name = block.get("name", "")
                tool_input = block.get("input", {})
                tool_id = block.get("id", "")
                last_tool_called = tool_name
                label = _TOOL_LABELS.get(tool_name, "Working...")
                print(f"Tool call (Anthropic format): {tool_name}({tool_input})", file=sys.stderr)
                yield _sse_event("tool_status", {"label": label, "tool": tool_name})
                await asyncio.sleep(0.01)  # Force Uvicorn to flush the socket
                result_str = await asyncio.to_thread(execute_tool, tool_name, tool_input)
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_id,
                        "content": result_str,
                    }
                )
            working_messages.append({"role": "user", "content": tool_results})

    yield _sse_event("_resolved", {"messages": working_messages, "tool_called": last_tool_called})


async def _resolve_tool_calls(
    messages: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], str | None]:
    """Resolve tool calls synchronously (no SSE). Returns (final_messages, tool_called)."""
    final: list[dict[str, Any]] = messages
    tool_called: str | None = None
    async for _sse in _resolve_tool_calls_streaming(messages):
        if _sse.startswith("event: _resolved"):
            data_str = _sse.split("data: ", 1)[-1].strip()
            try:
                payload = json.loads(data_str)
                final = payload.get("messages", messages)
                tool_called = payload.get("tool_called")
            except Exception:
                pass
    return final, tool_called


async def _chat_generator(
    api_messages: list[dict[str, Any]],
    session_id: str,
    attachment_ids: list[int],
) -> AsyncIterator[str]:
    """
    Unified SSE generator for a chat turn.
    Emits tool_status events during tool resolution, then streams the final reply.
    """
    final_messages: list[dict[str, Any]] = api_messages
    tool_called: str | None = None

    async for sse in _resolve_tool_calls_streaming(api_messages):
        if sse.startswith("event: _resolved"):
            # Sentinel: parse resolved messages and move on to streaming.
            data_str = sse.split("data: ", 1)[-1].strip()
            try:
                payload = json.loads(data_str)
                final_messages = payload.get("messages", api_messages)
                tool_called = payload.get("tool_called")
            except Exception:
                pass
        else:
            yield sse  # forward tool_status events to the client

    async for chunk in stream_openrouter(final_messages, session_id, attachment_ids, tool_called):
        yield chunk


async def stream_openrouter(
    messages: list[dict[str, Any]],
    session_id: str,
    attachment_ids: list[int],
    tool_called: str | None = None,
) -> AsyncIterator[str]:
    """Stream OpenRouter completion chunks as SSE events."""
    payload = {
        "model": MODEL_ID,
        "max_tokens": 512,
        "temperature": 0.4,
        "top_p": 0.9,
        "frequency_penalty": 0.3,
        "stream": True,
        "provider": {
            "order": ["Anthropic"],
            "allow_fallbacks": False,
        },
        "messages": messages,
    }

    reply_parts: list[str] = []
    tokens_used: int | None = None
    prompt_tokens: int | None = None
    completion_tokens: int | None = None

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            async with client.stream(
                "POST",
                OPENROUTER_URL,
                headers=_openrouter_headers(),
                json=payload,
            ) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    print(
                        f"OpenRouter error {response.status_code}: {body.decode()}",
                        file=sys.stderr,
                    )
                    yield _sse_event("error", {"message": _UNAVAILABLE_MSG})
                    return

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue

                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        break

                    try:
                        data = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue

                    if data.get("error"):
                        err = data["error"]
                        err_msg = err.get("message", "Unknown error") if isinstance(err, dict) else str(err)
                        print(f"OpenRouter stream error: {err_msg}", file=sys.stderr)
                        yield _sse_event("error", {"message": _UNAVAILABLE_MSG})
                        return

                    usage = data.get("usage")
                    if usage:
                        if usage.get("total_tokens") is not None:
                            tokens_used = int(usage["total_tokens"])
                        if usage.get("prompt_tokens") is not None:
                            prompt_tokens = int(usage["prompt_tokens"])
                        if usage.get("completion_tokens") is not None:
                            completion_tokens = int(usage["completion_tokens"])

                    choices = data.get("choices") or []
                    if not choices:
                        continue

                    delta = choices[0].get("delta") or {}
                    content = delta.get("content")
                    if content:
                        content = _strip_dashes(content)
                        reply_parts.append(content)
                        yield _sse_event("chunk", {"content": content})

    except httpx.TimeoutException as exc:
        print(f"OpenRouter timeout: {exc}", file=sys.stderr)
        yield _sse_event("error", {"message": _UNAVAILABLE_MSG})
        return
    except httpx.RequestError as exc:
        print(f"OpenRouter request error: {exc}", file=sys.stderr)
        yield _sse_event("error", {"message": _UNAVAILABLE_MSG})
        return
    except Exception as exc:
        print(f"OpenRouter stream error: {exc}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        yield _sse_event("error", {"message": _UNAVAILABLE_MSG})
        return

    raw = "".join(reply_parts)
    raw = _TOOL_TAG_RE.sub("", raw)
    reply_text = _TOOL_NARRATION_RE.sub("", raw).lstrip()
    if reply_text:
        log_message(
            session_id,
            "assistant",
            reply_text,
            tokens_used=tokens_used,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )

    # Send the lead notification as soon as a phone number appears in the history.
    # The full history at this point includes Carl's current reply, so we capture
    # whatever context Carl has at the moment of notification.
    lead_captured = False
    if reply_text and not is_lead_notified(session_id):
        full_history = get_session_history(session_id)
        if _notification_has_phone(full_history):
            sent = send_lead_notification(session_id, full_history)
            if sent:
                mark_lead_notified(session_id)
                lead_captured = True

    yield _sse_event(
        "done",
        {
            "session_id": session_id,
            "tokens_used": tokens_used,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "attachment_ids": attachment_ids,
            "tool_called": tool_called,
            "lead_captured": lead_captured,
        },
    )


async def _read_upload_files(files: list[UploadFile]) -> list[tuple[str, str, bytes]]:
    """Validate and read uploaded files."""
    if len(files) > MAX_FILES_PER_MESSAGE:
        raise HTTPException(
            status_code=400,
            detail=f"A maximum of {MAX_FILES_PER_MESSAGE} files per message is allowed.",
        )

    parsed: list[tuple[str, str, bytes]] = []
    for upload in files:
        if not upload.filename:
            raise HTTPException(status_code=400, detail="Each file must have a filename.")
        data = await upload.read()
        try:
            mime_type = validate_upload(
                upload.filename,
                upload.content_type,
                len(data),
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        parsed.append((upload.filename, mime_type, data))
    return parsed


def _content_label_for_storage(text: str, filenames: list[str]) -> str:
    """Build a plain-text message body stored in the database."""
    if text and filenames:
        names = ", ".join(filenames)
        return f"{text}\n[Attachments: {names}]"
    if filenames:
        return f"[Attachments: {', '.join(filenames)}]"
    return text


@carl_router.post("/chat")
async def chat(
    request: Request,
    session_id: str = Form(...),
    message: str = Form(""),
    files: list[UploadFile] | None = File(None),
) -> StreamingResponse:
    """Handle a chat message with optional file attachments (SSE stream)."""
    session_id = session_id.strip()
    message = message.strip()

    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    upload_files = files or []

    if not message and not upload_files:
        raise HTTPException(
            status_code=400,
            detail="message or at least one attachment is required",
        )

    try:
        if not session_exists(session_id):
            create_session(
                session_id=session_id,
                user_agent=request.headers.get("user-agent"),
                ip_address=_client_ip(request),
            )

        uploaded = await _read_upload_files(upload_files)
        filenames = [name for name, _, _ in uploaded]
        stored_content = _content_label_for_storage(message, filenames)

        history = get_session_history(session_id)
        message_id = log_message(session_id, "user", stored_content)

        attachment_ids: list[int] = []
        current_attachments: list[dict[str, Any]] = []
        for filename, mime_type, data in uploaded:
            file_path, size_bytes = save_upload_file(
                session_id, filename, mime_type, data
            )
            att_id = save_attachment(
                message_id=message_id,
                session_id=session_id,
                filename=filename,
                mime_type=mime_type,
                file_path=file_path,
                size_bytes=size_bytes,
            )
            attachment_ids.append(att_id)
            current_attachments.append(
                {
                    "filename": filename,
                    "mime_type": mime_type,
                    "file_path": file_path,
                }
            )

        from datetime import datetime
        from zoneinfo import ZoneInfo
        tz_name = os.getenv("CARL_TIMEZONE", "Europe/London")
        current_time_str = datetime.now(ZoneInfo(tz_name)).strftime("%A, %B %d, %Y, %I:%M %p")
        system_content = f"{CARL_SYSTEM_PROMPT}\n\n## CURRENT TIME\nToday's date and time is: {current_time_str} ({tz_name})."

        api_messages: list[dict[str, Any]] = [
            {
                "role": "system",
                "content": system_content,
                "cache_control": {"type": "ephemeral"},
            },
        ]
        api_messages.extend(_history_to_api_messages(history))

        user_content = build_user_content(message, current_attachments)
        api_messages.append({"role": "user", "content": user_content})

        return StreamingResponse(
            _chat_generator(api_messages, session_id, attachment_ids),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Chat handler error: {exc}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(
            status_code=500,
            detail=_UNAVAILABLE_MSG,
        ) from exc



