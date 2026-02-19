# Bootstrap Docker Interaction - Exact Details

## What Bootstrap Does With Docker Compose Files

### Step 1: Docker Compose File Selection
\\\
Input: User selects PC role (orchestrator or worker)

Logic:
  IF role === 'orchestrator'
    composeFile = 'docker-compose.orchestrator.yml'
  ELSE
    composeFile = 'docker-compose.worker.yml'

These files are expected at:
  {projectRoot}/infra/docker-compose.orchestrator.yml
  {projectRoot}/infra/docker-compose.worker.yml
\\\

### Step 2: Docker Compose Pull (Downloads Images)
\\\
Command Executed:
  docker compose -f /path/to/project-nyra/infra/docker-compose.orchestrator.yml pull
  
What This Does:
  - Reads the selected docker-compose file
  - Downloads all container images specified in the file
  - Does NOT start containers yet, just downloads images
  - Can take several minutes depending on image sizes
\\\

### Step 3: Docker Compose Up (Starts Services)
\\\
Command Executed:
  docker compose -f /path/to/project-nyra/infra/docker-compose.orchestrator.yml up -d
  
What This Does:
  - Reads the selected docker-compose file
  - Creates networks, volumes, services as defined
  - Starts containers in background (-d flag)
  - Uses .env file for environment variables
  - Services reference config from .env like:
    \, \, \, \, \
\\\

### Step 4: Ollama Model Configuration (GPU Workers Only)
\\\
For Worker Nodes Only:
  docker exec ollama ollama pull llama3.1:8b
  docker exec ollama ollama pull mistral:7b
  docker exec ollama ollama pull codellama:13b
  
What This Does:
  - Connects to running 'ollama' container
  - Downloads specific LLM models
  - Can take 10-30+ minutes depending on model sizes
\\\

## Your Current Docker Compose Structure

You have:
  ✅ infra/docker-compose.yml (main master)
  ✅ infra/docker-compose.claude-flow-cicd.yml (CI/CD)

Bootstrap expects:
  ❌ infra/docker-compose.orchestrator.yml (NOT FOUND)
  ❌ infra/docker-compose.worker.yml (NOT FOUND)

## The .env File Problem

### What Bootstrap Currently Does:
\\\
// OVERWRITES .env completely
await fs.writeFile(path.join(projectRoot, '.env'), envContent);

// With only these 5 lines:
PC_NAME=orchestrator
PC_ROLE=orchestrator
LAN_IP=10.0.0.1
NODE_ENV=production
LOG_LEVEL=info
\\\

### What Should Happen Instead:
\\\
// PRESERVE existing .env and add bootstrap values
// Read existing .env
// Add/update bootstrap keys: PC_NAME, PC_ROLE, LAN_IP
// Keep all other existing values
// Write back
\\\

## Summary of Bootstrap Docker Operations

| Operation | Command | Target Files | Effect |
|-----------|---------|--------------|--------|
| Pull Images | docker compose ... pull | docker-compose.*.yml | Downloads container images |
| Start Services | docker compose ... up -d | docker-compose.*.yml | Starts containers with .env config |
| Pull Models | docker exec ollama ollama pull | Running container | Downloads LLM models (worker only) |
| Overwrite Config | fs.writeFile(.env) | .env | DESTROYS existing config ❌ |

## What Needs to be Fixed

1. **❌ .env Overwrite** → Change to **merge/preserve** existing values
2. **❌ Hardcoded compose files** → Support your actual docker-compose.yml
3. **❌ No service selection** → Add checkboxes to choose what to deploy
4. **❌ No profile support** → Add --profile flags for selective deployment
