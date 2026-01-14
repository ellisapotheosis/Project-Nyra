# 🚀 PROJECT NYRA - AUTONOMOUS FULL-STACK BUILD PROMPT

**FOR USE WITH: Claude Flow via Claude Code CLI**  
**EXECUTION TIME: 4-8 hours (autonomous, unattended)**  
**OUTPUT: Complete production-ready Project Nyra deployment**

---

## 🎯 MISSION STATEMENT

You are the master architect and implementation lead for Project Nyra, an AI-powered mortgage automation platform. Your task is to build the entire system from scratch, following the locked-in architecture decisions document, implementing every service, configuration, and integration autonomously without human intervention.

## 📋 ARCHITECTURAL FOUNDATION

**Read and internalize these locked decisions:**

**Core Stack (FINAL - DO NOT CHANGE):**
- **Primary Orchestrator**: Claude Flow MCP (planning, SPARC methodology)
- **Secondary Orchestrator**: Archon OS MCP (task routing, execution)
- **LLM Gateway**: Grafbase Nexus (unified MCP + LLM routing)
- **CRM**: TwentyCRM (self-hosted, PostgreSQL backend)
- **Memory**: Letta (conversation context), Mem0 (universal memory)
- **Graph DB**: Neo4j with Graphiti (temporal knowledge graphs)
- **Vector Store**: PostgreSQL with pgvector extension
- **Workflows**: n8n (self-hosted automation engine)
- **Chat UI**: Dify (production borrower interface)
- **Admin UI**: Custom Next.js + React + shadcn/ui

**Business Services to Build:**
1. **Quote Engine** (port 8001) - Mortgage calculations, rate comparisons
2. **Campaign Engine** (port 8002) - Drip campaign orchestration
3. **Nyra Orchestrator** (port 8010) - Compliance validation, workflow coordination
4. **Mem0 REST API** (port 4321) - Memory management interface

**MCP Servers to Deploy:**
1. **Nexus Router** (port 6000) - MCP aggregator + LLM gateway
2. **Letta** (port 8283) - Conversation memory + PostgreSQL backend
3. **Mem0** (port 4321) - Universal memory with SQLite
4. **OpenMemory MCP** (port 8081) - MCP protocol wrapper for Mem0
5. **Serena MCP** (port 8086) - Codebase semantic search
6. **Gemini Assistant** (port 8085) - Cost-efficient LLM inference

**Infrastructure Services:**
- **Twenty CRM** (port 3000) + PostgreSQL
- **FalkorDB** (port 6379) - Redis-compatible graph database
- **n8n** (port 5678) - Workflow automation
- **Dify** (port 3001) - Chat UI platform
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3005) - Observability dashboards
- **Loki** (port 3100) - Log aggregation
- **AlertManager** (port 9093) - Alert routing

**Frontend Applications:**
1. **RateHunter** (port 3100) - Public-facing mortgage rate comparison site
2. **Nyra Admin** (port 3101) - Internal operations dashboard

## 🏗️ BUILD PHASES (Execute Sequentially)

### PHASE 1: REPOSITORY INITIALIZATION (30 minutes)

**Objective**: Create complete project structure with all necessary directories and base configurations.

