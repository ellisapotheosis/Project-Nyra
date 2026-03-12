param([string]$BaseUrl="http://localhost:12008",[string]$EndpointName="openwebui-api",[int]$WaitSeconds=60)
function WaitOk($url,$sec){$d=(Get-Date).AddSeconds($sec);while((Get-Date)-lt $d){try{$r=Invoke-WebRequest -UseBasicParsing -Uri "$url/api/openapi.json";if($r.StatusCode -ge 200){return}}catch{};Start-Sleep 2}}
WaitOk $BaseUrl $WaitSeconds
function J($o){$o|ConvertTo-Json -Depth 9}
function POST($p,$b){try{Invoke-RestMethod -Method Post -Uri ($BaseUrl+$p) -ContentType "application/json" -Body (J $b)|Out-Null}catch{}}
$ns=@("coding","search","cloudflare","crm","memory","ruv","high_context")
$ns|%{ POST "/api/namespaces" @{name=$_;description="$_ namespace"} }
if($env:TAVILY_API_KEY){ POST "/api/servers" @{name="tavily";type="http";url="http://tavily-mcp:8000/mcp";headers=@{TAVILY_API_KEY=$env:TAVILY_API_KEY}} }
if($env:CONTEXT7_API_KEY){ POST "/api/servers" @{name="context7";type="http";url="https://mcp.context7.com/mcp";headers=@{CONTEXT7_API_KEY=$env:CONTEXT7_API_KEY}} }
if($env:FLOW_NEXUS_MCP_URL){ POST "/api/servers" @{name="flow-nexus-remote";type="http";url=$env:FLOW_NEXUS_MCP_URL} }
if($env:ZOHO_MCP_URL){ POST "/api/servers" @{name="zoho-crm";type="http";url=$env:ZOHO_MCP_URL} }
if($env:CLOUDFLARE_TOKEN){
  POST "/api/servers" @{name="cf-docs";type="http";url="https://docs.mcp.cloudflare.com/mcp";headers=@{Authorization="Bearer $($env:CLOUDFLARE_TOKEN)"}}
  POST "/api/servers" @{name="cf-analytics";type="http";url="https://analytics.mcp.cloudflare.com/mcp";headers=@{Authorization="Bearer $($env:CLOUDFLARE_TOKEN)"}}
  POST "/api/servers" @{name="cf-kv";type="http";url="https://kv.mcp.cloudflare.com/mcp";headers=@{Authorization="Bearer $($env:CLOUDFLARE_TOKEN)"}}
}
POST "/api/namespaces/search/servers" @{server="tavily"}
POST "/api/namespaces/search/servers" @{server="context7"}
POST "/api/namespaces/cloudflare/servers" @{server="cf-docs"}
POST "/api/namespaces/cloudflare/servers" @{server="cf-analytics"}
POST "/api/namespaces/cloudflare/servers" @{server="cf-kv"}
POST "/api/namespaces/crm/servers" @{server="zoho-crm"}
POST "/api/namespaces/ruv/servers" @{server="flow-nexus-remote"}
POST "/api/endpoints" @{name=$EndpointName;auth="api_key"}
Write-Host "MetaMCP pre-seed done."
