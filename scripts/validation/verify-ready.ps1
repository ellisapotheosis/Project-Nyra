# ============================================
# Project Nyra - Pre-Start Verification Script
# ============================================
# Checks if system is ready to start services
# Run this before starting Docker services
# ============================================

Write-Host "`n🔍 Project Nyra - System Verification" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$allChecksPass = $true
$warnings = @()

# ============================================
# 1. CHECK DOCKER DESKTOP
# ============================================
Write-Host "1️⃣  Checking Docker Desktop..." -ForegroundColor Yellow

try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker Desktop is running (v$dockerVersion)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker Desktop is NOT running" -ForegroundColor Red
        Write-Host "      Start Docker Desktop and wait for it to fully load" -ForegroundColor Red
        $allChecksPass = $false
    }
} catch {
    Write-Host "   ❌ Docker Desktop is NOT running or not installed" -ForegroundColor Red
    Write-Host "      Install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    $allChecksPass = $false
}

# ============================================
# 2. CHECK DOCKER COMPOSE
# ============================================
Write-Host "`n2️⃣  Checking Docker Compose..." -ForegroundColor Yellow

try {
    $composeVersion = docker-compose version --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker Compose available (v$composeVersion)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker Compose not found" -ForegroundColor Red
        $allChecksPass = $false
    }
} catch {
    Write-Host "   ❌ Docker Compose not found" -ForegroundColor Red
    $allChecksPass = $false
}

# ============================================
# 3. CHECK REQUIRED FILES
# ============================================
Write-Host "`n3️⃣  Checking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    @{Path="infra\docker\docker-compose.orchestration.yml"; Name="Docker Compose file"},
    @{Path="infra\docker\.env"; Name="Docker environment file"},
    @{Path="infra\nexus\nexus-complete.toml"; Name="Nexus configuration"},
    @{Path="start-with-redis.ps1"; Name="Start script"}
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file.Path) {
        Write-Host "   ✅ Found: $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing: $($file.Name) at $($file.Path)" -ForegroundColor Red
        $allChecksPass = $false
    }
}

# ============================================
# 4. CHECK PORTS AVAILABLE
# ============================================
Write-Host "`n4️⃣  Checking port availability..." -ForegroundColor Yellow

$requiredPorts = @(
    @{Port=8000; Service="Nexus Router"},
    @{Port=3005; Service="Nexus Dashboard"},
    @{Port=9000; Service="Claude Flow"},
    @{Port=9001; Service="Archon OS"},
    @{Port=6379; Service="Redis"},
    @{Port=5432; Service="PostgreSQL"},
    @{Port=6380; Service="FalkorDB"},
    @{Port=6333; Service="Qdrant"}
)

foreach ($portCheck in $requiredPorts) {
    $port = $portCheck.Port
    $service = $portCheck.Service

    $netstat = netstat -ano | Select-String ":$port " -Quiet
    if ($netstat) {
        Write-Host "   ⚠️  Port $port in use ($service)" -ForegroundColor Yellow
        $warnings += "Port $port is already in use (needed for $service)"
    } else {
        Write-Host "   ✅ Port $port available ($service)" -ForegroundColor Green
    }
}

# ============================================
# 5. CHECK DISK SPACE
# ============================================
Write-Host "`n5️⃣  Checking disk space..." -ForegroundColor Yellow

$drive = Get-PSDrive C
$freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)

if ($freeSpaceGB -gt 10) {
    Write-Host "   ✅ Sufficient disk space: $freeSpaceGB GB free" -ForegroundColor Green
} elseif ($freeSpaceGB -gt 5) {
    Write-Host "   ⚠️  Low disk space: $freeSpaceGB GB free (10GB+ recommended)" -ForegroundColor Yellow
    $warnings += "Disk space is low ($freeSpaceGB GB free). 10GB+ recommended."
} else {
    Write-Host "   ❌ Insufficient disk space: $freeSpaceGB GB free (need at least 10GB)" -ForegroundColor Red
    $allChecksPass = $false
}

# ============================================
# 6. CHECK MEMORY
# ============================================
Write-Host "`n6️⃣  Checking system memory..." -ForegroundColor Yellow

$memory = Get-CimInstance Win32_OperatingSystem
$freeMemoryGB = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
$totalMemoryGB = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)

if ($freeMemoryGB -gt 8) {
    Write-Host "   ✅ Sufficient memory: $freeMemoryGB GB free (of $totalMemoryGB GB total)" -ForegroundColor Green
} elseif ($freeMemoryGB -gt 4) {
    Write-Host "   ⚠️  Low memory: $freeMemoryGB GB free (8GB+ recommended)" -ForegroundColor Yellow
    $warnings += "Available memory is low ($freeMemoryGB GB free). 8GB+ recommended."
} else {
    Write-Host "   ❌ Insufficient memory: $freeMemoryGB GB free (need at least 4GB)" -ForegroundColor Red
    $allChecksPass = $false
}

