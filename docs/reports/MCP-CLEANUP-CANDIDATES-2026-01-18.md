# MCP Configuration Cleanup Candidates - 2026-01-18

## Executive Summary

Project Nyra has successfully transitioned from **standalone non-containerized MCP deployments** to a **fully containerized architecture** using `docker-compose.infisical.yml`. This analysis identifies **11 obsolete files and configurations** that should be removed or archived to maintain a clean codebase.

### Key Finding
**Single Source of Truth**: All MCP services are now deployed via `docker-compose.infisical.yml` with proper container networking. Legacy configuration files that reference hardcoded localhost addresses are no longer needed.

---

## Current Containerized Architecture

The following MCP services are now containerized and managed via Docker Compose:

| Service | Port | Container | Networking |
|---------|------|-----------|-----------|
| **Infisical MCP** | 8006 | `nyra-infisical-mcp` | Docker bridge (nyra-network) |
| **Claude-Flow MCP** | 8003 | `nyra-claude-flow-mcp` | Docker bridge (nyra-network) |
| **MetaMCP Gateway** | 8005 | `nyra-metamcp-gateway-enhanced` | Docker bridge (nyra-network) |
| **Nyra Orchestrator** | 8000 | `nyra-orchestrator` | Docker bridge (nyra-network) |
| **Nyra Workers 1-3** | 8001-8003 | Multiple containers | Docker bridge (nyra-network) |

**Key Point**: All services communicate via internal Docker DNS names (not localhost), making localhost-based config files obsolete.

---

## Cleanup Candidates by Category

### CATEGORY 1: Old MCP Deployment Scripts [HIGH PRIORITY]

These scripts represent **non-containerized deployment methodology** and are completely superseded by Docker Compose.

#### Files to Remove

**1. `scripts/deploy-mcp-ecosystem.sh`**
- **What it does**: Bash script that installs MCP servers globally via npm, registers them with Claude CLI, and creates local service mesh configuration
- **Lines**: ~409 lines of shell script
- **Contains**:
  - Global npm installations (claude-flow, ruv-swarm, flow-nexus, etc.)
  - Claude CLI registration (`claude mcp add` commands)
  - Service mesh setup (docker-compose.servicemesh.yml generation)
  - Health checks via curl
- **Why Obsolete**: Docker Compose handles all of this through containerization
- **Safety**: 100% safe to remove - no code depends on this
- **Recommendation**: **DELETE** or archive to `_archive/scripts-deprecated-2026-01-18`

**2. `scripts/mcp-server-registration.ps1`**
- **What it does**: PowerShell script for Windows MCP setup with registration and health checks
- **Lines**: ~317 lines of PowerShell
- **Contains**:
  - Global npm package installations
  - Claude CLI registration logic
  - Service mesh docker-compose generation
  - Health check testing
- **Why Obsolete**: All containerized; no global npm installations needed
- **Safety**: 100% safe to remove
- **Recommendation**: **DELETE** or archive to `_archive/scripts-deprecated-2026-01-18`

**Impact**: These two files represent the OLD deployment methodology. Their removal signals the transition to containerized deployment.

---

### CATEGORY 2: Hardcoded Localhost Configuration Files [MEDIUM PRIORITY]

These configuration files contain hardcoded `localhost:808x` addresses that only work for non-containerized local development. They are **not used by the containerized deployment**.

#### Files to Archive

**1. `configs/metamcp-gateway.json`**
- **Size**: ~152 lines of JSON
- **Hardcoded Addresses**:
  - `localhost:8081` (Archon MCP)
  - `localhost:8082` (Claude-Flow MCP)
  - `localhost:8083` (Nyra Orchestrator)
  - `localhost:8084` (Infisical MCP)
  - `localhost:8085` (Knowledge Graph)
- **Current Use**: None - Docker Compose uses internal service DNS names
- **Why Obsolete**: Docker networking provides automatic service discovery
- **Recommendation**: **ARCHIVE** to `_archive/configs-deprecated-2026-01-18`

