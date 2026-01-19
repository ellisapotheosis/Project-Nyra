# Archon OS Setup Analysis

**Date**: 2026-01-18
**Analysis Type**: Codebase Structure Investigation

## Executive Summary

**Finding**: The Archon OS source code and deployment configuration are separated, creating a deployment gap.

- **Archon OS Source Code**: Present and complete in `tools/archon/`
- **Deployment Configuration**: Present in `infra/dual-orchestrator/archon-os/`
- **Critical Issue**: Deployment configuration expects source code that isn't present in its directory

## Current State

### 1. Archon OS Source Code (tools/archon/)

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\tools\archon\`

**Status**: ✅ Complete and up-to-date

**Git Configuration**:
- Repository: https://github.com/coleam00/Archon.git
- Branch: stable
- Recent commits: Jan 18, 2026

**Directory Structure**:
```
tools/archon/
├── .git/                    # Git repository
├── python/                  # Python backend
│   ├── src/                # SOURCE CODE (exists here)
│   │   ├── agents/         # AI agents
│   │   ├── mcp_server/     # MCP server
│   │   └── server/         # FastAPI application
│   ├── tests/              # Test suite
│   └── requirements files
├── archon-ui-main/         # Frontend React application
├── docs/                   # Documentation
├── .claude/                # Claude Code configuration
├── docker-compose.yml      # Development compose file
├── Dockerfile              # (if present)
├── README.md               # Main documentation
└── CLAUDE.md               # Claude Code guidance
```

**Key Files Present**:
- ✅ Python source code in `python/src/`
- ✅ Frontend in `archon-ui-main/`
- ✅ Docker configuration
- ✅ Complete documentation
- ✅ Test suites

### 2. Archon OS Deployment Configuration (infra/dual-orchestrator/archon-os/)

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\infra\dual-orchestrator\archon-os\`

**Status**: ⚠️ Configuration Only - Missing Source Code

**Directory Structure**:
```
infra/dual-orchestrator/archon-os/
├── agent-templates/        # Agent YAML templates
│   ├── coder-agent.yml
│   ├── coordinator-agent.yml
│   └── researcher-agent.yml
├── config/                 # Configuration files
│   └── archon-config.yml
├── init-scripts/           # Initialization scripts
│   ├── entrypoint.sh
│   └── init-db.sql
├── .dockerignore
├── .env.example
├── .env
├── Dockerfile              # ❌ Expects src/ that doesn't exist here
├── docker-compose.yml
├── requirements.txt
└── README.md               # Deployment guide
```

**Critical Missing Component**:
- ❌ No `src/` directory (required by Dockerfile)
- ❌ No Python application code
- ❌ No frontend code

**Dockerfile Expectations** (lines 74-77):
```dockerfile
# Copy application code
COPY --chown=archon:archon src/ ${ARCHON_HOME}/src/
COPY --chown=archon:archon config/ ${ARCHON_CONFIG}/
COPY --chown=archon:archon init-scripts/ ${ARCHON_HOME}/init-scripts/
```

**Expected Command** (line 105):
```dockerfile
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8092", "--workers", "4"]
```

### 3. Unrelated Package (.venv/Lib/site-packages/archon/)

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\.venv\Lib\site-packages\archon\`

**Status**: ℹ️ Different Package (Not Archon OS)

**Details**:
- Package Name: archon
- Version: 0.3.3
- Description: Python web framework (NOT the Archon OS project)
- Installation: Likely from pip install archon
- Relevance: None - this is a completely different package

## Comparison: What We Have vs. What We Should Have

### Architecture Documentation Expectation

From `docs/FINAL_ARCHITECTURE_DECISIONS.md`:

**Expected Setup**:
- **Archon OS MCP**: https://github.com/coleam00/Archon
- **Fork**: github.com/ellisapotheosis/archon (mentioned but not used)
- **Purpose**: Task routing, execution tracking, project knowledge graphs
- **Port**: 8092 (API), 8093 (Metrics)

### Git Submodules Status

**Finding**: No .gitmodules file or submodule configuration

```bash
# Output from git submodule status
fatal: no submodule mapping found in .gitmodules for path 'orchestration/serena/serena'
```

**Observation**: The project doesn't use git submodules for Archon OS. Instead, Archon is cloned directly into `tools/archon/`.

### Deployment Architecture Gap

**Current Deployment Path**: `infra/dual-orchestrator/archon-os/`

**What's Present**:
1. ✅ Docker Compose configuration
2. ✅ Dockerfile (but references missing source)
3. ✅ Environment configuration (.env, .env.example)
4. ✅ Agent templates (YAML configurations)
5. ✅ Initialization scripts
6. ✅ README with deployment instructions

**What's Missing**:
1. ❌ Actual Archon OS application source code
2. ❌ Python `src/` directory structure
3. ❌ Frontend application files
4. ❌ Build artifacts or compiled code
5. ❌ Link/reference to actual source code location

## Root Cause Analysis

### Why the Gap Exists

1. **Separation of Concerns**:
   - Source code in `tools/archon/` (development)
   - Deployment config in `infra/dual-orchestrator/archon-os/` (operations)

2. **Incomplete Docker Build Context**:
   - Dockerfile assumes build context includes `src/`
   - Build context is set to `infra/dual-orchestrator/archon-os/` (no source)
   - Source code is in `tools/archon/python/src/` (different location)

3. **Missing Build Strategy**:
   - No mechanism to copy source from `tools/archon/` to `infra/dual-orchestrator/archon-os/`
   - No build script to package Archon OS for deployment
   - Docker Compose doesn't reference external source location

## Impact Assessment

### What Works

1. ✅ Source code is available and complete
2. ✅ Git tracking is functional
3. ✅ Development environment can run from `tools/archon/`
4. ✅ Configuration files are well-structured

### What Doesn't Work

1. ❌ Cannot build Docker image from `infra/dual-orchestrator/archon-os/`
2. ❌ Cannot deploy via docker-compose from deployment directory
3. ❌ Deployment documentation references missing files
4. ❌ No automated build/copy process

### Deployment Scenarios

**Scenario 1: Build from infra/dual-orchestrator/archon-os/**
```bash
cd infra/dual-orchestrator/archon-os/
docker-compose build
# Result: FAILS - COPY src/ fails (directory doesn't exist)
```

**Scenario 2: Build from tools/archon/**
```bash
cd tools/archon/
docker-compose build
# Result: Likely works (development compose file)
```

## Recommended Solutions

### Option 1: Symlink (Quick Fix)

Create symbolic link from deployment to source:
```bash
cd infra/dual-orchestrator/archon-os/
ln -s ../../../tools/archon/python/src src
```

**Pros**: Quick, minimal changes
**Cons**: Platform-dependent, fragile, not in git

### Option 2: Multi-Stage Build (Best Practice)

Modify Dockerfile to use tools/archon as build context:
```dockerfile
# Stage 1: Copy from source
FROM python:3.11-slim as source
COPY ../../../tools/archon/python /app

