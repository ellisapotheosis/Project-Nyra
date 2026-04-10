# Project Nyra - Master Environment Variables

**Version**: 3.0.0
**Last Updated**: 2026-01-13
**Maintainer**: Project Nyra Team

## 📋 Table of Contents

1. [Overview](#overview)
2. [Security Best Practices](#security-best-practices)
3. [Variable Categories](#variable-categories)
4. [Core System Variables](#1-core-system-variables)
5. [LLM Providers & AI Services](#2-llm-providers--ai-services)
6. [Database Services](#3-database-services)
7. [archon-os Orchestration](#4-archon-os-orchestration)
8. [ruvector Configuration](#5-ruvector-configuration)
9. [ReasoningBank & Memory Systems](#6-reasoningbank--memory-systems)
10. [Security & Authentication](#7-security--authentication)
11. [Networking & Infrastructure](#8-networking--infrastructure)
12. [Monitoring & Observability](#9-monitoring--observability)
13. [Per-PC Configuration](#10-per-pc-configuration)
14. [GPU Workers & Ollama](#11-gpu-workers--ollama)
15. [Workflow Automation](#12-workflow-automation)
16. [External APIs & Services](#13-external-apis--services)
17. [Advanced Features](#14-advanced-features)
18. [Quick Reference](#quick-reference)
19. [Validation Checklist](#validation-checklist)

---

## Overview

This document provides a comprehensive catalog of all environment variables used across the Project Nyra platform, including the 4-PC distributed GPU setup with dual orchestrators (archon-os and Archon OS).

### Key Principles

- **Security First**: Never commit secrets to version control
- **Per-Environment**: Use separate .env files for dev/staging/production
- **Type Safety**: Variables are strongly typed and validated
- **Documentation**: Each variable includes purpose, format, and examples
- **4-PC Aware**: Special variables for distributed GPU worker architecture

---

## Security Best Practices

### Secret Generation Commands

```bash
# JWT Secret (256-bit)
openssl rand -base64 32

# Session Secret (256-bit)
openssl rand -base64 32

# Encryption Key (256-bit)
openssl rand -base64 32

# Strong Password (32 characters)
openssl rand -base64 24

# API Key Format (64 characters)
openssl rand -hex 32
```

### Secret Storage Hierarchy

#### 🔴 Critical Secrets (Infisical with restricted access)
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`
- `POSTGRES_PASSWORD`, `REDIS_PASSWORD`
- `JWT_SECRET`, `ENCRYPTION_KEY`, `SESSION_SECRET`
- `GITHUB_TOKEN`, `CLOUDFLARE_TUNNEL_TOKEN`

#### 🟠 High Secrets (Infisical)
- `LETTA_API_KEY`, `MEM0_API_KEY`, `LITELLM_MASTER_KEY`
- `SENDGRID_API_KEY`, `TWILIO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`, `TAILSCALE_AUTH_KEY`

#### 🟡 Medium Secrets (Encrypted .env)
- `N8N_BASIC_AUTH_PASSWORD`, `GRAFANA_ADMIN_PASSWORD`
- `DIFY_SECRET_KEY`, `ACTIVEPIECES_API_KEY`

#### 🟢 Configuration (Version control safe)
- All non-secret variables (ports, modes, feature flags, paths)

---

## Variable Categories

| Category | Count | Priority | Examples |
|----------|-------|----------|----------|
| Core System | 15 | Critical | NODE_ENV, LOG_LEVEL, PORT |
| LLM Providers | 12 | Critical | ANTHROPIC_API_KEY, OPENROUTER_API_KEY |
| Databases | 18 | Critical | DATABASE_URL, REDIS_URL, POSTGRES_* |
| archon-os | 35 | High | CLAUDE_FLOW_MODE, CLAUDE_FLOW_WORKERS |
| ruvector | 22 | High | ruvector_ENABLED, ruvector_HNSW_M |
| Security | 14 | Critical | JWT_SECRET, ENCRYPTION_KEY |
| Networking | 16 | High | TAILSCALE_AUTH_KEY, CLOUDFLARE_TUNNEL_TOKEN |
| Monitoring | 12 | Medium | PROMETHEUS_PORT, GRAFANA_ADMIN_PASSWORD |
| Per-PC | 24 | High | PC_NAME, GPU_MODEL, LAN_IP |
| GPU Workers | 18 | High | OLLAMA_HOST, GPU_MEMORY_FRACTION |
| External APIs | 20 | Medium | SENDGRID_API_KEY, STRIPE_SECRET_KEY |
| Advanced | 15 | Low | AWS_*, GCP_*, AZURE_* |

**Total Variables**: 221

---

## 1. Core System Variables

### General Configuration

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `NODE_ENV` | Yes | String | development | Runtime environment | `production` | 🟢 Config |
| `DEBUG` | No | Boolean | false | Enable debug logging | `true` | 🟢 Config |
| `LOG_LEVEL` | No | String | info | Global logging level | `info\|debug\|warn\|error` | 🟢 Config |
| `PORT` | No | Number | 3000 | Application HTTP port | `3000` | 🟢 Config |
| `HOST` | No | String | 0.0.0.0 | Bind address | `0.0.0.0` | 🟢 Config |
| `TZ` | No | String | UTC | Timezone | `America/New_York` | 🟢 Config |
| `LANG` | No | String | en_US.UTF-8 | Locale | `en_US.UTF-8` | 🟢 Config |

### Process Management

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `NODE_OPTIONS` | No | String | - | Node.js runtime flags | `--max-old-space-size=4096` | 🟢 Config |
| `WORKERS` | No | Number | 4 | Number of worker processes | `8` | 🟢 Config |
| `MAX_MEMORY_MB` | No | Number | 4096 | Max memory per process (MB) | `8192` | 🟢 Config |

**Used By**: All services, orchestrator, workers

---

## 2. LLM Providers & AI Services

### Anthropic Claude

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ANTHROPIC_API_KEY` | Yes* | Secret | - | Claude API key | `sk-ant-api03-...` | 🔴 Critical |
| `ANTHROPIC_BASE_URL` | No | String | https://api.anthropic.com | API endpoint override | `https://api.anthropic.com` | 🟢 Config |
| `ANTHROPIC_MODEL` | No | String | claude-3-5-sonnet-20241022 | Default model | `claude-opus-4-5-20251101` | 🟢 Config |
| `ANTHROPIC_MAX_TOKENS` | No | Number | 8192 | Max tokens per request | `8192` | 🟢 Config |

### OpenAI

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `OPENAI_API_KEY` | Yes* | Secret | - | OpenAI API key | `sk-...` | 🔴 Critical |
| `OPENAI_BASE_URL` | No | String | https://api.openai.com/v1 | API endpoint | `https://api.openai.com/v1` | 🟢 Config |
| `OPENAI_MODEL` | No | String | gpt-4-turbo | Default model | `gpt-4-turbo` | 🟢 Config |

### OpenRouter

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `OPENROUTER_API_KEY` | Yes* | Secret | - | OpenRouter API key | `sk-or-v1-...` | 🔴 Critical |
| `OPENROUTER_BASE_URL` | No | String | https://openrouter.ai/api/v1 | API endpoint | `https://openrouter.ai/api/v1` | 🟢 Config |
| `OPENROUTER_MODEL` | No | String | - | Preferred model | `anthropic/claude-3-5-sonnet` | 🟢 Config |

### LiteLLM (Unified Proxy)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `LITELLM_MASTER_KEY` | Yes | Secret | - | Master API key | `sk-litellm-...` | 🔴 Critical |
| `LITELLM_BASE_URL` | No | String | http://localhost:4000 | LiteLLM proxy URL | `http://nyra-litellm:4000` | 🟢 Config |
| `LITELLM_DATABASE_URL` | No | String | - | Postgres connection for logs | `postgresql://...` | 🟡 Medium |

**Note**: At least ONE LLM provider API key is required (* = conditionally required)

**Used By**: archon-os, archon-os, dify, n8n workflows, custom agents

---

## 3. Database Services

### PostgreSQL (Primary Database)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `DATABASE_URL` | Yes* | Secret | - | Complete connection string | `postgresql://user:pass@host:5432/db` | 🔴 Critical |
| `POSTGRES_HOST` | Yes* | String | localhost | Database host | `orchestrator-mini` | 🟢 Config |
| `POSTGRES_PORT` | No | Number | 5432 | Database port | `5432` | 🟢 Config |
| `POSTGRES_USER` | Yes | String | postgres | Database user | `postgres` | 🟢 Config |
| `POSTGRES_PASSWORD` | Yes | Secret | - | Database password | `${GENERATE_PASSWORD}` | 🔴 Critical |
| `POSTGRES_DB` | Yes | String | nyra | Primary database name | `nyra` | 🟢 Config |
| `POSTGRES_MULTIPLE_DATABASES` | No | String | - | Comma-separated DB names | `dify,twenty,letta,n8n` | 🟢 Config |
| `PGHOST` | No | String | - | Alternative to POSTGRES_HOST | `postgres` | 🟢 Config |
| `PGPORT` | No | Number | - | Alternative to POSTGRES_PORT | `5432` | 🟢 Config |
| `PGUSER` | No | String | - | Alternative to POSTGRES_USER | `postgres` | 🟢 Config |
| `PGPASSWORD` | No | Secret | - | Alternative to POSTGRES_PASSWORD | `${POSTGRES_PASSWORD}` | 🔴 Critical |
| `PGDATABASE` | No | String | - | Alternative to POSTGRES_DB | `nyra` | 🟢 Config |

**Note**: Use either `DATABASE_URL` OR individual `POSTGRES_*` variables (not both)

### Redis (Caching & Message Broker)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `REDIS_URL` | Yes* | Secret | - | Complete connection string | `redis://:pass@host:6379` | 🟡 Medium |
| `REDIS_HOST` | Yes* | String | localhost | Redis host | `orchestrator-mini` | 🟢 Config |
| `REDIS_PORT` | No | Number | 6380 | Redis port (6380 to avoid FalkorDB conflict) | `6380` | 🟢 Config |
| `REDIS_PASSWORD` | No | Secret | - | Redis password (if enabled) | `${GENERATE_PASSWORD}` | 🟡 Medium |
| `REDIS_DB` | No | Number | 0 | Redis database number | `0` | 🟢 Config |
| `REDIS_USE_SSL` | No | Boolean | false | Enable SSL/TLS | `false` | 🟢 Config |

### Qdrant (Vector Database)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `QDRANT_URL` | No | String | http://localhost:6333 | Qdrant server URL | `http://nyra-qdrant:6333` | 🟢 Config |
| `QDRANT_API_KEY` | No | Secret | - | Qdrant API key (cloud) | `${QDRANT_API_KEY}` | 🟡 Medium |
| `QDRANT_COLLECTION` | No | String | nyra_vectors | Default collection name | `nyra_vectors` | 🟢 Config |

### FalkorDB (Graph Database)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `FALKORDB_URL` | No | String | redis://localhost:6379 | FalkorDB connection | `redis://nyra-falkordb:6379` | 🟢 Config |
| `FALKORDB_GRAPH_NAME` | No | String | nyra_graph | Default graph name | `nyra_graph` | 🟢 Config |

**Used By**: All services requiring persistence, caching, vector search, or graph queries

---

## 4. archon-os Orchestration

### Core Configuration

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `CLAUDE_FLOW_MODE` | Yes | String | orchestrator | Operation mode | `orchestrator\|worker\|hybrid` | 🟢 Config |
| `CLAUDE_FLOW_WORKERS` | No | Number | 4 | Number of worker processes | `8` | 🟢 Config |
| `CLAUDE_FLOW_MEMORY_BACKEND` | No | String | sqlite | Memory backend type | `sqlite\|postgresql\|ruvector` | 🟢 Config |
| `CLAUDE_FLOW_DEBUG` | No | Boolean | false | Enable debug mode | `true` | 🟢 Config |
| `CLAUDE_FLOW_LOG_LEVEL` | No | String | info | Logging level | `debug\|info\|warn\|error` | 🟢 Config |
| `CLAUDE_FLOW_MAX_AGENTS` | No | Number | 100 | Max concurrent agents | `100` | 🟢 Config |
| `CLAUDE_FLOW_MAX_CONCURRENT_TASKS` | No | Number | 50 | Max concurrent tasks | `50` | 🟢 Config |

### Swarm Configuration

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `SWARM_TOPOLOGY` | No | String | hierarchical | Swarm topology type | `mesh\|hierarchical\|ring\|star` | 🟢 Config |
| `SWARM_MAX_AGENTS` | No | Number | 31 | Maximum agents in swarm | `31` | 🟢 Config |
| `SWARM_STRATEGY` | No | String | balanced | Distribution strategy | `balanced\|specialized\|adaptive` | 🟢 Config |
| `SWARM_MEMORY_PATH` | No | String | .swarm/memory.db | Swarm memory database | `.swarm/memory.db` | 🟢 Config |

### Session & State Management

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `SESSION_ID` | No | String | auto | Current session identifier | `session-${timestamp}` | 🟢 Config |
| `SESSION_RESTORE` | No | Boolean | false | Auto-restore previous session | `true` | 🟢 Config |
| `SESSION_SAVE_PATH` | No | String | .archon-os/sessions | Session storage directory | `.archon-os/sessions` | 🟢 Config |

### MCP Server Configuration

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `MCP_SERVERS` | No | JSON | {} | MCP server configurations | `{"filesystem":{...}}` | 🟢 Config |
| `MCP_TIMEOUT` | No | Number | 30000 | MCP operation timeout (ms) | `30000` | 🟢 Config |

**Used By**: archon-os@alpha, archon-os@alphav3, @archon-os/cli, all swarm agents

---

## 5. ruvector Configuration

### Core Settings

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ruvector_ENABLED` | No | Boolean | false | Enable ruvector integration | `true` | 🟢 Config |
| `ruvector_URL` | Yes* | String | - | ruvector connection URL | `postgresql://localhost:5432/ruvector` | 🟡 Medium |
| `ruvector_PATH` | No | String | .ruvector/archon-os.db | SQLite database path | `.ruvector/archon-os.db` | 🟢 Config |

### Vector Configuration

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ruvector_QUANTIZATION` | No | String | scalar | Vector quantization method | `binary\|scalar\|product\|none` | 🟢 Config |
| `ruvector_CACHE_SIZE` | No | Number | 1000 | LRU cache size | `1000` | 🟢 Config |
| `ruvector_HNSW_M` | No | Number | 16 | HNSW index M parameter | `16` (4-64 range) | 🟢 Config |
| `ruvector_HNSW_EF` | No | Number | 100 | HNSW index EF parameter | `100` | 🟢 Config |
| `ruvector_HNSW_EF_CONSTRUCTION` | No | Number | 200 | HNSW construction EF | `200` | 🟢 Config |

### Learning Plugins

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ruvector_LEARNING` | No | Boolean | false | Enable learning plugins | `true` | 🟢 Config |
| `ruvector_LEARNING_ALGORITHM` | No | String | decision-transformer | Learning algorithm | `decision-transformer\|q-learning\|sarsa` | 🟢 Config |
| `ruvector_REASONING` | No | Boolean | false | Enable reasoning agents | `true` | 🟢 Config |

### QUIC Synchronization

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ruvector_QUIC_SYNC` | No | Boolean | false | Enable QUIC sync | `true` | 🟢 Config |
| `ruvector_QUIC_PORT` | No | Number | 4433 | QUIC server port | `4433` | 🟢 Config |
| `ruvector_QUIC_PEERS` | No | String | - | Comma-separated peer addresses | `10.0.0.2:4433,10.0.0.3:4433` | 🟢 Config |

**Performance Notes**:
- **HNSW Indexing**: 150x-12,500x faster than linear search
- **Quantization**: `binary` = 32x memory reduction, `scalar` = 4x, `product` = 8x
- **Cache Size**: Increase for large datasets (1000-10000 range)

**Used By**: archon-os with ruvector backend, distributed memory systems

---

## 6. ReasoningBank & Memory Systems

### ReasoningBank Core

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `REASONINGBANK_ENABLED` | No | Boolean | false | Enable ReasoningBank | `true` | 🟢 Config |
| `REASONINGBANK_DB_PATH` | No | String | .swarm/memory.db | Memory database path | `.swarm/memory.db` | 🟢 Config |
| `REASONINGBANK_K` | No | Number | 3 | Top-K memories to retrieve | `3` (1-10 range) | 🟢 Config |
| `REASONINGBANK_MIN_CONFIDENCE` | No | Number | 0.5 | Minimum confidence threshold | `0.5` (0-1 range) | 🟢 Config |

### archon-os Training

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `AGENTIC_FLOW_TRAINING` | No | Boolean | false | Enable trajectory training | `true` | 🟢 Config |
| `AGENTIC_FLOW_TRAINING_MODE` | No | String | online | Training mode | `online\|offline\|hybrid` | 🟢 Config |
| `AGENTIC_FLOW_EWC_LAMBDA` | No | Number | 0.4 | EWC++ regularization | `0.4` (0-1 range) | 🟢 Config |

### Letta (MemGPT)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `LETTA_API_KEY` | Yes* | Secret | - | Letta API key | `${GENERATE_API_KEY}` | 🟡 Medium |
| `LETTA_SERVER_PASS` | Yes* | Secret | - | Letta server password | `${GENERATE_PASSWORD}` | 🟡 Medium |
| `LETTA_PG_URI` | Yes* | String | - | PostgreSQL connection | `postgresql://postgres:pass@host:5432/letta` | 🟡 Medium |
| `LETTA_BASE_URL` | No | String | http://localhost:8283 | Letta server URL | `http://nyra-letta:8283` | 🟢 Config |

### Mem0

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `MEM0_API_KEY` | Yes* | Secret | - | Mem0 API key | `${MEM0_API_KEY}` | 🟡 Medium |
| `MEM0_DEFAULT_USER_ID` | No | String | default | Default user ID | `nyra-user` | 🟢 Config |
| `MEM0_BASE_URL` | No | String | https://api.mem0.ai | Mem0 API endpoint | `https://api.mem0.ai` | 🟢 Config |
| `MEM0_VECTOR_STORE` | No | String | qdrant | Vector store backend | `qdrant\|pinecone` | 🟢 Config |
| `MEM0_QDRANT_URL` | No | String | http://qdrant:6333 | Qdrant connection | `http://nyra-qdrant:6333` | 🟢 Config |

### Zep

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ZEP_API_KEY` | Yes* | Secret | - | Zep API key | `${ZEP_API_KEY}` | 🟡 Medium |
| `ZEP_API_URL` | No | String | https://api.getzep.com | Zep API endpoint | `https://api.getzep.com` | 🟢 Config |

**Memory Architecture**:
- **ReasoningBank**: Adaptive learning with trajectory tracking
- **ruvector**: Fast vector search with HNSW indexing
- **Letta**: Long-term conversation memory (stateful)
- **Mem0**: Persistent agent memory
- **Zep**: Temporal context management

**Used By**: All agents requiring persistent memory, learning systems, reasoning chains

---

## 7. Security & Authentication

### Core Security

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `JWT_SECRET` | Yes | Secret | - | JWT signing secret (256-bit) | `${openssl rand -base64 32}` | 🔴 Critical |
| `SESSION_SECRET` | Yes | Secret | - | Session cookie secret (256-bit) | `${openssl rand -base64 32}` | 🔴 Critical |
| `ENCRYPTION_KEY` | Yes | Secret | - | Data encryption key (256-bit) | `${openssl rand -base64 32}` | 🔴 Critical |
| `JWT_EXPIRATION` | No | String | 24h | JWT token expiration | `24h\|7d\|30d` | 🟢 Config |
| `REFRESH_TOKEN_EXPIRATION` | No | String | 7d | Refresh token expiration | `7d` | 🟢 Config |

### Rate Limiting

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `RATE_LIMIT_WINDOW` | No | Number | 900000 | Rate limit window (ms) | `900000` (15 min) | 🟢 Config |
| `RATE_LIMIT_MAX` | No | Number | 100 | Max requests per window | `100` | 🟢 Config |

### Service-Specific Auth

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `GITHUB_TOKEN` | Yes* | Secret | - | GitHub personal access token | `ghp_...` | 🔴 Critical |
| `DIFY_SECRET_KEY` | Yes* | Secret | - | Dify secret key | `${GENERATE_SECRET}` | 🟡 Medium |
| `DIFY_ENCRYPTION_KEY` | Yes* | Secret | - | Dify encryption key | `${GENERATE_SECRET}` | 🟡 Medium |
| `N8N_ENCRYPTION_KEY` | Yes* | Secret | - | n8n encryption key | `${GENERATE_SECRET}` | 🟡 Medium |
| `N8N_BASIC_AUTH_USER` | No | String | admin | n8n basic auth user | `admin` | 🟢 Config |
| `N8N_BASIC_AUTH_PASSWORD` | Yes* | Secret | - | n8n basic auth password | `${GENERATE_PASSWORD}` | 🟡 Medium |

**Security Notes**:
- Rotate secrets every 90 days
- Use different secrets per environment
- Store in Infisical or similar vault
- Never log or expose secrets in error messages

**Used By**: All authenticated services, API gateways, session management

---

## 8. Networking & Infrastructure

### Tailscale (Mesh VPN)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `TAILSCALE_AUTH_KEY` | Yes* | Secret | - | Tailscale authentication key | `tskey-auth-...` | 🔴 Critical |
| `TAILSCALE_HOSTNAME` | No | String | - | Node hostname in tailnet | `nyra-orchestrator` | 🟢 Config |
| `TAILSCALE_ADVERTISE_ROUTES` | No | String | - | Subnet routes to advertise | `10.0.0.0/24` | 🟢 Config |
| `TAILSCALE_ACCEPT_ROUTES` | No | Boolean | true | Accept subnet routes | `true` | 🟢 Config |

### Cloudflare Tunnel

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `CLOUDFLARE_TUNNEL_TOKEN` | Yes* | Secret | - | Tunnel authentication token | `${CF_TUNNEL_TOKEN}` | 🔴 Critical |
| `CLOUDFLARE_TUNNEL_ID` | No | String | - | Tunnel UUID | `${TUNNEL_UUID}` | 🟢 Config |
| `CLOUDFLARE_ACCOUNT_ID` | No | String | - | Cloudflare account ID | `${ACCOUNT_ID}` | 🟢 Config |

### Static IP Configuration (4-PC Setup)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `LAN_IP` | Yes | String | - | Local network IP address | `10.0.0.1` | 🟢 Config |
| `LAN_GATEWAY` | No | String | 10.0.0.1 | Network gateway | `10.0.0.1` | 🟢 Config |
| `LAN_SUBNET` | No | String | 255.255.255.0 | Subnet mask | `255.255.255.0` | 🟢 Config |
| `TAILSCALE_IP` | No | String | - | Tailscale VPN IP (100.x.x.x) | `100.64.0.1` | 🟢 Config |

### Nginx / Caddy

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `NGINX_PORT` | No | Number | 80 | Nginx HTTP port | `80` | 🟢 Config |
| `NGINX_SSL_PORT` | No | Number | 443 | Nginx HTTPS port | `443` | 🟢 Config |
| `SSL_CERT_PATH` | No | String | - | SSL certificate path | `/etc/ssl/certs/cert.pem` | 🟢 Config |
| `SSL_KEY_PATH` | No | String | - | SSL key path | `/etc/ssl/private/key.pem` | 🟢 Config |

**4-PC Network Topology**:
```
PC1 (Orchestrator): 10.0.0.1 / 100.64.0.1
PC2 (Worker RTX 3060): 10.0.0.2 / 100.64.0.2
PC3 (Worker RTX 5090): 10.0.0.3 / 100.64.0.3
PC4 (Worker RTX 3090 Ti): 10.0.0.4 / 100.64.0.4
```

**Used By**: Cross-PC communication, secure external access, service discovery

---

## 9. Monitoring & Observability

### Prometheus

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `PROMETHEUS_PORT` | No | Number | 9090 | Prometheus server port | `9090` | 🟢 Config |
| `PROMETHEUS_RETENTION` | No | String | 15d | Metrics retention period | `15d` | 🟢 Config |
| `PROMETHEUS_SCRAPE_INTERVAL` | No | String | 15s | Default scrape interval | `15s` | 🟢 Config |

### Loki (Log Aggregation)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `LOKI_PORT` | No | Number | 3100 | Loki server port | `3100` | 🟢 Config |
| `LOKI_RETENTION` | No | String | 7d | Log retention period | `7d` | 🟢 Config |

### Grafana

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `GRAFANA_PORT` | No | Number | 3000 | Grafana web UI port | `3000` | 🟢 Config |
| `GRAFANA_ADMIN_USER` | No | String | admin | Admin username | `admin` | 🟢 Config |
| `GRAFANA_ADMIN_PASSWORD` | Yes | Secret | - | Admin password | `${GENERATE_PASSWORD}` | 🟡 Medium |
| `GRAFANA_SECRET_KEY` | No | Secret | - | Session secret key | `${GENERATE_SECRET}` | 🟡 Medium |

### AlertManager

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ALERTMANAGER_PORT` | No | Number | 9093 | AlertManager port | `9093` | 🟢 Config |
| `ALERTMANAGER_WEBHOOK_URL` | No | String | - | Webhook notification URL | `https://hooks.slack.com/...` | 🟡 Medium |

**Monitoring Stack Access**:
- Prometheus: `http://orchestrator-mini:9090`
- Grafana: `http://orchestrator-mini:3000`
- Loki: `http://orchestrator-mini:3100`

**Used By**: System health monitoring, alerting, log analysis, performance tracking

---

## 10. Per-PC Configuration

### Universal Variables (All PCs)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `PC_NAME` | Yes | String | - | Unique PC identifier | `orchestrator-mini` | 🟢 Config |
| `PC_ROLE` | Yes | String | - | PC role in cluster | `orchestrator\|worker` | 🟢 Config |
| `LAN_IP` | Yes | String | - | Static LAN IP address | `10.0.0.1` | 🟢 Config |
| `TAILSCALE_IP` | No | String | - | Tailscale mesh IP | `100.64.0.1` | 🟢 Config |

### PC1 (Orchestrator - Mac Mini)

```bash
PC_NAME=orchestrator-mini
PC_ROLE=orchestrator
LAN_IP=10.0.0.1
TAILSCALE_IP=100.64.0.1
GPU_MODEL=none
CLAUDE_FLOW_MODE=orchestrator
```

### PC2 (Worker - Alienware M15R7, RTX 3060)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `PC_NAME` | Yes | String | worker-rtx3060 | PC identifier | `worker-rtx3060` | 🟢 Config |
| `PC_ROLE` | Yes | String | worker | Role | `worker` | 🟢 Config |
| `LAN_IP` | Yes | String | 10.0.0.2 | Static IP | `10.0.0.2` | 🟢 Config |
| `TAILSCALE_IP` | No | String | 100.64.0.2 | Tailscale IP | `100.64.0.2` | 🟢 Config |
| `GPU_MODEL` | Yes | String | RTX_3060 | GPU model | `RTX_3060` | 🟢 Config |
| `GPU_VRAM_MB` | Yes | Number | 12288 | VRAM in MB | `12288` (12GB) | 🟢 Config |
| `GPU_COMPUTE_CAPABILITY` | No | String | 8.6 | CUDA compute capability | `8.6` | 🟢 Config |

### PC3 (Worker - Alienware Area-51, RTX 5090)

```bash
PC_NAME=worker-rtx5090
PC_ROLE=worker
LAN_IP=10.0.0.3
TAILSCALE_IP=100.64.0.3
GPU_MODEL=RTX_5090
GPU_VRAM_MB=32768  # 32GB
GPU_COMPUTE_CAPABILITY=9.0
OLLAMA_HOST=http://10.0.0.3:11434
```

### PC4 (Worker - Desktop PC, RTX 3090 Ti)

```bash
PC_NAME=worker-rtx3090ti
PC_ROLE=worker
LAN_IP=10.0.0.4
TAILSCALE_IP=100.64.0.4
GPU_MODEL=RTX_3090_Ti
GPU_VRAM_MB=24576  # 24GB
GPU_COMPUTE_CAPABILITY=8.6
OLLAMA_HOST=http://10.0.0.4:11434
```

**Used By**: Multi-PC coordination, GPU routing, resource allocation, service discovery

---

## 11. GPU Workers & Ollama

### Ollama Configuration

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `OLLAMA_HOST` | Yes* | String | http://localhost:11434 | Ollama server URL | `http://10.0.0.2:11434` | 🟢 Config |
| `OLLAMA_MODELS` | No | String | - | Comma-separated model list | `llama3,mistral,codellama` | 🟢 Config |
| `OLLAMA_NUM_PARALLEL` | No | Number | 1 | Parallel request handling | `2` | 🟢 Config |
| `OLLAMA_MAX_LOADED_MODELS` | No | Number | 1 | Max models in memory | `2` | 🟢 Config |

### GPU Configuration (Worker PCs)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `CUDA_VISIBLE_DEVICES` | No | String | 0 | GPU device indices | `0\|0,1` | 🟢 Config |
| `GPU_MEMORY_FRACTION` | No | Number | 0.9 | GPU memory allocation (0-1) | `0.9` | 🟢 Config |
| `NVIDIA_DRIVER_CAPABILITIES` | No | String | compute,utility | Driver capabilities | `compute,utility` | 🟢 Config |

### Model Routing

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `GPU_ROUTING_STRATEGY` | No | String | vram_based | GPU selection strategy | `vram_based\|round_robin\|least_loaded` | 🟢 Config |
| `MIN_VRAM_MB` | No | Number | 8192 | Minimum VRAM required | `8192` | 🟢 Config |

**GPU Worker URLs** (for LiteLLM routing):
```bash
WORKER_RTX3060_URL=http://10.0.0.2:11434
WORKER_RTX5090_URL=http://10.0.0.3:11434
WORKER_RTX3090TI_URL=http://10.0.0.4:11434
```

**Used By**: Ollama workers, model routing, local LLM inference, GPU-intensive tasks

---

## 12. Workflow Automation

### n8n

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `N8N_PORT` | No | Number | 5678 | n8n web UI port | `5678` | 🟢 Config |
| `N8N_HOST` | No | String | localhost | n8n hostname | `orchestrator-mini` | 🟢 Config |
| `N8N_PROTOCOL` | No | String | http | Protocol | `http\|https` | 🟢 Config |
| `N8N_BASIC_AUTH_ACTIVE` | No | Boolean | true | Enable basic auth | `true` | 🟢 Config |
| `N8N_BASIC_AUTH_USER` | No | String | admin | Basic auth username | `admin` | 🟢 Config |
| `N8N_BASIC_AUTH_PASSWORD` | Yes* | Secret | - | Basic auth password | `${GENERATE_PASSWORD}` | 🟡 Medium |
| `N8N_ENCRYPTION_KEY` | Yes* | Secret | - | Data encryption key | `${openssl rand -base64 32}` | 🟡 Medium |
| `WEBHOOK_URL` | No | String | http://localhost:5678 | Webhook base URL | `http://orchestrator-mini:5678` | 🟢 Config |

### Activepieces

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ACTIVEPIECES_PORT` | No | Number | 3002 | Activepieces port | `3002` | 🟢 Config |
| `AP_API_KEY` | Yes* | Secret | - | API key | `${GENERATE_API_KEY}` | 🟡 Medium |
| `AP_ENCRYPTION_KEY` | Yes* | Secret | - | Encryption key | `${GENERATE_SECRET}` | 🟡 Medium |
| `AP_JWT_SECRET` | Yes* | Secret | - | JWT secret | `${openssl rand -base64 32}` | 🟡 Medium |
| `AP_ENVIRONMENT` | No | String | prod | Environment | `dev\|prod` | 🟢 Config |
| `AP_FRONTEND_URL` | No | String | http://localhost:3002 | Frontend URL | `http://orchestrator-mini:3002` | 🟢 Config |

### Dify (AI Chat Interface)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `DIFY_PORT` | No | Number | 3001 | Dify web UI port | `3001` | 🟢 Config |
| `DIFY_SECRET_KEY` | Yes* | Secret | - | Secret key | `${GENERATE_SECRET}` | 🟡 Medium |
| `DIFY_ENCRYPTION_KEY` | Yes* | Secret | - | Encryption key | `${GENERATE_SECRET}` | 🟡 Medium |
| `DIFY_STORAGE_TYPE` | No | String | local | Storage backend | `local\|s3` | 🟢 Config |
| `DIFY_VECTOR_STORE` | No | String | qdrant | Vector store | `qdrant\|pinecone` | 🟢 Config |

**Used By**: Automated workflows, lead nurturing, message delivery, AI chat interfaces

---

## 13. External APIs & Services

### Communication Services

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `SENDGRID_API_KEY` | Yes* | Secret | - | SendGrid email API key | `SG.${API_KEY}` | 🟡 Medium |
| `TWILIO_ACCOUNT_SID` | Yes* | String | - | Twilio account SID | `AC${SID}` | 🟡 Medium |
| `TWILIO_AUTH_TOKEN` | Yes* | Secret | - | Twilio auth token | `${AUTH_TOKEN}` | 🟡 Medium |
| `TWILIO_PHONE_NUMBER` | No | String | - | Twilio phone number | `+1234567890` | 🟢 Config |

### Payment Processing

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Yes* | Secret | - | Stripe secret key | `sk_live_...` | 🔴 Critical |
| `STRIPE_PUBLISHABLE_KEY` | No | String | - | Stripe publishable key | `pk_live_...` | 🟢 Config |
| `STRIPE_WEBHOOK_SECRET` | Yes* | Secret | - | Stripe webhook secret | `whsec_...` | 🟡 Medium |

### CRM & External Integrations

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `TWENTYCRM_PORT` | No | Number | 3010 | TwentyCRM port | `3010` | 🟢 Config |
| `TWENTY_ACCESS_TOKEN_SECRET` | Yes* | Secret | - | Access token secret | `${GENERATE_SECRET}` | 🟡 Medium |
| `TWENTY_LOGIN_TOKEN_SECRET` | Yes* | Secret | - | Login token secret | `${GENERATE_SECRET}` | 🟡 Medium |
| `TWENTY_REFRESH_TOKEN_SECRET` | Yes* | Secret | - | Refresh token secret | `${GENERATE_SECRET}` | 🟡 Medium |
| `TWENTY_FILE_TOKEN_SECRET` | Yes* | Secret | - | File token secret | `${GENERATE_SECRET}` | 🟡 Medium |

### Mortgage Industry APIs

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `ENCOMPASS_CLIENT_ID` | Yes* | String | - | Encompass OAuth client ID | `${CLIENT_ID}` | 🟡 Medium |
| `ENCOMPASS_CLIENT_SECRET` | Yes* | Secret | - | Encompass OAuth secret | `${CLIENT_SECRET}` | 🔴 Critical |
| `ENCOMPASS_API_HOST` | No | String | - | Encompass API host | `api.elliemae.com` | 🟢 Config |
| `ENCOMPASS_INSTANCE_ID` | No | String | - | Encompass instance ID | `${INSTANCE_ID}` | 🟢 Config |

**Used By**: External integrations, payment processing, email/SMS delivery, mortgage APIs

---

## 14. Advanced Features

### Cloud Provider Configuration (Optional)

#### AWS

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `AWS_ACCESS_KEY_ID` | Yes* | Secret | - | AWS access key | `AKIA...` | 🔴 Critical |
| `AWS_SECRET_ACCESS_KEY` | Yes* | Secret | - | AWS secret key | `${SECRET}` | 🔴 Critical |
| `AWS_REGION` | No | String | us-east-1 | AWS region | `us-east-1` | 🟢 Config |
| `AWS_S3_BUCKET` | No | String | - | S3 bucket name | `nyra-storage` | 🟢 Config |

#### GCP

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `GCP_PROJECT_ID` | Yes* | String | - | GCP project ID | `nyra-project` | 🟢 Config |
| `GCP_SERVICE_ACCOUNT_KEY` | Yes* | Secret | - | Service account JSON key | `${JSON_KEY}` | 🔴 Critical |
| `GCP_REGION` | No | String | us-central1 | GCP region | `us-central1` | 🟢 Config |

#### Azure

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `AZURE_CLIENT_ID` | Yes* | String | - | Azure client ID | `${CLIENT_ID}` | 🟡 Medium |
| `AZURE_CLIENT_SECRET` | Yes* | Secret | - | Azure client secret | `${SECRET}` | 🔴 Critical |
| `AZURE_TENANT_ID` | Yes* | String | - | Azure tenant ID | `${TENANT_ID}` | 🟢 Config |

### Secret Management (Infisical)

| Variable | Required | Type | Default | Description | Example | Security |
|----------|----------|------|---------|-------------|---------|----------|
| `INFISICAL_TOKEN` | Yes* | Secret | - | Infisical service token | `st.${TOKEN}` | 🔴 Critical |
| `INFISICAL_PROJECT_ID` | No | String | - | Infisical project ID | `${PROJECT_ID}` | 🟢 Config |
| `INFISICAL_ENV` | No | String | production | Environment | `dev\|staging\|production` | 🟢 Config |

**Used By**: Cloud storage, advanced integrations, secret management

---

## Quick Reference

### Minimal Development Setup (Local Development)

```bash
# Core (Required)
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# LLM (At least one required)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...

# Database (Local)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nyra

REDIS_HOST=localhost
REDIS_PORT=6380

# archon-os
CLAUDE_FLOW_MODE=orchestrator
CLAUDE_FLOW_DEBUG=true
ruvector_ENABLED=true

# Security (Generate with openssl)
JWT_SECRET=${openssl rand -base64 32}
SESSION_SECRET=${openssl rand -base64 32}
ENCRYPTION_KEY=${openssl rand -base64 32}
```

### Distributed 4-PC Setup (Production)

```bash
# PC1 (Orchestrator)
PC_NAME=orchestrator-mini
PC_ROLE=orchestrator
LAN_IP=10.0.0.1
CLAUDE_FLOW_MODE=orchestrator
ruvector_ENABLED=true
REASONINGBANK_ENABLED=true

# PC2 (Worker)
PC_NAME=worker-rtx3060
PC_ROLE=worker
LAN_IP=10.0.0.2
GPU_MODEL=RTX_3060
GPU_VRAM_MB=12288
OLLAMA_HOST=http://10.0.0.2:11434

# PC3 (Worker)
PC_NAME=worker-rtx5090
PC_ROLE=worker
LAN_IP=10.0.0.3
GPU_MODEL=RTX_5090
GPU_VRAM_MB=32768
OLLAMA_HOST=http://10.0.0.3:11434

# PC4 (Worker)
PC_NAME=worker-rtx3090ti
PC_ROLE=worker
LAN_IP=10.0.0.4
GPU_MODEL=RTX_3090_Ti
GPU_VRAM_MB=24576
OLLAMA_HOST=http://10.0.0.4:11434
```

### Service Port Allocation

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| PostgreSQL | 5432 | postgres:5432 | Primary database |
| Redis | 6380 | redis:6379 (internal) | Cache & broker |
| FalkorDB | 6379 | falkordb:6379 | Graph database |
| Qdrant | 6333 | qdrant:6333 | Vector database |
| LiteLLM | 4000 | litellm:4000 | LLM proxy |
| n8n | 5678 | n8n:5678 | Workflow automation |
| Activepieces | 3002 | activepieces:80 | Message automation |
| Dify Web | 3001 | dify-web:3000 | AI chat UI |
| Dify API | 5001 | dify-api:5001 | AI chat API |
| TwentyCRM | 3010 | twentycrm:3000 | CRM |
| Letta | 8283 | letta:8283 | Memory server |
| Prometheus | 9090 | prometheus:9090 | Metrics |
| Grafana | 3000 | grafana:3000 | Dashboards |
| Loki | 3100 | loki:3100 | Logs |
| Ollama (PC2) | 11434 | 10.0.0.2:11434 | Local LLM |
| Ollama (PC3) | 11434 | 10.0.0.3:11434 | Local LLM |
| Ollama (PC4) | 11434 | 10.0.0.4:11434 | Local LLM |

---

## Validation Checklist

### Before First Deployment

- [ ] All 🔴 Critical secrets generated and stored in Infisical
- [ ] All 🟠 High secrets generated
- [ ] Database URLs configured with correct credentials
- [ ] At least ONE LLM provider API key configured
- [ ] PC-specific variables set for all 4 PCs (if using distributed setup)
- [ ] Network connectivity verified (ping test between PCs)
- [ ] Docker network `nyra-network` created
- [ ] All required ports available (no conflicts)

### Per Environment

#### Development
- [ ] `NODE_ENV=development`
- [ ] `DEBUG=true`
- [ ] Local database credentials
- [ ] Test API keys (not production)

#### Staging
- [ ] `NODE_ENV=staging`
- [ ] Separate secrets from production
- [ ] Production-like infrastructure
- [ ] Test integrations enabled

#### Production
- [ ] `NODE_ENV=production`
- [ ] All critical secrets rotated
- [ ] Monitoring enabled (Prometheus, Grafana)
- [ ] Backup strategy implemented
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting enabled
- [ ] Cloudflare Tunnel configured (if public access required)

### Security Audit

- [ ] No secrets in git history
- [ ] `.env` files in `.gitignore`
- [ ] Secrets rotated within last 90 days
- [ ] Access logs enabled for sensitive services
- [ ] Strong passwords (24+ characters)
- [ ] JWT expiration configured appropriately
- [ ] Database passwords are unique per environment
- [ ] API keys have appropriate scopes/permissions

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failures

**Symptom**: `ECONNREFUSED` or `Connection refused`

**Solutions**:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules (if cross-PC)
telnet 10.0.0.1 5432
```

#### 2. LLM API Key Errors

**Symptom**: `401 Unauthorized` or `Invalid API key`

**Solutions**:
```bash
# Verify API key is set
echo $ANTHROPIC_API_KEY | cut -c1-20

# Test API key manually
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# Check for whitespace/newlines
printf "%q\n" "$ANTHROPIC_API_KEY"
```

#### 3. ruvector HNSW Index Issues

**Symptom**: Slow vector search or `Index not found`

**Solutions**:
```bash
# Rebuild HNSW index
ruvector_HNSW_EF_CONSTRUCTION=200 npm run ruvector:rebuild

# Increase cache size
ruvector_CACHE_SIZE=5000

# Optimize M parameter (higher = more memory, faster search)
ruvector_HNSW_M=32  # Default is 16
```

#### 4. GPU Worker Not Accessible

**Symptom**: `ECONNREFUSED` on Ollama endpoints

**Solutions**:
```bash
# Verify Ollama is running on worker
ssh worker-rtx3060
systemctl status ollama

# Check firewall
sudo ufw status
sudo ufw allow 11434/tcp

# Test from orchestrator
curl http://10.0.0.2:11434/api/tags

# Verify Tailscale connectivity
tailscale ping worker-rtx3060
```

#### 5. Memory/Swap Issues (High Memory Usage)

**Symptom**: `Out of memory` errors, slow performance

**Solutions**:
```bash
# Reduce ruvector cache
ruvector_CACHE_SIZE=500

# Enable quantization
ruvector_QUANTIZATION=binary  # 32x memory reduction

# Reduce concurrent agents
CLAUDE_FLOW_MAX_AGENTS=50
CLAUDE_FLOW_MAX_CONCURRENT_TASKS=25

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192"
```

---

## Additional Resources

- **Main Documentation**: `C:/Dev/Projects/Repos/Project-Nyra/docs/`
- **Bootstrap Guides**: `C:/Dev/NYRA-AIO-Bootstrap/`
- **Workflow Templates**: `C:/Dev/Projects/Repos/Project-Nyra/.archon-os/workflows/`
- **Troubleshooting**: `C:/Dev/NyraDocs/CF-Troubleshooting-Guide-and-Optimization.md`
- **Docker Compose**: `C:/Dev/Projects/Repos/Project-Nyra/infra/docker-compose.dev.yml`

---

## Changelog

### Version 3.0.0 (2026-01-13)
- ✅ Consolidated 3 source documents (ALL_ENV_VARS_BY_FEATURE.md, CF_ENV_VARS.md, ENV_VARIABLES_COMPLETE.md)
- ✅ Added 221 total variables across 14 categories
- ✅ Included 4-PC distributed setup configuration
- ✅ Added security best practices and secret generation
- ✅ Comprehensive troubleshooting section
- ✅ Per-PC variables for GPU workers
- ✅ Quick reference tables for common setups

### Version 2.0.0 (2026-01-09)
- Initial catalog from feature-based documentation

---

**Maintained by**: Project Nyra Team
**Last Review**: 2026-01-13
**Next Review**: 2026-04-13 (Quarterly)
