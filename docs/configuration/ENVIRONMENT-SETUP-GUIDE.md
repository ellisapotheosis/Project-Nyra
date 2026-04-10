# Project Nyra - Environment Configuration Guide

**Version:** 2.0
**Last Updated:** 2026-01-22
**Total Variables:** 450+

---

## 1. Overview

### What are Environment Variables?

Environment variables are configuration values that control how your application behaves without changing the code. They allow you to:

- **Separate configuration from code** - Keep secrets out of version control
- **Support multiple environments** - Use different settings for development, staging, and production
- **Enable security** - Store API keys, passwords, and tokens securely
- **Customize deployments** - Configure services differently per machine/environment

### Why Project Nyra Uses Them

Project Nyra is a distributed AI mortgage assistant platform that coordinates:
- **Multiple memory systems** (RuVector, Letta, letta, FalkorDB, Mem0, OpenMemory)
- **AI orchestrators** (archon-os, Archon, Ruv-Swarm)
- **4-PC GPU architecture** (1 orchestrator + 3 GPU workers)
- **15+ services** (Dify, TwentyCRM, n8n, Nexus Router, databases, MCP servers)

Each service needs configuration, and environment variables provide a consistent way to manage this complexity.

### Security Best Practices

**CRITICAL SECURITY RULES:**

1. **NEVER commit `.env` files with real secrets to Git**
2. **Use `.env.example` or `.env.template` files as templates** (with placeholder values)
3. **Generate strong secrets** using `openssl rand -hex 32`
4. **Use Infisical or Bitwarden** for production secret management
5. **Rotate API keys every 90 days**
6. **Use strong database passwords** (20+ characters, mixed case, numbers, symbols)
7. **Restrict file permissions** on `.env` files: `chmod 600 .env`
8. **Audit access** to secret management systems regularly

---

## 2. File Structure

Project Nyra uses a hierarchical environment configuration system:

```
Project-Nyra/
├── .env                              # ❌ NEVER commit (in .gitignore)
├── .env.master                       # Master reference with all variables
├── .env.development.optimal          # Optimized development config
├── .env.example                      # Root-level template
├── .env.cloudflare.example           # Cloudflare-specific template
├── .env.orchestration.template       # Orchestration layer template
│
├── configs/env/
│   ├── .env.master.template          # Full template (1107 lines)
│   └── .env.optimal                  # Optimal configuration
│
├── infra/
│   ├── environments/                 # PC-specific templates
│   │   ├── pc1-orchestrator.env.template
│   │   └── pc2-rtx3060.env.template
│   ├── machines/
│   │   └── .env.shared.template      # Shared variables across PCs
│   └── docker/
│       └── .env.mcp.template         # MCP server configuration
│
└── bootstrap/                        # Legacy PC-specific configs
    ├── orchestrator-mini/docker/.env.example
    ├── worker-rtx3060/docker/.env.example
    ├── worker-rtx5090/docker/.env.example
    └── worker-rtx3090ti/docker/.env.example
```

### File Purpose

| File | Purpose | When to Use |
|------|---------|-------------|
| `.env.master` | Complete reference with 570+ lines | Production setup, comprehensive view |
| `.env.development.optimal` | Optimized local development | Single-PC development |
| `configs/env/.env.master.template` | Template version (1107 lines) | Copy and customize for your setup |
| `infra/environments/pc*.env.template` | PC-specific configs | 4-PC distributed architecture |
| `infra/machines/.env.shared.template` | Shared variables | Variables same across all PCs |

### Where to Place .env Files

**For Each Service:**

```bash
# Root .env (core configuration)
Project-Nyra/.env

# Service-specific .env files
services/auth-service/.env
services/quote-engine/.env
services/campaign-engine/.env
services/nexus-router/.env
apps/web/nyra-admin/.env
apps/landing/ratehunter-landing/.env
```

**Best Practice:** Each service can have its own `.env` file, but use the root `.env` for shared/global variables.

---

## 3. Quick Start

### For Development (Single PC)

**Perfect for local development, testing, and prototyping.**

```bash
# Step 1: Copy the optimal development configuration
cp .env.development.optimal .env

# Step 2: Edit critical values (use VS Code, nano, or vim)
nano .env

# Step 3: Generate secrets for required fields
openssl rand -hex 32   # For passwords, JWT secrets, encryption keys

# Step 4: Set your API keys
# - ANTHROPIC_API_KEY (required)
# - GOOGLE_API_KEY (required)
# - GITHUB_TOKEN (optional but recommended)

# Step 5: Configure local database URLs
# If using Docker Compose for databases:
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/nyra_dev
REDIS_URL=redis://localhost:6379

# Step 6: Start local services
docker-compose -f infra/docker/docker-compose.yml up -d

# Step 7: Verify configuration
npx @archon-os/cli@latest doctor --fix
```

**Minimal Required Variables for Development:**

