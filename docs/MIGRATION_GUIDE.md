# Nyra Docker/WSL Migration Guide

This guide walks you through migrating your Nyra development environment from Windows-native to a containerized WSL2 setup.

## Prerequisites

- Windows 10/11 with WSL2 enabled
- Docker Desktop installed and running
- Visual Studio Code with Remote-WSL extension
- Git configured with your credentials
- At least 16GB RAM and 100GB free disk space

## Migration Overview

The migration transforms your current Windows development setup into:
- **WSL2 Ubuntu 22.04** for the Linux environment
- **Docker Compose** for service orchestration
- **Development Containers** for consistent environments
- **MetaMCP Gateway** for centralized MCP server management
- **Volume optimization** for performance

## Step 1: Pre-Migration Checklist

### 1.1 Backup Current Environment
```powershell
# Run the automated migration script
.\scripts\migrate-to-wsl.ps1 -DryRun

# Or manual backup
git bundle create nyra-backup.bundle --all
Copy-Item . C:\Nyra-Backup -Recurse -Exclude @(".git", "node_modules")
```

### 1.2 Commit All Changes
```bash
git add .
git commit -m "Pre-migration checkpoint"
git push origin main
```

### 1.3 Document Current Configuration
```powershell
# Save current environment info
@{
    NodeVersion = node --version
    VoltaVersion = volta --version
    InstalledPackages = npm list -g --depth=0
} | ConvertTo-Json | Out-File environment-snapshot.json
```

## Step 2: WSL2 Environment Setup

### 2.1 Install Ubuntu Distribution
```powershell
# Install Ubuntu 22.04
wsl --install -d Ubuntu-22.04

# Set as default
wsl --set-default Ubuntu-22.04
```

### 2.2 Configure WSL Settings
Create `%USERPROFILE%\.wslconfig`:
```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
kernelCommandLine=vsyscall=emulate

[experimental]
sparseVhd=true
autoMemoryReclaim=gradual
```

### 2.3 First-Time Ubuntu Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential

# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf false
git config --global core.eol lf
```

## Step 3: Docker Configuration

### 3.1 Verify Docker Desktop WSL Integration
1. Open Docker Desktop
2. Go to Settings → Resources → WSL Integration
3. Enable integration with Ubuntu-22.04
4. Click "Apply & Restart"

### 3.2 Test Docker in WSL
```bash
# In WSL terminal
docker --version
docker-compose --version
```

## Step 4: Project Migration

### 4.1 Clone Project in WSL
```bash
# Navigate to your projects directory
cd /mnt/c/Dev/devprojects/personal-projects

