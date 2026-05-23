"""
Lead notification for TriPoint Diagnostics.

When Carl collects a customer phone number for the first time in a session,
this module emails Jamie a conversation summary via Zoho SMTP.
WhatsApp via Green API fires as well if those credentials are also set.
"""

from __future__ import annotations

import csv
import io
import json
import os
import re
import smtplib
import ssl
import sys
from email.message import EmailMessage
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

# ── SMTP (Zoho) ───────────────────────────────────────────────────────────────
_SMTP_HOST = os.getenv("ZOHO_SMTP_HOST", "smtp.zoho.eu")
_SMTP_PORT = int(os.getenv("ZOHO_SMTP_PORT", "465"))
_SMTP_USER = os.getenv("ZOHO_SMTP_USER", "")
_SMTP_PASS = os.getenv("ZOHO_SMTP_PASS", "")
_FROM_EMAIL = os.getenv("ZOHO_FROM_EMAIL", _SMTP_USER)
_NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "")

# ── WhatsApp (Green API — optional) ──────────────────────────────────────────
_GREENAPI_ID = os.getenv("GREENAPI_ID_INSTANCE", "")
_GREENAPI_TOKEN = os.getenv("GREENAPI_API_TOKEN", "")
_JAMIE_WHATSAPP = os.getenv("JAMIE_WHATSAPP_NUMBER", "")

# ── Phone detection ───────────────────────────────────────────────────────────
# Matches UK mobiles and landlines in formats like:
#   07490973912 / 07490 973 912 / +44 7490 973912 / 020 8058 6095
_UK_PHONE_RE = re.compile(
    r"""
    (?:
        (?:\+44|0044|44)(?:[\s\-.]?\d){9,10}   # international prefix + 9-10 digits
    |
        0\d(?:[\s\-.]?\d){8,10}                 # 0x… UK local format with optional separators
    )
    """,
    re.VERBOSE,
)


def extract_phone(text: str) -> str | None:
    """Return the first UK phone number found in text, normalised (no spaces), or None."""
    m = _UK_PHONE_RE.search(text)
    return re.sub(r"[\s\-.]", "", m.group()) if m else None


def _has_phone(messages: list[dict[str, Any]]) -> bool:
    return any(
        extract_phone(m.get("content", ""))
        for m in messages
        if m.get("role") == "user"
    )


# ── AI Summary & CSV Generation ───────────────────────────────────────────────

