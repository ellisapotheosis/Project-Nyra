\
param(
  [string]$ComposeFile = "docker-compose.nyra.yml",
  [string]$Profiles = "core",
  [switch]$Ui,
  [switch]$Twenty,
  [ValidateSet("graph-neo4j","graph-falkor","none")]
  [string]$Graph = "graph-neo4j"
)

$profileArgs = @()
$Profiles.Split(",") | ForEach-Object { $profileArgs += @("--profile", $_.Trim()) }

if ($Ui) { $profileArgs += @("--profile","ui") }
if ($Twenty) { $profileArgs += @("--profile","twenty") }
if ($Graph -ne "none") { $profileArgs += @("--profile",$Graph) }

Write-Host "Starting NYRA stack with: $ComposeFile"
Write-Host "Profiles: $($profileArgs -join ' ')"

docker compose -f $ComposeFile $profileArgs up -d
docker compose -f $ComposeFile ps