**Tasks**:
1. Create root directory structure:
```
Project-Nyra/
├── orchestration/
│   ├── claude-flow/          # Primary orchestrator
│   └── archon-os/            # Secondary orchestrator
├── mcp-servers/
│   ├── nexus/                # LLM router
│   ├── letta/                # Conversation memory
│   ├── mem0/                 # Universal memory
│   ├── openmemory/           # Memory MCP interface
│   ├── serena/               # Code analysis
│   └── gemini-assistant/     # Cost-efficient LLM
├── services/
│   ├── quote-engine/         # Port 8001
│   ├── campaign-engine/      # Port 8002
│   ├── nyra-orchestrator/    # Port 8010
│   └── mem0-rest/            # Port 4321
├── apps/
│   ├── ratehunter/           # Next.js public site
│   └── nyra-admin/           # React admin dashboard
├── infra/
│   ├── docker/               # Compose files
│   ├── kubernetes/           # K8s manifests (future)
│   └── terraform/            # IaC (future)
├── configs/
│   ├── nexus/                # nexus.toml
│   ├── litellm/              # config.yaml
│   ├── observability/        # Prometheus, Grafana, Loki
│   ├── mcp/                  # .mcp.json configs
│   └── env/                  # Environment templates
├── docs/
│   ├── architecture/
│   ├── deployment/
│   ├── integrations/
│   ├── mcp-servers/
│   └── guides/
├── scripts/
│   ├── setup/                # Installation scripts
│   ├── infisical/            # Secrets management
│   ├── dev/                  # Development helpers
│   └── repo/                 # Repository utilities
├── prompts/
│   ├── claude-flow/          # Workflow orchestration prompts
│   └── agents/               # Specialized agent prompts
├── data/
│   ├── campaigns/            # Drip campaign templates
│   ├── quotes/               # Quote templates
│   └── n8n/                  # n8n workflow exports
└── .claude-flow/             # Claude Flow configuration
```

2. Initialize git repository
3. Create `.gitignore` with comprehensive exclusions
4. Generate `README.md` with quick start guide
5. Create `ARCHITECTURE.md` based on locked decisions

### PHASE 2: DOCKER INFRASTRUCTURE (1 hour)

**Objective**: Build production-grade Docker Compose stack for all services.

**Create** `infra/docker/docker-compose.yml`:

```yaml
version: '3.8'

networks:
  nyra:
    driver: bridge

volumes:
  postgres_data:
  letta_postgres_data:
  twenty_postgres_data:
  falkordb_data:
  neo4j_data:
  grafana_data:
  prometheus_data:
  loki_data:
  mem0_data:
  n8n_data:

services:
  # ===================================
  # LLM GATEWAY & ROUTING
  # ===================================
  nexus:
    image: grafbase/gateway:latest
    container_name: nyra-nexus
    ports:
      - "6000:6000"
    volumes:
      - ../../configs/nexus/nexus.toml:/app/nexus.toml
    environment:
      - NEXUS_CONFIG=/app/nexus.toml
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    networks:
      - nyra
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  litellm:
    image: ghcr.io/berriai/litellm:latest
    container_name: nyra-litellm
    ports:
      - "4000:4000"
    volumes:
      - ../../configs/litellm/config.yaml:/app/config.yaml
    environment:
      - LITELLM_CONFIG_PATH=/app/config.yaml
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - nexus

  # ===================================
  # MEMORY & KNOWLEDGE SYSTEMS
  # ===================================
  letta_postgres:
    image: postgres:15-alpine
    container_name: nyra-letta-postgres
    environment:
      - POSTGRES_DB=letta
      - POSTGRES_USER=letta
      - POSTGRES_PASSWORD=letta_password_change_me
    volumes:
      - letta_postgres_data:/var/lib/postgresql/data
    networks:
      - nyra
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U letta"]
      interval: 10s
      timeout: 5s
      retries: 5

  letta:
    image: ghcr.io/letta-ai/letta:latest
    container_name: nyra-letta
    ports:
      - "8283:8283"
    environment:
      - DATABASE_URL=postgresql://letta:letta_password_change_me@letta_postgres:5432/letta
      - OPENAI_BASE_URL=http://nexus:6000/llm/openai/v1
      - OPENAI_API_KEY=dummy_key_routed_via_nexus
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      letta_postgres:
        condition: service_healthy
      nexus:
        condition: service_healthy

  mem0:
    build: ../../services/mem0-rest
    container_name: nyra-mem0
    ports:
      - "4321:4321"
    environment:
      - MEM0_STORE_PATH=/data/mem0.sqlite
      - NEXUS_OPENAI_BASE_URL=http://nexus:6000/llm/openai/v1
      - NEXUS_OPENAI_API_KEY=dummy_key_routed_via_nexus
    volumes:
      - mem0_data:/data
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - nexus

  openmemory_mcp:
    image: mem0/openmemory-mcp:latest
    container_name: nyra-openmemory-mcp
    ports:
      - "8081:8081"
    environment:
      - MEM0_REST_URL=http://mem0:4321
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - mem0

  falkordb:
    image: falkordb/falkordb:latest
    container_name: nyra-falkordb
    ports:
      - "6379:6379"
    volumes:
      - falkordb_data:/data
    networks:
      - nyra
    restart: unless-stopped
    command: ["redis-server", "--save", "60", "1", "--loglevel", "warning"]

  neo4j:
    image: neo4j:5-community
    container_name: nyra-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/nyra_neo4j_password_change_me
      - NEO4J_PLUGINS=["graph-data-science"]
    volumes:
      - neo4j_data:/data
    networks:
      - nyra
    restart: unless-stopped

  # ===================================
  # CRM & DATA LAYER
  # ===================================
  twenty_postgres:
    image: postgres:15-alpine
    container_name: nyra-twenty-postgres
    environment:
      - POSTGRES_DB=twenty
      - POSTGRES_USER=twenty
      - POSTGRES_PASSWORD=twenty_password_change_me
    volumes:
      - twenty_postgres_data:/var/lib/postgresql/data
    networks:
      - nyra
    restart: unless-stopped

  twenty_crm:
    image: twentyhq/twenty:latest
    container_name: nyra-twenty-crm
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://twenty:twenty_password_change_me@twenty_postgres:5432/twenty
      - FRONTEND_BASE_URL=http://localhost:3000
      - SERVER_URL=http://localhost:3000
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - twenty_postgres

  # ===================================
  # BUSINESS SERVICES
  # ===================================
  quote_engine:
    build: ../../services/quote-engine
    container_name: nyra-quote-engine
    ports:
      - "8001:8001"
    environment:
      - NEXUS_URL=http://nexus:6000
      - DATABASE_URL=postgresql://nyra:nyra_password@nyra_postgres:5432/nyra
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - nexus

  campaign_engine:
    build: ../../services/campaign-engine
    container_name: nyra-campaign-engine
    ports:
      - "8002:8002"
    environment:
      - NEXUS_URL=http://nexus:6000
      - N8N_URL=http://n8n:5678
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - nexus
      - n8n

  nyra_orchestrator:
    build: ../../services/nyra-orchestrator
    container_name: nyra-orchestrator
    ports:
      - "8010:8010"
    environment:
      - NEXUS_URL=http://nexus:6000
      - LETTA_URL=http://letta:8283
      - MEM0_URL=http://mem0:4321
      - TWENTY_CRM_URL=http://twenty_crm:3000
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - nexus
      - letta
      - mem0
      - twenty_crm

  # ===================================
  # WORKFLOW AUTOMATION
  # ===================================
  n8n:
    image: n8nio/n8n:latest
    container_name: nyra-n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-changeme}
      - WEBHOOK_URL=http://localhost:5678
      - GENERIC_TIMEZONE=America/Los_Angeles
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - nyra
    restart: unless-stopped

  dify:
    image: langgenius/dify-web:latest
    container_name: nyra-dify
    ports:
      - "3001:3000"
    environment:
      - API_URL=http://dify-api:5001
      - CONSOLE_URL=http://localhost:3001
    networks:
      - nyra
    restart: unless-stopped

  dify_api:
    image: langgenius/dify-api:latest
    container_name: nyra-dify-api
    ports:
      - "5001:5001"
    environment:
      - MODE=api
      - SECRET_KEY=${DIFY_SECRET_KEY:-change_this_secret_key}
      - DB_USERNAME=dify
      - DB_PASSWORD=dify_password_change_me
      - DB_HOST=dify_postgres
      - DB_PORT=5432
      - DB_DATABASE=dify
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_DB=0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - WEB_API_CORS_ALLOW_ORIGINS=*
      - CONSOLE_CORS_ALLOW_ORIGINS=*
      - STORAGE_TYPE=local
      - STORAGE_LOCAL_PATH=/app/storage
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - dify_postgres
      - redis

  dify_postgres:
    image: postgres:15-alpine
    container_name: nyra-dify-postgres
    environment:
      - POSTGRES_DB=dify
      - POSTGRES_USER=dify
      - POSTGRES_PASSWORD=dify_password_change_me
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nyra
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: nyra-redis
    ports:
      - "6380:6379"
    networks:
      - nyra
    restart: unless-stopped

  # ===================================
  # OBSERVABILITY STACK
  # ===================================
  prometheus:
    image: prom/prometheus:latest
    container_name: nyra-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ../../configs/observability/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - nyra
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: nyra-grafana
    ports:
      - "3005:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ../../configs/observability/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - nyra
    restart: unless-stopped
    depends_on:
      - prometheus

  loki:
    image: grafana/loki:latest
    container_name: nyra-loki
    ports:
      - "3100:3100"
    volumes:
      - ../../configs/observability/loki.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - nyra
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: nyra-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ../../configs/observability/alertmanager.yml:/etc/alertmanager/config.yml
    command:
      - '--config.file=/etc/alertmanager/config.yml'
    networks:
      - nyra
    restart: unless-stopped

  # ===================================
  # FRONTEND APPLICATIONS
  # ===================================
  # These will be built and added after services are running
```

