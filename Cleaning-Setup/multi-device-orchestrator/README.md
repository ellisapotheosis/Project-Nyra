# 🌐 NYRA Multi-Device Orchestrator

The NYRA Multi-Device Orchestrator enables seamless GPU tunneling, compute distribution, and wake-on-LAN coordination across your entire NYRA ecosystem. It's designed to maximize GPU utilization across multiple devices while providing unified access through your ratehunter.net domain.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Alienware M15R7 │    │ Alienware       │    │ Desktop PC      │
│ RTX 3060        │    │ Area-51         │    │ RTX 3090 Ti     │
│ (Current/Dev)   │    │ RTX 5090        │    │ (Secondary GPU) │
│                 │    │ (Primary GPU)   │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────┬───────────┼──────────────────────┘
                     │           │
            ┌────────┴───────────┴────────┐
            │ Minisforum UM680           │
            │ Always-On Orchestrator     │
            │ Wake-on-LAN Controller     │
            │ Cloudflare Tunnel Host     │
            └────────────────────────────┘
                         │
                    ┌────┴─────┐
                    │ Internet │
                    │ via      │
                    │ CF Tunnel│
                    └────┬─────┘
                         │
            ┌────────────┴────────────────┐
            │ ratehunter.net subdomains:  │
            │ • nyra-orchestrator         │
            │ • nyra-gpu1 (Area-51)      │
            │ • nyra-gpu2 (Desktop)      │
            │ • nyra-dev (Current)       │
            │ • jupyter-gpu1/gpu2        │
            │ • tensorboard-gpu1/gpu2    │
            │ • mcp.ratehunter.net       │
            └─────────────────────────────┘
```

## 🖥️ Device Roles

### Primary Devices

- **Alienware Area-51 (RTX 5090)**: Primary GPU compute node for heavy ML inference, model training, and rendering
- **Desktop RTX 3090 Ti**: Secondary GPU compute node for parallel processing and backup compute
- **Alienware M15R7 (RTX 3060)**: Current development laptop, orchestration control, and light GPU tasks
- **Minisforum UM680**: Always-on orchestrator, wake-on-LAN controller, and Cloudflare tunnel host

### Network Configuration

All devices operate on the `192.168.1.0/24` subnet with static IP assignments:
- **M15R7**: `192.168.1.100` (Development/Current)
- **Area-51**: `192.168.1.101` (Primary GPU)
- **Desktop**: `192.168.1.102` (Secondary GPU) 
- **Minisforum**: `192.168.1.103` (Orchestrator)

## 🚀 Quick Start

### Basic Usage

```powershell
# Check cluster status
./NYRA-DeviceOrchestrator.ps1 -Action status

# Wake the entire compute cluster
./NYRA-DeviceOrchestrator.ps1 -Action wake-compute-cluster

# Distribute a GPU task (automatically selects optimal device)
./NYRA-DeviceOrchestrator.ps1 -Action distribute-gpu-task -GPUTask llm-inference

# Create direct GPU tunnel to specific device
./NYRA-DeviceOrchestrator.ps1 -Action tunnel-gpu -Device area51-rtx5090
```

### GPU Task Types

- **`llm-inference`**: Large language model inference (prefers RTX 5090, RTX 3090 Ti)
- **`image-generation`**: AI image generation (prefers RTX 5090, RTX 3090 Ti)
- **`video-processing`**: Video encoding/transcoding (prefers RTX 3090 Ti, RTX 5090)
- **`model-training`**: ML model training (requires RTX 5090)
- **`code-analysis`**: Code analysis and light GPU tasks (uses RTX 3060, RTX 3090 Ti)

## 📋 Prerequisites

- **PowerShell 7+** on all devices
- **SSH** configured between devices
- **Wake-on-LAN** enabled in BIOS/UEFI
- **Static IP addresses** or DHCP reservations
- **Cloudflared** (optional, for remote access)

## ⚙️ Configuration

### Device Setup

1. **Update MAC addresses** in `config/devices.json`:
   ```json
   {
     "devices": {
       "area51-rtx5090": {
         "mac": "XX:XX:XX:XX:XX:XX",
         "ip": "192.168.1.101"
       }
     }
   }
   ```

2. **Configure SSH keys** on all target devices:
   ```bash
   # Generate key pair
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/nyra_rsa -C "nyra-orchestrator"
   
   # Copy public key to target devices
   ssh-copy-id -i ~/.ssh/nyra_rsa.pub user@192.168.1.101
   ```

3. **Enable Wake-on-LAN** in device BIOS and network settings

### Cloudflare Integration

1. **Install cloudflared**:
   ```powershell
   choco install cloudflared
   ```

2. **Create and configure tunnel**:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create nyra-main
   cloudflared tunnel route dns nyra-main nyra-orchestrator.ratehunter.net
   ```

