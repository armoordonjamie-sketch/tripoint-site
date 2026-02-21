"""
Local media storage for diagnostic report uploads.
"""
from __future__ import annotations

import os
import re
import shutil
import uuid
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv()

_script_dir = Path(__file__).resolve().parent.parent
MEDIA_DIR = Path(os.getenv("MEDIA_DIR") or str(_script_dir / "media"))
MEDIA_URL_PREFIX = os.getenv("MEDIA_URL_PREFIX", "/media")

# MIME type validation
ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}
ALLOWED_VIDEO = {"video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"}
ALLOWED_AUDIO = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"}
ALLOWED_DOC = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}
ALLOWED_TYPES = ALLOWED_IMAGE | ALLOWED_VIDEO | ALLOWED_AUDIO | ALLOWED_DOC

# Size limits in bytes
MAX_IMAGE_BYTES = 20 * 1024 * 1024   # 20MB
MAX_VIDEO_BYTES = 200 * 1024 * 1024  # 200MB
MAX_AUDIO_BYTES = 50 * 1024 * 1024   # 50MB
MAX_DOC_BYTES = 20 * 1024 * 1024     # 20MB


def _get_max_size(content_type: str) -> int:
    if content_type in ALLOWED_IMAGE:
        return MAX_IMAGE_BYTES
    if content_type in ALLOWED_VIDEO:
        return MAX_VIDEO_BYTES
    if content_type in ALLOWED_AUDIO:
        return MAX_AUDIO_BYTES
    return MAX_DOC_BYTES


def _infer_media_type(content_type: str) -> str:
    if content_type in ALLOWED_IMAGE:
        return "IMAGE"
    if content_type in ALLOWED_VIDEO:
        return "VIDEO"
    if content_type in ALLOWED_AUDIO:
        return "AUDIO"
    return "DOCUMENT"


def _sanitize_filename(filename: str) -> str:
    """Remove path traversal and unsafe chars."""
    base = os.path.basename(filename)
    base = re.sub(r'[^\w\s\-\.]', '', base)
    return base[:200] or "file"


def _get_ext(content_type: str, filename: str) -> str:
    """Infer extension from content type or filename."""
    ext_map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/quicktime": "mov",
        "video/x-msvideo": "avi",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    }
    if content_type in ext_map:
        return ext_map[content_type]
    if "." in filename:
        return filename.rsplit(".", 1)[-1].lower()[:10]
    return "bin"


async def save_upload(file: Any, report_id: str) -> dict[str, Any]:
    """
    Validate and save an uploaded file. Returns metadata dict.
    file: FastAPI UploadFile
    """
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_TYPES:
        raise ValueError(f"File type not allowed: {content_type}")

    max_size = _get_max_size(content_type)
    body = await file.read()
    size = len(body)
    if size > max_size:
        raise ValueError(f"File too large: {size} bytes (max {max_size})")

    filename = _sanitize_filename(file.filename or "upload")
    ext = _get_ext(content_type, filename)
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    storage_key = f"{report_id}/{unique_name}"

    target_path = MEDIA_DIR / storage_key
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_path, "wb") as f:
        f.write(body)

    media_type = _infer_media_type(content_type)
    return {
        "media_type": media_type,
        "filename": filename,
        "storage_key": storage_key,
        "content_type": content_type,
        "size_bytes": size,
    }


def delete_file(storage_key: str) -> bool:
    """Remove file from disk. Returns True if deleted, False if not found."""
    path = MEDIA_DIR / storage_key
    if not path.exists() or not path.is_file():
        return False
    path.unlink()
    return True


def get_serve_url(storage_key: str) -> str:
    """Return URL path for serving the file (e.g. /media/report_id/uuid.ext)."""
    prefix = MEDIA_URL_PREFIX.rstrip("/")
    return f"{prefix}/{storage_key}"
