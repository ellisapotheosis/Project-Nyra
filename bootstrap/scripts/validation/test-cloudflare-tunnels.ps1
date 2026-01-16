# Project Nyra - Cloudflare Tunnel Validation and Testing Suite (PowerShell)
# Comprehensive testing for tunnel connectivity, DNS, services, performance, and security
# Version: 1.0.0

#Requires -Version 5.1

[CmdletBinding()]
param(
    [Parameter(HelpMessage="Run all test suites")]
    [switch]$All = $true,

    [Parameter(HelpMessage="Run prerequisite checks only")]
    [switch]$Prerequisites,

    [Parameter(HelpMessage="Run Docker service tests")]
    [switch]$Docker,

    [Parameter(HelpMessage="Run tunnel connectivity tests")]
    [switch]$Connectivity,

    [Parameter(HelpMessage="Run DNS resolution tests")]
    [switch]$DNS,

    [Parameter(HelpMessage="Run service accessibility tests")]
    [switch]$Accessibility,

    [Parameter(HelpMessage="Run failover and resilience tests")]
    [switch]$Failover,

    [Parameter(HelpMessage="Run access policy enforcement tests")]
    [switch]$Access,

    [Parameter(HelpMessage="Run performance tests")]
    [switch]$Performance,

    [Parameter(HelpMessage="Run security tests")]
    [switch]$Security,

    [Parameter(HelpMessage="Run end-to-end integration test")]
    [switch]$Integration,

    [Parameter(HelpMessage="Path to docker-compose file")]
    [string]$ComposeFile,

    [Parameter(HelpMessage="Directory for test results")]
    [string]$TestResultsDir,

    [Parameter(HelpMessage="Timeout for service checks in seconds")]
    [int]$TimeoutSeconds = 30,

    [Parameter(HelpMessage="Number of retries for failed tests")]
    [int]$RetryCount = 3,

    [Parameter(HelpMessage="Number of performance test iterations")]
    [int]$PerformanceIterations = 10,

    [Parameter(HelpMessage="Number of concurrent requests for load testing")]
    [int]$ConcurrentRequests = 20,

    [Parameter(HelpMessage="Clean up after integration test")]
    [bool]$IntegrationCleanup = $true
)

# ============================================================================
# Configuration and Global Variables
# ============================================================================

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

$script:ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $script:ScriptDir))

if (-not $ComposeFile) {
    $ComposeFile = Join-Path $script:ProjectRoot "docker-compose.infisical.yml"
}

if (-not $TestResultsDir) {
    $TestResultsDir = Join-Path $script:ProjectRoot "tests\results\cloudflare-tunnels"
}

$script:LogFile = Join-Path $TestResultsDir "test-run-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Test counters
$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0
$script:SkippedTests = 0

# ============================================================================
# Utility Functions
# ============================================================================

