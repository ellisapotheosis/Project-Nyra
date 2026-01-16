# Wake-on-LAN System - User Guide

## Overview

The enhanced Wake-on-LAN (WoL) system for Project Nyra provides comprehensive management of GPU worker PCs with automatic MAC address detection, multi-worker support, boot monitoring, GPU verification, and desktop notifications.

## Features

✅ **Auto-Detection**: MAC addresses loaded from bootstrap configs
✅ **Multi-Worker Support**: Wake all workers simultaneously
✅ **Boot Monitoring**: Track boot progress with configurable timeout
✅ **GPU Verification**: Verify GPU availability via nvidia-smi
✅ **Notifications**: Desktop and log notifications for wake/sleep events
✅ **GUI Management**: React-based panel in GUI installer
✅ **Graceful Shutdown**: SSH-based shutdown with confirmation

---

## Configuration

### Hardware Detection Config

Located at: `bootstrap/configs/hardware-detection.json`

```json
{
  "workers": {
    "worker-rtx3090ti": {
      "hostname": "nyra-rtx3090ti",
      "ip": "10.0.0.4",
      "mac": "XX:XX:XX:XX:XX:XX",  // ← Replace with actual MAC
      "gpu": {
        "model": "RTX 3090 Ti",
        "vram": "24GB",
        "cuda_cores": 10752
      },
      "wol_enabled": false,
      "always_on": true,
      "role": "primary-worker",
      "ssh_user": "nyra",
      "ssh_port": 22
    }
  },
  "network": {
    "subnet": "10.0.0.0/24",
    "broadcast": "10.0.0.255",
    "gateway": "10.0.0.1",
    "wol_port": 9
  },
  "monitoring": {
    "boot_timeout": 120,
    "ping_interval": 5,
    "ssh_timeout": 10,
    "gpu_check_enabled": true
  }
}
```

### Finding MAC Addresses

**On Windows:**
```powershell
# PowerShell
ipconfig /all | findstr /C:"Physical Address"

# or
(Get-NetAdapter -Name 'Ethernet').MacAddress
```

**On Linux/WSL:**
```bash
ip link show
# or
ifconfig | grep ether
```

### Enabling WoL on Windows

**1. BIOS/UEFI Settings:**
- Enable Wake-on-LAN
- Enable PCI-E Device Power
- Enable Network Boot (optional)

**2. Windows Network Adapter:**
```powershell
# PowerShell (Admin)
Set-NetAdapterPowerManagement -Name 'Ethernet' -WakeOnMagicPacket Enabled
```

Or via Device Manager:
1. Network adapters → Right-click → Properties
2. Power Management tab:
   - ☑ Allow this device to wake the computer
   - ☑ Only allow a magic packet to wake the computer
3. Advanced tab:
   - Wake on Magic Packet: Enabled
   - Wake on pattern match: Enabled (optional)

**3. Disable Fast Startup (recommended):**
```powershell
# PowerShell (Admin)
powercfg /h off
```

Or via Control Panel:
1. Power Options → Choose what the power buttons do
2. Change settings that are currently unavailable
3. ☐ Uncheck "Turn on fast startup"

---

## Command-Line Usage

### Wake Single Worker

```bash
# Wake RTX 5090 worker
./scripts/orchestrator/wake-gpu-worker.sh worker-rtx5090

# Wake RTX 3060 worker
./scripts/orchestrator/wake-gpu-worker.sh worker-rtx3060

# Wake RTX 3090 Ti (shows always-on status)
./scripts/orchestrator/wake-gpu-worker.sh worker-rtx3090ti
```

### Wake All Workers

```bash
# Wake all WoL-enabled workers in parallel
./scripts/orchestrator/wake-gpu-worker.sh --all

# or use the convenience script
./bootstrap/orchestrator-mini/scripts/wake-all-workers.sh
```

### List Available Workers

```bash
./scripts/orchestrator/wake-gpu-worker.sh --list
```

Output:
```
╔════════════════════════════════════════╗
║    Available GPU Workers              ║
╚════════════════════════════════════════╝

Worker Name          IP Address    GPU Model        WoL     Status
─────────────────────────────────────────────────────────────────
worker-rtx3090ti     10.0.0.4      RTX 3090 Ti      ⚡      ● Online
worker-rtx5090       10.0.0.5      RTX 5090         ✓       ○ Offline
worker-rtx3060       10.0.0.6      RTX 3060         ✓       ○ Offline
```

### Shutdown Worker

