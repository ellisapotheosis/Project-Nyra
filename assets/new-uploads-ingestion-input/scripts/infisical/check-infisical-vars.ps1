#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Check which Infisical variables are set or missing

.DESCRIPTION
    This script checks your Infisical project to determine which environment
    variables are configured and which are missing. It compares against the
    complete list of expected variables from ENV_VARIABLES_COMPLETE.md.

.PARAMETER ProjectId
    Infisical project ID (uses camelCase --projectId flag)

.PARAMETER Environment
    Environment to check (development, staging, production)

.PARAMETER Path
    Specific path/folder to check (e.g., /project-nyra/core)

.PARAMETER ShowValues
    Show actual secret values (use with caution)

.PARAMETER ExportReport
    Export detailed report to file

.PARAMETER Format
    Report format (console, json, csv, html)

.EXAMPLE
    .\check-infisical-vars.ps1 -ProjectId proj_abc123 -Environment development

.EXAMPLE
    .\check-infisical-vars.ps1 -ProjectId proj_abc123 -Path "/project-nyra/database" -ShowValues

.EXAMPLE
    .\check-infisical-vars.ps1 -ProjectId proj_abc123 -ExportReport -Format json
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [Parameter(Mandatory = $false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',

    [Parameter(Mandatory = $false)]
    [string]$Path = '',

    [Parameter(Mandatory = $false)]
    [switch]$ShowValues,

    [Parameter(Mandatory = $false)]
    [switch]$ExportReport,

    [Parameter(Mandatory = $false)]
    [ValidateSet('console', 'json', 'csv', 'html')]
    [string]$Format = 'console'
)

$ErrorActionPreference = 'Stop'

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }

# Expected variables by category
$ExpectedVariables = @{
    'Core' = @(
        'PROJECT_NAME', 'ENVIRONMENT', 'LOG_LEVEL', 'API_BASE_URL', 'WEB_BASE_URL',
        'CORS_ORIGINS', 'RATE_LIMIT_MAX', 'RATE_LIMIT_WINDOW_MS', 'DEBUG_MODE', 'MAINTENANCE_MODE'
    )
    'Database' = @(
        'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
        'POSTGRES_MAX_CONNECTIONS', 'POSTGRES_POOL_SIZE', 'POSTGRES_SSL_MODE',
        'REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD', 'REDIS_DB', 'REDIS_TLS_ENABLED',
        'MONGODB_URI', 'MONGODB_DATABASE'
    )
    'Authentication' = @(
        'JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN',
        'JWT_ALGORITHM', 'SESSION_SECRET', 'SESSION_TIMEOUT', 'SESSION_SECURE_COOKIE',
        'OAUTH_GITHUB_CLIENT_ID', 'OAUTH_GITHUB_CLIENT_SECRET',
        'OAUTH_GOOGLE_CLIENT_ID', 'OAUTH_GOOGLE_CLIENT_SECRET'
    )
    'Claude Flow' = @(
        'CLAUDE_FLOW_API_URL', 'CLAUDE_FLOW_API_KEY', 'CLAUDE_FLOW_WORKSPACE_ID',
        'CLAUDE_FLOW_PROJECT_ID', 'CLAUDE_MODEL', 'CLAUDE_MAX_TOKENS', 'CLAUDE_TEMPERATURE',
        'SWARM_TOPOLOGY', 'MAX_AGENTS', 'AGENT_TIMEOUT_SECONDS'
    )
    'GitHub' = @(
        'GITHUB_TOKEN', 'GITHUB_APP_ID', 'GITHUB_APP_PRIVATE_KEY',
        'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH', 'GITHUB_WEBHOOK_SECRET'
    )
    'Docker' = @(
        'DOCKER_REGISTRY_URL', 'DOCKER_REGISTRY_USERNAME', 'DOCKER_REGISTRY_PASSWORD',
        'DOCKER_REGISTRY_NAMESPACE', 'DOCKER_BUILDKIT', 'DOCKER_BUILD_ARGS'
    )
    'Infrastructure' = @(
        'MACHINE_ROLE', 'MACHINE_HOSTNAME', 'DOCKER_HOST', 'PORTAINER_AGENT_PORT',
        'PORTAINER_ADMIN_PASSWORD', 'GPU_MODEL', 'GPU_MEMORY_GB', 'CUDA_VERSION'
    )
}

# Critical variables that must be set
$CriticalVariables = @(
    'JWT_SECRET', 'JWT_REFRESH_SECRET', 'POSTGRES_PASSWORD', 'REDIS_PASSWORD',
    'API_BASE_URL', 'WEB_BASE_URL', 'CORS_ORIGINS', 'CLAUDE_FLOW_API_KEY',
    'GITHUB_TOKEN', 'DOCKER_REGISTRY_PASSWORD'
)