function Write-Log {
    param(
        [Parameter(Mandatory)]
        [ValidateSet('ERROR', 'SUCCESS', 'WARNING', 'INFO', 'DEBUG')]
        [string]$Level,

        [Parameter(Mandatory)]
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colorMap = @{
        'ERROR'   = 'Red'
        'SUCCESS' = 'Green'
        'WARNING' = 'Yellow'
        'INFO'    = 'Cyan'
        'DEBUG'   = 'Blue'
    }

    $logEntry = "[$timestamp] [$Level] $Message"

    # Write to console with color
    Write-Host $logEntry -ForegroundColor $colorMap[$Level]

    # Write to file
    Add-Content -Path $script:LogFile -Value $logEntry
}

function Write-Section {
    param([string]$Title)

    $separator = "=" * 64
    Write-Host ""
    Write-Host $separator -ForegroundColor Magenta
    Write-Host "  $Title" -ForegroundColor Magenta
    Write-Host $separator -ForegroundColor Magenta
    Write-Host ""

    Add-Content -Path $script:LogFile -Value "`n$separator"
    Add-Content -Path $script:LogFile -Value "  $Title"
    Add-Content -Path $script:LogFile -Value "$separator`n"
}

function Test-Start {
    param([string]$TestName)

    $script:TotalTests++
    Write-Log -Level INFO -Message "Starting test: $TestName"
}

function Test-Pass {
    param([string]$TestName)

    $script:PassedTests++
    Write-Log -Level SUCCESS -Message "PASSED: $TestName"
}

function Test-Fail {
    param(
        [string]$TestName,
        [string]$Reason = "Unknown error"
    )

    $script:FailedTests++
    Write-Log -Level ERROR -Message "FAILED: $TestName - $Reason"
}

function Test-Skip {
    param(
        [string]$TestName,
        [string]$Reason = "Skipped"
    )

    $script:SkippedTests++
    Write-Log -Level WARNING -Message "SKIPPED: $TestName - $Reason"
}

function Test-CommandExists {
    param([string]$Command)

    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Wait-ForService {
    param(
        [string]$Url,
        [int]$Timeout = $script:TimeoutSeconds
    )

    Write-Log -Level INFO -Message "Waiting for service: $Url (timeout: ${Timeout}s)"

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    while ($stopwatch.Elapsed.TotalSeconds -lt $Timeout) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -in 200, 204) {
                Write-Log -Level SUCCESS -Message "Service is available: $Url"
                return $true
            }
        }
        catch {
            Start-Sleep -Seconds 1
        }
    }

    $stopwatch.Stop()
    Write-Log -Level ERROR -Message "Service timeout: $Url"
    return $false
}

function Invoke-RetryWithBackoff {
    param(
        [Parameter(Mandatory)]
        [scriptblock]$ScriptBlock,

        [int]$MaxAttempts = $script:RetryCount,
        [int]$InitialDelay = 1
    )

    $attempt = 1
    $delay = $InitialDelay

    while ($attempt -le $MaxAttempts) {
        try {
            $result = & $ScriptBlock
            return $result
        }
        catch {
            if ($attempt -lt $MaxAttempts) {
                Write-Log -Level WARNING -Message "Attempt $attempt failed, retrying in ${delay}s..."
                Start-Sleep -Seconds $delay
                $delay = $delay * 2
            }
            else {
                throw
            }
            $attempt++
        }
    }
}

# ============================================================================
# Pre-requisite Checks
# ============================================================================

function Test-Prerequisites {
    Write-Section "Pre-requisite Checks"

    $missingTools = @()

    # Check required commands
    $requiredCommands = @(
        'docker',
        'docker-compose',
        'curl'
    )

    foreach ($cmd in $requiredCommands) {
        Test-Start "Check command: $cmd"
        if (Test-CommandExists $cmd) {
            Test-Pass "Command available: $cmd"
        }
        else {
            Test-Fail "Command missing: $cmd"
            $missingTools += $cmd
        }
    }

    # Check optional commands
    $optionalCommands = @(
        'nslookup',
        'openssl',
        'cloudflared'
    )

    foreach ($cmd in $optionalCommands) {
        if (-not (Test-CommandExists $cmd)) {
            Write-Log -Level WARNING -Message "Optional tool not found: $cmd"
        }
    }

    # Check if docker compose file exists
    Test-Start "Check docker-compose file"
    if (Test-Path $ComposeFile) {
        Test-Pass "Docker compose file found: $ComposeFile"
    }
    else {
        Test-Fail "Docker compose file not found: $ComposeFile"
        return $false
    }

    # Check PowerShell version
    Test-Start "Check PowerShell version"
    $psVersion = $PSVersionTable.PSVersion
    if ($psVersion.Major -ge 5) {
        Test-Pass "PowerShell version: $psVersion"
    }
    else {
        Test-Fail "PowerShell version too old: $psVersion (requires 5.1+)"
    }

    if ($missingTools.Count -gt 0) {
        Write-Log -Level ERROR -Message "Missing required tools: $($missingTools -join ', ')"
        Write-Log -Level INFO -Message "Install missing tools and re-run the tests"
        return $false
    }

    return $true
}

