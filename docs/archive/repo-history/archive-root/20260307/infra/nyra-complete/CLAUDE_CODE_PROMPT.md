# Claude Code Prompt: Project Nyra Repository Consolidation & Integration

## Overview
This prompt is designed for **Claude Code** to help consolidate, organize, and integrate your Project Nyra repository from scattered/messy state into the clean scaffold provided.

## Instructions
1. Copy the entire content of this prompt
2. Open Claude in your code editor or terminal
3. Paste this prompt into the conversation
4. Claude Code will systematically organize your repo
5. Review changes, approve, and commit

---

## MASTER PROMPT FOR CLAUDE CODE

```
You are a senior DevOps engineer tasked with consolidating the Project Nyra mortgage automation platform repository.

Your goals:
1. Take the existing scattered files (from the messy_pile directory)
2. Map them into the clean scaffold structure provided
3. Merge duplicate functionality (no code duplication)
4. Ensure all Docker Compose files work
5. Validate all configuration files (YAML, TOML, JSON)
6. Update all import paths and cross-references
7. Create comprehensive .gitignore
8. Add setup documentation

## Current State
- Location: /path/to/ProjectNyra
- Existing files: spread across multiple zips and folders
- Target structure: The clean scaffold (provided in ARCHITECTURE.md)

## Target Structure (REFERENCE)
ProjectNyra/
├── README.md
├── ARCHITECTURE.md
├── Makefile
├── .env.example
├── .gitignore
├── infra/
│   ├── docker-compose.orchestrator.yml
│   ├── docker-compose.workers.yml
│   ├── docker-compose.oracle.yml
│   ├── nexus/
│   │   ├── Dockerfile
│   │   ├── nexus.toml
│   │   └── tools.json
│   ├── litellm/
│   │   ├── Dockerfile
│   │   └── config.yaml
│   └── scripts/
│       ├── health-check.sh
│       ├── bootstrap-secrets.sh
│       └── migrate-db.sh
├── src/
│   ├── claude-flow/
│   ├── openclaw/
│   └── archon-os/
├── services/
│   ├── quote-engine/
│   ├── lead-ingestion/
│   └── drip-campaign/
├── packages/
│   ├── types/
│   ├── db/
│   └── utils/
├── apps/
│   ├── nyra-admin-ui/
│   └── borrower-portal/
├── workers/
│   ├── rtx-5090.env
│   ├── rtx-3090ti.env
│   └── rtx-3060.env
├── docs/
│   ├── SETUP.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
└── config/
    ├── env.orchestrator
    ├── env.oracle
    ├── env.worker-5090
    ├── env.worker-3090ti
    └── env.worker-3060

## Tasks (Execute in Order)

### Task 1: Inventory Existing Files
1. Scan the repo for all existing files
2. Create a mapping of: Old Location → New Location
3. Identify duplicates, dead code, and experimental branches
4. List all Docker Compose files and their purposes
5. Report on README completeness

### Task 2: Migrate Source Code
1. Move/merge all code from src/ into the scaffold structure
2. For each duplicate: keep the MOST RECENT version, delete others
3. Update all import paths (e.g., `import { calculateMortgage } from '../../../utils'` → `import { calculateMortgage } from '@nyra/mortgage-math'`)
4. Ensure all package.json files point to correct workspace dependencies
5. Remove dead/experimental code (comment out if uncertain, ask before deleting)

### Task 3: Consolidate Configuration Files
1. Merge all .env variants into .env.example (best version)
2. Consolidate all docker-compose files into the 3 master files:
   - docker-compose.orchestrator.yml
   - docker-compose.workers.yml
   - docker-compose.oracle.yml
3. Extract common services into profiles where needed
4. Validate all YAML syntax
5. Ensure all image references match the Dockerfile paths

### Task 4: Create/Update Documentation
1. Generate docs/SETUP.md with step-by-step bootstrap instructions
2. Create docs/API.md documenting all service endpoints
3. Create docs/DEPLOYMENT.md for production checklist
4. Create docs/TROUBLESHOOTING.md with known issues & fixes
5. Update README.md with latest project status

### Task 5: Validate Infrastructure Code
1. Test all docker-compose files for syntax:
   \`\`\`bash
   docker-compose -f infra/docker-compose.orchestrator.yml config
   docker-compose -f infra/docker-compose.workers.yml config
   docker-compose -f infra/docker-compose.oracle.yml config
   \`\`\`
2. Validate all TOML files (nexus.toml):
   \`\`\`bash
   toml-lint infra/nexus/nexus.toml
   \`\`\`
3. Validate all YAML files (config.yaml):
   \`\`\`bash
   yamllint infra/litellm/config.yaml
   \`\`\`
4. Ensure all referenced environment variables exist in .env.example
5. Check all volume and network definitions are consistent

### Task 6: Setup Monorepo Dependencies
1. Create root package.json with workspaces:
   \`\`\`json
   {
     "name": "project-nyra",
     "workspaces": [
       "packages/*",
       "services/*",
       "src/*",
       "apps/*"
     ]
   }
   \`\`\`
2. Ensure each package/service has:
   - Correct name (e.g., @nyra/types, @nyra/quote-engine)
   - Correct version (match root)
   - Correct dependencies
3. Run \`npm install\` to validate workspace resolution
4. Ensure no dependency conflicts

### Task 7: Create .gitignore
Use this as a template:
\`\`\`
node_modules/
dist/
build/
.env
.env.local
.env.*.local
.DS_Store
*.log
.vscode/
.idea/
.workspace
/tmp
/data
docker-compose.override.yml
.secrets/
.cache/
\`\`\`

### Task 8: Setup Git & Initial Commit
1. Initialize git (if not already done):
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: complete Project Nyra scaffold v3.0"
   \`\`\`
2. Create branches for continued work:
   \`\`\`bash
   git branch feature/oracle-integration
   git branch feature/twenty-crm-custom-objects
   git branch feature/activepieces-workflows
   \`\`\`

### Task 9: Generate Integration Checklist
Create INTEGRATION.md with:
- [ ] All services running locally
- [ ] All imports resolving correctly
- [ ] All environment variables defined
- [ ] All docker-compose files valid
- [ ] Health check script passing
- [ ] Database migrations ready
- [ ] CI/CD pipeline configured
- [ ] Documentation complete
- [ ] Team onboarded

### Task 10: Final Validation
1. Run Makefile tests:
   \`\`\`bash
   make orchestrator-up
   make health-check
   \`\`\`
2. Verify Nexus Router can start
3. Verify LiteLLM can connect to workers
4. Verify Claude-Flow can find Docker socket
5. All logs should show no errors

## Output Format
For each task, provide:
- Task name
- Files affected
- Changes made
- Warnings/questions (if any)
- Status (✓ Done, ⚠️ Review, ✗ Failed)

## Questions to Ask During Execution
1. "Should I delete [experimental-feature]? It looks unused."
2. "Found conflicting definitions of [QuoteEngine]. Which version should I keep?"
3. "Should [legacy-service] be archived or integrated?"
4. "Do you want to keep [feature-branch] active?"

## Success Criteria
- ✓ No duplicate code
- ✓ All imports resolve
- ✓ All docker-compose files valid
- ✓ Makefile runs without errors
- ✓ Health check passes
- ✓ Documentation is complete
- ✓ .gitignore is in place
- ✓ Repository is clean and ready for deployment

## If You Encounter Issues
- Show the exact error message
- Suggest a fix (don't just fail)
- Ask for clarification before deleting anything
- Keep backups: \`git stash\` before major changes
```

