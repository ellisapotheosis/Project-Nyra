#!/usr/bin/env bash
set -euo pipefail

ROLE="${1:-worker}"
INV_ROOT="${2:-/srv/nyra/fleet/inventory}"

mkdir -p "${INV_ROOT}/machines"
HOST="$(hostname)"
USER_NAME="$(id -un)"
NOW="$(date -Iseconds)"

OS_PRETTY="$(. /etc/os-release && echo "${PRETTY_NAME:-unknown}")"
KERNEL="$(uname -r)"
UPTIME="$(uptime -p || true)"
CPU="$(lscpu 2>/dev/null | sed -n 's/^Model name:[[:space:]]*//p' | head -n1)"
CORES="$(nproc 2>/dev/null || echo "")"
MEM_MB="$(free -m 2>/dev/null | awk '/Mem:/ {print $2}')"

GPU_INFO=""
if command -v nvidia-smi >/dev/null 2>&1; then
  GPU_INFO="$(nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>/dev/null | tr '\n' '; ')"
fi

LAN_JSON="$(ip -j addr 2>/dev/null || echo "[]")"
ROUTE_JSON="$(ip -j route 2>/dev/null || echo "[]")"

PUB_IP=""
if command -v curl >/dev/null 2>&1; then
  PUB_IP="$(curl -fsS --max-time 6 https://api.ipify.org || true)"
fi

TS_IP=""
if command -v tailscale >/dev/null 2>&1; then
  TS_IP="$(tailscale ip -4 2>/dev/null | head -n1 || true)"
fi

CF_VER=""
if command -v cloudflared >/dev/null 2>&1; then
  CF_VER="$(cloudflared version 2>/dev/null | head -n1 || true)"
fi

DISKS_JSON="$(lsblk -J -o NAME,SIZE,TYPE,MOUNTPOINT,MODEL,SERIAL 2>/dev/null || echo "{}")"

OUT="${INV_ROOT}/machines/${HOST}.json"
cat > "${OUT}" <<EOF
{
  "collected_at": "${NOW}",
  "role": "${ROLE}",
  "host": {
    "hostname": "${HOST}",
    "username": "${USER_NAME}"
  },
  "os": {
    "pretty": "${OS_PRETTY}",
    "kernel": "${KERNEL}",
    "uptime": "${UPTIME}"
  },
  "hardware": {
    "cpu_model": "${CPU}",
    "cpu_cores": "${CORES}",
    "memory_mb": "${MEM_MB}",
    "gpu": "${GPU_INFO}"
  },
  "network": {
    "ip_addr": ${LAN_JSON},
    "routes": ${ROUTE_JSON},
    "public_ip": "${PUB_IP}"
  },
  "tools": {
    "tailscale_ipv4": "${TS_IP}",
    "cloudflared_version": "${CF_VER}"
  },
  "disks": ${DISKS_JSON}
}
EOF

INDEX="${INV_ROOT}/index.json"
python3 - <<PY
import json, os
host="${HOST}"
role="${ROLE}"
now="${NOW}"
idx_path="${INDEX}"
idx=[]
if os.path.exists(idx_path):
    try: idx=json.load(open(idx_path,'r',encoding='utf-8'))
    except Exception: idx=[]
idx=[x for x in idx if x.get("hostname")!=host and x.get("computername")!=host]
idx.append({"hostname":host,"role":role,"updated_at":now,"file":f"machines/{host}.json"})
json.dump(idx, open(idx_path,'w',encoding='utf-8'), indent=2)
PY

echo "Inventory written: ${OUT}"
echo "Index updated: ${INDEX}"
