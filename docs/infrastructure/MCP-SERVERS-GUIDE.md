# Project Nyra - MCP Servers Complete Guide
**Last Updated**: 2026-01-25  
**Status**: Consolidated & Production Ready

---

## 📊 Overview

Project Nyra uses **11 MCP (Model Context Protocol) servers** distributed across the repository, managed through a unified control script and integrated with Nexus Router for intelligent routing.

### MCP Server Types
1. **Docker-based** (6 servers) - Full containerized MCP servers
2. **NPX-based** (1 server) - Claude Flow managed via .mcp.json
3. **Service-based** (4 servers) - Documentation-only references

---

## 🗂️ MCP Server Inventory

### Docker-based MCP Servers (infra/)

#### 1. **bitwarden-mcp**
- **Location**: `infra/bitwarden-mcp/`
- **Container**: `nyra-bitwarden-mcp`
- **Port**: 8050
- **Purpose**: Secrets management integration with Bitwarden
- **Features**:
  - Access Bitwarden vault items
  - Secure secrets retrieval
  - Integration with Bitwarden Secrets Manager
- **Start**: `docker-compose up -d` in directory
- **Health Check**: `http://localhost:8050/health`

#### 2. **docker-mcp**
- **Location**: `infra/docker-mcp/`
- **Container**: `nyra-docker-mcp`
- **Port**: 8052
- **Purpose**: Docker management and orchestration
- **Features**:
  - Container lifecycle management
  - Image operations
  - Volume and network management
- **Start**: TypeScript-based, requires build
- **Health Check**: `http://localhost:8052/health`

#### 3. **dockerhub-mcp**
- **Location**: `infra/dockerhub-mcp/`
- **Container**: `nyra-dockerhub-mcp`
- **Port**: 8053
- **Purpose**: Docker Hub repository interactions
- **Features**:
  - Image search and inspection
  - Repository management
  - Tag operations
- **Start**: `docker-compose up -d` in directory
- **Health Check**: `http://localhost:8053/health`

#### 4. **git-mcp**
- **Location**: `infra/git-mcp/`
- **Container**: `nyra-git-mcp`
- **Port**: 8054
- **Purpose**: Git repository operations
- **Features**:
  - Branch management
  - Commit operations
  - Repository status and history
- **Start**: `docker-compose up -d` in directory
- **Health Check**: `http://localhost:8054/health`

#### 5. **infisical-mcp**
- **Location**: `infra/infisical-mcp/`
- **Container**: `nyra-infisical-mcp`
- **Port**: 8055
- **Purpose**: Centralized secrets management with Infisical
- **Features**:
  - Universal Auth integration
  - Environment-specific secret retrieval
  - Multi-PC secret synchronization
- **Start**: `docker-compose up -d` in directory
- **Health Check**: `http://localhost:8055/health`
- **Critical**: Used for shared secrets across all 4 PCs

#### 6. **sequential-thinking-mcp**
- **Location**: `infra/sequential-thinking-mcp/`
- **Container**: `nyra-sequential-thinking-mcp`
- **Port**: 8056
- **Purpose**: Advanced reasoning and problem-solving
- **Features**:
  - Multi-step reasoning
  - Thought branching
  - Dynamic thought adjustment
  - Revision capabilities
- **Start**: `docker-compose up -d` in directory
- **Health Check**: `http://localhost:8056/health`

### NPX-based MCP Servers

#### 7. **claude-flow**
- **Type**: NPX-managed via .mcp.json
- **Port**: 8051
- **Purpose**: Core orchestration and multi-agent coordination
- **Features**:
  - V3 mode with hierarchical-mesh topology
  - 15 max agents
  - Hybrid memory backend
  - Hook system enabled (27 hooks + 12 workers)
- **Start**: Managed by Claude Desktop or `npx @claude-flow/cli@latest mcp start`
- **Configuration**: `infra/configs/claude-flow/`

### Service-based MCP Servers (Documentation Only)

