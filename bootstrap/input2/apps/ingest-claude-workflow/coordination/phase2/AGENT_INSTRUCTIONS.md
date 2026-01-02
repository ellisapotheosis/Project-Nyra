# Phase 2: Agent Instructions (Dependent Agents)

## Prerequisites

Phase 2 agents can only start after their dependencies from Phase 1 are complete.

### Dependency Verification

Before starting, verify dependencies in memory:

```bash
# Agent 4 checks Agent 3
npx claude-flow@alpha memory retrieve --key "nyra/agent-3/status"

# Agent 7 checks Agent 8
npx claude-flow@alpha memory retrieve --key "nyra/agent-8/status"

# Agent 13 checks Agents 1 and 3
npx claude-flow@alpha memory retrieve --key "nyra/agent-1/status"
npx claude-flow@alpha memory retrieve --key "nyra/agent-3/status"

# Agent 9 checks Agent 7
npx claude-flow@alpha memory retrieve --key "nyra/agent-7/status"
```

---

## Agent 4: Checker Scripts

**Task**: Create validation and checking scripts for Infisical secrets

**Output Directory**: `scripts/`

**Dependencies**: Agent 3 (requires secret schema)

**Deliverables**:
- Secret validation scripts
- Environment checkers
- Configuration validators
- Health check utilities

**Requirements**:
1. Retrieve Agent 3 outputs:
   ```bash
   npx claude-flow@alpha memory retrieve --key "nyra/agent-3/secret-schema"
   ```
2. Create validation scripts:
   - `scripts/check-secrets.sh` (verify all secrets present)
   - `scripts/validate-config.js` (validate configurations)
   - `scripts/health-check.sh` (system health)
   - `scripts/infisical-sync.js` (sync checker)
3. Implement checks for each secret in schema
4. Create CI/CD integration hooks
5. Add logging and reporting

**Integration Points**:
- Reads: `config/infisical/schema.json` (from Agent 3)
- Validates: All secrets defined in schema exist
- Reports: Missing or misconfigured secrets

**Memory Keys**:
- Input: `nyra/agent-3/secret-schema`
- Output: `nyra/agent-4/validation-scripts`
- Status: `nyra/agent-4/status`

**Validation**:
- All secrets in schema have corresponding checks
- Scripts executable and tested
- CI/CD integration documented

---

## Agent 7: Gitea Setup

**Task**: Configure Gitea Git server installation in WSL

**Output Directory**: `bootstrap/orchestrator-mini/wsl/gitea/`

**Dependencies**: Agent 8 (requires WSL foundation)

**Deliverables**:
- Gitea installation scripts
- Database configuration
- User management
- Repository setup
- Integration hooks

**Requirements**:
1. Retrieve Agent 8 outputs:
   ```bash
   npx claude-flow@alpha memory retrieve --key "nyra/agent-8/wsl-scripts"
   ```
2. Create Gitea setup:
   - `bootstrap/orchestrator-mini/wsl/gitea/install-gitea.sh`
   - `bootstrap/orchestrator-mini/wsl/gitea/configure-gitea.sh`
   - `bootstrap/orchestrator-mini/wsl/gitea/setup-database.sh`
   - `bootstrap/orchestrator-mini/wsl/gitea/gitea-service.sh`
   - `bootstrap/orchestrator-mini/wsl/gitea/README.md`
3. Configure PostgreSQL/MySQL for Gitea
4. Setup systemd service
5. Configure reverse proxy
6. Create backup scripts
7. Setup webhooks for CI/CD

**Integration Points**:
- Uses: WSL environment from Agent 8
- Integrates: With CI/CD from Agent 5
- Provides: Git repository hosting for applications

**Memory Keys**:
- Input: `nyra/agent-8/wsl-scripts`
- Output: `nyra/agent-7/gitea-scripts`
- Status: `nyra/agent-7/status`

**Blocks**: Agent 9 (GUI installer needs Gitea scripts)

**Validation**:
- Gitea installs successfully in WSL
- Database configured correctly
- Service starts automatically
- Git operations functional

---

## Agent 9: Gitea Installer Integration

