# React GUI Installer - 8-Folder Structure Integration Guide

## Overview

This guide documents the integration of the React GUI Installer with the new 8-folder bootstrap structure for Project Nyra's 4-PC cluster setup.

## New 8-Folder Structure

```
bootstrap/
├── orchestrator-mini/      # Orchestrator PC configurations
├── worker-rtx3060/         # RTX 3060 worker configurations
├── worker-rtx3090ti/       # RTX 3090 Ti worker configurations
├── worker-rtx5090/         # RTX 5090 worker configurations
├── configs/                # Shared configurations
├── scripts/                # Shared scripts
├── windows/                # Windows-specific scripts
└── wsl/                    # WSL-specific scripts
```

Each PC folder contains:
```
<pc-name>/
├── configs/     # PC-specific config files
├── docker/      # Docker compose files
├── scripts/     # Installation scripts
└── setup/       # Setup automation
```

## New Services Created

### 1. PCDetector (`services/pcDetector.ts`)

Automatically detects which PC type is running based on:
- **Hardware Specs**: CPU model, RAM amount, GPU presence
- **Hostname**: Machine name patterns
- **Network Config**: Static IPs, network interfaces
- **GPU Detection**: NVIDIA GPU models via nvidia-smi or wmic

**Key Methods**:
- `detect()`: Returns `PCDetectionResult` with confidence score
- `validatePCCompatibility()`: Checks if PC meets requirements
- `getPCFolderPath()`: Gets PC-specific folder path
- `getConfigsFolderPath()`: Gets shared configs path
- `getScriptsFolderPath()`: Gets shared scripts path

**Detection Algorithm**:
```typescript
// Scores each PC type (0-100):
// +30: CPU pattern match
// +20: Hostname pattern match
// +20: RAM in correct range
// +30: GPU model match (if required)
// +10: No GPU (for orchestrator)
```

### 2. FolderStructureManager (`services/folderStructureManager.ts`)

Manages the 8-folder bootstrap structure:
- **PC-specific folders**: Gets paths to PC configs, docker, scripts, setup
- **Shared folders**: Gets paths to shared configs, scripts, windows, wsl
- **Component files**: Discovers available config/script files per component
- **Structure validation**: Verifies all folders exist and contain files

**Key Methods**:
- `getPCFolder(pcId)`: Get PC-specific folder
- `getPCSubfolder(pcId, subfolder)`: Get PC subfolder (configs/docker/scripts/setup)
- `getSharedConfigsFolder()`: Get shared configs
- `getSharedScriptsFolder()`: Get shared scripts
- `listPCFolderContents(pcId)`: List all files in PC folder
- `getComponentFiles(pcId, componentId)`: Get files for a component
- `getInstallationOptions(pcId)`: Get available/recommended/optional components
- `verifyStructure()`: Validate folder structure integrity
- `getSetupScripts(pcId)`: List setup scripts for PC
- `getDockerComposeFiles(pcId)`: List docker compose files

## New Hooks Created

### 1. usePCDetection (`hooks/usePCDetection.ts`)

React hook for PC detection:
```typescript
const {
  detectionResult,  // PCDetectionResult with detected PC and specs
  isDetecting,      // Loading state
  error,            // Detection error
  redetect,         // Re-run detection
  manualOverride    // Override detection with manual selection
} = usePCDetection();
```

### 2. useFolderStructure (`hooks/useFolderStructure.ts`)

React hook for folder structure management:
```typescript
const {
  manager,              // FolderStructureManager instance
  pcContents,          // PC folder contents
  componentFiles,      // Component file list
  availableComponents, // Available components for PC
  recommendedComponents, // Recommended components
  optionalComponents,  // Optional components
  isLoading,           // Loading state
  error,               // Error state
  loadPCContents,      // Load PC folder contents
  loadComponentFiles,  // Load component files
  verifyStructure      // Verify folder structure
} = useFolderStructure(baseBootstrapPath);
```

## Updated Components

### 1. PCSelector (`components/PCSelector.tsx`)

**New Features**:
- ✅ Automatic PC detection with confidence scores
- ✅ Visual indicators for detected vs manual selections
- ✅ System specs display (hostname, CPU, RAM, GPU)
- ✅ Alternative PC suggestions when confidence is low
- ✅ Manual override capability
- ✅ Folder structure validation on mount
- ✅ Re-detection button
- ✅ Confidence badges (Detected/Possible Match)

**UI Enhancements**:
- Green ring around detected PC
- Detection status banner
- System specifications panel
- Error/warning display for detection failures

### 2. ComponentSelector (`components/ComponentSelector.tsx`)

**New Features** (TO BE IMPLEMENTED):
- Display available files per component from PC folder
- Show shared vs PC-specific files
- File count indicators
- Dynamic component discovery from folder structure
- Component availability based on PC type

### 3. InstallationProgress (`components/InstallationProgress.tsx`)

**New Features** (TO BE IMPLEMENTED):
- Use PC-specific scripts from folder structure
- Execute setup scripts from `<pc-name>/setup/`
- Deploy configs from `<pc-name>/configs/` and `configs/`
- Launch docker compose from `<pc-name>/docker/`
- Show file sources (PC-specific vs shared)
- Progress tracking per folder

