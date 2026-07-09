#!/usr/bin/env python3
"""
Project Nyra — Infisical Import Wiring
Step 4 of the master execution prompt: wire Secret Imports for each host, /infra, /shared, /CI-CD.

ALL imports are ONE LEVEL DEEP from the consumer — this is the Infisical hard limit (§1.2).
/hosts/<name> imports leaf paths directly; never routes through /shared as intermediary.

DRY_RUN=1 (default) — prints what would happen, makes NO mutations.
DRY_RUN=0           — applies changes.

Usage:
  export INFISICAL_API_TOKEN="$(infisical user get token 2>/dev/null | grep -oE 'eyJ[A-Za-z0-9._-]+' | head -1)"
  DRY_RUN=0 python3 scripts/infisical/wire_imports.py
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
    print("ERROR: INFISICAL_API_TOKEN not set.")
    sys.exit(1)


def api(method, path, **kwargs):
    for attempt in range(5):
        r = getattr(requests, method)(f"{API}{path}", headers=H, **kwargs)
        if r.status_code == 429:
            wait = 16 + attempt * 5
            print(f"  [rate-limit] waiting {wait}s before retry {attempt+1}/5...")
            time.sleep(wait)
            continue
        if not r.ok:
            print(f"  [warn] {method.upper()} {path} -> {r.status_code}: {r.text[:120]}")
        return r
    return r


def list_imports(env, path):
    r = api("get", "/v1/secret-imports", params={
        "workspaceId": PROJ, "environment": env, "path": path
    })
    return r.json().get("secretImports", []) if r.ok else []


def ensure_import(env, into_path, src_env, src_path):
    """Idempotently create a secret import; returns status string."""
    for imp in list_imports(env, into_path):
        ie = imp.get("importEnv", {})
        ie_slug = ie.get("slug") if isinstance(ie, dict) else ie
        if ie_slug == src_env and imp.get("importPath") == src_path:
            return "exists"
    if DRY:
        print(f"    [dry] import {env}:{into_path}  <-  {src_env}:{src_path}")
        return "would-create"
    api("post", "/v1/secret-imports", json={
        "workspaceId": PROJ, "environment": env,
        "path": into_path,
        "import": {"environment": src_env, "path": src_path}
    })
    return "created"


# ── wiring map ────────────────────────────────────────────────────────────────
# Format: "consumer_path": [(src_path, src_env_or_None), ...]
# src_env defaults to same env as consumer when None.
# Order matters: LAST import wins on key collision.
#
# RULE: every import is ONE LEVEL DEEP from consumer (§1.2).
# /hosts/<name> imports leaf paths directly — NOT via /shared intermediary.

WIRING = {
    # ── /hosts/oracle-vps ─────────────────────────────────────────────────
    # oracle-vps runs: Twenty CRM, Gitea, Qdrant, FalkorDB, Mem0, Quote API,
    #                  Campaign Engine, Activepieces, Letta, Cloudflared, Paperclip
    "/hosts/oracle-vps": [
        "/base",
        "/security/ssh",
        "/security/jwt",
        "/providers/cloudflare",
        "/providers/gitea",
        "/providers/tailscale",
        "/providers/letta",
        "/providers/mem0",
        "/databases/qdrant-local",
        "/providers/activepieces",
        "/providers/twenty-crm",
        "/providers/sendgrid",
        "/providers/twilio",
        "/apps/projectnyra",
        "/apps/projectnyra/services/campaign-service",
        "/apps/projectnyra/services/crm-api",
        "/apps/projectnyra/services/lead-ingestion",
        "/apps/projectnyra/services/twenty-mcp-jezweb",
        "/apps/ratehunter",
        "/apps/ratehunter/services/quote-api",
        "/apps/ratehunter/services/quote-service",
        "/apps/ratehunter/services/ratehunter-api",
        "/apps/paperclip",
    ],

    # ── /hosts/orchestrator ───────────────────────────────────────────────
    # orchestrator runs: Nexus Router, LiteLLM, n8n, Activepieces, Observability,
    #                    OpenClaw, Open WebUI, Portainer, Syncthing, Cloudflared
    "/hosts/orchestrator": [
        "/base",
        "/security/ssh",
        "/security/jwt",
        "/security/auth0",
        "/providers/cloudflare",
        "/providers/tailscale",
        "/providers/nexus",
        "/providers/openrouter",
        "/providers/litellm",
        "/providers/litellm/proxy-server",
        "/providers/litellm/proxy-client-local",
        "/providers/litellm/adapters/anthropic-via-litellm",
        "/providers/litellm/adapters/openai-via-litellm",
        "/providers/litellm/adapters/openai-via-openrouter",
        "/providers/n8n",
        "/providers/activepieces",
        "/providers/portainer",
        "/providers/syncthing",
        "/providers/open-webui",
        "/providers/grafana",
        "/providers/openlit",
        "/providers/langfuse",
        "/apps/openclaw",
        "/databases/redis",
        "/databases/postgres",
    ],

    # ── /hosts/worker-rtx5090 ─────────────────────────────────────────────
    # Runs vLLM (DeepSeek R1 236B, Qwen 72B) + Ollama + Tailscale
    "/hosts/worker-rtx5090": [
        "/base",
        "/security/ssh",
        "/providers/tailscale",
        "/providers/ollama",
        "/providers/huggingface",
    ],

    # ── /hosts/worker-rtx3090ti ───────────────────────────────────────────
    "/hosts/worker-rtx3090ti": [
        "/base",
        "/security/ssh",
        "/providers/tailscale",
        "/providers/ollama",
        "/providers/huggingface",
    ],

    # ── /hosts/worker-rtx3060 ─────────────────────────────────────────────
    "/hosts/worker-rtx3060": [
        "/base",
        "/security/ssh",
        "/providers/tailscale",
        "/providers/ollama",
        "/providers/huggingface",
    ],

    # ── /hosts/homeassistant ──────────────────────────────────────────────
    "/hosts/homeassistant": [
        "/base",
        "/security/ssh",
        "/providers/tailscale",
    ],

    # ── /hosts/iphone ─────────────────────────────────────────────────────
    "/hosts/iphone": [
        "/base",
        "/providers/tailscale",
    ],

    # ── /shared — true multi-host layer ───────────────────────────────────
    # Only what 2+ hosts genuinely need that has no canonical parent.
    # Kept minimal: base + ssh + jwt are shared universally.
    # Hosts still import these leaves directly (§4.4 pattern A) —
    # /shared is a convenience, not a transitive hop.
    "/shared": [
        "/base",
        "/security/jwt",
    ],

    # ── /infra — all-in-one developer/MCP workspace ───────────────────────
    # The single path a developer points `infisical run --path /infra` at.
    # Imports every leaf directly (one level = valid, §4.5).
    # This is the ONLY legitimate "import everything" consumer.
    "/infra": [
        "/base",
        "/providers/anthropic",
        "/providers/cloudflare",
        "/providers/openrouter",
        "/providers/openai",
        "/providers/google",
        "/providers/groq",
        "/providers/mistral",
        "/providers/cohere",
        "/providers/ollama",
        "/providers/huggingface",
        "/providers/sambanova",
        "/providers/litellm",
        "/providers/litellm/proxy-server",
        "/providers/litellm/proxy-client-local",
        "/providers/litellm/proxy-client-remote",
        "/providers/gitea",
        "/providers/github",
        "/providers/tailscale",
        "/providers/twilio",
        "/providers/sendgrid",
        "/providers/slack",
        "/providers/composio",
        "/providers/letta",
        "/providers/mem0",
        "/providers/mempalace",
        "/providers/openmemory",
        "/providers/nexus",
        "/providers/serena",
        "/providers/firecrawl",
        "/providers/tavily",
        "/providers/sentry",
        "/providers/grafana",
        "/providers/openlit",
        "/providers/langfuse",
        "/providers/portainer",
        "/providers/syncthing",
        "/providers/activepieces",
        "/providers/n8n",
        "/providers/twenty-crm",
        "/databases/qdrant-local",
        "/databases/qdrant-cloud",
        "/databases/falkordb",
        "/databases/redis",
        "/databases/postgres",
        "/databases/supabase/local",
        "/databases/supabase/cloud",
        "/databases/neo4j",
        "/databases/chromadb",
        "/security/ssh",
        "/security/jwt",
        "/security/auth0",
        "/security/bitwarden",
        "/security/infisical",
        "/apps/projectnyra",
        "/apps/ratehunter",
        "/apps/openclaw",
    ],

    # ── /CI-CD — GitHub + Gitea pipeline secrets ──────────────────────────
    "/CI-CD": [
        "/providers/github",
        "/providers/gitea",
        "/providers/cloudflare",
        "/providers/vercel",
        "/providers/sentry",
        "/providers/codecov",
    ],
}


def main():
    print(f"MODE = {'DRY-RUN' if DRY else 'APPLY'}")
    print(f"ENVS = {ENVS}")
    print(f"CONSUMERS = {len(WIRING)}")

    created_total = 0
    exists_total  = 0

    for env in ENVS:
        print(f"\n{'='*60}")
        print(f"ENV: {env}")
        print(f"{'='*60}")
        for into_path, srcs in WIRING.items():
            print(f"\n  -> {into_path}")
            for src_path in srcs:
                status = ensure_import(env, into_path, env, src_path)
                if status == "created":
                    created_total += 1
                elif status == "exists":
                    exists_total  += 1

    print(f"\n{'='*60}")
    print(f"Summary: {created_total} created, {exists_total} already existed")
    print("Re-run with DRY_RUN=1 to verify convergence (all should show 'exists').")


if __name__ == "__main__":
    main()
