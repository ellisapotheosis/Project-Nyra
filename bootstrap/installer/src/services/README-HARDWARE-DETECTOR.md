# Hardware Detection Module

Cross-platform hardware detection system for the GUI Installer using system tools (no special applications required).

## Overview

The hardware detection module provides comprehensive system information detection across Windows, Linux, and macOS platforms. It uses native system commands and tools to gather detailed hardware specifications.

## Features

### Detected Hardware Information

1. **System Information**
   - PC name (hostname)
   - Platform (Windows/Linux/macOS)
   - OS version
   - Architecture (x64, arm64, etc.)

2. **CPU Information**
   - Model and vendor
   - Core count
   - Thread count
   - Clock frequency (current and max)

3. **RAM Information**
   - Total memory size
   - Memory type (DDR3, DDR4, DDR5, etc.)
   - Speed (MHz)
   - Individual module details (size, slot, manufacturer)

4. **GPU Information**
   - GPU model
   - VRAM size
   - Driver version
   - Vendor (NVIDIA, AMD, Intel, Apple)

5. **Network Interfaces**
   - Interface names
   - Type (Ethernet, Wi-Fi, Bluetooth)
   - MAC addresses (for Wake-on-LAN)
   - IPv4 and IPv6 addresses
   - Connection status
   - Link speed

## Architecture

### Core Files

```
services/
├── hardwareDetector.ts          # Main interface and types
├── hardwareDetector.windows.ts  # Windows implementation (PowerShell/wmic)
└── hardwareDetector.linux.ts    # Linux/macOS implementation (bash)
```

### Platform-Specific Tools

#### Windows
- `wmic` - Windows Management Instrumentation Command-line
- `PowerShell` - For advanced queries
- `nvidia-smi` - NVIDIA GPU detection (if available)

#### Linux
- `lscpu` - CPU information
- `dmidecode` - Memory and hardware details (requires root/sudo)
- `lspci` - PCI devices including GPU
- `nvidia-smi` - NVIDIA GPU detection (if available)
- `ip` - Network interface information

#### macOS
- `sysctl` - System control information
- `system_profiler` - Hardware profiling
- `sw_vers` - Software version

## Usage

### Basic Detection

```typescript
import { getHardwareDetector } from '../services/hardwareDetector';

// Get platform-specific detector
const detector = await getHardwareDetector();

// Detect all hardware
const hardware = await detector.detectAll();

console.log('Hostname:', hardware.system.hostname);
console.log('CPU:', hardware.cpu.model);
console.log('RAM:', hardware.ram.totalGB, 'GB');
console.log('GPUs:', hardware.gpus.length);
```

### Selective Detection

```typescript
// Detect only specific components
const cpuInfo = await detector.detectCPU();
const networkInterfaces = await detector.detectNetwork();
```

### Quick Detection (Fallback)

```typescript
import { quickDetect } from '../services/hardwareDetector';

// Quick detection using only Node.js os module
const basicInfo = await quickDetect();
```

### React Component

```tsx
import HardwareDetectionDisplay from '../components/HardwareDetectionDisplay';

function MyComponent() {
  const handleDetectionComplete = (hardware) => {
    console.log('Hardware detected:', hardware);
    // Store in state, use for configuration, etc.
  };

  return (
    <HardwareDetectionDisplay
      onDetectionComplete={handleDetectionComplete}
      autoDetect={true}
    />
  );
}
```

### Integration with Installer Store

```typescript
import { useInstallStore } from '../store/installStore';
import { getHardwareDetector } from '../services/hardwareDetector';

// In your component or service
async function detectAndStore() {
  const detector = await getHardwareDetector();
  const hardware = await detector.detectAll();

  // Store in Zustand store
  useInstallStore.getState().setDetectedHardware(hardware);

  // Use hardware info for Tailscale/Cloudflared config
  const macAddresses = hardware.networkInterfaces
    .filter(iface => iface.isActive)
    .map(iface => iface.macAddress);

  console.log('Available MAC addresses for WoL:', macAddresses);
}
```

## Data Structures

### HardwareInfo

```typescript
interface HardwareInfo {
  system: SystemInfo;
  cpu: CPUInfo;
  ram: RAMInfo;
  gpus: GPUInfo[];
  networkInterfaces: NetworkInterface[];
  detectedAt: Date;
}
```

### NetworkInterface (for Tailscale/Cloudflared)

```typescript
interface NetworkInterface {
  name: string;              // e.g., "Ethernet", "wlan0"
  type: string;              // "Ethernet", "Wi-Fi", "Bluetooth"
  macAddress: string;        // For Wake-on-LAN
  ipv4?: string;             // IPv4 address
  ipv6?: string;             // IPv6 address
  isActive: boolean;         // Currently connected
  speed?: string;            // Link speed (e.g., "1000 Mbps")
}
```

