# Project Nyra - Master Cluster Deployment Script
# Orchestrates deployment across all 4 PCs

param(
    [switch]$SkipPC1 = $false,
    [switch]$SkipPC2 = $false,
    [switch]$SkipPC3 = $false,
    [switch]$SkipPC4 = $false,
    [switch]$ParallelDeploy = $true,
    [switch]$HealthCheckOnly = $false
)

$ErrorActionPreference = "Continue"

# ============================================================================
# CONFIGURATION
# ============================================================================

$PCs = @(
    @{
        Name = "PC1-Orchestrator"
        IP = "10.0.0.1"
        Hostname = "nyra-orchestrator"
        BootstrapPath = "bootstrap-kit-pc1"
        SetupScript = "setup-pc1.ps1"
        HealthCheckScript = "health-check-pc1.ps1"
        Skip = $SkipPC1
    },
    @{
        Name = "PC2-GPU-Worker-1"
        IP = "10.0.0.2"
        Hostname = "nyra-gpu-worker-1"
        BootstrapPath = "bootstrap-kit-pc2"
        SetupScript = "setup-pc2.ps1"
        HealthCheckScript = "health-check-pc2.ps1"
        Skip = $SkipPC2
    },
    @{
        Name = "PC3-GPU-Worker-2"
        IP = "10.0.0.3"
        Hostname = "nyra-gpu-worker-3"
        BootstrapPath = "bootstrap-kit-pc3"
        SetupScript = "setup-pc3.ps1"
        HealthCheckScript = "health-check-pc3.ps1"
        Skip = $SkipPC3
    },
    @{
        Name = "PC4-GPU-Worker-3"
        IP = "10.0.0.4"
        Hostname = "nyra-gpu-worker-3"
        BootstrapPath = "bootstrap-kit-pc4"
        SetupScript = "setup-pc4.ps1"
        HealthCheckScript = "health-check-pc4.ps1"
        Skip = $SkipPC4
    }
)

# ============================================================================
# FUNCTIONS
# ============================================================================

