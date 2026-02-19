# Integration Plan - Project Nyra Complete Stack

## Phase 1: Core Infrastructure ✅
- [x] Backup existing Makefile
- [ ] Integrate LiteLLM proxy service
- [ ] Update Nexus Router configuration with worker endpoints
- [ ] Configure Cloudflared tunnel for orchestrator

## Phase 2: Service Integration
- [ ] Archon OS - Full stack verification
- [ ] Claude Flow Dashboard - UI setup
- [ ] Gitea - Complete configuration
- [ ] LiteLLM - Integration with Nexus

## Phase 3: Worker Connectivity
- [ ] Configure Ollama endpoint (worker-rtx3060: 100.64.0.11:11434)
- [ ] Configure VLLM endpoints (worker-rtx3090ti: 100.64.0.12:8000, worker-rtx5090: 100.64.0.10:8000)
- [ ] Configure LMCache endpoints
- [ ] Test end-to-end routing through Nexus

## Phase 4: Consolidation
- [ ] Merge Makefiles (existing + feature branches)
- [ ] Consolidate .claude/settings.json
- [ ] Update docker-compose files
- [ ] Create unified .env template

## Access URLs (Post-Integration)
- **Archon UI**: http://100.64.0.1:3737
- **Archon API**: http://100.64.0.1:4000
- **Archon MCP**: http://100.64.0.1:8051
- **Claude Flow Dashboard**: http://100.64.0.1:3003
- **Gitea**: http://100.64.0.1:3001
- **Nexus Router**: http://100.64.0.1:6000
- **LiteLLM**: http://100.64.0.1:4000 (or alternative port)

## Files to Create/Update
1. `infra/docker-compose/docker-compose.litellm.yml`
2. `infra/configs/nexus/nexus.toml` (update with workers)
3. `infra/docker-compose/docker-compose.cloudflared.yml`
4. `Makefile` (consolidated)
5. `.claude/settings.json` (consolidated)
6. `docs/SETUP_GUIDE.md` (Gitea + all services)