```bash
# Core
NODE_ENV=development
LOG_LEVEL=debug

# AI Providers (at least one required)
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=your-google-key-here

# Database (if using Docker)
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/nyra_dev
REDIS_URL=redis://localhost:6379

# GitHub (optional)
GITHUB_TOKEN=github_pat_your_token_here
```

### For Production (4-PC Stack)

**Distributed architecture with orchestrator + 3 GPU workers.**

#### Prerequisites

1. **4 PCs networked together:**
   - PC1: Orchestrator (static IP: 192.168.1.100)
   - PC2: RTX 3060 worker (static IP: 192.168.1.101)
   - PC3: RTX 5090 worker (static IP: 192.168.1.102)
   - PC4: RTX 3090 Ti worker (static IP: 192.168.1.103)

2. **Tailscale VPN** installed on all PCs
3. **Cloudflare Tunnel** tokens for each PC
4. **Infisical** project configured

#### Setup Steps

**On PC1 (Orchestrator):**

```bash
# Step 1: Copy the orchestrator template
cp infra/environments/pc1-orchestrator.env.template .env

# Step 2: Configure Infisical
INFISICAL_TOKEN=your_machine_identity_token
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENVIRONMENT=production

# Step 3: Set network configuration
STATIC_IP=192.168.1.100
TAILSCALE_AUTHKEY=tskey-auth-your-key-here
CLOUDFLARED_TUNNEL_TOKEN=your_tunnel_token_here

# Step 4: Generate and set database passwords
POSTGRES_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)
NEO4J_AUTH=neo4j/$(openssl rand -hex 32)

# Step 5: Configure orchestrator mode
CLAUDE_FLOW_MODE=orchestrator

# Step 6: Start services
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d

# Step 7: Verify
npx @archon-os/cli@latest doctor
npx @archon-os/cli@latest swarm status
```

**On PC2, PC3, PC4 (Workers):**

```bash
# Step 1: Copy the worker template (example for PC2)
cp infra/environments/pc2-rtx3060.env.template .env

# Step 2: Configure as worker
CLAUDE_FLOW_MODE=worker
STATIC_IP=192.168.1.101  # Change per PC

# Step 3: Point to orchestrator
ORCHESTRATOR_IP=192.168.1.100
POSTGRES_HOST=192.168.1.100
REDIS_HOST=192.168.1.100

# Step 4: Configure GPU
NVIDIA_VISIBLE_DEVICES=all
GPU_WORKER_3060_URL=http://localhost:11434

# Step 5: Start Ollama and worker services
docker-compose -f bootstrap/worker-rtx3060/docker/docker-compose.yml up -d

# Step 6: Verify GPU availability
nvidia-smi
docker exec ollama ollama list
```

#### Using Infisical for Production Secrets

```bash
# Step 1: Install Infisical CLI
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical

# Step 2: Login
infisical login

# Step 3: Run services with Infisical
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="production" -- docker-compose up -d

# Step 4: For development environment
infisical run --env="dev" -- npm run dev
```

---

## 4. Variable Reference

### Complete Variable Documentation

See [`configs/env/.env.master.template`](../../configs/env/.env.master.template) for the authoritative list of all 450+ environment variables.

### Critical Variables That MUST Be Set

#### Tier 1: System Will Not Start Without These

```bash
# Core Application
NODE_ENV=production|development|staging

# AI Providers (at least ONE required)
ANTHROPIC_API_KEY=sk-ant-...          # Primary LLM
GOOGLE_API_KEY=...                    # Cost-effective fallback

# Database
POSTGRES_PASSWORD=<strong-password>   # PostgreSQL root password
REDIS_PASSWORD=<strong-password>      # Redis password

# Security
ENCRYPTION_KEY=<32-byte-hex>          # Data encryption
SESSION_SECRET=<32-byte-hex>          # Session signing
JWT_SECRET=<32-byte-hex>              # JWT token signing
```

#### Tier 2: Required for Specific Features

```bash
# Memory Systems
LETTA_DB_PASSWORD=<password>          # If using Letta
FALKORDB_PASSWORD=<password>          # If using letta/FalkorDB
QDRANT_API_KEY=<api-key>              # If using Qdrant

# Orchestrators
NEXUS_JWT_SECRET=<32-byte-hex>        # Nexus Router authentication
NEXUS_ADMIN_TOKEN=<32-byte-hex>       # Nexus admin access

# Communication
TWILIO_ACCOUNT_SID=ACxxxxxx           # SMS/voice capabilities
TWILIO_AUTH_TOKEN=<token>
SENDGRID_API_KEY=<key>                # Email sending

# Networking
TAILSCALE_AUTH_KEY=tskey-auth-...     # Multi-PC networking
CLOUDFLARE_TUNNEL_TOKEN=<token>       # Public access
```

#### Tier 3: Optional (Enhanced Features)

