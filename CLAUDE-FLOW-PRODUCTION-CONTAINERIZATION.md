# Claude-Flow Production Containerization

**Generated**: 2026-01-13
**Status**: Planning Phase
**Agent**: agent-claudeflow-prod

---

## 🎯 Objective

Containerize `claude-flow@3.0.0-alpha.42` for production deployment with PowerShell wrapper for seamless CLI integration.

---

## 📦 Current State

### Development Setup
```
Location: C:\Dev\Projects\Repos\Project-Nyra\submodules\claude-flow
Version: 3.0.0-alpha.42
Type: Symlinked npm package
Usage: npx claude-flow [command]
```

### Issues with Development Setup
- Requires Node.js environment on each machine
- Dependency installation needed
- Version management complexity
- Not suitable for production deployment
- Difficult to distribute to team

---

## 🐳 Containerization Strategy

### Dockerfile Design

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the project
RUN pnpm build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create data directories
RUN mkdir -p /data/memory \
             /data/agents \
             /data/tasks \
             /data/logs \
    && chmod -R 777 /data

# Set environment variables
ENV NODE_ENV=production
ENV CLAUDE_FLOW_DATA_DIR=/data
ENV CLAUDE_FLOW_CONFIG_DIR=/config

# Expose ports (if needed for API)
EXPOSE 8080

# Entry point
ENTRYPOINT ["node", "dist/cli.js"]
CMD ["--help"]
```

### Docker Compose Integration

```yaml
# Add to docker-compose.dev.yml or docker-compose.prod.yml
services:
  claude-flow:
    build:
      context: ./submodules/claude-flow
      dockerfile: Dockerfile
    image: nyra/claude-flow:3.0.0-alpha.42
    container_name: nyra-claude-flow
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - CLAUDE_FLOW_DATA_DIR=/data
      - CLAUDE_FLOW_CONFIG_DIR=/config
    volumes:
      - claude-flow-data:/data
      - claude-flow-config:/config
      - ./:/workspace:ro  # Mount project for file access
    networks:
      - nyra-network
    command: daemon start

volumes:
  claude-flow-data:
    driver: local
  claude-flow-config:
    driver: local
```

---

## 🔧 PowerShell Wrapper

### claude-flow.ps1 (Main CLI Wrapper)

```powershell
#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Claude Flow CLI - PowerShell wrapper for containerized claude-flow

.DESCRIPTION
    Provides seamless CLI experience for claude-flow running in Docker container

.PARAMETER Command
    The claude-flow command to execute (e.g., init, swarm, agent, task)

.PARAMETER Arguments
    Additional arguments to pass to the command

.EXAMPLE
    .\claude-flow.ps1 init
    .\claude-flow.ps1 swarm status
    .\claude-flow.ps1 agent spawn coder
    .\claude-flow.ps1 task create --type feature --description "Add new feature"

.NOTES
    Version: 1.0.0
    Author: Project Nyra Team
#>

param(
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$Command,

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$ErrorActionPreference = "Stop"

# Configuration
$ImageName = "nyra/claude-flow:3.0.0-alpha.42"
$ContainerName = "nyra-claude-flow"
$DataVolume = "claude-flow-data"
$ConfigVolume = "claude-flow-config"
$NetworkName = "nyra-network"
$WorkspaceMount = "$PWD"

# Color output functions
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host $Message -ForegroundColor Red }

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Failure "❌ Docker is not running. Please start Docker Desktop."
        exit 1
    }
}

# Check if claude-flow container exists
function Test-ContainerExists {
    $exists = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
    return ($exists -eq $ContainerName)
}

# Check if claude-flow container is running
function Test-ContainerRunning {
    $running = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
    return ($running -eq $ContainerName)
}

# Start claude-flow daemon
function Start-ClaudeFlowDaemon {
    Write-Info "🚀 Starting claude-flow daemon..."

    if (Test-ContainerRunning) {
        Write-Success "✅ Claude-flow daemon is already running"
        return
    }

    if (Test-ContainerExists) {
        docker start $ContainerName | Out-Null
    } else {
        docker run -d `
            --name $ContainerName `
            --network $NetworkName `
            -v ${DataVolume}:/data `
            -v ${ConfigVolume}:/config `
            -v ${WorkspaceMount}:/workspace:ro `
            -e ANTHROPIC_API_KEY=$env:ANTHROPIC_API_KEY `
            -e OPENROUTER_API_KEY=$env:OPENROUTER_API_KEY `
            $ImageName daemon start | Out-Null
    }

    Write-Success "✅ Claude-flow daemon started"
}

