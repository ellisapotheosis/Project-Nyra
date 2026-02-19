# Worker PC Setup Guide
**For:** RTX 5090 (Ubuntu), RTX 3060, RTX 3090
**Important:** Workers do NOT need Cloudflare tunnels!

---

## ❌ Do NOT Create Tunnels on Worker PCs

### Why?
- ✅ Orchestrator already exposes everything
- ✅ Workers are internal only (GPU processing)
- ✅ No need for public URLs on workers
- ✅ Wastes money/resources (unnecessary tunnels)
- ✅ Security risk (exposing GPU APIs publicly)

### Architecture:
```
Internet → Cloudflare Tunnel (Orchestrator Only)
           ↓
           Orchestrator (100.64.0.1)
           ↓ (Tailscale)
           Workers (100.64.0.10, .11, .12)
```

Workers are **internal only** - accessed by orchestrator via Tailscale IPs.

---

## ✅ What Workers Actually Need

### 1. Tailscale Connection (Already Done!)
```bash
# Already configured:
- RTX 5090: 100.64.0.10
- RTX 3060: 100.64.0.11
- RTX 3090: 100.64.0.12

# Verify connection:
tailscale status
```

### 2. Services Running
Either Docker or npm - whatever you're using for each service.

### 3. Environment Variables
Copy the appropriate .env file:

**RTX 5090 (Ubuntu):**
```bash
cp /mnt/c/Users/edane/OneDrive/LANShare/.env.worker-rtx5090 ~/projects/project-nyra/.env
```

**RTX 3060:**
```bash
cp /mnt/c/Users/edane/OneDrive/LANShare/.env.worker-rtx3060 /path/to/project/.env
```

**RTX 3090:**
```bash
cp /mnt/c/Users/edane/OneDrive/LANShare/.env.worker-rtx3090 /path/to/project/.env
```

---

## 🚀 Step-by-Step Setup per Worker PC

### RTX 5090 (Ubuntu Server - Already Running DEPLOY.sh)

**What it already has:**
- ✅ Tailscale connection (100.64.0.10)
- ✅ DEPLOY.sh running services
- ✅ vLLM for GPU inference

**What you need to do:**
```bash
# 1. SSH into Ubuntu server
# 2. Copy .env file
cp /mnt/c/Users/edane/OneDrive/LANShare/.env.worker-rtx5090 ~/projects/project-nyra/.env

# 3. Update .env with your API keys
nano ~/projects/project-nyra/.env
# Fill in: ANTHROPIC_API_KEY, HF_TOKEN, etc.

# 4. Services should already be running from DEPLOY.sh
# Verify:
ps aux | grep node
docker ps

# 5. Test vLLM endpoint
curl http://localhost:8000/v1/models

# That's it! Services are internal-only via Tailscale.
```

**Access from Orchestrator:**
```bash
# From Windows (orchestrator):
# GPU services are accessible at:
http://100.64.0.10:8000         # vLLM models
http://100.64.0.10:8010-8050    # Microservices
```

---

### RTX 3060 (GPU Worker - Ollama)

**Setup:**
```bash
# 1. Ensure Tailscale is running
tailscale status
# Should show: 100.64.0.11 (your IP)

# 2. Create .env file
cp /path/to/LANShare/.env.worker-rtx3060 /your/project/.env

# 3. Start Ollama in Docker
docker compose -f docker-compose.gpu-3060.yml up -d

# 4. Pull models
docker exec ollama-3060 ollama pull llama3.2:3b
docker exec ollama-3060 ollama pull phi3:mini

# 5. Test Ollama
curl http://localhost:11434/api/tags
```

**Access from Orchestrator:**
```bash
# Use Tailscale IP:
http://100.64.0.11:11434/api/tags
```

---

### RTX 3090 (GPU Worker - Ollama)