```bash
# Additional AI Providers
OPENROUTER_API_KEY=<key>              # 99% cost savings
GROQ_API_KEY=<key>                    # Fast inference
MISTRAL_API_KEY=<key>                 # Alternative models

# Monitoring
SENTRY_DSN=<dsn>                      # Error tracking
GRAFANA_ADMIN_PASSWORD=<password>     # Metrics dashboard

# GitHub Integration
GITHUB_TOKEN=github_pat_...           # Code operations

# Mortgage Integrations
LENDER_PRICE_API_KEY=<key>            # Rate quotes
ROCKET_MORTGAGE_API_KEY=<key>         # Lead generation
```

### Variable Organization by Section

The master template organizes variables into **25 sections:**

1. **Project Identification** - Basic metadata
2. **Infisical** - Secret management
3. **AI/LLM API Keys** - Claude, OpenAI, Google, etc.
4. **GPU Workers** - Local LLM inference
5. **Nexus Router** - Unified gateway
6. **LiteLLM** - Legacy proxy
7. **Memory Systems** - RuVector, Letta, letta, Mem0, Qdrant
8. **AI Orchestrators** - archon-os, Archon, Ruv-Swarm
9. **Databases** - PostgreSQL, Redis, MongoDB
10. **AI Platforms** - Dify, n8n, Activepieces, TwentyCRM
11. **Mortgage Integrations** - Lead sources, pricing APIs
12. **Communication** - Twilio, SendGrid, SMTP
13. **Networking** - Tailscale, Cloudflare, domains
14. **Monitoring** - Prometheus, Grafana, Sentry
15. **MCP Servers** - Model Context Protocol
16. **GitHub** - Version control
17. **Third-Party** - Supabase, Bitwarden, S3
18. **Security** - Encryption, sessions, CORS
19. **Compliance** - Audit logging, TRID, data retention
20. **Performance** - Node.js, caching, rate limiting
21. **Logging** - Format, destination, rotation
22. **Feature Flags** - Toggle features
23. **Frontend** - Next.js, Clerk, telemetry
24. **Environment-Specific** - Dev vs Prod

---

## 5. Secret Management

### Using Infisical (Recommended for Production)

**Infisical** is a centralized secret management platform that:
- Stores secrets encrypted at rest
- Provides audit logs
- Supports multiple environments (dev, staging, production)
- Integrates with CI/CD
- Enables secret rotation

#### Setup Infisical

```bash
# 1. Create account at https://app.infisical.com
# 2. Create a new project (or use existing: 8374cea9-e5e8-4050-bda4-b91f25ab30ef)
# 3. Generate a machine identity token for your PC

# 4. Install Infisical CLI
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical

# 5. Login (browser-based auth)
infisical login

# 6. Import secrets from .env file
infisical secrets set --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="production" --path="/shared"
```

#### Using Infisical in Your Application

```bash
# Option 1: Run command with Infisical
infisical run --env="production" -- npm start
infisical run --env="production" -- docker-compose up -d

# Option 2: Export secrets to environment
infisical export --env="production" > .env

# Option 3: Use Infisical SDK (Node.js)
# See: https://infisical.com/docs/sdks/languages/node
```

#### .env File for Infisical

```bash
# Minimal .env when using Infisical
INFISICAL_TOKEN=your_machine_identity_token_here
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENVIRONMENT=production
INFISICAL_PATH=/shared
```

### Using Bitwarden for Team Password Sharing

**Bitwarden** is useful for sharing credentials across team members:

```bash
# 1. Install Bitwarden CLI
npm install -g @bitwarden/cli

# 2. Login
bw login

# 3. Unlock vault (returns session key)
export BW_SESSION=$(bw unlock --raw)

# 4. Retrieve secrets
POSTGRES_PASSWORD=$(bw get password "Nyra PostgreSQL Production")
REDIS_PASSWORD=$(bw get password "Nyra Redis Production")

# 5. Use in scripts
#!/bin/bash
export BW_SESSION=$(bw unlock --raw)
export POSTGRES_PASSWORD=$(bw get password "Nyra PostgreSQL Production")
docker-compose up -d
```

### Secret Rotation Strategy

**Rotate secrets every 90 days:**

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Update in Infisical
infisical secrets set POSTGRES_PASSWORD="$NEW_SECRET" --env="production"

# 3. Update database
psql -c "ALTER USER nyra WITH PASSWORD '$NEW_SECRET';"

# 4. Restart services
docker-compose restart

# 5. Document rotation in audit log
echo "$(date): Rotated POSTGRES_PASSWORD" >> /var/log/nyra/secret-rotation.log
```

---

## 6. PC-Specific Setup

### PC1: Orchestrator (Area51 - Main PC)

**Hardware Requirements:**
- Multi-core CPU (8+ cores recommended)
- 32GB+ RAM
- 500GB+ SSD storage
- Static IP: 192.168.1.100

**Services Hosted:**
- All databases (PostgreSQL, Redis, FalkorDB, Qdrant, MongoDB)
- Nexus Router (unified gateway)
- MCP servers (20+ servers)
- TwentyCRM, n8n, Dify
- Prometheus, Grafana, Loki (monitoring)
- archon-os orchestrator

**Configuration:**

```bash
# 1. Copy template
cp infra/environments/pc1-orchestrator.env.template .env

