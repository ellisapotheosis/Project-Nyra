# Bootstrap GUI Installer Integration Plan

**Created**: 2026-01-24
**Purpose**: Map claude-flow Docker deployment to existing GUI installer structure

---

## 🎯 Integration Overview

The GUI installer uses an **8-folder bootstrap structure** to deploy PC-specific configurations:

```
bootstrap/
├── orchestrator-mini/      → Orchestrator PC configs
├── worker-rtx5090/         → RTX 5090 worker configs
├── worker-rtx3090ti/       → RTX 3090 Ti worker configs
├── worker-rtx3060/         → RTX 3060 worker configs
├── configs/                → Shared configs (all PCs)
├── scripts/                → Shared scripts (all PCs)
├── windows/                → Windows-specific scripts
└── wsl/                    → WSL-specific scripts
```

### Integration Strategy

1. **Keep Backup**: Original files remain in `infra/docker/claude-flow/` (already done ✅)
2. **Copy to Bootstrap**: Copy Docker materials to bootstrap PC folders
3. **Update Installer**: GUI installer already has detection/deployment logic
4. **Validate**: Test installer can deploy Docker stack

---

## 📁 File Mapping

### Orchestrator Mini PC

**Source**: `infra/docker/claude-flow/orchestrator/`

**Destination**: `bootstrap/orchestrator-mini/`

| Source File | Destination | Component |
|-------------|-------------|-----------|
| `.env.template` | `configs/claude-flow/.env.template` | claude-flow |
| `docker-compose.yml` | `docker/claude-flow/docker-compose.yml` | claude-flow |
| `claude-flow.config.json` | `configs/claude-flow/claude-flow.config.json` | claude-flow |
| `nexus-config.yaml` | `configs/claude-flow/nexus-config.yaml` | claude-flow |
| `prometheus.yml` | `configs/claude-flow/prometheus.yml` | claude-flow |
| `init-multiple-databases.sh` | `scripts/claude-flow/init-databases.sh` | claude-flow |
| `quick-start-orchestrator.ps1` | `setup/quick-start.ps1` | claude-flow |
| `grafana-dashboards/` | `configs/claude-flow/grafana/` | claude-flow |

### Worker RTX 5090

**Source**: `infra/docker/claude-flow/worker-5090/`

**Destination**: `bootstrap/worker-rtx5090/`

| Source File | Destination | Component |
|-------------|-------------|-----------|
| `.env.template` | `configs/ollama/.env.template` | claude-flow |
| `docker-compose.yml` | `docker/ollama/docker-compose.yml` | claude-flow |

### Worker RTX 3090 Ti

**Source**: `infra/docker/claude-flow/worker-3090/`

**Destination**: `bootstrap/worker-rtx3090ti/`

| Source File | Destination | Component |
|-------------|-------------|-----------|
| `.env.template` | `configs/ollama/.env.template` | claude-flow |
| `docker-compose.yml` | `docker/ollama/docker-compose.yml` | claude-flow |

### Worker RTX 3060

**Source**: `infra/docker/claude-flow/worker-3060/`

**Destination**: `bootstrap/worker-rtx3060/`

| Source File | Destination | Component |
|-------------|-------------|-----------|
| `.env.template` | `configs/ollama/.env.template` | claude-flow |
| `docker-compose.yml` | `docker/ollama/docker-compose.yml` | claude-flow |

### Shared Files (All PCs)

**Source**: `infra/docker/claude-flow/`

**Destination**: `bootstrap/scripts/`

| Source File | Destination | Component |
|-------------|-------------|-----------|
| `quick-start-worker.ps1` | `scripts/claude-flow/quick-start-worker.ps1` | claude-flow |
| `README.md` | `docs/claude-flow-README.md` | claude-flow |
| `DEPLOYMENT-GUIDE.md` | `docs/claude-flow-DEPLOYMENT.md` | claude-flow |
| `TWENTYCRM-SETUP.md` | `docs/twentycrm-SETUP.md` | claude-flow |
| `IMPLEMENTATION-SUMMARY.md` | `docs/claude-flow-SUMMARY.md` | claude-flow |
| `PC-INFORMATION.md` | `docs/PC-INFORMATION.md` | claude-flow |

---

## 🔧 GUI Installer Integration Points

### 1. PC Detection (Already Working)

**Service**: `bootstrap/installer/src/services/pcDetector.ts`

- ✅ Detects PC type based on hardware (GPU, CPU, RAM)
- ✅ Returns confidence score and system specs
- ✅ Supports manual override

**Our PC Information**:
```typescript
{
  hostname: "ALIENAPOTHEOSIS",
  detectedPC: "orchestrator-mini",  // No GPU detected, 34GB RAM
  confidence: 85,
  specs: {
    cpu: "AMD Ryzen 7 6800H",
    ram: 34,
    gpu: null  // Orchestrator has no GPU
  }
}
```

