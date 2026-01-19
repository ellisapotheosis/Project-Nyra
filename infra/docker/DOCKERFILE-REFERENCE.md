# Dockerfile Reference Guide

## Canonical Directory Structure

All Dockerfiles have been consolidated to the following canonical locations:

```
/infra/docker/
  ├── services/              # Backend service Dockerfiles (symlinks to /services/)
  ├── apps/                  # Frontend application Dockerfiles (consolidated here)
  │   ├── nyra-admin/
  │   ├── ratehunter/
  │   └── mortgage-services/
  ├── orchestration/         # Orchestration tool Dockerfiles
  │   ├── claude-flow/       # Claude Flow orchestrator
  │   ├── archon-os/         # Archon OS agent system
  │   ├── serena/            # Serena MCP server
  │   └── ruv-swarm/         # Ruv Swarm coordinator
  ├── mcp-servers/           # MCP server Dockerfiles
  │   ├── bitwarden/         # Bitwarden MCP server
  │   ├── dify/              # Dify MCP server
  │   ├── twentycrm/         # Twenty CRM MCP server
  │   ├── vscode/            # VSCode MCP server
  │   ├── docker-mcp/        # Docker MCP server
  │   ├── git-mcp/           # Git MCP server
  │   ├── infisical-mcp/     # Infisical MCP server
  │   ├── dockerhub-mcp/     # DockerHub MCP server
  │   └── sequential-thinking-mcp/  # Sequential Thinking MCP
  ├── base/                  # Base/shared Dockerfiles
  │   ├── devcontainer/      # Development container
  │   └── ci/                # CI/CD container
  └── tools/                 # Development tools
      └── archon/            # Archon tool Dockerfiles
```

## Service Dockerfiles

Service Dockerfiles remain in their original locations for standard Docker conventions:

- `/services/mem0-rest/Dockerfile`
- `/services/nyra-orchestrator/Dockerfile`
- `/services/campaign-engine/Dockerfile`
- `/services/litellm-proxy/Dockerfile`
- `/services/quote-api/Dockerfile`
- `/services/quote-engine/Dockerfile`
- `/services/websocket-hub/Dockerfile`
- `/services/orchestrator/Dockerfile`

**Why?** This follows Docker Compose best practices where services are built from their own directories.

## Application Dockerfiles

Application Dockerfiles are now consolidated in `/infra/docker/apps/`:

- `/infra/docker/apps/nyra-admin/Dockerfile` (was: `/apps/nyra-admin/Dockerfile`)
- `/infra/docker/apps/ratehunter/Dockerfile` (was: `/apps/ratehunter/Dockerfile`)
- `/infra/docker/apps/mortgage-services/Dockerfile` (was: `/apps/webapp/mortgage-services/Dockerfile`)

**Note:** Update docker-compose references to point to new locations.

## Orchestration Dockerfiles

All orchestration tool Dockerfiles are now in `/infra/docker/orchestration/`:

### Claude Flow
- **Canonical**: `/infra/docker/orchestration/claude-flow/Dockerfile`
- **Marked as .old**:
  - `/infra/claude-flow/Dockerfile.old`
  - `/orchestration/claude-flow/Dockerfile.old`
  - `/infra/docker/claude-flow/Dockerfile.claude-flow.old`
  - `/infra/docker/claude-flow/Dockerfile.mcp.old`
  - `/infra/orchestrators/claude-flow/Dockerfile.old`
  - `/infra/dual-orchestrator/claude-flow/Dockerfile.old`

### Archon OS
- **Canonical**: `/infra/docker/orchestration/archon-os/Dockerfile`
- **Marked as .old**: `/infra/dual-orchestrator/archon-os/Dockerfile.old`

### Serena
- **Canonical**: `/infra/docker/orchestration/serena/Dockerfile`
- **Marked as .old**: `/orchestration/serena/serena/Dockerfile.old`

### Ruv-Swarm
- **Canonical**: `/infra/docker/orchestration/ruv-swarm/Dockerfile`
- **Marked as .old**: `/infra/ruv-swarm/Dockerfile.old`

## MCP Server Dockerfiles

