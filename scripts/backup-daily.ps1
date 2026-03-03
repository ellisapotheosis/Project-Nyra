# Project Nyra - Daily Backup Script
# Automated backup of all critical data and configurations

param(
    [string]$BackupDir = ".\backups",
    [switch]$CompressBackups = $true,
    [int]$RetentionDays = 7,
    [switch]$IncludeDockerVolumes = $true
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dateFolder = Get-Date -Format "yyyyMMdd"
$backupPath = Join-Path $BackupDir $dateFolder

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Project Nyra Daily Backup" -ForegroundColor Cyan
Write-Host "  Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-Host "Created backup directory: $backupPath" -ForegroundColor Green
}

# Function to log with timestamp
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$ts] $Message" -ForegroundColor $color
}

# 1. Backup PostgreSQL Databases
Write-Log "Backing up PostgreSQL databases..." "INFO"

$databases = @(
    @{Container="postgres-twentycrm"; DB="twentycrm"; User="twentycrm"},
    @{Container="postgres-n8n"; DB="n8n"; User="n8n"},
    @{Container="postgres-dify"; DB="dify"; User="dify"}
)

foreach ($db in $databases) {
    $dumpFile = Join-Path $backupPath "$($db.Container)-$timestamp.sql"

    try {
        Write-Log "  Dumping $($db.DB)..." "INFO"
        docker exec $db.Container pg_dump -U $db.User $db.DB > $dumpFile

        if (Test-Path $dumpFile) {
            $size = (Get-Item $dumpFile).Length / 1MB
            Write-Log "  ✓ $($db.DB) backed up ($([math]::Round($size, 2)) MB)" "SUCCESS"
        }
    } catch {
        Write-Log "  ✗ Failed to backup $($db.DB): $_" "ERROR"
    }
}

# 2. Backup Redis Data
Write-Log "Backing up Redis data..." "INFO"

$redisContainers = @("redis-orchestrator", "redis-worker")
foreach ($container in $redisContainers) {
    try {
        $rdbFile = Join-Path $backupPath "$container-$timestamp.rdb"
        docker exec $container redis-cli SAVE
        docker cp "${container}:/data/dump.rdb" $rdbFile
        Write-Log "  ✓ $container backed up" "SUCCESS"
    } catch {
        Write-Log "  ✗ Failed to backup $container: $_" "WARNING"
    }
}

# 3. Backup AgentDB (HNSW vector database)
Write-Log "Backing up AgentDB..." "INFO"
try {
    $agentdbBackup = Join-Path $backupPath "agentdb-$timestamp"
    docker exec agentdb tar czf /tmp/backup.tar.gz /app/data
    docker cp agentdb:/tmp/backup.tar.gz "$agentdbBackup.tar.gz"
    Write-Log "  ✓ AgentDB backed up" "SUCCESS"
} catch {
    Write-Log "  ✗ Failed to backup AgentDB: $_" "WARNING"
}

# 4. Backup Environment Configuration
Write-Log "Backing up environment configuration..." "INFO"

$configFiles = @(
    ".env",
    "master-.env.example",
    ".mcp.json",
    ".claude/settings.json",
    "infra/docker-compose.orchestrator.yml",
    "infra/docker-compose.worker.yml"
)

$configBackup = Join-Path $backupPath "config-$timestamp"
New-Item -ItemType Directory -Path $configBackup -Force | Out-Null

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $destPath = Join-Path $configBackup (Split-Path $file -Leaf)
        Copy-Item $file $destPath -Force
        Write-Log "  ✓ Backed up $file" "SUCCESS"
    }
}

# 5. Backup n8n Workflows
Write-Log "Backing up n8n workflows..." "INFO"
try {
    $n8nBackup = Join-Path $backupPath "n8n-workflows-$timestamp.json"
    docker exec n8n n8n export:workflow --all --output=/tmp/workflows.json
    docker cp n8n:/tmp/workflows.json $n8nBackup
    Write-Log "  ✓ n8n workflows backed up" "SUCCESS"
} catch {
    Write-Log "  ✗ Failed to backup n8n workflows: $_" "WARNING"
}

# 6. Backup Docker Volumes (optional)
if ($IncludeDockerVolumes) {
    Write-Log "Backing up Docker volumes..." "INFO"

    $volumes = @(
        "letta-data",
        "mem0-data",
        "ollama-data",
        "neo4j-data",
        "grafana-data",
        "prometheus-data"
    )

    foreach ($volume in $volumes) {
        try {
            $volumeBackup = Join-Path $backupPath "$volume-$timestamp.tar.gz"
            docker run --rm -v "${volume}:/data" -v "${backupPath}:/backup" alpine tar czf "/backup/$(Split-Path $volumeBackup -Leaf)" /data
            Write-Log "  ✓ Backed up volume: $volume" "SUCCESS"
        } catch {
            Write-Log "  ✗ Failed to backup volume $volume: $_" "WARNING"
        }
    }
}

# 7. Compress Backups (optional)
if ($CompressBackups) {
    Write-Log "Compressing backup archive..." "INFO"

    $archiveName = "nyra-backup-$timestamp.zip"
    $archivePath = Join-Path $BackupDir $archiveName

    try {
        Compress-Archive -Path $backupPath -DestinationPath $archivePath -CompressionLevel Optimal

        $archiveSize = (Get-Item $archivePath).Length / 1MB
        Write-Log "  ✓ Backup compressed: $archiveName ($([math]::Round($archiveSize, 2)) MB)" "SUCCESS"

        # Remove uncompressed backup
        Remove-Item -Path $backupPath -Recurse -Force
        Write-Log "  ✓ Cleaned up uncompressed backup" "SUCCESS"
    } catch {
        Write-Log "  ✗ Failed to compress backup: $_" "ERROR"
    }
}

# 8. Cleanup Old Backups
Write-Log "Cleaning up old backups (retention: $RetentionDays days)..." "INFO"

$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldBackups = Get-ChildItem -Path $BackupDir -Directory | Where-Object { $_.CreationTime -lt $cutoffDate }

foreach ($old in $oldBackups) {
    try {
        Remove-Item -Path $old.FullName -Recurse -Force
        Write-Log "  ✓ Removed old backup: $($old.Name)" "SUCCESS"
    } catch {
        Write-Log "  ✗ Failed to remove $($old.Name): $_" "WARNING"
    }
}

# Cleanup old archives
$oldArchives = Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.CreationTime -lt $cutoffDate }
foreach ($old in $oldArchives) {
    try {
        Remove-Item -Path $old.FullName -Force
        Write-Log "  ✓ Removed old archive: $($old.Name)" "SUCCESS"
    } catch {
        Write-Log "  ✗ Failed to remove $($old.Name): $_" "WARNING"
    }
}

# 9. Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Backup Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($CompressBackups) {
    Write-Host "Backup Archive: $archivePath" -ForegroundColor Green
} else {
    Write-Host "Backup Directory: $backupPath" -ForegroundColor Green
}

$totalSize = 0
if ($CompressBackups) {
    $totalSize = (Get-Item $archivePath).Length / 1GB
} else {
    $totalSize = (Get-ChildItem -Path $backupPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB
}

Write-Host "Total Backup Size: $([math]::Round($totalSize, 2)) GB" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Store backup in remote location (cloud storage, NAS)" -ForegroundColor White
Write-Host "  2. Test restore procedure regularly" -ForegroundColor White
Write-Host "  3. Verify backup integrity" -ForegroundColor White
Write-Host ""
