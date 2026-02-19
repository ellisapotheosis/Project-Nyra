# Bootstrap Installer - External File Interaction Guide

## Summary

The current bootstrap GUI installer (ootstrap/installer/) has these hardcoded dependencies on files **outside** the bootstrap folder:

### Files It Reads (CRITICAL):
1. **infra/docker-compose.orchestrator.yml** - for orchestrator deployments ❌ **YOU DON'T HAVE THIS**
2. **infra/docker-compose.worker.yml** - for worker deployments ❌ **YOU DON'T HAVE THIS**
3. **assets/icon.png** - for Electron window icon ✅ You have this

### Files It Writes (DESTRUCTIVE):
1. **.env** - OVERWRITES your existing .env with only: PC_NAME, PC_ROLE, LAN_IP, NODE_ENV, LOG_LEVEL
   - **PROBLEM:** Loses all your real configuration!

### How It Interacts:

\\\
Bootstrap Flow:
1. User selects PC type (Orchestrator/Worker)
2. Bootstrap detects hardware
3. Bootstrap calculates project root: path.join(__dirname, '../../../')
4. Bootstrap selects compose file based on role
5. Bootstrap OVERWRITES .env with minimal values
6. Bootstrap executes: docker compose -f infra/docker-compose.{role}.yml pull
7. Bootstrap executes: docker compose -f infra/docker-compose.{role}.yml up -d
8. Bootstrap waits 30 seconds
9. For workers: pulls Ollama models
\\\

## Your Actual Situation

**You DON'T have the files bootstrap expects:**
- Missing: infra/docker-compose.orchestrator.yml
- Missing: infra/docker-compose.worker.yml

**But YOU DO have better alternatives:**
- ✅ infra/docker-compose.yml (supports profiles: --profile core, --profile ai, etc.)
- ✅ infra/docker-compose.claude-flow-cicd.yml

## The Problem

Bootstrap is **too rigid** for your flexible setup:
1. Assumes specific compose files exist (they don't)
2. Overwrites .env instead of augmenting it
3. Doesn't use your already-modular docker-compose.yml with profiles
4. Can't let you select individual services

## Your Options

### Option 1: Use Manual Commands (Simplest)
Don't use GUI bootstrap. Just run:
\\\ash
docker compose up -d --profile core      # Core services
docker compose up -d --profile ai        # AI stack
docker compose up -d llama3 mistral      # Specific services
\\\

### Option 2: Create Expected Files
Create the compose files bootstrap expects:
- infra/docker-compose.orchestrator.yml
- infra/docker-compose.worker.yml

But this duplicates your already modular setup.

### Option 3: Modify Bootstrap to Be Modular (RECOMMENDED)
Update bootstrap/installer/src/main/main.ts to:
1. Use YOUR docker-compose.yml with profiles
2. Add checkboxes for service selection
3. MERGE .env instead of overwriting
4. Support your flexible architecture

## Recommended Path Forward

Since you asked specifically about making bootstrap selectable:

**YES, we CAN modify bootstrap to:**
- ✅ Ask which components/services to install
- ✅ Preserve your existing .env
- ✅ Use your main docker-compose.yml instead of role-specific files
- ✅ Support docker-compose profiles
- ✅ Add individual service selection checkboxes

Would you like me to modify the bootstrap installer to be modular?
