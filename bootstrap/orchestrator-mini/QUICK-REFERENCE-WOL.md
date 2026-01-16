# Wake-on-LAN Quick Reference

## 🚀 Quick Commands

### Wake Workers
```bash
# Individual workers
./scripts/wake-rtx3060.sh
./scripts/wake-rtx5090.sh
./scripts/wake-rtx3090ti.sh

# All WoL-enabled workers
./scripts/wake-all-workers.sh

# Main script (more options)
../../scripts/orchestrator/wake-gpu-worker.sh worker-rtx5090
../../scripts/orchestrator/wake-gpu-worker.sh --all
../../scripts/orchestrator/wake-gpu-worker.sh --list
```

### Sleep Workers
```bash
# Individual shutdown
./scripts/sleep-gpu-worker.sh worker-rtx5090

# All disconnectable workers
./scripts/sleep-gpu-worker.sh --all
```

## 📋 Configuration

**Config File**: `bootstrap/configs/hardware-detection.json`

**Update MAC addresses**:
```bash
# Find MAC on Windows
ipconfig /all | findstr /C:"Physical Address"

# Edit config
nano bootstrap/configs/hardware-detection.json
```

## 🎮 Workers

| Worker | IP | GPU | WoL | Status |
|--------|-------|----------|-----|--------|
| RTX 3090 Ti | 10.0.0.4 | 24GB | ⚡ Always-On | Primary |
| RTX 5090 | 10.0.0.5 | 32GB | ✓ Enabled | Mobile |
| RTX 3060 | 10.0.0.6 | 12GB | ✓ Enabled | Mobile |

## ⚙️ Setup Checklist

- [ ] Update MAC addresses in hardware-detection.json
- [ ] Enable WoL in BIOS/UEFI
- [ ] Configure Windows network adapter for WoL
- [ ] Disable Windows Fast Startup
- [ ] Set up SSH keys for workers
- [ ] Test wake single worker
- [ ] Test wake all workers
- [ ] Test graceful shutdown

## 📚 Documentation

- **Full Guide**: `../../docs/operations/WAKE-ON-LAN-GUIDE.md`
- **Summary**: `../../docs/deployment/WOL-ENHANCEMENT-SUMMARY.md`
- **Scripts**: `./README.md`

## 🆘 Troubleshooting

**Worker not waking?**
1. Verify MAC address
2. Check BIOS WoL settings
3. Disable Fast Startup
4. Check network firewall

**SSH failed?**
1. Test: `ssh nyra@10.0.0.5`
2. Set up SSH keys
3. Start WSL SSH service

**GPU check failed?**
1. Test: `ssh nyra@10.0.0.5 nvidia-smi`
2. Install NVIDIA drivers
3. Enable WSL GPU support
