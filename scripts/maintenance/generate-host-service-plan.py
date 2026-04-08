#!/usr/bin/env python3
"""Generate host service inventory and placement plan for Project Nyra.

Outputs `infra/hosts/host-service-plan.yaml` from canonical host-layout definitions.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import sys
import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
HOST_LAYOUT = REPO_ROOT / "infra/hosts/host-layout.yaml"
OUTPUT_PLAN = REPO_ROOT / "infra/hosts/host-service-plan.yaml"


@dataclass
class HostCapacity:
    cpu: int
    ram_gb: int
    storage_gb: int
    notes: str


CAPACITY = {
    "orchestrator": HostCapacity(
        cpu=8,
        ram_gb=16,
        storage_gb=1000,
        notes="Low-latency LAN host. Keep interactive and latency-sensitive services here.",
    ),
    "oracle-vps": HostCapacity(
        cpu=4,
        ram_gb=24,
        storage_gb=200,
        notes="Cloud host for internet-facing and durable/stateful services.",
    ),
}


def load_yaml(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


def classify(service_name: str) -> str:
    name = service_name.lower()
    if "mcp" in name:
        return "mcp-server"
    if any(x in name for x in ["postgres", "redis", "db", "mongo", "vector", "qdrant", "mem0", "ruvector"]):
        return "data"
    if any(x in name for x in ["web", "ui", "landing", "admin", "dashboard", "crm", "twenty", "dify"]):
        return "app-ui"
    if any(x in name for x in ["gateway", "router", "proxy", "litellm", "orchestrator", "workflow", "n8n", "activepieces"]):
        return "platform"
    if any(x in name for x in ["prometheus", "grafana", "loki", "tempo", "otel", "monitor", "exporter"]):
        return "observability"
    return "service"


def recommend_host(service_name: str, source_host: str) -> str:
    name = service_name.lower()
    if source_host == "worker-hosts":
        return source_host
    if any(x in name for x in ["web", "ui", "landing", "dashboard", "archon", "openwebui", "openclaw", "gateway", "router"]):
        return "orchestrator"
    if any(x in name for x in ["postgres", "twenty", "crm", "backup", "storage", "minio"]):
        return "oracle-vps"
    if source_host in {"orchestrator", "oracle-vps"}:
        return source_host
    return "orchestrator"


def collect_services(compose_path: Path) -> dict[str, dict]:
    if not compose_path.exists():
        return {}
    data = load_yaml(compose_path)
    services = data.get("services", {})
    out: dict[str, dict] = {}
    for name, cfg in services.items():
        out[name] = {
            "profiles": cfg.get("profiles", []),
            "ports": cfg.get("ports", []),
            "category": classify(name),
        }
    return out


def build_plan() -> dict:
    layout = load_yaml(HOST_LAYOUT)
    hosts_cfg = layout.get("hosts", {})

    plan: dict = {
        "generated_from": str(HOST_LAYOUT.relative_to(REPO_ROOT)),
        "hosts": {},
        "capacity": {
            name: {
                "cpu": cap.cpu,
                "ram_gb": cap.ram_gb,
                "storage_gb": cap.storage_gb,
                "notes": cap.notes,
            }
            for name, cap in CAPACITY.items()
        },
    }

    for host_name, host_cfg in hosts_cfg.items():
        if host_name == "worker-hosts":
            nodes = host_cfg.get("nodes", {})
            node_out = {}
            for node_name, node_cfg in nodes.items():
                services = {}
                for compose in node_cfg.get("compose_files", []):
                    services.update(collect_services(REPO_ROOT / compose))
                node_out[node_name] = {
                    "compose_files": node_cfg.get("compose_files", []),
                    "env_files": node_cfg.get("env_files", []),
                    "services": services,
                }
            plan["hosts"][host_name] = {"nodes": node_out}
            continue

        services = {}
        for compose in host_cfg.get("compose_files", []):
            services.update(collect_services(REPO_ROOT / compose))

        plan["hosts"][host_name] = {
            "compose_files": host_cfg.get("compose_files", []),
            "env_files": host_cfg.get("env_files", []),
            "services": services,
        }

    recommendations = {"orchestrator": [], "oracle-vps": [], "worker-hosts": []}

    for host_name, host_data in plan["hosts"].items():
        if host_name == "worker-hosts":
            for node_name, node_data in host_data["nodes"].items():
                for service_name in sorted(node_data["services"].keys()):
                    recommendations["worker-hosts"].append(
                        {
                            "service": service_name,
                            "node": node_name,
                            "reason": "GPU-bound inference workload",
                        }
                    )
            continue

        for service_name in sorted(host_data.get("services", {}).keys()):
            target = recommend_host(service_name, host_name)
            rec = {
                "service": service_name,
                "recommended_host": target,
                "category": host_data["services"][service_name]["category"],
            }
            if target == "orchestrator":
                recommendations["orchestrator"].append(rec)
            elif target == "oracle-vps":
                recommendations["oracle-vps"].append(rec)
            else:
                recommendations["orchestrator"].append(rec)

    plan["recommended_placement"] = recommendations
    return plan


def main() -> int:
    if not HOST_LAYOUT.exists():
        print(f"Missing host layout: {HOST_LAYOUT}", file=sys.stderr)
        return 1

    plan = build_plan()
    OUTPUT_PLAN.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PLAN.open("w", encoding="utf-8") as fh:
        yaml.safe_dump(plan, fh, sort_keys=False, default_flow_style=False)

    print(f"Wrote {OUTPUT_PLAN.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
