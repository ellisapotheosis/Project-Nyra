#!/usr/bin/env python3
"""Detect host-port collisions per node stack without requiring Docker."""

from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml

BASE = Path("infra/docker-compose.yml")
STACKS = {
    "orchestrator": [Path("infra/compose/overrides/docker-compose.orchestrator.override.yml")],
    "worker-rtx3060": [Path("infra/compose/overrides/docker-compose.worker-rtx3060.override.yml")],
    "worker-rtx3090ti": [Path("infra/compose/overrides/docker-compose.worker-rtx3090ti.override.yml")],
    "worker-rtx5090": [Path("infra/compose/overrides/docker-compose.worker-rtx5090.override.yml")],
    "oracle": [Path("infra/compose/overrides/docker-compose.oracle.override.yml")],
    "dev-laptop": [Path("infra/compose/overrides/docker-compose.dev-laptop.override.yml")],
}


def load(path: Path) -> dict:
    if not path.exists():
        return {}
    return yaml.safe_load(path.read_text()) or {}


def merged_services(node_overrides: list[Path]) -> dict:
    base_services = (load(BASE).get("services") or {}).copy()
    for override in node_overrides:
        for name, override_service in (load(override).get("services") or {}).items():
            current = base_services.get(name, {})
            if not isinstance(current, dict):
                current = {}
            merged = current.copy()
            if isinstance(override_service, dict):
                merged.update(override_service)
            base_services[name] = merged
    return base_services


def host_port(port_expr: str) -> str | None:
    value = re.sub(r"\$\{[^:}]+:-([^}]+)\}", r"\1", str(port_expr))
    parts = value.split(":")
    if len(parts) == 2:
        return parts[0]
    if len(parts) == 3:
        return parts[1]
    return None


def collisions_for(services: dict) -> dict[str, list[str]]:
    port_to_services: dict[str, list[str]] = {}
    for service_name, cfg in services.items():
        for port in cfg.get("ports", []) or []:
            p = host_port(str(port))
            if not p:
                continue
            port_to_services.setdefault(p, []).append(service_name)
    return {p: names for p, names in port_to_services.items() if len(names) > 1}


def main() -> int:
    has_collision = False
    for node, overrides in STACKS.items():
        collisions = collisions_for(merged_services(overrides))
        if collisions:
            has_collision = True
            print(f"[{node}] collisions:")
            for port, names in sorted(collisions.items()):
                print(f"  {port}: {', '.join(sorted(names))}")

    if has_collision:
        return 1

    print("No host-port collisions detected across all node stacks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
