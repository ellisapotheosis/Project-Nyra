# Project Nyra - Unified Bootstrap Architecture

**Version**: 1.0.0
**Date**: 2026-01-15
**Status**: Design Phase
**Author**: System Architecture Designer

---

## Executive Summary

This document defines a unified, Docker-first bootstrap architecture for Project Nyra's 4-PC distributed Windows 11 cluster. The architecture centralizes all bootstrap materials in a single `bootstrap/` directory, containerizes all services (archon-os, Archon OS, MCP servers), provides Windows command shims, and includes a React-based GUI installer for simplified deployment.

### Key Design Principles

1. **Docker-First**: All services run in containers, including MCP servers
2. **Unified Structure**: Single `bootstrap/` directory containing all deployment materials
3. **PC-Aware**: Per-PC configurations for orchestrator and 3 GPU workers
4. **Shim Layer**: Windows `.cmd` files execute Docker containers transparently
5. **GUI-Driven**: React installer handles all deployment complexity
6. **Infisical-Integrated**: Secrets management across all environments

---

## 1. Bootstrap Directory Architecture

### 1.1 Unified Directory Structure

```
bootstrap/
├── installer/                      # React GUI Installer (Vite + TypeScript + Zustand)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PCSelector.tsx              # PC selection (orchestrator, worker1-3)
│   │   │   ├── EnvironmentSelector.tsx     # WSL/Windows mode selection
│   │   │   ├── ComponentSelector.tsx       # Service/component selection
│   │   │   ├── ConfigurationPanel.tsx      # Per-component configuration
│   │   │   ├── InstallationProgress.tsx    # Real-time installation tracking
│   │   │   └── ValidationResults.tsx       # Post-install validation
│   │   ├── services/
│   │   │   ├── dockerManager.ts            # Docker daemon control
│   │   │   ├── shimGenerator.ts            # Generate Windows shims
│   │   │   ├── configDeployer.ts           # Deploy per-PC configs
│   │   │   ├── mcpOrchestrator.ts          # MCP server lifecycle
│   │   │   ├── infisicalIntegrator.ts      # Secrets management
│   │   │   └── validator.ts                # Pre/post-install validation
│   │   ├── store/
│   │   │   └── installStore.ts             # Zustand state management
│   │   └── data/
│   │       ├── manifest.json               # Complete deployment manifest
│   │       └── templates/                  # Config templates
│   ├── electron/                           # Electron wrapper (optional)
│   │   └── main.ts
│   └── package.json
│
├── docker/                         # Docker Configurations
│   ├── compose/
│   │   ├── docker-compose.base.yml         # Base services (Infisical, MetaMCP)
│   │   ├── docker-compose.mcp.yml          # All MCP servers
│   │   ├── docker-compose.archon-os.yml  # Claude Flow V3
│   │   ├── docker-compose.archon.yml       # Archon OS
│   │   ├── docker-compose.orchestrator.yml # Orchestrator + DBs
│   │   ├── docker-compose.worker.yml       # GPU worker template
│   │   └── docker-compose.full.yml         # Complete stack (imports all)
│   ├── images/
│   │   ├── archon-os/
│   │   │   ├── Dockerfile.dev              # Dev mode (hot-reload)
│   │   │   ├── Dockerfile.prod             # Production mode
│   │   │   └── entrypoint.sh
│   │   ├── archon-os/
│   │   │   ├── Dockerfile
│   │   │   └── entrypoint.sh
│   │   ├── mcp-servers/
│   │   │   ├── Dockerfile.infisical
│   │   │   ├── Dockerfile.letta
│   │   │   ├── Dockerfile.mem0
│   │   │   ├── Dockerfile.ruvector
│   │   │   ├── Dockerfile.flow-nexus
│   │   │   └── Dockerfile.metamcp-gateway
│   │   └── nyra/
│   │       ├── Dockerfile.orchestrator
│   │       └── Dockerfile.worker
│   └── scripts/
│       ├── build-all.sh                    # Build all images
│       ├── start-pc.sh                     # Start PC-specific stack
│       └── health-check.sh                 # Container health checks
│
├── shims/                          # Windows Command Shims
│   ├── templates/
│   │   ├── archon-os.cmd.template        # Template for shim generation
│   │   ├── archon.cmd.template
│   │   └── mcp-tool.cmd.template
│   ├── generated/                          # Generated shims (per-PC)
│   │   ├── orchestrator/
│   │   ├── worker-1/
│   │   ├── worker-2/
│   │   └── worker-3/
│   └── lib/
│       ├── docker-exec.ps1                 # PowerShell Docker exec helper
│       └── infisical-inject.ps1            # Secret injection helper
│
├── configs/                        # PC-Specific Configurations
│   ├── orchestrator/
│   │   ├── .env                            # Orchestrator environment
│   │   ├── archon-os.config.json
│   │   ├── archon.config.json
│   │   ├── infisical.json
│   │   └── docker-compose.override.yml     # PC-specific overrides
│   ├── worker-1/                           # RTX 3060 (mobile)
│   │   ├── .env
│   │   ├── archon-os.config.json
│   │   ├── gpu.config.json                 # GPU-specific config
│   │   └── docker-compose.override.yml
│   ├── worker-2/                           # RTX 5090 (mobile)
│   │   ├── .env
│   │   ├── archon-os.config.json
│   │   ├── gpu.config.json
│   │   └── docker-compose.override.yml
│   ├── worker-3/                           # RTX 3090Ti (always-on)
│   │   ├── .env
│   │   ├── archon-os.config.json
│   │   ├── gpu.config.json
│   │   └── docker-compose.override.yml
│   └── templates/                          # Config templates for generation
│       ├── .env.template
│       ├── archon-os.config.template.json
│       └── archon.config.template.json
│
├── scripts/                        # Platform-Specific Bootstrap Scripts
│   ├── windows/
│   │   ├── 01-prerequisites.ps1            # Install Docker, WSL, etc.
│   │   ├── 02-docker-setup.ps1             # Docker daemon config
│   │   ├── 03-wsl-setup.ps1                # WSL2 setup (orchestrator only)
│   │   ├── 04-nvidia-setup.ps1             # NVIDIA Container Toolkit (workers)
│   │   ├── 05-build-images.ps1             # Build Docker images
│   │   ├── 06-deploy-configs.ps1           # Deploy PC-specific configs
│   │   ├── 07-generate-shims.ps1           # Generate command shims
│   │   ├── 08-start-services.ps1           # Start Docker Compose
│   │   └── 09-validate.ps1                 # Post-install validation
│   ├── wsl/
│   │   ├── 01-system-setup.sh              # Ubuntu dependencies
│   │   ├── 02-docker-setup.sh              # Docker in WSL
│   │   └── 03-network-bridge.sh            # Windows-WSL networking
│   └── common/
│       ├── health-checks.ps1
│       └── rollback.ps1
│
├── manifests/                      # Deployment Manifests
│   ├── full-manifest.json                  # Complete component catalog
│   ├── orchestrator-manifest.json
│   ├── worker-manifest.json
│   └── pc-topology.json                    # 4-PC cluster topology
│
├── templates/                      # File Templates
│   ├── docker/
│   │   └── .env.template
│   ├── configs/
│   │   ├── archon-os.template.json
│   │   ├── archon.template.json
│   │   └── mcp-server.template.json
│   └── shims/
│       └── command.cmd.template
│
└── docs/
    ├── README.md                           # Quick start guide
    ├── ARCHITECTURE.md                     # This file
    ├── DOCKER-ARCHITECTURE.md              # Docker-specific details
    ├── SHIM-DESIGN.md                      # Shim implementation
    ├── GUI-INSTALLER.md                    # Installer user guide
    └── TROUBLESHOOTING.md                  # Common issues
```

