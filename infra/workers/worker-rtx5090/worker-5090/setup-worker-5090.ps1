# Worker RTX 5090 Setup Script
# GPU: RTX 5090 48GB VRAM
# Purpose: Complex reasoning (DeepSeek-R1 236B, Qwen 2.5 72B)
# Usage: Run as Administrator

[CmdletBinding()]
param(
    [switch]$SkipDocker,
    [switch]$SkipNvidia,
    [switch]$SkipInfisical,
    [switch]$SkipTailscale,
    [switch]$SkipModels,
    [switch]$AutoYes
)

. "$PSScriptRoot\..\..\..\..\scripts\lib\InfisicalToken.ps1"

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"

Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "  Worker RTX 5090 Setup Script" -ForegroundColor $ColorInfo
Write-Host "  GPU: NVIDIA RTX 5090 (48GB VRAM)" -ForegroundColor $ColorInfo
Write-Host "  Models: DeepSeek-R1 236B, Qwen 2.5 72B" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor $ColorError
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor $ColorWarning
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor $ColorSuccess
Write-Host ""

#region Step 1: Check Prerequisites
Write-Host "Step 1: Checking Prerequisites" -ForegroundColor $ColorInfo
Write-Host "==============================" -ForegroundColor $ColorInfo

# Check Windows version
$winVersion = [System.Environment]::OSVersion.Version
if ($winVersion.Major -lt 10) {
    Write-Host "ERROR: Windows 10 or later required" -ForegroundColor $ColorError
    exit 1
}
Write-Host "✓ Windows version: $($winVersion.Major).$($winVersion.Minor)" -ForegroundColor $ColorSuccess

# Check disk space (need at least 500GB for models)
$drive = Get-PSDrive -Name C
$freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
if ($freeSpaceGB -lt 500) {
    Write-Host "WARNING: Low disk space. $freeSpaceGB GB free (500GB+ recommended)" -ForegroundColor $ColorWarning
    if (-not $AutoYes) {
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            exit 1
        }
    }
} else {
    Write-Host "✓ Disk space: $freeSpaceGB GB free" -ForegroundColor $ColorSuccess
}

# Check RAM (recommend 64GB+ for 48GB VRAM GPU)
$ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
Write-Host "✓ System RAM: $ramGB GB" -ForegroundColor $ColorSuccess
if ($ramGB -lt 32) {
    Write-Host "WARNING: 64GB+ RAM recommended for optimal performance" -ForegroundColor $ColorWarning
}

Write-Host ""
#endregion

#region Step 2: Install Docker Desktop
if (-not $SkipDocker) {
    Write-Host "Step 2: Installing Docker Desktop" -ForegroundColor $ColorInfo
    Write-Host "==================================" -ForegroundColor $ColorInfo

    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Write-Host "✓ Docker Desktop already installed" -ForegroundColor $ColorSuccess

        # Check if Docker is running
        try {
            $dockerInfo = docker info 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Docker daemon is running" -ForegroundColor $ColorSuccess
            } else {
                Write-Host "Starting Docker Desktop..." -ForegroundColor $ColorWarning
                Start-Process $dockerPath
                Write-Host "Waiting for Docker to start (60 seconds)..." -ForegroundColor $ColorWarning
                Start-Sleep -Seconds 60
            }
        } catch {
            Write-Host "Starting Docker Desktop..." -ForegroundColor $ColorWarning
            Start-Process $dockerPath
            Start-Sleep -Seconds 60
        }
    } else {
        Write-Host "Docker Desktop not found. Installing..." -ForegroundColor $ColorWarning
        Write-Host ""
        Write-Host "1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor $ColorWarning
        Write-Host "2. Install with default settings" -ForegroundColor $ColorWarning
        Write-Host "3. Enable WSL 2 backend when prompted" -ForegroundColor $ColorWarning
        Write-Host "4. Restart this script after installation" -ForegroundColor $ColorWarning
        Write-Host ""

        if (-not $AutoYes) {
            $openBrowser = Read-Host "Open download page in browser? (Y/n)"
            if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
                Start-Process "https://www.docker.com/products/docker-desktop"
            }
        }
        exit 1
    }

    Write-Host ""
} else {
    Write-Host "Step 2: Skipping Docker installation (--SkipDocker)" -ForegroundColor $ColorWarning
    Write-Host ""
}
#endregion

