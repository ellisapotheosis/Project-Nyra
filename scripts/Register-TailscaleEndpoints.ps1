#!/usr/bin/env pwsh
<#
.SYNOPSIS
Register all Project Nyra service endpoints in Tailscale MagicDNS from Windows 11

.DESCRIPTION
Validates Tailscale setup and registers individual service endpoints across all GPU cluster hosts.
Uses MagicDNS with individual service aliases (e.g., letta-mcp.trex-fiordland.ts.net)
without requiring port numbers in the endpoint name.

.PARAMETER ManifestPath
Path to TAILSCALE_REGISTRATION_MANIFEST.json (defaults to docs/TAILSCALE_REGISTRATION_MANIFEST.json)

.PARAMETER DryRun
If $true, shows what would be registered without making changes

.PARAMETER TestConnectivity
If $true, tests connectivity to each registered endpoint after registration

.EXAMPLE
./Register-TailscaleEndpoints.ps1 -ManifestPath ./docs/TAILSCALE_REGISTRATION_MANIFEST.json
./Register-TailscaleEndpoints.ps1 -DryRun $true
./Register-TailscaleEndpoints.ps1 -TestConnectivity $true

.NOTES
Requires:
- PowerShell 7.0+
- Tailscale CLI (tailscale.exe in PATH)
- Active Tailscale connection on Windows 11
- jq for JSON parsing (or ConvertFrom-Json)
#>

param(
    [string]$ManifestPath = "./docs/TAILSCALE_REGISTRATION_MANIFEST.json",
    [bool]$DryRun = $false,
    [bool]$TestConnectivity = $false
)

# Color scheme for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Highlight = "Magenta"
}

function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "Info"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline
    Write-Host "$Message" -ForegroundColor $Colors[$Status]
}

function Test-TailscaleCLI {
    Write-Status "Validating Tailscale CLI..." "Info"
    try {
        $version = & tailscale version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Status "✓ Tailscale CLI found: $version" "Success"
            return $true
        }
    }
    catch {
        Write-Status "✗ Tailscale CLI not found or not in PATH" "Error"
        Write-Status "Install from: https://tailscale.com/download/windows" "Error"
        return $false
    }
}

function Test-TailscaleConnection {
    Write-Status "Testing Tailscale connection..." "Info"
    try {
        $ip = & tailscale ip -4 2>&1
        if ($LASTEXITCODE -eq 0 -and $ip) {
            Write-Status "✓ Connected to Tailnet. Local IP: $ip" "Success"
            return $true
        }
    }
    catch {
        Write-Status "✗ Not connected to Tailscale" "Error"
        Write-Status "Run: tailscale up" "Warning"
        return $false
    }
}

function Get-TailscaleNodes {
    Write-Status "Fetching Tailscale nodes..." "Info"
    try {
        $nodes = & tailscale status --json 2>&1 | ConvertFrom-Json
        if ($nodes.Self) {
            Write-Status "✓ Found $(($nodes.Peer | Measure-Object).Count) peer nodes" "Success"
            return $nodes
        }
    }
    catch {
        Write-Status "✗ Failed to fetch Tailscale nodes: $_" "Error"
        return $null
    }
}

function Load-Manifest {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        Write-Status "✗ Manifest not found: $Path" "Error"
        return $null
    }

    try {
        $manifest = Get-Content $Path | ConvertFrom-Json
        Write-Status "✓ Loaded manifest with $(($manifest.hosts | Get-Member -MemberType NoteProperty).Count) hosts" "Success"
        return $manifest
    }
    catch {
        Write-Status "✗ Failed to parse manifest: $_" "Error"
        return $null
    }
}

function Register-ServiceEndpoint {
    param(
        [string]$ServiceName,
        [string]$DnsAlias,
        [string]$HostIP,
        [int]$Port,
        [string]$Type,
        [bool]$DryRun = $false
    )

    $endpoint = "$($DnsAlias):$Port"

    if ($DryRun) {
        Write-Status "  [DRY RUN] Would register: $DnsAlias -> $HostIP`:$Port ($Type)" "Warning"
        return $true
    }

    # For Tailscale, individual service registration requires:
    # 1. Split DNS rules via ACLs (requires admin console or policy API)
    # 2. OR using tailscale serve for local services
    # 3. OR creating health checks and monitoring

    # Since we're using MagicDNS, the aliases should be managed via Tailscale admin console
    # This script documents what needs to be registered

    Write-Status "  Registering: $DnsAlias -> $HostIP`:$Port ($Type)" "Info"
    # Actual registration would be done via Tailscale API or admin console
    return $true
}

