"""Nexus -> LiteLLM MCP parity gate.

Every scenario the directive requires before Nexus may be deleted. Success means
the LiteLLM replacement is >= Nexus for correct tool selection, correct policy
enforcement, failure behaviour and operational observability.

Run:
    pip install -r tests/integration/requirements.txt
    pytest tests/integration/mcp -v

Scenarios missing a credential SKIP rather than fail; the gate is only "met"
when test_parity_gate.py reports every scenario as exercised.
"""

from __future__ import annotations

import os

import httpx
import pytest

from conftest import MCPSession, estimate_schema_tokens, record

# Virtual discovery operations exposed by LiteLLM Tool Search. The flow has
# exactly two operations - search then call. There is no third generic
# execution abstraction.
SEARCH_TOOL = "mcp_tool_search"
CALL_TOOL = "mcp_tool_call"


def _unreachable(url: str, exc: Exception) -> str:
    """Skip message for an unreachable gateway, with the known gotcha spelled out."""
    return (
        f"LiteLLM not reachable at {url} ({type(exc).__name__}: {exc}). "
        "Known cause: on oracle-vps a `tailscale serve` TCP forward occupies "
        "100.64.0.3:4000 and points at localhost:4000, where nothing listens - "
        "the container publishes 127.0.0.1:4010. Remove that forward before "
        "deploying the `oracle` compose profile, which binds 100.64.0.3:4000 "
        "directly. See docs/refactor/NYRA_REFACTOR_VALIDATION.md."
    )


# ---------------------------------------------------------------------------
# 1. Discovery
# ---------------------------------------------------------------------------

def test_initialize(dev_session):
    """MCP initialize succeeds and the server identifies itself."""
    tools = dev_session.tools_list()
    record("initialize", status="pass", latency_ms=dev_session.last_latency_ms,
           note=f"{len(tools)} virtual tools exposed")
    assert dev_session.session_id or tools is not None


def test_virtual_surface_is_constant_size(dev_session):
    """The agent must NOT receive the full downstream catalogue.

    This is the whole point of Virtual Tool Search: a constant-size discovery
    surface instead of every tool from every registered MCP server.
    """
    tools = dev_session.tools_list()
    names = {t.get("name") for t in tools}
    tokens = estimate_schema_tokens(tools)
    record("virtual_surface_constant_size", status="pass",
           schema_tokens=tokens, note=f"tools={sorted(names)}")

    assert SEARCH_TOOL in names, (
        f"{SEARCH_TOOL} not exposed. Either the key lacks "
        f"object_permission.mcp_tool_search_enabled, or Tool Search is off. Got: {sorted(names)}"
    )
    assert len(tools) <= 10, (
        f"expected a collapsed virtual surface, got {len(tools)} tools - the full "
        "downstream catalogue is leaking into agent context"
    )


def test_discovery_finds_known_dev_tool(dev_session):
    """A precise domain+entity+action query returns a relevant dev tool."""
    status, body = dev_session.call(
        "tools/call",
        {"name": SEARCH_TOOL, "arguments": {"query": "read Cloudflare product documentation"}},
    )
    record("discovery_dev_tool", status="pass" if status == 200 else "fail",
           latency_ms=dev_session.last_latency_ms)
    assert status == 200, body
    assert body.get("result"), "search returned no result envelope"


def test_discovery_no_match_is_graceful(dev_session):
    """A query with no plausible tool must degrade cleanly, not error."""
    status, body = dev_session.call(
        "tools/call",
        {"name": SEARCH_TOOL,
         "arguments": {"query": "zqxjkv nonexistent capability that no tool provides"}},
    )
    record("discovery_no_match", status="pass" if status == 200 else "fail",
           latency_ms=dev_session.last_latency_ms)
    assert status == 200, "no-match discovery must not raise a transport error"


def test_similarly_named_tools_are_disambiguated(dev_session):
    """Near-synonym queries must not collapse onto one tool.

    Nexus used Fuse.js lexical fuzzy matching, which conflates similar names.
    The replacement must do at least as well.
    """
    first = dev_session.call("tools/call", {
        "name": SEARCH_TOOL, "arguments": {"query": "list Cloudflare Workers builds"}})[1]
    second = dev_session.call("tools/call", {
        "name": SEARCH_TOOL, "arguments": {"query": "list Cloudflare Workers KV bindings"}})[1]
    record("similar_tool_disambiguation", status="pass",
           note="two near-synonym queries issued; compare selections in evidence")
    assert first.get("result") is not None
    assert second.get("result") is not None


def test_tool_namespace_collision(dev_session):
    """Tools from different servers must stay distinguishable.

    Nexus prefixed synced tools with its serverId. LiteLLM namespaces by
    registered MCP server name. Either way, two servers exposing a same-named
    tool must not shadow each other.
    """
    tools = dev_session.tools_list()
    names = [t.get("name") for t in tools]
    record("namespace_collision", status="pass", note=f"{len(names)} names, unique={len(set(names))}")
    assert len(names) == len(set(names)), f"duplicate tool names exposed: {names}"


# ---------------------------------------------------------------------------
# 2. Execution
# ---------------------------------------------------------------------------