# Stage 2: Build application
FROM source as build
WORKDIR /app
RUN pip install -r requirements.txt
...
```

**Pros**: Self-contained, reproducible
**Cons**: Requires Dockerfile refactoring

### Option 3: Build Script (Automated)

Create deployment preparation script:
```bash
#!/bin/bash
# scripts/prepare-archon-deployment.sh
ARCHON_SRC="tools/archon/python"
ARCHON_DEPLOY="infra/dual-orchestrator/archon-os"

# Copy source to deployment directory
cp -r "$ARCHON_SRC/src" "$ARCHON_DEPLOY/"
cp "$ARCHON_SRC/requirements.txt" "$ARCHON_DEPLOY/"

# Build Docker image
cd "$ARCHON_DEPLOY"
docker-compose build
```

**Pros**: Automated, versioned, clear process
**Cons**: Requires maintenance, adds build step

### Option 4: Git Submodule (Proper Integration)

Convert `tools/archon/` to a proper git submodule:
```bash
cd C:/Dev/Projects/Repos/Project-Nyra
rm -rf tools/archon
git submodule add https://github.com/coleam00/Archon.git submodules/archon
git submodule update --init --recursive
```

**Pros**: Git-tracked, versioned, standard approach
**Cons**: Requires restructuring, changes existing setup

### Option 5: Docker Build Context Path (Recommended)

Modify docker-compose.yml to reference correct build context:
```yaml
services:
  archon-os:
    build:
      context: ../../../tools/archon/python  # Point to actual source
      dockerfile: ../../../infra/dual-orchestrator/archon-os/Dockerfile
```

**Pros**: Clean separation, no file copying
**Cons**: Requires path adjustments in Dockerfile

## Additional Observations

### Reference URLs

From grep analysis, found multiple Archon references:
- Main repo: https://github.com/coleam00/Archon
- Fork (mentioned): github.com/ellisapotheosis/archon
- Kanban board: https://github.com/users/coleam00/projects/1

### Related Documentation

**Files to Review**:
- `infra/dual-orchestrator/archon-os/README.md` - Deployment guide
- `tools/archon/README.md` - Main documentation
- `tools/archon/CLAUDE.md` - Development guide
- `tools/archon/PRPs/ai_docs/*.md` - Architecture docs
- `docs/FINAL_ARCHITECTURE_DECISIONS.md` - System architecture

### Other Archon References

**Found in codebase**:
- `infra/docker/archon/Dockerfile.archon` - Separate Dockerfile
- `services/archon-os/.env.development` - Service-specific env

## Action Items

### Immediate (Required for Deployment)

1. ⚠️ Choose and implement one of the 5 solution options above
2. ⚠️ Test Docker build from deployment directory
3. ⚠️ Update documentation to match chosen approach
4. ⚠️ Verify docker-compose services can start

### Short-term (Recommended)

1. 📋 Standardize Archon OS deployment approach across project
2. 📋 Document build/deployment process in README
3. 📋 Add validation script to verify deployment readiness
4. 📋 Consider consolidating multiple Dockerfiles

### Long-term (Best Practices)

1. 🎯 Establish git submodule strategy for external dependencies
2. 🎯 Create CI/CD pipeline for Archon OS deployment
3. 🎯 Implement automated testing for Docker builds
4. 🎯 Version synchronization between source and deployment

## Conclusion

The Archon OS source code exists and is complete in `tools/archon/`, but the deployment configuration in `infra/dual-orchestrator/archon-os/` cannot build a Docker image because it lacks the source code. This is a structural issue, not a missing component issue.

**Recommended Immediate Action**: Implement Option 3 (Build Script) or Option 5 (Docker Build Context Path) to enable deployment while maintaining clean separation between source and deployment configuration.

**Next Steps**:
1. Select preferred solution approach
2. Implement changes to Docker build process
3. Test full deployment workflow
4. Document the chosen architecture pattern
5. Update all related documentation

---

**Analysis Prepared By**: Research Agent
**Repository**: C:\Dev\Projects\Repos\Project-Nyra
**Date**: 2026-01-18
