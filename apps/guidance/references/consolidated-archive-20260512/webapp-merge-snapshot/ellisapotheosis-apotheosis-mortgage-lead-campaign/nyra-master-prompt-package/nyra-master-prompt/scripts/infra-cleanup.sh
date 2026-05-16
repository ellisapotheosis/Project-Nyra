#!/bin/bash
# ============================================
# Project Nyra - Infrastructure Cleanup Script
# ============================================
# Reorganizes /infra folder structure

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        Project Nyra - Infrastructure Cleanup                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Set project root
PROJECT_ROOT="${PROJECT_ROOT:-$HOME/projects/project-nyra}"
cd "$PROJECT_ROOT" || { echo -e "${RED}Cannot find project at $PROJECT_ROOT${NC}"; exit 1; }

echo -e "${BLUE}📁 Working directory: $PROJECT_ROOT${NC}"
echo ""

# ============================================
# PHASE 1: Create Archive Directory
# ============================================
echo -e "${YELLOW}[1/6] Creating archive directory...${NC}"

mkdir -p _infra-archived
mkdir -p _infra-archived/old-configs
mkdir -p _infra-archived/deprecated

echo -e "${GREEN}  ✅ Created _infra-archived/${NC}"

# ============================================
# PHASE 2: Archive Old Files
# ============================================
echo -e "${YELLOW}[2/6] Archiving old/deprecated files...${NC}"

# Move old files with common patterns
find infra -maxdepth 2 -type f \( \
    -name "*.old" -o \
    -name "*.bak" -o \
    -name "*.backup" -o \
    -name "*_old*" -o \
    -name "*-old*" -o \
    -name "*.deprecated" \
\) -exec mv {} _infra-archived/old-configs/ \; 2>/dev/null || true

