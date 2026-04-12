# Cloudflare Tunnels - Troubleshooting Guide

**Last Updated**: 2026-01-15
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Quick Diagnostics](#-quick-diagnostics)
2. [Tunnel Connection Issues](#-tunnel-connection-issues)
3. [DNS & Routing Issues](#-dns--routing-issues)
4. [Access & Authentication Issues](#-access--authentication-issues)
5. [Performance Issues](#-performance-issues)
6. [Service-Specific Issues](#-service-specific-issues)
7. [Monitoring & Debugging](#-monitoring--debugging)
8. [Common Error Messages](#-common-error-messages)

---

## 🔍 Quick Diagnostics

### Run This First

```bash
# On orchestrator
ssh nyra@10.0.0.1

# 1. Check tunnel service
sudo systemctl status cloudflared

# 2. Check tunnel connections
cloudflared tunnel info nyra-orchestrator

# 3. Check DNS
dig grafana.example.com +short

# 4. Test local service
curl http://localhost:3003  # Grafana

# 5. Test external access
curl https://grafana.example.com  # Should show Access page HTML
```

### Health Check Script

Create `~/check-tunnel-health.sh`:

```bash
#!/bin/bash

echo "=== Cloudflare Tunnel Health Check ==="
echo ""

# 1. Service Status
echo "1. Checking cloudflared service..."
if systemctl is-active --quiet cloudflared; then
    echo "   ✅ cloudflared is running"
else
    echo "   ❌ cloudflared is NOT running"
    echo "   Fix: sudo systemctl start cloudflared"
fi

# 2. Tunnel Connections
echo ""
echo "2. Checking tunnel connections..."
CONNECTIONS=$(cloudflared tunnel info nyra-orchestrator 2>/dev/null | grep -c "Registered")
if [ "$CONNECTIONS" -ge 4 ]; then
    echo "   ✅ Tunnel has $CONNECTIONS connections (healthy)"
elif [ "$CONNECTIONS" -gt 0 ]; then
    echo "   ⚠️  Tunnel has $CONNECTIONS connections (degraded, expected 4)"
else
    echo "   ❌ Tunnel has NO connections"
    echo "   Fix: Check logs: sudo journalctl -u cloudflared -n 50"
fi

# 3. DNS Resolution
echo ""
echo "3. Checking DNS..."
if dig +short grafana.example.com @1.1.1.1 | grep -q .; then
    echo "   ✅ DNS resolving correctly"
else
    echo "   ❌ DNS not resolving"
    echo "   Fix: Check DNS records in Cloudflare dashboard"
fi

# 4. Local Services
echo ""
echo "4. Checking local services..."
for PORT in 3003 5678 8080 8001; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200\|302\|401"; then
        echo "   ✅ Port $PORT responding"
    else
        echo "   ❌ Port $PORT not responding"
        echo "   Fix: Check docker ps | grep <service>"
    fi
done

# 5. External Access
echo ""
echo "5. Checking external access..."
if curl -s -o /dev/null -w "%{http_code}" https://grafana.example.com | grep -q "200\|302"; then
    echo "   ✅ External access working"
else
    echo "   ❌ External access failing"
    echo "   Fix: Check tunnel ingress rules and Access policies"
fi

echo ""
echo "=== Health Check Complete ==="
```

**Usage**:
```bash
chmod +x ~/check-tunnel-health.sh
./check-tunnel-health.sh
```

---

## 🚇 Tunnel Connection Issues

### Issue: Tunnel Service Won't Start

**Symptoms**:
- `systemctl status cloudflared` shows "failed" or "inactive"
- No tunnel connections in dashboard

**Debug**:
```bash
# Check service logs
sudo journalctl -u cloudflared -n 100 --no-pager

# Try running manually
cloudflared --config ~/.cloudflared/config.yml tunnel run

# Common errors in output:
# - "credential file not found"
# - "permission denied"
# - "invalid tunnel configuration"
```

**Solutions**:

#### 1. Credentials File Missing

```bash
# Verify credentials exist
ls -la ~/.cloudflared/*.json

# If missing, re-authenticate
cloudflared tunnel login

# Or regenerate tunnel
cloudflared tunnel create nyra-orchestrator
```

#### 2. Configuration File Errors

```bash
# Validate config
cloudflared tunnel ingress validate

# Common issues:
# - Missing tunnel ID
# - Incorrect credentials-file path
# - Missing catch-all rule
# - YAML syntax errors
```

**Fix config.yml**:
```yaml
# Ensure these are set correctly
tunnel: <YOUR-TUNNEL-ID>  # Get from: cloudflared tunnel list
credentials-file: /home/nyra/.cloudflared/<TUNNEL-ID>.json

ingress:
  # Your ingress rules
  - hostname: grafana.example.com
    service: http://localhost:3003

  # MUST have catch-all (always last!)
  - service: http_status:404
```

#### 3. Permission Issues

```bash
# Check file permissions
ls -la ~/.cloudflared/

# Should be:
# -rw------- (600) for .json files
# -rw-r--r-- (644) for .yml files

# Fix permissions
chmod 600 ~/.cloudflared/*.json
chmod 644 ~/.cloudflared/config.yml
```

#### 4. Service File Issues

```bash
# Check service file path
sudo cat /etc/systemd/system/cloudflared.service

# Verify ExecStart path
which cloudflared  # Should match ExecStart

# Fix and reload
sudo systemctl daemon-reload
sudo systemctl restart cloudflared
```

### Issue: Tunnel Connects But Shows 0-2 Connections

**Symptoms**:
- `cloudflared tunnel info` shows < 4 connections
- Dashboard shows "Unhealthy" or "Degraded"

**Explanation**: Cloudflare creates 4 redundant connections for HA. < 4 means degraded state.

**Debug**:
```bash
# Check logs for connection issues
sudo journalctl -u cloudflared -f

# Look for:
# - "failed to register tunnel connection"
# - "connection timeout"
# - "TLS handshake failed"
```

**Solutions**:

#### 1. Network Connectivity

```bash
# Test outbound HTTPS
curl https://cloudflare.com

# Test outbound QUIC (UDP 7844)
sudo nc -vzu cloudflare.com 7844

# If blocked, check firewall:
sudo ufw status
sudo iptables -L
```

**Allow QUIC**:
```bash
# UFW
sudo ufw allow out 7844/udp

# iptables
sudo iptables -A OUTPUT -p udp --dport 7844 -j ACCEPT
```

#### 2. Protocol Fallback

If QUIC is blocked, force HTTP/2:

```yaml
# config.yml
protocol: http2  # Instead of quic (default)
```

```bash
# Restart
sudo systemctl restart cloudflared
```

#### 3. Resource Constraints

```bash
# Check system resources
free -h
df -h
top

# If low memory, increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Issue: Tunnel Disconnects Randomly

**Symptoms**:
- Tunnel works intermittently
- "Connection lost" in logs
- Services unreachable periodically

**Debug**:
```bash
# Monitor connection stability
watch -n 5 'cloudflared tunnel info nyra-orchestrator'

# Check for network issues
ping -c 100 1.1.1.1 | grep loss

# Check system logs
dmesg | tail -50
```

**Solutions**:

#### 1. Network Stability

```bash
# Test for packet loss
mtr cloudflare.com

# Check for DNS issues
systemd-resolve --status

# Test sustained connection
curl -v --keepalive-time 60 https://cloudflare.com
```

#### 2. Restart Policy

Update service file for aggressive restart:

```ini
# /etc/systemd/system/cloudflared.service
[Service]
Restart=always
RestartSec=10s  # Restart after 10 seconds
StartLimitBurst=10
StartLimitIntervalSec=60
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart cloudflared
```

#### 3. Connection Timeout Tuning

```yaml
# config.yml
# Add connection tuning
no-chunked-encoding: true
grace-period: 30s
heartbeat-interval: 10s
heartbeat-count: 3
retries: 5
```

---

## 🌐 DNS & Routing Issues

### Issue: DNS Not Resolving

**Symptoms**:
- `dig grafana.example.com` returns NXDOMAIN
- Browser shows "DNS_PROBE_FINISHED_NXDOMAIN"

**Debug**:
```bash
# Check DNS records
cloudflared tunnel route list

# Test with Cloudflare DNS
dig grafana.example.com @1.1.1.1

# Test with Google DNS
dig grafana.example.com @8.8.8.8

# Check nameservers
dig NS example.com +short
```

**Solutions**:

#### 1. Create DNS Records

```bash
# Via CLI
cloudflared tunnel route dns nyra-orchestrator grafana.example.com

# Verify
cloudflared tunnel route list
```

#### 2. Manual DNS (Dashboard)

```
Dashboard → example.com → DNS → Add Record

Type: CNAME
Name: grafana
Target: <TUNNEL-ID>.cfargotunnel.com
Proxy: Enabled (orange cloud)
```

#### 3. Wait for Propagation

```bash
# DNS can take 5-60 minutes to propagate

# Check propagation
while ! dig grafana.example.com @1.1.1.1 +short | grep -q .; do
    echo "Still propagating... (waiting 30s)"
    sleep 30
done
echo "DNS propagated!"
```

### Issue: Wrong Service Responding

**Symptoms**:
- Visiting grafana.example.com shows n8n interface
- Services crossed/mixed up

**Debug**:
```bash
# Test ingress routing
cloudflared tunnel ingress rule https://grafana.example.com
# Should show: http://localhost:3003

cloudflared tunnel ingress rule https://n8n.example.com
# Should show: http://localhost:5678
```

**Solutions**:

#### 1. Check Ingress Order

Ingress rules are evaluated **top to bottom**, first match wins:

```yaml
# ❌ WRONG - catch-all at top
ingress:
  - service: http://localhost:3000  # Matches everything!
  - hostname: grafana.example.com
    service: http://localhost:3003  # Never reached

# ✅ CORRECT - specific rules first
ingress:
  - hostname: grafana.example.com
    service: http://localhost:3003
  - hostname: n8n.example.com
    service: http://localhost:5678
  - service: http_status:404  # Catch-all last
```

#### 2. Restart After Config Change

```bash
# Edit config
nano ~/.cloudflared/config.yml

# Validate
cloudflared tunnel ingress validate

# Restart
sudo systemctl restart cloudflared

# Verify
cloudflared tunnel ingress rule https://grafana.example.com
```

---

## 🔐 Access & Authentication Issues

### Issue: "You Don't Have Access"

**Symptoms**:
- Access denied page
- Blocked after email authentication
- Can't reach service even with valid credentials

**Debug**:

```
Dashboard → Zero Trust → Logs → Access
→ Filter by your email
→ Look for "deny" actions
```

**Common causes**:
1. Email not in allowlist
2. Country blocked
3. IP blocked
4. Device posture failed (if enabled)

**Solutions**:

#### 1. Update Access Policy

```
Dashboard → Zero Trust → Access → Applications
→ Select application
→ Policies → Edit

Add email to "Include" list
```

#### 2. Check Policy Order

Policies are evaluated **top to bottom**:

```yaml
# ❌ WRONG - deny blocks everything
Policies:
  1. Deny: Country = China (action: BLOCK)
  2. Allow: Email = admin@example.com (action: ALLOW)
  # Admin gets blocked by #1!

# ✅ CORRECT - allow first
Policies:
  1. Allow: Email = admin@example.com (action: ALLOW)
  2. Deny: Country = China (action: BLOCK)
```

#### 3. Bypass Access (Testing Only)

**Temporarily disable Access** for debugging:

```
Dashboard → Application → Settings
→ Disable "Enable Access"
→ Test direct access
→ Re-enable after testing
```

### Issue: Service Token Not Working

**Symptoms**:
- `curl` with service token returns 403
- "Invalid client credentials"

**Debug**:
```bash
# Test token
curl -I \
  -H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET" \
  https://api.example.com/health

# Should return 200 or 302, not 403
```

**Solutions**:

#### 1. Verify Token Exists

```
Dashboard → Zero Trust → Access → Service Auth
→ Find your token
→ Check "Last Used" timestamp
```

#### 2. Check Token Scope

Ensure token has access to application:

```
Dashboard → Application → Policies
→ Add service token rule:

Rule: Allow Service Token
Include: Service Token = <your-token-name>
```

#### 3. Regenerate Token

```
Dashboard → Service Tokens
→ Revoke old token
→ Create new token
→ Update environment variables
```

### Issue: Too Many Redirects

**Symptoms**:
- Browser shows "ERR_TOO_MANY_REDIRECTS"
- Infinite redirect loop

**Causes**:
1. SSL/TLS mode misconfiguration
2. Application force-redirects to HTTPS
3. Access cookie issue

**Solutions**:

#### 1. Fix SSL/TLS Mode

```
Dashboard → SSL/TLS → Overview
→ Set to "Full" or "Full (strict)"

NOT "Flexible" (causes redirect loops)
```

#### 2. Clear Access Cookies

```javascript
// In browser console
document.cookie.split(";").forEach(c => {
  if (c.includes("cloudflareaccess")) {
    document.cookie = c.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
  }
});
```

#### 3. Check Origin Configuration

Some apps need config changes:

```yaml
# Grafana: grafana.ini
[server]
root_url = https://grafana.example.com

# n8n: environment variables
N8N_HOST=n8n.example.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.example.com/
```

---

## ⚡ Performance Issues

### Issue: Slow Response Times

**Symptoms**:
- Pages load slowly (> 3 seconds)
- API requests timeout
- High latency

**Debug**:
```bash
# Test latency
time curl -so /dev/null https://grafana.example.com

# Test with detailed timing
curl -w "@curl-format.txt" -o /dev/null -s https://grafana.example.com
```

**curl-format.txt**:
```
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
```

**Solutions**:

#### 1. Enable QUIC

```yaml
# config.yml
protocol: quic  # Faster than HTTP/2
```

#### 2. Optimize Origin Timeouts

```yaml
ingress:
  - hostname: api.example.com
    service: http://localhost:8001
    originRequest:
      connectTimeout: 5s  # Reduce from 30s
      noHappyEyeballs: false
      keepAliveConnections: 10
      keepAliveTimeout: 90s
```

#### 3. Tune cloudflared Resources

```bash
# Increase file descriptors
sudo bash -c 'echo "fs.file-max = 2097152" >> /etc/sysctl.conf'
sudo sysctl -p

# Update service file
sudo nano /etc/systemd/system/cloudflared.service
```

```ini
[Service]
LimitNOFILE=65536  # Increase fd limit
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart cloudflared
```

#### 4. Check Origin Performance

```bash
# Test local service speed
time curl -so /dev/null http://localhost:3003

# If slow, issue is origin, not tunnel
# - Check Docker logs
# - Check resource usage
# - Optimize service
```

### Issue: High Bandwidth Usage

**Debug**:
```
Dashboard → Zero Trust → Analytics → Tunnel
→ Check "Data Transfer" graph
```

**Solutions**:

#### 1. Enable Compression

```yaml
# config.yml
ingress:
  - hostname: api.example.com
    service: http://localhost:8001
    originRequest:
      disableChunkedEncoding: false  # Allow compression
```

#### 2. Implement Caching

```
Dashboard → Caching → Configuration
→ Create page rules for static assets
```

Example:
```
*.example.com/static/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month
```

---

## 🔧 Service-Specific Issues

### Grafana

**Issue**: Login redirects fail

**Solution**:
```ini
# grafana.ini
[server]
root_url = https://grafana.example.com
serve_from_sub_path = false

[auth]
cookie_secure = true
cookie_samesite = none
```

### n8n

**Issue**: Webhooks not working

**Solution**:
```bash
# Environment variables
N8N_WEBHOOK_URL=https://n8n.example.com/
N8N_PROTOCOL=https
WEBHOOK_TUNNEL_URL=https://n8n.example.com/
```

### Infisical

**Issue**: WebSocket connection fails

**Solution**:
```yaml
# config.yml
ingress:
  - hostname: secrets.example.com
    service: http://localhost:8080
    originRequest:
      noTLSVerify: false
      http2Origin: true  # Enable HTTP/2 for WebSockets
```

---

## 📊 Monitoring & Debugging

### Enable Debug Logging

```yaml
# config.yml
loglevel: debug  # Options: debug, info, warn, error
logfile: /var/log/cloudflared.log
```

```bash
sudo systemctl restart cloudflared

# Watch logs
sudo tail -f /var/log/cloudflared.log
```

### Metrics Endpoint

```yaml
# config.yml
metrics: localhost:9090
```

**Query metrics**:
```bash
curl http://localhost:9090/metrics | grep cloudflared
```

**Key metrics**:
- `cloudflared_tunnel_total_requests`
- `cloudflared_tunnel_response_by_code`
- `cloudflared_tunnel_server_locations`
- `cloudflared_tunnel_ha_connections`

### Prometheus Integration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'cloudflared'
    static_configs:
      - targets: ['localhost:9090']
```

### Grafana Dashboard

Import dashboard for Cloudflare Tunnel metrics:
- Dashboard ID: 17798
- Or create custom dashboard with key metrics

---

## ❗ Common Error Messages

### "failed to sufficiently increase receive buffer size"

**Cause**: UDP buffer too small

**Fix**:
```bash
sudo sysctl -w net.core.rmem_max=2500000
sudo sysctl -w net.core.wmem_max=2500000

# Persist
sudo bash -c 'cat >> /etc/sysctl.conf << EOF
net.core.rmem_max=2500000
net.core.wmem_max=2500000
EOF'
```

### "failed to dial origin"

**Cause**: Service not running or wrong port

**Fix**:
```bash
# Check service
docker ps | grep <service-name>

# Check port
sudo netstat -tlnp | grep <port>

# Start service
docker start <container>
```

### "context deadline exceeded"

**Cause**: Timeout reaching origin

**Fix**:
```yaml
# config.yml - increase timeout
ingress:
  - hostname: slow-api.example.com
    service: http://localhost:8000
    originRequest:
      connectTimeout: 60s  # Increase from default 30s
```

### "tunnel credentials not found"

**Cause**: Missing or wrong path to credentials

**Fix**:
```bash
# Find credentials
ls -la ~/.cloudflared/*.json

# Update config.yml with correct path
credentials-file: /home/nyra/.cloudflared/<correct-uuid>.json
```

---

## 🆘 Emergency Recovery

### Complete Reset

If everything is broken:

```bash
# 1. Stop service
sudo systemctl stop cloudflared

# 2. Backup config
cp ~/.cloudflared/config.yml ~/.cloudflared/config.yml.backup

# 3. Delete tunnel
cloudflared tunnel delete nyra-orchestrator

# 4. Recreate tunnel
cloudflared tunnel create nyra-orchestrator

# 5. Update config with new tunnel ID
nano ~/.cloudflared/config.yml

# 6. Recreate DNS
cloudflared tunnel route dns nyra-orchestrator grafana.example.com
# ... (repeat for all services)

# 7. Restart
sudo systemctl start cloudflared

# 8. Verify
cloudflared tunnel info nyra-orchestrator
```

---

## 📞 Getting Help

### Collect Debug Info

```bash
# Run diagnostics
~/check-tunnel-health.sh > tunnel-debug.txt

# Add logs
sudo journalctl -u cloudflared -n 200 >> tunnel-debug.txt

# Add config (remove sensitive data!)
cat ~/.cloudflared/config.yml | grep -v credentials >> tunnel-debug.txt

# Share tunnel-debug.txt when seeking help
```

### Resources

- **Cloudflare Community**: https://community.cloudflare.com
- **GitHub Issues**: https://github.com/cloudflare/cloudflared/issues
- **Documentation**: https://developers.cloudflare.com/cloudflare-one
- **Status Page**: https://www.cloudflarestatus.com

---

**Still stuck?** Check the [Related Documentation](#-related-documentation) or reach out on the Cloudflare Community forums.

## 📚 Related Documentation

- **[Overview](./CLOUDFLARE-TUNNELS.md)** - Architecture and benefits
- **[Orchestrator Setup](./CLOUDFLARE-SETUP-ORCHESTRATOR.md)** - Initial tunnel setup
- **[Worker Setup](./CLOUDFLARE-SETUP-WORKERS.md)** - Worker configuration
