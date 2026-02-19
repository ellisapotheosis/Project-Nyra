# Docker Cloudflared Setup Guide
**For:** Running cloudflared as a Docker container
**Status:** You have it running - let's verify it's correct

---

## ✅ Correct Docker Cloudflared Setup

### Option 1: Simple (Recommended)

**Dockerfile:**
```dockerfile
FROM cloudflare/cloudflared:latest

ENTRYPOINT ["cloudflared", "tunnel", "run"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-tunnel
    restart: always
    command: tunnel run
    environment:
      - CLOUDFLARE_DNS_TOKEN=${CLOUDFLARED_TOKEN}
    volumes:
      - ./cloudflared-credentials:/root/.cloudflared:ro
    ports:
      - "9999:9999"  # Metrics port

networks:
  default:
    name: nyra-network
    external: true
```

**Run:**
```bash
# First, get your tunnel token
cloudflared tunnel token 64fe03f2-9859-44ca-b0ab-e499d8464104

# Export as environment variable
export CLOUDFLARED_TOKEN=<your-token>

# Start container
docker compose up -d
```

---

### Option 2: With Config File (More Control)

**Dockerfile:**
```dockerfile
FROM cloudflare/cloudflared:latest

COPY orchestrator-essential.yml /etc/cloudflared/config.yml
COPY credentials.json /root/.cloudflared/

ENTRYPOINT ["cloudflared", "tunnel", "--config", "/etc/cloudflared/config.yml", "run"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  cloudflared:
    build: .
    container_name: cloudflared-tunnel
    restart: always
    volumes:
      - ./orchestrator-essential.yml:/etc/cloudflared/config.yml:ro
      - ./credentials:/root/.cloudflared:ro
    ports:
      - "9999:9999"  # Metrics
    networks:
      - nyra-network

networks:
  nyra-network:
    external: true
```

**Build & run:**
```bash
docker build -t cloudflared-tunnel .
docker compose up -d
```

---

## ✅ How to Check If Your Setup Is Correct

### 1. Check Container Is Running
```bash
docker ps | grep cloudflared
```

Expected output:
```
CONTAINER ID   IMAGE                           STATUS          PORTS
abc123...      cloudflare/cloudflared:latest   Up 2 minutes    0.0.0.0:9999->9999/tcp
```

### 2. Check Tunnel Is Connected
```bash
docker logs -f cloudflared-tunnel
```

Expected output:
```
INF Starting tunnel tunnelID=64fe03f2-9859-44ca-b0ab-e499d8464104
INF Registered tunnel connection connIndex=0
INF Registered tunnel connection connIndex=1
INF Registered tunnel connection connIndex=2
INF Registered tunnel connection connIndex=3
```

**If you see these, tunnel is working correctly! ✅**

### 3. Check Metrics Are Accessible
```bash
curl http://localhost:9999/metrics
```

Should return Prometheus metrics. If yes, tunnel is healthy. ✅

### 4. Test a Public URL
```bash
curl https://ratehunter.net
```

Should load your landing page. If yes, everything is working! ✅

---

## ❌ Common Docker Issues & Fixes

### Issue: "No such file or directory: credentials.json"

**Fix:**
```bash
# Credentials must exist first
# Check if file exists:
ls -la ~/.cloudflared/64fe03f2-9859-44ca-b0ab-e499d8464104.json

# Mount it correctly in docker-compose:
volumes:
  - ~/.cloudflared:/root/.cloudflared:ro
```

### Issue: "Permission denied" on credentials

**Fix:**
```bash
# Make credentials readable
chmod 644 ~/.cloudflared/64fe03f2-9859-44ca-b0ab-e499d8464104.json

# Or run container with user:group
docker run --user $(id -u):$(id -g) ...
```

### Issue: Container exits immediately

**Fix:**
```bash
# Check logs
docker logs cloudflared-tunnel

# Common causes:
# 1. Missing credentials file
# 2. Invalid tunnel ID
# 3. Config file syntax error

# Validate config:
cloudflared tunnel ingress validate -c orchestrator-essential.yml
```

### Issue: Can't reach metrics port 9999

**Fix:**
```bash
# Ensure port is published
# In docker-compose:
ports:
  - "9999:9999"  # <-- must have this

# Or docker run:
docker run -p 9999:9999 ...
```

---

## 🚀 Recommended Setup (Hybrid Approach)

**What you're doing:** Docker for orchestrator
**What else:** CLI for worker machines (simpler)

### Orchestrator (Your PC):
```bash
# Option A: Docker (what you have)
docker compose up -d cloudflared

# Option B: Windows Service (also good)
cloudflared service install
Start-Service cloudflared
```

### Worker PCs (RTX 5090, RTX 3060, RTX 3090):
```bash
# Just run CLI (no tunnel needed!)
# Workers use Tailscale IPs: 100.64.0.10, .11, .12
# No tunnel required
```

---

## 📊 Verify Your Docker Setup

Run this checklist:

- [ ] Container is running: `docker ps | grep cloudflared`
- [ ] 4 tunnel connections: Check `docker logs cloudflared-tunnel`
- [ ] Metrics accessible: `curl http://localhost:9999/metrics`
- [ ] Public URL works: `curl https://ratehunter.net`
- [ ] Landing page loads (no 404/error)

**If all ✅, your Docker setup is perfect!**

---

## 🔄 Stopping/Restarting

```bash
# Stop tunnel
docker stop cloudflared-tunnel

# Restart tunnel
docker restart cloudflared-tunnel

# View logs
docker logs -f cloudflared-tunnel

# Remove container
docker rm cloudflared-tunnel
```

---

## 📈 Monitoring

### Docker Desktop UI:
1. Open Docker Desktop
2. See "cloudflared-tunnel" container
3. Click to see logs
4. Click to see stats

### Command Line:
```bash
# Real-time stats
docker stats cloudflared-tunnel

# Check connections
docker logs cloudflared-tunnel | grep "Registered"
```

---

## 🎯 Next Steps

1. **Verify your setup:** Follow the checklist above
2. **If working:** Leave it running - you're done!
3. **If not working:** Tell me the error from `docker logs cloudflared-tunnel`

---

**Your Docker cloudflared setup should be working correctly.**
Check the logs to confirm all 4 tunnel connections are registered.