---

## 2. Docker-First Architecture

### 2.1 Container Strategy

All services run as Docker containers:

```yaml
# docker-compose.full.yml (unified stack)
version: '3.8'

services:
  # ============================================================================
  # CORE INFRASTRUCTURE
  # ============================================================================

  infisical-mcp:
    build: ./docker/images/mcp-servers/Dockerfile.infisical
    container_name: nyra-infisical-mcp
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - INFISICAL_TOKEN=${INFISICAL_TOKEN}
    ports:
      - "8006:8006"
    volumes:
      - infisical_secrets:/app/secrets
    networks:
      - nyra-network
    restart: unless-stopped

  metamcp-gateway:
    build: ./docker/images/mcp-servers/Dockerfile.metamcp-gateway
    container_name: nyra-metamcp-gateway
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
      - INFISICAL_MCP_ENDPOINT=http://infisical-mcp:8006
      - CLAUDE_FLOW_MCP_ENDPOINT=http://archon-os-mcp:8003
      - ARCHON_MCP_ENDPOINT=http://archon-mcp:8004
    ports:
      - "8005:8005"
    depends_on:
      - infisical-mcp
    volumes:
      - infisical_secrets:/app/secrets:ro
    networks:
      - nyra-network

  # ============================================================================
  # CLAUDE FLOW V3
  # ============================================================================

  archon-os-mcp:
    build:
      context: ./docker/images/archon-os
      dockerfile: Dockerfile.${CLAUDE_FLOW_MODE:-prod}  # dev or prod
    container_name: nyra-archon-os-mcp
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
      - CLAUDE_FLOW_MODE=v3
      - CLAUDE_FLOW_TOPOLOGY=hierarchical-mesh
      - CLAUDE_FLOW_MAX_AGENTS=15
      - CLAUDE_FLOW_MEMORY_BACKEND=hybrid
      - CLAUDE_FLOW_HOOKS_ENABLED=true
    ports:
      - "8003:8003"
    volumes:
      - ./bootstrap/configs/${NYRA_PC_ID}:/app/config:ro
      - claude_flow_data:/app/data
      - infisical_secrets:/app/secrets:ro
    depends_on:
      - infisical-mcp
    networks:
      - nyra-network
    command: npx @archon-os/cli@latest daemon start --mcp-mode

  # ============================================================================
  # ARCHON OS
  # ============================================================================

  archon-mcp:
    build: ./docker/images/archon-os/Dockerfile
    container_name: nyra-archon-mcp
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
      - ARCHON_MODE=distributed
      - ARCHON_ROLE=${ARCHON_ROLE}  # master, worker
    ports:
      - "8004:8004"
    volumes:
      - ./bootstrap/configs/${NYRA_PC_ID}:/app/config:ro
      - archon_data:/app/data
      - infisical_secrets:/app/secrets:ro
    depends_on:
      - infisical-mcp
    networks:
      - nyra-network

  # ============================================================================
  # ADDITIONAL MCP SERVERS
  # ============================================================================

  letta-mcp:
    build: ./docker/images/mcp-servers/Dockerfile.letta
    container_name: nyra-letta-mcp
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
    ports:
      - "8007:8007"
    volumes:
      - letta_data:/app/data
      - infisical_secrets:/app/secrets:ro
    networks:
      - nyra-network

  mem0-mcp:
    build: ./docker/images/mcp-servers/Dockerfile.mem0
    container_name: nyra-mem0-mcp
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
    ports:
      - "8008:8008"
    volumes:
      - mem0_data:/app/data
      - infisical_secrets:/app/secrets:ro
    networks:
      - nyra-network

  ruvector-mcp:
    build: ./docker/images/mcp-servers/Dockerfile.ruvector
    container_name: nyra-ruvector-mcp
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
    ports:
      - "8009:8009"
    volumes:
      - ruvector_data:/app/data
      - infisical_secrets:/app/secrets:ro
    networks:
      - nyra-network

  flow-nexus-mcp:
    build: ./docker/images/mcp-servers/Dockerfile.flow-nexus
    container_name: nyra-flow-nexus-mcp
    environment:
      - NYRA_PC_ID=${NYRA_PC_ID}
    ports:
      - "8010:8010"
    volumes:
      - flow_nexus_data:/app/data
      - infisical_secrets:/app/secrets:ro
    networks:
      - nyra-network

  # ============================================================================
  # ORCHESTRATOR SERVICES (profile: orchestrator)
  # ============================================================================

  nyra-orchestrator:
    profiles: ["orchestrator"]
    build: ./docker/images/nyra/Dockerfile.orchestrator
    container_name: nyra-orchestrator
    environment:
      - NYRA_MODE=orchestrator
      - NYRA_PC_ID=orchestrator
      - POSTGRES_URL=${POSTGRES_URL}
      - FALKORDB_URL=${FALKORDB_URL}
      - CHROMADB_URL=${CHROMADB_URL}
      - METAMCP_GATEWAY_URL=http://metamcp-gateway:8005
    ports:
      - "8000:8000"  # API
      - "8080:8080"  # Management UI
    volumes:
      - ./src:/app/src:cached
      - ./bootstrap/configs/orchestrator:/app/config:ro
      - infisical_secrets:/app/secrets:ro
    depends_on:
      - postgres
      - falkordb
      - chromadb
      - metamcp-gateway
    networks:
      - nyra-network

  postgres:
    profiles: ["orchestrator"]
    image: postgres:15-alpine
    container_name: nyra-postgres
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nyra-network

  falkordb:
    profiles: ["orchestrator"]
    image: falkordb/falkordb:latest
    container_name: nyra-falkordb
    ports:
      - "6379:6379"
    volumes:
      - falkordb_data:/data
    networks:
      - nyra-network

  chromadb:
    profiles: ["orchestrator"]
    image: chromadb/chroma:latest
    container_name: nyra-chromadb
    ports:
      - "8001:8000"
    volumes:
      - chromadb_data:/chroma/chroma
    networks:
      - nyra-network

  # ============================================================================
  # WORKER SERVICES (profile: worker-1, worker-2, worker-3)
  # ============================================================================

  nyra-worker:
    profiles: ["worker"]
    build: ./docker/images/nyra/Dockerfile.worker
    container_name: nyra-worker-${NYRA_WORKER_ID}
    environment:
      - NYRA_MODE=worker
      - NYRA_PC_ID=${NYRA_PC_ID}
      - NYRA_WORKER_ID=${NYRA_WORKER_ID}
      - NYRA_GPU_TYPE=${NYRA_GPU_TYPE}
      - ORCHESTRATOR_URL=${ORCHESTRATOR_URL}
      - METAMCP_GATEWAY_URL=http://metamcp-gateway:8005
    ports:
      - "${WORKER_API_PORT}:8000"  # API
      - "${WORKER_METRICS_PORT}:9000"  # GPU metrics
    volumes:
      - ./src:/app/src:cached
      - ./bootstrap/configs/${NYRA_PC_ID}:/app/config:ro
      - infisical_secrets:/app/secrets:ro
      - /dev:/dev
    devices:
      - "/dev/nvidia0:/dev/nvidia0"
      - "/dev/nvidiactl:/dev/nvidiactl"
      - "/dev/nvidia-uvm:/dev/nvidia-uvm"
    runtime: nvidia
    depends_on:
      - metamcp-gateway
    networks:
      - nyra-network

volumes:
  infisical_secrets:
  claude_flow_data:
  archon_data:
  letta_data:
  mem0_data:
  ruvector_data:
  flow_nexus_data:
  postgres_data:
  falkordb_data:
  chromadb_data:

networks:
  nyra-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.21.0.0/16
```

