# Bootstrap Integration Test Suite

Comprehensive integration testing for Project Nyra's 4-PC Windows 11 cluster bootstrap setup.

## Overview

This test suite validates the complete bootstrap setup including:
- Orchestrator PC configuration (WSL, Gitea, databases, MCP servers, Claude Code)
- Worker PC setup (Wake-on-LAN, Docker, Claude Flow, GPU)
- Hardware detection accuracy
- Network topology (local network, Tailscale mesh, Cloudflared tunnels)
- End-to-end integration (wake, compute, sync, sleep)

## Test Files

| Test File | Purpose | Runtime |
|-----------|---------|---------|
| `test-utils.sh` | Shared testing utilities and functions | N/A |
| `test-orchestrator-setup.sh` | Orchestrator PC validation | ~2-3 min |
| `test-worker-setup.sh` | Worker PC validation | ~1-2 min |
| `test-hardware-detection.sh` | Hardware detection accuracy | ~1-2 min |
| `test-network-topology.sh` | Network connectivity and topology | ~2-3 min |
| `test-end-to-end.sh` | Full integration workflow | ~3-5 min |

## Quick Start

### Running All Tests

```bash
# From the bootstrap/tests directory
cd bootstrap/tests

# Run all tests sequentially
./run-all-tests.sh

# Or run individual tests
./test-orchestrator-setup.sh
./test-worker-setup.sh
./test-hardware-detection.sh
./test-network-topology.sh
./test-end-to-end.sh
```

### Running Tests on Specific PC

**On Orchestrator:**
```bash
# Full orchestrator validation
./test-orchestrator-setup.sh

# Network topology from orchestrator perspective
./test-network-topology.sh

# End-to-end integration (requires workers)
./test-end-to-end.sh
```

**On Workers:**
```bash
# Worker-specific validation
./test-worker-setup.sh

# Hardware detection
./test-hardware-detection.sh

# Network topology from worker perspective
./test-network-topology.sh
```

## Test Categories

### 1. Orchestrator Setup Tests (`test-orchestrator-setup.sh`)

Tests orchestrator PC components:

- **WSL Environment**
  - WSL 2 installation
  - Ubuntu distro availability
  - WSL command execution

- **Docker Environment**
  - Docker daemon status
  - Docker Compose availability
  - Container management

- **Gitea Server**
  - Container running status
  - Web interface (port 3000)
  - SSH access (port 2222/22)
  - HTTP API responses

- **Databases**
  - PostgreSQL container (optional)
  - Redis container (optional)
  - Database connectivity

- **Infisical**
  - Container status
  - Web interface (port 8080)
  - CLI availability

- **Claude Code**
  - Installation validation
  - Configuration files
  - JSON config validation

- **Claude Desktop**
  - Config file existence
  - MCP server configuration
  - JSON validation

- **MCP Servers**
  - Claude Flow CLI
  - MCP server count
  - Server accessibility

- **Claude Flow**
  - Directory structure
  - Memory database
  - Daemon status

- **Network Configuration**
  - Tailscale installation
  - Tailscale connectivity
  - Cloudflared tunnel

- **Wake-on-LAN**
  - wakeonlan/etherwake tools
  - WOL configuration

### 2. Worker Setup Tests (`test-worker-setup.sh`)

Tests worker PC components:

- **Docker Environment**
  - Docker daemon
  - Container runtime
  - Compose plugin

- **NVIDIA GPU**
  - nvidia-smi availability
  - GPU detection
  - CUDA driver version
  - NVIDIA Container Toolkit
  - GPU model validation (RTX 3060/3090/5090)

- **Claude Code**
  - Installation
  - Configuration

- **Claude Flow**
  - Directory structure
  - Worker role configuration
  - CLI accessibility

- **Wake-on-LAN**
  - Network adapter WOL support
  - MAC address availability
  - ethtool validation

- **Network Configuration**
  - Tailscale connectivity
  - Orchestrator reachability

- **Git Configuration**
  - Git installation
  - Gitea URL configuration
  - User configuration

### 3. Hardware Detection Tests (`test-hardware-detection.sh`)

Validates hardware detection accuracy:

- **CPU Detection**
  - CPU model identification
  - Core count
  - AVX/AVX2 support
  - Virtualization support

- **GPU Detection**
  - NVIDIA GPU count
  - GPU model identification
  - Memory capacity
  - Driver version
  - Compute capability
  - RTX model detection (3060/3090 Ti/5090)

- **Memory (RAM)**
  - Total RAM detection
  - Available memory
  - NUMA topology

- **Storage**
  - Disk space analysis
  - NVMe detection
  - SSD vs HDD identification
  - I/O performance

- **Network Interfaces**
  - Interface enumeration
  - State detection (UP/DOWN)
  - MAC addresses
  - IP addresses
  - Network speed (gigabit detection)

- **System Information**
  - OS identification
  - Kernel version
  - Hostname
  - Uptime

### 4. Network Topology Tests (`test-network-topology.sh`)

Tests network connectivity and topology:

- **Local Network**
  - Default gateway reachability
  - DNS resolution
  - Internet connectivity
  - Latency measurements

- **Tailscale Mesh Network**
  - Tailscale installation
  - Connection status
  - IP assignment
  - Peer discovery
  - MagicDNS
  - Inter-node latency

- **Cloudflared Tunnel**
  - Cloudflared installation
  - Tunnel status
  - Public URL accessibility
  - Configuration validation

- **Service Accessibility**
  - Gitea local access
  - Gitea Tailscale access
  - Service ports

- **Network Performance**
  - Bandwidth testing (iperf3)
  - Latency matrix
  - Throughput measurements

