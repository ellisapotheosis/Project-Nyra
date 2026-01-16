# Physical PC Setup GUI - Implementation Guide

**Quick Start Guide for Developers**

---

## 📋 Overview

This guide provides a quick-start implementation roadmap for transforming the bootstrap/installer into a comprehensive Physical PC Setup GUI.

**Related Documents:**
- Full Architecture: [`physical-pc-setup-gui-architecture.md`](./physical-pc-setup-gui-architecture.md)
- System Diagrams: [`diagrams/physical-pc-setup-system-diagram.mmd`](./diagrams/physical-pc-setup-system-diagram.mmd)
- Memory: `npx @claude-flow/cli@latest memory retrieve --namespace installer-architecture --key comprehensive-plan`

---

## 🎯 Quick Architecture Summary

### Target PCs
| PC | Hardware | Components |
|----|----------|------------|
| **Orchestrator** | Minisforum UH680 (Ryzen 7, 16GB) | Docker, WSL2, Gitea, All DBs, Claude |
| **Worker RTX3060** | Alienware M15R7 (RTX 3060, 32GB) | Docker, WSL2, NVIDIA, Claude |
| **Worker RTX5090** | Alienware Area-51 (RTX 5090, 32GB) | Docker, WSL2, NVIDIA, Claude |
| **Worker RTX3090Ti** | Custom PC (RTX 3090Ti, 32GB) | Docker, WSL2, NVIDIA, Claude |

### Setup Phases (6 Phases)
1. **PC Detection** - Auto-detect PC type, collect hardware info
2. **Network Config** - Static IP, Wake-on-LAN
3. **Infrastructure** - Docker, WSL2, NVIDIA drivers
4. **VPN/Tunnels** - Tailscale, Cloudflared
5. **Services** - Gitea, Databases, Claude
6. **Validation** - Health checks, config review

### Key Features
- ✅ Auto-detect PC type with hardware profiling
- ✅ Wizard-driven setup for each component
- ✅ Secure config storage in Infisical
- ✅ Validation at each step
- ✅ Complete rollback support
- ✅ Real-time progress tracking

---

## 🚀 Quick Start Implementation

### Step 1: Enhance Hardware Detection (Week 1)

**File:** `src/services/hardware/hardwareDetector.ts`

```typescript
export class HardwareDetector {
  async detectHardware(): Promise<HardwareInfo> {
    // Collect comprehensive hardware info
    return {
      pcName: os.hostname(),
      pcType: this.inferPCType(),
      network: await this.detectNetwork(), // IP, MAC, gateway, DNS
      cpu: this.detectCPU(),
      ram: await this.detectRAM(), // Type, speed, slots
      gpu: await this.detectGPU(), // Model, VRAM, driver
      storage: await this.detectStorage(),
    };
  }

  private async detectRAM(): Promise<RAMInfo> {
    // Windows: wmic memorychip get Speed,Capacity,MemoryType
    const output = await execAsync(
      'wmic memorychip get Speed,Capacity,MemoryType,DeviceLocator /format:csv'
    );
    return this.parseRAMInfo(output);
  }

  private async detectNetwork(): Promise<NetworkInfo> {
    const interfaces = os.networkInterfaces();
    const primary = this.findPrimaryInterface(interfaces);

    return {
      hostname: os.hostname(),
      ipAddress: primary.address,
      macAddress: primary.mac,
      gateway: await this.detectGateway(),
      dnsServers: await this.detectDNSServers(),
    };
  }
}
```

**Commands to implement:**
```powershell
# RAM detection
wmic memorychip get Speed,Capacity,MemoryType,DeviceLocator /format:csv

# Network info
ipconfig /all
getmac /v /fo csv

# Gateway detection
route print | findstr "0.0.0.0"

# DNS servers
nslookup google.com
```

### Step 2: Create Infisical Client (Week 1)

**File:** `src/services/config/infisicalClient.ts`