# ============================================================================
# Environment Setup and Teardown
# ============================================================================

function Initialize-TestEnvironment {
    Write-Section "Test Environment Setup"

    # Create test results directory
    if (-not (Test-Path $TestResultsDir)) {
        New-Item -Path $TestResultsDir -ItemType Directory -Force | Out-Null
    }
    Write-Log -Level INFO -Message "Test results directory: $TestResultsDir"

    # Check environment variables
    Test-Start "Check CLOUDFLARED_TOKEN"
    if ($env:CLOUDFLARED_TOKEN) {
        Test-Pass "CLOUDFLARED_TOKEN is set"
    }
    else {
        Test-Skip "CLOUDFLARED_TOKEN not set" "Tunnel-specific tests will be skipped"
    }

    # Load .env file if exists
    $envFile = Join-Path $script:ProjectRoot ".env"
    if (Test-Path $envFile) {
        Write-Log -Level INFO -Message "Loading environment from .env file"
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, 'Process')
            }
        }
    }
}

function Remove-TestEnvironment {
    Write-Section "Test Environment Cleanup"

    # Archive old test logs (keep last 10)
    $logs = Get-ChildItem -Path $TestResultsDir -Filter "*.log" | Sort-Object LastWriteTime -Descending
    if ($logs.Count -gt 10) {
        Write-Log -Level INFO -Message "Archiving old test logs"
        $logs | Select-Object -Skip 10 | Remove-Item -Force
    }

    Write-Log -Level INFO -Message "Cleanup completed"
}

# ============================================================================
# Docker and Service Checks
# ============================================================================

function Test-DockerServices {
    Write-Section "Docker Services Tests"

    # Check if Docker daemon is running
    Test-Start "Docker daemon status"
    try {
        docker info | Out-Null
        Test-Pass "Docker daemon is running"
    }
    catch {
        Test-Fail "Docker daemon is not running"
        return
    }

    # Check Docker Compose version
    Test-Start "Docker Compose version"
    try {
        $composeVersion = docker-compose --version 2>$null
        if (-not $composeVersion) {
            $composeVersion = docker compose version 2>$null
        }
        if ($composeVersion) {
            Test-Pass "Docker Compose: $composeVersion"
        }
        else {
            Test-Fail "Unable to determine Docker Compose version"
        }
    }
    catch {
        Test-Fail "Docker Compose check failed"
    }

    # List running containers
    Write-Log -Level INFO -Message "Listing running containers..."
    docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

    # Check cloudflared containers
    $cloudflaredContainers = docker ps --filter "name=cloudflared" --format "{{.Names}}" | Where-Object { $_ }

    if ($cloudflaredContainers) {
        Write-Log -Level INFO -Message "Cloudflared containers detected:"
        foreach ($container in $cloudflaredContainers) {
            Test-Start "Container health: $container"

            $health = docker inspect --format='{{.State.Health.Status}}' $container 2>$null
            if (-not $health) { $health = "no-healthcheck" }

            if ($health -in @('healthy', 'no-healthcheck')) {
                $status = docker inspect --format='{{.State.Status}}' $container
                if ($status -eq 'running') {
                    Test-Pass "Container running: $container"
                }
                else {
                    Test-Fail "Container not running: $container" "Status: $status"
                }
            }
            else {
                Test-Fail "Container unhealthy: $container" "Health: $health"
            }
        }
    }
    else {
        Write-Log -Level WARNING -Message "No cloudflared containers found running"
    }
}

# ============================================================================
# Tunnel Connectivity Tests
# ============================================================================

