# Project Nyra - Master Troubleshooting Guide

Comprehensive troubleshooting reference for the 4-PC distributed AI mortgage platform.

## 🎯 Quick Diagnosis

### Service Won't Start
```bash
# Check logs
docker compose logs -f [service-name]

# Check container status
docker ps -a | grep [service-name]

# Restart specific service
docker compose restart [service-name]

# Full restart
docker compose down && docker compose up -d
```

### Can't Connect to Service
```bash
# Check port availability
netstat -ano | findstr :[port]  # Windows
lsof -i :[port]                  # macOS

# Check network connectivity
curl -v http://10.0.0.1:[port]/health

# Check firewall rules
# Windows: Run as admin
netsh advfirewall firewall show rule name=all

# Check Docker network
docker network inspect nyra-net
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Check system resources
# Windows
wmic cpu get loadpercentage
wmic memorychip get capacity

# macOS
top -l 1 | head -n 10
```

---

## 🐳 Docker Issues

### Issue: Docker Daemon Not Running
**Symptoms**: `Cannot connect to the Docker daemon`

**Solutions**:
1. **Windows**: Open Docker Desktop, wait for startup
2. **macOS**: `open -a Docker`
3. **Check Status**:
   ```bash
   docker info
   ```
4. **Restart Docker**:
   - Windows: Restart Docker Desktop
   - macOS: `killall Docker && open -a Docker`

### Issue: Port Already in Use
**Symptoms**: `Bind for 0.0.0.0:XXXX failed: port is already allocated`

**Solutions**:
1. **Find Process Using Port**:
   ```bash
   # Windows
   netstat -ano | findstr :XXXX
   taskkill /PID [PID] /F

   # macOS
   lsof -ti :XXXX | xargs kill -9
   ```

2. **Change Port in docker-compose.yml**:
   ```yaml
   ports:
     - "YYYY:XXXX"  # Use different external port
   ```

3. **Stop Conflicting Service**:
   - IIS on Windows (port 80/443)
   - Apache/nginx on any system
   - Other Docker containers

### Issue: Container Keeps Restarting
**Symptoms**: Container status shows `Restarting (1) X seconds ago`

**Solutions**:
1. **Check Logs**:
   ```bash
   docker compose logs --tail=100 [service-name]
   ```

2. **Common Causes**:
   - Missing environment variables
   - Database connection failure
   - Insufficient memory
   - Port conflicts

3. **Disable Auto-Restart**:
   ```yaml
   restart: "no"  # Temporarily for debugging
   ```

4. **Increase Memory**:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 4G
   ```

### Issue: Out of Disk Space
**Symptoms**: `No space left on device`

**Solutions**:
1. **Clean Docker System**:
   ```bash
   docker system prune -a --volumes
   # WARNING: This removes ALL unused containers, images, volumes
   ```

2. **Check Disk Usage**:
   ```bash
   docker system df
   ```

3. **Remove Unused Volumes**:
   ```bash
   docker volume ls
   docker volume rm [volume-name]
   ```

4. **Change Docker Root**:
   - Windows: Docker Desktop → Settings → Resources → Advanced → Disk image location
   - macOS: Docker Desktop → Preferences → Resources → Advanced → Disk image location

### Issue: Image Pull Fails
**Symptoms**: `error pulling image configuration`, `TLS handshake timeout`

**Solutions**:
1. **Check Internet Connection**
2. **Try Different Registry**:
   ```bash
   docker pull ghcr.io/[image]  # GitHub Container Registry
   docker pull docker.io/[image]  # Docker Hub
   ```

3. **Configure Proxy** (if behind firewall):
   ```bash
   # Create/edit ~/.docker/config.json
   {
     "proxies": {
       "default": {
         "httpProxy": "http://proxy.example.com:8080",
         "httpsProxy": "http://proxy.example.com:8080"
       }
     }
   }
   ```

4. **Use Cached Images**:
   ```yaml
   image: [image-name]:latest
   pull_policy: never  # Use local image only
   ```

---

## 🌐 Network Issues

### Issue: Services Can't Communicate
**Symptoms**: Service A can't reach Service B

**Solutions**:
1. **Check Network Configuration**:
   ```bash
   docker network inspect nyra-net
   ```

2. **Verify Services on Same Network**:
   ```yaml
   services:
     service-a:
       networks:
         - nyra-net
     service-b:
       networks:
         - nyra-net
   ```

3. **Test Connectivity**:
   ```bash
   docker exec [container-a] ping [container-b]
   docker exec [container-a] curl http://[container-b]:[port]/health
   ```

4. **Check DNS Resolution**:
   ```bash
   docker exec [container] nslookup [service-name]
   ```

### Issue: Can't Access Services from Host
**Symptoms**: Can't connect to `http://10.0.0.1:6000`

