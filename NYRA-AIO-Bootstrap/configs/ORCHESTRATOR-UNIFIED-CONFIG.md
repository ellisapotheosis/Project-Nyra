# Project Nyra - Unified Orchestrator Configuration

**Purpose**: Consolidated configuration strategy for dual-orchestrator architecture (Claude Flow + Archon OS) with supporting infrastructure (AgentDB, RuVector).

## 🏗️ Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │     Project Nyra Orchestration      │
                    └─────────────────────────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        ┌───────▼───────┐                      ┌───────▼───────┐
        │  Claude Flow  │                      │   Archon OS   │
        │   (Planning)  │                      │  (Execution)  │
        └───────┬───────┘                      └───────┬───────┘
                │                                       │
     ┌──────────┼─────────────┐                ┌──────┴──────┐
     │          │             │                │             │
┌────▼───┐ ┌───▼────┐ ┌──────▼─────┐  ┌──────▼──────┐ ┌───▼────┐
│AgentDB │ │RuVector│ │Claude Flow │  │  Archon MCP │ │ArchGW  │
│(Memory)│ │(Neural)│ │  MCP v3    │  │   Server    │ │  MCP   │
└────────┘ └────────┘ └────────────┘  └─────────────┘ └────────┘
```

## 📦 Component Inventory

### Claude Flow Stack
- **claude-flow@alpha** (V2) - Stable production version
- **claude-flow@alphav3** (V3) - Latest features with ADR architecture
- **claude-flow@cli** - Official CLI tool
- **AgentDB** - Vector database for agent memory (150x faster HNSW)
- **RuVector** - Neural substrate for agent intelligence

### Archon Stack
- **Archon OS** - Task execution orchestration framework
- **Archon MCP Server** - MCP integration for Archon
- **ArchGW MCP** - Gateway for Archon services

### Supporting Infrastructure
- **Infisical** - Secrets management
- **PostgreSQL** - Persistent storage for TwentyCRM, n8n, Dify
- **Redis** - Caching and session management
- **Nexus Router** - Multi-LLM gateway (port 6000)

---

## 🔧 Configuration Strategy

### Unified Configuration Locations

```
NYRA-AIO-Bootstrap/
├── configs/
│   ├── orchestrators/
│   │   ├── claude-flow/
│   │   │   ├── alpha-v2.config.json        # Stable production
│   │   │   ├── alpha-v3.config.json        # Latest features
│   │   │   ├── cli.config.json             # CLI tool
│   │   │   └── mcp-servers.json            # MCP server configs
│   │   │
│   │   ├── archon/
│   │   │   ├── archon-os.config.yaml       # Main Archon config
│   │   │   ├── mcp-server.config.json      # Archon MCP
│   │   │   └── archgw.config.json          # Gateway config
│   │   │
│   │   ├── agentdb/
│   │   │   ├── agentdb.config.json         # Vector DB config
│   │   │   └── namespaces.json             # Namespace definitions
│   │   │
│   │   └── ruvector/
│   │       ├── ruvector.config.json        # Neural config
│   │       └── models.json                 # Model definitions
│   │
│   ├── .env.orchestrator                    # PC1 environment
│   └── secrets.template                     # Secret placeholders
```

---

## 🌊 Claude Flow Configuration

### V2 (Alpha) - Production Stable

**File**: `configs/orchestrators/claude-flow/alpha-v2.config.json`

```json
{
  "version": "2.0.0-alpha",
  "mode": "production",
  "features": {
    "swarm_coordination": true,
    "hierarchical_topology": true,
    "task_orchestration": true,
    "memory_persistence": true,
    "neural_intelligence": false
  },
  "agents": {
    "max_concurrent": 31,
    "spawn_strategy": "hierarchical",
    "communication_pattern": "mesh"
  },
  "memory": {
    "backend": "agentdb",
    "namespace": "nyra-production",
    "ttl": 604800,
    "compression": "lz4"
  },
  "mcp_servers": [
    {
      "name": "claude-flow",
      "command": "node",
      "args": ["C:/Dev/Projects/claude-flow/dist/index.js"],
      "transport": "stdio",
      "enabled": true
    }
  ],
  "logging": {
    "level": "info",
    "format": "json",
    "destination": "loki"
  }
}
```

### V3 (Alpha V3) - Latest Features

**File**: `configs/orchestrators/claude-flow/alpha-v3.config.json`

```json
{
  "version": "3.0.0-alpha",
  "mode": "development",
  "features": {
    "swarm_coordination": true,
    "hierarchical_topology": true,
    "task_orchestration": true,
    "memory_persistence": true,
    "neural_intelligence": true,
    "reasoning_bank": true,
    "flash_attention": true,
    "hnsw_indexing": true
  },
  "architecture": {
    "pattern": "ddd",
    "adrs": [
      "ADR-001: Deep agentic-flow Integration",
      "ADR-006: Unified Memory Service",
      "ADR-009: Hybrid Memory Backend",
      "ADR-010: Claims-Based Authorization"
    ]
  },
  "agents": {
    "max_concurrent": 31,
    "spawn_strategy": "hierarchical",
    "communication_pattern": "adaptive",
    "intelligence": {
      "sona_learning": true,
      "trajectory_tracking": true,
      "pattern_distillation": true,
      "ewc_consolidation": true
    }
  },
  "memory": {
    "backend": "agentdb_hybrid",
    "hnsw_enabled": true,
    "quantization": "int8",
    "namespace": "nyra-v3",
    "ttl": 604800,
    "compression": "zstd"
  },
  "performance": {
    "flash_attention": {
      "enabled": true,
      "expected_speedup": "2.49x-7.47x"
    },
    "token_optimization": {
      "enabled": true,
      "expected_reduction": "50-75%"
    },
    "search_optimization": {
      "hnsw_enabled": true,
      "expected_speedup": "150x-12500x"
    }
  },
  "security": {
    "aidefence": {
      "enabled": true,
      "prompt_injection_detection": true,
      "behavioral_analysis": true
    },
    "claims_authorization": true,
    "pii_detection": true
  },
  "mcp_servers": [
    {
      "name": "claude-flow-v3",
      "command": "node",
      "args": ["C:/Dev/Projects/claude-flow-v3/dist/index.js"],
      "transport": "stdio",
      "enabled": true
    }
  ],
  "logging": {
    "level": "debug",
    "format": "json",
    "destination": "loki",
    "performance_tracking": true
  }
}
```

### CLI Configuration

**File**: `configs/orchestrators/claude-flow/cli.config.json`

```json
{
  "version": "1.0.0",
  "mode": "cli",
  "features": {
    "interactive_prompts": true,
    "command_decomposition": true,
    "hooks_integration": true,
    "workflow_automation": true
  },
  "hooks": {
    "pre_task": true,
    "post_task": true,
    "pre_edit": true,
    "post_edit": true,
    "session_management": true,
    "worker_dispatch": true
  },
  "mcp_servers": [
    {
      "name": "claude-flow-cli",
      "command": "npx",
      "args": ["@claude-flow/cli"],
      "transport": "stdio",
      "enabled": true
    }
  ]
}
```

### MCP Server Registry

**File**: `configs/orchestrators/claude-flow/mcp-servers.json`

```json
{
  "servers": {
    "claude-flow": {
      "version": "2.0.0-alpha",
      "command": "node",
      "args": ["C:/Dev/Projects/claude-flow/dist/index.js"],
      "transport": "stdio",
      "capabilities": [
        "agent_spawn",
        "swarm_init",
        "task_orchestrate",
        "memory_store",
        "workflow_execute"
      ]
    },
    "agentdb": {
      "version": "1.0.0",
      "command": "npx",
      "args": ["agentdb-mcp"],
      "transport": "stdio",
      "capabilities": [
        "vector_search",
        "pattern_store",
        "hnsw_indexing",
        "quantization"
      ]
    },
    "ruvector": {
      "version": "1.0.0",
      "command": "python",
      "args": ["-m", "ruvector.mcp"],
      "transport": "stdio",
      "capabilities": [
        "neural_training",
        "trajectory_tracking",
        "reasoning_bank"
      ]
    }
  }
}
```

---

## 🏛️ Archon OS Configuration

### Main Configuration

**File**: `configs/orchestrators/archon/archon-os.config.yaml`

```yaml
version: "1.0.0"
mode: production

