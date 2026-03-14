#!/usr/bin/env python3
from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"

SECTION_CONFIG = (
    ("Repo Root", ROOT, True),
    ("Infra", ROOT / "infra", False),
    ("Docs", ROOT / "docs", False),
    ("Apps", ROOT / "apps", False),
    ("Services", ROOT / "services", False),
)

IGNORE_PARTS = {
    ".git",
    ".next",
    ".open-next",
    ".turbo",
    "archive",
    "archives",
    "_archived",
    "build",
    "coverage",
    "dist",
    "env-backups",
    "node_modules",
    "reference",
    "references",
    "repo-history",
    "venv",
    ".venv",
}

ASSIGN_RE = re.compile(r"^(?:export\s+)?([A-Z][A-Z0-9_]+)\s*=.*$", re.M)
SECRET_RE = re.compile(
    r"(?:^|_)(?:API_KEY|AUTH_SECRET|CLIENT_SECRET|DB_PASSWORD|ENCRYPTION_KEY|JWT_SECRET|KEY|PASSWORD|SECRET|SESSION|TOKEN)(?:$|_)"
)
SECRET_EXCLUSIONS = {
    "API_KEY_HEADER",
    "COMPOSE_PROJECT_NAME",
    "GOOGLE_CLOUD_PROJECT",
    "MODEL_NAME",
    "NEXT_PUBLIC_SITE_NAME",
    "NYRA_STACK_NAME",
    "PROJECT_NAME",
    "WORKER_NAME",
}
SECRET_SUFFIX_EXCLUSIONS = (
    "_COUNT",
    "_ENABLED",
    "_EXPIRY",
    "_HEADER",
    "_INTERVAL",
    "_LIMIT",
    "_MODE",
    "_NAME",
    "_PORT",
    "_REQUIRED",
    "_TTL",
    "_URL",
    "_VERSION",
)
ENV_DEPENDENT_RE = re.compile(
    r"(?:_URL|_HOST|_PORT|_DOMAIN|_ORIGIN|_ENV$|_ENVIRONMENT$|_MODE$|_CALLBACK_URL$|_BASE_URL$|_ROOT_URL$|_SITE_URL$|_PUBLIC_BASE_URL$|_PROJECT_ID$|_DB$|_DATABASE$|DATABASE_URL|POSTGRES_URL|REDIS_URL|MONGO_URL|TAILSCALE_IP|_SUBNET$|_IP$)"
)

CONTEXT_PATTERNS = (
    ("dev", ("dev", "development", "laptop")),
    ("prod", ("prod", "production")),
    ("staging", ("stag", "stage")),
    ("preview", ("preview",)),
    ("oracle", ("oracle",)),
    ("orchestrator", ("orchestrator",)),
    ("archon", ("archon",)),
    ("gitea", ("gitea",)),
    ("infisical", ("infisical",)),
    ("openclaw", ("openclaw",)),
    ("landing", ("landing",)),
    ("ratehunter", ("ratehunter",)),
    ("twenty", ("twenty",)),
    ("claude-flow", ("claude-flow",)),
    ("nexus-router", ("nexus-router", "nexus")),
    ("worker-3060", ("worker-3060", "worker-rtx3060", "rtx-3060", "rtx3060")),
    ("worker-3090ti", ("worker-3090", "worker-rtx3090", "worker-rtx3090ti", "rtx-3090", "rtx3090", "rtx3090ti")),
    ("worker-5090", ("worker-5090", "worker-rtx5090", "rtx-5090", "rtx5090")),
    ("cicd", ("cicd", "ci")),
)


@dataclass(frozen=True)
class FileRecord:
    section: str
    path: Path
    role: str
    contexts: tuple[str, ...]
    keys: tuple[str, ...]


def should_ignore(path: Path) -> bool:
    return any(part in IGNORE_PARTS for part in path.parts)


def is_env_file(path: Path) -> bool:
    return ".env" in path.name


