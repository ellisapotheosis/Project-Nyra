# MetaMCP Password Reset & Docker Migration Guide

## 🔐 MetaMCP Password Reset

### Method 1: Database Password Reset (Recommended)

If you have access to your MetaMCP database:

```powershell path=null start=null
# 1. Connect to your MetaMCP database
docker exec -it your_postgres_container psql -U postgres -d metamcp

# 2. Reset password directly in database
UPDATE users SET password = '$2b$12$hash_here' WHERE email = 'your@email.com';

# 3. Or create a new admin user
INSERT INTO users (id, email, password, role, created_at) 
VALUES (uuid_generate_v4(), 'admin@nyra.local', '$2b$12$new_hash', 'admin', NOW());
```

### Method 2: Environment Variable Reset

Add a default admin user via environment variables:

```yaml path=null start=null
# In your docker-compose.yml or .env file
environment:
  - ADMIN_EMAIL=admin@nyra.local
  - ADMIN_PASSWORD=your_new_password
  - RESET_ADMIN=true
```

### Method 3: Database Recreation

If all else fails, reset the entire database:

```powershell path=null start=null
# Stop MetaMCP
docker-compose down

# Remove the database volume (WARNING: This deletes all data!)
docker volume rm metamcp_postgres_data

# Start fresh
docker-compose up -d
```

## 🐳 Docker Migration to New Laptop

