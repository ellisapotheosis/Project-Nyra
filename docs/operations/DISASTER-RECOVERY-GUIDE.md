# Project Nyra - Disaster Recovery Guide

**Purpose**: Comprehensive disaster recovery procedures for complete system restoration across all 4 PCs.

## 🚨 Critical Overview

**Recovery Time Objective (RTO)**: 4 hours
**Recovery Point Objective (RPO)**: 24 hours
**Backup Frequency**: Daily automated + Manual on-demand

## 📊 What Gets Backed Up

### PC1 - Orchestrator (Mac Mini)
```
✓ Nexus Router configuration and logs
✓ Letta PostgreSQL database (conversations)
✓ Mem0 PostgreSQL database (universal memory)
✓ ruvector vector database (agent memory)
✓ RuVector neural models and weights
✓ Claude Flow configuration and state
✓ Archon OS configuration and task history
✓ MCP server configurations
✓ Environment variables and secrets
```

### PC2 - Worker 2 (RTX 3060)
```
✓ TwentyCRM PostgreSQL database (leads, contacts)
✓ n8n PostgreSQL database (workflows)
✓ Dify PostgreSQL database (chat history)
✓ Redis data (caching, sessions)
✓ n8n workflow JSON exports
✓ Uploaded documents and assets
```

### PC3 - Worker 3 (RTX 5090)
```
✓ Ollama models directory (/root/.ollama)
✓ Neo4j graph database
✓ FalkorDB graph database
✓ Model weights and embeddings
```

### PC4 - Worker 4 (RTX 3090 Ti)
```
✓ Prometheus time-series data (7 days)
✓ Grafana dashboards and datasources
✓ Loki log aggregation data (7 days)
✓ Alert history and configurations
```

### Repository Backups (All PCs)
```
✓ Project-Nyra git repository
✓ archon-os repository
✓ archon-os repository
✓ ruvector repository
✓ ruvector-sdk repository
✓ Git commit history and branches
```

---

## 🔄 Automated Daily Backup

### Backup Schedule

| Time | PC | Services Backed Up |
|------|----|--------------------|
| 02:00 | PC1 | Orchestrator stack (Nexus, Letta, Mem0, ruvector) |
| 02:15 | PC2 | CRM stack (TwentyCRM, n8n, Dify, Redis) |
| 02:30 | PC3 | LLM stack (Ollama models, Neo4j, FalkorDB) |
| 02:45 | PC4 | Observability stack (Prometheus, Grafana, Loki) |
| 03:00 | All | Git repositories (all 5 repos) |

### Automated Backup Script

**File**: `scripts/backup-daily.ps1` (Windows) or `scripts/backup-daily.sh` (Unix)

```powershell
#Requires -Version 7.0

# Project Nyra - Automated Daily Backup Script
# Runs via Windows Task Scheduler at 2:00 AM daily

param(
    [string]$BackupRoot = "D:\NyraBackups",
    [int]$RetentionDays = 7,
    [switch]$FullBackup = $false
)

$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$BackupRoot\$timestamp"
$pcRole = $env:NYRA_PC_ROLE

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Project Nyra Daily Backup - $pcRole" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Timestamp: $timestamp" -ForegroundColor Yellow
Write-Host "Backup Directory: $backupDir" -ForegroundColor Yellow
Write-Host ""

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# ============================================
# PC-Specific Backup Functions
# ============================================

function Backup-Orchestrator {
    Write-Host "[PC1] Backing up orchestrator services..." -ForegroundColor Green

    # Nexus Router
    Write-Host "  [+] Nexus Router configuration..."
    docker exec nexus-router tar czf /tmp/nexus-config.tar.gz /config 2>$null
    docker cp nexus-router:/tmp/nexus-config.tar.gz "$backupDir\nexus-config.tar.gz"

    # Letta PostgreSQL
    Write-Host "  [+] Letta database..."
    docker exec postgres-letta pg_dump -U letta letta > "$backupDir\letta.sql"

    # Mem0 PostgreSQL
    Write-Host "  [+] Mem0 database..."
    docker exec postgres-mem0 pg_dump -U mem0 mem0 > "$backupDir\mem0.sql"

    # ruvector
    Write-Host "  [+] ruvector vector database..."
    docker exec ruvector ruvector-cli export --output /tmp/ruvector-export.json
    docker cp ruvector:/tmp/ruvector-export.json "$backupDir\ruvector-export.json"

    # RuVector Models
    Write-Host "  [+] RuVector neural models..."
    docker run --rm -v ruvector-models:/data -v "${backupDir}:/backup" alpine `
        tar czf /backup/ruvector-models.tar.gz /data

    # Claude Flow State
    Write-Host "  [+] Claude Flow state..."
    Copy-Item -Path "$env:NYRA_ROOT\.archon-os\*" -Destination "$backupDir\archon-os-state" -Recurse -Force

    # Archon OS State
    Write-Host "  [+] Archon OS state..."
    Copy-Item -Path "$env:NYRA_ROOT\.archon\*" -Destination "$backupDir\archon-state" -Recurse -Force

    Write-Host "  [✓] Orchestrator backup complete" -ForegroundColor Green
}