**Solutions**:
1. **Check Port Mapping**:
   ```bash
   docker compose ps
   # Look for: 0.0.0.0:6000->6000/tcp
   ```

2. **Check Firewall**:
   ```bash
   # Windows: Allow Docker through firewall
   # macOS: System Preferences → Security & Privacy → Firewall → Firewall Options
   ```

3. **Use Correct IP**:
   - From same PC: `localhost:6000` or `127.0.0.1:6000`
   - From different PC: `10.0.0.1:6000` (LAN IP)
   - From anywhere: `100.64.0.X:6000` (Tailscale IP)

4. **Check Service Health**:
   ```bash
   docker compose exec [service] curl http://localhost:[port]/health
   ```

### Issue: Static IP Not Working
**Symptoms**: PC can't communicate on `10.0.0.X` network

**Solutions**:
1. **Verify IP Configuration**:
   ```bash
   # Windows
   ipconfig /all

   # macOS
   ifconfig
   ```

2. **Reconfigure Static IP**:
   ```bash
   # Windows (run as admin)
   netsh interface ip set address "Ethernet" static 10.0.0.1 255.255.255.0 10.0.0.1

   # macOS
   networksetup -setmanual "Ethernet" 10.0.0.1 255.255.255.0 10.0.0.1
   ```

3. **Check Physical Connections**:
   - All 4 PCs connected to same switch/router
   - Ethernet cables properly seated
   - Link lights blinking

4. **Test Connectivity**:
   ```bash
   ping 10.0.0.1
   ping 10.0.0.2
   ping 10.0.0.3
   ping 10.0.0.4
   ```

### Issue: Tailscale Not Connecting
**Symptoms**: `tailscale status` shows disconnected

**Solutions**:
1. **Check Tailscale Status**:
   ```bash
   tailscale status
   ```

2. **Restart Tailscale**:
   ```bash
   tailscale down
   tailscale up
   ```

3. **Reauthenticate**:
   ```bash
   tailscale up --authkey=[your-key]
   ```

4. **Check Firewall**:
   - Allow UDP 41641 (Tailscale)
   - Allow WireGuard traffic

5. **Use Login URL** (if auth key fails):
   ```bash
   tailscale up
   # Opens browser for authentication
   ```

---

## 🔑 API & Authentication Issues

### Issue: API Rate Limits
**Symptoms**: `429 Too Many Requests`, `Rate limit exceeded`

**Solutions**:
1. **Check Rate Limits**:
   - Anthropic: 50 requests/min (free), 1000 requests/min (paid)
   - OpenRouter: Varies by model
   - Google Gemini: 60 requests/min (free), 1000 requests/min (paid)

2. **Enable Caching** (Nexus Router):
   ```yaml
   environment:
     - CACHE_ENABLED=true
     - CACHE_TTL=3600  # 1 hour
   ```

3. **Use Fallback Providers**:
   ```yaml
   environment:
     - DEFAULT_PROVIDER=anthropic
     - FALLBACK_PROVIDERS=openrouter,google
   ```

4. **Implement Exponential Backoff**:
   ```python
   import time

   def api_call_with_retry(func, max_retries=5):
       for attempt in range(max_retries):
           try:
               return func()
           except RateLimitError:
               wait = 2 ** attempt  # 1s, 2s, 4s, 8s, 16s
               time.sleep(wait)
       raise Exception("Max retries exceeded")
   ```

### Issue: Invalid API Key
**Symptoms**: `401 Unauthorized`, `Invalid API key`