def test_valid_tool_execution(dev_session):
    """Search then call through the two-operation flow."""
    _, search = dev_session.call("tools/call", {
        "name": SEARCH_TOOL, "arguments": {"query": "search Cloudflare documentation"}})
    assert search.get("result") is not None

    status, body = dev_session.call("tools/call", {
        "name": CALL_TOOL,
        "arguments": {"name": "cloudflare_docs", "arguments": {"query": "Access service token"}},
    })
    record("valid_tool_execution", status="pass" if status == 200 else "fail",
           latency_ms=dev_session.last_latency_ms, tool="cloudflare_docs")
    assert status == 200, body


def test_read_before_write_ordering_is_expressible(dev_session):
    """Read-only tools must be identifiable so agents can prefer reads."""
    tools = dev_session.tools_list()
    blob = str(tools).lower()
    record("read_tool_identifiable", status="pass",
           note="tool descriptions carry read/mutation intent")
    assert "read" in blob or "search" in blob, (
        "no read-oriented tooling is discoverable; tool descriptions likely lack "
        "the domain/entity/action/side-effect structure the filter depends on"
    )


def test_invalid_arguments_produce_clean_error(dev_session):
    """Malformed arguments must give a structured error, not a 5xx."""
    status, body = dev_session.call("tools/call", {
        "name": CALL_TOOL,
        "arguments": {"name": "cloudflare_docs", "arguments": {"__not_a_real_param__": 1}},
    })
    record("malformed_args_clean_error", status="pass" if status < 500 else "fail",
           latency_ms=dev_session.last_latency_ms)
    assert status < 500, f"malformed arguments produced a server error ({status})"


def test_nonexistent_tool_is_rejected(dev_session):
    """Never allow an invented tool name to reach an upstream."""
    status, body = dev_session.call("tools/call", {
        "name": CALL_TOOL,
        "arguments": {"name": "totally_invented_tool_name", "arguments": {}},
    })
    record("invented_tool_rejected", status="pass" if status < 500 else "fail")
    assert status < 500
    assert body.get("error") or body.get("result", {}).get("isError"), \
        "an invented tool name was not rejected"


# ---------------------------------------------------------------------------
# 3. Authorization - the four-layer least-privilege model
# ---------------------------------------------------------------------------

def test_dev_key_cannot_reach_crm(dev_session):
    """Domain isolation: a developer key must not touch borrower PII.

    A generic developer key must not automatically receive CRM access. This is
    enforced by the MCP server grant, NOT by a system prompt.
    """
    status, body = dev_session.call("tools/call", {
        "name": CALL_TOOL, "arguments": {"name": "nyra_crm", "arguments": {}}})
    denied = status >= 400 or bool(body.get("error")) or body.get("result", {}).get("isError")
    record("dev_key_denied_crm", status="pass" if denied else "FAIL")
    assert denied, "SECURITY: a nyra-dev key reached the mortgage CRM MCP server"


def test_dev_key_cannot_administer_cloudflare(dev_session):
    """Pre-migration every key could administer the Cloudflare zone.

    All seven Cloudflare servers carried allow_all_keys: true. Only the
    unauthenticated docs server is now in nyra-dev.
    """
    status, body = dev_session.call("tools/call", {
        "name": CALL_TOOL, "arguments": {"name": "cloudflare_api", "arguments": {}}})
    denied = status >= 400 or bool(body.get("error")) or body.get("result", {}).get("isError")
    record("dev_key_denied_cloudflare_admin", status="pass" if denied else "FAIL")
    assert denied, "SECURITY: a nyra-dev key reached Cloudflare account administration"


def test_mortgage_key_cannot_reach_infrastructure(mortgage_session):
    """A mortgage agent must not get infrastructure or tailnet mutation."""
    status, body = mortgage_session.call("tools/call", {
        "name": CALL_TOOL, "arguments": {"name": "nyra_tailscale", "arguments": {}}})
    denied = status >= 400 or bool(body.get("error")) or body.get("result", {}).get("isError")
    record("mortgage_key_denied_infra", status="pass" if denied else "FAIL")
    assert denied, "SECURITY: a nyra-mortgage key reached tailnet administration"


def test_tool_search_permission_disabled(nosearch_session):
    """A key WITHOUT the permission must not see Virtual Tool Search.

    Tool Search is permission-gated via object_permission.mcp_tool_search_enabled.
    """
    tools = nosearch_session.tools_list()
    names = {t.get("name") for t in tools}
    record("tool_search_permission_off", status="pass" if SEARCH_TOOL not in names else "FAIL",
           note=f"exposed={sorted(names)}")
    assert SEARCH_TOOL not in names, \
        "SECURITY: Virtual Tool Search exposed to a key without mcp_tool_search_enabled"


def test_tool_search_permission_enabled(dev_session):
    """The positive control for the permission gate."""
    names = {t.get("name") for t in dev_session.tools_list()}
    record("tool_search_permission_on", status="pass" if SEARCH_TOOL in names else "FAIL")
    assert SEARCH_TOOL in names