def _generate_ai_summary(messages: list[dict[str, Any]]) -> dict[str, Any]:
    """Call OpenRouter API to extract job summary in JSON format."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("OPENROUTER_API_KEY missing for AI summary.", file=sys.stderr)
        return {
            "name": "Unknown",
            "vehicle": "Unknown",
            "reg": "Unknown",
            "location": "Unknown",
            "summary": "Could not generate summary (API key missing)."
        }

    history_text = ""
    for msg in messages:
        role = "Customer" if msg.get("role") == "user" else "Carl"
        content = msg.get("content", "")
        history_text += f"{role}: {content}\n\n"

    system_prompt = (
        "You are an assistant for TriPoint Diagnostics. Extract job details from the provided chat. "
        "You MUST respond ONLY with a valid JSON object. Do not include markdown codeblocks (like ```json). "
        "The JSON object must have exactly these keys:\n"
        "{\n"
        '  "name": "Customer\'s name (default \'Unknown\')",\n'
        '  "vehicle": "Vehicle details, model/year (default \'Unknown\')",\n'
        '  "reg": "Vehicle registration/license plate (default \'Unknown\')",\n'
        '  "location": "Customer\'s location/postcode (default \'Unknown\')",\n'
        '  "summary": "Concise summary of the conversation and issue"\n'
        "}"
    )

    model = "google/gemini-2.5-flash"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is the chat history:\n\n{history_text}"}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://tripointdiagnostics.co.uk",
                "X-Title": "TriPoint Diagnostics Carl Summary",
            }
            resp = client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                if content.startswith("```"):
                    lines = content.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()
                
                parsed = json.loads(content)
                for key in ["name", "vehicle", "reg", "location", "summary"]:
                    if key not in parsed:
                        parsed[key] = "Unknown"
                return parsed
            else:
                print(f"OpenRouter summary error {resp.status_code}: {resp.text}", file=sys.stderr)
    except Exception as e:
        print(f"Failed to generate AI summary: {e}", file=sys.stderr)

    return {
        "name": "Unknown",
        "vehicle": "Unknown",
        "reg": "Unknown",
        "location": "Unknown",
        "summary": "Could not generate summary due to model/API error."
    }


def _generate_csv(session_id: str) -> bytes:
    """Generate a CSV string of the conversation history and return as bytes."""
    try:
        from database import get_session_detail
        history = get_session_detail(session_id)
    except Exception as exc:
        print(f"Error fetching session detail for CSV: {exc}", file=sys.stderr)
        history = []

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    writer.writerow(["Timestamp", "Role", "Content"])
    
    for msg in history:
        role = "Customer" if msg.get("role") == "user" else "Carl"
        content = msg.get("content", "")
        timestamp = msg.get("timestamp", "")
        writer.writerow([timestamp, role, content])
        
    return output.getvalue().encode("utf-8")


# ── Formatting ────────────────────────────────────────────────────────────────

def _plain_body(session_id: str, messages: list[dict[str, Any]], ai_summary: dict[str, Any]) -> str:
    lines = [
        "New TPD lead — Carl chatbot",
        "=" * 40,
        "",
        "JOB DETAILS (AI SUMMARY):",
        f"  Name:     {ai_summary.get('name')}",
        f"  Vehicle:  {ai_summary.get('vehicle')}",
        f"  Reg:      {ai_summary.get('reg')}",
        f"  Location: {ai_summary.get('location')}",
        f"  Summary:  {ai_summary.get('summary')}",
        "",
        "=" * 40,
        "",
        "RAW CHAT HISTORY SUMMARY:",
    ]
    for msg in messages:
        role = msg.get("role", "")
        content = str(msg.get("content", "")).strip()
        if not content:
            continue
        label = "Customer" if role == "user" else "Carl"
        if role == "assistant" and len(content) > 300:
            content = content[:297] + "..."
        lines.append(f"{label}: {content}")
        lines.append("")
    lines += [
        "-" * 40,
        f"Session: {session_id[:8]}…",
        "Reply direct or call 020 8058 6095 to follow up.",
    ]
    return "\n".join(lines)


def _html_body(session_id: str, messages: list[dict[str, Any]], ai_summary: dict[str, Any]) -> str:
    import html as _html

    details_html = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-collapse: collapse; background: #1e293b; border-radius: 8px; border: 1px solid #334155; overflow: hidden;">
      <tr>
        <td colspan="2" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 12px 16px; color: #ffffff; font-weight: bold; font-size: 15px;">
          📋 Job Details (AI Summary)
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #94a3b8; font-size: 13px; width: 100px;"><strong>Name</strong></td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #f8fafc; font-size: 14px; font-weight: 500;">{_html.escape(str(ai_summary.get('name')))}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #94a3b8; font-size: 13px;"><strong>Vehicle</strong></td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #f8fafc; font-size: 14px; font-weight: 500;">{_html.escape(str(ai_summary.get('vehicle')))}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #94a3b8; font-size: 13px;"><strong>Reg</strong></td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #f8fafc; font-size: 14px; font-weight: 500; font-family: monospace;">{_html.escape(str(ai_summary.get('reg')))}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #94a3b8; font-size: 13px;"><strong>Location</strong></td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #334155; color: #f8fafc; font-size: 14px; font-weight: 500;">{_html.escape(str(ai_summary.get('location')))}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; color: #94a3b8; font-size: 13px; vertical-align: top; padding-top: 12px;"><strong>Summary</strong></td>
        <td style="padding: 10px 14px; color: #f8fafc; font-size: 14px; line-height: 1.5;">{_html.escape(str(ai_summary.get('summary')))}</td>
      </tr>
    </table>
    """

    raw_json_str = json.dumps(ai_summary, indent=2)
    json_html = f"""
    <div style="margin-bottom: 20px;">
      <div style="color: #94a3b8; font-size: 12px; margin-bottom: 6px; font-weight: bold;">RAW JSON DETAILS:</div>
      <pre style="background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 12px; margin: 0; overflow-x: auto;">{_html.escape(raw_json_str)}</pre>
    </div>
    """

    rows = ""
    for msg in messages:
        role = msg.get("role", "")
        content = str(msg.get("content", "")).strip()
        if not content:
            continue
        label = "Customer" if role == "user" else "Carl"
        if role == "assistant" and len(content) > 300:
            content = content[:297] + "..."
        colour = "#1e293b" if role == "user" else "#0f172a"
        border = "#3b82f6" if role == "assistant" else "#1e3a5f"
        safe = _html.escape(content).replace("\n", "<br>")
        rows += (
            f'<tr><td style="padding:10px 14px;background:{colour};'
            f'border-left:3px solid {border};border-radius:6px;'
            f'margin-bottom:6px;font-size:14px;color:#f1f5f9;">'
            f'<strong style="color:#64748b;font-size:11px;display:block;'
            f'margin-bottom:4px;">{label}</strong>{safe}</td></tr>'
            f'<tr><td style="height:6px"></td></tr>'
        )

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#0f172a;font-family:system-ui,sans-serif;color:#f1f5f9;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#1e293b;border-radius:10px;padding:20px;border:1px solid #334155;">
      <h2 style="color:#3b82f6;margin:0 0 4px;font-size:18px;">New TPD Lead</h2>
      <p style="color:#64748b;font-size:12px;margin:0 0 16px;">
        Carl chatbot &nbsp;·&nbsp; Session {session_id[:8]}… &nbsp;·&nbsp; Raw history attached as CSV
      </p>
      
      {details_html}
      
      {json_html}
      
      <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px; font-weight: bold; border-top: 1px solid #334155; padding-top: 16px;">
        RECENT CHAT LOG:
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        {rows}
      </table>
      <p style="color:#64748b;font-size:12px;margin-top:16px;border-top:1px solid #334155;
                padding-top:12px;">
        Reply direct or call <strong style="color:#f8fafc;">020 8058 6095</strong> to follow up.
      </p>
    </div>
  </div>
