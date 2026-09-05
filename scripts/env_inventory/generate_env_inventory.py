#!/usr/bin/env python3
from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCAN_DIRS = ["infra", "docs", "apps", "services"]
OUTPUT_BY_PATH = ROOT / "docs" / "configuration" / "env-inventory-by-path.md"
OUTPUT_MASTER = ROOT / "docs" / "configuration" / "env-master-hosts-and-apps.md"

SENSITIVE_MARKERS = (
    "SECRET",
    "TOKEN",
    "PASSWORD",
    "PASS",
    "KEY",
    "PRIVATE",
    "CERT",
    "CREDENTIAL",
    "AUTH",
    "DSN",
    "WEBHOOK",
)

HOST_BUCKETS = {
    "orchestrator": ["orchestrator", "litellm", "langfuse", "n8n", "cloudflare", "portainer", "openclaw", "router", "postgres", "redis", "twenty", "gitea", "infisical"],
    "homeassistant": ["homeassistant", "ha_", "hass"],
    "oracle-vps": ["oracle", "oci", "onevm", "vps"],
    "worker-rtx3090ti": ["rtx3090", "3090", "vllm", "lmcache"],
    "worker-rtx5090": ["rtx5090", "5090", "vllm", "lmcache", "ollama", "embedding"],
}

ENV_HINTS = {
    "dev": ["dev", "development", "local"],
    "staging": ["staging", "stage", "preprod"],
    "prod": ["prod", "production"],
}

ASSIGNMENT_PATTERNS = [
    re.compile(r"^\s*(?:export\s+)?([A-Z][A-Z0-9_]{1,})\s*=\s*(.*)$"),
    re.compile(r"\b([A-Z][A-Z0-9_]{1,})\s*=\s*([^\s`]+)"),
]


@dataclass
class VarHit:
    name: str
    value: str
    file: str
    line_no: int


def is_env_named(path: Path) -> bool:
    return ".env" in path.name.lower()


def collect_files() -> list[Path]:
    files: set[Path] = set()
    for child in ROOT.iterdir():
        if child.is_file() and is_env_named(child):
            files.add(child)
    for scan in SCAN_DIRS:
        base = ROOT / scan
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if path.is_file() and is_env_named(path):
                files.add(path)
    return sorted(files)


def normalize_value(raw: str) -> str:
    value = raw.strip()
    if value.startswith("#"):
        return ""
    if " #" in value:
        value = value.split(" #", 1)[0].strip()
    return value.strip().strip('"').strip("'")


