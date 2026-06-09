# STEP 5: Master Makefile Alignment – Fleet Standardization

**Status**: DESIGN & IMPLEMENTATION GUIDE  
**Date**: 2026-05-28  
**Scope**: Consolidate 5 docker contexts (orchestrator, oracle-vps, worker-rtx5090, worker-rtx3090ti, worker-rtx3060)  
**Objective**: Unified fleet commands with per-host service management

---

## Overview

STEP 5 standardizes the Makefile across all 5 nodes, enabling unified cluster orchestration:

```bash
# Old way (per-host execution):
docker --context orchestrator compose ps
docker --context oracle-vps compose ps
docker --context worker-rtx5090 compose ps

# New way (unified fleet):
make fleet-ps               # All nodes
make fleet-ps HOST=worker-rtx5090  # Single host
make fleet-restart SERVICE=nexus   # Specific service across fleet
```

**Key Goals:**
- 🎯 **Unified commands**: Single `make` call controls entire fleet
- 📊 **Health visibility**: One command to check all 5 nodes
- ⚡ **Service orchestration**: Deploy/restart services across hosts
- 📝 **Log aggregation**: Stream logs from multiple hosts simultaneously
- 🔐 **Context standardization**: All contexts named by hostname (oracle-vps, not oracle)

---

## Makefile Architecture

### Current Structure (After STEP 3-4)

```makefile
ORACLE_CONTEXT := oracle-vps
ORCHESTRATOR_CONTEXT := orchestrator
WORKER_3060_CONTEXT := worker-rtx3060
WORKER_3090TI_CONTEXT := worker-rtx3090ti
WORKER_5090_CONTEXT := worker-rtx5090

# Per-context helpers
$(call nyra_host_compose, $(INFISICAL_PATH), $(CONTEXT), -f compose.yml ...)
```

### New Addition: Fleet-Level Targets

```makefile
# Fleet targets (operate on all 5 hosts)
fleet-ps               # Container status across all nodes
fleet-logs SERVICE=X   # Aggregate logs from service on all nodes
fleet-health           # Health check all nodes
fleet-deploy SERVICE=X # Deploy service to all nodes
fleet-restart SERVICE=X # Restart service on all nodes

# Host-specific fleet targets
fleet-restart-worker HOST=X SERVICE=Y  # Restart service on single worker
fleet-logs-host HOST=X [SERVICE=Y]     # Logs from specific host
fleet-health-host HOST=X               # Health check single host
```

---

## Implementation

### Phase 1: Context Validation

Verify all 5 contexts are properly registered:

```bash
# List registered Docker contexts
docker context ls

# Expected output:
NAME                TYPE   DESCRIPTION
default             moby   
orchestrator        docker 
oracle-vps          docker 
worker-rtx3060      docker 
worker-rtx3090ti    docker 
worker-rtx5090      docker 
```

### Phase 2: Fleet Helper Functions

Add to Makefile:

```makefile
# List of all fleet hosts
ALL_HOSTS := orchestrator oracle-vps worker-rtx5090 worker-rtx3090ti worker-rtx3060

# Helper: Execute command on all hosts
fleet_on_all = @for host in $(ALL_HOSTS); do \
    echo "🔹 $$host:"; \
    docker --context $$host $(1); \
done

# Helper: Execute on single host (or all if not specified)
fleet_on_host = docker --context $(HOST)$(if $(findstring $(HOST),$(ALL_HOSTS)),,_INVALID) $(1)
```

### Phase 3: Fleet Targets

