# install_github_git_tools.ps1
# Upgrades NyraMCP to include Git + Git LFS + GitHub tools, rebuilds, re-exposes via ngrok,
# and regenerates ChatGPT connector paste-this files (No Auth).

[CmdletBinding()]
param(
  [string]$ProjectRoot = "C:\Dev\Tools\MCP-Servers\FileSystemMCP",
  [string]$GithubToken = "ghp_apotheosisPLACEHOLDER",
  [string]$GitUserName = "Ellis Andersen",
  [string]$GitUserEmail = "ellis@example.com"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Dir([string]$p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

$Root   = $ProjectRoot
$AppDir = Join-Path $Root 'mcp_app'
$Data   = Join-Path $Root 'data'
Ensure-Dir $Root; Ensure-Dir $AppDir; Ensure-Dir $Data

# --- server.py with FS + Git + GitHub tools ---
$serverPy = @'
from __future__ import annotations
import os, base64, subprocess, json, time
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Response
from fastmcp import FastMCP

# -------- Base API (health) --------
api = FastAPI(title="NyraMCP", version="2.0.0")

@api.get("/")
def root():
    return {"ok": True, "name": "NyraMCP", "mcp_path": "/mcp"}

# -------- Workspace base --------
BASE_DIR = Path(os.getenv("BASE_DIR", "/data")).resolve()
BASE_DIR.mkdir(parents=True, exist_ok=True)

def _safe_path(rel: str) -> Path:
    p = (BASE_DIR / rel.lstrip("/\\")).resolve()
    if not str(p).startswith(str(BASE_DIR)):
        raise ValueError("Path escapes base directory")
    return p

def _run(cmd: list[str], cwd: Optional[Path]=None, env: Optional[dict]=None) -> dict:
    cp = subprocess.run(cmd, cwd=str(cwd) if cwd else None, env=env, capture_output=True, text=True)
    return {"ok": cp.returncode == 0, "code": cp.returncode, "stdout": cp.stdout, "stderr": cp.stderr, "cmd": cmd, "cwd": str(cwd) if cwd else None}

# -------- MCP --------
mcp = FastMCP("NyraFS+GitHub")

# ===== Filesystem tools =====
@mcp.tool()
def fs_list(path: str = ".", include_hidden: bool = False, limit: int = 500) -> List[Dict[str, Any]]:
    """List entries in a directory under /data."""
    d = _safe_path(path)
    if not d.exists(): raise FileNotFoundError(f"{path} does not exist")
    if not d.is_dir(): raise NotADirectoryError(f"{path} is not a directory")
    out, c = [], 0
    for e in d.iterdir():
        if c >= limit: break
        if not include_hidden and e.name.startswith("."): continue
        out.append({"name": e.name, "is_dir": e.is_dir(), "size": (e.stat().st_size if e.is_file() else None), "path": str(e.relative_to(BASE_DIR).as_posix())})
        c += 1
    return out

@mcp.tool()
def fs_read_text(path: str, max_bytes: int = 1_000_000, encoding: str = "utf-8") -> Dict[str, Any]:
    """Read a small text/binary file relative to /data."""
    p = _safe_path(path)
    if not p.exists() or not p.is_file(): raise FileNotFoundError(path)
    data = p.read_bytes()[:max_bytes]
    try:
        text = data.decode(encoding, errors="replace")
        return {"path": path, "encoding": encoding, "text": text, "truncated": p.stat().st_size > len(data)}
    except Exception:
        return {"path": path, "base64": base64.b64encode(data).decode("ascii"), "truncated": p.stat().st_size > len(data)}

@mcp.tool()
def fs_write_text(path: str, content: str, overwrite: bool = True, encoding: str = "utf-8") -> Dict[str, Any]:
    """Write text to a file under /data."""
    p = _safe_path(path); p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists() and not overwrite: raise FileExistsError(path)
    p.write_text(content, encoding=encoding)
    return {"path": path, "bytes": p.stat().st_size}

# ===== Git helpers =====
GIT_ENV = os.environ.copy()
GIT_ENV["GIT_AUTHOR_NAME"]  = os.getenv("GIT_AUTHOR_NAME", "Nyra")
GIT_ENV["GIT_AUTHOR_EMAIL"] = os.getenv("GIT_AUTHOR_EMAIL", "nyra@example.com")
GIT_ENV["GIT_COMMITTER_NAME"]  = GIT_ENV["GIT_AUTHOR_NAME"]
GIT_ENV["GIT_COMMITTER_EMAIL"] = GIT_ENV["GIT_AUTHOR_EMAIL"]

def _repo_path(path: str) -> Path:
    rp = _safe_path(path)
    rp.mkdir(parents=True, exist_ok=True)
    return rp

@mcp.tool()
def git_init(path: str) -> Dict[str, Any]:
    """Initialize a git repo at /data/<path>."""
    rp = _repo_path(path)
    r = _run(["git","init"], cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r}

@mcp.tool()
def git_clone(url: str, path: str) -> Dict[str, Any]:
    """Clone repo URL into /data/<path> (overwrites if already exists)."""
    rp = _safe_path(path)
    if rp.exists(): 
        # Clean dir if non-empty
        for c in rp.glob("*"): 
            if c.is_file(): c.unlink()
            else:
                import shutil; shutil.rmtree(c)
    rp.mkdir(parents=True, exist_ok=True)
    r = _run(["git","clone", url, "."], cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r}

@mcp.tool()
def git_status(path: str) -> Dict[str, Any]:
    """git status --porcelain=v2 and current branch."""
    rp = _repo_path(path)
    s = _run(["git","status","--porcelain=v2"], cwd=rp, env=GIT_ENV)
    b = _run(["git","rev-parse","--abbrev-ref","HEAD"], cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), "branch": b.get("stdout","").strip(), "status": s}

@mcp.tool()
def git_set_remote(path: str, remote_url: str, name: str="origin") -> Dict[str, Any]:
    """Add or set remote."""
    rp = _repo_path(path)
    # Try set-url, else add
    r1 = _run(["git","remote","set-url", name, remote_url], cwd=rp, env=GIT_ENV)
    if r1["code"] != 0:
        r1 = _run(["git","remote","add", name, remote_url], cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r1}

@mcp.tool()
def git_add_commit(path: str, message: str="chore: update") -> Dict[str, Any]:
    """git add -A && git commit -m message (no push)."""
    rp = _repo_path(path)
    a = _run(["git","add","-A"], cwd=rp, env=GIT_ENV)
    if not a["ok"]: return {"step":"add", **a}
    c = _run(["git","commit","-m", message], cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), "add": a, "commit": c}

