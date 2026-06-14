# Physical PC Setup GUI - Comprehensive Architecture Design

**Version:** 2.0.0
**Date:** 2026-01-15
**Status:** Architecture Design
**Scope:** Complete transformation of bootstrap/installer into comprehensive physical PC setup system

---

## Executive Summary

This document defines the architecture for transforming the existing bootstrap/installer into a complete "Physical PC Setup" GUI that handles ALL tasks requiring PC login. The system will auto-detect PC types, collect hardware information, provide setup wizards for all infrastructure components, store configurations securely in Infisical, validate each step, and support rollback.

### Key Design Principles

1. **Single Entry Point**: One installer handles ALL physical PC setup tasks
2. **Auto-Discovery**: Intelligent PC type detection and hardware profiling
3. **Wizard-Driven**: Step-by-step guided setup for each component
4. **Validation-First**: Every step validated before proceeding
5. **Rollback Support**: Complete rollback capability for all operations
6. **Secure Configuration**: All sensitive data stored in Infisical
7. **Separation of Concerns**: docker-compose and configs live in /docker/ and /configs/, NOT in bootstrap

---

## 1. Current State Analysis

### 1.1 Existing Architecture

**Strengths:**
- ✅ Electron + React + TypeScript foundation
- ✅ Multi-phase installation workflow
- ✅ Component-based React architecture
- ✅ Zustand state management
- ✅ Service layer separation (orchestrator, logger, validator)
- ✅ PC detection capability (PCDetector service)
- ✅ File deployment and rollback support
- ✅ MCP server management
- ✅ Docker setup integration

**Limitations:**
- ⚠️ Limited hardware info collection (only CPU, RAM, GPU detection)
- ⚠️ No network configuration wizards
- ⚠️ No static IP setup
- ⚠️ No Tailscale/Cloudflared integration
- ⚠️ No database setup wizards
- ⚠️ No Wake-on-LAN configuration
- ⚠️ No Infisical integration for config storage
- ⚠️ Limited NVIDIA driver management
- ⚠️ No comprehensive validation per setup step

### 1.2 Target PC Types

| PC Type | Hardware | Role | Special Requirements |
|---------|----------|------|---------------------|
| **Orchestrator** | Minisforum UH680 (Ryzen 7 6800H, 16GB RAM) | Control plane | Gitea, All databases, No GPU |
| **Worker RTX3060** | Alienware M15R7 (RTX 3060, 32GB RAM) | Compute node | NVIDIA drivers, CUDA |
| **Worker RTX5090** | Alienware Area-51 (RTX 5090, 32GB RAM) | Compute node | NVIDIA drivers, CUDA |
| **Worker RTX3090Ti** | Custom PC (RTX 3090Ti, 32GB RAM) | Compute node | NVIDIA drivers, CUDA |

---

## 2. System Architecture Design

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Electron Container                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Frontend (Renderer)               │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Wizard     │  │    Status    │  │   Settings   │    │  │
│  │  │  Screens     │  │  Dashboard   │  │   Manager    │    │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │  │
│  │         │                  │                  │            │  │
│  │         └──────────────────┴──────────────────┘            │  │
│  │                            │                                │  │
│  │                 ┌──────────▼──────────┐                    │  │
│  │                 │   Zustand Store     │                    │  │
│  │                 │  (State Manager)    │                    │  │
│  │                 └──────────┬──────────┘                    │  │
│  │                            │                                │  │
│  └────────────────────────────┼────────────────────────────────┘  │
│                               │                                   │
│                    ┌──────────▼──────────┐                        │
│                    │   IPC Bridge        │                        │
│                    └──────────┬──────────┘                        │
│  ┌────────────────────────────┼────────────────────────────────┐  │
│  │                    Electron Main Process                    │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │  │
│  │  │   Hardware   │  │   Network    │  │   Service    │     │  │
│  │  │   Services   │  │   Services   │  │   Services   │     │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │  │
│  │         │                  │                  │             │  │
│  └─────────┼──────────────────┼──────────────────┼─────────────┘  │
│            │                  │                  │                │
└────────────┼──────────────────┼──────────────────┼────────────────┘
             │                  │                  │
    ┌────────▼────────┐  ┌─────▼──────┐  ┌───────▼────────┐
    │   System APIs   │  │  Network   │  │   External     │
    │   (OS Commands) │  │    APIs    │  │   Services     │
    └─────────────────┘  └────────────┘  └────────────────┘
                                          │
                                          ├─ Docker API
                                          ├─ Tailscale API
                                          ├─ Cloudflared API
                                          ├─ Infisical API
                                          └─ Gitea API
```

### 2.2 Setup Workflow Phases

```
Phase 1: PC Detection & Hardware Info
│
├─► Auto-detect PC type (orchestrator/worker)
├─► Collect hardware specs (CPU, RAM, GPU, Network)
├─► Validate compatibility
└─► Manual override option

Phase 2: Network Configuration
│
├─► Display current network settings
├─► Configure static IP (wizard)
├─► Test network connectivity
└─► Store config in Infisical

Phase 3: Infrastructure Setup
│
├─► Install Docker Desktop (if not present)
├─► Setup WSL2 (if not present)
├─► Install NVIDIA drivers (workers only)
├─► Configure Wake-on-LAN
└─► Validate installations

Phase 4: VPN & Tunnel Setup
│
├─► Setup Tailscale VPN (wizard)
├─► Setup Cloudflared tunnels (wizard)
├─► Test connectivity
└─► Store credentials in Infisical

Phase 5: Service Deployment
│
├─► Deploy Gitea (orchestrator only)
├─► Deploy databases (orchestrator only)
│   ├─ PostgreSQL
│   ├─ Redis
│   ├─ TimescaleDB
│   └─ Qdrant
├─► Deploy Claude Code/Desktop
└─► Validate all services

