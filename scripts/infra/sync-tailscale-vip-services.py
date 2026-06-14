#!/usr/bin/env python3
"""Create or update Project Nyra Tailscale VIP service definitions."""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen


TAILSCALE_API_BASE = "https://api.tailscale.com/api/v2"


@dataclass(frozen=True)
class VipService:
    name: str
    ports: tuple[str, ...]
    comment: str = "Project Nyra Oracle VPS service"


WEB_SERVICE_NAMES = (
    "infisical",
    "projectnyra",
    "webapp",
    "nexus",
    "nexus-ui",
    "litellm",
    "openwebui",
    "openlit",
    "letta",
    "mem0",
    "memos",
    "openmemory-mcp",
    "n8n",
    "activepieces",
    "activepieces-mcp",
    "agent-vault",
    "browserless",
    "portainer",
    "portainer-secure",
    "prometheus-oracle",
    "grafana-oracle",
    "grafbase",
    "ha-mcp",
    "loki-oracle",
    "cadvisor",
    "gitea",
    "twenty-crm",
    "quote-api",
    "quote-engine",
    "crm-api",
    "campaign-engine",
    "supabase-kong",
    "superset",
    "clawteam",
    "gastown",
    "gitea-mcp",
    "letta-mcp",
    "memos-mcp",
    "twenty-mcp",
    "infisical-mcp",
    "magicui-mcp",
    "shadcn-mcp",
    "sequential-thinking-mcp",
    "playwright-mcp",
    "firecrawl-mcp",
    "git-mcp",
    "next-devtools-mcp",
    "tavily-mcp",
    "wcgw-mcp",
    "gitingest-mcp",
    "codebase-index-mcp",
    "tailscale-mcp",
    "mem0-rest",
    "portainer-tunnel",
    "openlit-clickhouse-http",
    "paperclip",
    "paperclip-mcp",
    "searxng",
    "uptime-kuma",
    "llxprt-bridge",
    "qdrant",
    "litellm-3060",
    "litellm-3090ti",
    "litellm-5090",
    "openclaw-gateway",
    "picoclaw",
    "vllm-3090ti",
    "vllm-5090",
    "ollama-3060",
    "nerve-3060",
    "nerve-3090ti",
    "nerve-5090",
    "wol-manager",
)

TCP_SERVICES = (
    VipService("svc:gitea-ssh", ("tcp:22",)),
    VipService("svc:openlit-otlp-grpc", ("tcp:4317",)),
    VipService("svc:openlit-otlp-http", ("tcp:4318",)),
    VipService("svc:infisical-postgres", ("tcp:5432",)),
    VipService("svc:infisical-redis", ("tcp:6379",)),
    VipService("svc:falkordb", ("tcp:6379",)),
    VipService("svc:openlit-clickhouse-native", ("tcp:9000",)),
    VipService("svc:supabase-db", ("tcp:5432",)),
)

VIP_SERVICES = tuple(VipService(f"svc:{name}", ("tcp:443",)) for name in WEB_SERVICE_NAMES) + TCP_SERVICES


def api_request(
    method: str,
    tailnet: str,
    api_key: str | None,
    bearer_token: str | None,
    path: str,
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if bearer_token:
        headers["Authorization"] = f"Bearer {bearer_token}"
    elif api_key:
        encoded_auth = base64.b64encode(f"{api_key}:".encode("utf-8")).decode("ascii")
        headers["Authorization"] = f"Basic {encoded_auth}"
    else:
        raise RuntimeError("Tailscale API credentials are required")

    data = json.dumps(body).encode("utf-8") if body is not None else None
    request = Request(
        f"{TAILSCALE_API_BASE}/tailnet/{quote(tailnet, safe='')}{path}",
        data=data,
        method=method,
        headers=headers,
    )
    try:
        with urlopen(request, timeout=30) as response:
            payload = response.read().decode("utf-8")
    except HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Tailscale API {method} {path} failed: {error.code} {details}") from error
    if not payload:
        return {}
    value = json.loads(payload)
    if not isinstance(value, dict):
        raise RuntimeError(f"Tailscale API {method} {path} returned non-object JSON")
    return value


def existing_services(tailnet: str, api_key: str | None, bearer_token: str | None) -> dict[str, dict[str, Any]]:
    response = api_request("GET", tailnet, api_key, bearer_token, "/vip-services")
    services = response.get("vipServices", [])
    if not isinstance(services, list):
        raise RuntimeError("Tailscale API returned invalid vipServices payload")
    return {service["name"]: service for service in services if isinstance(service, dict) and "name" in service}


def desired_body(service: VipService, existing: dict[str, Any] | None) -> dict[str, Any]:
    body: dict[str, Any] = {
        "name": service.name,
        "ports": list(service.ports),
        "comment": service.comment,
        "annotations": {
            "managed-by": "project-nyra",
            "host": "oracle-vps",
            "source": "scripts/infra/sync-tailscale-vip-services.py",
        },
    }
    if existing and existing.get("addrs"):
        body["addrs"] = existing["addrs"]
    if existing and existing.get("tags"):
        body["tags"] = existing["tags"]
    return body


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tailnet", default=os.environ.get("TS_TAILNET") or os.environ.get("TAILSCALE_TAILNET") or "trex-fiordland.ts.net")
    parser.add_argument("--api-key", default=os.environ.get("TS_API_KEY") or os.environ.get("TAILSCALE_API_KEY"))
    parser.add_argument("--bearer-token", default=os.environ.get("TS_BEARER_TOKEN") or os.environ.get("TAILSCALE_BEARER_TOKEN"))
    parser.add_argument("--apply", action="store_true", help="Write service definitions to Tailscale")
    parser.add_argument("--json", action="store_true", help="Print machine-readable summary")
    args = parser.parse_args()

    if not args.api_key and not args.bearer_token:
        print("TAILSCALE_API_KEY/TS_API_KEY or TAILSCALE_BEARER_TOKEN/TS_BEARER_TOKEN is required", file=sys.stderr)
        return 2

    existing = existing_services(args.tailnet, args.api_key, args.bearer_token)
    created = []
    updated = []
    unchanged = []

    for service in VIP_SERVICES:
        current = existing.get(service.name)
        body = desired_body(service, current)
        comparable_current = current or {}
        current_ports = tuple(comparable_current.get("ports", []))
        needs_update = current is None or current_ports != service.ports

        if args.apply:
            api_request(
                "PUT",
                args.tailnet,
                args.api_key,
                args.bearer_token,
                f"/vip-services/{quote(service.name, safe='')}",
                body,
            )

        if current is None:
            created.append(service.name)
        elif needs_update:
            updated.append(service.name)
        else:
            unchanged.append(service.name)

    summary = {
        "tailnet": args.tailnet,
        "apply": args.apply,
        "desired": len(VIP_SERVICES),
        "created": created,
        "updated": updated,
        "unchanged": unchanged,
    }
    if args.json:
        print(json.dumps(summary, indent=2, sort_keys=True))
    else:
        print(
            json.dumps(
                {
                    "apply": args.apply,
                    "desired": len(VIP_SERVICES),
                    "created": len(created),
                    "updated": len(updated),
                    "unchanged": len(unchanged),
                },
                sort_keys=True,
            )
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