# 2. Set orchestrator mode
CLAUDE_FLOW_MODE=orchestrator

# 3. Configure network
STATIC_IP=192.168.1.100
TAILSCALE_HOSTNAME=orchestrator
CLOUDFLARED_TUNNEL_TOKEN=<orchestrator-tunnel-token>

# 4. Database configuration (all hosted locally)
POSTGRES_HOST=localhost
REDIS_HOST=localhost
NEO4J_HOST=localhost
QDRANT_HOST=localhost
MONGODB_HOST=localhost

# 5. Set worker URLs (other PCs)
GPU_WORKER_3060_URL=http://192.168.1.101:11434
GPU_WORKER_5090_URL=http://192.168.1.102:11434
GPU_WORKER_3090_URL=http://192.168.1.103:11434

# 6. Start services
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
```

### PC2: RTX 3060 Worker (12GB VRAM)

**Hardware Requirements:**
- NVIDIA RTX 3060 (12GB VRAM)
- 16GB+ RAM
- Static IP: 192.168.1.101

**Services Hosted:**
- Ollama (local LLM inference)
- Specialized models: `codellama:34b`, `qwen2.5:32b`, `gemma2:27b`
- Primary use: Coding tasks

**Configuration:**

```bash
# 1. Copy template
cp infra/environments/pc2-rtx3060.env.template .env

# 2. Set worker mode
CLAUDE_FLOW_MODE=worker
STATIC_IP=192.168.1.101

# 3. Point to orchestrator
ORCHESTRATOR_IP=192.168.1.100
POSTGRES_HOST=192.168.1.100
REDIS_HOST=192.168.1.100

# 4. GPU configuration
NVIDIA_VISIBLE_DEVICES=all
NVIDIA_DRIVER_CAPABILITIES=compute,utility,graphics
GPU_WORKER_3060_GPU=RTX 3060
GPU_WORKER_3060_VRAM=12GB
GPU_WORKER_3060_MODELS=codellama:34b-instruct-q8_0,qwen2.5:32b-instruct-q8_0,gemma2:27b-instruct-q8_0
GPU_WORKER_3060_PRIMARY_USE=coding

# 5. Ollama endpoint
OLLAMA_URL=http://localhost:11434
GPU_WORKER_3060_URL=http://0.0.0.0:11434

# 6. Start services
docker-compose -f bootstrap/worker-rtx3060/docker/docker-compose.yml up -d

# 7. Pull models
docker exec ollama ollama pull codellama:34b-instruct-q8_0
docker exec ollama ollama pull qwen2.5:32b-instruct-q8_0
docker exec ollama ollama pull gemma2:27b-instruct-q8_0
```

### PC3: RTX 5090 Worker (48GB VRAM)

**Hardware Requirements:**
- NVIDIA RTX 5090 (48GB VRAM) - **Most powerful GPU**
- 32GB+ RAM
- Static IP: 192.168.1.102

**Services Hosted:**
- Ollama (local LLM inference)
- Large models: `deepseek-r1:236b-q4`, `qwen2.5:72b-q8`
- Primary use: Complex reasoning tasks

**Configuration:**

```bash
# 1. Copy template (create if not exists)
cp infra/environments/pc3-rtx5090.env.template .env

# 2. Set worker mode
CLAUDE_FLOW_MODE=worker
STATIC_IP=192.168.1.102

# 3. Point to orchestrator
ORCHESTRATOR_IP=192.168.1.100
POSTGRES_HOST=192.168.1.100
REDIS_HOST=192.168.1.100

# 4. GPU configuration (48GB VRAM)
NVIDIA_VISIBLE_DEVICES=all
GPU_WORKER_5090_GPU=RTX 5090
GPU_WORKER_5090_VRAM=48GB
GPU_WORKER_5090_MODELS=deepseek-r1:236b-q4_K_M,qwen2.5:72b-instruct-q8_0
GPU_WORKER_5090_PRIMARY_USE=reasoning
GPU_WORKER_5090_MAX_CONCURRENT=3

# 5. Ollama endpoint
OLLAMA_URL=http://localhost:11434
GPU_WORKER_5090_URL=http://0.0.0.0:11434

# 6. Start services
docker-compose -f bootstrap/worker-rtx5090/docker/docker-compose.yml up -d

