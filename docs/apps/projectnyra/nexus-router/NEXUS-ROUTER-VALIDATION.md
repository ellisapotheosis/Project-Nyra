# Nexus Router Routing Validation

**Date**: 2026-01-19
**Author**: Security Auditor Agent (Claude Sonnet 4.5)
**Purpose**: Document nexus-router routing requirements for consolidation preservation

---

## Executive Summary

The **Nexus Router** (port 6000) is a critical gateway service that routes LLM requests for 5 core services. During Docker consolidation, routing must be preserved to maintain functionality. This document provides comprehensive validation requirements and routing architecture.

**Critical Finding**: All services route through nexus via Docker's internal DNS on the `nyra-network` bridge network.

---

## 1. Routing Architecture

### 1.1 Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                      nyra-network (172.28.0.0/16)            │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Nexus Router (nyra-nexus)               │   │
│  │         Internal: :3000 → External: :6000            │   │
│  │  Image: ghcr.io/grafbase/nexus:latest                │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                               │
│               │ (Routes LLM requests)                         │
│               │                                               │
│       ┌───────┴─────────┬────────────┬────────────┐         │
│       ▼                 ▼            ▼            ▼         │
│  ┌─────────┐      ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  Letta  │      │  Mem0   │  │Open-Web │  │  Nyra   │   │
│  │  :8283  │      │  :4321  │  │UI :8080 │  │Orch 8010│   │
│  └─────────┘      └─────────┘  └─────────┘  └─────────┘   │
│       │                 │            │            │         │
│       └─────────────────┴────────────┴────────────┘         │
│                         │                                    │
│                         ▼                                    │
│                   ┌─────────┐                                │
│                   │ LiteLLM │                                │
│                   │  :4000  │                                │
│                   └─────────┘                                │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
                   Cloud APIs
            (Anthropic, OpenRouter, Google)
```

### 1.2 Routing Flow

1. **Client** (Letta, Mem0, etc.) makes LLM request to `http://nexus:6000`
2. **Docker DNS** resolves `nexus` → `172.28.x.x` (internal IP)
3. **Nexus Router** receives request on internal port 3000
4. **Nexus** routes to:
   - LiteLLM (for cost optimization)
   - Direct cloud APIs (Anthropic, OpenRouter, Google)
5. **Response** returned to client

---

## 2. Services Requiring Nexus Routing

### 2.1 Critical Dependencies

| Service               | Container         | Nexus Endpoint                    | Purpose                     |
| --------------------- | ----------------- | --------------------------------- | --------------------------- |
| **Letta**             | nyra-letta        | `http://nexus:6000/v1`            | Agent memory LLM endpoint   |
| **Mem0**              | nyra-mem0         | `http://nexus:6000/llm/openai/v1` | Universal memory embeddings |
| **Open-WebUI**        | nyra-openwebui    | `http://nexus:3000/llm/openai`    | Chat interface              |
| **Nyra Orchestrator** | nyra-orchestrator | `http://nexus:6000`               | Business logic AI calls     |
| **Quote Engine**      | nyra-quote-engine | `http://nexus:6000`               | Quote generation LLM        |

### 2.2 Environment Variables

Each service configures Nexus routing via environment variables:

#### Letta

```yaml
environment:
  - LETTA_LLM_ENDPOINT=http://nexus:6000/v1
  - OPENAI_BASE_URL=http://nexus:6000/llm/openai/v1
  - OPENAI_API_KEY=dummy # Nexus handles real keys
```

#### Mem0

```yaml
environment:
  - NEXUS_OPENAI_BASE_URL=http://nexus:6000/llm/openai/v1
  - OPENAI_API_KEY=dummy
```

#### Open-WebUI

```yaml
environment:
  - OPENAI_API_BASE_URL=http://nexus:3000/llm/openai
  - OPENAI_API_KEY=dummy
```

#### Nyra Orchestrator

```yaml
environment:
  - NEXUS_BASE_URL=http://nexus:6000
```

#### Quote Engine

```yaml
environment:
  - NEXUS_URL=${NEXUS_URL:-http://nexus:6000}
```

---

## 3. Network Requirements

### 3.1 Docker Network Configuration

**Network**: `nyra-network`
**Driver**: bridge
**Subnet**: `172.28.0.0/16`

**Critical**: All services must be on `nyra-network` for routing to work.

### 3.2 Container Networking

```yaml
networks:
  nyra-network:
    name: nyra-network
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### 3.3 Service Network Membership

All services in docker-compose must include:

```yaml
services:
  service-name:
    # ... other config
    networks:
      - nyra-network
```

---

## 4. Nexus Dependencies

### 4.1 Startup Order

**Nexus depends on:**

```yaml
depends_on:
  - litellm
```

**Services depend on Nexus (with health checks):**

```yaml
letta:
  depends_on:
    nexus:
      condition: service_healthy

