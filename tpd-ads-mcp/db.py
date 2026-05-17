"""Read-only SQLite access for TriPoint Google Ads data."""

from __future__ import annotations

import os
import re
import sqlite3
from pathlib import Path
from typing import Any

_FORBIDDEN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|ATTACH|DETACH|REPLACE|TRUNCATE)\b",
    re.IGNORECASE | re.DOTALL,
)


def _db_uri(path: str) -> str:
    p = Path(path).expanduser().resolve()
    if not p.exists():
        raise FileNotFoundError(f"Database file not found: {p}")
    return p.as_uri() + "?mode=ro"


def get_db_path() -> str:
    p = os.getenv("DB_PATH")
    if not p:
        raise RuntimeError("DB_PATH environment variable is not set")
    return str(Path(p).expanduser())


def assert_readonly_sql(sql: str) -> None:
    """Reject anything that is not a single read-only SELECT (or WITH … SELECT)."""
    s = sql.strip()
    if not s:
        raise ValueError("Empty SQL")
    # Disallow multiple statements
    core = s.rstrip().rstrip(";")
    if ";" in core:
        raise ValueError("Multiple SQL statements are not allowed")
    upper = s.upper().lstrip()
    if not (upper.startswith("SELECT") or upper.startswith("WITH")):
        raise ValueError("Only SELECT or WITH … SELECT queries are allowed")
    if _FORBIDDEN.search(s):
        raise ValueError(
            "SQL contains forbidden keyword (INSERT, UPDATE, DELETE, DROP, etc.)"
        )


def query(sql: str, params: tuple | list = ()) -> list[dict[str, Any]]:
    """Run a parameterized SELECT. Returns list of row dicts."""
    assert_readonly_sql(sql)
    path = get_db_path()
    conn = sqlite3.connect(_db_uri(path), uri=True)
    try:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(sql, tuple(params))
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def schema_summary() -> dict[str, Any]:
    """Table names and columns (read-only introspection, not via public query())."""
    path = get_db_path()
    conn = sqlite3.connect(_db_uri(path), uri=True)
    try:
        cur = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        )
        tables = [r[0] for r in cur.fetchall()]
        out: dict[str, Any] = {"tables": {}}
        for t in tables:
            info = conn.execute(f'PRAGMA table_info("{t}")').fetchall()
            out["tables"][t] = [
                {"name": row[1], "type": row[2], "notnull": bool(row[3]), "pk": row[5]}
                for row in info
            ]
        return out
    finally:
        conn.close()