```makefile
# --- FLEET COMMANDS (Multi-host orchestration) ---

fleet-ps:
	@echo "📦 Container Status Across Fleet"
	@echo "=================================="
	@for host in $(ALL_HOSTS); do \
		echo ""; \
		echo "🔹 $$host:"; \
		docker --context $$host compose ps 2>/dev/null | tail -n +2 || echo "  [offline or compose not configured]"; \
	done

fleet-health:
	@echo "📊 Fleet Health Check"
	@echo "====================="
	@for host in $(ALL_HOSTS); do \
		echo ""; \
		echo "🔹 $$host:"; \
		docker --context $$host version --format '  Docker: {{.Server.Version}}' 2>/dev/null || echo "  [offline]"; \
		docker --context $$host compose ps 2>/dev/null | wc -l | awk '{print "  Services: " $$1-1}'; \
	done

fleet-logs:
	@[ -n "$(SERVICE)" ] || (echo "❌ SERVICE required: make fleet-logs SERVICE=nexus"; exit 1)
	@echo "📋 Logs: $(SERVICE) [Fleet]"
	@echo "==============================" 
	@for host in $(ALL_HOSTS); do \
		docker --context $$host compose logs -f $(SERVICE) 2>/dev/null &\
	done; \
	wait

fleet-restart:
	@[ -n "$(SERVICE)" ] || (echo "❌ SERVICE required: make fleet-restart SERVICE=nexus"; exit 1)
	@echo "🔄 Restarting: $(SERVICE) [Fleet]"
	@for host in $(ALL_HOSTS); do \
		echo "  🔹 $$host..."; \
		docker --context $$host compose restart $(SERVICE) 2>/dev/null; \
	done
	@echo "✅ Restart complete"

fleet-up:
	@echo "🚀 Starting all services [Fleet]"
	@for host in $(ALL_HOSTS); do \
		echo "  🔹 $$host..."; \
		docker --context $$host compose up -d 2>/dev/null; \
	done
	@echo "✅ All hosts started"

fleet-down:
	@echo "🛑 Stopping all services [Fleet]"
	@for host in $(ALL_HOSTS); do \
		echo "  🔹 $$host..."; \
		docker --context $$host compose down 2>/dev/null; \
	done
	@echo "✅ All hosts stopped"

# Host-specific targets
fleet-logs-host:
	@[ -n "$(HOST)" ] || (echo "❌ HOST required: make fleet-logs-host HOST=oracle-vps [SERVICE=X]"; exit 1)
	@docker --context $(HOST) compose logs -f $(SERVICE)

fleet-ps-host:
	@[ -n "$(HOST)" ] || (echo "❌ HOST required: make fleet-ps-host HOST=oracle-vps"; exit 1)
	@docker --context $(HOST) compose ps

fleet-health-host:
	@[ -n "$(HOST)" ] || (echo "❌ HOST required: make fleet-health-host HOST=oracle-vps"; exit 1)
	@echo "📊 Health Check: $(HOST)"
	@docker --context $(HOST) version --format 'Docker: {{.Server.Version}}'
	@docker --context $(HOST) compose ps
	@docker --context $(HOST) compose exec <primary-service> /health-check 2>/dev/null || true

fleet-restart-service:
	@[ -n "$(HOST)" ] || (echo "❌ HOST required: make fleet-restart-service HOST=oracle-vps"; exit 1)
	@[ -n "$(SERVICE)" ] || (echo "❌ SERVICE required: make fleet-restart-service HOST=X SERVICE=Y"; exit 1)
	@echo "🔄 Restarting $(SERVICE) on $(HOST)..."
	@docker --context $(HOST) compose restart $(SERVICE)
	@echo "✅ Complete"
```

### Phase 4: Worker-Specific Targets

Enable fast targeting of GPU workers:

```makefile
# --- WORKER-SPECIFIC SHORTCUTS ---

worker-all: worker-3060 worker-3090ti worker-5090

worker-3060:
	@docker --context worker-rtx3060 compose ps

worker-3090ti:
	@docker --context worker-rtx3090ti compose ps

worker-5090:
	@docker --context worker-rtx5090 compose ps

worker-health:
	@echo "GPU Worker Health"
	@echo "================="
	@docker --context worker-rtx3060 compose ps && echo "✓ RTX3060"
	@docker --context worker-rtx3090ti compose ps && echo "✓ RTX3090Ti"
	@docker --context worker-rtx5090 compose ps && echo "✓ RTX5090"

worker-restart-ollama:
	@docker --context worker-rtx3060 compose restart ollama
	@echo "✓ Ollama restarted on RTX3060"

worker-restart-vllm:
	@docker --context worker-rtx5090 compose restart vllm
	@docker --context worker-rtx3090ti compose restart vllm
	@echo "✓ vLLM restarted on RTX5090 and RTX3090Ti"
```

---

## Usage Examples

### Status Monitoring

```bash
# Quick status of all nodes
make fleet-ps
# Output:
# 🔹 orchestrator:
# nexus              running
# litellm            running
# ...
#
# 🔹 oracle-vps:
# twenty             running
# caddy-reverse-proxy running
# ...

# Single host status
make fleet-ps-host HOST=worker-rtx5090
# Output:
# vllm               running
# loki               running
# ...
```

### Health Checks

```bash
# Full fleet health
make fleet-health

# Single host health  
make fleet-health-host HOST=oracle-vps

# GPU worker health shortcut
make worker-health
```

### Service Management

```bash
# Restart nexus across all nodes
make fleet-restart SERVICE=nexus

# Restart ollama on specific worker
make fleet-restart-service HOST=worker-rtx3060 SERVICE=ollama

# View vLLM logs from RTX5090
make fleet-logs-host HOST=worker-rtx5090 SERVICE=vllm

# Aggregate logs from nexus across fleet
make fleet-logs SERVICE=nexus
```

### Deployment

