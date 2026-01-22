# Docker/WSL Migration Architecture for Project-Nyra

## Overview
This document outlines the complete migration strategy from Windows-native development to a containerized WSL2 environment for Project-Nyra. The architecture preserves all current functionality while enabling better isolation, scalability, and cross-platform development.

## Current Environment Analysis

### Windows Setup
- **OS**: Windows 10.0.26120.6982
- **WSL**: 2.6.1.0 (already installed)
- **Docker**: 29.1.1 (already installed)
- **Package Manager**: Volta 2.0.2 with Node v24.11.0
- **Project Location**: `c:\Dev\devprojects\personal-projects\project-nyra`
- **Secrets Management**: Infisical configured

### Key Dependencies
- Claude-Flow orchestration
- MCP servers (Claude-Flow, Archon, MetaMCP)
- Multiple Python/Node.js services
- PostgreSQL, FalkorDB, ChromaDB databases
- Infisical secrets management

## Migration Strategy

### Phase 1: WSL2 Environment Setup
1. **Ubuntu Distribution**: Ubuntu 22.04 LTS (recommended for stability)
2. **Resource Allocation**: 8GB RAM, 4 CPUs minimum
3. **Storage**: 100GB disk space allocation
4. **Integration**: Full Docker Desktop WSL2 backend integration

### Phase 2: Container Architecture
1. **Multi-service orchestration** with Docker Compose
2. **Development containers** for consistent environments
3. **Service mesh** for inter-container communication
4. **Volume strategies** for Windows-WSL file sharing

### Phase 3: Development Workflow
1. **VS Code Remote-WSL** setup
2. **Git configuration** for cross-platform compatibility
3. **Package manager** migration (Volta → Docker-based)
4. **Environment variable** management via Infisical

## Detailed Architecture

### Container Services Architecture

```mermaid
graph TB
    subgraph "Windows Host"
        VSD[VS Code Desktop]
        GW[Git Windows]
    end

    subgraph "WSL2 Ubuntu"
        subgraph "Development Container"
            VSW[VS Code Server]
            CC[Claude Code]
            CF[Claude Flow]
        end

        subgraph "MCP Gateway"
            MG[MetaMCP Gateway]
            AM[Archon MCP]
            FM[Flow MCP]
        end

        subgraph "Core Services"
            NO[Nyra Orchestrator]
            NU[Nyra UI]
        end

        subgraph "Data Services"
            PG[PostgreSQL]
            FDB[FalkorDB]
            CDB[ChromaDB]
        end

        subgraph "Infrastructure"
            IS[Infisical Sync]
            CF[Cloudflared]
        end
    end

    VSD -.->|Remote WSL| VSW
    GW -.->|Sync| CC
    VSW --> CC
    CC --> CF
    CF --> MG
    MG --> AM
    MG --> FM
    MG --> NO
    NO --> NU
    NO --> PG
    NO --> FDB
    NO --> CDB
    IS --> PG
    CF --> NO
```

## Implementation Details

### 1. WSL2 Configuration

#### `.wslconfig` (Windows User Directory)
```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
kernelCommandLine=vsyscall=emulate
debugConsole=true

[experimental]
sparseVhd=true
autoMemoryReclaim=gradual
```

#### Ubuntu Setup Commands
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential

# Install Docker (if using Docker inside WSL)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Node.js via nvm (alternative to Volta in containers)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 24.11.0
nvm use 24.11.0

# Install Python and pip
sudo apt install -y python3 python3-pip python3-venv
```

### 2. Development Container Configuration

#### `devcontainer.json`
```json
{
    "name": "Nyra Development Environment",
    "dockerComposeFile": ["../docker-compose.dev.yml"],
    "service": "nyra-dev",
    "workspaceFolder": "/workspace",
    "features": {
        "ghcr.io/devcontainers/features/docker-in-docker:2": {},
        "ghcr.io/devcontainers/features/node:1": {
            "nodeGypDependencies": true,
            "version": "24.11.0"
        },
        "ghcr.io/devcontainers/features/python:1": {
            "version": "3.11"
        }
    },
    "customizations": {
        "vscode": {
            "extensions": [
                "ms-python.python",
                "ms-vscode.vscode-json",
                "redhat.vscode-yaml",
                "ms-vscode.vscode-docker"
            ]
        }
    },
    "forwardPorts": [3000, 8000, 8001, 8002, 5432, 6379],
    "postCreateCommand": "npm install && pip install -r requirements.txt",
    "remoteUser": "vscode"
}
```

### 3. Service Discovery and Networking

#### Internal Network Configuration
- **Network Name**: `nyra-network`
- **Driver**: bridge with custom subnet
- **DNS Resolution**: Docker Compose service names
- **Port Mapping**: Strategic port exposure for development

#### Service Communication
```yaml
# Internal communication via service names
- CLAUDE_FLOW_URL=http://claude-flow-mcp:8003
- ARCHON_MCP_URL=http://archon-mcp:8004
- METAMCP_GATEWAY_URL=http://metamcp-gateway:8005
- POSTGRES_URL=postgresql://nyra:nyra_pass@postgres:5432/nyra_db
```

## File and Volume Management

### Volume Strategy
1. **Source Code**: Windows → WSL2 bind mount
2. **Node Modules**: Named volumes for performance
3. **Database Data**: Persistent named volumes
4. **Logs**: Bind mount to Windows for accessibility
5. **Secrets**: Infisical integration with WSL2

### Performance Optimizations
- Use named volumes for `node_modules`
- Cache package manager files
- Optimize file watching for hot reload
- Configure git for cross-platform line endings

## Migration Benefits

### Development Experience
- **Consistent Environment**: Same containers across all developers
- **Faster Setup**: New developers can start with `docker-compose up`
- **Better Resource Management**: Container-level resource controls
- **Enhanced Security**: Isolated services and secrets management

### Scalability
- **Horizontal Scaling**: Easy service replication
- **Load Balancing**: Container-level load distribution
- **Service Isolation**: Failure containment
- **Easy Testing**: Ephemeral test environments

### Maintenance
- **Version Control**: Infrastructure as Code
- **Rollback Capability**: Container image versioning
- **Environment Parity**: Dev/staging/production consistency
- **Monitoring**: Container-level observability

## Risk Mitigation

### Backup Strategy
1. **Windows Environment Snapshot**: Complete current setup backup
2. **Git Repository Backup**: Ensure all changes are committed
3. **Database Backup**: Export all existing data
4. **Configuration Backup**: Save all current configurations

### Rollback Procedures
1. **Container Rollback**: Previous image versions
2. **Full Environment Rollback**: Windows environment restoration
3. **Partial Rollback**: Service-specific rollbacks
4. **Data Recovery**: Database restoration procedures

## Next Steps
1. Create detailed Docker Compose configurations
2. Set up development container specifications
3. Create migration scripts and validation procedures
4. Test migration in isolated environment
5. Execute phased migration with rollback checkpoints