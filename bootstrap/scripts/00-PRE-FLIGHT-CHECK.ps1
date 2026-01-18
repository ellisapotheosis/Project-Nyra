# Project Nyra - Pre-Flight Bootstrap Readiness Check
# Version: 1.0.0
# Purpose: Validate all dependencies before bootstrapping any PC

param(
    [switch]$Verbose,
    [switch]$SkipGPUCheck  # For orchestrator PC without GPU
)

$ErrorActionPreference = 'SilentlyContinue'

# Color output functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

Write-Host "`n🔍 PROJECT NYRA - PRE-FLIGHT BOOTSTRAP CHECK`n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$results = @{
    Critical = @()
    Warnings = @()
    Info = @()
    Passed = @()
}

# ============================================================================
# PHASE 1: DOCKER INFRASTRUCTURE
# ============================================================================
Write-Host "`n📦 PHASE 1: Docker Infrastructure" -ForegroundColor Yellow

# Docker Desktop availability
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion -match '(\d+)\.(\d+)\.(\d+)') {
        $major = [int]$Matches[1]
        if ($major -ge 24) {
            Write-Success "Docker Desktop $dockerVersion"
            $results.Passed += "Docker Desktop version compatible"
        } else {
            Write-Warning "Docker $dockerVersion (recommend v24.0+)"
            $results.Warnings += "Docker version older than recommended"
        }
    }
} catch {
    Write-Failure "Docker Desktop NOT installed"
    $results.Critical += "Docker Desktop missing - Install from https://docker.com"
}

# Docker daemon running
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker daemon running"
        $results.Passed += "Docker daemon active"
    } else {
        Write-Failure "Docker daemon not running"
        $results.Critical += "Docker daemon stopped - Start Docker Desktop"
    }
} catch {
    Write-Failure "Cannot connect to Docker daemon"
    $results.Critical += "Docker daemon unreachable"
}

# Docker Compose v2
try {
    $composeVersion = docker compose version 2>$null
    if ($composeVersion -match '(\d+)\.(\d+)\.(\d+)') {
        $major = [int]$Matches[1]
        if ($major -ge 2) {
            Write-Success "Docker Compose v2 available"
            $results.Passed += "Docker Compose v2 installed"
        } else {
            Write-Warning "Docker Compose v1 detected (v2 recommended)"
            $results.Warnings += "Upgrade to Docker Compose v2"
        }
    }
} catch {
    Write-Failure "Docker Compose not available"
    $results.Critical += "Docker Compose missing"
}

# ============================================================================
# PHASE 2: GPU & NVIDIA (Skip for orchestrator)
# ============================================================================
if (-not $SkipGPUCheck) {
    Write-Host "`n🎮 PHASE 2: GPU & NVIDIA Drivers" -ForegroundColor Yellow
    
    # NVIDIA driver
    try {
        $nvidiaOutput = nvidia-smi --query-gpu=driver_version,name,memory.total --format=csv,noheader 2>$null
        if ($LASTEXITCODE -eq 0 -and $nvidiaOutput) {
            $driverInfo = $nvidiaOutput -split ','
            $driverVersion = $driverInfo[0].Trim()
            $gpuName = $driverInfo[1].Trim()
            $gpuMemory = $driverInfo[2].Trim()
            
            # Parse version
            if ($driverVersion -match '(\d+)\.(\d+)') {
                $driverMajor = [int]$Matches[1]
                
                if ($driverMajor -ge 525) {
                    Write-Success "NVIDIA Driver $driverVersion (CUDA 12.0+ compatible)"
                    Write-Success "GPU: $gpuName ($gpuMemory)"
                    $results.Passed += "NVIDIA driver compatible with CUDA 12.0+"
                } else {
                    Write-Warning "NVIDIA Driver $driverVersion (recommend 525.60+)"
                    $results.Warnings += "Upgrade NVIDIA driver to 525.60+ for CUDA 12.0"
                }
            }
        } else {
            Write-Failure "nvidia-smi command failed"
            $results.Critical += "NVIDIA GPU not detected or drivers not installed"
        }
    } catch {
        Write-Failure "NVIDIA drivers not found"
        $results.Critical += "Install NVIDIA GPU drivers from nvidia.com"
    }
    
    # NVIDIA Container Toolkit (for Docker GPU access)
    try {
        docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "NVIDIA Container Toolkit configured"
            $results.Passed += "Docker can access GPU"
        } else {
            Write-Failure "NVIDIA Container Toolkit not configured"
            $results.Critical += "Install NVIDIA Container Toolkit for Docker GPU access"
        }
    } catch {
        Write-Warning "Could not test NVIDIA Container Toolkit"
        $results.Warnings += "Verify NVIDIA Container Toolkit after Docker starts"
    }
} else {
    Write-Host "`n🎮 PHASE 2: GPU Check Skipped (Orchestrator PC)" -ForegroundColor Gray
    $results.Info += "GPU check skipped - orchestrator doesn't need GPU"
}

