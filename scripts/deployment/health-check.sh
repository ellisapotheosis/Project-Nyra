#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH="${NYRA_HEALTH_CONFIG:-config/health-check/health-check-config.json}"

if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "ERROR: Health-check config not found at $CONFIG_PATH"
  exit 1
fi

python3 <<'PY'
import json
import os
import pathlib
import socket
import subprocess
import sys
import time
import urllib.request

config_path = pathlib.Path(os.environ.get("NYRA_HEALTH_CONFIG", "config/health-check/health-check-config.json"))
with config_path.open() as fp:
    config = json.load(fp)

nodes = config.get("nodes", [])
services = config.get("services", [])
pending = config.get("pending_services", [])

reports = []
failure_count = 0


def record(service_name, endpoint, success, latency_ms, details):
    global failure_count
    status = "up" if success else "down"
    record = {
        "service_name": service_name,
        "endpoint": endpoint,
        "status": status,
        "latency_ms": round(latency_ms, 2) if latency_ms is not None else None,
        "details": details,
    }
    reports.append(record)
    if not success:
        failure_count += 1
    prefix = "[UP]   " if success else "[DOWN] "
    print(f"{prefix}{service_name:30} -> {endpoint} ({details})")


def run_command(cmd, timeout=10):
    start = time.monotonic()
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, check=True)
        latency = (time.monotonic() - start) * 1000
        output = (result.stdout or result.stderr).strip()
        return True, latency, output or "Command succeeded"
    except FileNotFoundError:
        return False, None, f"Command not found: {cmd[0]}"
    except subprocess.TimeoutExpired as exc:
        latency = (time.monotonic() - start) * 1000
        return False, latency, f"Timeout ({timeout}s)"
    except subprocess.CalledProcessError as exc:
        latency = (time.monotonic() - start) * 1000
        details = exc.stderr or exc.stdout or str(exc)
        return False, latency, details.strip()


def check_http(url, timeout=5):
    start = time.monotonic()
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            latency = (time.monotonic() - start) * 1000
            return True, latency, f"HTTP {resp.status}"
    except Exception as exc:
        latency = (time.monotonic() - start) * 1000
        return False, latency, repr(exc)


def check_tcp(host, port, timeout=5):
    start = time.monotonic()
    try:
        with socket.create_connection((host, port), timeout):
            latency = (time.monotonic() - start) * 1000
            return True, latency, "TCP connect"
    except Exception as exc:
        latency = (time.monotonic() - start) * 1000
        return False, latency, repr(exc)


def check_node(node):
    name = node.get("name", "Unknown node")
    role = node.get("role", name)
    tailscale_ip = node.get("tailscale_ip")
    if tailscale_ip:
        success, latency, details = run_command(["ping", "-c", "2", "-W", "2", tailscale_ip], timeout=8)
        record(f"Tailscale ({role})", tailscale_ip, success, latency, details)

    docker_host = node.get("docker_host")
    if docker_host:
        cmd = ["docker", "-H", docker_host, "info"]
        success, latency, details = run_command(cmd, timeout=15)
        record(f"Docker ({role})", docker_host, success, latency, details)

    if node.get("gpu"):
        ssh_target = node.get("ssh", "localhost")
        nvidia_cmd = ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader,nounits"]
        if ssh_target and ssh_target not in ("localhost", "127.0.0.1"):
            cmd = ["ssh", ssh_target] + nvidia_cmd
        else:
            cmd = nvidia_cmd
        success, latency, details = run_command(cmd, timeout=20)
        record(f"GPU VRAM ({role})", f"ssh://{ssh_target}", success, latency, details)


def check_service(entry):
    name = entry.get("name", "Unnamed service")
    entry_type = entry.get("type", "http")
    if entry_type == "http":
        url = entry.get("endpoint") or entry.get("url")
        if not url:
            raise SystemExit(f"Missing HTTP endpoint for {name}")
        success, latency, details = check_http(url, timeout=entry.get("timeout", 10))
        record(name, url, success, latency, details)
    elif entry_type == "tcp":
        host = entry.get("host")
        port = entry.get("port")
        if not host or not port:
            raise SystemExit(f"Missing host/port for TCP service {name}")
        success, latency, details = check_tcp(host, port, timeout=entry.get("timeout", 5))
        record(name, f"{host}:{port}", success, latency, details)
    elif entry_type == "command":
        cmd = entry.get("command")
        if not cmd:
            raise SystemExit(f"Missing command for service {name}")
        if isinstance(cmd, str):
            cmd = cmd.split()
        success, latency, details = run_command(cmd, timeout=entry.get("timeout", 15))
        record(name, " ".join(cmd), success, latency, details)
    else:
        record(name, "-", False, None, f"Unknown check type: {entry_type}")


def main():
    print("\nProject Nyra Infrastructure Health Check\n")
    for node in nodes:
        check_node(node)

    for service in services:
        check_service(service)

    # Tailscale CLI check
    if config.get("check_tailscale", True):
        success, latency, details = run_command(["tailscale", "status", "--json"], timeout=10)
        record("Tailscale status", "tailscale status --json", success, latency, details)

    # Cloudflare tunnel check
    success, latency, details = run_command(["cloudflared", "tunnel", "list", "--json"], timeout=10)
    record("Cloudflare tunnels", "cloudflared tunnel list", success, latency, details)

    print("\nPending services (per config):")
    for pending_service in pending:
        print(f" - {pending_service.get('name')} ({pending_service.get('reason', 'deferred')})")

    summary = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "reports": reports,
        "pending_services": pending,
        "failures": failure_count,
    }
    print("\nJSON Report:")
    print(json.dumps(summary, indent=2))
    if failure_count:
        sys.exit(1)


if __name__ == "__main__":
    main()
PY