function Backup-Worker2 {
    Write-Host "[PC2] Backing up CRM services..." -ForegroundColor Green

    # TwentyCRM
    Write-Host "  [+] TwentyCRM database..."
    docker exec postgres-twentycrm pg_dump -U twentycrm twentycrm > "$backupDir\twentycrm.sql"

    # n8n
    Write-Host "  [+] n8n database..."
    docker exec postgres-n8n pg_dump -U n8n n8n > "$backupDir\n8n.sql"

    Write-Host "  [+] n8n workflows..."
    docker exec n8n n8n export:workflow --all --output=/tmp/n8n-workflows.json
    docker cp n8n:/tmp/n8n-workflows.json "$backupDir\n8n-workflows.json"

    # Dify
    Write-Host "  [+] Dify database..."
    docker exec postgres-dify pg_dump -U dify dify > "$backupDir\dify.sql"

    # Redis
    Write-Host "  [+] Redis snapshot..."
    docker exec redis redis-cli SAVE
    docker cp redis:/data/dump.rdb "$backupDir\redis-dump.rdb"

    # Uploaded Files
    Write-Host "  [+] Dify uploaded files..."
    docker run --rm -v dify-storage:/data -v "${backupDir}:/backup" alpine `
        tar czf /backup/dify-storage.tar.gz /data

    Write-Host "  [✓] CRM backup complete" -ForegroundColor Green
}

function Backup-Worker3 {
    Write-Host "[PC3] Backing up LLM services..." -ForegroundColor Green

    # Ollama Models
    Write-Host "  [+] Ollama models (this may take 15-30 minutes)..."
    docker run --rm -v ollama-data:/data -v "${backupDir}:/backup" alpine `
        tar czf /backup/ollama-models.tar.gz /data

    # Neo4j
    Write-Host "  [+] Neo4j graph database..."
    docker exec neo4j neo4j-admin dump --database=neo4j --to=/tmp/neo4j-dump.dump
    docker cp neo4j:/tmp/neo4j-dump.dump "$backupDir\neo4j-dump.dump"

    # FalkorDB
    Write-Host "  [+] FalkorDB graph database..."
    docker exec falkordb redis-cli SAVE
    docker cp falkordb:/data/dump.rdb "$backupDir\falkordb-dump.rdb"

    Write-Host "  [✓] LLM backup complete" -ForegroundColor Green
}

function Backup-Worker4 {
    Write-Host "[PC4] Backing up observability services..." -ForegroundColor Green

    # Prometheus
    Write-Host "  [+] Prometheus data..."
    docker run --rm -v prometheus-data:/data -v "${backupDir}:/backup" alpine `
        tar czf /backup/prometheus-data.tar.gz /data

    # Grafana
    Write-Host "  [+] Grafana dashboards and datasources..."
    docker exec grafana tar czf /tmp/grafana-config.tar.gz /etc/grafana /var/lib/grafana
    docker cp grafana:/tmp/grafana-config.tar.gz "$backupDir\grafana-config.tar.gz"

    # Loki
    Write-Host "  [+] Loki logs..."
    docker run --rm -v loki-data:/data -v "${backupDir}:/backup" alpine `
        tar czf /backup/loki-data.tar.gz /data

    Write-Host "  [✓] Observability backup complete" -ForegroundColor Green
}

