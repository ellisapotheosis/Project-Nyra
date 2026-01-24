# NYRA Windows Quick Start Guide

This guide provides Windows-specific instructions for launching and managing the NYRA infrastructure.

## Prerequisites

1. **Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop/
   - Ensure Docker Desktop is running before executing scripts

2. **Node.js v20+**
   - Download: https://nodejs.org/
   - Verify: `node --version` should show v20.x or higher

3. **PowerShell**
   - Built into Windows 10/11
   - Run as Administrator for Docker operations

## Environment Setup

1. **Configure Environment Variables**
   ```powershell
   # Copy the template
   Copy-Item "nyra-infra\compose\.env.example" "nyra-infra\compose\.env"

   # Edit with your actual values
   notepad "nyra-infra\compose\.env"
   ```

2. **Required Environment Variables**
   - `DB_PASSWORD` - Secure PostgreSQL password
   - `BITWARDEN_ADMIN_TOKEN` - Bitwarden admin access token
   - `ENCRYPTION_KEY` - 32-character encryption key for Infisical
   - `JWT_SECRET` - JWT secret for Infisical
   - `ANTHROPIC_API_KEY` - Anthropic API key
   - `OPENAI_API_KEY` - OpenAI API key
   - `GITHUB_TOKEN` - GitHub personal access token
   - `NOTION_API_KEY` - Notion integration token

## Launch Infrastructure

### Full Stack Launch
```powershell
# Launch all services (Security, UI, Orchestration, MCP servers)
.\launch-infrastructure.ps1
```

**Services Started:**
- **Security Stack**: PostgreSQL, Bitwarden, Infisical
- **UI Stack**: Open-WebUI, Ollama
- **Orchestration Stack**: MetaMCP, Archon MCP, Archon UI
- **MCP Servers**: GitHub, Docker, Filesystem, Memory, Notion

### Individual Stack Management

```powershell
# Security stack only
docker-compose -f nyra-infra\compose\security.compose.yml up -d

# UI stack only
docker-compose -f nyra-infra\compose\ui.compose.yml up -d

# Orchestration stack only
docker-compose -f nyra-infra\compose\orchestration.compose.yml up -d

# MCP servers only
docker-compose -f nyra-infra\compose\general-mcp.compose.yml up -d
```

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Bitwarden | http://localhost:8081 | Password management |
| Infisical | http://localhost:8080 | Secrets management |
| Open-WebUI | http://localhost:3002 | AI chat interface |
| Archon UI | http://localhost:3005 | Orchestration dashboard |
| MetaMCP | http://localhost:3000 | MCP gateway |
| GitHub MCP | http://localhost:3010 | GitHub operations |
| Docker MCP | http://localhost:3011 | Docker management |
| Filesystem MCP | http://localhost:3012 | File operations |
| Memory MCP | http://localhost:3013 | Persistent memory |
| Notion MCP | http://localhost:3014 | Notion integration |

## Configure MCP Servers

```powershell
# Run configuration script
.\configure-mcp-servers.ps1
```

This creates `.mcp-servers.json` with all MCP server configurations for Claude Code.

### Manual MCP Configuration

```bash
# NPX-based servers (auto-start)
claude mcp add claude-flow npx @claude-flow/cli@latest mcp start
claude mcp add ruv-swarm npx ruv-swarm mcp start
claude mcp add flow-nexus npx flow-nexus@latest mcp start

# HTTP-based servers (require infrastructure running)
claude mcp add archon http://localhost:3003
claude mcp add metamcp http://localhost:3000
claude mcp add github http://localhost:3010
```

## Teardown Infrastructure

```powershell
# Stop all services (preserves data volumes)
.\teardown-infrastructure.ps1

# Stop and remove volumes (DELETES ALL DATA)
docker-compose -f nyra-infra\compose\security.compose.yml down -v
docker-compose -f nyra-infra\compose\ui.compose.yml down -v
docker-compose -f nyra-infra\compose\orchestration.compose.yml down -v
docker-compose -f nyra-infra\compose\general-mcp.compose.yml down -v
```

## Verification Commands

```powershell
# Check running containers
docker ps --filter "name=nyra-"

# View service logs
docker-compose -f nyra-infra\compose\security.compose.yml logs -f
docker-compose -f nyra-infra\compose\ui.compose.yml logs -f
docker-compose -f nyra-infra\compose\orchestration.compose.yml logs -f
docker-compose -f nyra-infra\compose\general-mcp.compose.yml logs -f

# Check specific service
docker logs nyra-metamcp -f
docker logs nyra-archon-mcp -f
docker logs nyra-open-webui -f

# Verify network
docker network ls | findstr nyra

# Verify volumes
docker volume ls | findstr nyra
```

