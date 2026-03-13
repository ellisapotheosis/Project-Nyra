# Gitea WSL Troubleshooting Guide

Common issues and solutions for Gitea in WSL.

## Table of Contents

1. [WSL Issues](#wsl-issues)
2. [Docker Issues](#docker-issues)
3. [Gitea Issues](#gitea-issues)
4. [Database Issues](#database-issues)
5. [SSH Issues](#ssh-issues)
6. [Sync Issues](#sync-issues)
7. [Network Issues](#network-issues)
8. [Performance Issues](#performance-issues)

## WSL Issues

### WSL Not Starting

**Symptom**: `wsl` command fails or WSL doesn't start

**Solutions**:

```powershell
# Check WSL status
wsl --list --verbose

# Restart WSL
wsl --shutdown
wsl

# Check WSL version
wsl --version

# Update WSL
wsl --update

# Check Windows version
winver  # Should be 1903 or later
```

### Systemd Not Working

**Symptom**: Services don't start automatically

**Solutions**:

```bash
# Check systemd status
systemctl status

# Enable systemd in WSL
sudo tee /etc/wsl.conf > /dev/null <<EOF
[boot]
systemd=true
EOF

# Restart WSL
exit
# From Windows: wsl --shutdown
wsl
```

### WSL IP Changes

**Symptom**: Cannot access Gitea after WSL restart

**Solutions**:

```bash
# Get current WSL IP
hostname -I

# Update port forwarding (Windows PowerShell as Admin)
C:\Users\edane\bootstrap\wsl\port-forward.ps1
```

### Memory Issues

**Symptom**: WSL runs out of memory

**Solutions**:

Edit `C:\Users\edane\.wslconfig`:

```ini
[wsl2]
memory=8GB  # Increase if needed
swap=4GB
```

Restart WSL:

```powershell
wsl --shutdown
wsl
```

## Docker Issues

### Docker Not Starting

**Symptom**: `docker: command not found` or Docker daemon not running

**Solutions**:

```bash
# Check Docker status
sudo service docker status

# Start Docker
sudo service docker start

# Enable Docker at boot
sudo systemctl enable docker

# Check Docker installation
docker --version
docker compose version
```

### Permission Denied

**Symptom**: `permission denied while trying to connect to the Docker daemon socket`

**Solutions**:

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes (logout/login or)
newgrp docker

# Verify
docker ps
```

### Container Won't Start

**Symptom**: Container exits immediately or won't start

**Solutions**:

```bash
# Check container logs
docker compose logs gitea

# Check container status
docker compose ps

# Inspect container
docker inspect gitea-server

# Remove and recreate
docker compose down -v
docker compose up -d
```

### Out of Disk Space

**Symptom**: `no space left on device`

**Solutions**:

```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Check WSL disk usage
df -h
```

## Gitea Issues

### Cannot Access Web Interface

**Symptom**: Browser shows connection refused or timeout

**Solutions**:

```bash
# Check if Gitea is running
docker compose ps
curl http://localhost:3000/api/healthz

# Check logs
docker compose logs gitea

# Restart Gitea
docker compose restart gitea

# Check port binding
netstat -tulpn | grep 3000
```

### Admin User Creation Failed

**Symptom**: Cannot login with admin credentials

**Solutions**:

```bash
# Create admin user manually
docker compose exec gitea gitea admin user create \
  --username admin \
  --password your_password \
  --email admin@localhost \
  --admin

# Change admin password
docker compose exec gitea gitea admin user change-password \
  --username admin \
  --password new_password

# List users
docker compose exec gitea gitea admin user list
```

### Repository Clone Fails

**Symptom**: `fatal: unable to access` or `Permission denied`

**Solutions**:

```bash
# Check SSH key
ssh -T git@gitea-local

# Verify repository exists
curl http://localhost:3000/api/v1/repos/admin/repo-name

# Check permissions
docker compose exec gitea gitea admin repo list

# Fix permissions
docker compose exec gitea chown -R git:git /var/lib/gitea
```

### Slow Performance

**Symptom**: Web interface is slow or unresponsive

**Solutions**:

```bash
# Check resource usage
docker stats

# Increase cache size in .env
GITEA_CACHE_SIZE=1GB

# Restart with more resources
docker compose down
docker compose up -d

# Check Redis connection
docker compose exec gitea-redis redis-cli ping
```

## Database Issues

### Database Connection Failed

**Symptom**: `Failed to connect to database` in logs

**Solutions**:

```bash
# Check database status
docker compose ps gitea-db

# Check database logs
docker compose logs gitea-db

# Test connection
docker compose exec gitea-db psql -U gitea -d gitea -c "SELECT 1;"

# Restart database
docker compose restart gitea-db
```

### Database Corruption

**Symptom**: Database errors or data inconsistency

**Solutions**:

```bash
# Stop Gitea
docker compose stop gitea

# Check database integrity
docker compose exec gitea-db pg_dump -U gitea gitea > /dev/null

# Repair database
docker compose exec gitea-db vacuumdb -U gitea -d gitea --analyze

# Restart
docker compose start gitea
```

### Migration Errors

**Symptom**: Migration fails during startup

**Solutions**:

```bash
# Check migration status
docker compose logs gitea | grep migration

# Run migrations manually
docker compose exec gitea gitea migrate

# Rollback if needed
docker compose exec gitea gitea admin regenerate hooks
```

## SSH Issues

### SSH Connection Refused

**Symptom**: `Connection refused` when using git SSH

**Solutions**:

```bash
# Check SSH port
docker compose ps | grep 2222
netstat -tulpn | grep 2222

# Test SSH connection
ssh -vT git@localhost -p 2222

# Check SSH configuration
cat ~/.ssh/config

# Verify SSH key
cat ~/.ssh/gitea_rsa.pub
```

### SSH Key Not Working

**Symptom**: `Permission denied (publickey)`

**Solutions**:

```bash
# Generate new key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gitea_rsa

# Add key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/gitea_rsa

# Copy public key
cat ~/.ssh/gitea_rsa.pub

# Add to Gitea via web interface or API
curl -X POST http://localhost:3000/api/v1/user/keys \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"My Key\",\"key\":\"$(cat ~/.ssh/gitea_rsa.pub)\"}"
```

### SSH Host Key Verification

**Symptom**: `Host key verification failed`

**Solutions**:

```bash
# Remove old host key
ssh-keygen -R "[localhost]:2222"

# Disable strict checking (not recommended for production)
cat >> ~/.ssh/config <<EOF
Host gitea-local
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
```

## Sync Issues

### GitHub Sync Not Working

**Symptom**: Changes not syncing between GitHub and Gitea

**Solutions**:

```bash
# Check sync service status
systemctl status gitea-sync.timer
systemctl status gitea-sync.service

# View sync logs
journalctl -u gitea-sync.service -f

# Manual sync
cd /mnt/c/Users/edane/bootstrap/wsl/gitea
./sync-github.sh --once

# Re-setup sync
./sync-github.sh --setup
```

### Sync Conflicts

**Symptom**: Sync fails with merge conflicts

**Solutions**:

```bash
# Check conflict strategy in .env
echo $CONFLICT_STRATEGY

# Change to automatic resolution
# Edit .env: CONFLICT_STRATEGY=latest_wins

# Manual resolution
cd ~/.gitea-sync/your-repo
git status
git merge --abort  # Cancel conflict
./sync-github.sh --github-to-gitea  # Force from GitHub
# or
./sync-github.sh --gitea-to-github  # Force to GitHub
```

### Invalid GitHub Token

**Symptom**: `401 Unauthorized` or `Bad credentials`

**Solutions**:

```bash
# Test token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Generate new token at https://github.com/settings/tokens
# Update .env with new token
GITHUB_TOKEN=ghp_new_token

# Restart sync service
sudo systemctl restart gitea-sync.service
```

## Network Issues

### Port Already in Use

**Symptom**: `address already in use`

**Solutions**:

```bash
# Find process using port
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000

# Kill process
sudo kill -9 PID

# Change port in .env
GITEA_HTTP_PORT=3001

# Restart Gitea
docker compose down
docker compose up -d
```

### Cannot Access from Windows

**Symptom**: Cannot reach Gitea from Windows browser

**Solutions**:

```bash
# Check WSL IP
hostname -I

# Test from Windows
# From PowerShell:
curl http://WSL_IP:3000

# Setup port forwarding (as Admin)
C:\Users\edane\bootstrap\wsl\port-forward.ps1

# Check Windows Firewall
# Add rule for port 3000
```

### Cannot Access from Network

**Symptom**: Other machines cannot access Gitea

**Solutions**:

```powershell
# Run as Administrator
C:\Users\edane\bootstrap\wsl\port-forward.ps1

# Verify firewall rules
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Gitea*"}

# Test from another machine
curl http://YOUR_COMPUTER_NAME:3000
```

## Performance Issues

### High Memory Usage

**Symptom**: System slow, high memory consumption

**Solutions**:

```bash
# Check resource usage
docker stats

# Reduce container limits in .env
GITEA_MAX_CONNECTIONS=50

# Optimize database
docker compose exec gitea-db vacuumdb -U gitea -d gitea --analyze

# Reduce cache size
GITEA_CACHE_SIZE=256MB

# Restart services
docker compose restart
```

### Slow Repository Operations

**Symptom**: Cloning or pulling is slow

**Solutions**:

```bash
# Check disk I/O
iostat -x 1

# Optimize Git configuration
git config --global core.compression 0
git config --global http.postBuffer 524288000

# Clean up Gitea repository cache
docker compose exec gitea gitea admin regenerate hooks

# Rebuild repository index
docker compose exec gitea gitea doctor --run check-db-consistency
```

### Database Performance

**Symptom**: Slow database queries

**Solutions**:

```bash
# Analyze database
docker compose exec gitea-db psql -U gitea -d gitea -c "ANALYZE;"

# Vacuum database
docker compose exec gitea-db psql -U gitea -d gitea -c "VACUUM FULL;"

# Check slow queries
docker compose exec gitea-db psql -U gitea -d gitea -c "
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;"

# Increase shared buffers (edit docker-compose.yml)
```

## Diagnostic Commands

### Complete System Check

```bash
#!/bin/bash
echo "=== System Info ==="
uname -a
cat /etc/os-release

echo -e "\n=== WSL Info ==="
wsl.exe -l -v

echo -e "\n=== Docker Info ==="
docker --version
docker compose version
sudo service docker status

echo -e "\n=== Container Status ==="
docker compose ps

echo -e "\n=== Port Bindings ==="
netstat -tulpn | grep -E "3000|2222"

echo -e "\n=== Disk Usage ==="
df -h
docker system df

echo -e "\n=== Memory Usage ==="
free -h

echo -e "\n=== Gitea Health ==="
curl -f http://localhost:3000/api/healthz && echo "OK" || echo "FAILED"

echo -e "\n=== Service Status ==="
systemctl status gitea.service --no-pager
systemctl status gitea-sync.timer --no-pager

echo -e "\n=== Recent Logs ==="
docker compose logs --tail=20 gitea
```

Save as `check-system.sh` and run:

```bash
chmod +x check-system.sh
./check-system.sh
```

## Getting Help

### Log Collection

```bash
# Collect all logs
mkdir -p ~/gitea-debug
docker compose logs > ~/gitea-debug/docker-logs.txt
journalctl -u gitea.service > ~/gitea-debug/systemd-gitea.txt
journalctl -u gitea-sync.service > ~/gitea-debug/systemd-sync.txt
dmesg > ~/gitea-debug/dmesg.txt

# Create archive
tar czf ~/gitea-debug-$(date +%Y%m%d).tar.gz ~/gitea-debug
```

### Useful Resources

- Gitea Documentation: https://docs.gitea.io/
- Gitea Forum: https://discourse.gitea.io/
- GitHub Issues: https://github.com/go-gitea/gitea/issues
- WSL Documentation: https://docs.microsoft.com/en-us/windows/wsl/
- Docker Documentation: https://docs.docker.com/

### Support Channels

1. Check this troubleshooting guide
2. Review Gitea documentation
3. Search GitHub issues
4. Ask on Gitea forum
5. Create GitHub issue with logs