function Backup-GitRepositories {
    Write-Host "[Git] Backing up all repositories..." -ForegroundColor Green

    $repos = @(
        "$env:NYRA_ROOT",
        "C:\Dev\Projects\archon-os",
        "C:\Dev\Projects\archon-os",
        "C:\Dev\Projects\ruvector",
        "C:\Dev\Projects\ruvector-sdk"
    )

    foreach ($repo in $repos) {
        if (Test-Path $repo) {
            $repoName = Split-Path -Leaf $repo
            Write-Host "  [+] $repoName..."

            Push-Location $repo
            git bundle create "$backupDir\$repoName.bundle" --all
            Pop-Location
        }
    }

    Write-Host "  [✓] Git repositories backed up" -ForegroundColor Green
}

function Backup-EnvironmentConfig {
    Write-Host "[Config] Backing up environment configuration..." -ForegroundColor Green

    # .env files
    Copy-Item -Path "$env:NYRA_ROOT\infra\.env*" -Destination "$backupDir\env-files\" -Force -ErrorAction SilentlyContinue

    # Docker Compose files
    Copy-Item -Path "$env:NYRA_ROOT\infra\docker-compose*.yml" -Destination "$backupDir\compose-files\" -Force

    # Claude settings
    Copy-Item -Path "$env:NYRA_ROOT\.claude\*" -Destination "$backupDir\claude-settings\" -Recurse -Force -ErrorAction SilentlyContinue

    # MCP configurations
    Copy-Item -Path "$env:NYRA_ROOT\.mcp.json" -Destination "$backupDir\" -Force -ErrorAction SilentlyContinue

    Write-Host "  [✓] Configuration backed up" -ForegroundColor Green
}

# ============================================
# Execute Backups Based on PC Role
# ============================================

switch ($pcRole) {
    "ORCHESTRATOR" { Backup-Orchestrator }
    "PC1" { Backup-Orchestrator }
    "WORKER-2" { Backup-Worker2 }
    "PC2" { Backup-Worker2 }
    "WORKER-3" { Backup-Worker3 }
    "PC3" { Backup-Worker3 }
    "WORKER-4" { Backup-Worker4 }
    "PC4" { Backup-Worker4 }
    default {
        Write-Host "[!] Unknown PC role: $pcRole" -ForegroundColor Red
        exit 1
    }
}

# Always backup git repos and environment config
Backup-GitRepositories
Backup-EnvironmentConfig

# ============================================
# Compress Backup Directory
# ============================================

Write-Host ""
Write-Host "Compressing backup..." -ForegroundColor Cyan
$archivePath = "$BackupRoot\nyra-$pcRole-$timestamp.7z"
& "C:\Program Files\7-Zip\7z.exe" a -t7z -mx=9 $archivePath $backupDir

$archiveSize = (Get-Item $archivePath).Length / 1MB
Write-Host "  [✓] Archive created: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Green

# Remove uncompressed directory
Remove-Item -Path $backupDir -Recurse -Force

# ============================================
# Cleanup Old Backups
# ============================================

Write-Host ""
Write-Host "Cleaning up old backups (retention: $RetentionDays days)..." -ForegroundColor Cyan
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupRoot -Filter "nyra-*.7z" | Where-Object {
    $_.LastWriteTime -lt $cutoffDate
} | ForEach-Object {
    Write-Host "  [x] Removing: $($_.Name)" -ForegroundColor Yellow
    Remove-Item -Path $_.FullName -Force
}

