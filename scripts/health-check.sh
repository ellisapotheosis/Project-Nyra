#!/usr/bin/env bash
set -euo pipefail

JSON=0
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON=1; shift;;
    --out) OUT="${2:-}"; shift 2;;
    *) shift;;
  esac
done

now_iso() { date -Iseconds; }

check_http() {
  local name="$1"; local url="$2"
  local start; start=$(date +%s%3N 2>/dev/null || date +%s000)
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$url" 2>/dev/null || echo "000")
  local end; end=$(date +%s%3N 2>/dev/null || date +%s000)
  local latency=$((end-start))

  local status="down"
  [[ "$code" == "200" || "$code" == "204" || "$code" == "302" ]] && status="up"

  echo "$name|$url|$status|$code|$latency"
}

check_tcp() {
  local name="$1"; local host="$2"; local port="$3"
  local start; start=$(date +%s%3N 2>/dev/null || date +%s000)
  if timeout 2 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
    local end; end=$(date +%s%3N 2>/dev/null || date +%s000)
    echo "$name|$host:$port|up|tcp|$((end-start))"
  else
    local end; end=$(date +%s%3N 2>/dev/null || date +%s000)
    echo "$name|$host:$port|down|tcp|$((end-start))"
  fi
}

ORCH="${NYRA_ORCH_HOST:-orchestrator.trex-fiordland.ts.net}"
W5090="${NYRA_W5090_HOST:-worker-rtx5090.trex-fiordland.ts.net}"
W3090="${NYRA_W3090_HOST:-worker-rtx3090ti.trex-fiordland.ts.net}"
W3060="${NYRA_W3060_HOST:-worker-rtx3060.trex-fiordland.ts.net}"

results=()
results+=("$(check_http "nexus" "http://$ORCH:6000/health")")
results+=("$(check_http "litellm" "http://$ORCH:8500/health")")
results+=("$(check_http "langfuse" "http://$ORCH:3005")")
results+=("$(check_http "grafana" "http://$ORCH:3006")")
results+=("$(check_http "prometheus" "http://$ORCH:9090/-/ready")")
results+=("$(check_http "loki" "http://$ORCH:3101/ready")")
results+=("$(check_http "portainer" "http://$ORCH:9000")")
results+=("$(check_http "n8n" "http://$ORCH:5678/healthz")")
results+=("$(check_http "twenty" "http://$ORCH:3020/healthz")")
results+=("$(check_http "openclaw-gateway" "http://$ORCH:3456/health")")
results+=("$(check_http "openclaw-studio" "http://$ORCH:3457")")
results+=("$(check_http "open-webui" "http://$ORCH:8088")")
results+=("$(check_http "mem0" "http://$ORCH:8010/")")
results+=("$(check_tcp "redis" "$ORCH" "6379")")
results+=("$(check_tcp "falkordb" "$ORCH" "6380")")
results+=("$(check_http "vllm-5090" "http://$W5090:8000/health")")
results+=("$(check_http "vllm-3090ti" "http://$W3090:8000/health")")
results+=("$(check_http "ollama-3060" "http://$W3060:11434/api/tags")")

if [[ "$JSON" == "1" ]]; then
  printf '{\n'
  printf '  "timestamp": "%s",\n' "$(now_iso)"
  printf '  "checks": [\n'
  for i in "${!results[@]}"; do
    IFS='|' read -r name endpoint status code latency <<< "${results[$i]}"
    printf '    {"service":"%s","endpoint":"%s","status":"%s","code":"%s","latency_ms":%s}%s\n' \
      "$name" "$endpoint" "$status" "$code" "$latency" \
      "$( [[ "$i" -lt $((${#results[@]}-1)) ]] && echo "," || echo "" )"
  done
  printf '  ]\n'
  printf '}\n' | ( [[ -n "$OUT" ]] && tee "$OUT" >/dev/null || cat )
else
  printf "service|endpoint|status|code|latency_ms\n"
  printf "%s\n" "${results[@]}"
fi