### 2.2 Per-PC Docker Compose Overrides

Each PC has a `docker-compose.override.yml` that customizes the stack:

**Orchestrator (`bootstrap/configs/orchestrator/docker-compose.override.yml`)**:
```yaml
version: '3.8'

services:
  nyra-orchestrator:
    profiles: ["orchestrator"]

  postgres:
    profiles: ["orchestrator"]

  falkordb:
    profiles: ["orchestrator"]

  chromadb:
    profiles: ["orchestrator"]
```

**Worker-1 (`bootstrap/configs/worker-1/docker-compose.override.yml`)**:
```yaml
version: '3.8'

services:
  nyra-worker:
    profiles: ["worker"]
    environment:
      - NYRA_WORKER_ID=1
      - NYRA_GPU_TYPE=rtx_3060
      - WORKER_API_PORT=8001
      - WORKER_METRICS_PORT=9001
```

---

## 3. Shim Design

### 3.1 Windows Command Shims

Windows `.cmd` shims provide transparent Docker execution:

**Template (`bootstrap/shims/templates/archon-os.cmd.template`)**:
```batch
@echo off
REM Claude Flow Docker Shim
REM Auto-generated for PC: {{NYRA_PC_ID}}
REM Generated: {{TIMESTAMP}}

setlocal enabledelayedexpansion

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)

REM Check if Infisical secrets are available
if not exist "\\wsl$\docker-desktop\mnt\host\wsl\docker-desktop-bind-mounts\Ubuntu\{{PROJECT_ROOT}}\secrets" (
    echo [WARN] Infisical secrets volume not mounted. Some features may not work.
)

REM Execute archon-os command inside container
docker exec -it nyra-archon-os-mcp npx @archon-os/cli@latest %*

endlocal
```

**Generated Shim (`bootstrap/shims/generated/orchestrator/archon-os.cmd`)**:
```batch
@echo off
REM Claude Flow Docker Shim
REM Auto-generated for PC: orchestrator
REM Generated: 2026-01-15T10:30:00Z

setlocal enabledelayedexpansion

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)

REM Execute archon-os command inside container
docker exec -it nyra-archon-os-mcp npx @archon-os/cli@latest %*

endlocal
```

### 3.2 Shim Generation Process

The GUI installer generates shims automatically:

**TypeScript Shim Generator (`bootstrap/installer/src/services/shimGenerator.ts`)**:
```typescript
import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';

export interface ShimConfig {
  commandName: string;
  containerName: string;
  execCommand: string;
  pcId: string;
  installPath: string;
}

export class ShimGenerator {
  private templatesDir: string;
  private outputDir: string;

  constructor(templatesDir: string, outputDir: string) {
    this.templatesDir = templatesDir;
    this.outputDir = outputDir;
  }

  async generateShim(config: ShimConfig): Promise<string> {
    // Read template
    const templatePath = path.join(
      this.templatesDir,
      `${config.commandName}.cmd.template`
    );
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Compile template with Handlebars
    const template = Handlebars.compile(templateContent);
    const shimContent = template({
      NYRA_PC_ID: config.pcId,
      CONTAINER_NAME: config.containerName,
      EXEC_COMMAND: config.execCommand,
      TIMESTAMP: new Date().toISOString(),
      PROJECT_ROOT: process.env.PROJECT_ROOT || 'C:\\Dev\\Projects\\Repos\\Project-Nyra',
    });

    // Write shim to output directory
    const shimPath = path.join(
      this.outputDir,
      config.pcId,
      `${config.commandName}.cmd`
    );
    await fs.ensureDir(path.dirname(shimPath));
    await fs.writeFile(shimPath, shimContent);

    // Add to PATH (Windows registry)
    await this.addToPath(path.dirname(shimPath));

    return shimPath;
  }

  async generateAllShims(pcId: string): Promise<string[]> {
    const shims: ShimConfig[] = [
      {
        commandName: 'archon-os',
        containerName: 'nyra-archon-os-mcp',
        execCommand: 'npx @archon-os/cli@latest',
        pcId,
        installPath: path.join(this.outputDir, pcId),
      },
      {
        commandName: 'archon',
        containerName: 'nyra-archon-mcp',
        execCommand: 'archon',
        pcId,
        installPath: path.join(this.outputDir, pcId),
      },
      {
        commandName: 'infisical',
        containerName: 'nyra-infisical-mcp',
        execCommand: 'infisical',
        pcId,
        installPath: path.join(this.outputDir, pcId),
      },
    ];

    const generatedPaths: string[] = [];
    for (const shim of shims) {
      const shimPath = await this.generateShim(shim);
      generatedPaths.push(shimPath);
    }

    return generatedPaths;
  }

  private async addToPath(directory: string): Promise<void> {
    // Use PowerShell to add to system PATH
    const command = `
      $oldPath = [Environment]::GetEnvironmentVariable('Path', 'User')
      if ($oldPath -notlike "*${directory}*") {
        $newPath = "$oldPath;${directory}"
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Output "Added ${directory} to PATH"
      }
    `;

    // Execute PowerShell command
    // (implementation details omitted for brevity)
  }
}
```

