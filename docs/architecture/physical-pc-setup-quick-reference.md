# Physical PC Setup GUI - Quick Reference Card

**1-Page Developer Cheat Sheet**

---

## 🎯 What We're Building

A comprehensive GUI installer that handles ALL physical PC setup tasks:
- Auto-detects PC type (orchestrator/worker)
- Collects complete hardware info (CPU, RAM type/speed, GPU+VRAM, network)
- Configures static IP, Wake-on-LAN
- Installs Docker, WSL2, NVIDIA drivers
- Sets up Tailscale VPN, Cloudflared tunnels
- Deploys Gitea, databases (orchestrator), Claude
- Stores ALL configs in Infisical
- Validates each step
- Supports complete rollback

---

## 📁 Architecture at a Glance

```
┌─────────────────────────────────────┐
│   React UI (Wizard Screens)        │
│   └─ Zustand Store (State)         │
└─────────────┬───────────────────────┘
              │
         ┌────▼────┐
         │Electron │
         │   IPC   │
         └────┬────┘
              │
┌─────────────▼───────────────────────┐
│         Service Layer               │
│  - HardwareDetector                 │
│  - NetworkConfigurator              │
│  - DockerInstaller                  │
│  - TailscaleManager                 │
│  - DatabaseDeployer                 │
│  - InfisicalClient                  │
│  - CheckpointManager                │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│     External Integrations           │
│  - Docker API                       │
│  - Infisical API                    │
│  - Tailscale API                    │
│  - System APIs (netsh, wmic)        │
└─────────────────────────────────────┘
```

---

## 🚀 6 Setup Phases

| Phase | What It Does | Key Components |
|-------|-------------|----------------|
| **1. PC Detection** | Auto-detect PC type, collect hardware | HardwareDetector |
| **2. Network Config** | Static IP, Wake-on-LAN | NetworkConfigurator |
| **3. Infrastructure** | Docker, WSL2, NVIDIA | DockerInstaller, WSL2Installer |
| **4. VPN/Tunnels** | Tailscale, Cloudflared | TailscaleManager, CloudflaredManager |
| **5. Services** | Gitea, DBs, Claude | GiteaDeployer, DatabaseDeployer |
| **6. Validation** | Health checks, config review | ValidationEngine |

---

## 🔧 Key Services to Implement

### 1. HardwareDetector
```typescript
class HardwareDetector {
  async detectHardware(): Promise<HardwareInfo>
  async detectRAM(): Promise<RAMInfo> // Type, speed, slots
  async detectGPU(): Promise<GPUInfo[]> // Model, VRAM, driver
  async detectNetwork(): Promise<NetworkInfo> // IP, MAC, gateway, DNS
}
```

**Commands:**
```powershell
wmic memorychip get Speed,Capacity,MemoryType /format:csv
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
getmac /v /fo csv
```

### 2. StaticIPConfigurator
```typescript
class StaticIPConfigurator {
  async configureStaticIP(config: StaticIPConfig): Promise<boolean>
  async validateStaticIP(config: StaticIPConfig): Promise<ValidationResult>
  async rollbackToDHCP(interfaceName: string): Promise<boolean>
}
```

**Commands:**
```powershell
# Apply
netsh interface ip set address name="Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1
netsh interface ip set dns name="Ethernet" static 1.1.1.1

# Rollback
netsh interface ip set address name="Ethernet" dhcp
```

### 3. DockerInstaller
```typescript
class DockerInstaller {
  async checkInstallation(): Promise<boolean>
  async install(): Promise<boolean>
  async configure(config: DockerConfig): Promise<boolean>
  async validate(): Promise<ValidationResult>
}
```

**Commands:**
```powershell
docker --version
docker-compose -f /docker/orchestrator/docker-compose.yml up -d
docker ps --filter "health=healthy"
```

### 4. InfisicalClient
```typescript
class InfisicalClient {
  async authenticate(email: string, password: string): Promise<boolean>
  async storeConfig(key: string, value: any): Promise<boolean>
  async retrieveConfig(key: string): Promise<any>
  async storeHardwareInfo(pcType: PCId, info: HardwareInfo): Promise<boolean>
}
```

**Storage Keys:**
```
hardware/{pcType}/info
network/{pcType}/static-ip
network/{pcType}/wake-on-lan
vpn/tailscale/{pcType}
vpn/cloudflared/{pcType}
services/{service}/credentials
```

### 5. CheckpointManager
```typescript
class CheckpointManager {
  async createCheckpoint(name: string, phase: SetupPhase): Promise<string>
  async rollbackToCheckpoint(checkpointId: string): Promise<boolean>
  async listCheckpoints(): Promise<Checkpoint[]>
}
```

**Checkpoint Strategy:**
```
Phase 1 (PC Detection) → Checkpoint 1 (state only)
Phase 2 (Network) → Checkpoint 2 (state + network config files)
Phase 3 (Infrastructure) → Checkpoint 3 (state + Docker config)
Phase 4 (VPN) → Checkpoint 4 (state + VPN configs)
Phase 5 (Services) → Checkpoint 5 (state + service configs)
```

