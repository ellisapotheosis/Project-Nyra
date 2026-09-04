"""Shared fixtures for the LiteLLM MCP parity suite.

This suite is the DELETION GATE for Nexus. `services/nexus-router/` and the
Grafbase Nexus deployment may only be removed once the scenarios in
`test_mcp_parity.py` pass against the LiteLLM control plane.

Everything is driven by environment variables. Nothing is hard-coded and no
credential is ever printed. Tests SKIP (not fail) when a credential is absent,
so a secretless CI run stays green while an unrun gate is still visibly unmet -
`test_parity_gate.py::test_gate_report` prints exactly which scenarios were
actually exercised.

Required for a real parity run:

    LITELLM_BASE_URL              default http://100.64.0.3:4000
    NYRA_LITELLM_DEV_KEY          scoped key, group nyra-dev, Tool Search ON
    NYRA_LITELLM_MORTGAGE_KEY     scoped key, group nyra-mortgage
    NYRA_LITELLM_NOSEARCH_KEY     scoped key with mcp_tool_search_enabled FALSE

Optional (Cloudflare edge scenarios):

    NYRA_MCP_PORTAL_URL           https://<portal host>/<path>
    CF_ACCESS_CLIENT_ID
    CF_ACCESS_CLIENT_SECRET
"""

from __future__ import annotations

import json
import os
import time
import uuid

import httpx
import pytest

MCP_PROTOCOL_VERSION = "2025-06-18"
DEFAULT_TIMEOUT = 30.0


def _env(name: str, default: str | None = None) -> str | None:
    v = os.environ.get(name, default)
    return v.strip() if isinstance(v, str) and v.strip() else default


@pytest.fixture(scope="session")
def base_url() -> str:
    return _env("LITELLM_BASE_URL", "http://100.64.0.3:4000")


@pytest.fixture(scope="session")
def mcp_url(base_url: str) -> str:
    """LiteLLM's aggregated MCP endpoint.

    `/mcp` is mounted as a sub-ASGI app, so it does not appear in
    /openapi.json. Absence from the OpenAPI document is expected and is not
    evidence that the endpoint is missing. See docs/refactor/LITELLM_ENDPOINTS.md.
    """
    return f"{base_url.rstrip('/')}/mcp"


def _require(name: str) -> str:
    v = _env(name)
    if not v:
        pytest.skip(f"{name} not set - parity scenario not exercised")
    return v


@pytest.fixture(scope="session")
def dev_key() -> str:
    return _require("NYRA_LITELLM_DEV_KEY")


@pytest.fixture(scope="session")
def mortgage_key() -> str:
    return _require("NYRA_LITELLM_MORTGAGE_KEY")


@pytest.fixture(scope="session")
def nosearch_key() -> str:
    return _require("NYRA_LITELLM_NOSEARCH_KEY")


@pytest.fixture(scope="session")
def portal() -> dict[str, str]:
    url = _require("NYRA_MCP_PORTAL_URL")
    return {
        "url": url,
        "client_id": _require("CF_ACCESS_CLIENT_ID"),
        "client_secret": _require("CF_ACCESS_CLIENT_SECRET"),
    }