# ============================================
# 7. CHECK ENVIRONMENT VARIABLES
# ============================================
Write-Host "`n7️⃣  Checking critical environment variables..." -ForegroundColor Yellow

$envFile = "infra\docker\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw

    $criticalVars = @(
        "REDIS_PASSWORD",
        "NEXUS_REDIS_URL",
        "ANTHROPIC_API_KEY",
        "NEXUS_ROUTER_PORT",
        "NODE_ENV"
    )

    $missingVars = @()
    foreach ($var in $criticalVars) {
        if ($envContent -match "$var=.+") {
            Write-Host "   ✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $var is missing or empty" -ForegroundColor Red
            $missingVars += $var
            $allChecksPass = $false
        }
    }

    if ($missingVars.Count -gt 0) {
        Write-Host "`n   Missing critical variables: $($missingVars -join ', ')" -ForegroundColor Red
        Write-Host "   See INFISICAL-ENV-VARIABLES.md for required variables" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Environment file not found: $envFile" -ForegroundColor Red
    $allChecksPass = $false
}

# ============================================
# 8. CHECK EXISTING CONTAINERS
# ============================================
Write-Host "`n8️⃣  Checking for existing containers..." -ForegroundColor Yellow

try {
    $existingContainers = docker ps -a --filter "name=nyra-" --format "{{.Names}}" 2>&1
    if ($LASTEXITCODE -eq 0 -and $existingContainers) {
        Write-Host "   ⚠️  Found existing Nyra containers:" -ForegroundColor Yellow
        $existingContainers | ForEach-Object { Write-Host "      - $_" -ForegroundColor Yellow }
        $warnings += "Existing Nyra containers found. They will be recreated if needed."
    } else {
        Write-Host "   ✅ No existing Nyra containers" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not check for existing containers" -ForegroundColor Yellow
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

if ($allChecksPass) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "`nYour system is ready to start Project Nyra services.`n" -ForegroundColor Green

    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: .\start-with-redis.ps1" -ForegroundColor White
    Write-Host "2. Wait for services to start (30-60 seconds)" -ForegroundColor White
    Write-Host "3. Access Nexus Dashboard: http://localhost:3005" -ForegroundColor White
    Write-Host "`nFor detailed guide, see: START-HERE.md`n" -ForegroundColor Cyan

} else {
    Write-Host "❌ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host "`nPlease fix the issues above before starting services.`n" -ForegroundColor Red

    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Start Docker Desktop (most common issue)" -ForegroundColor White
    Write-Host "- Free up disk space (10GB+ recommended)" -ForegroundColor White
    Write-Host "- Close applications using required ports" -ForegroundColor White
    Write-Host "- Check environment variables in infra/docker/.env" -ForegroundColor White
    Write-Host "`nFor detailed troubleshooting, see: DOCKER-TROUBLESHOOTING.md`n" -ForegroundColor Cyan
}

# ============================================
# ADDITIONAL INFO
# ============================================
if ($allChecksPass) {
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "📚 Quick Reference" -ForegroundColor Cyan
    Write-Host "============================================`n" -ForegroundColor Cyan

    Write-Host "Service Endpoints (after start):" -ForegroundColor Yellow
    Write-Host "  Nexus Router:    http://localhost:8000" -ForegroundColor White
    Write-Host "  Nexus Dashboard: http://localhost:3005" -ForegroundColor White
    Write-Host "  Claude Flow:     http://localhost:9000" -ForegroundColor White
    Write-Host "  Archon OS:       http://localhost:9001" -ForegroundColor White

    Write-Host "`nVerification Commands:" -ForegroundColor Yellow
    Write-Host "  docker ps                    # Check running containers" -ForegroundColor White
    Write-Host "  docker logs nyra-nexus-router  # View Nexus Router logs" -ForegroundColor White
    Write-Host "  curl http://localhost:8000/health  # Test Nexus Router" -ForegroundColor White

    Write-Host "`nDocumentation:" -ForegroundColor Yellow
    Write-Host "  START-HERE.md              # Complete startup guide" -ForegroundColor White
    Write-Host "  DOCKER-TROUBLESHOOTING.md  # Docker issues" -ForegroundColor White
    Write-Host "  services/nexus-router/REDIS-SETUP.md  # Redis configuration" -ForegroundColor White
    Write-Host ""
}

# Exit with appropriate code
if ($allChecksPass) {
    exit 0
} else {
    exit 1
}