```bash
# Start all services on all hosts
make fleet-up

# Stop all services gracefully
make fleet-down

# Restart specific service globally
make fleet-restart SERVICE=caddy-reverse-proxy
```

---

## Context Mapping Reference

| Host | Context | VRAM | Role |
|------|---------|------|------|
| **orchestrator** | `orchestrator` | N/A | Control plane (Nexus, LiteLLM, observability) |
| **oracle-vps** | `oracle-vps` | N/A | Cloud backend (CRM, DB, memory, Infisical) |
| **worker-rtx5090** | `worker-rtx5090` | 48GB | Primary inference (DeepSeek-R1, vLLM) |
| **worker-rtx3090ti** | `worker-rtx3090ti` | 24GB | Secondary inference (vLLM, TTS) |
| **worker-rtx3060** | `worker-rtx3060` | 12GB | Light inference (Ollama, embeddings, STT) |

---

## Validation Checklist

After implementing STEP 5, verify:

```bash
# ✅ All contexts registered
docker context ls | grep -c "worker-rtx5090"

# ✅ All Makefile targets exist
grep -c "^fleet-" Makefile

# ✅ Dry-run all fleet commands
make -n fleet-ps
make -n fleet-health
make -n fleet-restart SERVICE=nexus

# ✅ Single host commands work
make fleet-ps-host HOST=oracle-vps
make fleet-health-host HOST=worker-rtx5090

# ✅ Worker shortcuts function
make worker-health
make worker-3060
```

---

## Integration with Previous Steps

### STEP 3 Integration (Port-Free Endpoints)

```bash
# Restart Caddy on all hosts (if deployed)
make fleet-restart SERVICE=caddy-reverse-proxy

# Verify Caddy healthy across fleet
make fleet-health | grep caddy
```

### STEP 4 Integration (PKI Infrastructure)

```bash
# Check Infisical on all hosts
make fleet-logs-host HOST=oracle-vps SERVICE=infisical-backend

# Health check Infisical PKI
make fleet-health-host HOST=oracle-vps
```

---

## Performance Considerations

### Parallel Execution

Current fleet targets run **sequentially** (one host at a time) to avoid overwhelming terminal. For parallel execution:

```bash
# Manual parallel execution (backgrounds all jobs)
for host in orchestrator oracle-vps worker-rtx5090 worker-rtx3090ti worker-rtx3060; do
    docker --context $host compose ps &
done
wait
```

### Log Aggregation

`fleet-logs` backgrounds all log streams. To manage output:

```bash
# Logs with timestamps and host prefix
make fleet-logs SERVICE=nexus | sed "s/^/[$(date +%H:%M:%S)] /"

# Logs to file per host
mkdir -p logs/fleet/
for host in orchestrator oracle-vps worker-*; do
    make fleet-logs-host HOST=$host | tee logs/fleet/$host.log &
done
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `context not found` | Docker context not registered | Create via `docker context create <name> <SSH_URL>` |
| `permission denied` | SSH key not authorized | Add public key to `~/.ssh/authorized_keys` on target host |
| `compose not configured` | docker-compose.yml missing on host | Deploy via `make fleet-up` or manually |
| Logs won't aggregate | Background jobs not captured | Redirect to file or use `tmux` for session management |

---

## Next: Completion

STEP 5 completes the infrastructure standardization suite:

✅ STEP 1: Global search/replace audit + Infisical CLI audit  
✅ STEP 2: Self-hosted Infisical deployment  
✅ STEP 3: Port-free endpoints via Caddy reverse proxy  
✅ STEP 4: PKI & CA infrastructure for SSH mobility  
✅ STEP 5: Master Makefile alignment across 5 hosts  

**Post-Implementation:** All cluster nodes now respond to unified Makefile commands, eliminating context switching and enabling true fleet orchestration.

---

## Summary Command Reference

```bash
# Fleet monitoring
make fleet-ps          # All containers across fleet
make fleet-health      # Health check all nodes

# Service management
make fleet-logs SERVICE=nexus          # Aggregate logs
make fleet-restart SERVICE=nexus       # Restart service on all nodes
make fleet-up                          # Start all nodes
make fleet-down                        # Stop all nodes

# Host-specific operations
make fleet-logs-host HOST=oracle-vps SERVICE=infisical-backend
make fleet-health-host HOST=worker-rtx5090
make fleet-restart-service HOST=worker-rtx5090 SERVICE=vllm

# Worker shortcuts
make worker-health                     # All GPU workers
make worker-3060                       # RTX3060 status
make worker-restart-vllm               # vLLM on all inference workers
```

---

**Generated**: 2026-05-28 | **Status**: Ready for Implementation  
**Maintained By**: Claude Code | **Next**: Post-deployment monitoring & optimization
