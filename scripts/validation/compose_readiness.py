#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path

STACKS = {
    "archon": {
        "compose": Path("docker-compose.archon.yml"),
        "required_services": {
            "postgres",
            "redis",
            "litellm",
            "nexus-router",
            "archon-os",
            "archon-server",
            "archon-mcp",
            "archon-agents",
            "archon-agent-work-orders",
            "archon-ui",
        },
        "required_env": {
            "POSTGRES_PASSWORD",
            "REDIS_PASSWORD",
            "LITELLM_MASTER_KEY",
            "INFISICAL_PROJECT_ID",
            "INFISICAL_TOKEN",
            "INFISICAL_CLIENT_ID",
            "INFISICAL_CLIENT_SECRET",
        },
        "min_services": 5,
    },
    "gitea": {
        "compose": Path("docker-compose.gitea.yml"),
        "required_services": {
            "nyra-secrets-init",
            "gitea-db",
            "gitea",
            "gitea-act-runner",
            "gitea-ai-reviewer",
            "infisical-agent-gitea",
        },
        "required_env": {
            "INFISICAL_PROJECT_ID",
            "GITEA_ROOT_URL",
            "GITEA_SSH_DOMAIN",
        },
        "min_services": 5,
    },
}

SERVICE_PATTERN = re.compile(r"^  ([a-zA-Z0-9_-]+):\s*$")
ENV_PATTERN = re.compile(r"^([A-Z][A-Z0-9_]*)=(.*)$")


def parse_services(compose_text: str) -> set[str]:
    in_services = False
    services: set[str] = set()
    for line in compose_text.splitlines():
        if line.strip() == "services:":
            in_services = True
            continue
        if in_services and line and not line.startswith(" "):
            break
        if in_services:
            m = SERVICE_PATTERN.match(line)
            if m:
                services.add(m.group(1))
    return services


def parse_env(env_path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not env_path.exists():
        return env
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = ENV_PATTERN.match(line)
        if m:
            env[m.group(1)] = m.group(2)
    return env


def bad_value(v: str) -> bool:
    return v.strip() == "" or v.startswith("REPLACE_ME_")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate compose stack readiness")
    parser.add_argument("--stack", choices=STACKS.keys(), required=True)
    parser.add_argument("--env-file", required=True)
    args = parser.parse_args()

    cfg = STACKS[args.stack]
    compose_path: Path = cfg["compose"]
    compose_text = compose_path.read_text()
    services = parse_services(compose_text)
    env = parse_env(Path(args.env_file))

    missing_services = sorted(cfg["required_services"] - services)
    missing_env = sorted(k for k in cfg["required_env"] if k not in env or bad_value(env[k]))

    print(f"stack={args.stack}")
    print(f"compose_file={compose_path}")
    print(f"env_file={args.env_file}")
    print(f"detected_services={len(services)}")

    if len(services) < cfg["min_services"]:
        print(f"ERROR: expected at least {cfg['min_services']} services, found {len(services)}")
        return 1
    if missing_services:
        print("ERROR: missing required services: " + ", ".join(missing_services))
        return 1
    if missing_env:
        print("ERROR: missing/placeholder env vars: " + ", ".join(missing_env))
        return 1

    print("READY: service topology + required env vars validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