```typescript
export class InfisicalClient {
  private apiUrl = process.env.INFISICAL_API_URL;
  private token: string | null = null;

  async authenticate(email: string, password: string): Promise<boolean> {
    const response = await axios.post(`${this.apiUrl}/api/v1/auth/login`, {
      email,
      password,
    });
    this.token = response.data.token;
    return true;
  }

  async storeConfig(key: string, value: any, metadata?: object): Promise<boolean> {
    await axios.post(
      `${this.apiUrl}/api/v3/secrets/${key}`,
      {
        secretValue: JSON.stringify(value),
        secretComment: JSON.stringify(metadata),
      },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return true;
  }

  async retrieveConfig(key: string): Promise<any> {
    const response = await axios.get(`${this.apiUrl}/api/v3/secrets/${key}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return JSON.parse(response.data.secret.secretValue);
  }

  // Convenience methods
  async storeHardwareInfo(pcType: PCId, info: HardwareInfo) {
    return this.storeConfig(`hardware/${pcType}/info`, info, { pcType });
  }

  async storeNetworkConfig(pcType: PCId, config: StaticIPConfig) {
    return this.storeConfig(`network/${pcType}/static-ip`, config, { pcType });
  }
}
```

### Step 3: Update Zustand Store (Week 1)

**File:** `src/store/setupStore.ts`

```typescript
interface SetupStore {
  // PC Detection
  pcDetection: {
    detectedType: PCId | null;
    confidence: number;
    manualOverride: PCId | null;
    hardwareInfo: HardwareInfo;
    validated: boolean;
  };

  // Network Configuration
  networkConfig: {
    currentSettings: NetworkSettings;
    staticIPConfig: StaticIPConfig | null;
    wakeOnLAN: WakeOnLANConfig | null;
    validated: boolean;
  };

  // Infrastructure
  infrastructure: {
    docker: ComponentSetupState;
    wsl2: ComponentSetupState;
    nvidia: ComponentSetupState | null; // Workers only
  };

  // VPN/Tunnel
  vpnTunnel: {
    tailscale: TailscaleConfig | null;
    cloudflared: CloudflaredConfig | null;
    validated: boolean;
  };

  // Services
  services: {
    gitea: ServiceDeploymentState | null; // Orchestrator only
    databases: DatabaseDeploymentState | null; // Orchestrator only
    claude: ClaudeDeploymentState;
  };

  // Progress
  progress: {
    currentPhase: SetupPhase;
    completedPhases: Set<SetupPhase>;
    percentage: number;
  };

  // Rollback
  rollback: {
    enabled: boolean;
    checkpoints: Checkpoint[];
    currentCheckpoint: string | null;
  };

