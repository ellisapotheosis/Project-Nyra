# NYRA MCP Installation & Management Guide

## 🎯 Overview

This guide provides best practices for installing, managing, and scaling MCP (Model Context Protocol) servers in the NYRA ecosystem. It covers three main installation methods and when to use each.

## 📊 Installation Methods Summary

| Method | Best For | Pros | Cons | Examples |
|--------|----------|------|------|----------|
| **UV (Local Python)** | Custom NYRA servers, rapid development | Isolated environments, fast iteration, full control | Requires Python/UV setup | archon-mcp, infisical-mcp, mem0-mcp |
| **NPM Global** | Community servers, quick setup | Easy installation, widespread availability | Global pollution, version conflicts | filesystem, notion, claude-flow |
| **Docker** | Production, isolation, complex services | Complete isolation, reproducible, scalable | Resource overhead, complexity | MetaMCP, GitHub MCP, Qdrant |

## 🏗️ Architecture Principles

### 1. **Separation by Function**
- **Core NYRA Services**: UV-based (archon-mcp, infisical-mcp, metamcp-local)
- **Community Tools**: NPM-based (filesystem, notion, claude-flow)  
- **Infrastructure**: Docker-based (databases, complex services)

### 2. **Environment Isolation**
- UV creates isolated Python environments per server
- Docker provides complete system isolation
- NPM global installs share Node.js runtime

### 3. **Development Workflow**
- **Prototype**: Start with UV for rapid iteration
- **Standardize**: Move to NPM for community sharing
- **Scale**: Containerize with Docker for production

## 🔧 Installation Methods Detailed

### Method 1: UV-Based Local Servers (Recommended for NYRA)

**When to Use:**
- Custom NYRA-specific MCP servers
- Rapid development and iteration
- Need full control over dependencies
- Python-based servers

**Setup Pattern:**
```bash
# 1. Create server directory
mkdir nyra-mcp-servers/local/my-server

# 2. Create pyproject.toml
cd nyra-mcp-servers/local/my-server
cat > pyproject.toml << EOF
[project]
name = "nyra-my-server-mcp"
version = "0.1.0"
dependencies = [
    "mcp>=1.15.0",
    "pydantic>=2.0.0",
    "fastapi>=0.100.0"
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
EOF

# 3. Create main.py
cat > main.py << EOF
#!/usr/bin/env python3
import asyncio
from mcp.server import Server
from mcp.server.fastapi import create_app

server = Server("my-server")

@server.tool()
async def my_tool(param: str) -> str:
    return f"Processed: {param}"

app = create_app(server)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3010)
EOF

# 4. Install and run
uv sync
uv run python main.py
```

**Benefits:**
- ✅ Isolated dependency management
- ✅ Fast startup and iteration
- ✅ Full control over server behavior
- ✅ Easy debugging and development

**Management:**
```bash
# Install dependencies
uv add new-dependency

# Update dependencies  
uv lock --upgrade

# Run in development
uv run python main.py

# Run with different Python versions
uv python install 3.12
uv run --python 3.12 python main.py
```

### Method 2: NPM Global Servers (Community Tools)

**When to Use:**
- Well-established community MCP servers
- Standard tools (filesystem, notion, etc.)
- Quick prototyping
- Node.js-based servers

**Installation:**
```bash
# Install globally
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @eyelidlessness/notion-api-mcp-server

# Or with UVX for Python packages
uvx install fastmcp
```

**Configuration:**
```json
// In Warp MCP config
{
  "filesystem": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-filesystem"],
    "env": {}
  },
  "notion": {
    "command": "npx", 
    "args": ["@eyelidlessness/notion-api-mcp-server"],
    "env": {
      "NOTION_TOKEN": "${NOTION_TOKEN}"
    }
  }
}
```

**Benefits:**
- ✅ Quick installation
- ✅ Community maintained
- ✅ Standard interfaces
- ✅ Wide compatibility

**Drawbacks:**
- ❌ Version conflicts
- ❌ Global namespace pollution
- ❌ Less control over behavior

### Method 3: Docker-Based Servers (Production & Infrastructure)

**When to Use:**
- Production deployments
- Complex services with multiple dependencies
- Database-backed MCP servers
- Complete isolation requirements

**Setup Pattern:**
```bash
# 1. Create Docker Compose setup
cat > docker-compose.mcp.yml << EOF
version: '3.8'
services:
  metamcp:
    image: ghcr.io/metatool-ai/metamcp:latest
    ports:
      - "12008:12008"
    environment:
      - POSTGRES_URL=postgresql://postgres:password@metamcp-pg:5432/metamcp
    depends_on:
      - metamcp-pg
    restart: unless-stopped

  metamcp-pg:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=metamcp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "9433:5432"
    volumes:
      - metamcp_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  metamcp_data:
EOF

# 2. Deploy
docker-compose -f docker-compose.mcp.yml up -d
```