orchestration:
  task_router:
    enabled: true
    strategy: priority_queue
    concurrency: 10

  execution_engine:
    enabled: true
    timeout: 300
    retry_strategy: exponential_backoff
    max_retries: 3

agents:
  registry:
    - name: fastapi_backend_engineer
      type: specialized
      domain: backend
      capabilities:
        - python
        - fastapi
        - async_io

    - name: nextjs_frontend_engineer
      type: specialized
      domain: frontend
      capabilities:
        - typescript
        - react
        - nextjs

    - name: compliance_sentinel
      type: specialized
      domain: compliance
      capabilities:
        - tila_validation
        - respa_validation
        - ecoa_validation

    - name: devops_orchestrator
      type: specialized
      domain: infrastructure
      capabilities:
        - docker
        - kubernetes
        - monitoring

mcp_integration:
  server_url: "http://localhost:5555"
  auth_token: "${ARCHON_MCP_TOKEN}"
  timeout: 30

logging:
  level: info
  format: json
  destination: loki
  metrics_enabled: true

secrets:
  provider: infisical
  project_id: "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
  environment: production
```

### Archon MCP Server

**File**: `configs/orchestrators/archon/mcp-server.config.json`

```json
{
  "server": {
    "name": "archon-mcp",
    "version": "1.0.0",
    "port": 5555,
    "host": "0.0.0.0"
  },
  "capabilities": [
    "task_execution",
    "agent_coordination",
    "workflow_management",
    "compliance_validation"
  ],
  "integration": {
    "archon_os_url": "http://localhost:5556",
    "claude_flow_url": "http://localhost:6000"
  },
  "security": {
    "require_auth": true,
    "token_validation": true,
    "rate_limiting": {
      "enabled": true,
      "requests_per_minute": 100
    }
  }
}
```

### ArchGW Gateway

**File**: `configs/orchestrators/archon/archgw.config.json`

```json
{
  "gateway": {
    "name": "archgw",
    "version": "1.0.0",
    "port": 5557
  },
  "routes": [
    {
      "path": "/api/tasks",
      "target": "http://localhost:5556/tasks",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "path": "/api/agents",
      "target": "http://localhost:5556/agents",
      "methods": ["GET", "POST"]
    },
    {
      "path": "/api/workflows",
      "target": "http://localhost:5556/workflows",
      "methods": ["GET", "POST", "PUT"]
    }
  ],
  "middleware": {
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:3100", "http://localhost:3101"]
    },
    "authentication": {
      "enabled": true,
      "type": "jwt"
    },
    "rate_limiting": {
      "enabled": true,
      "requests_per_minute": 60
    }
  }
}
```

---

## 🧠 AgentDB Configuration

**File**: `configs/orchestrators/agentdb/agentdb.config.json`

```json
{
  "database": {
    "name": "agentdb",
    "version": "1.0.0",
    "storage_path": "/data/agentdb"
  },
  "vector_store": {
    "backend": "hnsw",
    "dimensions": 384,
    "distance_metric": "cosine",
    "index_type": "hnsw",
    "hnsw_config": {
      "m": 16,
      "ef_construction": 200,
      "ef_search": 50
    }
  },
  "quantization": {
    "enabled": true,
    "method": "int8",
    "memory_reduction": "4x"
  },
  "namespaces": [
    {
      "name": "nyra-production",
      "description": "Production agent memory",
      "ttl": 604800,
      "max_vectors": 1000000
    },
    {
      "name": "nyra-v3",
      "description": "V3 development memory",
      "ttl": 604800,
      "max_vectors": 1000000
    },
    {
      "name": "mortgage-domain",
      "description": "Mortgage domain knowledge",
      "ttl": null,
      "max_vectors": 500000
    },
    {
      "name": "compliance-rules",
      "description": "Compliance regulations",
      "ttl": null,
      "max_vectors": 100000
    }
  ],
  "performance": {
    "cache_size": 1024,
    "batch_size": 100,
    "parallel_threads": 4
  }
}
```

**File**: `configs/orchestrators/agentdb/namespaces.json`

```json
{
  "namespaces": {
    "nyra-production": {
      "purpose": "Production agent memory",
      "collections": [
        "agent_conversations",
        "task_history",
        "workflow_executions"
      ]
    },
    "nyra-v3": {
      "purpose": "V3 development and testing",
      "collections": [
        "trajectory_tracking",
        "reasoning_bank",
        "pattern_distillation"
      ]
    },
    "mortgage-domain": {
      "purpose": "Mortgage industry knowledge",
      "collections": [
        "loan_types",
        "rate_adjustments",
        "compliance_rules"
      ]
    },
    "compliance-rules": {
      "purpose": "Regulatory compliance database",
      "collections": [
        "tila_requirements",
        "respa_requirements",
        "ecoa_requirements",
        "state_regulations"
      ]
    }
  }
}
```

---

## 🔮 RuVector Configuration

**File**: `configs/orchestrators/ruvector/ruvector.config.json`

```json
{
  "neural_substrate": {
    "name": "ruvector",
    "version": "1.0.0",
    "framework": "sona"
  },
  "learning": {
    "trajectory_tracking": {
      "enabled": true,
      "buffer_size": 1000
    },
    "reasoning_bank": {
      "enabled": true,
      "verdict_judgment": true,
      "pattern_distillation": true
    },
    "ewc_consolidation": {
      "enabled": true,
      "lambda": 1000,
      "fisher_samples": 100
    }
  },
  "models": {
    "embedding": {
      "model_id": "all-MiniLM-L6-v2",
      "dimensions": 384,
      "onnx_optimized": true
    },
    "hyperbolic": {
      "enabled": true,
      "curvature": -1,
      "poincare_ball": true
    }
  },
  "performance": {
    "flash_attention": {
      "enabled": true,
      "expected_speedup": 2.49
    },
    "moe_routing": {
      "enabled": true,
      "num_experts": 8,
      "top_k": 2
    }
  }
}
```

**File**: `configs/orchestrators/ruvector/models.json`

```json
{
  "models": {
    "all-MiniLM-L6-v2": {
      "type": "embedding",
      "dimensions": 384,
      "max_sequence_length": 512,
      "onnx_path": "/models/all-MiniLM-L6-v2.onnx",
      "use_case": "general_purpose"
    },
    "all-mpnet-base-v2": {
      "type": "embedding",
      "dimensions": 768,
      "max_sequence_length": 514,
      "onnx_path": "/models/all-mpnet-base-v2.onnx",
      "use_case": "high_accuracy"
    }
  }
}
```

---

## 🔐 Environment Variables

**File**: `configs/.env.orchestrator`

```bash
# ============================================
# Project Nyra - Orchestrator Environment
# PC1 (Mac Mini)
# ============================================

