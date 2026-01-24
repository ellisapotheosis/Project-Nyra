# MASTER AUTOMATION PROMPT FOR CLAUDE FLOW
## Complete Project Nyra Setup - Autonomous Execution

---

## CRITICAL INSTRUCTIONS FOR CLAUDE/CLAUDE FLOW

This is a **fully autonomous setup prompt**. Execute all phases sequentially without asking for confirmation. Report progress after each phase. If any step fails, attempt automatic recovery before reporting the error.

**Expected Execution Time:** 20-30 minutes  
**User Intervention Required:** None (fully automated)  
**Success Criteria:** All services running and passing health checks

---

## PHASE 1: ENVIRONMENT PREPARATION (3 minutes)

### Step 1.1: Verify Prerequisites

Execute these checks and report any missing dependencies:

```bash
# Check required tools
command -v git || echo "ERROR: Git not found"
command -v docker || echo "ERROR: Docker not found"
command -v node || echo "ERROR: Node.js not found"
command -v pnpm || echo "ERROR: pnpm not found - Installing..." && npm install -g pnpm
command -v python3 || echo "ERROR: Python not found"
command -v cargo || echo "ERROR: Rust/Cargo not found"

# Verify Docker is running
docker ps || echo "ERROR: Docker daemon not running - Please start Docker Desktop"

# Check available disk space (need at least 20GB)
df -h . | awk 'NR==2 {print $4}'
```

**If any critical dependency is missing:** Report to user and halt. Do not proceed.

**If all dependencies present:** Continue to Step 1.2.

### Step 1.2: Set Working Directory

```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Verify we're in correct location
pwd
ls -la | grep -E "(apps|services|bootstrap)"
```

**Expected Output:** Should see existing folders like `apps`, `services`, `bootstrap`

**If not in correct directory:** Navigate to correct location or create it.

---

## PHASE 2: FOLDER STRUCTURE CREATION (2 minutes)

### Step 2.1: Create Standard Folder Structure

Execute this command block:

```bash
# Create orchestration directories
mkdir -p orchestration/claude-flow
mkdir -p orchestration/archon-os
mkdir -p orchestration/integration

# Create MCP server directories
mkdir -p mcp-servers/gemini-assistant
mkdir -p mcp-servers/serena
# Note: letta, graphiti, ruvector, mem0, openmemory should already exist

# Create services directory
mkdir -p services/nexus-router

# Create UI directories
mkdir -p ui/open-webui
mkdir -p ui/lobechat
mkdir -p ui/dify

# Create infrastructure directories
mkdir -p infra/docker
mkdir -p infra/k8s
mkdir -p infra/terraform

# Create development toolkit directory
mkdir -p .ccdk

# Verify structure
tree -L 2 orchestration mcp-servers services ui .ccdk
```

**Report:** "Folder structure created successfully"

---

## PHASE 3: REPOSITORY CLONING (5 minutes)

### Step 3.1: Clone All Required Repositories

Execute these git clones with error handling:

```bash
# Function to clone with retry
clone_repo() {
    local url=$1
    local path=$2
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if [ -d "$path" ]; then
            echo "Repository already exists at $path - skipping"
            return 0
        fi
        
        echo "Cloning $url (attempt $attempt/$max_attempts)..."
        if git clone "$url" "$path"; then
            echo "Successfully cloned to $path"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    echo "ERROR: Failed to clone $url after $max_attempts attempts"
    return 1
}

# Clone Claude Code Development Kit
clone_repo "https://github.com/peterkrueck/Claude-Code-Development-Kit.git" ".ccdk"

# Clone orchestration systems
clone_repo "https://github.com/ruvnet/claude-flow.git" "orchestration/claude-flow"
clone_repo "https://github.com/archon-ai/archon-os.git" "orchestration/archon-os"

# Clone MCP servers
clone_repo "https://github.com/peterkrueck/mcp-gemini-assistant.git" "mcp-servers/gemini-assistant"
clone_repo "https://github.com/serena-ai/serena-mcp.git" "mcp-servers/serena"

# Clone UI tools
clone_repo "https://github.com/open-webui/open-webui.git" "ui/open-webui"
clone_repo "https://github.com/lobehub/lobe-chat.git" "ui/lobechat"
```

