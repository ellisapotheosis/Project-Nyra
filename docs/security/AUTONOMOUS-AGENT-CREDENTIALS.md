# Autonomous Agent Credential Management

**Status:** Production-ready  
**Architecture:** Cloud Infisical + local caching + runtime mediation  
**Free-tier compatible:** Yes

---

## Overview

Autonomous agents access credentials **without storing or logging real API keys**. Pattern:

```
Agent → agent-run.sh → infisical run → Cloud Infisical → Real secret (memory-only)
```

Secret exists in memory only during command execution. No .env files. No logs.

---

## Quick Start (Agent Access)

### Option 1: Direct Runtime Retrieval (Safest)

```bash
# Agent runs command with secrets injected at runtime
./scripts/infisical/agent-run.sh --env prod -- python my_agent.py

# Inside agent, access secrets:
import os
api_key = os.environ.get('ANTHROPIC_API_KEY')
# Key exists only during execution; never stored
```

### Option 2: From Docker Container (Mounted Secrets)

If agent runs in Docker on orchestrator/Oracle VPS:

```bash
# Start with mounted secrets volume
docker run \
  --volumes-from nyra-infisical-agent \
  -v nyra_secrets:/run/nyra-secrets:ro \
  my-agent:latest

# Inside container, read from file:
cat /run/nyra-secrets/current/anthropic_api_key
# Files updated every 60s by infisical-agent sidecar
```

### Option 3: From Orchestrator Services

Services running on orchestrator with infisical-agent sidecar:

```javascript
// Node.js example
const fs = require('fs');
const apiKey = fs.readFileSync('/run/nyra-secrets/current/anthropic_api_key', 'utf8').trim();

// Or use environment (infisical run injects):
const apiKey = process.env.ANTHROPIC_API_KEY;
```

---

## Architecture

### Orchestrator (WSL2 / Control Plane)

```yaml
services:
  secrets-init:       # Bootstrap from cloud Infisical once
    restart: "no"
  
  infisical-agent:    # Poll cloud every 60s, refresh /run/nyra-secrets/
    restart: unless-stopped
  
  my-agent-service:   # Depends on infisical-agent, reads from volume
    depends_on:
      infisical-agent:
        condition: service_started
    volumes:
      - nyra_secrets:/run/nyra-secrets:ro
```

### Workers (GPU Nodes)

Use overlay to add secrets distribution:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.infisical-secrets-agent.yml \
  up -d
```

Same pattern as orchestrator: secrets-init → infisical-agent → services read from volume.

---

## Implementation Checklist

### Phase 1: Setup (Day 1)

- [ ] Orchestrator compose includes secrets-init + infisical-agent
  - Already done ✓
- [ ] INFISICAL_TOKEN exported in environment
  - Check: `echo $INFISICAL_TOKEN`
- [ ] INFISICAL_UNIVERSAL_AUTH_CLIENT_ID/SECRET in ~/.zshrc
  - Check: `grep INFISICAL_UNIVERSAL ~/.zshrc`
- [ ] Start orchestrator: `make up-orchestrator`
  - Verifies: secrets-init + infisical-agent boot successfully
- [ ] Verify `/run/nyra-secrets/current/` populated
  - `docker exec $(docker ps -q -f ancestor=infisical-secrets-init) ls -la /run/nyra-secrets/current/`

### Phase 2: Agent Integration (Day 2)

- [ ] Agent uses `agent-run.sh` for runtime credential access
- [ ] Agent never prints or logs API keys
  - Grep logs: `grep -i "sk-\|api.?key\|secret" agent-logs.txt` → should be empty
- [ ] Test: `./scripts/infisical/agent-run.sh -- printenv | grep ANTHROPIC`
  - Should show real key temporarily, only during command execution

### Phase 3: Worker Distribution (Day 3)

- [ ] Add secrets overlay to worker composes (if needed)
- [ ] Workers poll cloud Infisical via their own infisical-agent
- [ ] Verify: `docker --context worker-5090 exec ... ls /run/nyra-secrets/current/`

### Phase 4: Verification (Day 4)

- [ ] All tests passing (see below)
- [ ] No raw keys in git history
  - `git log -p | grep -i "sk-\|api.?key" || echo "GOOD"`
- [ ] No raw keys in running containers
  - `docker ps -q | xargs -I {} docker inspect {} | grep -i "sk-" || echo "GOOD"`
- [ ] Pre-commit hook still active
  - `git config core.hooksPath` → should be `scripts/security/hooks`

---

## Verification Tests

### Test 1: Agent Can Retrieve Secret at Runtime

```bash
# Test script (agent-test-retrieval.sh)
#!/bin/bash
set -euo pipefail

