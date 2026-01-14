# 🚀 Project Nyra - Ultimate Batch Initialization Guide

## 📦 What You've Received

This package contains everything needed to bootstrap Project Nyra with all memory systems, GPU workers, and complete directory-specific configurations:

### **Core Configuration Files**

1. **PROJECT-NYRA-ULTIMATE-BATCH-CONFIG.json** (Master Configuration)
   - Complete batch initialization for all 20+ modules
   - Directory-specific templates and settings
   - Memory system integration for each component
   - Post-initialization tasks and validation

2. **PROJECT-NYRA-ULTIMATE-SETTINGS.json** (Enhanced .claude/settings.json)
   - All 6 memory systems configured (RuVector, Letta, Graphiti, FalkorDB, Mem0, OpenMemory)
   - Advanced hooks with checkpointing and GitHub integration
   - Performance optimization and caching
   - Neural learning models
   - MCP server configurations

3. **PROJECT-NYRA-ULTIMATE.env** (Complete Environment Template)
   - All memory system environment variables
   - GPU worker configurations
   - Service integrations (Dify, n8n, TwentyCRM, etc.)
   - Mortgage API credentials
   - Communication services (Twilio, SendGrid)

4. **PROJECT-NYRA-ROOT-CLAUDE.md** (Root Directory Template)
   - Comprehensive mortgage broker domain knowledge
   - Memory system usage guide
   - 54 available agents documentation
   - SPARC methodology integration
   - Swarm orchestration patterns

---

## 🎯 STEP-BY-STEP SETUP GUIDE

### **Phase 1: Prepare Your Environment (30 minutes)**

#### 1. Copy Files to Project Root

```bash
# Navigate to your project
cd C:\Dev\Projects\Repos\Project-Nyra

# Copy the batch config
cp PATH_TO_DOWNLOADS\PROJECT-NYRA-ULTIMATE-BATCH-CONFIG.json ./batch-config-ultimate.json

# Copy the enhanced settings
cp PATH_TO_DOWNLOADS\PROJECT-NYRA-ULTIMATE-SETTINGS.json ./.claude/settings.json

# Copy the environment template
cp PATH_TO_DOWNLOADS\PROJECT-NYRA-ULTIMATE.env ./.env

# Copy root CLAUDE.md
cp PATH_TO_DOWNLOADS\PROJECT-NYRA-ROOT-CLAUDE.md ./CLAUDE.md
```

#### 2. Configure Environment Variables

Open `.env` and fill in your actual credentials:

**Priority Variables (Must Configure):**
```bash
# Infisical (Secrets Management)
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_TOKEN=your-actual-token

# Anthropic (Primary LLM)
ANTHROPIC_API_KEY=sk-ant-your-actual-key

# OpenRouter (Fallback LLM)
OPENROUTER_API_KEY=sk-or-your-actual-key

# OpenAI (Embeddings)
OPENAI_API_KEY=sk-your-actual-key

# Mortgage APIs
ROCKET_MORTGAGE_API_KEY=your-rocket-key
LENDERPRICE_API_KEY=your-lenderprice-key
OPTIMAL_BLUE_API_KEY=your-optimal-blue-key

# Communication
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
SENDGRID_API_KEY=your-sendgrid-key

# GitHub (for automated releases)
GITHUB_TOKEN=ghp_your-github-token
```

**GPU Worker URLs (Update if different):**
```bash
GPU_WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
GPU_WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434
GPU_WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434
```

#### 3. Update Database Passwords

Generate secure passwords and update:
```bash
POSTGRES_PASSWORD=your-secure-postgres-password
LETTA_POSTGRES_PASSWORD=your-letta-password
TWENTY_CRM_POSTGRES_PASSWORD=your-twenty-password
N8N_POSTGRES_PASSWORD=your-n8n-password
```

---

### **Phase 2: Start Memory Systems (1 hour)**

#### 1. Start Docker Infrastructure

