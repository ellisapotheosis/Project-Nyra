# Bootstrap GUI Installer - Architecture

## Overview

React 19 GUI installer for Project Nyra's 4-PC Windows 11 cluster bootstrap system. Combines all bootstrap materials into a single entry point with support for dual Windows + WSL environments.

## Technology Stack

- **React 19** - Latest features with concurrent rendering
- **TypeScript** - Strict mode for type safety
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Radix UI component library
- **Zustand** - Lightweight state management
- **Node.js child_process** - PowerShell/bash script execution

## Data Model (from manifest.json)

### PC Deployments
```typescript
type PCRole = 'orchestrator' | 'worker';

interface PCDeployment {
  enabled: boolean;
  displayName: string;
  role: PCRole;
  description: string;
  components: Record<string, Component>;
  features: PCFeatures;
}

interface Component {
  enabled: boolean;
  displayName: string;
  description: string;
  files: ConfigFile[];
}

interface ConfigFile {
  source: string;      // Relative to bootstrap/configs/{pc}/
  target: string;      // Windows path (%APPDATA%) or WSL (wsl:/opt/)
  checksum?: string;   // SHA-256 for validation
}

interface PCFeatures {
  wsl_required: boolean;
  gpu_required: boolean;
  wol_enabled?: boolean;
  disconnectable?: boolean;
  gitea_optional?: boolean;
}
```

### 4 PC Configuration

1. **orchestrator-mini** (Windows 11 + WSL)
   - Components: claude-code, claude-desktop, claude-flow, wsl-setup, gitea, docker, infisical
   - Features: WSL required, no GPU, Gitea optional

2. **worker-rtx3090ti** (Windows 11, Always-On)
   - Components: claude-code, claude-flow, docker, nvidia
   - Features: GPU required, no WSL, always online

3. **worker-rtx3060** (Windows 11, Alienware Laptop)
   - Components: claude-code, claude-flow, docker, nvidia
   - Features: GPU required, WOL enabled, disconnectable

4. **worker-rtx5090** (Windows 11, Alienware Laptop)
   - Components: claude-code, claude-flow, docker, nvidia
   - Features: GPU required, WOL enabled, disconnectable

## Installation Order

1. claude-code
2. claude-desktop
3. infisical
4. wsl-setup (orchestrator only)
5. docker
6. claude-flow
7. gitea (orchestrator only, optional)
8. nvidia (workers only)

## Directory Structure

```
bootstrap/
├── installer/              # React GUI app (THIS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PCSelector.tsx
│   │   │   ├── ComponentSelector.tsx
│   │   │   ├── InstallationProgress.tsx
│   │   │   ├── WindowsBootstrap.tsx
│   │   │   ├── WSLBootstrap.tsx
│   │   │   └── ValidationChecks.tsx
│   │   ├── services/
│   │   │   ├── scriptRunner.ts
│   │   │   ├── fileDeployer.ts
│   │   │   ├── validator.ts
│   │   │   └── logger.ts
│   │   ├── data/
│   │   │   └── manifest.json (symlink)
│   │   ├── types/
│   │   │   └── manifest.ts
│   │   ├── store/
│   │   │   └── installStore.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── configs/               # PC-specific configs
│   ├── orchestrator/
│   ├── worker-1/
│   ├── worker-2/
│   └── worker-3/
├── scripts/
│   ├── windows/          # PowerShell scripts
│   └── wsl/              # Bash scripts for WSL
├── docker/               # Docker Compose per PC
└── docs/                 # Bootstrap documentation
```

## UI/UX Flow

### 1. PC Selection Screen
- Radio buttons for 4 PCs
- Display PC specs (CPU, GPU, RAM)
- Show network status (online/offline for WOL PCs)
- Wake-on-LAN button for mobile workers

### 2. Component Selection Screen
- Checkboxes based on selected PC's components
- Pre-checked defaults from manifest
- Tooltips with component descriptions
- Warning for dependencies (e.g., "Gitea requires Docker")

### 3. Windows Bootstrap Phase (All PCs)
- Run PowerShell scripts sequentially
- Real-time progress indicators
- Log output in collapsible panel
- Rollback capability on error

### 4. WSL Bootstrap Phase (Orchestrator Only)
- Install/configure WSL 2 + Ubuntu 22.04
- Run bash scripts in WSL
- Handle WSL path mapping (wsl:/opt/ → /opt/)
- Validate WSL environment

### 5. File Deployment Phase
- Copy config files to target paths
- Handle Windows environment variables (%APPDATA%, %USERPROFILE%)
- Create directories as needed
- Validate checksums

### 6. Validation Phase
- Health checks for each component
- Docker connectivity test
- WSL environment validation
- Claude Flow daemon status
- MCP server connectivity

### 7. Completion Screen
- Summary of installed components
- Links to next steps
- Export installation log
- Troubleshooting guide

## Script Execution Strategy

### Windows Scripts (PowerShell)
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runPowerShellScript(scriptPath: string): Promise<void> {
  const command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`;
  const { stdout, stderr } = await execAsync(command);
  // Stream to UI
}
```

### WSL Scripts (Bash)
```typescript
async function runWSLScript(scriptPath: string): Promise<void> {
  // Copy script to WSL first
  await execAsync(`wsl cp "${scriptPath}" /tmp/script.sh`);
  // Execute in WSL
  const { stdout, stderr } = await execAsync('wsl bash /tmp/script.sh');
  // Stream to UI
}
```

## State Management (Zustand)

```typescript
interface InstallState {
  selectedPC: string | null;
  enabledComponents: Set<string>;
  currentPhase: 'selection' | 'windows' | 'wsl' | 'deployment' | 'validation' | 'complete';
  progress: number;
  logs: LogEntry[];
  errors: Error[];
}
```

## File Deployment Logic

### Windows Paths
- Expand environment variables: `%APPDATA%` → `C:\Users\{user}\AppData\Roaming`
- Create parent directories if missing
- Handle permission issues

### WSL Paths
- Detect WSL installation
- Map `wsl:/opt/` → execute `wsl mkdir -p /opt/` and copy
- Preserve Linux permissions

## Validation & Rollback

### Health Checks
1. Docker daemon accessible
2. Claude Code version check
3. WSL distro installed and running
4. Claude Flow daemon responsive
5. MCP servers reachable

### Rollback Strategy
- Keep backup of original files
- Reverse installation order
- Remove created directories
- Restore previous configurations

## Security Considerations

1. **Script Validation**: Verify script checksums before execution
2. **Privilege Escalation**: Prompt for admin when needed
3. **Secrets Management**: Never log sensitive data
4. **Path Traversal**: Sanitize all file paths
5. **Code Injection**: Use parameterized execution, no string interpolation

## Performance Optimizations

1. **Parallel Installation**: Independent components in parallel
2. **Progress Streaming**: Real-time log updates via WebSocket
3. **Lazy Loading**: Load components on-demand
4. **Caching**: Cache script execution results

## Error Handling

1. **Graceful Degradation**: Continue with warnings when possible
2. **Detailed Errors**: Show exact command that failed
3. **Retry Logic**: Auto-retry network operations
4. **User Assistance**: Contextual help for common errors

## Future Enhancements

1. **Electron Packaging**: Native Windows app
2. **Remote Installation**: Deploy to workers from orchestrator
3. **Update Management**: Check for component updates
4. **Backup/Restore**: Full system snapshots
5. **Monitoring**: Post-install health dashboard