# Runtime retrieval via agent-run.sh
./scripts/infisical/agent-run.sh --env prod -- bash -c '
  if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
    echo "FAIL: ANTHROPIC_API_KEY not set"
    exit 1
  fi
  
  # Key exists, but do NOT print it
  if [[ ${#ANTHROPIC_API_KEY} -gt 10 ]]; then
    echo "PASS: Secret retrieved (length=$(( ${#ANTHROPIC_API_KEY} - 4 ))..)"
    exit 0
  fi
  
  echo "FAIL: Secret too short"
  exit 1
'
```

Run:
```bash
bash agent-test-retrieval.sh
# Expected: PASS: Secret retrieved (length=47..)
```

### Test 2: Secret Not Logged

```bash
# Capture logs while retrieving secret
./scripts/infisical/agent-run.sh --env prod -- python -c "
import os
key = os.environ['ANTHROPIC_API_KEY']
print('Agent running...')
" 2>&1 | tee /tmp/agent-log.txt

# Verify no raw key in log
grep -E "sk-ant-|sk-test" /tmp/agent-log.txt && echo "FAIL: Key logged!" && exit 1 || echo "PASS: No key in logs"
```

### Test 3: Mounted Secrets (Orchestrator)

```bash
# Verify infisical-agent populated volume
docker exec $(docker ps -q -f label=com.docker.compose.service=infisical-agent) \
  test -f /run/nyra-secrets/current/anthropic_api_key && echo "PASS: File mounted" || echo "FAIL: File missing"

# Verify service can read it
docker exec $(docker ps -q -f label=com.docker.compose.service=openclaw-gateway) \
  test -r /run/nyra-secrets/current/anthropic_api_key && echo "PASS: Service can read" || echo "FAIL: Permission denied"
```

### Test 4: Pre-Commit Still Blocks Secrets

```bash
# Test that hard-coded key in code is blocked
echo 'export ANTHROPIC_API_KEY=sk-ant-v0-abcd1234' > test-agent-leak.sh
git add test-agent-leak.sh
git commit -m "test" 2>&1 | grep -q "LEAK-DETECTED" && echo "PASS: Leak blocked" || echo "FAIL: Leak not detected"
git reset HEAD test-agent-leak.sh
rm test-agent-leak.sh
```

### Test 5: No Raw Keys in Environment

```bash
# On orchestrator, verify env vars NOT set (secrets come from volume)
docker exec $(docker ps -q -f label=com.docker.compose.service=openclaw-gateway) \
  env | grep -E "ANTHROPIC_API_KEY|OPENAI_API_KEY|DATABASE_PASSWORD" \
  && echo "FAIL: Raw keys in env" || echo "PASS: Env clean (reading from volume)"
```

### Test 6: Worker Secret Access (If Deployed)

```bash
# On worker-5090, verify secrets distributed
docker --context worker-5090 exec $(docker ps -q -f ancestor=infisical-secrets-init) \
  ls /run/nyra-secrets/current/ | wc -l | awk '{print ($1 > 5) ? "PASS: Secrets populated" : "FAIL: No secrets"}'
```

---

## Runbook: Autonomous Agent Initialization

### For On-Demand Agent (No Docker)

```bash
#!/bin/bash
# agent-init.sh — Initialize agent with credentials

export INFISICAL_TOKEN="$(cat ~/.zshrc | grep INFISICAL_TOKEN | cut -d= -f2-)"
export INFISICAL_PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
export INFISICAL_ENV="prod"
export INFISICAL_PATH="/hosts/orchestrator"

# Retrieve all secrets and export for this session
eval "$(infisical export --format=bash --env=prod --path=/hosts/orchestrator)"

# Now agent can use: ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.
python my_autonomous_agent.py
```

### For Docker-Based Agent (Recommended)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY my_agent.py .

# Expect nyra_secrets volume at runtime
ENTRYPOINT ["python", "my_agent.py"]
```

```bash
# docker-compose.yml
services:
  my-agent:
    build: .
    depends_on:
      infisical-agent:
        condition: service_started
    volumes:
      - nyra_secrets:/run/nyra-secrets:ro
    environment:
      SECRETS_PATH: /run/nyra-secrets/current
    networks:
      - nyra-network
```

### For Cloud/Remote Agent

```bash
# SSH into remote machine, use agent-run.sh wrapper
ssh remote-agent-host 'bash -s' << 'EOF'
export INFISICAL_TOKEN="<your-token>"
/path/to/scripts/infisical/agent-run.sh --env prod -- python agent.py
EOF
```

---

## Security Properties

| Threat | Mitigation | Verification |
|--------|-----------|--------------|
| Raw key in git | Pre-commit hook blocks | Test 4 |
| Raw key logged | `infisical run` memory-only | Test 2 |
| Raw key in env vars | Read from `/run/nyra-secrets/` volume | Test 5 |
| Key exfiltration via network | TLS to cloud Infisical, agent caches locally | Test 3 |
| Stale keys used | Agent polls every 60s, refreshes files | Monitor logs |
| Unauthorized agent access | Machine identity auth, scoped to `/hosts/orchestrator` | Cloud Infisical ACLs |

---

## Troubleshooting

### Agent Can't Access Secret

```bash
# 1. Verify INFISICAL_TOKEN is set
echo $INFISICAL_TOKEN | wc -c  # Should be > 100

# 2. Verify Infisical CLI is authenticated
infisical secrets --env=prod --path=/hosts/orchestrator | head -5

# 3. Verify volume mounted (if Docker)
docker inspect $(docker ps -q -f ancestor=my-agent) | grep -A 5 "Mounts"

# 4. Check infisical-agent logs
docker logs $(docker ps -q -f ancestor=infisical-agent) | tail -20
```

### Secret File Not Populated

```bash
# 1. Verify secrets-init ran successfully
docker logs $(docker ps -q -f label=com.docker.compose.service=secrets-init) | tail -20

# 2. Check volume exists
docker volume ls | grep nyra_secrets

# 3. Manually refresh
docker exec $(docker ps -q -f ancestor=infisical-agent) /usr/local/bin/refresh_secrets.sh
```

### Pre-Commit Hook Not Running

```bash
# 1. Check hook path
git config core.hooksPath  # Should be: scripts/security/hooks

# 2. Verify hook executable
ls -l .git/hooks/pre-commit || ls -l scripts/security/hooks/pre-commit

# 3. Re-install
./scripts/security/nyra-secret-scan.sh --install-hook
```

---

## Next Steps

1. Start orchestrator with secrets distribution: `make up-orchestrator`
2. Verify secrets populated: `docker volume inspect nyra_secrets`
3. Run all verification tests (see above)
4. Update agents to use `agent-run.sh` or mounted volume pattern
5. Monitor audit logs (Infisical cloud dashboard)

---

**References:**
- `scripts/infisical/agent-run.sh` — Runtime credential wrapper
- `infra/hosts/_templates/docker-compose.infisical-secrets-agent.yml` — Worker overlay
- `scripts/security/hooks/pre-commit` — Leak detection
- `infra/hosts/orchestrator/docker-compose.yml` — Orchestrator secrets setup