---

## 📦 Zustand Store Structure

```typescript
interface SetupStore {
  pcDetection: {
    detectedType: PCId | null;
    hardwareInfo: HardwareInfo;
  };
  networkConfig: {
    staticIPConfig: StaticIPConfig | null;
    wakeOnLAN: WakeOnLANConfig | null;
  };
  infrastructure: {
    docker: ComponentSetupState;
    wsl2: ComponentSetupState;
    nvidia: ComponentSetupState | null;
  };
  vpnTunnel: {
    tailscale: TailscaleConfig | null;
    cloudflared: CloudflaredConfig | null;
  };
  services: {
    gitea: ServiceDeploymentState | null;
    databases: DatabaseDeploymentState | null;
    claude: ClaudeDeploymentState;
  };
  progress: {
    currentPhase: SetupPhase;
    percentage: number;
  };
  rollback: {
    checkpoints: Checkpoint[];
  };
}
```

---

## 🎨 Component Structure

```
App.tsx
├─ ProgressHeader (Phase indicator, progress bar)
├─ WizardRouter
│  ├─ Phase1_PCDetection
│  │  ├─ PCDetectionScreen
│  │  └─ HardwareCollectionScreen
│  ├─ Phase2_NetworkConfig
│  │  ├─ NetworkConfigScreen
│  │  └─ WakeOnLANSetup
│  ├─ Phase3_Infrastructure
│  │  ├─ DockerSetupScreen
│  │  ├─ WSL2SetupScreen
│  │  └─ NVIDIASetupScreen
│  ├─ Phase4_VPNTunnel
│  │  ├─ TailscaleSetupScreen
│  │  └─ CloudflaredSetupScreen
│  ├─ Phase5_ServiceDeployment
│  │  ├─ GiteaSetupScreen
│  │  ├─ DatabaseSetupScreen
│  │  └─ ClaudeSetupScreen
│  └─ Phase6_Validation
│     ├─ HealthCheckScreen
│     ├─ ConfigReviewScreen
│     └─ CompletionScreen
└─ Footer (Rollback, Save, Quit)
```

---

## 🔌 Electron IPC Handlers

```typescript
// src/main/ipc-handlers.ts

ipcMain.handle('hardware:detect', async () => {
  return new HardwareDetector().detectHardware();
});

ipcMain.handle('network:configure-static-ip', async (event, config) => {
  return new StaticIPConfigurator().configureStaticIP(config);
});

ipcMain.handle('docker:install', async () => {
  return new DockerInstaller().install();
});

ipcMain.handle('services:deploy', async (event, service) => {
  return getDeployerForService(service).deploy();
});

ipcMain.handle('infisical:store', async (event, key, value) => {
  return InfisicalClient.getInstance().storeConfig(key, value);
});

ipcMain.handle('rollback:create-checkpoint', async (event, name, phase) => {
  return CheckpointManager.getInstance().createCheckpoint(name, phase);
});
```

---

## 📊 Validation Strategy

```typescript
class ValidationEngine {
  async validatePhase(phase: SetupPhase): Promise<ValidationResult> {
    switch (phase) {
      case 'pc-detection':
        return this.validatePCDetection();
      case 'network-config':
        return this.validateNetworkConfig();
      case 'infrastructure-setup':
        return this.validateInfrastructure();
      case 'vpn-tunnel-setup':
        return this.validateVPNTunnels();
      case 'service-deployment':
        return this.validateServices();
    }
  }

  private async validateNetworkConfig(): Promise<ValidationResult> {
    const checks = [
      this.checkStaticIPApplied(),
      this.checkGatewayReachable(),
      this.checkDNSWorking(),
      this.checkWakeOnLANConfigured(),
    ];
    return this.aggregateResults(checks);
  }
}
```

---

## 🗂️ File Organization

```
Project Root
├── bootstrap/
│   ├── installer/              # THIS GUI (Electron + React)
│   ├── windows/                # Windows PowerShell scripts
│   └── wsl/                    # WSL Bash scripts
├── docker/                     # Docker Compose files (NOT in bootstrap)
│   ├── orchestrator/
│   └── client/
└── configs/                    # Service configs (NOT in bootstrap)
    ├── gitea/
    ├── postgresql/
    └── claude/
```

**Critical Rule:** docker-compose and configs live in `/docker/` and `/configs/`, NOT in `bootstrap/`

---

## 🎯 PC Type Detection

```typescript
inferPCType(specs: HardwareSpecs): PCId {
  if (specs.cpu.includes('6800H') && !specs.gpu.length) {
    return 'orchestrator-mini';
  }
  if (specs.gpu.some(g => g.model.includes('3060'))) {
    return 'worker-rtx3060';
  }
  if (specs.gpu.some(g => g.model.includes('5090'))) {
    return 'worker-rtx5090';
  }
  if (specs.gpu.some(g => g.model.includes('3090'))) {
    return 'worker-rtx3090ti';
  }
}
```