```bash
# Graceful shutdown via SSH
./bootstrap/orchestrator-mini/scripts/sleep-gpu-worker.sh worker-rtx5090

# Shutdown all disconnectable workers
./bootstrap/orchestrator-mini/scripts/sleep-gpu-worker.sh --all
```

### Convenience Scripts

Located in `bootstrap/orchestrator-mini/scripts/`:

```bash
# Individual workers
./bootstrap/orchestrator-mini/scripts/wake-rtx3060.sh
./bootstrap/orchestrator-mini/scripts/wake-rtx5090.sh
./bootstrap/orchestrator-mini/scripts/wake-rtx3090ti.sh

# All workers
./bootstrap/orchestrator-mini/scripts/wake-all-workers.sh
```

---

## GUI Management Panel

The GUI installer includes a comprehensive GPU Workers panel.

### Features

- **Real-time Status**: Online/Offline/Waking/Sleeping indicators
- **GPU Utilization**: Live monitoring of GPU usage, memory, temperature
- **Wake/Sleep Buttons**: One-click worker control
- **Worker Details**: IP, MAC, GPU specs, boot time
- **Status Badges**: Always-On, WoL Enabled, Mobile, Role
- **Bulk Actions**: Wake all workers simultaneously
- **Auto-refresh**: Periodic status updates

### Accessing the Panel

1. Open GUI Installer
2. Navigate to "GPU Workers" tab
3. View worker status and controls

### Panel Screenshots

**Worker Card:**
```
┌─────────────────────────────────────────┐
│ ● RTX 5090                     🌐 Online│
│   nyra-rtx5090                          │
├─────────────────────────────────────────┤
│ 🎮 RTX 5090                             │
│   VRAM: 32GB    CUDA Cores: 16,384     │
├─────────────────────────────────────────┤
│ GPU Utilization                         │
│   GPU Usage:  45% ████████░░░░░░       │
│   Memory:     12GB / 32GB ██████░░░░░  │
│   Temperature: 65°C                     │
├─────────────────────────────────────────┤
│ IP: 10.0.0.5    MAC: YY:YY:YY:YY:YY:YY │
│ Last Wake: 2026-01-15 10:23:45         │
├─────────────────────────────────────────┤
│ [✓ WoL Enabled] [📱 Mobile] [worker]   │
├─────────────────────────────────────────┤
│    [🌐 Wake]       [🌙 Sleep]          │
└─────────────────────────────────────────┘
```

---

## Architecture

### Components

1. **wake-gpu-worker.sh**: Main orchestration script
   - Auto-detects MAC from hardware-detection.json
   - Supports single/multi-worker wake
   - Boot monitoring with timeout
   - GPU verification via nvidia-smi
   - Desktop notifications

2. **sleep-gpu-worker.sh**: Graceful shutdown script
   - SSH-based shutdown (Windows/Linux)
   - Confirmation for always-on workers
   - Shutdown progress monitoring
   - Safety checks for disconnectable workers

3. **Convenience Scripts**: Worker-specific wrappers
   - `wake-rtx3060.sh`
   - `wake-rtx5090.sh`
   - `wake-rtx3090ti.sh`
   - `wake-all-workers.sh`

4. **GPU Workers Panel**: React GUI component
   - Real-time status monitoring
   - GPU utilization display
   - Wake/sleep controls
   - Worker details and history

5. **GPU Worker Service**: TypeScript service layer
   - Worker lifecycle management
   - Status checking (ping, SSH, GPU)
   - Notification handling
   - Periodic monitoring

### Data Flow

```
┌─────────────────┐
│  GUI Panel or   │
│  CLI Command    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ gpuWorkerService│
│   (TypeScript)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ wake-gpu-worker │
│   .sh Script    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────┐
│ hardware-       │────→│ wakeonlan   │
│ detection.json  │     │ (Magic Pkt) │
└─────────────────┘     └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ GPU Worker  │
                        │   (Boots)   │
                        └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ Monitoring  │
                        │ - Ping      │
                        │ - SSH       │
                        │ - nvidia-smi│
                        └─────────────┘
```

---

## Troubleshooting

### Worker Not Waking

**1. Verify MAC Address:**
```bash
# Check configured MAC
cat bootstrap/configs/hardware-detection.json | jq '.workers["worker-rtx5090"].mac'

# Verify on worker PC
ipconfig /all | findstr /C:"Physical Address"
```

**2. Check BIOS/UEFI Settings:**
- Wake-on-LAN enabled?
- PCI-E Device Power enabled?
- Fast Boot disabled?

