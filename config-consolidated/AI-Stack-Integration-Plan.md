# Project NYRA - AI Stack Integration Plan

**Generated:** 2025-10-17T23:15:00Z  
**Status:** 🎯 Ready for Implementation  
**Budget:** $600 Google + Anthropic + OpenAI Credits

---

## 🎯 **STRATEGIC CREDIT ALLOCATION**

### **Cost-Optimized API Distribution**
```yaml
orchestration_brain: "claude-3.5-sonnet"  # Anthropic credits - highest reasoning
api_provider: "anthropic"
cost_tier: "premium"

secondary_brain: "gpt-4o"  # OpenAI credits - fallback orchestration  
api_provider: "openai"
cost_tier: "high"

bulk_processing: "gemini-1.5-pro"  # Google credits - high volume tasks
api_provider: "google_vertex_ai"
cost_tier: "economical"

embeddings_vectors: "text-embedding-004"  # Google credits - vector operations
api_provider: "google_vertex_ai" 
cost_tier: "very_low"

code_generation: "gemini-1.5-flash"  # Google credits - fast code tasks
api_provider: "google_vertex_ai"
cost_tier: "ultra_low"
```

### **Credit Usage Strategy**
```yaml
anthropic_credits:
  primary_use: "claude-flow orchestration brain"
  allocation: "60% orchestration, 40% critical reasoning"
  estimated_duration: "3-4 months with careful usage"

openai_credits:
  primary_use: "archon main brain + fallback"
  allocation: "70% archon, 30% emergency claude-flow backup"
  estimated_duration: "2-3 months with conservative usage"

google_credits_account_1: "$300"
  primary_use: "bulk processing, embeddings, code generation"
  services: ["vertex-ai", "gemini-api", "embedding-api"]
  estimated_duration: "6-8 months with heavy usage"

google_credits_account_2: "$300"
  primary_use: "scaling, development, experimentation"
  services: ["vertex-ai", "palm-api", "backup-services"]
  estimated_duration: "6-8 months development mode"
```

---

## 🏗️ **METAMCP CHANNEL ARCHITECTURE**

### **Updated MetaMCP Configuration**
```json
{
  "channels": {
    "security": {
      "description": "Security and secrets management",
      "servers": ["infisical-mcp", "bitwarden-mcp"],
      "priority": 1,
      "token_weight": "light"
    },
    
    "orchestration": {
      "description": "Multi-agent orchestration and workflow management", 
      "servers": [
        "archon-mcp",
        "claude-flow-mcp",
        "flow-nexus-mcp",
        "casistack-mcp",
        "archgw-mcp",
        "anthropic-agents-sdk"
      ],
      "priority": 1,
      "token_weight": "heavy"
    },
    
    "ai-frameworks": {
      "description": "AI framework orchestration (optional separate channel)",
      "servers": [
        "langgraph-mcp", 
        "autogen2-mcp",
        "swarm-mcp",
        "hive-mind-mcp",
        "ruvnet-roo-mcp"
      ],
      "priority": 2,
      "token_weight": "heavy"
    },
    
    "google-ai": {
      "description": "Google AI services and tools",
      "servers": [
        "gemini-mcp-assistant",
        "gemini-mcp-tool", 
        "gemini-cli-mcp",
        "vertex-ai-mcp"
      ],
      "priority": 3,
      "token_weight": "medium"
    },
    
    "ui-interfaces": {
      "description": "User interface and interaction systems",
      "servers": [
        "open-webui-mcp",
        "lobe-chat-mcp",
        "open-webui-tools",
        "webui-pipelines"
      ],
      "priority": 4,
      "token_weight": "light"
    },
    
    "development": {
      "description": "Development tools and Docker orchestration",
      "servers": [
        "docker-hub-mcp",
        "docker-mcp-server",
        "github-mcp",
        "claude-code-dev-kit"
      ],
      "priority": 5,
      "token_weight": "medium"
    }
  }
}
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Foundation Setup (Week 1)**
```yaml
infrastructure:
  - setup_litellm_proxy: "unified API routing"
  - configure_vertex_ai: "both google accounts"
  - setup_metamcp: "updated channel architecture"
  - deploy_security_mcps: "infisical + bitwarden"

priority_services:
  - metamcp_proxy: "localhost:12008"
  - litellm_proxy: "localhost:4000" 
  - infisical_mcp: "localhost:3877"
  - bitwarden_mcp: "localhost:3878"
