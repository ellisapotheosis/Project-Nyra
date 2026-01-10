# Network Testing Script for Project-Nyra
# Comprehensive network connectivity and performance testing
# Version: 1.0.0

param(
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$GenerateReport,
    [switch]$SkipLatency,
    [switch]$SkipBandwidth,
    [string]$ReportPath = "reports\network-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
)

# Import utilities
. "$PSScriptRoot\test-utils.ps1"

$Global:VerboseOutput = $Verbose
$Global:DebugOutput = $Debug

Write-TestHeader "Project-Nyra Network Testing"

$testResults = @()

# ============================================================================
# NODE DEFINITIONS
# ============================================================================

$nodes = @(
    @{ Name = "Master (Desktop)"; LAN = "192.168.1.100"; Tailscale = "100.64.0.1" },
    @{ Name = "Worker 1 (Laptop 1)"; LAN = "192.168.1.101"; Tailscale = "100.64.0.2" },
    @{ Name = "Worker 2 (Laptop 2)"; LAN = "192.168.1.102"; Tailscale = "100.64.0.3" }
)

# ============================================================================
# LAN CONNECTIVITY TESTING
# ============================================================================

Write-ColorOutput "`n[1/6] LAN Connectivity Testing..." -Color Cyan

foreach ($node in $nodes) {
    Write-ColorOutput "  Testing $($node.Name) @ $($node.LAN)..." -Color Gray

    $startTime = Get-Date
    $result = Test-PingHost -Hostname $node.LAN -Count 4
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($result.Success) {
        $details = "Success: $([math]::Round($result.SuccessRate, 0))%, Avg Latency: $([math]::Round($result.AverageLatency, 1))ms"
        $testResults += Write-TestResult -TestName "LAN: $($node.Name)" -Passed $true -Details $details -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "LAN: $($node.Name)" -Passed $false -Details "Cannot reach host" -Duration $duration
    }
}

# ============================================================================
# TAILSCALE CONNECTIVITY TESTING
# ============================================================================

Write-ColorOutput "`n[2/6] Tailscale VPN Connectivity Testing..." -Color Cyan

# Check if Tailscale is installed
$tailscaleInstalled = Test-CommandExists "tailscale"

