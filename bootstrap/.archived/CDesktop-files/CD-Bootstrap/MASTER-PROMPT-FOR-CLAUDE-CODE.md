# MASTER AUTOMATION PROMPT FOR CLAUDE CODE / CLAUDE FLOW

Copy and paste this entire prompt into Claude Code or Claude Flow to automatically set up your complete Project Nyra system from top to bottom.

---

## YOUR MISSION: Complete Project Nyra Bootstrap & Setup

You are an expert AI automation engineer tasked with setting up the complete Project Nyra mortgage automation platform. This is a production system for a real mortgage brokerage business that processes millions of dollars in loans monthly.

### CONTEXT

You are working in the directory: `C:\Dev\Projects\Repos\Project-Nyra`

This repository contains bootstrap materials scattered across multiple locations that need to be consolidated, then a complete monorepo needs to be initialized with all services, memory systems, and configurations.

The bootstrap consolidation kit is located at: `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\consolidation-kit`

### YOUR TASK BREAKDOWN

Execute the following phases sequentially. Complete each phase fully before moving to the next. Report progress after each major step.

---

## PHASE 1: ANALYZE EXISTING BOOTSTRAP MATERIALS (15 minutes)

**Objective:** Understand what bootstrap files exist and identify any conflicts.

**Steps:**

1. Navigate to the consolidation kit directory:
   ```powershell
   cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\consolidation-kit
   ```

2. Run the analysis script to examine all source locations:
   ```powershell
   .\01-ANALYZE.ps1 -Verbose
   ```

3. Review the generated analysis report (`analysis-report.md`)

4. Identify the following:
   - Total number of unique files found
   - Number of conflicting files (same name, different content)
   - Number of identical duplicates
   - Any missing critical files

5. Report your findings including:
   - Summary statistics
   - Critical conflicts that need attention
   - Recommendation on whether it's safe to proceed with consolidation

---

## PHASE 2: CONSOLIDATE BOOTSTRAP MATERIALS (30 minutes)

**Objective:** Safely merge all bootstrap files into one organized structure.

**Steps:**

1. If analysis shows conflicts, review each conflict and determine:
   - Which version should be kept (highest priority = repo bootstrap)
   - Whether manual intervention is needed
   - Document any decisions made

2. Create a complete backup before consolidation:
   ```powershell
   .\02-CONSOLIDATE.ps1 -Backup -Verbose -DryRun
   ```

3. Review the dry-run output to confirm expected behavior

4. Execute the actual consolidation:
   ```powershell
   .\02-CONSOLIDATE.ps1 -Backup -Verbose
   ```

5. Verify the consolidated structure:
   - Check that files are organized into proper subdirectories (configs, scripts, templates, docker, installers, docs)
   - Verify backup was created successfully
   - Confirm no files were lost in the process

6. Report consolidation results:
   - Number of files consolidated
   - Directory structure created
   - Backup location
   - Any issues encountered

---

## PHASE 3: PREPARE ENVIRONMENT CONFIGURATION (45 minutes)

**Objective:** Set up complete environment variables and configuration files.

**Steps:**

1. Copy the complete environment template to the project root:
   ```powershell
   Copy-Item .\configs\complete.env ..\..\..\.env.template
   ```

2. Create the actual .env file (DO NOT commit to git):
   ```powershell
   Copy-Item .\configs\complete.env ..\..\.env
   ```

3. Configure critical environment variables (ask user for these if not available):
   - INFISICAL_PROJECT_ID (already set: 8374cea9-e5e8-4050-bda4-b91f25ab30ef)
   - ANTHROPIC_API_KEY
   - OPENROUTER_API_KEY
   - GITHUB_TOKEN
   - Database passwords (PostgreSQL, Redis, etc.)
   - Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
   - SendGrid credentials (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)