# System
NODE_ENV=production
NYRA_PC_ROLE=ORCHESTRATOR
NYRA_ROOT=/Users/nyra/Dev/Projects/Project-Nyra

# Claude Flow
CLAUDE_FLOW_VERSION=alpha-v2
CLAUDE_FLOW_MODE=production
CLAUDE_FLOW_MAX_AGENTS=31

# Archon OS
ARCHON_OS_PORT=5556
ARCHON_MCP_PORT=5555
ARCHGW_PORT=5557
ARCHON_MCP_TOKEN=<generate-secure-token>

# AgentDB
AGENTDB_STORAGE_PATH=/data/agentdb
AGENTDB_HNSW_ENABLED=true
AGENTDB_QUANTIZATION=int8

# RuVector
RUVECTOR_ENABLED=true
RUVECTOR_MODELS_PATH=/models/ruvector
RUVECTOR_FLASH_ATTENTION=true

# Nexus Router (LLM Gateway)
NEXUS_ROUTER_PORT=6000
ANTHROPIC_API_KEY=<from-infisical>
OPENROUTER_API_KEY=<from-infisical>
GOOGLE_API_KEY=<from-infisical>
NEXUS_DEFAULT_PROVIDER=anthropic
NEXUS_FALLBACK_PROVIDERS=openrouter,google