def extract_vars(path: Path) -> list[VarHit]:
    hits: list[VarHit] = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return hits

    for i, line in enumerate(content, start=1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        line_hits: dict[str, VarHit] = {}
        for pattern in ASSIGNMENT_PATTERNS:
            for match in pattern.finditer(line):
                name = match.group(1)
                value = normalize_value(match.group(2) if match.lastindex and match.lastindex >= 2 else "")
                if name and name not in line_hits:
                    line_hits[name] = VarHit(name=name, value=value, file=str(path.relative_to(ROOT)), line_no=i)
        hits.extend(line_hits.values())
    return hits


def is_sensitive(var: str) -> bool:
    upper = var.upper()
    return any(marker in upper for marker in SENSITIVE_MARKERS)


def detect_env_context(path: str, value: str) -> set[str]:
    contexts: set[str] = set()
    blob = f"{path} {value}".lower()
    for env_name, hints in ENV_HINTS.items():
        if any(h in blob for h in hints):
            contexts.add(env_name)
    return contexts


def bucket_for_path(path: str) -> str:
    lower = path.lower()
    for bucket, hints in HOST_BUCKETS.items():
        if any(h in lower for h in hints):
            return bucket
    return "orchestrator"


def bucket_for_var(var: str) -> set[str]:
    lower = var.lower()
    buckets = set()
    for bucket, hints in HOST_BUCKETS.items():
        if any(h in lower for h in hints):
            buckets.add(bucket)
    if not buckets:
        buckets.add("orchestrator")
    return buckets


def main() -> None:
    files = collect_files()
    by_file: dict[str, list[VarHit]] = {}
    global_occurrences: dict[str, list[VarHit]] = defaultdict(list)
    env_contexts: dict[str, set[str]] = defaultdict(set)
    value_samples: dict[str, set[str]] = defaultdict(set)

    for path in files:
        rel = str(path.relative_to(ROOT))
        hits = extract_vars(path)
        if not hits:
            continue
        unique: dict[str, VarHit] = {}
        for hit in hits:
            unique.setdefault(hit.name, hit)
        sorted_hits = sorted(unique.values(), key=lambda h: h.name)
        by_file[rel] = sorted_hits
        for hit in sorted_hits:
            global_occurrences[hit.name].append(hit)
            if hit.value:
                env_contexts[hit.name].update(detect_env_context(rel, hit.value))
                if len(hit.value) <= 60:
                    value_samples[hit.name].add(hit.value)

    # Document 1: by path
    lines = [
        "# Env Variable Inventory by Source Path",
        "",
        "Generated from every file whose filename contains `.env` in the repo root, `infra/`, `docs/`, `apps/`, and `services/`.",
        "",
    ]
    for rel in sorted(by_file):
        lines.append(f"## `{rel}`")
        lines.append("")
        lines.append("| Variable | Sensitive? |")
        lines.append("|---|---|")
        for hit in by_file[rel]:
            lines.append(f"| `{hit.name}` | {'Yes' if is_sensitive(hit.name) else 'No'} |")
        lines.append("")

    OUTPUT_BY_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Document 2: master grouped for infisical profiles + apps
    host_vars: dict[str, set[str]] = defaultdict(set)
    app_vars: dict[str, set[str]] = defaultdict(set)

    for rel, hits in by_file.items():
        path_bucket = bucket_for_path(rel)
        for hit in hits:
            for bucket in bucket_for_var(hit.name) | {path_bucket}:
                host_vars[bucket].add(hit.name)
        if rel.startswith("apps/"):
            parts = rel.split("/")
            app = parts[1] if len(parts) > 1 else "unknown"
            for hit in hits:
                app_vars[app].add(hit.name)

    master = [
        "# Master Env/Secrets List (Deduplicated)",
        "",
        "This file is intended for Infisical host/app profiles. Variables are deduplicated globally.",
        "",
        "## Global deduplicated variable index",
        "",
        "| Variable | Sensitive? | Seen In | Env-specific values? |",
        "|---|---|---:|---|",
    ]
    for var in sorted(global_occurrences):
        contexts = sorted(env_contexts.get(var, set()))
        context_text = ", ".join(contexts) if contexts else "not specified"
        if len(value_samples.get(var, set())) > 1:
            context_text = f"multiple defaults ({context_text})"
        master.append(f"| `{var}` | {'Yes' if is_sensitive(var) else 'No'} | {len(global_occurrences[var])} | {context_text} |")

    master.append("")
    master.append("## Host-specific secret/env lists")
    master.append("")
    for host in ["orchestrator", "homeassistant", "oracle-vps", "worker-rtx3090ti", "worker-rtx5090"]:
        master.append(f"### {host}")
        vars_sorted = sorted(host_vars.get(host, set()))
        if not vars_sorted:
            master.append("_No explicit `.env`-named source file found for this host; likely inherits orchestrator/shared keys._")
            master.append("")
            continue
        for var in vars_sorted:
            marker = "(secret)" if is_sensitive(var) else ""
            master.append(f"- `{var}` {marker}".rstrip())
        master.append("")

    master.append("## App-specific secret/env lists (`apps/*`)")
    master.append("")
    for app in sorted(app_vars):
        master.append(f"### apps/{app}")
        for var in sorted(app_vars[app]):
            marker = "(secret)" if is_sensitive(var) else ""
            master.append(f"- `{var}` {marker}".rstrip())
        master.append("")

    OUTPUT_MASTER.write_text("\n".join(master) + "\n", encoding="utf-8")

    print(f"Scanned files: {len(files)}")
    print(f"Files with discovered assignments: {len(by_file)}")
    print(f"Unique variables: {len(global_occurrences)}")
    print(f"Wrote: {OUTPUT_BY_PATH.relative_to(ROOT)}")
    print(f"Wrote: {OUTPUT_MASTER.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