### 3.3 Infisical Secret Injection via Shims

Shims can inject secrets from Infisical:

**PowerShell Helper (`bootstrap/shims/lib/infisical-inject.ps1`)**:
```powershell
# Infisical Secret Injection Helper
# Usage: infisical-inject.ps1 -Command "docker exec ..." -Project "nyra" -Environment "production"

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [string]$Environment
)

# Check if Infisical MCP is running
$infisicalContainer = docker ps --filter "name=nyra-infisical-mcp" --format "{{.Names}}"
if (-not $infisicalContainer) {
    Write-Error "Infisical MCP container is not running"
    exit 1
}

# Fetch secrets from Infisical
$secrets = docker exec nyra-infisical-mcp infisical secrets list `
    --project-id $Project `
    --env $Environment `
    --format json | ConvertFrom-Json

# Build environment variable string
$envVars = @()
foreach ($secret in $secrets) {
    $envVars += "-e $($secret.key)=$($secret.value)"
}

# Execute command with injected secrets
$fullCommand = "$Command $($envVars -join ' ')"
Invoke-Expression $fullCommand
```

---

## 4. GUI Installer Architecture

### 4.1 React Application Structure

**Technology Stack**:
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **UI**: TailwindCSS + shadcn/ui
- **Desktop Wrapper**: Electron (optional)

### 4.2 Installation Flow

```mermaid
flowchart TD
    A[Launch Installer] --> B[PC Selection]
    B --> C{PC Type?}
    C -->|Orchestrator| D[Orchestrator Config]
    C -->|Worker 1-3| E[Worker Config]

    D --> F[Component Selection]
    E --> F

    F --> G[Environment Selection]
    G -->|WSL + Windows| H[WSL Bootstrap]
    G -->|Windows Only| I[Windows Bootstrap]

    H --> J[Docker Setup]
    I --> J

    J --> K[Build Docker Images]
    K --> L[Deploy Configs]
    L --> M[Generate Shims]
    M --> N[Start Services]
    N --> O[Validation]

    O --> P{Success?}
    P -->|Yes| Q[Complete]
    P -->|No| R[Rollback]
    R --> S[Retry or Exit]
```

### 4.3 Component Selection UI

**Features**:
- Checkbox-based selection with dependencies
- Required components (Docker, Claude Code) pre-selected
- Per-PC component recommendations
- Real-time size/resource estimation

**React Component (`ComponentSelector.tsx`)**:
```tsx
interface Component {
  id: string;
  name: string;
  description: string;
  required: boolean;
  dockerImage: string;
  size: string; // "1.2 GB"
  dependencies: string[]; // Other component IDs
  availableFor: ('orchestrator' | 'worker')[];
}

export const ComponentSelector: React.FC = () => {
  const { selectedPC, components, toggleComponent } = useInstallStore();

  const availableComponents = components.filter(c =>
    c.availableFor.includes(selectedPC)
  );

  const handleToggle = (componentId: string) => {
    const component = components.find(c => c.id === componentId);

    // Check dependencies
    if (component.dependencies.length > 0) {
      const missingDeps = component.dependencies.filter(
        depId => !enabledComponents.has(depId)
      );

      if (missingDeps.length > 0) {
        alert(`This component requires: ${missingDeps.join(', ')}`);
        return;
      }
    }

    toggleComponent(componentId);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {availableComponents.map(component => (
        <ComponentCard
          key={component.id}
          component={component}
          enabled={enabledComponents.has(component.id)}
          onToggle={() => handleToggle(component.id)}
        />
      ))}
    </div>
  );
};
```

### 4.4 Installation Orchestration

**Service (`installOrchestrator.ts`)**:
```typescript
export class InstallOrchestrator {
  private logger: Logger;
  private dockerManager: DockerManager;
  private shimGenerator: ShimGenerator;
  private configDeployer: ConfigDeployer;
  private validator: Validator;

  async executeInstallation(
    pcId: string,
    components: string[],
    environment: 'wsl' | 'windows'
  ): Promise<void> {
    this.logger.info(`Starting installation for ${pcId}`);

    try {
      // Phase 1: Prerequisites
      await this.installPrerequisites(environment);

      // Phase 2: Docker Setup
      await this.dockerManager.setupDocker();

      // Phase 3: Build Images
      await this.dockerManager.buildImages(components);

      // Phase 4: Deploy Configs
      await this.configDeployer.deployConfigs(pcId, components);

      // Phase 5: Generate Shims
      await this.shimGenerator.generateAllShims(pcId);

      // Phase 6: Start Services
      await this.dockerManager.startServices(pcId, components);

      // Phase 7: Validation
      await this.validator.validateInstallation(components);

      this.logger.success('Installation completed successfully');
    } catch (error) {
      this.logger.error('Installation failed', error);
      await this.rollback();
      throw error;
    }
  }

  private async installPrerequisites(environment: string): Promise<void> {
    if (environment === 'wsl') {
      await this.executeScript('bootstrap/scripts/windows/03-wsl-setup.ps1');
    }
    await this.executeScript('bootstrap/scripts/windows/01-prerequisites.ps1');
  }

  private async rollback(): Promise<void> {
    this.logger.warn('Rolling back installation...');
    await this.dockerManager.stopAllServices();
    await this.dockerManager.removeContainers();
    // Additional rollback steps...
  }
}
```

### 4.5 Real-Time Progress Tracking

**Zustand Store (`installStore.ts`)**:
```typescript
interface InstallState {
  currentPhase: string;
  progress: number; // 0-100
  logs: LogEntry[];
  isInstalling: boolean;
  error: Error | null;
}

