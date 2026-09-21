#!/usr/bin/env python3
"""
Compile comprehensive master .env files for each host.

Reads current .env.example files, merges with env inventory, and creates
complete master .env files with all required secrets, API keys, and config variables.

Usage:
  python3 scripts/env_inventory/compile_master_env_files.py
"""

import json
from pathlib import Path
from typing import Dict, Set, List, Tuple

ROOT = Path(__file__).resolve().parents[2]
INFRA_HOSTS = ROOT / "infra" / "hosts"
OUTPUT_DIR = ROOT / "infra" / "hosts"

HOSTS = [
    "oracle-vps",
    "orchestrator",
    "worker-rtx3060",
    "worker-rtx3090ti",
    "worker-rtx5090",
]

# Host-to-primary-variables mapping (from env inventory)
HOST_VARS: Dict[str, Set[str]] = {
    "orchestrator": {
        "COMPOSE_PROJECT_NAME", "ORCHESTRATOR_CONTEXT",
        "LITELLM_MASTER_KEY", "LITELLM_BASE_URL", "LITELLM_PORT",
        "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD",
        "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB",
        "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY",
        "INFISICAL_TOKEN", "INFISICAL_PROJECT_ID", "INFISICAL_ENV", "INFISICAL_PATH",
        "CLOUDFLARED_TUNNEL_TOKEN", "ORCHESTRATOR_TUNNEL_TOKEN",
        "N8N_BASIC_AUTH_USER", "N8N_BASIC_AUTH_PASSWORD", "N8N_ENCRYPTION_KEY",
        "GRAFANA_ADMIN_USER", "GRAFANA_ADMIN_PASSWORD", "GRAFANA_PORT",
        "PROMETHEUS_PORT", "ALERTMANAGER_PORT",
        "MEM0_API_KEY", "MEM0_BASE_URL", "MEM0_HOST_PORT",
        "MEMPALACE_URL", "MEMPALACE_PORT",
        "TAILSCALE_AUTHKEY", "TAILSCALE_HOSTNAME",
        "LOG_LEVEL", "DEBUG_MODE",
    },
    "oracle-vps": {
        "COMPOSE_PROJECT_NAME", "ORACLE_CONTEXT",
        "ORACLE_TUNNEL_TOKEN", "ORACLE_TAILSCALE_IP", "ORACLE_MAIN_NETWORK",
        "LITELLM_MASTER_KEY", "LITELLM_BASE_URL", "LITELLM_PORT",
        "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB",
        "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD",
        # Twenty CRM
        "TWENTY_SERVER_URL", "TWENTY_FRONTEND_URL", "TWENTY_APP_SECRET",
        "TWENTY_PG_DATABASE_URL", "TWENTY_REDIS_URL",
        # Activepieces
        "AP_DB_TYPE", "AP_POSTGRES_HOST", "AP_POSTGRES_PORT", "AP_POSTGRES_DATABASE",
        "AP_POSTGRES_USERNAME", "AP_POSTGRES_PASSWORD", "AP_REDIS_HOST", "AP_REDIS_PORT",
        "AP_ENCRYPTION_KEY", "AP_JWT_SECRET", "AP_FRONTEND_URL",
        # n8n
        "N8N_BASIC_AUTH_USER", "N8N_BASIC_AUTH_PASSWORD", "N8N_ENCRYPTION_KEY", "N8N_HOST",
        # Gitea
        "GITEA_DB_NAME", "GITEA_DB_USER", "GITEA_DB_PASSWORD", "GITEA_SECRET_KEY",
        "GITEA_INTERNAL_TOKEN", "GITEA_JWT_SECRET", "GITEA_HTTP_PORT", "GITEA_SSH_PORT",
        "GITEA_DOMAIN", "GITEA_ROOT_URL", "GITEA_SSH_DOMAIN", "GITEA_TOKEN",
        # LLM APIs
        "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY",
        # Infisical
        "AGENT_VAULT_MASTER_PASSWORD", "INFISICAL_URL",
        "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID", "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET",
        "INFISICAL_TOKEN", "INFISICAL_PROJECT_ID", "INFISICAL_ENV", "INFISICAL_PATH",
        # Home Assistant
        "HOMEASSISTANT_URL", "HOMEASSISTANT_TOKEN",
        # Memory
        "MEM0_API_KEY", "MEM0_BASE_URL", "MEM0_HOST_PORT",
        "LETTA_DB_PASSWORD", "LETTA_DB_USER", "LETTA_HOST_PORT",
        "FALKORDB_PASSWORD",
        # Quote API
        "QUOTE_API_PORT", "QUOTE_API_SECRET",
        # ClawTeam
        "CLAWDBOT_GATEWAY_TOKEN", "CLAWDBOT_GATEWAY_PORT",
        "CLAWTEAM_HOST",
    },
    "worker-rtx3060": {
        "COMPOSE_PROJECT_NAME", "WORKER_3060_CONTEXT",
        "ORCHESTRATOR_URL", "ORCHESTRATOR_LITELLM_URL",
        "OLLAMA_BASE_URL", "OLLAMA_PORT", "OLLAMA_NUM_GPU",
        "TAILSCALE_AUTHKEY", "TAILSCALE_HOSTNAME",
        "LOG_LEVEL",
        "INFISICAL_TOKEN", "INFISICAL_PROJECT_ID", "INFISICAL_ENV", "INFISICAL_PATH",
    },
    "worker-rtx3090ti": {
        "COMPOSE_PROJECT_NAME", "WORKER_3090TI_CONTEXT",
        "ORCHESTRATOR_URL", "ORCHESTRATOR_LITELLM_URL",
        "VLLM_MODEL", "VLLM_GPU_MEMORY_UTILIZATION", "VLLM_PORT",
        "LMCACHE_ENABLED", "LMCACHE_PORT",
        "TAILSCALE_AUTHKEY", "TAILSCALE_HOSTNAME",
        "LOG_LEVEL",
        "INFISICAL_TOKEN", "INFISICAL_PROJECT_ID", "INFISICAL_ENV", "INFISICAL_PATH",
    },
    "worker-rtx5090": {
        "COMPOSE_PROJECT_NAME", "WORKER_5090_CONTEXT",
        "ORCHESTRATOR_URL", "ORCHESTRATOR_LITELLM_URL",
        "VLLM_MODEL", "VLLM_GPU_MEMORY_UTILIZATION", "VLLM_PORT",
        "LMCACHE_ENABLED", "LMCACHE_PORT", "LMCACHE_DEVICE",
        "NERVE_ENABLED", "NERVE_PORT", "NERVE_AUTH_TOKEN",
        "TAILSCALE_AUTHKEY", "TAILSCALE_HOSTNAME",
        "LOG_LEVEL",
        "INFISICAL_TOKEN", "INFISICAL_PROJECT_ID", "INFISICAL_ENV", "INFISICAL_PATH",
    },
}

