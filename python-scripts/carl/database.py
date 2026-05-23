"""SQLite3 database setup and operations for Carl conversation logging."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "carl_conversations.db"

SESSIONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT
);
"""

MESSAGES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    tokens_used INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
"""

ATTACHMENTS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
"""

_MESSAGES_NEW_COLUMNS = ("prompt_tokens", "completion_tokens")
_SESSIONS_NEW_COLUMNS = ("lead_notified", "lead_pending")


def utc_now_iso() -> str:
    """Return current UTC time as ISO 8601 string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get_connection() -> sqlite3.Connection:
    """Open a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _migrate_messages_columns(conn: sqlite3.Connection) -> None:
    """Add prompt_tokens and completion_tokens if they do not exist yet."""
    existing = {
        row[1]
        for row in conn.execute("PRAGMA table_info(messages)").fetchall()
    }
    for col in _MESSAGES_NEW_COLUMNS:
        if col not in existing:
            conn.execute(f"ALTER TABLE messages ADD COLUMN {col} INTEGER")


def _migrate_sessions_columns(conn: sqlite3.Connection) -> None:
    """Add lead_notified to sessions if it does not exist yet."""
    existing = {
        row[1]
        for row in conn.execute("PRAGMA table_info(sessions)").fetchall()
    }
    for col in _SESSIONS_NEW_COLUMNS:
        if col not in existing:
            conn.execute(
                f"ALTER TABLE sessions ADD COLUMN {col} INTEGER NOT NULL DEFAULT 0"
            )


def init_db() -> None:
    """Create database tables and apply column migrations if needed."""
    with get_connection() as conn:
        conn.execute(SESSIONS_TABLE_SQL)
        conn.execute(MESSAGES_TABLE_SQL)
        conn.execute(ATTACHMENTS_TABLE_SQL)
        _migrate_messages_columns(conn)
        _migrate_sessions_columns(conn)
        conn.commit()


def session_exists(session_id: str) -> bool:
    """Return True if the session exists in the database."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM sessions WHERE session_id = ?",
            (session_id,),
        ).fetchone()
        return row is not None


def create_session(
    session_id: str,
    user_agent: str | None,
    ip_address: str | None,
) -> None:
    """Insert a new session row."""
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO sessions (session_id, created_at, user_agent, ip_address)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, utc_now_iso(), user_agent, ip_address),
        )
        conn.commit()


def log_message(
    session_id: str,
    role: str,
    content: str,
    tokens_used: int | None = None,
    prompt_tokens: int | None = None,
    completion_tokens: int | None = None,
) -> int:
    """Insert a message row for the given session and return its id."""
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO messages (
                session_id, role, content, timestamp,
                tokens_used, prompt_tokens, completion_tokens
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                role,
                content,
                utc_now_iso(),
                tokens_used,
                prompt_tokens,
                completion_tokens,
            ),
        )
        conn.commit()
        return int(cursor.lastrowid)


def save_attachment(
    message_id: int,
    session_id: str,
    filename: str,
    mime_type: str,
    file_path: str,
    size_bytes: int,
) -> int:
    """Insert an attachment row and return its id."""
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO attachments (
                message_id, session_id, filename, mime_type,
                file_path, size_bytes, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                message_id,
                session_id,
                filename,
                mime_type,
                file_path,
                size_bytes,
                utc_now_iso(),
            ),
        )
        conn.commit()
        return int(cursor.lastrowid)


def get_attachments_for_message(message_id: int) -> list[dict[str, Any]]:
    """Return attachment metadata for a message."""
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, filename, mime_type, file_path, size_bytes, created_at
            FROM attachments
            WHERE message_id = ?
            ORDER BY id ASC
            """,
            (message_id,),
        ).fetchall()
    return [
        {
            "id": row["id"],
            "filename": row["filename"],
            "mime_type": row["mime_type"],
            "file_path": row["file_path"],
            "size_bytes": row["size_bytes"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def get_attachment_by_id(attachment_id: int) -> dict[str, Any] | None:
    """Return a single attachment record by id."""
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT id, message_id, session_id, filename, mime_type,
                   file_path, size_bytes, created_at
            FROM attachments
            WHERE id = ?
            """,
            (attachment_id,),
        ).fetchone()
    if row is None:
        return None
    return {
        "id": row["id"],
        "message_id": row["message_id"],
        "session_id": row["session_id"],
        "filename": row["filename"],
        "mime_type": row["mime_type"],
        "file_path": row["file_path"],
        "size_bytes": row["size_bytes"],
        "created_at": row["created_at"],
    }


def get_session_history(session_id: str) -> list[dict[str, Any]]:
    """Return messages with attachments for API history reconstruction."""
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, role, content
            FROM messages
            WHERE session_id = ?
            ORDER BY id ASC
            """,
            (session_id,),
        ).fetchall()

    history: list[dict[str, Any]] = []
    for row in rows:
        entry: dict[str, Any] = {
            "role": row["role"],
            "content": row["content"],
            "attachments": get_attachments_for_message(int(row["id"])),
        }
        history.append(entry)
    return history


def get_all_sessions(limit: int = 50) -> list[dict[str, Any]]:
    """Return the most recent sessions with message counts."""
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT
                s.session_id,
                s.created_at,
                COUNT(m.id) AS message_count
            FROM sessions s
            LEFT JOIN messages m ON m.session_id = s.session_id
            GROUP BY s.session_id, s.created_at
            ORDER BY s.created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [
        {
            "session_id": row["session_id"],
            "created_at": row["created_at"],
            "message_count": row["message_count"],
        }
        for row in rows
    ]


def is_lead_notified(session_id: str) -> bool:
    """Return True if a WhatsApp notification has already been sent for this session."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT lead_notified FROM sessions WHERE session_id = ?",
            (session_id,),
        ).fetchone()
    return bool(row and row["lead_notified"])


def mark_lead_notified(session_id: str) -> None:
    """Mark the session as having had its lead notification sent."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE sessions SET lead_notified = 1, lead_pending = 0 WHERE session_id = ?",
            (session_id,),
        )
        conn.commit()


def is_lead_pending(session_id: str) -> bool:
    """Return True if a phone was seen last turn but the notification hasn't fired yet."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT lead_pending FROM sessions WHERE session_id = ?",
            (session_id,),
        ).fetchone()
    return bool(row and row["lead_pending"])


def set_lead_pending(session_id: str) -> None:
    """Flag that a phone number was seen — send notification on the next Carl response."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE sessions SET lead_pending = 1 WHERE session_id = ?",
            (session_id,),
        )
        conn.commit()


def get_session_detail(session_id: str) -> list[dict[str, Any]]:
    """Return all messages for a session for the review endpoint."""
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, role, content, timestamp,
                   tokens_used, prompt_tokens, completion_tokens
            FROM messages
            WHERE session_id = ?
            ORDER BY id ASC
            """,
            (session_id,),
        ).fetchall()

    messages: list[dict[str, Any]] = []
    for row in rows:
        message_id = int(row["id"])
        messages.append(
            {
                "role": row["role"],
                "content": row["content"],
                "timestamp": row["timestamp"],
                "tokens_used": row["tokens_used"],
                "prompt_tokens": row["prompt_tokens"],
                "completion_tokens": row["completion_tokens"],
                "attachments": get_attachments_for_message(message_id),
            }
        )
    return messages