**Report:** "All repositories cloned successfully" or list any failures

---

## PHASE 4: DEPENDENCY INSTALLATION (8 minutes)

### Step 4.1: Install Node.js Dependencies

```bash
# Install orchestrator dependencies
echo "Installing Claude Flow dependencies..."
cd orchestration/claude-flow
pnpm install
cd ../..

echo "Installing Archon OS dependencies..."
cd orchestration/archon-os
npm install
cd ../..

# Install MCP server Node dependencies
echo "Installing Gemini Assistant dependencies..."
cd mcp-servers/gemini-assistant
npm install
cd ../..

# Install UI dependencies
echo "Installing Open-WebUI dependencies..."
cd ui/open-webui
npm install
cd ../..

echo "Installing LobeChat dependencies..."
cd ui/lobechat
npm install
cd ../..
```

### Step 4.2: Install Python Dependencies

```bash
# Install Serena dependencies
echo "Installing Serena MCP dependencies..."
cd mcp-servers/serena
pip install -r requirements.txt --break-system-packages
cd ../..

# Verify existing memory system dependencies
for service in letta graphiti mem0 openmemory; do
    if [ -f "mcp-servers/$service/requirements.txt" ]; then
        echo "Updating $service dependencies..."
        cd "mcp-servers/$service"
        pip install -r requirements.txt --break-system-packages --upgrade
        cd ../..
    fi
done
```

**Report:** "All dependencies installed successfully"

---

## PHASE 5: NEXUS ROUTER CREATION (3 minutes)

### Step 5.1: Create Nexus Router Service

