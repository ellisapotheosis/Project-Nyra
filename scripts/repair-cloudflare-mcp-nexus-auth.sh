#!/usr/bin/env bash
set -euo pipefail

: "${CONFIRM_PHASE2_CLOUDFLARE_WRITE:?Set CONFIRM_PHASE2_CLOUDFLARE_WRITE=1 for the one-time Portal upstream auth repair}"
[[ "$CONFIRM_PHASE2_CLOUDFLARE_WRITE" == 1 ]] || { echo "refusing Cloudflare write" >&2; exit 1; }

secret_file="${NYRA_SECRET_FILE:-$HOME/.zsh/99-secrets.zsh}"
[[ -r "$secret_file" ]] || { echo "secret file is not readable: $secret_file" >&2; exit 1; }
# shellcheck disable=SC1090
source "$secret_file" >/dev/null 2>&1
: "${CF_GATEWAY_ACCESS_CLIENT_ID:?missing CF_GATEWAY_ACCESS_CLIENT_ID}"
: "${CF_GATEWAY_ACCESS_CLIENT_SECRET:?missing CF_GATEWAY_ACCESS_CLIENT_SECRET}"
: "${NEXUS_ADMIN_TOKEN:?missing NEXUS_ADMIN_TOKEN}"

portal_url="${NYRA_NEXUS_MCP_URL:-https://nexus-router.projectnyra.com/mcp}"
account_id="${CLOUDFLARE_ACCOUNT_ID:?missing CLOUDFLARE_ACCOUNT_ID}"
server_id="${NYRA_PORTAL_NEXUS_SERVER_ID:-nyra-bearer}"

request_body="$(CF_GATEWAY_ACCESS_CLIENT_ID="$CF_GATEWAY_ACCESS_CLIENT_ID" CF_GATEWAY_ACCESS_CLIENT_SECRET="$CF_GATEWAY_ACCESS_CLIENT_SECRET" NEXUS_ADMIN_TOKEN="$NEXUS_ADMIN_TOKEN" ACCOUNT_ID="$account_id" SERVER_ID="$server_id" node <<'NODE'
const token = process.env.NEXUS_ADMIN_TOKEN;
const accountId = process.env.ACCOUNT_ID;
const serverId = process.env.SERVER_ID;
const credentials = JSON.stringify({headers: {
  Authorization: `Bearer ${token}`,
  "CF-Access-Client-Id": process.env.CF_GATEWAY_ACCESS_CLIENT_ID,
  "CF-Access-Client-Secret": process.env.CF_GATEWAY_ACCESS_CLIENT_SECRET,
}});
const code = `async () => {
  const accountId = ${JSON.stringify(accountId)};
  const base = \`/accounts/\${accountId}/access/ai-controls/mcp\`;
  const create = await cloudflare.request({method:"POST", path:\`\${base}/servers\`, body:{id:${JSON.stringify(serverId)},name:"Project Nyra Nexus (Portal Bearer)",hostname:"https://nexus-router.projectnyra.com/mcp",auth_type:"bearer",auth_credentials:${JSON.stringify(credentials)},secure_web_gateway:true}});
  const mapping = {server_id:${JSON.stringify(serverId)},on_behalf:false,default_disabled:false,secure_web_gateway:true};
  const portalMappings = [
    {id:"mcp-gateway-portal",hostname:"mcp-gateway.projectnyra.com"},
    {id:"mcp-server-portal",hostname:"mcp-portal.projectnyra.com"}
  ];
  const portals = [];
  for (const portal of portalMappings) portals.push(await cloudflare.request({method:"PUT",path:\`\${base}/portals/\${portal.id}\`,body:{name:"MCP-Gateway",hostname:portal.hostname,secure_web_gateway:true,code_mode:"opt_in",servers:[mapping]}}));
  return {create:{success:create.success,status:create.status},portals:portals.map(p=>({success:p.success,status:p.status,result:p.result&&{id:p.result.id,servers:p.result.servers&&p.result.servers.map(s=>({server_id:s.server_id,auth_type:s.auth_type,status:s.status,on_behalf:s.on_behalf}))}}))};
}`;
process.stdout.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 9,
  method: "tools/call",
  params: { name: "execute", arguments: { name: "cloudflare__execute", arguments: { code } } }
}));
NODE
)"

init_body='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"nyra-phase2-server-auth-update","version":"1.0.0"}}}'
curl -fsS --max-time 30 -X POST "$portal_url" \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "CF-Access-Client-Id: $CF_GATEWAY_ACCESS_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CF_GATEWAY_ACCESS_CLIENT_SECRET" \
  --data "$init_body" >/dev/null

response="$(curl -fsS --max-time 90 -X POST "$portal_url" \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -H "CF-Access-Client-Id: $CF_GATEWAY_ACCESS_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CF_GATEWAY_ACCESS_CLIENT_SECRET" \
  --data "$request_body")"

if grep -Eq '"success"[[:space:]]*:[[:space:]]*true' <<<"$response" && grep -Eq '"status"[[:space:]]*:[[:space:]]*(200|201)' <<<"$response"; then
  echo "Cloudflare MCP server ${server_id} bearer-auth create request accepted"
else
  echo "Cloudflare MCP server nyra bearer-auth update failed; response was redacted below" >&2
  sed -E 's/(auth_credentials|access_token|client_secret|token|secret)(["'"'"':=])[^,}]*/\1\2<redacted>/Ig' <<<"$response" >&2
  exit 1
fi
