#!/usr/bin/env python3
from pathlib import Path
import sys

import yaml


ROOT = Path(__file__).resolve().parents[2]
LAYOUT_PATH = ROOT / "infra/hosts/host-layout.yaml"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


if not LAYOUT_PATH.is_file():
    fail(f"Missing {LAYOUT_PATH.relative_to(ROOT)}")

layout = yaml.safe_load(LAYOUT_PATH.read_text()) or {}
hosts = layout.get("hosts", {})

for host_name, host_config in hosts.items():
    if host_name == "worker-hosts":
        base_dir = ROOT / "infra/hosts/worker-hosts"
        if not base_dir.is_dir():
            fail("Missing infra/hosts/worker-hosts")

        for node_name in (host_config.get("nodes") or {}):
            node_dir = base_dir / node_name
            if not node_dir.is_dir():
                fail(f"Missing {node_dir.relative_to(ROOT)}")
        continue

    if host_name == "homeassistant":
        ui_links_file = host_config.get("ui_links_file")
        if ui_links_file and not (ROOT / ui_links_file).is_file():
            fail(f"Missing {ui_links_file}")
        continue

    host_dir = ROOT / "infra/hosts" / host_name
    if not host_dir.is_dir():
        fail(f"Missing {host_dir.relative_to(ROOT)}")

print("infra host split looks good")