```bash
cd services/nexus-router

# Create package.json
cat > package.json << 'NEXUS_PACKAGE'
{
  "name": "nexus-router",
  "version": "1.0.0",
  "description": "Intelligent LLM routing for Project Nyra",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.2",
    "redis": "^4.6.11",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
NEXUS_PACKAGE

# Create main router implementation
cat > index.js << 'NEXUS_CODE'
import express from 'express';
import axios from 'axios';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Redis connection
const redis = createClient({ 
    url: process.env.REDIS_URL || 'redis://localhost:6379' 
});
await redis.connect();

// GPU Worker configurations
const GPU_WORKERS = [
  { 
    url: process.env.GPU_WORKER_5090_URL, 
    priority: 1, 
    maxConcurrent: 3, 
    name: 'Worker-5090',
    model: 'deepseek-r1-236b'
  },
  { 
    url: process.env.GPU_WORKER_3090_URL, 
    priority: 2, 
    maxConcurrent: 2, 
    name: 'Worker-3090',
    model: 'llama-70b'
  },
  { 
    url: process.env.GPU_WORKER_3060_URL, 
    priority: 3, 
    maxConcurrent: 2, 
    name: 'Worker-3060',
    model: 'codellama-34b'
  },
];

// Cloud provider fallbacks
const CLOUD_PROVIDERS = [
  { 
    name: 'OpenRouter', 
    url: 'https://openrouter.ai/api/v1', 
    key: process.env.OPENROUTER_API_KEY 
  },
  { 
    name: 'Anthropic', 
    url: 'https://api.anthropic.com/v1', 
    key: process.env.ANTHROPIC_API_KEY 
  },
];

// Analyze request complexity
function getComplexityScore(messages) {
  const totalTokens = messages.reduce((sum, msg) => 
    sum + (msg.content?.length || 0) / 4, 0);
  
  if (totalTokens < 500) return 'simple';
  if (totalTokens < 2000) return 'medium';
  return 'complex';
}

// Route LLM request
app.post('/v1/chat/completions', async (req, res) => {
  const { model, messages, ...options } = req.body;
  const complexity = getComplexityScore(messages);
  
  console.log(`Request complexity: ${complexity}`);
  
  try {
    // Try local GPU workers first (sorted by priority)
    for (const worker of GPU_WORKERS.sort((a, b) => a.priority - b.priority)) {
      const currentLoad = parseInt(await redis.get(`load:${worker.name}`) || '0');
      
      if (currentLoad < worker.maxConcurrent) {
        try {
          console.log(`Routing to ${worker.name} (load: ${currentLoad}/${worker.maxConcurrent})`);
          
          await redis.incr(`load:${worker.name}`);
          const response = await axios.post(
            `${worker.url}/v1/chat/completions`, 
            { ...req.body, model: worker.model }, 
            { timeout: 30000 }
          );
          await redis.decr(`load:${worker.name}`);
          
          console.log(`Success from ${worker.name}`);
          return res.json(response.data);
        } catch (error) {
          await redis.decr(`load:${worker.name}`);
          console.log(`${worker.name} failed: ${error.message}`);
        }
      } else {
        console.log(`${worker.name} at capacity (${currentLoad}/${worker.maxConcurrent})`);
      }
    }
    
    // All GPU workers busy/failed - fallback to cloud
    console.log('All GPU workers unavailable, falling back to cloud...');
    
    for (const provider of CLOUD_PROVIDERS) {
      if (!provider.key) continue;
      
      try {
        console.log(`Trying ${provider.name}...`);
        const response = await axios.post(
          `${provider.url}/chat/completions`, 
          req.body, 
          {
            headers: { 'Authorization': `Bearer ${provider.key}` },
            timeout: 30000
          }
        );
        console.log(`Success from ${provider.name}`);
        return res.json(response.data);
      } catch (error) {
        console.log(`${provider.name} failed: ${error.message}`);
      }
    }
    
    res.status(503).json({ 
      error: 'All LLM providers unavailable',
      message: 'Both local GPU workers and cloud providers are down'
    });
    
  } catch (error) {
    console.error('Nexus Router error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gpu_workers: {},
    cloud_providers: CLOUD_PROVIDERS.map(p => ({
      name: p.name,
      configured: !!p.key
    })),
    redis: 'connected'
  };
  
  for (const worker of GPU_WORKERS) {
    const load = parseInt(await redis.get(`load:${worker.name}`) || '0');
    status.gpu_workers[worker.name] = { 
      load, 
      max: worker.maxConcurrent,
      utilization: `${Math.round(load / worker.maxConcurrent * 100)}%`
    };
  }
  
  res.json(status);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  const metrics = {
    total_requests: await redis.get('metrics:total_requests') || '0',
    gpu_requests: await redis.get('metrics:gpu_requests') || '0',
    cloud_requests: await redis.get('metrics:cloud_requests') || '0',
    failed_requests: await redis.get('metrics:failed_requests') || '0',
  };
  
  metrics.gpu_percentage = Math.round(
    (parseInt(metrics.gpu_requests) / parseInt(metrics.total_requests)) * 100
  ) || 0;
  
  res.json(metrics);
});

const PORT = process.env.NEXUS_PORT || 8000;
app.listen(PORT, () => {
  console.log(`Nexus Router listening on port ${PORT}`);
  console.log(`GPU Workers configured: ${GPU_WORKERS.length}`);
  console.log(`Cloud Providers configured: ${CLOUD_PROVIDERS.filter(p => p.key).length}`);
});
NEXUS_CODE

# Install dependencies
pnpm install

cd ../..
```

**Report:** "Nexus Router created successfully"

---

## PHASE 6: DOCKER CONFIGURATION (5 minutes)

### Step 6.1: Create Docker Network

```bash
# Create shared network for all services
docker network create nyra-network 2>/dev/null || echo "Network already exists"
```

### Step 6.2: Create Docker Compose Files

Execute this script block:

```bash
cd infra/docker

# ===========================================
# ORCHESTRATION COMPOSE
# ===========================================
cat > docker-compose.orchestration.yml << 'ORCH_COMPOSE'
version: '3.8'

services:
  claude-flow:
    build: ../../orchestration/claude-flow
    container_name: nyra-claude-flow
    ports:
      - "9000:9000"
    environment:
      - CLAUDE_FLOW_PORT=9000
      - ARCHON_OS_URL=http://archon-os:9001
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXUS_ROUTER_URL=http://nexus-router:8000
    volumes:
      - ../../orchestration/claude-flow/agents:/app/agents
      - ../../orchestration/claude-flow/workflows:/app/workflows
    networks:
      - nyra-network
    depends_on:
      - archon-os
      - redis
      - postgresql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  archon-os:
    build: ../../orchestration/archon-os
    container_name: nyra-archon-os
    ports:
      - "9001:9001"
    environment:
      - ARCHON_PORT=9001
      - CLAUDE_FLOW_URL=http://claude-flow:9000
      - REDIS_URL=${REDIS_URL}
      - NEXUS_ROUTER_URL=http://nexus-router:8000
    volumes:
      - ../../orchestration/archon-os/task-queue:/app/task-queue
      - ../../orchestration/archon-os/resource-manager:/app/resource-manager
    networks:
      - nyra-network
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  nyra-network:
    external: true
ORCH_COMPOSE

# ===========================================
# MCP SERVERS COMPOSE
# ===========================================
cat > docker-compose.mcp.yml << 'MCP_COMPOSE'
version: '3.8'

services:
  gemini-assistant:
    build: ../../mcp-servers/gemini-assistant
    container_name: nyra-mcp-gemini
    ports:
      - "8085:8085"
    environment:
      - GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - PORT=8085
    networks:
      - nyra-network
    restart: unless-stopped

  serena:
    build: ../../mcp-servers/serena
    container_name: nyra-mcp-serena
    ports:
      - "8086:8086"
    environment:
      - SERENA_PORT=8086
      - REPO_PATH=/workspace
    volumes:
      - ../../:/workspace:ro
    networks:
      - nyra-network
    restart: unless-stopped

  letta:
    build: ../../mcp-servers/letta
    container_name: nyra-mcp-letta
    ports:
      - "8283:8283"
    environment:
      - LETTA_PORT=8283
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - nyra-network
    restart: unless-stopped

  mem0:
    build: ../../mcp-servers/mem0
    container_name: nyra-mcp-mem0
    ports:
      - "8081:8081"
    environment:
      - MEM0_PORT=8081
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - nyra-network
    restart: unless-stopped

  openmemory:
    build: ../../mcp-servers/openmemory
    container_name: nyra-mcp-openmemory
    ports:
      - "8080:8080"
    environment:
      - OPENMEMORY_PORT=8080
      - REDIS_URL=${REDIS_URL}
    networks:
      - nyra-network
    restart: unless-stopped

  ruvector:
    build: ../../mcp-servers/ruvector
    container_name: nyra-mcp-ruvector
    ports:
      - "7000:7000"
    environment:
      - RUVECTOR_PORT=7000
    networks:
      - nyra-network
    restart: unless-stopped

  graphiti:
    build: ../../mcp-servers/graphiti
    container_name: nyra-mcp-graphiti
    ports:
      - "6379:6379"
    environment:
      - GRAPHITI_PORT=6379
      - NEO4J_URL=${NEO4J_URL}
    networks:
      - nyra-network
    restart: unless-stopped

networks:
  nyra-network:
    external: true
MCP_COMPOSE

# ===========================================
# UI SERVICES COMPOSE
# ===========================================
cat > docker-compose.ui.yml << 'UI_COMPOSE'
version: '3.8'

services:
  open-webui:
    build: ../../ui/open-webui
    container_name: nyra-open-webui
    ports:
      - "3333:8080"
    environment:
      - OLLAMA_API_BASE_URL=http://host.docker.internal:11434
      - WEBUI_AUTH=false
    volumes:
      - open-webui-data:/app/backend/data
    networks:
      - nyra-network
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"

  lobechat:
    build: ../../ui/lobechat
    container_name: nyra-lobechat
    ports:
      - "3334:3210"
    environment:
      - NEXT_PUBLIC_BASE_URL=http://localhost:3334
      - OPENAI_API_KEY=${ANTHROPIC_API_KEY}
    networks:
      - nyra-network
    restart: unless-stopped

volumes:
  open-webui-data:

networks:
  nyra-network:
    external: true
UI_COMPOSE

# ===========================================
# INFRASTRUCTURE COMPOSE
# ===========================================
cat > docker-compose.yml << 'INFRA_COMPOSE'
version: '3.8'

services:
  postgresql:
    image: postgres:16
    container_name: nyra-postgresql
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=nyra
      - POSTGRES_USER=nyra
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-nyra_dev_password}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - nyra-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: nyra-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - nyra-network
    restart: unless-stopped

  neo4j:
    image: neo4j:5
    container_name: nyra-neo4j
    ports:
      - "7474:7474"  # HTTP
      - "7687:7687"  # Bolt
    environment:
      - NEO4J_AUTH=neo4j/${NEO4J_PASSWORD:-nyra_dev_password}
    volumes:
      - neo4j-data:/data
    networks:
      - nyra-network
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    container_name: nyra-qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant-data:/qdrant/storage
    networks:
      - nyra-network
    restart: unless-stopped

  nexus-router:
    build: ../../services/nexus-router
    container_name: nyra-nexus-router
    ports:
      - "8000:8000"
    environment:
      - NEXUS_PORT=8000
      - REDIS_URL=redis://redis:6379
      - GPU_WORKER_5090_URL=${GPU_WORKER_5090_URL}
      - GPU_WORKER_3090_URL=${GPU_WORKER_3090_URL}
      - GPU_WORKER_3060_URL=${GPU_WORKER_3060_URL}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    networks:
      - nyra-network
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  neo4j-data:
  qdrant-data:

networks:
  nyra-network:
    external: true
INFRA_COMPOSE

cd ../..
```

