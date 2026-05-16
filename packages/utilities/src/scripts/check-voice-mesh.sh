#!/usr/bin/env bash
set -euo pipefail

RTX3060_LAN_IP="${RTX3060_LAN_IP:?set RTX3060_LAN_IP}"
RTX3090TI_LAN_IP="${RTX3090TI_LAN_IP:?set RTX3090TI_LAN_IP}"
RTX5090_LAN_IP="${RTX5090_LAN_IP:?set RTX5090_LAN_IP}"

check_http() {
  local name="$1"
  local url="$2"
  printf 'checking %s... ' "$name"
  if curl -fsS --max-time 3 "$url" >/dev/null; then
    printf 'ok\n'
  else
    printf 'failed (%s)\n' "$url" >&2
    return 1
  fi
}

check_tcp() {
  local name="$1"
  local host="$2"
  local port="$3"
  printf 'checking %s... ' "$name"
  if timeout 3 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
    printf 'ok\n'
  else
    printf 'failed (%s:%s)\n' "$host" "$port" >&2
    return 1
  fi
}

check_tcp "3060 ingress signaling" "$RTX3060_LAN_IP" 18080
check_http "3060 VAD" "http://$RTX3060_LAN_IP:18100/health"
check_tcp "3090Ti STT stream" "$RTX3090TI_LAN_IP" 18200
check_http "3090Ti LLM bridge" "http://$RTX3090TI_LAN_IP:18250/health"
check_tcp "5090 TTS stream" "$RTX5090_LAN_IP" 18300
check_http "5090 coordinator" "http://$RTX5090_LAN_IP:18400/health"

echo "voice mesh checks passed"
