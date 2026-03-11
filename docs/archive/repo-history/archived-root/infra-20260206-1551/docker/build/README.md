# Consolidated Docker Build Files

**Consolidated**: 2026-01-18
**Structure Version**: 1.0

This directory contains all Dockerfiles for Project Nyra, consolidated from scattered locations across the repository for better organization and maintainability.

## Directory Structure

```
build/
├── README.md                          # This file
├── archive/                           # Historical .old files (27 files)
├── claude-flow/                       # Claude Flow V3 orchestration
│   └── Dockerfile                     # Best-practice merged from 6 duplicates
├── archon/                            # Archon AI system
│   ├── Dockerfile                     # Main Archon container
│   ├── Dockerfile.archon-os           # Archon OS variant
│   ├── Dockerfile.agents              # Python agents
│   ├── Dockerfile.mcp                 # MCP server
│   └── Dockerfile.server              # Backend server
├── mcp-servers/                       # MCP protocol servers
│   ├── bitwarden/
│   ├── dify/
│   ├── twentycrm/
│   ├── vscode/
│   ├── docker-mcp/
│   ├── git-mcp/
│   ├── infisical-mcp/
│   ├── dockerhub-mcp/
│   ├── sequential-thinking-mcp/
│   └── exa/
├── services/                          # Backend microservices
│   ├── campaign-engine/
│   ├── litellm-proxy/
│   ├── mem0-mcp/
│   ├── mem0-rest-api/
│   ├── mem0-rest/
│   ├── nexus-router/
│   ├── nyra-orchestrator/
│   ├── orchestrator/
│   ├── quote-api/
│   ├── quote-engine/
│   └── websocket-hub/
├── apps/                              # Frontend applications
│   ├── nyra-admin/
│   ├── ratehunter/
│   ├── mortgage-services/
│   └── Dockerfile.webui               # Web UI variant
├── orchestration/                     # Orchestration services
│   ├── serena/                        # Serena orchestrator
│   └── ruv-swarm/                     # RUV swarm coordinator
├── infisical/                         # Secret management
│   ├── Dockerfile.mcp                 # Infisical MCP server
│   └── Dockerfile.sync                # Secret synchronization
└── base/                              # Base/shared images
    ├── devcontainer/                  # Development containers
    ├── ci/                            # CI/CD containers
    ├── Dockerfile.dev                 # Development base
    └── Dockerfile.orchestrator        # Orchestrator base
```

## Key Highlights

### Claude Flow V3 - Best Practice Merge

**Location**: `claude-flow/Dockerfile`

Merged 6 duplicate Dockerfiles into a single best-practice version with:
- ✅ Multi-stage build (deps, builder, production, development)
- ✅ Node 22-alpine (latest LTS)
- ✅ pnpm for modern package management
- ✅ Security hardening (non-root user, minimal image)
- ✅ Tini for proper signal handling
- ✅ Comprehensive health checks
- ✅ Infisical secret injection support
- ✅ Multiple modes (MCP server, daemon, API)
- ✅ Flexible port configuration
- ✅ Complete metadata labels

**Archived Originals** (in `archive/`):
1. `claude-flow-1-mcp-server.old` - MCP server variant
2. `claude-flow-2-multi-stage.old` - Multi-stage build variant
3. `claude-flow-3-daemon.old` - Daemon mode variant
4. `claude-flow-4-orchestrator.old` - Orchestrator variant
5. `claude-flow-5-pnpm-orchestrator.old` - pnpm orchestrator variant
6. `claude-flow-6-infisical-mcp.old` - Infisical integration variant

### Environment Variables for Claude Flow