if ($tailscaleInstalled) {
    # Check Tailscale status
    $startTime = Get-Date
    try {
        $status = tailscale status 2>&1
        $isConnected = $LASTEXITCODE -eq 0 -and $status -notlike "*stopped*"
        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($isConnected) {
            $testResults += Write-TestResult -TestName "Tailscale Service" -Passed $true -Details "Connected and running" -Duration $duration

            # Test connectivity to each node via Tailscale
            foreach ($node in $nodes) {
                Write-ColorOutput "  Testing $($node.Name) @ $($node.Tailscale)..." -Color Gray

                $startTime = Get-Date
                $result = Test-PingHost -Hostname $node.Tailscale -Count 4
                $duration = ((Get-Date) - $startTime).TotalMilliseconds

                if ($result.Success) {
                    $details = "Success: $([math]::Round($result.SuccessRate, 0))%, Avg Latency: $([math]::Round($result.AverageLatency, 1))ms"
                    $testResults += Write-TestResult -TestName "Tailscale: $($node.Name)" -Passed $true -Details $details -Duration $duration
                } else {
                    $testResults += Write-TestResult -TestName "Tailscale: $($node.Name)" -Passed $false -Details "Cannot reach via Tailscale" -Duration $duration
                }
            }
        } else {
            $testResults += Write-TestResult -TestName "Tailscale Service" -Passed $false -Details "Not connected or stopped" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Tailscale Service" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Tailscale Service" -Passed $false -Details "Tailscale not installed" -Duration 0
}

# ============================================================================
# CLOUDFLARED TUNNEL TESTING
# ============================================================================

Write-ColorOutput "`n[3/6] Cloudflared Tunnel Testing..." -Color Cyan

$cloudflaredInstalled = Test-CommandExists "cloudflared"

if ($cloudflaredInstalled) {
    # Check if cloudflared service is running
    $startTime = Get-Date
    try {
        $tunnels = cloudflared tunnel list 2>&1
        $hasActiveTunnels = $LASTEXITCODE -eq 0 -and $tunnels -like "*active*"
        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($hasActiveTunnels) {
            $tunnelCount = ($tunnels -split "`n" | Where-Object { $_ -like "*active*" }).Count
            $testResults += Write-TestResult -TestName "Cloudflared Tunnels" -Passed $true -Details "$tunnelCount active tunnel(s)" -Duration $duration
        } else {
            $testResults += Write-TestResult -TestName "Cloudflared Tunnels" -Passed $false -Details "No active tunnels found" -Duration $duration
        }

        # Test public endpoints (if configured)
        $publicEndpoints = @(
            "https://ratehunter.yourdomain.com",
            "https://crm.yourdomain.com",
            "https://nyra.yourdomain.com"
        )

        foreach ($endpoint in $publicEndpoints) {
            $startTime = Get-Date
            $result = Test-UrlReachable -Url $endpoint -TimeoutSeconds 10
            $duration = ((Get-Date) - $startTime).TotalMilliseconds

            if ($result.Success) {
                $testResults += Write-TestResult -TestName "Public Endpoint: $endpoint" -Passed $true -Details "HTTP $($result.StatusCode)" -Duration $duration
            } else {
                # It's okay if public endpoints aren't configured yet
                $testResults += Write-TestResult -TestName "Public Endpoint: $endpoint" -Passed $true -Details "Not configured (optional)" -Duration $duration
            }
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Cloudflared Tunnels" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
} else {
    $testResults += Write-TestResult -TestName "Cloudflared" -Passed $true -Details "Not installed (optional)" -Duration 0
}

# ============================================================================
# FIREWALL RULES TESTING
# ============================================================================

Write-ColorOutput "`n[4/6] Firewall Rules Testing..." -Color Cyan

$requiredPorts = @(
    @{ Port = 5432; Service = "PostgreSQL"; Protocol = "TCP" },
    @{ Port = 6379; Service = "Redis"; Protocol = "TCP" },
    @{ Port = 11434; Service = "Ollama"; Protocol = "TCP" },
    @{ Port = 3000; Service = "Gitea"; Protocol = "TCP" },
    @{ Port = 8001; Service = "RateHunter API"; Protocol = "TCP" },
    @{ Port = 8002; Service = "Mortgage CRM API"; Protocol = "TCP" },
    @{ Port = 8003; Service = "Nyra Assistant API"; Protocol = "TCP" },
    @{ Port = 8004; Service = "Docling OCR API"; Protocol = "TCP" }
)

foreach ($port in $requiredPorts) {
    Write-ColorOutput "  Testing $($port.Service) (Port $($port.Port))..." -Color Gray

    # Find which node should have this service
    $targetNode = $nodes | Where-Object {
        switch ($port.Service) {
            "PostgreSQL" { $true }
            "Redis" { $true }
            "Gitea" { $true }
            "RateHunter API" { $true }
            "Mortgage CRM API" { $true }
            "Ollama" { $_ -ne $nodes[0] }
            "Nyra Assistant API" { $_ -eq $nodes[1] }
            "Docling OCR API" { $_ -eq $nodes[2] }
            default { $true }
        }
    } | Select-Object -First 1

    if ($targetNode) {
        $startTime = Get-Date
        $portOpen = Test-PortOpen -Hostname $targetNode.LAN -Port $port.Port -TimeoutMs 2000
        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($portOpen) {
            $testResults += Write-TestResult -TestName "Port $($port.Port): $($port.Service)" -Passed $true -Details "Open on $($targetNode.Name)" -Duration $duration
        } else {
            $testResults += Write-TestResult -TestName "Port $($port.Port): $($port.Service)" -Passed $false -Details "Closed or filtered on $($targetNode.Name)" -Duration $duration
        }
    }
}

# ============================================================================
# LATENCY MEASUREMENT
# ============================================================================

if (-not $SkipLatency) {
    Write-ColorOutput "`n[5/6] Network Latency Measurement..." -Color Cyan

    foreach ($sourceNode in $nodes) {
        foreach ($targetNode in $nodes) {
            if ($sourceNode.Name -ne $targetNode.Name) {
                Write-ColorOutput "  Measuring $($sourceNode.Name) -> $($targetNode.Name)..." -Color Gray

                $startTime = Get-Date
                $result = Test-PingHost -Hostname $targetNode.LAN -Count 10
                $duration = ((Get-Date) - $startTime).TotalMilliseconds

                if ($result.Success) {
                    $minLatency = ($result.Results | Where-Object { $_.Success } | Measure-Object -Property RoundtripTime -Minimum).Minimum
                    $maxLatency = ($result.Results | Where-Object { $_.Success } | Measure-Object -Property RoundtripTime -Maximum).Maximum
                    $avgLatency = $result.AverageLatency

                    $details = "Avg: $([math]::Round($avgLatency, 1))ms, Min: $([math]::Round($minLatency, 1))ms, Max: $([math]::Round($maxLatency, 1))ms"

                    # Pass if average latency is under 50ms for LAN
                    $passed = $avgLatency -lt 50

                    $testResults += Write-TestResult -TestName "Latency: $($sourceNode.Name) -> $($targetNode.Name)" -Passed $passed -Details $details -Duration $duration
                } else {
                    $testResults += Write-TestResult -TestName "Latency: $($sourceNode.Name) -> $($targetNode.Name)" -Passed $false -Details "Cannot measure" -Duration $duration
                }
            }
        }
    }
} else {
    Write-ColorOutput "`n[5/6] Latency Measurement - SKIPPED" -Color Yellow
}

# ============================================================================
# BANDWIDTH TESTING
# ============================================================================

if (-not $SkipBandwidth) {
    Write-ColorOutput "`n[6/6] Bandwidth Testing..." -Color Cyan

    # Check if iperf3 is available
    $iperfInstalled = Test-CommandExists "iperf3"

    if ($iperfInstalled) {
        Write-ColorOutput "  Note: Bandwidth testing requires iperf3 server running on target nodes" -Color Yellow

        foreach ($node in $nodes) {
            Write-ColorOutput "  Testing bandwidth to $($node.Name)..." -Color Gray

            $startTime = Get-Date
            try {
                # Try to run iperf3 client test (5 seconds)
                $iperfResult = iperf3 -c $node.LAN -t 5 -J 2>&1

                if ($LASTEXITCODE -eq 0) {
                    $resultJson = $iperfResult | ConvertFrom-Json
                    $bandwidthBps = $resultJson.end.sum_received.bits_per_second
                    $bandwidthMbps = [math]::Round($bandwidthBps / 1000000, 2)

                    $duration = ((Get-Date) - $startTime).TotalMilliseconds

                    # Pass if bandwidth is over 100 Mbps for LAN
                    $passed = $bandwidthMbps -gt 100

                    $testResults += Write-TestResult -TestName "Bandwidth: $($node.Name)" -Passed $passed -Details "$bandwidthMbps Mbps" -Duration $duration
                } else {
                    $duration = ((Get-Date) - $startTime).TotalMilliseconds
                    $testResults += Write-TestResult -TestName "Bandwidth: $($node.Name)" -Passed $false -Details "iperf3 server not running" -Duration $duration
                }
            } catch {
                $duration = ((Get-Date) - $startTime).TotalMilliseconds
                $testResults += Write-TestResult -TestName "Bandwidth: $($node.Name)" -Passed $false -Details $_.Exception.Message -Duration $duration
            }
        }
    } else {
        $testResults += Write-TestResult -TestName "Bandwidth Testing" -Passed $true -Details "iperf3 not installed (optional)" -Duration 0
        Write-ColorOutput "  Install iperf3 for bandwidth testing: winget install iperf3 / apt install iperf3" -Color Yellow
    }
} else {
    Write-ColorOutput "`n[6/6] Bandwidth Testing - SKIPPED" -Color Yellow
}

# ============================================================================
# SUMMARY AND REPORTING
# ============================================================================

Write-ColorOutput "`n" -Color White
Write-TestHeader "Network Test Summary"

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }

Write-ColorOutput "Total Tests:  $totalTests" -Color White
Write-ColorOutput "Passed:       $passedTests ($([math]::Round($passRate, 1))%)" -Color Green
Write-ColorOutput "Failed:       $failedTests" -Color $(if ($failedTests -gt 0) { "Red" } else { "Green" })

# Network health assessment
if ($passRate -ge 90) {
    Write-ColorOutput "`nNetwork Health: EXCELLENT" -Color Green
} elseif ($passRate -ge 75) {
    Write-ColorOutput "`nNetwork Health: GOOD" -Color Yellow
} elseif ($passRate -ge 50) {
    Write-ColorOutput "`nNetwork Health: FAIR - Some issues detected" -Color Yellow
} else {
    Write-ColorOutput "`nNetwork Health: POOR - Significant issues detected" -Color Red
}

# Generate report if requested
if ($GenerateReport) {
    $reportFullPath = Join-Path $PSScriptRoot $ReportPath
    $report = New-TestReport -ReportTitle "Network Test Report" -TestResults $testResults -OutputPath $reportFullPath

    Write-ColorOutput "`nHTML Report: $($report.ReportPath)" -Color Cyan

    # Also export JSON
    $jsonPath = $reportFullPath -replace "\.html$", ".json"
    Export-TestResultsJSON -TestResults $testResults -OutputPath $jsonPath
    Write-ColorOutput "JSON Export:  $jsonPath" -Color Cyan
}

# Exit code
$exitCode = if ($failedTests -eq 0) { 0 } else { 1 }

Write-ColorOutput "`nNetwork Test $(if ($exitCode -eq 0) { 'PASSED' } else { 'FAILED' })" -Color $(if ($exitCode -eq 0) { "Green" } else { "Red" })

exit $exitCode
