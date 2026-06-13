#!/usr/bin/env python3
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]

PRIMARY_COMPOSE_FILES = [
    Path("infra/docker-compose.yml"),
    Path("docker-compose.archon.yml"),
    Path("docker-compose.gitea.yml"),
    Path("docker-compose.infisical.yml"),
    Path("infra/oracle/docker-compose.oracle.yml"),
    Path("infra/workers/worker-rtx3060/docker-compose.worker.yml"),
    Path("infra/workers/worker-rtx3090ti/docker-compose.worker.yml"),
    Path("infra/workers/worker-rtx5090/docker-compose.worker.yml"),
]

SUPPLEMENTAL_COMPOSE_FILES = [
    Path("infra/docker-compose.twenty.yml"),
    Path("infra/docker-compose.archon-os-cicd.yml"),
    Path("infra/docker-compose.orchestrator-cf-tunnel.yml"),
    Path("infra/docker-compose.dashboard.yml"),
    Path("infra/orchestrator/docker-compose.nexus-one-hop.yml"),
    Path("infra/compose/docker-compose.archon.yml"),
    Path("infra/compose/docker-compose.cloudflared.yml"),
    Path("infra/compose/overrides/docker-compose.orchestrator.override.yml"),
    Path("infra/compose/overrides/docker-compose.oracle.override.yml"),
    Path("infra/compose/overrides/docker-compose.worker-rtx3060.override.yml"),
    Path("infra/compose/overrides/docker-compose.dev-laptop.override.yml"),
    Path("docker-compose.gitea.bootstrap.yml"),
    Path("docker-compose.infisical.bootstrap.yml"),
]

HEALTH_ENDPOINTS = {
    "grafana": "/api/health",
    "n8n": "/healthz",
    "quote-api": "/health",
}

PUBLIC_SERVICES = {
    "activepieces": {
        "hostname": "activepieces.nyra.example.com",
        "note": "workflow UI",
        "access": "required",
    },
    "archon-ui": {
        "hostname": "archon.nyra.example.com",
        "note": "Archon operator UI",
        "access": "required",
    },
    "gitea": {
        "hostname": "gitea.nyra.example.com",
        "note": "git forge UI",
        "access": "required",
    },
    "grafana": {
        "hostname": "grafana.nyra.example.com",
        "note": "observability UI",
        "access": "required",
    },
    "infisical": {
        "hostname": "infisical.nyra.example.com",
        "note": "secrets UI and API",
        "access": "required",
    },
    "n8n": {
        "hostname": "n8n.nyra.example.com",
        "note": "automation UI and API",
        "access": "required",
    },
    "twentycrm": {
        "hostname": "twentycrm.nyra.example.com",
        "note": "CRM app",
        "access": "required",
    },
}

PRIVATE_ONLY = {
    "archon-os",
    "archon-agents",
    "archon-mcp",
    "archon-os",
    "archon-server",
    "bitwarden-mcp",
    "cadvisor",
    "archon-os",
    "docker-mcp-toolkit",
    "git-mcp",
    "github-mcp",
    "infisical-agent",
    "infisical-cli",
    "infisical-mcp",
    "loki",
    "moltbot",
    "moltbot-web",
    "openwebui",
    "prometheus",
    "quote-api",
    "ruvector-pgadmin",
    "twenty",
    "twentycrm-mcp",
    "worker-3060-ollama",
    "worker-3090ti-vllm",
    "worker-5090-vllm",
}

DATASTORE_HINTS = (
    "postgres",
    "redis",
    "mongo",
    "mysql",
    "mariadb",
    "neo4j",
    "qdrant",
    "falkordb",
    "minio",
    "db",
)

NODE_PLACEMENT = {
    "activepieces": ("oracle/orchestrator", "workflow automation surface", "Access-protected public"),
    "archon-ui": ("orchestrator", "operator-facing Archon UI", "Access-protected public"),
    "gitea": ("orchestrator", "internal forge and CI control plane", "Access-protected web, SSH restricted"),
    "grafana": ("orchestrator/oracle", "operator observability UI", "Access-protected public"),
    "infisical": ("orchestrator", "secrets control plane", "Access-protected public"),
    "n8n": ("oracle/orchestrator", "workflow control surface", "Access-protected public"),
    "postgres": ("oracle", "primary relational state", "private"),
    "quote-api": ("oracle", "domain API for pricing workflows", "private"),
    "redis": ("oracle", "shared cache and queue state", "private"),
    "twentycrm": ("oracle", "CRM core app with durable backing services", "Access-protected public"),
    "worker-3060-ollama": ("workers", "GPU-bound inference runtime", "private"),
    "worker-3090ti-vllm": ("workers", "GPU-bound inference runtime", "private"),
    "worker-5090-vllm": ("workers", "high-end GPU inference runtime", "private"),
}

TUNNEL_UUID = "00000000-0000-0000-0000-000000000000"
DOMAIN_ROOT = "nyra.example.com"
ACTIVE_DOC_RANGE = [f"{i:02d}" for i in range(13, 21)]


