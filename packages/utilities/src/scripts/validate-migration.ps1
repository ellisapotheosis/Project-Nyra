# Nyra Migration Validation Script
# Validates the Docker/WSL migration and tests all components

param(
    [switch]$Quick = $false,
    [switch]$Verbose = $false,
    [string]$TestSuite = "all"  # all, services, databases, mcp, networking
)

$ErrorActionPreference = "Stop"
$WarningPreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

Write-Host "🧪 Nyra Migration Validation Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Initialize test results
$TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Warnings = 0
    Details = @()
}

function Add-TestResult {
    param(
        [string]$Test,
        [string]$Status,  # Pass, Fail, Warning
        [string]$Message,
        [object]$Details = $null
    )

    $TestResults.Total++

    $result = @{
        Test = $Test
        Status = $Status
        Message = $Message
        Details = $Details
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }

    $TestResults.Details += $result

    switch ($Status) {
        "Pass" {
            $TestResults.Passed++
            if ($Verbose) { Write-Host "✅ $Test - $Message" -ForegroundColor Green }
        }
        "Fail" {
            $TestResults.Failed++
            Write-Host "❌ $Test - $Message" -ForegroundColor Red
        }
        "Warning" {
            $TestResults.Warnings++
            Write-Host "⚠️  $Test - $Message" -ForegroundColor Yellow
        }
    }
}

function Test-Prerequisites {
    Write-Host "🔍 Testing Prerequisites..." -ForegroundColor Yellow

    # Test WSL
    try {
        $wslVersion = wsl --version 2>$null
        if ($wslVersion) {
            Add-TestResult "WSL Installation" "Pass" "WSL is installed and accessible"
        } else {
            Add-TestResult "WSL Installation" "Fail" "WSL is not accessible"
        }
    } catch {
        Add-TestResult "WSL Installation" "Fail" "WSL command failed: $($_.Exception.Message)"
    }

    # Test Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Add-TestResult "Docker Installation" "Pass" "Docker is installed: $dockerVersion"
        } else {
            Add-TestResult "Docker Installation" "Fail" "Docker is not accessible"
        }
    } catch {
        Add-TestResult "Docker Installation" "Fail" "Docker command failed: $($_.Exception.Message)"
    }

    # Test Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($composeVersion) {
            Add-TestResult "Docker Compose" "Pass" "Docker Compose is available: $composeVersion"
        } else {
            Add-TestResult "Docker Compose" "Fail" "Docker Compose is not accessible"
        }
    } catch {
        Add-TestResult "Docker Compose" "Fail" "Docker Compose command failed: $($_.Exception.Message)"
    }

    # Test Docker daemon
    try {
        docker info >$null 2>&1
        Add-TestResult "Docker Daemon" "Pass" "Docker daemon is running"
    } catch {
        Add-TestResult "Docker Daemon" "Fail" "Docker daemon is not running"
    }
}

function Test-MigrationFiles {
    Write-Host "📁 Testing Migration Files..." -ForegroundColor Yellow

    $requiredFiles = @(
        "docker-compose.dev.yml",
        ".devcontainer/devcontainer.json",
        ".devcontainer/post-create.sh",
        ".devcontainer/post-start.sh",
        "infra/docker/dev/Dockerfile.dev",
        "docs/DOCKER_WSL_MIGRATION_ARCHITECTURE.md",
        "docs/MIGRATION_GUIDE.md"
    )

    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Add-TestResult "Migration File: $file" "Pass" "File exists"
        } else {
            Add-TestResult "Migration File: $file" "Fail" "File is missing"
        }
    }

    # Test Dockerfile integrity
    $dockerfiles = Get-ChildItem -Path "infra/docker" -Filter "Dockerfile.*" -Recurse
    foreach ($dockerfile in $dockerfiles) {
        try {
            $content = Get-Content $dockerfile.FullName
            if ($content -match "^FROM ") {
                Add-TestResult "Dockerfile: $($dockerfile.Name)" "Pass" "Valid Dockerfile format"
            } else {
                Add-TestResult "Dockerfile: $($dockerfile.Name)" "Warning" "No FROM instruction found"
            }
        } catch {
            Add-TestResult "Dockerfile: $($dockerfile.Name)" "Fail" "Failed to read file"
        }
    }
}

function Test-ContainerBuild {
    Write-Host "🔨 Testing Container Build..." -ForegroundColor Yellow

    if ($Quick) {
        Add-TestResult "Container Build" "Warning" "Skipped in quick mode"
        return
    }

    try {
        # Test building development container
        $buildOutput = docker-compose -f docker-compose.dev.yml build nyra-dev 2>&1
        if ($LASTEXITCODE -eq 0) {
            Add-TestResult "Development Container Build" "Pass" "Development container builds successfully"
        } else {
            Add-TestResult "Development Container Build" "Fail" "Build failed: $buildOutput"
        }
    } catch {
        Add-TestResult "Development Container Build" "Fail" "Build command failed: $($_.Exception.Message)"
    }
}