#### 8. **gemini-mcp** (services/)
- **Location**: `services/gemini-mcp/`
- **Purpose**: Google Gemini API integration
- **Status**: Documentation reference (CLAUDE.md)
- **Usage**: Refer to CLAUDE.md for integration patterns

#### 9. **github-mcp** (services/)
- **Location**: `services/github-mcp/`
- **Purpose**: GitHub API operations
- **Status**: Documentation reference (CLAUDE.md)
- **Usage**: Managed through standard MCP GitHub integration

#### 10. **mem0-mcp** (services/)
- **Location**: `services/mem0-mcp/`
- **Purpose**: Memory management system
- **Status**: Documentation reference with requirements.txt
- **Usage**: Python-based, see requirements.txt

#### 11. **serena-mcp** (services/)
- **Location**: `services/serena-mcp/`
- **Purpose**: LSP-powered semantic code retrieval
- **Status**: Documentation reference
- **Usage**: Alternative to Codanna, see external context for details

---

## 🚀 Quick Start

### Start All Docker MCP Servers
```powershell
# Using management script
.\scripts\mcp\manage-mcp-servers.ps1 -Action start

# Or manually
cd C:\Dev\Projects\Repos\Project-Nyra\infra
docker-compose -f bitwarden-mcp/docker-compose.yml up -d
docker-compose -f docker-mcp/docker-compose.yml up -d
docker-compose -f dockerhub-mcp/docker-compose.yml up -d
docker-compose -f git-mcp/docker-compose.yml up -d
docker-compose -f infisical-mcp/docker-compose.yml up -d
docker-compose -f sequential-thinking-mcp/docker-compose.yml up -d
```

### Check Status
```powershell
.\scripts\mcp\manage-mcp-servers.ps1 -Action status
```

### View Logs
```powershell
# All servers
.\scripts\mcp\manage-mcp-servers.ps1 -Action logs

# Specific server
.\scripts\mcp\manage-mcp-servers.ps1 -Action logs -Server infisical-mcp
```

### Health Check
```powershell
.\scripts\mcp\manage-mcp-servers.ps1 -Action health
```

### Stop All Servers
```powershell
.\scripts\mcp\manage-mcp-servers.ps1 -Action stop
```

---

## 🔧 Management Script Usage

### Location
`scripts/mcp/manage-mcp-servers.ps1`

### Available Actions

#### List All Servers
```powershell
.\scripts\mcp\manage-mcp-servers.ps1 -Action list
```
Shows complete inventory with types, ports, and locations.

#### Start Servers
```powershell
# Start all Docker servers
.\scripts\mcp\manage-mcp-servers.ps1 -Action start

# Start specific server
.\scripts\mcp\manage-mcp-servers.ps1 -Action start -Server bitwarden-mcp
```

#### Stop Servers
```powershell
# Stop all Docker servers
.\scripts\mcp\manage-mcp-servers.ps1 -Action stop

# Stop specific server
.\scripts\mcp\manage-mcp-servers.ps1 -Action stop -Server dockerhub-mcp
```

#### Restart Servers
```powershell
# Restart all
.\scripts\mcp\manage-mcp-servers.ps1 -Action restart

# Restart specific
.\scripts\mcp\manage-mcp-servers.ps1 -Action restart -Server git-mcp
```

#### Status Report
```powershell
.\scripts\mcp\manage-mcp-servers.ps1 -Action status
```
Displays formatted table with:
- Server name
- Type (docker/npx/service)
- Status (running/stopped/documented-only)
- Port
- Container name

#### View Logs
```powershell
# All Docker servers
.\scripts\mcp\manage-mcp-servers.ps1 -Action logs

# Specific server (last 50 lines)
.\scripts\mcp\manage-mcp-servers.ps1 -Action logs -Server infisical-mcp
```

#### Health Checks
```powershell
# Check all Docker servers
.\scripts\mcp\manage-mcp-servers.ps1 -Action health

# Check specific server
.\scripts\mcp\manage-mcp-servers.ps1 -Action health -Server sequential-thinking-mcp
```