**Same as RTX 3060, but with larger models:**
```bash
# 1. Tailscale verify
tailscale status
# Should show: 100.64.0.12

# 2. Create .env
cp /path/to/LANShare/.env.worker-rtx3090 /your/project/.env

# 3. Start Ollama
docker compose -f docker-compose.gpu-3090.yml up -d

# 4. Pull large models (24GB VRAM available)
docker exec ollama-3090 ollama pull llama3.1:70b-q4
docker exec ollama-3090 ollama pull codellama:34b

# 5. Test
curl http://localhost:11434/api/tags
```

**Access from Orchestrator:**
```bash
http://100.64.0.12:11434/api/tags
```

---

## ❓ Common Questions

### Q: Should I tunnel the worker PCs?
**A: NO.** Workers are internal-only. Use Tailscale IPs.

### Q: How do workers talk to the orchestrator?
**A: Via Tailscale.** Services connect to 100.64.0.1 for shared services.

### Q: Can I access workers from the internet?
**A: NO.** By design. They're internal GPU services.

### Q: What if I WANT workers accessible publicly?
**A: Use Tailscale MagicDNS (internal only).** Don't expose via Cloudflare (security risk).

### Q: Do I run "cloudflared tunnel connect" on workers?
**A: NO.** That command is for web-based tunnel auth. Workers don't need tunnels.

### Q: How do I monitor worker health?
**A:**
```bash
# Check Ollama is running:
curl http://100.64.0.11:11434/api/tags

# Check vLLM is running:
curl http://100.64.0.10:8000/v1/models

# Check Tailscale connection:
tailscale status
```

---

## 🌐 Optional: Internal URLs via MagicDNS

If you want pretty names for workers (internal only):

### Enable MagicDNS:
1. Go to: https://login.tailscale.com/admin/dns
2. Enable **MagicDNS**

### Add DNS Records:
```
vllm.nyra.ts.net    → 100.64.0.10:8000
ollama-3060.nyra.ts.net → 100.64.0.11:11434
ollama-3090.nyra.ts.net → 100.64.0.12:11434
```

### Use from Orchestrator:
```bash
curl http://vllm.nyra.ts.net/v1/models
curl http://ollama-3060.nyra.ts.net:11434/api/tags
```

**But:**
- ⚠️ Only works when on Tailscale network
- ⚠️ Uses `.ts.net` domain (not ratehunter.net)
- ⚠️ No HTTPS without extra setup

**Recommendation:** Just use Tailscale IPs. Easier and simpler.

---

## ✅ Worker PC Setup Checklist

**RTX 5090 (Ubuntu):**
- [ ] Tailscale running (100.64.0.10)
- [ ] DEPLOY.sh running services
- [ ] .env file copied
- [ ] vLLM responding to curl http://localhost:8000/v1/models
- [ ] Accessible from orchestrator at 100.64.0.10:8000

**RTX 3060:**
- [ ] Tailscale running (100.64.0.11)
- [ ] Ollama container running: docker ps | grep ollama
- [ ] .env file configured
- [ ] Models pulled: curl http://localhost:11434/api/tags
- [ ] Accessible from orchestrator at 100.64.0.11:11434

**RTX 3090:**
- [ ] Tailscale running (100.64.0.12)
- [ ] Ollama container running: docker ps | grep ollama
- [ ] .env file configured
- [ ] Large models pulled: curl http://localhost:11434/api/tags
- [ ] Accessible from orchestrator at 100.64.0.12:11434

---

## 🎯 Summary

**Workers Do:**
- ✅ Run Tailscale (already set up)
- ✅ Run GPU services (Ollama, vLLM)
- ✅ Expose services on Tailscale IPs (100.64.0.x)

**Workers Don't:**
- ❌ Need Cloudflare tunnels
- ❌ Need public URLs
- ❌ Need "cloudflared tunnel connect"
- ❌ Expose to internet

**Access Pattern:**
```
Orchestrator (100.64.0.1)
    ↓
Workers via Tailscale IPs
    ↓
GPU services (vLLM, Ollama)
```

---

**That's it! Workers are already set up at Tailscale IPs.**
No additional tunnel configuration needed.