#region Step 3: Install NVIDIA Drivers and CUDA
if (-not $SkipNvidia) {
    Write-Host "Step 3: Checking NVIDIA Drivers and CUDA" -ForegroundColor $ColorInfo
    Write-Host "==========================================" -ForegroundColor $ColorInfo

    # Check if nvidia-smi exists
    try {
        $nvidiaSmi = nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ NVIDIA driver installed" -ForegroundColor $ColorSuccess
            Write-Host "  GPU Info: $nvidiaSmi" -ForegroundColor $ColorSuccess

            # Parse VRAM
            $vramInfo = $nvidiaSmi -split ','
            $vramMB = ($vramInfo[2].Trim() -replace ' MiB', '') -as [int]
            $vramGB = [math]::Round($vramMB / 1024, 2)

            if ($vramGB -lt 40) {
                Write-Host "WARNING: Expected 48GB VRAM, detected $vramGB GB" -ForegroundColor $ColorWarning
            } else {
                Write-Host "✓ VRAM: $vramGB GB (sufficient for DeepSeek-R1 236B)" -ForegroundColor $ColorSuccess
            }
        } else {
            throw "nvidia-smi not found"
        }
    } catch {
        Write-Host "❌ NVIDIA driver not detected" -ForegroundColor $ColorError
        Write-Host ""
        Write-Host "Install NVIDIA drivers:" -ForegroundColor $ColorWarning
        Write-Host "1. Visit: https://www.nvidia.com/Download/index.aspx" -ForegroundColor $ColorWarning
        Write-Host "2. Select: RTX 50 Series > RTX 5090 > Windows 10/11" -ForegroundColor $ColorWarning
        Write-Host "3. Download and install Game Ready or Studio drivers (latest)" -ForegroundColor $ColorWarning
        Write-Host "4. Reboot and re-run this script" -ForegroundColor $ColorWarning
        Write-Host ""
        exit 1
    }

    # Check CUDA
    try {
        $cudaVersion = nvcc --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ CUDA Toolkit installed" -ForegroundColor $ColorSuccess
            Write-Host "  Version: $($cudaVersion | Select-String 'release' | Out-String)" -ForegroundColor $ColorSuccess
        } else {
            throw "CUDA not found"
        }
    } catch {
        Write-Host "⚠ CUDA Toolkit not detected (optional for Docker, required for native)" -ForegroundColor $ColorWarning
        Write-Host "  Install from: https://developer.nvidia.com/cuda-downloads" -ForegroundColor $ColorWarning
        Write-Host "  Recommended: CUDA 12.4 or later" -ForegroundColor $ColorWarning
    }

    Write-Host ""
} else {
    Write-Host "Step 3: Skipping NVIDIA driver check (--SkipNvidia)" -ForegroundColor $ColorWarning
    Write-Host ""
}
#endregion

