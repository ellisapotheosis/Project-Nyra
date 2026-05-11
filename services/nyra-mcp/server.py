import os
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP

NYRA_MCP_PORT = int(os.getenv("NYRA_MCP_PORT", "3333"))

# Initialize FastMCP. Host/port are constructor settings in current mcp.
mcp = FastMCP("nyra-mcp", host="0.0.0.0", port=NYRA_MCP_PORT)

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
ORCHESTRATOR_URL = os.getenv("ORCHESTRATOR_URL", "http://nyra-orchestrator:8010").rstrip("/")

async def _log_audit(tool_name: str, payload: dict):
    """Log tool call to Orchestrator audit trail."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(
                f"{ORCHESTRATOR_URL}/audit/tool-call",
                json={
                    "tool_name": tool_name,
                    "arguments": payload,
                    "lead_id": payload.get("lead_id") or payload.get("borrower_id")
                }
            )
    except Exception as e:
        print(f"Audit logging failed: {e}")

@mcp.tool()
async def activepieces_trigger(webhook_path: str, payload: dict) -> dict:
    """Trigger an Activepieces webhook inside the docker network."""
    await _log_audit("activepieces_trigger", {"webhook_path": webhook_path, **payload})
    webhook_path = webhook_path if webhook_path.startswith("/") else "/" + webhook_path
    url = f"{AP_INTERNAL_BASE_URL}{webhook_path}"
    if not _is_allowed(url) and not _is_allowed(AP_INTERNAL_BASE_URL):
        return {"ok": False, "error": "Activepieces URL blocked by allowlist", "url": url}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload)
        return {"ok": resp.is_success, "status": resp.status_code, "text": resp.text[:200000]}

if __name__ == "__main__":
    mcp.run(transport="sse")
