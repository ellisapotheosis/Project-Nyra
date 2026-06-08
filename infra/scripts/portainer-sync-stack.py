#!/usr/bin/env python3
"""Render a Docker Compose bundle and sync it into a Portainer stack."""

from __future__ import annotations

import argparse
import json
import os
import ssl
import subprocess
import sys
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class Endpoint:
    id: int
    name: str


class PortainerClient:
    def __init__(self, base_url: str, api_key: str, insecure_tls: bool) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.context = (
            ssl._create_unverified_context() if insecure_tls else ssl.create_default_context()
        )

    def request_json(self, method: str, path: str, body: dict[str, Any] | None = None) -> Any:
        data = None
        headers = {"Accept": "application/json", "X-API-Key": self.api_key}
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"

        request = Request(
            f"{self.base_url}{path}",
            data=data,
            headers=headers,
            method=method,
        )

        try:
            with urlopen(request, context=self.context, timeout=45) as response:
                response_body = response.read()
        except HTTPError as error:
            detail = error.read().decode("utf-8", "replace").strip()
            message = f"Portainer API {method} {path} failed with HTTP {error.code}"
            raise SystemExit(f"{message}: {detail or error.reason}") from error
        except URLError as error:
            raise SystemExit(f"Portainer API {method} {path} failed: {error.reason}") from error

        if not response_body:
            return None
        return json.loads(response_body.decode("utf-8"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Render compose files with docker compose config and sync the "
            "result to Portainer."
        ),
    )
    parser.add_argument("--url", required=True, help="Portainer base URL")
    parser.add_argument("--api-key", required=True, help="Portainer API key")
    parser.add_argument("--stack-name", required=True, help="Portainer stack name")
    parser.add_argument("--endpoint-name", required=True, help="Portainer endpoint name")
    parser.add_argument(
        "--compose-file",
        action="append",
        required=True,
        dest="compose_files",
        help="Compose file to include; may be passed more than once",
    )
    parser.add_argument(
        "--profile",
        action="append",
        default=[],
        help="Compose profile to enable while rendering; may be passed more than once",
    )
    parser.add_argument(
        "--insecure-tls",
        action="store_true",
        help="Skip TLS certificate verification for private Portainer endpoints",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Render the compose bundle and print a summary without calling Portainer",
    )
    return parser.parse_args()


def render_compose(compose_files: list[str], profiles: list[str]) -> str:
    command = ["docker", "compose"]
    for compose_file in compose_files:
        command.extend(["-f", compose_file])
    command.append("config")

    env = os.environ.copy()
    if profiles:
        existing_profiles = [
            profile for profile in env.get("COMPOSE_PROFILES", "").split(",") if profile
        ]
        merged_profiles = list(dict.fromkeys([*existing_profiles, *profiles]))
        env["COMPOSE_PROFILES"] = ",".join(merged_profiles)

    result = subprocess.run(
        command,
        capture_output=True,
        env=env,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        stderr = result.stderr.strip()
        raise SystemExit(f"docker compose config failed: {stderr or 'no error output'}")

    return result.stdout


def find_endpoint(client: PortainerClient, endpoint_name: str) -> Endpoint:
    endpoints = client.request_json("GET", "/api/endpoints") or []
    for endpoint in endpoints:
        if endpoint.get("Name") == endpoint_name:
            return Endpoint(id=int(endpoint["Id"]), name=str(endpoint["Name"]))

    names = ", ".join(str(endpoint.get("Name")) for endpoint in endpoints if endpoint.get("Name"))
    suffix = f" Available endpoints: {names}" if names else ""
    raise SystemExit(f"No Portainer endpoint named {endpoint_name!r}.{suffix}")


def find_stack(client: PortainerClient, stack_name: str, endpoint_id: int) -> dict[str, Any] | None:
    stacks = client.request_json("GET", "/api/stacks") or []
    for stack in stacks:
        if stack.get("Name") != stack_name:
            continue
        stack_endpoint_id = stack.get("EndpointId")
        if stack_endpoint_id is None or int(stack_endpoint_id) == endpoint_id:
            return stack
    return None


def sync_stack(
    client: PortainerClient,
    endpoint: Endpoint,
    stack_name: str,
    compose_content: str,
) -> None:
    stack = find_stack(client, stack_name, endpoint.id)
    query = urlencode({"endpointId": endpoint.id})

    if stack:
        payload = {
            "Env": [],
            "Prune": True,
            "PullImage": True,
            "StackFileContent": compose_content,
        }
        client.request_json("PUT", f"/api/stacks/{int(stack['Id'])}?{query}", payload)
        print(f"Updated Portainer stack {stack_name!r} on endpoint {endpoint.name!r}.")
        return

    payload = {
        "Env": [],
        "FromAppTemplate": False,
        "Name": stack_name,
        "StackFileContent": compose_content,
    }
    client.request_json("POST", f"/api/stacks/create/standalone/string?{query}", payload)
    print(f"Created Portainer stack {stack_name!r} on endpoint {endpoint.name!r}.")


def main() -> int:
    args = parse_args()
    compose_content = render_compose(args.compose_files, args.profile)

    if args.dry_run:
        enabled_profiles = ",".join(args.profile) if args.profile else "(none)"
        print(
            f"Rendered {len(compose_content.encode('utf-8'))} bytes for "
            f"{args.stack_name!r} with profiles {enabled_profiles}."
        )
        return 0

    client = PortainerClient(args.url, args.api_key, args.insecure_tls)
    endpoint = find_endpoint(client, args.endpoint_name)
    sync_stack(client, endpoint, args.stack_name, compose_content)
    return 0


if __name__ == "__main__":
    sys.exit(main())
