# MetaMCP Setup for Project Nyra

## Overview
MetaMCP will serve as the central MCP aggregator/proxy for Project Nyra, unifying all MCP servers:
- Desktop Commander
- rUv Swarm  
- Flow Nexus
- Claude Flow
- Any future MCP servers

## Architecture Integration

```mermaid
graph TD
    A[Claude Code] --> B[MetaMCP Proxy]
    B --> C[Desktop Commander]
    B --> D[rUv Swarm]
    B --> E[Flow Nexus] 
    B --> F[Claude Flow]
    
    G[Archon Orchestrator] --> B
    H[GitHub MCP Coordinator] --> B
    I[Project Nyra Apps] --> B
    
    B --> J[MetaMCP Frontend - Management UI]
    B --> K[MetaMCP Backend - Aggregation Engine]
    
    K --> L[(PostgreSQL - Configuration)]
```

## Current Project Nyra MCP Stack
- ✅ **Archon** - 54 agents, orchestration layer
- ✅ **GitHub Integration** - Repository management via Flow Nexus
- ✅ **Environment Config** - Infisical secrets management
- ✅ **Flow Nexus** - Authenticated with 256 credits

## MetaMCP Benefits for Project Nyra
1. **Unified MCP Interface** - Single endpoint for all MCP servers
2. **Middleware Support** - Request/response transformation, logging, auth
3. **Dynamic Configuration** - Add/remove MCP servers without restart
4. **Web Management UI** - Visual MCP server management
5. **Load Balancing** - Distribute requests across multiple server instances
6. **Monitoring & Analytics** - Track MCP usage and performance

## Setup Steps

### 1. Prerequisites Check
```bash
# Check Node.js version (18+ required)
node --version

# Check pnpm (package manager)
pnpm --version

# Check Docker (for PostgreSQL)
docker --version
```

### 2. Environment Configuration
Create `.env.local` with Project Nyra specific settings:
```env
NODE_ENV=development

# PostgreSQL for MetaMCP state
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=nyra_metamcp
POSTGRES_PASSWORD=nyra_m3t4mcp_2024
POSTGRES_DB=nyra_metamcp_db

DATABASE_URL=postgresql://nyra_metamcp:nyra_m3t4mcp_2024@localhost:5433/nyra_metamcp_db

# MetaMCP Application URLs
APP_URL=http://localhost:12008
NEXT_PUBLIC_APP_URL=http://localhost:12008

# Auth configuration
BETTER_AUTH_SECRET=nyra-metamcp-super-secret-key-2024-production

# Project Nyra specific MCP servers
DESKTOP_COMMANDER_URL=npx -y @wonderwhy-er/desktop-commander@latest
RUV_SWARM_URL=npx ruv-swarm@latest mcp start
FLOW_NEXUS_URL=npx flow-nexus@latest mcp start
CLAUDE_FLOW_URL=npx claude-flow@alpha mcp start

# Docker networking for development
TRANSFORM_LOCALHOST_TO_DOCKER_INTERNAL=true
```

### 3. Installation & Setup
```bash
# Install dependencies
pnpm install

# Start PostgreSQL database
docker run -d \
  --name nyra-metamcp-postgres \
  -e POSTGRES_USER=nyra_metamcp \
  -e POSTGRES_PASSWORD=nyra_m3t4mcp_2024 \
  -e POSTGRES_DB=nyra_metamcp_db \
  -p 5433:5432 \
  postgres:15

# Run database migrations
pnpm run db:migrate

# Start development server
pnpm run dev
```

### 4. Configure Project Nyra MCP Servers

Navigate to http://localhost:12008 and add MCP servers:

#### Desktop Commander
- **Name**: Desktop Commander
- **Type**: STDIO  
- **Command**: `npx`
- **Args**: `-y @wonderwhy-er/desktop-commander@latest`
- **Description**: File operations, process management, system commands
- **Namespace**: `dc`

#### rUv Swarm  
- **Name**: rUv Swarm
- **Type**: STDIO
- **Command**: `npx` 
- **Args**: `ruv-swarm@latest mcp start`
- **Description**: Neural coordination, swarm management, memory operations
- **Namespace**: `ruv`

#### Flow Nexus
- **Name**: Flow Nexus
- **Type**: STDIO
- **Command**: `npx`
- **Args**: `flow-nexus@latest mcp start`
- **Environment**: 
  - `FLOW_NEXUS_TOKEN`: (from Infisical)
  - `FLOW_NEXUS_URL`: (from Infisical)
