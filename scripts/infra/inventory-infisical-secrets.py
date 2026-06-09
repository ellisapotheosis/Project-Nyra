#!/usr/bin/env python3
"""Inventory Project Nyra env keys and Infisical path coverage.

This is a name-only audit. It never prints secret values. If Infisical token
environment variables are present, it compares required key names against the
remote key names exported by the Infisical CLI.
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
    (re.compile(r"^INFISICAL_"), "/machines/oracle-vps"),
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
    "/databases/qdrant-local",
    "/databases/falkordb",
    "/agent-vault/vaults",
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


def export_infisical_key_names(prefix: str, default_url: str) -> dict[str, set[str]] | None:
    token = os.getenv(f"INFISICAL_TOKEN_{prefix}")
    project = os.getenv(f"INFISICAL_PROJECT_ID_{prefix}")
    url = os.getenv(f"INFISICAL_URL_{prefix}", default_url)
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
    local: dict[str, set[str]] | None,
) -> str:
    required_paths: dict[str, list[tuple[str, list[str]]]] = defaultdict(list)
    for key, files in sorted(required.items()):
        required_paths[recommended_path(key)].append((key, sorted(files)[:5]))

    cloud_keys = set(cloud or {})
    local_keys = set(local or {})
    compared_cloud = cloud is not None
    compared_local = local is not None
    cloud_status = (
        f"enabled; {len(cloud_keys)} key names exported"
        if cloud_keys
        else "attempted but no key names exported; check token, project, env, and path permissions"
        if compared_cloud
        else "not run; set INFISICAL_TOKEN_CLOUD and INFISICAL_PROJECT_ID_CLOUD"
    )
    local_status = (
        f"enabled; {len(local_keys)} key names exported"
        if local_keys
        else "attempted but no key names exported; check token, project, env, local DNS, and path permissions"
        if compared_local
        else "not run; set INFISICAL_TOKEN_LOCAL and INFISICAL_PROJECT_ID_LOCAL"
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
        f"- Local comparison: {local_status}",
        f"- Required secret/config-like keys found in repo: {len(required)}",
        "",
    ]

    if (compared_cloud and cloud_keys) or (compared_local and local_keys):
        lines.extend(["## Missing Keys", ""])
        lines.append("| Key | Recommended path | Missing from cloud | Missing from local | Evidence files |")
        lines.append("| --- | --- | --- | --- | --- |")
        for key in sorted(required):
            missing_cloud = compared_cloud and key not in cloud_keys
            missing_local = compared_local and key not in local_keys
            if not missing_cloud and not missing_local:
                continue
            files = "<br>".join(f"`{item}`" for item in sorted(required[key])[:3])
            lines.append(
                f"| `{key}` | `{recommended_path(key)}` | "
                f"{'yes' if missing_cloud else 'no' if compared_cloud else 'n/a'} | "
                f"{'yes' if missing_local else 'no' if compared_local else 'n/a'} | {files} |"
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
            "- For self-hosted/cloud parity, run `make infisical-cloud-status` first, then `make infisical-cloud-dry-run` before any sync.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="write docs/reports/INFISICAL_MISSING_SECRETS.md")
    args = parser.parse_args()

    required = scan_required_keys()
    cloud = export_infisical_key_names("CLOUD", "https://app.infisical.com")
    local = export_infisical_key_names("LOCAL", "https://infisical.trex-fiordland.ts.net")
    report = render(required, cloud, local)

    if args.write:
        REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        REPORT_PATH.write_text(report, encoding="utf-8")
    else:
        sys.stdout.write(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
