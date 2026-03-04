# Nyra Complete Infrastructure Setup Script
# PowerShell script for Windows environments to setup all components

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("orchestrator", "worker1", "worker2", "worker3", "all")]
    [string]$NodeType = "all",

    [Parameter(Mandatory=$false)]
    [string]$WorkerIP = "",

    [Parameter(Mandatory=$false)]
    [string]$GPUModel = ""
)

# Colors for output
$Colors = @{
    Red = 'Red'
    Green = 'Green'
    Yellow = 'Yellow'
    Blue = 'Blue'
    Cyan = 'Cyan'
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { $Colors.Red }
        "SUCCESS" { $Colors.Green }
        "WARNING" { $Colors.Yellow }
        "INFO" { $Colors.Blue }
        default { $Colors.Blue }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Test-AdminPrivileges {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Prerequisites {
    Write-Log "Installing prerequisites..." "INFO"

    # Check if Chocolatey is installed
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Log "Installing Chocolatey..." "INFO"
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }

    # Install required packages
    $packages = @(
        "nodejs",
        "git",
        "docker-desktop",
        "cloudflared",
        "python3"
    )

    foreach ($package in $packages) {
        Write-Log "Installing $package..." "INFO"
        choco install $package -y --no-progress
    }

    Write-Log "Prerequisites installed successfully" "SUCCESS"
}

function Setup-Environment {
    Write-Log "Setting up environment variables..." "INFO"

    $envFile = Join-Path $PSScriptRoot "../../.env"

    if (-not (Test-Path $envFile)) {
        Write-Log "Creating .env file..." "INFO"

        $envContent = @"
# Nyra Infrastructure Configuration
NODE_ENV=production

# Cloudflare Configuration
CLOUDFLARE_API_KEY=your_api_key_here
CLOUDFLARE_EMAIL=your_email_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Network Configuration
INTERNAL_NETWORK=192.168.1.0/24
ORCHESTRATOR_IP=192.168.1.100
WORKER1_IP=192.168.1.101
WORKER2_IP=192.168.1.102
WORKER3_IP=192.168.1.103

# Service Ports
ORCHESTRATOR_PORT=8080
HEALTH_PORT=9090
METRICS_PORT=8081

# Security
JWT_SECRET=generated_on_first_run
API_RATE_LIMIT=1000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/nyra.log
"@

        Set-Content -Path $envFile -Value $envContent
        Write-Log "Environment file created at $envFile" "SUCCESS"
        Write-Log "Please update the .env file with your actual Cloudflare credentials" "WARNING"
    }
}

function Setup-Directories {
    Write-Log "Creating directory structure..." "INFO"

    $directories = @(
        "src/infrastructure/cloudflared",
        "config/tunnels",
        "scripts/setup",
        "scripts/monitoring",
        "docs/network",
        "data",
        "logs",
        "config/workers"
    )

    foreach ($dir in $directories) {
        $fullPath = Join-Path $PSScriptRoot "../../$dir"
        if (-not (Test-Path $fullPath)) {
            New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
            Write-Log "Created directory: $dir" "INFO"
        }
    }

    Write-Log "Directory structure created" "SUCCESS"
}

function Install-NodeDependencies {
    Write-Log "Installing Node.js dependencies..." "INFO"

    $projectRoot = Join-Path $PSScriptRoot "../.."
    Push-Location $projectRoot

    try {
        # Install dependencies using pnpm to honor pnpm-lock.yaml
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            Write-Log "pnpm not found, enabling Corepack..." "WARNING"
            corepack enable
        }

        pnpm install --no-frozen-lockfile

        # Install global tools
        pnpm add -g pm2 nodemon

        Write-Log "Node.js dependencies installed" "SUCCESS"
    }
    catch {
        Write-Log "Failed to install Node.js dependencies: $($_.Exception.Message)" "ERROR"
        throw
    }
    finally {
        Pop-Location
    }
}

function Setup-Cloudflare {
    Write-Log "Setting up Cloudflare tunnel..." "INFO"

    # Check if cloudflared is in PATH
    if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
        Write-Log "cloudflared not found in PATH. Please install it first." "ERROR"
        return
    }

    Write-Log "Cloudflare setup requires manual steps:" "WARNING"
    Write-Host @"
1. Run: cloudflared tunnel login
2. Run: cloudflared tunnel create nyra-orchestrator
3. Copy the tunnel ID to your .env file as NYRA_ORCHESTRATOR_TUNNEL_ID
4. Re-run this script to complete the setup
"@ -ForegroundColor Yellow
}

function Setup-ServiceDiscovery {
    Write-Log "Setting up service discovery..." "INFO"

    $serviceScript = Join-Path $PSScriptRoot "../../src/infrastructure/cloudflared/service-discovery.js"

    if (Test-Path $serviceScript) {
        # Test service discovery
        node $serviceScript status
        Write-Log "Service discovery is ready" "SUCCESS"
    } else {
        Write-Log "Service discovery script not found" "ERROR"
    }
}

