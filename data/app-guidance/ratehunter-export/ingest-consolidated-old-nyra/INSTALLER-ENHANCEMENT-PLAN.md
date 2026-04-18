# Bootstrap GUI Installer - Comprehensive Enhancement Plan

## Current Status

**Existing Components** (bootstrap/installer/src/renderer/components/):
- ✅ WelcomeScreen.tsx
- ✅ PCDetectionScreen.tsx
- ✅ DockerSetupScreen.tsx
- ✅ NetworkConfigScreen.tsx
- ✅ GPUConfigScreen.tsx
- ✅ TailscaleSetupScreen.tsx
- ✅ ServiceDeploymentScreen.tsx
- ✅ HealthCheckScreen.tsx
- ✅ CompletionScreen.tsx
- ✅ ProgressBar.tsx

**Technology Stack**:
- Electron 28.1.3 (Windows desktop app)
- React 18.2.0 + TypeScript
- Vite build system
- Tailwind CSS for styling
- electron-store for config persistence
- sudo-prompt for elevated operations

---

## Bootstrap Philosophy: "Physical PC Setup Tasks ONLY"

### ✅ BELONGS in bootstrap/ (Requires logging into specific PC):
1. Installing Docker Desktop on PC
2. Setting static IP (10.0.0.1-4) on network adapter
3. WSL2 setup and configuration
4. Tailscale VPN installation and auth
5. Cloudflared tunnel installation and auth
6. Copying Claude settings to %APPDATA%
7. NVIDIA driver installation (GPU workers)
8. Wake-on-LAN configuration (BIOS settings guidance)
9. Starting/stopping services on that PC
10. Gitea installation (orchestrator only)
11. Database initialization (orchestrator only)
12. Infisical agent sidecar setup

### ❌ NOT in bootstrap/ (Already in repo structure):
- docker-compose.yml files → moved to /docker/
- Service configs (MCP, Claude Flow) → moved to /configs/
- Application code → stays in /apps/, /services/
- Scripts that don't require PC login → stays in /scripts/

---

## Missing Components Analysis

### 1. Hardware Detection (PRIORITY: CRITICAL)
**Current**: PCDetectionScreen.tsx exists but capabilities unknown
**Needed**: Must detect using simple system tools (no special apps):
- PC name (hostname)
- IP addresses (all interfaces) - for Tailscale/Cloudflared
- MAC addresses (all adapters) - for Wake-on-LAN
- CPU type and specs - wmic on Windows, lscpu on Linux
- RAM type, size, amount, speed - wmic/dmidecode
- GPU type and VRAM (CRITICAL) - nvidia-smi/wmic
- Disk space and type
- Network adapters
- USB devices (for Wake-on-LAN dongles)

**Implementation**:
```typescript
// src/services/hardwareDetector.ts
export interface HardwareInfo {
  pcName: string;
  ipAddresses: { interface: string; ip: string; }[];
  macAddresses: { interface: string; mac: string; }[];
  cpu: { name: string; cores: number; threads: number; speed: string; };
  ram: { type: string; totalGB: number; speed: string; modules: number; };
  gpu: { name: string; vram: number; driver: string; } | null;
  disk: { type: 'SSD' | 'HDD'; totalGB: number; freeGB: number; }[];
}

export async function detectHardware(): Promise<HardwareInfo> {
  // Use wmic, PowerShell, or bash commands depending on platform
  // NO external apps - only system tools
}
```

### 2. PC Type Auto-Detection (PRIORITY: HIGH)
**Current**: PCSelector.tsx - manual selection?
**Needed**: Auto-detect which PC type based on hardware signatures
- Orchestrator: Minisforum UH680 (Ryzen 7 6800H, 16GB, no discrete GPU)
- Worker RTX 5090: 24GB VRAM GPU, high-end CPU
- Worker RTX 3060: 12GB VRAM GPU, 32GB RAM laptop
- Worker RTX 3090Ti: 24GB VRAM GPU, desktop form factor

