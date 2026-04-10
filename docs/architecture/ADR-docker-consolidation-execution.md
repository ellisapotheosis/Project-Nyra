# ADR-011: Docker Infrastructure Consolidation

**Status**: Proposed
**Date**: 2026-01-19
**Deciders**: Hierarchical Coordinator, Infrastructure Team
**Tags**: docker, infrastructure, consolidation, refactoring

---

## Context

Project Nyra has grown organically, resulting in Docker files scattered across **8+ locations**:

1. **Root level**: MCP compose files (`docker-compose.*.yml`)
2. **Configs directory**: Worker and orchestrator compose files
3. **/docker/ directory**: Legacy alternative configurations
4. **Services**: 11 Dockerfiles in `/services/*/Dockerfile`
5. **Apps**: 3 Dockerfiles in `/apps/*/Dockerfile`
6. **Orchestration**: Claude Flow and Serena configs
7. **Gitea**: Already moved to `.gitea/`
8. **Assets**: Old ingestion docker configs

This fragmentation causes:
- **Discovery issues**: Hard to find Docker files
- **Duplication**: Multiple definitions of same services
- **Maintenance burden**: Changes must be applied in multiple places
- **Build context confusion**: Unclear which Dockerfile is canonical
- **Documentation drift**: README files contradict actual structure

### Current State

```
Project-Nyra/
├── docker-compose.*.yml (6 root-level MCP files)
├── configs/docker-compose.*.yml (worker configs)
├── docker/ (legacy 132K)
├── services/*/Dockerfile (11 service images)
├── apps/*/Dockerfile (3 app images)
├── orchestration/*/Dockerfile (orchestrator images)
├── assets/new-uploads-ingestion-input/docker/ (old assets)
└── infra/
    ├── docker/ (543K - partially consolidated)
    └── docker-compose/ (72K - modular, domain-driven)
```

### Research Findings

Per `.research/docker-inventory-complete.json`:
- **Total Docker compose files**: 115
- **Total Dockerfiles**: 94
- **Root-level compose files**: 6
- **Infra docker files**: 81

The research identified `/infra/docker-compose/` as the **best-organized structure** with clean domain-driven design.

---

## Decision

We will adopt a **canonical Docker structure** with two primary locations:

### 1. `/infra/docker-compose/` - Modular Compose Stack

**Domain-driven compose files** (already exists, will enhance):
```
/infra/docker-compose/
├── docker-compose.yml (main entrypoint with includes)
├── docker-compose.base.yml (postgres, redis)
├── docker-compose.databases.yml (qdrant, falkordb)
├── docker-compose.ai.yml (nexus, litellm, letta, mem0)
├── docker-compose.crm.yml (twentycrm)
├── docker-compose.workflow.yml (n8n, dify, activepieces)
├── docker-compose.observability.yml (prometheus, grafana, loki)
├── docker-compose.orchestrator.yml (nyra-orchestrator, archon)
├── docker-compose.business.yml (quote-engine, campaign-engine)
└── docker-compose.mcp-servers.yml (MCP server definitions)
```

### 2. `/infra/docker/build/` - Centralized Dockerfile Library

**Organized by category**:
```
/infra/docker/build/
├── base/
│   ├── ci/Dockerfile
│   └── devcontainer/Dockerfile
├── services/
│   ├── nexus-router/Dockerfile (CRITICAL)
│   ├── litellm-proxy/Dockerfile
│   ├── mem0-mcp/Dockerfile
│   ├── nyra-orchestrator/Dockerfile
│   └── [10+ other services]
├── apps/
│   ├── nyra-admin/Dockerfile
│   ├── ratehunter/Dockerfile
│   └── mortgage-services/Dockerfile
├── orchestration/
│   ├── archon-os/Dockerfile
│   └── serena/Dockerfile
└── mcp-servers/ (already exists)
    ├── bitwarden/Dockerfile
    ├── dify/Dockerfile
    └── [7+ other MCP servers]
```

### 3. Exception: Service-Specific Files Stay With Services

