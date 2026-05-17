@echo off
setlocal
rem FastAPI tpd-ads-api (HTTP). Not the stdio MCP — use start-mcp-server.bat for that.
cd /d "%~dp0"
uvicorn main:app --host 127.0.0.1 --port 5173 --reload
