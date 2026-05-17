"""SQLite checkpoint for resume across batches."""

from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path
from typing import Any


class CheckpointStore:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        con = sqlite3.connect(self.db_path)
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS keyword_checkpoint (
                norm TEXT NOT NULL,
                family TEXT NOT NULL,
                row_json TEXT NOT NULL,
                batch_id TEXT,
                created REAL NOT NULL,
                PRIMARY KEY (norm, family)
            )
            """
        )
        con.commit()
        con.close()

    def get(self, norm: str, family: str) -> dict[str, Any] | None:
        con = sqlite3.connect(self.db_path)
        cur = con.execute(
            "SELECT row_json FROM keyword_checkpoint WHERE norm = ? AND family = ?",
            (norm, family),
        )
        row = cur.fetchone()
        con.close()
        if not row:
            return None
        return json.loads(row[0])

    def put(
        self,
        norm: str,
        family: str,
        row_dict: dict[str, Any],
        batch_id: str,
    ) -> None:
        con = sqlite3.connect(self.db_path)
        con.execute(
            """
            INSERT OR REPLACE INTO keyword_checkpoint
            (norm, family, row_json, batch_id, created)
            VALUES (?, ?, ?, ?, ?)
            """,
            (norm, family, json.dumps(row_dict, ensure_ascii=False), batch_id, time.time()),
        )
        con.commit()
        con.close()

    def load_all(self) -> dict[tuple[str, str], dict[str, Any]]:
        con = sqlite3.connect(self.db_path)
        cur = con.execute("SELECT norm, family, row_json FROM keyword_checkpoint")
        out: dict[tuple[str, str], dict[str, Any]] = {}
        for norm, fam, js in cur.fetchall():
            out[(norm, fam)] = json.loads(js)
        con.close()
        return out
