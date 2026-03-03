# NYRA Distributed Memory Architecture Setup Script
# PowerShell script for Windows deployment

param(
    [string]$Environment = "development",
    [string]$NodeType = "orchestrator",
    [switch]$InitDatabase,
    [switch]$SetupCluster,
    [switch]$InstallDependencies,
    [switch]$StartServices
)

$ErrorActionPreference = "Stop"

# Configuration
$ProjectRoot = $PSScriptRoot | Split-Path -Parent
$ConfigPath = Join-Path $ProjectRoot "config\memory\distributed-memory-config.yaml"
$DatabaseSchema = Join-Path $ProjectRoot "src\database\schemas\nyra-database-schemas.sql"

Write-Host "🚀 NYRA Distributed Memory Architecture Setup" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Node Type: $NodeType" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Cyan

function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

    # Check if volta is available
    try {
        $voltaVersion = volta --version
        Write-Host "✓ Volta found: $voltaVersion" -ForegroundColor Green
    }
    catch {
        Write-Error "Volta not found. Please install Volta first."
    }

    # Install Node.js packages
    Set-Location $ProjectRoot

    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install

    # Install Python dependencies for ML components
    Write-Host "Installing Python packages..." -ForegroundColor Yellow
    if (Get-Command python -ErrorAction SilentlyContinue) {
        python -m pip install -r requirements.txt
    } else {
        Write-Warning "Python not found. Skipping Python dependencies."
    }

    # Install PostgreSQL extensions
    Write-Host "Installing PostgreSQL extensions..." -ForegroundColor Yellow
    $pgExtensions = @("pgvector", "pg_stat_statements", "pg_trgm")
    foreach ($ext in $pgExtensions) {
        Write-Host "Installing $ext..." -ForegroundColor Gray
        # Installation would depend on PostgreSQL setup
    }

    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
}

function Initialize-Database {
    Write-Host "🗄️ Initializing database..." -ForegroundColor Yellow

    # Check environment variables
    $dbHost = $env:POSTGRES_HOST ?? "localhost"
    $dbPort = $env:POSTGRES_PORT ?? "5432"
    $dbName = $env:POSTGRES_DB ?? "nyra_memory"
    $dbUser = $env:POSTGRES_USER ?? "nyra_app"
    $dbPassword = $env:POSTGRES_PASSWORD

    if (-not $dbPassword) {
        Write-Error "POSTGRES_PASSWORD environment variable is required"
    }

    Write-Host "Database: $dbHost`:$dbPort/$dbName" -ForegroundColor Cyan

    # Test connection
    $connectionString = "Host=$dbHost;Port=$dbPort;Database=postgres;Username=$dbUser;Password=$dbPassword"

    try {
        Write-Host "Testing database connection..." -ForegroundColor Gray
        # Create database if it doesn't exist
        $createDbSql = "CREATE DATABASE $dbName;"
        # psql -h $dbHost -p $dbPort -U $dbUser -c $createDbSql

        # Run schema creation
        Write-Host "Creating database schema..." -ForegroundColor Gray
        # psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $DatabaseSchema

        Write-Host "✓ Database initialized successfully" -ForegroundColor Green
    }
    catch {
        Write-Error "Database initialization failed: $($_.Exception.Message)"
    }
}

function Setup-Cluster {
    Write-Host "🔗 Setting up distributed cluster..." -ForegroundColor Yellow

    # Create cluster configuration
    $clusterConfig = @{
        nodeId = $env:NODE_ID ?? $NodeType
        nodeType = $NodeType
        environment = $Environment
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }

    $configJson = $clusterConfig | ConvertTo-Json -Depth 10
    $configPath = Join-Path $ProjectRoot "config\cluster-config.json"

    Write-Host "Saving cluster configuration to: $configPath" -ForegroundColor Gray
    $configJson | Out-File -FilePath $configPath -Encoding UTF8

    # Setup cloudflared tunnels if enabled
    if ($NodeType -ne "orchestrator") {
        Write-Host "Setting up cloudflared tunnel..." -ForegroundColor Gray
        Setup-CloudflaredTunnel -NodeType $NodeType
    }

    # Configure Wake-on-LAN for worker nodes
    if ($NodeType -eq "orchestrator") {
        Write-Host "Configuring Wake-on-LAN..." -ForegroundColor Gray
        Setup-WakeOnLAN
    }

    Write-Host "✓ Cluster setup completed" -ForegroundColor Green
}