function Test-ServiceStartup {
    Write-Host "🚀 Testing Service Startup..." -ForegroundColor Yellow

    try {
        # Start core services
        Write-Host "   Starting services..." -ForegroundColor Gray
        docker-compose -f docker-compose.dev.yml up -d postgres falkordb chromadb 2>$null

        # Wait for services to initialize
        Start-Sleep -Seconds 30

        # Test PostgreSQL
        $pgReady = docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U nyra -d nyra_db 2>$null
        if ($LASTEXITCODE -eq 0) {
            Add-TestResult "PostgreSQL Startup" "Pass" "Database is ready"
        } else {
            Add-TestResult "PostgreSQL Startup" "Fail" "Database is not ready"
        }

        # Test FalkorDB
        $redisReady = docker-compose -f docker-compose.dev.yml exec -T falkordb redis-cli ping 2>$null
        if ($redisReady -match "PONG") {
            Add-TestResult "FalkorDB Startup" "Pass" "FalkorDB is responding"
        } else {
            Add-TestResult "FalkorDB Startup" "Fail" "FalkorDB is not responding"
        }

        # Test ChromaDB
        try {
            $chromaHealth = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/heartbeat" -TimeoutSec 10
            Add-TestResult "ChromaDB Startup" "Pass" "ChromaDB is healthy"
        } catch {
            Add-TestResult "ChromaDB Startup" "Fail" "ChromaDB health check failed"
        }

    } catch {
        Add-TestResult "Service Startup" "Fail" "Failed to start services: $($_.Exception.Message)"
    } finally {
        # Cleanup test services
        if (-not $Verbose) {
            docker-compose -f docker-compose.dev.yml down >$null 2>&1
        }
    }
}

function Test-NetworkConfiguration {
    Write-Host "🌐 Testing Network Configuration..." -ForegroundColor Yellow

    try {
        # Check if development network exists
        $networks = docker network ls --format "table {{.Name}}" | Where-Object { $_ -eq "nyra-dev-network" }
        if ($networks) {
            Add-TestResult "Docker Network" "Pass" "nyra-dev-network exists"
        } else {
            Add-TestResult "Docker Network" "Warning" "Network will be created on startup"
        }

        # Test port availability
        $requiredPorts = @(3000, 5432, 6379, 8000, 8001, 8003, 8004, 8005)
        foreach ($port in $requiredPorts) {
            try {
                $connection = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
                if ($connection.TcpTestSucceeded) {
                    Add-TestResult "Port $port" "Warning" "Port is in use - may conflict"
                } else {
                    Add-TestResult "Port $port" "Pass" "Port is available"
                }
            } catch {
                Add-TestResult "Port $port" "Pass" "Port is available"
            }
        }

    } catch {
        Add-TestResult "Network Configuration" "Fail" "Network test failed: $($_.Exception.Message)"
    }
}

function Test-EnvironmentConfiguration {
    Write-Host "⚙️ Testing Environment Configuration..." -ForegroundColor Yellow

    # Test .env.example exists
    if (Test-Path ".env.example") {
        Add-TestResult "Environment Template" "Pass" ".env.example exists"
    } else {
        Add-TestResult "Environment Template" "Warning" ".env.example not found"
    }

    # Test Infisical configuration
    if (Test-Path ".infisical.json") {
        try {
            $infisicalConfig = Get-Content ".infisical.json" | ConvertFrom-Json
            if ($infisicalConfig.workspaceId) {
                Add-TestResult "Infisical Configuration" "Pass" "Infisical workspace configured"
            } else {
                Add-TestResult "Infisical Configuration" "Warning" "Infisical workspace ID missing"
            }
        } catch {
            Add-TestResult "Infisical Configuration" "Fail" "Invalid Infisical configuration"
        }
    } else {
        Add-TestResult "Infisical Configuration" "Warning" "Infisical not configured"
    }

    # Test WSL configuration
    $wslConfigPath = "$env:USERPROFILE\.wslconfig"
    if (Test-Path $wslConfigPath) {
        Add-TestResult "WSL Configuration" "Pass" ".wslconfig exists"
    } else {
        Add-TestResult "WSL Configuration" "Warning" "Custom WSL configuration not found"
    }
}

function Test-VSCodeIntegration {
    Write-Host "💻 Testing VS Code Integration..." -ForegroundColor Yellow

    # Test devcontainer configuration
    if (Test-Path ".devcontainer/devcontainer.json") {
        try {
            $devContainer = Get-Content ".devcontainer/devcontainer.json" | ConvertFrom-Json
            if ($devContainer.name -and $devContainer.dockerComposeFile) {
                Add-TestResult "VS Code DevContainer" "Pass" "DevContainer configuration is valid"
            } else {
                Add-TestResult "VS Code DevContainer" "Fail" "DevContainer configuration is incomplete"
            }
        } catch {
            Add-TestResult "VS Code DevContainer" "Fail" "Invalid JSON in devcontainer.json"
        }
    } else {
        Add-TestResult "VS Code DevContainer" "Fail" "DevContainer configuration missing"
    }

    # Test if Remote-WSL extension can be detected (if VS Code is installed)
    try {
        $vscodePath = Get-Command "code" -ErrorAction SilentlyContinue
        if ($vscodePath) {
            Add-TestResult "VS Code Installation" "Pass" "VS Code is installed and in PATH"
        } else {
            Add-TestResult "VS Code Installation" "Warning" "VS Code not detected in PATH"
        }
    } catch {
        Add-TestResult "VS Code Installation" "Warning" "Could not detect VS Code installation"
    }
}