# ============================================================================
# PHASE 3: SECRETS MANAGEMENT
# ============================================================================
Write-Host "`n🔐 PHASE 3: Secrets Management" -ForegroundColor Yellow

# Infisical CLI
try {
    $infisicalVersion = infisical --version 2>$null
    if ($infisicalVersion) {
        Write-Success "Infisical CLI installed ($infisicalVersion)"
        $results.Passed += "Infisical CLI available"
    } else {
        Write-Failure "Infisical CLI not found"
        $results.Critical += "Install Infisical CLI: winget install infisical"
    }
} catch {
    Write-Failure "Infisical CLI not installed"
    $results.Critical += "Install Infisical CLI: winget install infisical"
}

# Check if logged into Infisical
try {
    infisical user 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Infisical authenticated"
        $results.Passed += "Infisical login verified"
    } else {
        Write-Warning "Not logged into Infisical"
        $results.Warnings += "Run 'infisical login' before bootstrap"
    }
} catch {
    Write-Warning "Could not verify Infisical authentication"
    $results.Warnings += "Verify Infisical login: infisical user"
}

# ============================================================================
# PHASE 4: REQUIRED PORTS AVAILABILITY
# ============================================================================
Write-Host "`n🔌 PHASE 4: Port Availability Check" -ForegroundColor Yellow

$requiredPorts = @(
    @{Port=6000; Service="Nexus Router"},
    @{Port=3000; Service="TwentyCRM"},
    @{Port=3001; Service="Dify"},
    @{Port=5678; Service="n8n"},
    @{Port=9090; Service="Prometheus"},
    @{Port=3005; Service="Grafana"},
    @{Port=8283; Service="Letta"},
    @{Port=4321; Service="Mem0"},
    @{Port=3100; Service="Loki"},
    @{Port=6379; Service="Redis"},
    @{Port=5432; Service="PostgreSQL"}
)

$portsInUse = @()
foreach ($portCheck in $requiredPorts) {
    $connection = Get-NetTCPConnection -LocalPort $portCheck.Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Warning "Port $($portCheck.Port) ($($portCheck.Service)) already in use"
        $portsInUse += "$($portCheck.Port):$($portCheck.Service)"
    } else {
        if ($Verbose) {
            Write-Success "Port $($portCheck.Port) ($($portCheck.Service)) available"
        }
    }
}

if ($portsInUse.Count -gt 0) {
    $results.Warnings += "Ports in use: $($portsInUse -join ', ')"
    Write-Warning "Some ports already in use - services may fail to start"
} else {
    Write-Success "All required ports available"
    $results.Passed += "All service ports available"
}

# ============================================================================
# PHASE 5: DISK SPACE
# ============================================================================
Write-Host "`n💾 PHASE 5: Disk Space" -ForegroundColor Yellow