**Solutions**:
1. **Verify API Key Format**:
   - Anthropic: `sk-ant-api03-XXXXX`
   - OpenRouter: `sk-or-v1-XXXXX`
   - OpenAI: `sk-XXXXX`
   - Google: `AIzaSyXXXXX`

2. **Check Environment Variables**:
   ```bash
   docker compose exec [service] env | grep API_KEY
   ```

3. **Reload Environment**:
   ```bash
   docker compose down
   docker compose up -d  # Reloads .env file
   ```

4. **Test API Key**:
   ```bash
   curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
     https://api.anthropic.com/v1/messages
   ```

### Issue: Secrets Not Loading
**Symptoms**: `ANTHROPIC_API_KEY is not set`

**Solutions**:
1. **Check .env File**:
   ```bash
   cat .env | grep ANTHROPIC_API_KEY
   ```

2. **Verify File Location**:
   - Must be in same directory as `docker-compose.yml`
   - Named exactly `.env` (not `env.txt` or `.env.local`)

3. **Check File Permissions**:
   ```bash
   # Should be readable
   chmod 644 .env
   ```

4. **Use Infisical** (recommended for production):
   ```yaml
   environment:
     - INFISICAL_TOKEN=${INFISICAL_TOKEN}
     - INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
   ```

---

## 💾 Database Issues

### Issue: PostgreSQL Connection Refused
**Symptoms**: `FATAL: password authentication failed`, `Connection refused`

**Solutions**:
1. **Check PostgreSQL Status**:
   ```bash
   docker compose ps postgres
   docker compose logs postgres
   ```

2. **Verify Connection String**:
   ```
   postgresql://user:password@host:5432/database
   ```

3. **Check Password**:
   ```bash
   docker compose exec postgres psql -U postgres
   # If this works, password is correct
   ```

4. **Reset Password**:
   ```bash
   docker compose exec postgres psql -U postgres
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```

5. **Check Network**:
   ```bash
   docker exec [app-container] pg_isready -h postgres -U postgres
   ```

### Issue: Database Migration Fails
**Symptoms**: `relation "users" does not exist`, `Migration failed`

**Solutions**:
1. **Run Migrations Manually**:
   ```bash
   # For TwentyCRM
   docker compose exec twentycrm npm run migrate

   # For n8n
   docker compose exec n8n n8n migrate

   # For Dify
   docker compose exec dify flask db upgrade
   ```

2. **Check Migration Status**:
   ```bash
   docker compose exec postgres psql -U [user] -d [database]
   \dt  # List tables
   ```

3. **Reset Database** (CAUTION: Deletes all data):
   ```bash
   docker compose down -v  # Removes volumes
   docker compose up -d
   ```

### Issue: Out of Connections
**Symptoms**: `FATAL: sorry, too many clients already`

**Solutions**:
1. **Increase Max Connections**:
   ```yaml
   postgres:
     command: postgres -c max_connections=200
   ```

2. **Check Active Connections**:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

3. **Kill Idle Connections**:
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle' AND state_change < current_timestamp - INTERVAL '5 minutes';
   ```

4. **Use Connection Pooling** (PgBouncer):
   ```yaml
   pgbouncer:
     image: pgbouncer/pgbouncer
     environment:
       - DATABASES_HOST=postgres
       - DATABASES_DBNAME=mydb
       - POOL_MODE=transaction
       - MAX_CLIENT_CONN=1000
       - DEFAULT_POOL_SIZE=25
   ```

---

## 🎮 GPU Issues

### Issue: GPU Not Detected by Ollama
**Symptoms**: `No CUDA-capable device detected`, Ollama using CPU

**Solutions**:
1. **Check NVIDIA Docker Runtime**:
   ```bash
   docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
   ```

2. **Install NVIDIA Container Toolkit**:
   ```bash
   # Windows: Included with Docker Desktop + NVIDIA drivers

   # Linux:
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
   sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

3. **Update Docker Compose**:
   ```yaml
   ollama:
     deploy:
       resources:
         reservations:
           devices:
             - driver: nvidia
               count: all
               capabilities: [gpu]
   ```