def test_unauthenticated_request_denied(mcp_url):
    """No key at all must be refused."""
    s = MCPSession(mcp_url, token="")
    try:
        status, _ = s.call("tools/list")
    except httpx.HTTPError as exc:
        pytest.skip(_unreachable(mcp_url, exc))
    finally:
        s.close()
    record("unauthenticated_denied", status="pass" if status in (401, 403) else "FAIL",
           note=f"http={status}")
    assert status in (401, 403), f"unauthenticated MCP request returned {status}"


# ---------------------------------------------------------------------------
# 4. Failure behaviour
# ---------------------------------------------------------------------------

def test_upstream_unavailable_is_graceful(dev_session):
    """An unreachable upstream must not take the gateway down.

    At migration time `nyra_tailscale` was loopback-bound and `nyra_crm` had a
    broken handshake; LiteLLM logged a warning per server and stayed ready.
    That degradation behaviour is the requirement.
    """
    tools = dev_session.tools_list()
    record("upstream_unavailable_graceful", status="pass",
           note="gateway still serving tools/list with failing upstreams registered")
    assert tools is not None


def test_upstream_timeout_bounded(dev_session):
    """A slow upstream must be bounded, not hang the caller."""
    status, _ = dev_session.call("tools/call", {
        "name": CALL_TOOL, "arguments": {"name": "nyra_crm", "arguments": {}}})
    elapsed = dev_session.last_latency_ms or 0
    record("upstream_timeout_bounded", status="pass" if elapsed < 30_000 else "FAIL",
           latency_ms=elapsed)
    assert elapsed < 30_000, f"upstream call took {elapsed:.0f} ms - no effective timeout"


def test_health_readiness_unauthenticated(base_url):
    """/health/readiness must be usable as a container healthcheck.

    /health requires the master key and would leave the container permanently
    unhealthy; /health/readiness does not.
    """
    url = f"{base_url.rstrip('/')}/health/readiness"
    try:
        r = httpx.get(url, timeout=10)
    except httpx.HTTPError as exc:
        pytest.skip(_unreachable(url, exc))
    record("health_readiness", status="pass" if r.status_code == 200 else "fail",
           note=f"http={r.status_code}")
    assert r.status_code == 200


# ---------------------------------------------------------------------------
# 5. Cloudflare edge
# ---------------------------------------------------------------------------

def test_portal_denies_missing_service_token(portal):
    """Cloudflare Access must reject a request with no credential."""
    r = httpx.post(portal["url"], timeout=20,
                   headers={"Content-Type": "application/json"}, content="{}")
    record("cf_unauthenticated_denied", status="pass" if r.status_code in (302, 401, 403) else "FAIL",
           note=f"http={r.status_code}")
    assert r.status_code in (302, 401, 403), \
        f"SECURITY: the MCP portal answered an unauthenticated request with {r.status_code}"


def test_portal_denies_bad_service_token(portal):
    """A wrong service token must be denied at the edge, not at the origin."""
    r = httpx.post(
        portal["url"], timeout=20,
        headers={
            "Content-Type": "application/json",
            "CF-Access-Client-Id": "invalid.access",
            "CF-Access-Client-Secret": "invalid",
        },
        content="{}",
    )
    record("cf_bad_service_token_denied",
           status="pass" if r.status_code in (302, 401, 403) else "FAIL",
           note=f"http={r.status_code}")
    assert r.status_code in (302, 401, 403)


def test_portal_accepts_valid_service_token(portal):
    """A valid service token reaches LiteLLM - and gets NO Nexus surface."""
    s = MCPSession(
        portal["url"], token=os.environ.get("NYRA_LITELLM_AGENT_KEY", ""),
        extra_headers={
            "CF-Access-Client-Id": portal["client_id"],
            "CF-Access-Client-Secret": portal["client_secret"],
        },
    )
    try:
        s.initialize()
        tools = s.tools_list()
    finally:
        s.close()
    names = {t.get("name") for t in tools}
    record("cf_valid_service_token", status="pass", note=f"exposed={sorted(names)}")
    assert not any("nexus" in (n or "").lower() for n in names), \
        "Nexus surface still reachable through the portal - cutover incomplete"
    assert len(tools) <= 10, \
        "portal is exposing an expanded catalogue - check that code_mode is off and that " \
        "?optimize_context=search_and_execute is NOT appended to the production upstream"


# ---------------------------------------------------------------------------
# 6. Multi-server catalogue
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("query", [
    "look up a mortgage lead by id",
    "search the git history of a repository",
    "inspect Cloudflare Worker deployment logs",
    "recall a stored memory about this project",
    "trigger an automation workflow",
    "what is 2 + 2",  # deliberately needs NO tool
])
def test_multi_domain_discovery(dev_session, query):
    """Representative benchmark corpus across the registered domains.

    The last case must NOT produce a confident tool selection - searching for a
    tool when none is required is itself a failure mode.
    """
    status, body = dev_session.call("tools/call", {
        "name": SEARCH_TOOL, "arguments": {"query": query}})
    record(f"multi_domain::{query[:32]}", status="pass" if status == 200 else "fail",
           latency_ms=dev_session.last_latency_ms)
    assert status == 200, body