  // Actions
  actions: {
    setDetectedPC: (type: PCId, confidence: number) => void;
    updateHardwareInfo: (info: HardwareInfo) => void;
    setStaticIPConfig: (config: StaticIPConfig) => void;
    deployService: (service: string) => Promise<boolean>;
    createCheckpoint: (name: string) => Promise<string>;
    rollbackToCheckpoint: (id: string) => Promise<boolean>;
    storeConfigInInfisical: (key: string, value: any) => Promise<boolean>;
    // ... more actions
  };
}
```

### Step 4: Build Static IP Wizard (Week 2-3)

**File:** `src/components/Phase2_NetworkConfig/StaticIPWizard.tsx`

```typescript
export const StaticIPWizard: React.FC = () => {
  const [config, setConfig] = useState<StaticIPConfig>({
    ipAddress: '',
    subnetMask: '255.255.255.0',
    gateway: '',
    dnsServers: ['1.1.1.1', '8.8.8.8'],
    interfaceName: 'Ethernet',
    validated: false,
  });

  const handleApply = async () => {
    // Call IPC to configure static IP
    const success = await window.electron.invoke('network:configure-static-ip', config);

    if (success) {
      // Store in Infisical
      await window.electron.invoke('infisical:store',
        `network/${pcType}/static-ip`,
        config
      );

      // Update store
      useInstallStore.getState().actions.setStaticIPConfig(config);
    }
  };

  return (
    <div className="space-y-4">
      <InputField
        label="IP Address"
        value={config.ipAddress}
        onChange={(v) => setConfig({ ...config, ipAddress: v })}
        pattern={IP_PATTERN}
      />
      <InputField
        label="Subnet Mask"
        value={config.subnetMask}
        onChange={(v) => setConfig({ ...config, subnetMask: v })}
      />
      <InputField
        label="Gateway"
        value={config.gateway}
        onChange={(v) => setConfig({ ...config, gateway: v })}
      />
      <DNSServersInput
        servers={config.dnsServers}
        onChange={(s) => setConfig({ ...config, dnsServers: s })}
      />
      <Button onClick={handleApply}>Apply Configuration</Button>
    </div>
  );
};
```

**Backend Service:** `src/services/network/staticIPConfigurator.ts`

```typescript
export class StaticIPConfigurator {
  async configureStaticIP(config: StaticIPConfig): Promise<boolean> {
    const commands = [
      `netsh interface ip set address name="${config.interfaceName}" static ${config.ipAddress} ${config.subnetMask} ${config.gateway}`,
      `netsh interface ip set dns name="${config.interfaceName}" static ${config.dnsServers[0]}`,
      ...config.dnsServers.slice(1).map((dns, i) =>
        `netsh interface ip add dns name="${config.interfaceName}" ${dns} index=${i + 2}`
      ),
    ];

    try {
      for (const cmd of commands) {
        await this.execAsAdmin(cmd);
      }

      // Validate
      const valid = await this.validateStaticIP(config);
      return valid.success;
    } catch (error) {
      console.error('Static IP configuration failed:', error);
      return false;
    }
  }

  async validateStaticIP(config: StaticIPConfig): Promise<{ success: boolean; message: string }> {
    const currentIP = await this.getCurrentIP(config.interfaceName);
    if (currentIP !== config.ipAddress) {
      return { success: false, message: `IP mismatch` };
    }

    const gatewayReachable = await this.pingHost(config.gateway);
    if (!gatewayReachable) {
      return { success: false, message: `Gateway unreachable` };
    }

    const dnsWorking = await this.testDNS();
    if (!dnsWorking) {
      return { success: false, message: `DNS resolution failed` };
    }

    return { success: true, message: 'Static IP configured successfully' };
  }

