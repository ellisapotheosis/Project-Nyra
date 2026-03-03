# Monitoring Stack - Quick Reference Card

## 🚀 Quick Start

```bash
# Start monitoring stack
cd infra/docker
docker compose -f docker-compose.monitoring.yml up -d

# Check status
docker compose -f docker-compose.monitoring.yml ps

# View logs
docker compose -f docker-compose.monitoring.yml logs -f grafana
```

## 🌐 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Grafana** | http://localhost:3000 | Main dashboards |
| **Prometheus** | http://localhost:9090 | Metrics & queries |
| **AlertManager** | http://localhost:9093 | Alert management |
| **Jaeger** | http://localhost:16686 | Distributed tracing |

**Default Credentials**: admin / admin

## 📊 Dashboard Quick Links

| Dashboard | URL | Monitors |
|-----------|-----|----------|
| Nexus Router | /d/nexus-router | LLM routing, workers, costs |
| GPU Workers | /d/gpu-workers | GPU utilization, temperature |
| MCP Servers | /d/mcp-servers | MCP health, connections |
| System Overview | /d/system-overview | CPU, memory, disk |
| Cost Tracking | /d/cost-tracking | LLM costs, savings |

## 🔍 Common Queries

### Prometheus

```promql
# Request rate
sum(rate(nexus_router_requests_total[5m]))

# Error rate
sum(rate(nexus_router_errors_total[5m])) / sum(rate(nexus_router_requests_total[5m]))

# P95 latency
histogram_quantile(0.95, sum(rate(nexus_router_request_duration_bucket[5m])) by (le))

# GPU utilization
avg(gpu_utilization_percent)

# Hourly cost
sum(rate(nexus_router_cost_total[1h])) * 3600
```

### Loki (LogQL)

```logql
# All logs from Nexus Router
{container="nexus-router"}

# Error logs only
{container="nexus-router"} |= "error"

# JSON parsing
{container="nexus-router"} | json | level="error"

# Rate of errors
rate({container="nexus-router"} |= "error" [5m])
```

## ⚠️ Critical Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| NexusRouterDown | 1 min | Check service immediately |
| AllWorkersDown | 2 min | Restart GPU workers |
| HighHourlyCost | >$25/hr | Review usage patterns |
| GPUTemperatureCritical | >90°C | Check cooling system |
| DiskSpaceCritical | <10% | Free disk space |

## 🛠️ Common Commands

### Prometheus

```bash
# Reload config
curl -X POST http://localhost:9090/-/reload

# Check targets
curl http://localhost:9090/api/v1/targets | jq .

# Query API
curl -G http://localhost:9090/api/v1/query \
  --data-urlencode 'query=up'
```

### AlertManager

```bash
# View alerts
curl http://localhost:9093/api/v2/alerts | jq .

# Silence alert
amtool silence add alertname=HighCPUUsage --duration=1h

# Test alert
amtool alert add alertname=test severity=warning
```

### Grafana

```bash
# Reset admin password
docker exec nyra-grafana grafana-cli admin reset-admin-password newpass

# List datasources
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/datasources
```

### Loki

```bash
# Query logs
curl -G http://localhost:3100/loki/api/v1/query \
  --data-urlencode 'query={container="nexus-router"}' | jq .

# Label values
curl -G http://localhost:3100/loki/api/v1/label/container/values
```

## 🔧 Troubleshooting

### Service Not Starting

```bash
# Check logs
docker logs nyra-<service-name>

# Verify config
docker run --rm -v $(pwd)/infra/monitoring/prometheus:/etc/prometheus \
  prom/prometheus:latest promtool check config /etc/prometheus/prometheus-enhanced.yml
```

### High Memory Usage

```bash
# Check Prometheus storage
docker exec nyra-prometheus du -sh /prometheus

# Compact data
docker exec nyra-prometheus promtool tsdb analyze /prometheus
```

### Metrics Not Appearing

```bash
# Check scrape targets
curl http://localhost:9090/api/v1/targets

# Test endpoint manually
curl http://nexus-router:8000/metrics
```

### Alerts Not Firing

```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules | jq .

# Verify AlertManager config
docker exec nyra-alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
```

