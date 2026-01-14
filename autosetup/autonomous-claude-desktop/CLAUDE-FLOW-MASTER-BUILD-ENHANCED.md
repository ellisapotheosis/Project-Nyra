# 🚀 PROJECT NYRA - AUTONOMOUS FULL-STACK BUILD (ENHANCED WITH CONSOLIDATION)

**FOR USE WITH: Claude Flow via Claude Code CLI**  
**EXECUTION TIME: 5-9 hours (includes assessment and consolidation)**  
**OUTPUT: Complete production-ready Project Nyra deployment with all existing work integrated**

---

## 🎯 MISSION STATEMENT

You are the master architect and implementation lead for Project Nyra, an AI-powered mortgage automation platform. Your task is to assess existing work across multiple repositories, consolidate all materials intelligently, and complete the full system implementation autonomously without human intervention or redundant work.

## 🔍 CRITICAL DIFFERENCE FROM STANDARD BUILD

This is NOT a clean-slate build. You must:
1. **Assess what already exists** across three repositories/directories
2. **Consolidate without duplication** - merge, don't overwrite
3. **Identify gaps** - only build what's missing
4. **Preserve completed work** - keep production-ready components
5. **Resolve conflicts** - choose the best version when duplicates exist

---

## 📋 PRE-FLIGHT ASSESSMENT (PHASE 0 - 45 minutes)

### OBJECTIVE
Scan all existing repositories and directories to create a comprehensive inventory of completed work, identify what needs consolidation, and determine what still needs to be built.

### REPOSITORIES/DIRECTORIES TO SCAN