4. Set up the enhanced Claude settings:
   ```powershell
   # Create .claude directory if it doesn't exist
   New-Item -ItemType Directory -Force -Path ..\..\.claude
   
   # Copy enhanced settings
   Copy-Item .\configs\settings-enhanced.json ..\..\.claude\settings.json
   ```

5. Copy the root CLAUDE.md file:
   ```powershell
   Copy-Item .\configs\ROOT-CLAUDE.md ..\..\CLAUDE.md
   ```

6. Verify all configuration files are in place:
   - [ ] .env file exists (NOT .env.template)
   - [ ] .claude/settings.json has all memory systems configured
   - [ ] Root CLAUDE.md is present
   - [ ] All API keys are set (or marked as TODO)

---

## PHASE 4: START MEMORY SYSTEM INFRASTRUCTURE (60 minutes)

**Objective:** Initialize all 6 memory systems (RuVector, Letta, Graphiti, FalkorDB, Mem0, OpenMemory).

**Steps:**

1. Start the Docker infrastructure for databases:
   ```powershell
   cd ..\..
   docker-compose -f infra/docker/docker-compose.memory.yml up -d
   ```

2. Wait for containers to be healthy (30-60 seconds):
   ```powershell
   docker-compose -f infra/docker/docker-compose.memory.yml ps
   ```

3. Initialize RuVector:
   ```powershell
   # Install RuVector if not already installed
   cargo install ruvector
   
   # Start RuVector server in distributed mode
   ruvector serve --port 7000 --mode distributed --consensus-peers localhost:7001,localhost:7002
   ```

4. Initialize Letta:
   ```powershell
   # Install Letta
   pip install letta --break-system-packages
   
   # Configure Letta with PostgreSQL backend
   letta configure
   # Use DATABASE_URL from .env: postgresql://letta:letta_password@localhost:5432/letta
   
   # Start Letta server
   letta server --port 8283
   ```

5. Initialize Graphiti with FalkorDB backend:
   ```powershell
   # Install Graphiti
   pip install graphiti-core --break-system-packages
   
   # Initialize graph database
   python -c "from graphiti import Graphiti; g = Graphiti(backend='falkordb', url='redis://localhost:6379'); g.initialize()"
   ```

6. Initialize Mem0:
   ```powershell
   # Install Mem0
   pip install mem0ai --break-system-packages
   
   # Start Mem0 server
   mem0 serve --port 8081 --vector-store qdrant
   ```

7. Initialize OpenMemory:
   ```powershell
   # Install OpenMemory
   npm install -g openmemory
   
   # Start OpenMemory server
   openmemory serve --port 8080 --shared-memory true --encryption true
   ```

8. Health check all memory systems:
   ```powershell
   # Test each system's health endpoint
   curl http://localhost:7000/health   # RuVector
   curl http://localhost:8283/health   # Letta
   curl http://localhost:6379/ping     # FalkorDB
   curl http://localhost:8081/health   # Mem0
   curl http://localhost:8080/health   # OpenMemory
   curl http://localhost:6333/health   # Qdrant
   ```

9. Report memory system status:
   - Which systems are running
   - Which systems failed to start (if any)
   - Connection details for each system
   - Any errors encountered

---

## PHASE 5: INITIALIZE PROJECT NYRA MONOREPO (2-3 hours)

**Objective:** Create the complete directory structure with all 20+ modules.

**Steps:**

1. Execute Claude Flow batch initialization:
   ```powershell
   npx claude-flow@alpha init --config bootstrap\consolidation-kit\configs\batch-config-complete.json
   ```

2. Monitor the initialization progress and report after each module is created

3. If initialization fails at any point:
   - Identify which module failed
   - Review error logs
   - Attempt to fix the specific module
   - Resume initialization

4. After initialization completes, verify directory structure:
   ```powershell
   # List all created directories
   Get-ChildItem -Directory -Recurse -Depth 2
   ```