# Sensitive variables that should always be marked
SENSITIVE = {
    "PASSWORD", "TOKEN", "KEY", "SECRET", "AUTH",
    "API_KEY", "PRIVATE", "CREDENTIAL", "CERT",
}

def is_sensitive(var_name: str) -> bool:
    """Check if variable name suggests it's sensitive."""
    upper = var_name.upper()
    return any(s in upper for s in SENSITIVE)

def load_current_env(host: str) -> Dict[str, str]:
    """Load current .env.example for host."""
    example_file = INFRA_HOSTS / host / ".env.example"
    if not example_file.exists():
        return {}

    env_vars = {}
    try:
        with open(example_file) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip()
                env_vars[key] = value
    except Exception as e:
        print(f"Warning: Failed to read {example_file}: {e}")

    return env_vars

def generate_placeholder(var_name: str) -> str:
    """Generate appropriate placeholder for variable."""
    lower = var_name.lower()

    if is_sensitive(var_name):
        if "password" in lower or "pass" in lower:
            return "change-me-secure-password"
        elif "token" in lower or "key" in lower:
            if "jwt" in lower or "secret" in lower:
                return "change-me-jwt-secret-" + "x" * 32
            elif "api" in lower:
                return "sk-" + "x" * 48
            else:
                return "change-me-token-" + "x" * 32
        elif "secret" in lower:
            return "change-me-secret-" + "x" * 32
        else:
            return "CHANGE_ME_SENSITIVE_VALUE"
    else:
        if "url" in lower or "host" in lower:
            return "change-me-url"
        elif "port" in lower:
            return "0000"
        elif "email" in lower or "user" in lower:
            return "change-me-value"
        else:
            return "change-me"