  async rollbackToDHCP(interfaceName: string): Promise<boolean> {
    const commands = [
      `netsh interface ip set address name="${interfaceName}" dhcp`,
      `netsh interface ip set dns name="${interfaceName}" dhcp`,
    ];

    try {
      for (const cmd of commands) {
        await this.execAsAdmin(cmd);
      }
      return true;
    } catch {
      return false;
    }
  }
}
```

### Step 5: Build Docker Setup Wizard (Week 3-4)

**File:** `src/components/Phase3_Infrastructure/DockerSetupScreen.tsx`

```typescript
export const DockerSetupScreen: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'installing' | 'configuring' | 'complete'>('checking');

  useEffect(() => {
    checkDockerInstallation();
  }, []);

  const checkDockerInstallation = async () => {
    const installed = await window.electron.invoke('docker:check-installation');
    if (installed) {
      setStatus('complete');
    } else {
      setStatus('installing');
      await installDocker();
    }
  };

  const installDocker = async () => {
    const success = await window.electron.invoke('docker:install');
    if (success) {
      setStatus('configuring');
      await configureDocker();
    }
  };

  const configureDocker = async () => {
    // Configure Docker settings
    await window.electron.invoke('docker:configure', {
      memoryLimit: '8GB',
      cpuLimit: 4,
      diskSize: '50GB',
    });
    setStatus('complete');
  };

  return (
    <WizardScreen
      title="Docker Desktop Setup"
      description="Installing and configuring Docker Desktop"
      canProceed={status === 'complete'}
    >
      <InstallationSteps
        steps={[
          { name: 'Check Installation', status: getStepStatus(0) },
          { name: 'Install Docker Desktop', status: getStepStatus(1) },
          { name: 'Configure Resources', status: getStepStatus(2) },
          { name: 'Validate', status: getStepStatus(3) },
        ]}
      />
      {status === 'complete' && (
        <ValidationPanel>
          <DockerInfo />
          <ContainerList />
        </ValidationPanel>
      )}
    </WizardScreen>
  );
};
```

**Backend Service:** `src/services/infrastructure/dockerInstaller.ts`

```typescript
export class DockerInstaller {
  async checkInstallation(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('docker --version');
      return stdout.includes('Docker version');
    } catch {
      return false;
    }
  }

  async install(): Promise<boolean> {
    const installerUrl = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe';
    const installerPath = path.join(os.tmpdir(), 'DockerDesktopInstaller.exe');

    // Download installer
    await this.downloadFile(installerUrl, installerPath);

    // Run installer with silent flags
    await this.execAsAdmin(
      `"${installerPath}" install --quiet --accept-license`
    );

    // Wait for Docker to start
    await this.waitForDockerReady();

    return true;
  }

  async configure(config: { memoryLimit: string; cpuLimit: number; diskSize: string }): Promise<boolean> {
    const dockerConfigPath = path.join(
      process.env.APPDATA!,
      'Docker',
      'settings.json'
    );

    const settings = {
      memoryMiB: this.parseMemory(config.memoryLimit),
      cpus: config.cpuLimit,
      diskSizeMiB: this.parseDiskSize(config.diskSize),
    };

    await fs.writeFile(dockerConfigPath, JSON.stringify(settings, null, 2));

    // Restart Docker to apply settings
    await this.execAsAdmin('net stop com.docker.service');
    await this.execAsAdmin('net start com.docker.service');

    return true;
  }

  async validate(): Promise<{ valid: boolean; message: string }> {
    try {
      // Check Docker daemon
      const { stdout } = await execAsync('docker info');
      if (!stdout.includes('Server Version')) {
        return { valid: false, message: 'Docker daemon not responding' };
      }

      // Check resources
      const info = this.parseDockerInfo(stdout);
      if (info.memory < 4096) {
        return { valid: false, message: 'Insufficient memory allocated' };
      }

      return { valid: true, message: 'Docker validated successfully' };
    } catch (error) {
      return { valid: false, message: 'Docker validation failed' };
    }
  }
}
```

### Step 6: Build Service Deployment (Week 5-6)

**File:** `src/services/deployment/databaseDeployer.ts`

```typescript
export class DatabaseDeployer {
  async deployPostgreSQL(): Promise<ServiceDeploymentResult> {
    const password = this.generatePassword();
    const composePath = path.join(
      process.cwd(),
      'docker/orchestrator/docker-compose.yml'
    );

    // Deploy using docker-compose
    await execAsync(`docker-compose -f "${composePath}" up -d postgresql`, {
      env: {
        POSTGRES_PASSWORD: password,
      },
    });

    // Wait for healthy status
    await this.waitForHealthy('postgresql', 60000);

    // Store credentials in Infisical
    const infisical = InfisicalClient.getInstance();
    await infisical.storeServiceCredentials('postgresql', {
      username: 'postgres',
      password,
      host: 'localhost',
      port: '5432',
    });

    return {
      success: true,
      service: 'postgresql',
      url: 'postgresql://localhost:5432',
      credentials: { username: 'postgres', password },
    };
  }

  async deployAllDatabases(): Promise<ServiceDeploymentResult[]> {
    const results = await Promise.all([
      this.deployPostgreSQL(),
      this.deployRedis(),
      this.deployTimescaleDB(),
      this.deployQdrant(),
    ]);

    return results;
  }