All MCP server Dockerfiles are now in `/infra/docker/mcp-servers/`:

- `/infra/docker/mcp-servers/bitwarden/Dockerfile` (was: `/infra/mcp-servers/bitwarden/Dockerfile`)
- `/infra/docker/mcp-servers/dify/Dockerfile` (was: `/infra/mcp-servers/dify/Dockerfile`)
- `/infra/docker/mcp-servers/twentycrm/Dockerfile` (was: `/infra/mcp-servers/twentycrm/Dockerfile`)
- `/infra/docker/mcp-servers/vscode/Dockerfile` (was: `/infra/mcp-servers/vscode/Dockerfile`)
- `/infra/docker/mcp-servers/docker-mcp/Dockerfile` (was: `/infra/docker-mcp/Dockerfile`)
- `/infra/docker/mcp-servers/git-mcp/Dockerfile` (was: `/infra/git-mcp/Dockerfile`)
- `/infra/docker/mcp-servers/infisical-mcp/Dockerfile` (was: `/infra/infisical-mcp/Dockerfile`)
- `/infra/docker/mcp-servers/dockerhub-mcp/Dockerfile` (was: `/infra/dockerhub-mcp/Dockerfile`)
- `/infra/docker/mcp-servers/sequential-thinking-mcp/Dockerfile` (was: `/infra/sequential-thinking-mcp/Dockerfile`)

## Base Dockerfiles

Base and development container Dockerfiles are in `/infra/docker/base/`:

### Devcontainer
- **Canonical**: `/infra/docker/base/devcontainer/Dockerfile`
- **Marked as .old**:
  - `/.devcontainer/Dockerfile.old`
  - `/Dockerfile.old` (root)
  - `/devcontainer/Dockerfile.old`

### CI
- **Canonical**: `/infra/docker/base/ci/Dockerfile`
- **Marked as .old**: `/ci/Dockerfile.old`

### Other
- **Marked as .old**: `/Dockerfile.optimized.old`

## Tool Dockerfiles

Development tool Dockerfiles are in `/infra/docker/tools/`:

### Archon Tools
- `/infra/docker/tools/archon/Dockerfile.agents` (was: `/tools/archon/python/Dockerfile.agents`)
- `/infra/docker/tools/archon/Dockerfile.mcp` (was: `/tools/archon/python/Dockerfile.mcp`)
- `/infra/docker/tools/archon/Dockerfile.server` (was: `/tools/archon/python/Dockerfile.server`)
- `/infra/docker/tools/archon/Dockerfile.docs` (was: `/tools/archon/docs/Dockerfile`)
- `/infra/docker/tools/archon/Dockerfile.ui` (was: `/tools/archon/archon-ui-main/Dockerfile`)

## Excluded from Consolidation

The following Dockerfiles were intentionally excluded:

- `_archive/**` - Archived files, no changes needed
- `assets/**` - Ingestion data, examples
- `docs/references/**` - Documentation examples
- `node_modules/**` - Dependencies
- `bootstrap/mcp-servers/exa/Dockerfile` - Bootstrap example

## Docker Compose Reference Updates

When updating docker-compose files, use these new paths:

```yaml
# Before
build:
  context: ./apps/nyra-admin
  dockerfile: Dockerfile

# After
build:
  context: ./infra/docker/apps/nyra-admin
  dockerfile: Dockerfile
```

## Rollback Instructions

If you need to restore original Dockerfiles, rename `.old` files:

```bash
# Example
mv /infra/claude-flow/Dockerfile.old /infra/claude-flow/Dockerfile
```

## Benefits of Consolidation

1. **Single source of truth** - All infrastructure Dockerfiles in `/infra/docker/`
2. **Reduced duplication** - Eliminated 7+ duplicate claude-flow Dockerfiles
3. **Easier maintenance** - Clear structure for finding and updating Dockerfiles
4. **Better organization** - Logical grouping by purpose (services, apps, orchestration, etc.)
5. **Safer rollback** - All originals marked with `.old` extension

## Next Steps

1. Update docker-compose.yml files to reference new Dockerfile locations
2. Update CI/CD pipelines
3. Update documentation
4. Test all builds
5. After successful testing, delete `.old` files