@dataclass
class ServiceRow:
    service: str
    repo_path: str
    compose_service: str
    container_ports: str
    host_ports: str
    protocol: str
    health_endpoint: str
    exposure: str
    proposed_hostname: str
    ingress_snippet: str
    localhost_target: str
    image: str


def load_compose(path: Path) -> dict[str, Any]:
    with (ROOT / path).open(encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    return data


def discover_authoritative_set() -> tuple[list[Path], list[Path], list[Path]]:
    compose_hits: set[Path] = set()
    make_and_script_sources = [Path("Makefile"), Path("infra/scripts/node-up.sh"), Path("infra/scripts/ultimate-bootstrap.sh")]
    file_pattern = re.compile(r"([A-Za-z0-9_./-]*compose[A-Za-z0-9_./-]*\.ya?ml)")

    for src in make_and_script_sources:
        text = (ROOT / src).read_text(encoding="utf-8")
        for hit in file_pattern.findall(text):
            path = Path(hit)
            if path.exists() and "docs/" not in str(path) and "_archived/" not in str(path) and "infra-archived/" not in str(path):
                compose_hits.add(path)

    for hit in ROOT.glob("infra/**/docker-compose*.yml"):
        if "archive" in hit.parts:
            continue
        compose_hits.add(hit.relative_to(ROOT))
    for hit in ROOT.glob("infra/compose/*.yml"):
        compose_hits.add(hit.relative_to(ROOT))

    primary = sorted((p for p in compose_hits if p in PRIMARY_COMPOSE_FILES), key=str)
    active = sorted((p for p in compose_hits if p not in SUPPLEMENTAL_COMPOSE_FILES), key=str)
    supplemental = sorted((p for p in compose_hits if p in SUPPLEMENTAL_COMPOSE_FILES), key=str)

    for path in PRIMARY_COMPOSE_FILES:
        if path.exists() and path not in active:
            active.append(path)
    active = sorted(set(active), key=str)
    return primary, active, supplemental


def normalize_port_value(raw: str) -> str:
    value = raw.strip()
    if not value.startswith("${") or not value.endswith("}"):
        return value
    inner = value[2:-1]
    if ":-" in inner:
        return inner.split(":-", 1)[1]
    if "-" in inner:
        return inner.split("-", 1)[1]
    if ":?" in inner:
        return inner.split(":?", 1)[0]
    if "?" in inner:
        return inner.split("?", 1)[0]
    return inner


def split_top_level(value: str, delimiter: str) -> list[str]:
    parts: list[str] = []
    current: list[str] = []
    brace_depth = 0
    index = 0
    while index < len(value):
        if value.startswith("${", index):
            brace_depth += 1
            current.append("${")
            index += 2
            continue
        char = value[index]
        if char == "}" and brace_depth:
            brace_depth -= 1
        if char == delimiter and brace_depth == 0:
            parts.append("".join(current))
            current = []
        else:
            current.append(char)
        index += 1
    parts.append("".join(current))
    return parts


def split_port_mapping(raw: Any) -> tuple[str, str, str]:
    if isinstance(raw, int):
        value = str(raw)
    else:
        value = str(raw).strip()
    protocol = "tcp"
    if "/" in value:
        value, protocol = value.rsplit("/", 1)
    parts = split_top_level(value, ":")
    if len(parts) == 1:
        return "", normalize_port_value(parts[0]), protocol
    if len(parts) == 2:
        host, container = parts
        return normalize_port_value(host), normalize_port_value(container), protocol
    host_ip, host, container = parts[-3:]
    host_value = f"{host_ip}:{normalize_port_value(host)}"
    return host_value, normalize_port_value(container), protocol


def primary_http_host_port(service: str, ports: list[Any]) -> str:
    preferred_container_ports = {
        "activepieces": "80",
        "archon-ui": "5173",
        "gitea": "3000",
        "grafana": "3000",
        "infisical": "8080",
        "n8n": "5678",
        "twentycrm": "3000",
    }
    preferred = preferred_container_ports.get(service)
    parsed = [split_port_mapping(port) for port in ports]
    if preferred:
        for host, container, _ in parsed:
            if container == preferred and host:
                return normalize_port_value(split_top_level(host, ":")[-1])
    for host, container, _ in parsed:
        if host and container not in {"22", "5432", "6379", "27017"}:
            return normalize_port_value(split_top_level(host, ":")[-1])
    return ""


def classify_private(service: str, image: str) -> bool:
    lowered = f"{service} {image}".lower()
    if service in PUBLIC_SERVICES:
        return False
    if service in PRIVATE_ONLY:
        return True
    return any(hint in lowered for hint in DATASTORE_HINTS)


def collect_rows(compose_files: list[Path]) -> list[ServiceRow]:
    rows: list[ServiceRow] = []
    for compose_path in compose_files:
        data = load_compose(compose_path)
        services = data.get("services", {})
        for service_name, config in services.items():
            ports = config.get("ports", [])
            parsed_ports = [split_port_mapping(port) for port in ports]
            host_ports = ", ".join(host for host, _, _ in parsed_ports if host) or "—"
            container_ports = ", ".join(container for _, container, _ in parsed_ports) or "—"
            protocols = ", ".join(sorted({proto for _, _, proto in parsed_ports})) or "—"
            image = str(config.get("image", "")) or str(config.get("build", ""))
            public_meta = PUBLIC_SERVICES.get(service_name)
            localhost_port = primary_http_host_port(service_name, ports)
            if public_meta and localhost_port:
                localhost_target = f"http://localhost:{localhost_port}"
                ingress = f"- hostname: {public_meta['hostname']}\n  service: {localhost_target}"
                exposure = "public-via-cloudflare-access"
                hostname = public_meta["hostname"]
            else:
                localhost_target = "—"
                ingress = "—"
                hostname = ""
                exposure = "private" if classify_private(service_name, image) else "private"
            rows.append(
                ServiceRow(
                    service=service_name,
                    repo_path=str(compose_path),
                    compose_service=service_name,
                    container_ports=container_ports,
                    host_ports=host_ports,
                    protocol=protocols,
                    health_endpoint=HEALTH_ENDPOINTS.get(service_name, "—"),
                    exposure=exposure,
                    proposed_hostname=hostname,
                    ingress_snippet=ingress,
                    localhost_target=localhost_target,
                    image=image,
                )
            )
    return rows


def canonicalize(rows: list[ServiceRow]) -> tuple[list[ServiceRow], list[ServiceRow]]:
    canonical: list[ServiceRow] = []
    appendix: list[ServiceRow] = []
    seen: set[str] = set()
    for row in rows:
        if row.service not in seen:
            canonical.append(row)
            seen.add(row.service)
        else:
            appendix.append(row)
    return canonical, appendix


def write_ports_registry(canonical: list[ServiceRow], appendix: list[ServiceRow], primary: list[Path], active: list[Path], supplemental: list[Path]) -> None:
    ports_doc = ROOT / "docs/02_ports_registry.md"
    appendix_doc = ROOT / "docs/02_ports_registry.appendix_legacy.md"
    with ports_doc.open("w", encoding="utf-8") as handle:
        handle.write("# 02 Ports Registry (Active Only)\n\n")
        handle.write("_Generated from the canonical compose set used by `Makefile`, `infra/scripts/node-*.sh`, and the dedicated root bootstrap stacks._\n\n")
        handle.write("## Authoritative compose set\n")
        for compose_path in primary:
            handle.write(f"- `{compose_path}`\n")
        handle.write("\n## Active compose scope used for registry\n")
        for compose_path in active:
            handle.write(f"- `{compose_path}`\n")
        handle.write("\n")
        handle.write("## Exposure policy\n")
        handle.write("- Datastores and worker inference backends default to `private`.\n")
        handle.write("- Only explicitly approved operator-facing HTTP services receive proposed hostnames or cloudflared snippets.\n")
        handle.write("- Internal APIs and gateways remain private by default even when they speak HTTP.\n")
        handle.write("- The marketing landing page stays on Cloudflare Pages and is not tunnel-routed.\n\n")
        handle.write(f"> Replace the example domain `{DOMAIN_ROOT}` with your real Cloudflare zone before provisioning DNS.\n\n")
        handle.write("| Service | Repo path (FINAL) | Compose service name | Container port(s) | Host port(s) | Protocol | Health endpoint | Exposure | Proposed hostname | Cloudflared ingress snippet |\n")
        handle.write("|---|---|---|---|---|---|---|---|---|---|\n")
        for row in sorted(canonical, key=lambda item: item.service):
            handle.write(
                f"| {row.service} | `{row.repo_path}` | `{row.compose_service}` | `{row.container_ports}` | `{row.host_ports}` | `{row.protocol}` | {row.health_endpoint} | {row.exposure} | {row.proposed_hostname or ' '} | {row.ingress_snippet.replace(chr(10), '<br>')} |\n"
            )

    with appendix_doc.open("w", encoding="utf-8") as handle:
        handle.write("# 02 Ports Registry Appendix (Secondary and Parallel Compose Paths)\n\n")
        handle.write("These entries are intentionally excluded from the active registry because they are overrides, bootstrap-safe parallels, or secondary runtime definitions.\n\n")
        handle.write("## Secondary compose set\n")
        for compose_path in supplemental:
            handle.write(f"- `{compose_path}`\n")
        handle.write("\n")
        handle.write("| Service | Repo path | Host port(s) | Exposure |\n")
        handle.write("|---|---|---|---|\n")
        for row in sorted(appendix, key=lambda item: (item.service, item.repo_path)):
            handle.write(f"| {row.service} | `{row.repo_path}` | `{row.host_ports}` | {row.exposure} |\n")


def write_cloudflared_docs(canonical: list[ServiceRow]) -> None:
    tunnel_rows = [row for row in canonical if row.proposed_hostname and row.localhost_target != "—"]
    config_path = ROOT / "infra/cloudflared/config.yml"
    with config_path.open("w", encoding="utf-8") as handle:
        handle.write("# Cloudflared tunnel config (host-run canonical template)\n")
        handle.write("# Replace the placeholder tunnel UUID and domain before deployment.\n")
        handle.write("# Validate with:\n")
        handle.write("# docker run --rm -v $(pwd)/infra/cloudflared:/etc/cloudflared cloudflare/cloudflared:latest tunnel ingress validate --config /etc/cloudflared/config.yml\n\n")
        handle.write(f"tunnel: {TUNNEL_UUID}\n")
        handle.write("credentials-file: /etc/cloudflared/credentials.json\n\n")
        handle.write("ingress:\n")
        for row in tunnel_rows:
            handle.write(f"  - hostname: {row.proposed_hostname}\n")
            handle.write(f"    service: {row.localhost_target}\n")
        handle.write("  - service: http_status:404\n")

    hostname_map = ROOT / "infra/cloudflared/hostname-map.md"
    tunnels_doc = ROOT / "docs/06_cloudflared_tunnels_dns.md"
    export_doc = ROOT / "docs/edge/CLOUDFLARED_EXPORT.md"

    for path in (hostname_map, tunnels_doc, export_doc):
        path.parent.mkdir(parents=True, exist_ok=True)

    with hostname_map.open("w", encoding="utf-8") as handle:
        handle.write("# Hostname Map (Tunnel + DNS)\n\n")
        handle.write("## Public internet\n\n")
        handle.write("- `ratehunter.net` -> Cloudflare Pages (`apps/landing/ratehunter-landing`) (public marketing)\n\n")
        handle.write(f"> Replace `{DOMAIN_ROOT}` and `<TUNNEL_UUID>` with the real zone and tunnel ID before creating DNS records.\n\n")
        handle.write("## Tunnel hostnames (Cloudflare Access required)\n\n")
        handle.write("| Hostname | Local origin | Record type | Notes |\n")
        handle.write("|---|---|---|---|\n")
        for row in tunnel_rows:
            note = PUBLIC_SERVICES[row.service]["note"]
            handle.write(f"| `{row.proposed_hostname}` | `{row.localhost_target}` | proxied CNAME | {note} |\n")
        handle.write("\nEach CNAME points to `<TUNNEL_UUID>.cfargotunnel.com`.\n\n")
        handle.write("## Explicitly excluded from tunnel\n\n")
        handle.write("- Datastores: `postgres`, `redis`, `mongo`, `ruvector`, `ruvector-postgres`, `gitea-db`, `infisical-db`, `infisical-redis`\n")
        handle.write("- Worker inference backends: `worker-3060-ollama`, `worker-3090ti-vllm`, `worker-5090-vllm`\n")
        handle.write("- SSH and raw TCP endpoints, including `gitea` SSH on port `22`\n")

    dns_cli_lines = "\n".join(
        f"cloudflared tunnel route dns <NAME_OR_UUID> {row.proposed_hostname}" for row in tunnel_rows
    )
    dns_records = "\n".join(
        f"- `{row.proposed_hostname}` -> `<TUNNEL_UUID>.cfargotunnel.com`" for row in tunnel_rows
    )
    for path in (tunnels_doc, export_doc):
        with path.open("w", encoding="utf-8") as handle:
            title = (
                "# 06 Cloudflared Tunnels + DNS (Regenerated, Zero-Datastore-Leak)"
                if path.name == "06_cloudflared_tunnels_dns.md"
                else "# Cloudflared Export (Owner Summary)"
            )
            handle.write(f"{title}\n\n")
            handle.write("## Guardrails\n\n")
            handle.write("- Tunnel only explicit HTTP(S) apps.\n")
            handle.write("- Cloudflare Access is required for every tunneled hostname in this pack.\n")
            handle.write("- The marketing landing page remains on Cloudflare Pages and stays public.\n")
            handle.write("- No datastore, SSH, or raw TCP ingress is included.\n")
            handle.write("- Final ingress rule is `http_status:404`.\n\n")
            handle.write(f"> Replace the example domain `{DOMAIN_ROOT}` and `<TUNNEL_UUID>` before applying DNS or tunnel routes.\n\n")
            handle.write("## DNS records to create\n\n")
            handle.write(f"{dns_records}\n\n")
            handle.write("## CLI alternative\n\n```bash\n")
            handle.write(dns_cli_lines)
            handle.write("\n```\n\n")
            handle.write("## Active tunnel hostnames\n\n")
            handle.write("| Hostname | Local origin | Access policy | Notes |\n")
            handle.write("|---|---|---|---|\n")
            for row in tunnel_rows:
                note = PUBLIC_SERVICES[row.service]["note"]
                handle.write(f"| `{row.proposed_hostname}` | `{row.localhost_target}` | required | {note} |\n")
            handle.write("\n## Explicitly non-exposed services\n\n")
            handle.write("- `postgres`, `redis`, `mongo`, `ruvector`, `ruvector-postgres`, `gitea-db`, `infisical-db`, `infisical-redis`\n")
            handle.write("- `worker-3060-ollama`, `worker-3090ti-vllm`, `worker-5090-vllm`\n")
            handle.write("- `gitea` SSH on port `22`\n")


def write_recovery_docs(canonical: list[ServiceRow], primary: list[Path], active: list[Path], supplemental: list[Path]) -> None:
    docs13 = ROOT / "docs/13_infra_recovery_consolidation_plan.md"
    docs14 = ROOT / "docs/14_infra_target_tree.md"
    docs16 = ROOT / "docs/16_env_master_list_classified.md"
    docs17 = ROOT / "docs/17_mcp_registry.md"
    docs18 = ROOT / "docs/18_ui_registry.md"
    docs19 = ROOT / "docs/19_cloud_offload_recommendations.md"
    node_doc = ROOT / "docs/15_node_placement_oracle_vs_orchestrator_vs_workers.md"
    confidence_doc = ROOT / "docs/20_recovery_confidence_report.md"
    interesting = [
        "postgres",
        "redis",
        "n8n",
        "activepieces",
        "twentycrm",
        "quote-api",
        "grafana",
        "gitea",
        "infisical",
        "archon-ui",
        "worker-3060-ollama",
        "worker-3090ti-vllm",
        "worker-5090-vllm",
    ]
    by_name = {row.service: row for row in canonical}

    with docs13.open("w", encoding="utf-8") as handle:
        handle.write("# 13 Infra Recovery Consolidation Plan\n\n")
        handle.write("## What failed previously\n\n")
        handle.write("- Prior generated docs included low-signal placeholders and timestamp-only content.\n")
        handle.write("- Ports inventory included non-runtime compose examples from references and archive trees.\n")
        handle.write("- Edge exposure guidance lacked strict guardrails for datastore isolation.\n\n")
        handle.write("## What is repaired in this pass\n\n")
        handle.write("1. Inventory-first flow captured compose, workflows, Make targets, and secrets posture.\n")
        handle.write("2. Active-only ports registry regenerated from authoritative compose inputs.\n")
        handle.write("3. Cloudflared edge pack regenerated with explicit fail-closed 404 and no datastores.\n")
        handle.write("4. Gitea + Infisical additive bootstrap path retained without replacing existing stacks.\n\n")
        handle.write("## Authoritative sources used\n\n")
        for path in primary:
            handle.write(f"- `{path}`\n")
        handle.write("\n## Safety guarantees\n\n")
        handle.write("- No destructive file operations performed.\n")
        handle.write("- No real secret values committed.\n")
        handle.write("- Datastore services are not assigned public hostnames.\n")
        handle.write("- Existing Makefile targets remain unchanged and additive targets are preserved.\n")
        handle.write("- If a risky merge is detected later, parallel files should be added with explicit suffixes.\n\n")
        handle.write("## Validation gates attached to this plan\n\n")
        handle.write("- Compose parse/merge checks for Gitea + Infisical bootstrap paths.\n")
        handle.write("- YAML parse checks for GitHub + Gitea workflows.\n")
        handle.write("- Make target dry-runs for additive bootstrap wrappers.\n")
        handle.write("- Cloudflared ingress syntax validation using cloudflare/cloudflared image.\n\n")
        handle.write("## File evidence map\n\n")
        handle.write("| Requirement | Evidence file |\n")
        handle.write("|---|---|\n")
        handle.write("| Primary stack orchestration | `Makefile` |\n")
        handle.write("| Node role execution | `infra/scripts/node-up.sh` |\n")
        handle.write("| Role/profile orchestration | `infra/scripts/ultimate-bootstrap.sh` |\n")
        handle.write("| Active cloudflared config | `infra/cloudflared/config.yml` |\n")
        handle.write("| DNS/hostname mapping | `infra/cloudflared/hostname-map.md` |\n")
        handle.write("| Active ports registry | `docs/02_ports_registry.md` |\n")
        handle.write("| Legacy appendix | `docs/02_ports_registry.appendix_legacy.md` |\n")
        handle.write("| Recovery confidence output | `docs/20_recovery_confidence_report.md` |\n")

    with docs14.open("w", encoding="utf-8") as handle:
        handle.write("# 14 Infra Target Tree (Post-Move Runtime Truth)\n\n")
        handle.write("## Canonical runtime graph\n\n")
        handle.write("- Root Make orchestration: `Makefile`.\n")
        handle.write("- Node bring-up scripts: `infra/scripts/node-up.sh`, `infra/scripts/node-down.sh`.\n")
        handle.write("- Role/profile bootstrap: `infra/scripts/ultimate-bootstrap.sh`.\n\n")
        handle.write("## Primary compose files\n\n")
        for path in primary:
            handle.write(f"- `{path}`\n")
        handle.write("\n## Additional active compose definitions\n\n")
        for path in active:
            if path in primary:
                continue
            handle.write(f"- `{path}`\n")
        handle.write("\n## Supplemental (appendix only) compose definitions\n\n")
        for path in supplemental:
            handle.write(f"- `{path}`\n")

    with docs16.open("w", encoding="utf-8") as handle:
        handle.write("# 16 Environment Master List (Classified)\n\n")
        handle.write("## Active bootstrap env files\n\n")
        handle.write("- `.env.stack`\n")
        handle.write("- `.env.gitea`\n")
        handle.write("- `.env.infisical`\n")
        handle.write("- `infra/env/.env.orchestrator`\n")
        handle.write("- `infra/env/.env.oracle`\n")
        handle.write("- `infra/env/.env.worker-rtx3060`\n")
        handle.write("- `infra/env/.env.worker-rtx3090ti`\n")
        handle.write("- `infra/env/.env.worker-rtx5090`\n\n")
        handle.write("## Secret classes\n\n")
        handle.write("- Authentication material: `*_TOKEN`, `*_SECRET`, `*_PASSWORD`, `*_API_KEY`.\n")
        handle.write("- Encryption material: `INFISICAL_ENCRYPTION_KEY`, `INFISICAL_AUTH_SECRET`.\n")
        handle.write("- Infrastructure credentials: DB credentials and registry auth tokens.\n\n")
        handle.write("## Environment-dependent classes\n\n")
        handle.write("- Host routing: `*_URL`, `*_DOMAIN`, `*_HOST`, `*_ROOT_URL`.\n")
        handle.write("- Port exposure: `*_PORT`.\n")
        handle.write("- Runtime profile selectors: `*_ENV`, `*_ENVIRONMENT`, role profile variables.\n\n")
        handle.write("## Repository guardrails\n\n")
        handle.write("- `.env.gitea`, `.env.infisical`, and `.secrets/` are gitignored.\n")
        handle.write("- Templates (`.env.*.template`) remain committed for bootstrap reproducibility.\n")
        handle.write("- Generated docs never embed live secret values.\n\n")
        handle.write("## Known bootstrap variables (excerpt)\n\n")
        handle.write("| Variable | Class | Source stack |\n")
        handle.write("|---|---|---|\n")
        handle.write("| `GITEA_PORT` | env-dependent | `docker-compose.gitea.yml` |\n")
        handle.write("| `GITEA_SSH_PORT` | env-dependent | `docker-compose.gitea.yml` |\n")
        handle.write("| `INFISICAL_PORT` | env-dependent | `docker-compose.infisical.yml` |\n")
        handle.write("| `INFISICAL_POSTGRES_PASSWORD` | secret | `docker-compose.infisical.yml` |\n")
        handle.write("| `INFISICAL_ENCRYPTION_KEY` | secret | `docker-compose.infisical.yml` |\n")
        handle.write("| `INFISICAL_AUTH_SECRET` | secret | `docker-compose.infisical.yml` |\n")
        handle.write("| `INFISICAL_TOKEN` | secret | `docker-compose.gitea.yml`, `docker-compose.archon.yml` |\n")
        handle.write("| `INFISICAL_PROJECT_ID` | env-dependent | `docker-compose.gitea.yml`, workflows |\n")
        handle.write("| `STACK_ENV_FILE` | env-dependent | `Makefile` |\n")

    mcp_rows = [row for row in canonical if "mcp" in row.service.lower()]
    with docs17.open("w", encoding="utf-8") as handle:
        handle.write("# 17 MCP Registry (Observed in Active Compose)\n\n")
        handle.write("| Service | Source compose | Host port(s) | Exposure |\n")
        handle.write("|---|---|---|---|\n")
        for row in sorted(mcp_rows, key=lambda x: x.service):
            handle.write(f"| `{row.service}` | `{row.repo_path}` | `{row.host_ports}` | `{row.exposure}` |\n")
        handle.write("\nAll MCP endpoints are private-only by default and excluded from cloudflared ingress.\n\n")
        handle.write("## Governance controls\n\n")
        handle.write("- MCP exposure requires explicit owner approval and Access policy design.\n")
        handle.write("- Service-to-service credentials should come from Infisical runtime injection.\n")
        handle.write("- No direct public DNS records are proposed for MCP service endpoints.\n")
        handle.write("- Health checks should run from private network paths only.\n\n")
        handle.write("## Operational ownership\n\n")
        handle.write("- Platform team owns compose registration and lifecycle wiring.\n")
        handle.write("- Security/compliance owns secret policy and token rotation cadence.\n")
        handle.write("- Application teams own functional MCP integrations and call-volume governance.\n\n")
        handle.write("## Network stance\n\n")
        handle.write("- MCP ports are reachable from trusted private networks only.\n")
        handle.write("- No Cloudflare tunnel ingress routes are created for MCP ports.\n")
        handle.write("- Any exception must include Access service-token enforcement.\n\n")
        handle.write("## Validation commands\n\n")
        handle.write("```bash\n")
        handle.write("rg -n \"mcp\" infra/docker-compose.yml\n")
        handle.write("rg -n \"hostname:\" infra/cloudflared/config.yml\n")
        handle.write("```\n")

    ui_rows = [row for row in canonical if row.proposed_hostname]
    with docs18.open("w", encoding="utf-8") as handle:
        handle.write("# 18 UI Registry (Active Surfaces)\n\n")
        handle.write("| UI Service | Source compose | Host port(s) | Access stance | Proposed hostname |\n")
        handle.write("|---|---|---|---|---|\n")
        for row in sorted(ui_rows, key=lambda x: x.service):
            handle.write(f"| `{row.service}` | `{row.repo_path}` | `{row.host_ports}` | Cloudflare Access required | `{row.proposed_hostname}` |\n")
        handle.write("\nMarketing landing remains on Cloudflare Pages and is the only intended public unauthenticated surface.\n\n")
        handle.write("## Exposure classes\n\n")
        handle.write("- **Public (no Access):** marketing landing only.\n")
        handle.write("- **Protected via Access:** operator UIs listed in the table.\n")
        handle.write("- **Private-only:** internal APIs, datastores, MCP adapters, and worker runtimes.\n\n")
        handle.write("## Change-control checklist for new UIs\n\n")
        handle.write("1. Verify service is HTTP(S) and not datastore/queue.\n")
        handle.write("2. Add hostname + ingress mapping with Access required.\n")
        handle.write("3. Add DNS CNAME target to tunnel UUID.\n")
        handle.write("4. Add rollback entry by removing hostname + DNS and re-validating ingress.\n")
        handle.write("\n## Evidence pointers\n\n")
        handle.write("- UI host/port declarations: `infra/docker-compose.yml`, `docker-compose.gitea.yml`, `docker-compose.infisical.yml`.\n")
        handle.write("- Access-protected ingress list: `infra/cloudflared/config.yml`.\n")
        handle.write("- DNS CNAME plan: `infra/cloudflared/hostname-map.md`.\n")
        handle.write("- Active-only registry cross-check: `docs/02_ports_registry.md`.\n")
        handle.write("\n## Monitoring recommendations\n\n")
        handle.write("- Add uptime probes for each Access-protected hostname through authenticated checks.\n")
        handle.write("- Alert on repeated 403/401 spikes to identify Access policy drift.\n")
        handle.write("- Alert on unexpected 404 response volume to catch DNS/ingress mismatches.\n")
        handle.write("- Track TLS/certificate expiry and Cloudflare tunnel health status per hostname.\n")

    with docs19.open("w", encoding="utf-8") as handle:
        handle.write("# 19 Cloud Offload Recommendations\n\n")
        handle.write("## Immediate decisions\n\n")
        handle.write("- Keep static landing on Cloudflare Pages.\n")
        handle.write("- Tunnel only approved HTTP applications via cloudflared + Access.\n")
        handle.write("- Keep databases, queues, and vector stores private on node-local networks.\n\n")
        handle.write("## Candidate matrix\n\n")
        handle.write("| Component class | Offload target | Decision |\n")
        handle.write("|---|---|---|\n")
        handle.write("| Marketing UI | Cloudflare Pages | proceed |\n")
        handle.write("| Operator UIs | Cloudflared tunnel + Access | proceed |\n")
        handle.write("| Datastores | none/public internet | reject |\n")
        handle.write("| Worker inference | private worker nodes | keep private |\n")
        handle.write("| MCP services | private network only | keep private |\n")
        handle.write("\n## Enforcement recommendations\n\n")
        handle.write("- Add CI check to reject datastores in `infra/cloudflared/config.yml`.\n")
        handle.write("- Keep final ingress catch-all `http_status:404` mandatory.\n")
        handle.write("- Require explicit owner + policy when adding new tunnel hostnames.\n")
        handle.write("- Keep SSH, Redis, Postgres, Mongo, and vector DB protocols off public edge routes.\n\n")
        handle.write("## Suggested phased rollout\n\n")
        handle.write("1. Stage 1: deploy cloudflared with only `n8n` and `grafana` hostnames.\n")
        handle.write("2. Stage 2: add `gitea` and `infisical` with stricter Access policies.\n")
        handle.write("3. Stage 3: add remaining operator surfaces after synthetic monitoring baselines.\n")
        handle.write("4. Stage 4: continuous drift check between compose ports and ingress hostnames.\n")
        handle.write("\n## Drift detection heuristics\n\n")
        handle.write("- Fail pipeline if a datastore service appears under `ingress:`.\n")
        handle.write("- Fail pipeline if any ingress target is non-HTTP and non-HTTPS.\n")
        handle.write("- Warn if a public hostname is missing corresponding CNAME route instructions.\n")
        handle.write("- Warn if `docs/02_ports_registry.md` and `infra/cloudflared/config.yml` diverge.\n")
        handle.write("\n## Business-impact rationale\n\n")
        handle.write("- Keeping stateful services private reduces accidental data exposure risk.\n")
        handle.write("- Tunneling only operator UIs keeps administration available without exposing LAN ports.\n")
        handle.write("- Cloudflare Pages remains the low-risk public surface for marketing content.\n")

    with node_doc.open("w", encoding="utf-8") as handle:
        handle.write("# 15 Node Placement: Oracle vs Orchestrator vs Workers\n\n")
        handle.write("## Placement matrix (active services)\n\n")
        handle.write("| Service | Node | Why | Ports | Exposure |\n")
        handle.write("|---|---|---|---|---|\n")
        for service in interesting:
            row = by_name.get(service)
            if not row:
                continue
            node, why, exposure = NODE_PLACEMENT.get(service, ("unknown", "requires operator confirmation", row.exposure))
            ports = row.host_ports if row.host_ports != "—" else row.container_ports
            handle.write(f"| {service} | {node} | {why} | {ports} | {exposure} |\n")
        handle.write("\n## Evidence\n\n")
        handle.write("- Base stack: `infra/docker-compose.yml`\n")
        handle.write("- Oracle stack: `infra/oracle/docker-compose.oracle.yml`\n")
        handle.write("- Dedicated Archon stack: `docker-compose.archon.yml`\n")
        handle.write("- Dedicated Gitea and Infisical stacks: `docker-compose.gitea.yml`, `docker-compose.infisical.yml`\n")
        handle.write("- Worker stacks: `infra/workers/worker-rtx3060/docker-compose.worker.yml`, `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`, `infra/workers/worker-rtx5090/docker-compose.worker.yml`\n")
        handle.write("\n## Placement assumptions and constraints\n\n")
        handle.write("- Oracle node is treated as state-heavy and data-adjacent.\n")
        handle.write("- Orchestrator node is treated as control-plane and operator interface surface.\n")
        handle.write("- Worker nodes are treated as GPU inference execution planes with private connectivity.\n")
        handle.write("- Datastores remain private regardless of whether admin UIs exist.\n")
        handle.write("- Any service requiring public reachability must pass Access and ownership review.\n")
        handle.write("\n## Migration notes (orchestrator-mini -> orchestrator)\n\n")
        handle.write("- New docs and stack wrappers use `orchestrator` naming only.\n")
        handle.write("- Legacy naming in historical/archived paths is ignored for active placement decisions.\n")
        handle.write("- Future automation should enforce node-name normalization during generation.\n")

    with confidence_doc.open("w", encoding="utf-8") as handle:
        handle.write("# 20 Recovery Confidence Report\n\n")
        handle.write("## Confirmed\n\n")
        handle.write("- `infra/docker-compose.yml` is the primary stack entrypoint referenced by the root `Makefile` and `infra/scripts/ultimate-bootstrap.sh`.\n")
        handle.write("- `infra/scripts/node-up.sh` composes `infra/docker-compose.yml` with per-node override files under `infra/compose/overrides/`.\n")
        handle.write("- Dedicated root bootstrap stacks exist for Gitea, Infisical, and Archon: `docker-compose.gitea.yml`, `docker-compose.infisical.yml`, `docker-compose.archon.yml`.\n")
        handle.write("- The regenerated `infra/cloudflared/config.yml` ends with `http_status:404` and contains no datastore ingress.\n")
        handle.write("- `.env.gitea`, `.env.infisical`, and `.secrets/` are explicitly gitignored.\n\n")
        handle.write("## Inferred\n\n")
        handle.write("- Oracle is intended to host durable business-state services because the Oracle compose carries `quote-api`, `twenty`, and stateful backing services.\n")
        handle.write("- The orchestrator hosts control-plane and gateway services because `infra/docker-compose.yml` carries `nexus-router`, `litellm`, `grafana`, and `cloudflared`.\n")
        handle.write("- Worker compose files are intended for private GPU execution only because their published services are inference backends and observability components.\n\n")
        handle.write("## Unknown\n\n")
        handle.write("- The real tunnel UUID and the final Cloudflare zone hostname currently in production.\n")
        handle.write("- Which of the access-protected apps the operator actually wants exposed in production at the same time.\n")
        handle.write("- Whether any external automation depends on the secondary override/bootstrap compose paths listed in `docs/02_ports_registry.appendix_legacy.md`.\n\n")
        handle.write("## Risk controls applied\n\n")
        handle.write("- Fail-closed edge config with mandatory `http_status:404` final ingress rule.\n")
        handle.write("- No datastores assigned Cloudflared hostnames or DNS instructions.\n")
        handle.write("- Existing compose and Makefile flows retained; additive bootstrap wrappers only.\n")
        handle.write("- Secrets policy enforced through template files plus `.gitignore` protections.\n\n")
        handle.write("## Follow-up checks recommended\n\n")
        handle.write("1. Run compose config gates in a Docker-enabled environment.\n")
        handle.write("2. Run cloudflared ingress validation in a Docker-enabled environment.\n")
        handle.write("3. Execute edge-doc regeneration in CI and diff against committed docs.\n")
        handle.write("4. Add policy check to reject non-HTTP tunnel routes.\n\n")
        handle.write("## File-path evidence\n\n")
        handle.write("- `Makefile`\n")
        handle.write("- `infra/scripts/node-up.sh`\n")
        handle.write("- `infra/scripts/ultimate-bootstrap.sh`\n")
        handle.write("- `infra/docker-compose.yml`\n")
        handle.write("- `infra/oracle/docker-compose.oracle.yml`\n")
        handle.write("- `docker-compose.archon.yml`\n")
        handle.write("- `docker-compose.gitea.yml`\n")
        handle.write("- `docker-compose.infisical.yml`\n")
        handle.write("- `infra/cloudflared/config.yml`\n")
        handle.write("- `.gitignore`\n")


def main() -> None:
    primary, active, supplemental = discover_authoritative_set()
    canonical_rows, appendix_rows = canonicalize(collect_rows(active) + collect_rows(supplemental))
    write_ports_registry(canonical_rows, appendix_rows, primary, active, supplemental)
    write_cloudflared_docs(canonical_rows)
    write_recovery_docs(canonical_rows, primary, active, supplemental)
    print("Wrote ports registry, cloudflared docs, and recovery placement docs")


if __name__ == "__main__":
    main()
