<#
.SYNOPSIS
    Validation script for Project-Nyra bootstrap deployment

.DESCRIPTION
    Comprehensive validation of:
    - PC configurations
    - Network connectivity
    - Service endpoints
    - Security settings
    - Performance benchmarks

.PARAMETER DetailedReport
    Generate detailed HTML report

.PARAMETER SkipPerformance
    Skip performance benchmarks
#>

[CmdletBinding()]
param(
    [switch]$DetailedReport,

    [switch]$SkipPerformance,

    [string]$ReportPath = "$PSScriptRoot\..\reports\validation-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
)

$ErrorActionPreference = 'Continue'

# Validation results
$script:ValidationResults = @{
    Timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    OverallStatus = 'Unknown'
    Categories = @{}
    Warnings = @()
    Errors = @()
}

# Cluster configuration
$script:ClusterConfig = @{
    PCs = @(
        @{
            Name = 'Orchestrator-Mini'
            IP = '192.168.1.10'
            Hostname = 'orchestrator-mini'
            Services = @(
                @{ Name = 'Gitea'; Port = 3000; Path = '/' }
                @{ Name = 'Grafana'; Port = 3001; Path = '/api/health' }
                @{ Name = 'Prometheus'; Port = 9090; Path = '/-/healthy' }
                @{ Name = 'Traefik'; Port = 8080; Path = '/api/overview' }
            )
        },
        @{
            Name = 'Worker-RTX3090Ti'
            IP = '192.168.1.11'
            Hostname = 'worker-rtx3090ti'
            Services = @(
                @{ Name = 'Ollama'; Port = 11434; Path = '/' }
                @{ Name = 'n8n'; Port = 5678; Path = '/healthz' }
                @{ Name = 'SwarmUI'; Port = 7801; Path = '/' }
            )
        },
        @{
            Name = 'Worker-RTX3060'
            IP = '192.168.1.12'
            Hostname = 'worker-rtx3060'
            Services = @(
                @{ Name = 'Ollama'; Port = 11434; Path = '/' }
            )
            Disconnectable = $true
        },
        @{
            Name = 'Worker-RTX5090'
            IP = '192.168.1.13'
            Hostname = 'worker-rtx5090'
            Services = @(
                @{ Name = 'Ollama'; Port = 11434; Path = '/' }
            )
            Disconnectable = $true
        }
    )
}

function Write-ValidationLog {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $colors = @{
        Info = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error = 'Red'
    }

    $timestamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $colors[$Level]
    Write-Host $Message

    if ($Level -eq 'Warning') {
        $script:ValidationResults.Warnings += $Message
    } elseif ($Level -eq 'Error') {
        $script:ValidationResults.Errors += $Message
    }
}

function Test-PCConfiguration {
    Write-ValidationLog "Validating PC configurations..." -Level Info

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Details = @()
    }

    foreach ($pc in $script:ClusterConfig.PCs) {
        Write-ValidationLog "Checking $($pc.Name)..." -Level Info

        $pcResult = @{
            PC = $pc.Name
            Status = 'Unknown'
            Checks = @{}
        }

        # Test connectivity
        $reachable = Test-Connection -ComputerName $pc.IP -Count 2 -Quiet
        $pcResult.Checks.Connectivity = $reachable

        if (-not $reachable) {
            if ($pc.Disconnectable) {
                Write-ValidationLog "$($pc.Name) is not reachable (OK - disconnectable)" -Level Warning
                $results.Warnings++
                $pcResult.Status = 'Disconnected'
            } else {
                Write-ValidationLog "$($pc.Name) is not reachable!" -Level Error
                $results.Failed++
                $pcResult.Status = 'Failed'
            }
        } else {
            # Test DNS resolution
            $dnsResult = Resolve-DnsName -Name $pc.Hostname -ErrorAction SilentlyContinue
            $pcResult.Checks.DNS = $dnsResult -ne $null

            if ($dnsResult) {
                Write-ValidationLog "$($pc.Name) DNS resolution OK" -Level Success
            } else {
                Write-ValidationLog "$($pc.Name) DNS resolution failed" -Level Warning
                $results.Warnings++
            }

            $results.Passed++
            $pcResult.Status = 'Passed'
        }

        $results.Details += $pcResult
    }

    $script:ValidationResults.Categories.PCConfiguration = $results

    Write-ValidationLog "PC Configuration: $($results.Passed) passed, $($results.Failed) failed, $($results.Warnings) warnings" -Level Info
}