export const useInstallStore = create<InstallState & Actions>((set, get) => ({
  currentPhase: 'selection',
  progress: 0,
  logs: [],
  isInstalling: false,
  error: null,

  setPhase: (phase: string) => set({ currentPhase: phase }),

  setProgress: (progress: number) => set({ progress }),

  addLog: (level: 'info' | 'warn' | 'error', message: string, details?: string) => {
    const log: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      details,
    };
    set(state => ({ logs: [...state.logs, log] }));
  },

  startInstallation: async () => {
    set({ isInstalling: true, error: null });

    const orchestrator = new InstallOrchestrator();

    try {
      await orchestrator.executeInstallation(
        get().selectedPC,
        Array.from(get().enabledComponents),
        get().selectedEnvironment
      );
      set({ currentPhase: 'complete' });
    } catch (error) {
      set({ error, currentPhase: 'error' });
    } finally {
      set({ isInstalling: false });
    }
  },
}));
```

---

## 5. PC-Specific Configurations

### 5.1 Orchestrator Configuration

**Environment Variables (`bootstrap/configs/orchestrator/.env`)**:
```bash
# PC Identity
NYRA_PC_ID=orchestrator
NYRA_MODE=orchestrator
NYRA_ENVIRONMENT=production

# Docker Compose
COMPOSE_PROJECT_NAME=nyra-orchestrator
COMPOSE_PROFILES=orchestrator

# Claude Flow
CLAUDE_FLOW_MODE=prod
CLAUDE_FLOW_TOPOLOGY=hierarchical-mesh
CLAUDE_FLOW_MAX_AGENTS=15

# Archon OS
ARCHON_MODE=distributed
ARCHON_ROLE=master

# Database URLs (from Infisical)
POSTGRES_URL=postgresql://nyra:***@postgres:5432/nyra_db
FALKORDB_URL=redis://falkordb:6379
CHROMADB_URL=http://chromadb:8000

# Infisical
INFISICAL_PROJECT_ID=***
INFISICAL_TOKEN=***
```

**Claude Flow Config (`bootstrap/configs/orchestrator/archon-os.config.json`)**:
```json
{
  "version": "3.0.0",
  "pc": {
    "id": "orchestrator",
    "role": "master",
    "capabilities": ["coordination", "memory", "routing"]
  },
  "swarm": {
    "topology": "hierarchical-mesh",
    "maxAgents": 15,
    "strategy": "specialized",
    "consensus": "raft"
  },
  "memory": {
    "backend": "hybrid",
    "ruvector": {
      "hnsw": true,
      "quantization": true
    }
  },
  "hooks": {
    "enabled": true,
    "workers": ["ultralearn", "optimize", "audit", "map"]
  },
  "mcp": {
    "enabled": true,
    "port": 8003,
    "transport": "stdio"
  }
}
```

### 5.2 Worker Configuration

**Worker-1 Environment (`bootstrap/configs/worker-1/.env`)**:
```bash
# PC Identity
NYRA_PC_ID=worker-1
NYRA_MODE=worker
NYRA_WORKER_ID=1
NYRA_GPU_TYPE=rtx_3060

# Docker Compose
COMPOSE_PROJECT_NAME=nyra-worker-1
COMPOSE_PROFILES=worker

# Worker Config
WORKER_API_PORT=8001
WORKER_METRICS_PORT=9001
ORCHESTRATOR_URL=https://orchestrator.nyra.local

# Claude Flow
CLAUDE_FLOW_MODE=prod
CLAUDE_FLOW_TOPOLOGY=mesh
CLAUDE_FLOW_MAX_AGENTS=8

# GPU Config
NVIDIA_VISIBLE_DEVICES=0
NVIDIA_DRIVER_CAPABILITIES=compute,utility