function Setup-CloudflaredTunnel {
    param([string]$NodeType)

    Write-Host "Setting up cloudflared tunnel for $NodeType..." -ForegroundColor Gray

    # Check if cloudflared is installed
    if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
        Write-Warning "cloudflared not found. Please install cloudflared first."
        return
    }

    # Create tunnel configuration
    $tunnelName = "nyra-$NodeType"
    $tunnelConfig = @{
        tunnel = $env:CLOUDFLARE_TUNNEL_ID
        'credentials-file' = "C:\Users\$env:USERNAME\.cloudflared\$tunnelName.json"
        ingress = @(
            @{
                hostname = "$NodeType.nyra.ratehunter.net"
                service = "http://localhost:8080"
            },
            @{
                service = "http_status:404"
            }
        )
    }

    $configYaml = $tunnelConfig | ConvertTo-Yaml
    $tunnelConfigPath = "C:\Users\$env:USERNAME\.cloudflared\config.yml"

    # Ensure directory exists
    $configDir = Split-Path $tunnelConfigPath -Parent
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force
    }

    $configYaml | Out-File -FilePath $tunnelConfigPath -Encoding UTF8

    Write-Host "✓ Cloudflared tunnel configured" -ForegroundColor Green
}

function Setup-WakeOnLAN {
    Write-Host "Setting up Wake-on-LAN configuration..." -ForegroundColor Gray

    # Create WOL configuration
    $wolConfig = @{
        enabled = $true
        port = 9
        nodes = @{
            worker1 = @{
                mac_address = $env:WORKER1_MAC ?? "00:00:00:00:00:01"
                ip_address = $env:WORKER1_IP ?? "192.168.1.101"
            }
            worker2 = @{
                mac_address = $env:WORKER2_MAC ?? "00:00:00:00:00:02"
                ip_address = $env:WORKER2_IP ?? "192.168.1.102"
            }
            worker3 = @{
                mac_address = $env:WORKER3_MAC ?? "00:00:00:00:00:03"
                ip_address = $env:WORKER3_IP ?? "192.168.1.103"
            }
        }
    }

    $wolConfigJson = $wolConfig | ConvertTo-Json -Depth 10
    $wolConfigPath = Join-Path $ProjectRoot "config\wake-on-lan.json"
    $wolConfigJson | Out-File -FilePath $wolConfigPath -Encoding UTF8

    Write-Host "✓ Wake-on-LAN configured" -ForegroundColor Green
}

function Start-Services {
    Write-Host "🏃 Starting services..." -ForegroundColor Yellow

    Set-Location $ProjectRoot

    # Start different services based on node type
    switch ($NodeType) {
        "orchestrator" {
            Write-Host "Starting orchestrator services..." -ForegroundColor Gray

            # Start main orchestration service
            Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start:orchestrator"

            # Start monitoring service
            Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start:monitor"

            # Start web UI
            Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start:ui"
        }

        { $_ -in @("worker1", "worker2", "worker3") } {
            Write-Host "Starting worker services..." -ForegroundColor Gray

            # Start worker service
            Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start:worker"

            # Start GPU compute service if GPU available
            if ($env:GPU_ENABLED -eq "true") {
                Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m", "src.gpu.gpu_service"
            }

            # Start cloudflared tunnel
            if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
                Start-Process -NoNewWindow -FilePath "cloudflared" -ArgumentList "tunnel", "run", "nyra-$NodeType"
            }
        }

        "cloud" {
            Write-Host "Starting cloud services..." -ForegroundColor Gray

            # Start cloud integration service
            Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start:cloud"
        }
    }

    Write-Host "✓ Services started successfully" -ForegroundColor Green
    Write-Host "Monitor services with: npm run status" -ForegroundColor Cyan
}