```bash
# Create memory-specific docker-compose if not exists
# This should include: PostgreSQL, Redis, Neo4j, Qdrant, FalkorDB

docker-compose -f docker-compose.memory.yml up -d

# Verify all services are running
docker-compose -f docker-compose.memory.yml ps
```

Expected output:
```
NAME                STATUS    PORTS
postgres            Up        0.0.0.0:5432->5432/tcp
redis               Up        0.0.0.0:6379->6379/tcp
neo4j               Up        0.0.0.0:7474->7474/tcp, 0.0.0.0:7687->7687/tcp
qdrant              Up        0.0.0.0:6333->6333/tcp
falkordb            Up        0.0.0.0:6379->6379/tcp
```

#### 2. Initialize Individual Memory Systems

**RuVector (Distributed Vector Search):**
```bash
# Install RuVector
cargo install ruvector

# Or via NPM
npm install -g ruvector

# Start RuVector server
ruvector server --mode distributed --port 7000 &

# Verify
curl http://localhost:7000/health
```

**Letta (Agent Memory):**
```bash
# Install Letta
pip install letta --break-system-packages

# Start Letta server
letta server --port 8283 &

# Verify
curl http://localhost:8283/health
```

**Graphiti (Knowledge Graphs on FalkorDB):**
```bash
# Install Graphiti
pip install graphiti-core --break-system-packages

# Configure to use FalkorDB
export GRAPHITI_BACKEND=falkordb
export GRAPHITI_URL=redis://localhost:6379

# Initialize graph
python -m graphiti.init --graph nyra_knowledge

# Verify
redis-cli -p 6379 GRAPH.LIST
```

**Mem0:**
```bash
# Install Mem0
pip install mem0ai --break-system-packages

# Start Mem0 server
mem0 server --port 8081 &

# Verify
curl http://localhost:8081/health
```

**OpenMemory:**
```bash
# Install OpenMemory
npm install -g openmemory

# Start OpenMemory server
openmemory server --port 8080 &

# Verify
curl http://localhost:8080/health
```

---

### **Phase 3: Validate Memory Systems (15 minutes)**

Run comprehensive health checks:

```bash
# Create a validation script
cat > validate-memory-systems.sh << 'EOF'
#!/bin/bash

echo "🔍 Validating Memory Systems..."

# RuVector
if curl -f http://localhost:7000/health > /dev/null 2>&1; then
    echo "✅ RuVector: HEALTHY"
else
    echo "❌ RuVector: DOWN"
fi

# Letta
if curl -f http://localhost:8283/health > /dev/null 2>&1; then
    echo "✅ Letta: HEALTHY"
else
    echo "❌ Letta: DOWN"
fi

# FalkorDB (for Graphiti)
if redis-cli -p 6379 PING | grep -q PONG; then
    echo "✅ FalkorDB: HEALTHY"
else
    echo "❌ FalkorDB: DOWN"
fi

# Mem0
if curl -f http://localhost:8081/health > /dev/null 2>&1; then
    echo "✅ Mem0: HEALTHY"
else
    echo "❌ Mem0: DOWN"
fi

# OpenMemory
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ OpenMemory: HEALTHY"
else
    echo "❌ OpenMemory: DOWN"
fi

# Qdrant
if curl -f http://localhost:6333/health > /dev/null 2>&1; then
    echo "✅ Qdrant: HEALTHY"
else
    echo "❌ Qdrant: DOWN"
fi

echo ""
echo "✅ All memory systems validated!"
EOF

chmod +x validate-memory-systems.sh
./validate-memory-systems.sh
```

---

### **Phase 4: Run Batch Initialization (2-3 hours)**

Now you're ready to initialize all Project Nyra modules!

#### **Option A: Full Batch Initialization (Recommended)**

```bash
# Initialize ALL modules with one command
npx claude-flow@alpha init --config batch-config-ultimate.json

# This will create:
# - 20+ directory-specific CLAUDE.md files
# - Memory system integrations for each module
# - MCP server configurations
# - Workflow templates
# - Test scaffolds
# - CI/CD configurations
```