**2. `configs/service-mesh-config.json`**
- **Size**: ~174 lines
- **Issue**: References Consul, Prometheus, Grafana, Jaeger, and Redis on localhost
- **Current Use**: None - service mesh defined in docker-compose
- **Why Obsolete**: Represents old distributed local setup; services now containerized
- **Recommendation**: **ARCHIVE**

**3. `configs/archon-mcp-config.json`**
- **Size**: ~142 lines
- **Issue**: References `localhost:8081` for Archon MCP coordination
- **Current Use**: None - Archon functionality integrated into MetaMCP Gateway
- **Why Obsolete**: Single gateway handles all coordination
- **Recommendation**: **ARCHIVE**

**4. `configs/claude-flow-mcp-config.json`**
- **Size**: ~192 lines
- **Issue**: References `localhost:8082` for Claude-Flow server
- **Current Use**: None - configured via docker-compose service `claude-flow-mcp`
- **Why Obsolete**: Docker Compose is the canonical configuration
- **Recommendation**: **ARCHIVE**

**5. `configs/nyra-orchestrator-config.json`**
- **Size**: Large JSON configuration file
- **Issue**: Service routing hardcoded to `localhost` addresses
- **Current Use**: None - orchestrator service defined in docker-compose
- **Why Obsolete**: Container networking handles service discovery
- **Recommendation**: **ARCHIVE**

**6. `configs/mcp-architecture.json`**
- **Size**: ~80+ lines
- **Issue**: Documents MCP architecture with localhost port references
- **Current Use**: Documentation only - not loaded by any service
- **Why Obsolete**: Architecture now defined in `docker-compose.infisical.yml` and Dockerfiles
- **Recommendation**: **ARCHIVE** - Keep for historical reference but update with containerized architecture

**Impact**: These 6 files total ~900 lines of obsolete configuration. Their presence could confuse developers about which configuration is canonical.

---

### CATEGORY 3: Batch Configuration Files [LOW PRIORITY]

Old batch processing configuration files with localhost dependencies.

#### Files to Archive

**1. `configs/batch/batch-config.json`**
- **Issue**: Health checks hardcoded to `localhost:8080`, `localhost:8081`
- **Current Use**: Not used
- **Size**: ~100 lines
- **Recommendation**: **ARCHIVE**

**2. `configs/batch/project-nyra-batch.json`**
- **Issue**: Duplicate of batch-config.json with same localhost references
- **Size**: ~100 lines
- **Recommendation**: **ARCHIVE**

**3. `configs/batch/PROJECT-NYRA-ULTIMATE-BATCH-CONFIG.json`**
- **Issue**: Ultimate batch config with `localhost:8080` serverUrl
- **Size**: ~150 lines
- **Recommendation**: **ARCHIVE**

**Impact**: Remove 3 batch config files (~350 lines of redundant configuration)

---

### CATEGORY 4: Backup Configuration Snapshots [LOW PRIORITY]

Timestamped backup snapshots of configurations that are now redundant (Git provides version history).

#### Files to Remove

**Backup Directory**: `configs/backup/`
- `configs/backup/latest/root/.mcp.json`
- `configs/backup/latest/root/claude-flow.config.json`
- `configs/backup/timestamped/20260115_211341/root/.mcp.json`
- `configs/backup/timestamped/20260115_211341/root/claude-flow.config.json`

**Documentation Backup**: `docs/configs/backup/`
- `docs/configs/backup/latest/root/.mcp.json`
- `docs/configs/backup/timestamped/20260115_211341/root/.mcp.json`

**Issue**:
- Redundant copies (original files exist in root)
- Old timestamp (2026-01-15 is outdated)
- Git provides version history - no need for manual snapshots

**Recommendation**: **REMOVE** both directories entirely

**Impact**: Remove 2 backup directories with 6 configuration files

---

### CATEGORY 5: MCP JavaScript Utilities [KEEP]

These files are development utilities and should be retained.