function Setup-Monitoring {
    Write-Log "Setting up monitoring..." "INFO"

    # Create monitoring script for Windows
    $monitoringScript = Join-Path $PSScriptRoot "../monitoring/health-check.ps1"
    $monitoringDir = Split-Path $monitoringScript -Parent

    if (-not (Test-Path $monitoringDir)) {
        New-Item -Path $monitoringDir -ItemType Directory -Force | Out-Null
    }

    $monitoringContent = @'
# Nyra Health Check Script for Windows
param([string]$NodeType = "orchestrator")

function Test-ServiceHealth {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

Write-Host "🔍 Nyra $NodeType Health Check - $(Get-Date)" -ForegroundColor Blue
Write-Host "========================================"

$services = @()

switch ($NodeType) {
    "orchestrator" {
        $services = @(
            @{ Name = "Claude-Flow"; Url = "http://localhost:3000/health" },
            @{ Name = "Task API"; Url = "http://localhost:8080/health" },
            @{ Name = "Health Dashboard"; Url = "http://localhost:9090/health" },
            @{ Name = "GPU Metrics"; Url = "http://localhost:8081/metrics" }
        )
    }
    default {
        $services = @(
            @{ Name = "GPU API"; Url = "http://localhost:8082/health" },
            @{ Name = "Health Service"; Url = "http://localhost:8083/health" }
        )
    }
}

$failed = $false
foreach ($service in $services) {
    if (Test-ServiceHealth -Url $service.Url) {
        Write-Host "✅ $($service.Name) is healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name) is unhealthy" -ForegroundColor Red
        $failed = $true
    }
}

if ($failed) {
    Write-Host "🔴 Some services unhealthy" -ForegroundColor Red
    exit 1
} else {
    Write-Host "🟢 All services healthy" -ForegroundColor Green
    exit 0
}
'@

    Set-Content -Path $monitoringScript -Value $monitoringContent
    Write-Log "Monitoring script created: $monitoringScript" "SUCCESS"
}

function Setup-WindowsFirewall {
    Write-Log "Configuring Windows Firewall..." "INFO"

    if (-not (Test-AdminPrivileges)) {
        Write-Log "Administrator privileges required for firewall configuration" "WARNING"
        return
    }

    $ports = @(3000, 8080, 9090, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8888, 8889, 8890, 8891)

    foreach ($port in $ports) {
        try {
            New-NetFirewallRule -DisplayName "Nyra Port $port" -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow -ErrorAction SilentlyContinue
            Write-Log "Opened port $port" "INFO"
        }
        catch {
            Write-Log "Failed to open port $port" "WARNING"
        }
    }

    Write-Log "Firewall configuration completed" "SUCCESS"
}

function Setup-TaskScheduler {
    Write-Log "Setting up Windows Task Scheduler for health monitoring..." "INFO"

    if (-not (Test-AdminPrivileges)) {
        Write-Log "Administrator privileges required for Task Scheduler setup" "WARNING"
        return
    }

    $taskName = "NyraHealthCheck"
    $scriptPath = Join-Path $PSScriptRoot "../monitoring/health-check.ps1"

    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$scriptPath`" -NodeType $NodeType"
    $trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 1) -At (Get-Date) -Once
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

    try {
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force
        Write-Log "Health monitoring task scheduled" "SUCCESS"
    }
    catch {
        Write-Log "Failed to create scheduled task: $($_.Exception.Message)" "ERROR"
    }
}

function Show-SetupSummary {
    Write-Log "Setup Summary" "SUCCESS"
    Write-Host @"

🏗️  Nyra Infrastructure Setup Completed!

📦 Installed Components:
   - Node.js and npm packages
   - Cloudflared tunnel client
   - Docker Desktop
   - Python 3

🔧 Configured Services:
   - Environment variables (.env)
   - Directory structure
   - Monitoring scripts
   - Windows Firewall rules
   - Scheduled health checks

🌐 Network Configuration:
   - Service ports opened
   - Firewall configured
   - Health monitoring enabled

⚡ Next Steps:

1. Configure Cloudflare:
   - Set your API credentials in .env file
   - Run: cloudflared tunnel login
   - Run: cloudflared tunnel create nyra-orchestrator

2. Start Services:
   - For Orchestrator: npm run start:orchestrator
   - For Workers: npm run start:worker

3. Verify Setup:
   - Run health check: PowerShell scripts/monitoring/health-check.ps1
   - Check service status: node src/infrastructure/cloudflared/service-discovery.js status

4. Access Services:
   - Main Interface: https://nyra.ratehunter.net (after tunnel setup)
   - Health Dashboard: https://health.ratehunter.net
   - API Gateway: https://api.ratehunter.net

🔗 Documentation:
   - Network Topology: docs/network/network-topology.md
   - Security Policies: config/access-policies.json
   - Service Discovery: src/infrastructure/cloudflared/service-discovery.js

"@ -ForegroundColor Green
}

# Main execution
try {
    Write-Log "Starting Nyra Infrastructure Setup..." "INFO"
    Write-Log "Node Type: $NodeType" "INFO"

    if (-not (Test-AdminPrivileges)) {
        Write-Log "Some features require administrator privileges. Consider running as administrator." "WARNING"
    }

    # Run setup steps
    Setup-Directories
    Setup-Environment
    Install-Prerequisites
    Install-NodeDependencies
    Setup-WindowsFirewall
    Setup-Monitoring
    Setup-TaskScheduler
    Setup-ServiceDiscovery
    Setup-Cloudflare

    Show-SetupSummary

    Write-Log "Setup completed successfully!" "SUCCESS"
}
catch {
    Write-Log "Setup failed: $($_.Exception.Message)" "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}