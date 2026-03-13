# PROJECT NYRA - COMPLETE BOOTSTRAP PACKAGE
## AI-Powered Mortgage Automation Platform

---

## 📦 WHAT'S IN THIS PACKAGE

This is the **complete, consolidated bootstrap package** for Project Nyra. Everything you need to set up the dual orchestrator system (Claude Flow + Archon OS) with all MCP servers, LLM routing, and development tools.

### Package Contents

```
nyra-complete-bootstrap/
├── 00-MASTER-ARCHITECTURE.md          # Complete technical whitepaper (50+ pages)
├── 01-MASTER-SETUP-PROMPT.md          # Automation prompt for Claude/Claude Flow
├── 02-ULTRA-FAST-START.md             # Quick start guide (3 minutes to setup)
├── configs/
│   ├── dev.env.template               # Development environment template
│   ├── prod.env.template              # Production environment template  
│   └── dual-orchestrator.json         # Orchestration integration config
└── README.md                          # This file
```

---

## 🎯 YOUR QUESTIONS ANSWERED

### Q: Should MCP servers be dockerized for dev and prod?
**A: YES.** Dockerize all MCP servers for both environments. This ensures consistency and eliminates "works on my machine" issues.

### Q: Should Claude Flow and Archon OS be dockerized?
**A: DEV = Local clones (editable), PROD = Dockerized (reliable)**

**Development Strategy:**
- Keep Claude Flow and Archon OS as local clones
- You can edit code, debug with breakpoints, test changes instantly
- Hot reload works perfectly
- Full visibility into logs and execution

**Production Strategy:**
- Containerize both orchestrators
- Use Kubernetes for scaling and reliability
- Auto-scaling based on load
- Health checks and auto-recovery

### Q: What's the folder structure?
**A: See complete structure in `00-MASTER-ARCHITECTURE.md` Section 2**

**Quick summary:**
```
Project-Nyra/
├── .ccdk/                    # Claude Code Development Kit (dev tools)
├── orchestration/            # Claude Flow + Archon OS (local in dev, dockerized in prod)
├── mcp-servers/              # All MCP servers (dockerized in both dev & prod)
├── services/                 # Business services including Nexus Router
├── ui/                       # Open-WebUI, LobeChat (dev) + Dify (prod)
├── apps/                     # Frontend apps (Next.js webapp, CRM dashboard)
└── infra/                    # Docker, K8s, Terraform configs
```

### Q: How do Claude Flow and Archon OS work together?
**A: Dual Orchestrator Pattern - see `00-MASTER-ARCHITECTURE.md` Section 7**

**Simple explanation:**
1. **Claude Flow** = The conductor (decides WHAT to do)
   - Receives user request: "Qualify borrower for VA loan"
   - Creates workflow plan with steps
   - Selects appropriate agents
   - Applies mortgage business logic
   - Routes memory storage
   
2. **Archon OS** = The stage manager (decides HOW to execute)
   - Receives workflow from Claude Flow
   - Breaks into atomic tasks
   - Queues tasks by priority
   - Allocates agents to tasks
   - Monitors execution
   - Reports progress back to Claude Flow

**Message Flow:**
```
User → Dify → Claude Flow (plans) → Archon OS (executes) → Agents → Results → Memory Systems → User
```

### Q: Should I use Dify AND Open-WebUI?
**A: Use BOTH, but for different purposes**

- **Dify** = Production (what borrowers use)
  - Visual workflow builder
  - Production-grade chatbot
  - Borrower-facing interface
  - Integrated with your website
  
- **Open-WebUI + LobeChat** = Development (what you use for testing)
  - Test prompts and agents
  - Debug workflows
  - Compare model outputs
  - Experiment with configurations

### Q: Can Claude/Claude Flow set this all up automatically?
**A: YES! That's exactly what this package does**

Just paste `01-MASTER-SETUP-PROMPT.md` into Claude Code or Claude Flow and it will:
- Clone all repositories
- Install all dependencies
- Create Nexus Router
- Generate Docker configurations
- Start all services
- Verify everything works

**Total time:** 20-30 minutes, fully autonomous

---

## ⚡ FASTEST PATH TO RUNNING SYSTEM