@mcp.tool()
def git_switch_branch(path: str, branch: str, create: bool=False) -> Dict[str, Any]:
    """Switch/create branch."""
    rp = _repo_path(path)
    args = ["git","switch","-c",branch] if create else ["git","switch",branch]
    r = _run(args, cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r}

@mcp.tool()
def git_pull(path: str, remote: str="origin", branch: Optional[str]=None) -> Dict[str, Any]:
    """git pull."""
    rp = _repo_path(path)
    args = ["git","pull", remote] + ([branch] if branch else [])
    r = _run(args, cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r}

@mcp.tool()
def git_push(path: str, remote: str="origin", branch: Optional[str]=None, set_upstream: bool=True) -> Dict[str, Any]:
    """git push (optionally sets upstream)."""
    rp = _repo_path(path)
    args = ["git","push", remote] + ([branch] if branch else [])
    if set_upstream and branch: args = ["git","push","-u",remote,branch]
    r = _run(args, cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r}

@mcp.tool()
def git_lfs_install(path: str) -> Dict[str, Any]:
    """git lfs install (repo-local)."""
    rp = _repo_path(path)
    r = _run(["git","lfs","install","--local"], cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r}

@mcp.tool()
def git_lfs_track(path: str, pattern: str) -> Dict[str, Any]:
    """git lfs track '<pattern>'."""
    rp = _repo_path(path)
    r = _run(["git","lfs","track", pattern], cwd=rp, env=GIT_ENV)
    if r["ok"]:
        _run(["git","add",".gitattributes"], cwd=rp, env=GIT_ENV)
    return {"path": str(rp.relative_to(BASE_DIR)), **r}

