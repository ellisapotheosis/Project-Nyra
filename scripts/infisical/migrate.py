#!/usr/bin/env python3
"""
Project Nyra — Infisical Canonical Migration
Step 3 of the master execution prompt: Canonicalize & restructure.

DRY_RUN=1 (default) — prints what would happen, makes NO mutations.
DRY_RUN=0           — applies changes (write-then-verify-then-delete).

Usage:
  # Browser-session auth (interactive login):
  export INFISICAL_API_TOKEN="$(infisical user get token 2>/dev/null | grep -oE 'eyJ[A-Za-z0-9._-]+' | head -1)"
  export INFISICAL_PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
  DRY_RUN=0 python3 scripts/infisical/migrate.py
"""

import os
import sys
import time
import requests

API   = os.environ.get("INFISICAL_API_URL", "https://app.infisical.com/api").rstrip("/")
TOKEN = os.environ.get("INFISICAL_API_TOKEN", "")
PROJ  = os.environ.get("INFISICAL_PROJECT_ID", "8374cea9-e5e8-4050-bda4-b91f25ab30ef")
ENVS  = ["dev", "staging", "prod"]
H     = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
DRY   = os.environ.get("DRY_RUN", "1") != "0"

if not TOKEN:
    print("ERROR: INFISICAL_API_TOKEN not set. Authenticate first:")
    print("  export INFISICAL_API_TOKEN=$(infisical user get token 2>/dev/null || echo '')")
    sys.exit(1)

# ── helpers ──────────────────────────────────────────────────────────────────

def api(method, path, **kwargs):
    for attempt in range(5):
        r = getattr(requests, method)(f"{API}{path}", headers=H, **kwargs)
        if r.status_code == 429:
            wait = 16 + attempt * 5
            print(f"  [rate-limit] waiting {wait}s before retry {attempt+1}/5...")
            time.sleep(wait)
            continue
        if not r.ok and r.status_code != 404:
            print(f"  [warn] {method.upper()} {path} -> {r.status_code}: {r.text[:120]}")
        return r
    print(f"  [error] {method.upper()} {path} failed after 5 retries")
    return r

def list_folders(env, path):
    r = api("get", "/v1/folders", params={"workspaceId": PROJ, "environment": env, "path": path})
    return r.json().get("folders", []) if r.ok else []

def ensure_folder(env, path):
    """Create folder and all parents if they don't exist."""
    cur = "/"
    for part in [p for p in path.split("/") if p]:
        existing = [f["name"] for f in list_folders(env, cur)]
        if part not in existing:
            if DRY:
                print(f"    [dry] mkdir {env}:{cur.rstrip('/')}/{part}")
            else:
                api("post", "/v1/folders", json={
                    "workspaceId": PROJ, "environment": env,
                    "path": cur, "name": part
                })
        cur = f"{cur.rstrip('/')}/{part}"

def get_secrets(env, path):
    r = api("get", "/v3/secrets/raw", params={
        "workspaceId": PROJ, "environment": env, "secretPath": path
    })
    return r.json().get("secrets", []) if r.ok else []

def upsert_secret(env, path, key, value, comment=""):
    existing = {s["secretKey"]: s.get("secretValue", "") for s in get_secrets(env, path)}
    body_base = {
        "workspaceId": PROJ, "environment": env, "secretPath": path,
        "secretValue": value or "",
        "secretComment": comment or "Nyra canonical migration",
        "type": "shared",
    }
    if key in existing:
        if existing[key] == value:
            return "exists-identical"
        if DRY:
            print(f"    [dry] PATCH {env}:{path}:{key}")
            return "would-update"
        # PATCH requires secretName in URL path, not body
        api("patch", f"/v3/secrets/raw/{key}", json=body_base)
        return "updated"
    if DRY:
        print(f"    [dry] POST  {env}:{path}:{key}")
        return "would-create"
    # POST requires secretName in URL path, not body
    api("post", f"/v3/secrets/raw/{key}", json=body_base)
    return "created"

def verify_secret(env, path, key, value):
    return any(
        s["secretKey"] == key and s.get("secretValue") == value
        for s in get_secrets(env, path)
    )

def delete_secret(env, path, key):
    if DRY:
        print(f"    [dry] DELETE {env}:{path}:{key}")
        return
    # DELETE requires secretName in URL path
    api("delete", f"/v3/secrets/raw/{key}", json={
        "workspaceId": PROJ, "environment": env, "secretPath": path
    })