</body>
</html>"""


# ── Senders ───────────────────────────────────────────────────────────────────

def _send_email(session_id: str, messages: list[dict[str, Any]], ai_summary: dict[str, Any]) -> bool:
    if not (_SMTP_USER and _SMTP_PASS and _NOTIFY_EMAIL):
        print(
            "Email notifications not configured "
            "(ZOHO_SMTP_USER / ZOHO_SMTP_PASS / NOTIFY_EMAIL missing).",
            file=sys.stderr,
        )
        return False

    msg = EmailMessage()
    msg["Subject"] = f"New TPD lead — {ai_summary.get('name', 'Customer')} ({session_id[:8]})"
    msg["From"] = _FROM_EMAIL or _SMTP_USER
    msg["To"] = _NOTIFY_EMAIL
    msg.set_content(_plain_body(session_id, messages, ai_summary))
    msg.add_alternative(_html_body(session_id, messages, ai_summary), subtype="html")

    try:
        csv_bytes = _generate_csv(session_id)
        msg.add_attachment(
            csv_bytes,
            maintype="text",
            subtype="csv",
            filename=f"chat_history_{session_id[:8]}.csv"
        )
    except Exception as csv_exc:
        print(f"Failed to generate/attach CSV: {csv_exc}", file=sys.stderr)

    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(_SMTP_HOST, _SMTP_PORT, context=ctx) as server:
            server.login(_SMTP_USER, _SMTP_PASS)
            server.send_message(msg)
        print(f"Email notification sent for session {session_id[:8]}…", file=sys.stderr)
        return True
    except Exception as exc:
        print(f"Email notification error: {exc}", file=sys.stderr)
        return False


def _send_whatsapp(session_id: str, ai_summary: dict[str, Any]) -> bool:
    if not (_GREENAPI_ID and _GREENAPI_TOKEN and _JAMIE_WHATSAPP):
        return False
    try:
        from whatsapp_api_client_python import API  # type: ignore[import-untyped]

        lines = [
            "*New TPD Lead — Carl Chatbot*",
            "",
            f"*Name:* {ai_summary.get('name')}",
            f"*Vehicle:* {ai_summary.get('vehicle')}",
            f"*Reg:* {ai_summary.get('reg')}",
            f"*Location:* {ai_summary.get('location')}",
            "",
            f"*Summary:* {ai_summary.get('summary')}",
            "",
            f"Session ID: {session_id[:8]}",
        ]

        greenAPI = API.GreenAPI(_GREENAPI_ID, _GREENAPI_TOKEN)
        response = greenAPI.sending.sendMessage(
            f"{_JAMIE_WHATSAPP}@c.us", "\n".join(lines)
        )
        if response.status_code == 200:
            print(f"WhatsApp notification sent for session {session_id[:8]}…", file=sys.stderr)
            return True
        print(f"WhatsApp API {response.status_code}: {response.text}", file=sys.stderr)
        return False
    except Exception as exc:
        print(f"WhatsApp notification error: {exc}", file=sys.stderr)
        return False


# ── Public API ────────────────────────────────────────────────────────────────

def send_lead_notification(
    session_id: str,
    messages: list[dict[str, Any]],
) -> bool:
    """
    Send Jamie a lead notification with AI summary and CSV attachment.

    Attempts email first (always), then WhatsApp if credentials are present.
    Returns True if at least one channel succeeded.
    Does not raise — all errors are printed to stderr.
    """
    if not _has_phone(messages):
        return False

    ai_summary = _generate_ai_summary(messages)
    email_ok = _send_email(session_id, messages, ai_summary)
    whatsapp_ok = _send_whatsapp(session_id, ai_summary)
    return email_ok or whatsapp_ok