**Keep in place**:
- `/services/[service]/package.json` - Dependencies
- `/services/[service]/src/` - Source code
- `/services/[service]/.env.example` - Config templates

**Only move**:
- Dockerfiles → `/infra/docker/build/services/[service]/`

---

## Rationale

### Why This Structure?

**1. Clear Separation of Concerns**
- **Compose files** (what to run) in `/infra/docker-compose/`
- **Dockerfiles** (how to build) in `/infra/docker/build/`
- **Source code** (what to build) in `/services/` and `/apps/`

**2. Domain-Driven Organization**
- Compose files grouped by business domain (AI, CRM, Business Logic)
- Easy to start subsets: `docker compose --profile ai up`
- Clear dependencies between layers

**3. Single Source of Truth**
- One canonical location for each Dockerfile
- No duplicate definitions
- Version control tracks all changes

**4. Build Context Preservation**
- Keep build context at service root (`/services/[service]/`)
- Use `dockerfile:` parameter to point to centralized Dockerfile
- No COPY path changes needed

**5. Easier Discovery**
- Developers know exactly where to find Docker files
- Consistent naming: `/infra/docker/build/[category]/[name]/`
- Documentation can reference single location

---

## Consequences

### Positive

✅ **Reduced Confusion**: Single source of truth for Docker files
✅ **Easier Maintenance**: Changes in one place
✅ **Better Documentation**: Clear structure to document
✅ **Faster Onboarding**: New developers find files easily
✅ **Cleaner Root**: No more scattered compose files
✅ **Domain Alignment**: Compose files match business domains
✅ **Scalability**: Easy to add new services

### Negative

⚠️ **Migration Effort**: Must move and update 30+ files
⚠️ **Path Updates**: Compose files must update build context paths
⚠️ **Testing Required**: Validate all builds and deployments
⚠️ **Documentation Updates**: Update all references to old paths
⚠️ **Team Learning**: Team must learn new structure

### Risks (See `.research/consolidation-risks.md`)

**HIGH RISK**:
- Nexus-router on port 6000 (3 services depend on it)
- Build context path resolution
- Volume mount path changes

**MITIGATION**:
- Copy files first, test, then archive originals
- Validate at every step
- Keep rollback plan ready
- Test nexus routing thoroughly

---

## Implementation Plan

### Phase 1: Copy Dockerfiles (Non-Breaking)
```bash
# Create new directory structure
mkdir -p infra/docker/build/{base,services,apps,orchestration}

# Copy all Dockerfiles
# Services (11 files)
cp services/nexus-router/Dockerfile infra/docker/build/services/nexus-router/
cp services/litellm-proxy/Dockerfile infra/docker/build/services/litellm-proxy/
# ... (continue for all 11 services)

# Apps (3 files)
cp apps/nyra-admin/Dockerfile infra/docker/build/apps/nyra-admin/
cp apps/ratehunter/Dockerfile infra/docker/build/apps/ratehunter/
cp apps/webapp/mortgage-services/Dockerfile infra/docker/build/apps/mortgage-services/

# Orchestration (2 files)
cp orchestration/archon-os/Dockerfile infra/docker/build/orchestration/archon-os/
cp orchestration/serena/Dockerfile infra/docker/build/orchestration/serena/
```

### Phase 2: Update Compose Files
```yaml
# Example: Update infra/docker-compose/docker-compose.ai.yml
services:
  nexus:
    build:
      context: ../../services/nexus-router  # Keep original context
      dockerfile: ../../docker/build/services/nexus-router/Dockerfile  # Point to new location
```

### Phase 3: Validate Builds
```bash
# Test builds from new locations
docker compose -f infra/docker-compose.yml config  # Syntax check
docker compose build nexus  # Build nexus-router
docker compose up -d nexus  # Test startup
curl http://localhost:6000/health  # Test routing
```

### Phase 4: Consolidate Compose Files

