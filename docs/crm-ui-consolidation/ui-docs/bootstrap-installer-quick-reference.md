# Bootstrap Installer Quick Reference

**Purpose**: At-a-glance guide for what belongs in bootstrap/installer/

---

## ✅ KEEP - PC Setup Materials

### Software Installation
- Docker Desktop installer
- Node.js, Python, Git installers
- WSL2 setup scripts
- NVIDIA driver installation (workers)
- Claude Code CLI installation
- Claude Desktop app deployment

### Network Configuration
- Static IP assignment (10.0.0.1-4)
- Tailscale VPN setup
- Mesh networking between PCs
- Firewall configuration

### Config File Deployment
Deploy TO individual PC locations:
- `%APPDATA%\Claude\settings.json` (Claude Code)
- `%APPDATA%\Claude\.mcp.json` (Claude Desktop MCP client)
- `%USERPROFILE%\.archon-os\` (Claude Flow configs)
- `%USERPROFILE%\.wslconfig` (WSL kernel)
- `%APPDATA%\Docker\daemon.json` (Docker Desktop daemon)

### PC Role Configuration
- Hardware detection
- Role assignment (orchestrator vs worker)
- GPU configuration (workers only)
- Component selection per role

### Health Checks
- Docker daemon running?
- WSL accessible?
- Static IP configured?
- Tailscale connected?
- GPU detected? (workers)

---

## ❌ REMOVE - Repository Materials

### Service Deployment
Move to `/infra/` or root:
- `docker-compose.yml` (PostgreSQL, Redis, MongoDB)
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- Service `.env` files
- Makefile for docker operations

### Application Services
These run IN Docker, not PC-level:
- Claude Flow MCP server
- Archon OS
- letta MCP
- Mem0 MCP
- Gitea
- n8n
- Infisical

### Service Tests
Move to `/tests/integration/`:
- Integration tests
- Service health checks
- Security scans

---

## 🎯 The Simple Rule

**ASK**: "Does this configure the PC itself, or does it deploy a service?"

- **PC Configuration** → KEEP in bootstrap/installer/
- **Service Deployment** → MOVE to /infra/ or root

### Examples

| Item | Keep or Move? | Reason |
|------|---------------|--------|
| Install Docker Desktop | ✅ KEEP | PC software installation |
| Run PostgreSQL container | ❌ MOVE | Service deployment |
| Configure static IP | ✅ KEEP | PC network setting |
| Deploy Gitea service | ❌ MOVE | Service in Docker |
| Set up WSL | ✅ KEEP | PC environment setup |
| Start Claude Flow MCP | ❌ MOVE | Service deployment |
| Deploy Claude Code settings | ✅ KEEP | PC-level config |
| Configure Redis service | ❌ MOVE | Service config |

---

## 📂 Correct Final Structure

```
bootstrap/installer/
├── src/                    # GUI installer (React + Electron)
├── configs/                # Templates deployed TO PCs
│   ├── claude-code/
│   ├── claude-desktop/
│   ├── archon-os/
│   ├── wsl/
│   ├── docker/
│   └── [pc-specific]/
└── scripts/                # PC setup automation
    ├── bootstrap-*.ps1
    ├── configure-static-ip.ps1
    ├── health-check-all.ps1
    └── distributed-setup/

/infra/                     # Service deployment (MOVED HERE)
└── docker-compose/
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    └── Makefile

/tests/                     # Service tests (MOVED HERE)
└── integration/
    └── docker/
```

---

## 🚀 What bootstrap/installer/ Does

1. Install software on PC
2. Configure PC network
3. Deploy PC-level configs
4. Validate PC is ready
5. **Result**: PC ready to clone repo and run services

## 🚫 What bootstrap/installer/ Does NOT Do

1. Deploy services (PostgreSQL, Redis, etc.)
2. Build applications
3. Run containers
4. Manage service dependencies
5. **Result**: Services run AFTER PC setup

---

**Remember**: bootstrap/installer/ prepares the machine, `/infra/` deploys the workload.
