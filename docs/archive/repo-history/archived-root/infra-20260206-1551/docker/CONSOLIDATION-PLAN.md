# Dockerfile Consolidation Plan

## Canonical Directory Structure

```
/infra/docker/
  ├── services/              # Backend service Dockerfiles
  │   ├── mem0-rest/
  │   ├── nyra-orchestrator/
  │   ├── campaign-engine/
  │   ├── litellm-proxy/
  │   ├── quote-api/
  │   ├── quote-engine/
  │   ├── websocket-hub/
  │   └── orchestrator/
  ├── apps/                  # Frontend application Dockerfiles
  │   ├── nyra-admin/
  │   ├── ratehunter/
  │   └── mortgage-services/
  ├── orchestration/         # Orchestration tool Dockerfiles
  │   ├── claude-flow/
  │   ├── archon-os/
  │   ├── serena/
  │   └── ruv-swarm/
  ├── mcp-servers/           # MCP server Dockerfiles
  │   ├── bitwarden/
  │   ├── dify/
  │   ├── twentycrm/
  │   ├── vscode/
  │   ├── docker-mcp/
  │   ├── git-mcp/
  │   ├── infisical-mcp/
  │   └── dockerhub-mcp/
  ├── base/                  # Base/shared Dockerfiles
  │   ├── devcontainer/
  │   └── ci/
  └── tools/                 # Development tools
      └── archon/
```

## Consolidation Actions

### Phase 1: Create Missing Directories
- [x] `/infra/docker/services/`
- [x] `/infra/docker/orchestration/`
- [x] `/infra/docker/mcp-servers/`
- [x] `/infra/docker/tools/`

### Phase 2: Consolidate Service Dockerfiles
**Strategy**: Symlink from `/infra/docker/services/` to actual service directories

- [ ] mem0-rest: `/services/mem0-rest/Dockerfile`
- [ ] nyra-orchestrator: `/services/nyra-orchestrator/Dockerfile`
- [ ] campaign-engine: `/services/campaign-engine/Dockerfile`
- [ ] litellm-proxy: `/services/litellm-proxy/Dockerfile`
- [ ] quote-api: `/services/quote-api/Dockerfile`
- [ ] quote-engine: `/services/quote-engine/Dockerfile`
- [ ] websocket-hub: `/services/websocket-hub/Dockerfile`
- [ ] orchestrator: `/services/orchestrator/Dockerfile`

### Phase 3: Consolidate App Dockerfiles
**Strategy**: Move to `/infra/docker/apps/` and update references

- [ ] nyra-admin: `apps/nyra-admin/Dockerfile` → `/infra/docker/apps/nyra-admin/Dockerfile`
- [ ] ratehunter: `apps/ratehunter/Dockerfile` → `/infra/docker/apps/ratehunter/Dockerfile`
- [ ] mortgage-services: `apps/webapp/mortgage-services/Dockerfile` → `/infra/docker/apps/mortgage-services/Dockerfile`

### Phase 4: Consolidate Orchestration Dockerfiles
**Strategy**: Consolidate duplicates, keep one canonical version

- [ ] claude-flow (7 copies):
  - PRIMARY: `/infra/claude-flow/Dockerfile` (most recent)
  - Mark as .old: All other copies in orchestration/, infra/orchestrators/, infra/dual-orchestrator/
- [ ] archon-os (1 copy):
  - PRIMARY: `/infra/dual-orchestrator/archon-os/Dockerfile`
  - MOVE TO: `/infra/docker/orchestration/archon-os/Dockerfile`
- [ ] serena (1 copy):
  - PRIMARY: `/orchestration/serena/serena/Dockerfile`
  - MOVE TO: `/infra/docker/orchestration/serena/Dockerfile`
- [ ] ruv-swarm (1 copy):
  - PRIMARY: `/infra/ruv-swarm/Dockerfile`
  - MOVE TO: `/infra/docker/orchestration/ruv-swarm/Dockerfile`

### Phase 5: Consolidate MCP Server Dockerfiles
**Strategy**: Move to `/infra/docker/mcp-servers/`

- [ ] bitwarden: `/infra/mcp-servers/bitwarden/Dockerfile`
- [ ] dify: `/infra/mcp-servers/dify/Dockerfile`
- [ ] twentycrm: `/infra/mcp-servers/twentycrm/Dockerfile`
- [ ] vscode: `/infra/mcp-servers/vscode/Dockerfile`
- [ ] docker-mcp: `/infra/docker-mcp/Dockerfile`
- [ ] git-mcp: `/infra/git-mcp/Dockerfile`
- [ ] infisical-mcp: `/infra/infisical-mcp/Dockerfile`
- [ ] dockerhub-mcp: `/infra/dockerhub-mcp/Dockerfile`
- [ ] sequential-thinking-mcp: `/infra/sequential-thinking-mcp/Dockerfile`

### Phase 6: Consolidate Base/Devcontainer Dockerfiles
**Strategy**: Keep canonical versions

- [ ] devcontainer: Root `/Dockerfile` and `/.devcontainer/Dockerfile`
  - PRIMARY: `/.devcontainer/Dockerfile` (newer)
  - Mark as .old: `/Dockerfile`, `/devcontainer/Dockerfile`
- [ ] ci: `/ci/Dockerfile` → `/infra/docker/base/ci/Dockerfile`

### Phase 7: Consolidate Tool Dockerfiles
**Strategy**: Move to `/infra/docker/tools/`

- [ ] archon tools: `/tools/archon/` (multiple Dockerfiles)
  - Move to `/infra/docker/tools/archon/`

### Phase 8: Update References
- [ ] Update docker-compose.yml (root)
- [ ] Update infra/docker/docker-compose.full.yml
- [ ] Update infra/stacks/nyra-mortgage/docker-compose.yml
- [ ] Update CI/CD workflows (if any)
- [ ] Update documentation

## Files to Mark as .old (Duplicates)

### Claude Flow Duplicates
- `/orchestration/claude-flow/Dockerfile` → `.old`
- `/infra/orchestrators/claude-flow/Dockerfile` → `.old`
- `/infra/dual-orchestrator/claude-flow/Dockerfile` → `.old`
- `/infra/docker/claude-flow/Dockerfile.claude-flow` → `.old`
- `/infra/docker/claude-flow/Dockerfile.mcp` → `.old`

### Root Dockerfiles
- `/Dockerfile` → `.old` (superseded by .devcontainer)
- `/Dockerfile.optimized` → `.old`

### Assets/Examples (keep in place, already archived)
- All Dockerfiles in `assets/` and `docs/references/` - NO ACTION

## Exclusions (Archive, Examples, Node Modules)
- `_archive/**` - No action, already archived
- `assets/**` - No action, ingestion data
- `docs/references/**` - No action, examples
- `node_modules/**` - No action
- `bootstrap/mcp-servers/exa/Dockerfile` - Keep as bootstrap example