# Letta (Conversational Memory)
LETTA_PORT=8283
LETTA_POSTGRES_HOST=postgres-letta
LETTA_POSTGRES_DB=letta
LETTA_POSTGRES_USER=letta
LETTA_POSTGRES_PASSWORD=<from-infisical>

# Mem0 (Universal Memory)
MEM0_PORT=4321
MEM0_POSTGRES_HOST=postgres-mem0
MEM0_POSTGRES_DB=mem0
MEM0_POSTGRES_USER=mem0
MEM0_POSTGRES_PASSWORD=<from-infisical>

# Infisical (Secrets Management)
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENVIRONMENT=production
INFISICAL_CLIENT_ID=<from-setup>
INFISICAL_CLIENT_SECRET=<from-setup>

# Observability
LOKI_URL=http://10.0.0.4:3100
PROMETHEUS_URL=http://10.0.0.4:9090
GRAFANA_URL=http://10.0.0.4:3005

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=loki
```

---

## 🚀 Deployment Workflow

### Step 1: Initialize Configuration

```bash
# From NYRA-AIO-Bootstrap directory
./scripts/init-orchestrator-config.sh
```

This script:
1. Copies configuration templates to working directory
2. Generates secure tokens for Archon MCP
3. Fetches secrets from Infisical
4. Creates `.env.orchestrator` with real values

### Step 2: Deploy Docker Services

```bash
# PC1 - Orchestrator services only
docker-compose --profile orchestrator up -d
```

### Step 3: Verify Services

```bash
# Check all orchestrator services
./scripts/health-check-orchestrator.sh
```

Expected output:
```
[✓] Nexus Router    - http://localhost:6000/health
[✓] Letta          - http://localhost:8283/health
[✓] Mem0           - http://localhost:4321/health
[✓] Claude Flow    - MCP stdio connection OK
[✓] Archon OS      - http://localhost:5556/health
[✓] Archon MCP     - http://localhost:5555/health
[✓] ArchGW         - http://localhost:5557/health
[✓] AgentDB        - Connection OK
[✓] RuVector       - Neural substrate initialized
```

---

## 🔄 Switching Between Versions

### Switch to Claude Flow V3

```bash
# Update environment
export CLAUDE_FLOW_VERSION=alpha-v3

