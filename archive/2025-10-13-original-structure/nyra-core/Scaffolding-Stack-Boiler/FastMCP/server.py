from fastmcp import FastMCP
import os, json, urllib.parse, urllib.request, subprocess

mcp = FastMCP("NYRA-FastMCP")

def _env(name, default=None):
    return os.environ.get(name, default)

@mcp.tool
def fs_list(path: str = ".") -> list[str]:
    "List directory contents"
    try:
        return os.listdir(path)
    except Exception as e:
        return [f"ERROR: {e}"]

@mcp.tool
def fetch_url(url: str) -> str:
    "Fetch content via stdlib"
    try:
        with urllib.request.urlopen(url) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return f"ERROR: {e}"

@mcp.tool
def git_clone(repo_url: str, dest: str = "repos") -> str:
    "Clone a git repo into ./repos (relative)"
    try:
        os.makedirs(dest, exist_ok=True)
        subprocess.check_call(["git", "clone", repo_url], cwd=dest)
        return os.path.abspath(os.path.join(dest, os.path.basename(repo_url).replace(".git","")))
    except Exception as e:
        return f"ERROR: {e}"

@mcp.tool
def google_search(query: str, num: int = 5) -> dict:
    """Google Custom Search (JSON API). Requires GOOGLE_API_KEY and GOOGLE_CSE_ID.
    Returns {items:[{title, link, snippet}...]}
    """
    key = _env("GOOGLE_API_KEY")
    cse = _env("GOOGLE_CSE_ID")
    if not key or not cse:
        return {"error":"Missing GOOGLE_API_KEY and/or GOOGLE_CSE_ID"}
    params = urllib.parse.urlencode({"key": key, "cx": cse, "q": query, "num": max(1, min(num, 10))})
    url = f"https://www.googleapis.com/customsearch/v1?{params}"
    try:
        with urllib.request.urlopen(url) as r:
            data = json.loads(r.read().decode("utf-8", errors="ignore"))
        items = [{"title": it.get("title"), "link": it.get("link"), "snippet": it.get("snippet")} for it in data.get("items", [])]
        return {"query": query, "items": items}
    except Exception as e:
        return {"error": str(e)}

@mcp.tool
def firecrawl_scrape(url: str, extract: str = "article") -> dict:
    """Firecrawl scrape endpoint. Requires FIRECRAWL_API_KEY. 
    extract: 'article'|'links'|'raw' (depends on your Firecrawl plan/endpoint)
    """
    api_key = _env("FIRECRAWL_API_KEY")
    base = _env("FIRECRAWL_BASE_URL", "https://api.firecrawl.dev")
    if not api_key:
        return {"error":"Missing FIRECRAWL_API_KEY"}
    endpoint = f"{base.rstrip('/')}/v1/scrape"
    payload = json.dumps({"url": url, "extract": extract}).encode("utf-8")
    req = urllib.request.Request(endpoint, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {api_key}")
    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode("utf-8", errors="ignore"))
        return data
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    mcp.run()
