# Project Nyra - Tailscale Setup Guide

## What is Tailscale?

Tailscale is a VPN that connects all your machines into one private network. It lets your GPU workers and other machines communicate with each other and with the orchestrator **without needing Cloudflare subdomains**.

**Key benefits:**
- GPU workers can call the orchestrator at `http://100.x.x.x:8000`
- Orchestrator can send jobs to workers at `http://100.x.x.x:8000`
- Your laptop can access `http://100.x.x.x:3000` from anywhere
- Better security (only machines you invite can connect)
- Better latency for internal traffic

---

## Installation

### Step 1: Install Tailscale on Orchestrator (Main PC)

**Windows:**
1. Download from: https://tailscale.com/download
2. Run the installer
3. Click "Connect" in the system tray icon

**WSL (if you need to access services from WSL):**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

### Step 2: Install Tailscale on GPU Worker Machines

**Same process:**
1. Download from https://tailscale.com/download
2. Run installer
3. Click "Connect"

### Step 3: Get Your Tailscale IPs

Once all machines are connected, check their Tailscale IPs:

**Windows:**
```powershell
tailscale ip -4
```

**Linux/WSL:**
```bash
tailscale ip -4
```

You should see IPs like: `100.126.x.x`

---

## Configuration for Project Nyra

### Map Your Machines

```
Orchestrator PC:     100.126.61.37
Worker RTX 5090:     100.126.92.44
Worker RTX 3090 Ti:  100.126.50.22
Worker M15R7 (RTX 3060): 100.126.71.15
```

(These are example IPs - yours will be different)

---

## How Services Communicate

### Scenario 1: Orchestrator Sends Job to Worker

**Old way (needs Cloudflare subdomain):**
```python
# Python code
requests.post('https://worker-rtx5090.ratehunter.net/job', data=job)
```

**New way (via Tailscale):**
```python
# Python code
requests.post('http://100.126.92.44:8000/job', data=job)
```

**No Cloudflare subdomain needed!**

---

### Scenario 2: Your Laptop Accesses Orchestrator Admin

**Old way:**
```bash
https://orchestrator.ratehunter.net
# Needs Cloudflare, but slower for local network
```

**New way:**
```bash
http://100.126.61.37:8000
# Via Tailscale, faster, more secure
```

---

### Scenario 3: Customer Accesses App

**Must use Cloudflare (customer is on public internet):**
```bash
https://app.ratehunter.net
# Goes through Cloudflare tunnel to localhost:3002
```

**Cannot use Tailscale (customer's laptop isn't on your network):**
```bash
http://100.126.61.37:3002  # ❌ Won't work for customers
```

---

## Configuration Examples

### Python (Orchestrator → Worker)

**file: `~/projects/project-nyra/services/nyra-orchestrator/config.py`**

```python
import os

# Get IPs from environment or use defaults
WORKER_IPS = {
    'rtx5090': os.getenv('WORKER_RTX5090_IP', '100.126.92.44'),
    'rtx3090ti': os.getenv('WORKER_RTX3090TI_IP', '100.126.50.22'),
    'm15r7': os.getenv('WORKER_M15R7_IP', '100.126.71.15'),
}

# When sending jobs to workers
def send_job_to_worker(worker_name, job_data):
    worker_ip = WORKER_IPS[worker_name]
    url = f'http://{worker_ip}:8000/api/job'
    return requests.post(url, json=job_data)
```

### Node.js (Orchestrator → Worker)

**file: `~/projects/project-nyra/services/nyra-orchestrator/.env.local`**

```env
WORKER_RTX5090_IP=100.126.92.44
WORKER_RTX3090TI_IP=100.126.50.22
WORKER_M15R7_IP=100.126.71.15
```

**file: `~/projects/project-nyra/services/nyra-orchestrator/src/workers.js`**

```javascript
const WORKER_IPS = {
  'rtx5090': process.env.WORKER_RTX5090_IP,
  'rtx3090ti': process.env.WORKER_RTX3090TI_IP,
  'm15r7': process.env.WORKER_M15R7_IP,
};

async function sendJobToWorker(workerName, jobData) {
  const ip = WORKER_IPS[workerName];
  const url = `http://${ip}:8000/api/job`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
}
```

---

## Which Services Use Tailscale?

### Services Using Tailscale (Internal Only)

These services communicate via Tailscale IPs and do NOT need Cloudflare subdomains:

**For internal orchestrator-to-worker communication:**
- Orchestrator → Worker job dispatch
- Worker → Orchestrator status reports
- Workers → Shared cache/database

**For your local development:**
- Your laptop → Any service (admin panels, monitoring, etc.)
- From anywhere via VPN

### Services Still Using Cloudflare

These still need Cloudflare subdomains because customers access them:

1. **ratehunter.net** - Landing page (public)
2. **app.ratehunter.net** - Main webapp (public)
3. **chat.ratehunter.net** - Dify chat (public)
4. **admin.ratehunter.net** - Admin panel (team, but via Cloudflare for remote access)
5. **nexus.ratehunter.net** - API gateway (team & customers call this)

---

## Testing Tailscale Connectivity

### Step 1: Verify All Machines Connected

```powershell
# On orchestrator
tailscale status