#region Step 4: Setup Infisical Agent
if (-not $SkipInfisical) {
    Write-Host "Step 4: Setting up Infisical Agent" -ForegroundColor $ColorInfo
    Write-Host "===================================" -ForegroundColor $ColorInfo

    # Check if Infisical CLI is installed
    try {
        $infisicalVersion = infisical --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Infisical CLI installed: $infisicalVersion" -ForegroundColor $ColorSuccess
        } else {
            throw "Infisical not found"
        }
    } catch {
        Write-Host "Installing Infisical CLI..." -ForegroundColor $ColorWarning

        try {
            # Install via Scoop (recommended for Windows)
            if (Get-Command scoop -ErrorAction SilentlyContinue) {
                scoop install infisical
            } else {
                # Download binary directly
                $infisicalUrl = "https://github.com/Infisical/infisical/releases/latest/download/infisical_windows_amd64.exe"
                $infisicalPath = "$env:ProgramFiles\Infisical\infisical.exe"

                New-Item -Path "$env:ProgramFiles\Infisical" -ItemType Directory -Force | Out-Null
                Invoke-WebRequest -Uri $infisicalUrl -OutFile $infisicalPath

                # Add to PATH
                $envPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
                if ($envPath -notlike "*Infisical*") {
                    [System.Environment]::SetEnvironmentVariable("Path", "$envPath;$env:ProgramFiles\Infisical", "Machine")
                }

                $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
                Write-Host "✓ Infisical CLI installed" -ForegroundColor $ColorSuccess
            }
        } catch {
            Write-Host "❌ Failed to install Infisical CLI" -ForegroundColor $ColorError
            Write-Host "Manual install: https://infisical.com/docs/cli/overview" -ForegroundColor $ColorWarning
            exit 1
        }
    }

    # Validate token auth
    Write-Host "Validating Infisical token auth..." -ForegroundColor $ColorWarning
    Write-Host "Project ID: 8374cea9-e5e8-4050-bda4-b91f25ab30ef" -ForegroundColor $ColorWarning
    Write-Host "Environment: dev" -ForegroundColor $ColorWarning
    Write-Host "Path: /worker-5090" -ForegroundColor $ColorWarning
    Write-Host ""

    try {
        Assert-NyraInfisicalToken
        Write-Host "✓ INFISICAL_TOKEN is available" -ForegroundColor $ColorSuccess
    } catch {
        Write-Host "❌ $($_.Exception.Message)" -ForegroundColor $ColorError
        exit 1
    }

    # Download secrets
    Write-Host "Downloading secrets from Infisical..." -ForegroundColor $ColorWarning

    $projectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
    $env = "dev"
    $path = "/worker-5090"

    try {
        $secrets = infisical export --projectId="$projectId" --env="$env" --path="$path" --format=dotenv

        if ($LASTEXITCODE -eq 0) {
            # Save to .env file
            $secrets | Out-File -FilePath ".env.worker-5090" -Encoding ASCII
            Write-Host "✓ Secrets downloaded to .env.worker-5090" -ForegroundColor $ColorSuccess
        } else {
            Write-Host "⚠ No secrets found at $path" -ForegroundColor $ColorWarning
            Write-Host "  You may need to run: infra/machines/upload-to-infisical.ps1" -ForegroundColor $ColorWarning
        }
    } catch {
        Write-Host "⚠ Failed to download secrets (may not exist yet)" -ForegroundColor $ColorWarning
    }

    Write-Host ""
} else {
    Write-Host "Step 4: Skipping Infisical setup (--SkipInfisical)" -ForegroundColor $ColorWarning
    Write-Host ""
}
#endregion

#region Step 5: Setup Tailscale
if (-not $SkipTailscale) {
    Write-Host "Step 5: Setting up Tailscale VPN" -ForegroundColor $ColorInfo
    Write-Host "=================================" -ForegroundColor $ColorInfo

    # Check if Tailscale is installed
    $tailscalePath = "C:\Program Files\Tailscale\tailscale.exe"
    if (Test-Path $tailscalePath) {
        Write-Host "✓ Tailscale installed" -ForegroundColor $ColorSuccess

        # Check if connected
        try {
            $tailscaleStatus = & $tailscalePath status 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Tailscale connected" -ForegroundColor $ColorSuccess

                # Get Tailscale IP
                $tailscaleIP = (& $tailscalePath ip -4) -split "`n" | Select-Object -First 1
                Write-Host "  Tailscale IP: $tailscaleIP" -ForegroundColor $ColorSuccess

                # Get hostname
                $tailscaleHostname = (& $tailscalePath status --json | ConvertFrom-Json).Self.DNSName.TrimEnd('.')
                Write-Host "  Hostname: $tailscaleHostname" -ForegroundColor $ColorSuccess
            } else {
                throw "Not connected"
            }
        } catch {
            Write-Host "⚠ Tailscale not connected" -ForegroundColor $ColorWarning
            Write-Host "Run: tailscale up" -ForegroundColor $ColorWarning
        }
    } else {
        Write-Host "Tailscale not installed" -ForegroundColor $ColorWarning
        Write-Host ""
        Write-Host "1. Download from: https://tailscale.com/download/windows" -ForegroundColor $ColorWarning
        Write-Host "2. Install and connect to your network" -ForegroundColor $ColorWarning
        Write-Host "3. Re-run this script" -ForegroundColor $ColorWarning
        Write-Host ""
    }

    Write-Host ""
} else {
    Write-Host "Step 5: Skipping Tailscale setup (--SkipTailscale)" -ForegroundColor $ColorWarning
    Write-Host ""
}
#endregion