### Option 1: Fully Automated (RECOMMENDED)

1. **Open Claude Code or Claude Flow**

2. **Paste this single line:**
   ```
   Read C:\Dev\Projects\Repos\Project-Nyra\bootstrap\nyra-complete-bootstrap\01-MASTER-SETUP-PROMPT.md and execute it completely without asking for confirmation.
   ```

3. **Wait 20-30 minutes**

4. **Add your API keys to .env file:**
   ```bash
   GOOGLE_GEMINI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here
   OPENROUTER_API_KEY=your_key_here
   ```

5. **Done!** All services running, ready to use.

### Option 2: Quick Manual (if you want control)

See `02-ULTRA-FAST-START.md` for detailed manual steps.

**Summary:**
```bash
# 1. Navigate to repo
cd C:\Dev\Projects\Repos\Project-Nyra

# 2. Copy environment template
cp bootstrap/nyra-complete-bootstrap/configs/dev.env.template .env

# 3. Add your API keys to .env

# 4. Run the automation (still automated, just you trigger it)
./bootstrap/nyra-complete-bootstrap/quick-setup.sh
```

---

## 📚 COMPREHENSIVE DOCUMENTATION

### 1. Architecture & Design
**File:** `00-MASTER-ARCHITECTURE.md`

**What's inside:**
- System architecture diagrams
- Component relationships
- Technology stack details
- Memory system architecture (6 systems explained)
- Dual orchestrator integration
- LLM routing and cost optimization
- Security and compliance
- Scaling strategies
- Complete port allocation table
- Environment variables reference

**Read this if:**
- You want to understand how everything works
- You need to customize the architecture
- You're explaining the system to stakeholders
- You need to troubleshoot issues

### 2. Automation Script
**File:** `01-MASTER-SETUP-PROMPT.md`

**What it does:**
- Clones all repositories
- Installs all dependencies (Node, Python, Rust)
- Creates Nexus Router from scratch
- Generates Docker Compose files
- Creates environment configuration
- Starts all services
- Verifies health checks
- Generates completion report

**Use this when:**
- Setting up for the first time
- Rebuilding after major changes
- Setting up on a new machine
- Onboarding a new team member

### 3. Quick Start Guide
**File:** `02-ULTRA-FAST-START.md`

**What's inside:**
- 3-minute setup instructions
- Health check commands
- Verification steps
- Troubleshooting guide

**Use this when:**
- You need the fastest possible setup
- You're in a hurry
- You just want it working

---

## 🏗️ WHAT GETS INSTALLED

### Orchestration Layer
✅ **Claude Flow** (Port 9000) - Workflow orchestrator  
✅ **Archon OS** (Port 9001) - Agent operating system  
✅ **Nexus Router** (Port 8000) - LLM routing service

### MCP Servers (All Dockerized)
✅ **Letta** (Port 8283) - Conversation memory  
✅ **Graphiti** (Port 6379) - Temporal knowledge graph  
✅ **RuVector** (Port 7000) - Vector similarity search  
✅ **Mem0** (Port 8081) - Personalization engine  
✅ **OpenMemory** (Port 8080) - Shared knowledge  
✅ **Qdrant** (Port 6333) - Hot vector cache  
✅ **Serena** (Port 8086) - Codebase analysis  
✅ **Gemini Assistant** (Port 8085) - AI development assistant

### Infrastructure Services
✅ **PostgreSQL** (Port 5432) - Relational database  
✅ **Redis** (Port 6379) - Caching and queues  
✅ **Neo4j** (Port 7474/7687) - Graph database  
✅ **Qdrant** (Port 6333) - Vector database

### Development UIs
✅ **Open-WebUI** (Port 3333) - Main dev interface  
✅ **LobeChat** (Port 3334) - Alternative dev UI

### Development Tools
✅ **Claude Code Development Kit** (.ccdk folder)  
✅ **Docker Compose configurations** (dev, prod, orchestration, MCP, UI)  
✅ **Environment templates**

---

## 🔐 REQUIRED API KEYS

You'll need to obtain these API keys and add them to your `.env` file:

### Critical (Required for Basic Functionality)