```

### **Phase 2: Core Orchestration (Week 2)**
```yaml
orchestration_stack:
  - claude_flow: "anthropic credits as main brain"
  - archon_ai: "openai credits as main brain"
  - flow_nexus: "google credits for processing"
  - archgw_mcp: "google credits for gateway"

integration_points:
  - claude_flow_config: "anthropic/claude-3.5-sonnet"
  - archon_config: "openai/gpt-4o"
  - fallback_config: "google/gemini-1.5-pro"
```

### **Phase 3: AI Framework Layer (Week 3)**
```yaml
frameworks:
  - anthropic_agents_sdk: "anthropic credits"
  - langgraph: "google credits"
  - autogen2: "google credits" 
  - swarm_mcp: "google credits"
  - casistack_orchestrator: "google credits"

configuration:
  - separate_ai_frameworks_channel: true
  - load_balancing: "weighted_by_cost"
  - failover: "google_vertex_ai"
```

### **Phase 4: UI and User Experience (Week 4)**
```yaml
interfaces:
  - open_webui: "localhost:3000"
  - lobe_chat: "localhost:3001"
  - open_webui_tools: "integrated"
  - webui_pipelines: "localhost:3002"

integrations:
  - metamcp_connection: "all UI interfaces"
  - credit_monitoring: "built-in dashboards"
  - cost_tracking: "per-service usage"
```

---

## 💡 **LITELLM CONFIGURATION**

### **Unified API Routing Configuration**
```yaml
# config-consolidated/litellm-config.yaml
model_list:
  # Anthropic - Premium Orchestration
  - model_name: claude-orchestrator
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: ${ANTHROPIC_API_KEY}
    model_info:
      cost_per_token: 0.000015  # Input cost
      max_tokens: 200000

  # OpenAI - Secondary Brain  
  - model_name: archon-brain
    litellm_params:
      model: openai/gpt-4o
      api_key: ${OPENAI_API_KEY}
    model_info:
      cost_per_token: 0.000005
      max_tokens: 128000

  # Google Account 1 - Bulk Processing
  - model_name: google-bulk
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      vertex_project: ${GOOGLE_PROJECT_ID_1}
      vertex_location: us-central1
    model_info:
      cost_per_token: 0.000001
      max_tokens: 2000000

  # Google Account 2 - Development
  - model_name: google-dev
    litellm_params:
      model: vertex_ai/gemini-1.5-flash
      vertex_project: ${GOOGLE_PROJECT_ID_2}
      vertex_location: us-central1
    model_info:
      cost_per_token: 0.0000002
      max_tokens: 1000000

router_settings:
  routing_strategy: "cost-optimized"
  fallback_models: ["google-bulk", "google-dev"]
  budget_limits:
    anthropic: 100  # dollars per month
    openai: 50     # dollars per month
    google_1: 100  # dollars per month
    google_2: 100  # dollars per month
```

---

## 🔧 **DOCKER COMPOSE INTEGRATION**

### **Updated Docker Compose with AI Stack**
```yaml
# Addition to infra/docker/docker-compose.yml

services:
  # LiteLLM Proxy
  litellm-proxy:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: nyra-litellm-proxy
    ports:
      - "4000:4000"
    environment:
      - LITELLM_CONFIG_PATH=/app/config/litellm-config.yaml
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_APPLICATION_CREDENTIALS=/app/config/google-creds.json
    volumes:
      - ../config-consolidated/litellm-config.yaml:/app/config/litellm-config.yaml:ro
      - ../config-consolidated/google-creds.json:/app/config/google-creds.json:ro
    networks:
      - nyra-network
      
  # Claude Flow
  claude-flow:
    image: ruvnet/claude-flow:latest
    container_name: nyra-claude-flow
    ports:
      - "3010:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - LITELLM_PROXY_URL=http://litellm-proxy:4000
      - METAMCP_URL=http://metamcp:12008
    networks:
      - nyra-network
    depends_on:
      - litellm-proxy
      - metamcp
      
  # Archon AI
  archon-ai:
    build:
      context: ./archon
      dockerfile: Dockerfile
    container_name: nyra-archon-ai
    ports:
      - "4001:4000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - LITELLM_PROXY_URL=http://litellm-proxy:4000
      - DATABASE_URL=postgresql://nyra_user:nyra_pass@postgres:5432/nyra_archon
    networks:
      - nyra-network
    depends_on:
      - litellm-proxy
      - postgres
      
  # Open WebUI
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: nyra-open-webui
    ports:
      - "3000:8080"
    environment:
      - OPENAI_API_BASE_URL=http://litellm-proxy:4000/v1
      - OPENAI_API_KEY=dummy-key
      - WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY}
    volumes:
      - open-webui-data:/app/backend/data
    networks:
      - nyra-network
    depends_on:
      - litellm-proxy
      
  # Lobe Chat
  lobe-chat:
    image: lobehub/lobe-chat:latest
    container_name: nyra-lobe-chat
    ports:
      - "3001:3210"
    environment:
      - OPENAI_API_KEY=dummy-key
      - OPENAI_PROXY_URL=http://litellm-proxy:4000/v1
    networks:
      - nyra-network
    depends_on:
      - litellm-proxy

