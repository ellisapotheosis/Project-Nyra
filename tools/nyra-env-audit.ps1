param(
  [Parameter(Mandatory=$false)][string]$RepoRoot=".",
  [Parameter(Mandatory=$false)][string]$OutDir="./_audit",
  [Parameter(Mandatory=$false)][string[]]$ScanDirs=@("infra","apps","services","systems","bootstrap","scripts"),
  [Parameter(Mandatory=$false)][string[]]$ComposeGlobs=@("docker-compose*.yml","docker-compose*.yaml","compose*.yml","compose*.yaml"),
  [Parameter(Mandatory=$false)][switch]$CollectDockerLogs
)

$ErrorActionPreference = "Stop"

function New-Dir($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

$repo = (Resolve-Path $RepoRoot).Path
$out = Join-Path $repo $OutDir
New-Dir $out
New-Dir (Join-Path $out "docker_logs")

$now = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$invCsv = Join-Path $out "env_inventory.csv"
$missingMd = Join-Path $out "missing_env_report.md"
$dockerMd = Join-Path $out "docker_status.md"
$infisicalJson = Join-Path $out "infisical_missing_secrets.json"

# Collect .env-like files
$envFiles = Get-ChildItem -Path $repo -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^\.(env|env\..+)$' -or $_.Name -match '^env(\..+)?$' -or $_.Name -match '\.env(\..+)?$' }

$envMap = @{}
foreach($f in $envFiles){
  Get-Content $f.FullName -ErrorAction SilentlyContinue | ForEach-Object {
    if($_ -match '^\s*#'){ return }
    if($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$'){
      $k=$Matches[1]; $v=$Matches[2]
      if(-not $envMap.ContainsKey($k)){ $envMap[$k] = @() }
      $envMap[$k] += @{ file=$f.FullName; value=$v }
    }
  }
}

# File scan patterns
$varRefs = @{}
function Add-Ref($var, $file){
  if([string]::IsNullOrWhiteSpace($var)){ return }
  if(-not $varRefs.ContainsKey($var)){ $varRefs[$var] = New-Object System.Collections.Generic.HashSet[string] }
  [void]$varRefs[$var].Add($file)
}

# Candidate files: compose, dockerfiles, ts/js, yaml, json, md
$includeExt = @(".yml",".yaml",".json",".md",".ts",".tsx",".js",".jsx",".mjs",".cjs",".env",".txt",".ini",".conf","Dockerfile")
$scanRoots = @()
foreach($d in $ScanDirs){
  $p = Join-Path $repo $d
  if(Test-Path $p){ $scanRoots += $p }
}
if($scanRoots.Count -eq 0){ $scanRoots = @($repo) }

$files = Get-ChildItem -Path $scanRoots -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $includeExt -contains $_.Extension.ToLower() -or $_.Name -eq "Dockerfile" -or $_.Name -like "Dockerfile.*" }

# Regex patterns
$rxCompose = [regex]'\$\{([A-Za-z_][A-Za-z0-9_]*)(?::[^}]*)?\}'
$rxShell = [regex]'\$([A-Za-z_][A-Za-z0-9_]*)'
$rxNode = [regex]'process\.env\.([A-Za-z_][A-Za-z0-9_]*)'
$rxDockerEnv = [regex]'^\s*ENV\s+([A-Za-z_][A-Za-z0-9_]*)\s*='

foreach($f in $files){
  $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  if([string]::IsNullOrEmpty($content)){ continue }

  foreach($m in $rxCompose.Matches($content)){ Add-Ref $m.Groups[1].Value $f.FullName }
  foreach($m in $rxNode.Matches($content)){ Add-Ref $m.Groups[1].Value $f.FullName }
  foreach($m in $rxDockerEnv.Matches($content)){ Add-Ref $m.Groups[1].Value $f.FullName }

  # shell-style $VAR: restrict to common config files to reduce noise
  if($f.Extension -in @(".sh",".bash",".zsh",".ps1",".yml",".yaml",".env")){
    foreach($m in $rxShell.Matches($content)){
      $v = $m.Groups[1].Value
      if($v -match '^(PATH|HOME|PWD|USER|SHELL|TERM|TMP|TEMP|USERNAME|OS|PROCESSOR_|PROGRAMFILES)'){ continue }
      Add-Ref $v $f.FullName
    }
  }
}

# Write inventory CSV
$rows = @()
$secretRx = [regex]'(KEY|TOKEN|SECRET|PASS|PWD|PRIVATE|CERT|SIGNING|JWT|OAUTH|CLIENT_SECRET|API_KEY)'  # heuristic
foreach($k in ($varRefs.Keys | Sort-Object)){
  $locs = ($varRefs[$k].ToArray() | Sort-Object)
  $isSecret = $secretRx.IsMatch($k)
  $isSet = $envMap.ContainsKey($k)
  $setWhere = if($isSet){ ($envMap[$k] | Select-Object -First 1).file } else { "" }
  $rows += [pscustomobject]@{
    var = $k
    is_secret_guess = $isSecret
    is_set_in_env_files = $isSet
    example_env_file = $setWhere
    references = ($locs -join " | ")
  }
}
$rows | Export-Csv -NoTypeInformation -Path $invCsv -Encoding UTF8

# Missing report
$missing = $rows | Where-Object { -not $_.is_set_in_env_files }
$md = @()
$md += "# Missing Env Vars Report ($now)"
$md += ""
$md += "RepoRoot: `$repo`"
$md += "OutDir: `$out`"
$md += ""
$md += "## Missing variables (referenced but not found in any .env files)"
$md += ""
foreach($r in $missing){
  $md += "- **$($r.var)** (secret_guess=$($r.is_secret_guess))"
  $md += "  - refs: $($r.references)"
}
Set-Content -Path $missingMd -Value $md -Encoding UTF8

# Infisical template for missing likely secrets
$inf = @()
foreach($r in ($missing | Where-Object { $_.is_secret_guess })){
  $inf += @{
    key = $r.var
    value = ""
    note = "missing (fill & import into Infisical)"
  }
}
$infObj = @{ missing_secrets = $inf; generated_at = $now; repo_root = $repo }
$infObj | ConvertTo-Json -Depth 5 | Set-Content -Path $infisicalJson -Encoding UTF8

# Docker status
$docker = @()
$docker += "# Docker Status ($now)"
$docker += ""
try {
  $docker += "## docker ps -a"
  $docker += "```"
  $docker += (docker ps -a 2>&1 | Out-String).TrimEnd()
  $docker += "```"
} catch { $docker += "docker ps failed: $($_.Exception.Message)" }

try {
  $docker += "## docker compose ls"
  $docker += "```"
  $docker += (docker compose ls 2>&1 | Out-String).TrimEnd()
  $docker += "```"
} catch { $docker += "docker compose ls failed: $($_.Exception.Message)" }

Set-Content -Path $dockerMd -Value $docker -Encoding UTF8

Write-Host "Wrote:"
Write-Host " - $invCsv"
Write-Host " - $missingMd"
Write-Host " - $infisicalJson"
Write-Host " - $dockerMd"
Write-Host "Tip: rerun after generating .env from Infisical."
