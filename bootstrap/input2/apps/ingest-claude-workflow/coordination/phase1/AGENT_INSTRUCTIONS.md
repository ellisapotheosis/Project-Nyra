# Phase 1: Agent Instructions

## Coordination Protocol

All Phase 1 agents must follow this protocol for coordination:

### 1. Pre-Task Setup

```bash
# Initialize session
npx claude-flow@alpha hooks pre-task --description "Agent [N]: [Task Description]"

# Restore session context
npx claude-flow@alpha hooks session-restore --session-id "nyra-swarm-001"

# Check memory for previous work
npx claude-flow@alpha memory retrieve --key "nyra/project/context"
```

### 2. During Task Execution

```bash
# After each significant file creation/edit
npx claude-flow@alpha hooks post-edit --file "[filepath]" --memory-key "nyra/agent-[N]/progress"

# Notify coordination of progress (every 25% completion)
npx claude-flow@alpha hooks notify --message "Agent [N]: [milestone reached]"

# Store intermediate results
npx claude-flow@alpha memory store --key "nyra/agent-[N]/outputs" --value "[JSON of created files]"
```

### 3. Post-Task Completion

```bash
# Mark task complete
npx claude-flow@alpha hooks post-task --task-id "agent-[N]"

# Store final status
npx claude-flow@alpha memory store --key "nyra/agent-[N]/status" --value "complete"

# Export metrics
npx claude-flow@alpha hooks session-end --export-metrics true

# Document outputs for dependent agents
npx claude-flow@alpha memory store --key "nyra/agent-[N]/deliverables" --value "[JSON of all outputs]"
```

---

## Agent 1: CLAUDE.md Files

**Task**: Create CLAUDE.md configuration files for each app in Project-Nyra

**Output Directory**: `apps/{app-name}/CLAUDE.md`

**Deliverables**:
- CLAUDE.md for each application
- Standardized format across all apps
- Environment variable sections documented
- Integration instructions included

**Requirements**:
1. Identify all apps in the project
2. Create CLAUDE.md for each app with:
   - Project description
   - Dependencies
   - Environment variables needed
   - Build instructions
   - Integration points
   - SPARC workflow configuration

**Memory Keys**:
- Input: `nyra/project/app-list`
- Output: `nyra/agent-1/claude-md-files`
- Status: `nyra/agent-1/status`

**Blocks**: Agent 13 (needs environment variable documentation)

---

## Agent 2: Workflow Structures

**Task**: Create comprehensive workflow documentation structure

**Output Directory**: `docs/workflows/`

**Deliverables**:
- Workflow documentation templates
- Process diagrams
- Integration workflows
- CI/CD workflow documentation

**Requirements**:
1. Create workflow documentation structure:
   - `docs/workflows/development.md`
   - `docs/workflows/deployment.md`
   - `docs/workflows/integration.md`
   - `docs/workflows/testing.md`
2. Include Mermaid diagrams for each workflow
3. Document approval processes
4. Integration points with other systems

**Memory Keys**:
- Output: `nyra/agent-2/workflows`
- Status: `nyra/agent-2/status`

---

## Agent 3: Infisical Variables

**Task**: Configure Infisical secret management system

**Output Directory**: `config/infisical/`

**Deliverables**:
- Infisical configuration templates
- Secret schema definitions
- Environment-specific configurations
- Integration documentation

**Requirements**:
1. Create Infisical configuration:
   - `config/infisical/schema.json` (secret definitions)
   - `config/infisical/environments.json` (dev, staging, prod)
   - `config/infisical/README.md` (setup instructions)
2. Document all required secrets:
   - Database credentials
   - API keys
   - Service tokens
   - Third-party integrations
3. Create secret rotation policies
4. Document access control requirements

**Memory Keys**:
- Output: `nyra/agent-3/infisical-config`
- Output: `nyra/agent-3/secret-schema`
- Status: `nyra/agent-3/status`

**Blocks**: Agent 4 (needs secret definitions), Agent 13 (needs secret documentation)

---

## Agent 5: CI/CD Pipelines

**Task**: Build comprehensive CI/CD pipeline configurations

**Output Directory**: `.github/workflows/`

**Deliverables**:
- GitHub Actions workflows
- Build pipelines
- Test automation
- Deployment workflows

**Requirements**:
1. Create workflow files:
   - `.github/workflows/ci.yml` (build and test)
   - `.github/workflows/cd-staging.yml` (staging deployment)
   - `.github/workflows/cd-production.yml` (production deployment)
   - `.github/workflows/security-scan.yml` (security scanning)