## Post-Launch Setup

1. **Configure Bitwarden** (http://localhost:8081)
   - Create admin account
   - Set up organization
   - Store API keys securely

2. **Configure Infisical** (http://localhost:8080)
   - Create account
   - Set up project
   - Import environment variables
   - Generate API tokens

3. **Pull Ollama Models** (for Open-WebUI)
   ```powershell
   docker exec nyra-ollama ollama pull llama2
   docker exec nyra-ollama ollama pull codellama
   docker exec nyra-ollama ollama pull mistral
   ```

4. **Configure Open-WebUI** (http://localhost:3002)
   - Create account
   - Connect to Ollama models
   - Configure Anthropic/OpenAI APIs
   - Set up RAG capabilities

5. **Test MCP Servers**
   ```powershell
   # Test MetaMCP
   curl http://localhost:3000/health

   # Test Archon MCP
   curl http://localhost:3003/health

   # Test GitHub MCP
   curl http://localhost:3010/health
   ```

## Troubleshooting

### Docker Issues
```powershell
# Restart Docker Desktop
Get-Process "Docker Desktop" | Stop-Process
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Reset Docker network
docker network rm nyra-network
docker network create nyra-network
```

### Port Conflicts
```powershell
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Kill process by PID
Stop-Process -Id <PID> -Force
```

### Permission Issues
```powershell
# Run PowerShell as Administrator
Start-Process powershell -Verb RunAs

# Check Docker permissions
docker ps
```

### Build Issues
```powershell
# Rebuild specific service
docker-compose -f nyra-infra\compose\orchestration.compose.yml build --no-cache metamcp

# Remove all containers and rebuild
docker-compose -f nyra-infra\compose\orchestration.compose.yml down
docker-compose -f nyra-infra\compose\orchestration.compose.yml up -d --build
```

### Claude-Flow Hooks (SQLite Module Error)
```powershell
# Navigate to claude-flow directory
cd nyra-orchestration\claude-flow

# Rebuild native module for your Node.js version
npm rebuild better-sqlite3

# Or reinstall
npm install claude-flow@alpha
```

## Development Workflow

1. **Start Development Session**
   ```powershell
   # Launch infrastructure
   .\launch-infrastructure.ps1

   # Open services in browser
   start http://localhost:3002  # Open-WebUI
   start http://localhost:3005  # Archon UI
   start http://localhost:8080  # Infisical

   # Start Claude Code with MCP servers
   claude
   ```

2. **During Development**
   - Use Open-WebUI for AI interactions
   - Monitor Archon UI for orchestration
   - Store secrets in Infisical
   - Use MCP servers via Claude Code

3. **End Development Session**
   ```powershell
   # Optional: Stop services to save resources
   .\teardown-infrastructure.ps1
   ```

## Performance Optimization

### Resource Allocation
```powershell
# Check Docker resource usage
docker stats

# Adjust Docker Desktop settings
# Settings → Resources → Advanced
# - CPUs: 4-8 cores
# - Memory: 8-16 GB
# - Swap: 2-4 GB
```

### Selective Service Launch
```powershell
# Launch only what you need
docker-compose -f nyra-infra\compose\security.compose.yml up -d
docker-compose -f nyra-infra\compose\ui.compose.yml up -d

# Skip MCP servers if not needed
# Skip orchestration if not using agents
```

## Security Considerations

1. **Never Commit .env Files**
   - Already in `.gitignore`
   - Use `.env.example` as template

2. **Rotate API Keys**
   - Change all keys in `.env` after initial setup
   - Store original keys in Bitwarden
   - Use Infisical for runtime secret injection

3. **Network Security**
   - All services on isolated `nyra-network`
   - Expose only necessary ports
   - Use localhost for development

4. **Data Persistence**
   - Database volumes persist between restarts
   - Backup volumes before major changes
   - Export Bitwarden/Infisical data regularly

## Support

- **Documentation**: [CONSOLIDATION_COMPLETE.md](CONSOLIDATION_COMPLETE.md)
- **Issues**: Create issue in repository
- **Claude Flow**: https://github.com/ruvnet/claude-flow
- **Flow Nexus**: https://flow-nexus.ruv.io

---

**Infrastructure is ready for rapid development! 🚀**