4. **Check NVIDIA Drivers**:
   ```bash
   nvidia-smi
   # Should show GPU info
   ```

### Issue: Out of GPU Memory
**Symptoms**: `CUDA out of memory`, `RuntimeError: CUDA error`

**Solutions**:
1. **Check GPU Usage**:
   ```bash
   nvidia-smi
   watch -n 1 nvidia-smi  # Monitor in real-time
   ```

2. **Reduce Concurrent Models**:
   ```yaml
   ollama:
     environment:
       - OLLAMA_MAX_LOADED_MODELS=2  # Reduce from 3
   ```

3. **Use Smaller Models**:
   - Instead of `codellama:13b`, use `codellama:7b`
   - Instead of `llama3.1:8b`, use `mistral:7b`

4. **Clear GPU Cache**:
   ```bash
   docker compose restart ollama
   ```

### Issue: Slow Inference on GPU
**Symptoms**: Generation takes >10 seconds per token

**Solutions**:
1. **Check GPU Utilization**:
   ```bash
   nvidia-smi dmon -s u
   # Should show >80% utilization
   ```

2. **Optimize Batch Size**:
   ```yaml
   ollama:
     environment:
       - OLLAMA_NUM_PARALLEL=4
   ```

3. **Check Power Limit**:
   ```bash
   nvidia-smi -q -d POWER
   # Should be at max TDP
   ```

4. **Update CUDA Drivers**:
   - Visit https://developer.nvidia.com/cuda-downloads
   - Install latest CUDA toolkit

---

## 📊 Monitoring Issues

### Issue: Prometheus Not Scraping Targets
**Symptoms**: Targets show as `DOWN` in Prometheus UI

**Solutions**:
1. **Check Prometheus Config**:
   ```yaml
   # prometheus.yml
   scrape_configs:
     - job_name: 'services'
       static_configs:
         - targets: ['nexus-router:6000', 'letta:8283']
   ```

2. **Verify Target Accessibility**:
   ```bash
   docker exec prometheus curl http://nexus-router:6000/metrics
   ```

3. **Check Service Metrics Endpoint**:
   ```bash
   curl http://10.0.0.1:6000/metrics
   # Should return Prometheus-format metrics
   ```

4. **Reload Prometheus Config**:
   ```bash
   docker exec prometheus kill -HUP 1
   ```

### Issue: Grafana Shows No Data
**Symptoms**: Dashboards empty, "No data" message

**Solutions**:
1. **Check Prometheus Data Source**:
   - Grafana → Configuration → Data Sources → Prometheus
   - URL: `http://prometheus:9090`
   - Test connection

2. **Verify Prometheus Has Data**:
   ```bash
   curl http://10.0.0.1:9090/api/v1/query?query=up
   ```

3. **Check Time Range**:
   - Ensure dashboard time range includes recent data
   - Try "Last 5 minutes"

4. **Import Default Dashboards**:
   - Grafana → Dashboards → Import
   - Dashboard ID: 1860 (Node Exporter Full)

### Issue: Loki Not Receiving Logs
**Symptoms**: No logs in Grafana Explore

**Solutions**:
1. **Check Promtail Status**:
   ```bash
   docker compose logs promtail
   ```

2. **Verify Loki Endpoint**:
   ```yaml
   # promtail-config.yml
   clients:
     - url: http://loki:3100/loki/api/v1/push
   ```

3. **Test Loki Ingestion**:
   ```bash
   curl -H "Content-Type: application/json" \
     -X POST http://10.0.0.1:3100/loki/api/v1/push \
     --data '{"streams": [{"stream": {"job": "test"}, "values": [["'$(date +%s)000000000'", "test log"]]}]}'
   ```

4. **Check Log Paths**:
   ```yaml
   # promtail-config.yml
   scrape_configs:
     - job_name: docker
       docker_sd_configs:
         - host: unix:///var/run/docker.sock
   ```

---

## 🔧 Service-Specific Issues

### Nexus Router Issues