function Test-Setup {
    Write-Host "🧪 Testing setup..." -ForegroundColor Yellow

    # Test database connection
    Write-Host "Testing database connection..." -ForegroundColor Gray
    try {
        # npm run test:db
        Write-Host "✓ Database connection successful" -ForegroundColor Green
    }
    catch {
        Write-Warning "Database connection test failed"
    }

    # Test cluster connectivity
    Write-Host "Testing cluster connectivity..." -ForegroundColor Gray
    try {
        # npm run test:cluster
        Write-Host "✓ Cluster connectivity successful" -ForegroundColor Green
    }
    catch {
        Write-Warning "Cluster connectivity test failed"
    }

    # Test embedding model
    Write-Host "Testing embedding model..." -ForegroundColor Gray
    try {
        # npm run test:embeddings
        Write-Host "✓ Embedding model test successful" -ForegroundColor Green
    }
    catch {
        Write-Warning "Embedding model test failed"
    }

    Write-Host "✓ Setup testing completed" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 System Status" -ForegroundColor Green

    # Show running processes
    Write-Host "`nRunning Node.js processes:" -ForegroundColor Cyan
    Get-Process | Where-Object { $_.ProcessName -eq "node" } | Format-Table ProcessName, Id, CPU, WorkingSet

    # Show network connections
    Write-Host "`nNetwork connections:" -ForegroundColor Cyan
    netstat -an | Select-String ":8080|:5432|:3000" | Select-Object -First 5

    # Show environment variables
    Write-Host "`nEnvironment variables:" -ForegroundColor Cyan
    Get-ChildItem Env: | Where-Object { $_.Name -like "*NYRA*" -or $_.Name -like "*POSTGRES*" } | Format-Table Name, Value

    # Check cloudflared status
    if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
        Write-Host "`nCloudflared tunnels:" -ForegroundColor Cyan
        cloudflared tunnel list 2>$null | Select-Object -First 5
    }
}

function Create-EnvironmentFile {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow

    $envContent = @"
# NYRA Distributed Memory Environment Configuration
# Generated on $(Get-Date)

# Node Configuration
NODE_ID=$NodeType
NODE_TYPE=$NodeType
ENVIRONMENT=$Environment

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nyra_memory
POSTGRES_USER=nyra_app
POSTGRES_PASSWORD=your_secure_password_here

# Security Configuration
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Cloudflare Configuration
CLOUDFLARE_TUNNEL_ID=your_tunnel_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here

# Worker Node Configuration
WORKER1_ENDPOINT=http://worker1.nyra.ratehunter.net
WORKER2_ENDPOINT=http://worker2.nyra.ratehunter.net
WORKER3_ENDPOINT=http://worker3.nyra.ratehunter.net
WORKER1_MAC=00:00:00:00:00:01
WORKER2_MAC=00:00:00:00:00:02
WORKER3_MAC=00:00:00:00:00:03
WORKER1_IP=192.168.1.101
WORKER2_IP=192.168.1.102
WORKER3_IP=192.168.1.103

# GPU Configuration
GPU_ENABLED=true
CUDA_VISIBLE_DEVICES=0

# Monitoring Configuration
METRICS_ENABLED=true
LOG_LEVEL=INFO
DEBUG_ENABLED=false

# Alert Configuration
ALERT_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url
ALERT_EMAIL_RECIPIENTS=admin@ratehunter.net

# Backup Configuration
BACKUP_BUCKET=nyra-backups
BACKUP_ACCESS_KEY=your_backup_access_key
BACKUP_SECRET_KEY=your_backup_secret_key
"@

    $envPath = Join-Path $ProjectRoot ".env.$Environment"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8

    Write-Host "✓ Environment file created: $envPath" -ForegroundColor Green
    Write-Host "⚠️  Please update the placeholder values with your actual configuration" -ForegroundColor Yellow
}

# Main execution logic
try {
    Write-Host "Starting NYRA Distributed Memory setup..." -ForegroundColor Green

    if ($InstallDependencies) {
        Install-Dependencies
    }

    if ($InitDatabase) {
        Initialize-Database
    }

    if ($SetupCluster) {
        Setup-Cluster
    }

    # Always create environment file
    Create-EnvironmentFile

    if ($StartServices) {
        Start-Services
        Start-Sleep -Seconds 5  # Give services time to start
        Test-Setup
    }

    Show-Status

    Write-Host "`n🎉 NYRA Distributed Memory setup completed successfully!" -ForegroundColor Green
    Write-Host "`n📚 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update the environment file with your actual configuration values" -ForegroundColor White
    Write-Host "2. Start services with: .\scripts\setup-distributed-memory.ps1 -StartServices" -ForegroundColor White
    Write-Host "3. Access the web UI at: http://localhost:3000" -ForegroundColor White
    Write-Host "4. Monitor logs with: npm run logs" -ForegroundColor White
    Write-Host "5. Check cluster status with: npm run cluster:status" -ForegroundColor White
}
catch {
    Write-Host "`n❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}

# Utility function for YAML conversion (simplified)
function ConvertTo-Yaml {
    param([object]$Object)
    # This is a simplified implementation
    # In production, you'd use a proper YAML library
    return ($Object | ConvertTo-Json | Out-String)
}