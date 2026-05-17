@echo off
setlocal
rem Cursor/Claude stdio MCP (python server.py). This is NOT uvicorn — use start-uvicorn.bat for the HTTP API.
rem Loads env from tpd-ads-mcp\.env and google-ads-mcp\mcp\.env
cd /d "%~dp0..\tpd-ads-mcp"
python server.py