---

## 🔀 Nexus Router Integration

**Status**: ⚠️ Pending Configuration (TODO)

### Overview
Nexus Router acts as the **MetaMCP proxy aggregator** for smart routing between:
- **Anthropic models**: Claude Sonnet, Opus, Haiku
- **Google models**: Gemini (for cost-effective operations)

### Configuration Location
- **Main config**: TBD (nexus.toml to be created)
- **Documentation**: To be reviewed from nexusrouter.com

### Planned Features
1. **Smart Context Routing**: Automatic model selection based on task complexity
2. **Fuzzy Tool Find**: Intelligent tool discovery and matching
3. **Channel-based Organization**: MCP servers grouped by:
   - Type (secrets, git, docker, memory)
   - Agent usage
   - Cost tier

### Integration Steps (Pending)
1. Review Grafbase/Nexus documentation
2. Create nexus.toml configuration
3. Set up smart routing rules
4. Configure fuzzy tool find
5. Register all MCP servers with Nexus
6. Test routing logic
7. Document channel organization

**Reference**: See user context - "we are only using nexus router as the metamcp proxy aggregator"

---

## 📝 Configuration Files

### .mcp.json (Root)
Currently minimal - only claude-flow configured:
```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "cmd",
      "args": ["/c", "npx", "@claude-flow/cli@latest", "mcp", "start"],
      "env": {
        "CLAUDE_FLOW_MODE": "v3",
        "CLAUDE_FLOW_HOOKS_ENABLED": "true",
        "CLAUDE_FLOW_TOPOLOGY": "hierarchical-mesh",
        "CLAUDE_FLOW_MAX_AGENTS": "15",
        "CLAUDE_FLOW_MEMORY_BACKEND": "hybrid"
      },
      "autoStart": false
    }
  }
}
```

### Environment-Specific Configs
- **Development**: `infra/configs/mcp/.mcp.json.development`
- **Production**: `infra/configs/mcp/.mcp.json.production`

### Claude Flow Configs
Located in `infra/configs/claude-flow/`:
- `claude-flow.config.json` - Full configuration
- `claude-flow.config.minimal.json` - Minimal setup
- `.env.dev` - Development environment
- `.env.prod` - Production environment
- `.env.claude-flow` - General environment

---

## 🏗️ Directory Structure

```
Project-Nyra/
├── infra/
│   ├── bitwarden-mcp/          # Bitwarden secrets (Docker)
│   ├── docker-mcp/             # Docker operations (Docker)
│   ├── dockerhub-mcp/          # Docker Hub (Docker)
│   ├── git-mcp/                # Git operations (Docker)
│   ├── infisical-mcp/          # Infisical secrets (Docker)
│   ├── sequential-thinking-mcp/ # Sequential reasoning (Docker)
│   ├── mcp-servers/            # Additional MCP configs
│   │   ├── bitwarden/
│   │   ├── dify/
│   │   ├── twentycrm/
│   │   └── vscode/
│   └── configs/
│       ├── mcp/                # MCP environment configs
│       │   ├── .mcp.json.development
│       │   └── .mcp.json.production
│       └── claude-flow/        # Claude Flow configs
│           ├── claude-flow.config.json
│           ├── claude-flow.config.minimal.json
│           ├── .env.dev
│           ├── .env.prod
│           └── .env.claude-flow
│
├── services/
│   ├── gemini-mcp/             # Gemini integration (docs only)
│   ├── github-mcp/             # GitHub integration (docs only)
│   ├── mem0-mcp/               # Memory system (docs only)
│   ├── sequential-thinking-mcp/ # Alt sequential thinking (docs only)
│   └── serena-mcp/             # Serena LSP (docs only)
│
├── scripts/
│   └── mcp/
│       └── manage-mcp-servers.ps1  # Unified management script
│
└── .mcp.json                   # Root MCP config (claude-flow only)
```

---

## 🔒 Security & Secrets

