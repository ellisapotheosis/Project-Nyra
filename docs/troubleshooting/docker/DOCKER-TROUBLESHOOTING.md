# Docker Troubleshooting Guide

## 🔴 CRITICAL ERROR: Docker Desktop Not Running

The error you're seeing:
```
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**This means Docker Desktop is NOT running on your Windows machine.**

## ✅ IMMEDIATE FIX

### Step 1: Start Docker Desktop

1. **Find Docker Desktop** in your Windows Start Menu
2. **Click to launch** Docker Desktop
3. **Wait 30-60 seconds** for Docker to fully start
4. **Look for the Docker whale icon** in your system tray (bottom-right)
5. **Icon should be solid** (not animated) when Docker is ready

### Step 2: Verify Docker is Running

```powershell
# Test Docker connection
docker ps

# Should show a list of running containers (or empty list)
# If you see this error again, Docker is NOT running:
# "failed to connect to the docker API"
```

### Step 3: Re-run the Setup Script

```powershell
# Navigate to project root
cd C:\Dev\Projects\Repos\Project-Nyra\

# Run the setup script
.\start-with-redis.ps1
```

## 🔧 Secondary Issue: Environment Variables Not Loading

The warnings you see:
```
The "NEXUS_REDIS_URL" variable is not set. Defaulting to a blank string.
The "CLAUDE_FLOW_REDIS_URL" variable is not set. Defaulting to a blank string.
```

**Fix**: I've created `infra/docker/.env` with all required variables.

Docker Compose looks for `.env` in the **same directory** as the compose file, not the project root.

## 🐳 Docker Desktop Installation (If Not Installed)

If you don't have Docker Desktop installed:

1. **Download**: https://www.docker.com/products/docker-desktop
2. **Install** Docker Desktop for Windows
3. **Enable WSL 2** integration (recommended)
4. **Restart** your computer
5. **Launch** Docker Desktop
6. **Wait** for it to start (first time takes 2-3 minutes)

## ⚙️ Docker Desktop Settings (Recommended)

Once Docker Desktop is running, configure:

### General Settings
- ☑ Start Docker Desktop when you log in
- ☑ Use WSL 2 based engine (recommended)

### Resources
- **Memory**: 8GB minimum, 16GB recommended
- **CPUs**: 4 cores minimum, 8 cores recommended
- **Disk**: 100GB recommended

### File Sharing
- Add `C:\Dev` to shared paths

## 🔍 Verifying Everything Works

After Docker Desktop is running:

```powershell
# 1. Check Docker version
docker --version
# Should show: Docker version 24.x.x or higher

# 2. Check Docker Compose version
docker-compose --version
# Should show: Docker Compose version 2.x.x

# 3. Test Docker functionality
docker run hello-world
# Should download and run a test container

# 4. Check running containers
docker ps
# Should show empty list or your existing containers

# 5. Check Docker networks
docker network ls
# Should show default Docker networks
```

## 🚀 Start Project Nyra Services

Once Docker is running:

```powershell
# Method 1: Use the start script (easiest)
.\start-with-redis.ps1

# Method 2: Manual start
cd infra/docker
docker-compose -f docker-compose.orchestration.yml up -d

# Method 3: With Infisical (if configured)
infisical run --env production --path /shared -- \
  docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
```

## 📊 Expected Output (Success)

When Docker Desktop IS running and services start correctly:

```
Creating network "docker_nyra-network" ... done
Creating nyra-redis ... done
Creating nyra-postgres ... done
Creating nyra-falkordb ... done
Creating nyra-qdrant ... done
Creating nyra-nexus-router ... done
Creating nyra-archon-os ... done
Creating nyra-archon-os ... done
Creating nyra-letta ... done
```

## 🐛 Common Issues & Solutions

### Issue 1: "Docker Desktop is starting..."

**Symptoms**: Docker icon is animated (whale with moving containers)

**Solution**: Wait 30-60 seconds. Docker is still starting up.

### Issue 2: "WSL 2 installation is incomplete"

**Symptoms**: Docker Desktop shows error about WSL 2

**Solution**:
```powershell
# Install WSL 2 (as Administrator)
wsl --install
wsl --set-default-version 2
```

Then restart computer.

### Issue 3: "Docker Desktop requires a newer Windows version"

**Symptoms**: Can't install Docker Desktop

**Solution**:
- Update Windows to version 1903 or higher
- Enable Hyper-V (Windows Pro) or WSL 2 (Windows Home)

### Issue 4: "Access Denied" errors

**Symptoms**: Can't access Docker commands

**Solution**:
1. Run PowerShell as Administrator
2. Add your user to "docker-users" group:
   ```powershell
   net localgroup docker-users "YOUR-USERNAME" /ADD
   ```
3. Log out and log back in

### Issue 5: "Port already in use"

**Symptoms**: `Error starting userland proxy: listen tcp 0.0.0.0:8000: bind: address already in use`

**Solution**:
```powershell
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F

# Or change the port in .env:
# NEXUS_ROUTER_PORT=8001
```

## 🎯 Quick Fix Checklist

- [ ] Docker Desktop installed
- [ ] Docker Desktop is running (whale icon in system tray)
- [ ] Docker responds to `docker ps` command
- [ ] Environment variables set in `infra/docker/.env`
- [ ] Ports 8000, 9000, 9001, 6379, 5432 are available
- [ ] Internet connection available (for pulling images)
- [ ] Sufficient disk space (10GB+ free)
- [ ] Sufficient RAM (8GB+ available)

## 📞 Still Having Issues?

If Docker Desktop starts but services fail:

1. **Check logs**:
   ```powershell
   docker-compose -f infra/docker/docker-compose.orchestration.yml logs
   ```

2. **Check service health**:
   ```powershell
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

3. **Restart individual service**:
   ```powershell
   docker-compose -f infra/docker/docker-compose.orchestration.yml restart nexus-router
   ```

4. **Full reset** (nuclear option):
   ```powershell
   # Stop everything
   docker-compose -f infra/docker/docker-compose.orchestration.yml down -v

   # Clean up
   docker system prune -a

   # Start fresh
   docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
   ```

## 🔗 Useful Docker Commands

```powershell
# View all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-name> -f

# Enter a running container
docker exec -it <container-name> sh

# Stop all containers
docker stop $(docker ps -q)

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# View Docker disk usage
docker system df

# Full system cleanup (careful!)
docker system prune -a --volumes
```

## 🎓 Docker Desktop Resources

- **Documentation**: https://docs.docker.com/desktop/windows/
- **Troubleshooting**: https://docs.docker.com/desktop/troubleshoot/overview/
- **Community Forum**: https://forums.docker.com/
- **GitHub Issues**: https://github.com/docker/for-win/issues

---

**TL;DR**: Your main issue is Docker Desktop isn't running. Start Docker Desktop, wait for it to fully load (whale icon stops animating), then run `.\start-with-redis.ps1` again.