3. **Update tunnel configuration** in `cloudflare/tunnel-config.yml`

## 🔧 Advanced Usage

### Orchestrator Setup

```powershell
# Complete orchestrator setup with Cloudflare
./NYRA-DeviceOrchestrator.ps1 -Action setup-orchestrator -CloudflareToken "your-token"

# Deploy MCP ecosystem to all devices
./NYRA-DeviceOrchestrator.ps1 -Action deploy-mcp

# Sync repositories across all devices
./NYRA-DeviceOrchestrator.ps1 -Action sync-repos

# Graceful cluster shutdown
./NYRA-DeviceOrchestrator.ps1 -Action shutdown-cluster
```

### Custom Device Configuration

The orchestrator supports dynamic device configuration through JSON:

```json
{
  "gpu_tasks": {
    "custom-task": {
      "preferred_devices": ["area51-rtx5090"],
      "min_vram_gb": 24,
      "parallel_capable": false,
      "cpu_intensive": true,
      "network_bandwidth": "high"
    }
  }
}
```

## 🌐 Remote Access

Access your NYRA ecosystem from anywhere via Cloudflare tunnels:

- **Main Orchestrator**: https://nyra-orchestrator.ratehunter.net
- **Primary GPU (Area-51)**: https://nyra-gpu1.ratehunter.net
- **Secondary GPU (Desktop)**: https://nyra-gpu2.ratehunter.net
- **Jupyter (Area-51)**: https://jupyter-gpu1.ratehunter.net
- **Jupyter (Desktop)**: https://jupyter-gpu2.ratehunter.net
- **TensorBoard (Area-51)**: https://tensorboard-gpu1.ratehunter.net
- **MCP Ecosystem**: https://mcp.ratehunter.net
- **Monitoring Dashboard**: https://monitoring.ratehunter.net

## 🔍 Monitoring & Diagnostics

### Health Checks

The orchestrator performs automatic health checks every 30 seconds:
- **Device connectivity** via ping
- **SSH tunnel status** 
- **GPU utilization** monitoring
- **Wake-on-LAN** functionality

### Logging

Logs are available at multiple levels:
- **Console output**: Real-time status and actions
- **Local logs**: Device-specific operation logs
- **Cloudflare logs**: Tunnel and traffic logs
- **System metrics**: GPU, CPU, memory, network utilization

## 📦 Installation via Bootstrap

The orchestrator is included in the NYRA-AIO-Bootstrap package:

```powershell
# Install from bootstrap package
./scripts/Install-NYRADeviceOrchestrator.ps1 -SetupSSH -ConfigureCloudflare

# Custom installation location
./scripts/Install-NYRADeviceOrchestrator.ps1 -InstallLocation "D:\NYRA"
```

## 🔐 Security Considerations

- **SSH key authentication** for all device communication
- **Cloudflare Access** policies for remote tunnel access
- **Network segmentation** with VLANs (optional)
- **Firewall rules** for specific port access
- **Secret management** via Bitwarden/1Password integration

## 🐛 Troubleshooting

### Common Issues

1. **Wake-on-LAN not working**:
   - Verify BIOS/UEFI WoL settings
   - Check network adapter power management
   - Ensure correct MAC addresses in config

2. **SSH tunnels failing**:
   - Verify SSH key authentication
   - Check firewall rules
   - Confirm target device is responsive

3. **Cloudflare tunnels down**:
   - Check tunnel daemon status
   - Verify DNS propagation
   - Review Cloudflare dashboard logs

### Debug Mode

```powershell
# Enable verbose logging
./NYRA-DeviceOrchestrator.ps1 -Action status -Verbose

# Test individual components
Test-DeviceOnline -DeviceIP "192.168.1.101"
Send-WakeOnLAN -MACAddress "XX:XX:XX:XX:XX:XX"
```

## 🤝 Contributing

The NYRA Multi-Device Orchestrator is part of the larger Project NYRA ecosystem. Contributions welcome for:

- Additional GPU task types
- Enhanced monitoring capabilities
- Multi-platform support (Linux/macOS)
- Advanced load balancing algorithms
- Security hardening features

## 📄 License

Part of Project NYRA - AI-Powered Mortgage Assistant and Self-Building Dev Stack

---

🚀 **Happy orchestrating!** Your distributed NYRA GPU cluster awaits your commands.