# Or create a new location in WSL home
mkdir -p ~/projects
cd ~/projects
git clone /mnt/c/Dev/devprojects/personal-projects/project-nyra nyra-containerized
cd nyra-containerized
```

### 4.2 Run Migration Script
```powershell
# From Windows PowerShell in project root
.\scripts\migrate-to-wsl.ps1
```

Or manual migration:
```bash
# In WSL, in project directory
# Migration files should already be created by the orchestrator
ls -la .devcontainer/
ls -la docker-compose.dev.yml
```

### 4.3 Verify Migration Files
Ensure these files exist:
- `.devcontainer/devcontainer.json`
- `.devcontainer/post-create.sh`
- `.devcontainer/post-start.sh`
- `docker-compose.dev.yml`
- `infra/docker/*/Dockerfile.*`

## Step 5: Container Setup

### 5.1 Build Development Environment
```bash
# Build all containers
docker-compose -f docker-compose.dev.yml build

# Start services
docker-compose -f docker-compose.dev.yml up -d
```

### 5.2 Verify Services
```bash
# Check service status
docker-compose -f docker-compose.dev.yml ps

# Check logs
docker-compose -f docker-compose.dev.yml logs
```

## Step 6: VS Code Integration

### 6.1 Open in VS Code
```bash
# From WSL terminal in project directory
code .
```

Or from Windows:
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Remote-WSL: New Window"
4. Navigate to project directory

### 6.2 Open in Dev Container
1. VS Code should detect the dev container configuration
2. Click "Reopen in Container" notification
3. Or use `Ctrl+Shift+P` → "Dev Containers: Rebuild and Reopen in Container"

## Step 7: Environment Configuration

### 7.1 Configure Secrets
```bash
# In development container terminal
infisical login
infisical run -- docker-compose ps
```

### 7.2 Initialize Claude Flow
```bash
# Initialize with SPARC methodology
npx claude-flow@alpha init --sparc

# Start Claude Flow UI
npx claude-flow@alpha start --ui
```

### 7.3 Configure MCP Servers
```bash
# Add Claude Flow MCP
claude mcp add claude-flow npx claude-flow@alpha mcp start

# The MetaMCP gateway should automatically aggregate other MCP servers
```

## Step 8: Verification and Testing

### 8.1 Service Health Checks
```bash
# Check all services
curl http://localhost:3000  # Nyra Web UI
curl http://localhost:8000  # Nyra Orchestrator
curl http://localhost:8005  # MetaMCP Gateway
curl http://localhost:8001/api/v1/heartbeat  # ChromaDB
```

### 8.2 Database Connectivity
```bash
# PostgreSQL
pg_isready -h localhost -p 5432 -U nyra

# FalkorDB
redis-cli -h localhost -p 6379 ping

# ChromaDB
curl http://localhost:8001/api/v1/heartbeat
```

### 8.3 Development Workflow Test
```bash
# Test hot reload
echo "console.log('Hot reload test');" >> test-file.js
# Verify that containers detect file changes
```

## Step 9: Performance Optimization

### 9.1 File Watching Configuration
Add to VS Code settings.json:
```json
{
    "remote.WSL.fileWatcher.polling": true,
    "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/.git/objects/**": true
    }
}
```

### 9.2 Docker Performance
```bash
# Clean up unused containers/images
docker system prune -f

# Monitor resource usage
docker stats
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using a port
netstat -tulpn | grep :3000

# Kill process if needed
sudo fuser -k 3000/tcp
```

#### 2. Volume Mount Issues
```bash
# Check volume mounts
docker inspect container_name | grep -A 10 "Mounts"

# Fix permissions
sudo chown -R vscode:vscode /workspace
```

#### 3. WSL File Performance
```bash
# Move project to WSL filesystem for better performance
cp -r /mnt/c/Dev/projects/nyra ~/projects/nyra
```

#### 4. Docker Daemon Issues
```bash
# Restart Docker daemon in WSL
sudo service docker restart

# Or restart Docker Desktop from Windows
```

### Service-Specific Issues

#### Claude Flow Not Starting
```bash
# Check Claude Flow logs
npx claude-flow@alpha logs

# Reinitialize if needed
rm -rf .claude-flow
npx claude-flow@alpha init --sparc
```

#### Database Connection Issues
```bash
# Check database container logs
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs falkordb
docker-compose -f docker-compose.dev.yml logs chromadb
```

#### MCP Server Issues
```bash
# Check MCP server status
claude mcp list

# Restart MetaMCP gateway
docker-compose -f docker-compose.dev.yml restart metamcp-gateway
```

## Rollback Procedures

### Complete Rollback to Windows
1. Stop all containers: `docker-compose -f docker-compose.dev.yml down`
2. Navigate to backup location
3. Restore project files
4. Restore git repository: `git clone backup.bundle restored-project`
5. Install Node.js/npm as per backup environment info
6. Run `npm install`

### Partial Rollback (Keep WSL, Remove Containers)
1. Stop containers: `docker-compose down`
2. Continue development in WSL without containers
3. Use native Node.js/npm in WSL

## Post-Migration Checklist

- [ ] All services start successfully
- [ ] Web UI accessible at http://localhost:3000
- [ ] Claude Flow UI accessible
- [ ] Database connections working
- [ ] MCP servers responding
- [ ] Git operations working
- [ ] Hot reload functioning
- [ ] Infisical secrets accessible
- [ ] VS Code extensions working
- [ ] Performance satisfactory

## Benefits Achieved

After successful migration:

### Development Experience
- **Consistent Environment**: All developers use identical containers
- **Faster Onboarding**: New team members can start with `docker-compose up`
- **Better Isolation**: Services don't interfere with host system
- **Easy Testing**: Spin up clean environments for testing

### Operational Benefits
- **Scalability**: Easy horizontal scaling of services
- **Monitoring**: Container-level observability
- **Maintenance**: Infrastructure as Code
- **Security**: Better isolation and secrets management

### Performance Benefits
- **Resource Control**: Container-level resource limits
- **Caching**: Docker layer caching for builds
- **Networking**: Optimized container-to-container communication

## Next Steps

1. **Team Onboarding**: Share migration guide with team
2. **CI/CD Integration**: Configure GitHub Actions for containerized builds
3. **Production Deployment**: Adapt containers for production use
4. **Monitoring Setup**: Implement container monitoring and logging
5. **Documentation**: Update all project documentation for new setup

## Support

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs [service-name]`
3. Check WSL status: `wsl --status`
4. Verify Docker Desktop WSL integration
5. Consult backup and rollback procedures if needed

The migration provides a robust, scalable, and consistent development environment that will serve the project well as it grows and evolves.