**Primary Locations**:
1. **Project-Nyra/** (main repository)
2. **NYRA-AIO-Bootstrap/** (bootstrap scripts and automation)
3. **NyraDocs/** (documentation and decisions)
4. **Any other nyra-* directories in parent folder**

### ASSESSMENT TASKS

#### Task 1: Directory Structure Inventory (10 minutes)

Scan all locations and create a manifest of what exists:

```bash
# For each repository/directory, generate a tree structure
find . -type f -o -type d | sort > manifest-$(basename $PWD).txt

# Identify key categories:
# - Docker configurations (docker-compose*.yml)
# - Service implementations (*/services/*/app/)
# - Frontend applications (*/apps/*)
# - Configuration files (*/configs/*)
# - Documentation (*/docs/*)
# - Scripts (*/scripts/*)
# - Prompts (*/prompts/*)
```

**Output Required**: 
- `assessment/inventory-by-location.json` - Complete file listing per location
- `assessment/inventory-by-category.json` - Files grouped by purpose
- `assessment/duplicate-detection.json` - Same files in multiple locations

#### Task 2: Completeness Analysis (15 minutes)

For each component defined in the locked architecture, determine status:

**Infrastructure Services** (from FINAL-ARCHITECTURE-DECISIONS.md):
- [ ] Nexus Router - Configuration exists? Implementation complete?
- [ ] LiteLLM - Configuration exists? 
- [ ] Letta + PostgreSQL - Docker configs? Initialization scripts?
- [ ] Mem0 - Implementation exists?
- [ ] OpenMemory MCP - Configured?
- [ ] FalkorDB - Docker setup complete?
- [ ] Neo4j - Configuration exists?
- [ ] TwentyCRM - Setup complete?
- [ ] n8n - Workflows imported?
- [ ] Dify - Configuration done?
- [ ] Observability Stack (Prometheus, Grafana, Loki) - Complete?

**Business Services**:
- [ ] Quote Engine (port 8001) - Implementation status?
- [ ] Campaign Engine (port 8002) - Implementation status?
- [ ] Nyra Orchestrator (port 8010) - Implementation status?
- [ ] Mem0 REST API (port 4321) - Implementation status?

**Frontend Applications**:
- [ ] RateHunter (port 3100) - Build status?
- [ ] Nyra Admin (port 3101) - Build status?

**Orchestration**:
- [ ] Claude Flow - Initialized? Configured?
- [ ] Archon OS - Cloned? Set up?

**Output Required**:
- `assessment/completeness-report.md` - Detailed status for each component
- `assessment/ready-to-use.txt` - Components that are production-ready
- `assessment/needs-work.txt` - Components requiring implementation
- `assessment/missing-entirely.txt` - Components not started

#### Task 3: Quality Assessment (10 minutes)

For components that exist, evaluate quality:

**Criteria**:
- **Production-Ready**: Has proper error handling, logging, health checks, documentation
- **Prototype**: Works but lacks production features
- **Skeleton**: Basic structure only, needs implementation
- **Template**: Placeholder content only

**Check**:
- Python services: Do they have requirements.txt, proper FastAPI structure, health endpoints?
- Docker configs: Do they have health checks, restart policies, proper networking?
- Frontend apps: Do they have package.json, proper component structure, environment configs?
- Scripts: Do they have error handling, logging, documentation headers?

**Output Required**:
- `assessment/quality-ratings.json` - Quality score for each component
- `assessment/production-ready-list.txt` - Components ready for deployment
- `assessment/needs-upgrade.txt` - Components needing quality improvements

#### Task 4: Conflict Detection (10 minutes)

Identify files that exist in multiple locations with different content:

**Common Conflicts**:
- `.env` files with different API keys
- Docker compose files with different service configurations
- Config files (nexus.toml, litellm/config.yaml) with different settings
- Service implementations with different logic
- Documentation with conflicting information

**Resolution Strategy**:
For each conflict, determine which version to keep based on:
1. **Completeness** - More complete implementation wins
2. **Recency** - More recently modified wins if quality equal
3. **Production-readiness** - Production configs win over templates
4. **Documentation** - Better documented version wins

**Output Required**:
- `assessment/conflicts-detected.json` - All conflicting files
- `assessment/conflict-resolutions.json` - Which version to keep and why
- `assessment/conflicts-requiring-manual-review.txt` - Conflicts needing human decision

---

## 🔄 CONSOLIDATION PHASE (PHASE 1 - 30 minutes)

### OBJECTIVE
Create unified Project-Nyra directory with all best-version materials properly organized, no duplicates, all conflicts resolved.

### CONSOLIDATION STRATEGY

**Step 1: Create Master Directory Structure** (5 minutes)

```bash
# Create the canonical structure in Project-Nyra/
mkdir -p Project-Nyra/{
  orchestration/{claude-flow,archon-os},
  mcp-servers/{nexus,letta,mem0,openmemory,serena,gemini-assistant},
  services/{quote-engine,campaign-engine,nyra-orchestrator,mem0-rest},
  apps/{ratehunter,nyra-admin},
  infra/docker,
  configs/{nexus,litellm,observability,mcp,env},
  docs/{architecture,deployment,integrations,mcp-servers,guides},
  scripts/{setup,infisical,dev,repo},
  prompts/{claude-flow,agents},
  data/{campaigns,quotes,n8n},
  .claude-flow,
  .archive  # For backed-up conflicting versions
}
```

**Step 2: Copy Production-Ready Components** (10 minutes)

For each component marked as "production-ready" in the assessment:
1. Copy to appropriate location in master directory
2. Preserve all metadata (timestamps, permissions)
3. Create backup in `.archive/` with timestamp and source location
4. Log the action to `consolidation-log.txt`

Example logic:
```python
# Pseudocode for consolidation
for component in production_ready_components:
    source = component.current_location
    dest = component.canonical_location
    
    # Backup if destination exists
    if exists(dest):
        backup_path = f".archive/{component.name}-{timestamp}-{hash(source)}"
        copy(dest, backup_path)
        log(f"Backed up existing {dest} to {backup_path}")
    
    # Copy source to destination
    copy(source, dest)
    log(f"Consolidated {source} -> {dest}")
```

**Step 3: Resolve Conflicts** (10 minutes)

For each conflict identified in assessment:
1. Compare both versions
2. Apply resolution strategy from conflict-resolutions.json
3. Merge if possible (e.g., combine env variables)
4. Archive the non-chosen version with detailed notes
5. Log the decision

Special handling for key files:
- **.env files**: Merge all unique variables, use most recent values for duplicates
- **docker-compose.yml**: Merge all services, keep most complete service definitions
- **Config files**: Use most production-ready version, archive others with diff
- **Documentation**: Merge content, keep most recent timestamps

**Step 4: Create Consolidation Report** (5 minutes)

Generate comprehensive report:
- `consolidation-report.md` - Human-readable summary
- `consolidation-manifest.json` - Machine-readable record of all actions
- `file-sources.txt` - Mapping of final files to their source locations
- `archived-files.txt` - List of all backed-up files with reasons

**Output Files**:
```
Project-Nyra/
├── .archive/
│   ├── README.md (explains archive structure)
│   ├── conflicts/
│   ├── replaced/
│   └── consolidation-log.txt
├── assessment/
│   ├── inventory-by-location.json
│   ├── completeness-report.md
│   ├── conflicts-detected.json
│   └── ...all assessment files
└── consolidation-report.md
```

---

## 🏗️ INTELLIGENT BUILD PHASES (Execute Only What's Missing)

### PHASE 2: SMART INFRASTRUCTURE COMPLETION (30-60 minutes)

**Objective**: Build only the infrastructure components identified as "missing" or "needs-work" in assessment.

**Decision Logic**:
```
FOR each infrastructure component:
  IF status == "production-ready":
    SKIP (already done)
    LOG "Using existing: {component}"
  
  ELIF status == "needs-work":
    ENHANCE (improve existing)
    LOG "Enhancing: {component}"
  
  ELIF status == "missing":
    BUILD (create from scratch)
    LOG "Building: {component}"
```

**Components to Check**:

1. **Nexus Router**
   - Exists? Check `configs/nexus/nexus.toml`
   - Complete? Verify has all providers (anthropic, openrouter, gemini)
   - Action: Create if missing, enhance if incomplete

2. **Docker Compose Stack**
   - Exists? Check `infra/docker/docker-compose.yml`
   - Complete? Verify has all services from architecture
   - Action: Merge if exists, create if missing

3. **Observability Stack**
   - Exists? Check `configs/observability/` directory
   - Complete? Verify Prometheus, Grafana, Loki configs
   - Action: Add missing pieces only

[Continue for each component...]

### PHASE 3: SMART SERVICES IMPLEMENTATION (1-2 hours)

**Objective**: Implement only business services that don't exist or need completion.

**For Each Service** (Quote Engine, Campaign Engine, Nyra Orchestrator, Mem0 REST):

1. **Check Existence**:
   ```python
   service_path = f"services/{service_name}/app/main.py"
   if not exists(service_path):
       return "missing"
   ```

2. **Check Completeness**:
   ```python
   has_fastapi_app = "FastAPI" in read_file(service_path)
   has_health_endpoint = "@app.get('/health')" in read_file(service_path)
   has_requirements = exists(f"services/{service_name}/requirements.txt")
   has_dockerfile = exists(f"services/{service_name}/Dockerfile")
   
   if all([has_fastapi_app, has_health_endpoint, has_requirements, has_dockerfile]):
       return "complete"
   else:
       return "incomplete"
   ```

3. **Take Action**:
   - If missing: Build complete service
   - If incomplete: Add missing pieces (don't rebuild what exists)
   - If complete: Skip and log "Using existing"

**Example: Quote Engine Smart Build**

```python
# Assessment
quote_engine_status = assess_service("quote-engine")

if quote_engine_status == "complete":
    log("✓ Quote Engine is production-ready, skipping build")
    
elif quote_engine_status == "partial":
    log("→ Quote Engine exists but incomplete, enhancing...")
    
    # Check what's missing
    missing_pieces = []
    if not has_dockerfile():
        missing_pieces.append("dockerfile")
    if not has_health_endpoint():
        missing_pieces.append("health-endpoint")
    if not has_error_handling():
        missing_pieces.append("error-handling")
    
    # Add only missing pieces
    for piece in missing_pieces:
        add_component(piece)
        log(f"  Added: {piece}")
        
else:  # missing
    log("→ Quote Engine missing, building from scratch...")
    build_complete_service("quote-engine")
```

### PHASE 4: SMART FRONTEND BUILD (1-2 hours)

**Objective**: Build or enhance frontend applications based on current state.

**For Each App** (RateHunter, Nyra Admin):

1. **Check if app exists**:
   ```bash
   # Does package.json exist?
   # Does app/ or src/ directory exist?
   # Are there any .tsx/.jsx files?
   ```

2. **If exists, assess quality**:
   - Has proper Next.js structure?
   - Has environment configuration?
   - Has component library integrated?
   - Has routing set up?
   - Has API integration?

3. **Smart action**:
   - If well-structured: Add missing features only
   - If skeleton only: Build out components
   - If missing: Create complete app

**Example: RateHunter Assessment**

```typescript
// Check existence and quality
const ratehunterPath = "apps/ratehunter";
const hasPackageJson = exists(`${ratehunterPath}/package.json`);
const hasAppDir = exists(`${ratehunterPath}/app`);
const hasComponents = glob(`${ratehunterPath}/**/*.tsx`).length > 5;
const hasEnvConfig = exists(`${ratehunterPath}/.env.example`);

if (hasPackageJson && hasAppDir && hasComponents && hasEnvConfig) {
  console.log("✓ RateHunter is well-structured");
  
  // Check for specific features
  const features = {
    rateCalculator: hasFile("app/calculator/page.tsx"),
    contactForm: hasFile("app/apply/page.tsx"),
    ratesDisplay: hasFile("app/rates/page.tsx"),
    apiIntegration: hasFile("lib/api-client.ts")
  };
  
  // Build only missing features
  for (const [feature, exists] of Object.entries(features)) {
    if (!exists) {
      console.log(`  Building missing feature: ${feature}`);
      buildFeature(feature);
    }
  }
  
} else {
  console.log("→ RateHunter incomplete, building...");
  buildCompleteApp("ratehunter");
}
```

