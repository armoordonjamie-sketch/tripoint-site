#!/usr/bin/env python3
"""
TriPoint Diagnostics Google Ads MCP server (stdio).

Loads DB_PATH and TPD_BUSINESS_CONTEXT from tpd-ads-mcp/.env, then
google-ads-mcp/mcp/.env (override), matching the Node MCP env layout.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

# Sibling checkout: TriPoint-site/google-ads-mcp (same layout as Node MCP in mcp/.env).
_GADS_HOME = _ROOT.parent / "google-ads-mcp"

load_dotenv(_ROOT / ".env")
_mcp_env = _GADS_HOME / "mcp" / ".env"
if _mcp_env.is_file():
    load_dotenv(_mcp_env, override=True)


def _resolve_db_path() -> None:
    raw = os.getenv("DB_PATH")
    if not raw:
        return
    p = Path(raw).expanduser()
    if p.is_absolute():
        return
    if _GADS_HOME.is_dir():
        os.environ["DB_PATH"] = str((_GADS_HOME / p).resolve())
    else:
        os.environ["DB_PATH"] = str((Path.cwd() / p).resolve())


_resolve_db_path()

from tools import register_tools  # noqa: E402
from tools import schema_meta  # noqa: E402

mcp = FastMCP(
    "TriPoint Google Ads",
    instructions=(
        "Read-only access to TriPoint Diagnostics Google Ads SQLite data (snapshots + "
        "daily_metric history). Use describe_schema first if unsure. All money is GBP."
    ),
)

n_tools = register_tools(mcp)


@mcp.resource("tpd://context")
def resource_tpd_context() -> str:
    """Business context string and database stats (same payload as get_business_context)."""
    return schema_meta.resource_context_json()


@mcp.resource("tpd://campaigns")
def resource_tpd_campaigns() -> str:
    """Distinct campaign names from daily_metric and latest snapshot."""
    return schema_meta.resource_campaigns_json()


def main() -> None:
    dbp = os.getenv("DB_PATH", "(not set)")
    sys.stderr.write(
        f"tpd-ads-mcp: DB_PATH={dbp} | tools={n_tools} | resources=2 (stdio)\n"
    )
    sys.stderr.flush()
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