5. Verify key files were created:
   - [ ] apps/webapp with CLAUDE.md
   - [ ] services/quote-api with CLAUDE.md
   - [ ] mcp-servers/letta with configuration
   - [ ] infra/docker with docker-compose files
   - [ ] .github/workflows with CI/CD configs
   - [ ] Root package.json with workspace configuration

6. Report initialization results:
   - Total modules created
   - Total files generated
   - Any modules that failed
   - Directory structure summary

---

## PHASE 6: INSTALL DEPENDENCIES (30-60 minutes)

**Objective:** Install all project dependencies for all modules.

**Steps:**

1. Install Node.js dependencies (monorepo):
   ```powershell
   pnpm install
   ```

2. Install Python dependencies for services:
   ```powershell
   # Quote API
   cd services\quote-api
   pip install -r requirements.txt --break-system-packages
   cd ..\..
   
   # Campaign Engine
   cd services\campaign-engine
   pnpm install
   cd ..\..
   
   # Document Processor
   cd services\document-processor
   pip install -r requirements.txt --break-system-packages
   cd ..\..
   ```

3. Install MCP server dependencies:
   ```powershell
   # Letta server
   cd mcp-servers\letta
   pip install -r requirements.txt --break-system-packages
   cd ..\..
   
   # Graphiti server
   cd mcp-servers\graphiti
   pip install -r requirements.txt --break-system-packages
   cd ..\..
   
   # Similar for other MCP servers
   ```

4. Verify all dependencies installed successfully:
   ```powershell
   pnpm list --depth=0
   ```

5. Report dependency installation status:
   - Node packages installed
   - Python packages installed
   - Any missing dependencies
   - Any version conflicts

---

## PHASE 7: DATABASE SETUP (30 minutes)

**Objective:** Create database schemas and run migrations.

**Steps:**

1. Generate Prisma client:
   ```powershell
   pnpm run db:generate
   ```

2. Run database migrations:
   ```powershell
   pnpm run db:migrate
   ```

3. Seed test data (if applicable):
   ```powershell
   pnpm run db:seed
   ```

4. Verify database schema:
   ```powershell
   pnpm run db:studio
   ```

5. Report database setup status:
   - Migrations applied
   - Tables created
   - Test data seeded
   - Any errors encountered

---

## PHASE 8: START DEVELOPMENT SERVERS (15 minutes)

**Objective:** Start all services in development mode.

**Steps:**

1. Start all apps and services:
   ```powershell
   pnpm run dev:all
   ```

2. Verify each service is running:
   - Webapp: http://localhost:3000
   - Quote API: http://localhost:8000
   - CRM Dashboard: http://localhost:3001
   - Dify: http://localhost:5001
   - n8n: http://localhost:5678

3. Test critical endpoints:
   ```powershell
   # Test quote API
   curl http://localhost:8000/health
   
   # Test webapp
   curl http://localhost:3000
   ```

4. Report service status:
   - Which services are running
   - Port assignments
   - Any startup errors
   - Access URLs

---

## PHASE 9: VALIDATION & TESTING (45 minutes)

**Objective:** Verify the complete system is working end-to-end.

**Steps:**

1. Test memory system integration:
   ```powershell
   # Test RuVector search
   npx claude-flow memory search --system ruvector --query "test query"
   
   # Test Letta agent
   npx claude-flow memory recall --system letta --agent-id test-agent
   
   # Test Graphiti temporal tracking
   npx claude-flow memory evolution --system graphiti --entity-id test-entity
   ```

2. Test agent execution:
   ```powershell
   # Test single agent
   npx claude-flow agent execute --agent mortgage-quote-agent --task "Calculate DTI for $95k income, $2k monthly debt"
   
   # Test swarm coordination
   npx claude-flow swarm execute-batch --tasks "task1,task2" --agents "agent1,agent2" --parallel true
   ```

3. Test mortgage workflows:
   ```powershell
   # Test quote generation
   npx claude-flow mortgage quote --borrower-id test-123 --loan-amount 400000 --credit-score 740
   
   # Test document processing
   npx claude-flow documents process --file test-paystub.pdf
   ```