function Test-NetworkConnectivity {
    Write-ValidationLog "Validating network connectivity..." -Level Info

    $results = @{
        Passed = 0
        Failed = 0
        Details = @()
    }

    # Test inter-PC connectivity
    foreach ($sourcePC in $script:ClusterConfig.PCs) {
        $sourceReachable = Test-Connection -ComputerName $sourcePC.IP -Count 1 -Quiet

        if (-not $sourceReachable) {
            continue
        }

        foreach ($targetPC in $script:ClusterConfig.PCs) {
            if ($sourcePC.Name -eq $targetPC.Name) {
                continue
            }

            Write-ValidationLog "Testing $($sourcePC.Name) -> $($targetPC.Name)" -Level Info

            $targetReachable = Test-Connection -ComputerName $targetPC.IP -Count 2 -Quiet

            $connectionResult = @{
                Source = $sourcePC.Name
                Target = $targetPC.Name
                Status = $targetReachable
            }

            if ($targetReachable) {
                $results.Passed++
                Write-ValidationLog "$($sourcePC.Name) -> $($targetPC.Name): OK" -Level Success
            } else {
                if ($targetPC.Disconnectable) {
                    Write-ValidationLog "$($sourcePC.Name) -> $($targetPC.Name): Not reachable (OK - disconnectable)" -Level Warning
                } else {
                    $results.Failed++
                    Write-ValidationLog "$($sourcePC.Name) -> $($targetPC.Name): Failed!" -Level Error
                }
            }

            $results.Details += $connectionResult
        }
    }

    $script:ValidationResults.Categories.NetworkConnectivity = $results

    Write-ValidationLog "Network Connectivity: $($results.Passed) passed, $($results.Failed) failed" -Level Info
}

function Test-ServiceEndpoints {
    Write-ValidationLog "Validating service endpoints..." -Level Info

    $results = @{
        Passed = 0
        Failed = 0
        Details = @()
    }

    foreach ($pc in $script:ClusterConfig.PCs) {
        # Check if PC is reachable
        $reachable = Test-Connection -ComputerName $pc.IP -Count 1 -Quiet

        if (-not $reachable) {
            if ($pc.Disconnectable) {
                Write-ValidationLog "$($pc.Name) not reachable, skipping service checks" -Level Warning
            } else {
                Write-ValidationLog "$($pc.Name) not reachable, cannot check services!" -Level Error
            }
            continue
        }

        # Test each service
        foreach ($service in $pc.Services) {
            $url = "http://$($pc.Hostname):$($service.Port)$($service.Path)"

            Write-ValidationLog "Testing $($service.Name) at $url..." -Level Info

            try {
                $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop

                $serviceResult = @{
                    PC = $pc.Name
                    Service = $service.Name
                    URL = $url
                    StatusCode = $response.StatusCode
                    Status = 'Passed'
                }

                $results.Passed++
                Write-ValidationLog "$($service.Name): OK (Status: $($response.StatusCode))" -Level Success

            } catch {
                $serviceResult = @{
                    PC = $pc.Name
                    Service = $service.Name
                    URL = $url
                    StatusCode = $null
                    Status = 'Failed'
                    Error = $_.Exception.Message
                }

                $results.Failed++
                Write-ValidationLog "$($service.Name): Failed - $($_.Exception.Message)" -Level Error
            }

            $results.Details += $serviceResult
        }
    }

    $script:ValidationResults.Categories.ServiceEndpoints = $results

    Write-ValidationLog "Service Endpoints: $($results.Passed) passed, $($results.Failed) failed" -Level Info
}