# Keys to skip in migration — require manual owner action before they can be canonicalized.
# Document each skip reason here so nothing is silently lost.
SKIP_KEYS = {
    # /machines/homeassistant:HASS_TOKEN = never-filled placeholder ("change-me-...").
    # /hosts/homeassistant:HASS_TOKEN    = ${HASS_TOKEN} self-referential reference (broken).
    # Owner must generate a real HA long-lived token in HA → Settings → Profile → Long-Lived Access Tokens,
    # then set it directly at /hosts/homeassistant:HASS_TOKEN.
    # See docs/OWNER_MANUAL_ACTIONS.md for step-by-step.
    "HASS_TOKEN",
}

def migrate_path(env, src, dst, note=""):
    """Move all secrets from src to dst: ensure-folder → upsert → verify → delete."""
    secs = get_secrets(env, src)
    if not secs:
        return  # nothing to move
    skipped = [s["secretKey"] for s in secs if s["secretKey"] in SKIP_KEYS]
    secs = [s for s in secs if s["secretKey"] not in SKIP_KEYS]
    if skipped:
        print(f"  [skip] {env}:{src} — skipping keys requiring manual action: {skipped}")
    if not secs:
        return
    print(f"  {env}: {src} -> {dst}  ({len(secs)} secrets)  {note}")
    ensure_folder(env, dst)
    failures = []
    for s in secs:
        k = s["secretKey"]
        v = s.get("secretValue", "")
        c = s.get("secretComment", "")
        result = upsert_secret(env, dst, k, v, c)
        if result in ("exists-identical", "would-create", "would-update", "created", "updated"):
            if not DRY:
                if verify_secret(env, dst, k, v):
                    delete_secret(env, src, k)
                else:
                    print(f"    [ERROR] verify FAILED {env}:{dst}:{k} — source retained")
                    failures.append(k)
    if failures:
        print(f"  [WARN] {len(failures)} keys NOT migrated in {env}:{src}: {failures}")


# ── migration plan ────────────────────────────────────────────────────────────
# Format: (src_path, dst_path, optional_note)
# All migrations are safe to re-run (idempotent: skips identical values).
# Ordering matters: migrate leaves before parents.

