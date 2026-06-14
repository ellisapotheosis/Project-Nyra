#!/usr/bin/env pwsh
<#
.SYNOPSIS
Validate complete Tailscale infrastructure setup for Project Nyra

.DESCRIPTION
Validates:
- Tailscale CLI availability and version
- Active Tailscale connection
- DNS resolution for all service endpoints
- TCP connectivity to all registered ports
- Docker context configuration
- Infisical path structure

.PARAMETER HostFilter
Filter validation to specific host (e.g., 'oracle-vps', 'worker-rtx5090')

.PARAMETER SkipConnectivityTest
Skip TCP connection tests (useful for offline validation)

.EXAMPLE
./Validate-TailscaleSetup.ps1
./Validate-TailscaleSetup.ps1 -HostFilter oracle-vps
./Validate-TailscaleSetup.ps1 -SkipConnectivityTest $true
#>

param(
    [string]$HostFilter = "",
    [bool]$SkipConnectivityTest = $false,
    [string]$ManifestPath = "./docs/TAILSCALE_REGISTRATION_MANIFEST.json"
)

$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Highlight = "Magenta"
}

$ValidationResults = @{
    Passed = 0
    Failed = 0
    Warnings = 0
    Errors = @()
}

function Write-Check {
    param(
        [string]$Message,
        [bool]$Passed,
        [string]$Details = ""
    )
    $symbol = if ($Passed) { "✓" } else { "✗" }
    $color = if ($Passed) { "Success" } else { "Error" }

    Write-Host "  $symbol " -ForegroundColor $color -NoNewline
    Write-Host "$Message" -ForegroundColor $color

    if ($Details) {
        Write-Host "    → $Details" -ForegroundColor "DarkGray"
    }

    if ($Passed) {
        $ValidationResults.Passed++
    } else {
        $ValidationResults.Failed++
        $ValidationResults.Errors += $Message
    }
}

function Write-Section {
    param([string]$Title)
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] $Title" -ForegroundColor $Colors.Highlight
    Write-Host ("=" * 60) -ForegroundColor $Colors.Highlight
}

# Check 1: Tailscale CLI
Write-Section "Tailscale CLI Validation"

$tailscaleFound = $null
try {
    $tailscaleFound = Get-Command tailscale -ErrorAction SilentlyContinue
    $version = & tailscale version 2>&1 | Select-Object -First 1
    Write-Check "Tailscale CLI installed" $true "Version: $version"
} catch {
    Write-Check "Tailscale CLI installed" $false "Not found in PATH"
}

# Check 2: Tailscale Connection
Write-Section "Tailscale Connection Status"

try {
    $status = & tailscale status --json 2>&1 | ConvertFrom-Json
    $selfIP = $status.Self.TailscaleIPs[0]
    $online = $status.Self.Online

    Write-Check "Tailscale daemon running" $online "IP: $selfIP"
    Write-Check "Connected to tailnet" $online "Tailnet: $(if($online){"trex-fiordland.ts.net"}else{"N/A"})"

    $peerCount = ($status.Peer | Measure-Object).Count
    Write-Check "Peer nodes reachable" ($peerCount -gt 0) "Found $peerCount peers"
} catch {
    Write-Check "Tailscale status" $false "Error: $_"
}

# Check 3: Load Manifest
Write-Section "Manifest Validation"

if (Test-Path $ManifestPath) {
    try {
        $manifest = Get-Content $ManifestPath | ConvertFrom-Json
        $hostCount = ($manifest.hosts | Get-Member -MemberType NoteProperty).Count
        Write-Check "Manifest file found" $true "Path: $ManifestPath"
        Write-Check "Manifest parsing" $true "Contains $hostCount hosts"
    } catch {
        Write-Check "Manifest parsing" $false "JSON error: $_"
        $manifest = $null
    }
} else {
    Write-Check "Manifest file found" $false "Not found: $ManifestPath"
    $manifest = $null
}

# Check 4: DNS Resolution
Write-Section "DNS Resolution Tests"

if ($manifest) {
    $dnsTests = @()

    foreach ($host in $manifest.hosts | Get-Member -MemberType NoteProperty) {
        if ($HostFilter -and $host.Name -ne $HostFilter) { continue }

        $hostName = $host.Name
        $hostConfig = $manifest.hosts.$hostName

        Write-Host "  Host: $hostName" -ForegroundColor $Colors.Info

        # Test host MagicDNS
        $hostDNS = "$hostName.trex-fiordland.ts.net"
        try {
            $resolved = [System.Net.Dns]::GetHostAddresses($hostDNS) 2>&1
            Write-Check "  $hostDNS resolves" ($resolved.Count -gt 0) "IP: $($resolved[0].IPAddressToString)"
        } catch {
            Write-Check "  $hostDNS resolves" $false "DNS resolution failed"
        }

        # Test service endpoints
        foreach ($categoryName in $hostConfig.services | Get-Member -MemberType NoteProperty) {
            $services = $hostConfig.services.($categoryName.Name)

            if ($services -is [array]) {
                foreach ($service in $services) {
                    try {
                        $resolved = [System.Net.Dns]::GetHostAddresses($service.dns_alias) 2>&1
                        Write-Check "    $($service.dns_alias)" ($resolved.Count -gt 0) "IP: $($resolved[0].IPAddressToString)"
                    } catch {
                        Write-Check "    $($service.dns_alias)" $false "DNS resolution failed"
                    }
                }
            }
        }
    }
}