function Write-Banner {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-PCConnectivity {
    param([hashtable]$PC)

    Write-Host "Testing connectivity to $($PC.Name) ($($PC.IP))..." -NoNewline

    $ping = Test-Connection -ComputerName $PC.IP -Count 1 -Quiet

    if ($ping) {
        Write-Host " [✓]" -ForegroundColor Green
        return $true
    } else {
        Write-Host " [✗]" -ForegroundColor Red
        return $false
    }
}

function Deploy-PC {
    param([hashtable]$PC)

    Write-Banner "Deploying $($PC.Name)"

    if ($PC.Skip) {
        Write-Host "Skipping $($PC.Name) (--Skip$($PC.Name.Split('-')[0]) flag set)" -ForegroundColor Yellow
        return
    }

    # Test connectivity
    if (-not (Test-PCConnectivity -PC $PC)) {
        Write-Host "Cannot reach $($PC.Name), skipping..." -ForegroundColor Red
        return
    }

    # Check if bootstrap kit exists
    if (-not (Test-Path $PC.BootstrapPath)) {
        Write-Host "Bootstrap kit not found: $($PC.BootstrapPath)" -ForegroundColor Red
        return
    }

    Write-Host "Deploying bootstrap kit to $($PC.Name)..." -ForegroundColor Yellow

    # For local deployment (same machine)
    if ($PC.IP -eq "10.0.0.1" -or $PC.IP -eq "localhost") {
        Write-Host "Local deployment detected, running setup script..." -ForegroundColor Yellow

        Push-Location $PC.BootstrapPath
        try {
            & ".\$($PC.SetupScript)"
        } catch {
            Write-Host "Error during setup: $_" -ForegroundColor Red
        } finally {
            Pop-Location
        }
    } else {
        # Remote deployment (requires PSRemoting or SSH)
        Write-Host "Remote deployment to $($PC.IP)" -ForegroundColor Yellow
        Write-Host "Manual deployment required:" -ForegroundColor Yellow
        Write-Host "  1. Copy $($PC.BootstrapPath) to $($PC.Name)" -ForegroundColor White
        Write-Host "  2. On $($PC.Name), run: .\$($PC.SetupScript)" -ForegroundColor White
    }

    Write-Host ""
}

function Run-HealthCheck {
    param([hashtable]$PC)

    if ($PC.Skip) {
        return
    }

    Write-Host "Health check for $($PC.Name):" -ForegroundColor Yellow

    if (-not (Test-PCConnectivity -PC $PC)) {
        Write-Host "  Cannot reach PC" -ForegroundColor Red
        return
    }

    if ($PC.IP -eq "10.0.0.1" -or $PC.IP -eq "localhost") {
        Push-Location $PC.BootstrapPath
        try {
            & ".\$($PC.HealthCheckScript)"
        } catch {
            Write-Host "  Health check failed: $_" -ForegroundColor Red
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  Manual health check required on remote PC" -ForegroundColor Yellow
    }

    Write-Host ""
}

function Show-ClusterStatus {
    Write-Banner "Cluster Status"

    foreach ($PC in $PCs) {
        if ($PC.Skip) {
            continue
        }

        $reachable = Test-PCConnectivity -PC $PC

        if ($reachable) {
            Write-Host "$($PC.Name): " -NoNewline
            Write-Host "REACHABLE" -ForegroundColor Green
        } else {
            Write-Host "$($PC.Name): " -NoNewline
            Write-Host "UNREACHABLE" -ForegroundColor Red
        }
    }

    Write-Host ""
}

function Show-DeploymentSummary {
    Write-Banner "Deployment Summary"

    Write-Host "Bootstrap Kits Created:" -ForegroundColor Yellow
    Write-Host "  ✓ PC1 (Orchestrator): Nexus, Claude Flow, Archon OS, Monitoring" -ForegroundColor Green
    Write-Host "  ✓ PC2 (GPU Worker 1): Ollama, Ruvector Leader, Letta, Mem0, OpenClaw UI" -ForegroundColor Green
    Write-Host "  ✓ PC3 (GPU Worker 2): Ruvector Follower, TwentyCRM, Databases" -ForegroundColor Green
    Write-Host "  ✓ PC4 (GPU Worker 3): Ruvector Follower, n8n, Activepieces, Business Services" -ForegroundColor Green
    Write-Host ""

    Write-Host "Network Configuration:" -ForegroundColor Yellow
    Write-Host "  Local Network: 10.0.0.0/24 (10GbE Switch)" -ForegroundColor White
    Write-Host "  PC1: 10.0.0.1 - Orchestrator" -ForegroundColor White
    Write-Host "  PC2: 10.0.0.2 - GPU Worker 1" -ForegroundColor White
    Write-Host "  PC3: 10.0.0.3 - GPU Worker 2" -ForegroundColor White
    Write-Host "  PC4: 10.0.0.4 - GPU Worker 3" -ForegroundColor White
    Write-Host ""

    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Configure static IPs on all PCs (10.0.0.1-4)" -ForegroundColor White
    Write-Host "  2. Copy bootstrap kits to respective PCs" -ForegroundColor White
    Write-Host "  3. Run setup-pc{N}.ps1 on each PC" -ForegroundColor White
    Write-Host "  4. Run health-check-pc{N}.ps1 on each PC" -ForegroundColor White
    Write-Host "  5. Configure Tailscale mesh VPN" -ForegroundColor White
    Write-Host "  6. Set up Cloudflare Tunnels" -ForegroundColor White
    Write-Host "  7. Test inter-PC communication" -ForegroundColor White
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Banner "Project Nyra - Cluster Deployment"

Write-Host "Deployment Mode: " -NoNewline
if ($HealthCheckOnly) {
    Write-Host "HEALTH CHECK ONLY" -ForegroundColor Yellow
} elseif ($ParallelDeploy) {
    Write-Host "PARALLEL" -ForegroundColor Green
} else {
    Write-Host "SEQUENTIAL" -ForegroundColor Yellow
}

Write-Host ""

# Show cluster status
Show-ClusterStatus

if ($HealthCheckOnly) {
    # Run health checks only
    Write-Banner "Running Health Checks"

    foreach ($PC in $PCs) {
        Run-HealthCheck -PC $PC
    }
} else {
    # Deploy to all PCs
    if ($ParallelDeploy) {
        Write-Host "Starting parallel deployment..." -ForegroundColor Yellow
        Write-Host "Note: Parallel deployment requires PowerShell Remoting or manual execution" -ForegroundColor Yellow
        Write-Host ""

        $jobs = @()
        foreach ($PC in $PCs) {
            if (-not $PC.Skip) {
                Write-Host "Queued: $($PC.Name)" -ForegroundColor Cyan
            }
        }

        Write-Host ""
        Write-Host "Manual parallel deployment:" -ForegroundColor Yellow
        Write-Host "  1. Open separate terminals for each PC" -ForegroundColor White
        Write-Host "  2. Navigate to each bootstrap-kit-pc{N} folder" -ForegroundColor White
        Write-Host "  3. Run all setup scripts simultaneously" -ForegroundColor White
    } else {
        Write-Host "Starting sequential deployment..." -ForegroundColor Yellow
        Write-Host ""

        foreach ($PC in $PCs) {
            Deploy-PC -PC $PC
            Start-Sleep -Seconds 5
        }
    }

    # Post-deployment health checks
    Write-Host ""
    Write-Host "Waiting 60 seconds for services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60

    Write-Banner "Post-Deployment Health Checks"

    foreach ($PC in $PCs) {
        Run-HealthCheck -PC $PC
    }
}

# Show summary
Show-DeploymentSummary

Write-Host "Deployment orchestration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "For detailed documentation, see:" -ForegroundColor Yellow
Write-Host "  - 4PC-DEPLOYMENT-GUIDE.md" -ForegroundColor White
Write-Host "  - IMPLEMENTATION-REPORT-SESSION-3.md" -ForegroundColor White
Write-Host ""