```bash
# Mode selection (default: mcp)
MODE=mcp          # MCP server mode
MODE=daemon       # Daemon mode
MODE=api          # API mode

# Port configuration
MCP_PORT=8003           # MCP server port
DAEMON_PORT=6100        # Daemon API port
API_PORT=3000           # HTTP API port
GRPC_PORT=50051         # gRPC port
METRICS_PORT=9090       # Prometheus metrics

# Infisical integration
INFISICAL_ENV=production           # Environment (production/staging/dev)
INFISICAL_PATH=/nyra/claude-flow   # Secret path

# Claude Flow configuration
CLAUDE_FLOW_HOME=/app
CLAUDE_FLOW_DATA_DIR=/app/data
CLAUDE_FLOW_LOGS_DIR=/app/logs
CLAUDE_FLOW_CONFIG_DIR=/app/config
CLAUDE_FLOW_SESSIONS_DIR=/app/sessions
CLAUDE_FLOW_MEMORY_DIR=/app/memory
```

### Build Targets for Claude Flow

```bash
# Production build (default)
docker build --target production -t nyra/claude-flow:latest .

# Development build
docker build --target development -t nyra/claude-flow:dev .

# Build with version info
docker build \
  --build-arg VERSION=3.0.0-alpha.104 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg GIT_COMMIT=$(git rev-parse HEAD) \
  -t nyra/claude-flow:3.0.0-alpha.104 .
```

### Running Claude Flow Modes

```bash
# MCP Server Mode (default)
docker run -p 8003:8003 \
  -e MODE=mcp \
  -e MCP_PORT=8003 \
  nyra/claude-flow:latest

# Daemon Mode
docker run -p 6100:6100 \
  -e MODE=daemon \
  -e DAEMON_PORT=6100 \
  -v ./data:/app/data \
  nyra/claude-flow:latest

# API Mode
docker run -p 3000:3000 -p 50051:50051 -p 9090:9090 \
  -e MODE=api \
  -e API_PORT=3000 \
  nyra/claude-flow:latest

# With Infisical secrets
docker run -p 8003:8003 \
  -e MODE=mcp \
  -e INFISICAL_TOKEN=${INFISICAL_TOKEN} \
  -e INFISICAL_ENV=production \
  -e INFISICAL_PATH=/nyra/claude-flow \
  nyra/claude-flow:latest
```

## MCP Servers

All MCP (Model Context Protocol) servers consolidated under `mcp-servers/`:

- **bitwarden** - Password manager integration
- **dify** - Dify AI platform integration
- **twentycrm** - TwentyCRM integration
- **vscode** - VS Code integration
- **docker-mcp** - Docker operations
- **git-mcp** - Git operations with workspace bind mounting
- **infisical-mcp** - Secret management
- **dockerhub-mcp** - Docker Hub operations
- **sequential-thinking-mcp** - Structured reasoning tool
- **exa** - Exa search integration

Each MCP server has its own CLAUDE.md with detailed configuration and usage.

## Backend Services

Production microservices under `services/`:

- **campaign-engine** - Marketing campaign orchestration
- **litellm-proxy** - LLM proxy service
- **mem0-mcp** - Memory MCP server
- **mem0-rest-api** - Memory REST API
- **mem0-rest** - Memory service
- **nexus-router** - API gateway and router
- **nyra-orchestrator** - Main orchestration service
- **orchestrator** - Generic orchestrator
- **quote-api** - Quote generation API
- **quote-engine** - Quote processing engine
- **websocket-hub** - WebSocket communication hub

## Frontend Applications

User-facing applications under `apps/`:

- **nyra-admin** - Administrative dashboard
- **ratehunter** - Rate comparison tool
- **mortgage-services** - Mortgage services portal

## Orchestration Services

Orchestration and coordination under `orchestration/`:

- **serena** - Serena orchestrator (dual-layer coding agent toolkit)
- **ruv-swarm** - RUV swarm coordinator

## Archive Contents

The `archive/` directory contains 27 historical `.old` Dockerfile versions:

### Claude Flow Duplicates (6)
- claude-flow-1-mcp-server.old
- claude-flow-2-multi-stage.old
- claude-flow-3-daemon.old
- claude-flow-4-orchestrator.old
- claude-flow-5-pnpm-orchestrator.old
- claude-flow-6-infisical-mcp.old