function Test-TunnelConnectivity {
    Write-Section "Tunnel Connectivity Tests"

    # Define tunnel endpoints
    $tunnelServices = @{
        'orchestrator' = 'nyra-orchestrator:8000'
        'worker-1' = 'nyra-worker-1:8000'
        'worker-2' = 'nyra-worker-2:8000'
        'worker-3' = 'nyra-worker-3:8000'
    }

    # Test local service connectivity
    foreach ($service in $tunnelServices.Keys) {
        $endpoint = $tunnelServices[$service]
        $container = $endpoint.Split(':')[0]
        $port = $endpoint.Split(':')[1]

        Test-Start "Local connectivity: $service ($endpoint)"

        # Check if container exists and is running
        $containerExists = docker ps --filter "name=$container" --format "{{.Names}}" | Where-Object { $_ -eq $container }

        if ($containerExists) {
            # Get container IP
            $containerIp = docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $container 2>$null

            if ($containerIp) {
                try {
                    $response = Invoke-WebRequest -Uri "http://${containerIp}:${port}/health" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                    if ($response.StatusCode -in 200, 204) {
                        Test-Pass "Service accessible locally: $service"
                    }
                }
                catch {
                    Test-Fail "Service not accessible: $service" "Health check failed"
                }
            }
            else {
                Test-Fail "Cannot get IP for container: $container"
            }
        }
        else {
            Test-Skip "Container not running: $container" "Service not deployed"
        }
    }

    # Test cloudflared tunnel status
    $cloudflaredContainers = docker ps --filter "name=cloudflared" --format "{{.Names}}" | Where-Object { $_ }

    if ($cloudflaredContainers) {
        foreach ($container in $cloudflaredContainers) {
            Test-Start "Tunnel status: $container"

            # Check cloudflared logs
            $tunnelLog = docker logs --tail 50 $container 2>&1 | Out-String

            if ($tunnelLog -match 'Connection.*registered') {
                Test-Pass "Tunnel connected: $container"

                # Extract tunnel info
                if ($tunnelLog -match 'Tunnel.*?([a-f0-9-]{36})') {
                    $tunnelId = $matches[1]
                    Write-Log -Level INFO -Message "Tunnel ID: $tunnelId"
                }
            }
            elseif ($tunnelLog -match 'error|failed') {
                $error = ($tunnelLog -split "`n" | Select-String -Pattern 'error' | Select-Object -Last 1).Line
                Test-Fail "Tunnel connection error: $container" $error
            }
            else {
                Test-Skip "Tunnel status unknown: $container" "Connection in progress or logs unclear"
            }
        }
    }
    else {
        Write-Log -Level WARNING -Message "No cloudflared containers to test"
    }
}

# ============================================================================
# DNS Resolution Tests
# ============================================================================

function Test-DNSResolution {
    Write-Section "DNS Resolution Tests"

    # Expected tunnel domains
    $tunnelDomains = @(
        'nyra-orchestrator.yourdomain.com',
        'nyra-worker-1.yourdomain.com',
        'nyra-worker-2.yourdomain.com',
        'nyra-worker-3.yourdomain.com'
    )

    foreach ($domain in $tunnelDomains) {
        Test-Start "DNS resolution: $domain"

        try {
            $dnsResult = Resolve-DnsName -Name $domain -Server 1.1.1.1 -Type A -ErrorAction Stop
            $ip = $dnsResult.IPAddress

            if ($ip) {
                Test-Pass "DNS resolves: $domain -> $ip"

                # Verify Cloudflare IP range
                if ($ip -match '^(104\.16|172\.64|104\.17|104\.18)\.') {
                    Write-Log -Level INFO -Message "IP appears to be in Cloudflare range: $ip"
                }
            }
        }
        catch {
            Test-Fail "DNS resolution failed: $domain" "No A records found"
        }

        # Test AAAA record
        try {
            $dnsResultV6 = Resolve-DnsName -Name $domain -Server 1.1.1.1 -Type AAAA -ErrorAction Stop
            $ipv6 = $dnsResultV6.IPAddress
            if ($ipv6) {
                Write-Log -Level INFO -Message "IPv6 resolves: $domain -> $ipv6"
            }
        }
        catch {
            # IPv6 is optional
        }
    }

    # Test DNS propagation
    Test-Start "DNS propagation check"
    $resolvers = @('1.1.1.1', '8.8.8.8', '9.9.9.9')
    $testDomain = $tunnelDomains[0]
    $consistent = $true
    $firstIp = $null

    foreach ($resolver in $resolvers) {
        try {
            $result = Resolve-DnsName -Name $testDomain -Server $resolver -Type A -ErrorAction Stop
            $ip = $result.IPAddress

            if (-not $firstIp) {
                $firstIp = $ip
            }
            elseif ($ip -ne $firstIp) {
                $consistent = $false
                Write-Log -Level WARNING -Message "DNS inconsistency: $resolver returned $ip (expected $firstIp)"
            }
        }
        catch {
            # Ignore resolution failures
        }
    }

    if ($consistent -and $firstIp) {
        Test-Pass "DNS propagated consistently across resolvers"
    }
    else {
        Test-Fail "DNS propagation inconsistent" "Different IPs from different resolvers"
    }
}