**Issue: Routing to Wrong Provider**
```yaml
# Check routing configuration
environment:
  - DEFAULT_PROVIDER=anthropic
  - FALLBACK_PROVIDERS=openrouter,google
  - PROVIDER_PRIORITY=anthropic>openrouter>google
```

**Issue: High Latency**
- Enable caching: `CACHE_ENABLED=true`
- Use connection pooling
- Check network latency to provider APIs

### TwentyCRM Issues

**Issue: Can't Login**
1. Reset admin password:
   ```bash
   docker compose exec twentycrm npm run workspace:seed:dev
   ```
2. Check JWT secret is set:
   ```bash
   docker compose exec twentycrm env | grep JWT_SECRET
   ```

**Issue: Slow Performance**
- Add database indexes
- Enable Redis caching
- Increase PostgreSQL max_connections

### n8n Issues

**Issue: Workflow Execution Fails**
1. Check execution logs in n8n UI
2. Verify webhook URLs use correct IP
3. Test credentials in n8n credential manager

**Issue: Can't Save Workflows**
- Check PostgreSQL connection
- Verify sufficient disk space
- Check n8n logs: `docker compose logs n8n`

### Dify Issues

**Issue: Chat Not Working**
1. Check LLM provider configuration
2. Verify API keys in Dify settings
3. Test conversation API:
   ```bash
   curl -X POST http://10.0.0.1:3001/v1/chat-messages \
     -H "Content-Type: application/json" \
     -d '{"query": "test", "conversation_id": ""}'
   ```

### Ollama Issues

**Issue: Model Download Stuck**
```bash
docker exec ollama ollama pull llama3.1:8b --progress
```

**Issue: Model Not Found**
```bash
# List downloaded models
docker exec ollama ollama list

# Pull model manually
docker exec ollama ollama pull [model-name]
```

---

## 🚨 Emergency Procedures

### Complete System Reset
```bash
# CAUTION: This deletes ALL data

# 1. Stop all services
docker compose down -v

# 2. Clean Docker system
docker system prune -a --volumes -f

# 3. Remove Docker networks
docker network prune -f

# 4. Restart Docker
# Windows: Restart Docker Desktop
# macOS: killall Docker && open -a Docker

# 5. Redeploy
docker compose up -d
```

### Backup Critical Data
```bash
# Backup PostgreSQL databases
docker compose exec postgres-twentycrm pg_dump -U twentycrm twentycrm > backup_twentycrm.sql
docker compose exec postgres-dify pg_dump -U dify dify > backup_dify.sql

# Backup volumes
docker run --rm -v twentycrm-data:/data -v $(pwd):/backup alpine tar czf /backup/twentycrm-backup.tar.gz -C /data .

# Backup .env and configs
cp .env .env.backup
cp -r infra/monitoring infra/monitoring.backup
```

### Restore from Backup
```bash
# Restore PostgreSQL
docker compose exec -T postgres-twentycrm psql -U twentycrm twentycrm < backup_twentycrm.sql

# Restore volumes
docker run --rm -v twentycrm-data:/data -v $(pwd):/backup alpine tar xzf /backup/twentycrm-backup.tar.gz -C /data
```

---

## 📞 Getting Help

### Log Collection for Support
```bash
# Collect all logs
docker compose logs --no-color > all-services.log

# Collect specific service logs
docker compose logs [service-name] --no-color --tail=1000 > service.log

# Collect system info
docker info > docker-info.txt
docker version > docker-version.txt
```

### Useful Diagnostic Commands
```bash
# Full system status
docker compose ps
docker stats --no-stream
docker network ls
docker volume ls

# Service health checks
docker compose exec nexus-router curl http://localhost:6000/health
docker compose exec letta curl http://localhost:8283/health
docker compose exec mem0 curl http://localhost:4321/health

# Network diagnostics
docker network inspect nyra-net
docker exec [container] netstat -tulpn
```

### Common Log Locations
- **Docker logs**: `docker compose logs [service]`
- **System logs (Windows)**: Event Viewer
- **System logs (macOS)**: `/var/log/system.log`
- **Application logs**: Check service-specific volumes

---

*Last Updated: 2026-01-13*
*Version: 1.0*
*Maintainer: Project Nyra Team*