Phase 6: Validation & Completion
│
├─► Run comprehensive health checks
├─► Test all connections
├─► Generate setup report
└─► Store final config in Infisical
```

---

## 3. Component Hierarchy

### 3.1 React Component Tree

```
App
│
├─── ProgressHeader
│    ├─── PhaseIndicator
│    └─── ProgressBar
│
├─── WizardRouter
│    │
│    ├─── Phase1_PCDetection
│    │    ├─── PCDetectionScreen
│    │    │    ├─── HardwareInfoDisplay
│    │    │    ├─── PCTypeSelector
│    │    │    └─── CompatibilityValidator
│    │    │
│    │    └─── HardwareCollectionScreen
│    │         ├─── CPUInfoCard
│    │         ├─── RAMInfoCard
│    │         ├─── GPUInfoCard
│    │         └─── NetworkInfoCard
│    │
│    ├─── Phase2_NetworkConfig
│    │    ├─── NetworkConfigScreen
│    │    │    ├─── CurrentNetworkDisplay
│    │    │    ├─── StaticIPWizard
│    │    │    └─── NetworkTestPanel
│    │    │
│    │    └─── WakeOnLANSetup
│    │         ├─── BIOSInstructions
│    │         ├─── OSConfiguration
│    │         └─── TestWakeOnLAN
│    │
│    ├─── Phase3_InfrastructureSetup
│    │    ├─── DockerSetupScreen
│    │    │    ├─── InstallationWizard
│    │    │    ├─── ConfigurationPanel
│    │    │    └─── ValidationPanel
│    │    │
│    │    ├─── WSL2SetupScreen
│    │    │    ├─── InstallationWizard
│    │    │    ├─── DistributionSelector
│    │    │    └─── ValidationPanel
│    │    │
│    │    └─── NVIDIASetupScreen (workers only)
│    │         ├─── DriverInstaller
│    │         ├─── CUDASetup
│    │         └─── ValidationPanel
│    │
│    ├─── Phase4_VPNTunnelSetup
│    │    ├─── TailscaleSetupScreen
│    │    │    ├─── AuthenticationWizard
│    │    │    ├─── NetworkConfiguration
│    │    │    └─── ConnectionTest
│    │    │
│    │    └─── CloudflaredSetupScreen
│    │         ├─── TunnelCreationWizard
│    │         ├─── ServiceConfiguration
│    │         └─── ConnectionTest
│    │
│    ├─── Phase5_ServiceDeployment
│    │    ├─── GiteaSetupScreen (orchestrator only)
│    │    │    ├─── InstallationWizard
│    │    │    ├─── RepositoryInitializer
│    │    │    └─── ValidationPanel
│    │    │
│    │    ├─── DatabaseSetupScreen (orchestrator only)
│    │    │    ├─── PostgreSQLSetup
│    │    │    ├─── RedisSetup
│    │    │    ├─── TimescaleDBSetup
│    │    │    └─── QdrantSetup
│    │    │
│    │    └─── ClaudeSetupScreen
│    │         ├─── ClaudeCodeSetup
│    │         ├─── ClaudeDesktopSetup
│    │         ├─── MCPConfiguration
│    │         └─── ValidationPanel
│    │
│    └─── Phase6_Validation
│         ├─── HealthCheckScreen
│         │    ├─── ServiceHealthGrid
│         │    ├─── ConnectivityTestPanel
│         │    └─── PerformanceTestPanel
│         │
│         ├─── ConfigReviewScreen
│         │    ├─── ConfigurationSummary
│         │    ├─── InfisicalStorageStatus
│         │    └─── ExportOptions
│         │
│         └─── CompletionScreen
│              ├─── SetupReport
│              ├─── NextStepsGuide
│              └─── RestartOption
│
├─── SidebarNavigation
│    ├─── PhaseList
│    ├─── QuickActions
│    └─── HelpLinks
│
└─── Footer
     ├─── RollbackButton
     ├─── SaveProgressButton
     └─── QuitButton
```

### 3.2 Key Component Specifications

#### WizardScreen (Base Component)
```typescript
interface WizardScreenProps {
  title: string;
  description: string;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  canProceed: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}
```

#### HardwareInfoCard
```typescript
interface HardwareInfoCardProps {
  type: 'cpu' | 'ram' | 'gpu' | 'network';
  data: HardwareInfo;
  editable?: boolean;
  onEdit?: (data: HardwareInfo) => void;
}

interface HardwareInfo {
  name: string;
  specs: Record<string, string | number>;
  status: 'detected' | 'manual' | 'missing';
  validated: boolean;
}
```

#### SetupWizard (Generic)
```typescript
interface SetupWizardProps<T> {
  component: string; // e.g., "Docker", "Tailscale"
  steps: WizardStep[];
  onComplete: (result: T) => void;
  onCancel: () => void;
  validation: ValidationRules;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
  validation: (data: any) => ValidationResult;
}
```

---

## 4. State Management Strategy

### 4.1 Zustand Store Architecture

```typescript
// stores/setupStore.ts
interface SetupStore {
  // PC Detection State
  pcDetection: {
    detectedType: PCId | null;
    confidence: number;
    manualOverride: PCId | null;
    hardwareInfo: HardwareInfo;
    validated: boolean;
  };

  // Network Configuration State
  networkConfig: {
    currentSettings: NetworkSettings;
    staticIPConfig: StaticIPConfig | null;
    wakeOnLAN: WakeOnLANConfig | null;
    validated: boolean;
  };

  // Infrastructure Setup State
  infrastructure: {
    docker: ComponentSetupState;
    wsl2: ComponentSetupState;
    nvidia: ComponentSetupState | null; // Workers only
    wakeOnLAN: ComponentSetupState;
  };

  // VPN/Tunnel Setup State
  vpnTunnel: {
    tailscale: TailscaleConfig | null;
    cloudflared: CloudflaredConfig | null;
    validated: boolean;
  };

  // Service Deployment State
  services: {
    gitea: ServiceDeploymentState | null; // Orchestrator only
    databases: DatabaseDeploymentState | null; // Orchestrator only
    claude: ClaudeDeploymentState;
  };

  // Validation & Progress State
  progress: {
    currentPhase: SetupPhase;
    completedPhases: Set<SetupPhase>;
    currentStep: number;
    totalSteps: number;
    percentage: number;
  };

  // Rollback State
  rollback: {
    enabled: boolean;
    checkpoints: Checkpoint[];
    currentCheckpoint: string | null;
  };

  // Logs & Errors
  logs: LogEntry[];
  errors: ErrorEntry[];