# Infisical
INFISICAL_PROJECT_ID=***
INFISICAL_TOKEN=***
```

**GPU Config (`bootstrap/configs/worker-1/gpu.config.json`)**:
```json
{
  "gpu": {
    "type": "rtx_3060",
    "vram": "12GB",
    "cudaCores": 3584,
    "tensorCores": 112
  },
  "limits": {
    "maxBatchSize": 32,
    "maxSequenceLength": 2048,
    "reservedVRAM": "2GB"
  },
  "optimization": {
    "flashAttention": true,
    "quantization": "int8",
    "fusedKernels": true
  }
}
```

---

## 6. Deployment Manifest

### 6.1 Complete Component Catalog

**Manifest (`bootstrap/manifests/full-manifest.json`)**:
```json
{
  "version": "1.0.0",
  "updated": "2026-01-15",
  "components": {
    "core": {
      "docker": {
        "required": true,
        "dockerImage": null,
        "installer": "bootstrap/scripts/windows/02-docker-setup.ps1"
      },
      "claude-code": {
        "required": true,
        "dockerImage": null,
        "installer": "winget install Anthropic.Claude"
      },
      "infisical-mcp": {
        "required": true,
        "dockerImage": "bootstrap/docker/images/mcp-servers/Dockerfile.infisical",
        "port": 8006
      },
      "metamcp-gateway": {
        "required": true,
        "dockerImage": "bootstrap/docker/images/mcp-servers/Dockerfile.metamcp-gateway",
        "port": 8005,
        "dependencies": ["infisical-mcp"]
      }
    },
    "orchestration": {
      "archon-os-mcp": {
        "required": true,
        "dockerImage": "bootstrap/docker/images/archon-os/Dockerfile.prod",
        "port": 8003,
        "dependencies": ["infisical-mcp"]
      },
      "archon-mcp": {
        "required": false,
        "dockerImage": "bootstrap/docker/images/archon-os/Dockerfile",
        "port": 8004,
        "dependencies": ["infisical-mcp"]
      }
    },
    "memory": {
      "letta-mcp": {
        "required": false,
        "dockerImage": "bootstrap/docker/images/mcp-servers/Dockerfile.letta",
        "port": 8007
      },
      "mem0-mcp": {
        "required": false,
        "dockerImage": "bootstrap/docker/images/mcp-servers/Dockerfile.mem0",
        "port": 8008
      },
      "ruvector-mcp": {
        "required": false,
        "dockerImage": "bootstrap/docker/images/mcp-servers/Dockerfile.ruvector",
        "port": 8009
      }
    },
    "infrastructure": {
      "postgres": {
        "required": true,
        "availableFor": ["orchestrator"],
        "dockerImage": "postgres:15-alpine",
        "port": 5432
      },
      "falkordb": {
        "required": true,
        "availableFor": ["orchestrator"],
        "dockerImage": "falkordb/falkordb:latest",
        "port": 6379
      },
      "chromadb": {
        "required": true,
        "availableFor": ["orchestrator"],
        "dockerImage": "chromadb/chroma:latest",
        "port": 8001
      }
    }
  },
  "deployments": {
    "orchestrator": {
      "components": {
        "docker": { "enabled": true },
        "claude-code": { "enabled": true },
        "infisical-mcp": { "enabled": true },
        "metamcp-gateway": { "enabled": true },
        "archon-os-mcp": { "enabled": true },
        "archon-mcp": { "enabled": true },
        "letta-mcp": { "enabled": true },
        "mem0-mcp": { "enabled": false },
        "ruvector-mcp": { "enabled": true },
        "postgres": { "enabled": true },
        "falkordb": { "enabled": true },
        "chromadb": { "enabled": true }
      }
    },
    "worker-1": {
      "components": {
        "docker": { "enabled": true },
        "claude-code": { "enabled": true },
        "infisical-mcp": { "enabled": true },
        "metamcp-gateway": { "enabled": true },
        "archon-os-mcp": { "enabled": true },
        "archon-mcp": { "enabled": false }
      }
    },
    "worker-2": {
      "components": {
        "docker": { "enabled": true },
        "claude-code": { "enabled": true },
        "infisical-mcp": { "enabled": true },
        "metamcp-gateway": { "enabled": true },
        "archon-os-mcp": { "enabled": true },
        "archon-mcp": { "enabled": false }
      }
    },
    "worker-3": {
      "components": {
        "docker": { "enabled": true },
        "claude-code": { "enabled": true },
        "infisical-mcp": { "enabled": true },
        "metamcp-gateway": { "enabled": true },
        "archon-os-mcp": { "enabled": true },
        "archon-mcp": { "enabled": false }
      }
    }
  }
}
```

---

## 7. Architecture Diagrams

### 7.1 System Architecture

```mermaid
graph TB
    subgraph "Windows Host"
        CLI[Windows CLI]
        Shims[Command Shims<br/>archon-os.cmd<br/>archon.cmd]
        Docker[Docker Desktop]
    end

    subgraph "Docker Network - nyra-network"
        subgraph "Core Infrastructure"
            Infisical[Infisical MCP<br/>:8006]
            MetaMCP[MetaMCP Gateway<br/>:8005]
        end

        subgraph "Orchestration"
            ClaudeFlow[Claude Flow MCP<br/>:8003]
            Archon[Archon MCP<br/>:8004]
        end

        subgraph "Memory Systems"
            letta[letta MCP<br/>:8007]
            Mem0[Mem0 MCP<br/>:8008]
            ruvector[ruvector MCP<br/>:8009]
        end

        subgraph "Orchestrator Services"
            Orchestrator[Nyra Orchestrator<br/>:8000]
            Postgres[(PostgreSQL<br/>:5432)]
            FalkorDB[(FalkorDB<br/>:6379)]
            ChromaDB[(ChromaDB<br/>:8001)]
        end
    end

    CLI --> Shims
    Shims --> Docker
    Docker --> ClaudeFlow
    Docker --> Archon

    ClaudeFlow --> MetaMCP
    Archon --> MetaMCP
    MetaMCP --> Infisical

    MetaMCP --> letta
    MetaMCP --> Mem0
    MetaMCP --> ruvector

    Orchestrator --> Postgres
    Orchestrator --> FalkorDB
    Orchestrator --> ChromaDB
    Orchestrator --> MetaMCP
```

### 7.2 Installation Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Installer as React Installer
    participant Scripts as PowerShell Scripts
    participant Docker
    participant Containers

    User->>Installer: Launch Installer
    Installer->>User: Show PC Selection
    User->>Installer: Select PC (orchestrator)
    Installer->>User: Show Component Selection
    User->>Installer: Select Components
    Installer->>User: Confirm Installation

    Installer->>Scripts: Run 01-prerequisites.ps1
    Scripts->>Docker: Install Docker Desktop
    Scripts->>Installer: Prerequisites OK

    Installer->>Scripts: Run 02-docker-setup.ps1
    Scripts->>Docker: Configure Docker
    Scripts->>Installer: Docker Ready

    Installer->>Scripts: Run 05-build-images.ps1
    Scripts->>Docker: Build Images
    Docker->>Scripts: Images Built
    Scripts->>Installer: Build Complete

    Installer->>Scripts: Run 06-deploy-configs.ps1
    Scripts->>Installer: Configs Deployed

    Installer->>Scripts: Run 07-generate-shims.ps1
    Scripts->>Installer: Shims Generated

    Installer->>Scripts: Run 08-start-services.ps1
    Scripts->>Docker: Start Compose Stack
    Docker->>Containers: Launch Containers
    Containers->>Docker: Health Checks
    Docker->>Scripts: Services Running
    Scripts->>Installer: Services Started

    Installer->>Scripts: Run 09-validate.ps1
    Scripts->>Containers: Test Endpoints
    Containers->>Scripts: All OK
    Scripts->>Installer: Validation Passed

    Installer->>User: Installation Complete
```

### 7.3 4-PC Cluster Topology

```mermaid
graph LR
    subgraph "Orchestrator Mini PC"
        O_Flow[Claude Flow<br/>Coordinator]
        O_Archon[Archon Master]
        O_DB[(Databases)]
    end

    subgraph "Worker 1 - RTX 3060"
        W1_Flow[Claude Flow<br/>Worker]
        W1_GPU[GPU Tasks]
    end

    subgraph "Worker 2 - RTX 5090"
        W2_Flow[Claude Flow<br/>Worker]
        W2_GPU[GPU Tasks]
    end

    subgraph "Worker 3 - RTX 3090Ti"
        W3_Flow[Claude Flow<br/>Worker]
        W3_GPU[GPU Tasks]
    end

    O_Flow -->|Distribute Tasks| W1_Flow
    O_Flow -->|Distribute Tasks| W2_Flow
    O_Flow -->|Distribute Tasks| W3_Flow

    W1_Flow -->|Report Status| O_Flow
    W2_Flow -->|Report Status| O_Flow
    W3_Flow -->|Report Status| O_Flow

    O_Archon -->|Coordinate| W1_GPU
    O_Archon -->|Coordinate| W2_GPU
    O_Archon -->|Coordinate| W3_GPU

    O_Flow -.->|Query| O_DB
    W1_Flow -.->|Query| O_DB
    W2_Flow -.->|Query| O_DB
    W3_Flow -.->|Query| O_DB
```