function Test-GitConfiguration {
    Write-Host "🔄 Testing Git Configuration..." -ForegroundColor Yellow

    try {
        # Test git repository
        $gitStatus = git status 2>$null
        if ($LASTEXITCODE -eq 0) {
            Add-TestResult "Git Repository" "Pass" "Git repository is valid"
        } else {
            Add-TestResult "Git Repository" "Fail" "Not a valid git repository"
        }

        # Test git configuration
        $gitUser = git config user.name 2>$null
        $gitEmail = git config user.email 2>$null

        if ($gitUser -and $gitEmail) {
            Add-TestResult "Git User Configuration" "Pass" "Git user configured: $gitUser <$gitEmail>"
        } else {
            Add-TestResult "Git User Configuration" "Warning" "Git user not fully configured"
        }

        # Test line ending configuration
        $autocrlf = git config core.autocrlf 2>$null
        if ($autocrlf -eq "false") {
            Add-TestResult "Git Line Endings" "Pass" "Line endings configured for cross-platform"
        } else {
            Add-TestResult "Git Line Endings" "Warning" "Line endings may cause issues in containers"
        }

    } catch {
        Add-TestResult "Git Configuration" "Fail" "Git test failed: $($_.Exception.Message)"
    }
}

# Main test execution
try {
    Write-Host ""

    # Run test suites based on parameter
    switch ($TestSuite.ToLower()) {
        "all" {
            Test-Prerequisites
            Test-MigrationFiles
            Test-EnvironmentConfiguration
            Test-NetworkConfiguration
            Test-VSCodeIntegration
            Test-GitConfiguration
            if (-not $Quick) {
                Test-ContainerBuild
                Test-ServiceStartup
            }
        }
        "services" {
            Test-Prerequisites
            Test-ContainerBuild
            Test-ServiceStartup
        }
        "databases" {
            Test-Prerequisites
            Test-ServiceStartup
        }
        "mcp" {
            Test-Prerequisites
            Test-MigrationFiles
        }
        "networking" {
            Test-Prerequisites
            Test-NetworkConfiguration
        }
        default {
            Write-Error "Unknown test suite: $TestSuite"
        }
    }

    # Display results
    Write-Host ""
    Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    Write-Host "Total Tests:   $($TestResults.Total)" -ForegroundColor White
    Write-Host "Passed:        $($TestResults.Passed)" -ForegroundColor Green
    Write-Host "Failed:        $($TestResults.Failed)" -ForegroundColor Red
    Write-Host "Warnings:      $($TestResults.Warnings)" -ForegroundColor Yellow

    $successRate = if ($TestResults.Total -gt 0) {
        [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 1)
    } else { 0 }
    Write-Host "Success Rate:  $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

    # Display detailed results if verbose
    if ($Verbose -and $TestResults.Failed -gt 0) {
        Write-Host ""
        Write-Host "❌ Failed Tests:" -ForegroundColor Red
        foreach ($result in $TestResults.Details | Where-Object { $_.Status -eq "Fail" }) {
            Write-Host "   $($result.Test): $($result.Message)" -ForegroundColor Red
        }
    }

    # Migration readiness assessment
    Write-Host ""
    if ($TestResults.Failed -eq 0) {
        Write-Host "🎉 Migration Ready!" -ForegroundColor Green
        Write-Host "Your environment is ready for Docker/WSL migration." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Run: .\scripts\migrate-to-wsl.ps1" -ForegroundColor White
        Write-Host "2. Open project in VS Code Remote-WSL" -ForegroundColor White
        Write-Host "3. Use 'Dev Containers: Rebuild and Reopen in Container'" -ForegroundColor White
    } elseif ($TestResults.Failed -le 2) {
        Write-Host "⚠️  Migration Possible with Fixes" -ForegroundColor Yellow
        Write-Host "Address the failed tests before migrating." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Migration Not Ready" -ForegroundColor Red
        Write-Host "Multiple issues need to be resolved before migration." -ForegroundColor Red
    }

    # Export detailed results if requested
    if ($Verbose) {
        $resultsPath = "migration-validation-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss').json"
        $TestResults | ConvertTo-Json -Depth 3 | Set-Content $resultsPath
        Write-Host ""
        Write-Host "📋 Detailed results exported to: $resultsPath" -ForegroundColor Gray
    }

} catch {
    Write-Error "Validation script failed: $($_.Exception.Message)"
    exit 1
}