  // Actions
  actions: {
    // PC Detection
    setDetectedPC: (type: PCId, confidence: number) => void;
    setManualPCType: (type: PCId) => void;
    updateHardwareInfo: (info: HardwareInfo) => void;
    validatePCDetection: () => Promise<boolean>;

    // Network Configuration
    updateNetworkConfig: (config: NetworkSettings) => void;
    setStaticIPConfig: (config: StaticIPConfig) => void;
    setWakeOnLANConfig: (config: WakeOnLANConfig) => void;
    testNetworkConfig: () => Promise<boolean>;

    // Infrastructure Setup
    updateComponentSetup: (component: string, state: ComponentSetupState) => void;
    validateInfrastructure: () => Promise<boolean>;

    // VPN/Tunnel Setup
    setTailscaleConfig: (config: TailscaleConfig) => void;
    setCloudflaredConfig: (config: CloudflaredConfig) => void;
    testVPNConnectivity: () => Promise<boolean>;

    // Service Deployment
    deployService: (service: string) => Promise<boolean>;
    validateServices: () => Promise<boolean>;

    // Progress Management
    advancePhase: () => void;
    goToPhase: (phase: SetupPhase) => void;
    updateProgress: (step: number, total: number) => void;

    // Rollback
    createCheckpoint: (name: string) => Promise<string>;
    rollbackToCheckpoint: (id: string) => Promise<boolean>;

    // Infisical Integration
    storeConfigInInfisical: (key: string, value: any) => Promise<boolean>;
    retrieveConfigFromInfisical: (key: string) => Promise<any>;

    // Logging
    addLog: (log: Omit<LogEntry, 'timestamp'>) => void;
    addError: (error: Error, context: string) => void;
    clearLogs: () => void;
  };
}
```

### 4.2 Type Definitions

```typescript
// types/setup.ts

export type SetupPhase =
  | 'pc-detection'
  | 'hardware-collection'
  | 'network-config'
  | 'infrastructure-setup'
  | 'vpn-tunnel-setup'
  | 'service-deployment'
  | 'validation'
  | 'complete';

export interface HardwareInfo {
  pcName: string;
  pcType: PCId;
  network: {
    hostname: string;
    ipAddress: string;
    macAddress: string;
    gateway: string;
    dnsServers: string[];
  };
  cpu: {
    model: string;
    cores: number;
    threads: number;
    frequency: number; // GHz
  };
  ram: {
    type: 'DDR4' | 'DDR5';
    totalSize: number; // GB
    speed: number; // MHz
    slots: RAMSlot[];
  };
  gpu: {
    model: string;
    vendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Unknown';
    vram: number; // GB
    driverVersion?: string;
    cudaVersion?: string;
  }[];
  storage: {
    drives: StorageDrive[];
    totalCapacity: number; // GB
    availableSpace: number; // GB
  };
}

export interface StaticIPConfig {
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dnsServers: string[];
  interfaceName: string;
  validated: boolean;
}

export interface WakeOnLANConfig {
  enabled: boolean;
  biosConfigured: boolean;
  osConfigured: boolean;
  tested: boolean;
  testResult?: {
    success: boolean;
    message: string;
  };
}

export interface ComponentSetupState {
  installed: boolean;
  version?: string;
  configPath?: string;
  validated: boolean;
  error?: string;
  rollbackAvailable: boolean;
}

export interface TailscaleConfig {
  authKey: string;
  hostname: string;
  ipAddress: string;
  connected: boolean;
  exitNode?: string;
  routes: string[];
}

export interface CloudflaredConfig {
  tunnelId: string;
  tunnelName: string;
  accountId: string;
  services: CloudflareTunnelService[];
  credentialsFile: string;
  configFile: string;
  connected: boolean;
}

export interface ServiceDeploymentState {
  name: string;
  deployed: boolean;
  containers: string[];
  healthy: boolean;
  url?: string;
  credentials?: {
    username: string;
    password: string;
  };
}

export interface Checkpoint {
  id: string;
  name: string;
  phase: SetupPhase;
  timestamp: Date;
  state: Partial<SetupStore>;
  files: BackupFile[];
  reversible: boolean;
}

export interface BackupFile {
  originalPath: string;
  backupPath: string;
  checksum: string;
}
```

---

## 5. Service Layer Architecture

### 5.1 Service Structure

```
services/
│
├── hardware/
│   ├── hardwareDetector.ts       # System hardware detection
│   ├── networkInfoCollector.ts   # Network configuration reader
│   ├── gpuDetector.ts            # GPU-specific detection (nvidia-smi)
│   └── wakeOnLANConfigurator.ts  # WoL setup and testing
│
├── network/
│   ├── staticIPConfigurator.ts   # Windows/WSL static IP setup
│   ├── networkTester.ts          # Connectivity validation
│   └── dnsConfigurator.ts        # DNS configuration
│
├── infrastructure/
│   ├── dockerInstaller.ts        # Docker Desktop installation
│   ├── wsl2Installer.ts          # WSL2 setup and configuration
│   ├── nvidiaInstaller.ts        # NVIDIA driver installation
│   └── systemValidator.ts        # System requirements validation
│
├── vpn/
│   ├── tailscaleManager.ts       # Tailscale installation and config
│   ├── cloudflaredManager.ts     # Cloudflared tunnel management
│   └── vpnTester.ts              # VPN connectivity testing
│
├── deployment/
│   ├── giteaDeployer.ts          # Gitea Docker deployment
│   ├── databaseDeployer.ts       # Database deployment (PostgreSQL, Redis, etc.)
│   ├── claudeDeployer.ts         # Claude Code/Desktop setup
│   └── serviceHealthChecker.ts   # Service health validation
│
├── config/
│   ├── infisicalClient.ts        # Infisical API client
│   ├── configManager.ts          # Configuration CRUD
│   └── secretsManager.ts         # Secrets encryption/decryption
│
├── rollback/
│   ├── checkpointManager.ts      # Checkpoint creation/restoration
│   ├── fileBackupManager.ts      # File backup/restore
│   └── stateRecovery.ts          # State snapshot management
│
└── orchestration/
    ├── setupOrchestrator.ts      # Main setup workflow coordinator
    ├── validationEngine.ts       # Multi-step validation
    └── progressTracker.ts        # Progress state management
```

### 5.2 Key Service Implementations

#### HardwareDetector Service

```typescript
// services/hardware/hardwareDetector.ts