volumes:
  open-webui-data:
    name: nyra-open-webui-data
```

---

## 📊 **COST MONITORING DASHBOARD**

### **Credit Usage Tracking**
```javascript
// config-consolidated/monitoring/credit-tracker.js
const creditTracker = {
  accounts: {
    anthropic: { budget: 100, used: 0, remaining: 100 },
    openai: { budget: 50, used: 0, remaining: 50 },
    google_1: { budget: 300, used: 0, remaining: 300 },
    google_2: { budget: 300, used: 0, remaining: 300 }
  },
  
  models: {
    'claude-orchestrator': { provider: 'anthropic', cost_per_1k: 0.015 },
    'archon-brain': { provider: 'openai', cost_per_1k: 0.005 },
    'google-bulk': { provider: 'google_1', cost_per_1k: 0.001 },
    'google-dev': { provider: 'google_2', cost_per_1k: 0.0002 }
  },
  
  routing_logic: {
    task_classification: {
      'orchestration': 'claude-orchestrator',
      'reasoning': 'claude-orchestrator', 
      'archon_tasks': 'archon-brain',
      'bulk_processing': 'google-bulk',
      'code_generation': 'google-dev',
      'embeddings': 'google-bulk'
    }
  }
};
```

---

## 🎯 **ORCHESTRATION CHANNEL DECISIONS**

### **Recommended Channel Allocation:**

**🏆 ORCHESTRATION CHANNEL:**
- `archon-mcp` - Primary orchestrator
- `claude-flow-mcp` - Secondary orchestrator  
- `flow-nexus-mcp` - Workflow management
- `casistack-mcp` - Docker orchestration
- `archgw-mcp` - Gateway management

**🤖 AI-FRAMEWORKS CHANNEL (Separate):**
- `anthropic-agents-sdk` - Premium reasoning
- `langgraph` - Graph-based workflows
- `autogen2` - Multi-agent conversations
- `swarm-mcp` - Swarm intelligence
- `hive-mind-mcp` - Collective intelligence

### **Rationale:**
1. **Separation of Concerns** - Orchestration vs AI Frameworks
2. **Cost Management** - Different channels can use different credit pools
3. **Load Balancing** - Distribute heavy AI workloads
4. **Scalability** - Easy to add/remove frameworks independently

---

## 🚀 **NEXT ACTIONS**

### **Immediate Steps:**
1. **Setup LiteLLM Proxy** - Unified API routing
2. **Configure Vertex AI** - Both Google accounts
3. **Deploy Security MCPs** - Infisical + Bitwarden
4. **Update MetaMCP Config** - New channel architecture

### **This Week:**
1. **Deploy Open WebUI + Lobe Chat** - User interfaces
2. **Setup Claude Flow** - Main orchestration brain
3. **Configure Archon** - Secondary orchestration
4. **Integrate Docker Hub MCP** - Container management

### **Next Week:**
1. **Add AI Frameworks Channel** - LangGraph, AutoGen2, etc.
2. **Deploy Google AI Tools** - Gemini CLI, assistants
3. **Setup Cost Monitoring** - Credit usage tracking
4. **Performance Optimization** - Load balancing

---

**🎯 This plan maximizes your $600 Google credits while strategically using Anthropic for high-value orchestration and OpenAI as fallback - estimated 6-8 months of heavy development usage!** 

Should I proceed with implementing the LiteLLM proxy and updated MetaMCP configuration first?
