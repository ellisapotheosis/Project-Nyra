# Orchestrator Mini Scripts

GPU worker management scripts for Wake-on-LAN and graceful shutdown.

## Scripts

### Convenience Wrappers

- **`wake-all-workers.sh`** - Wake all WoL-enabled workers simultaneously
- **`wake-rtx3060.sh`** - Wake RTX 3060 mobile worker
- **`wake-rtx5090.sh`** - Wake RTX 5090 mobile worker
- **`wake-rtx3090ti.sh`** - Check status of RTX 3090 Ti (always-on)
- **`sleep-gpu-worker.sh`** - Graceful shutdown via SSH

### Usage

```bash
# Wake individual worker
./wake-rtx5090.sh

# Wake all WoL-enabled workers
./wake-all-workers.sh

# Shutdown worker
./sleep-gpu-worker.sh worker-rtx5090
```

### Main Scripts

The convenience scripts are wrappers around:
- `../../scripts/orchestrator/wake-gpu-worker.sh` - Main WoL orchestration
- `./sleep-gpu-worker.sh` - Graceful shutdown

### Configuration

Worker configuration in: `../../configs/hardware-detection.json`

See [Wake-on-LAN Guide](../../docs/operations/WAKE-ON-LAN-GUIDE.md) for detailed documentation.

## Requirements

- **wakeonlan** package (auto-installed)
- **jq** for JSON parsing (auto-installed)
- **SSH access** to workers for shutdown and GPU verification

## Features

✅ Auto-detect MAC addresses from config
✅ Parallel wake for multiple workers
✅ Boot progress monitoring (120s timeout)
✅ GPU verification via nvidia-smi
✅ Desktop notifications
✅ Graceful SSH shutdown
✅ Safety checks for always-on workers
