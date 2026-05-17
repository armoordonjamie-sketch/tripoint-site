"""tpd-ads-api — FastAPI app for Google Ads ingest and query."""

from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv(Path(__file__).resolve().parent / ".env")

from database import init_db
from routes.analysis import router as analysis_router
from routes.ingest import router as ingest_router
from routes.query import router as query_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="tpd-ads-api", lifespan=lifespan)
app.include_router(ingest_router)
app.include_router(query_router)
app.include_router(analysis_router)
