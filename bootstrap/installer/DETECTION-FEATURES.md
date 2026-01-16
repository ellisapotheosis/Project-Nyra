# GUI Installer Auto-Detection Features

## Overview
Enhanced the Project Nyra Bootstrap GUI Installer with intelligent PC auto-detection that identifies hardware configuration, determines PC role (orchestrator vs worker), and automatically filters components based on the detected system.

## Changes Made

### 1. Enhanced PC Detection Service (`pcDetector.ts`)

#### New Interfaces
- **PCDetectionResult**: Extended with `role`, `recommendedComponents`, `skipComponents`
- **GPUInfo**: Added `detected` flag to distinguish NVIDIA GPUs
- **NetworkInfo**: New interface for network interface detection with static IP identification

#### New Detection Methods
```typescript
// Network detection
private static getNetworkInterfaces(): NetworkInfo[]
// Detects network interfaces and identifies static IPs

// Docker host detection
private static async checkDockerHost(): Promise<boolean>
// Checks if Docker is running (orchestrator indicator)

// Component recommendations
private static getComponentRecommendations(pcId, specs)
// Returns recommended and skip components based on PC role
```

#### Enhanced Detection Logic
- **Orchestrator Detection**:
  - Checks for specific CPU patterns (Ryzen 7 6800H)
  - Verifies Docker host status
  - Looks for static IP configuration
  - Bonus scoring for no GPU detected

- **Worker Detection**:
  - GPU requirement validation via nvidia-smi
  - Specific GPU pattern matching (RTX 3060/3090Ti/5090)
  - CPU model verification
  - RAM range validation

### 2. Updated Store (`installStore.ts`)

#### New State Properties
```typescript
detectionResult: PCDetectionResult | null;
isAutoDetected: boolean;
```

#### New Actions
```typescript
setDetectionResult(result: PCDetectionResult): void;
setAutoDetected(isAuto: boolean): void;
```

### 3. Enhanced PC Selector (`PCSelector.tsx`)

#### Auto-Detection Flow
1. **Detection Phase**: Shows spinner while detecting hardware
2. **Detection Result**: Displays comprehensive hardware summary
3. **Manual Override**: Allows user to change selection if needed

#### New UI Components

**Detection Loading State**
```
[Spinner Animation]
Detecting PC Configuration...
Analyzing hardware (CPU, GPU, RAM, Network)
```

**Detection Result Card**
- Displays detected PC name with confidence score
- Shows role (ORCHESTRATOR/WORKER)
- Hardware specs grid:
  - Hostname
  - CPU model
  - RAM amount
  - GPU name(s)
- Network interfaces with static IP badges
- Docker Host detection badge
- "Change" button for manual override

**Manual Selection Grid**
- Traditional 4-PC grid layout
- Only shown when user clicks "Change" or detection fails
- Maintains all original PC selection features

### 4. Enhanced Component Selector (`ComponentSelector.tsx`)

#### Intelligent Component Filtering
```typescript
// Components are now filtered based on:
- skipComponents: Removed from list entirely
- recommendedComponents: Auto-selected and badged
- role: Determines applicable components
```

#### Skip Logic by Role

**Worker PCs Skip**:
- WSL Setup (not needed on GPU workers)
- Gitea (only runs on orchestrator)
- Claude Desktop (desktop app only on orchestrator)
- Infisical (secrets management on orchestrator only)

**Orchestrator Skips**:
- NVIDIA Container Toolkit (no GPU detected)

#### New UI Features

**Detection Summary Card**
```
[Hardware Icon]
Detected Hardware
CPU: [CPU Model]
RAM: [XGB]
GPU: [GPU Name or None]
Role: [ORCHESTRATOR/WORKER]
```

**Component Badges**
- **Required**: Red badge (claude-code, docker)
- **Recommended**: Green badge (based on detection)

## Detection Algorithm

### Scoring System (100 points max)
- CPU Pattern Match: 30 points
- Hostname Pattern Match: 20 points
- RAM Range Match: 20 points
- GPU Pattern Match: 30 points (workers)
- No GPU Bonus: 10 points (orchestrator)
- Docker Host: 15 points (orchestrator)

### Confidence Thresholds
- High Confidence: 70+ points
- Alternative PCs: Within 70% of top score

## Hardware Signatures

