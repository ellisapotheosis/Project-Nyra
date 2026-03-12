# Bootstrap Validation Script for Project-Nyra
# Validates that all required tools and configurations are properly installed
# Version: 1.0.0

param(
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$GenerateReport,
    [string]$ReportPath = "reports\bootstrap-validation-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
)

# Import utilities
. "$PSScriptRoot\test-utils.ps1"

$Global:VerboseOutput = $Verbose
$Global:DebugOutput = $Debug

Write-TestHeader "Project-Nyra Bootstrap Validation"

$testResults = @()

# ============================================================================
# REQUIRED TOOLS VALIDATION
# ============================================================================

Write-ColorOutput "`n[1/8] Checking Required Tools..." -Color Cyan

$requiredTools = @(
    @{ Name = "git"; Description = "Git version control" },
    @{ Name = "docker"; Description = "Docker container runtime" },
    @{ Name = "docker-compose"; Description = "Docker Compose orchestration"; Alternative = "docker compose" },
    @{ Name = "node"; Description = "Node.js runtime" },
    @{ Name = "npm"; Description = "Node package manager" },
    @{ Name = "npx"; Description = "Node package executor" },
    @{ Name = "pwsh"; Description = "PowerShell Core"; Alternative = "powershell" },
    @{ Name = "psql"; Description = "PostgreSQL client"; Optional = $true },
    @{ Name = "redis-cli"; Description = "Redis client"; Optional = $true }
)

foreach ($tool in $requiredTools) {
    $startTime = Get-Date

    $exists = Test-CommandExists $tool.Name
    if (-not $exists -and $tool.Alternative) {
        $exists = Test-CommandExists $tool.Alternative
    }

    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($exists) {
        try {
            $versionCmd = "$($tool.Name) --version"
            $version = Invoke-Expression $versionCmd 2>&1 | Select-Object -First 1
            $details = "Version: $version"
        } catch {
            $details = "Installed"
        }

        $testResults += Write-TestResult -TestName "$($tool.Description)" -Passed $true -Details $details -Duration $duration
    } else {
        $level = if ($tool.Optional) { "WARN" } else { "ERROR" }
        $details = if ($tool.Optional) { "Optional tool not found" } else { "Required tool not found" }

        $testResults += Write-TestResult -TestName "$($tool.Description)" -Passed $tool.Optional -Details $details -Duration $duration
    }
}

# ============================================================================
# PATH VALIDATION
# ============================================================================

Write-ColorOutput "`n[2/8] Validating PATH Configuration..." -Color Cyan

$pathChecks = @(
    @{ Path = "C:\Program Files\Docker\Docker\resources\bin"; Description = "Docker binaries" },
    @{ Path = "$env:ProgramFiles\nodejs"; Description = "Node.js binaries" },
    @{ Path = "$env:USERPROFILE\.claude-flow\bin"; Description = "Claude Flow binaries"; Optional = $true }
)

$envPath = $env:PATH -split ";"

foreach ($check in $pathChecks) {
    $startTime = Get-Date

    $inPath = $envPath -contains $check.Path -or (Test-Path $check.Path)
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($inPath) {
        $testResults += Write-TestResult -TestName "PATH: $($check.Description)" -Passed $true -Details $check.Path -Duration $duration
    } else {
        $passed = if ($check.Optional) { $true } else { $false }
        $details = if ($check.Optional) { "Optional path not found: $($check.Path)" } else { "Required path not found: $($check.Path)" }

        $testResults += Write-TestResult -TestName "PATH: $($check.Description)" -Passed $passed -Details $details -Duration $duration
    }
}

# ============================================================================
# DOCKER VALIDATION
# ============================================================================

Write-ColorOutput "`n[3/8] Validating Docker Installation..." -Color Cyan

# Docker daemon running
$startTime = Get-Date
try {
    $dockerInfo = docker info 2>&1
    $dockerRunning = $LASTEXITCODE -eq 0
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($dockerRunning) {
        $testResults += Write-TestResult -TestName "Docker Daemon" -Passed $true -Details "Running" -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "Docker Daemon" -Passed $false -Details "Not running or not accessible" -Duration $duration
    }
} catch {
    $duration = ((Get-Date) - $startTime).TotalMilliseconds
    $testResults += Write-TestResult -TestName "Docker Daemon" -Passed $false -Details $_.Exception.Message -Duration $duration
}

# Docker Compose
$startTime = Get-Date
try {
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -ne 0) {
        $composeVersion = docker-compose --version 2>&1
    }

    $composeInstalled = $LASTEXITCODE -eq 0
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($composeInstalled) {
        $testResults += Write-TestResult -TestName "Docker Compose" -Passed $true -Details $composeVersion -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "Docker Compose" -Passed $false -Details "Not installed" -Duration $duration
    }
} catch {
    $duration = ((Get-Date) - $startTime).TotalMilliseconds
    $testResults += Write-TestResult -TestName "Docker Compose" -Passed $false -Details $_.Exception.Message -Duration $duration
}