2. Integrate Infisical for secrets
3. Configure matrix testing
4. Set up deployment approvals

**Memory Keys**:
- Output: `nyra/agent-5/workflows`
- Status: `nyra/agent-5/status`

---

## Agent 6: Docker Environments

**Task**: Setup Docker containerization for all services

**Output Directory**: `docker/`

**Deliverables**:
- Dockerfiles for each service
- Docker Compose configurations
- Multi-stage build configurations
- Development environment setup

**Requirements**:
1. Create Docker configurations:
   - `docker/Dockerfile.base` (base image)
   - `docker/Dockerfile.app` (application containers)
   - `docker/docker-compose.yml` (local development)
   - `docker/docker-compose.prod.yml` (production)
2. Configure networking
3. Volume management
4. Health checks
5. Resource limits

**Memory Keys**:
- Output: `nyra/agent-6/docker-configs`
- Status: `nyra/agent-6/status`

---

## Agent 8: WSL Setup

**Task**: Configure Windows Subsystem for Linux bootstrap

**Output Directory**: `bootstrap/orchestrator-mini/wsl/`

**Deliverables**:
- WSL installation scripts
- Environment configuration
- Dependency installation
- Integration scripts

**Requirements**:
1. Create WSL setup scripts:
   - `bootstrap/orchestrator-mini/wsl/install-wsl.ps1` (PowerShell installer)
   - `bootstrap/orchestrator-mini/wsl/setup-environment.sh` (environment setup)
   - `bootstrap/orchestrator-mini/wsl/install-dependencies.sh` (package installation)
   - `bootstrap/orchestrator-mini/wsl/README.md` (documentation)
2. Configure Ubuntu/Debian environment
3. Install required tools (git, docker, etc.)
4. Setup networking
5. Create integration points for Gitea

**Memory Keys**:
- Output: `nyra/agent-8/wsl-scripts`
- Status: `nyra/agent-8/status`

**Blocks**: Agent 7 (Gitea needs WSL foundation)

---

## Agent 10: Bootstrap Enhancement

**Task**: Enhance bootstrap package structure and functionality

**Output Directory**: `bootstrap/`

**Deliverables**:
- Enhanced bootstrap structure
- Installation scripts
- Configuration management
- Integration helpers

**Requirements**:
1. Enhance bootstrap structure:
   - Update `bootstrap/package.json`
   - Create `bootstrap/core/` (core functionality)
   - Create `bootstrap/utils/` (utility functions)
   - Create `bootstrap/config/` (configuration templates)
2. Add installation orchestration
3. Create pre-flight checks
4. Integration validation
5. Rollback capabilities

**Memory Keys**:
- Output: `nyra/agent-10/bootstrap-structure`
- Status: `nyra/agent-10/status`

---

## Agent 11: User Guide

**Task**: Create comprehensive user documentation

**Output Directory**: `docs/`

**Deliverables**:
- User guide
- Installation instructions
- Configuration guides
- Troubleshooting documentation

**Requirements**:
1. Create documentation:
   - `docs/USER_GUIDE.md` (main guide)
   - `docs/INSTALLATION.md` (setup instructions)
   - `docs/CONFIGURATION.md` (configuration guide)
   - `docs/TROUBLESHOOTING.md` (common issues)
   - `docs/FAQ.md` (frequently asked questions)
2. Include screenshots and diagrams
3. Step-by-step tutorials
4. Best practices
5. Integration examples

**Memory Keys**:
- Output: `nyra/agent-11/documentation`
- Status: `nyra/agent-11/status`

---

## Agent 12: Implementation

**Task**: Implement core application features

**Output Directory**: `apps/`

**Deliverables**:
- Application code
- Feature implementations
- Integration modules
- Test stubs

**Requirements**:
1. Implement core features in each app
2. Create integration modules
3. Setup error handling
4. Logging infrastructure
5. Configuration management
6. Create test stubs for TDD

**Memory Keys**:
- Output: `nyra/agent-12/implementations`
- Status: `nyra/agent-12/status`

---

## Success Criteria for Phase 1

All agents must:
- [ ] Complete all deliverables
- [ ] Store outputs in memory
- [ ] Update status to "complete"
- [ ] No file conflicts
- [ ] All hooks executed
- [ ] Metrics exported

**Phase 1 Complete When**: All 9 agents report status "complete" in memory

**Next Phase**: Phase 2 agents will be spawned after validation
