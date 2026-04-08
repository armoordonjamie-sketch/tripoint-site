"""Shared check for GOOGLE_SERVICE_ACCOUNT_FILE / GOOGLE_APPLICATION_CREDENTIALS paths."""
from __future__ import annotations

import os
import re


def require_service_account_file_exists(path: str) -> None:
    """Fail fast when .env points at a missing file (common after copying .env from Windows)."""
    path = (path or "").strip()
    if not path:
        raise RuntimeError("Google service account file path is empty.")
    if os.path.isfile(path):
        return
    norm = path.replace("\\", "/")
    win_drive = bool(re.match(r"^[a-zA-Z]:/", norm))
    hint = ""
    if win_drive:
        hint = (
            " This value looks like a Windows path. Copy the JSON key onto the server "
            "(e.g. /var/www/tripoint/python-scripts/google-sa.json) and set "
            "GOOGLE_SERVICE_ACCOUNT_FILE or GOOGLE_APPLICATION_CREDENTIALS to that path."
        )
    raise RuntimeError(f"Google service account file not found: {path!r}.{hint}")