#### **Option B: Progressive Initialization (Safer for Testing)**

Start with critical modules first:

```bash
# 1. Initialize root
npx claude-flow@alpha init \
  --template monorepo-root \
  --sparc \
  --memory-systems ruvector,letta,graphiti,mem0,openmemory

# 2. Initialize apps
npx claude-flow@alpha init \
  --path apps/webapp \
  --template react-app \
  --sparc

npx claude-flow@alpha init \
  --path apps/mortgage-assistant \
  --template react-app \
  --sparc

# 3. Initialize services
npx claude-flow@alpha init \
  --path services/quote-api \
  --template web-api \
  --sparc

npx claude-flow@alpha init \
  --path services/campaign-engine \
  --template microservice \
  --sparc

# 4. Initialize memory integration
npx claude-flow@alpha init \
  --path memory \
  --template memory-system \
  --sparc

# Continue for other modules...
```

#### **Option C: Custom Subset**

If you only want specific modules:

```bash
# Create custom config
cat > batch-config-custom.json << 'EOF'
{
  "baseOptions": {
    "sparc": true,
    "parallel": true,
    "maxConcurrency": 5,
    "memoryIntegration": {
      "ruvector": true,
      "letta": true,
      "graphiti": true
    }
  },
  "projectConfigs": {
    "_ROOT_PROJECT": { /* copy from ultimate config */ },
    "_APPS_WEBAPP": { /* copy from ultimate config */ },
    "_SERVICES_QUOTE_API": { /* copy from ultimate config */ }
  }
}
EOF

# Run batch init with custom config
npx claude-flow@alpha init --config batch-config-custom.json
```

---

### **Phase 5: Post-Initialization Setup (1 hour)**

After batch initialization completes:

#### 1. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Or if using npm
npm install --workspaces
```

#### 2. Initialize Databases

```bash
# Run migrations for all services
pnpm run db:migrate

# Or individually
cd services/quote-api && pnpm run migrate
cd ../campaign-engine && pnpm run migrate
cd ../../apps/webapp && pnpm run migrate
```

#### 3. Seed Test Data

```bash
# Create test borrower in TwentyCRM
pnpm run seed:test-data

# This should create:
# - 1 test borrower
# - 1 test loan application
# - Sample documents
# - Test drip campaign
```

#### 4. Start Development Servers

```bash
# Start all services in parallel
pnpm run dev:all

# Or start individually
cd apps/webapp && pnpm dev &
cd services/quote-api && pnpm dev &
cd services/campaign-engine && pnpm dev &
```

---

### **Phase 6: Verify End-to-End Flow (30 minutes)**

Test the complete mortgage workflow:

#### 1. Test Lead Capture

```bash
# Simulate webhook from LendingTree
curl -X POST http://localhost:3000/api/webhooks/lendingtree \
  -H "Content-Type: application/json" \
  -d '{
    "borrower": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+15551234567",
      "loanAmount": 350000,
      "propertyValue": 400000,
      "creditScore": 720
    }
  }'
```

#### 2. Test Quote Generation

```bash
# Generate mortgage quote
npx claude-flow mortgage quote \
  --borrower-id test-borrower-123 \
  --loan-type conventional \
  --loan-amount 350000 \
  --property-value 400000 \
  --credit-score 720
```

#### 3. Test Memory Systems

```bash
# Store quote in RuVector
npx claude-flow memory store \
  --system ruvector \
  --content "Conventional loan quote: 6.75% APR, $350k, 720 FICO" \
  --metadata '{"borrower_id": "test-123", "loan_amount": 350000}'

# Update Letta agent memory
npx claude-flow memory update \
  --system letta \
  --agent-id borrower-test-123 \
  --memory-type core \
  --content "Last quote: $350k at 6.75% APR"

# Track in Graphiti
npx claude-flow memory track \
  --system graphiti \
  --entity-type MortgageQuote \
  --entity-id quote-456 \
  --relationship "QUOTED_FOR:borrower-test-123"
