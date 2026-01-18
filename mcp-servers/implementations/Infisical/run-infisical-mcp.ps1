$ErrorActionPreference = "Stop"
$useCredMan = $true
try { Import-Module CredentialManager -ErrorAction Stop }
catch { try { Import-Module CredentialManager -UseWindowsPowerShell -ErrorAction Stop } catch { $useCredMan = $false } }
Import-Module (Join-Path $PSScriptRoot 'secret-vault.psm1')

function Get-SecretValue([string]$Name){
  if ($useCredMan) {
    try {
      $c = Get-StoredCredential -Target $Name
      if ($c) {
        $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($c.Password)
        try { return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
        finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
      }
    } catch {}
  }
  return Get-SecretVaultValue -Name $Name
}

$childEnv = @{}; if ($env:INFISICAL_ENVIRONMENT) { $childEnv['INFISICAL_ENVIRONMENT'] = $env:INFISICAL_ENVIRONMENT } else { $childEnv['INFISICAL_ENVIRONMENT'] = 'dev' }
foreach ($k in 'INFISICAL_FOLDER_PATH','INFISICAL_PROJECT_ID','FLOW_NEXUS_URL','NOTION_URL','NYRA_OMP_CONFIG','POSH_THEMES_PATH','PROFILE.ALLUSERSALLHOSTS','STARSHIP_CONFIG','INFISICAL_HOST_URL'){ if ($env:$k){$childEnv[$k]=$env:$k} }
foreach ($k in 'INFISICAL_UNIVERSAL_AUTH_CLIENT_ID','INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET','FLOW_NEXUS_TOKEN','ANTHROPIC_API_KEY','BWS_ACCESS_TOKEN','NOTION_TOKEN','OPENAI_API_KEY'){ $v = Get-SecretValue $k; if($v){$childEnv[$k]=$v} }

$ia = @('run', "--env=$($childEnv['INFISICAL_ENVIRONMENT'])")
if ($childEnv.ContainsKey('INFISICAL_PROJECT_ID'))  { $ia += "--projectId=$($childEnv['INFISICAL_PROJECT_ID'])" }
if ($childEnv.ContainsKey('INFISICAL_FOLDER_PATH')) { $ia += "--path=$($childEnv['INFISICAL_FOLDER_PATH'])" }
if ($childEnv.ContainsKey('INFISICAL_HOST_URL'))    { $ia += "--site-url=$($childEnv['INFISICAL_HOST_URL'])" }

$cmd = @('npx','-y','infisical') + $ia + @('--','npx','-y','@infisical/mcp')
Write-Host "Launching Infisical -> MCP... (CredMan: $useCredMan)"
Write-Host ($cmd -join ' ')

if ((Get-Command Start-Process).Parameters.ContainsKey('Environment')) {
  Start-Process -FilePath $cmd[0] -ArgumentList $cmd[1..($cmd.Count-1)] -NoNewWindow -Wait -Environment $childEnv
} else {
  $backup = @{}; foreach($k in $childEnv.Keys){$backup[$k]=$env:$k; $env:$k=$childEnv[$k]}
  try { & $cmd[0] @($cmd[1..($cmd.Count-1)]) } finally { foreach($k in $childEnv.Keys){$env:$k=$backup[$k]} }
}