# Move deprecated folder contents
if [ -d "infra/deprecated" ]; then
    mv infra/deprecated/* _infra-archived/deprecated/ 2>/dev/null || true
    rmdir infra/deprecated 2>/dev/null || true
fi

# Count archived files
ARCHIVED=$(find _infra-archived -type f | wc -l)
echo -e "${GREEN}  ✅ Archived $ARCHIVED files${NC}"

# ============================================
# PHASE 3: Create New Structure
# ============================================
echo -e "${YELLOW}[3/6] Creating new directory structure...${NC}"

# Docker directories
mkdir -p infra/docker/orchestrator
mkdir -p infra/docker/worker-rtx3060
mkdir -p infra/docker/worker-rtx5090
mkdir -p infra/docker/worker-rtx3090ti

# Config directories
mkdir -p infra/cloudflared
mkdir -p infra/tailscale
mkdir -p infra/scripts

# Service directories
mkdir -p services/quote-api/src
mkdir -p services/campaign-engine/src
mkdir -p services/lead-ingestor/src
mkdir -p services/moltbot/src

# Package directories
mkdir -p packages/twenty-custom-objects/src
mkdir -p packages/campaign-templates/src
mkdir -p packages/quote-engine/src
mkdir -p packages/compliance/src
mkdir -p packages/memory-schemas/src

# Workflow directories
mkdir -p workflows/n8n
mkdir -p workflows/activepieces/flows

# Docs
mkdir -p docs

echo -e "${GREEN}  ✅ Directory structure created${NC}"

# ============================================
# PHASE 4: Organize Cloudflared Configs
# ============================================
echo -e "${YELLOW}[4/6] Organizing Cloudflared configs...${NC}"

# Find and move cloudflared configs
find . -maxdepth 2 -name "*cloudflared*" -type f 2>/dev/null | while read -r file; do
    if [[ "$file" != *"_infra-archived"* ]] && [[ "$file" != *"infra/cloudflared"* ]]; then
        filename=$(basename "$file")
        if [ ! -f "infra/cloudflared/$filename" ]; then
            cp "$file" "infra/cloudflared/" 2>/dev/null || true
            echo -e "  Copied: $filename"
        fi
    fi
done

# Move tunnel configs if they exist in root
for pattern in "orchestrator-*.yml" "worker-*.yml" "tunnel-*.yml"; do
    find . -maxdepth 1 -name "$pattern" -type f 2>/dev/null | while read -r file; do
        filename=$(basename "$file")
        mv "$file" "infra/cloudflared/" 2>/dev/null || true
        echo -e "  Moved: $filename"
    done
done

echo -e "${GREEN}  ✅ Cloudflared configs organized${NC}"

# ============================================
# PHASE 5: Create Worker READMEs
# ============================================
echo -e "${YELLOW}[5/6] Creating worker documentation...${NC}"

# RTX 3060 (Ollama)
cat > infra/docker/worker-rtx3060/README.md << 'EOF'
# Worker: RTX 3060 (Alienware M15R7)

## Hardware
- **GPU:** NVIDIA RTX 3060 Mobile (8GB VRAM)
- **CPU:** Intel Core i7-12700H
- **RAM:** 32GB DDR5
- **Storage:** 1TB NVMe

## Role
- Ollama server for smaller models (≤7B parameters)
- Embeddings generation
- Fast inference for simple tasks

## Recommended Models
```bash
ollama pull llama3.2:3b
ollama pull phi3:mini
ollama pull nomic-embed-text
ollama pull codellama:7b
```

## Setup
1. Copy `.env.example` to `.env`
2. Fill in environment variables
3. Run: `docker-compose up -d`
4. Verify: `curl http://localhost:11434/api/tags`

## Network
- Tailscale IP: 100.107.188.97
- Ollama API: port 11434
- Worker Agent: port 8000
EOF

# RTX 5090 (vLLM)
cat > infra/docker/worker-rtx5090/README.md << 'EOF'
# Worker: RTX 5090 (Alienware Area-51)

## Hardware
- **GPU:** NVIDIA RTX 5090 (32GB VRAM)
- **CPU:** Intel Core i9-14900HX
- **RAM:** 64GB DDR5
- **Storage:** 2TB NVMe

## Role
- vLLM server for large models (70B+ parameters)
- LMCache for KV cache optimization
- Primary inference for complex tasks

## Recommended Models
- meta-llama/Llama-2-70b-chat-hf
- mistralai/Mixtral-8x7B-Instruct-v0.1
- codellama/CodeLlama-34b-Instruct

## Setup
1. Copy `.env.example` to `.env`
2. Add HF_TOKEN for model downloads
3. Run: `docker-compose up -d`
4. Wait for model download (can take 30+ mins)
5. Verify: `curl http://localhost:8080/health`

## Network
- Tailscale IP: 100.102.204.112
- vLLM API: port 8080
- LMCache: port 8081
- Worker Agent: port 8000
EOF

# RTX 3090Ti (vLLM)
cat > infra/docker/worker-rtx3090ti/README.md << 'EOF'
# Worker: RTX 3090Ti (Desktop)

## Hardware
- **GPU:** NVIDIA RTX 3090 Ti (24GB VRAM)
- **CPU:** Intel Core i7-12700
- **RAM:** 64GB DDR4
- **Storage:** 2TB NVMe

## Role
- vLLM server for medium-large models (13B-34B parameters)
- LMCache for KV cache optimization
- Secondary inference node

## Recommended Models
- meta-llama/Llama-2-13b-chat-hf
- mistralai/Mistral-7B-Instruct-v0.2
- codellama/CodeLlama-13b-Instruct

## Setup
1. Copy `.env.example` to `.env`
2. Add HF_TOKEN for model downloads
3. Run: `docker-compose up -d`
4. Verify: `curl http://localhost:8080/health`

## Network
- Tailscale IP: [GET FROM: tailscale ip -4]
- vLLM API: port 8080
- LMCache: port 8081
- Worker Agent: port 8000
EOF

echo -e "${GREEN}  ✅ Worker documentation created${NC}"

# ============================================
# PHASE 6: Create Placeholder Files
# ============================================
echo -e "${YELLOW}[6/6] Creating placeholder files...${NC}"

# .env.example for orchestrator
cat > infra/docker/orchestrator/.env.example << 'EOF'
# Project Nyra - Orchestrator Environment Variables
# Copy to .env and fill in values

# === Core ===
POSTGRES_PASSWORD=your-secure-password
REDIS_PASSWORD=

# === API Keys ===
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
OPENROUTER_API_KEY=sk-or-xxx

# === Twenty CRM ===
TWENTY_API_KEY=
TWENTY_API_URL=http://localhost:3020
TWENTY_GRAPHQL_URL=http://localhost:3020/graphql

# === Infisical ===
INFISICAL_TOKEN=
INFISICAL_PROJECT_ID=

# === Tailscale ===
TAILSCALE_API_KEY=tskey-api-xxx
ORCHESTRATOR_IP=100.87.235.78
WORKER_RTX3060_IP=100.107.188.97
WORKER_RTX5090_IP=100.102.204.112
WORKER_RTX3090TI_IP=

# === Grafana ===
GRAFANA_PASSWORD=admin

# === Twilio (Campaigns) ===
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# === SendGrid (Email) ===
SENDGRID_API_KEY=
EOF

# .env.example for workers
cat > infra/docker/worker-rtx3060/.env.example << 'EOF'
# Worker RTX 3060 - Environment Variables

WORKER_NAME=worker-rtx3060
TAILSCALE_IP=100.107.188.97
ORCHESTRATOR_IP=100.87.235.78
INFISICAL_TOKEN=
INFISICAL_PROJECT_ID=
EOF

cat > infra/docker/worker-rtx5090/.env.example << 'EOF'
# Worker RTX 5090 - Environment Variables

WORKER_NAME=worker-rtx5090
TAILSCALE_IP=100.102.204.112
ORCHESTRATOR_IP=100.87.235.78
HF_TOKEN=hf_xxx
VLLM_MODEL=meta-llama/Llama-2-70b-chat-hf
INFISICAL_TOKEN=
INFISICAL_PROJECT_ID=
EOF

cat > infra/docker/worker-rtx3090ti/.env.example << 'EOF'
# Worker RTX 3090Ti - Environment Variables

WORKER_NAME=worker-rtx3090ti
TAILSCALE_IP=
ORCHESTRATOR_IP=100.87.235.78
HF_TOKEN=hf_xxx
VLLM_MODEL=meta-llama/Llama-2-13b-chat-hf
INFISICAL_TOKEN=
INFISICAL_PROJECT_ID=
EOF

# Create Makefile
cat > Makefile << 'EOF'
# Project Nyra - Makefile

.PHONY: help init up down health logs clean

help:
	@echo "Project Nyra Commands:"
	@echo "  make init    - Initialize all services"
	@echo "  make up      - Start all services"
	@echo "  make down    - Stop all services"
	@echo "  make health  - Check service health"
	@echo "  make logs    - View logs"
	@echo "  make clean   - Clean up containers"

init:
	@echo "Initializing Project Nyra..."
	docker network create nyra-network 2>/dev/null || true
	@echo "Network created"

up:
	cd infra/docker/orchestrator && docker-compose -f docker-compose.core.yml up -d
	cd infra/docker/orchestrator && docker-compose -f docker-compose.memory.yml up -d
	cd infra/docker/orchestrator && docker-compose -f docker-compose.twenty.yml up -d
	cd infra/docker/orchestrator && docker-compose -f docker-compose.workflows.yml up -d
	cd infra/docker/orchestrator && docker-compose -f docker-compose.nexus.yml up -d
	@echo "All services started"

down:
	cd infra/docker/orchestrator && docker-compose -f docker-compose.core.yml down
	cd infra/docker/orchestrator && docker-compose -f docker-compose.memory.yml down
	cd infra/docker/orchestrator && docker-compose -f docker-compose.twenty.yml down
	cd infra/docker/orchestrator && docker-compose -f docker-compose.workflows.yml down
	cd infra/docker/orchestrator && docker-compose -f docker-compose.nexus.yml down
	@echo "All services stopped"

health:
	./infra/scripts/health-check-all.sh

logs:
	docker-compose logs -f

clean:
	docker system prune -f
	@echo "Cleaned up unused containers"
EOF

echo -e "${GREEN}  ✅ Placeholder files created${NC}"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✨ Infrastructure cleanup complete!${NC}"
echo ""
echo "New structure:"
echo ""
echo "  infra/"
echo "  ├── docker/"
echo "  │   ├── orchestrator/     # Main Docker services"
echo "  │   ├── worker-rtx3060/   # Ollama worker"
echo "  │   ├── worker-rtx5090/   # vLLM worker (32GB)"
echo "  │   └── worker-rtx3090ti/ # vLLM worker (24GB)"
echo "  ├── cloudflared/          # Tunnel configs"
echo "  ├── tailscale/            # ACL configs"
echo "  └── scripts/              # Utility scripts"
echo ""
echo "  _infra-archived/          # Old files moved here"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review _infra-archived/ for anything you want to keep"
echo "  2. Copy docker-compose files to infra/docker/orchestrator/"
echo "  3. Fill in .env files with your secrets"
echo "  4. Run: make init && make up"
echo ""