# ============================================
# Summary
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Backup Complete - $pcRole" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archive: $archivePath" -ForegroundColor Yellow
Write-Host "Size: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backup includes:" -ForegroundColor Cyan
switch ($pcRole) {
    {$_ -in "ORCHESTRATOR", "PC1"} {
        Write-Host "  ✓ Nexus Router, Letta, Mem0, ruvector, RuVector"
    }
    {$_ -in "WORKER-2", "PC2"} {
        Write-Host "  ✓ TwentyCRM, n8n, Dify, Redis"
    }
    {$_ -in "WORKER-3", "PC3"} {
        Write-Host "  ✓ Ollama models, Neo4j, FalkorDB"
    }
    {$_ -in "WORKER-4", "PC4"} {
        Write-Host "  ✓ Prometheus, Grafana, Loki"
    }
}
Write-Host "  ✓ Git repositories (5 repos)"
Write-Host "  ✓ Environment configuration"
Write-Host ""
```

---

## 🔧 Manual Backup Procedures

### Full System Backup (All 4 PCs)

```powershell
# Run on each PC simultaneously
# PC1
.\scripts\backup-daily.ps1 -FullBackup

# PC2
.\scripts\backup-daily.ps1 -FullBackup

# PC3
.\scripts\backup-daily.ps1 -FullBackup

# PC4
.\scripts\backup-daily.ps1 -FullBackup
```

### Single Service Backup

```powershell
# Example: Backup only TwentyCRM database
docker exec postgres-twentycrm pg_dump -U twentycrm twentycrm > twentycrm-manual-backup.sql

# Example: Backup only n8n workflows
docker exec n8n n8n export:workflow --all --output=/tmp/workflows.json
docker cp n8n:/tmp/workflows.json ./n8n-workflows-backup.json
```

---

## 🚑 Disaster Recovery Procedures

### Scenario 1: Single PC Failure

**Problem**: One PC (e.g., PC2) hardware failure
**Impact**: CRM services down (TwentyCRM, n8n, Dify)
**RTO**: 2 hours

#### Recovery Steps:

```powershell
# Step 1: Restore from latest backup
$latestBackup = Get-ChildItem D:\NyraBackups -Filter "nyra-PC2-*.7z" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Step 2: Extract backup
& "C:\Program Files\7-Zip\7z.exe" x $latestBackup.FullName -oD:\RestoreTemp

# Step 3: Restore databases
docker-compose up -d postgres-twentycrm postgres-n8n postgres-dify redis

# Wait for databases to initialize (30 seconds)
Start-Sleep -Seconds 30

# Restore TwentyCRM
Get-Content D:\RestoreTemp\twentycrm.sql | docker exec -i postgres-twentycrm psql -U twentycrm twentycrm

# Restore n8n
Get-Content D:\RestoreTemp\n8n.sql | docker exec -i postgres-n8n psql -U n8n n8n

# Restore Dify
Get-Content D:\RestoreTemp\dify.sql | docker exec -i postgres-dify psql -U dify dify

# Restore Redis
docker cp D:\RestoreTemp\redis-dump.rdb redis:/data/dump.rdb
docker-compose restart redis

# Step 4: Restore Docker volumes
docker run --rm -v dify-storage:/data -v D:\RestoreTemp:/backup alpine `
    tar xzf /backup/dify-storage.tar.gz -C /data

# Step 5: Import n8n workflows
docker cp D:\RestoreTemp\n8n-workflows.json n8n:/tmp/workflows.json
docker exec n8n n8n import:workflow --input=/tmp/workflows.json

# Step 6: Bring up all services
docker-compose --profile worker-2 up -d

# Step 7: Verify
.\scripts\health-check-all.ps1
```

### Scenario 2: Complete Infrastructure Loss

**Problem**: All 4 PCs lost (fire, flood, theft)
**Impact**: Complete system down
**RTO**: 8 hours (4 hours setup + 4 hours restore)

#### Prerequisites:
- Off-site backup copy (NAS, cloud storage, external drive)
- New/replacement hardware
- Network infrastructure restored
- Internet connectivity

#### Recovery Steps:

```powershell
# ==================================================
# PHASE 1: Hardware Setup (2 hours)
# ==================================================

# PC1 - Install macOS on Mac Mini
# - Install Homebrew
# - Install Docker Desktop
# - Configure static IP 10.0.0.1

# PC2/3/4 - Install Windows 11 Pro
# - Install Docker Desktop
# - Install NVIDIA Container Toolkit (PC2/3/4)
# - Configure static IPs (10.0.0.2, 10.0.0.3, 10.0.0.4)

# ==================================================
# PHASE 2: Clone Repositories (1 hour)
# ==================================================

# On each PC, restore from git bundles
$repos = @(
    @{Name="Project-Nyra"; Path="C:\Dev\Projects\Repos\Project-Nyra"},
    @{Name="archon-os"; Path="C:\Dev\Projects\archon-os"},
    @{Name="archon-os"; Path="C:\Dev\Projects\archon-os"},
    @{Name="ruvector"; Path="C:\Dev\Projects\ruvector"},
    @{Name="ruvector-sdk"; Path="C:\Dev\Projects\ruvector-sdk"}
)

foreach ($repo in $repos) {
    git clone D:\OffSiteBackup\$($repo.Name).bundle $repo.Path
    cd $repo.Path
    git checkout main
}

# ==================================================
# PHASE 3: Restore Configuration (30 minutes)
# ==================================================

# Copy environment files
Copy-Item D:\OffSiteBackup\env-files\* C:\Dev\Projects\Repos\Project-Nyra\infra\

# Copy Docker Compose files
Copy-Item D:\OffSiteBackup\compose-files\* C:\Dev\Projects\Repos\Project-Nyra\infra\

# Copy Claude settings
Copy-Item D:\OffSiteBackup\claude-settings\* C:\Dev\Projects\Repos\Project-Nyra\.claude\ -Recurse

# ==================================================
# PHASE 4: Restore Data (2 hours)
# ==================================================

# PC1 - Orchestrator
.\NYRA-AIO-Bootstrap\scripts\restore-orchestrator.ps1 -BackupPath D:\OffSiteBackup

# PC2 - Worker 2
.\NYRA-AIO-Bootstrap\scripts\restore-worker-2.ps1 -BackupPath D:\OffSiteBackup

# PC3 - Worker 3 (longest - Ollama models)
.\NYRA-AIO-Bootstrap\scripts\restore-worker-3.ps1 -BackupPath D:\OffSiteBackup

# PC4 - Worker 4
.\NYRA-AIO-Bootstrap\scripts\restore-worker-4.ps1 -BackupPath D:\OffSiteBackup

# ==================================================
# PHASE 5: Verification (30 minutes)
# ==================================================

# Health check all services
.\scripts\health-check-all.ps1

# Test critical workflows
# 1. Generate test quote
# 2. Trigger n8n campaign
# 3. Chat with Dify interface
# 4. View Grafana dashboards

# ==================================================
# PHASE 6: Resume Operations (immediate)
# ==================================================

# Announce system restored
# Monitor for 24 hours
# Schedule next full backup
```

### Scenario 3: Database Corruption

**Problem**: PostgreSQL database corrupted (e.g., TwentyCRM)
**Impact**: CRM data inaccessible
**RTO**: 30 minutes

#### Recovery Steps:

```powershell
# Step 1: Stop the affected service
docker-compose stop twentycrm

# Step 2: Drop corrupted database
docker exec postgres-twentycrm psql -U postgres -c "DROP DATABASE twentycrm;"
docker exec postgres-twentycrm psql -U postgres -c "CREATE DATABASE twentycrm OWNER twentycrm;"

# Step 3: Restore from latest backup
$latestBackup = Get-ChildItem D:\NyraBackups -Filter "*twentycrm.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-Content $latestBackup.FullName | docker exec -i postgres-twentycrm psql -U twentycrm twentycrm

# Step 4: Verify data integrity
docker exec postgres-twentycrm psql -U twentycrm twentycrm -c "SELECT COUNT(*) FROM leads;"

# Step 5: Restart service
docker-compose start twentycrm
```

---

## 📦 Off-Site Backup Strategy

### Recommended Approach: 3-2-1 Rule

**3 Copies**: Primary + Local backup + Off-site backup
**2 Media Types**: SSD/HDD + Cloud/NAS
**1 Off-Site**: External location

### Implementation:

```powershell
# Automated cloud upload (runs after daily backup)
# File: scripts/backup-to-cloud.ps1

param(
    [string]$LocalBackupPath = "D:\NyraBackups",
    [string]$CloudProvider = "aws_s3",  # or "azure_blob", "google_drive"
    [string]$BucketName = "nyra-disaster-recovery"
)

# Get today's backups
$todayBackups = Get-ChildItem -Path $LocalBackupPath -Filter "nyra-*-$(Get-Date -Format 'yyyyMMdd')*.7z"

foreach ($backup in $todayBackups) {
    Write-Host "Uploading: $($backup.Name)"

    switch ($CloudProvider) {
        "aws_s3" {
            aws s3 cp $backup.FullName "s3://$BucketName/$($backup.Name)" --storage-class GLACIER_IR
        }
        "azure_blob" {
            az storage blob upload --account-name nyrabackups --container-name disaster-recovery `
                --name $backup.Name --file $backup.FullName --tier Cool
        }
        "google_drive" {
            rclone copy $backup.FullName "google_drive:NyraBackups/"
        }
    }

    Write-Host "  [✓] Uploaded to $CloudProvider"
}
```

### Manual Off-Site Backup (Monthly)

```powershell
# Copy all backups to external drive
$externalDrive = "E:"  # Adjust to your external drive letter
Copy-Item -Path "D:\NyraBackups\*" -Destination "$externalDrive\NyraBackups\" -Recurse -Force

# Store external drive off-site (safe, fireproof location)
```

---

## ✅ Recovery Testing Schedule

**Monthly**: Test single service restoration
**Quarterly**: Test single PC restoration
**Annually**: Test complete infrastructure restoration

### Test Script

```powershell
# File: scripts/test-disaster-recovery.ps1

Write-Host "Disaster Recovery Test - Single Service Restoration" -ForegroundColor Cyan

# Step 1: Create test container
docker run -d --name test-postgres -e POSTGRES_PASSWORD=test postgres:15

# Step 2: Restore latest backup
$latestBackup = Get-ChildItem D:\NyraBackups -Filter "*twentycrm.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-Content $latestBackup.FullName | docker exec -i test-postgres psql -U postgres

# Step 3: Verify data
$recordCount = docker exec test-postgres psql -U postgres -d twentycrm -t -c "SELECT COUNT(*) FROM leads;"
Write-Host "Restored records: $recordCount" -ForegroundColor Green

# Step 4: Cleanup
docker rm -f test-postgres

Write-Host "[✓] Disaster recovery test passed" -ForegroundColor Green
```

---

## 📞 Emergency Contacts

| Role | Name | Contact | Responsibility |
|------|------|---------|----------------|
| System Administrator | [Your Name] | [Phone] | Overall system recovery |
| Database Administrator | [DBA Name] | [Phone] | Database restoration |
| Network Administrator | [Network Admin] | [Phone] | Network infrastructure |
| Cloud Provider Support | AWS/Azure/GCP | [Support Number] | Off-site backup access |

---

## 📋 Recovery Checklist

### Pre-Disaster Preparation
- [ ] Daily backups running automatically
- [ ] Off-site backups configured
- [ ] Recovery procedures documented
- [ ] Recovery testing completed (last 90 days)
- [ ] Emergency contacts updated
- [ ] Hardware replacement plan documented

### During Recovery
- [ ] Assess damage and determine recovery scope
- [ ] Notify stakeholders of outage
- [ ] Acquire replacement hardware if needed
- [ ] Retrieve off-site backups
- [ ] Follow recovery procedures for affected PCs
- [ ] Verify data integrity
- [ ] Run comprehensive health checks
- [ ] Test critical workflows
- [ ] Document lessons learned

### Post-Recovery
- [ ] Resume normal operations
- [ ] Monitor system for 72 hours
- [ ] Schedule next full backup
- [ ] Update disaster recovery documentation
- [ ] Conduct post-mortem meeting
- [ ] Improve recovery procedures based on learnings

---

**Last Updated**: 2026-01-13
**Next Review**: 2026-04-13 (Quarterly)