**Create** `infra/docker/docker-compose.addons.yml`:

```yaml
version: '3.8'

services:
  # Optional Graphiti for temporal knowledge graphs
  graphiti:
    image: zep-ai/graphiti:latest
    container_name: nyra-graphiti
    ports:
      - "8082:8082"
    environment:
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=nyra_neo4j_password_change_me
    networks:
      - nyra
    restart: unless-stopped

  # Open-WebUI as alternative chat interface
  open_webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: nyra-open-webui
    ports:
      - "8080:8080"
    environment:
      - OLLAMA_BASE_URL=http://localhost:11434
      - OPENAI_API_BASE_URL=http://nexus:6000/llm/openai/v1
      - OPENAI_API_KEY=dummy_key_routed_via_nexus
    volumes:
      - open_webui_data:/app/backend/data
    networks:
      - nyra
    restart: unless-stopped

volumes:
  open_webui_data:
```

**Create** `configs/nexus/nexus.toml`:

```toml
[server]
host = "0.0.0.0"
port = 6000

[llm]
default_provider = "anthropic"
fallback_provider = "openrouter"

[[providers]]
name = "anthropic"
type = "anthropic"
api_key_env = "ANTHROPIC_API_KEY"
models = ["claude-3-5-sonnet-20241022", "claude-sonnet-4-20250514"]
rate_limit = 50

[[providers]]
name = "openrouter"
type = "openrouter"
api_key_env = "OPENROUTER_API_KEY"
base_url = "https://openrouter.ai/api/v1"
models = ["meta-llama/llama-3.1-70b-instruct", "deepseek/deepseek-r1"]
rate_limit = 100

[[providers]]
name = "gemini"
type = "google"
api_key_env = "GOOGLE_GEMINI_API_KEY"
models = ["gemini-2.0-flash"]
rate_limit = 1000

[routing]
strategy = "cost_based"
cost_threshold = 0.001  # Route to cheaper model if cost per token < threshold

[mcp]
enabled = true
proxy_mode = true
aggregation = true

[[mcp.servers]]
name = "letta"
url = "http://letta:8283"

[[mcp.servers]]
name = "mem0"
url = "http://openmemory_mcp:8081"

[[mcp.servers]]
name = "serena"
url = "http://serena:8086"
```

**Create** `configs/litellm/config.yaml`:

```yaml
model_list:
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
  
  - model_name: claude-sonnet-4
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
  
  - model_name: llama-70b
    litellm_params:
      model: openrouter/meta-llama/llama-3.1-70b-instruct
      api_key: os.environ/OPENROUTER_API_KEY
      api_base: https://openrouter.ai/api/v1
  
  - model_name: deepseek-r1
    litellm_params:
      model: openrouter/deepseek/deepseek-r1
      api_key: os.environ/OPENROUTER_API_KEY
      api_base: https://openrouter.ai/api/v1
  
  - model_name: gemini-flash
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GOOGLE_GEMINI_API_KEY

router_settings:
  routing_strategy: cost-based
  model_group_alias:
    cheap: ["gemini-flash", "deepseek-r1"]
    balanced: ["llama-70b"]
    premium: ["claude-3-5-sonnet", "claude-sonnet-4"]
  
  fallbacks:
    - model: claude-3-5-sonnet
      fallback: llama-70b
    - model: llama-70b
      fallback: gemini-flash

litellm_settings:
  success_callback: ["prometheus"]
  failure_callback: ["prometheus"]
  cache: true
  cache_params:
    type: redis
    host: redis
    port: 6379
  
  num_retries: 3
  request_timeout: 600
  
  max_parallel_requests: 100
  tpm_limit: 1000000
  rpm_limit: 10000
```