# Docker networks
$startTime = Get-Date
try {
    $networks = docker network ls --format "{{.Name}}" 2>&1
    $hasNetworks = $LASTEXITCODE -eq 0
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($hasNetworks) {
        $networkCount = ($networks | Measure-Object).Count
        $testResults += Write-TestResult -TestName "Docker Networks" -Passed $true -Details "$networkCount networks found" -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "Docker Networks" -Passed $false -Details "Cannot list networks" -Duration $duration
    }
} catch {
    $duration = ((Get-Date) - $startTime).TotalMilliseconds
    $testResults += Write-TestResult -TestName "Docker Networks" -Passed $false -Details $_.Exception.Message -Duration $duration
}

# ============================================================================
# MCP SERVER VALIDATION
# ============================================================================

Write-ColorOutput "`n[4/8] Validating MCP Servers..." -Color Cyan

$mcpServers = @(
    @{ Name = "claude-flow"; Required = $true },
    @{ Name = "ruv-swarm"; Required = $false },
    @{ Name = "flow-nexus"; Required = $false }
)

foreach ($server in $mcpServers) {
    $startTime = Get-Date

    try {
        # Check if MCP server package is installed globally
        $checkCmd = "npm list -g $($server.Name) 2>&1"
        $installed = Invoke-Expression $checkCmd

        $isInstalled = $installed -notlike "*empty*" -and $installed -notlike "*ERR*"
        $duration = ((Get-Date) - $startTime).TotalMilliseconds

        if ($isInstalled) {
            # Try to get version
            $versionMatch = $installed | Select-String "($($server.Name)@[\d\.]+)"
            $version = if ($versionMatch) { $versionMatch.Matches[0].Value } else { "installed" }

            $testResults += Write-TestResult -TestName "MCP Server: $($server.Name)" -Passed $true -Details $version -Duration $duration
        } else {
            $passed = -not $server.Required
            $details = if ($server.Required) { "Required MCP server not installed" } else { "Optional MCP server not installed" }

            $testResults += Write-TestResult -TestName "MCP Server: $($server.Name)" -Passed $passed -Details $details -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $passed = -not $server.Required
        $testResults += Write-TestResult -TestName "MCP Server: $($server.Name)" -Passed $passed -Details $_.Exception.Message -Duration $duration
    }
}

# Test MCP server execution
$startTime = Get-Date
try {
    $mcpTest = npx claude-flow@alpha --version 2>&1
    $canExecute = $LASTEXITCODE -eq 0
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($canExecute) {
        $testResults += Write-TestResult -TestName "MCP Execution: claude-flow" -Passed $true -Details "Can execute via npx" -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "MCP Execution: claude-flow" -Passed $false -Details "Cannot execute via npx" -Duration $duration
    }
} catch {
    $duration = ((Get-Date) - $startTime).TotalMilliseconds
    $testResults += Write-TestResult -TestName "MCP Execution: claude-flow" -Passed $false -Details $_.Exception.Message -Duration $duration
}

# ============================================================================
# DOCKER SERVICES VALIDATION
# ============================================================================

Write-ColorOutput "`n[5/8] Validating Docker Services..." -Color Cyan

$dockerServices = @(
    @{ Name = "postgres"; Port = 5432 },
    @{ Name = "redis"; Port = 6379 },
    @{ Name = "ollama"; Port = 11434 },
    @{ Name = "gitea"; Port = 3000 }
)

foreach ($service in $dockerServices) {
    $startTime = Get-Date

    try {
        # Check if container exists
        $containerName = "nyra-$($service.Name)"
        $container = docker ps -a --filter "name=$containerName" --format "{{.Names}}" 2>&1

        if ($container -eq $containerName) {
            # Check if running
            $status = docker ps --filter "name=$containerName" --format "{{.Status}}" 2>&1
            $isRunning = $status -like "*Up*"

            $duration = ((Get-Date) - $startTime).TotalMilliseconds

            if ($isRunning) {
                $testResults += Write-TestResult -TestName "Docker Service: $($service.Name)" -Passed $true -Details "Running - $status" -Duration $duration
            } else {
                $testResults += Write-TestResult -TestName "Docker Service: $($service.Name)" -Passed $false -Details "Container exists but not running" -Duration $duration
            }
        } else {
            $duration = ((Get-Date) - $startTime).TotalMilliseconds
            $testResults += Write-TestResult -TestName "Docker Service: $($service.Name)" -Passed $false -Details "Container not found" -Duration $duration
        }
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $testResults += Write-TestResult -TestName "Docker Service: $($service.Name)" -Passed $false -Details $_.Exception.Message -Duration $duration
    }
}

# ============================================================================
# NETWORK CONNECTIVITY
# ============================================================================

Write-ColorOutput "`n[6/8] Testing Network Connectivity..." -Color Cyan

$networkTests = @(
    @{ Host = "8.8.8.8"; Description = "Internet connectivity (Google DNS)" },
    @{ Host = "github.com"; Description = "GitHub access" },
    @{ Host = "registry.npmjs.org"; Description = "NPM registry" },
    @{ Host = "hub.docker.com"; Description = "Docker Hub" }
)

foreach ($test in $networkTests) {
    $startTime = Get-Date

    $result = Test-PingHost -Hostname $test.Host -Count 2
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($result.Success) {
        $details = "Success Rate: $([math]::Round($result.SuccessRate, 0))%, Latency: $([math]::Round($result.AverageLatency, 0))ms"
        $testResults += Write-TestResult -TestName "Network: $($test.Description)" -Passed $true -Details $details -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "Network: $($test.Description)" -Passed $false -Details "Cannot reach host" -Duration $duration
    }
}

# ============================================================================
# CONFIGURATION FILES
# ============================================================================

Write-ColorOutput "`n[7/8] Checking Configuration Files..." -Color Cyan

$configFiles = @(
    @{ Path = "docker-compose.yml"; Required = $true },
    @{ Path = ".env"; Required = $true },
    @{ Path = "config\nyra-config.json"; Required = $false },
    @{ Path = "scripts\bootstrap.ps1"; Required = $false }
)

foreach ($file in $configFiles) {
    $startTime = Get-Date

    $fullPath = Join-Path $PSScriptRoot "..\$($file.Path)"
    $exists = Test-Path $fullPath

    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($exists) {
        $size = (Get-Item $fullPath).Length
        $testResults += Write-TestResult -TestName "Config: $($file.Path)" -Passed $true -Details "Found ($size bytes)" -Duration $duration
    } else {
        $passed = -not $file.Required
        $details = if ($file.Required) { "Required file not found" } else { "Optional file not found" }

        $testResults += Write-TestResult -TestName "Config: $($file.Path)" -Passed $passed -Details $details -Duration $duration
    }
}

# ============================================================================
# ENVIRONMENT VARIABLES
# ============================================================================

Write-ColorOutput "`n[8/8] Validating Environment Variables..." -Color Cyan

$envVars = @(
    "NYRA_ENV",
    "POSTGRES_PASSWORD",
    "REDIS_PASSWORD",
    "GITEA_ADMIN_PASSWORD"
)

foreach ($var in $envVars) {
    $startTime = Get-Date

    $value = [Environment]::GetEnvironmentVariable($var)
    $isSet = -not [string]::IsNullOrEmpty($value)

    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($isSet) {
        $maskedValue = if ($var -like "*PASSWORD*" -or $var -like "*SECRET*" -or $var -like "*KEY*") {
            "***" + $value.Substring($value.Length - 4)
        } else {
            $value
        }

        $testResults += Write-TestResult -TestName "Env Var: $var" -Passed $true -Details $maskedValue -Duration $duration
    } else {
        $testResults += Write-TestResult -TestName "Env Var: $var" -Passed $false -Details "Not set" -Duration $duration
    }
}

# ============================================================================
# SUMMARY AND REPORTING
# ============================================================================

Write-ColorOutput "`n" -Color White
Write-TestHeader "Validation Summary"

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }

Write-ColorOutput "Total Tests:  $totalTests" -Color White
Write-ColorOutput "Passed:       $passedTests ($([math]::Round($passRate, 1))%)" -Color Green
Write-ColorOutput "Failed:       $failedTests" -Color $(if ($failedTests -gt 0) { "Red" } else { "Green" })

# Generate report if requested
if ($GenerateReport) {
    $reportFullPath = Join-Path $PSScriptRoot $ReportPath
    $report = New-TestReport -ReportTitle "Bootstrap Validation Report" -TestResults $testResults -OutputPath $reportFullPath

    Write-ColorOutput "`nHTML Report: $($report.ReportPath)" -Color Cyan

    # Also export JSON
    $jsonPath = $reportFullPath -replace "\.html$", ".json"
    Export-TestResultsJSON -TestResults $testResults -OutputPath $jsonPath
    Write-ColorOutput "JSON Export:  $jsonPath" -Color Cyan
}

# Exit code
$exitCode = if ($failedTests -eq 0) { 0 } else { 1 }

Write-ColorOutput "`nValidation $(if ($exitCode -eq 0) { 'PASSED' } else { 'FAILED' })" -Color $(if ($exitCode -eq 0) { "Green" } else { "Red" })

exit $exitCode