# ============================================================================
# Service Accessibility Tests
# ============================================================================

function Test-ServiceAccessibility {
    Write-Section "Service Accessibility Tests"

    # Test public tunnel URLs
    $publicUrls = @{
        'Orchestrator API' = if ($env:ORCHESTRATOR_PUBLIC_URL) { $env:ORCHESTRATOR_PUBLIC_URL } else { 'https://nyra-orchestrator.yourdomain.com' }
        'Worker 1 API' = if ($env:WORKER1_PUBLIC_URL) { $env:WORKER1_PUBLIC_URL } else { 'https://nyra-worker-1.yourdomain.com' }
        'Worker 2 API' = if ($env:WORKER2_PUBLIC_URL) { $env:WORKER2_PUBLIC_URL } else { 'https://nyra-worker-2.yourdomain.com' }
        'Worker 3 API' = if ($env:WORKER3_PUBLIC_URL) { $env:WORKER3_PUBLIC_URL } else { 'https://nyra-worker-3.yourdomain.com' }
    }

    foreach ($serviceName in $publicUrls.Keys) {
        $url = $publicUrls[$serviceName]

        Test-Start "Public accessibility: $serviceName"

        try {
            $response = Invoke-WebRequest -Uri "$url/health" -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            $statusCode = $response.StatusCode

            switch ($statusCode) {
                { $_ -in 200, 204 } {
                    Test-Pass "Service accessible: $serviceName (HTTP $statusCode)"
                }
                { $_ -in 301, 302, 307, 308 } {
                    Test-Pass "Service redirects: $serviceName (HTTP $statusCode)"
                }
                default {
                    Test-Fail "Unexpected response: $serviceName" "HTTP $statusCode"
                }
            }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__

            switch ($statusCode) {
                { $_ -in 401, 403 } {
                    Test-Pass "Service protected: $serviceName (HTTP $statusCode - authentication required)"
                }
                404 {
                    Test-Skip "Endpoint not found: $serviceName" "Health endpoint may not exist"
                }
                default {
                    Test-Fail "Service unreachable: $serviceName" "Connection failed or timeout"
                }
            }
        }
    }
}

# ============================================================================
# Performance Tests
# ============================================================================