#region Step 6: Setup Ollama
Write-Host "Step 6: Setting up Ollama" -ForegroundColor $ColorInfo
Write-Host "=========================" -ForegroundColor $ColorInfo

# Check if Ollama is installed
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\Ollama.exe"
if (Test-Path $ollamaPath) {
    Write-Host "✓ Ollama installed at: $ollamaPath" -ForegroundColor $ColorSuccess

    # Check if running
    $ollamaProcess = Get-Process -Name "Ollama" -ErrorAction SilentlyContinue
    if ($ollamaProcess) {
        Write-Host "✓ Ollama is running (PID: $($ollamaProcess.Id))" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "Starting Ollama..." -ForegroundColor $ColorWarning
        Start-Process $ollamaPath
        Start-Sleep -Seconds 5
        Write-Host "✓ Ollama started" -ForegroundColor $ColorSuccess
    }

    # Configure Ollama to bind to 0.0.0.0 for Tailscale access
    Write-Host "Configuring Ollama for network access..." -ForegroundColor $ColorWarning
    [System.Environment]::SetEnvironmentVariable('OLLAMA_HOST', '0.0.0.0:11434', 'User')
    [System.Environment]::SetEnvironmentVariable('OLLAMA_MAX_LOADED_MODELS', '2', 'User')
    [System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_PARALLEL', '8', 'User')
    [System.Environment]::SetEnvironmentVariable('OLLAMA_KEEP_ALIVE', '30m', 'User')
    Write-Host "✓ Ollama environment variables set" -ForegroundColor $ColorSuccess
    Write-Host "  Note: Restart Ollama for changes to take effect" -ForegroundColor $ColorWarning

} else {
    Write-Host "Ollama not installed" -ForegroundColor $ColorWarning
    Write-Host ""
    Write-Host "Installing Ollama..." -ForegroundColor $ColorWarning

    $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
    Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $ollamaInstaller

    Write-Host "Running installer..." -ForegroundColor $ColorWarning
    Start-Process $ollamaInstaller -Wait

    if (Test-Path $ollamaPath) {
        Write-Host "✓ Ollama installed successfully" -ForegroundColor $ColorSuccess
        Start-Process $ollamaPath
        Start-Sleep -Seconds 5
    } else {
        Write-Host "❌ Ollama installation failed" -ForegroundColor $ColorError
        Write-Host "Manual install: https://ollama.com/download" -ForegroundColor $ColorWarning
        exit 1
    }
}

# Wait for Ollama API
Write-Host "Waiting for Ollama API..." -ForegroundColor $ColorWarning
$maxRetries = 20
$retryCount = 0
$apiReady = $false

while ($retryCount -lt $maxRetries -and -not $apiReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        $apiReady = $true
    } catch {
        $retryCount++
        Start-Sleep -Seconds 2
    }
}

if ($apiReady) {
    Write-Host "✓ Ollama API is ready on port 11434" -ForegroundColor $ColorSuccess
} else {
    Write-Host "❌ Ollama API not responding" -ForegroundColor $ColorError
    Write-Host "Check logs at: $env:LOCALAPPDATA\Ollama\logs\server.log" -ForegroundColor $ColorWarning
}

Write-Host ""
#endregion

