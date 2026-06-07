#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH="${NYRA_HEALTH_CONFIG:-config/health-check/health-check-config.json}"
JSON_OUT=""
ALLOW_DOWN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config)
      CONFIG_PATH="${2:?missing value for --config}"
      shift 2
      ;;
    --json-out)
      JSON_OUT="${2:?missing value for --json-out}"
      shift 2
      ;;
    --allow-down)
      ALLOW_DOWN=1
      shift
      ;;
    -h|--help)
      cat <<'USAGE'
Usage: scripts/deployment/health-check.sh [options]

Options:
  --config PATH    Health inventory JSON. Defaults to config/health-check/health-check-config.json.
  --json-out PATH  Write the machine-readable report to PATH.
  --allow-down     Return exit code 0 even when checks fail.
  -h, --help       Show this help.
USAGE
      exit 0
      ;;
    *)
      echo "ERROR: Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "ERROR: Health-check config not found at $CONFIG_PATH" >&2
  exit 1
fi

NYRA_HEALTH_CONFIG="$CONFIG_PATH" \
NYRA_HEALTH_JSON_OUT="$JSON_OUT" \
NYRA_HEALTH_ALLOW_DOWN="$ALLOW_DOWN" \
python3 <<'PY'
import json
import os
import pathlib
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request


config_path = pathlib.Path(os.environ["NYRA_HEALTH_CONFIG"])
with config_path.open() as fp:
    config = json.load(fp)

nodes = config.get("nodes", [])
services = config.get("services", [])
pending = config.get("pending_services", [])
external_commands = config.get(
    "external_commands",
    {"tailscale_status": True, "cloudflared_tunnels": True},
)

reports = []
failure_count = 0


def record(service_name, endpoint, success, latency_ms, details, host=None, check_type=None):
    global failure_count
    status = "up" if success else "down"
    entry = {
        "service_name": service_name,
        "endpoint": endpoint,
        "status": status,
        "latency_ms": round(latency_ms, 2) if latency_ms is not None else None,
        "details": details,
    }
    if host:
        entry["host"] = host
    if check_type:
        entry["type"] = check_type
    reports.append(entry)
    if not success:
        failure_count += 1
    prefix = "[UP]   " if success else "[DOWN] "
    print(f"{prefix}{service_name:34} -> {endpoint} ({details})")


def run_command(cmd, timeout=10):
    start = time.monotonic()
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, check=True)
        latency = (time.monotonic() - start) * 1000
        output = (result.stdout or result.stderr).strip()
        return True, latency, first_line(output) or "Command succeeded"
    except FileNotFoundError:
        return False, None, f"Command not found: {cmd[0]}"
    except subprocess.TimeoutExpired:
        latency = (time.monotonic() - start) * 1000
        return False, latency, f"Timeout ({timeout}s)"
    except subprocess.CalledProcessError as exc:
        latency = (time.monotonic() - start) * 1000
        details = exc.stderr or exc.stdout or str(exc)
        return False, latency, first_line(details.strip())


def first_line(value):
    return (value or "").splitlines()[0][:240]


def check_http(url, timeout=5, expected_status=None):
    start = time.monotonic()
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            latency = (time.monotonic() - start) * 1000
            allowed = expected_status or [200, 204, 301, 302]
            return resp.status in allowed, latency, f"HTTP {resp.status}"
    except urllib.error.HTTPError as exc:
        latency = (time.monotonic() - start) * 1000
        allowed = expected_status or [200, 204, 301, 302]
        return exc.code in allowed, latency, f"HTTP {exc.code}"
    except Exception as exc:
        latency = (time.monotonic() - start) * 1000
        return False, latency, repr(exc)


def check_tcp(host, port, timeout=5):
    start = time.monotonic()
    try:
        with socket.create_connection((host, int(port)), timeout):
            latency = (time.monotonic() - start) * 1000
            return True, latency, "TCP connect"
    except Exception as exc:
        latency = (time.monotonic() - start) * 1000
        return False, latency, repr(exc)


