# Nyra Stack Consolidation Report

**Date**: 2026-01-17
**Task**: Consolidate nyra-stack (68KB) into organized monorepo structure
**Status**: ✅ Completed

## Executive Summary

Successfully consolidated the `nyra-stack/` directory from the repository root into the `infra/stacks/nyra-mortgage/` directory, organizing it as a specialized mortgage workflow stack alongside the main infrastructure setup.

## What Was Moved

### Source Directory
- **Location**: `C:\Dev\Projects\Repos\Project-Nyra\nyra-stack` (root level)
- **Size**: 68KB
- **Files**: 23 files total

### Destination
- **New Location**: `C:\Dev\Projects\Repos\Project-Nyra\infra\stacks\nyra-mortgage\`
- **Purpose**: Specialized stack for mortgage workflow operations

## Directory Structure

### Consolidated Structure
```
infra/stacks/nyra-mortgage/
├── configs/
│   ├── litellm/
│   │   └── config.yaml
│   ├── nexus/
│   │   └── nexus.toml
│   └── observability/
│       ├── alertmanager.yml
│       ├── loki.yml
│       ├── prometheus.yml
│       └── grafana/
│           └── provisioning/
├── docs/
│   ├── ARCHITECTURE.md
│   └── COMPLIANCE_CHECKLIST.md
├── scripts/
│   ├── dev.ps1
│   └── dev.sh
├── services/
│   ├── mem0-rest/
│   │   ├── app/
│   │   │   └── main.py
│   │   └── Dockerfile
│   └── nyra-orchestrator/
│       ├── app/
│       │   └── main.py
│       └── Dockerfile
├── docker-compose.yml
├── docker-compose.addons.yml
├── docker-compose.graphiti.yml
├── docker-compose.local.yml
├── docker-compose.services.yml
├── docker-compose.voice.yml
├── .env.example
└── README.md
```

## Stack Purpose and Architecture

### Nyra Mortgage Stack (Specialized)
A **batteries-included** Docker Compose stack focused on mortgage operations:

**Core Services**:
- **Twenty CRM**: System of record for customer data
- **FalkorDB + Graphiti**: Graph memory for relationships and long-term facts
- **Letta**: Stateful agent manager
- **Mem0 (REST)**: Universal memory for preferences and conversational breadcrumbs
- **Nexus**: LLM routing + MCP aggregation
- **LiteLLM**: LLM gateway with OpenRouter support
- **Observability**: Prometheus, Loki, Grafana, Alertmanager
- **Open WebUI**: Optional UI layer

**Custom Services**:
- `mem0-rest`: REST API wrapper for Mem0 memory system
- `nyra-orchestrator`: Main orchestration service for mortgage lead processing

### Relationship to Main Infra

| Aspect | Nyra Mortgage Stack | Main Infra Stack |
|--------|---------------------|------------------|
| **Scope** | Mortgage-specific workflow | General-purpose infrastructure |
| **Services** | CRM-focused (Twenty, Letta, Mem0) | Broad tooling (Dify, n8n, Gitea, etc.) |
| **Purpose** | Production mortgage operations | Development and automation |
| **Complexity** | Lighter, focused | Comprehensive, full-featured |
| **Target** | Single-node deployment | Multi-service orchestration |

## Key Differences from Main Services

The `services/mem0-rest/` and `services/nyra-orchestrator/` directories in the stack contain **simplified, stack-specific versions** for this deployment:

1. **Stack Services** (`infra/stacks/nyra-mortgage/services/`):
   - Lightweight implementations
   - Tailored for mortgage workflow
   - Embedded in the stack's docker-compose

2. **Main Services** (`services/`):
   - Comprehensive, production-ready implementations
   - More features and validation
   - Used by the main infrastructure

**Decision**: Keep both versions as they serve different purposes and deployment contexts.

## Git Operations Performed

```bash
# 1. Create target directory
mkdir -p infra/stacks/nyra-mortgage

# 2. Move configuration and documentation
git mv nyra-stack/configs infra/stacks/nyra-mortgage/
git mv nyra-stack/docs infra/stacks/nyra-mortgage/
git mv nyra-stack/scripts infra/stacks/nyra-mortgage/

# 3. Move Docker Compose files
git mv nyra-stack/docker-compose*.yml infra/stacks/nyra-mortgage/
git mv nyra-stack/.env.example infra/stacks/nyra-mortgage/
git mv nyra-stack/README.md infra/stacks/nyra-mortgage/

# 4. Move services (stack-specific versions)
git mv nyra-stack/services infra/stacks/nyra-mortgage/

