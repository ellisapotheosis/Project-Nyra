# Nexus Router - Quick Reference Card

**Date**: 2026-01-19 | **Status**: ✅ VALIDATED

---

## 🚨 CRITICAL: Services That MUST Route Through Nexus

| Service | Container | Endpoint |
|---------|-----------|----------|
| Letta | `nyra-letta` | `http://nexus:6000/v1` |
| Mem0 | `nyra-mem0` | `http://nexus:6000/llm/openai/v1` |
| Open-WebUI | `nyra-openwebui` | `http://nexus:3000/llm/openai` |
| Nyra Orchestrator | `nyra-orchestrator` | `http://nexus:6000` |
| Quote Engine | `nyra-quote-engine` | `http://nexus:6000` |

---

## 📡 Network Configuration

```yaml
Network: nyra-network
Driver: bridge
Subnet: 172.28.0.0/16
DNS: Docker internal DNS resolves "nexus" hostname
```

---

## 🐳 Nexus Container

```yaml
Container: nyra-nexus
Image: ghcr.io/grafbase/nexus:latest
Ports: 6000:3000 (external:internal)
Hostname: nexus
Network: nyra-network
```

---

## 🔑 Environment Variables

**Nexus Container:**
```bash
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
```

**Dependent Services:**
```bash
OPENAI_API_KEY=dummy  # Nexus handles real keys
```

---

## 🔄 Startup Order

```
1. litellm (starts first)
   ↓
2. nexus (depends_on: litellm)
   ↓
3. letta, mem0, openwebui, nyra_orchestrator
   (depends_on: nexus with health check)
```

---

## 💚 Health Check

```yaml
Internal:  http://localhost:3000/health
External:  http://localhost:6000/health
Service:   http://nexus:6000/health
Interval:  20s
Timeout:   5s
Retries:   10
```

---

## ✅ Validation Commands

```bash
# 1. Check network
docker network inspect nyra-network

# 2. Check Nexus running
docker ps | grep nyra-nexus

# 3. Check health
curl http://localhost:6000/health

# 4. Test connectivity
docker exec nyra-letta curl http://nexus:6000/health
docker exec nyra-mem0 curl http://nexus:6000/health

# 5. Run full validation
bash .research/docker-consolidation-validation.sh
```

---

## ✓ DO During Consolidation

- ✓ Preserve network name: `nyra-network`
- ✓ Preserve container name: `nyra-nexus`
- ✓ Preserve port mapping: `6000:3000`
- ✓ Preserve health checks and dependencies
- ✓ Keep all `NEXUS_*` environment variables
- ✓ Mount config read-only: `nexus.toml:/etc/nexus.toml:ro`

---

## ✗ DON'T During Consolidation

- ✗ Don't change network name
- ✗ Don't change Nexus hostname
- ✗ Don't skip health checks
- ✗ Don't expose internal port 3000
- ✗ Don't remove API key env vars
- ✗ Don't change config paths

---

## 🔍 Troubleshooting

**Service can't reach Nexus:**
```bash
docker inspect <service> | grep Network
# Ensure on nyra-network
```

**Health check fails:**
```bash
docker logs nyra-nexus --tail 50
# Check API keys in .env
```

**API keys not working:**
```bash
docker inspect nyra-nexus | grep API_KEY
# Restart: docker-compose restart nexus
```

---

## 📁 Critical Files

- **Compose**: `infra/docker-compose/docker-compose.ai.yml`
- **Config**: `configs/nexus/nexus.toml`
- **Env**: `infra/docker-compose/.env`
- **Validation**: `.research/docker-consolidation-validation.sh`
- **Docs**: `docs/NEXUS-ROUTER-VALIDATION.md`

---

## 🎯 Services That Can Bypass Nexus

- postgres, redis, falkordb, qdrant (no LLM calls)
- litellm (receives requests FROM Nexus)
- quote-api, campaign-engine (indirect LLM via other services)

---

**Full Documentation**: `docs/NEXUS-ROUTER-VALIDATION.md`
**Validation Script**: `.research/docker-consolidation-validation.sh`
**JSON Summary**: `.research/nexus-validation-summary.json`
