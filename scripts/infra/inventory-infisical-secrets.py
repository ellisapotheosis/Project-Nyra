#!/usr/bin/env python3
"""Inventory Project Nyra env keys and Infisical cloud path coverage.

This is a name-only audit. It never prints secret values. If cloud credentials
are present, it compares required key names against the remote key names
exported by the Infisical CLI.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "docs" / "reports" / "INFISICAL_MISSING_SECRETS.md"
SCAN_ROOTS = ("infra/hosts", "infra/env", "apps", "services", "config")
SKIP_PARTS = {
    ".git",
    ".next",
    ".venv",
    "dist",
    "build",
    "deprecated",
    "migrated-compose",
    "node_modules",
    "__pycache__",
    "coverage",
    "docs/public-readiness",
}
TEXT_SUFFIXES = {
    ".env",
    ".example",
    ".json",
    ".md",
    ".mjs",
    ".py",
    ".sh",
    ".toml",
    ".ts",
    ".tsx",
    ".yml",
    ".yaml",
}
ENV_ASSIGNMENT = re.compile(r"^\s*(?:export\s+)?([A-Z][A-Z0-9_]{2,})\s*=", re.M)
ENV_INTERPOLATION = re.compile(r"\$\{([A-Z][A-Z0-9_]{2,})(?::[-?][^}]*)?\}")
SECRETISH = re.compile(
    r"(TOKEN|SECRET|PASSWORD|API_KEY|PRIVATE_KEY|CLIENT_SECRET|AUTH|CREDENTIAL|WEBHOOK_SECRET|MASTER_KEY|ENCRYPTION_KEY|LICENSE_KEY)"
)

PATH_RULES = [
    (re.compile(r"^(OPENAI|ANTHROPIC|GROQ|OPENROUTER|PERPLEXITY|GEMINI|GOOGLE)_"), "/providers/llm"),
    (re.compile(r"^CLOUDFLARE_"), "/providers/cloudflare"),
    (re.compile(r"^TWILIO_"), "/providers/twilio"),
    (re.compile(r"^SENDGRID_"), "/providers/sendgrid"),
    (re.compile(r"^COMPOSIO_"), "/clients/composio"),
    (re.compile(r"^LETTA_"), "/clients/letta"),
    (re.compile(r"^QDRANT_"), "/databases/qdrant-local"),
    (re.compile(r"^FALKORDB_"), "/databases/falkordb"),
    (re.compile(r"^MEM0_"), "/clients/mem0"),
    (re.compile(r"^(OPENMEMORY|MEMOS|MEMORYTENSOR)_"), "/clients/memory"),
    (re.compile(r"^(NEXT_PUBLIC_|CLERK_|PROJECTNYRA_|NYRA_APP_)"), "/apps/projectnyra"),
    (re.compile(r"^RATEHUNTER_"), "/apps/ratehunter"),
    (re.compile(r"^(POSTGRES|DATABASE|REDIS)_"), "/machines/oracle-vps"),
    (re.compile(r"^INFISICAL_"), "/security/infisical"),
    (re.compile(r"^AGENT_VAULT_"), "/agent-vault/vaults"),
    (re.compile(r"^TAILSCALE_"), "/base"),
    (re.compile(r"^NEXUS_"), "/machines/orchestrator"),
    (re.compile(r"^(GRAFANA|PROMETHEUS|LOKI)_"), "/machines/orchestrator"),
]

DEFAULT_PATHS = [
    "/base",
    "/machines/orchestrator",
    "/machines/oracle-vps",
    "/machines/worker-rtx5090",
    "/machines/worker-rtx3090ti",
    "/machines/worker-rtx3060",
    "/apps/projectnyra",
    "/apps/ratehunter",
    "/services/crm-api",
    "/services/lead-ingestion",
    "/services/campaign-service",
    "/services/communication-service",
    "/services/quote-service",
    "/services/assistant-service",
    "/providers/cloudflare",
    "/providers/twilio",
    "/providers/sendgrid",
    "/providers/llm",
    "/clients/composio",
    "/clients/letta",
    "/clients/mem0",
    "/clients/memory",
    "/security/infisical",
    "/agent-vault/vaults",
    "/databases/qdrant-local",
    "/databases/falkordb",
]


def is_text_file(path: Path) -> bool:
    rel = str(path.relative_to(ROOT))
    if any(part in SKIP_PARTS for part in path.parts):
        return False
    if any("/" in skip and rel.startswith(skip + "/") for skip in SKIP_PARTS):
        return False
    if path.name.endswith(".env.example") or path.name.startswith(".env"):
        return True
    if path.suffix == ".md" and not rel.startswith(("docs/security/", "docs/ops/", "docs/reports/")):
        return False
    return path.suffix in TEXT_SUFFIXES


def iter_files() -> list[Path]:
    files: list[Path] = []
    for root_name in SCAN_ROOTS:
        root = ROOT / root_name
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.is_file() and is_text_file(path):
                files.append(path)
    return sorted(files)


def recommended_path(key: str) -> str:
    for pattern, path in PATH_RULES:
        if pattern.search(key):
            return path
    if key.startswith("WORKER_") or "RTX" in key:
        return "/machines/worker-*"
    return "/machines/oracle-vps"


def scan_required_keys() -> dict[str, set[str]]:
    keys: dict[str, set[str]] = defaultdict(set)
    for path in iter_files():
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        rel = str(path.relative_to(ROOT))
        for key in set(ENV_ASSIGNMENT.findall(text)) | set(ENV_INTERPOLATION.findall(text)):
            if SECRETISH.search(key) or key.startswith(("INFISICAL_", "CLOUDFLARE_", "TAILSCALE_")):
                keys[key].add(rel)
    return keys


def resolve_infisical_auth_token() -> str | None:
    token = os.getenv("INFISICAL_TOKEN")
    if token:
        return token

    client_id = os.getenv("INFISICAL_UNIVERSAL_AUTH_CLIENT_ID")
    client_secret = os.getenv("INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET")
    if not client_id or not client_secret:
        return None

    url = os.getenv("INFISICAL_API_URL", "https://app.infisical.com")
    try:
        proc = subprocess.run(
            ["bash", "scripts/infra/infisical-auth-token.sh"],
            cwd=ROOT,
            check=False,
            text=True,
            capture_output=True,
            env={**os.environ, "INFISICAL_API_URL": url},
            timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None

    if proc.returncode != 0:
        return None
    resolved = proc.stdout.strip()
    return resolved or None


def export_infisical_key_names() -> dict[str, set[str]] | None:
    token = resolve_infisical_auth_token()
    project = os.getenv("INFISICAL_PROJECT_ID")
    url = os.getenv("INFISICAL_API_URL", "https://app.infisical.com")
    env_name = os.getenv("INFISICAL_ENV", "prod")
    if not token or not project:
        return None

    found: dict[str, set[str]] = defaultdict(set)
    for path in DEFAULT_PATHS:
        cmd = [
            "infisical",
            "secrets",
            "--token",
            token,
            "--projectId",
            project,
            "--domain",
            url,
            "--env",
            env_name,
            "--path",
            path,
            "--include-imports=true",
            "--output=json",
            "--silent",
        ]
        try:
            proc = subprocess.run(cmd, cwd=ROOT, check=False, text=True, capture_output=True, timeout=30)
        except (OSError, subprocess.TimeoutExpired):
            continue
        if proc.returncode != 0 or not proc.stdout.strip():
            continue
        try:
            rows = json.loads(proc.stdout)
        except json.JSONDecodeError:
            continue
        if not isinstance(rows, list):
            continue
        for row in rows:
            key = row.get("secretKey") if isinstance(row, dict) else None
            if isinstance(key, str):
                found[key].add(path)
    return found


def render(
    required: dict[str, set[str]],
    cloud: dict[str, set[str]] | None,
) -> str:
    required_paths: dict[str, list[tuple[str, list[str]]]] = defaultdict(list)
    for key, files in sorted(required.items()):
        required_paths[recommended_path(key)].append((key, sorted(files)[:5]))

    cloud_keys = set(cloud or {})
    compared_cloud = cloud is not None
    cloud_status = (
        f"enabled; {len(cloud_keys)} key names exported"
        if cloud_keys
        else "attempted but no key names exported; check universal auth, project, env, and path permissions"
        if compared_cloud
        else "not run; set INFISICAL_UNIVERSAL_AUTH_CLIENT_ID/SECRET and INFISICAL_PROJECT_ID"
    )

    lines = [
        "# Infisical Missing Secrets Inventory",
        "",
        "Generated by `scripts/infra/inventory-infisical-secrets.py`.",
        "",
        "This report is key-name only. It never includes secret values.",
        "",
        "## Comparison Status",
        "",
        f"- Cloud comparison: {cloud_status}",
        f"- Required secret/config-like keys found in repo: {len(required)}",
        "",
    ]

    if compared_cloud:
        lines.extend(["## Missing Keys", ""])
        lines.append("| Key | Recommended path | Missing from cloud | Evidence files |")
        lines.append("| --- | --- | --- | --- |")
        for key in sorted(required):
            if key in cloud_keys:
                continue
            files = "<br>".join(f"`{item}`" for item in sorted(required[key])[:3])
            lines.append(
                f"| `{key}` | `{recommended_path(key)}` | yes | {files} |"
            )
        lines.append("")

    lines.extend(["## Required Keys By Recommended Path", ""])
    for path in sorted(required_paths):
        lines.append(f"### `{path}`")
        lines.append("")
        lines.append("| Key | Evidence files |")
        lines.append("| --- | --- |")
        for key, files in required_paths[path]:
            evidence = "<br>".join(f"`{item}`" for item in files[:3])
            lines.append(f"| `{key}` | {evidence} |")
        lines.append("")

    lines.extend(
        [
            "## Operator Notes",
            "",
            "- Add values in Infisical using the recommended path unless a more specific owner path already exists.",
            "- Keep `/shared` link-only; do not write runtime secrets there directly.",
            "- Use `make infisical-cloud-status` to audit cloud coverage before shipping infra changes.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="write docs/reports/INFISICAL_MISSING_SECRETS.md")
    args = parser.parse_args()

    required = scan_required_keys()
    cloud = export_infisical_key_names()
    report = render(required, cloud)

    if args.write:
        REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        REPORT_PATH.write_text(report, encoding="utf-8")
    else:
        sys.stdout.write(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