```

#### 4. Test Drip Campaign

```bash
# Start automated drip campaign
npx claude-flow campaign start \
  --borrower-id test-123 \
  --sequence pre-approval \
  --channels email,sms
```

#### 5. Test AI Chatbot

```bash
# Query mortgage assistant
npx claude-flow chat \
  --agent mortgage-assistant \
  --message "What documents do I need for a conventional loan?"
```

---

## 🛠️ TROUBLESHOOTING

### **Memory System Not Starting**

**RuVector fails to start:**
```bash
# Check if port is already in use
lsof -i :7000

# Kill process if needed
kill -9 $(lsof -t -i :7000)

# Restart RuVector
ruvector server --mode distributed --port 7000
```

**Letta connection errors:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Verify database exists
psql -U postgres -l | grep letta

# Recreate database if needed
psql -U postgres -c "DROP DATABASE IF EXISTS letta;"
psql -U postgres -c "CREATE DATABASE letta;"

# Restart Letta
letta server --port 8283
```

**Graphiti/FalkorDB issues:**
```bash
# Verify FalkorDB is running
redis-cli -p 6379 PING

# List graphs
redis-cli -p 6379 GRAPH.LIST

# Recreate graph
redis-cli -p 6379 GRAPH.DELETE nyra_knowledge
python -m graphiti.init --graph nyra_knowledge
```

### **Batch Initialization Errors**

**"Template not found":**
```bash
# Update claude-flow to latest
npm uninstall -g claude-flow
npm install -g claude-flow@alpha

# Clear cache
npx claude-flow cache clear

# Retry
npx claude-flow@alpha init --config batch-config-ultimate.json
```

**"Permission denied":**
```bash
# Ensure directories are writable
chmod -R 755 apps/ services/ mcp-servers/

# Run with elevated permissions if on Windows
# (Run PowerShell as Administrator)
```

### **GPU Workers Not Accessible**

```bash
# Check Tailscale status
tailscale status

# Ping workers
ping worker-5090.tail-net.ts.net
ping worker-3090.tail-net.ts.net
ping worker-3060.tail-net.ts.net

# Check Ollama on workers
curl http://worker-5090.tail-net.ts.net:11434/v1/models

# Restart Tailscale if needed
Restart-Service Tailscale  # Windows
sudo systemctl restart tailscaled  # Linux
```

---

## 📊 EXPECTED RESULTS

After successful initialization, you should have:

### **File Structure**
```
Project-Nyra/
├── .claude/
│   ├── settings.json (enhanced with all memory systems)
│   ├── agents/ (54 agent definitions)
│   ├── commands/ (SPARC slash commands)
│   └── checkpoints/ (auto-generated)
│
├── apps/
│   ├── webapp/
│   │   └── CLAUDE.md (Next.js-specific)
│   ├── mortgage-assistant/
│   │   └── CLAUDE.md (AI chatbot-specific)
│   └── [7 more apps with CLAUDE.md files]
│
├── services/
│   ├── quote-api/
│   │   └── CLAUDE.md (FastAPI-specific)
│   ├── campaign-engine/
│   │   └── CLAUDE.md (NestJS-specific)
│   └── [3 more services with CLAUDE.md files]
│
├── mcp-servers/
│   ├── letta/
│   │   └── CLAUDE.md (Letta MCP)
│   ├── graphiti/
│   │   └── CLAUDE.md (Graphiti MCP)
│   └── [3 more MCP servers]
│
├── memory/
│   ├── ruvector/ (vector indices)
│   ├── letta/ (agent states)
│   ├── graphiti/ (knowledge graphs)
│   └── CLAUDE.md (memory integration guide)
│
├── .env (complete environment configuration)
├── CLAUDE.md (root - mortgage broker domain)
└── docker-compose.memory.yml (all memory services)
```