export class HardwareDetector {
  /**
   * Detect complete hardware profile
   */
  async detectHardware(): Promise<HardwareInfo> {
    const [network, cpu, ram, gpu, storage] = await Promise.all([
      this.detectNetwork(),
      this.detectCPU(),
      this.detectRAM(),
      this.detectGPU(),
      this.detectStorage(),
    ]);

    return {
      pcName: os.hostname(),
      pcType: this.inferPCType({ cpu, ram, gpu }),
      network,
      cpu,
      ram,
      gpu,
      storage,
    };
  }

  /**
   * Detect network configuration
   */
  private async detectNetwork(): Promise<HardwareInfo['network']> {
    const interfaces = os.networkInterfaces();
    const primaryInterface = this.findPrimaryInterface(interfaces);

    const ipAddress = primaryInterface.address;
    const macAddress = primaryInterface.mac;

    // Get gateway and DNS via netsh (Windows) or ip route (WSL)
    const gateway = await this.detectGateway();
    const dnsServers = await this.detectDNSServers();

    return {
      hostname: os.hostname(),
      ipAddress,
      macAddress,
      gateway,
      dnsServers,
    };
  }

  /**
   * Detect RAM details including type and speed
   */
  private async detectRAM(): Promise<HardwareInfo['ram']> {
    // Windows: wmic memorychip get Speed,Capacity,MemoryType
    // Linux: dmidecode --type memory

    const output = await this.execCommand(
      process.platform === 'win32'
        ? 'wmic memorychip get Speed,Capacity,MemoryType,DeviceLocator /format:csv'
        : 'sudo dmidecode --type memory'
    );

    const slots = this.parseRAMInfo(output);
    const totalSize = slots.reduce((sum, slot) => sum + slot.capacity, 0) / (1024 ** 3); // GB
    const speed = slots[0]?.speed || 0;
    const type = this.inferRAMType(slots[0]?.memoryType);

    return { type, totalSize, speed, slots };
  }

  /**
   * Detect GPU details including VRAM
   */
  private async detectGPU(): Promise<HardwareInfo['gpu']> {
    try {
      // Try nvidia-smi first
      const output = await this.execCommand(
        'nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader'
      );

      return this.parseNVIDIAInfo(output);
    } catch {
      // Fall back to wmic or lspci
      return this.detectGenericGPU();
    }
  }

  /**
   * Infer PC type from hardware specs
   */
  private inferPCType(specs: {
    cpu: HardwareInfo['cpu'];
    ram: HardwareInfo['ram'];
    gpu: HardwareInfo['gpu'];
  }): PCId {
    const hasHighEndGPU = specs.gpu.some(g =>
      g.model.includes('3090') || g.model.includes('5090')
    );

    const hasRTX3060 = specs.gpu.some(g => g.model.includes('3060'));
    const ramGB = specs.ram.totalSize;

    if (hasHighEndGPU && ramGB >= 28) {
      if (specs.gpu[0].model.includes('5090')) return 'worker-rtx5090';
      if (specs.gpu[0].model.includes('3090')) return 'worker-rtx3090ti';
    }

    if (hasRTX3060 && ramGB >= 28) return 'worker-rtx3060';

    if (specs.cpu.model.includes('6800H') || specs.cpu.model.includes('Ryzen 7')) {
      return 'orchestrator-mini';
    }

    // Default fallback
    return 'orchestrator-mini';
  }
}
```

#### StaticIPConfigurator Service

```typescript
// services/network/staticIPConfigurator.ts

export class StaticIPConfigurator {
  /**
   * Configure static IP on Windows
   */
  async configureStaticIP(config: StaticIPConfig): Promise<boolean> {
    try {
      // Windows: netsh interface ip set address
      const command = `
        netsh interface ip set address name="${config.interfaceName}" static ${config.ipAddress} ${config.subnetMask} ${config.gateway}
        netsh interface ip set dns name="${config.interfaceName}" static ${config.dnsServers[0]}
        ${config.dnsServers.slice(1).map((dns, i) =>
          `netsh interface ip add dns name="${config.interfaceName}" ${dns} index=${i + 2}`
        ).join('\n')}
      `;

      await this.execAsAdmin(command);

      // Validate configuration applied
      const validation = await this.validateStaticIP(config);
      return validation.success;
    } catch (error) {
      console.error('Failed to configure static IP:', error);
      return false;
    }
  }

  /**
   * Validate static IP configuration
   */
  async validateStaticIP(config: StaticIPConfig): Promise<{
    success: boolean;
    message: string;
  }> {
    const currentIP = await this.getCurrentIP(config.interfaceName);

    if (currentIP !== config.ipAddress) {
      return {
        success: false,
        message: `IP mismatch: expected ${config.ipAddress}, got ${currentIP}`,
      };
    }

    // Test gateway connectivity
    const gatewayReachable = await this.pingHost(config.gateway);
    if (!gatewayReachable) {
      return {
        success: false,
        message: `Gateway ${config.gateway} unreachable`,
      };
    }

    // Test DNS resolution
    const dnsWorking = await this.testDNS();
    if (!dnsWorking) {
      return {
        success: false,
        message: 'DNS resolution failed',
      };
    }

    return { success: true, message: 'Static IP configured successfully' };
  }

  /**
   * Rollback to DHCP
   */
  async rollbackToDHCP(interfaceName: string): Promise<boolean> {
    const command = `
      netsh interface ip set address name="${interfaceName}" dhcp
      netsh interface ip set dns name="${interfaceName}" dhcp
    `;

    try {
      await this.execAsAdmin(command);
      return true;
    } catch (error) {
      console.error('Failed to rollback to DHCP:', error);
      return false;
    }
  }
}
```

#### InfisicalClient Service

```typescript
// services/config/infisicalClient.ts

export class InfisicalClient {
  private apiUrl: string;
  private token: string | null = null;

  constructor(config: { apiUrl: string }) {
    this.apiUrl = config.apiUrl;
  }