## 📈 Key Metrics to Monitor

### Nexus Router
- `nexus_router_requests_total` - Total requests
- `nexus_router_errors_total` - Error count
- `nexus_router_request_duration_bucket` - Latency
- `nexus_router_cost_total` - Cost tracking
- `nexus_router_queue_depth` - Queue size

### GPU Workers
- `gpu_utilization_percent` - GPU usage
- `gpu_memory_used_bytes` - GPU memory
- `gpu_temperature_celsius` - Temperature
- `gpu_power_draw_watts` - Power consumption
- `model_inference_total` - Inference count

### MCP Servers
- `mcp_requests_total` - Request count
- `mcp_errors_total` - Error count
- `mcp_active_connections` - Connection count
- `mcp_request_duration_bucket` - Latency
- `mcp_cache_hits_total` - Cache hits

### System
- `node_cpu_seconds_total` - CPU time
- `node_memory_MemAvailable_bytes` - Available memory
- `node_filesystem_avail_bytes` - Disk space
- `node_network_transmit_bytes_total` - Network TX
- `container_memory_working_set_bytes` - Container memory

## 🚨 Emergency Procedures

### All Services Down

```bash
# Stop everything
docker compose -f docker-compose.monitoring.yml down

# Clear volumes (WARNING: deletes data)
docker compose -f docker-compose.monitoring.yml down -v

# Restart
docker compose -f docker-compose.monitoring.yml up -d
```

### Prometheus Out of Disk Space

```bash
# Delete old data
docker exec nyra-prometheus rm -rf /prometheus/wal

# Reduce retention
docker compose -f docker-compose.monitoring.yml down
# Edit prometheus command: --storage.tsdb.retention.time=7d
docker compose -f docker-compose.monitoring.yml up -d prometheus
```

### Too Many Alerts

```bash
# Silence all alerts
amtool silence add alertname=.* --duration=1h

# Or specific severity
amtool silence add severity=warning --duration=2h
```

## 📝 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| prometheus-enhanced.yml | Main Prometheus config | prometheus/ |
| recording-rules.yml | Pre-computed metrics | prometheus/ |
| nexus-router-alerts.yml | Nexus Router alerts | prometheus/alerts/ |
| mcp-server-alerts.yml | MCP server alerts | prometheus/alerts/ |
| alertmanager.yml | Alert routing | alertmanager/ |
| loki.yml | Log aggregation | loki/ |
| promtail.yml | Log collection | loki/ |

## 🔐 Security Checklist

- [ ] Change Grafana admin password
- [ ] Update Slack webhook URLs
- [ ] Configure email SMTP settings
- [ ] Enable TLS/SSL (use reverse proxy)
- [ ] Restrict network access
- [ ] Set up authentication
- [ ] Rotate credentials regularly

## 📚 Documentation

- **Full Documentation**: `README.md`
- **Deployment Summary**: `DEPLOYMENT_SUMMARY.md`
- **Setup Script**: `scripts/setup.sh`
- **Environment Template**: `.env.example`

## 💡 Tips

1. **Performance**: Use recording rules for frequently-used queries
2. **Alerting**: Start with conservative thresholds and adjust
3. **Costs**: Monitor the cost dashboard daily
4. **GPU**: Keep temperature below 80°C
5. **Storage**: Plan for ~100GB for 30 days retention
6. **Backups**: Export Grafana dashboards regularly

## 🆘 Getting Help

1. Check logs: `docker logs <container>`
2. Verify config: `promtool check config`
3. Review README.md
4. Check Prometheus targets: http://localhost:9090/targets
5. Test queries in Prometheus UI
6. Review AlertManager status: http://localhost:9093

## 📊 Health Check URLs

| Service | Health Endpoint |
|---------|----------------|
| Prometheus | http://localhost:9090/-/healthy |
| Grafana | http://localhost:3000/api/health |
| Loki | http://localhost:3100/ready |
| Tempo | http://localhost:3200/ready |
| AlertManager | http://localhost:9093/-/healthy |

---

**Quick Reference Version**: 1.0.0
**Last Updated**: 2026-01-10