class MCPSession:
    """Minimal streamable-HTTP MCP client.

    Deliberately dependency-free so the gate does not rely on an SDK whose
    version drift could mask a real regression.
    """

    def __init__(self, url: str, token: str, extra_headers: dict[str, str] | None = None):
        self.url = url
        self.session_id: str | None = None
        self._headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Authorization": f"Bearer {token}",
            **(extra_headers or {}),
        }
        self._client = httpx.Client(timeout=DEFAULT_TIMEOUT)
        self.last_status: int | None = None
        self.last_latency_ms: float | None = None

    # -- transport ---------------------------------------------------------
    def _post(self, payload: dict) -> httpx.Response:
        headers = dict(self._headers)
        if self.session_id:
            headers["mcp-session-id"] = self.session_id
        t0 = time.perf_counter()
        resp = self._client.post(self.url, headers=headers, content=json.dumps(payload))
        self.last_latency_ms = (time.perf_counter() - t0) * 1000
        self.last_status = resp.status_code
        if not self.session_id and resp.headers.get("mcp-session-id"):
            self.session_id = resp.headers["mcp-session-id"]
        return resp

    @staticmethod
    def _decode(resp: httpx.Response) -> dict:
        """Accept both plain JSON and SSE framing."""
        text = resp.text
        ctype = resp.headers.get("content-type", "")
        if "text/event-stream" in ctype:
            for line in text.splitlines():
                if line.startswith("data:"):
                    return json.loads(line[5:].strip())
            raise AssertionError("SSE response contained no data frame")
        return json.loads(text)

    # -- protocol ----------------------------------------------------------
    def initialize(self) -> dict:
        resp = self._post(
            {
                "jsonrpc": "2.0",
                "id": str(uuid.uuid4()),
                "method": "initialize",
                "params": {
                    "protocolVersion": MCP_PROTOCOL_VERSION,
                    "capabilities": {},
                    "clientInfo": {"name": "nyra-parity-gate", "version": "1.0"},
                },
            }
        )
        resp.raise_for_status()
        body = self._decode(resp)
        self._post({"jsonrpc": "2.0", "method": "notifications/initialized"})
        return body

    def call(self, method: str, params: dict | None = None) -> tuple[int, dict]:
        resp = self._post(
            {
                "jsonrpc": "2.0",
                "id": str(uuid.uuid4()),
                "method": method,
                "params": params or {},
            }
        )
        if resp.status_code >= 400:
            return resp.status_code, {"http_error": resp.status_code}
        return resp.status_code, self._decode(resp)

    def tools_list(self) -> list[dict]:
        _, body = self.call("tools/list")
        return body.get("result", {}).get("tools", [])

    def close(self) -> None:
        self._client.close()


@pytest.fixture
def dev_session(mcp_url: str, dev_key: str):
    s = MCPSession(mcp_url, dev_key)
    s.initialize()
    yield s
    s.close()


@pytest.fixture
def mortgage_session(mcp_url: str, mortgage_key: str):
    s = MCPSession(mcp_url, mortgage_key)
    s.initialize()
    yield s
    s.close()


@pytest.fixture
def nosearch_session(mcp_url: str, nosearch_key: str):
    s = MCPSession(mcp_url, nosearch_key)
    s.initialize()
    yield s
    s.close()


# --- evidence collection --------------------------------------------------

_EVIDENCE: list[dict] = []


def record(scenario: str, *, status, latency_ms=None, tool=None, note=None, schema_tokens=None):
    """Capture per-scenario evidence for the parity report.

    Never record a credential, a header value, or raw tool output.
    """
    _EVIDENCE.append(
        {
            "scenario": scenario,
            "status": status,
            "latency_ms": round(latency_ms, 1) if latency_ms else None,
            "tool_selected": tool,
            "tool_schema_token_estimate": schema_tokens,
            "note": note,
        }
    )


@pytest.fixture(scope="session")
def evidence() -> list[dict]:
    return _EVIDENCE


def pytest_sessionfinish(session, exitstatus):  # noqa: ARG001
    if not _EVIDENCE:
        return
    out = os.environ.get("NYRA_PARITY_EVIDENCE", "tests/results/mcp-parity-evidence.json")
    try:
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(_EVIDENCE, fh, indent=2)
        print(f"\n[parity] evidence written to {out} ({len(_EVIDENCE)} scenarios)")
    except OSError as exc:  # pragma: no cover
        print(f"\n[parity] could not write evidence: {exc}")


def estimate_schema_tokens(tools: list[dict]) -> int:
    """Rough token estimate for a tool catalogue (~4 chars/token).

    Used only for the before/after context-cost comparison in the migration
    report. Not a billing figure.
    """
    return len(json.dumps(tools)) // 4