def compile_host_env(host: str) -> Tuple[List[str], List[Tuple[str, str]]]:
    """Compile master .env content for host."""
    lines = []
    variables = []

    # Header
    lines.append(f"# Project Nyra Master Environment File — {host.upper()}")
    lines.append(f"# Generated: Comprehensive configuration for all docker-compose stacks")
    lines.append(f"# Host: {host}")
    lines.append(f"# Infisical Path: /hosts/{host}")
    lines.append("")
    lines.append("# INSTRUCTIONS:")
    lines.append("# 1. Fill in all CHANGE_ME values with actual secrets/keys")
    lines.append("# 2. For production: use Infisical CLI to inject these")
    lines.append("# 3. Never commit this file with real secrets to git")
    lines.append("")

    # Get current .env vars
    current_env = load_current_env(host)

    # Get host-specific vars from inventory
    host_vars = HOST_VARS.get(host, set())

    # Combine and sort
    all_vars = sorted(set(current_env.keys()) | host_vars)

    # Add current values or placeholders
    for var in all_vars:
        if var.startswith("#"):
            continue

        if var in current_env:
            value = current_env[var]
            # Keep existing values or replace change-me with proper placeholder
            if value.startswith("change-me") or value.startswith("CHANGE_ME") or value.startswith("REPLACE"):
                value = generate_placeholder(var)
        else:
            value = generate_placeholder(var)

        # Categorize variable for documentation
        if is_sensitive(var):
            lines.append(f"# (SECRET) {var}")
        else:
            lines.append(f"# (CONFIG) {var}")

        lines.append(f"{var}={value}")
        lines.append("")
        variables.append((var, "secret" if is_sensitive(var) else "config"))

    return lines, variables

def main():
    """Generate master .env files for all hosts."""
    for host in HOSTS:
        lines, variables = compile_host_env(host)

        output_file = OUTPUT_DIR / host / f".env.master.{host}"

        try:
            with open(output_file, "w") as f:
                f.write("\n".join(lines))
            print(f"✓ {output_file.relative_to(ROOT)}: {len(variables)} variables")
        except Exception as e:
            print(f"✗ {output_file}: {e}")

    # Generate summary index
    summary_file = OUTPUT_DIR / ".env-master-index.md"
    summary_lines = [
        "# Master .env Files Index",
        "",
        "Comprehensive environment variable files for each host.",
        "",
        "## Files",
        "",
    ]

    for host in HOSTS:
        env_file = f"{host}/.env.master.{host}"
        summary_lines.append(f"- `{env_file}` — {host}")

    summary_lines.extend([
        "",
        "## Usage",
        "",
        "### Local Development",
        "```bash",
        "cp infra/hosts/{host}/.env.master.{host} infra/hosts/{host}/.env",
        "# Edit and fill in CHANGE_ME values",
        "make up  # Uses this .env via COMPOSE_FILE",
        "```",
        "",
        "### Production (Infisical)",
        "```bash",
        "# Upload secrets to Infisical",
        "scripts/infisical/upload-all-secrets.ps1 -Environment production",
        "",
        "# Run compose with Infisical secret injection",
        "infisical run --token=$INFISICAL_TOKEN --projectId=$INFISICAL_PROJECT_ID \\",
        "  docker compose -f docker-compose.yml up -d",
        "```",
        "",
        "## Sensitive Variables",
        "",
        "All variables with `(SECRET)` prefix should be:",
        "- Generated securely (use `openssl rand`, `pwgen`, etc.)",
        "- Stored in Infisical (never in git)",
        "- Rotated regularly",
        "- Never logged or printed",
        "",
    ])

    with open(summary_file, "w") as f:
        f.write("\n".join(summary_lines))

    print(f"\n✓ Generated index: {summary_file.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