**Logic**:
```typescript
export function detectPCType(hw: HardwareInfo): PCType {
  if (!hw.gpu || hw.gpu.vram < 8) return 'orchestrator';
  if (hw.gpu.name.includes('5090')) return 'worker-rtx5090';
  if (hw.gpu.name.includes('3060')) return 'worker-rtx3060';
  if (hw.gpu.name.includes('3090')) return 'worker-rtx3090ti';
  return 'unknown';
}
```

### 3. WSL2 Setup Wizard (PRIORITY: HIGH)
**Current**: Missing
**Needed**: Step-by-step WSL2 installation for all PCs
- Check if WSL2 installed
- If not: Download and install (requires admin)
- Install Ubuntu 22.04 distro
- Configure .wslconfig (memory/CPU limits based on PC type)
- Set up nyra user
- Install Docker in WSL
- Configure systemd in WSL
- Validate WSL2 working

**Component**: `WSLSetupScreen.tsx`

### 4. Static IP Configuration (PRIORITY: HIGH)
**Current**: NetworkConfigScreen.tsx exists
**Needed**: Set static IPs based on PC type
- Orchestrator: 10.0.0.1
- Worker RTX 5090: 10.0.0.2
- Worker RTX 3060: 10.0.0.3
- Worker RTX 3090Ti: 10.0.0.4
- Subnet: 255.255.255.0
- Gateway: 10.0.0.1
- DNS: 10.0.0.1, 1.1.1.1

**Must use**: netsh on Windows, nmcli on Linux

### 5. Cloudflared Tunnel Setup (PRIORITY: HIGH)
**Current**: Missing
**Needed**: Complete Cloudflared installation and configuration
- Download cloudflared binary
- Authenticate with Cloudflare (browser login)
- Create tunnel: `nyra-orchestrator`, `nyra-worker-rtx5090`, etc.
- Configure ingress rules (based on PC type)
- Store tunnel token in Infisical
- Add to Docker Compose
- Validate tunnel connectivity

**Component**: `CloudflaredSetupScreen.tsx`

### 6. Gitea Installation (PRIORITY: MEDIUM - Orchestrator Only)
**Current**: Missing
**Needed**: Local git server setup
- Add Gitea container to orchestrator Docker Compose
- Initialize Gitea (admin account via Infisical)
- Create initial repositories
- Configure SSH access
- Set up Git hooks
- Configure backups

**Component**: `GiteaSetupScreen.tsx` (only shown on orchestrator)

### 7. Database Initialization (PRIORITY: MEDIUM - Orchestrator Only)
**Current**: Missing
**Needed**: Initialize ALL databases on orchestrator
- PostgreSQL (multiple databases)
- Redis (cache + pub/sub)
- MongoDB (document storage)
- AgentDB (vector storage)
- Infisical database backend
- Create schemas, users, permissions
- Configure backups
- Validate connectivity

**Component**: `DatabaseSetupScreen.tsx` (orchestrator only)

### 8. Claude Code/Desktop Setup (PRIORITY: MEDIUM)
**Current**: Missing
**Needed**: Install and configure Claude
- Download Claude Desktop (orchestrator) or Claude Code (all)
- Install in WSL
- Copy MCP server configs to ~/.config/claude/
- Copy custom instructions
- Validate MCP server connections
- Test Claude Code functionality

**Component**: `ClaudeSetupScreen.tsx`

### 9. NVIDIA Driver Installation (PRIORITY: MEDIUM - Workers Only)
**Current**: GPUConfigScreen.tsx exists
**Needed**: Install NVIDIA drivers + CUDA
- Detect GPU model
- Download appropriate driver
- Install driver (requires reboot)
- Install CUDA toolkit
- Install nvidia-docker2
- Validate with nvidia-smi
- Configure power limits (RTX 5090: 450W, RTX 3060: 170W, RTX 3090Ti: 450W)

**Component**: Enhanced `GPUConfigScreen.tsx`

