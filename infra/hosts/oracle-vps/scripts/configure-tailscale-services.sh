#!/usr/bin/env bash
set -euo pipefail

web_services=(
  "infisical http://100.64.0.3:8200"
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
  "gitea-mcp http://127.0.0.1:3101"
  "letta-mcp http://127.0.0.1:8284"
  "memos-mcp http://127.0.0.1:8095"
  "twenty-mcp http://127.0.0.1:8400"
  "infisical-mcp http://127.0.0.1:8766"
  "magicui-mcp http://127.0.0.1:8768"
  "shadcn-mcp http://127.0.0.1:8769"
  "sequential-thinking-mcp http://127.0.0.1:8770"
  "playwright-mcp http://127.0.0.1:8771"
  "firecrawl-mcp http://127.0.0.1:8772"
  "git-mcp http://127.0.0.1:8773"
  "next-devtools-mcp http://127.0.0.1:8774"
  "tavily-mcp http://127.0.0.1:8775"
  "wcgw-mcp http://127.0.0.1:8776"
  "gitingest-mcp http://127.0.0.1:8777"
  "codebase-index-mcp http://127.0.0.1:8778"
  "tailscale-mcp http://127.0.0.1:8780"
  "mem0-rest http://127.0.0.1:5000"
  "portainer-tunnel http://127.0.0.1:8050"
  "openlit-clickhouse-http http://127.0.0.1:8123"
)

tcp_services=(
  "gitea-ssh 22 127.0.0.1:2222"
  "openlit-otlp-grpc 4317 127.0.0.1:4317"
  "openlit-otlp-http 4318 127.0.0.1:4318"
  "infisical-postgres 5432 127.0.0.1:5433"
  "infisical-redis 6379 127.0.0.1:6380"
  "falkordb 6379 127.0.0.1:6381"
  "openlit-clickhouse-native 9000 127.0.0.1:19000"
  "supabase-db 5432 127.0.0.1:54322"
)

for item in "${web_services[@]}"; do
  read -r name target <<<"${item}"
  echo "Configuring svc:${name} -> ${target}"
  sudo tailscale serve --service="svc:${name}" --https=443 --yes "${target}"
done

for item in "${tcp_services[@]}"; do
  read -r name port target <<<"${item}"
  echo "Configuring svc:${name} tcp/${port} -> ${target}"
  sudo tailscale serve --service="svc:${name}" --tcp="${port}" --yes "${target}"
done

sudo tailscale serve status --json | jq -r '
  .Services
  | to_entries[]
  | [
      .key,
      (((.value.Web // {}) | keys | .[0]) // ((.value.TCP // {}) | keys | .[0])),
      (.value.Web[]?.Handlers["/"]?.Proxy // .value.Web[]?.Handlers["/"]?.Text // (.value.TCP // {} | to_entries[0]? | .value.TCPForward) // "")
    ]
  | @tsv
' | sort
