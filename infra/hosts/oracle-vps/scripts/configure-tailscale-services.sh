#!/usr/bin/env bash
set -euo pipefail

# Browser-useful Oracle endpoints. Raw databases, Redis, and container-only
# backends stay private and are intentionally not exposed as Tailscale Services.
services=(
  "projectnyra http://127.0.0.1:3002"
  "webapp http://127.0.0.1:3002"
  "nexus http://127.0.0.1:6000"
  "nexus-ui http://127.0.0.1:3016"
  "litellm http://127.0.0.1:4000"
  "openwebui http://127.0.0.1:8088"
  "openlit http://127.0.0.1:3004"
  "letta http://127.0.0.1:8283"
  "mem0 http://127.0.0.1:5001"
  "memos http://127.0.0.1:8001"
  "openmemory-mcp http://127.0.0.1:8765"
  "n8n http://127.0.0.1:5678"
  "activepieces http://127.0.0.1:8080"
  "portainer http://127.0.0.1:9000"
  "portainer-secure https://127.0.0.1:9443"
  "prometheus-oracle http://127.0.0.1:9090"
  "grafana-oracle http://127.0.0.1:3003"
  "loki-oracle http://127.0.0.1:3100"
  "cadvisor http://127.0.0.1:8081"
  "gitea http://127.0.0.1:3001"
  "twenty-crm http://127.0.0.1:3000"
  "quote-api http://127.0.0.1:7070"
  "quote-engine http://127.0.0.1:8089"
  "crm-api http://127.0.0.1:4001"
  "campaign-engine http://127.0.0.1:8020"
  "supabase-kong http://127.0.0.1:8000"
  "clawteam http://127.0.0.1:8085"
  "gastown http://127.0.0.1:8096"
  "paperclip http://127.0.0.1:3100"
)

for item in "${services[@]}"; do
  read -r name target <<<"${item}"
  echo "Configuring svc:${name} -> ${target}"
  sudo tailscale serve --service="svc:${name}" --https=443 --yes "${target}"
done

sudo tailscale serve status --json | jq -r '
  .Services
  | to_entries[]
  | [
      .key,
      (.value.Web | keys[0]),
      (.value.Web[]?.Handlers["/"]?.Proxy // .value.Web[]?.Handlers["/"]?.Text // "")
    ]
  | @tsv
' | sort