**3. Check Windows Settings:**
```powershell
# Check adapter WoL status
Get-NetAdapterPowerManagement -Name 'Ethernet' | Select-Object Name, WakeOnMagicPacket

# Enable if disabled
Set-NetAdapterPowerManagement -Name 'Ethernet' -WakeOnMagicPacket Enabled
```

**4. Disable Fast Startup:**
```powershell
powercfg /h off
```

**5. Check Firewall:**
- Ensure UDP port 9 is allowed for magic packets
- Ensure ICMP ping is allowed for monitoring

### SSH Connection Failed

**1. Check SSH Service:**
```bash
# On worker (Windows via WSL)
sudo service ssh status

# Start if stopped
sudo service ssh start
```

**2. Configure SSH Keys:**
```bash
# On orchestrator
ssh-copy-id nyra@10.0.0.5

# Test connection
ssh nyra@10.0.0.5 'echo "Connection successful"'
```

### GPU Verification Failed

**1. Check NVIDIA Drivers:**
```bash
# On worker
nvidia-smi
```

**2. Check WSL GPU Access (Windows):**
```powershell
# Ensure WSL2 with GPU support
wsl --update
wsl --set-version Ubuntu 2
```

---

## Advanced Configuration

### Custom Boot Timeout

Edit `hardware-detection.json`:
```json
{
  "monitoring": {
    "boot_timeout": 180,  // 3 minutes
    "ping_interval": 10   // Check every 10 seconds
  }
}
```

### Webhook Notifications

Edit `hardware-detection.json`:
```json
{
  "notifications": {
    "enabled": true,
    "methods": ["desktop", "log", "webhook"],
    "webhook_url": "https://hooks.slack.com/services/..."
  }
}
```

### Multiple Network Interfaces

For workers with multiple NICs, specify the correct MAC address:
```json
{
  "workers": {
    "worker-rtx5090": {
      "mac": "AA:BB:CC:DD:EE:FF",  // Primary NIC with WoL
      "mac_secondary": "11:22:33:44:55:66"  // Secondary NIC (optional)
    }
  }
}
```

---

## Integration with Claude Flow

### Task Routing to GPU Workers

```typescript
// Route task to specific GPU worker
await claudeFlow.routeTask({
  task: 'train-model',
  worker: 'worker-rtx5090',
  ensureOnline: true  // Auto-wake if offline
});
```

### Pre-Task Wake

```bash
# Wake worker before starting training
./scripts/orchestrator/wake-gpu-worker.sh worker-rtx5090 && \
  claude-flow task execute --worker worker-rtx5090 --task train-model
```

---

## Maintenance

### Log Files

- **Wake/Sleep Logs**: `logs/wol-*.log`
- **Notifications**: `logs/wol-notifications.log`

### Cleanup Old Logs

```bash
# Remove logs older than 30 days
find logs/ -name "wol-*.log" -mtime +30 -delete
```

### Update Hardware Config

When adding/removing workers:
1. Edit `bootstrap/configs/hardware-detection.json`
2. Reload GUI panel or restart CLI
3. Test wake/sleep functionality

---

## Security Considerations

1. **SSH Keys**: Use key-based authentication (no passwords)
2. **Firewall Rules**: Restrict WoL to local network only
3. **MAC Spoofing**: Monitor for unauthorized wake attempts
4. **Secure Boot**: Enable Secure Boot in UEFI for production
5. **Network Segmentation**: Isolate GPU workers on dedicated VLAN

---

## FAQ

**Q: Can I wake a worker from outside the local network?**
A: Not directly. WoL magic packets don't route through gateways. Use a VPN or configure port forwarding on your router to a wake-on-LAN relay.

**Q: How do I add a new GPU worker?**
A: Edit `hardware-detection.json`, add the worker config with MAC address, and reload the GUI panel.

**Q: Why does the RTX 3090 Ti not have a wake button?**
A: It's configured as `always_on: true`, so WoL is disabled. It should remain powered on.

**Q: Can I schedule automatic wake/sleep?**
A: Yes, use cron jobs:
```bash
# Wake at 8 AM weekdays
0 8 * * 1-5 /path/to/wake-all-workers.sh

# Sleep at 6 PM weekdays
0 18 * * 1-5 /path/to/sleep-gpu-worker.sh --all
```

---

## Support

For issues or questions:
- Check logs: `logs/wol-notifications.log`
- Review troubleshooting section above
- Open GitHub issue with logs and error messages

---

**Last Updated**: 2026-01-15
**Version**: 1.0.0
**Maintainer**: Project Nyra Team