---

## 8. Implementation Roadmap

### Phase 1: Docker Images (Week 1)
- [ ] Create Dockerfiles for all MCP servers
- [ ] Create Dockerfile for Claude Flow (dev and prod)
- [ ] Create Dockerfile for Archon OS
- [ ] Create unified docker-compose.yml
- [ ] Test image builds

### Phase 2: Shim System (Week 1)
- [ ] Design shim templates
- [ ] Implement shimGenerator.ts
- [ ] Test shim execution
- [ ] Implement Infisical secret injection
- [ ] Add PATH registration

### Phase 3: GUI Installer (Week 2)
- [ ] Build React app structure
- [ ] Implement PC selection
- [ ] Implement component selection
- [ ] Implement progress tracking
- [ ] Add validation logic
- [ ] Add rollback functionality

### Phase 4: Configuration System (Week 2)
- [ ] Create per-PC config templates
- [ ] Implement configDeployer.ts
- [ ] Create manifest.json
- [ ] Test config deployment

### Phase 5: Integration Testing (Week 3)
- [ ] Test orchestrator deployment
- [ ] Test worker deployments
- [ ] Test shim execution
- [ ] Test cross-PC communication
- [ ] Performance benchmarking

### Phase 6: Documentation (Week 3)
- [ ] Write user guide
- [ ] Write troubleshooting guide
- [ ] Record demo videos
- [ ] Create architecture diagrams

---

## 9. Validation & Testing

### 9.1 Pre-Installation Validation

**Validator (`bootstrap/installer/src/services/validator.ts`)**:
```typescript
export class Validator {
  async validatePrerequisites(): Promise<ValidationResult> {
    const checks = [
      this.checkDockerInstalled(),
      this.checkDockerRunning(),
      this.checkWSLInstalled(), // orchestrator only
      this.checkDiskSpace(50), // GB
      this.checkNetworkConnectivity(),
      this.checkPortsAvailable([8000, 8001, 8003, 8004, 8005, 8006]),
    ];

    const results = await Promise.all(checks);
    return this.aggregateResults(results);
  }

  async validatePostInstallation(components: string[]): Promise<ValidationResult> {
    const checks = [
      this.checkContainersRunning(components),
      this.checkHealthEndpoints(components),
      this.checkShimsWorking(['archon-os', 'archon']),
      this.checkConfigsDeployed(),
      this.checkInfisicalSecrets(),
    ];

    const results = await Promise.all(checks);
    return this.aggregateResults(results);
  }

  private async checkDockerRunning(): Promise<CheckResult> {
    try {
      await execAsync('docker info');
      return { passed: true, message: 'Docker is running' };
    } catch (error) {
      return { passed: false, message: 'Docker is not running', error };
    }
  }

  private async checkContainersRunning(components: string[]): Promise<CheckResult> {
    const expectedContainers = components.map(c => `nyra-${c}`);
    const runningContainers = await this.getRunningContainers();

    const missing = expectedContainers.filter(
      name => !runningContainers.includes(name)
    );

    if (missing.length > 0) {
      return {
        passed: false,
        message: `Containers not running: ${missing.join(', ')}`,
      };
    }

    return { passed: true, message: 'All containers running' };
  }

  private async checkHealthEndpoints(components: string[]): Promise<CheckResult> {
    const endpoints = [
      { name: 'infisical-mcp', url: 'http://localhost:8006/health' },
      { name: 'metamcp-gateway', url: 'http://localhost:8005/health' },
      { name: 'archon-os-mcp', url: 'http://localhost:8003/health' },
    ].filter(e => components.includes(e.name));

    const results = await Promise.all(
      endpoints.map(e => this.checkEndpoint(e.url))
    );

    const failed = results.filter(r => !r.passed);

    if (failed.length > 0) {
      return {
        passed: false,
        message: `Health checks failed: ${failed.map(f => f.message).join(', ')}`,
      };
    }

    return { passed: true, message: 'All health checks passed' };
  }
}
```

### 9.2 Post-Installation Smoke Tests

**Smoke Test Script (`bootstrap/scripts/common/smoke-test.ps1`)**:
```powershell
# Post-Installation Smoke Tests
Write-Host "Running smoke tests..." -ForegroundColor Cyan

# Test 1: Docker containers
Write-Host "[1/5] Checking Docker containers..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}"
$expected = @(
    "nyra-infisical-mcp",
    "nyra-metamcp-gateway",
    "nyra-archon-os-mcp"
)

foreach ($container in $expected) {
    if ($containers -contains $container) {
        Write-Host "  ✓ $container is running" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $container is NOT running" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Health endpoints
Write-Host "[2/5] Checking health endpoints..." -ForegroundColor Yellow
$endpoints = @{
    "Infisical MCP" = "http://localhost:8006/health"
    "MetaMCP Gateway" = "http://localhost:8005/health"
    "Claude Flow MCP" = "http://localhost:8003/health"
}

foreach ($endpoint in $endpoints.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Value -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ $($endpoint.Key) is healthy" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($endpoint.Key) returned $($response.StatusCode)" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "  ✗ $($endpoint.Key) is unreachable" -ForegroundColor Red
        exit 1
    }
}

# Test 3: Command shims
Write-Host "[3/5] Testing command shims..." -ForegroundColor Yellow
$shims = @("archon-os", "archon")

foreach ($shim in $shims) {
    $shimPath = "$env:USERPROFILE\.nyra\shims\$shim.cmd"
    if (Test-Path $shimPath) {
        Write-Host "  ✓ $shim.cmd exists" -ForegroundColor Green

        # Test execution
        try {
            & $shimPath --version | Out-Null
            Write-Host "  ✓ $shim.cmd executes successfully" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $shim.cmd execution failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ✗ $shim.cmd not found" -ForegroundColor Red
        exit 1
    }
}

# Test 4: Infisical secrets
Write-Host "[4/5] Checking Infisical secrets..." -ForegroundColor Yellow
$secretsVolume = docker volume inspect nyra_infisical_secrets 2>$null
if ($secretsVolume) {
    Write-Host "  ✓ Infisical secrets volume exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Infisical secrets volume not found" -ForegroundColor Red
    exit 1
}

# Test 5: Configurations
Write-Host "[5/5] Validating configurations..." -ForegroundColor Yellow
$configPath = "C:\Dev\Projects\Repos\Project-Nyra\bootstrap\configs\$env:NYRA_PC_ID"
if (Test-Path $configPath) {
    Write-Host "  ✓ PC-specific config directory exists" -ForegroundColor Green

    $requiredFiles = @(".env", "archon-os.config.json", "docker-compose.override.yml")
    foreach ($file in $requiredFiles) {
        if (Test-Path "$configPath\$file") {
            Write-Host "  ✓ $file exists" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $file missing" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "  ✗ Config directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ All smoke tests passed!" -ForegroundColor Green
```