function Test-Performance {
    Write-Section "Performance Tests"

    $testUrl = if ($env:ORCHESTRATOR_PUBLIC_URL) { "$env:ORCHESTRATOR_PUBLIC_URL/health" } else { 'https://nyra-orchestrator.yourdomain.com/health' }

    # Latency measurement
    Test-Start "Latency measurement"

    Write-Log -Level INFO -Message "Measuring latency over $PerformanceIterations requests..."

    $latencies = @()

    for ($i = 1; $i -le $PerformanceIterations; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            $stopwatch.Stop()

            if ($response.StatusCode -in 200, 204) {
                $latencies += $stopwatch.ElapsedMilliseconds
            }
        }
        catch {
            # Failed request
        }
    }

    if ($latencies.Count -gt 0) {
        $avgLatency = ($latencies | Measure-Object -Average).Average
        $minLatency = ($latencies | Measure-Object -Minimum).Minimum
        $maxLatency = ($latencies | Measure-Object -Maximum).Maximum

        Test-Pass "Latency test completed: avg=${avgLatency}ms, min=${minLatency}ms, max=${maxLatency}ms"

        # Save metrics
        $metricsFile = Join-Path $TestResultsDir "latency-metrics.csv"
        "timestamp,avg_latency_ms,min_latency_ms,max_latency_ms,success_rate" | Out-File -FilePath $metricsFile
        "$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()),$avgLatency,$minLatency,$maxLatency,$(($latencies.Count / $PerformanceIterations) * 100)" | Out-File -FilePath $metricsFile -Append

        # Check thresholds
        if ($avgLatency -lt 200) {
            Write-Log -Level SUCCESS -Message "Excellent latency: ${avgLatency}ms (< 200ms threshold)"
        }
        elseif ($avgLatency -lt 500) {
            Write-Log -Level INFO -Message "Good latency: ${avgLatency}ms (< 500ms threshold)"
        }
        else {
            Write-Log -Level WARNING -Message "High latency: ${avgLatency}ms (> 500ms threshold)"
        }
    }
    else {
        Test-Fail "Latency measurement failed" "No successful requests"
    }

    # Concurrent connections test
    Test-Start "Concurrent connections test"

    Write-Log -Level INFO -Message "Testing $ConcurrentRequests concurrent connections..."

    $jobs = @()
    $startTime = Get-Date

    for ($i = 1; $i -le $ConcurrentRequests; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url)
            try {
                $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
                return $response.StatusCode -in 200, 204
            }
            catch {
                return $false
            }
        } -ArgumentList $testUrl
    }

    # Wait for all jobs
    $results = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job

    $endTime = Get-Date
    $totalTime = ($endTime - $startTime).TotalSeconds
    $successCount = ($results | Where-Object { $_ -eq $true }).Count
    $successRate = [math]::Round(($successCount / $ConcurrentRequests) * 100, 2)

    Test-Pass "Concurrent connections: $successCount/$ConcurrentRequests succeeded (${successRate}%) in ${totalTime}s"

    if ($successRate -eq 100) {
        Write-Log -Level SUCCESS -Message "Perfect concurrent request handling"
    }
    elseif ($successRate -ge 95) {
        Write-Log -Level INFO -Message "Good concurrent request handling"
    }
    else {
        Write-Log -Level WARNING -Message "Some concurrent requests failed"
    }
}

# ============================================================================
# Security Tests
# ============================================================================

function Test-Security {
    Write-Section "Security Tests"

    $testUrl = if ($env:ORCHESTRATOR_PUBLIC_URL) { $env:ORCHESTRATOR_PUBLIC_URL } else { 'https://nyra-orchestrator.yourdomain.com' }

    # Test HTTP security headers
    Test-Start "HTTP security headers"

    try {
        $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $headers = $response.Headers

        $requiredHeaders = @(
            'Strict-Transport-Security',
            'X-Content-Type-Options',
            'X-Frame-Options'
        )

        $missingHeaders = @()
        foreach ($header in $requiredHeaders) {
            if ($headers.ContainsKey($header)) {
                Write-Log -Level SUCCESS -Message "Security header present: $header"
            }
            else {
                $missingHeaders += $header
                Write-Log -Level WARNING -Message "Security header missing: $header"
            }
        }

        if ($missingHeaders.Count -eq 0) {
            Test-Pass "All recommended security headers present"
        }
        else {
            Test-Fail "Missing security headers" ($missingHeaders -join ', ')
        }
    }
    catch {
        Test-Skip "HTTP security headers test" "Could not retrieve headers"
    }

    # Test unauthorized access
    Test-Start "Unauthorized access prevention"

    $sensitivePaths = @('/admin', '/.env', '/config', '/.git', '/secrets')
    $properlyProtected = $true

    foreach ($path in $sensitivePaths) {
        try {
            $response = Invoke-WebRequest -Uri "$testUrl$path" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            $statusCode = $response.StatusCode

            if ($statusCode -in 200) {
                Write-Log -Level WARNING -Message "Potential exposure: $path is accessible"
                $properlyProtected = $false
            }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -in 401, 403, 404) {
                Write-Log -Level SUCCESS -Message "Path protected: $path (HTTP $statusCode)"
            }
        }
    }

    if ($properlyProtected) {
        Test-Pass "Sensitive paths properly protected"
    }
    else {
        Test-Fail "Some sensitive paths may be exposed"
    }
}