# Restart Claude Flow services
docker-compose restart claude-flow

# Verify
curl http://localhost:6000/health
```

### Rollback to V2

```bash
# Update environment
export CLAUDE_FLOW_VERSION=alpha-v2

# Restart services
docker-compose restart claude-flow
```

---

## 📊 Monitoring and Metrics

### Grafana Dashboards

Access at http://10.0.0.4:3005:

1. **Orchestrator Overview** - All orchestrator services
2. **Claude Flow Performance** - Agent spawning, task execution
3. **Archon OS Performance** - Task routing, execution metrics
4. **Memory Usage** - AgentDB and RuVector memory consumption
5. **LLM Token Usage** - Nexus Router provider statistics

### Prometheus Queries

```promql
# Agent spawn rate
rate(claude_flow_agent_spawned_total[5m])

# Task execution duration
histogram_quantile(0.95, rate(archon_task_duration_seconds_bucket[5m]))

# Memory search latency
histogram_quantile(0.95, rate(agentdb_search_duration_seconds_bucket[5m]))

# LLM provider fallback rate
rate(nexus_provider_fallback_total[5m])
```

---

## 🔧 Troubleshooting

### Claude Flow Not Starting

```bash
# Check logs
docker-compose logs claude-flow

# Common issues:
# 1. Port conflict on 6000
netstat -ano | findstr :6000

# 2. MCP server not found
which node
ls C:/Dev/Projects/claude-flow/dist/index.js

# 3. AgentDB connection failed
docker-compose logs agentdb
```

### Archon OS Task Routing Failing

```bash
# Check Archon logs
docker-compose logs archon-os

# Verify MCP server
curl http://localhost:5555/health

# Test agent registry
curl http://localhost:5556/agents
```

### AgentDB High Memory Usage

```bash
# Check memory stats
docker stats agentdb

# Enable quantization
docker-compose exec agentdb agentdb-cli quantize --method int8

# Compact database
docker-compose exec agentdb agentdb-cli compact
```

---

## 📚 Additional Resources

- **Claude Flow Documentation**: C:\Dev\Projects\claude-flow\README.md
- **Archon OS Guide**: C:\Dev\Projects\archon-os\docs\
- **AgentDB API Reference**: https://agentdb.dev/api
- **RuVector Neural Docs**: https://ruvector.dev/docs

---

**Last Updated**: 2026-01-13