try {
    $drive = Get-PSDrive C -ErrorAction Stop
    $freeGB = [math]::Round($drive.Free / 1GB, 2)
    $usedGB = [math]::Round($drive.Used / 1GB, 2)
    $totalGB = [math]::Round(($drive.Free + $drive.Used) / 1GB, 2)
    
    if ($freeGB -ge 100) {
        Write-Success "Disk space: ${freeGB}GB free / ${totalGB}GB total"
        $results.Passed += "Sufficient disk space (100GB+ available)"
    } elseif ($freeGB -ge 50) {
        Write-Warning "Disk space: ${freeGB}GB free / ${totalGB}GB total (recommend 100GB+)"
        $results.Warnings += "Low disk space - recommend freeing up space before bootstrap"
    } else {
        Write-Failure "Disk space: ${freeGB}GB free / ${totalGB}GB total (need 100GB+)"
        $results.Critical += "Insufficient disk space - need at least 100GB free"
    }
} catch {
    Write-Warning "Could not check disk space"
    $results.Warnings += "Manually verify sufficient disk space"
}

# ============================================================================
# PHASE 6: ADDITIONAL UTILITIES
# ============================================================================
Write-Host "`n🛠️  PHASE 6: Additional Utilities" -ForegroundColor Yellow

# Git
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Success "Git installed ($gitVersion)"
        $results.Passed += "Git available for repository cloning"
    } else {
        Write-Warning "Git not found"
        $results.Warnings += "Install Git for repository management"
    }
} catch {
    Write-Warning "Git not installed"
    $results.Warnings += "Consider installing Git for version control"
}

# PowerShell version
$psVersion = $PSVersionTable.PSVersion
if ($psVersion.Major -ge 7) {
    Write-Success "PowerShell $psVersion"
    $results.Passed += "PowerShell 7+ available"
} elseif ($psVersion.Major -eq 5) {
    Write-Warning "PowerShell $psVersion (recommend upgrading to PS7+)"
    $results.Warnings += "Upgrade to PowerShell 7 for better compatibility"
} else {
    Write-Failure "PowerShell $psVersion (need 5.1 minimum)"
    $results.Critical += "Upgrade PowerShell to 5.1 or higher"
}

# .NET Framework (for GUI installer)
try {
    $dotnetVersion = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full").Release
    if ($dotnetVersion -ge 528040) {  # .NET 4.8
        Write-Success ".NET Framework 4.8+ installed"
        $results.Passed += ".NET Framework compatible with GUI installer"
    } else {
        Write-Warning ".NET Framework older than 4.8"
        $results.Warnings += "Update .NET Framework for GUI installer"
    }
} catch {
    Write-Warning "Could not detect .NET Framework version"
    $results.Warnings += "Verify .NET Framework 4.8+ for GUI installer"
}

# ============================================================================
# SUMMARY REPORT
# ============================================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "📊 PRE-FLIGHT CHECK SUMMARY`n" -ForegroundColor Cyan

$totalChecks = $results.Passed.Count + $results.Warnings.Count + $results.Critical.Count

Write-Host "✅ Passed: $($results.Passed.Count)" -ForegroundColor Green
Write-Host "⚠️  Warnings: $($results.Warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ Critical: $($results.Critical.Count)" -ForegroundColor Red

if ($results.Critical.Count -gt 0) {
    Write-Host "`n🚨 CRITICAL ISSUES (Must fix before bootstrap):" -ForegroundColor Red
    foreach ($issue in $results.Critical) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
}

if ($results.Warnings.Count -gt 0) {
    Write-Host "`n⚠️  WARNINGS (Recommended to fix):" -ForegroundColor Yellow
    foreach ($warning in $results.Warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
}

if ($Verbose -and $results.Passed.Count -gt 0) {
    Write-Host "`n✅ PASSED CHECKS:" -ForegroundColor Green
    foreach ($pass in $results.Passed) {
        Write-Host "   • $pass" -ForegroundColor Green
    }
}

# Final verdict
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
if ($results.Critical.Count -eq 0) {
    Write-Host "✅ READY FOR BOOTSTRAP!" -ForegroundColor Green
    Write-Host "   You can proceed with running the GUI installer.`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ NOT READY FOR BOOTSTRAP" -ForegroundColor Red
    Write-Host "   Fix critical issues above before proceeding.`n" -ForegroundColor Red
    exit 1
}