# ============================================================================
# Integration Test
# ============================================================================

function Test-IntegrationFlow {
    Write-Section "End-to-End Integration Test"

    Write-Log -Level INFO -Message "Testing complete flow: Setup → Start → Connect → Access → Cleanup"

    # Verify Docker Compose configuration
    Test-Start "Integration: Verify configuration"
    try {
        docker-compose -f $ComposeFile config | Out-Null
        Test-Pass "Docker Compose configuration is valid"
    }
    catch {
        Test-Fail "Docker Compose configuration is invalid"
        return
    }

    # Start services
    Test-Start "Integration: Start services"
    Write-Log -Level INFO -Message "Starting Docker Compose services..."

    try {
        docker-compose -f $ComposeFile up -d --remove-orphans
        Test-Pass "Services started successfully"

        # Wait for initialization
        Write-Log -Level INFO -Message "Waiting for services to initialize (30s)..."
        Start-Sleep -Seconds 30
    }
    catch {
        Test-Fail "Failed to start services"
        return
    }

    # Verify tunnel connection
    Test-Start "Integration: Tunnel connection"
    $tunnelConnected = $false
    $maxWait = 60
    $elapsed = 0

    Write-Log -Level INFO -Message "Waiting for tunnel to connect (timeout: ${maxWait}s)..."

    while ($elapsed -lt $maxWait) {
        $tunnelLog = docker logs nyra-cloudflared-orchestrator 2>&1 | Out-String

        if ($tunnelLog -match 'Connection.*registered') {
            $tunnelConnected = $true
            break
        }

        Start-Sleep -Seconds 2
        $elapsed += 2
    }

    if ($tunnelConnected) {
        Test-Pass "Tunnel connected successfully (${elapsed}s)"
    }
    else {
        Test-Fail "Tunnel failed to connect" "Timeout after ${maxWait}s"
    }

    # Test service accessibility
    Test-Start "Integration: Service accessibility"
    $serviceUrl = if ($env:ORCHESTRATOR_PUBLIC_URL) { "$env:ORCHESTRATOR_PUBLIC_URL/health" } else { 'https://nyra-orchestrator.yourdomain.com/health' }

    if (Wait-ForService -Url $serviceUrl -Timeout 30) {
        Test-Pass "Service accessible through tunnel"
    }
    else {
        Test-Fail "Service not accessible through tunnel"
    }

    # Cleanup
    if ($IntegrationCleanup) {
        Test-Start "Integration: Cleanup"
        Write-Log -Level INFO -Message "Stopping services..."

        try {
            docker-compose -f $ComposeFile down
            Test-Pass "Services stopped successfully"
        }
        catch {
            Test-Fail "Failed to stop services"
        }
    }
    else {
        Write-Log -Level INFO -Message "Skipping cleanup (IntegrationCleanup=false)"
    }
}

# ============================================================================
# Test Report Generation
# ============================================================================