### GPUInfo

```typescript
interface GPUInfo {
  model: string;
  vram: string;              // e.g., "12 GB"
  driver?: string;
  vendor: string;            // "NVIDIA", "AMD", "Intel", "Apple"
  isNvidia: boolean;
  isAMD: boolean;
  isIntel: boolean;
}
```

## Use Cases

### 1. Tailscale Configuration

Use network interface information to configure Tailscale:

```typescript
const activeInterfaces = hardware.networkInterfaces.filter(i => i.isActive);
const primaryInterface = activeInterfaces.find(i => i.type === 'Ethernet') || activeInterfaces[0];

console.log('Configure Tailscale on:', primaryInterface.name);
console.log('IP:', primaryInterface.ipv4);
console.log('MAC:', primaryInterface.macAddress);
```

### 2. Cloudflared Tunnel Setup

Use hostname and IP information for tunnel configuration:

```typescript
const tunnelConfig = {
  hostname: hardware.system.hostname,
  publicHostname: `${hardware.system.hostname}.example.com`,
  service: `http://${primaryInterface.ipv4}:8080`,
};
```

### 3. Wake-on-LAN Configuration

Store MAC addresses for remote wake capabilities:

```typescript
const wolDevices = hardware.networkInterfaces
  .filter(iface => iface.type === 'Ethernet' && iface.isActive)
  .map(iface => ({
    name: hardware.system.hostname,
    mac: iface.macAddress,
    ip: iface.ipv4,
  }));
```

### 4. GPU-based Service Allocation

Determine which services to install based on available GPUs:

```typescript
const hasNvidiaGPU = hardware.gpus.some(gpu => gpu.isNvidia);
const hasHighVRAM = hardware.gpus.some(gpu => parseInt(gpu.vram) >= 12);

if (hasNvidiaGPU && hasHighVRAM) {
  // Install AI/ML services (Ollama, ComfyUI, etc.)
  console.log('System suitable for AI workloads');
}
```

### 5. System Requirements Validation

Check if system meets minimum requirements:

```typescript
function validateSystemRequirements(hardware: HardwareInfo): boolean {
  return (
    hardware.cpu.cores >= 4 &&
    hardware.ram.totalGB >= 16 &&
    hardware.gpus.length > 0
  );
}
```

## Error Handling

The detection system includes comprehensive error handling:

1. **Command failures**: Falls back to Node.js `os` module
2. **Missing tools**: Gracefully handles missing nvidia-smi, dmidecode, etc.
3. **Permission issues**: Continues with partial information
4. **Platform detection**: Automatically selects correct implementation

Example:

```typescript
try {
  const hardware = await detector.detectAll();
  // Use hardware info
} catch (error) {
  console.error('Hardware detection failed:', error);
  // Fall back to quickDetect() or show error to user
  const basicInfo = await quickDetect();
}
```

## Performance

- **Windows detection**: 1-3 seconds
- **Linux detection**: 1-4 seconds (faster without dmidecode/sudo)
- **macOS detection**: 2-4 seconds
- **Quick detection**: < 100ms (minimal info)

## Security Considerations

1. **No root required** (except for detailed RAM info on Linux with dmidecode)
2. **Read-only operations** - no system modifications
3. **Local execution only** - no external network calls
4. **Safe command execution** - proper escaping and validation

## Troubleshooting

### Windows

**Issue**: GPU not detected
- **Solution**: Install NVIDIA drivers or use wmic fallback

**Issue**: Network speed not shown
- **Solution**: wmic may not always provide speed; this is normal

### Linux

**Issue**: Detailed RAM info not available
- **Solution**: Run with `sudo` or accept basic memory information

**Issue**: GPU driver not detected
- **Solution**: Install proprietary GPU drivers (nvidia-smi, amdgpu)

### macOS

**Issue**: Limited GPU information
- **Solution**: macOS provides less detailed GPU info; this is expected

## Testing

```bash
# Run hardware detection test
npm run test:hardware

# Test specific platform
npm run test:hardware:windows
npm run test:hardware:linux
```

## Future Enhancements

- [ ] Disk drive detection (SSDs, HDDs)
- [ ] Temperature monitoring
- [ ] Power consumption estimation
- [ ] USB device enumeration
- [ ] Display/monitor information
- [ ] Audio device detection
- [ ] Battery status (for laptops)

## References

- Windows WMI: https://docs.microsoft.com/en-us/windows/win32/wmisdk/
- Linux lscpu: https://man7.org/linux/man-pages/man1/lscpu.1.html
- NVIDIA SMI: https://developer.nvidia.com/nvidia-system-management-interface
- Node.js os module: https://nodejs.org/api/os.html