#region Step 7: Pull Models
if (-not $SkipModels) {
    Write-Host "Step 7: Pulling Models (This will take 2-4 hours)" -ForegroundColor $ColorInfo
    Write-Host "==================================================" -ForegroundColor $ColorInfo
    Write-Host ""
    Write-Host "Models optimized for RTX 5090 (48GB VRAM):" -ForegroundColor $ColorWarning
    Write-Host "  1. DeepSeek-R1 236B (Q4_K_M) - ~130GB - Primary reasoning model" -ForegroundColor $ColorWarning
    Write-Host "  2. Qwen 2.5 72B (Q5_K_M) - ~48GB - Secondary reasoning model" -ForegroundColor $ColorWarning
    Write-Host ""
    Write-Host "These are VERY LARGE models and will take significant time to download." -ForegroundColor $ColorWarning
    Write-Host "Ensure you have a stable internet connection and sufficient disk space." -ForegroundColor $ColorWarning
    Write-Host ""

    if (-not $AutoYes) {
        $pullModels = Read-Host "Pull models now? (y/N)"
        if ($pullModels -ne "y" -and $pullModels -ne "Y") {
            Write-Host "Skipping model download. Pull manually with:" -ForegroundColor $ColorWarning
            Write-Host "  ollama pull deepseek-r1:236b-instruct-q4_K_M" -ForegroundColor $ColorWarning
            Write-Host "  ollama pull qwen2.5:72b-instruct-q5_K_M" -ForegroundColor $ColorWarning
            $SkipModels = $true
        }
    }

    if (-not $SkipModels) {
        # Pull DeepSeek-R1 236B (primary model)
        Write-Host ""
        Write-Host "Pulling DeepSeek-R1 236B (Q4_K_M) - ~130GB..." -ForegroundColor $ColorInfo
        Write-Host "This will take 1-2 hours depending on your connection" -ForegroundColor $ColorWarning
        & ollama pull deepseek-r1:236b-instruct-q4_K_M

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ DeepSeek-R1 236B downloaded successfully" -ForegroundColor $ColorSuccess
        } else {
            Write-Host "❌ Failed to pull DeepSeek-R1 236B" -ForegroundColor $ColorError
        }

        # Pull Qwen 2.5 72B (secondary model)
        Write-Host ""
        Write-Host "Pulling Qwen 2.5 72B (Q5_K_M) - ~48GB..." -ForegroundColor $ColorInfo
        Write-Host "This will take 30-60 minutes depending on your connection" -ForegroundColor $ColorWarning
        & ollama pull qwen2.5:72b-instruct-q5_K_M

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Qwen 2.5 72B downloaded successfully" -ForegroundColor $ColorSuccess
        } else {
            Write-Host "❌ Failed to pull Qwen 2.5 72B" -ForegroundColor $ColorError
        }

        Write-Host ""
    }
} else {
    Write-Host "Step 7: Skipping model download (--SkipModels)" -ForegroundColor $ColorWarning
    Write-Host ""
}
#endregion

#region Step 8: Setup Docker Compose
Write-Host "Step 8: Setting up Docker Compose Stack" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo

$composeFile = "docker-compose.worker-5090.yml"
if (Test-Path $composeFile) {
    Write-Host "✓ Found $composeFile" -ForegroundColor $ColorSuccess

    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.worker-5090.template") {
            Copy-Item ".env.worker-5090.template" ".env"
            Write-Host "✓ Created .env from template" -ForegroundColor $ColorSuccess
            Write-Host "  Edit .env to customize settings" -ForegroundColor $ColorWarning
        } else {
            Write-Host "⚠ No .env.worker-5090.template found" -ForegroundColor $ColorWarning
        }
    }

    Write-Host ""
    Write-Host "To start the worker stack:" -ForegroundColor $ColorWarning
    Write-Host "  docker compose -f $composeFile up -d" -ForegroundColor $ColorWarning
    Write-Host ""

    if (-not $AutoYes) {
        $startNow = Read-Host "Start Docker services now? (y/N)"
        if ($startNow -eq "y" -or $startNow -eq "Y") {
            Write-Host "Starting Docker services..." -ForegroundColor $ColorInfo
            docker compose -f $composeFile up -d

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Docker services started" -ForegroundColor $ColorSuccess

                Write-Host ""
                Write-Host "Checking service health..." -ForegroundColor $ColorWarning
                Start-Sleep -Seconds 10
                docker compose -f $composeFile ps
            } else {
                Write-Host "❌ Failed to start Docker services" -ForegroundColor $ColorError
            }
        }
    }
} else {
    Write-Host "⚠ $composeFile not found in current directory" -ForegroundColor $ColorWarning
}