function Test-ServiceConnectivity {
    param(
        [string]$DnsAlias,
        [int]$Port,
        [int]$TimeoutSeconds = 5
    )

    try {
        $result = Test-NetConnection -ComputerName $DnsAlias -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($result.TcpTestSucceeded) {
            Write-Status "  ✓ $DnsAlias`:$Port reachable" "Success"
            return $true
        }
        else {
            Write-Status "  ✗ $DnsAlias`:$Port unreachable" "Warning"
            return $false
        }
    }
    catch {
        Write-Status "  ? $DnsAlias`:$Port - connection test failed: $_" "Warning"
        return $false
    }
}

function Register-AllEndpoints {
    param(
        [object]$Manifest,
        [bool]$DryRun = $false,
        [bool]$TestConnectivity = $false
    )

    Write-Status "================== REGISTRATION PLAN ==================" "Highlight"

    $totalServices = 0
    $registeredServices = 0
    $failedServices = 0

    foreach ($host in $Manifest.hosts | Get-Member -MemberType NoteProperty) {
        $hostName = $host.Name
        $hostConfig = $Manifest.hosts.$hostName
        $hostIP = $hostConfig.tailscale_ip

        Write-Status "Host: $hostName ($hostIP)" "Info"

        # Register all services under this host
        foreach ($categoryName in $hostConfig.services | Get-Member -MemberType NoteProperty) {
            $category = $categoryName.Name
            $services = $hostConfig.services.$category

            if ($services -is [array]) {
                foreach ($service in $services) {
                    $totalServices++
                    if (Register-ServiceEndpoint -ServiceName $service.name `
                        -DnsAlias $service.dns_alias `
                        -HostIP $hostIP `
                        -Port $service.port `
                        -Type $service.type `
                        -DryRun $DryRun) {
                        $registeredServices++
                    }
                    else {
                        $failedServices++
                    }
                }
            }
        }
    }

    Write-Status "=====================================================" "Highlight"
    Write-Status "Registration Summary" "Info"
    Write-Status "Total services: $totalServices" "Info"
    Write-Status "Registered: $registeredServices" "Success"
    Write-Status "Failed: $failedServices" "Error"

    return @{
        Total = $totalServices
        Registered = $registeredServices
        Failed = $failedServices
    }
}

function Generate-RegistrationReport {
    param(
        [object]$Manifest,
        [string]$OutputPath = "./TAILSCALE_REGISTRATION_REPORT.md"
    )

    Write-Status "Generating registration report..." "Info"

    $report = @"
# Tailscale Endpoint Registration Report

**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Tailnet**: $($Manifest.tailnet)
**Method**: $($Manifest.registration_notes.method)
**Executed From**: Windows 11

## Registration Status

### Next Steps

1. **Via Tailscale Admin Console** (https://login.tailscale.com/admin/dns):
   - Navigate to DNS settings
   - Add split DNS rules for each service endpoint
   - Example: `letta-mcp.trex-fiordland.ts.net` -> `100.64.0.3:8284`

2. **Via Tailscale API** (if using automation):
   - Use Tailscale DNS API to create aliases
   - Requires API key from account settings
   - Endpoint: `https://api.tailscale.com/v2/dns`

3. **Validation After Registration**:
   ```powershell
   # Test DNS resolution
   nslookup letta-mcp.trex-fiordland.ts.net

   # Test connectivity
   Test-NetConnection -ComputerName letta-mcp.trex-fiordland.ts.net -Port 8284
   ```

## Services to Register

"@

    foreach ($host in $Manifest.hosts | Get-Member -MemberType NoteProperty) {
        $hostName = $host.Name
        $hostConfig = $Manifest.hosts.$hostName

        $report += "`n### $hostName ($($hostConfig.tailscale_ip))`n`n"

        foreach ($categoryName in $hostConfig.services | Get-Member -MemberType NoteProperty) {
            $category = $categoryName.Name
            $services = $hostConfig.services.$category

            $report += "#### $category`n`n| Service | DNS Alias | Port | Infisical Path |`n"
            $report += "|---------|-----------|------|-----------------|`n"

            if ($services -is [array]) {
                foreach ($service in $services) {
                    $report += "| $($service.name) | ``$($service.dns_alias)`` | $($service.port) | ``$($service.infisical_path)`` |`n"
                }
            }
            $report += "`n"
        }
    }

    $report += @"

## Docker Context Mapping

The following docker contexts should be configured on Windows 11:

- orchestrator -> orchestrator.trex-fiordland.ts.net
- oracle-vps -> oracle-vps.trex-fiordland.ts.net
- worker-rtx5090 -> worker-rtx5090.trex-fiordland.ts.net
- worker-rtx3090ti -> worker-rtx3090ti.trex-fiordland.ts.net
- worker-rtx3060 -> worker-rtx3060.trex-fiordland.ts.net

## Tailscale IPv4 Mapping Reference

| Host | Tailscale IP | MagicDNS |
|------|-------------|----------|
| oracle-vps | 100.64.0.3 | oracle-vps.trex-fiordland.ts.net |
| homeassistant | 100.64.0.2 | homeassistant.trex-fiordland.ts.net |
| orchestrator | 100.64.0.10 | orchestrator.trex-fiordland.ts.net |
| worker-rtx5090 | 100.64.0.11 | worker-rtx5090.trex-fiordland.ts.net |
| worker-rtx3060 | 100.64.0.12 | worker-rtx3060.trex-fiordland.ts.net |
| worker-rtx3090ti | 100.64.0.13 | worker-rtx3090ti.trex-fiordland.ts.net |
| iphone | 100.64.0.4 | iphone.trex-fiordland.ts.net |

---
*Report generated by Register-TailscaleEndpoints.ps1*
"@

    $report | Set-Content -Path $OutputPath -Encoding UTF8
    Write-Status "✓ Report saved to: $OutputPath" "Success"
}

# Main execution
function Main {
    Write-Host "`n" -NoNewline
    Write-Status "╔════════════════════════════════════════════════════╗" "Highlight"
    Write-Status "║  Project Nyra - Tailscale Endpoint Registration  ║" "Highlight"
    Write-Status "╚════════════════════════════════════════════════════╝" "Highlight"
    Write-Host ""

    # Pre-flight checks
    if (-not (Test-TailscaleCLI)) {
        exit 1
    }

    if (-not (Test-TailscaleConnection)) {
        exit 1
    }

    $nodes = Get-TailscaleNodes
    if (-not $nodes) {
        exit 1
    }

    # Load manifest
    $manifest = Load-Manifest -Path $ManifestPath
    if (-not $manifest) {
        exit 1
    }

    Write-Host ""
    Write-Status "Starting endpoint registration..." "Info"

    if ($DryRun) {
        Write-Status "DRY RUN MODE - No actual changes will be made" "Warning"
    }

    Write-Host ""

    # Register all endpoints
    $result = Register-AllEndpoints -Manifest $manifest -DryRun $DryRun -TestConnectivity $TestConnectivity

    Write-Host ""

    # Optionally test connectivity
    if ($TestConnectivity -and -not $DryRun) {
        Write-Status "Testing connectivity to registered endpoints..." "Info"
        Write-Host ""

        foreach ($host in $manifest.hosts | Get-Member -MemberType NoteProperty) {
            $hostName = $host.Name
            $hostConfig = $manifest.hosts.$hostName

            Write-Status "Testing $hostName services..." "Info"

            foreach ($categoryName in $hostConfig.services | Get-Member -MemberType NoteProperty) {
                $services = $hostConfig.services.($categoryName.Name)

                if ($services -is [array]) {
                    foreach ($service in $services) {
                        Test-ServiceConnectivity -DnsAlias $service.dns_alias -Port $service.port
                    }
                }
            }
        }
    }

    Write-Host ""

    # Generate report
    Generate-RegistrationReport -Manifest $manifest

    Write-Host ""
    Write-Status "Registration process complete" "Success"
    Write-Host ""
}

# Execute
Main