  private async waitForHealthy(service: string, timeout: number): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const { stdout } = await execAsync(`docker inspect --format='{{.State.Health.Status}}' ${service}`);
      if (stdout.trim() === 'healthy') {
        return true;
      }
      await this.sleep(1000);
    }

    throw new Error(`Service ${service} did not become healthy within ${timeout}ms`);
  }
}
```

### Step 7: Build Checkpoint & Rollback (Week 2)

**File:** `src/services/rollback/checkpointManager.ts`

```typescript
export class CheckpointManager {
  private checkpointsDir = path.join(process.env.APPDATA!, 'NyraSetup', 'checkpoints');

  async createCheckpoint(name: string, phase: SetupPhase): Promise<string> {
    const checkpointId = `checkpoint-${Date.now()}`;
    const checkpointPath = path.join(this.checkpointsDir, checkpointId);

    await fs.mkdir(checkpointPath, { recursive: true });

    // Snapshot state
    const state = this.snapshotState();

    // Backup files
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

    await fs.writeFile(
      path.join(checkpointPath, 'checkpoint.json'),
      JSON.stringify(checkpoint, null, 2)
    );

    return checkpointId;
  }

  async rollbackToCheckpoint(checkpointId: string): Promise<boolean> {
    const checkpointPath = path.join(this.checkpointsDir, checkpointId);
    const checkpoint: Checkpoint = JSON.parse(
      await fs.readFile(path.join(checkpointPath, 'checkpoint.json'), 'utf-8')
    );

    // Restore files
    await this.restoreFiles(checkpoint.files, checkpointPath);

    // Restore state
    this.restoreState(checkpoint.state);

    return true;
  }