# Fetch secrets from Infisical
function Get-InfisicalSecrets {
    param(
        [string]$ProjectIdValue,
        [string]$EnvironmentValue,
        [string]$PathValue
    )

    Write-Info "Fetching secrets from Infisical..."
    Write-Info "Project ID: $ProjectIdValue"
    Write-Info "Environment: $EnvironmentValue"
    if ($PathValue) {
        Write-Info "Path: $PathValue"
    }

    try {
        # Build command with camelCase --projectId
        $cmd = "infisical secrets --projectId $ProjectIdValue --env $EnvironmentValue"
        if ($PathValue) {
            $cmd += " --path `"$PathValue`""
        }
        $cmd += " --format json"

        Write-Verbose "Executing: $cmd"
        $result = Invoke-Expression $cmd 2>&1

        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to fetch secrets: $result"
            return $null
        }

        $secrets = $result | ConvertFrom-Json
        Write-Success "Fetched $($secrets.Count) secrets"
        return $secrets
    }
    catch {
        Write-Error "Error fetching secrets: $_"
        return $null
    }
}

# Analyze secrets
function Invoke-SecretsAnalysis {
    param(
        [array]$Secrets,
        [hashtable]$Expected
    )

    $results = @{
        Total = 0
        Set = 0
        Missing = 0
        Critical = 0
        CriticalMissing = 0
        Details = @()
    }

    # Get all secret keys
    $secretKeys = $Secrets | ForEach-Object { $_.key }

    # Check each expected variable
    foreach ($category in $Expected.Keys) {
        foreach ($varName in $Expected[$category]) {
            $results.Total++

            $secret = $Secrets | Where-Object { $_.key -eq $varName }
            $isSet = $null -ne $secret
            $isCritical = $CriticalVariables -contains $varName

            if ($isSet) {
                $results.Set++
                if ($isCritical) {
                    $results.Critical++
                }
            }
            else {
                $results.Missing++
                if ($isCritical) {
                    $results.CriticalMissing++
                }
            }

            $detail = [PSCustomObject]@{
                Category = $category
                Variable = $varName
                Status = if ($isSet) { 'SET' } else { 'MISSING' }
                Critical = $isCritical
                Value = if ($ShowValues -and $isSet) { $secret.value } else { if ($isSet) { '***' } else { '' } }
                LastUpdated = if ($isSet) { $secret.updatedAt } else { '' }
            }

            $results.Details += $detail
        }
    }

    return $results
}

# Display console report
function Show-ConsoleReport {
    param($Results)

    Write-Host "`n" + ("═" * 80) -ForegroundColor Cyan
    Write-Host "  INFISICAL SECRETS ANALYSIS" -ForegroundColor Cyan
    Write-Host ("═" * 80) -ForegroundColor Cyan

    # Summary
    Write-Host "`nSummary:" -ForegroundColor Yellow
    Write-Host "  Total Expected: $($Results.Total)"
    Write-Success "  Set: $($Results.Set) ($([math]::Round($Results.Set / $Results.Total * 100, 1))%)"
    Write-Warning "  Missing: $($Results.Missing) ($([math]::Round($Results.Missing / $Results.Total * 100, 1))%)"
    Write-Host "  Critical Variables: $($Results.Critical)/$($CriticalVariables.Count) set"

    if ($Results.CriticalMissing -gt 0) {
        Write-Error "  Critical Missing: $($Results.CriticalMissing)"
    }

    # Group by category
    $grouped = $Results.Details | Group-Object -Property Category

    foreach ($group in $grouped) {
        Write-Host "`n$($group.Name):" -ForegroundColor Yellow

        foreach ($item in $group.Group | Sort-Object Variable) {
            $symbol = if ($item.Status -eq 'SET') { '✓' } else { '✗' }
            $color = if ($item.Status -eq 'SET') { 'Green' } else { if ($item.Critical) { 'Red' } else { 'Yellow' } }
            $criticalTag = if ($item.Critical) { ' [CRITICAL]' } else { '' }

            $line = "  $symbol $($item.Variable)$criticalTag"
            if ($ShowValues -and $item.Value) {
                $line += " = $($item.Value)"
            }

            Write-Host $line -ForegroundColor $color
        }
    }

    # Critical missing variables
    if ($Results.CriticalMissing -gt 0) {
        Write-Host "`nCRITICAL MISSING VARIABLES:" -ForegroundColor Red
        $Results.Details | Where-Object { $_.Critical -and $_.Status -eq 'MISSING' } | ForEach-Object {
            Write-Error "  ✗ $($_.Variable)"
        }
    }

    Write-Host "`n" + ("═" * 80) -ForegroundColor Cyan
}

# Export to JSON
function Export-JsonReport {
    param($Results, $OutputPath)

    $report = @{
        Timestamp = Get-Date -Format 'o'
        ProjectId = $ProjectId
        Environment = $Environment
        Path = $Path
        Summary = @{
            Total = $Results.Total
            Set = $Results.Set
            Missing = $Results.Missing
            Critical = $Results.Critical
            CriticalMissing = $Results.CriticalMissing
        }
        Details = $Results.Details
    }

    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Success "Report exported to: $OutputPath"
}

# Export to CSV
function Export-CsvReport {
    param($Results, $OutputPath)

    $Results.Details | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
    Write-Success "Report exported to: $OutputPath"
}

# Export to HTML
function Export-HtmlReport {
    param($Results, $OutputPath)

    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Infisical Secrets Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #ecf0f1; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #34495e; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ecf0f1; }
        tr:hover { background: #f8f9fa; }
        .status-set { color: #27ae60; font-weight: bold; }
        .status-missing { color: #e74c3c; font-weight: bold; }
        .critical { background: #ffebee; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.8em; font-weight: bold; }
        .badge-critical { background: #e74c3c; color: white; }
        .timestamp { color: #95a5a6; font-size: 0.9em; margin-top: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Infisical Secrets Analysis</h1>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">$($Results.Total)</div>
                <div class="stat-label">Total Variables</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #27ae60;">$($Results.Set)</div>
                <div class="stat-label">Set ($([math]::Round($Results.Set / $Results.Total * 100, 1))%)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #e74c3c;">$($Results.Missing)</div>
                <div class="stat-label">Missing ($([math]::Round($Results.Missing / $Results.Total * 100, 1))%)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #e67e22;">$($Results.CriticalMissing)</div>
                <div class="stat-label">Critical Missing</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Variable</th>
                    <th>Status</th>
                    <th>Critical</th>
                </tr>
            </thead>
            <tbody>
"@

    foreach ($item in $Results.Details | Sort-Object Category, Variable) {
        $statusClass = if ($item.Status -eq 'SET') { 'status-set' } else { 'status-missing' }
        $rowClass = if ($item.Critical -and $item.Status -eq 'MISSING') { 'critical' } else { '' }
        $criticalBadge = if ($item.Critical) { '<span class="badge badge-critical">CRITICAL</span>' } else { '' }

        $html += @"
                <tr class="$rowClass">
                    <td>$($item.Category)</td>
                    <td>$($item.Variable)</td>
                    <td class="$statusClass">$($item.Status)</td>
                    <td>$criticalBadge</td>
                </tr>
"@
    }

    $html += @"
            </tbody>
        </table>

        <div class="timestamp">
            Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')<br>
            Project: $ProjectId | Environment: $Environment
        </div>
    </div>
</body>
</html>
"@

    $html | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Success "Report exported to: $OutputPath"
}

# Main execution
try {
    Write-Info "Infisical Variables Checker"
    Write-Info "═" * 60

    # Fetch secrets
    $secrets = Get-InfisicalSecrets -ProjectIdValue $ProjectId -EnvironmentValue $Environment -PathValue $Path

    if ($null -eq $secrets) {
        Write-Error "Failed to fetch secrets. Exiting."
        exit 1
    }

    # Analyze secrets
    $results = Invoke-SecretsAnalysis -Secrets $secrets -Expected $ExpectedVariables

    # Display or export report
    if ($ExportReport) {
        $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $reportDir = Join-Path $PSScriptRoot "reports"

        if (-not (Test-Path $reportDir)) {
            New-Item -Path $reportDir -ItemType Directory -Force | Out-Null
        }

        switch ($Format) {
            'json' {
                $outputPath = Join-Path $reportDir "infisical-report-$timestamp.json"
                Export-JsonReport -Results $results -OutputPath $outputPath
            }
            'csv' {
                $outputPath = Join-Path $reportDir "infisical-report-$timestamp.csv"
                Export-CsvReport -Results $results -OutputPath $outputPath
            }
            'html' {
                $outputPath = Join-Path $reportDir "infisical-report-$timestamp.html"
                Export-HtmlReport -Results $results -OutputPath $outputPath
            }
            default {
                Show-ConsoleReport -Results $results
            }
        }
    }
    else {
        Show-ConsoleReport -Results $results
    }

    # Exit code based on critical missing
    if ($results.CriticalMissing -gt 0) {
        Write-Error "Critical variables are missing! Please set them before proceeding."
        exit 1
    }

    Write-Info "═" * 60
}
catch {
    Write-Error "An error occurred: $_"
    Write-Error $_.ScriptStackTrace
    exit 1
}