### **Running Services**
- ✅ RuVector (port 7000)
- ✅ Letta (port 8283)
- ✅ FalkorDB (port 6379)
- ✅ Mem0 (port 8081)
- ✅ OpenMemory (port 8080)
- ✅ Qdrant (port 6333)
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ Dify (ports 3000, 5001)
- ✅ n8n (port 5678)
- ✅ TwentyCRM (port 3001)

### **Available Commands**

```bash
# Memory operations
npx claude-flow memory search --system ruvector --query "..."
npx claude-flow memory recall --system letta --agent-id ...
npx claude-flow memory track --system graphiti --entity-id ...
npx claude-flow memory sync --all

# Mortgage workflows
npx claude-flow mortgage quote --borrower-id ...
npx claude-flow documents process --files ...
npx claude-flow campaign start --sequence ...

# Agent coordination
npx claude-flow swarm execute --task ... --agents ...
npx claude-flow swarm status
npx claude-flow swarm monitor

# Development
pnpm dev:all
pnpm test:all
pnpm build:all
```

---

## 🎓 LEARNING RESOURCES

### **Understanding Memory Systems**

1. **RuVector** - Think of it as "Google for your code and data"
   - Instant similarity search across millions of vectors
   - Use for: Finding similar quotes, matching documents, code search

2. **Letta** - Think of it as "RAM for AI agents"
   - Core memory (always loaded) vs Archival memory (searchable)
   - Use for: Conversation context, agent personality, task state

3. **Graphiti** - Think of it as "Git for knowledge"
   - Tracks how facts evolve over time
   - Use for: Loan status progression, borrower relationship history

4. **Mem0** - Think of it as "User profile across all apps"
   - Remembers preferences, behaviors, patterns
   - Use for: Personalized recommendations, smart defaults

5. **OpenMemory** - Think of it as "Shared team wiki for agents"
   - Collaborative memory between multiple agents
   - Use for: Cross-agent knowledge sharing, team coordination

### **Next Steps**

1. **Read the root CLAUDE.md** - Understand the domain and architecture
2. **Explore directory-specific CLAUDE.md files** - Learn module details
3. **Review .claude/agents/** - Understand available agents
4. **Test memory operations** - Get hands-on with each system
5. **Run sample workflows** - See the complete flow end-to-end

---

## 💡 PRO TIPS

1. **Start with one memory system at a time** - Don't try to use all 6 simultaneously
   - Week 1: RuVector for fast search
   - Week 2: Add Letta for agent memory
   - Week 3: Add Graphiti for temporal tracking

2. **Use local LLMs by default** - Save money
   - 90% of tasks can run on your GPU workers
   - Reserve Claude Sonnet 4 for compliance-critical operations

3. **Batch operations whenever possible** - Remember the Golden Rule
   - One message with multiple commands = 300% faster

4. **Monitor memory system performance**
   - RuVector should respond in <50ms
   - Letta should respond in <100ms
   - Graphiti queries should complete in <200ms

5. **Backup memory systems regularly**
   ```bash
   npx claude-flow memory backup --all-systems --destination ./backups/
   ```

---

## 🆘 GETTING HELP

### **Quick Diagnostics**

```bash
# Run full system diagnostics
npx claude-flow diagnostics --all

# This checks:
# - Memory systems health
# - GPU workers connectivity
# - Database connections
# - API credentials
# - Docker services
```

### **Support Channels**

1. **Claude.ai** - Ask me directly in this conversation
2. **Project Documentation** - Check `/docs/` directory
3. **GitHub Issues** - Create issue in your repo
4. **Memory System Logs**:
   ```bash
   # RuVector logs
   tail -f ~/.ruvector/logs/server.log
   
   # Letta logs
   tail -f ~/.letta/logs/server.log
   
   # Docker logs
   docker-compose logs -f
   ```

---

**You're now ready to build the most advanced mortgage automation platform! 🚀**

Remember: The goal is to **close more deals with less manual work**. Every feature should directly contribute to that goal.

**Start coding, ship features, close deals! 💪**