4. Run automated tests:
   ```powershell
   pnpm run test:all
   ```

5. Report validation results:
   - Memory systems working: [ ] Yes [ ] No
   - Agent execution working: [ ] Yes [ ] No
   - Mortgage workflows working: [ ] Yes [ ] No
   - Test suite passing: [ ] Yes [ ] No
   - Any issues found

---

## PHASE 10: CLEANUP & DOCUMENTATION (30 minutes)

**Objective:** Clean up temporary files and document the installation.

**Steps:**

1. Remove temporary files and build artifacts:
   ```powershell
   pnpm run clean
   ```

2. Create installation summary document:
   ```markdown
   # Project Nyra Installation Summary
   
   Date: [Current Date]
   Duration: [Total Time]
   
   ## Components Installed
   - Apps: [List of apps]
   - Services: [List of services]
   - MCP Servers: [List of MCP servers]
   - Memory Systems: [List of memory systems]
   
   ## Configuration
   - Environment variables: [Count]
   - Database tables: [Count]
   - Test data: [Status]
   
   ## Running Services
   - [Service Name]: [URL]
   - [Service Name]: [URL]
   
   ## Next Steps
   1. Configure API keys for production
   2. Set up SSL certificates
   3. Configure Cloudflare tunnel
   4. Set up monitoring and alerts
   
   ## Known Issues
   [List any issues found during installation]
   ```

3. Commit all changes to git:
   ```powershell
   git add -A
   git commit -m "Complete Project Nyra bootstrap - all modules initialized"
   git push origin main
   ```

4. Create a backup of the entire system:
   ```powershell
   pnpm run backup:complete
   ```

---

## CRITICAL SUCCESS CRITERIA

Before marking this task complete, verify ALL of the following:

- [ ] All 6 memory systems are running and healthy
- [ ] All Docker containers are up (PostgreSQL, Redis, Neo4j, Qdrant, etc.)
- [ ] Project Nyra monorepo is fully initialized with all 20+ modules
- [ ] All dependencies are installed (Node, Python, Rust)
- [ ] Database migrations have run successfully
- [ ] All development servers can start without errors
- [ ] Memory system operations work (search, store, retrieve)
- [ ] Agent execution works (single agent and swarm)
- [ ] Basic mortgage workflows work (quote generation, etc.)
- [ ] All configuration files are in place (.env, settings.json, CLAUDE.md)
- [ ] Bootstrap materials are consolidated and organized
- [ ] System is backed up
- [ ] Installation is documented

---

## REPORTING REQUIREMENTS

After EACH phase, provide:

1. **Phase name** and objective
2. **Completion status**: ✓ Complete | ⚠ Partial | ✗ Failed
3. **Summary**: 2-3 sentences describing what was accomplished
4. **Issues**: Any errors, warnings, or problems encountered
5. **Files created/modified**: List of key files
6. **Next steps**: What will happen in the next phase

At the END of ALL phases, provide:

1. **Executive Summary**: Overall project status in 1 paragraph
2. **Completion Checklist**: All success criteria checked off
3. **System Access**: URLs and credentials for all services
4. **Documentation**: Links to all generated documentation
5. **Known Issues**: Complete list of any problems found
6. **Recommendations**: Suggestions for next steps or improvements

---

## IMPORTANT NOTES

- **DO NOT ask for permission** at each step - execute the entire plan autonomously
- **DO make decisions** when configuration choices are needed (use sensible defaults)
- **DO continue** even if non-critical errors occur (log them and move forward)
- **DO report progress** after each major step (but don't wait for approval to continue)
- **DO prioritize** getting the system working over perfection (we can refine later)
- **DO create backups** before making destructive changes
- **DO verify** each component works before moving to the next phase

---

## BEGIN EXECUTION NOW

Start with Phase 1 and work through all phases sequentially. Report your progress and complete the entire setup from top to bottom.

GO!
