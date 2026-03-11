import os
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("nyra-mcp", stateless_http=True, json_response=True)

ALLOWLIST = [s.strip() for s in os.getenv("NYRA_HTTP_ALLOWLIST", "").split(",") if s.strip()]

TWENTY_SERVER_URL = os.getenv("TWENTY_SERVER_URL", "http://twenty-server:3000").rstrip("/")
TWENTY_API_KEY = os.getenv("TWENTY_API_KEY", "").strip()

N8N_INTERNAL_BASE_URL = os.getenv("N8N_INTERNAL_BASE_URL", "http://n8n-main:5678").rstrip("/")
AP_INTERNAL_BASE_URL = os.getenv("AP_INTERNAL_BASE_URL", "http://activepieces:80").rstrip("/")

def _is_allowed(url: str) -> bool:
    return any(url.startswith(p) for p in ALLOWLIST)

@mcp.tool()
def ping() -> str:
    """Health check."""
    return "pong"

@mcp.tool()
async def http_request(
    method: str,
    url: str,
    headers: Optional[dict[str, str]] = None,
    json_body: Optional[Any] = None,
    timeout_seconds: int = 30,
) -> dict:
    """Allowlist-enforced HTTP request."""
    if not _is_allowed(url):
        return {"ok": False, "error": "URL blocked by allowlist", "url": url, "allowlist": ALLOWLIST}

    method = method.upper().strip()
    if method not in {"GET","POST","PUT","PATCH","DELETE"}:
        return {"ok": False, "error": f"Unsupported method {method}"}

    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        resp = await client.request(method, url, headers=headers or {}, json=json_body)
        out: dict[str, Any] = {"ok": resp.is_success, "status": resp.status_code, "url": url, "text": resp.text[:200000]}
        try:
            out["json"] = resp.json()
        except Exception:
            pass
        return out

@mcp.tool()
async def twenty_graphql(query: str, variables: Optional[dict] = None) -> dict:
    """Call Twenty /graphql (workspace-specific schema)."""
    url = f"{TWENTY_SERVER_URL}/graphql"
    if not _is_allowed(url) and not _is_allowed(TWENTY_SERVER_URL):
        return {"ok": False, "error": "Twenty URL blocked by allowlist", "twenty": TWENTY_SERVER_URL, "allowlist": ALLOWLIST}

    headers = {"Content-Type": "application/json"}
    if TWENTY_API_KEY:
        headers["Authorization"] = f"Bearer {TWENTY_API_KEY}"

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=headers, json={"query": query, "variables": variables or {}})
        return {"ok": resp.is_success, "status": resp.status_code, "json": resp.json()}

@mcp.tool()
async def n8n_trigger(webhook_path: str, payload: dict) -> dict:
    """Trigger an n8n webhook inside the docker network."""
    webhook_path = webhook_path if webhook_path.startswith("/") else "/" + webhook_path
    url = f"{N8N_INTERNAL_BASE_URL}{webhook_path}"
    if not _is_allowed(url) and not _is_allowed(N8N_INTERNAL_BASE_URL):
        return {"ok": False, "error": "n8n URL blocked by allowlist", "url": url}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload)
        return {"ok": resp.is_success, "status": resp.status_code, "text": resp.text[:200000]}

@mcp.tool()
async def activepieces_trigger(webhook_path: str, payload: dict) -> dict:
    """Trigger an Activepieces webhook inside the docker network."""
    webhook_path = webhook_path if webhook_path.startswith("/") else "/" + webhook_path
    url = f"{AP_INTERNAL_BASE_URL}{webhook_path}"
    if not _is_allowed(url) and not _is_allowed(AP_INTERNAL_BASE_URL):
        return {"ok": False, "error": "Activepieces URL blocked by allowlist", "url": url}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload)
        return {"ok": resp.is_success, "status": resp.status_code, "text": resp.text[:200000]}

if __name__ == "__main__":
    mcp.settings.host = "0.0.0.0"
    mcp.settings.port = int(os.getenv("NYRA_MCP_PORT", "3333"))
    mcp.run(transport="streamable-http")