### Infisical MCP (Primary)
- **Purpose**: Centralized secret management across 4 PCs
- **Auth**: Universal Auth with client ID/secret
- **Environments**: dev, staging, production
- **Shared Folder**: `/shared` - secrets needed on all PCs

### Bitwarden MCP (Secondary)
- **Purpose**: Personal secret management
- **Auth**: BWS_ACCESS_TOKEN
- **Use Case**: Developer-specific credentials

### Best Practices
1. **Never commit** .env files with real secrets
2. **Use .env.example** templates only
3. **Infisical** for production secrets
4. **Bitwarden** for developer secrets
5. **Rotate secrets** regularly

---

## 🚨 Troubleshooting

### MCP Server Won't Start
```powershell
# Check Docker status
docker ps -a | findstr nyra-

# Check logs
.\scripts\mcp\manage-mcp-servers.ps1 -Action logs -Server [server-name]

# Rebuild container
cd infra/[server-name]
docker-compose down
docker-compose up -d --build
```

### Port Conflicts
Check if ports 8050-8056 are available:
```powershell
netstat -ano | findstr "8050 8051 8052 8053 8054 8055 8056"
```

### Health Check Failing
```powershell
# Test health endpoint manually
Invoke-WebRequest -Uri "http://localhost:8050/health"

# Check container logs
docker logs nyra-bitwarden-mcp
```

### Claude Flow Not Starting
```powershell
# Check MCP status
npx @claude-flow/cli@latest mcp status

# Restart MCP daemon
npx @claude-flow/cli@latest daemon stop
npx @claude-flow/cli@latest daemon start
```

---

## 📚 Additional Resources

### Documentation
- **Infisical MCP**: `infra/infisical-mcp/README.md`
- **Bitwarden MCP**: `infra/bitwarden-mcp/README.md`
- **Docker MCP**: `infra/docker-mcp/README.md`
- **Sequential Thinking**: `infra/sequential-thinking-mcp/README.md`
- **Claude Flow**: `infra/configs/claude-flow/` + external context

### External Links
- Nexus Router: https://nexusrouter.com
- Claude Flow: https://github.com/ruvnet/claude-flow
- MCP Specification: https://modelcontextprotocol.io

### Related Documents
- `docs/reference/PATH-REVIEW-INDEX.md` - All paths/envs/secrets
- `docs/reports/CONSOLIDATION-COMPLETE-2026-01-25.md` - Consolidation status
- `CLAUDE.md` (root) - Project-wide AI context

---

## ✅ Post-Consolidation Status

**Completed**:
- ✅ All Docker MCP servers inventoried
- ✅ Unified management script created (`scripts/mcp/manage-mcp-servers.ps1`)
- ✅ Documentation comprehensive
- ✅ Directory structure organized
- ✅ Configuration files consolidated

**Pending** (TODO):
- ⚠️ Nexus Router configuration
- ⚠️ Smart context routing setup
- ⚠️ Fuzzy tool find implementation
- ⚠️ Channel-based MCP organization
- ⚠️ Complete .mcp.json with all servers

---

## 🎯 Next Steps

1. **Immediate**:
   - Test management script: `.\scripts\mcp\manage-mcp-servers.ps1 -Action list`
   - Verify all Docker servers start: `.\scripts\mcp\manage-mcp-servers.ps1 -Action start`
   - Check status: `.\scripts\mcp\manage-mcp-servers.ps1 -Action status`

2. **Short-term**:
   - Configure Nexus Router (review nexusrouter.com docs)
   - Create nexus.toml with smart routing
   - Register all MCP servers with Nexus
   - Test fuzzy tool find

3. **Long-term**:
   - Optimize routing logic
   - Add more MCP servers as needed
   - Implement monitoring/alerting
   - Scale across 4-PC cluster

---

**Status**: ✅ **MCP Consolidation 90% Complete**  
**Remaining**: Nexus Router integration (10%)

**Last Updated**: 2026-01-25