- **Description**: Cloud execution, GitHub integration, neural training
- **Namespace**: `fn`

#### Claude Flow
- **Name**: Claude Flow
- **Type**: STDIO
- **Command**: `npx`
- **Args**: `claude-flow@alpha mcp start`
- **Description**: Agent spawning, workflow coordination, SPARC integration
- **Namespace**: `cf`

### 5. Middleware Configuration

Configure middlewares for Project Nyra needs:

#### Authentication Middleware
```json
{
  "name": "nyra-auth",
  "type": "auth",
  "config": {
    "method": "api-key",
    "keys": ["nyra-dev-key-2024"]
  }
}
```

#### Logging Middleware
```json
{
  "name": "nyra-logger",
  "type": "logging",
  "config": {
    "level": "info",
    "format": "json",
    "destination": "console"
  }
}
```

#### Request Routing Middleware
```json
{
  "name": "nyra-router", 
  "type": "router",
  "config": {
    "rules": [
      {
        "pattern": "github_*",
        "target": "flow-nexus"
      },
      {
        "pattern": "file_*",
        "target": "desktop-commander"
      },
      {
        "pattern": "swarm_*", 
        "target": "ruv-swarm"
      },
      {
        "pattern": "sparc_*",
        "target": "claude-flow"
      }
    ]
  }
}
```

## Integration with Existing Stack

### 1. Update Archon Configuration
```javascript
// config/mcp-archon-config.js
const mcpServers = {
  'metamcp': {
    priority: 0, // Highest priority - unified interface
    url: 'http://localhost:12008/mcp',
    type: 'http',
    capabilities: ['all'], // All capabilities via proxy
    status: 'connected'
  }
  // Keep existing servers as fallbacks
}
```

### 2. Update Claude Code MCP Configuration
```json
// .mcp.json
{
  "mcpServers": {
    "metamcp": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-stdio", "http://localhost:12008/mcp"],
      "env": {
        "METAMCP_API_KEY": "nyra-dev-key-2024"
      }
    }
  }
}
```

### 3. Environment Variables Integration
```bash
# Add to your Infisical secrets
METAMCP_URL=http://localhost:12008
METAMCP_API_KEY=nyra-dev-key-2024
METAMCP_POSTGRES_URL=postgresql://nyra_metamcp:nyra_m3t4mcp_2024@localhost:5433/nyra_metamcp_db
```

## Testing Integration

### 1. Test MCP Server Aggregation
```bash
# Test that all servers are accessible via MetaMCP
curl -X POST http://localhost:12008/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nyra-dev-key-2024" \
  -d '{"method": "tools/list", "params": {}}'
```

### 2. Test Archon Integration
```bash
# Run Archon with MetaMCP
npm run archon:start

# Test SPARC workflow via MetaMCP
npm run archon:test-sparc
```

### 3. Test GitHub Integration
```bash
# Test GitHub operations via MetaMCP
npm run github:test
```

## Production Deployment

### 1. Docker Compose Setup
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  metamcp:
    build: .
    ports:
      - "12008:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=nyra_metamcp
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=nyra_metamcp_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

volumes:
  postgres_data:
```

### 2. Environment Secrets
```bash
# Production secrets in Infisical
METAMCP_DATABASE_URL=postgresql://user:pass@host:port/db
METAMCP_AUTH_SECRET=production-secret-key
METAMCP_API_KEY=production-api-key
```

## Monitoring & Maintenance

### 1. Health Checks
- **MetaMCP Health**: `GET /health`
- **Database Health**: `GET /health/db`  
- **MCP Servers Health**: `GET /health/mcp-servers`

### 2. Logs & Metrics
- Application logs: JSON format with structured data
- MCP request/response logging
- Performance metrics: Request duration, error rates
- Database query performance

### 3. Backup Strategy
- PostgreSQL daily backups
- Configuration export/import
- MCP server configuration versioning

## Next Steps

1. ✅ Complete basic setup
2. ✅ Configure Project Nyra MCP servers
3. ✅ Set up middlewares
4. ✅ Test integration with Archon
5. ✅ Test GitHub integration
6. ✅ Production deployment
7. ✅ Monitoring setup
8. ✅ Documentation completion

MetaMCP will provide a powerful, unified interface to all your Project Nyra MCP servers with advanced features like middleware, monitoring, and dynamic configuration!