### PHASE 5: SMART ORCHESTRATION SETUP WITH LANGUAGE TEMPLATES (45-60 minutes)

**Objective**: Configure Claude Flow and Archon OS with intelligent language-specific template selection.

**Tasks**:

1. **Check Claude Flow Initialization**:
   ```bash
   # Is .claude-flow/ directory present?
   # Is CLAUDE.md configured?
   # Are workflows defined?
   ```
   - If initialized: Verify configuration, update if needed
   - If not initialized: Run full init

2. **Intelligent Template Selection for Polyglot Architecture**:

   Project Nyra uses multiple languages, requiring component-level template selection:

   **Backend Services (Python + FastAPI)**:
   - Components: Quote Engine, Campaign Engine, Nyra Orchestrator, Mem0 REST API
   - Template: `CLAUDE-MD-Python.md`
   - Pattern: Mesh topology for data processing
   - Features: Parallel pytest, pip batching, FastAPI coordination
   - Swarm Config:
     ```javascript
     {
       topology: "mesh",
       maxAgents: 6,
       strategy: "parallel",
       language: "python",
       framework: "fastapi",
       agents: [
         "fastapi-architect",
         "api-developer", 
         "database-expert",
         "testing-specialist",
         "security-auditor",
         "devops-engineer"
       ]
     }
     ```

   **Frontend Applications (TypeScript + React + Next.js)**:
   - Components: RateHunter public site, Nyra Admin dashboard
   - Templates: `CLAUDE-MD-TypeScript.md` + `CLAUDE-MD-React.md`
   - Pattern: Star topology for type propagation + Mesh for components
   - Features: Incremental tsc, component batching, bundle optimization
   - Swarm Config:
     ```javascript
     {
       topology: "star",
       maxAgents: 6,
       strategy: "parallel",
       language: "typescript",
       framework: "nextjs",
       agents: [
         "type-designer",
         "component-architect",
         "state-manager",
         "ui-ux-designer",
         "performance-engineer",
         "testing-specialist"
       ]
     }
     ```

   **Infrastructure (Docker + YAML + TOML)**:
   - Components: Docker Compose files, Nexus configs, observability
   - Template: Custom infrastructure template
   - Pattern: Hierarchical for ordered dependency setup
   - Features: Health check validation, network topology optimization

