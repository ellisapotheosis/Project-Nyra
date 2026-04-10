# ULTRA-FAST START - ORCHESTRATION & TOOLS SETUP

## GO TO DINNER IN 3 MINUTES

### Option 1: Full Automation (RECOMMENDED - Set and Forget)

**Copy this entire prompt, paste into Claude Code, press Enter, go to dinner:**

```
I need you to set up the complete Project Nyra orchestration stack. Execute these steps sequentially:

PHASE 1: Install All Components
- Navigate to C:\Dev\Projects\Repos\Project-Nyra
- Run: .\bootstrap\orchestration-setup\install-all-components.ps1 -Verbose
- This installs: CCDK, Gemini Assistant, Serena MCP, Nexus Router, Claude Flow, Archon OS, Open-WebUI, LobeChat

PHASE 2: Configure Environment
- Add to .env file:
  GOOGLE_GEMINI_API_KEY=[get from https://makersuite.google.com/app/apikey]
  CLAUDE_FLOW_PORT=9000
  ARCHON_PORT=9001
  NEXUS_PORT=8000

PHASE 3: Start All Services
- Run: docker network create nyra-network
- Run: docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
- Run: docker-compose -f infra/docker/docker-compose.mcp.yml up -d  
- Run: docker-compose -f infra/docker/docker-compose.ui.yml up -d

PHASE 4: Verify Everything Works
- Test Claude Flow: curl http://localhost:9000/health
- Test Archon OS: curl http://localhost:9001/health
- Test Nexus Router: curl http://localhost:8000/health
- Test Open-WebUI: open http://localhost:3333
- Test LobeChat: open http://localhost:3334

Execute all phases now. Report progress. Don't wait for approval between phases.
```

**That's it. Paste that prompt into Claude Code and leave for dinner. It'll be done when you return.**

---

### Option 2: Manual Quick Start (5 minutes if you must do it yourself)

```powershell
# 1. Navigate to repo
cd C:\Dev\Projects\Repos\Project-Nyra

# 2. Run installation script
.\bootstrap\orchestration-setup\install-all-components.ps1 -Verbose

# 3. Create Docker network
docker network create nyra-network

# 4. Start orchestration services
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d

# 5. Start MCP servers
docker-compose -f infra/docker/docker-compose.mcp.yml up -d

# 6. Start UI services
docker-compose -f infra/docker/docker-compose.ui.yml up -d
```

**Go to dinner. Check status when you return.**

---

## WHAT YOU'LL HAVE WHEN YOU RETURN

### Running Services (All Containerized)

**Orchestration Layer:**
- Claude Flow: http://localhost:9000 (workflow orchestrator)
- Archon OS: http://localhost:9001 (agent OS/task manager)

**MCP Servers:**
- Gemini Assistant: http://localhost:8085
- Serena (Codebase Analysis): http://localhost:8086
- [Plus your existing 5 memory systems]

**LLM Routing:**
- Nexus Router: http://localhost:8000 (routes to GPU workers → OpenRouter → Anthropic)

**Development UIs:**
- Open-WebUI: http://localhost:3333 (main dev interface)
- LobeChat: http://localhost:3334 (alternative UI)
- Dify: http://localhost:3000 (production chatbot)

### Folder Structure Created

```
Project-Nyra/
├── .ccdk/                          # Dev toolkit
├── orchestration/                  # Dual orchestrators
│   ├── archon-os/               # Workflow engine
│   ├── archon-os/                 # Agent OS
│   └── integration/               # Integration config
├── mcp-servers/                    # All MCP servers
│   ├── gemini-assistant/          # NEW
│   ├── serena/                    # NEW
│   └── [existing memory systems]
├── services/
│   └── nexus-router/              # NEW LLM routing
└── ui/                             # Dev/test UIs
    ├── open-webui/                # NEW
    ├── lobechat/                  # NEW
    └── dify/                      # Existing production
```

---

## QUICK VERIFICATION WHEN YOU RETURN

```powershell
# Check all containers are running
docker ps

# Test orchestration
curl http://localhost:9000/health    # Claude Flow
curl http://localhost:9001/health    # Archon OS

# Test routing
curl http://localhost:8000/health    # Nexus Router

# Open dev UI
start http://localhost:3333          # Open-WebUI
```

---

## IF ANYTHING FAILED

Check the log file:
```powershell
notepad C:\Dev\Projects\Repos\Project-Nyra\bootstrap\setup-log-*.txt
```

Or just paste this into Claude Code when you return:
```
Review the setup log and fix any issues with the Project Nyra orchestration setup.
```

---

**Now go enjoy your dinner! Everything will be running when you get back.** 🍽️