**Review and merge**:
- `services/litellm-proxy/docker-compose.yml` → `docker-compose.ai.yml`
- `services/memory/*/docker-compose.*.yml` → `docker-compose.ai.yml`
- `orchestration/archon-os/config/*/docker-compose.yml` → `docker-compose.orchestrator.yml`

**Create comparison reports** for each merge.

### Phase 5: Archive Deprecated Files

**Move to** `_archive/deprecated-docker-files-2026-01-19/`:
- `assets/new-uploads-ingestion-input/docker/` (entire directory)
- Original Dockerfiles (after validation passes)

**Create manifest**: `ARCHIVE_MANIFEST.json` with source→archive mappings

### Phase 6: Documentation

**Update**:
- `/infra/docker/README.md` - New structure guide
- `/infra/docker/QUICK-START.md` - How to use new structure
- `docs/architecture/CONTAINERIZATION-ARCHITECTURE.md` - Architecture docs
- Root `README.md` - Point to new locations

---

## Validation Criteria

### Build Validation
- ✅ All Dockerfiles build successfully from new locations
- ✅ No COPY instruction errors
- ✅ Multi-stage builds work correctly
- ✅ Image sizes unchanged or smaller

### Service Validation
- ✅ All services start successfully
- ✅ Health checks pass
- ✅ Inter-service communication works
- ✅ Volume mounts resolve correctly

### Nexus-Router Validation (CRITICAL)
- ✅ Nexus builds from `infra/docker/build/services/nexus-router/Dockerfile`
- ✅ Nexus starts on port 6000
- ✅ Health check responds: `curl http://localhost:6000/health`
- ✅ Letta connects to `http://nexus:6000/v1`
- ✅ Mem0 connects to `http://nexus:6000/llm/openai/v1`
- ✅ Open-WebUI connects to `http://nexus:3000/llm/openai`

### Documentation Validation
- ✅ All old path references updated
- ✅ Quick-start guides accurate
- ✅ Architecture diagrams updated

---

## Rollback Plan

**If consolidation fails**:

1. **Stop services**:
   ```bash
   docker compose -f infra/docker-compose.yml down
   ```

2. **Revert compose files**:
   ```bash
   git checkout infra/docker-compose/docker-compose.ai.yml
   git checkout infra/docker-compose/docker-compose.orchestrator.yml
   ```

3. **Remove new Dockerfile locations** (originals preserved):
   ```bash
   rm -rf infra/docker/build/
   ```

4. **Restart with original config**:
   ```bash
   docker compose -f infra/docker-compose.yml up -d
   ```

5. **Validate services**:
   ```bash
   docker compose ps
   curl http://localhost:6000/health
   ```

---

## Success Metrics

**Quantitative**:
- 30+ Dockerfiles consolidated
- 8 scattered locations reduced to 2 canonical locations
- 0 broken services after migration
- 0 downtime for nexus-router

**Qualitative**:
- Easier for developers to find Docker files
- Faster onboarding with clear structure
- Better documentation accuracy
- Reduced maintenance burden

---

## Related Documents

- **Execution Map**: `.research/consolidation-execution-map.json`
- **Risk Analysis**: `.research/consolidation-risks.md`
- **Inventory**: `.research/docker-inventory-complete.json`
- **Previous Research**: `.research/docker-consolidation-summary.md`

---

## Decision Log

| Date | Decider | Decision |
|------|---------|----------|
| 2026-01-19 | Hierarchical Coordinator | Adopt canonical structure with /infra/docker-compose/ and /infra/docker/build/ |
| 2026-01-19 | Hierarchical Coordinator | Preserve build contexts at service roots |
| 2026-01-19 | Hierarchical Coordinator | Copy-first, validate, then archive strategy |
| 2026-01-19 | Hierarchical Coordinator | Nexus-router validation is go/no-go criteria |

---

## References

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- Project Nyra: `.research/docker-inventory-complete.json`

---

**Status**: Awaiting approval and execution
**Next Steps**: Execute Phase 1 (Copy Dockerfiles)
**Assigned To**: Infrastructure Team
**Target Completion**: 2026-01-20