### 2. Folder Structure Manager (Already Working)

**Service**: `bootstrap/installer/src/services/folderStructureManager.ts`

- ✅ Manages 8-folder structure
- ✅ Gets PC-specific configs/docker/scripts
- ✅ Merges shared configs with PC-specific
- ✅ Validates folder structure

**Usage**:
```typescript
const manager = new FolderStructureManager('C:/Dev/Projects/Repos/Project-Nyra/bootstrap');

// Get orchestrator-mini configs
const configs = await manager.getComponentFiles('orchestrator-mini', 'claude-flow');
// Returns: { configFiles, dockerFiles, scriptFiles }
```

### 3. Component Selector (Needs Update)

**Component**: `bootstrap/installer/src/components/ComponentSelector.tsx`

**Current Status**: Needs to be updated to load from folder structure

**Required Changes**:
1. Import `useFolderStructure` hook
2. Load available components from PC folder
3. Show file counts per component
4. Display shared vs PC-specific files

### 4. Installation Progress (Needs Update)

**Component**: `bootstrap/installer/src/components/InstallationProgress.tsx`

**Current Status**: Needs to use FolderStructureManager

**Required Changes**:
1. Import `FolderStructureManager`
2. Get component files from PC folder
3. Deploy configs (PC-specific overrides shared)
4. Run scripts from setup folder
5. Launch docker-compose files
6. Show installation progress with file sources

---

## 🚀 Installation Workflow

### Automated Flow (via GUI Installer)

```
User launches installer
  ↓
1. PC Detection
   - Detects "orchestrator-mini" (ALIENAPOTHEOSIS, no GPU, 34GB RAM)
   - Confidence: 85%+
   - User confirms
  ↓
2. Network Configuration
   - Detects Wi-Fi: 192.168.1.221
   - Tailscale: 100.83.23.49 (already up)
   - User configures Cloudflare Tunnel
  ↓
3. Component Selection
   - Available: claude-code, claude-desktop, claude-flow, wsl-setup, docker, infisical, gitea
   - Recommended: claude-code, claude-desktop, claude-flow, wsl-setup, docker, infisical
   - User selects components
  ↓
4. Docker Setup
   - Check Docker Desktop installed
   - Verify WSL2 enabled
   - Test Docker daemon running
  ↓
5. Tailscale Setup
   - Already running (detected)
   - Set hostname: orchestrator-mini
   - Verify mesh connectivity
  ↓
6. Installation Progress
   - Deploy configs from bootstrap/orchestrator-mini/configs/
   - Run scripts from bootstrap/orchestrator-mini/scripts/
   - Launch docker-compose from bootstrap/orchestrator-mini/docker/
   - Initialize databases (PostgreSQL multi-DB)
   - Start all services (Nexus, Claude Flow, Redis, Qdrant, etc.)
  ↓
7. Health Checks
   - Check service health (docker ps)
   - Test API endpoints (Nexus: 6000, Claude Flow: 6100)
   - Verify databases (PostgreSQL: 5432, Redis: 6379)
   - Test monitoring (Prometheus: 9090, Grafana: 3005)
  ↓
8. Completion
   - Show service URLs
   - Display next steps (setup workers)
   - Export configuration report
```

---

## 📋 Integration Checklist

### Phase 1: File Copy (Immediate)
- [ ] Create `bootstrap/orchestrator-mini/configs/claude-flow/` directory
- [ ] Copy orchestrator configs to bootstrap folder
- [ ] Create `bootstrap/worker-rtx5090/configs/ollama/` directory
- [ ] Copy worker-5090 configs to bootstrap folder
- [ ] Create `bootstrap/worker-rtx3090ti/configs/ollama/` directory
- [ ] Copy worker-3090 configs to bootstrap folder
- [ ] Create `bootstrap/worker-rtx3060/configs/ollama/` directory
- [ ] Copy worker-3060 configs to bootstrap folder
- [ ] Copy shared docs to `bootstrap/docs/`
- [ ] Copy shared scripts to `bootstrap/scripts/claude-flow/`

### Phase 2: GUI Installer Updates (30-60 min)
- [ ] Export new services in `src/services/index.ts`
- [ ] Update ComponentSelector to use `useFolderStructure`
- [ ] Update InstallationProgress to use `FolderStructureManager`
- [ ] Add file count indicators to ComponentSelector
- [ ] Show installation progress per folder

### Phase 3: Testing (15-30 min)
- [ ] Test PC detection on ALIENAPOTHEOSIS
- [ ] Verify folder structure validation
- [ ] Test component discovery from folders
- [ ] Test installation workflow end-to-end
- [ ] Validate Docker deployment
- [ ] Check service health

