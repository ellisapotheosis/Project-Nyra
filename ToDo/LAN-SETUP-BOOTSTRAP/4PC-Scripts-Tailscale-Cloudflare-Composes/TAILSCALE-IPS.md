# Project Nyra - Tailscale IPs Reference

Your machines on the Tailscale VPN:

```
Orchestrator (Main PC):    100.87.235.78
Worker RTX 3060:           100.126.61.37
Worker RTX 5090:           100.102.204.112
```

---

## How to Use These IPs

### From Orchestrator → Send Job to Worker

```python
# Python example
import requests

# Send job to RTX 5090 worker
worker_ip = "100.102.204.112"
requests.post(f'http://{worker_ip}:8000/api/job', json=job_data)

# Send job to RTX 3060 worker
worker_ip = "100.126.61.37"
requests.post(f'http://{worker_ip}:8000/api/job', json=job_data)
```

### Node.js / Environment Config

**File: `.env.local`**
```env
# Orchestrator's Tailscale IP (for workers to call back)
ORCHESTRATOR_IP=100.87.235.78

# Worker IPs
WORKER_RTX5090_IP=100.102.204.112
WORKER_RTX3060_IP=100.126.61.37
```

**File: `config.js`**
```javascript
const workers = {
  'rtx5090': process.env.WORKER_RTX5090_IP || '100.102.204.112',
  'rtx3060': process.env.WORKER_RTX3060_IP || '100.126.61.37',
};

async function sendJobToWorker(workerName, jobData) {
  const ip = workers[workerName];
  const response = await fetch(`http://${ip}:8000/api/job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  return response.json();
}
```

---

## Testing Connectivity

```powershell
# From orchestrator, ping workers
ping 100.102.204.112
ping 100.126.61.37

# Test service on worker
curl http://100.102.204.112:8000/health
curl http://100.126.61.37:8000/health
```

---

## Which Services Use Tailscale?

- ✅ Orchestrator → Worker job dispatch
- ✅ Worker → Orchestrator status reports
- ✅ Your laptop → Any service (for debugging)
- ❌ Customer → Your services (use Cloudflare subdomains instead)

---

## Adding More Workers

If you add another GPU worker:

1. Install Tailscale on it
2. Record the IP: `tailscale ip -4`
3. Add to this file and to `.env.local`
4. Update orchestrator config to send jobs to that worker
