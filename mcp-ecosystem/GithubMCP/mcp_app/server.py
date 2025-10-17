from __future__ import annotations
import os, base64, subprocess, requests
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI
from fastmcp import FastMCP

api = FastAPI(title="NyraMCP GitHub", version="1.0.1")

@api.get("/")
def root():
    return {"ok": True, "name": "NyraMCP", "mcp_path": "/mcp"}

BASE_DIR = Path(os.getenv("BASE_DIR","/data")).resolve()
BASE_DIR.mkdir(parents=True, exist_ok=True)

def _safe(p:str)->Path:
    q=(BASE_DIR / p.lstrip("/\\")).resolve()
    if not str(q).startswith(str(BASE_DIR)): raise ValueError("escape")
    return q

def _run(cmd:list[str], cwd:Optional[Path]=None, env=None):
    cp = subprocess.run(cmd, cwd=str(cwd) if cwd else None, env=env, capture_output=True, text=True)
    return {"ok": cp.returncode==0, "code": cp.returncode, "stdout": cp.stdout, "stderr": cp.stderr, "cmd": cmd, "cwd": str(cwd) if cwd else None}

mcp = FastMCP("NyraFS+GitHub")

# -------- FS
@mcp.tool()
def fs_list(path:str=".", include_hidden:bool=False, limit:int=500)->List[Dict[str,Any]]:
    d=_safe(path)
    if not d.exists(): raise FileNotFoundError(path)
    if not d.is_dir(): raise NotADirectoryError(path)
    out=[]
    for e in d.iterdir():
        if len(out)>=limit: break
        if not include_hidden and e.name.startswith("."): continue
        out.append({"name":e.name,"is_dir":e.is_dir(),"size":(e.stat().st_size if e.is_file() else None),"path":str(e.relative_to(BASE_DIR).as_posix())})
    return out

@mcp.tool()
def fs_write_text(path:str, content:str, overwrite:bool=True, encoding:str="utf-8")->Dict[str,Any]:
    p=_safe(path); p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists() and not overwrite: raise FileExistsError(path)
    p.write_text(content, encoding=encoding)
    return {"path": path, "bytes": p.stat().st_size}

# -------- Git
GIT_ENV = os.environ.copy()
GIT_ENV["GIT_AUTHOR_NAME"]  = os.getenv("GIT_AUTHOR_NAME","Nyra")
GIT_ENV["GIT_AUTHOR_EMAIL"] = os.getenv("GIT_AUTHOR_EMAIL","nyra@example.com")
GIT_ENV["GIT_COMMITTER_NAME"]  = GIT_ENV["GIT_AUTHOR_NAME"]
GIT_ENV["GIT_COMMITTER_EMAIL"] = GIT_ENV["GIT_AUTHOR_EMAIL"]

def _repo(p:str)->Path:
    r=_safe(p); r.mkdir(parents=True, exist_ok=True); return r

@mcp.tool()
def git_init(path:str)->Dict[str,Any]:
    return _run(["git","init"], cwd=_repo(path), env=GIT_ENV)

@mcp.tool()
def git_clone(url:str, path:str)->Dict[str,Any]:
    rdir=_safe(path)
    if rdir.exists():
        import shutil
        for n in rdir.iterdir(): shutil.rmtree(n) if n.is_dir() else n.unlink()
    rdir.mkdir(parents=True, exist_ok=True)
    return _run(["git","clone",url,"."], cwd=rdir, env=GIT_ENV)

@mcp.tool()
def git_add_commit(path:str, message:str="chore: update")->Dict[str,Any]:
    rdir=_repo(path)
    a=_run(["git","add","-A"], cwd=rdir, env=GIT_ENV)
    if not a["ok"]: return {"step":"add", **a}
    c=_run(["git","commit","-m",message], cwd=rdir, env=GIT_ENV)
    return {"add":a,"commit":c}

@mcp.tool()
def git_switch_branch(path:str, branch:str, create:bool=False)->Dict[str,Any]:
    rdir=_repo(path)
    args=["git","switch","-c",branch] if create else ["git","switch",branch]
    return _run(args, cwd=rdir, env=GIT_ENV)

@mcp.tool()
def git_push(path:str, remote:str="origin", branch:Optional[str]=None, set_upstream:bool=True)->Dict[str,Any]:
    rdir=_repo(path)
    args=["git","push",remote] + ([branch] if branch else [])
    if set_upstream and branch: args=["git","push","-u",remote,branch]
    return _run(args, cwd=rdir, env=GIT_ENV)

@mcp.tool()
def git_lfs_install(path:str)->Dict[str,Any]:
    return _run(["git","lfs","install","--local"], cwd=_repo(path), env=GIT_ENV)

@mcp.tool()
def git_lfs_track(path:str, pattern:str)->Dict[str,Any]:
    rdir=_repo(path)
    r=_run(["git","lfs","track",pattern], cwd=rdir, env=GIT_ENV)
    if r["ok"]: _run(["git","add",".gitattributes"], cwd=rdir, env=GIT_ENV)
    return r

# -------- GitHub REST
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