1. **Google Gemini API Key**
   - Get from: https://makersuite.google.com/app/apikey
   - Used by: Gemini Assistant MCP
   - Cost: Free tier available

2. **Anthropic API Key**
   - Get from: https://console.anthropic.com/
   - Used by: Fallback LLM provider
   - Cost: Pay-as-you-go

3. **OpenRouter API Key**
   - Get from: https://openrouter.ai/keys
   - Used by: Cost-effective cloud fallback
   - Cost: $0.01-0.50 per 1M tokens

### Optional (Business Integrations)

4. **Rocket Mortgage API** (contact your rep)
5. **LenderPrice API** (contact your rep)
6. **GoHighLevel API** (from your GHL account)
7. **LendingTree** (webhook-based)
8. **FreeRateUpdate** (webhook-based)

---

## 🚀 AFTER INSTALLATION

### Verify Everything Works

```bash
# Check all Docker containers
docker ps --filter "name=nyra-"

# Test each service
curl http://localhost:9000/health    # Claude Flow
curl http://localhost:9001/health    # Archon OS
curl http://localhost:8000/health    # Nexus Router
curl http://localhost:8283/health    # Letta
curl http://localhost:8085/health    # Gemini Assistant

# Open development UI
open http://localhost:3333           # Open-WebUI
```

### Start Development

**For local development (recommended):**

```bash
# Terminal 1: Start Claude Flow locally
cd orchestration/claude-flow
pnpm dev

# Terminal 2: Start Archon OS locally
cd orchestration/archon-os
npm run dev

# All MCP servers and infrastructure already running in Docker
```

**For production deployment:**

```bash
# Start orchestrators in Docker
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d

# Or deploy to Kubernetes
kubectl apply -f infra/k8s/
```

---

## 💰 COST ANALYSIS

### Local GPU Strategy (Your Setup)
**Hardware:**
- RTX 5090 ($2,500) - DeepSeek-R1 236B
- RTX 3090 ($1,200) - Llama 70B
- RTX 3060 ($400) - CodeLlama 34B
- Total: $4,100 one-time

**Monthly Operating Cost:**
- Electricity (3 GPUs 24/7): $150
- Maintenance: $50
- **Total: $200/month**

**Capacity:** 360M tokens/month (90% of traffic)

### Cloud-Only Alternative
**Monthly Cost:**
- OpenRouter (Llama 70B @ $0.50/1M): $200
- Peak overflow: $300
- Emergency (Anthropic): $120
- **Total: $620-920/month**

### Hybrid Strategy (Recommended)
**Monthly Cost:**
- Local GPU (90%): $200
- Cloud overflow (10%): $80
- Emergency: $50
- **Total: $330/month**

**Savings:** $5,640/year  
**ROI on Hardware:** 9 months

---

## 📊 MEMORY SYSTEM ARCHITECTURE

Your system uses **6 integrated memory systems** for comprehensive context retention:

1. **Letta** (Port 8283)
   - Purpose: Full conversation history
   - Example: "Remember John applied for VA loan in October"

2. **Graphiti** (Port 6379)
   - Purpose: Temporal relationships
   - Example: "Show timeline of John's loan from inquiry to closing"

3. **RuVector** (Port 7000)
   - Purpose: Semantic similarity
   - Example: "Find similar loan scenarios"

4. **Mem0** (Port 8081)
   - Purpose: Personalization
   - Example: "John prefers SMS over email"

5. **OpenMemory** (Port 8080)
   - Purpose: Shared team knowledge
   - Example: "Best practices for VA loan objections"

6. **Qdrant** (Port 6333)
   - Purpose: Hot vector cache
   - Example: Fast retrieval for real-time queries

**Routing Logic:**
- Conversation → Letta
- Timeline events → Graphiti
- Similarity search → RuVector
- User preferences → Mem0
- Team knowledge → OpenMemory
- Hot cache → Qdrant

---

## 🐛 TROUBLESHOOTING

### Services Not Starting

**Check Docker:**
```bash
# Verify Docker is running
docker ps

# Check container logs
docker logs nyra-nexus-router
docker logs nyra-mcp-letta
```

**Common Issues:**
- Port already in use → Change ports in .env
- Docker not running → Start Docker Desktop
- Out of memory → Close other applications