# 5. Remove empty source directory
rmdir nyra-stack
```

## Path Updates Required

### Docker Compose Build Contexts
The stack's `docker-compose.yml` contains build contexts for custom services:

```yaml
services:
  mem0-rest:
    build:
      context: ./services/mem0-rest  # ✅ Relative path still works

  nyra-orchestrator:
    build:
      context: ./services/nyra-orchestrator  # ✅ Relative path still works
```

**Status**: No updates required - relative paths remain valid.

### Configuration References
All configuration file references use relative paths from the stack directory:

```yaml
volumes:
  - ./configs/nexus/nexus.toml:/etc/nexus.toml:ro
  - ./configs/litellm/config.yaml:/app/config.yaml:ro
```

**Status**: No updates required - paths remain valid.

## Usage Instructions

### Running the Nyra Mortgage Stack

**Windows (PowerShell)**:
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\stacks\nyra-mortgage
.\scripts\dev.ps1
```

**macOS/Linux (Bash)**:
```bash
cd /path/to/Project-Nyra/infra/stacks/nyra-mortgage
./scripts/dev.sh
```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure required variables:
   - `ANTHROPIC_API_KEY`
   - `OPENROUTER_API_KEY`
   - `TWENTY_*` secrets
   - `TWILIO_*` (if using SMS/voice)
   - `SENDGRID_API_KEY` (if using email)

### Service URLs (Defaults)

| Service | URL |
|---------|-----|
| Nexus (LLM + MCP router) | http://localhost:6000 |
| Nyra Orchestrator API | http://localhost:8010 |
| Twenty CRM | http://localhost:3000 |
| Grafana | http://localhost:3005 |
| Prometheus | http://localhost:9090 |
| Open WebUI | http://localhost:8080 |
| FalkorDB | redis://localhost:6379 |

## Documentation Updates

### Main Documentation References
- ✅ Root `CLAUDE.md` - No nyra-stack references found
- ✅ `README.md` - No updates required
- ✅ Component CLAUDE.md files - No references

### New Documentation Location
- Stack README: `infra/stacks/nyra-mortgage/README.md`
- Architecture: `infra/stacks/nyra-mortgage/docs/ARCHITECTURE.md`
- Compliance: `infra/stacks/nyra-mortgage/docs/COMPLIANCE_CHECKLIST.md`

## Benefits of This Consolidation

1. **Clear Organization**: Specialized stacks are now clearly separated from general infrastructure
2. **Reduced Root Clutter**: Repository root is cleaner
3. **Logical Grouping**: Mortgage-specific tools grouped together
4. **Discovery**: Easier to find and understand specialized deployment options
5. **Maintainability**: Clear separation between different deployment scenarios

## Related Infrastructure

### Other Stacks
The project now has a clear infrastructure organization:

```
infra/
├── stacks/
│   └── nyra-mortgage/          # Specialized mortgage stack (this consolidation)
├── docker/                     # Docker configurations
├── configs/                    # Shared configurations
├── Dockerfiles/                # Dockerfile templates
└── docker-compose*.yml         # Main infrastructure compose files
```

### Future Stack Candidates
Potential additional specialized stacks:
- `infra/stacks/minimal/` - Minimal development stack
- `infra/stacks/production/` - Production-ready stack
- `infra/stacks/testing/` - Testing and CI/CD stack

## Verification Checklist

- [x] All files moved successfully (23 files)
- [x] Git operations completed without errors
- [x] Source directory removed
- [x] Build contexts verified (relative paths work)
- [x] Configuration paths verified
- [x] Documentation created
- [x] No broken references in codebase
- [x] Services remain independent

## Next Steps

1. **Test the Stack**: Run the consolidated stack to ensure all services start correctly
2. **Update CI/CD**: If needed, update CI/CD workflows that reference nyra-stack
3. **Team Communication**: Inform team members of the new location
4. **Archive Cleanup**: Consider removing archived nyra-stack references in `_archive/` and `_backup/` directories

## Rollback Instructions

If needed, the consolidation can be rolled back using:

```bash
# Revert the git moves
git revert <commit-hash>

# Or manually move back
cd C:\Dev\Projects\Repos\Project-Nyra
git mv infra/stacks/nyra-mortgage nyra-stack
```

## References

- **Original Location**: `nyra-stack/`
- **New Location**: `infra/stacks/nyra-mortgage/`
- **Git Status**: Tracked and ready for commit
- **Related Documentation**:
  - Stack README: `infra/stacks/nyra-mortgage/README.md`
  - Architecture: `infra/stacks/nyra-mortgage/docs/ARCHITECTURE.md`

---

**Consolidation completed successfully.** The nyra-stack is now properly organized within the infrastructure directory structure as a specialized mortgage workflow stack.