- **Security**
  - Firewall status (ufw)
  - iptables rules

- **Topology Validation**
  - 4-PC topology detection
  - Node reachability
  - Mesh completeness

### 5. End-to-End Integration Tests (`test-end-to-end.sh`)

Full workflow integration testing:

- **Pre-Test Validation**
  - Required tools availability
  - Claude Flow CLI
  - Tailscale connectivity

- **Orchestrator Services**
  - Docker services
  - Gitea operations
  - Git clone testing

- **Wake-on-LAN**
  - Worker wake sequence
  - Response time measurement
  - WOL packet sending

- **Worker Health Check**
  - Reachability verification
  - Docker status
  - Remote validation

- **Distributed Task Execution**
  - Claude Flow swarm initialization
  - Task creation
  - Task submission
  - Execution monitoring

- **GPU Compute**
  - GPU availability
  - Docker GPU test
  - CUDA workload

- **Data Synchronization**
  - Git-based sync
  - Memory store/retrieve
  - Cross-node consistency

- **Worker Sleep** (optional)
  - Sleep command sending
  - SSH connectivity

- **Full Workflow**
  - Wake → Compute → Sync → Sleep
  - Multi-step validation
  - Performance metrics

## Configuration

Set environment variables before running tests:

```bash
# Network Configuration
export ORCHESTRATOR_IP="100.64.x.1"  # Tailscale IP
export WORKER_1_IP="100.64.x.2"
export WORKER_2_IP="100.64.x.3"
export WORKER_3_IP="100.64.x.4"

# Worker Details (for E2E tests)
export WORKER_MAC_ADDRESS="AA:BB:CC:DD:EE:FF"
export WORKER_HOSTNAME="worker-1.local"

# Test Results Directory
export TEST_RESULTS_DIR="./test-results"
```

## Test Results

All tests generate JSON reports in the `test-results/` directory:

```json
{
  "test_suite": "orchestrator-setup",
  "timestamp": "2026-01-15T10:30:00Z",
  "duration_seconds": 120,
  "results": {
    "total": 45,
    "passed": 42,
    "failed": 2,
    "skipped": 1,
    "success_rate": 93.33
  },
  "performance_metrics": {
    "wsl_tests_duration": 1250,
    "docker_tests_duration": 2100
  },
  "platform": "linux",
  "pc_role": "orchestrator"
}
```

### Viewing Results

```bash
# View latest results
cat test-results/test-results.json | jq

# Check success rate
jq '.results.success_rate' test-results/test-results.json

# List failed tests
jq '.results | select(.failed > 0)' test-results/test-results.json
```

## Memory Storage

Test results are automatically stored in Claude Flow memory:

```bash
# View stored test results
npx @claude-flow/cli@latest memory search --query "test-results" --namespace bootstrap-tests

# Retrieve specific test results
npx @claude-flow/cli@latest memory retrieve --key "orchestrator-test-results" --namespace bootstrap-tests

# List all test results
npx @claude-flow/cli@latest memory list --namespace bootstrap-tests
```

## Performance Benchmarks

Each test suite includes performance benchmarks:

- **Docker startup time** - Container spin-up latency
- **WSL command execution** - WSL overhead
- **Network latency** - Inter-node communication
- **GPU compute time** - CUDA workload performance
- **Disk I/O** - Storage performance

## Health Checks

Built-in health check functions:

- `check_docker_health()` - Docker daemon validation
- `check_wsl_health()` - WSL environment validation
- `check_network_connectivity()` - Network reachability

## Troubleshooting

### Common Issues

**1. Permission Denied**
```bash
chmod +x test-*.sh
```

**2. WSL Not Found**
```bash
# Install WSL 2 on Windows
wsl --install
```

**3. Docker Not Running**
```bash
# Start Docker daemon
sudo systemctl start docker
```

**4. Tailscale Not Connected**
```bash
# Start Tailscale
sudo tailscale up
```

**5. Tests Failing on Worker**
```bash
# Ensure you're running worker-specific tests
./test-worker-setup.sh
# Not: ./test-orchestrator-setup.sh
```

### Debug Mode

Enable verbose output:

```bash
# Run with debug logging
bash -x ./test-orchestrator-setup.sh

# Or set in script
set -x
```

## Continuous Integration

Integrate tests into CI/CD:

```yaml
# .github/workflows/bootstrap-tests.yml
name: Bootstrap Tests
on: [push, pull_request]

jobs:
  test-orchestrator:
    runs-on: self-hosted-orchestrator
    steps:
      - uses: actions/checkout@v2
      - name: Run Orchestrator Tests
        run: ./bootstrap/tests/test-orchestrator-setup.sh

  test-workers:
    runs-on: self-hosted-worker
    strategy:
      matrix:
        worker: [worker-1, worker-2, worker-3]
    steps:
      - uses: actions/checkout@v2
      - name: Run Worker Tests
        run: ./bootstrap/tests/test-worker-setup.sh
```

## Best Practices

1. **Run tests after bootstrap installation** to validate setup
2. **Run tests before major changes** to establish baseline
3. **Run E2E tests periodically** to ensure continued operation
4. **Store results in memory** for historical tracking
5. **Review failed tests** and fix issues promptly
6. **Update test configuration** when network topology changes

## Contributing

To add new tests:

1. Create test file following naming convention: `test-<category>.sh`
2. Source `test-utils.sh` for shared functions
3. Use assertion functions: `assert_command_exists`, `assert_port_open`, etc.
4. Add benchmark markers: `benchmark_start/end`
5. Generate report: `generate_test_report`
6. Store results in memory
7. Update this README with test documentation

## License

Part of Project Nyra - See main repository for license information.