Write-Host ""
#endregion

#region Step 9: Setup Health Monitor
Write-Host "Step 9: Setting up Health Monitor" -ForegroundColor $ColorInfo
Write-Host "==================================" -ForegroundColor $ColorInfo

$healthMonitorScript = "health-monitor.ps1"
if (Test-Path $healthMonitorScript) {
    Write-Host "✓ Found $healthMonitorScript" -ForegroundColor $ColorSuccess
    Write-Host ""
    Write-Host "To run health monitor:" -ForegroundColor $ColorWarning
    Write-Host "  .\health-monitor.ps1" -ForegroundColor $ColorWarning
    Write-Host ""
    Write-Host "To run in background (logs to health-monitor.log):" -ForegroundColor $ColorWarning
    Write-Host "  Start-Job -FilePath .\health-monitor.ps1" -ForegroundColor $ColorWarning
} else {
    Write-Host "⚠ $healthMonitorScript not found" -ForegroundColor $ColorWarning
}

Write-Host ""
#endregion

#region Step 10: Summary
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "  Setup Complete!" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host ""

Write-Host "Worker RTX 5090 Status:" -ForegroundColor $ColorSuccess
Write-Host "  • GPU: RTX 5090 48GB VRAM" -ForegroundColor $ColorSuccess
Write-Host "  • Models: DeepSeek-R1 236B, Qwen 2.5 72B" -ForegroundColor $ColorSuccess
Write-Host "  • Ollama API: http://localhost:11434" -ForegroundColor $ColorSuccess

if (-not $SkipTailscale) {
    try {
        $tailscaleIP = (& "C:\Program Files\Tailscale\tailscale.exe" ip -4) -split "`n" | Select-Object -First 1
        Write-Host "  • Tailscale: http://${tailscaleIP}:11434" -ForegroundColor $ColorSuccess
    } catch {
        Write-Host "  • Tailscale: Not configured" -ForegroundColor $ColorWarning
    }
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor $ColorInfo
Write-Host "  1. Test Ollama: curl http://localhost:11434/api/tags" -ForegroundColor $ColorWarning
Write-Host "  2. Start Docker stack: docker compose -f docker-compose.worker-5090.yml up -d" -ForegroundColor $ColorWarning
Write-Host "  3. Run validation: .\validate-setup.ps1" -ForegroundColor $ColorWarning
Write-Host "  4. Configure Nexus Router with worker URL" -ForegroundColor $ColorWarning
Write-Host "  5. Setup Cloudflared tunnel for external access" -ForegroundColor $ColorWarning
Write-Host "  6. Start health monitor: .\health-monitor.ps1" -ForegroundColor $ColorWarning
Write-Host ""

Write-Host "Documentation:" -ForegroundColor $ColorInfo
Write-Host "  • README.md - Complete setup guide" -ForegroundColor $ColorWarning
Write-Host "  • validate-setup.ps1 - Validation script" -ForegroundColor $ColorWarning
Write-Host "  • health-monitor.ps1 - Health monitoring" -ForegroundColor $ColorWarning
Write-Host ""

Write-Host "Support:" -ForegroundColor $ColorInfo
Write-Host "  • Cluster setup: infra/cluster-setup/CLUSTER-SETUP-GUIDE.md" -ForegroundColor $ColorWarning
Write-Host "  • Project docs: CLAUDE.md" -ForegroundColor $ColorWarning
Write-Host ""
#endregion

# Save setup log
$setupLog = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    gpu = "RTX 5090 48GB"
    models = @("deepseek-r1:236b-instruct-q4_K_M", "qwen2.5:72b-instruct-q5_K_M")
    ollama_installed = Test-Path $ollamaPath
    docker_installed = Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    infisical_installed = (Get-Command infisical -ErrorAction SilentlyContinue) -ne $null
    tailscale_installed = Test-Path "C:\Program Files\Tailscale\tailscale.exe"
} | ConvertTo-Json

$setupLog | Out-File -FilePath "setup-log.json" -Encoding ASCII
Write-Host "Setup log saved to: setup-log.json" -ForegroundColor $ColorSuccess