# Execute claude-flow command in container
function Invoke-ClaudeFlowCommand {
    param(
        [string]$Cmd,
        [string[]]$Args
    )

    if (-not (Test-ContainerRunning)) {
        Start-ClaudeFlowDaemon
    }

    $fullCommand = if ($Args) {
        "$Cmd $($Args -join ' ')"
    } else {
        $Cmd
    }

    docker exec -it $ContainerName node dist/cli.js $fullCommand
}

# Main execution
Test-DockerRunning

if (-not $Command) {
    Write-Info "📘 Claude Flow CLI (Containerized)"
    Write-Info ""
    Write-Info "Usage: .\claude-flow.ps1 <command> [arguments]"
    Write-Info ""
    Write-Info "Available commands:"
    Write-Info "  init          Initialize claude-flow in project"
    Write-Info "  daemon        Manage claude-flow daemon (start|stop|status)"
    Write-Info "  swarm         Manage swarms (init|status|shutdown)"
    Write-Info "  agent         Manage agents (spawn|list|status|terminate)"
    Write-Info "  task          Manage tasks (create|list|status|complete)"
    Write-Info "  memory        Manage memory (store|retrieve|search|list)"
    Write-Info "  config        Manage configuration (get|set|list|reset)"
    Write-Info ""
    Write-Info "Examples:"
    Write-Info "  .\claude-flow.ps1 init"
    Write-Info "  .\claude-flow.ps1 swarm status"
    Write-Info "  .\claude-flow.ps1 agent spawn coder"
    Write-Info ""
    exit 0
}

# Handle daemon commands specially
if ($Command -eq "daemon") {
    switch ($Arguments[0]) {
        "start" { Start-ClaudeFlowDaemon; exit 0 }
        "stop" {
            if (Test-ContainerRunning) {
                docker stop $ContainerName | Out-Null
                Write-Success "✅ Claude-flow daemon stopped"
            } else {
                Write-Warning "⚠️ Claude-flow daemon is not running"
            }
            exit 0
        }
        "status" {
            if (Test-ContainerRunning) {
                Write-Success "✅ Claude-flow daemon is running"
                docker exec $ContainerName node dist/cli.js swarm status
            } else {
                Write-Warning "⚠️ Claude-flow daemon is not running"
            }
            exit 0
        }
        default {
            Write-Failure "❌ Unknown daemon command: $($Arguments[0])"
            Write-Info "Available: start, stop, status"
            exit 1
        }
    }
}

# Execute the command
Invoke-ClaudeFlowCommand -Cmd $Command -Args $Arguments
```

### Installation Script (install-claude-flow.ps1)

```powershell
#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Install Claude Flow CLI wrapper system-wide

.DESCRIPTION
    Builds the Docker image and installs the PowerShell wrapper to PATH
#>

$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing Claude Flow CLI..." -ForegroundColor Cyan

# Build Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
docker build -t nyra/claude-flow:3.0.0-alpha.42 ./submodules/claude-flow

# Create network if it doesn't exist
Write-Host "🌐 Creating Docker network..." -ForegroundColor Yellow
docker network inspect nyra-network 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    docker network create nyra-network
}

# Create volumes
Write-Host "💾 Creating Docker volumes..." -ForegroundColor Yellow
docker volume create claude-flow-data
docker volume create claude-flow-config

# Copy wrapper script to user bin
$UserBin = "$env:USERPROFILE\.local\bin"
if (-not (Test-Path $UserBin)) {
    New-Item -ItemType Directory -Path $UserBin | Out-Null
}

Copy-Item -Path ".\claude-flow.ps1" -Destination "$UserBin\claude-flow.ps1" -Force

# Add to PATH if not already there
$PathValue = [Environment]::GetEnvironmentVariable("Path", "User")
if ($PathValue -notlike "*$UserBin*") {
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$PathValue;$UserBin",
        "User"
    )
    Write-Host "✅ Added $UserBin to PATH" -ForegroundColor Green
}