openwebui:
  depends_on:
    nexus:
      condition: service_healthy

nyra_orchestrator:
  depends_on:
    nexus:
      condition: service_healthy
```

### 4.2 Health Check

**Nexus Health Check:**

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
  interval: 20s
  timeout: 5s
  retries: 10
```

**Internal endpoint**: `http://localhost:3000/health` (inside container)
**External endpoint**: `http://localhost:6000/health` (from host)
**Service-to-service**: `http://nexus:6000/health` (Docker DNS)

---

## 5. API Keys and Security

### 5.1 API Key Flow

1. **API keys stored in Nexus container** via environment variables:
   - `ANTHROPIC_API_KEY`
   - `OPENROUTER_API_KEY`
   - `GOOGLE_API_KEY`

2. **Dependent services use dummy keys**:
   - `OPENAI_API_KEY=dummy`

3. **Nexus injects real keys** when routing to cloud providers

### 5.2 Security Configuration

```yaml
nexus:
  volumes:
    - ../../configs/nexus/nexus.toml:/etc/nexus.toml:ro # Read-only mount
  environment:
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY} # From .env
    - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    - GOOGLE_API_KEY=${GOOGLE_API_KEY}
```

**Key points:**

- Config file mounted read-only (`:ro`)
- API keys passed as environment variables
- Keys never exposed to dependent services
- Network isolation via Docker bridge

---

## 6. Validation Checklist

### Pre-Consolidation Validation

```bash
# 1. Check network exists
docker network inspect nyra-network

# 2. Check Nexus is running
docker ps | grep nyra-nexus

# 3. Check Nexus health
curl http://localhost:6000/health

# 4. Check service can reach Nexus
docker exec nyra-letta curl http://nexus:6000/health
docker exec nyra-mem0 curl http://nexus:6000/health
docker exec nyra-openwebui curl http://nexus:6000/health
```

### Post-Consolidation Validation

Run the automated validation script:

```bash
cd /c/Dev/Projects/Repos/Project-Nyra
bash .research/docker-consolidation-validation.sh
```

**Expected output:**

- ✓ All services on nyra-network
- ✓ Nexus reachable from all dependent services
- ✓ Health endpoints responding
- ✓ Environment variables configured

---

## 7. Services That Can Bypass Nexus

These services do NOT require Nexus routing:

| Service             | Reason                                       |
| ------------------- | -------------------------------------------- |
| **postgres**        | Database - no LLM calls                      |
| **redis**           | Caching - no LLM calls                       |
| **falkordb**        | Graph database - no LLM calls                |
| **qdrant**          | Vector database - no LLM calls               |
| **litellm**         | LLM proxy - receives requests from Nexus     |
| **quote-api**       | REST API - uses quote-engine, not direct LLM |
| **campaign-engine** | Campaign management - no direct LLM calls    |

**Key distinction**: These services either:

- Don't make LLM calls at all (databases, caching)
- Are called BY Nexus (litellm)
- Use other services that route through Nexus (quote-api)

---

## 8. Troubleshooting

### Issue 1: Service Cannot Reach Nexus

**Symptoms:**

- LLM requests fail
- "Connection refused" errors
- Service logs show nexus unreachable

**Diagnosis:**

```bash
# Check service network
docker inspect <service-name> --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}'

# Should output: nyra-network
```

**Solution:**

```yaml
# Add to docker-compose.yml
services:
  my-service:
    networks:
      - nyra-network
```

### Issue 2: Nexus Health Check Fails

**Symptoms:**

- Services won't start (waiting for nexus)
- docker-compose shows "waiting for healthy nexus"

**Diagnosis:**

```bash
# Check Nexus logs
docker logs nyra-nexus --tail 50

# Check health status
docker inspect nyra-nexus --format '{{.State.Health.Status}}'
```

**Solution:**

- Verify API keys are set in `.env`
- Check config file exists: `configs/nexus/nexus.toml`
- Restart Nexus: `docker-compose restart nexus`

### Issue 3: API Keys Not Working

**Symptoms:**

- LLM requests fail with authentication errors
- Nexus logs show "invalid API key"

**Diagnosis:**

```bash
# Check if API keys are set
docker inspect nyra-nexus --format '{{json .Config.Env}}' | grep API_KEY
```

**Solution:**

1. Verify `.env` file exists: `infra/docker-compose/.env`
2. Check keys are set:
   ```bash
   cat infra/docker-compose/.env | grep API_KEY
   ```
3. Restart Nexus to reload environment:
   ```bash
   docker-compose restart nexus
   ```

---

## 9. Consolidation Guidelines

### DO ✓

1. **Preserve network name**: Keep `nyra-network`
2. **Preserve container names**:
   - `nyra-nexus`
   - `nyra-letta`
   - `nyra-mem0`
   - etc.