**Benefits:**
- ✅ Complete isolation
- ✅ Reproducible deployments
- ✅ Scalable architecture
- ✅ Production ready

**Drawbacks:**
- ❌ Resource overhead
- ❌ Complexity
- ❌ Slower iteration

## 🌟 NYRA-Specific Best Practices

### 1. **Server Organization**
```
nyra-mcp-servers/
├── local/                  # UV-based servers
│   ├── archon-mcp/        # Primary orchestrator
│   ├── infisical-mcp/     # Secrets management
│   ├── mem0-mcp/          # Memory management
│   └── metamcp/           # Channel management
├── docker/                # Docker configurations
│   └── docker-compose.yml
├── config/                # Shared configurations
│   ├── metamcp-channels.json
│   └── warp-mcp-config.json
└── scripts/               # Management scripts
    ├── bootstrap-mcp-ecosystem.ps1
    └── start-mcp-servers.ps1
```

### 2. **Channel-Based Architecture**
Organize servers by function rather than technology:

- **Orchestration**: archon-mcp, metamcp-local, metamcp-docker
- **Memory**: mem0-mcp, zep-mcp, qdrant-local
- **Development**: github, filesystem, sparc2
- **Security**: infisical-mcp
- **Knowledge**: notion

### 3. **Environment Configuration**
```bash
# Set in PowerShell profile
$env:NYRA_MCP_CONFIG_PATH = "C:\...\nyra-mcp-servers\config"
$env:NYRA_MCP_SERVERS_PATH = "C:\...\nyra-mcp-servers"
$env:NYRA_ENVIRONMENT = "dev"  # or "staging", "prod"
```

## 🚀 Installation Decision Tree

```
New MCP Server Needed
│
├─ Is it NYRA-specific?
│  ├─ YES → Use UV method
│  └─ NO → Continue
│
├─ Is it a community standard?
│  ├─ YES → Use NPM method
│  └─ NO → Continue
│
├─ Does it need databases/complex deps?
│  ├─ YES → Use Docker method
│  └─ NO → Use UV method (for control)
│
└─ Is it for production?
   ├─ YES → Use Docker method
   └─ NO → Use UV method
```

## 📦 Migration Paths

### NPM → UV Migration
When a community tool becomes critical:
```bash
# 1. Create UV structure
mkdir nyra-mcp-servers/local/my-server
cd nyra-mcp-servers/local/my-server

# 2. Port functionality
# 3. Update Warp config to use UV version
```

### UV → Docker Migration
When scaling to production:
```bash
# 1. Create Dockerfile
# 2. Build image
# 3. Update orchestration config
# 4. Deploy with Docker Compose
```

## 🔧 Maintenance & Operations

### Regular Tasks
```bash
# Update all UV servers
for dir in nyra-mcp-servers/local/*/; do
  cd "$dir" && uv lock --upgrade
done

# Update NPM packages
npm update -g

# Update Docker images
docker-compose pull && docker-compose up -d
```

### Monitoring
```bash
# Check server status
.\scripts\start-mcp-servers.ps1 -Status

# Test connections
.\scripts\connect-mcp-ecosystem.ps1 -TestConnections

# View logs
docker-compose logs -f metamcp
```

### Backup Strategy
- **UV Servers**: Git repository (configuration as code)
- **NPM**: Package.json dependencies list
- **Docker**: Volume backups + image tags

## 🎛️ Integration with MetaMCP

### Server Registration
All servers should register with MetaMCP channels:
```json
{
  "orchestration": ["archon-mcp", "metamcp-local", "metamcp-docker"],
  "memory": ["mem0-mcp", "zep-mcp", "qdrant-local"],
  "development": ["github", "filesystem"]
}
```

### Load Balancing
MetaMCP handles routing between server instances:
- **Round Robin**: For stateless operations
- **Weighted**: Based on server capabilities
- **Failover**: Automatic fallback options

## 🏁 Quick Start Checklist

- [ ] Install UV and Node.js
- [ ] Run `.\scripts\bootstrap-mcp-ecosystem.ps1`
- [ ] Configure environment variables
- [ ] Import Warp MCP configuration
- [ ] Test core servers: `mcp-status`
- [ ] Validate connections: `mcp-connect -TestConnections`

## 📚 Additional Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [UV Documentation](https://docs.astral.sh/uv/)
- [MetaMCP Documentation](https://github.com/metatool-ai/metamcp)
- [NYRA Architecture Overview](./NYRA-Architecture.md)

---

**Remember**: Start simple with UV, graduate to NPM for community tools, and containerize with Docker for production. The NYRA ecosystem is designed to grow with your needs.