Write-Host "✅ Claude Flow CLI installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Usage: claude-flow.ps1 <command> [arguments]" -ForegroundColor Cyan
Write-Host "Example: claude-flow.ps1 swarm status" -ForegroundColor Cyan
```

---

## 📋 Deployment Checklist

### Pre-Build
- [ ] Review and optimize Dockerfile
- [ ] Test multi-stage build locally
- [ ] Verify all dependencies included
- [ ] Check image size (target: < 500MB)
- [ ] Document environment variables

### Build Process
- [ ] Build Docker image
- [ ] Tag with version and latest
- [ ] Push to container registry (optional)
- [ ] Test image on clean system
- [ ] Verify CLI commands work

### PowerShell Wrapper
- [ ] Test wrapper script on Windows
- [ ] Test wrapper script on Linux (via pwsh)
- [ ] Add error handling for edge cases
- [ ] Document all commands and options
- [ ] Create installation script

### Integration
- [ ] Add to docker-compose.dev.yml
- [ ] Add to docker-compose.prod.yml
- [ ] Update documentation
- [ ] Create backup/restore procedures
- [ ] Test failover scenarios

---

## 🔒 Security Considerations

### Secrets Management
- Mount API keys as Docker secrets (production)
- Use environment variables for development
- Never commit secrets to image
- Rotate keys regularly

### Container Security
- Run as non-root user
- Use read-only root filesystem where possible
- Limit container capabilities
- Enable content trust
- Regular security scanning

### Network Security
- Isolate on dedicated network
- Expose only necessary ports
- Use TLS for API communication
- Implement rate limiting

---

## 📊 Monitoring & Logging

### Healthcheck
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

### Logging
- Structured JSON logging
- Log rotation (max 100MB, keep 5 files)
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized logging to Loki

### Metrics
- Prometheus metrics endpoint
- Agent count, task count, memory usage
- Response times, error rates
- Resource utilization

---

## 🚀 Usage Examples

### Local Development
```bash
# Build image
docker build -t nyra/claude-flow:3.0.0-alpha.42 ./submodules/claude-flow

# Run daemon
docker run -d \
  --name nyra-claude-flow \
  --network nyra-network \
  -v claude-flow-data:/data \
  -v $(pwd):/workspace:ro \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  nyra/claude-flow:3.0.0-alpha.42 daemon start

# Execute command
docker exec nyra-claude-flow node dist/cli.js swarm status
```

### PowerShell Wrapper
```powershell
# Install wrapper
.\install-claude-flow.ps1

# Use like regular CLI
claude-flow.ps1 init
claude-flow.ps1 swarm status
claude-flow.ps1 agent spawn coder --domain infrastructure
claude-flow.ps1 task create --type feature --description "Add auth"
```

### Docker Compose
```bash
# Start all services including claude-flow
docker-compose up -d

# Execute commands via docker-compose
docker-compose exec claude-flow node dist/cli.js swarm status
```

---

## 🔄 Update Strategy

### Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag images with version and latest
- Maintain changelog in image labels
- Automated builds on git tags

### Rolling Updates
```bash
# Build new version
docker build -t nyra/claude-flow:3.1.0 .

# Tag as latest
docker tag nyra/claude-flow:3.1.0 nyra/claude-flow:latest

# Update running container
docker stop nyra-claude-flow
docker rm nyra-claude-flow
docker run -d --name nyra-claude-flow nyra/claude-flow:latest
```

### Rollback Procedure
```bash
# List available versions
docker images nyra/claude-flow

# Rollback to previous version
docker run -d --name nyra-claude-flow nyra/claude-flow:3.0.0-alpha.42
```

---

## 📦 Distribution

### Internal Registry
```bash
# Tag for internal registry
docker tag nyra/claude-flow:3.0.0-alpha.42 registry.nyra.local/claude-flow:3.0.0-alpha.42

# Push to registry
docker push registry.nyra.local/claude-flow:3.0.0-alpha.42
```

### GitHub Container Registry
```bash
# Tag for GitHub
docker tag nyra/claude-flow:3.0.0-alpha.42 ghcr.io/project-nyra/claude-flow:3.0.0-alpha.42

# Push to GitHub
docker push ghcr.io/project-nyra/claude-flow:3.0.0-alpha.42
```

---

## 🎯 Next Steps

1. **Create Dockerfile** in `submodules/claude-flow/`
2. **Test build process** and verify functionality
3. **Create PowerShell wrapper** scripts
4. **Test wrapper** on Windows and Linux
5. **Update docker-compose files** to include claude-flow service
6. **Document installation** process for team
7. **Create CI/CD pipeline** for automated builds
8. **Push to container registry** for easy distribution

---

**Benefits of Containerization**:
- ✅ Consistent environment across all machines
- ✅ No Node.js installation required
- ✅ Easy version management and updates
- ✅ Isolated dependencies
- ✅ Seamless integration with other services
- ✅ PowerShell wrapper provides native CLI experience
- ✅ Production-ready deployment