| File | Purpose | Keep/Remove |
|------|---------|------------|
| `.claude/src/mcp/config/mcp-config.js` | MCP configuration loader for .claude tooling | **KEEP** |
| `.claude/src/orchestration/mcp-integration.js` | MCP integration and orchestration logic | **KEEP** |
| `.claude/scripts/mcp-setup.js` | MCP development setup script | **KEEP** |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total files analyzed** | 17 |
| **High priority removals** | 2 scripts |
| **Medium priority archives** | 6 config files |
| **Low priority cleanups** | 3 batch configs + 6 backup files |
| **Keep as-is** | 6 JavaScript utilities |
| **Total lines to remove** | ~1,400+ lines |

---

## Removal Plan

### Phase 1: Immediate Removal [Safe to Execute Now]

```bash
# Remove old deployment scripts
rm scripts/deploy-mcp-ecosystem.sh
rm scripts/mcp-server-registration.ps1
```

**Verification**: No code references these scripts; they're not called by any automation

### Phase 2: Archive Hardcoded Config Files

Create archive directory:
```bash
mkdir -p _archive/configs-deprecated-2026-01-18
```

Move 9 config files:
```bash
# Hardcoded localhost configs
mv configs/metamcp-gateway.json _archive/configs-deprecated-2026-01-18/
mv configs/service-mesh-config.json _archive/configs-deprecated-2026-01-18/
mv configs/archon-mcp-config.json _archive/configs-deprecated-2026-01-18/
mv configs/claude-flow-mcp-config.json _archive/configs-deprecated-2026-01-18/
mv configs/nyra-orchestrator-config.json _archive/configs-deprecated-2026-01-18/
mv configs/mcp-architecture.json _archive/configs-deprecated-2026-01-18/

# Batch configs
mv configs/batch/batch-config.json _archive/configs-deprecated-2026-01-18/
mv configs/batch/project-nyra-batch.json _archive/configs-deprecated-2026-01-18/
mv configs/batch/PROJECT-NYRA-ULTIMATE-BATCH-CONFIG.json _archive/configs-deprecated-2026-01-18/
```

### Phase 3: Clean Up Backup Directories

```bash
# Remove backup directories
rm -rf configs/backup
rm -rf docs/configs/backup
```

**Verification**: These are pure backups; originals exist in root

---

## Safety Verification Checklist

Before executing Phase 1-3, verify:

- [ ] `docker-compose.infisical.yml` remains the only MCP deployment configuration
- [ ] Claude Desktop `.mcp.json` files still work after removal (configs will not change)
- [ ] No shell scripts or automation reference the removed files
- [ ] `grep -r "deploy-mcp-ecosystem" .` returns no results
- [ ] `grep -r "mcp-server-registration" .` returns no results
- [ ] `grep -r "localhost:808" .` returns only docker-compose references (as expected)

---

## Documentation Updates Needed

After cleanup, update documentation:

1. **README.md**: Update MCP deployment instructions to reference `docker-compose.infisical.yml` only
2. **docs/deployment/MCP-STATUS-REPORT.md**: Update to reflect containerized architecture
3. **CLAUDE.md**: Remove references to standalone MCP setup scripts
4. Add deprecation notice: "Legacy standalone MCP deployment scripts have been archived. Use `docker-compose.infisical.yml` for all deployments."

---

## Key Principle

**Single Source of Truth**: `docker-compose.infisical.yml`

All MCP service configuration, networking, health checks, and orchestration are now defined in this single file. No need for multiple, redundant, hardcoded configuration files.

---

## Files Created During Analysis

- **Analysis Report**: `.claude/cleanup-candidates.json` (detailed machine-readable analysis)
- **This Document**: `docs/reports/MCP-CLEANUP-CANDIDATES-2026-01-18.md` (human-readable summary)

---

## Next Steps

1. **Review**: Share this report for stakeholder approval
2. **Verify**: Run safety verification checklist
3. **Execute**: Perform removal in 3 phases (scripts → configs → backups)
4. **Validate**: Test MCP services still start correctly with docker-compose
5. **Document**: Update documentation to reflect new architecture
6. **Commit**: Create git commit: "chore: Clean up legacy non-containerized MCP configurations"

---

**Analysis Date**: 2026-01-18
**Reviewed By**: Code Review Agent
**Status**: Ready for execution (pending approval)