def classify_role(path: Path) -> str:
    name = path.name.lower()
    if "example" in name or "template" in name or name.endswith(".todo"):
        return "template"
    if any(token in name for token in ("dev", "prod", "oracle", "orchestrator", "worker", "gitea", "infisical", "cicd")):
        return "profile/runtime"
    return "runtime"


def infer_contexts(path: Path) -> tuple[str, ...]:
    slug = str(path).lower()
    contexts = []
    for label, tokens in CONTEXT_PATTERNS:
        if any(token in slug for token in tokens):
            contexts.append(label)
    return tuple(sorted(dict.fromkeys(contexts)))


def parse_keys(path: Path) -> tuple[str, ...]:
    text = path.read_text(errors="ignore")
    keys = sorted(set(ASSIGN_RE.findall(text)))
    return tuple(keys)


def iter_records() -> list[FileRecord]:
    records: list[FileRecord] = []
    seen: set[Path] = set()
    section_order = {section: index for index, (section, _, _) in enumerate(SECTION_CONFIG)}
    for section, base, root_only in SECTION_CONFIG:
        if not base.exists():
            continue
        candidates = [p for p in base.iterdir() if p.is_file()] if root_only else [p for p in base.rglob("*") if p.is_file()]
        for path in candidates:
            if path in seen:
                continue
            seen.add(path)
            if should_ignore(path):
                continue
            if not is_env_file(path):
                continue
            keys = parse_keys(path)
            if not keys:
                continue
            records.append(
                FileRecord(
                    section=section,
                    path=path.relative_to(ROOT),
                    role=classify_role(path),
                    contexts=infer_contexts(path),
                    keys=keys,
                )
            )
    return sorted(records, key=lambda record: (section_order[record.section], str(record.path)))


def is_secret(key: str) -> bool:
    if key in SECRET_EXCLUSIONS:
        return False
    if key.endswith(SECRET_SUFFIX_EXCLUSIONS):
        return False
    if key.startswith("NEXT_PUBLIC_"):
        return False
    if key.endswith("_NAME") or key.endswith("_MODEL"):
        return False
    return bool(SECRET_RE.search(key) or key in {"DATABASE_URL", "POSTGRES_URL", "REDIS_URL", "MONGO_URL"})


def is_env_dependent(key: str, contexts: set[str]) -> bool:
    runtime_contexts = contexts & {"dev", "prod", "staging", "preview", "oracle", "orchestrator", "archon", "worker-3060", "worker-3090ti", "worker-5090", "gitea", "infisical"}
    return bool(ENV_DEPENDENT_RE.search(key)) or len(runtime_contexts) > 1


def summarize_note(key: str, secret: bool, env_dependent: bool) -> str:
    if key.startswith("NEXT_PUBLIC_"):
        return "Public app/browser value; safe for client exposure but still varies by domain/environment."
    if secret:
        return "Secret material; keep in Infisical or untracked local env files."
    if key.endswith("_PORT"):
        return "Port/bind setting; often varies by host, profile, or deploy target."
    if key.endswith(("_URL", "_HOST", "_DOMAIN", "_ORIGIN", "_ROOT_URL", "_SITE_URL", "_BASE_URL")):
        return "Endpoint or hostname; update per dev/staging/prod environment."
    if key.endswith(("_MODEL", "_MODEL_NAME")) or key.startswith("MODEL_"):
        return "Model selection; may differ by machine or provider tier."
    if env_dependent:
        return "Environment-specific configuration; confirm values per role and deployment stage."
    return "Configuration value defined in active env templates."


def chunked_inline(values: tuple[str, ...], size: int = 10) -> list[str]:
    chunks = []
    values_list = list(values)
    for index in range(0, len(values_list), size):
        chunk = values_list[index:index + size]
        chunks.append(", ".join(f"`{value}`" for value in chunk))
    return chunks