3. **Create Component-Specific CLAUDE.md Files**:

   Instead of single monolithic CLAUDE.md, create optimized configs per component:

   ```bash
   # Python Services
   services/quote-engine/.claude/CLAUDE.md        # Python template
   services/campaign-engine/.claude/CLAUDE.md     # Python template
   services/nyra-orchestrator/.claude/CLAUDE.md   # Python template
   services/mem0-rest/.claude/CLAUDE.md           # Python template

   # Frontend Apps  
   apps/ratehunter/.claude/CLAUDE.md              # TypeScript + React
   apps/nyra-admin/.claude/CLAUDE.md              # TypeScript + React

   # Root orchestration
   CLAUDE.md                                       # Master coordinator
   ```

4. **Configure Language-Specific Optimization Patterns**:

   **Python Services Optimization**:
   - Enable parallel pip installs: `pip install --parallel`
   - Configure pytest workers: `pytest -n auto`
   - Set FastAPI workers: `uvicorn --workers 4`
   - Enable async patterns: `async def` coordination

   **TypeScript/React Optimization**:
   - Enable incremental compilation: `tsc --incremental`
   - Configure parallel webpack: `parallel-webpack`
   - Set React batch updates: `ReactDOM.unstable_batchedUpdates`
   - Enable code splitting: dynamic `import()`

5. **Check Archon OS**:
   ```bash
   # Is orchestration/archon-os/ cloned?
   # Is it configured for this project?
   ```
   - If present: Pull latest, verify config
   - If missing: Clone and configure

6. **Check MCP Server Configs**:
   ```bash
   # Check ~/.claude_code/mcp.json (or equivalent)
   # Verify all required servers are listed
   ```
   - If configured: Validate and update
   - If missing: Generate configs

7. **Verify Template Application**:
   
   For each component, confirm correct template is active:
   ```bash
   # Check Python services have pytest coordination
   grep "pytest" services/*/requirements.txt
   
   # Check TypeScript apps have proper tsconfig
   cat apps/*/tsconfig.json | jq '.compilerOptions.incremental'
   
   # Check React apps have component batching
   grep "React.memo" apps/*/app/**/*.tsx
   ```

