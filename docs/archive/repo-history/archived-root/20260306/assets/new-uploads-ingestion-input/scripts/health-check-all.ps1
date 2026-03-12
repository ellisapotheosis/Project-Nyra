# Health Check Script for All Project-Nyra Services
# Comprehensive health monitoring across all nodes
# Version: 1.0.0

param(
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$GenerateReport,
    [string]$ReportPath = "reports\health-check-$(Get-Date -Format 'yyyyMMdd-HHmmss').html",
    [string]$ConfigFile = "config\nodes.json"
)

# Import utilities
. "$PSScriptRoot\test-utils.ps1"

$Global:VerboseOutput = $Verbose
$Global:DebugOutput = $Debug

Write-TestHeader "Project-Nyra Health Check - All Services"

$testResults = @()

# ============================================================================
# LOAD NODE CONFIGURATION
# ============================================================================

Write-ColorOutput "`nLoading node configuration..." -Color Cyan

$nodes = @(
    @{
        Name = "Master (Desktop)"
        Host = "192.168.1.100"
        TailscaleIP = "100.64.0.1"
        Services = @("postgres", "redis", "gitea", "ratehunter", "crm")
    },
    @{
        Name = "Worker 1 (Laptop 1)"
        Host = "192.168.1.101"
        TailscaleIP = "100.64.0.2"
        Services = @("ollama", "nyra-assistant")
    },
    @{
        Name = "Worker 2 (Laptop 2)"
        Host = "192.168.1.102"
        TailscaleIP = "100.64.0.3"
        Services = @("ollama", "docling-ocr")
    }
)

# Try to load from config file if exists
$configPath = Join-Path $PSScriptRoot "..\$ConfigFile"
if (Test-Path $configPath) {
    try {
        $loadedNodes = Get-Content $configPath | ConvertFrom-Json
        if ($loadedNodes) {
            $nodes = $loadedNodes
            Write-TestLog "Loaded configuration from $configPath" -Level "INFO"
        }
    } catch {
        Write-TestLog "Could not load config file, using defaults: $_" -Level "WARN"
    }
}

Write-ColorOutput "Monitoring $($nodes.Count) nodes with $((($nodes | ForEach-Object { $_.Services.Count }) | Measure-Object -Sum).Sum) total services`n" -Color White

# ============================================================================
# POSTGRESQL HEALTH CHECK
# ============================================================================

Write-ColorOutput "`n[1/7] PostgreSQL Health Check..." -Color Cyan

$pgNodes = $nodes | Where-Object { $_.Services -contains "postgres" }

foreach ($node in $pgNodes) {
    Write-ColorOutput "  Checking $($node.Name)..." -Color Gray

    # Connection test
    $startTime = Get-Date
    $result = Test-PostgreSQLConnection -Host $node.Host -Port 5432 -Database "nyra_db" -Username "postgres" -Password $env:POSTGRES_PASSWORD
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($result.Success) {
        $testResults += Write-TestResult -TestName "PostgreSQL @ $($node.Name)" -Passed $true -Details "Connected - $($result.Version)" -Duration $duration

        # Additional checks
        try {
            # Check database size
            $dbSizeQuery = "SELECT pg_size_pretty(pg_database_size('nyra_db'));"
            $env:PGPASSWORD = $env:POSTGRES_PASSWORD
            $dbSize = & psql -h $node.Host -U postgres -d nyra_db -t -c $dbSizeQuery 2>&1
            Remove-Item Env:\PGPASSWORD

            if ($dbSize -and $dbSize -notlike "*error*") {
                $testResults += Write-TestResult -TestName "PostgreSQL Size @ $($node.Name)" -Passed $true -Details "Database: $($dbSize.Trim())" -Duration 0
            }

            # Check connections
            $connQuery = "SELECT count(*) FROM pg_stat_activity WHERE datname = 'nyra_db';"
            $env:PGPASSWORD = $env:POSTGRES_PASSWORD
            $connCount = & psql -h $node.Host -U postgres -d nyra_db -t -c $connQuery 2>&1
            Remove-Item Env:\PGPASSWORD

            if ($connCount -and $connCount -notlike "*error*") {
                $testResults += Write-TestResult -TestName "PostgreSQL Connections @ $($node.Name)" -Passed $true -Details "$($connCount.Trim()) active connections" -Duration 0
            }
        } catch {
            Write-TestLog "Additional PostgreSQL checks failed: $_" -Level "WARN"
        }
    } else {
        $testResults += Write-TestResult -TestName "PostgreSQL @ $($node.Name)" -Passed $false -Details $result.Error -Duration $duration
    }
}

# ============================================================================
# REDIS HEALTH CHECK
# ============================================================================

Write-ColorOutput "`n[2/7] Redis Health Check..." -Color Cyan

$redisNodes = $nodes | Where-Object { $_.Services -contains "redis" }