### MCP Servers (.old versions)
- bitwarden-mcp.old
- dify-mcp.old
- twentycrm-mcp.old
- vscode-mcp.old
- dockerhub-mcp.old
- git-mcp.old
- infisical-mcp.old
- docker-mcp.old
- sequential-thinking-mcp.old
- ruv-swarm.old

### Base Images
- devcontainer-1.old
- devcontainer-2.old
- ci.old

### Root Level
- root-dockerfile.old
- root-dockerfile-optimized.old

### Other Services
- serena-orchestrator.old
- archon-ui.old
- archon-docs.old

## Migration Guide

If you need to reference old Dockerfiles or migrate docker-compose files:

### Find Original Location

All archived files are named descriptively. Check `archive/` for the specific version.

### Update docker-compose.yml References

Old pattern:
```yaml
build:
  context: ../../orchestration/claude-flow
  dockerfile: Dockerfile
```

New pattern:
```yaml
build:
  context: ../..
  dockerfile: infra/docker/build/claude-flow/Dockerfile
```

### Service-Specific Builds

Old pattern:
```yaml
build: ./services/quote-api
```

New pattern:
```yaml
build:
  context: .
  dockerfile: infra/docker/build/services/quote-api/Dockerfile
```

## Best Practices

### 1. Multi-Stage Builds
Use multi-stage builds to minimize final image size:
- `deps` stage for dependencies
- `builder` stage for compilation
- `production` stage for runtime
- `development` stage for local dev

### 2. Security
- ✅ Run as non-root user
- ✅ Use specific base image versions (not `latest`)
- ✅ Scan for vulnerabilities
- ✅ Minimize installed packages
- ✅ Use `.dockerignore`

### 3. Labels and Metadata
Include OCI labels:
```dockerfile
LABEL org.opencontainers.image.title="Service Name"
LABEL org.opencontainers.image.description="Description"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.source="https://github.com/..."
```

### 4. Health Checks
Always include health checks:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:PORT/health || exit 1
```

### 5. Proper Signal Handling
Use tini or dumb-init for proper signal handling:
```dockerfile
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
```

## Building Images

### Build All Services

```bash
# From project root
for service in infra/docker/build/services/*/; do
  service_name=$(basename "$service")
  docker build -t "nyra/${service_name}:latest" \
    -f "infra/docker/build/services/${service_name}/Dockerfile" .
done
```

### Build Specific Service

```bash
# Example: Build quote-api
docker build -t nyra/quote-api:latest \
  -f infra/docker/build/services/quote-api/Dockerfile .
```

### Build with Context

Most services need the project root as context:
```bash
docker build -t nyra/service:latest \
  -f infra/docker/build/services/service/Dockerfile \
  --context . \
  .
```

## Testing

### Test Build

```bash
docker build --no-cache -t test-image \
  -f infra/docker/build/SERVICE/Dockerfile .
```

### Test Run

```bash
docker run --rm -it \
  -p 8080:8080 \
  -e ENV_VAR=value \
  test-image
```

### Inspect Layers

```bash
docker history test-image
docker inspect test-image
```

## Maintenance

### Updating Dockerfiles

1. Edit the Dockerfile in the appropriate directory
2. Test the build locally
3. Update any affected docker-compose files
4. Document changes in this README if structure changes

### Adding New Services

1. Create directory under appropriate category (`services/`, `apps/`, etc.)
2. Add Dockerfile with best practices
3. Include CLAUDE.md if applicable
4. Update this README with the new service

### Removing Services

1. Move Dockerfile to `archive/` with descriptive name
2. Update this README to remove references
3. Update affected docker-compose files

## Related Documentation

- Main docker-compose files: `docker-compose*.yml` in project root
- Infrastructure docs: `docs/architecture/CONTAINERIZATION-*.md`
- Security guide: `docs/INFRASTRUCTURE-SECURITY-AUDIT.md`
- Service-specific READMEs in each service directory

---

**Maintained by**: Project Nyra Team
**Last Updated**: 2026-01-18
**Consolidation Status**: ✅ Complete (87 Dockerfiles consolidated)