# 7. Pull large models (this will take time!)
docker exec ollama ollama pull deepseek-r1:236b-q4_K_M
docker exec ollama ollama pull qwen2.5:72b-instruct-q8_0
```

### PC4: RTX 3090 Ti Worker (24GB VRAM)

**Hardware Requirements:**
- NVIDIA RTX 3090 Ti (24GB VRAM)
- 24GB+ RAM
- Static IP: 192.168.1.103

**Services Hosted:**
- Ollama (local LLM inference)
- Medium-large models: `llama3.1:70b`, `mistral-large:123b`
- Primary use: Analysis tasks

**Configuration:**

```bash
# 1. Copy template (create if not exists)
cp infra/environments/pc4-rtx3090ti.env.template .env

# 2. Set worker mode
CLAUDE_FLOW_MODE=worker
STATIC_IP=192.168.1.103

# 3. Point to orchestrator
ORCHESTRATOR_IP=192.168.1.100
POSTGRES_HOST=192.168.1.100
REDIS_HOST=192.168.1.100

# 4. GPU configuration (24GB VRAM)
NVIDIA_VISIBLE_DEVICES=all
GPU_WORKER_3090_GPU=RTX 3090 Ti
GPU_WORKER_3090_VRAM=24GB
GPU_WORKER_3090_MODELS=llama3.1:70b-instruct-q4_K_M,mistral-large:123b-instruct-2407-q4_K_M
GPU_WORKER_3090_PRIMARY_USE=analysis
GPU_WORKER_3090_MAX_CONCURRENT=2

# 5. Ollama endpoint
OLLAMA_URL=http://localhost:11434
GPU_WORKER_3090_URL=http://0.0.0.0:11434

# 6. Start services
docker-compose -f bootstrap/worker-rtx3090ti/docker/docker-compose.yml up -d

# 7. Pull models
docker exec ollama ollama pull llama3.1:70b-instruct-q4_K_M
docker exec ollama ollama pull mistral-large:123b-instruct-2407-q4_K_M
```

### Network Configuration

**Tailscale Setup (VPN Mesh Network):**

```bash
# Install Tailscale on each PC
curl -fsSL https://tailscale.com/install.sh | sh

# On PC1 (Orchestrator)
sudo tailscale up --authkey=tskey-auth-XXXXX --hostname=orchestrator --advertise-routes=192.168.1.0/24

# On PC2 (RTX 3060)
sudo tailscale up --authkey=tskey-auth-XXXXX --hostname=worker-3060 --accept-routes

# On PC3 (RTX 5090)
sudo tailscale up --authkey=tskey-auth-XXXXX --hostname=worker-5090 --accept-routes

# On PC4 (RTX 3090 Ti)
sudo tailscale up --authkey=tskey-auth-XXXXX --hostname=worker-3090 --accept-routes

# Verify connectivity
tailscale status
ping worker-5090.tail-net.ts.net
```

**Cloudflare Tunnel Setup (Public Access):**

```bash
# Install cloudflared on each PC
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login (one-time per PC)
cloudflared tunnel login

# Create tunnel (one per PC)
cloudflared tunnel create nyra-orchestrator  # PC1
cloudflared tunnel create nyra-worker-3060   # PC2
cloudflared tunnel create nyra-worker-5090   # PC3
cloudflared tunnel create nyra-worker-3090   # PC4

# Get tunnel token from Cloudflare dashboard
# Set in .env
CLOUDFLARE_TUNNEL_TOKEN=<token-for-this-pc>

# Run tunnel (via Docker or systemd)
docker run -d \
  --name cloudflared \
  --restart unless-stopped \
  cloudflare/cloudflared:latest \
  tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN
```

---

## 7. Common Issues & Troubleshooting

### Issue: "Variable not found" errors

**Symptoms:**
```
Error: ANTHROPIC_API_KEY is not defined
Error: DATABASE_URL is required
```

**Solutions:**

1. **Check .env file exists:**
   ```bash
   ls -la .env
   # If missing: cp .env.development.optimal .env
   ```

2. **Verify .env is loaded:**
   ```bash
   # Add to your app entry point (index.js, server.js)
   require('dotenv').config();

   # Or use Infisical
   infisical run --env="dev" -- node index.js
   ```

3. **Check variable spelling:**
   ```bash
   grep "ANTHROPIC_API_KEY" .env
   # Ensure no typos, extra spaces, or quotes
   ```

4. **Use correct format:**
   ```bash
   # ✅ Correct
   ANTHROPIC_API_KEY=sk-ant-your-key-here

   # ❌ Incorrect (no quotes needed)
   ANTHROPIC_API_KEY="sk-ant-your-key-here"

   # ❌ Incorrect (no spaces around =)
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   ```

### Issue: "Connection refused" errors

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: Redis connection failed
```

**Solutions:**

1. **Verify services are running:**
   ```bash
   docker ps  # Check running containers
   netstat -tuln | grep 5432  # Check if port is open
   ```

2. **Check service URLs:**
   ```bash
   # If using Docker, use container names
   DATABASE_URL=postgresql://user:pass@postgresql:5432/db
   REDIS_URL=redis://redis:6379

   # If running natively, use localhost
   DATABASE_URL=postgresql://user:pass@localhost:5432/db
   REDIS_URL=redis://localhost:6379
   ```