foreach ($node in $redisNodes) {
    Write-ColorOutput "  Checking $($node.Name)..." -Color Gray

    # Connection test
    $startTime = Get-Date
    $result = Test-RedisConnection -Host $node.Host -Port 6379 -Password $env:REDIS_PASSWORD
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($result.Success) {
        $testResults += Write-TestResult -TestName "Redis @ $($node.Name)" -Passed $true -Details "PONG received" -Duration $duration

        # Additional checks
        try {
            if (Test-CommandExists "redis-cli") {
                # Get Redis info
                $infoCmd = if ($env:REDIS_PASSWORD) {
                    "redis-cli -h $($node.Host) -a $env:REDIS_PASSWORD INFO server"
                } else {
                    "redis-cli -h $($node.Host) INFO server"
                }

                $info = Invoke-Expression $infoCmd 2>&1 | Select-String "redis_version"

                if ($info) {
                    $version = $info -replace "redis_version:", ""
                    $testResults += Write-TestResult -TestName "Redis Version @ $($node.Name)" -Passed $true -Details "Redis $($version.Trim())" -Duration 0
                }

                # Get memory usage
                $memCmd = if ($env:REDIS_PASSWORD) {
                    "redis-cli -h $($node.Host) -a $env:REDIS_PASSWORD INFO memory"
                } else {
                    "redis-cli -h $($node.Host) INFO memory"
                }

                $memInfo = Invoke-Expression $memCmd 2>&1 | Select-String "used_memory_human"

                if ($memInfo) {
                    $memory = $memInfo -replace "used_memory_human:", ""
                    $testResults += Write-TestResult -TestName "Redis Memory @ $($node.Name)" -Passed $true -Details "Using $($memory.Trim())" -Duration 0
                }
            }
        } catch {
            Write-TestLog "Additional Redis checks failed: $_" -Level "WARN"
        }
    } else {
        $testResults += Write-TestResult -TestName "Redis @ $($node.Name)" -Passed $false -Details $result.Error -Duration $duration
    }
}

# ============================================================================
# OLLAMA HEALTH CHECK
# ============================================================================

Write-ColorOutput "`n[3/7] Ollama Health Check..." -Color Cyan

$ollamaNodes = $nodes | Where-Object { $_.Services -contains "ollama" }

foreach ($node in $ollamaNodes) {
    Write-ColorOutput "  Checking $($node.Name)..." -Color Gray

    # API health check
    $startTime = Get-Date
    $url = "http://$($node.Host):11434/api/tags"

    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10 -ErrorAction Stop
        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        $modelCount = $response.models.Count
        $testResults += Write-TestResult -TestName "Ollama API @ $($node.Name)" -Passed $true -Details "$modelCount models available" -Duration $duration

        # List models
        if ($modelCount -gt 0) {
            $modelNames = $response.models | ForEach-Object { $_.name } | Select-Object -First 3
            $modelList = $modelNames -join ", "
            $testResults += Write-TestResult -TestName "Ollama Models @ $($node.Name)" -Passed $true -Details "Models: $modelList" -Duration 0
        }

        # Test GPU availability (if applicable)
        try {
            $versionUrl = "http://$($node.Host):11434/api/version"
            $version = Invoke-RestMethod -Uri $versionUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
            $testResults += Write-TestResult -TestName "Ollama Version @ $($node.Name)" -Passed $true -Details $version.version -Duration 0
        } catch {
            Write-TestLog "Could not get Ollama version: $_" -Level "WARN"
        }

    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Ollama API @ $($node.Name)" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
}

# ============================================================================
# GITEA HEALTH CHECK
# ============================================================================

Write-ColorOutput "`n[4/7] Gitea Health Check..." -Color Cyan

$giteaNodes = $nodes | Where-Object { $_.Services -contains "gitea" }

foreach ($node in $giteaNodes) {
    Write-ColorOutput "  Checking $($node.Name)..." -Color Gray

    # API health check
    $startTime = Get-Date
    $url = "http://$($node.Host):3000/api/v1/version"

    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10 -ErrorAction Stop
        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        $testResults += Write-TestResult -TestName "Gitea API @ $($node.Name)" -Passed $true -Details "Version: $($response.version)" -Duration $duration

        # Check if web interface is accessible
        $webUrl = "http://$($node.Host):3000"
        $webCheck = Test-UrlReachable -Url $webUrl -TimeoutSeconds 5

        if ($webCheck.Success) {
            $testResults += Write-TestResult -TestName "Gitea Web @ $($node.Name)" -Passed $true -Details "Web interface accessible" -Duration 0
        } else {
            $testResults += Write-TestResult -TestName "Gitea Web @ $($node.Name)" -Passed $false -Details "Web interface not accessible" -Duration 0
        }

    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Gitea API @ $($node.Name)" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
}

# ============================================================================
# MCP SERVER HEALTH CHECK
# ============================================================================

Write-ColorOutput "`n[5/7] MCP Server Health Check..." -Color Cyan

$mcpServers = @("claude-flow", "ruv-swarm", "flow-nexus")