  private async backupFiles(checkpointPath: string): Promise<BackupFile[]> {
    const filesToBackup = [
      'C:\\Windows\\System32\\drivers\\etc\\hosts',
      path.join(process.env.APPDATA!, '.docker', 'config.json'),
      path.join(process.env.USERPROFILE!, '.claude', 'settings.json'),
    ];

    const backupFiles: BackupFile[] = [];

    for (const file of filesToBackup) {
      if (await this.fileExists(file)) {
        const backupFile = path.join(checkpointPath, 'files', path.basename(file));
        await fs.mkdir(path.dirname(backupFile), { recursive: true });
        await fs.copyFile(file, backupFile);

        backupFiles.push({
          originalPath: file,
          backupPath: backupFile,
          checksum: await this.calculateChecksum(file),
        });
      }
    }

    return backupFiles;
  }
}
```

---

## 📁 File Structure

### New Files to Create

```
bootstrap/installer/
├── src/
│   ├── services/
│   │   ├── hardware/
│   │   │   ├── hardwareDetector.ts          # Enhanced hardware detection
│   │   │   ├── networkInfoCollector.ts      # Network info collection
│   │   │   ├── gpuDetector.ts               # GPU-specific detection
│   │   │   └── wakeOnLANConfigurator.ts     # WoL setup
│   │   │
│   │   ├── network/
│   │   │   ├── staticIPConfigurator.ts      # Static IP setup
│   │   │   ├── networkTester.ts             # Connectivity tests
│   │   │   └── dnsConfigurator.ts           # DNS configuration
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── dockerInstaller.ts           # Docker installation
│   │   │   ├── wsl2Installer.ts             # WSL2 setup
│   │   │   ├── nvidiaInstaller.ts           # NVIDIA driver installation
│   │   │   └── systemValidator.ts           # System validation
│   │   │
│   │   ├── vpn/
│   │   │   ├── tailscaleManager.ts          # Tailscale setup
│   │   │   ├── cloudflaredManager.ts        # Cloudflared tunnels
│   │   │   └── vpnTester.ts                 # VPN testing
│   │   │
│   │   ├── deployment/
│   │   │   ├── giteaDeployer.ts             # Gitea deployment
│   │   │   ├── databaseDeployer.ts          # Database deployment
│   │   │   ├── claudeDeployer.ts            # Claude setup
│   │   │   └── serviceHealthChecker.ts      # Health checks
│   │   │
│   │   ├── config/
│   │   │   ├── infisicalClient.ts           # Infisical integration
│   │   │   ├── configManager.ts             # Config CRUD
│   │   │   └── secretsManager.ts            # Secrets management
│   │   │
│   │   └── rollback/
│   │       ├── checkpointManager.ts         # Checkpoint creation/restoration
│   │       ├── fileBackupManager.ts         # File backup/restore
│   │       └── stateRecovery.ts             # State recovery
│   │
│   ├── components/
│   │   ├── Phase1_PCDetection/
│   │   │   ├── PCDetectionScreen.tsx
│   │   │   ├── HardwareCollectionScreen.tsx
│   │   │   ├── HardwareInfoDisplay.tsx
│   │   │   └── CompatibilityValidator.tsx
│   │   │
│   │   ├── Phase2_NetworkConfig/
│   │   │   ├── NetworkConfigScreen.tsx
│   │   │   ├── StaticIPWizard.tsx
│   │   │   ├── WakeOnLANSetup.tsx
│   │   │   └── NetworkTestPanel.tsx
│   │   │
│   │   ├── Phase3_Infrastructure/
│   │   │   ├── DockerSetupScreen.tsx
│   │   │   ├── WSL2SetupScreen.tsx
│   │   │   └── NVIDIASetupScreen.tsx
│   │   │
│   │   ├── Phase4_VPNTunnel/
│   │   │   ├── TailscaleSetupScreen.tsx
│   │   │   └── CloudflaredSetupScreen.tsx
│   │   │
│   │   ├── Phase5_ServiceDeployment/
│   │   │   ├── GiteaSetupScreen.tsx
│   │   │   ├── DatabaseSetupScreen.tsx
│   │   │   └── ClaudeSetupScreen.tsx
│   │   │
│   │   └── Phase6_Validation/
│   │       ├── HealthCheckScreen.tsx
│   │       ├── ConfigReviewScreen.tsx
│   │       └── CompletionScreen.tsx
│   │
│   └── types/
│       ├── setup.ts                         # Setup types
│       └── hardware.ts                      # Hardware types
```

---

## 🔗 Integration Points

### Docker Compose Files (Referenced, NOT copied)
```
/docker/orchestrator/docker-compose.yml    # Gitea, DBs for orchestrator
/docker/client/docker-compose.yml          # Worker services
```

### Service Configs (Referenced, NOT copied)
```
/configs/gitea/                            # Gitea configuration
/configs/postgresql/                       # PostgreSQL configuration
/configs/claude/                           # Claude configuration
```

### Scripts (Called, NOT bundled)
```
/bootstrap/windows/orchestrator/           # Windows scripts for orchestrator
/bootstrap/windows/workers/                # Windows scripts for workers
/bootstrap/wsl/orchestrator/               # WSL scripts for orchestrator
/bootstrap/wsl/workers/                    # WSL scripts for workers
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Hardware detection logic
- [ ] Network configuration validation
- [ ] Static IP parsing
- [ ] Checkpoint creation/restoration
- [ ] Infisical client operations

### Integration Tests
- [ ] Complete PC detection flow
- [ ] Static IP configuration and rollback
- [ ] Docker installation and validation
- [ ] Database deployment
- [ ] Infisical integration end-to-end

### E2E Tests (Manual)
- [ ] Test on Orchestrator (Minisforum UH680)
- [ ] Test on Worker RTX3060 (Alienware M15R7)
- [ ] Test on Worker RTX5090 (Alienware Area-51)
- [ ] Test on Worker RTX3090Ti (Custom PC)
- [ ] Test rollback at each phase
- [ ] Test error recovery

---

## 📊 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **PC Detection Accuracy** | >90% confidence | Automated scoring on known hardware |
| **Setup Completion Time** | <30 min | Timed end-to-end run (excluding downloads) |
| **Rollback Success Rate** | 100% | Automated rollback tests at each phase |
| **Credential Security** | Zero leaks | Audit: no plain-text credentials in logs/files |
| **Hardware Coverage** | 100% | All 4 PC types tested successfully |
| **Validation Pass Rate** | >95% | Automated validation tests |