def build_key_index(records: list[FileRecord], include_docs: bool) -> dict[str, dict[str, object]]:
    index: dict[str, dict[str, object]] = {}
    for record in records:
        if not include_docs and record.section == "Docs":
            continue
        for key in record.keys:
            bucket = index.setdefault(
                key,
                {
                    "sections": set(),
                    "paths": set(),
                    "contexts": set(),
                },
            )
            bucket["sections"].add(record.section)
            bucket["paths"].add(str(record.path))
            bucket["contexts"].update(record.contexts)
    return index


def write_inventory(records: list[FileRecord]) -> None:
    section_stats: Counter[str] = Counter()
    key_stats: Counter[str] = Counter()
    for record in records:
        section_stats[record.section] += 1
        key_stats[record.section] += len(record.keys)

    out = DOCS_DIR / "04_env_full_discovered.md"
    with out.open("w", encoding="utf-8") as handle:
        handle.write("# 04 Env Full Discovered (Active Source Inventory)\n\n")
        handle.write("This inventory is generated from active `.env*` files in the repo root plus the `infra`, `docs`, `apps`, and `services` trees.\n\n")
        handle.write("## Scope\n")
        handle.write("- Included: active `.env*` files with real `KEY=value` assignments.\n")
        handle.write("- Excluded: archives, references, env backups, `node_modules`, `.next`, `.open-next`, build output, and other generated folders.\n")
        handle.write("- Values are intentionally omitted; this document records keys only.\n\n")
        handle.write("## Summary\n")
        handle.write("| Section | Files scanned | Keys declared |\n")
        handle.write("|---|---:|---:|\n")
        for section, _, _ in SECTION_CONFIG:
            handle.write(f"| {section} | {section_stats[section]} | {key_stats[section]} |\n")
        handle.write("\n")

        for section, _, _ in SECTION_CONFIG:
            section_records = [record for record in records if record.section == section]
            if not section_records:
                continue
            handle.write(f"## {section}\n\n")
            for record in section_records:
                handle.write(f"### `{record.path}`\n")
                contexts = ", ".join(record.contexts) if record.contexts else "global"
                secret_count = sum(1 for key in record.keys if is_secret(key))
                handle.write(f"- Role: {record.role}\n")
                handle.write(f"- Context hints: {contexts}\n")
                handle.write(f"- Keys: {len(record.keys)} total, {secret_count} secret-like\n")
                handle.write("- Variables:\n")
                for chunk in chunked_inline(record.keys):
                    handle.write(f"  - {chunk}\n")
                handle.write("\n")


def write_required(records: list[FileRecord]) -> None:
    index = build_key_index(records, include_docs=False)
    out = DOCS_DIR / "03_env_required.md"
    with out.open("w", encoding="utf-8") as handle:
        handle.write("# 03 Env Required (Active Master List)\n\n")
        handle.write("This deduplicated list is derived from active repo-root, `infra`, `apps`, and `services` `.env*` files. `Docs`-only examples are excluded here so the output stays focused on the runnable repo.\n\n")
        handle.write(f"- Unique keys: **{len(index)}**\n")
        handle.write(f"- Source files: **{sum(1 for record in records if record.section != 'Docs')}**\n")
        handle.write("- No values are shown in this document.\n\n")

        by_letter: dict[str, list[str]] = defaultdict(list)
        for key in sorted(index):
            by_letter[key[0]].append(key)

        for letter in sorted(by_letter):
            handle.write(f"## {letter}\n")
            for key in by_letter[letter]:
                entry = index[key]
                sections = ", ".join(sorted(entry["sections"]))
                contexts = sorted(entry["contexts"])
                secret = is_secret(key)
                env_dependent = is_env_dependent(key, set(contexts))
                context_label = ", ".join(contexts) if contexts else "global"
                note = summarize_note(key, secret, env_dependent)
                handle.write(
                    f"- `{key}` — {'secret' if secret else 'config'} | scopes: {sections} | contexts: {context_label} | environment-dependent: {'yes' if env_dependent else 'no'} | {note}\n"
                )
            handle.write("\n")