foreach ($server in $mcpServers) {
    Write-ColorOutput "  Checking $server..." -Color Gray

    $startTime = Get-Date

    try {
        # Try to execute MCP server with --help to verify it's working
        $testCmd = "npx $server@latest --help"
        $output = Invoke-Expression $testCmd 2>&1

        $success = $LASTEXITCODE -eq 0 -or $output -like "*Usage*" -or $output -like "*Commands*"
        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($success) {
            $testResults += Write-TestResult -TestName "MCP: $server" -Passed $true -Details "Executable and responsive" -Duration $duration
        } else {
            $testResults += Write-TestResult -TestName "MCP: $server" -Passed $false -Details "Not responding correctly" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "MCP: $server" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
}

# ============================================================================
# DOCKER CONTAINER HEALTH CHECK
# ============================================================================

Write-ColorOutput "`n[6/7] Docker Container Health Check..." -Color Cyan

try {
    $containers = docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}" 2>&1

    if ($LASTEXITCODE -eq 0) {
        $containerList = $containers -split "`n" | Where-Object { $_ }

        foreach ($container in $containerList) {
            $parts = $container -split "\|"
            $name = $parts[0]
            $status = $parts[1]
            $ports = if ($parts.Count -gt 2) { $parts[2] } else { "N/A" }

            $isHealthy = $status -like "*Up*" -and $status -notlike "*(unhealthy)*"

            $details = "Status: $status"
            if ($ports -ne "N/A") {
                $details += " | Ports: $ports"
            }

            $testResults += Write-TestResult -TestName "Container: $name" -Passed $isHealthy -Details $details -Duration 0
        }

        Write-TestLog "Checked $($containerList.Count) Docker containers" -Level "INFO"
    } else {
        $testResults += Write-TestResult -TestName "Docker Containers" -Passed $false -Details "Cannot list containers - Docker may not be running" -Duration 0
    }
} catch {
    $testResults += Write-TestResult -TestName "Docker Containers" -Passed $false -Details $_.Exception.Message -Duration 0
}

# ============================================================================
# APPLICATION ENDPOINT HEALTH CHECK
# ============================================================================

Write-ColorOutput "`n[7/7] Application Endpoint Health Check..." -Color Cyan

$endpoints = @(
    @{ Name = "RateHunter API"; Url = "http://192.168.1.100:8001/health" },
    @{ Name = "Mortgage CRM API"; Url = "http://192.168.1.100:8002/health" },
    @{ Name = "Nyra Assistant API"; Url = "http://192.168.1.101:8003/health" },
    @{ Name = "Docling OCR API"; Url = "http://192.168.1.102:8004/health" }
)

foreach ($endpoint in $endpoints) {
    Write-ColorOutput "  Checking $($endpoint.Name)..." -Color Gray

    $startTime = Get-Date
    $result = Test-UrlReachable -Url $endpoint.Url -TimeoutSeconds 5
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($result.Success) {
        $testResults += Write-TestResult -TestName $endpoint.Name -Passed $true -Details "HTTP $($result.StatusCode)" -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName $endpoint.Name -Passed $false -Details $result.Error -Duration $duration
    }
}

# ============================================================================
# SUMMARY AND REPORTING
# ============================================================================

Write-ColorOutput "`n" -Color White
Write-TestHeader "Health Check Summary"

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }

Write-ColorOutput "Total Checks: $totalTests" -Color White
Write-ColorOutput "Healthy:      $passedTests ($([math]::Round($passRate, 1))%)" -Color Green
Write-ColorOutput "Unhealthy:    $failedTests" -Color $(if ($failedTests -gt 0) { "Red" } else { "Green" })

# Critical services check
$criticalServices = @("PostgreSQL", "Redis", "Ollama API")
$criticalFailed = $testResults | Where-Object {
    -not $_.Passed -and ($criticalServices | Where-Object { $_.Name -like "*$_*" })
}

if ($criticalFailed) {
    Write-ColorOutput "`nWARNING: Critical services are down!" -Color Red
    $criticalFailed | ForEach-Object {
        Write-ColorOutput "  - $($_.Name)" -Color Red
    }
}

# Generate report if requested
if ($GenerateReport) {
    $reportFullPath = Join-Path $PSScriptRoot $ReportPath
    $report = New-TestReport -ReportTitle "Health Check Report" -TestResults $testResults -OutputPath $reportFullPath

    Write-ColorOutput "`nHTML Report: $($report.ReportPath)" -Color Cyan

    # Also export JSON
    $jsonPath = $reportFullPath -replace "\.html$", ".json"
    Export-TestResultsJSON -TestResults $testResults -OutputPath $jsonPath
    Write-ColorOutput "JSON Export:  $jsonPath" -Color Cyan
}

# Exit code
$exitCode = if ($failedTests -eq 0) { 0 } else { 1 }

Write-ColorOutput "`nHealth Check $(if ($exitCode -eq 0) { 'PASSED' } else { 'FAILED' })" -Color $(if ($exitCode -eq 0) { "Green" } else { "Red" })

exit $exitCode