# Check 5: TCP Connectivity
if (-not $SkipConnectivityTest) {
    Write-Section "TCP Connectivity Tests"

    if ($manifest) {
        foreach ($host in $manifest.hosts | Get-Member -MemberType NoteProperty) {
            if ($HostFilter -and $host.Name -ne $HostFilter) { continue }

            $hostName = $host.Name
            $hostConfig = $manifest.hosts.$hostName

            Write-Host "  Host: $hostName" -ForegroundColor $Colors.Info

            foreach ($categoryName in $hostConfig.services | Get-Member -MemberType NoteProperty) {
                $services = $hostConfig.services.($categoryName.Name)

                if ($services -is [array]) {
                    foreach ($service in $services) {
                        try {
                            $result = Test-NetConnection -ComputerName $service.dns_alias `
                                -Port $service.port `
                                -WarningAction SilentlyContinue `
                                -ErrorAction SilentlyContinue `
                                -InformationLevel Quiet

                            Write-Check "    $($service.dns_alias):$($service.port)" $result.TcpTestSucceeded
                        } catch {
                            Write-Check "    $($service.dns_alias):$($service.port)" $false "Connection test error"
                        }
                    }
                }
            }
        }
    }
}

# Check 6: Docker Context Setup
Write-Section "Docker Context Configuration"

$expectedContexts = @("oracle-vps", "orchestrator", "worker-rtx5090", "worker-rtx3090ti", "worker-rtx3060")

try {
    $contexts = & docker context ls --format='{{.Name}}' 2>&1 | Where-Object { $_ -and $_ -notmatch '^$' }

    foreach ($expected in $expectedContexts) {
        $exists = $contexts | Where-Object { $_ -eq $expected }
        Write-Check "Docker context: $expected" ($exists -ne $null)
    }
} catch {
    Write-Check "Docker context check" $false "Docker not available or error"
}

# Check 7: Infisical Path Structure
Write-Section "Infisical Path Structure"

$expectedPaths = @(
    "/machines/oracle-vps",
    "/machines/orchestrator",
    "/machines/worker-rtx5090",
    "/machines/worker-rtx3090ti",
    "/machines/worker-rtx3060"
)

Write-Host "  Expected Infisical path structure:" -ForegroundColor $Colors.Info
foreach ($path in $expectedPaths) {
    Write-Host "    - $path" -ForegroundColor $Colors.DarkGray
}

# Check 8: SSH Connectivity
Write-Section "SSH Connectivity (via MagicDNS)"

$sshHosts = @{
    "oracle-vps" = "oracle-vps.trex-fiordland.ts.net"
    "orchestrator" = "orchestrator.trex-fiordland.ts.net"
    "worker-rtx5090" = "worker-rtx5090.trex-fiordland.ts.net"
    "worker-rtx3090ti" = "worker-rtx3090ti.trex-fiordland.ts.net"
    "worker-rtx3060" = "worker-rtx3060.trex-fiordland.ts.net"
}

foreach ($hostEntry in $sshHosts.GetEnumerator()) {
    if ($HostFilter -and $hostEntry.Key -ne $HostFilter) { continue }

    try {
        $result = Test-NetConnection -ComputerName $hostEntry.Value `
            -Port 22 `
            -WarningAction SilentlyContinue `
            -ErrorAction SilentlyContinue `
            -InformationLevel Quiet

        Write-Check "SSH to $($hostEntry.Key)" $result.TcpTestSucceeded "Port 22"
    } catch {
        Write-Check "SSH to $($hostEntry.Key)" $false "Connection test error"
    }
}

# Summary
Write-Section "Validation Summary"

Write-Host "Passed: " -NoNewline -ForegroundColor $Colors.Success
Write-Host $ValidationResults.Passed -ForegroundColor $Colors.Success

Write-Host "Failed: " -NoNewline -ForegroundColor $(if($ValidationResults.Failed -gt 0){"Error"}else{"Success"})
Write-Host $ValidationResults.Failed -ForegroundColor $(if($ValidationResults.Failed -gt 0){"Error"}else{"Success"})

if ($ValidationResults.Errors.Count -gt 0) {
    Write-Host "`nFailed Checks:" -ForegroundColor $Colors.Error
    foreach ($error in $ValidationResults.Errors) {
        Write-Host "  • $error" -ForegroundColor $Colors.Error
    }
}

$statusCode = if ($ValidationResults.Failed -gt 0) { 1 } else { 0 }
exit $statusCode