# ===== GitHub API tools (use PAT from env) =====
import requests
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN","").strip()
GITHUB_API   = os.getenv("GITHUB_API","https://api.github.com").rstrip("/")
GH_HEADERS   = {"Authorization": f"Bearer {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

def _gh(url: str, method="GET", json_body=None, params=None, expected=(200,201,202)):
    if not GITHUB_TOKEN:
        return {"ok": False, "error": "Missing GITHUB_TOKEN env"}
    resp = requests.request(method, url, headers={**GH_HEADERS,"Accept":"application/vnd.github+json"}, json=json_body, params=params, timeout=30)
    return {"ok": resp.status_code in expected, "status": resp.status_code, "body": resp.json() if resp.text else None, "url": url}

@mcp.tool()
def gh_repo_create(name: str, description: str="", private: bool=True, org: Optional[str]=None, auto_init: bool=True) -> Dict[str, Any]:
    """Create a GitHub repository (user or org)."""
    endpoint = f"{GITHUB_API}/orgs/{org}/repos" if org else f"{GITHUB_API}/user/repos"
    body = {"name": name, "description": description, "private": private, "auto_init": auto_init}
    r = _gh(endpoint, "POST", json_body=body, expected=(201,))
    return r

@mcp.tool()
def gh_branch_create(owner: str, repo: str, new_branch: str, from_branch: str="main") -> Dict[str, Any]:
    """Create a branch ref based on another branch."""
    # get base ref sha
    base = _gh(f"{GITHUB_API}/repos/{owner}/{repo}/git/ref/heads/{from_branch}")
    if not base.get("ok"): return {"step": "get_base_ref", **base}
    sha = base["body"]["object"]["sha"]
    body = {"ref": f"refs/heads/{new_branch}", "sha": sha}
    return _gh(f"{GITHUB_API}/repos/{owner}/{repo}/git/refs", "POST", json_body=body, expected=(201,))

@mcp.tool()
def gh_pr_create(owner: str, repo: str, title: str, head: str, base: str="main", body: str="") -> Dict[str, Any]:
    """Create a pull request."""
    payload = {"title": title, "head": head, "base": base, "body": body}
    return _gh(f"{GITHUB_API}/repos/{owner}/{repo}/pulls", "POST", json_body=payload, expected=(201,))

# -------- HTTP assembly --------
mcp_asgi = mcp.http_app(path="/mcp")
app = FastAPI(title="NyraMCP Combined", routes=[*mcp_asgi.routes, *api.routes], lifespan=mcp_asgi.lifespan)
'@

# --- Dockerfile: add git + git-lfs + python deps ---
$dockerfile = @'
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 BASE_DIR=/data
WORKDIR /app
# OS deps: git + git-lfs
RUN apt-get update && apt-get install -y --no-install-recommends git git-lfs ca-certificates curl && \
    git lfs install --system && \
    rm -rf /var/lib/apt/lists/*
COPY mcp_app /app/mcp_app
RUN pip install --no-cache-dir fastmcp==2.12.4 fastapi uvicorn requests
VOLUME ["/data"]
EXPOSE 8000
CMD ["uvicorn","mcp_app.server:app","--host","0.0.0.0","--port","8000"]
'@

# --- docker-compose with GitHub token + your existing ngrok ---
$compose = @"
services:
  mcp:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    container_name: nyramcp-mcp-1
    environment:
      - BASE_DIR=/data
      - MCP_API_KEY=   # keep connector No-Auth
      - GITHUB_TOKEN=${GithubToken}
      - GIT_AUTHOR_NAME=${GitUserName}
      - GIT_AUTHOR_EMAIL=${GitUserEmail}
    volumes:
      - ./data:/data
    ports:
      - "8000:8000"
    networks: [mcpnet]
    restart: unless-stopped

  ngrok:
    image: ngrok/ngrok:latest
    container_name: nyramcp-ngrok-1
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
    networks: [mcpnet]
    restart: unless-stopped

networks:
  mcpnet: {}
"@

# --- Write files ---
$ServerPath = Join-Path $AppDir 'server.py'
$DockerfilePath = Join-Path $Root 'Dockerfile.mcp'
$ComposePath = Join-Path $Root 'docker-compose.yml'
$Form1 = Join-Path $Root 'CONNECTOR_CREATE_FORM.txt'
$Form2 = Join-Path $Root 'CONNECTOR_CREATE_FORM_MSAPP.txt'

$serverPy | Set-Content -Encoding UTF8 -LiteralPath $ServerPath
$dockerfile | Set-Content -Encoding UTF8 -LiteralPath $DockerfilePath
$compose    | Set-Content -Encoding UTF8 -LiteralPath $ComposePath

# --- Seed workspace so Git can do something immediately ---
"seed $(Get-Date -Format s)" | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $Data "hello.txt")

# --- Redeploy ---
Push-Location $Root
try {
  docker compose down | Out-Null
  docker compose up -d --build | Out-Null
} finally {
  Pop-Location
}

# --- Wait for health and ngrok ---
function Wait-Url($u, $min=3){
  $deadline=(Get-Date).AddMinutes($min)
  while((Get-Date) -lt $deadline){
    try{ $r=Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 5; if($r.StatusCode -eq 200){ return $true } }catch{}
    Start-Sleep -Milliseconds 600
  }
  return $false
}

if(-not (Wait-Url "http://127.0.0.1:8000/")){ throw "MCP not healthy on :8000" }
if(-not (Wait-Url "http://127.0.0.1:4040/status")){ throw "ngrok admin not healthy on :4040" }

$tunnels = Invoke-RestMethod "http://127.0.0.1:4040/api/tunnels"
$pub = $tunnels.tunnels | ? { $_.public_url -like 'https://*' } | select -First 1 -ExpandProperty public_url
if(-not $pub){ throw "No https tunnel found" }
$connectorUrl = "$pub/mcp"

# --- Emit connector forms (No Auth) ---
$desc = @"
NyraMCP with filesystem + Git + GitHub tools.
- Git: clone/status/add+commit/pull/push/branches/LFS
- GitHub: create repo, create branch (ref), create PR
"@.Trim()

$txt = @"
===============================
ChatGPT Developer Mode → Connectors → Create
===============================
Name:
Nyra Git/GitHub

Description:
$desc

Connector URL:
$connectorUrl

Authentication:
No Auth
"@
$txt | Set-Content -Encoding UTF8 -LiteralPath $Form1
$txt | Set-Content -Encoding UTF8 -LiteralPath $Form2

Write-Host "Public MCP endpoint: $connectorUrl"
Write-Host "Connector forms written:"
Write-Host "  $Form1"
Write-Host "  $Form2"