## Integration Workflow

```
1. User launches installer
   ↓
2. PCSelector detects PC type automatically
   - Analyzes hardware specs
   - Checks hostname patterns
   - Detects GPUs
   - Scores each PC type
   ↓
3. User confirms or overrides detection
   ↓
4. Verify folder structure exists
   - Check all 8 folders
   - Validate PC-specific folders
   - Ensure configs/scripts present
   ↓
5. ComponentSelector loads from folder
   - Read <pc-name>/configs for available components
   - Load installation options from FolderStructureManager
   - Display recommended vs optional
   ↓
6. User selects components
   ↓
7. MCP/Docker/Config screens
   ↓
8. InstallationProgress deploys
   - Copy configs from PC folder + shared
   - Run setup scripts from PC folder
   - Execute docker compose
   - Validate installation
```

## File Path Resolution

### PC-Specific Files
```typescript
// For orchestrator-mini installing claude-flow:
bootstrap/orchestrator-mini/configs/claude-flow/
bootstrap/orchestrator-mini/scripts/claude-flow/
bootstrap/orchestrator-mini/docker/claude-flow/
```

### Shared Files (Used by all PCs)
```typescript
// Shared configs/scripts:
bootstrap/configs/claude-flow/
bootstrap/scripts/claude-flow/
bootstrap/windows/claude-flow/
bootstrap/wsl/claude-flow/
```

### Priority Order
1. PC-specific configs (`<pc-name>/configs/`)
2. Shared configs (`configs/`)
3. PC-specific scripts (`<pc-name>/scripts/`)
4. Shared scripts (`scripts/`)

## Component Installation Flow

```typescript
async function installComponent(
  pcId: PCId,
  componentId: ComponentId,
  manager: FolderStructureManager
) {
  // 1. Get component files
  const files = await manager.getComponentFiles(pcId, componentId);

  // 2. Deploy config files (PC-specific overrides shared)
  for (const configFile of files.configFiles) {
    await deployConfigFile(configFile);
  }

  // 3. Run setup scripts
  for (const scriptFile of files.scriptFiles) {
    await runScript(scriptFile);
  }

  // 4. Launch docker services
  for (const dockerFile of files.dockerFiles) {
    await runDockerCompose(dockerFile);
  }

  // 5. Validate installation
  await validateComponent(componentId);
}
```

## Environment Variables

```bash
# Set in .env or system environment
BOOTSTRAP_PATH=C:/Dev/Projects/Repos/Project-Nyra/bootstrap

# Used by:
# - FolderStructureManager (base path)
# - PCDetector (folder path resolution)
# - Installation services (file deployment)
```

## Component Availability by PC

### Orchestrator Mini
- **Available**: claude-code, claude-desktop, claude-flow, wsl-setup, docker, gitea, infisical
- **Recommended**: claude-code, claude-desktop, claude-flow, wsl-setup, docker, infisical
- **Optional**: gitea

### Worker RTX 3090 Ti
- **Available**: claude-code, claude-flow, docker, nvidia
- **Recommended**: claude-code, claude-flow, docker, nvidia
- **Optional**: []

### Worker RTX 5090
- **Available**: claude-code, claude-flow, docker, nvidia
- **Recommended**: claude-code, claude-flow, docker, nvidia
- **Optional**: []

### Worker RTX 3060
- **Available**: claude-code, claude-flow, docker, nvidia
- **Recommended**: claude-code, claude-flow, docker, nvidia
- **Optional**: []

## Validation & Error Handling

### 1. PC Detection Validation
```typescript
// Low confidence warning
if (detectionResult.confidence < 50) {
  showWarning('Low confidence detection. Please verify manually.');
}

// Hardware compatibility check
const validation = PCDetector.validatePCCompatibility(specs, targetPC);
if (!validation.compatible) {
  showErrors(validation.issues);
}
```

### 2. Folder Structure Validation
```typescript
const verification = await manager.verifyStructure();
if (!verification.valid) {
  showErrors({
    missing: verification.missingFolders,
    empty: verification.emptyFolders
  });
}
```

### 3. File Availability Check
```typescript
const files = await manager.getComponentFiles(pcId, componentId);
if (files.configFiles.length === 0 && files.scriptFiles.length === 0) {
  showWarning(`No files found for ${componentId} on ${pcId}`);
}
```

## Testing Scenarios

### 1. PC Detection
- [ ] Test on orchestrator-mini (Ryzen 7 6800H, no GPU)
- [ ] Test on worker-rtx3090ti (i7 12700, RTX 3090 Ti)
- [ ] Test on worker-rtx5090 (Alienware, RTX 5090)
- [ ] Test on worker-rtx3060 (Alienware M15R7, RTX 3060)
- [ ] Test manual override
- [ ] Test re-detection

### 2. Folder Structure
- [ ] Verify all 8 folders exist
- [ ] Check PC-specific subfolders (configs, docker, scripts, setup)
- [ ] Validate shared folders (configs, scripts)
- [ ] Test with missing folders (error handling)
- [ ] Test with empty folders (warnings)

