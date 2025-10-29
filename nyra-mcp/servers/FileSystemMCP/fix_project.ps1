[CmdletBinding()]
param(
  [string]$ProjectRoot = "C:\Dev\Tools\MCP-Servers\FileSystemMCP"
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$Root = $ProjectRoot
$AppDir = Join-Path $Root 'mcp_app'
$DataDir = Join-Path $Root 'data'
$DockerfilePath  = Join-Path $Root 'Dockerfile.mcp'
$ComposePath     = Join-Path $Root 'docker-compose.yml'
$DockerIgnore    = Join-Path $Root '.dockerignore'
$ServerPy        = Join-Path $AppDir 'server.py'
function Ensure-Dir([string]$Path){ if(-not(Test-Path -LiteralPath $Path)){ New-Item -ItemType Directory -Path $Path | Out-Null } }
Ensure-Dir $Root; Ensure-Dir $AppDir; Ensure-Dir $DataDir
# write files if not present
if(-not(Test-Path $ServerPy)){ @'
from __future__ import annotations
import os, base64
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, Request
from fastmcp import FastMCP

api = FastAPI(title="FileSystemMCP", version="1.0.0")

@api.get("/", summary="healthcheck")
def root():
    return {"ok": True, "name": "FileSystemMCP", "mcp_path": "/mcp"}

BASE_DIR = Path(os.getenv("BASE_DIR", "/data")).resolve()
BASE_DIR.mkdir(parents=True, exist_ok=True)

def _safe_path(user_path: str) -> Path:
    p = (BASE_DIR / user_path.lstrip("/\\")).resolve()
    if not str(p).startswith(str(BASE_DIR)):
        raise ValueError("Path escapes base directory")
    return p

mcp = FastMCP("NyraFS")

@mcp.tool()
def fs_list(path: str = ".", include_hidden: bool = False, limit: int = 500) -> List[Dict[str, Any]]:
    p = _safe_path(path)
    if not p.exists():
        raise FileNotFoundError(f"{path} does not exist")
    if not p.is_dir():
        raise NotADirectoryError(f"{path} is not a directory")
    out = []
    count = 0
    for entry in p.iterdir():
        if count >= limit:
            break
        name = entry.name
        if not include_hidden and name.startswith("."):
            continue
        out.append({
            "name": name,
            "is_dir": entry.is_dir(),
            "size": entry.stat().st_size if entry.is_file() else None,
            "path": str(entry.relative_to(BASE_DIR).as_posix()),
        })
        count += 1
    return out

@mcp.tool()
def fs_read_text(path: str, max_bytes: int = 1_000_000, encoding: str = "utf-8") -> Dict[str, Any]:
    p = _safe_path(path)
    if not p.exists() or not p.is_file():
        raise FileNotFoundError(f"{path} not found")
    data = p.read_bytes()[:max_bytes]
    try:
        text = data.decode(encoding, errors="replace")
        return {"path": path, "encoding": encoding, "text": text, "truncated": p.stat().st_size > len(data)}
    except Exception:
        b64 = base64.b64encode(data).decode("ascii")
        return {"path": path, "base64": b64, "truncated": p.stat().st_size > len(data)}

@mcp.tool()
def fs_write_text(path: str, content: str, overwrite: bool = True, encoding: str = "utf-8") -> Dict[str, Any]:
    p = _safe_path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists() and not overwrite:
        raise FileExistsError(f"{path} already exists")
    p.write_text(content, encoding=encoding)
    return {"path": path, "bytes": p.stat().st_size}

@mcp.tool()
def fs_mkdir(path: str, exist_ok: bool = True) -> Dict[str, Any]:
    p = _safe_path(path)
    p.mkdir(parents=True, exist_ok=exist_ok)
    return {"path": path, "created": True}

@mcp.tool()
def fs_remove(path: str, recursive: bool = False) -> Dict[str, Any]:
    p = _safe_path(path)
    if not p.exists():
        return {"path": path, "removed": False, "reason": "not found"}
    if p.is_dir():
        if recursive:
            import shutil
            shutil.rmtree(p)
            return {"path": path, "removed": True, "type": "dir", "recursive": True}
        else:
            p.rmdir()
            return {"path": path, "removed": True, "type": "dir"}
    else:
        p.unlink()
        return {"path": path, "removed": True, "type": "file"}

# Optional API key for MCP path
REQUIRED_KEY = os.getenv("MCP_API_KEY", "").strip()
mcp_asgi = mcp.http_app(path="/mcp")

if REQUIRED_KEY:
    from starlette.middleware.base import BaseHTTPMiddleware
    from fastapi import Response
    class KeyMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            if request.url.path.startswith("/mcp"):
                got = request.headers.get("authorization","")
                token = ""
                if got.lower().startswith("bearer "):
                    token = got[7:].strip()
                if not token:
                    token = request.headers.get("x-api-key","").strip()
                if token != REQUIRED_KEY:
                    return Response("Unauthorized", status_code=401)
            return await call_next(request)
    app = FastAPI(title="FileSystemMCP Combined", routes=[*mcp_asgi.routes, *api.routes], lifespan=mcp_asgi.lifespan)
    app.add_middleware(KeyMiddleware)
else:
    app = FastAPI(title="FileSystemMCP Combined", routes=[*mcp_asgi.routes, *api.routes], lifespan=mcp_asgi.lifespan)

'@ | Set-Content -Encoding UTF8 -LiteralPath $ServerPy }
if(-not(Test-Path $DockerfilePath)){ @'
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 BASE_DIR=/data
WORKDIR /app
COPY mcp_app /app/mcp_app
RUN pip install --no-cache-dir fastmcp==2.12.4 fastapi uvicorn
VOLUME ["/data"]
EXPOSE 8000
CMD ["uvicorn","mcp_app.server:app","--host","0.0.0.0","--port","8000"]

'@ | Set-Content -Encoding UTF8 -LiteralPath $DockerfilePath }
@'
services:
  mcp:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    container_name: FileSystemMCP-mcp-1
    environment:
      - BASE_DIR=/data
      - MCP_API_KEY=apotheosis2142
    volumes:
      - ./data:/data
    ports:
      - "8000:8000"
    networks: [mcpnet]
    restart: unless-stopped

  ngrok:
    image: ngrok/ngrok:latest
    container_name: FileSystemMCP-ngrok-1
    depends_on:
      - mcp
    ports:
      - "4040:4040"
    command:
      - "http"
      - "mcp:8000"
      - "--log=stdout"
    environment:
      - NGROK_AUTHTOKEN=342u1RKgsUdqKdsFAULKog4bYOi_eWjUXBr6WrAJefn7UjsV
      - NGROK_API_KEY=342uszUwmwbdkFLeb4434b0iRLC_2SFP9wDMgcruZBbUaejBz
    networks:
      - mcpnet
    restart: unless-stopped

networks:
  mcpnet: {}

'@ | Set-Content -Encoding UTF8 -LiteralPath $ComposePath
@'
**/__pycache__/
**/.pytest_cache/
**/*.pyc
**/*.pyo
**/*.pyd
.env
.git
.gitignore
.vscode
.idea

'@ | Set-Content -Encoding UTF8 -LiteralPath $DockerIgnore
# seed data
"hello from NyraFS $(Get-Date -Format s)" | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $DataDir "hello.txt")
Push-Location $Root
try { docker compose down | Out-Null; docker compose up -d --build } finally { Pop-Location }
Write-Host "Stack started. Health at http://localhost:8000/ . Ngrok admin at http://localhost:4040/"