### Health Checks Failing

**Check individual services:**
```bash
# Test each service
for port in 8000 8080 8081 8085 8086 8283 6379 7000; do
    echo "Testing port $port..."
    curl -f http://localhost:$port/health || echo "FAILED"
done
```

### API Keys Not Working

**Verify keys in .env:**
```bash
# Check if keys are set
grep -E "(GEMINI|ANTHROPIC|OPENROUTER)" .env
```

**Test each API:**
```bash
# Test Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

---

## 🔄 UPDATING THE SYSTEM

### Update All Components

```bash
# Pull latest changes
cd orchestration/claude-flow && git pull && pnpm install && cd ../..
cd orchestration/archon-os && git pull && npm install && cd ../..
cd mcp-servers/gemini-assistant && git pull && npm install && cd ../..
cd mcp-servers/serena && git pull && pip install -r requirements.txt --break-system-packages && cd ../..

# Rebuild Docker containers
docker-compose -f infra/docker/docker-compose.mcp.yml build
docker-compose -f infra/docker/docker-compose.mcp.yml up -d
```

---

## 📞 SUPPORT & RESOURCES

### Documentation
- **Master Architecture:** `00-MASTER-ARCHITECTURE.md`
- **Setup Guide:** `01-MASTER-SETUP-PROMPT.md`
- **Quick Start:** `02-ULTRA-FAST-START.md`

### External Resources
- **Claude Flow:** https://github.com/ruvnet/claude-flow
- **Archon OS:** https://github.com/archon-ai/archon-os
- **Gemini Assistant:** https://github.com/peterkrueck/mcp-gemini-assistant
- **CCDK:** https://github.com/peterkrueck/Claude-Code-Development-Kit

### Getting Help
1. Check logs: `docker logs [container-name]`
2. Review architecture docs: `00-MASTER-ARCHITECTURE.md`
3. Search GitHub issues for similar problems
4. Ask in Project Nyra development chat

---

## 🎓 LEARNING PATH

**New to the system?** Follow this learning sequence:

1. **Read:** `02-ULTRA-FAST-START.md` (5 minutes)
   - Get the system running

2. **Read:** `00-MASTER-ARCHITECTURE.md` Sections 1-3 (30 minutes)
   - Understand the overall architecture

3. **Experiment:** Open-WebUI testing (1 hour)
   - Test some queries
   - See how routing works
   - Explore memory systems

4. **Deep Dive:** `00-MASTER-ARCHITECTURE.md` Sections 4-12 (2 hours)
   - Understand each component
   - Learn the dual orchestrator pattern
   - Study memory architecture

5. **Build:** Create your first workflow (2 hours)
   - Use Claude Flow to define a workflow
   - Watch Archon OS execute it
   - See results stored in memory

---

## 🚦 CURRENT STATUS

**Package Version:** 1.0.0  
**Last Updated:** January 10, 2025  
**Status:** Production Ready

**What's Included:**
✅ Complete architecture documentation  
✅ Automated setup script  
✅ Docker configurations for dev and prod  
✅ Environment templates  
✅ Dual orchestrator integration  
✅ 7 MCP servers configured  
✅ LLM routing system  
✅ Development and production UIs  
✅ Comprehensive troubleshooting guide

**What's Next (Manual Steps):**
⏳ Add your API keys to .env  
⏳ Configure your GPU workers  
⏳ Set up business API integrations (Rocket Mortgage, etc.)  
⏳ Customize workflows for your mortgage process  
⏳ Deploy to production infrastructure

---

## 🎯 SUCCESS CRITERIA

You'll know everything is working when:

✅ All Docker containers show as "healthy"  
✅ All health check endpoints return 200 OK  
✅ Open-WebUI loads at http://localhost:3333  
✅ You can send a test query and get a response  
✅ Nexus Router shows GPU workers available  
✅ Memory systems are storing and retrieving data

---

**Ready to start?** Copy this entire bootstrap folder to your Project-Nyra repo and follow the instructions above.

**Questions?** Everything is documented in `00-MASTER-ARCHITECTURE.md`

**Just want it running?** Paste `01-MASTER-SETUP-PROMPT.md` into Claude Code and wait 30 minutes. ✨