---

## 10. Security Considerations

### 10.1 Secret Management

- **Infisical Integration**: All secrets managed via Infisical MCP
- **Volume-Based Injection**: Secrets mounted as read-only volumes
- **No Plaintext**: Secrets never stored in plaintext in configs
- **Per-PC Isolation**: Each PC has isolated secret namespace

### 10.2 Network Security

- **Internal Network**: All containers on isolated `nyra-network`
- **Minimal Port Exposure**: Only necessary ports exposed to host
- **TLS/SSL**: All MCP servers use TLS for external communication
- **Firewall Rules**: Windows Firewall configured during installation

### 10.3 Docker Security

- **Non-Root Users**: All containers run as non-root users
- **Read-Only Volumes**: Configs mounted as read-only
- **Resource Limits**: CPU/memory limits enforced via Docker Compose
- **Security Scanning**: Images scanned for vulnerabilities during build

---

## 11. Troubleshooting & Rollback

### 11.1 Rollback Mechanism

**Rollback Service (`bootstrap/installer/src/services/rollbackManager.ts`)**:
```typescript
export class RollbackManager {
  private backupDir: string;

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);

    await fs.ensureDir(backupPath);

    // Backup configs
    await fs.copy(
      'C:\\Dev\\Projects\\Repos\\Project-Nyra\\bootstrap\\configs',
      path.join(backupPath, 'configs')
    );

    // Backup Docker volumes
    await this.backupDockerVolumes(backupPath);

    // Save container state
    await this.saveContainerState(backupPath);

    return backupPath;
  }

  async rollback(backupPath: string): Promise<void> {
    // Stop all containers
    await this.dockerManager.stopAllServices();

    // Remove containers and volumes
    await this.dockerManager.removeContainers();
    await this.dockerManager.removeVolumes();

    // Restore configs
    await fs.copy(
      path.join(backupPath, 'configs'),
      'C:\\Dev\\Projects\\Repos\\Project-Nyra\\bootstrap\\configs'
    );

    // Restore Docker volumes
    await this.restoreDockerVolumes(backupPath);

    // Restart services
    await this.dockerManager.startServices();
  }
}
```

### 11.2 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Docker not starting | WSL2 backend issue | Run `wsl --update` and restart Docker Desktop |
| Container fails to start | Port conflict | Check ports with `netstat -ano` and kill conflicting process |
| Shim not found | PATH not updated | Restart terminal or run `refreshenv` |
| Health check fails | Container not ready | Wait 60s for initialization |
| Infisical secrets missing | Token expired | Regenerate token in Infisical dashboard |

---

## 12. Future Enhancements

### 12.1 Phase 2 Features

- [ ] **Remote Installation**: Deploy to remote PCs via SSH/RDP
- [ ] **Update Manager**: In-place updates without reinstallation
- [ ] **Monitoring Dashboard**: Real-time cluster status in GUI installer
- [ ] **Auto-Discovery**: Automatically detect PCs on network
- [ ] **Cloud Backup**: Backup configs to cloud storage

### 12.2 Phase 3 Features

- [ ] **Kubernetes Support**: Optional K8s deployment
- [ ] **CI/CD Integration**: Auto-deploy on Git push
- [ ] **Multi-Cluster**: Support for multiple independent clusters
- [ ] **AI-Powered Troubleshooting**: Auto-diagnose and fix issues

---

## Appendix A: Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Containerization** | Docker Desktop + Docker Compose | Service orchestration |
| **Orchestration** | Claude Flow V3 | Multi-agent coordination |
| **AI OS** | Archon OS | Distributed AI framework |
| **MCP Gateway** | MetaMCP | MCP server aggregation |
| **Secret Management** | Infisical | Centralized secrets |
| **Memory Systems** | letta, Mem0, ruvector | Knowledge graphs, vector DBs |
| **GUI Installer** | React + TypeScript + Vite | Installation interface |
| **State Management** | Zustand | React state |
| **Styling** | TailwindCSS + shadcn/ui | UI components |
| **Desktop Wrapper** | Electron (optional) | Standalone desktop app |
| **Scripting** | PowerShell + Bash | Bootstrap automation |

---

## Appendix B: Port Allocation

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Orchestrator API | 8000 | HTTP | Nyra API |
| ChromaDB | 8001 | HTTP | Vector DB |
| Claude Flow MCP | 8003 | HTTP/stdio | Claude Flow |
| Archon MCP | 8004 | HTTP/stdio | Archon OS |
| MetaMCP Gateway | 8005 | HTTP/stdio | MCP Gateway |
| Infisical MCP | 8006 | HTTP/stdio | Secrets |
| letta MCP | 8007 | HTTP/stdio | Knowledge graph |
| Mem0 MCP | 8008 | HTTP/stdio | Memory |
| ruvector MCP | 8009 | HTTP/stdio | Vector DB |
| Flow Nexus MCP | 8010 | HTTP/stdio | Flow coordination |
| Management UI | 8080 | HTTP | Admin dashboard |
| PostgreSQL | 5432 | TCP | Database |
| FalkorDB | 6379 | TCP | Graph DB |
| Worker 1 API | 8001 | HTTP | Worker API |
| Worker 1 Metrics | 9001 | HTTP | GPU metrics |
| Worker 2 API | 8002 | HTTP | Worker API |
| Worker 2 Metrics | 9002 | HTTP | GPU metrics |
| Worker 3 API | 8003 | HTTP | Worker API |
| Worker 3 Metrics | 9003 | HTTP | GPU metrics |

---

## Appendix C: Directory Size Estimates

| Directory | Estimated Size | Notes |
|-----------|---------------|-------|
| `bootstrap/installer/` | 150 MB | React app + dependencies |
| `bootstrap/docker/images/` | 5 GB | All Docker images |
| `bootstrap/configs/` | 50 MB | All PC configs |
| `bootstrap/shims/` | 10 MB | Shims + templates |
| `bootstrap/scripts/` | 20 MB | PowerShell/Bash scripts |
| **Total** | **~5.5 GB** | (excluding Docker volumes) |

---

**End of Architecture Document**