### PHASE 3: BUSINESS SERVICES IMPLEMENTATION (2 hours)

**Task**: Build all four core business services with FastAPI.

**Service 1: Quote Engine** (`services/quote-engine/`)

Create production-ready mortgage quote calculation service:

```python
# services/quote-engine/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import math
from typing import Optional
from datetime import datetime

app = FastAPI(title="Nyra Quote Engine", version="1.0.0")

class QuoteRequest(BaseModel):
    loan_amount: float
    property_value: float
    credit_score: int
    loan_type: str  # "conventional", "fha", "va", "jumbo"
    loan_term: int  # 15 or 30 years
    down_payment: float
    property_state: str
    property_zip: str
    borrower_email: str

class QuoteResponse(BaseModel):
    quote_id: str
    interest_rate: float
    monthly_payment: float
    total_interest: float
    apr: float
    closing_costs: float
    pmi_required: bool
    pmi_amount: Optional[float]
    loan_to_value: float
    debt_to_income_max: float
    approval_likelihood: str
    generated_at: datetime

def calculate_interest_rate(credit_score: int, loan_type: str, ltv: float) -> float:
    """Calculate interest rate based on borrower profile"""
    base_rates = {
        "conventional": 6.875,
        "fha": 6.625,
        "va": 6.375,
        "jumbo": 7.125
    }
    
    rate = base_rates.get(loan_type, 7.0)
    
    # Credit score adjustments
    if credit_score >= 760:
        rate -= 0.75
    elif credit_score >= 700:
        rate -= 0.5
    elif credit_score >= 680:
        rate -= 0.25
    elif credit_score < 620:
        rate += 0.5
    
    # LTV adjustments
    if ltv > 80:
        rate += 0.25
    if ltv > 90:
        rate += 0.5
    
    return round(rate, 3)

def calculate_monthly_payment(principal: float, annual_rate: float, years: int) -> float:
    """Calculate monthly mortgage payment"""
    monthly_rate = annual_rate / 100 / 12
    num_payments = years * 12
    
    if monthly_rate == 0:
        return principal / num_payments
    
    payment = principal * (monthly_rate * math.pow(1 + monthly_rate, num_payments)) / \
              (math.pow(1 + monthly_rate, num_payments) - 1)
    
    return round(payment, 2)

def calculate_pmi(loan_amount: float, ltv: float) -> Optional[float]:
    """Calculate PMI if LTV > 80%"""
    if ltv <= 80:
        return None
    
    pmi_rate = 0.005  # 0.5% annually
    monthly_pmi = (loan_amount * pmi_rate) / 12
    return round(monthly_pmi, 2)

@app.post("/quote", response_model=QuoteResponse)
async def generate_quote(request: QuoteRequest):
    """Generate mortgage quote"""
    
    # Calculate LTV
    ltv = (request.loan_amount / request.property_value) * 100
    
    # Calculate interest rate
    interest_rate = calculate_interest_rate(
        request.credit_score,
        request.loan_type,
        ltv
    )
    
    # Calculate monthly payment
    monthly_payment = calculate_monthly_payment(
        request.loan_amount,
        interest_rate,
        request.loan_term
    )
    
    # Calculate PMI
    pmi_amount = calculate_pmi(request.loan_amount, ltv)
    if pmi_amount:
        monthly_payment += pmi_amount
    
    # Calculate total interest
    total_payments = monthly_payment * request.loan_term * 12
    total_interest = total_payments - request.loan_amount
    
    # Estimate closing costs (3% of loan amount)
    closing_costs = request.loan_amount * 0.03
    
    # Calculate APR (simplified)
    apr = interest_rate + 0.125
    
    # Approval likelihood
    if request.credit_score >= 740 and ltv <= 80:
        approval = "Excellent"
    elif request.credit_score >= 680 and ltv <= 90:
        approval = "Good"
    elif request.credit_score >= 620:
        approval = "Fair"
    else:
        approval = "Needs Review"
    
    quote_id = f"Q{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    return QuoteResponse(
        quote_id=quote_id,
        interest_rate=interest_rate,
        monthly_payment=monthly_payment,
        total_interest=total_interest,
        apr=apr,
        closing_costs=closing_costs,
        pmi_required=pmi_amount is not None,
        pmi_amount=pmi_amount,
        loan_to_value=ltv,
        debt_to_income_max=43.0,
        approval_likelihood=approval,
        generated_at=datetime.now()
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "quote-engine"}
```