---

## 🚨 Common Pitfalls to Avoid

1. **DO NOT** store docker-compose files in bootstrap/
   - ✅ Reference from `/docker/` directory
   - ❌ Copy to bootstrap/installer/

2. **DO NOT** store plain-text credentials
   - ✅ Store in Infisical
   - ❌ Store in local files or environment variables

3. **DO NOT** skip validation steps
   - ✅ Validate at each phase
   - ❌ Assume success without checking

4. **DO NOT** forget rollback checkpoints
   - ✅ Create checkpoint before each phase
   - ❌ Skip checkpoints to save time

5. **DO NOT** use relative paths
   - ✅ Use absolute paths everywhere
   - ❌ Use relative paths in file operations

---

## 📚 Reference Commands

### Hardware Detection
```powershell
# CPU info
wmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed

# RAM info (type, speed, capacity)
wmic memorychip get Speed,Capacity,MemoryType,DeviceLocator /format:csv

# GPU info (NVIDIA)
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader

# Network info
ipconfig /all
getmac /v /fo csv
```

### Network Configuration
```powershell
# Set static IP
netsh interface ip set address name="Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1

# Set DNS
netsh interface ip set dns name="Ethernet" static 1.1.1.1
netsh interface ip add dns name="Ethernet" 8.8.8.8 index=2

# Rollback to DHCP
netsh interface ip set address name="Ethernet" dhcp
netsh interface ip set dns name="Ethernet" dhcp
```

### Docker Operations
```powershell
# Check installation
docker --version
docker info

# Deploy compose
docker-compose -f C:\Dev\Projects\Repos\Project-Nyra\docker\orchestrator\docker-compose.yml up -d

# Check health
docker ps --filter "health=healthy"
```

---

## 🔄 Next Steps

1. **Week 1-2**: Foundation
   - Enhance HardwareDetector
   - Create InfisicalClient
   - Update Zustand store
   - Create CheckpointManager

2. **Week 3**: Network Configuration
   - Build StaticIPConfigurator
   - Create NetworkConfigScreen
   - Build StaticIPWizard
   - Implement WakeOnLANSetup

3. **Week 4-5**: Infrastructure Wizards
   - Create DockerInstaller
   - Build DockerSetupScreen
   - Create WSL2Installer
   - Build NVIDIASetupScreen

4. **Week 6**: VPN/Tunnel Setup
   - Create TailscaleManager
   - Build TailscaleSetupScreen
   - Create CloudflaredManager
   - Build CloudflaredSetupScreen

5. **Week 7-8**: Service Deployment
   - Create GiteaDeployer
   - Create DatabaseDeployer
   - Build service setup screens
   - Implement health checks

6. **Week 9-10**: Validation & Polish
   - Implement ValidationEngine
   - Build HealthCheckScreen
   - End-to-end testing
   - UI/UX polish

---

## 🎓 Learning Resources

- **Docker API**: https://docs.docker.com/engine/api/
- **Electron IPC**: https://www.electronjs.org/docs/latest/api/ipc-main
- **Infisical API**: https://infisical.com/docs/api-reference/
- **Tailscale API**: https://tailscale.com/kb/1101/api/
- **Cloudflare Tunnels**: https://developers.cloudflare.com/cloudflare-one/
- **Windows netsh**: https://docs.microsoft.com/en-us/windows-server/networking/technologies/netsh/

---

**For detailed architecture and design decisions, see:**
- [`physical-pc-setup-gui-architecture.md`](./physical-pc-setup-gui-architecture.md) (Full 180+ section architecture)
- [`diagrams/physical-pc-setup-system-diagram.mmd`](./diagrams/physical-pc-setup-system-diagram.mmd) (Visual diagrams)

**Stored in Claude Flow Memory:**
```bash
npx @claude-flow/cli@latest memory retrieve --namespace installer-architecture --key comprehensive-plan
```
