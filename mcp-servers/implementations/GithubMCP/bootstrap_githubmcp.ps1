# bootstrap_githubmcp.ps1
[CmdletBinding()]
param(
  [string]$ProjectRoot = "C:\Dev\Tools\MCP-Servers\GithubMCP",
  [string]$GithubToken = "",
  [string]$GitUserName = "Ellis Andersen",
  [string]$GitUserEmail = "ellis@example.com",
  [switch]$UseInfisical,
  [string]$InfisicalProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
  [string]$InfisicalEnv = "dev"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Dir($p){ if(!(Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

$Root   = $ProjectRoot
$AppDir = Join-Path $Root 'mcp_app'
$Data   = Join-Path $Root 'data'
Dir $Root; Dir $AppDir; Dir $Data

# ---- server.py (FS + Git + LFS + GitHub tools, No-Auth on /mcp) ----
$serverPy = @'
from __future__ import annotations
import os, base64, subprocess, requests
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI
from fastmcp import FastMCP

api = FastAPI(title="NyraMCP GitHub", version="1.0.0")
@api.get("/") 
def root(): return {"ok": True, "name": "NyraMCP", "mcp_path": "/mcp"}

BASE_DIR = Path(os.getenv("BASE_DIR","/data")).resolve(); BASE_DIR.mkdir(parents=True, exist_ok=True)
def _safe(p:str)->Path:
    q=(BASE_DIR / p.lstrip("/\\")).resolve()
    if not str(q).startswith(str(BASE_DIR)): raise ValueError("escape")
    return q

def _run(cmd:list[str], cwd:Optional[Path]=None, env=None):
    cp = subprocess.run(cmd, cwd=str(cwd) if cwd else None, env=env, capture_output=True, text=True)
    return {"ok": cp.returncode==0, "code": cp.returncode, "stdout": cp.stdout, "stderr": cp.stderr, "cmd": cmd, "cwd": str(cwd) if cwd else None}

mcp = FastMCP("NyraFS+GitHub")

# FS
@mcp.tool()
def fs_list(path:str=".", include_hidden:bool=False, limit:int=500)->List[Dict[str,Any]]:
    d=_safe(path); 
    if not d.exists(): raise FileNotFoundError(path)
    if not d.is_dir(): raise NotADirectoryError(path)
    out=[]; 
    for e in d.iterdir():
        if len(out)>=limit: break
        if not include_hidden and e.name.startswith("."): continue
        out.append({"name":e.name,"is_dir":e.is_dir(),"size":(e.stat().st_size if e.is_file() else None),"path":str(e.relative_to(BASE_DIR).as_posix())})
    return out

@mcp.tool()
def fs_write_text(path:str, content:str, overwrite:bool=True, encoding:str="utf-8")->Dict[str,Any]:
    p=_safe(path); p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists() and not overwrite: raise FileExistsError(path)
    p.write_text(content, encoding=encoding); 
    return {"path": path, "bytes": p.stat().st_size}

# Git basics
GIT_ENV = os.environ.copy()
for k in ["GIT_AUTHOR_NAME","GIT_AUTHOR_EMAIL","GIT_COMMITTER_NAME","GIT_COMMITTER_EMAIL"]:
    if k.endswith("_NAME"):    GIT_ENV[k]=os.getenv("GIT_AUTHOR_NAME","Nyra")
    else:                      GIT_ENV[k]=os.getenv("GIT_AUTHOR_EMAIL","nyra@example.com")

def _repo(p:str)->Path: r=_safe(p); r.mkdir(parents=True,exist_ok=True); return r

@mcp.tool()
def git_init(path:str)->Dict[str,Any]:
    r=_run(["git","init"], cwd=_repo(path), env=GIT_ENV); return r

@mcp.tool()
def git_clone(url:str, path:str)->Dict[str,Any]:
    rdir=_safe(path); 
    if rdir.exists(): 
        import shutil
        for n in rdir.iterdir(): shutil.rmtree(n) if n.is_dir() else n.unlink()
    rdir.mkdir(parents=True,exist_ok=True)
    return _run(["git","clone",url,"."], cwd=rdir, env=GIT_ENV)

@mcp.tool()
def git_add_commit(path:str, message:str="chore: update")->Dict[str,Any]:
    rdir=_repo(path); a=_run(["git","add","-A"], cwd=rdir, env=GIT_ENV)
    if not a["ok"]: return {"step":"add", **a}
    c=_run(["git","commit","-m",message], cwd=rdir, env=GIT_ENV)
    return {"add":a,"commit":c}

@mcp.tool()
def git_switch_branch(path:str, branch:str, create:bool=False)->Dict[str,Any]:
    rdir=_repo(path); args=["git","switch","-c",branch] if create else ["git","switch",branch]
    return _run(args, cwd=rdir, env=GIT_ENV)

@mcp.tool()
def git_push(path:str, remote:str="origin", branch:Optional[str]=None, set_upstream:bool=True)->Dict[str,Any]:
    rdir=_repo(path)
    args=["git","push",remote] + ([branch] if branch else [])
    if set_upstream and branch: args=["git","push","-u",remote,branch]
    return _run(args, cwd=rdir, env=GIT_ENV)

@mcp.tool()
def git_lfs_install(path:str)->Dict[str,Any]:
    rdir=_repo(path); return _run(["git","lfs","install","--local"], cwd=rdir, env=GIT_ENV)

@mcp.tool()
def git_lfs_track(path:str, pattern:str)->Dict[str,Any]:
    rdir=_repo(path); r=_run(["git","lfs","track",pattern], cwd=rdir, env=GIT_ENV)
    if r["ok"]: _run(["git","add",".gitattributes"], cwd=rdir, env=GIT_ENV)
    return r

# GitHub REST (PAT)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN","").strip()
GITHUB_API   = os.getenv("GITHUB_API","https://api.github.com").rstrip("/")
GH_H = {"Authorization": f"Bearer {GITHUB_TOKEN}","Accept":"application/vnd.github+json"} if GITHUB_TOKEN else {}

def _gh(url:str, method="GET", body=None, ok=(200,201,202)):
    if not GITHUB_TOKEN: return {"ok":False,"error":"Missing GITHUB_TOKEN"}
    resp = requests.request(method, url, headers=GH_H, json=body, timeout=30)
    return {"ok":resp.status_code in ok, "status":resp.status_code, "url":url, "body": resp.json() if resp.text else None}

@mcp.tool()
def gh_repo_create(name:str, description:str="", private:bool=True, org:Optional[str]=None, auto_init:bool=True)->Dict[str,Any]:
    endpoint = f"{GITHUB_API}/orgs/{org}/repos" if org else f"{GITHUB_API}/user/repos"
    body = {"name":name,"description":description,"private":private,"auto_init":auto_init}
    return _gh(endpoint, "POST", body, ok=(201,))

@mcp.tool()
def gh_branch_create(owner:str, repo:str, new_branch:str, from_branch:str="main")->Dict[str,Any]:
    base = _gh(f"{GITHUB_API}/repos/{owner}/{repo}/git/ref/heads/{from_branch}")
    if not base.get("ok"): return {"step":"get_base_ref", **base}
    sha = base["body"]["object"]["sha"]
    return _gh(f"{GITHUB_API}/repos/{owner}/{repo}/git/refs", "POST", {"ref":f"refs/heads/{new_branch}","sha":sha}, ok=(201,))

@mcp.tool()
def gh_pr_create(owner:str, repo:str, title:str, head:str, base:str="main", body:str="")->Dict[str,Any]:
    return _gh(f"{GITHUB_API}/repos/{owner}/{repo}/pulls", "POST", {"title":title,"head":head,"base":base,"body":body}, ok=(201,))

mcp_asgi = mcp.http_app(path="/mcp")
app = FastAPI(title="NyraMCP", routes=[*mcp_asgi.routes, *api.routes], lifespan=mcp_asgi.lifespan)
'@

# ---- Dockerfile: python + git + git-lfs ----
$dockerfile = @'
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 BASE_DIR=/data
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git git-lfs ca-certificates curl && \
    git lfs install --system && rm -rf /var/lib/apt/lists/*
COPY mcp_app /app/mcp_app
RUN pip install --no-cache-dir fastmcp==2.12.4 fastapi uvicorn requests
VOLUME ["/data"]
EXPOSE 8000
CMD ["uvicorn","mcp_app.server:app","--host","0.0.0.0","--port","8000"]
'@

# ---- docker-compose: isolated ports + env via ${VAR} (plays nice with Infisical) ----
$compose = @"
name: nyra-github-mcp
services:
  mcp:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    environment:
      - BASE_DIR=/data
      - MCP_API_KEY=           # No-Auth connector
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - GIT_AUTHOR_NAME=${GIT_AUTHOR_NAME}
      - GIT_AUTHOR_EMAIL=${GIT_AUTHOR_EMAIL}
    volumes: [ "./data:/data" ]
    ports: [ "8001:8000" ]
    networks: [ mcpnetgit ]
    restart: unless-stopped

  ngrok:
    image: ngrok/ngrok:latest
    depends_on: [ mcp ]
    ports: [ "4041:4040" ]
    command: [ "http", "mcp:8000", "--log=stdout" ]
    environment:
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
      - NGROK_API_KEY=${NGROK_API_KEY}
    networks: [ mcpnetgit ]
    restart: unless-stopped

networks:
  mcpnetgit: {}
"@

# ---- write files ----
$ServerPath = Join-Path $AppDir 'server.py'
$DockerfilePath = Join-Path $Root 'Dockerfile.mcp'
$ComposePath = Join-Path $Root 'docker-compose.yml'
$FormPath = Join-Path $Root 'CONNECTOR_CREATE_FORM.txt'

$serverPy     | Set-Content -Encoding UTF8 -LiteralPath $ServerPath
$dockerfile   | Set-Content -Encoding UTF8 -LiteralPath $DockerfilePath
$compose      | Set-Content -Encoding UTF8 -LiteralPath $ComposePath
"seed $(Get-Date -Format s)" | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $Data "hello.txt")

# ---- bring it up (optionally through Infisical) ----
Push-Location $Root
try {
  if ($UseInfisical) {
    $args = @("run","--env=$InfisicalEnv","--projectId=$InfisicalProjectId","--","docker","compose","up","-d","--build")
    & infisical @args
  } else {
    docker compose up -d --build | Out-Null
  }
} finally { Pop-Location }

# ---- wait for health + ngrok and emit connector form ----
function Wait-Url($u){ $deadline=(Get-Date).AddMinutes(3); while((Get-Date) -lt $deadline){ try{ $r=iwr $u -UseBasicParsing -TimeoutSec 5; if($r.StatusCode -eq 200){return $true} }catch{} Start-Sleep -Milliseconds 600 }; $false }
if(!(Wait-Url "http://127.0.0.1:8001/")){ throw "MCP not healthy on :8001" }
if(!(Wait-Url "http://127.0.0.1:4041/status")){ throw "ngrok admin not healthy on :4041" }
$pub = (Invoke-RestMethod "http://127.0.0.1:4041/api/tunnels").tunnels | ? { $_.public_url -like 'https://*' } | select -First 1 -ExpandProperty public_url
if(-not $pub){ throw "No https tunnel found from ngrok :4041" }
$connectorUrl = "$pub/mcp"

@"
Name:
Nyra Git/GitHub

Description:
Filesystem + git + git-lfs + GitHub (repo/branch/PR) tools.

Connector URL:
$connectorUrl

Authentication:
No Auth
"@ | Set-Content -Encoding UTF8 -LiteralPath $FormPath

Write-Host "Public MCP endpoint: $connectorUrl"
Write-Host "Paste EXACTLY from: $FormPath"