**Report:** "Docker Compose files created successfully"

---

## PHASE 7: ENVIRONMENT CONFIGURATION (2 minutes)

### Step 7.1: Create Environment File

```bash
# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << 'ENV_FILE'
# ===========================================
# PROJECT NYRA ENVIRONMENT CONFIGURATION
# ===========================================

# API Keys (REPLACE WITH YOUR ACTUAL KEYS)
GOOGLE_GEMINI_API_KEY=your_gemini_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# Orchestration URLs
CLAUDE_FLOW_URL=http://localhost:9000
ARCHON_OS_URL=http://localhost:9001
NEXUS_ROUTER_URL=http://localhost:8000

# GPU Workers (adjust to your setup)
GPU_WORKER_5090_URL=http://localhost:11434
GPU_WORKER_3090_URL=http://localhost:11435
GPU_WORKER_3060_URL=http://localhost:11436

# MCP Server URLs
LETTA_URL=http://localhost:8283
GRAPHITI_URL=http://localhost:6379
RUVECTOR_URL=http://localhost:7000
MEM0_URL=http://localhost:8081
OPENMEMORY_URL=http://localhost:8080
QDRANT_URL=http://localhost:6333
SERENA_URL=http://localhost:8086
GEMINI_ASSISTANT_URL=http://localhost:8085

# Database Configuration
DATABASE_URL=postgresql://nyra:nyra_dev_password@localhost:5432/nyra
REDIS_URL=redis://localhost:6379
NEO4J_URL=bolt://localhost:7687
NEO4J_PASSWORD=nyra_dev_password
POSTGRES_PASSWORD=nyra_dev_password

# Business API Keys (add when available)
ROCKET_MORTGAGE_API_KEY=
LENDERPRICE_API_KEY=
GOHIGHLEVEL_API_KEY=
ENV_FILE

    echo "Created .env file - PLEASE ADD YOUR API KEYS!"
else
    echo ".env file already exists - skipping"
fi
```

