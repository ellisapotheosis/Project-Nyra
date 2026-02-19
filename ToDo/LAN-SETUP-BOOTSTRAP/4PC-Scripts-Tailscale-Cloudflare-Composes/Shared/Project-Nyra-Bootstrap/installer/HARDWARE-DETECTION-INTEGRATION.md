# Hardware Detection Integration Guide

## Overview

The hardware detection module has been successfully integrated into the GUI Installer. This document provides a quick reference for using the hardware detection system.

## Files Created

### Core Services
```
bootstrap/installer/src/services/
├── hardwareDetector.ts              # Main interface, types, and factory
├── hardwareDetector.windows.ts      # Windows implementation (wmic/PowerShell)
├── hardwareDetector.linux.ts        # Linux/macOS implementation (bash)
├── README-HARDWARE-DETECTOR.md      # Comprehensive documentation
└── index.ts                         # Updated to export hardware detector
```

### React Components
```
bootstrap/installer/src/components/
├── HardwareDetectionDisplay.tsx     # Main hardware display component
└── index.ts                         # Updated to export component
```

### Examples & Docs
```
bootstrap/installer/src/
├── examples/hardware-detection-example.tsx   # 10 usage examples
└── styles/hardware-detection.css             # Component styles
```

### Store Integration
```
bootstrap/installer/src/store/
└── installStore.ts                  # Updated with hardware state
```

## Quick Start

### 1. Import and Use the Component

```tsx
import { HardwareDetectionDisplay } from '../components';

function MyInstallerScreen() {
  const handleComplete = (hardware) => {
    console.log('Hardware detected:', hardware);
    // Use hardware info for configuration
  };

  return (
    <HardwareDetectionDisplay
      onDetectionComplete={handleComplete}
      autoDetect={true}
    />
  );
}
```

### 2. Programmatic Detection

```typescript
import { getHardwareDetector } from '../services';

async function detectHardware() {
  const detector = await getHardwareDetector();
  const hardware = await detector.detectAll();

  console.log('Hostname:', hardware.system.hostname);
  console.log('CPU:', hardware.cpu.model);
  console.log('RAM:', hardware.ram.totalGB, 'GB');
  console.log('GPUs:', hardware.gpus);
  console.log('Network:', hardware.networkInterfaces);

  return hardware;
}
```

### 3. Store Integration

```typescript
import { useInstallStore } from '../store/installStore';
import { getHardwareDetector } from '../services';

function MyComponent() {
  const setDetectedHardware = useInstallStore(state => state.setDetectedHardware);
  const detectedHardware = useInstallStore(state => state.detectedHardware);

  const detect = async () => {
    const detector = await getHardwareDetector();
    const hardware = await detector.detectAll();
    setDetectedHardware(hardware);
  };

  return (
    <div>
      <button onClick={detect}>Detect Hardware</button>
      {detectedHardware && (
        <p>Detected: {detectedHardware.system.hostname}</p>
      )}
    </div>
  );
}
```

## Use Cases

### Tailscale Configuration

```typescript
const activeInterfaces = hardware.networkInterfaces.filter(i => i.isActive);
const primaryInterface = activeInterfaces.find(i => i.type === 'Ethernet') || activeInterfaces[0];

const tailscaleConfig = {
  hostname: hardware.system.hostname,
  advertiseRoutes: [primaryInterface.ipv4],
  acceptRoutes: true,
};
```

### Cloudflared Tunnel Setup

```typescript
const primaryInterface = hardware.networkInterfaces.find(i => i.isActive);

const tunnelConfig = {
  tunnel: hardware.system.hostname.toLowerCase(),
  ingress: [
    {
      hostname: `${hardware.system.hostname}.example.com`,
      service: `http://${primaryInterface.ipv4}:80`,
    },
  ],
};
```

### Wake-on-LAN Configuration

```typescript
const wolDevices = hardware.networkInterfaces
  .filter(iface => iface.type === 'Ethernet' && iface.isActive)
  .map(iface => ({
    name: hardware.system.hostname,
    mac: iface.macAddress,
    ip: iface.ipv4,
  }));
```

### GPU-based Service Allocation

```typescript
const hasNvidiaGPU = hardware.gpus.some(gpu => gpu.isNvidia);
const highVRAM = hardware.gpus.some(gpu => parseInt(gpu.vram) >= 12);