def check_node(node):
    name = node.get("name", "Unknown node")
    role = node.get("role", name)
    host = node.get("host") or node.get("tailscale_host") or node.get("tailscale_ip")

    if host:
        if node.get("ping", True):
            success, latency, details = run_command(["ping", "-c", "2", "-W", "2", host], timeout=8)
            record(f"Tailscale ({role})", host, success, latency, details, host=name, check_type="node")

    docker_host = node.get("docker_host")
    if docker_host:
        success, latency, details = run_command(["docker", "-H", docker_host, "info"], timeout=15)
        record(f"Docker ({role})", docker_host, success, latency, details, host=name, check_type="node")

    if node.get("gpu"):
        ssh_target = node.get("ssh", "localhost")
        nvidia_cmd = node.get("gpu_command") or [
            "nvidia-smi",
            "--query-gpu=name,memory.total",
            "--format=csv,noheader,nounits",
        ]
        if isinstance(nvidia_cmd, str):
            nvidia_cmd = nvidia_cmd.split()
        cmd = nvidia_cmd if ssh_target in ("localhost", "127.0.0.1") else ["ssh", ssh_target] + nvidia_cmd
        success, latency, details = run_command(cmd, timeout=20)
        record(f"GPU VRAM ({role})", f"ssh://{ssh_target}", success, latency, details, host=name, check_type="node")


def check_service(entry):
    name = entry.get("name", "Unnamed service")
    entry_type = entry.get("type", "http")
    host = entry.get("host_name")
    timeout = entry.get("timeout", 10)

    if entry_type == "http":
        url = entry.get("endpoint") or entry.get("url")
        if not url:
            raise SystemExit(f"Missing HTTP endpoint for {name}")
        success, latency, details = check_http(url, timeout=timeout, expected_status=entry.get("expected_status"))
        record(name, url, success, latency, details, host=host, check_type="http")
    elif entry_type == "tcp":
        target_host = entry.get("host")
        port = entry.get("port")
        if not target_host or not port:
            raise SystemExit(f"Missing host/port for TCP service {name}")
        success, latency, details = check_tcp(target_host, port, timeout=timeout)
        record(name, f"{target_host}:{port}", success, latency, details, host=host, check_type="tcp")
    elif entry_type == "command":
        cmd = entry.get("command")
        if not cmd:
            raise SystemExit(f"Missing command for service {name}")
        if isinstance(cmd, str):
            cmd = cmd.split()
        success, latency, details = run_command(cmd, timeout=timeout)
        record(name, " ".join(cmd), success, latency, details, host=host, check_type="command")
    else:
        record(name, "-", False, None, f"Unknown check type: {entry_type}", host=host, check_type=entry_type)


def main():
    print("\nProject Nyra Infrastructure Health Check\n")
    print(f"Config: {config_path}\n")

    for node in nodes:
        check_node(node)

    for service in services:
        check_service(service)

    if external_commands.get("tailscale_status", True):
        success, latency, details = run_command(["tailscale", "status", "--json"], timeout=10)
        record("Tailscale status", "tailscale status --json", success, latency, details, check_type="command")

    if external_commands.get("cloudflared_tunnels", True):
        success, latency, details = run_command(["cloudflared", "tunnel", "list", "--json"], timeout=10)
        record("Cloudflare tunnels", "cloudflared tunnel list --json", success, latency, details, check_type="command")

    print("\nPending services (per config):")
    if pending:
        for pending_service in pending:
            print(f" - {pending_service.get('name')} ({pending_service.get('reason', 'deferred')})")
    else:
        print(" - none")

    summary = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "config": str(config_path),
        "reports": reports,
        "pending_services": pending,
        "failures": failure_count,
    }

    json_out = os.environ.get("NYRA_HEALTH_JSON_OUT", "")
    if json_out:
        output_path = pathlib.Path(json_out)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(summary, indent=2) + "\n")
        print(f"\nJSON report written to {output_path}")
    else:
        print("\nJSON Report:")
        print(json.dumps(summary, indent=2))

    allow_down = os.environ.get("NYRA_HEALTH_ALLOW_DOWN") == "1"
    if failure_count and not allow_down:
        sys.exit(1)


if __name__ == "__main__":
    main()
PY
