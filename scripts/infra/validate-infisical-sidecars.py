#!/usr/bin/env python3
"""Validate Project Nyra host compose files use the Infisical sidecar contract.

This is a static check. It does not contact Infisical and it never reads real
secret values. Runtime smoke still requires running the target compose stack on
the target host with INFISICAL_TOKEN exported in that shell.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

import yaml


REPO_ROOT = Path(__file__).resolve().parents[2]
HOSTS_ROOT = REPO_ROOT / "infra" / "hosts"
SECRETS_TARGET = "/run/nyra-secrets"
REQUIRED_INIT_ENV = {
    "INFISICAL_TOKEN",
    "INFISICAL_PROJECT_ID",
    "INFISICAL_ENV",
    "INFISICAL_PATH",
}
REQUIRED_AGENT_ENV = REQUIRED_INIT_ENV | {"INFISICAL_POLL_INTERVAL"}
PRIMARY_STACKS = {
    "oracle-vps": "docker-compose.yml",
    "orchestrator": "docker-compose.cloudflared.yml",
    "worker-rtx3060": "docker-compose.worker-3060.yml",
    "worker-rtx3090ti": "docker-compose.worker-3090.yml",
    "worker-rtx5090": "docker-compose.worker-5090.yml",
}


def load_compose(path: Path) -> dict[str, Any] | None:
    try:
        with path.open("r", encoding="utf-8") as handle:
            loaded = yaml.safe_load(handle)
    except yaml.YAMLError as exc:
        raise ValueError(f"{path}: invalid YAML: {exc}") from exc

    if not isinstance(loaded, dict):
        return None
    return loaded


def as_mapping(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def env_keys(service: dict[str, Any]) -> set[str]:
    environment = service.get("environment")
    if isinstance(environment, dict):
        return set(environment)
    if isinstance(environment, list):
        return {str(item).split("=", 1)[0] for item in environment}
    return set()


def volume_source(volume: Any) -> str | None:
    if isinstance(volume, str):
        return volume.split(":", 1)[0]
    if isinstance(volume, dict):
        source = volume.get("source")
        return str(source) if source else None
    return None


def volume_target(volume: Any) -> str | None:
    if isinstance(volume, str):
        parts = volume.split(":")
        return parts[1] if len(parts) > 1 else None
    if isinstance(volume, dict):
        target = volume.get("target")
        return str(target) if target else None
    return None


def uses_secrets_mount(service: dict[str, Any]) -> bool:
    return any(
        volume_target(volume) == SECRETS_TARGET
        for volume in as_list(service.get("volumes"))
    )


def secret_volume_names(compose: dict[str, Any]) -> set[str]:
    names: set[str] = set()
    for service in as_mapping(compose.get("services")).values():
        if not isinstance(service, dict):
            continue
        for volume in as_list(service.get("volumes")):
            if volume_target(volume) == SECRETS_TARGET:
                source = volume_source(volume)
                if source:
                    names.add(source)
    return names


def depends_on_secrets_init(service: dict[str, Any]) -> bool:
    depends_on = service.get("depends_on")
    if isinstance(depends_on, dict):
        return "secrets-init" in depends_on
    if isinstance(depends_on, list):
        return "secrets-init" in depends_on
    return False


def validate_sidecar_stack(path: Path, compose: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    services = as_mapping(compose.get("services"))
    volumes = as_mapping(compose.get("volumes"))

    secrets_init = as_mapping(services.get("secrets-init"))
    agent = as_mapping(services.get("infisical-agent"))
    if not secrets_init:
        errors.append(f"{path}: missing services.secrets-init")
    if not agent:
        errors.append(f"{path}: missing services.infisical-agent")

    if secrets_init:
        missing = REQUIRED_INIT_ENV - env_keys(secrets_init)
        if missing:
            errors.append(
                f"{path}: secrets-init missing env keys {sorted(missing)}"
            )
        if not uses_secrets_mount(secrets_init):
            errors.append(f"{path}: secrets-init does not mount {SECRETS_TARGET}")

    if agent:
        missing = REQUIRED_AGENT_ENV - env_keys(agent)
        if missing:
            errors.append(
                f"{path}: infisical-agent missing env keys {sorted(missing)}"
            )
        if not uses_secrets_mount(agent):
            errors.append(f"{path}: infisical-agent does not mount {SECRETS_TARGET}")
        if not depends_on_secrets_init(agent):
            errors.append(f"{path}: infisical-agent must depend_on secrets-init")

    for volume_name in secret_volume_names(compose):
        if volume_name not in volumes:
            errors.append(f"{path}: secret volume {volume_name!r} is not declared")

    return errors


def validate_secret_consumers(path: Path, compose: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    services = as_mapping(compose.get("services"))
    sidecar_present = "secrets-init" in services

    for service_name, service in services.items():
        if not isinstance(service, dict) or service_name in {
            "secrets-init",
            "infisical-agent",
        }:
            continue
        if uses_secrets_mount(service) and sidecar_present:
            if not depends_on_secrets_init(service):
                errors.append(
                    f"{path}: service {service_name!r} mounts {SECRETS_TARGET} "
                    "but does not depend_on secrets-init"
                )

    return errors


def compose_files() -> list[Path]:
    return sorted(
        path
        for path in HOSTS_ROOT.glob("**/docker-compose*.yml")
        if "_templates" not in path.parts and "portainer-mesh" not in path.parts
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    errors: list[str] = []
    checked_primary = 0
    checked_consumers = 0

    for host, compose_name in PRIMARY_STACKS.items():
        path = HOSTS_ROOT / host / compose_name
        if not path.exists():
            errors.append(f"{path}: primary Infisical stack is missing")
            continue
        compose = load_compose(path)
        if compose is None:
            errors.append(f"{path}: empty compose file")
            continue
        checked_primary += 1
        errors.extend(validate_sidecar_stack(path, compose))
        errors.extend(validate_secret_consumers(path, compose))
        if args.verbose:
            print(f"checked primary sidecar stack: {path.relative_to(REPO_ROOT)}")

    for path in compose_files():
        compose = load_compose(path)
        if compose is None:
            continue
        if secret_volume_names(compose):
            checked_consumers += 1
            errors.extend(validate_secret_consumers(path, compose))
            for volume_name in secret_volume_names(compose):
                if volume_name not in as_mapping(compose.get("volumes")):
                    errors.append(
                        f"{path}: secret volume {volume_name!r} is not declared"
                    )
            if args.verbose:
                print(f"checked secret consumer stack: {path.relative_to(REPO_ROOT)}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(
        "Infisical sidecar contract OK: "
        f"{checked_primary} primary stacks, {checked_consumers} secret-consuming stacks"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