3. **Verify Docker network:**
   ```bash
   docker network ls
   docker network inspect nyra-network
   ```

4. **Test connectivity:**
   ```bash
   # PostgreSQL
   psql -h localhost -U nyra -d nyra_production

   # Redis
   redis-cli -h localhost -p 6379 ping
   ```

### Issue: "Invalid API key" errors

**Symptoms:**
```
Error: 401 Unauthorized - Invalid API key
Error: OpenAI API authentication failed
```

**Solutions:**

1. **Verify API key format:**
   ```bash
   # Anthropic: starts with sk-ant-
   ANTHROPIC_API_KEY=sk-ant-api03-...

   # OpenAI: starts with sk-
   OPENAI_API_KEY=sk-proj-...

   # Google: 39 characters
   GOOGLE_API_KEY=AIzaSy...
   ```

2. **Check API key permissions:**
   - Visit provider dashboard
   - Ensure key has required permissions
   - Check usage limits aren't exceeded

3. **Test API key manually:**
   ```bash
   # Anthropic
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}'

   # OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

4. **Regenerate API key:**
   - Sometimes keys expire or get revoked
   - Generate a new key from provider dashboard
   - Update in .env and Infisical

### Issue: GPU not detected in Docker containers

**Symptoms:**
```
Error: No NVIDIA devices found
Error: nvidia-smi: command not found in container
```

**Solutions:**

1. **Install NVIDIA Container Toolkit:**
   ```bash
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

2. **Configure Docker daemon:**
   ```bash
   # /etc/docker/daemon.json
   {
     "runtimes": {
       "nvidia": {
         "path": "nvidia-container-runtime",
         "runtimeArgs": []
       }
     },
     "default-runtime": "nvidia"
   }

   sudo systemctl restart docker
   ```

3. **Verify GPU in container:**
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
   ```

4. **Set environment variables:**
   ```bash
   NVIDIA_VISIBLE_DEVICES=all
   NVIDIA_DRIVER_CAPABILITIES=compute,utility,graphics
   ```

### How to Validate .env Files

**Automated validation:**

```bash
# Use archon-os doctor command
npx @archon-os/cli@latest doctor --fix

# Manual validation script
#!/bin/bash
# validate-env.sh