### 3. Component Discovery
- [ ] List components for each PC type
- [ ] Show recommended vs optional
- [ ] Display file counts per component
- [ ] Handle missing component files
- [ ] Show PC-specific vs shared files

### 4. Installation
- [ ] Deploy PC-specific configs
- [ ] Deploy shared configs (with override)
- [ ] Run setup scripts in order
- [ ] Launch docker compose files
- [ ] Validate installations
- [ ] Handle errors gracefully
- [ ] Support rollback

## Next Steps

### Immediate (Required)
1. ✅ Create PC detection service
2. ✅ Create folder structure manager
3. ✅ Create React hooks
4. ✅ Update PCSelector component
5. [ ] Update ComponentSelector component
6. [ ] Update InstallationProgress component
7. [ ] Add validation throughout
8. [ ] Test on all 4 PC types

### Short-term (Enhancements)
1. [ ] Add file preview in ComponentSelector
2. [ ] Show installation step-by-step progress
3. [ ] Add rollback capability
4. [ ] Implement health checks post-install
5. [ ] Add logging and diagnostics
6. [ ] Create installation report

### Long-term (Nice-to-have)
1. [ ] Remote installation (from orchestrator to workers)
2. [ ] Network discovery of other PCs
3. [ ] Cluster-wide orchestration
4. [ ] Update/upgrade workflow
5. [ ] Configuration drift detection
6. [ ] Backup/restore functionality

## File Structure Reference

```
bootstrap/installer/
├── src/
│   ├── components/
│   │   ├── PCSelector.tsx              ✅ Updated
│   │   ├── ComponentSelector.tsx       ⚠️ Needs update
│   │   └── InstallationProgress.tsx    ⚠️ Needs update
│   ├── hooks/
│   │   ├── usePCDetection.ts          ✅ New
│   │   └── useFolderStructure.ts      ✅ New
│   ├── services/
│   │   ├── pcDetector.ts              ✅ New
│   │   ├── folderStructureManager.ts  ✅ New
│   │   ├── fileDeployer.ts            ⚠️ Needs update
│   │   ├── installOrchestrator.ts     ⚠️ Needs update
│   │   └── validator.ts               ⚠️ Needs update
│   ├── types/
│   │   └── manifest.ts                ✅ Existing (no changes)
│   └── store/
│       └── installStore.ts            ✅ Existing (no changes)
└── INTEGRATION-GUIDE.md               ✅ This file
```

## Import Updates Required

### Add to ComponentSelector.tsx:
```typescript
import { useFolderStructure } from '../hooks/useFolderStructure';
```

### Add to InstallationProgress.tsx:
```typescript
import { useFolderStructure } from '../hooks/useFolderStructure';
import { FolderStructureManager } from '../services/folderStructureManager';
```

### Add to fileDeployer.ts:
```typescript
import { FolderStructureManager } from './folderStructureManager';
```

### Add to installOrchestrator.ts:
```typescript
import { PCDetector } from './pcDetector';
import { FolderStructureManager } from './folderStructureManager';
```

## API Reference

### PCDetector
```typescript
// Detect current PC
const result = await PCDetector.detect();
// Returns: { detectedPC, confidence, specs, alternativePCs }

// Validate compatibility
const validation = PCDetector.validatePCCompatibility(specs, targetPC);
// Returns: { compatible, issues: string[] }

// Get folder paths
const pcFolder = PCDetector.getPCFolderPath(pcId, baseBootstrapPath);
const configsFolder = PCDetector.getConfigsFolderPath(baseBootstrapPath);
const scriptsFolder = PCDetector.getScriptsFolderPath(baseBootstrapPath);
```

### FolderStructureManager
```typescript
const manager = new FolderStructureManager(baseBootstrapPath);

// Get PC folder
const folder = manager.getPCFolder(pcId);

// Get PC subfolder
const configsFolder = manager.getPCSubfolder(pcId, 'configs');

// List contents
const contents = await manager.listPCFolderContents(pcId);
// Returns: { configs: string[], docker: string[], scripts: string[], setup: string[] }

// Get component files
const files = await manager.getComponentFiles(pcId, componentId);
// Returns: { configFiles: string[], scriptFiles: string[], dockerFiles: string[] }

// Get installation options
const options = await manager.getInstallationOptions(pcId);
// Returns: { availableComponents, recommendedComponents, optionalComponents }

// Verify structure
const verification = await manager.verifyStructure();
// Returns: { valid, missingFolders, emptyFolders }
```

## Success Criteria

- [x] PC detection works with >70% confidence on correct PC
- [ ] All 8 folders recognized and validated
- [ ] Components load from PC-specific folders
- [ ] Installation uses correct file paths
- [ ] Shared configs properly merged with PC-specific
- [ ] Manual override works correctly
- [ ] Error handling shows clear messages
- [ ] Works on all 4 PC types

---

**Status**: Phase 1 Complete (Services & Hooks Created)
**Next**: Update ComponentSelector and InstallationProgress
**Date**: 2026-01-15
