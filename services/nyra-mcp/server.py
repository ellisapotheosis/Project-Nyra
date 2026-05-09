import os
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP
mcp = FastMCP("nyra-mcp")

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
    # Use standard run which handles transport based on arguments or defaults
    mcp.run(transport="sse")
