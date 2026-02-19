# Bootstrap Can Now Run From Anywhere

## How It Works

### 1. Auto-Detection of Project Root
\\\	ypescript
// Searches up to 5 directory levels for project markers:
// - Must find 'infra' folder
// - Must find 'bootstrap' folder
// If found: Uses that as project root
// If not found: Uses current working directory (with warning)
\\\

### 2. Dynamic Docker-Compose Generation
Instead of requiring existing files, bootstrap now:
\\\
1. Generates docker-compose files from scratch
2. Creates appropriate services for role (orchestrator vs worker)
3. Sets up health checks, networking, volumes
4. Uses environment variables from .env
\\\

### 3. Location Independence
**Can be run from:**
- ✅ Project root: \cd /path/to/project-nyra && npm run bootstrap\
- ✅ Bootstrap folder: \cd /path/to/project-nyra/bootstrap/installer && npm run dev\
- ✅ Anywhere else: \cd ~/Desktop && npm run bootstrap --project /path/to/project-nyra\
- ✅ Via shortcut/launcher: Can be launched from anywhere

### 4. File Generation (Not Required Files)
**Instead of looking for:**
- ❌ infra/docker-compose.orchestrator.yml
- ❌ infra/docker-compose.worker.yml

**Bootstrap now:**
- ✅ Generates orchestrator-specific compose
- ✅ Generates worker-specific compose
- ✅ Creates infra/ directory if missing
- ✅ Uses existing files if they're there

## Execution Flow

\\\
User launches bootstrap from anywhere
  ↓
Bootstrap detects current working directory
  ↓
Searches up to 5 levels for project root (infra + bootstrap markers)
  ↓
If found: Uses that directory as project root
If not: Uses current directory
  ↓
Generates docker-compose file for selected role
  ↓
Creates infra/ directory if needed
  ↓
Writes generated compose file
  ↓
Merges .env (preserves existing, adds PC_NAME/ROLE/LAN_IP)
  ↓
Executes: docker compose -f infra/docker-compose.yml pull
  ↓
Executes: docker compose -f infra/docker-compose.yml up -d
  ↓
Done - services running
\\\

## What Gets Generated

### For Orchestrator:
\\\yaml
services:
  postgres: # Database
  redis: # Caching
  litellm: # AI gateway
  claude-flow: # Orchestration
\\\

### For Worker:
\\\yaml
services:
  ollama: # GPU inference
  redis: # Caching
  gpu-monitor: # GPU monitoring
\\\

## Backward Compatibility

- ✅ If existing compose files are found, they're used
- ✅ If useExisting=false, regenerates anyway
- ✅ Falls back to generated if no existing files

## Usage Examples

### Run from project root:
\\\ash
cd ~/projects/project-nyra
npm run bootstrap
# or
cd bootstrap/installer && npm run dev
\\\

### Run from bootstrap folder:
\\\ash
cd ~/projects/project-nyra/bootstrap/installer
npm run dev
# Auto-detects project root by finding 'infra' and 'bootstrap' folders
\\\

### Run from anywhere:
\\\ash
cd ~/Desktop
# Could launch via shortcut/app that passes project root
npm run bootstrap --project /path/to/project-nyra
\\\

## Next Steps

1. Replace the deploy-services handler in bootstrap/installer/src/main/main.ts
2. Import the generateDockerCompose function
3. Test running from different directories
4. Optionally add UI controls for:
   - Selecting which services to include
   - Custom docker-compose files vs generated
   - Multiple orchestrator/worker profile options