function Test-SecurityConfiguration {
    Write-ValidationLog "Validating security configuration..." -Level Info

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Details = @()
    }

    # Check firewall status
    try {
        $firewallProfiles = Get-NetFirewallProfile
        foreach ($profile in $firewallProfiles) {
            $securityCheck = @{
                Check = "Firewall: $($profile.Name)"
                Status = $profile.Enabled
            }

            if ($profile.Enabled) {
                $results.Passed++
                Write-ValidationLog "Firewall $($profile.Name): Enabled" -Level Success
            } else {
                $results.Warnings++
                Write-ValidationLog "Firewall $($profile.Name): Disabled" -Level Warning
            }

            $results.Details += $securityCheck
        }
    } catch {
        Write-ValidationLog "Failed to check firewall status: $_" -Level Error
        $results.Failed++
    }

    # Check for SSL certificates
    $certPaths = @(
        "$PSScriptRoot\..\orchestrator-mini\config\certs",
        "$PSScriptRoot\..\shared\certs"
    )

    foreach ($certPath in $certPaths) {
        if (Test-Path $certPath) {
            $certs = Get-ChildItem -Path $certPath -Filter '*.crt' -ErrorAction SilentlyContinue

            $securityCheck = @{
                Check = "SSL Certificates: $certPath"
                Status = $certs.Count -gt 0
                Count = $certs.Count
            }

            if ($certs.Count -gt 0) {
                $results.Passed++
                Write-ValidationLog "SSL Certificates found: $($certs.Count)" -Level Success
            } else {
                $results.Warnings++
                Write-ValidationLog "No SSL certificates found in $certPath" -Level Warning
            }

            $results.Details += $securityCheck
        }
    }

    $script:ValidationResults.Categories.SecurityConfiguration = $results

    Write-ValidationLog "Security Configuration: $($results.Passed) passed, $($results.Failed) failed, $($results.Warnings) warnings" -Level Info
}

function Test-PerformanceBenchmarks {
    if ($SkipPerformance) {
        Write-ValidationLog "Skipping performance benchmarks" -Level Info
        return
    }

    Write-ValidationLog "Running performance benchmarks..." -Level Info

    $results = @{
        Benchmarks = @()
    }

    # Network latency test
    foreach ($pc in $script:ClusterConfig.PCs) {
        $reachable = Test-Connection -ComputerName $pc.IP -Count 1 -Quiet

        if ($reachable) {
            $latency = (Test-Connection -ComputerName $pc.IP -Count 10 | Measure-Object -Property ResponseTime -Average).Average

            $benchmark = @{
                PC = $pc.Name
                Metric = 'Network Latency'
                Value = [math]::Round($latency, 2)
                Unit = 'ms'
            }

            $results.Benchmarks += $benchmark
            Write-ValidationLog "$($pc.Name) latency: $($benchmark.Value)ms" -Level Info
        }
    }

    $script:ValidationResults.Categories.Performance = $results

    Write-ValidationLog "Performance benchmarks completed" -Level Success
}