**Expected Outcomes**:
- ✅ Python services built with FastAPI-specific patterns
- ✅ TypeScript apps built with strict type safety
- ✅ React components built with performance optimization
- ✅ Each component uses optimal swarm topology for its language
- ✅ Build times reduced by 30-45% through language-specific parallelization
- ✅ Test execution 2-3x faster through proper coordination patterns

### PHASE 6: INTEGRATION & TESTING (30 minutes)

**Objective**: Verify all components work together.

**Tests**:

1. **Service Health Checks**:
   ```bash
   # For each service, hit health endpoint
   curl http://localhost:8001/health  # Quote Engine
   curl http://localhost:8010/health  # Orchestrator
   # etc.
   ```

2. **Service Integration Tests**:
   ```bash
   # Test Quote Engine -> CRM integration
   # Test Campaign Engine -> n8n integration
   # Test Memory systems connectivity
   ```

3. **Frontend -> Backend Tests**:
   ```bash
   # Test RateHunter API calls
   # Test Admin dashboard data loading
   ```

4. **MCP Connectivity**:
   ```bash
   # Verify Claude Code can reach all MCP servers
   ```

**Output**: `test-results.json` with pass/fail for each test

### PHASE 7: DOCUMENTATION COMPLETION (30 minutes)

**Objective**: Generate only missing documentation.

**Check What Exists**:
- Architecture diagrams?
- API documentation?
- Deployment guides?
- Troubleshooting guides?

**Generate Only Missing Pieces**:
- If API docs missing: Auto-generate from FastAPI schemas
- If architecture missing: Generate from docker-compose and service structure
- If deployment missing: Create from current configuration

---

## 📊 PROGRESS REPORTING

Every 30 minutes, output a progress report:

```
═══════════════════════════════════════
PROGRESS REPORT - [Timestamp]
═══════════════════════════════════════

Phase: [Current Phase Name]
Time Elapsed: [X hours Y minutes]
Estimated Remaining: [X hours Y minutes]

Completed:
✓ [List completed tasks]

In Progress:
→ [Current task]

Skipped (Already Done):
○ [List of components found complete]

Next Up:
□ [Upcoming tasks]

Issues Encountered: [None / List]

═══════════════════════════════════════
```

---

## ✅ ENHANCED SUCCESS CRITERIA

When complete, verify:

**Assessment & Consolidation**:
- [ ] All three source locations scanned
- [ ] Complete inventory generated
- [ ] All conflicts identified and resolved
- [ ] Consolidation report created
- [ ] All production-ready work preserved

**Infrastructure**:
- [ ] All services running and healthy
- [ ] No duplicate configurations
- [ ] All ports responding correctly
- [ ] Observability stack operational

**Smart Build**:
- [ ] No redundant implementations
- [ ] Existing production code preserved
- [ ] Only gaps filled in
- [ ] All services tested and working

**Documentation**:
- [ ] Clear record of what was consolidated
- [ ] Clear record of what was built
- [ ] Clear record of what was skipped

---

## 🚨 CRITICAL RULES (ENHANCED)

1. **NEVER OVERWRITE PRODUCTION CODE**: Always check if component exists and is production-ready before building
2. **ALWAYS BACKUP BEFORE REPLACING**: Archive conflicting versions before resolution
3. **COMPREHENSIVE LOGGING**: Log every decision (build, skip, enhance, consolidate)
4. **NO PLACEHOLDERS**: Every new component must be fully functional
5. **VERIFY BEFORE PROCEEDING**: Each phase verifies prerequisites before starting
6. **SMART DUPLICATION DETECTION**: Check for existing implementations across all locations
7. **PRESERVE METADATA**: Keep timestamps, git history, and original sources documented

---

## 🎯 EXECUTION COMMAND

For Claude Code:

```
Read .claude-flow/MASTER-BUILD-ENHANCED.md and execute all phases autonomously, starting with comprehensive assessment of existing repositories (NYRA-AIO-Bootstrap, NyraDocs, Project-Nyra). Consolidate all materials intelligently, then build only missing components. Do not ask for confirmation. Report progress every 30 minutes.
```

---

**BEGIN ENHANCED AUTONOMOUS EXECUTION**

This build will:
- Respect and preserve your existing work
- Consolidate materials from multiple locations
- Avoid all redundant implementations
- Complete only what's actually missing
- Document everything that was done

Expected completion: 5-9 hours with comprehensive consolidation and smart building.