if (hasNvidiaGPU && highVRAM) {
  // Install AI/ML services
  installServices(['ollama', 'comfyui', 'stable-diffusion']);
}
```

## Detected Information

### System
- Hostname
- Platform (Windows/Linux/macOS)
- OS Version
- Architecture

### CPU
- Model
- Cores
- Threads
- Frequency
- Vendor

### RAM
- Total size
- Type (DDR3/DDR4/DDR5)
- Speed (MHz)
- Individual modules (size, slot, manufacturer)

### GPU
- Model
- VRAM
- Driver version
- Vendor (NVIDIA/AMD/Intel/Apple)

### Network Interfaces
- Name
- Type (Ethernet/Wi-Fi/Bluetooth)
- MAC address (for WoL)
- IPv4 and IPv6 addresses
- Connection status
- Link speed

## Platform-Specific Tools Used

### Windows
- `wmic` - Windows Management Instrumentation
- `PowerShell` - Advanced queries
- `nvidia-smi` - NVIDIA GPU info (if available)

### Linux
- `lscpu` - CPU information
- `dmidecode` - Memory details (requires sudo)
- `lspci` - PCI devices
- `nvidia-smi` - NVIDIA GPU info
- `ip` - Network interfaces

### macOS
- `sysctl` - System information
- `system_profiler` - Hardware profiling
- `sw_vers` - OS version

## Error Handling

The system gracefully handles:
- Missing tools (falls back to Node.js `os` module)
- Permission issues (continues with available info)
- Command failures (provides partial information)

```typescript
try {
  const hardware = await detector.detectAll();
  // Use hardware info
} catch (error) {
  console.error('Detection failed:', error);
  // Fall back to quickDetect()
  const basicInfo = await quickDetect();
}
```

## Performance

- **Full detection**: 1-4 seconds (platform dependent)
- **Quick detection**: < 100ms (basic info only)
- **Selective detection**: Faster when detecting only specific components

```typescript
// Quick detection for basic info
const basicInfo = await quickDetect();

// Selective detection for performance
const cpuInfo = await detector.detectCPU();
const networkInfo = await detector.detectNetwork();
```

## Styling

The component includes comprehensive CSS with:
- Responsive grid layouts
- Platform-specific badges (NVIDIA/AMD/Intel/Apple)
- Status indicators (active/inactive interfaces)
- Dark mode support
- Smooth animations and transitions

Import the styles:
```typescript
import '../styles/hardware-detection.css';
```

## Examples

See `src/examples/hardware-detection-example.tsx` for 10 complete examples:

1. Basic Hardware Detection
2. Using HardwareDetectionDisplay Component
3. Integration with Installer Store
4. Tailscale Configuration
5. Cloudflared Tunnel Configuration
6. Wake-on-LAN Setup
7. GPU-based Service Recommendation
8. System Requirements Validation
9. Quick Detection (Fast Fallback)
10. Selective Detection (Performance)

## Next Steps

1. **Integrate into Installer Flow**
   - Add hardware detection to PC detection screen
   - Store results in installer state
   - Use for service configuration

2. **Use for Configuration**
   - Configure Tailscale with detected interfaces
   - Set up Cloudflared tunnels with hostnames
   - Store MAC addresses for WoL

3. **Service Recommendations**
   - Suggest services based on GPU capabilities
   - Validate system requirements
   - Allocate resources appropriately

## Testing

```bash
# Install dependencies
npm install

# Test hardware detection
npm run test:hardware

# Build installer
npm run build
```

## Documentation

- **README-HARDWARE-DETECTOR.md** - Comprehensive module documentation
- **hardware-detection-example.tsx** - 10 complete usage examples
- **This file** - Quick integration guide

## Support

For issues or questions:
1. Check the README-HARDWARE-DETECTOR.md
2. Review the examples in hardware-detection-example.tsx
3. Examine the TypeScript interfaces for available data
4. Test with `quickDetect()` for debugging

## Security Notes

- **No root required** (except for detailed RAM on Linux)
- **Read-only operations** - no system modifications
- **Local execution** - no external network calls
- **Safe commands** - proper validation and escaping