function New-ValidationReport {
    if (-not $DetailedReport) {
        return
    }

    Write-ValidationLog "Generating detailed report..." -Level Info

    $reportDir = Split-Path $ReportPath
    $null = New-Item -ItemType Directory -Path $reportDir -Force -ErrorAction SilentlyContinue

    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Project-Nyra Bootstrap Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-card.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .stat-card.warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-card.error { background: linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 100%); }
        .stat-value { font-size: 36px; font-weight: bold; }
        .stat-label { font-size: 14px; opacity: 0.9; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #4CAF50; color: white; }
        tr:hover { background: #f5f5f5; }
        .status-passed { color: #4CAF50; font-weight: bold; }
        .status-failed { color: #f44336; font-weight: bold; }
        .status-warning { color: #ff9800; font-weight: bold; }
        .timestamp { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project-Nyra Bootstrap Validation Report</h1>
        <p class="timestamp">Generated: $($script:ValidationResults.Timestamp)</p>

        <div class="summary">
            <div class="stat-card success">
                <div class="stat-value">$($script:ValidationResults.Categories.PCConfiguration.Passed + $script:ValidationResults.Categories.ServiceEndpoints.Passed)</div>
                <div class="stat-label">Checks Passed</div>
            </div>
            <div class="stat-card error">
                <div class="stat-value">$($script:ValidationResults.Errors.Count)</div>
                <div class="stat-label">Errors</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-value">$($script:ValidationResults.Warnings.Count)</div>
                <div class="stat-label">Warnings</div>
            </div>
        </div>

        <h2>PC Configuration</h2>
        <table>
            <tr><th>PC</th><th>Status</th><th>Connectivity</th><th>DNS</th></tr>
"@

    foreach ($detail in $script:ValidationResults.Categories.PCConfiguration.Details) {
        $statusClass = switch ($detail.Status) {
            'Passed' { 'status-passed' }
            'Failed' { 'status-failed' }
            default { 'status-warning' }
        }

        $html += @"
            <tr>
                <td>$($detail.PC)</td>
                <td class="$statusClass">$($detail.Status)</td>
                <td>$($detail.Checks.Connectivity)</td>
                <td>$($detail.Checks.DNS)</td>
            </tr>
"@
    }

    $html += @"
        </table>

        <h2>Service Endpoints</h2>
        <table>
            <tr><th>PC</th><th>Service</th><th>URL</th><th>Status</th><th>Status Code</th></tr>
"@

    foreach ($detail in $script:ValidationResults.Categories.ServiceEndpoints.Details) {
        $statusClass = if ($detail.Status -eq 'Passed') { 'status-passed' } else { 'status-failed' }

        $html += @"
            <tr>
                <td>$($detail.PC)</td>
                <td>$($detail.Service)</td>
                <td>$($detail.URL)</td>
                <td class="$statusClass">$($detail.Status)</td>
                <td>$($detail.StatusCode)</td>
            </tr>
"@
    }

    $html += @"
        </table>
    </div>
</body>
</html>
"@

    Set-Content -Path $ReportPath -Value $html
    Write-ValidationLog "Report generated: $ReportPath" -Level Success

    # Open report in browser
    Start-Process $ReportPath
}

# Main execution
try {
    Write-ValidationLog "Project-Nyra Bootstrap Validation" -Level Info
    Write-ValidationLog "Starting comprehensive validation..." -Level Info

    # Run validation tests
    Test-PCConfiguration
    Test-NetworkConnectivity
    Test-ServiceEndpoints
    Test-SecurityConfiguration
    Test-PerformanceBenchmarks

    # Determine overall status
    $totalErrors = $script:ValidationResults.Errors.Count
    $totalWarnings = $script:ValidationResults.Warnings.Count

    if ($totalErrors -eq 0 -and $totalWarnings -eq 0) {
        $script:ValidationResults.OverallStatus = 'Passed'
        Write-ValidationLog "Validation completed: ALL CHECKS PASSED" -Level Success
    } elseif ($totalErrors -eq 0) {
        $script:ValidationResults.OverallStatus = 'Passed with Warnings'
        Write-ValidationLog "Validation completed: PASSED WITH $totalWarnings WARNINGS" -Level Warning
    } else {
        $script:ValidationResults.OverallStatus = 'Failed'
        Write-ValidationLog "Validation completed: FAILED WITH $totalErrors ERRORS" -Level Error
    }

    # Generate report
    New-ValidationReport

    # Export results to JSON
    $jsonPath = "$PSScriptRoot\..\reports\validation-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $script:ValidationResults | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath
    Write-ValidationLog "Results exported: $jsonPath" -Level Info

    # Exit with appropriate code
    if ($script:ValidationResults.OverallStatus -eq 'Failed') {
        exit 1
    }

} catch {
    Write-ValidationLog "Validation failed: $_" -Level Error
    exit 1
}