### What Transfers Automatically:
When you log into Docker Desktop on your new laptop, you get:
- ✅ **Docker Hub images** (public images you've pulled)
- ✅ **Your pushed repositories** (if you pushed to Docker Hub)
- ✅ **Account settings**

### What Does NOT Transfer:
- ❌ **Local Docker volumes** (your data)
- ❌ **Local containers** 
- ❌ **Custom built images** (unless pushed to registry)
- ❌ **Docker Compose configurations**
- ❌ **MCP Server Toolkit configurations**

### 📦 Pre-Migration Docker Backup Strategy

Run this on your current laptop:

```powershell path=null start=null
# Create backup directory
New-Item -Path "C:\Docker-Migration-Backup" -ItemType Directory -Force

# 1. Export all Docker images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | Out-File "C:\Docker-Migration-Backup\images-list.txt"

# 2. Save important images
$images = @(
    "falkordb/falkordb:latest",
    "qdrant/qdrant:latest", 
    "postgres:15",
    "redis:7-alpine",
    "your_custom_image:latest"
)

foreach ($image in $images) {
    $filename = ($image -replace "[/:]", "_") + ".tar"
    Write-Host "Saving $image to $filename..."
    docker save $image | gzip > "C:\Docker-Migration-Backup\$filename.gz"
}

# 3. Backup Docker volumes
docker volume ls -q | ForEach-Object {
    Write-Host "Backing up volume: $_"
    docker run --rm -v "$($_):/source" -v "C:\Docker-Migration-Backup\volumes:/backup" alpine tar czf "/backup/$($_).tar.gz" -C /source .
}

# 4. Export Docker Compose files
Copy-Item -Path "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra-old\nyra-core\nyra-mcp\metamcp\docker-compose.yml" -Destination "C:\Docker-Migration-Backup\"

# 5. Export MCP configurations
Copy-Item -Path "$env:APPDATA\NYRA-MCP" -Destination "C:\Docker-Migration-Backup\NYRA-MCP-Config" -Recurse -Force
```

### 🔄 New Laptop Restoration

On your new laptop after installing Docker:

```powershell path=null start=null
# 1. Restore Docker images
Get-ChildItem "C:\Docker-Migration-Backup\*.tar.gz" | ForEach-Object {
    Write-Host "Restoring image from $($_.Name)..."
    gunzip -c $_.FullName | docker load
}

# 2. Restore Docker volumes  
Get-ChildItem "C:\Docker-Migration-Backup\volumes\*.tar.gz" | ForEach-Object {
    $volumeName = $_.BaseName -replace ".tar", ""
    docker volume create $volumeName
    docker run --rm -v "$($volumeName):/target" -v "$($_.Directory.FullName):/backup" alpine tar xzf "/backup/$($_.Name)" -C /target
}

# 3. Restore Docker Compose
Copy-Item -Path "C:\Docker-Migration-Backup\docker-compose.yml" -Destination "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-core\nyra-mcp\metamcp\"

# 4. Restore MCP configurations
Copy-Item -Path "C:\Docker-Migration-Backup\NYRA-MCP-Config" -Destination "$env:APPDATA\NYRA-MCP" -Recurse -Force
```

## 🚀 Automated Migration Script

Create a comprehensive migration package:

```powershell path=null start=null
# Migration Package Creator
function New-DockerMigrationPackage {
    param(
        [string]$BackupPath = "C:\NYRA-Docker-Migration",
        [switch]$IncludeVolumes = $true
    )
    
    Write-Host "🚀 Creating NYRA Docker Migration Package..." -ForegroundColor Cyan
    
    New-Item -Path $BackupPath -ItemType Directory -Force
    
    # Create migration manifest
    $manifest = @{
        Created = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Source = $env:COMPUTERNAME
        DockerVersion = (docker --version)
        Images = @()
        Volumes = @()
        Compose = @()
    }
    
    # Backup MetaMCP specific containers and volumes
    $metamcpImages = docker images | Where-Object { $_ -match "metamcp|falkordb|qdrant|postgres|redis" }
    $metamcpVolumes = docker volume ls -q | Where-Object { $_ -match "metamcp|falkordb|qdrant|postgres|redis" }
    
    # Save images
    foreach ($image in $metamcpImages) {
        $imageName = ($image -split "\s+")[0]
        $tag = ($image -split "\s+")[1]
        $fullImage = "$imageName:$tag"
        $filename = ($fullImage -replace "[/:]", "_") + ".tar.gz"
        
        Write-Host "💾 Saving $fullImage..." -ForegroundColor Yellow
        docker save $fullImage | gzip > "$BackupPath\$filename"
        $manifest.Images += @{ Image = $fullImage; File = $filename }
    }
    
    # Save volumes if requested
    if ($IncludeVolumes) {
        New-Item -Path "$BackupPath\volumes" -ItemType Directory -Force
        foreach ($volume in $metamcpVolumes) {
            Write-Host "📦 Backing up volume $volume..." -ForegroundColor Yellow
            docker run --rm -v "$volume:/source" -v "$BackupPath\volumes:/backup" alpine tar czf "/backup/$volume.tar.gz" -C /source .
            $manifest.Volumes += $volume
        }
    }
    
    # Save compose files
    $composeFiles = Get-ChildItem -Path "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra-old" -Filter "*compose*.yml" -Recurse
    foreach ($file in $composeFiles) {
        Copy-Item $file.FullName -Destination "$BackupPath\" 
        $manifest.Compose += $file.Name
    }
    
    # Save manifest
    $manifest | ConvertTo-Json -Depth 3 | Set-Content "$BackupPath\migration-manifest.json"
    
    # Create restore script
    $restoreScript = @'
#!/usr/bin/env pwsh
# NYRA Docker Migration Restore Script

param([string]$BackupPath = "C:\NYRA-Docker-Migration")

Write-Host "🔄 Restoring NYRA Docker Environment..." -ForegroundColor Cyan

$manifest = Get-Content "$BackupPath\migration-manifest.json" | ConvertFrom-Json

# Restore images
foreach ($imageInfo in $manifest.Images) {
    Write-Host "📥 Loading $($imageInfo.Image)..." -ForegroundColor Green
    gunzip -c "$BackupPath\$($imageInfo.File)" | docker load
}

# Restore volumes
foreach ($volume in $manifest.Volumes) {
    Write-Host "📦 Restoring volume $volume..." -ForegroundColor Green
    docker volume create $volume
    docker run --rm -v "$volume:/target" -v "$BackupPath\volumes:/backup" alpine tar xzf "/backup/$volume.tar.gz" -C /target
}

Write-Host "✅ NYRA Docker migration complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy docker-compose files to your project directory" -ForegroundColor White
Write-Host "2. Run 'docker-compose up -d' to start services" -ForegroundColor White
Write-Host "3. Restore MCP configurations" -ForegroundColor White
'@
    
    Set-Content -Path "$BackupPath\Restore-NYRADocker.ps1" -Value $restoreScript
    
    Write-Host "✅ Migration package created at: $BackupPath" -ForegroundColor Green
    Write-Host "📋 Package contents:" -ForegroundColor Cyan
    Write-Host "   - Docker images: $($manifest.Images.Count)" -ForegroundColor White
    Write-Host "   - Docker volumes: $($manifest.Volumes.Count)" -ForegroundColor White  
    Write-Host "   - Compose files: $($manifest.Compose.Count)" -ForegroundColor White
    Write-Host "   - Restore script: Restore-NYRADocker.ps1" -ForegroundColor White
}

# Run the migration package creator
New-DockerMigrationPackage -BackupPath "C:\NYRA-Docker-Migration" -IncludeVolumes
```

## 🎯 Quick Migration Steps

### Current Laptop (Before Switch):
1. **Backup MetaMCP data**: `docker-compose exec postgres pg_dump -U postgres metamcp > metamcp-backup.sql`
2. **Run migration script**: `New-DockerMigrationPackage`
3. **Copy backup to cloud/external drive**

### New Laptop (After Docker Install):
1. **Install Docker Desktop** and log in
2. **Copy migration package** from backup
3. **Run restore script**: `.\Restore-NYRADocker.ps1`
4. **Restore MetaMCP database**: `cat metamcp-backup.sql | docker-compose exec -T postgres psql -U postgres metamcp`

## 🔧 MCP Server Toolkit Migration

The Docker MCP Toolkit configurations are stored locally, so you'll need to:

```powershell path=null start=null
# Backup MCP Toolkit configs
Copy-Item -Path "$env:APPDATA\.docker\mcp-servers" -Destination "C:\NYRA-Docker-Migration\mcp-toolkit" -Recurse -Force

# Restore on new laptop
Copy-Item -Path "C:\NYRA-Docker-Migration\mcp-toolkit" -Destination "$env:APPDATA\.docker\mcp-servers" -Recurse -Force
```

## ⚠️ Important Notes

1. **Test First**: Try the migration process with a test project first
2. **Database Backups**: Always backup your databases before migration
3. **Secrets**: You'll need to reconfigure API keys and secrets
4. **Network Settings**: Docker networks are recreated automatically
5. **File Permissions**: Some file permissions might need adjustment on the new system

Would you like me to create any specific migration scripts for your NYRA setup?