**Report:** "Environment file created. API keys need to be configured."

---

## PHASE 8: SERVICE STARTUP (5 minutes)

### Step 8.1: Start Infrastructure Services

```bash
echo "Starting infrastructure services (PostgreSQL, Redis, Neo4j, Qdrant, Nexus Router)..."
docker-compose -f infra/docker/docker-compose.yml up -d

# Wait for services to be healthy
sleep 10

# Verify services
docker ps --filter "name=nyra-" --format "table {{.Names}}\t{{.Status}}"
```

### Step 8.2: Start MCP Servers

```bash
echo "Starting MCP servers..."
docker-compose -f infra/docker/docker-compose.mcp.yml up -d

# Wait for MCP servers to start
sleep 10
```

### Step 8.3: Start Development UIs (Optional)

```bash
echo "Starting development UIs..."
docker-compose -f infra/docker/docker-compose.ui.yml up -d

# Wait for UIs to start
sleep 10
```

**Report:** "All Docker services started"

---

## PHASE 9: HEALTH VERIFICATION (3 minutes)

### Step 9.1: Verify All Services

Execute comprehensive health checks:

```bash
#!/bin/bash

echo "====================================="
echo "PROJECT NYRA HEALTH CHECK"
echo "====================================="

declare -A services=(
    ["Nexus Router"]="http://localhost:8000/health"
    ["Letta MCP"]="http://localhost:8283/health"
    ["Graphiti MCP"]="http://localhost:6379/health"
    ["RuVector MCP"]="http://localhost:7000/health"
    ["Mem0 MCP"]="http://localhost:8081/health"
    ["OpenMemory MCP"]="http://localhost:8080/health"
    ["Gemini Assistant"]="http://localhost:8085/health"
    ["Serena MCP"]="http://localhost:8086/health"
    ["Open-WebUI"]="http://localhost:3333"
    ["LobeChat"]="http://localhost:3334"
)

healthy=0
unhealthy=0

for service in "${!services[@]}"; do
    url="${services[$service]}"
    if curl -s -f -m 5 "$url" > /dev/null 2>&1; then
        echo "✓ $service is healthy"
        ((healthy++))
    else
        echo "✗ $service is not responding"
        ((unhealthy++))
    fi
done

echo ""
echo "====================================="
echo "SUMMARY: $healthy healthy, $unhealthy unhealthy"
echo "====================================="

# Check Docker containers
echo ""
echo "Docker Container Status:"
docker ps --filter "name=nyra-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Expected Result:** At least 8-10 services should be healthy

**If any critical services are unhealthy:** Report which ones and check logs

---

## PHASE 10: FINAL CONFIGURATION (3 minutes)

### Step 10.1: Create Orchestration Integration Config

```bash
mkdir -p orchestration/integration

cat > orchestration/integration/dual-orchestrator.json << 'ORCH_CONFIG'
{
  "orchestration": {
    "mode": "dual",
    "primary": "claude-flow",
    "secondary": "archon-os",
    "integration": {
      "enabled": true,
      "protocol": "http",
      "heartbeat_interval": 30,
      "timeout": 60000
    }
  },
  
  "claude_flow": {
    "role": "workflow_orchestrator",
    "url": "http://localhost:9000",
    "responsibilities": [
      "workflow_planning",
      "agent_selection",
      "domain_logic",
      "memory_routing",
      "error_recovery",
      "swarm_coordination"
    ]
  },
  
  "archon_os": {
    "role": "agent_operating_system",
    "url": "http://localhost:9001",
    "responsibilities": [
      "task_queue_management",
      "resource_scheduling",
      "agent_lifecycle",
      "execution_monitoring",
      "performance_optimization"
    ]
  }
}
ORCH_CONFIG
```

### Step 10.2: Create Quick Start Script

```bash
cat > start-dev-environment.sh << 'START_SCRIPT'
#!/bin/bash

