param(
  [string]$OWUI="http://localhost:3000",
  [string]$EndpointBase="http://localhost:12008/metamcp/openwebui-api/api",
  [string]$ApiKey=""
)
$spec = "$EndpointBase/openapi.json"
$payload = @{ name="MetaMCP"; baseUrl=$EndpointBase; openapiUrl=$spec; authType="bearer"; token=$ApiKey }
$paths = @("/api/tools/servers","/api/plugins/openapi","/api/openapi-servers")
foreach($p in $paths){
  try{
    $r=Invoke-RestMethod -Method Post -Uri ($OWUI+$p) -ContentType "application/json" -Body ($payload|ConvertTo-Json -Depth 6)
    if($r){ Write-Host "Registered tool server via $p" -ForegroundColor Green; return }
  }catch{}
}
Write-Warning "Could not auto-register Open WebUI tool; add manually via UI."