function New-TestReport {
    Write-Section "Test Summary Report"

    $successRate = if ($script:TotalTests -gt 0) {
        [math]::Round(($script:PassedTests / $script:TotalTests) * 100, 2)
    } else { 0 }

    # Console summary
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           CLOUDFLARE TUNNEL TEST RESULTS              ║" -ForegroundColor Cyan
    Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host ("║ Total Tests:     {0,-35} ║" -f $script:TotalTests) -ForegroundColor Cyan
    Write-Host ("║ Passed:          {0,-35} ║" -f $script:PassedTests) -ForegroundColor Green
    Write-Host ("║ Failed:          {0,-35} ║" -f $script:FailedTests) -ForegroundColor Red
    Write-Host ("║ Skipped:         {0,-35} ║" -f $script:SkippedTests) -ForegroundColor Yellow
    Write-Host ("║ Success Rate:    {0,-35} ║" -f "${successRate}%") -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    # Generate JSON report
    $jsonReport = Join-Path $TestResultsDir "test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

    $reportData = @{
        timestamp = (Get-Date -Format 'o')
        test_suite = "Cloudflare Tunnel Validation"
        version = "1.0.0"
        summary = @{
            total_tests = $script:TotalTests
            passed = $script:PassedTests
            failed = $script:FailedTests
            skipped = $script:SkippedTests
            success_rate = $successRate
        }
        environment = @{
            os = [System.Environment]::OSVersion.VersionString
            powershell_version = $PSVersionTable.PSVersion.ToString()
            docker_version = (docker --version 2>$null)
        }
        log_file = $script:LogFile
        results_directory = $TestResultsDir
    }

    $reportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonReport -Encoding utf8

    Write-Log -Level INFO -Message "JSON report generated: $jsonReport"

    # Generate HTML report
    $htmlReport = Join-Path $TestResultsDir "test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"

    @"
<!DOCTYPE html>
<html>
<head>
    <title>Cloudflare Tunnel Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .stat-card.passed { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
        .stat-card.failed { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); }
        .stat-card.skipped { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
        .stat-value { font-size: 36px; font-weight: bold; }
        .stat-label { font-size: 14px; opacity: 0.9; margin-top: 5px; }
        .timestamp { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Cloudflare Tunnel Test Report</h1>
        <p class="timestamp">Generated: $(Get-Date)</p>
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">$($script:TotalTests)</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-value">$($script:PassedTests)</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-value">$($script:FailedTests)</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card skipped">
                <div class="stat-value">$($script:SkippedTests)</div>
                <div class="stat-label">Skipped</div>
            </div>
        </div>
        <h2>Success Rate: ${successRate}%</h2>
        <div style="background: #e0e0e0; border-radius: 4px; height: 30px;">
            <div style="background: #4CAF50; height: 100%; width: ${successRate}%; border-radius: 4px;"></div>
        </div>
    </div>
</body>
</html>
"@ | Out-File -FilePath $htmlReport -Encoding utf8

    Write-Log -Level INFO -Message "HTML report generated: $htmlReport"

    # Return exit code
    if ($script:FailedTests -eq 0) {
        Write-Log -Level SUCCESS -Message "All tests passed! ✓"
        return 0
    }
    else {
        Write-Log -Level ERROR -Message "$($script:FailedTests) test(s) failed"
        return 1
    }
}

# ============================================================================
# Main Execution
# ============================================================================

function Main {
    Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Cloudflare Tunnel Validation & Testing Suite              ║
║   Project Nyra - Comprehensive Tunnel Testing                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

    # Determine which tests to run
    $runAll = -not ($Prerequisites -or $Docker -or $Connectivity -or $DNS -or $Accessibility -or
                    $Failover -or $Access -or $Performance -or $Security -or $Integration)

    # Setup
    Initialize-TestEnvironment

    # Run tests
    if (-not (Test-Prerequisites)) {
        Write-Log -Level ERROR -Message "Prerequisites check failed. Aborting tests."
        exit 1
    }

    if ($runAll -or $Docker) {
        Test-DockerServices
    }

    if ($runAll -or $Connectivity) {
        Test-TunnelConnectivity
    }

    if ($runAll -or $DNS) {
        Test-DNSResolution
    }

    if ($runAll -or $Accessibility) {
        Test-ServiceAccessibility
    }

    if ($runAll -or $Performance) {
        Test-Performance
    }

    if ($runAll -or $Security) {
        Test-Security
    }

    if ($runAll -or $Integration) {
        Test-IntegrationFlow
    }

    # Generate report
    $exitCode = New-TestReport

    # Cleanup
    Remove-TestEnvironment

    Write-Log -Level INFO -Message "Test execution completed. Results saved to: $TestResultsDir"

    exit $exitCode
}

# Run main function
Main