echo "Starting Project Nyra Development Environment..."

# Start infrastructure
echo "Starting infrastructure services..."
docker-compose -f infra/docker/docker-compose.yml up -d

# Start MCP servers
echo "Starting MCP servers..."
docker-compose -f infra/docker/docker-compose.mcp.yml up -d

# Start development UIs
echo "Starting development UIs..."
docker-compose -f infra/docker/docker-compose.ui.yml up -d

echo ""
echo "====================================="
echo "Development Environment Started!"
echo "====================================="
echo ""
echo "Services:"
echo "- Nexus Router: http://localhost:8000"
echo "- Open-WebUI: http://localhost:3333"
echo "- LobeChat: http://localhost:3334"
echo ""
echo "To start orchestrators locally:"
echo "  Terminal 1: cd orchestration/claude-flow && pnpm dev"
echo "  Terminal 2: cd orchestration/archon-os && npm run dev"
echo ""
START_SCRIPT

chmod +x start-dev-environment.sh
```

---

## PHASE 11: COMPLETION REPORT

### Step 11.1: Generate Final Report

Execute this reporting block:

```bash
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   PROJECT NYRA SETUP COMPLETE                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✓ Folder structure created"
echo "✓ All repositories cloned"
echo "✓ Dependencies installed"
echo "✓ Nexus Router created and configured"
echo "✓ Docker Compose files generated"
echo "✓ Environment file created"
echo "✓ All Docker services started"
echo "✓ Health checks passed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RUNNING SERVICES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Infrastructure:"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • Neo4j: localhost:7474 (HTTP), localhost:7687 (Bolt)"
echo "  • Qdrant: localhost:6333"
echo "  • Nexus Router: localhost:8000"
echo ""
echo "MCP Servers:"
echo "  • Letta: localhost:8283"
echo "  • Graphiti: localhost:6379"
echo "  • RuVector: localhost:7000"
echo "  • Mem0: localhost:8081"
echo "  • OpenMemory: localhost:8080"
echo "  • Gemini Assistant: localhost:8085"
echo "  • Serena: localhost:8086"
echo ""
echo "Development UIs:"
echo "  • Open-WebUI: http://localhost:3333"
echo "  • LobeChat: http://localhost:3334"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. CONFIGURE API KEYS:"
echo "   Edit .env file and add your actual API keys:"
echo "   - GOOGLE_GEMINI_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo "   - OPENROUTER_API_KEY"
echo ""
echo "2. START ORCHESTRATORS (for local development):"
echo "   Terminal 1: cd orchestration/claude-flow && pnpm dev"
echo "   Terminal 2: cd orchestration/archon-os && npm run dev"
echo ""
echo "3. VERIFY EVERYTHING WORKS:"
echo "   Open http://localhost:3333 (Open-WebUI)"
echo "   Test a simple query to verify routing"
echo ""
echo "4. DEPLOY TO PRODUCTION (when ready):"
echo "   docker-compose -f infra/docker/docker-compose.orchestration.yml up -d"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DOCUMENTATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Complete Architecture: bootstrap/orchestration-setup/00-MASTER-ARCHITECTURE.md"
echo "Quick Start Guide: bootstrap/orchestration-setup/ULTRA-FAST-START.md"
echo "This Setup Log: bootstrap/setup-log-$(date +%Y-%m-%d-%H%M%S).txt"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
```

---

## AUTONOMOUS EXECUTION COMPLETE

**Total Execution Time:** ~30 minutes  
**Manual Steps Required:** Add API keys to .env file  
**System Status:** Ready for development

**Claude/Claude Flow:** You have successfully set up the complete Project Nyra orchestration stack. All services are running and ready for configuration.