3. **Preserve port mapping**: `6000:3000`
4. **Preserve health checks**: Keep dependency chains
5. **Preserve environment variables**: All `NEXUS_*` vars
6. **Keep volume mounts**: Config file mounting

### DON'T ✗

1. **Don't change network name**: Services rely on `nyra-network`
2. **Don't change Nexus hostname**: Internal DNS uses `nexus`
3. **Don't skip health checks**: Breaks startup order
4. **Don't expose internal port**: Only expose 6000, not 3000
5. **Don't remove API key env vars**: Breaks cloud routing
6. **Don't change config paths**: Services expect `/etc/nexus.toml`

---

## 10. Testing Protocol

### Manual Testing

```bash
# 1. Start services
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml \
               -f infra/docker-compose/docker-compose.ai.yml \
               up -d

# 2. Wait for healthy status
docker ps | grep nyra-nexus

# 3. Test Nexus health
curl http://localhost:6000/health

# 4. Test from inside Letta
docker exec nyra-letta sh -c "curl -s http://nexus:6000/health"

# 5. Test OpenAI-compatible endpoint
curl http://localhost:6000/v1/models

# 6. Test LLM routing (requires API keys)
curl -X POST http://localhost:6000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash-exp",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'
```

### Automated Testing

Run the validation script after any consolidation changes:

```bash
bash .research/docker-consolidation-validation.sh
```

**Expected Results:**

- All network checks pass
- All service connectivity checks pass
- Health endpoints responding
- Environment variables configured

---

## 11. Configuration Files

### Critical Files

| File                                           | Purpose                   | Must Preserve |
| ---------------------------------------------- | ------------------------- | ------------- |
| `infra/docker-compose/docker-compose.ai.yml`   | Nexus service definition  | ✓             |
| `configs/nexus/nexus.toml`                     | Nexus LLM provider config | ✓             |
| `infra/docker-compose/.env`                    | Environment variables     | ✓             |
| `.research/docker-consolidation-validation.sh` | Validation script         | ✓             |

### Nexus Configuration

**File**: `configs/nexus/nexus.toml`

```toml
[server]
listen_address = "0.0.0.0:6000"

[llm]
enabled = true

[llm.providers.anthropic]
type = "anthropic"
api_key_env = "ANTHROPIC_API_KEY"

[llm.providers.openrouter]
type = "openai"
api_key_env = "OPENROUTER_API_KEY"
base_url = "https://openrouter.ai/api/v1"

[llm.providers.google]
type = "google"
api_key_env = "GOOGLE_API_KEY"
```

---

## 12. Monitoring

### Metrics to Track

After consolidation, monitor:

1. **Nexus Health**: `http://localhost:6000/health`

   ```json
   {
     "status": "healthy",
     "components": {
       "workers": { "healthy": 2, "total": 3 }
     },
     "metrics": {
       "totalRequests": 1543,
       "localPercentage": "90.02"
     }
   }
   ```

2. **Service Logs**: Check for routing errors

   ```bash
   docker logs nyra-letta | grep nexus
   docker logs nyra-mem0 | grep nexus
   docker logs nyra-openwebui | grep nexus
   ```

3. **Network Connectivity**: Periodic health checks
   ```bash
   docker exec nyra-letta curl -sf http://nexus:6000/health
   docker exec nyra-mem0 curl -sf http://nexus:6000/health
   ```

---

## 13. References

### Documentation

- **Nexus Router README**: `services/nexus-router/README.md`
- **Architecture Analysis**: `docs/architecture/NEXUS-ROUTER-ARCHITECTURE-ANALYSIS.md`
- **Docker Compose Files**: `infra/docker-compose/*.yml`

### Scripts

- **Validation**: `.research/docker-consolidation-validation.sh`
- **Existing Validation**: `scripts/validate-nexus-router.sh`
- **Testing**: `scripts/test-nexus-router.ps1`

### Related Issues

- Network isolation requirements
- API key security
- Health check timing
- Startup dependency order

---

## Conclusion

**Nexus Router routing is critical infrastructure** that must be preserved during consolidation. The routing architecture is simple but requires careful attention to:

1. **Network membership**: All services on `nyra-network`
2. **Container naming**: Preserve `nexus` hostname
3. **Environment variables**: Keep all `NEXUS_*` configurations
4. **Health checks**: Maintain dependency order
5. **Security**: Preserve read-only config mounts and API key isolation

**Validation Protocol**: Run `.research/docker-consolidation-validation.sh` after any consolidation changes to ensure routing integrity.

---

**Document Version**: 1.0
**Last Updated**: 2026-01-19
**Author**: Security Auditor Agent (Claude Sonnet 4.5)
**Storage**: Memory namespace "consolidation", key "nexus-validation"
