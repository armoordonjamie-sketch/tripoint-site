"""SQLite engine and session helpers."""

import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

_ROOT = Path(__file__).resolve().parent
load_dotenv(_ROOT / ".env")

_default_sqlite = _ROOT / "tpd_ads.db"
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{_default_sqlite.resolve().as_posix()}",
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def init_db() -> None:
    # Import models so SQLModel.metadata includes all tables
    from models import (  # noqa: F401
        Ad,
        AdGroup,
        AdSnapshot,
        Campaign,
        DailyMetric,
        Keyword,
        SearchTerm,
    )

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
