#!/usr/bin/env pwsh
<#
.SYNOPSIS
List all Project Nyra Tailscale service endpoints

.DESCRIPTION
Displays complete endpoint inventory organized by host and service category.
Shows: service name, DNS alias, port, Infisical path, and purpose.

.PARAMETER Format
Output format: 'table' (default), 'json', 'csv', or 'markdown'

.PARAMETER HostFilter
Filter to specific host (e.g., 'oracle-vps', 'worker-rtx5090')

.PARAMETER CategoryFilter
Filter to specific category (e.g., 'mcp_servers', 'inference')

.PARAMETER ExportPath
Export results to file (JSON/CSV/Markdown only)

.EXAMPLE
./List-TailscaleEndpoints.ps1
./List-TailscaleEndpoints.ps1 -Format json
./List-TailscaleEndpoints.ps1 -HostFilter oracle-vps
./List-TailscaleEndpoints.ps1 -Format markdown -ExportPath ./ENDPOINTS.md
#>

param(
    [ValidateSet('table', 'json', 'csv', 'markdown')]
    [string]$Format = 'table',

    [string]$HostFilter = "",
    [string]$CategoryFilter = "",
    [string]$ExportPath = "",
    [string]$ManifestPath = "./docs/TAILSCALE_REGISTRATION_MANIFEST.json"
)

function Load-Manifest {
    if (-not (Test-Path $ManifestPath)) {
        Write-Error "Manifest not found: $ManifestPath"
        exit 1
    }

    try {
        return Get-Content $ManifestPath | ConvertFrom-Json
    }
    catch {
        Write-Error "Failed to parse manifest: $_"
        exit 1
    }
}

function Format-Table {
    param([array]$Endpoints)

    Write-Host "`n╔════════════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    Project Nyra - Tailscale Service Endpoints                         ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    $currentHost = ""
    foreach ($ep in $Endpoints) {
        if ($ep.Host -ne $currentHost) {
            if ($currentHost -ne "") {
                Write-Host ""
            }
            $currentHost = $ep.Host
            Write-Host "[$currentHost] - $($ep.HostIP)" -ForegroundColor Yellow
            Write-Host "─" * 86 -ForegroundColor Gray
            Write-Host ('{0,-30} {1,-20} {2,-8} {3}' -f "Service", "DNS Alias", "Port", "Infisical Path") -ForegroundColor Gray
            Write-Host "─" * 86 -ForegroundColor Gray
        }

        $serviceColor = switch ($ep.Type) {
            "mcp" { "Magenta" }
            "api" { "Cyan" }
            "inference" { "Green" }
            "ui" { "Yellow" }
            "memory" { "Blue" }
            default { "White" }
        }

        Write-Host ('{0,-30} {1,-20} {2,-8} {3}' -f `
            $ep.Service, `
            $ep.DnsAlias, `
            $ep.Port, `
            $ep.InfisicalPath) -ForegroundColor $serviceColor
    }

    Write-Host ""
    Write-Host "─" * 86 -ForegroundColor Gray
    Write-Host "Total endpoints: $($Endpoints.Count)" -ForegroundColor Green
    Write-Host ""
}

function Format-JSON {
    param([array]$Endpoints)
    return $Endpoints | ConvertTo-Json -Depth 10
}

function Format-CSV {
    param([array]$Endpoints)
    $csv = @("Host,Service,DnsAlias,Port,Type,InfisicalPath")
    foreach ($ep in $Endpoints) {
        $csv += "$($ep.Host),$($ep.Service),$($ep.DnsAlias),$($ep.Port),$($ep.Type),$($ep.InfisicalPath)"
    }
    return $csv -join "`n"
}

function Format-Markdown {
    param([array]$Endpoints)

    $md = @"
# Project Nyra - Tailscale Service Endpoints

**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Total Services**: $($Endpoints.Count)
**Tailnet**: trex-fiordland.ts.net

---

"@

    $currentHost = ""
    $currentType = ""
    foreach ($ep in $Endpoints) {
        if ($ep.Host -ne $currentHost) {
            $currentHost = $ep.Host
            $currentType = ""
            $md += "`n## $currentHost`n`n"
        }

        if ($ep.Type -ne $currentType) {
            $currentType = $ep.Type
            $md += "`n### $($currentType.ToUpper())`n`n"
            $md += "| Service | DNS Alias | Port | Infisical Path |`n"
            $md += "|---------|-----------|------|-----------------|`n"
        }

        $md += "| $($ep.Service) | ``$($ep.DnsAlias)`` | $($ep.Port) | ``$($ep.InfisicalPath)`` |`n"
    }

    return $md
}

# Main execution
$manifest = Load-Manifest

$endpoints = @()

foreach ($host in $manifest.hosts | Get-Member -MemberType NoteProperty) {
    $hostName = $host.Name
    if ($HostFilter -and $hostName -ne $HostFilter) { continue }

    $hostConfig = $manifest.hosts.$hostName

    foreach ($categoryName in $hostConfig.services | Get-Member -MemberType NoteProperty) {
        $category = $categoryName.Name
        if ($CategoryFilter -and $category -ne $CategoryFilter) { continue }

        $services = $hostConfig.services.$category

        if ($services -is [array]) {
            foreach ($service in $services) {
                $endpoints += [PSCustomObject]@{
                    Host = $hostName
                    HostIP = $hostConfig.tailscale_ip
                    Service = $service.name
                    DnsAlias = $service.dns_alias
                    Port = $service.port
                    Type = $service.type
                    InfisicalPath = $service.infisical_path
                }
            }
        }
    }
}

# Output
$output = switch ($Format) {
    "table" {
        Format-Table $endpoints
        "Displayed in console"
    }
    "json" {
        Format-JSON $endpoints
    }
    "csv" {
        Format-CSV $endpoints
    }
    "markdown" {
        Format-Markdown $endpoints
    }
}

if ($Format -ne "table") {
    if ($ExportPath) {
        $output | Set-Content -Path $ExportPath -Encoding UTF8
        Write-Host "✓ Exported $($endpoints.Count) endpoints to: $ExportPath" -ForegroundColor Green
    }
    else {
        Write-Host $output
    }
}