### Phase 4: Documentation (15 min)
- [ ] Update installer README with Docker integration
- [ ] Document environment variable requirements
- [ ] Create troubleshooting guide
- [ ] Update quick-start guide

---

## 🔑 Key Environment Variables

### Orchestrator `.env` (Required)

```env
# Cloud API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...

# Database Passwords
POSTGRES_PASSWORD=<secure-password>
REDIS_PASSWORD=<secure-password>

# Worker URLs (Tailscale)
WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434
WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434

# Network
LOCAL_IP=192.168.1.221
TAILSCALE_IP=100.83.23.49
PUBLIC_WAN_IP=107.142.246.181
```

### Worker `.env` (Template per PC)

```env
WORKER_ID=worker-5090  # or worker-3090, worker-3060
WORKER_TIER=1  # 1=5090, 2=3090, 3=3060
GPU_TYPE=RTX_5090
GPU_VRAM_GB=48

OLLAMA_PRIMARY_MODEL=deepseek-r1:236b-q4
OLLAMA_FALLBACK_MODEL=qwen2.5:72b

ORCHESTRATOR_API_KEY=<from-orchestrator-env>
```

---

## 🛠️ Implementation Steps

### Step 1: Copy Files to Bootstrap Folders

**Bash Commands**:
```bash
# Orchestrator
mkdir -p bootstrap/orchestrator-mini/configs/claude-flow
mkdir -p bootstrap/orchestrator-mini/docker/claude-flow
mkdir -p bootstrap/orchestrator-mini/scripts/claude-flow
mkdir -p bootstrap/orchestrator-mini/setup

cp infra/docker/claude-flow/orchestrator/.env.template bootstrap/orchestrator-mini/configs/claude-flow/
cp infra/docker/claude-flow/orchestrator/docker-compose.yml bootstrap/orchestrator-mini/docker/claude-flow/
cp infra/docker/claude-flow/orchestrator/*.json bootstrap/orchestrator-mini/configs/claude-flow/
cp infra/docker/claude-flow/orchestrator/*.yaml bootstrap/orchestrator-mini/configs/claude-flow/
cp infra/docker/claude-flow/orchestrator/*.yml bootstrap/orchestrator-mini/configs/claude-flow/
cp infra/docker/claude-flow/orchestrator/*.sh bootstrap/orchestrator-mini/scripts/claude-flow/
cp infra/docker/claude-flow/orchestrator/*.ps1 bootstrap/orchestrator-mini/setup/

# Workers (similar pattern for each)
mkdir -p bootstrap/worker-rtx5090/configs/ollama
mkdir -p bootstrap/worker-rtx5090/docker/ollama
cp infra/docker/claude-flow/worker-5090/* bootstrap/worker-rtx5090/

# Docs
mkdir -p bootstrap/docs
cp infra/docker/claude-flow/*.md bootstrap/docs/
```

### Step 2: Update GUI Installer

See `QUICK-START-INTEGRATION.md` for detailed steps:
1. Export new services
2. Update ComponentSelector
3. Update InstallationProgress
4. Test end-to-end

### Step 3: Test Installation

```bash
cd bootstrap/installer
npm install
npm run dev
```

Test workflow:
1. Launch installer
2. Confirm PC detection (orchestrator-mini)
3. Select claude-flow component
4. Run installation
5. Verify services deployed
6. Check health endpoints

---

## 📊 Success Metrics

- ✅ PC detection works (>70% confidence)
- ✅ Folder structure validated (all 8 folders)
- ✅ Components discovered from PC folders
- ✅ Docker configs deployed to correct locations
- ✅ Scripts executed in correct order
- ✅ Services start successfully
- ✅ Health checks pass
- ✅ Monitoring dashboards accessible

---

## 🚨 Important Notes

1. **Backup Location**: Original files in `infra/docker/claude-flow/` remain unchanged
2. **PC Information**: ALIENAPOTHEOSIS details documented in `PC-INFORMATION.md`
3. **Network Config**: Tailscale already up (100.83.23.49), needs hostname set
4. **Cloudflare**: Tunnel setup still needed for public access
5. **Workers**: Will be deployed after orchestrator is validated

---

## 📚 Related Documentation

- **Backup Location**: `infra/docker/claude-flow/` (complete Docker deployment)
- **PC Information**: `infra/docker/claude-flow/PC-INFORMATION.md`
- **Deployment Guide**: `infra/docker/claude-flow/DEPLOYMENT-GUIDE.md`
- **TwentyCRM Setup**: `infra/docker/claude-flow/TWENTYCRM-SETUP.md`
- **Installer Guide**: `bootstrap/installer/INTEGRATION-GUIDE.md`
- **Quick Start**: `bootstrap/installer/QUICK-START-INTEGRATION.md`

---

**Status**: Ready to copy files and integrate
**Next Action**: Copy Docker files to bootstrap folders
**Timeline**: 1-2 hours for complete integration