  /**
   * Authenticate with Infisical
   */
  async authenticate(credentials: {
    email: string;
    password: string;
  }): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/v1/auth/login`, credentials);
      this.token = response.data.token;
      return true;
    } catch (error) {
      console.error('Infisical authentication failed:', error);
      return false;
    }
  }

  /**
   * Store configuration in Infisical
   */
  async storeConfig(key: string, value: any, metadata?: {
    environment?: string;
    pcType?: PCId;
  }): Promise<boolean> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      await axios.post(
        `${this.apiUrl}/api/v3/secrets/${key}`,
        {
          secretValue: typeof value === 'string' ? value : JSON.stringify(value),
          secretComment: JSON.stringify(metadata),
        },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to store config in Infisical:', error);
      return false;
    }
  }

  /**
   * Retrieve configuration from Infisical
   */
  async retrieveConfig(key: string): Promise<any | null> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v3/secrets/${key}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      const secretValue = response.data.secret.secretValue;

      // Try to parse as JSON
      try {
        return JSON.parse(secretValue);
      } catch {
        return secretValue;
      }
    } catch (error) {
      console.error('Failed to retrieve config from Infisical:', error);
      return null;
    }
  }

  /**
   * Store hardware info in Infisical
   */
  async storeHardwareInfo(pcType: PCId, info: HardwareInfo): Promise<boolean> {
    const key = `hardware/${pcType}`;
    return this.storeConfig(key, info, { pcType });
  }

  /**
   * Store network configuration in Infisical
   */
  async storeNetworkConfig(pcType: PCId, config: StaticIPConfig): Promise<boolean> {
    const key = `network/${pcType}/static-ip`;
    return this.storeConfig(key, config, { pcType });
  }

  /**
   * Store service credentials in Infisical
   */
  async storeServiceCredentials(
    service: string,
    credentials: Record<string, string>
  ): Promise<boolean> {
    const key = `services/${service}/credentials`;
    return this.storeConfig(key, credentials);
  }
}
```

#### CheckpointManager Service

```typescript
// services/rollback/checkpointManager.ts

export class CheckpointManager {
  private checkpointsDir: string;
  private stateStore: SetupStore;

  constructor(checkpointsDir: string, stateStore: SetupStore) {
    this.checkpointsDir = checkpointsDir;
    this.stateStore = stateStore;
  }

  /**
   * Create a checkpoint at current state
   */
  async createCheckpoint(name: string, phase: SetupPhase): Promise<string> {
    const checkpointId = `checkpoint-${Date.now()}`;
    const checkpointPath = path.join(this.checkpointsDir, checkpointId);

    await fs.mkdir(checkpointPath, { recursive: true });

    // Snapshot current state
    const state = this.snapshotState();

    // Backup files that might be modified
    const backupFiles = await this.backupFiles(checkpointPath);

    const checkpoint: Checkpoint = {
      id: checkpointId,
      name,
      phase,
      timestamp: new Date(),
      state,
      files: backupFiles,
      reversible: true,
    };

    // Save checkpoint metadata
    await fs.writeFile(
      path.join(checkpointPath, 'checkpoint.json'),
      JSON.stringify(checkpoint, null, 2)
    );

    return checkpointId;
  }

  /**
   * Rollback to a checkpoint
   */
  async rollbackToCheckpoint(checkpointId: string): Promise<boolean> {
    const checkpointPath = path.join(this.checkpointsDir, checkpointId);
    const metadataPath = path.join(checkpointPath, 'checkpoint.json');

    if (!await this.fileExists(metadataPath)) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const checkpoint: Checkpoint = JSON.parse(
      await fs.readFile(metadataPath, 'utf-8')
    );

    if (!checkpoint.reversible) {
      throw new Error(`Checkpoint ${checkpointId} is not reversible`);
    }

    try {
      // Restore files
      await this.restoreFiles(checkpoint.files, checkpointPath);

      // Restore state
      this.restoreState(checkpoint.state);

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  /**
   * List all checkpoints
   */
  async listCheckpoints(): Promise<Checkpoint[]> {
    const dirs = await fs.readdir(this.checkpointsDir);
    const checkpoints: Checkpoint[] = [];

    for (const dir of dirs) {
      const metadataPath = path.join(this.checkpointsDir, dir, 'checkpoint.json');
      if (await this.fileExists(metadataPath)) {
        const checkpoint = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
        checkpoints.push(checkpoint);
      }
    }

    return checkpoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Snapshot current state
   */
  private snapshotState(): Partial<SetupStore> {
    return {
      pcDetection: this.stateStore.pcDetection,
      networkConfig: this.stateStore.networkConfig,
      infrastructure: this.stateStore.infrastructure,
      vpnTunnel: this.stateStore.vpnTunnel,
      services: this.stateStore.services,
      progress: this.stateStore.progress,
    };
  }

  /**
   * Backup files that will be modified
   */
  private async backupFiles(checkpointPath: string): Promise<BackupFile[]> {
    const backupFiles: BackupFile[] = [];
    const filesToBackup = this.getFilesToBackup();

    for (const file of filesToBackup) {
      if (await this.fileExists(file)) {
        const backupFile = path.join(checkpointPath, 'files', path.basename(file));
        await fs.mkdir(path.dirname(backupFile), { recursive: true });
        await fs.copyFile(file, backupFile);

        const checksum = await this.calculateChecksum(file);

        backupFiles.push({
          originalPath: file,
          backupPath: backupFile,
          checksum,
        });
      }
    }

    return backupFiles;
  }

  /**
   * Restore files from backup
   */
  private async restoreFiles(
    backupFiles: BackupFile[],
    checkpointPath: string
  ): Promise<void> {
    for (const file of backupFiles) {
      const backupFile = path.join(checkpointPath, 'files', path.basename(file.originalPath));

      if (await this.fileExists(backupFile)) {
        await fs.copyFile(backupFile, file.originalPath);
      }
    }
  }

  /**
   * Get list of files to backup
   */
  private getFilesToBackup(): string[] {
    return [
      // Network configuration files
      'C:\\Windows\\System32\\drivers\\etc\\hosts',

      // Docker configuration
      `${process.env.APPDATA}\\.docker\\config.json`,

      // Claude configuration
      `${process.env.USERPROFILE}\\.claude\\settings.json`,
      `${process.env.USERPROFILE}\\.claude\\.mcp.json`,

      // WSL configuration
      `${process.env.USERPROFILE}\\.wslconfig`,
    ];
  }
}
```

---

## 6. Integration Strategy

### 6.1 External Service Integration

#### Docker Integration

```typescript
// Integration with Docker Desktop API
export class DockerManager {
  private docker: Dockerode;

  async checkInstallation(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch {
      return false;
    }
  }

  async installDockerDesktop(): Promise<boolean> {
    // Download Docker Desktop installer
    // Run installer with silent flags
    // Wait for installation completion
    // Validate installation
  }

  async deployComposeStack(
    composePath: string,
    envVars?: Record<string, string>
  ): Promise<boolean> {
    // Deploy docker-compose files from /docker/ directory
    // NOT from bootstrap/
  }
}
```

#### Infisical Integration Points

```typescript
// Points where config is stored in Infisical:

1. PC Detection Phase
   - Store: hardware/${pcType}/info

2. Network Configuration Phase
   - Store: network/${pcType}/static-ip
   - Store: network/${pcType}/wake-on-lan

3. VPN/Tunnel Setup Phase
   - Store: vpn/tailscale/${pcType}
   - Store: vpn/cloudflared/${pcType}

4. Service Deployment Phase
   - Store: services/gitea/credentials
   - Store: services/postgresql/credentials
   - Store: services/redis/credentials
   - Store: services/timescaledb/credentials
   - Store: services/qdrant/credentials
   - Store: services/claude/api-key
```

### 6.2 File System Integration

```
Project Structure:
C:\Dev\Projects\Repos\Project-Nyra\
│
├── bootstrap/
│   ├── installer/          # THIS GUI APPLICATION
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   │
│   ├── windows/            # Windows PowerShell scripts
│   │   ├── orchestrator/
│   │   ├── workers/
│   │   └── shared/
│   │
│   └── wsl/                # WSL Bash scripts
│       ├── orchestrator/
│       ├── workers/
│       └── shared/
│
├── docker/                 # Docker Compose files (NOT in bootstrap)
│   ├── orchestrator/
│   │   └── docker-compose.yml
│   └── client/
│       └── docker-compose.yml
│
└── configs/                # Service configurations (NOT in bootstrap)
    ├── gitea/
    ├── postgresql/
    └── claude/
```

**Key Principle**:
- **bootstrap/installer/** = GUI application only
- **bootstrap/windows/** and **bootstrap/wsl/** = OS-specific scripts
- **docker/** = Docker Compose files (referenced, not copied)
- **configs/** = Service configurations (referenced, not copied)

### 6.3 IPC Bridge (Electron Main ↔ Renderer)

```typescript
// src/main/ipc-handlers.ts

export function registerIPCHandlers(ipcMain: IpcMain) {
  // Hardware Detection
  ipcMain.handle('hardware:detect', async () => {
    const detector = new HardwareDetector();
    return await detector.detectHardware();
  });

  // Network Configuration
  ipcMain.handle('network:configure-static-ip', async (event, config: StaticIPConfig) => {
    const configurator = new StaticIPConfigurator();
    return await configurator.configureStaticIP(config);
  });

  // Docker Management
  ipcMain.handle('docker:install', async () => {
    const installer = new DockerInstaller();
    return await installer.install();
  });

  // Service Deployment
  ipcMain.handle('services:deploy', async (event, service: string) => {
    const deployer = getDeployerForService(service);
    return await deployer.deploy();
  });

  // Infisical Integration
  ipcMain.handle('infisical:store', async (event, key: string, value: any) => {
    const client = InfisicalClient.getInstance();
    return await client.storeConfig(key, value);
  });

  // Rollback
  ipcMain.handle('rollback:create-checkpoint', async (event, name: string, phase: SetupPhase) => {
    const manager = CheckpointManager.getInstance();
    return await manager.createCheckpoint(name, phase);
  });
}
```

---

## 7. Validation Strategy

### 7.1 Multi-Level Validation

```typescript
// services/orchestration/validationEngine.ts

export class ValidationEngine {
  /**
   * Validate entire setup phase
   */
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
      default:
        return { valid: true, message: 'Phase validation not required' };
    }
  }

  /**
   * Validate PC detection
   */
  private async validatePCDetection(): Promise<ValidationResult> {
    const checks = [
      this.checkHardwareDetected(),
      this.checkPCTypeAssigned(),
      this.checkCompatibility(),
    ];

    const results = await Promise.all(checks);
    const failed = results.filter(r => !r.valid);

    return {
      valid: failed.length === 0,
      message: failed.length > 0
        ? `PC Detection validation failed: ${failed.map(r => r.message).join(', ')}`
        : 'PC detection validated successfully',
      details: results,
    };
  }

  /**
   * Validate network configuration
   */
  private async validateNetworkConfig(): Promise<ValidationResult> {
    const checks = [
      this.checkStaticIPApplied(),
      this.checkGatewayReachable(),
      this.checkDNSWorking(),
      this.checkWakeOnLANConfigured(),
    ];

    const results = await Promise.all(checks);
    const failed = results.filter(r => !r.valid);

    return {
      valid: failed.length === 0,
      message: failed.length > 0
        ? `Network validation failed: ${failed.map(r => r.message).join(', ')}`
        : 'Network configuration validated successfully',
      details: results,
    };
  }

  /**
   * Validate infrastructure setup
   */
  private async validateInfrastructure(): Promise<ValidationResult> {
    const checks = [
      this.checkDockerInstalled(),
      this.checkDockerRunning(),
      this.checkWSL2Installed(),
      this.checkWSL2Running(),
    ];

    // Workers only: check NVIDIA
    if (this.isWorkerPC()) {
      checks.push(
        this.checkNVIDIADriverInstalled(),
        this.checkCUDAWorking()
      );
    }

    const results = await Promise.all(checks);
    const failed = results.filter(r => !r.valid);

    return {
      valid: failed.length === 0,
      message: failed.length > 0
        ? `Infrastructure validation failed: ${failed.map(r => r.message).join(', ')}`
        : 'Infrastructure validated successfully',
      details: results,
    };
  }

  /**
   * Validate VPN/Tunnel setup
   */
  private async validateVPNTunnels(): Promise<ValidationResult> {
    const checks = [
      this.checkTailscaleConnected(),
      this.checkCloudflaredRunning(),
      this.checkTunnelServicesAccessible(),
    ];

    const results = await Promise.all(checks);
    const failed = results.filter(r => !r.valid);

    return {
      valid: failed.length === 0,
      message: failed.length > 0
        ? `VPN/Tunnel validation failed: ${failed.map(r => r.message).join(', ')}`
        : 'VPN/Tunnel setup validated successfully',
      details: results,
    };
  }

  /**
   * Validate service deployment
   */
  private async validateServices(): Promise<ValidationResult> {
    const checks = [
      this.checkClaudeCodeInstalled(),
    ];

    // Orchestrator only: check databases and Gitea
    if (this.isOrchestratorPC()) {
      checks.push(
        this.checkGiteaRunning(),
        this.checkPostgreSQLRunning(),
        this.checkRedisRunning(),
        this.checkTimescaleDBRunning(),
        this.checkQdrantRunning()
      );
    }

    const results = await Promise.all(checks);
    const failed = results.filter(r => !r.valid);

    return {
      valid: failed.length === 0,
      message: failed.length > 0
        ? `Service validation failed: ${failed.map(r => r.message).join(', ')}`
        : 'Services validated successfully',
      details: results,
    };
  }
}
```

---

## 8. Security Considerations

### 8.1 Credential Management

1. **Never store plain-text credentials**
   - All secrets stored in Infisical
   - Local storage only for non-sensitive data
   - Credentials encrypted in transit

2. **API Keys**
   - Tailscale auth keys: stored in Infisical
   - Cloudflare tokens: stored in Infisical
   - Database passwords: generated, stored in Infisical
   - Gitea admin password: generated, stored in Infisical

3. **Network Security**
   - Static IP changes validated before applying
   - Firewall rules preserved during setup
   - VPN tunnels validated before marking complete

### 8.2 Privilege Escalation

```typescript
// services/system/privilegeEscalator.ts

