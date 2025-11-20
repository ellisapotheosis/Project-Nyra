#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${1:-http://localhost:12008}"; ENDPOINT="${2:-openwebui-api}"
end=$((SECONDS+60)); while (( SECONDS<end )); do curl -fsS "$BASE_URL/api/openapi.json" >/dev/null 2>&1 && break || sleep 2; done
post(){ curl -sS -X POST -H "Content-Type: application/json" "$BASE_URL$1" -d "$2" >/dev/null || true; }
for ns in coding search cloudflare crm memory ruv high_context; do post "/api/namespaces" "{\"name\":\"$ns\",\"description\":\"$ns namespace\"}"; done
[[ -n "${TAVILY_API_KEY:-}" ]] && post "/api/servers" '{"name":"tavily","type":"http","url":"http://tavily-mcp:8000/mcp","headers":{"TAVILY_API_KEY":"'"'"'"'"'"'"'"'${TAVILY_API_KEY}'"'"'"'"'"'"'"'"}}'
[[ -n "${CONTEXT7_API_KEY:-}" ]] && post "/api/servers" '{"name":"context7","type":"http","url":"https://mcp.context7.com/mcp","headers":{"CONTEXT7_API_KEY":"'"'"'"'"'"'"'"'${CONTEXT7_API_KEY}'"'"'"'"'"'"'"'"}}'
[[ -n "${FLOW_NEXUS_MCP_URL:-}" ]] && post "/api/servers" '{"name":"flow-nexus-remote","type":"http","url":"'"'"'"'"'"'"'"'${FLOW_NEXUS_MCP_URL}'"'"'"'"'"'"'"'"}'
[[ -n "${ZOHO_MCP_URL:-}" ]] && post "/api/servers" '{"name":"zoho-crm","type":"http","url":"'"'"'"'"'"'"'"'${ZOHO_MCP_URL}'"'"'"'"'"'"'"'"}'
if [[ -n "${CLOUDFLARE_TOKEN:-}" ]]; then
  post "/api/servers" '{"name":"cf-docs","type":"http","url":"https://docs.mcp.cloudflare.com/mcp","headers":{"Authorization":"Bearer '"'"'"'"'"'"'"'${CLOUDFLARE_TOKEN}'"'"'"'"'"'"'"'"}}'
  post "/api/servers" '{"name":"cf-analytics","type":"http","url":"https://analytics.mcp.cloudflare.com/mcp","headers":{"Authorization":"Bearer '"'"'"'"'"'"'"'${CLOUDFLARE_TOKEN}'"'"'"'"'"'"'"'"}}'
  post "/api/servers" '{"name":"cf-kv","type":"http","url":"https://kv.mcp.cloudflare.com/mcp","headers":{"Authorization":"Bearer '"'"'"'"'"'"'"'${CLOUDFLARE_TOKEN}'"'"'"'"'"'"'"'"}}'
fi
post "/api/namespaces/search/servers" '{"server":"tavily"}'
post "/api/namespaces/search/servers" '{"server":"context7"}'
post "/api/namespaces/cloudflare/servers" '{"server":"cf-docs"}'
post "/api/namespaces/cloudflare/servers" '{"server":"cf-analytics"}'
post "/api/namespaces/cloudflare/servers" '{"server":"cf-kv"}'
post "/api/namespaces/crm/servers" '{"server":"zoho-crm"}'
post "/api/namespaces/ruv/servers" '{"server":"flow-nexus-remote"}'
post "/api/endpoints" '{"name":"'"'"'"'"'"'"'"'${ENDPOINT}'"'"'"'"'"'"'"'","auth":"api_key"}'
echo "MetaMCP pre-seed done."
