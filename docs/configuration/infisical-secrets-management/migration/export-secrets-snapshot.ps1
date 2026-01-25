# Infisical Secrets Snapshot Export Script
# Purpose: Export all secrets (names + paths) from a project/environment so they can be
#          compared against the Project-Nyra .env template.

param(
    [string]$Env = "dev",
    [string]$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
    [string]$OutputFile = "./infisical-secrets-snapshot.json",
    [string]$ApiBaseUrl = $env:INFISICAL_API_URL,
    [switch]$EmitEnvPerPath,
    [string]$EnvExportRoot = "./infisical-path-exports"
)

$ErrorActionPreference = "Stop"

if (-not $ApiBaseUrl -or [string]::IsNullOrWhiteSpace($ApiBaseUrl)) {
    # Default to US cloud; override via INFISICAL_API_URL if using EU/self-hosted
    $ApiBaseUrl = "https://us.infisical.com"
}

# Prefer the same token env var used by migrate-secrets.ps1
$Token = $env:INFISICAL_ACCESS_TOKEN
if (-not $Token -or [string]::IsNullOrWhiteSpace($Token)) {
    # Fallback to standard CLI env var if set
    $Token = $env:INFISICAL_TOKEN
}

if (-not $Token -or [string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "❌ Missing Infisical access token." -ForegroundColor Red
    Write-Host "   Please set INFISICAL_ACCESS_TOKEN (or INFISICAL_TOKEN) in this shell first." -ForegroundColor Red
    Write-Host "   Example:" -ForegroundColor Yellow
    Write-Host '     $env:INFISICAL_ACCESS_TOKEN = "$(infisical login --method=universal-auth --client-id <ID> --client-secret <SECRET> --silent --plain)"' -ForegroundColor DarkGray
    exit 1
}

# Normalize base URL (no trailing slash)
$ApiBaseUrl = $ApiBaseUrl.TrimEnd('/')

# If we are emitting .env files per Infisical path, we need secret values too
$includeValues = $EmitEnvPerPath.IsPresent
$viewSecretValueFlag = if ($includeValues) { 'true' } else { 'false' }

$uri = "$ApiBaseUrl/api/v4/secrets?projectId=$ProjectId&environment=$Env&secretPath=/&recursive=true&viewSecretValue=$viewSecretValueFlag"

Write-Host "`n🔄 Fetching secrets from Infisical API..." -ForegroundColor Cyan
Write-Host "   Env:        $Env" -ForegroundColor Gray
Write-Host "   ProjectId:  $ProjectId" -ForegroundColor Gray
Write-Host "   API base:   $ApiBaseUrl" -ForegroundColor Gray

try {
    $headers = @{ Authorization = "Bearer $Token" }
    $response = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
} catch {
    Write-Host "❌ Failed to fetch secrets from Infisical API" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor DarkRed
    exit 1
}

if (-not $response -or -not $response.secrets) {
    Write-Host "⚠ No secrets returned from API." -ForegroundColor Yellow
    $secrets = @()
} else {
    $secrets = $response.secrets
}

# Project into a slim structure that is easy to diff against .env templates.
# The API response objects are expected to have at least `secretKey` and `secretPath`.

$projected = @()
foreach ($s in $secrets) {
    $projected += [pscustomobject]@{
        Environment = $Env
        ProjectId   = $ProjectId
        Path        = $s.secretPath
        Key         = $s.secretKey
    }
}

$projected = $projected | Sort-Object Path, Key

# Optionally emit per-path .env files so each Infisical folder becomes a physical .env file.
# Example: /clients/claude-flow  ->  <EnvExportRoot>/dev/clients/claude-flow.env
if ($EmitEnvPerPath -and $secrets.Count -gt 0) {
    Write-Host "`n🧾 Writing per-path .env exports to '$EnvExportRoot'..." -ForegroundColor Cyan

    if (-not (Test-Path $EnvExportRoot)) {
        New-Item -ItemType Directory -Path $EnvExportRoot -Force | Out-Null
    }

    $groups = $secrets | Group-Object -Property secretPath

    foreach ($group in $groups) {
        $path = $group.Name
        if (-not $path) { $path = '/' }

        $cleanPath = $path.Trim('/')
        if (-not $cleanPath) { $cleanPath = 'root' }

        # Build directory structure and filename under EnvExportRoot/<env>/...
        $baseDir = Join-Path $EnvExportRoot $Env
        $segments = $cleanPath -split '/'

        if ($segments.Count -gt 1) {
            $subDir = $baseDir
            for ($i = 0; $i -lt $segments.Count - 1; $i++) {
                $subDir = Join-Path $subDir $segments[$i]
            }
            $fileName = $segments[-1] + '.env'
        } else {
            $subDir   = $baseDir
            $fileName = $segments[0] + '.env'
        }

        if (-not (Test-Path $subDir)) {
            New-Item -ItemType Directory -Path $subDir -Force | Out-Null
        }

        $filePath = Join-Path $subDir $fileName

        $lines = @()
        $lines += "# Environment: $Env"
        $lines += "# ProjectId:  $ProjectId"
        $lines += "# SecretPath: $path"
        $lines += "# NOTE: DO NOT COMMIT THIS FILE TO VERSION CONTROL."
        $lines += ""

        foreach ($item in $group.Group) {
            $key   = $item.secretKey
            $value = $item.secretValue

            if ($null -ne $value) {
                $escaped = $value.ToString().Replace("`r",'').Replace("`n",'')
                if ($escaped -match '\s|#|=') {
                    $escaped = '"' + $escaped.Replace('"','\"') + '"'
                }
            } else {
                $escaped = ''
            }

            $lines += "$key=$escaped"
        }

        Set-Content -Path $filePath -Value $lines -Encoding UTF8
    }
}

# Wrap in a root object with some metadata so it's self-describing
$payload = [pscustomobject]@{
    GeneratedAt = [DateTime]::UtcNow.ToString("o")
    ApiBaseUrl  = $ApiBaseUrl
    Environment = $Env
    ProjectId   = $ProjectId
    Count       = $projected.Count
    Secrets     = $projected
}

$directory = Split-Path -Parent $OutputFile
if ($directory -and -not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

$payload | ConvertTo-Json -Depth 5 | Set-Content -Path $OutputFile -Encoding UTF8

Write-Host "`n✅ Export complete." -ForegroundColor Green
Write-Host "   Secrets exported: $($projected.Count)" -ForegroundColor Green
Write-Host "   Output file:      $OutputFile" -ForegroundColor Cyan
if ($EmitEnvPerPath) {
    Write-Host "   Env exports dir:  $EnvExportRoot" -ForegroundColor Cyan
}
Write-Host ""
