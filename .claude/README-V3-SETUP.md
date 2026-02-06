# Claude Flow V3 - Project Nyra Quick Reference

## Agent Capabilities

### Mortgage Domain (Auto-Loaded, Priority: CRITICAL)
- **mortgage_architect**: Architecture & compliance design
- **compliance_sentinel**: TILA/RESPA validation & blocking

### Development (Auto-Loaded, Priority: HIGH)
- **fastapi_backend_engineer**: Python FastAPI services (Quote, Campaign, Orchestrator)
- **nextjs_frontend_engineer**: TypeScript React Next.js (RateHunter, Admin)
- **devops_orchestrator**: Docker, monitoring, 4-PC cluster
- **integration_specialist**: APIs, webhooks, MCP servers

### Core Agents (On-Demand)
- **coder**: Implementation & refactoring
- **planner**: Task decomposition
- **researcher**: Codebase exploration
- **reviewer**: Code review & security
- **tester**: Test generation & execution

## Quick Commands

```bash
# Status & Info
npx @claude-flow/cli@latest status              # Overall system status
npx @claude-flow/cli@latest agents list         # List all agents
npx @claude-flow/cli@latest tasks list          # Active tasks
npx @claude-flow/cli@latest memory stats        # Memory usage

# Daemon Control
npx @claude-flow/cli@latest daemon start        # Start daemon
npx @claude-flow/cli@latest daemon stop         # Stop daemon
npx @claude-flow/cli@latest daemon restart      # Restart daemon

# Swarm Operations
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh
npx @claude-flow/cli@latest swarm status
npx @claude-flow/cli@latest swarm scale --agents 15

# Memory Operations
npx @claude-flow/cli@latest memory store --namespace [ns] --key [k] --value [v]
npx @claude-flow/cli@latest memory get --namespace [ns] --key [k]
npx @claude-flow/cli@latest memory search --query [q]

# MCP Server
npx @claude-flow/cli@latest mcp start
npx @claude-flow/cli@latest mcp status
npx @claude-flow/cli@latest mcp stop
```

## Configuration Files

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Hooks, permissions, claude-flow config |
| `.claude/agent-registry.json` | Agent definitions and capabilities |
| `.mcp.json` | MCP server configuration |
| `.claude/agents/custom/*.md` | Project Nyra specialized agents |

## Service Ports

| Service | Port | Location |
|---------|------|----------|
| Claude Flow | 6100 | Orchestrator Mini |
| Archon OS | 6200 | Orchestrator Mini |
| Nexus Router | 6000 | Orchestrator Mini |
| Letta | 8283 | Orchestrator Mini |
| TwentyCRM | 3000 | GPU Worker 2 |
| n8n | 5678 | GPU Worker 2 |
| Dify | 3001 | GPU Worker 2 |
| Prometheus | 9090 | GPU Worker 3 |
| Grafana | 3005 | GPU Worker 3 |
| Loki | 3100 | GPU Worker 3 |

## Compliance Requirements

Every mortgage feature MUST:
- ✓ Include APR calculation per TILA
- ✓ Generate required disclosures (Good Faith Estimate, Loan Estimate)
- ✓ Pass fair lending validation
- ✓ Comply with state-specific regulations
- ✓ Create complete audit trail
- ✓ Encrypt all PII data
- ✓ Block deployment if compliance fails

## Development Workflow

1. **Architecture Review**: mortgage_architect designs feature
2. **Compliance Check**: compliance_sentinel validates approach
3. **Backend Implementation**: fastapi_backend_engineer builds APIs
4. **Frontend Implementation**: nextjs_frontend_engineer creates UI
5. **Integration**: integration_specialist connects third-party services
6. **Deployment**: devops_orchestrator deploys to 4-PC cluster
7. **Monitoring**: Prometheus/Grafana/Loki track performance

## Emergency Contacts

- Claude Flow Issues: Check `CLAUDE-FLOW-V3-SETUP.md`
- Zod Package Errors: See troubleshooting section
- Agent Not Loading: Verify `.claude/agent-registry.json`
- Docker Issues: Check `infra/claude-flow/docker-compose.yml`

## Performance Targets

| Metric | Target |
|--------|--------|
| Quote Generation | < 2 seconds (p95) |
| API Response Time | < 500ms (p95) |
| Page Load (RateHunter) | < 1.5s |
| Dashboard Load | < 2s |
| System Uptime | 99.9% |
| Error Rate | < 1% |
| Test Coverage | > 90% |

---

**For full setup instructions, see**: `CLAUDE-FLOW-V3-SETUP.md`