| PC Type | CPU | RAM | GPU |
|---------|-----|-----|-----|
| **orchestrator-mini** | Ryzen 7 6800H | 16GB | None |
| **worker-rtx3060** | i7 12700 | 32GB | RTX 3060 |
| **worker-rtx5090** | High-end | 32GB | RTX 5090 |
| **worker-rtx3090ti** | High-end | 32GB | RTX 3090Ti |

---

## ⚡ Quick Start Checklist

### Week 1-2: Foundation
- [ ] Enhance `HardwareDetector` (RAM type/speed, GPU VRAM, network info)
- [ ] Create `InfisicalClient` (auth, store, retrieve)
- [ ] Update `setupStore.ts` with new state structure
- [ ] Create `CheckpointManager` (create, rollback, list)

### Week 3: Network
- [ ] Create `StaticIPConfigurator` (configure, validate, rollback)
- [ ] Build `NetworkConfigScreen.tsx`
- [ ] Build `StaticIPWizard.tsx`
- [ ] Build `WakeOnLANSetup.tsx`

### Week 4-5: Infrastructure
- [ ] Create `DockerInstaller` (install, configure, validate)
- [ ] Build `DockerSetupScreen.tsx`
- [ ] Create `WSL2Installer`
- [ ] Build `WSL2SetupScreen.tsx`
- [ ] Create `NVIDIAInstaller` (workers only)
- [ ] Build `NVIDIASetupScreen.tsx`

### Week 6: VPN/Tunnels
- [ ] Create `TailscaleManager` (install, auth, connect)
- [ ] Build `TailscaleSetupScreen.tsx`
- [ ] Create `CloudflaredManager` (create tunnel, configure)
- [ ] Build `CloudflaredSetupScreen.tsx`

### Week 7-8: Services
- [ ] Create `GiteaDeployer` (deploy, wait for healthy, store creds)
- [ ] Create `DatabaseDeployer` (PostgreSQL, Redis, TimescaleDB, Qdrant)
- [ ] Create `ClaudeDeployer` (install Claude Code/Desktop, configure MCP)
- [ ] Build service setup screens

### Week 9-10: Polish
- [ ] Implement `ValidationEngine` (multi-level validation)
- [ ] Build `HealthCheckScreen.tsx`
- [ ] Build `ConfigReviewScreen.tsx`
- [ ] Build `CompletionScreen.tsx`
- [ ] E2E testing on all 4 PC types
- [ ] UI/UX polish

---

## 🚨 Common Gotchas

1. **Always use absolute paths** - Never relative paths in file operations
2. **Checkpoint before each phase** - Create checkpoint before state-changing operations
3. **Validate immediately** - Run validation after each configuration change
4. **Store in Infisical** - Never store credentials in local files
5. **Reference, don't copy** - docker-compose files stay in `/docker/`, don't copy to bootstrap
6. **Use `execAsAdmin`** - Network and system changes require admin privileges
7. **Wait for healthy** - Always wait for Docker containers to be healthy before proceeding

---

## 📚 Essential Commands

### Hardware Detection
```powershell
# RAM
wmic memorychip get Speed,Capacity,MemoryType,DeviceLocator /format:csv

# GPU
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader

# Network
ipconfig /all
getmac /v /fo csv
route print | findstr "0.0.0.0"
```

### Network Configuration
```powershell
# Static IP
netsh interface ip set address name="Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1
netsh interface ip set dns name="Ethernet" static 1.1.1.1

# DHCP (rollback)
netsh interface ip set address name="Ethernet" dhcp
netsh interface ip set dns name="Ethernet" dhcp

# Test
ping 192.168.1.1
nslookup google.com
```

### Docker
```powershell
# Install check
docker --version

# Deploy
docker-compose -f C:\Dev\Projects\Repos\Project-Nyra\docker\orchestrator\docker-compose.yml up -d

# Health
docker ps --filter "health=healthy"
```

---

## 🎓 Documentation Links

- **Full Architecture**: [`physical-pc-setup-gui-architecture.md`](./physical-pc-setup-gui-architecture.md)
- **Implementation Guide**: [`physical-pc-setup-implementation-guide.md`](./physical-pc-setup-implementation-guide.md)
- **System Diagrams**: [`diagrams/physical-pc-setup-system-diagram.mmd`](./diagrams/physical-pc-setup-system-diagram.mmd)

**Memory Storage:**
```bash
npx @claude-flow/cli@latest memory retrieve --namespace installer-architecture --key comprehensive-plan
```

---

## ✅ Success Metrics

| Metric | Target |
|--------|--------|
| PC Detection Accuracy | >90% |
| Setup Time | <30 min |
| Rollback Success | 100% |
| Credential Leaks | 0 |
| Test Coverage | >95% |

---

**End of Quick Reference Card**