def write_classified(records: list[FileRecord]) -> None:
    all_index = build_key_index(records, include_docs=True)
    docs_only_keys = sorted(
        key
        for key, entry in all_index.items()
        if set(entry["sections"]) == {"Docs"}
    )
    secret_count = sum(1 for key in all_index if is_secret(key))
    env_count = sum(1 for key, entry in all_index.items() if is_env_dependent(key, set(entry["contexts"])))
    role_counts = Counter(record.role for record in records)

    out = DOCS_DIR / "16_env_master_list_classified.md"
    with out.open("w", encoding="utf-8") as handle:
        handle.write("# 16 Environment Master List (Classified)\n\n")
        handle.write("## Methodology\n")
        handle.write("- Source of truth: active `.env*` files in repo root, `infra`, `docs`, `apps`, and `services`.\n")
        handle.write("- Excluded paths: `archive`, `archives`, `_archived`, `repo-history`, `env-backups`, `references`, `reference`, `node_modules`, `.next`, `.open-next`, `dist`, `build`, and `coverage`.\n")
        handle.write("- Parser rule: only explicit `KEY=value` assignments are counted.\n")
        handle.write("- Safety rule: values are never emitted; only key names, scope, and classification are documented.\n\n")

        handle.write("## Totals\n")
        handle.write(f"- Active `.env*` files scanned: **{len(records)}**\n")
        handle.write(f"- Unique keys across all scopes: **{len(all_index)}**\n")
        handle.write(f"- Secret-like keys: **{secret_count}**\n")
        handle.write(f"- Environment-dependent keys: **{env_count}**\n")
        handle.write(f"- Template/profile/runtime files: **{role_counts['template']}** template, **{role_counts['profile/runtime']}** profile/runtime, **{role_counts['runtime']}** runtime\n\n")

        handle.write("## Environment-Dependent Keys\n")
        handle.write("These keys should usually differ across `dev`, `staging`, `preview`, `prod`, or machine-role deployments:\n")
        handle.write("- Endpoint and routing values: anything ending in `_URL`, `_HOST`, `_DOMAIN`, `_ORIGIN`, `_ROOT_URL`, `_SITE_URL`, or `_BASE_URL`.\n")
        handle.write("- Network and bind values: anything ending in `_PORT`, `_IP`, or `_SUBNET`.\n")
        handle.write("- Deployment selectors: keys ending in `_ENV`, `_ENVIRONMENT`, `_MODE`, or `_PROJECT_ID`.\n")
        handle.write("- Public app values: `NEXT_PUBLIC_*` keys, which are safe to expose but still vary by domain or environment.\n")
        handle.write("- Machine/profile values: worker GPU settings, Tailscale addresses, model choices, and worker-specific tunnel hostnames/tokens.\n\n")

        handle.write("## Secret Handling\n")
        handle.write("- Secret-like keys include `*_TOKEN`, `*_SECRET`, `*_PASSWORD`, `*_API_KEY`, connection URLs such as `DATABASE_URL`, and provider credentials.\n")
        handle.write("- Keep real values in Infisical, GitHub/Gitea secrets, or ignored local env files such as `.env.gitea`; do not commit live credentials.\n")
        handle.write("- `NEXT_PUBLIC_*` keys are treated as non-secret even when they are environment-dependent.\n\n")

        handle.write("## Docs-Only Keys\n")
        handle.write("These keys appear only in live docs-managed env examples and not in active root/infra/apps/services env files. Review them before treating them as required runtime inputs.\n\n")
        if docs_only_keys:
            for chunk in chunked_inline(tuple(docs_only_keys), size=8):
                handle.write(f"- {chunk}\n")
        else:
            handle.write("- None.\n")
        handle.write("\n")


def main() -> None:
    records = iter_records()
    write_required(records)
    write_inventory(records)
    write_classified(records)
    print("Wrote docs/03_env_required.md, docs/04_env_full_discovered.md, and docs/16_env_master_list_classified.md")


if __name__ == "__main__":
    main()