# Should show:
# 100.126.61.37    orchestrator-mini      edane@
# 100.126.92.44    worker-rtx5090         edane@
# 100.126.50.22    worker-rtx3090ti       edane@
# 100.126.71.15    worker-m15r7           edane@
```

### Step 2: Ping Test

```powershell
# Test connectivity to worker (orchestrator → worker)
ping 100.126.92.44

# Should respond with ping times (e.g., "Reply from 100.126.92.44: bytes=32 time=5ms")
```

### Step 3: Service Test

```powershell
# Test if orchestrator service is running on worker
curl http://100.126.92.44:8000/health

# Should return service health info (not 502 Bad Gateway)
```

---

## Common Issues

### "Ping fails" or "Connection refused"

**Cause:** Service not running on that machine

**Fix:**
```bash
# SSH into worker or use remote terminal
# Start the service
cd ~/projects/project-nyra/services/worker-agent
npm start
```

### "100.x.x.x address not found"

**Cause:** Tailscale not connected or machine not authorized

**Fix:**
```powershell
# Check status
tailscale status

# If machine not shown, restart Tailscale
tailscale logout
tailscale up

# Then authorize new device at: https://login.tailscale.com/admin
```

### "Orchestrator can't reach worker"

**Cause:** Firewall blocking port

**Fix:**
```powershell
# Allow port through Windows Firewall (on worker)
New-NetFirewallRule -DisplayName "Allow Tailscale Job Port" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000
```

---

## Advanced: Tailscale Subnet Routing

If you want workers to access local files or services on each other:

### Enable Subnet Routing on Worker PC

```powershell
# Run as Administrator
tailscale up --advertise-routes=192.168.1.0/24

# Then accept at: https://login.tailscale.com/admin/routes
```

### Now Access Worker's Network from Orchestrator

```powershell
# Can ping local network IPs on worker
ping 192.168.1.100  # Device on worker's local network
```

---

## Comparison: Cloudflare vs Tailscale

| Feature | Cloudflare | Tailscale |
|---------|-----------|-----------|
| **Public internet access** | ✅ Yes | ❌ No |
| **Customer access** | ✅ Yes | ❌ No |
| **Internal machine-to-machine** | ⚠️ Works but slower | ✅ Yes (fast) |
| **Remote team access** | ✅ Yes | ✅ Yes |
| **Free tier** | ✅ Yes | ✅ Yes (3 devices) |
| **Setup difficulty** | 🟡 Medium | 🟢 Easy |
| **Latency (same LAN)** | 50-200ms | 5-20ms |

**Rule of thumb:**
- **Customers accessing?** → Use Cloudflare subdomain
- **Internal machine-to-machine?** → Use Tailscale IP
- **Remote team access?** → Use either (Cloudflare for simplicity, Tailscale for security)

---

## Your Setup Plan

### Current State
```
┌─────────────────────────────────────┐
│ Orchestrator (100.126.61.37)        │
│  • Cloudflared tunnel running       │
│  • Services on localhost:PORT       │
│  • Cloudflare DNS routes configured │
└─────────────────────────────────────┘
                  ↓ Cloudflare Tunnels
         ┌────────────────────────────┐
         │ Internet / Cloudflare      │
         │ (customers access here)    │
         └────────────────────────────┘
```

### After Tailscale Setup
```
┌─────────────────────────────────────┐
│ Orchestrator (100.126.61.37)        │
│ • Cloudflared tunnel running        │
│ • Tailscale connected               │
│ • Job dispatch via Tailscale        │
└─────────────────────────────────────┘
         ↑       ↓       ↑
    Tailscale  Cloudflare  Tailscale
         ↑       ↓       ↑
    ┌────┴───┬──────┬──────┴────┐
    │         │      │          │
 Worker1   Worker2  Worker3  Your Laptop
(100.x.x.x)(100.x.x.x)(100.x.x.x)
```

---

## Next Steps

1. ✅ Install Tailscale on all machines
2. ✅ Record Tailscale IPs for each machine
3. ✅ Test ping/connectivity
4. ⚠️ Update orchestrator config with worker IPs
5. ⚠️ Update worker config to report back to orchestrator
6. ⚠️ Test job dispatch from orchestrator to worker

---

## Files to Update

After getting Tailscale IPs, update these files with your actual IPs:

1. `~/projects/project-nyra/services/nyra-orchestrator/.env.local`
   - Add worker IP addresses

2. `~/projects/project-nyra/services/worker-agent/.env.local` (on each worker)
   - Add orchestrator IP address
   - Example: `ORCHESTRATOR_IP=100.126.61.37`

3. Any Python/Node config files that reference worker IPs