---

## How to Use This Prompt

### Option 1: Direct Claude Code
1. Open Claude Code in your IDE
2. Paste the entire "MASTER PROMPT FOR CLAUDE CODE" section
3. Say "Go" and monitor progress
4. Review changes in git diff
5. Approve and commit

### Option 2: Step-by-Step Manual
If you prefer more control:
1. Run Task 1 only, review results
2. Run Task 2 only, review results
3. Continue through Task 10

### Option 3: Interactive Dialogue
1. Paste the prompt
2. Ask Claude Code: "What's Task 1?"
3. Review and approve Task 1
4. Continue to next task when ready

---

## Post-Consolidation Steps

Once Claude Code finishes:

1. **Test Locally**
   ```bash
   cd ProjectNyra
   make orchestrator-up
   # Wait 30 seconds
   make health-check
   ```

2. **Push to Git**
   ```bash
   git add .
   git commit -m "refactor: consolidate repo structure v3.0"
   git push origin main
   ```

3. **Share with Team**
   - Send README.md
   - Share SETUP.md for onboarding
   - Provide .env.example template

4. **Next Steps**
   - Deploy orchestrator on Minisforum
   - Boot up workers
   - Provision Oracle Cloud
   - Run `make bootstrap`

---

## Additional Notes

- **Preserve History**: Never force-push after consolidation
- **No Data Loss**: Back up important files before cleanup
- **Ask When Uncertain**: Better to ask than delete
- **Document Changes**: Keep a changelog of what moved where
- **Test Everything**: Validate each step, don't rush

---

**Expected Duration**: 30–60 minutes depending on existing codebase complexity
**Difficulty**: Medium (mostly file movement + syntax validation)
**Risk**: Low (git allows rollback if needed)

Good luck! 🚀