**Task**: Integrate Gitea installation into GUI Installer

**Output Directory**: `bootstrap/GUI-Installer/`

**Dependencies**: Agent 7 (requires Gitea setup scripts)

**Deliverables**:
- GUI installer updates
- Gitea installation wizard
- Configuration interface
- Status monitoring

**Requirements**:
1. Retrieve Agent 7 outputs:
   ```bash
   npx claude-flow@alpha memory retrieve --key "nyra/agent-7/gitea-scripts"
   ```
2. Enhance GUI installer:
   - `bootstrap/GUI-Installer/components/GiteaSetup.jsx`
   - `bootstrap/GUI-Installer/services/gitea-installer.js`
   - `bootstrap/GUI-Installer/config/gitea-config.json`
   - `bootstrap/GUI-Installer/docs/gitea-installation.md`
3. Create installation wizard:
   - WSL prerequisite check
   - Gitea configuration options
   - Database setup wizard
   - User creation flow
4. Progress monitoring
5. Error handling and rollback
6. Post-installation validation

**Integration Points**:
- Invokes: Gitea scripts from Agent 7
- Checks: WSL environment from Agent 8
- Updates: GUI installer status

**Memory Keys**:
- Input: `nyra/agent-7/gitea-scripts`
- Output: `nyra/agent-9/installer-integration`
- Status: `nyra/agent-9/status`

**Validation**:
- GUI successfully invokes Gitea installation
- Progress displayed to user
- Error handling functional
- Rollback mechanism works

---

## Agent 13: User Guide with Environment Variables

**Task**: Create comprehensive environment variable documentation

**Output Directory**: `docs/`

**Dependencies**: Agent 1 (CLAUDE.md files), Agent 3 (Infisical variables)

**Deliverables**:
- Environment variable reference
- Configuration examples
- Security guidelines
- Troubleshooting guide

**Requirements**:
1. Retrieve dependencies:
   ```bash
   npx claude-flow@alpha memory retrieve --key "nyra/agent-1/claude-md-files"
   npx claude-flow@alpha memory retrieve --key "nyra/agent-3/secret-schema"
   ```
2. Create comprehensive documentation:
   - `docs/ENVIRONMENT_VARIABLES.md` (main reference)
   - `docs/ENV_SETUP_GUIDE.md` (setup instructions)
   - `docs/ENV_SECURITY.md` (security best practices)
   - `docs/ENV_EXAMPLES.md` (example configurations)
3. Document all variables:
   - Variable name
   - Description
   - Required/Optional
   - Default value
   - Valid values/format
   - Security level
   - Where defined (Infisical, .env, etc.)
4. Create environment-specific guides:
   - Development environment
   - Staging environment
   - Production environment
5. Integration with Infisical
6. Secret rotation procedures
7. Troubleshooting common issues

**Integration Points**:
- Consolidates: Environment variables from all CLAUDE.md files (Agent 1)
- References: Secret definitions from Infisical schema (Agent 3)
- Enhances: User guide from Agent 11

**Memory Keys**:
- Input: `nyra/agent-1/claude-md-files`
- Input: `nyra/agent-3/secret-schema`
- Output: `nyra/agent-13/env-documentation`
- Status: `nyra/agent-13/status`

**Validation**:
- All environment variables documented
- All secrets from Infisical schema included
- Examples provided for each variable
- Security guidelines comprehensive

---

## Phase 2 Execution Order

### Batch 1 (Can run in parallel after Phase 1)
- **Agent 4** (after Agent 3 completes)
- **Agent 7** (after Agent 8 completes)
- **Agent 13** (after Agents 1 & 3 complete)

### Batch 2 (After Batch 1)
- **Agent 9** (after Agent 7 completes)

## Success Criteria for Phase 2

All agents must:
- [ ] Verify dependencies before starting
- [ ] Complete all deliverables
- [ ] Store outputs in memory
- [ ] Update status to "complete"
- [ ] Validate integration points
- [ ] All hooks executed
- [ ] Metrics exported

**Phase 2 Complete When**: All 4 agents report status "complete" in memory

**Next Phase**: Validation and integration phase