REQUIRED_VARS=(
  "ANTHROPIC_API_KEY"
  "GOOGLE_API_KEY"
  "POSTGRES_PASSWORD"
  "REDIS_PASSWORD"
  "ENCRYPTION_KEY"
  "SESSION_SECRET"
  "JWT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

echo "✅ All required variables are set"
```

**Run validation:**

```bash
chmod +x validate-env.sh
source .env && ./validate-env.sh
```

---

## 8. Security Checklist

### Pre-Deployment Checklist

- [ ] **`.env` files are in `.gitignore`**
  ```bash
  grep "^\.env$" .gitignore || echo ".env" >> .gitignore
  ```

- [ ] **Secrets stored in Infisical or Bitwarden**
  ```bash
  infisical secrets list --env="production"
  ```

- [ ] **Strong database passwords (20+ characters)**
  ```bash
  # Generate strong password
  openssl rand -base64 32
  ```

- [ ] **API keys rotated every 90 days**
  ```bash
  # Set reminder
  echo "$(date -d '+90 days'): Rotate API keys" >> ~/reminders.txt
  ```

- [ ] **Cloudflared tokens are per-PC unique**
  ```bash
  # Each PC should have its own tunnel token
  grep CLOUDFLARE_TUNNEL_TOKEN .env | uniq
  ```

- [ ] **File permissions restricted**
  ```bash
  chmod 600 .env
  ls -la .env  # Should show -rw-------
  ```

- [ ] **CORS origins are restricted**
  ```bash
  # Don't use CORS_ORIGIN=* in production
  CORS_ALLOWED_ORIGINS=https://ratehunter.net,https://app.ratehunter.net
  ```

- [ ] **SSL/TLS enabled for production**
  ```bash
  SSL_ENABLED=true
  NODE_ENV=production
  SESSION_SECURE=true
  ```

- [ ] **Audit logging enabled**
  ```bash
  AUDIT_LOG_ENABLED=true
  AUDIT_LOG_RETENTION_DAYS=2555  # 7 years for compliance
  ```

- [ ] **Rate limiting enabled**
  ```bash
  RATE_LIMIT_ENABLED=true
  RATE_LIMIT_MAX_REQUESTS=100
  ```

### Runtime Security Monitoring

```bash
# Monitor failed authentication attempts
grep "401 Unauthorized" /var/log/nyra/api.log | wc -l

# Check for exposed secrets in logs
grep -r "sk-ant-\|sk-proj-\|AIzaSy" /var/log/nyra/ && echo "⚠️  SECRET EXPOSED IN LOGS"

# Verify secret file permissions
find . -name ".env*" -not -perm 600 -ls

# Audit Infisical access logs
infisical audit-log --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --last=24h
```

### Security Incident Response

**If a secret is compromised:**

1. **Immediately rotate the secret:**
   ```bash
   # Generate new secret
   NEW_SECRET=$(openssl rand -hex 32)

   # Update in Infisical
   infisical secrets set API_KEY="$NEW_SECRET" --env="production"

   # Restart services
   docker-compose restart
   ```

2. **Revoke old secret at provider:**
   - Anthropic: https://console.anthropic.com/settings/keys
   - OpenAI: https://platform.openai.com/api-keys
   - GitHub: https://github.com/settings/tokens

3. **Audit access logs:**
   ```bash
   # Check for unauthorized usage
   grep "API_KEY" /var/log/nyra/api.log | grep -v "200 OK"
   ```

4. **Update all deployments:**
   ```bash
   # Production
   infisical run --env="production" -- docker-compose restart

   # Staging
   infisical run --env="staging" -- docker-compose restart
   ```

5. **Document incident:**
   ```bash
   echo "$(date): API key compromised - rotated successfully" >> /var/log/nyra/security-incidents.log
   ```

---

## 9. Maintenance

### How to Add New Variables

**Step 1: Add to master template**

```bash
# Edit configs/env/.env.master.template
nano configs/env/.env.master.template

# Add new variable with documentation
# Example:
# NEW_SERVICE_ENABLED=true                    # Enable new service
# NEW_SERVICE_PORT=9000                       # HTTP port
# NEW_SERVICE_API_KEY=                        # [REQUIRED] API key
```

**Step 2: Add to Infisical**

```bash
infisical secrets set NEW_SERVICE_API_KEY="your-key-here" --env="production"
infisical secrets set NEW_SERVICE_API_KEY="your-key-here" --env="staging"
infisical secrets set NEW_SERVICE_API_KEY="your-key-here" --env="dev"
```

**Step 3: Update documentation**

```bash
# Update this file (ENVIRONMENT-SETUP-GUIDE.md)
# Add to relevant section (e.g., "Critical Variables" or "Optional Variables")

# Update MASTER-ENV-VARIABLES.md (if exists)
# Add detailed description
```

**Step 4: Notify team**

```bash
# Send Slack notification
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"🔧 New environment variable added: NEW_SERVICE_API_KEY. Please update your .env files."}'
```

### How to Deprecate Old Variables

**Step 1: Mark as deprecated**

```bash
# In .env.master.template, add deprecation notice
# [DEPRECATED - Use NEW_VARIABLE_NAME instead]
OLD_VARIABLE=
```

**Step 2: Add migration logic**

```javascript
// In your application code
if (process.env.OLD_VARIABLE && !process.env.NEW_VARIABLE) {
  console.warn('⚠️  OLD_VARIABLE is deprecated. Please use NEW_VARIABLE instead.');
  process.env.NEW_VARIABLE = process.env.OLD_VARIABLE;
}
```

**Step 3: Communicate deprecation**

```bash
# Add to CHANGELOG.md
echo "## [2.1.0] - $(date +%Y-%m-%d)" >> CHANGELOG.md
echo "### Deprecated" >> CHANGELOG.md
echo "- OLD_VARIABLE (use NEW_VARIABLE instead)" >> CHANGELOG.md
```

**Step 4: Remove after grace period (90 days)**

```bash
# After 90 days, remove from codebase
sed -i '/OLD_VARIABLE/d' configs/env/.env.master.template
```

### Version Control Strategy

**What to commit to Git:**

✅ **DO commit:**
- `.env.example` (template with placeholders)
- `.env.development.optimal` (safe defaults)
- `configs/env/.env.master.template` (comprehensive template)
- `infra/environments/*.env.template` (PC-specific templates)
- `infra/machines/.env.shared.template` (shared variables)

❌ **DON'T commit:**
- `.env` (actual configuration with secrets)
- `.env.local` (local overrides)
- `.env.production` (production secrets)
- Any file with real API keys, passwords, tokens

**`.gitignore` configuration:**

```bash
# Environment files
.env
.env.local
.env.production
.env.staging
.env.*.local

# BUT allow templates
!.env.example
!.env.*.example
!.env.*.template
!.env.*.optimal
```

### Documentation Updates

**When to update this guide:**

1. **New service added** - Add to relevant section
2. **New variable added** - Update "Variable Reference"
3. **New PC added to stack** - Add to "PC-Specific Setup"
4. **Security issue discovered** - Update "Security Checklist"
5. **Common issue found** - Add to "Troubleshooting"

**Update workflow:**

```bash
# 1. Edit the guide
nano docs/configuration/ENVIRONMENT-SETUP-GUIDE.md

# 2. Update version number
# 3. Update "Last Updated" date
# 4. Commit with clear message
git add docs/configuration/ENVIRONMENT-SETUP-GUIDE.md
git commit -m "docs: Update environment guide - add NEW_FEATURE"

# 5. Sync with team
git push origin main
```

---

## 10. Reference Links

### Official Documentation

- **Infisical:** https://infisical.com/docs
- **Bitwarden:** https://bitwarden.com/help/
- **Tailscale:** https://tailscale.com/kb
- **Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- **Docker Compose:** https://docs.docker.com/compose/
- **archon-os:** https://github.com/ruvnet/archon-os

### Internal Documentation

- **Master Variable Template:** [`configs/env/.env.master.template`](../../configs/env/.env.master.template)
- **Optimal Development Config:** [`.env.development.optimal`](../../.env.development.optimal)
- **PC1 Orchestrator Template:** [`infra/environments/pc1-orchestrator.env.template`](../../infra/environments/pc1-orchestrator.env.template)
- **Shared Variables Template:** [`infra/machines/.env.shared.template`](../../infra/machines/.env.shared.template)

### Support

- **GitHub Issues:** https://github.com/your-org/Project-Nyra/issues
- **Team Slack:** #project-nyra-support
- **Wiki:** https://github.com/your-org/Project-Nyra/wiki

---

## Appendix: Example Workflows

### Workflow 1: Setting Up Development Environment from Scratch

```bash
# 1. Clone repository
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra

# 2. Copy optimal development config
cp .env.development.optimal .env

# 3. Set required API keys
nano .env
# Add: ANTHROPIC_API_KEY=sk-ant-your-key
# Add: GOOGLE_API_KEY=your-google-key

# 4. Generate secrets
export JWT_SECRET=$(openssl rand -hex 32)
export SESSION_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# 5. Update .env with generated secrets
echo "JWT_SECRET=$JWT_SECRET" >> .env
echo "SESSION_SECRET=$SESSION_SECRET" >> .env
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env

# 6. Start databases with Docker
docker-compose -f infra/docker/docker-compose.yml up -d postgresql redis

# 7. Wait for databases to be ready
sleep 10

# 8. Run migrations
npm run db:migrate

# 9. Start application
npm run dev

# 10. Verify setup
npx @archon-os/cli@latest doctor
```

### Workflow 2: Deploying to Production (4-PC Stack)

```bash
# On PC1 (Orchestrator):

# 1. Setup Infisical
infisical login
infisical init

# 2. Copy orchestrator template
cp infra/environments/pc1-orchestrator.env.template .env

# 3. Configure critical variables
nano .env
# Set: TAILSCALE_AUTHKEY, CLOUDFLARE_TUNNEL_TOKEN, STATIC_IP

# 4. Generate and upload secrets to Infisical
./scripts/generate-and-upload-secrets.sh

# 5. Start services with Infisical
infisical run --env="production" -- docker-compose -f infra/docker/docker-compose.orchestration.yml up -d

# 6. Verify orchestrator
npx @archon-os/cli@latest swarm status

# On PC2, PC3, PC4 (Workers):

# 1. Copy worker template
cp infra/environments/pc2-rtx3060.env.template .env  # Or pc3, pc4

# 2. Configure worker variables
nano .env
# Set: ORCHESTRATOR_IP, STATIC_IP, GPU configuration

# 3. Start worker services
docker-compose -f bootstrap/worker-rtx3060/docker/docker-compose.yml up -d

# 4. Pull models
docker exec ollama ollama pull codellama:34b-instruct-q8_0

# 5. Verify worker registration
curl http://192.168.1.100:8000/api/workers
```

### Workflow 3: Rotating Secrets Safely

```bash
#!/bin/bash
# rotate-secrets.sh

set -e

echo "🔄 Starting secret rotation..."

# 1. Generate new secrets
NEW_POSTGRES_PASSWORD=$(openssl rand -hex 32)
NEW_REDIS_PASSWORD=$(openssl rand -hex 32)
NEW_JWT_SECRET=$(openssl rand -hex 32)

# 2. Update Infisical
infisical secrets set POSTGRES_PASSWORD="$NEW_POSTGRES_PASSWORD" --env="production"
infisical secrets set REDIS_PASSWORD="$NEW_REDIS_PASSWORD" --env="production"
infisical secrets set JWT_SECRET="$NEW_JWT_SECRET" --env="production"

# 3. Update databases
docker exec postgresql psql -U postgres -c "ALTER USER nyra WITH PASSWORD '$NEW_POSTGRES_PASSWORD';"
docker exec redis redis-cli CONFIG SET requirepass "$NEW_REDIS_PASSWORD"

# 4. Restart services (zero-downtime)
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d --no-deps --build

# 5. Verify services are healthy
sleep 10
npx @archon-os/cli@latest doctor

# 6. Log rotation
echo "$(date): Rotated POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET" >> /var/log/nyra/secret-rotation.log

echo "✅ Secret rotation complete"
```

---

**End of Environment Configuration Guide**

*Last updated: 2026-01-22*
*Version: 2.0*
*Maintained by: Project Nyra Team*