### 10. Wake-on-LAN Configuration (PRIORITY: MEDIUM)
**Current**: Missing
**Needed**: Enable WoL on all PCs
- For orchestrator: Install Wake-on-LAN sender
- For workers: Enable WoL in BIOS (guidance only - can't automate)
- Enable WoL in Windows/Linux network settings
- Test magic packet sending/receiving
- Store MAC addresses for coordination

**Component**: `WakeOnLANSetupScreen.tsx`

### 11. Infisical Agent Sidecar (PRIORITY: MEDIUM)
**Current**: Missing
**Needed**: Set up Infisical agent for secrets
- Install Infisical CLI
- Authenticate with Infisical Cloud/Self-hosted
- Configure agent sidecar for Docker
- Map secrets to environment variables
- Validate secret retrieval
- Set up auto-renewal

**Component**: `InfisicalSetupScreen.tsx`

### 12. Oracle VPS VPS Integration (PRIORITY: LOW)
**Current**: Missing
**Needed**: Configure Oracle VPS for webapp hosting
- Authenticate with Oracle VPS API
- Deploy webapp backend to Oracle VPS
- Configure custom domains
- Set up scaling policies (free tier)
- Configure health checks
- Monitor deployments

**Component**: `Oracle VPSSetupScreen.tsx` (orchestrator only)

### 13. n8n Workflow Deployment (PRIORITY: LOW - Orchestrator Only)
**Current**: Missing
**Needed**: Deploy mortgage lead drip campaigns
- Add n8n container to Docker Compose
- Import workflow templates
- Configure CRM integration
- Set up SMS/email providers
- Test workflows
- Monitor execution

**Component**: `N8NSetupScreen.tsx` (orchestrator only)

---

## Enhanced Component Architecture

### Screen Flow (Wizard-style)
```
1. WelcomeScreen ✅
   ↓
2. HardwareDetectionScreen (NEW - Auto-detects everything)
   ↓
3. PCTypeConfirmationScreen (NEW - Shows detected PC type, allow override)
   ↓
4. PrerequisiteChecksScreen (NEW - Checks admin rights, disk space, network)
   ↓
5. WSLSetupScreen (NEW - Windows only)
   ↓
6. DockerSetupScreen ✅ (Enhanced with WSL Docker)
   ↓
7. NetworkConfigScreen ✅ (Enhanced with static IP automation)
   ↓
8. TailscaleSetupScreen ✅
   ↓
9. CloudflaredSetupScreen (NEW)
   ↓
10. GPUConfigScreen ✅ (Enhanced with NVIDIA drivers - workers only)
    ↓
11. WakeOnLANSetupScreen (NEW)
    ↓
12. InfisicalSetupScreen (NEW)
    ↓
13. ClaudeSetupScreen (NEW)
    ↓
--- Orchestrator-Only Screens ---
14. GiteaSetupScreen (NEW - orchestrator only)
    ↓
15. DatabaseSetupScreen (NEW - orchestrator only)
    ↓
16. Oracle VPSSetupScreen (NEW - orchestrator only)
    ↓
17. N8NSetupScreen (NEW - orchestrator only)
    ↓
--- All PCs ---
18. ServiceDeploymentScreen ✅ (Start Docker containers)
    ↓
19. HealthCheckScreen ✅ (Validate everything)
    ↓
20. CompletionScreen ✅
```

### Services Layer (Electron Main Process)
```typescript
// src/services/
- hardwareDetector.ts (NEW) - Detect all hardware
- pcTypeDetector.ts (NEW) - Determine PC type
- wslInstaller.ts (NEW) - WSL2 installation
- dockerInstaller.ts - Docker Desktop + WSL Docker
- networkConfigurator.ts - Static IP setup
- tailscaleInstaller.ts - Tailscale VPN
- cloudflaredInstaller.ts (NEW) - Cloudflared tunnels
- gpuDriverInstaller.ts (NEW) - NVIDIA drivers
- wakeOnLANConfigurator.ts (NEW) - WoL setup
- infisicalInstaller.ts (NEW) - Infisical agent
- claudeInstaller.ts (NEW) - Claude Code/Desktop
- giteaInstaller.ts (NEW) - Gitea server
- databaseInitializer.ts (NEW) - Database setup
- oracle-vpsDeployer.ts (NEW) - Oracle VPS integration
- n8nDeployer.ts (NEW) - n8n workflows
- serviceOrchestrator.ts - Docker container management
- healthChecker.ts - System health validation
- logger.ts - Unified logging
- validator.ts (NEW) - Validation utilities
```

### State Management
```typescript
// src/store/installerStore.ts
export interface InstallerState {
  // Detection
  hardware: HardwareInfo | null;
  pcType: PCType | null;

  // Setup progress
  setupSteps: {
    wsl: StepStatus;
    docker: StepStatus;
    network: StepStatus;
    tailscale: StepStatus;
    cloudflared: StepStatus;
    gpu: StepStatus;
    wakeOnLAN: StepStatus;
    infisical: StepStatus;
    claude: StepStatus;
    gitea: StepStatus; // orchestrator only
    databases: StepStatus; // orchestrator only
    oracle-vps: StepStatus; // orchestrator only
    n8n: StepStatus; // orchestrator only
    services: StepStatus;
    healthCheck: StepStatus;
  };

  // Configuration
  config: {
    staticIP: string;
    tailscaleAuthKey: string | null;
    cloudflaredToken: string | null;
    infisicalProjectId: string | null;
    // ... more configs
  };

  // Errors and logs
  errors: string[];
  logs: LogEntry[];
}

type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
```

---

## Implementation Priorities

### Phase 1: Critical Infrastructure (Week 1)
1. ✅ Hardware detection service
2. ✅ PC type auto-detection
3. ✅ WSL2 setup wizard
4. ✅ Enhanced Docker setup (WSL integration)
5. ✅ Static IP configuration
6. ✅ Enhanced state management

### Phase 2: Networking & Security (Week 2)
1. ✅ Cloudflared tunnel setup
2. ✅ Enhanced Tailscale setup
3. ✅ Wake-on-LAN configuration
4. ✅ Infisical agent setup

### Phase 3: Specialized Components (Week 3)
1. ✅ NVIDIA driver installation (workers)
2. ✅ Claude Code/Desktop setup
3. ✅ Gitea setup (orchestrator)
4. ✅ Database initialization (orchestrator)

### Phase 4: Advanced Features (Week 4)
1. ✅ Oracle VPS integration (orchestrator)
2. ✅ n8n workflow deployment (orchestrator)
3. ✅ Comprehensive health checks
4. ✅ Rollback mechanisms

---

## Testing Strategy

### Unit Tests
- Each service module independently tested
- Mock system commands (wmic, netsh, etc.)
- Validate state transitions

### Integration Tests
- Full installer flow on each PC type
- Test rollback scenarios
- Validate cross-PC networking

### Hardware Tests
- Test on actual hardware:
  - Minisforum UH680 (orchestrator)
  - Alienware M15R7 RTX 3060 (worker)
  - RTX 5090 laptop (worker)
  - RTX 3090Ti desktop (worker)

---

## Security Considerations

1. **Elevation**: All privileged operations use sudo-prompt with user confirmation
2. **Secrets**: Infisical for ALL secrets (no hardcoded credentials)
3. **Network**: Tailscale + Cloudflared for secure external access
4. **Validation**: All user inputs validated and sanitized
5. **Logging**: Comprehensive audit trail of all operations
6. **Rollback**: All operations reversible for failed setups

---

## Documentation Requirements

1. **User Guide**: Step-by-step setup instructions with screenshots
2. **Troubleshooting**: Common issues and solutions
3. **Architecture**: System design and component interactions
4. **API Reference**: Service APIs for each installer module
5. **Testing Guide**: How to test the installer
6. **Development**: How to extend the installer with new components

---

## Success Metrics

✅ **Functional**:
- Installer completes setup on all 4 PC types without errors
- All services start and pass health checks
- Cross-PC networking (SSH, Docker, WoL) works

✅ **User Experience**:
- Setup time < 30 minutes per PC
- Clear progress indication at each step
- Helpful error messages with solutions
- No manual configuration required

✅ **Maintainability**:
- Modular architecture for easy updates
- Comprehensive test coverage (>80%)
- Clear documentation for developers

---

## Next Steps

1. ✅ Spawn agents to implement missing components
2. ✅ Deploy all repo-level files (docker-compose, configs) to proper locations
3. ⏳ Test installer on each PC type
4. ⏳ Iterate based on testing feedback
5. ⏳ Create video walkthroughs for users

---

**Generated**: 2026-01-15
**Status**: In Progress - 35+ agents working concurrently