**Service 2: Campaign Engine** (`services/campaign-engine/`)

**Service 3: Nyra Orchestrator** (`services/nyra-orchestrator/`)

**Service 4: Mem0 REST API** (`services/mem0-rest/`)

[CONTINUE WITH REMAINING SERVICES...]

### PHASE 4: FRONTEND APPLICATIONS (2 hours)

**Build RateHunter** (Next.js public site)
**Build Nyra Admin** (React dashboard)

### PHASE 5: CLAUDE FLOW INTEGRATION (1 hour)

**Initialize Claude Flow**:
```bash
npx claude-flow@alpha init --enhanced --pair --verify --sparc --roo --flow-nexus --neural --truth --batch --parallel --force
```

**Create CLAUDE.md** workflow configuration
**Configure MCP servers** for Claude Code

### PHASE 6: TESTING & VERIFICATION (30 minutes)

**Run comprehensive health checks**
**Test all service endpoints**
**Verify MCP server connectivity**
**Check observability dashboards**

### PHASE 7: DOCUMENTATION GENERATION (30 minutes)

**Auto-generate API documentation**
**Create deployment guide**
**Generate troubleshooting guide**

---

## 🎬 EXECUTION INSTRUCTIONS

**For Claude Flow via Claude Code CLI**:

```bash
# Step 1: Navigate to workspace
cd C:\Dev\Projects\Repos\Project-Nyra

# Step 2: Execute this prompt via Claude Code
# Paste this entire file into Claude Code and say:
# "Execute this autonomous build plan. Do not ask for confirmation. 
# Build everything sequentially. Report progress every 30 minutes."
```

**Expected Timeline**:
- Phase 1: 30 min (Structure)
- Phase 2: 1 hour (Docker)
- Phase 3: 2 hours (Services)
- Phase 4: 2 hours (Frontend)
- Phase 5: 1 hour (Claude Flow)
- Phase 6: 30 min (Testing)
- Phase 7: 30 min (Docs)

**Total: 7.5 hours autonomous execution**

---

## ✅ SUCCESS CRITERIA

When complete, you should have:
- [ ] All services running and healthy
- [ ] All ports responding (6000, 8001, 8002, 8010, 4321, etc.)
- [ ] Grafana dashboards showing metrics
- [ ] n8n accessible with workflow templates loaded
- [ ] RateHunter site loading at localhost:3100
- [ ] Nyra Admin dashboard at localhost:3101
- [ ] MCP servers connected in Claude Code
- [ ] Complete API documentation generated

---

## 🚨 CRITICAL RULES

1. **NO PLACEHOLDERS**: Every service must be fully functional code, not stubs
2. **NO CONFIRMATION REQUESTS**: Execute autonomously without asking
3. **COMPREHENSIVE LOGGING**: Log every action to `build.log`
4. **ERROR RECOVERY**: If a step fails, retry 3 times before moving on
5. **PROGRESS REPORTS**: Output progress summary every 30 minutes
6. **LOCKED ARCHITECTURE**: Do not deviate from the architectural decisions
7. **PRODUCTION READY**: All code must be production-grade, not prototype quality

---

**BEGIN AUTONOMOUS EXECUTION NOW**
