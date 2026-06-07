#!/usr/bin/env python3
"""Merge a Project Nyra Tailscale policy overlay into a current policy file."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


def strip_json_comments(text: str) -> str:
    result: list[str] = []
    in_string = False
    escape = False
    index = 0

    while index < len(text):
        char = text[index]
        next_char = text[index + 1] if index + 1 < len(text) else ""

        if in_string:
            result.append(char)
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            index += 1
            continue

        if char == '"':
            in_string = True
            result.append(char)
            index += 1
            continue

        if char == "/" and next_char == "/":
            index += 2
            while index < len(text) and text[index] not in "\r\n":
                index += 1
            continue

        if char == "/" and next_char == "*":
            index += 2
            while index + 1 < len(text) and not (text[index] == "*" and text[index + 1] == "/"):
                index += 1
            index += 2
            continue

        result.append(char)
        index += 1

    return "".join(result)


def parse_hujsonish(path: Path) -> dict[str, Any]:
    raw = path.read_text(encoding="utf-8")
    without_comments = strip_json_comments(raw)
    without_trailing_commas = re.sub(r",(\s*[}\]])", r"\1", without_comments)
    value = json.loads(without_trailing_commas)
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def stable_unique(values: list[Any]) -> list[Any]:
    seen = set()
    output = []
    for value in values:
        key = json.dumps(value, sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        output.append(value)
    return output


def merge_auto_approver_services(base: dict[str, Any], overlay: dict[str, Any]) -> int:
    overlay_services = overlay.get("autoApprovers", {}).get("services", {})
    if not overlay_services:
        return 0

    base_auto_approvers = base.setdefault("autoApprovers", {})
    if not isinstance(base_auto_approvers, dict):
        raise ValueError("base autoApprovers must be an object")

    base_services = base_auto_approvers.setdefault("services", {})
    if not isinstance(base_services, dict):
        raise ValueError("base autoApprovers.services must be an object")

    changed = 0
    for service_name, approvers in overlay_services.items():
        if not isinstance(approvers, list):
            raise ValueError(f"{service_name} approvers must be an array")
        existing = base_services.get(service_name, [])
        if not isinstance(existing, list):
            raise ValueError(f"{service_name} existing approvers must be an array")
        merged = stable_unique(existing + approvers)
        if merged != existing:
            changed += 1
        base_services[service_name] = merged
    return changed


def grant_key(grant: dict[str, Any]) -> tuple[str, str]:
    src = json.dumps(grant.get("src", []), sort_keys=True)
    ip = json.dumps(grant.get("ip", []), sort_keys=True)
    return src, ip


def merge_grants(base: dict[str, Any], overlay: dict[str, Any]) -> int:
    overlay_grants = overlay.get("grants", [])
    if not overlay_grants:
        return 0
    if not isinstance(overlay_grants, list):
        raise ValueError("overlay grants must be an array")

    base_grants = base.setdefault("grants", [])
    if not isinstance(base_grants, list):
        raise ValueError("base grants must be an array")

    existing_by_key = {
        grant_key(grant): grant
        for grant in base_grants
        if isinstance(grant, dict) and "src" in grant and "ip" in grant and "dst" in grant
    }

    changed = 0
    for overlay_grant in overlay_grants:
        if not isinstance(overlay_grant, dict):
            raise ValueError("each overlay grant must be an object")
        key = grant_key(overlay_grant)
        existing = existing_by_key.get(key)
        if existing is None:
            base_grants.append(overlay_grant)
            existing_by_key[key] = overlay_grant
            changed += 1
            continue

        existing_dst = existing.get("dst", [])
        overlay_dst = overlay_grant.get("dst", [])
        if not isinstance(existing_dst, list) or not isinstance(overlay_dst, list):
            raise ValueError("grant dst values must be arrays")
        merged_dst = stable_unique(existing_dst + overlay_dst)
        if merged_dst != existing_dst:
            existing["dst"] = merged_dst
            changed += 1

    return changed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True, type=Path, help="Current full tailnet policy file")
    parser.add_argument("--overlay", required=True, type=Path, help="Project Nyra policy overlay")
    parser.add_argument("--output", required=True, type=Path, help="Merged policy output path")
    args = parser.parse_args()

    base = parse_hujsonish(args.base)
    overlay = parse_hujsonish(args.overlay)

    service_changes = merge_auto_approver_services(base, overlay)
    grant_changes = merge_grants(base, overlay)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(base, indent=2, sort_keys=False) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "output": str(args.output),
                "services_merged": len(overlay.get("autoApprovers", {}).get("services", {})),
                "service_changes": service_changes,
                "grants_merged": len(overlay.get("grants", [])),
                "grant_changes": grant_changes,
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
