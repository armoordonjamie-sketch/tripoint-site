"""Attachment validation, storage, and OpenRouter content building."""

from __future__ import annotations

import base64
import re
import uuid
from io import BytesIO
from pathlib import Path
from typing import Any

from pypdf import PdfReader

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"

ALLOWED_MIME_TYPES = frozenset(
    {
        "image/jpeg",
        "image/png",
        "application/pdf",
    }
)

MIME_BY_EXTENSION = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".pdf": "application/pdf",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
MAX_FILES_PER_MESSAGE = 5


def ensure_uploads_dir() -> None:
    """Create the uploads directory if it does not exist."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def safe_filename(name: str) -> str:
    """Return a filesystem-safe filename."""
    base = Path(name).name
    cleaned = re.sub(r"[^\w.\-]", "_", base)
    return cleaned or "upload"


def detect_mime_type(filename: str, declared: str | None) -> str | None:
    """Resolve MIME type from extension and declared content type."""
    ext = Path(filename).suffix.lower()
    by_ext = MIME_BY_EXTENSION.get(ext)
    if by_ext:
        return by_ext
    if declared and declared.split(";")[0].strip().lower() in ALLOWED_MIME_TYPES:
        return declared.split(";")[0].strip().lower()
    return None


def validate_upload(filename: str, content_type: str | None, size: int) -> str:
    """Validate an upload and return its MIME type."""
    if size <= 0:
        raise ValueError("File is empty.")
    if size > MAX_FILE_SIZE_BYTES:
        raise ValueError("File exceeds the 10 MB limit.")
    mime = detect_mime_type(filename, content_type)
    if mime is None:
        raise ValueError("Only JPEG, PNG, and PDF files are allowed.")
    return mime


def save_upload_file(
    session_id: str,
    filename: str,
    mime_type: str,
    data: bytes,
) -> tuple[str, int]:
    """Save file bytes to disk and return relative path and size."""
    ensure_uploads_dir()
    session_dir = UPLOADS_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    attachment_id = uuid.uuid4().hex[:12]
    stored_name = f"{attachment_id}_{safe_filename(filename)}"
    file_path = session_dir / stored_name
    file_path.write_bytes(data)
    relative_path = str(file_path.relative_to(Path(__file__).resolve().parent))
    return relative_path, len(data)


def read_file_bytes(file_path: str) -> bytes:
    """Read stored attachment bytes from disk."""
    base = Path(__file__).resolve().parent
    return (base / file_path).read_bytes()


def extract_pdf_text(data: bytes) -> str:
    """Extract text from a PDF for inclusion in the model prompt."""
    reader = PdfReader(BytesIO(data))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text.strip())
    return "\n\n".join(parts).strip()


def build_user_content(
    text: str,
    attachments: list[dict[str, Any]],
) -> str | list[dict[str, Any]]:
    """Build OpenRouter-compatible user message content with attachments."""
    parts: list[dict[str, Any]] = []

    if text:
        parts.append({"type": "text", "text": text})

    for att in attachments:
        mime = att["mime_type"]
        filename = att["filename"]
        data = read_file_bytes(att["file_path"])

        if mime in ("image/jpeg", "image/png"):
            encoded = base64.b64encode(data).decode("ascii")
            parts.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime};base64,{encoded}",
                    },
                }
            )
        elif mime == "application/pdf":
            pdf_text = extract_pdf_text(data)
            if pdf_text:
                parts.append(
                    {
                        "type": "text",
                        "text": f"[Attached PDF: {filename}]\n{pdf_text}",
                    }
                )
            else:
                encoded = base64.b64encode(data).decode("ascii")
                parts.append(
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:application/pdf;base64,{encoded}",
                        },
                    }
                )

    if not parts:
        return ""
    if len(parts) == 1 and parts[0]["type"] == "text":
        return parts[0]["text"]
    return parts