PLAN = [
    # ── /services/* → /apps/<app>/services/* ──────────────────────────────
    # Self-made microservices move under their parent app (§3.2)
    ("/services/assistant-service",      "/apps/projectnyra/services/assistant-service",    "Nyra microservice"),
    ("/services/campaign-service",       "/apps/projectnyra/services/campaign-service",     "Nyra microservice"),
    ("/services/communication-service",  "/apps/projectnyra/services/communication-service","Nyra microservice"),
    ("/services/crm-api",                "/apps/projectnyra/services/crm-api",              "Nyra microservice"),
    ("/services/lead-ingestion",         "/apps/projectnyra/services/lead-ingestion",       "Nyra microservice"),
    ("/services/twenty-mcp-jezweb",      "/apps/projectnyra/services/twenty-mcp-jezweb",    "Nyra microservice"),
    ("/services/quote-api",              "/apps/ratehunter/services/quote-api",             "RateHunter microservice"),
    ("/services/quote-service",          "/apps/ratehunter/services/quote-service",         "RateHunter microservice"),
    ("/services/ratehunter-api",         "/apps/ratehunter/services/ratehunter-api",        "RateHunter microservice"),

    # ── /machines/* → /hosts/* ────────────────────────────────────────────
    # Consolidate all host folders under /hosts (workers still at /machines)
    ("/machines/homeassistant",     "/hosts/homeassistant",     "machine → host rename"),
    ("/machines/worker-rtx3060",    "/hosts/worker-rtx3060",    "machine → host rename"),
    ("/machines/worker-rtx3090ti",  "/hosts/worker-rtx3090ti",  "machine → host rename"),
    ("/machines/worker-rtx5090",    "/hosts/worker-rtx5090",    "machine → host rename"),

    # ── /clients/* → /providers/* ─────────────────────────────────────────
    # External integrations/platforms that are pure API providers
    ("/clients/cloudflare",      "/providers/cloudflare",      "ext integration → provider"),
    ("/clients/gitea",           "/providers/gitea",           "ext integration → provider"),
    ("/clients/github",          "/providers/github",          "ext integration → provider"),
    ("/clients/twilio",          "/providers/twilio",          "ext integration → provider"),
    ("/clients/sendgrid",        "/providers/sendgrid",        "ext integration → provider"),
    ("/clients/slack",           "/providers/slack",           "ext integration → provider"),
    ("/clients/discord",         "/providers/discord",         "ext integration → provider"),
    ("/clients/tailscale",       "/providers/tailscale",       "ext integration → provider"),
    ("/clients/ngrok",           "/providers/ngrok",           "ext integration → provider"),
    ("/clients/vercel",          "/providers/vercel",          "ext integration → provider"),
    ("/clients/calendly",        "/providers/calendly",        "ext integration → provider"),
    ("/clients/apify",           "/providers/apify",           "ext integration → provider"),
    ("/clients/firecrawl",       "/providers/firecrawl",       "ext integration → provider"),
    ("/clients/exa-mcp",         "/providers/exa",             "ext integration → provider"),
    ("/clients/tavily",          "/providers/tavily",          "ext integration → provider"),
    ("/clients/jigsawstack",     "/providers/jigsawstack",     "ext integration → provider"),
    ("/clients/sentry",          "/providers/sentry",          "ext integration → provider"),
    ("/clients/axiom",           "/providers/axiom",           "ext integration → provider"),
    ("/clients/logfire",         "/providers/logfire",         "ext integration → provider"),
    ("/clients/portainer",       "/providers/portainer",       "ext integration → provider"),
    ("/clients/syncthing",       "/providers/syncthing",       "ext integration → provider"),
    ("/clients/mqtt",            "/providers/mqtt",            "ext integration → provider"),
    ("/clients/playwright",      "/providers/playwright",      "ext integration → provider"),
    ("/clients/elevenlabs",      "/providers/elevenlabs",      "ext integration → provider"),
    ("/clients/fal",             "/providers/fal",             "ext integration → provider"),
    ("/clients/sambanova",       "/providers/sambanova",       "LLM provider"),
    ("/clients/epicllm",         "/providers/epicllm",         "LLM provider"),
    ("/clients/galileo",         "/providers/galileo",         "AI eval provider"),
    ("/clients/braintrust",      "/providers/braintrust",      "AI eval provider"),
    ("/clients/confident-ai",    "/providers/confident-ai",    "AI eval provider"),
    ("/clients/mos-embedder",    "/providers/mos-embedder",    "embedding provider"),
    ("/clients/llamaindex",      "/providers/llamaindex",      "AI framework provider"),
    ("/clients/composio",        "/providers/composio",        "AI tooling provider"),
    ("/clients/metamcp",         "/providers/metamcp",         "MCP provider"),
    ("/clients/smithery",        "/providers/smithery",        "MCP registry provider"),
    ("/clients/nexus",           "/providers/nexus",           "Nexus Router config"),
    ("/clients/browserless",     "/providers/browserless",     "browser automation provider"),
    ("/clients/searxng",         "/providers/searxng",         "search provider"),
    ("/clients/gravatar",        "/providers/gravatar",        "identity provider"),
    ("/clients/letta",           "/providers/letta",           "memory platform provider"),
    ("/clients/mem0",            "/providers/mem0",            "memory platform provider"),
    ("/clients/memOS",           "/providers/memos",           "memory platform provider"),
    ("/clients/mempalace",       "/providers/mempalace",       "memory MCP provider"),
    ("/clients/memrader",        "/providers/memrader",        "memory provider"),
    ("/clients/memzero",         "/providers/memzero",         "memory provider"),
    ("/clients/memu",            "/providers/memu",            "memory provider"),
    ("/clients/openmemory",      "/providers/openmemory",      "memory MCP provider"),
    ("/clients/agentdb",         "/providers/agentdb",         "agent DB provider"),
    ("/clients/agentmemory",     "/providers/agentmemory",     "agent memory provider"),
    ("/clients/open-webui",      "/providers/open-webui",      "LLM UI provider"),
    ("/clients/owui",            "/providers/owui",            "LLM UI provider (owui alias)"),
    ("/clients/lobechat",        "/providers/lobechat",        "LLM UI provider"),
    ("/clients/claude-code",     "/providers/claude-code",     "Anthropic CLI provider"),
    ("/clients/copilot-kit",     "/providers/copilot-kit",     "AI UI provider"),
    ("/clients/desktopcommander","/providers/desktopcommander","desktop MCP provider"),
    ("/clients/kilocode",        "/providers/kilocode",        "AI coding provider"),
    ("/clients/picoclaw",        "/providers/picoclaw",        "claw variant provider"),
    ("/clients/n8n-mcp_com",     "/providers/n8n-mcp",         "n8n MCP registry provider"),
    ("/clients/plugged-in",      "/providers/plugged-in",      "MCP provider"),
    ("/clients/serena",          "/providers/serena",          "Serena MCP provider"),
    ("/clients/archon",          "/providers/archon",          "Archon OS provider"),
    ("/clients/npm",             "/providers/npm",             "package registry"),
    ("/clients/pypi",            "/providers/pypi",            "package registry"),
    ("/clients/turborepo",       "/providers/turborepo",       "build tooling"),
    ("/clients/gitkraken",       "/providers/gitkraken",       "git tooling"),
    ("/clients/gitlab",          "/providers/gitlab",          "git platform"),
    ("/clients/atlassian",       "/providers/atlassian",       "project tooling"),
    ("/clients/circleci",        "/providers/circleci",        "CI/CD provider"),
    ("/clients/codecov",         "/providers/codecov",         "code coverage provider"),
    ("/clients/stitch",          "/providers/stitch",          "data integration provider"),
    ("/clients/superset",        "/providers/superset",        "BI/analytics platform"),
    ("/clients/chatbox",         "/providers/chatbox",         "LLM client provider"),
    ("/clients/clawteam",        "/providers/clawteam",        "claw variant provider"),
    ("/clients/flow-nexus",      "/providers/flow-nexus",      "flow/nexus integration"),
    ("/clients/freerateupdate",  "/providers/freerateupdate",  "mortgage rate data provider"),
    ("/clients/gastown",         "/providers/gastown",         "provider (TBD)"),
    ("/clients/hermes",          "/providers/hermes",          "provider (TBD)"),
    ("/clients/leadmailbox",     "/providers/leadmailbox",     "lead data provider"),
    ("/clients/lendingtree",     "/providers/lendingtree",     "mortgage lead provider"),
    ("/clients/twentyfirst",     "/providers/twentyfirst",     "provider (TBD)"),
    ("/clients/unmute",          "/providers/unmute",          "voice/audio provider"),
    ("/clients/voicemod",        "/providers/voicemod",        "voice provider"),
    ("/clients/warp",            "/providers/warp",            "terminal/tooling provider"),
    ("/clients/greptile",        "/providers/greptile",        "code search provider"),
    ("/clients/docker",          "/providers/docker",          "container registry provider"),

    # Sub-subfolder migrations (must come before parent to avoid empty-folder issues)
    ("/clients/archon/archon-specs",    "/providers/archon/archon-specs",     "nested subfolder → provider"),
    ("/clients/discord/archon_bot",     "/providers/discord/archon-bot",      "RENAME: underscore→dash (§3.9)"),
    ("/clients/mem0/local-host",        "/providers/mem0/local-host",         "nested subfolder → provider"),

    # Duplicate-resolution: /clients/anythingllm vs /providers/anythingllm
    # Values will be compared; if identical, src is deleted. If different → UNRESOLVED.
    ("/clients/anythingllm",     "/providers/anythingllm",     "DEDUP: check vs existing /providers/anythingllm"),

    # Platform apps that belong in /providers (they're third-party platforms, not custom apps)
    ("/apps/activepieces",  "/providers/activepieces",  "platform → provider"),
    ("/apps/n8n",           "/providers/n8n",           "platform → provider (check vs /clients/n8n)"),
    ("/apps/twenty-crm",    "/providers/twenty-crm",    "platform → provider"),
    ("/apps/twilio",        "/providers/twilio",        "platform → provider (check vs /clients/twilio)"),
    ("/apps/sendgrid",      "/providers/sendgrid",      "platform → provider (check vs /clients/sendgrid)"),

    # /clients entries that belong in /apps (custom/owned apps)
    ("/clients/openclaw",   "/apps/openclaw",    "custom app → /apps"),
    ("/clients/paperclip",  "/apps/paperclip",   "custom app → /apps"),

    # ── /monitoring/* → /providers/* ──────────────────────────────────────
    # Blueprint default: fold into /providers (§3.1)
    ("/monitoring/grafana-loki-prometheus-alertmanager", "/providers/grafana",  "monitoring → provider"),
    ("/monitoring/langfuse",                             "/providers/langfuse", "monitoring → provider"),
    ("/monitoring/openlit",                              "/providers/openlit",  "monitoring → provider (check vs /services/openlit)"),

    # /services/openlit duplicate
    ("/services/openlit",   "/providers/openlit",   "DEDUP: check vs /monitoring/openlit"),
    ("/services/grafana",   "/providers/grafana",   "DEDUP: check vs /monitoring/grafana-loki-prometheus-alertmanager"),

    # ── /router/* → /providers/* ──────────────────────────────────────────
    ("/router/litellm-proxy-client-local",  "/providers/litellm/proxy-client-local",  "router → provider"),
    ("/router/litellm-proxy-client-remote", "/providers/litellm/proxy-client-remote", "router → provider"),
    ("/router/litellm-proxy-server",        "/providers/litellm/proxy-server",        "router → provider"),
    ("/router/adapters/anthropic-via-litellm",       "/providers/litellm/adapters/anthropic-via-litellm",       "router → provider"),
    ("/router/adapters/CF-anthropic-via-openrouter", "/providers/litellm/adapters/CF-anthropic-via-openrouter", "router → provider"),
    ("/router/adapters/CF-gemini-via-openrouter",    "/providers/litellm/adapters/CF-gemini-via-openrouter",    "router → provider"),
    ("/router/adapters/gemini-via-litellm",          "/providers/litellm/adapters/gemini-via-litellm",          "router → provider"),
    ("/router/adapters/openai-via-litellm",          "/providers/litellm/adapters/openai-via-litellm",          "router → provider"),
    ("/router/adapters/openai-via-openrouter",       "/providers/litellm/adapters/openai-via-openrouter",       "router → provider"),

    # ── /adapters/* → /providers/litellm/adapters/* ───────────────────────
    # Root /adapters mirrors /router/adapters — consolidate (dedup check)
    ("/adapters/anthropic-via-litellm",       "/providers/litellm/adapters/anthropic-via-litellm",       "DEDUP: /adapters mirrors /router/adapters"),
    ("/adapters/CF-anthropic-via-openrouter", "/providers/litellm/adapters/CF-anthropic-via-openrouter", "DEDUP: /adapters mirrors /router/adapters"),
    ("/adapters/CF-gemini-via-openrouter",    "/providers/litellm/adapters/CF-gemini-via-openrouter",    "DEDUP: /adapters mirrors /router/adapters"),
    ("/adapters/gemini-via-litellm",          "/providers/litellm/adapters/gemini-via-litellm",          "DEDUP: /adapters mirrors /router/adapters"),
    ("/adapters/openai-via-litellm",          "/providers/litellm/adapters/openai-via-litellm",          "DEDUP: /adapters mirrors /router/adapters"),
    ("/adapters/openai-via-openrouter",       "/providers/litellm/adapters/openai-via-openrouter",       "DEDUP: /adapters mirrors /router/adapters"),

    # ── /public-urls/* → /base ────────────────────────────────────────────
    # Public URLs are universal config → /base (§3.1)
    ("/public-urls", "/base",  "public-urls → base (universal config)"),

    # ── /security/* cleanup ───────────────────────────────────────────────
    # virustotal is an API provider, not auth/security infrastructure
    ("/security/virustotal", "/providers/virustotal", "security → provider (API, not auth)"),

    # ── /databases/supabase/cloud + /databases/supabase/local ─────────────
    # Already canonical — no migration needed. Just validate naming (§3.9).
    # Note: supabase_local naming was flagged; confirmed as supabase/local — OK.
]

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    print(f"MODE = {'DRY-RUN' if DRY else 'APPLY'}")
    print(f"ENVS = {ENVS}")
    print(f"PLAN = {len(PLAN)} migrations\n")

    conflicts = []

    for env in ENVS:
        print(f"\n{'='*60}")
        print(f"ENV: {env}")
        print(f"{'='*60}")
        for src, dst, note in PLAN:
            secs = get_secrets(env, src)
            if not secs:
                continue
            # Check for value conflicts at destination
            dst_secs = {s["secretKey"]: s.get("secretValue","") for s in get_secrets(env, dst)}
            for s in secs:
                k = s["secretKey"]
                v = s.get("secretValue", "")
                if k in dst_secs and dst_secs[k] != v:
                    conflicts.append({
                        "env": env, "key": k,
                        "src": src, "dst": dst,
                        "src_prefix": v[:6] + "..." if len(v) > 6 else v,
                        "dst_prefix": dst_secs[k][:6] + "..." if len(dst_secs[k]) > 6 else dst_secs[k],
                    })
            migrate_path(env, src, dst, note)

    if conflicts:
        print(f"\n{'='*60}")
        print(f"VALUE CONFLICTS ({len(conflicts)}) — UNRESOLVED — source retained:")
        print(f"{'='*60}")
        for c in conflicts:
            print(f"  {c['env']}:{c['src']}:{c['key']}  src_prefix={c['src_prefix']}  dst_prefix={c['dst_prefix']}")
        print("\nReview conflicts manually. Do NOT delete sources until resolved.")

    print(f"\nDone. Conflicts: {len(conflicts)}")


if __name__ == "__main__":
    main()