export class PrivilegeEscalator {
  /**
   * Run command with admin privileges
   */
  async runAsAdmin(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      sudo.exec(
        command,
        { name: 'Project Nyra Setup' },
        (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve({ stdout: stdout?.toString() || '', stderr: stderr?.toString() || '' });
        }
      );
    });
  }

  /**
   * Check if running with admin privileges
   */
  async hasAdminPrivileges(): Promise<boolean> {
    try {
      // Try to write to a protected location
      await fs.access('C:\\Windows\\System32', fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## 9. Error Handling & Rollback

### 9.1 Error Recovery Strategy

```typescript
// services/orchestration/errorRecovery.ts

export class ErrorRecovery {
  /**
   * Handle phase failure
   */
  async handlePhaseFailure(
    phase: SetupPhase,
    error: Error
  ): Promise<RecoveryAction> {
    // Log error
    logger.error(`Phase ${phase} failed:`, error);

    // Determine recovery action
    const action = this.determineRecoveryAction(phase, error);

    switch (action.type) {
      case 'retry':
        return { type: 'retry', maxAttempts: 3 };

      case 'rollback':
        await this.rollbackPhase(phase);
        return { type: 'rollback', checkpoint: action.checkpoint };

      case 'skip':
        logger.warn(`Skipping phase ${phase} due to error`);
        return { type: 'skip' };

      case 'abort':
        await this.cleanup();
        return { type: 'abort', message: error.message };
    }
  }

  /**
   * Rollback a specific phase
   */
  private async rollbackPhase(phase: SetupPhase): Promise<void> {
    const checkpoint = await this.findLastCheckpointBeforePhase(phase);

    if (checkpoint) {
      await CheckpointManager.getInstance().rollbackToCheckpoint(checkpoint.id);
    }
  }

  /**
   * Cleanup on abort
   */
  private async cleanup(): Promise<void> {
    // Remove temporary files
    // Close network connections
    // Reset state
  }
}
```

### 9.2 Rollback Scope

| Phase | Rollback Capability | Strategy |
|-------|-------------------|----------|
| **PC Detection** | Full | Reset state only (no system changes) |
| **Network Config** | Full | Restore to DHCP, restore DNS |
| **Infrastructure** | Partial | Uninstall Docker/WSL (user choice) |
| **VPN/Tunnel** | Full | Disconnect, remove credentials |
| **Service Deployment** | Full | Stop containers, remove volumes |

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Enhance HardwareDetector service
  - Add RAM type/speed detection
  - Add detailed network info collection
  - Add MAC address detection
- [ ] Create NetworkInfoCollector service
- [ ] Create InfisicalClient service
- [ ] Setup enhanced Zustand store
- [ ] Create CheckpointManager service

### Phase 2: Network Configuration (Week 3)
- [ ] Build StaticIPConfigurator service
- [ ] Create NetworkConfigScreen component
- [ ] Build StaticIPWizard component
- [ ] Create WakeOnLANSetup component
- [ ] Implement network validation

### Phase 3: Infrastructure Wizards (Week 4-5)
- [ ] Create DockerInstaller service
- [ ] Build DockerSetupScreen with wizard
- [ ] Create WSL2Installer service
- [ ] Build WSL2SetupScreen with wizard
- [ ] Create NVIDIAInstaller service
- [ ] Build NVIDIASetupScreen (workers only)
- [ ] Implement validation for each component

### Phase 4: VPN/Tunnel Setup (Week 6)
- [ ] Create TailscaleManager service
- [ ] Build TailscaleSetupScreen with wizard
- [ ] Create CloudflaredManager service
- [ ] Build CloudflaredSetupScreen with wizard
- [ ] Implement connectivity testing

### Phase 5: Service Deployment (Week 7-8)
- [ ] Create GiteaDeployer service
- [ ] Build GiteaSetupScreen (orchestrator)
- [ ] Create DatabaseDeployer service
- [ ] Build DatabaseSetupScreen (orchestrator)
- [ ] Create ClaudeDeployer service
- [ ] Build ClaudeSetupScreen
- [ ] Implement health checks

### Phase 6: Validation & Polish (Week 9-10)
- [ ] Implement ValidationEngine
- [ ] Build comprehensive HealthCheckScreen
- [ ] Create ConfigReviewScreen
- [ ] Build CompletionScreen with report
- [ ] Implement end-to-end testing
- [ ] Polish UI/UX
- [ ] Documentation

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Hardware detection logic
- Network configuration validation
- Service installation logic
- Rollback mechanisms

### 11.2 Integration Tests
- Complete workflow from PC detection to completion
- Rollback at each phase
- Infisical integration
- Docker deployment from /docker/ directory

### 11.3 E2E Tests
- Test on each PC type:
  - Orchestrator (Minisforum)
  - Worker RTX3060
  - Worker RTX5090
  - Worker RTX3090Ti

---

## 12. Success Criteria

### 12.1 Functional Requirements
- ✅ Auto-detects PC type with >90% confidence
- ✅ Collects all hardware info (CPU, RAM type/speed, GPU+VRAM, network)
- ✅ Configures static IP with validation
- ✅ Installs Docker Desktop
- ✅ Installs WSL2
- ✅ Installs NVIDIA drivers (workers)
- ✅ Configures Wake-on-LAN
- ✅ Sets up Tailscale VPN
- ✅ Sets up Cloudflared tunnels
- ✅ Deploys Gitea (orchestrator)
- ✅ Deploys all databases (orchestrator)
- ✅ Installs Claude Code/Desktop
- ✅ Stores all configs in Infisical
- ✅ Validates each setup step
- ✅ Supports complete rollback

### 12.2 Non-Functional Requirements
- ⚡ Setup completion in <30 minutes (excluding downloads)
- 🛡️ Zero credential leaks (all in Infisical)
- 🔄 100% rollback success rate
- 📊 Real-time progress tracking
- 🎯 >95% success rate on target hardware
- 📝 Comprehensive logging

---

## 13. References

### 13.1 External Documentation
- Docker Desktop API: https://docs.docker.com/desktop/
- WSL2 Setup: https://docs.microsoft.com/en-us/windows/wsl/
- Tailscale API: https://tailscale.com/kb/1101/api/
- Cloudflare Tunnels: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- Infisical API: https://infisical.com/docs/api-reference/
- NVIDIA Driver API: https://www.nvidia.com/en-us/drivers/

### 13.2 Internal References
- `/docker/orchestrator/docker-compose.yml` - Orchestrator services
- `/docker/client/docker-compose.yml` - Worker services
- `/configs/` - Service configurations
- `/bootstrap/windows/` - Windows setup scripts
- `/bootstrap/wsl/` - WSL setup scripts

---

## Appendix A: Data Flow Diagrams

### PC Detection Flow
```
User Opens App
    │
    ├─► Auto-detect Hardware
    │       ├─► Collect CPU info
    │       ├─► Collect RAM info (type, speed, slots)
    │       ├─► Collect GPU info (model, VRAM)
    │       └─► Collect Network info (IP, MAC, gateway)
    │
    ├─► Infer PC Type
    │       └─► Score each PC type based on hardware
    │
    ├─► Display Detection Results
    │       ├─► Show hardware specs
    │       ├─► Show detected PC type
    │       └─► Allow manual override
    │
    └─► Store in Infisical
            └─► Key: hardware/${pcType}/info
```

### Network Configuration Flow
```
Network Config Phase
    │
    ├─► Display Current Settings
    │       └─► Read from OS (netsh/ip)
    │
    ├─► Static IP Wizard
    │       ├─► User inputs IP, subnet, gateway, DNS
    │       ├─► Validate IP range
    │       ├─► Apply with netsh
    │       └─► Test connectivity
    │
    ├─► Wake-on-LAN Setup
    │       ├─► Check BIOS settings (instructions)
    │       ├─► Configure OS settings
    │       └─► Test WoL
    │
    └─► Store in Infisical
            ├─► Key: network/${pcType}/static-ip
            └─► Key: network/${pcType}/wake-on-lan
```

### Service Deployment Flow (Orchestrator)
```
Service Deployment Phase
    │
    ├─► Deploy Gitea
    │       ├─► Pull Docker image
    │       ├─► Run container with /docker/orchestrator/docker-compose.yml
    │       ├─► Wait for healthy status
    │       └─► Store credentials in Infisical
    │
    ├─► Deploy PostgreSQL
    │       ├─► Generate random password
    │       ├─► Run container
    │       ├─► Wait for healthy status
    │       └─► Store credentials in Infisical
    │
    ├─► Deploy Redis
    │       └─► Similar flow...
    │
    ├─► Deploy TimescaleDB
    │       └─► Similar flow...
    │
    └─► Deploy Qdrant
            └─► Similar flow...
```

---

## Appendix B: Sample Configurations

### Sample Static IP Configuration
```json
{
  "ipAddress": "192.168.1.100",
  "subnetMask": "255.255.255.0",
  "gateway": "192.168.1.1",
  "dnsServers": ["1.1.1.1", "8.8.8.8"],
  "interfaceName": "Ethernet",
  "validated": true
}
```

### Sample Hardware Info
```json
{
  "pcName": "ORCHESTRATOR-01",
  "pcType": "orchestrator-mini",
  "network": {
    "hostname": "ORCHESTRATOR-01",
    "ipAddress": "192.168.1.100",
    "macAddress": "00:11:22:33:44:55",
    "gateway": "192.168.1.1",
    "dnsServers": ["1.1.1.1", "8.8.8.8"]
  },
  "cpu": {
    "model": "AMD Ryzen 7 6800H",
    "cores": 8,
    "threads": 16,
    "frequency": 3.2
  },
  "ram": {
    "type": "DDR5",
    "totalSize": 16,
    "speed": 4800,
    "slots": [
      { "slot": 1, "capacity": 8, "speed": 4800, "type": "DDR5" },
      { "slot": 2, "capacity": 8, "speed": 4800, "type": "DDR5" }
    ]
  },
  "gpu": [],
  "storage": {
    "drives": [
      { "name": "C:", "type": "NVMe", "capacity": 512, "available": 256 }
    ],
    "totalCapacity": 512,
    "availableSpace": 256
  }
}
```

---

## Appendix C: CLI Command Reference

### Hardware Detection Commands
```powershell
# CPU info
wmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed

# RAM info (type, speed, capacity)
wmic memorychip get Speed,Capacity,MemoryType,DeviceLocator /format:csv

# GPU info (NVIDIA)
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader

# GPU info (generic)
wmic path win32_VideoController get name,AdapterRAM

# Network info
ipconfig /all
netsh interface ip show config

# MAC address
getmac /v /fo csv
```

### Network Configuration Commands
```powershell
# Set static IP
netsh interface ip set address name="Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1

# Set DNS servers
netsh interface ip set dns name="Ethernet" static 1.1.1.1
netsh interface ip add dns name="Ethernet" 8.8.8.8 index=2

# Enable Wake-on-LAN
powercfg /devicequery wake_armed
powercfg /deviceenablewake "Ethernet"

# Test connectivity
ping 192.168.1.1
nslookup google.com
```

### Docker Commands
```powershell
# Check Docker installation
docker --version
docker info

# Deploy compose stack
docker-compose -f C:\Dev\Projects\Repos\Project-Nyra\docker\orchestrator\docker-compose.yml up -d

# Check container health
docker ps --filter "health=healthy"
```

---

**END OF ARCHITECTURE DOCUMENT**
