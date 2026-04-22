# Orchestrator Worker Power Control

This folder is the **dedicated power orchestration surface** for waking and sleeping Nyra GPU workers from the orchestrator.

## Files

- `Invoke-WorkerPower.ps1` — main command for `wake`, `sleep`, and `status`.
- `install-orchestrator-power-tools.ps1` — initializes local config and prints setup checklist.
- `workers.example.json` — template inventory for worker host/IP/MAC/shutdown strategy.

## Quick start (Windows PowerShell on orchestrator)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\scripts\power-orchestration
.\install-orchestrator-power-tools.ps1
notepad .\workers.json
.\Invoke-WorkerPower.ps1 -Action status -Target all
.\Invoke-WorkerPower.ps1 -Action wake -Target worker-rtx5090
.\Invoke-WorkerPower.ps1 -Action sleep -Target worker-rtx5090
```

## Setup plan

1. **Network + BIOS prerequisites (each worker)**
   - Enable Wake-on-LAN in BIOS/UEFI.
   - Enable NIC wake features in OS.
   - Disable deep sleep states that cut NIC power if your board requires it.

2. **Populate worker inventory**
   - Copy `workers.example.json` to `workers.json`.
   - Fill `mac`, `host`/`ip`, `healthUrl`, and shutdown method.

3. **Validate orchestrator connectivity**
   - Verify orchestrator can resolve worker hostnames (MagicDNS or local DNS).
   - Confirm orchestrator can SSH to workers if using `shutdown.method=ssh`.

4. **Run smoke checks**
   - `status` should reflect current online/offline state.
   - `wake` should bring node online before timeout.
   - `sleep` should power down node before timeout.

5. **Integrate with job scheduler/orchestrator hooks**
   - Call `Invoke-WorkerPower.ps1 -Action wake -Target <worker-id>` before dispatching heavy jobs.
   - Call `Invoke-WorkerPower.ps1 -Action sleep -Target <worker-id>` after idle threshold is reached.

## What you still need to obtain/configure

- Each worker MAC address (wired NIC preferred).
- BIOS/UEFI access to enable Wake-on-LAN.
- Working SSH credential path from orchestrator to workers (if using SSH shutdown).
- Stable health endpoint per worker (`/health`) for online checks.

## Troubleshooting

- **Wake fails immediately:** bad MAC format or wrong broadcast address.
- **Wake sent but node never online:** BIOS/NIC wake feature disabled or NIC power-saving policy blocks wake.
- **Sleep fails on SSH:** key-based auth not configured or `sudo shutdown -h now` requires password.