### Orchestrator Mini
```typescript
{
  patterns: ['ryzen 7 6800h', 'mini pc', 'orchestrator'],
  minRAM: 12GB, maxRAM: 20GB,
  requiresGPU: false
}
```

### Worker RTX 3090 Ti
```typescript
{
  patterns: ['rtx 3090 ti', '3090ti', 'intel i7 12700'],
  minRAM: 28GB, maxRAM: 40GB,
  requiresGPU: true,
  gpuPattern: '3090'
}
```

### Worker RTX 5090
```typescript
{
  patterns: ['rtx 5090', '5090', 'alienware area-51', 'area 51'],
  minRAM: 28GB, maxRAM: 40GB,
  requiresGPU: true,
  gpuPattern: '5090'
}
```

### Worker RTX 3060
```typescript
{
  patterns: ['rtx 3060', '3060', 'alienware m15r7', 'm15 r7'],
  minRAM: 28GB, maxRAM: 40GB,
  requiresGPU: true,
  gpuPattern: '3060'
}
```

## GPU Detection Methods

### Primary: nvidia-smi
```bash
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
```
Returns GPU name and VRAM for NVIDIA GPUs

### Fallback: wmic (Windows)
```bash
wmic path win32_VideoController get name
```
Returns all video controllers (includes integrated graphics)

## Network Detection

### Static IP Detection
Regex pattern: `^192\.168\.\d{1,2}\.\d{1,2}$`
- Identifies likely static IPs in 192.168.x.x range
- Used to identify orchestrator with fixed IP

## Example Detection Output

```typescript
{
  detectedPC: 'worker-rtx5090',
  confidence: 85,
  role: 'worker',
  specs: {
    hostname: 'ALIENWARE-AREA51',
    cpu: 'Intel Core i9-13900HX',
    totalMemory: 34359738368, // 32GB
    gpus: [
      {
        name: 'NVIDIA GeForce RTX 5090',
        vendor: 'NVIDIA',
        vram: 24576,
        detected: true
      }
    ],
    platform: 'win32',
    networkInterfaces: [
      {
        name: 'Ethernet',
        address: '192.168.1.105',
        isStatic: true
      }
    ],
    isDockerHost: false
  },
  alternativePCs: [],
  recommendedComponents: ['claude-code', 'claude-flow', 'docker', 'nvidia'],
  skipComponents: ['claude-desktop', 'wsl-setup', 'gitea', 'infisical']
}
```

## User Experience Flow

1. **Launch Installer** → Auto-detection starts immediately
2. **Detection Phase** → Shows loading spinner (2-5 seconds)
3. **Result Display** → Shows detected PC with full specs
4. **Review** → User reviews auto-detection
5. **Options**:
   - **Accept** → Click "Continue to Environment Selection"
   - **Override** → Click "Change" to manually select
6. **Component Selection** → Shows filtered components with recommendations
7. **Hardware Context** → Detection summary visible throughout

## Benefits

1. **Zero Configuration**: Installer knows what PC it's running on
2. **Reduced Errors**: Prevents installing wrong components
3. **User Confidence**: Shows detected hardware for verification
4. **Faster Setup**: Auto-selects appropriate components
5. **Role-Based Logic**: Orchestrator vs worker distinctions
6. **Override Capability**: Users can manually correct if needed

## Testing Recommendations

### Orchestrator PC
- Should detect: Ryzen 7 6800H, 16GB RAM, no GPU
- Should recommend: claude-code, claude-desktop, wsl-setup, docker, infisical
- Should skip: nvidia

### Worker PC (RTX 5090)
- Should detect: High-end CPU, 32GB RAM, RTX 5090 GPU
- Should recommend: claude-code, claude-flow, docker, nvidia
- Should skip: claude-desktop, wsl-setup, gitea, infisical

### Edge Cases
- No GPU detected on worker → Should fail GPU requirement check
- Docker not running on orchestrator → Lower confidence but still detect
- Unknown CPU → Falls back to RAM + GPU detection

## Future Enhancements

1. **Save Detection Results**: Persist to avoid re-detection
2. **Detection History**: Track past detections for debugging
3. **Custom Signatures**: Allow users to add custom PC patterns
4. **Remote Detection**: Detect other PCs on network
5. **Health Monitoring**: Continuous hardware monitoring post-install
