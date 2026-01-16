# Project Nyra Bootstrap GUI

Comprehensive Electron + React wizard for automated 4-PC cluster setup.

## Features

### 🖥️ PC Role Detection
- Automatic hardware analysis (CPU, RAM, GPU)
- Intelligent role suggestion based on hardware
- Manual role override capability
- Supports all 4 PC roles: orchestrator, worker-2, worker-3, worker-4

### 🌐 Network Configuration
- Static IP assignment (10.0.0.1-4)
- Automated network interface configuration
- DNS server setup (Google DNS)
- Network connectivity validation

### 🐳 Docker Setup
- Docker Desktop installation automation
- Docker Compose version verification
- Container runtime health checks
- Automatic service dependency resolution

### 🔒 Tailscale VPN
- Automated Tailscale installation
- Auth key or OAuth authentication
- Mesh network IP assignment
- Connection status monitoring

### 🚀 Service Deployment
- Role-based service deployment
- 22+ microservice orchestration
- Health check validation
- Real-time deployment progress

### 🎮 GPU Worker Configuration
- Ollama model installation
- CUDA toolkit verification
- Model pulling automation
- GPU memory monitoring

### ✅ Health Validation
- Comprehensive service health checks
- Port connectivity testing
- API endpoint validation
- Performance metrics collection

## Installation

```bash
cd bootstrap-gui
npm install
```

## Development

```bash
npm run dev
```

This starts both the Electron main process and React dev server concurrently.

## Building

### Build for current platform
```bash
npm run package
```

### Build for specific platform
```bash
npm run package:win    # Windows
npm run package:mac    # macOS
```

### Build for all platforms
```bash
npm run package:all
```

## Project Structure

```
bootstrap-gui/
├── src/
│   ├── main/               # Electron main process
│   │   ├── main.ts         # Main entry point
│   │   └── preload.ts      # Preload script (IPC bridge)
│   └── renderer/           # React frontend
│       ├── App.tsx         # Main app component
│       ├── components/     # Screen components
│       │   ├── WelcomeScreen.tsx
│       │   ├── PCDetectionScreen.tsx
│       │   ├── NetworkConfigScreen.tsx
│       │   ├── DockerSetupScreen.tsx
│       │   ├── TailscaleSetupScreen.tsx
│       │   ├── ServiceDeploymentScreen.tsx
│       │   ├── GPUConfigScreen.tsx
│       │   ├── HealthCheckScreen.tsx
│       │   └── CompletionScreen.tsx
│       └── styles/         # CSS styles
├── assets/                 # Icons and images
├── dist/                   # Compiled output
├── release/                # Packaged applications
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Usage Workflow

1. **Welcome** - Introduction and requirements
2. **PC Detection** - Hardware analysis and role suggestion
3. **Network Config** - Static IP configuration
4. **Docker Setup** - Docker installation/verification
5. **Tailscale Setup** - VPN mesh configuration
6. **Service Deployment** - Microservices deployment
7. **GPU Configuration** - GPU worker setup (if applicable)
8. **Health Check** - Service validation
9. **Complete** - Success summary and next steps

## Requirements

- **Operating System**: Windows 10/11 or macOS 12+
- **Privileges**: Administrator/sudo access required
- **Disk Space**: 10GB minimum free space
- **Network**: Internet connection for downloads
- **GPU (for workers)**: NVIDIA GPU with 12GB+ VRAM

## Configuration Persistence

The wizard saves configuration at each step to:
- **Windows**: `%APPDATA%\nyra-bootstrap-gui\bootstrap-config.json`
- **macOS**: `~/Library/Application Support/nyra-bootstrap-gui/bootstrap-config.json`

Resume interrupted setup by restarting the application.

## IPC Communication

The application uses Electron's IPC for secure main-renderer communication:

### Available IPC Handlers

- `detect-pc-role`: Hardware detection and role suggestion
- `configure-static-ip`: Network configuration
- `check-docker`: Docker installation check
- `install-docker`: Docker installation automation
- `setup-tailscale`: Tailscale VPN setup
- `deploy-services`: Docker Compose deployment
- `configure-gpu-worker`: Ollama model installation
- `health-check`: Service health validation
- `exec-privileged`: Elevated command execution
- `save-config`: Configuration persistence
- `load-config`: Configuration restoration

### IPC Events

- `deployment-progress`: Real-time deployment status
- `gpu-progress`: GPU model pulling progress

## Security

- Context isolation enabled
- Node integration disabled
- Preload script for controlled IPC exposure
- Privileged operations require sudo-prompt
- No sensitive data logged or persisted

## Troubleshooting

### Docker Installation Fails
- Verify internet connection
- Check administrator privileges
- Manually download Docker Desktop if automated install fails

### Static IP Configuration Fails
- Ensure network interface name is correct
- Run with elevated privileges
- Check for conflicting network configurations

### Service Deployment Hangs
- Check Docker daemon status
- Verify Docker Compose file paths
- Ensure sufficient disk space

### Health Checks Fail
- Wait 1-2 minutes for service startup
- Check Docker logs: `docker compose logs`
- Verify port availability: `netstat -ano`

## Support

For issues, please check:
1. Application logs in `%APPDATA%\nyra-bootstrap-gui\logs`
2. Docker logs: `docker compose logs -f`
3. System requirements and prerequisites
4. Project Nyra documentation

## License

MIT License - Project Nyra
