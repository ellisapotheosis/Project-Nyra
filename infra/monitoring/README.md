# Project Nyra - Comprehensive Monitoring Setup

Complete production-ready monitoring, logging, and alerting stack for Project Nyra.

## Overview

This monitoring stack provides:
- **Metrics**: Prometheus with custom recording rules and alerts
- **Logs**: Loki with Promtail for log aggregation
- **Traces**: Tempo + Jaeger for distributed tracing
- **Visualization**: Grafana with pre-built dashboards
- **Alerting**: AlertManager with multi-channel notifications
- **Exporters**: Node, cAdvisor, PostgreSQL, Redis, GPU (DCGM), Blackbox

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VISUALIZATION                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Grafana (port 3000)                                    │ │
│  │ - Nexus Router Dashboard                               │ │
│  │ - GPU Workers Dashboard                                │ │
│  │ - MCP Servers Dashboard                                │ │
│  │ - System Overview Dashboard                            │ │
│  │ - Cost Tracking Dashboard                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Prometheus   │  │ Loki         │  │ Tempo        │      │
│  │ (port 9090)  │  │ (port 3100)  │  │ (port 3200)  │      │
│  │ Metrics      │  │ Logs         │  │ Traces       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      COLLECTORS                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Node     │ │ cAdvisor │ │ DCGM     │ │ Promtail │       │
│  │ Exporter │ │          │ │ (GPU)    │ │ (Logs)   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ Postgres │ │ Redis    │ │ Blackbox │                    │
│  │ Exporter │ │ Exporter │ │ Exporter │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      ALERTING                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AlertManager (port 9093)                               │ │
│  │ - Slack Notifications                                  │ │
│  │ - Email Notifications                                  │ │
│  │ - PagerDuty Integration                                │ │
│  │ - Alert Grouping & Routing                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Prerequisites

- Docker and Docker Compose
- NVIDIA Docker runtime (for GPU monitoring)
- Environment variables configured

### 2. Start Monitoring Stack

```bash
# Navigate to docker directory
cd infra/docker

# Start the monitoring stack
docker compose -f docker-compose.monitoring.yml up -d

# Check service status
docker compose -f docker-compose.monitoring.yml ps

# View logs
docker compose -f docker-compose.monitoring.yml logs -f grafana
```

### 3. Access Dashboards

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | - |
| AlertManager | http://localhost:9093 | - |
| Jaeger | http://localhost:16686 | - |

## Dashboards

### 1. Nexus Router Dashboard
**URL**: http://localhost:3000/d/nexus-router

Monitors LLM request routing, worker distribution, and cloud fallback.

**Key Metrics**:
- Request rate by destination (local/cloud)
- P95 latency by worker
- Error rate percentage
- Queue depth
- Model distribution
- Worker availability

**Alerts**:
- High error rate (>5%)
- High latency (>5s)
- All workers down
- Excessive cloud fallback (>70%)

### 2. GPU Workers Dashboard
**URL**: http://localhost:3000/d/gpu-workers

Real-time GPU utilization, temperature, and inference performance.

**Key Metrics**:
- GPU utilization %
- GPU memory usage
- GPU temperature (°C)
- Power draw (watts)
- Inference throughput
- Model load time

**Alerts**:
- Worker down
- High GPU utilization (>90%)
- High temperature (>80°C)
- GPU throttling

### 3. MCP Servers Dashboard
**URL**: http://localhost:3000/d/mcp-servers

Model Context Protocol server health and performance.

**Key Metrics**:
- Request rate per server
- Error rate
- P95 latency
- Active connections
- Tool execution time
- Cache hit rate

**Alerts**:
- Server down
- High error rate (>5%)
- Connection pool exhausted
- Protocol errors

### 4. System Overview Dashboard
**URL**: http://localhost:3000/d/system-overview

Infrastructure health monitoring.

**Key Metrics**:
- CPU usage %
- Memory usage %
- Disk usage %
- Network throughput
- Container resource usage
- System load average

**Alerts**:
- High CPU (>80%)
- High memory (>80%)
- Low disk space (<20%)
- Instance down

### 5. Cost Tracking Dashboard
**URL**: http://localhost:3000/d/cost-tracking

LLM and infrastructure cost monitoring.

**Key Metrics**:
- Hourly cost trend
- Cost by model
- Local vs cloud cost
- Cost per 1000 requests
- Daily cost trend
- Cost savings

**Alerts**:
- High hourly cost (>$10/hr)
- Critical hourly cost (>$25/hr)
- Daily budget exceeded (>$200)

## Alert Rules

### Nexus Router Alerts
- `NexusRouterDown` - Critical: Router service unavailable
- `NexusRouterHighErrorRate` - Warning: Error rate >5%
- `AllWorkersDown` - Critical: No GPU workers available
- `HighCloudFallbackRate` - Warning: >30% cloud usage
- `HighHourlyCost` - Warning: Cost >$10/hr

### GPU Worker Alerts
- `GPUWorkerDown` - Critical: Worker unavailable
- `GPUHighUtilization` - Warning: GPU >90% utilization
- `GPUTemperatureHigh` - Warning: Temp >80°C
- `GPUTemperatureCritical` - Critical: Temp >90°C

### MCP Server Alerts
- `MCPServerDown` - Critical: Server unavailable
- `MCPServerHighErrorRate` - Warning: Error rate >5%
- `MCPConnectionPoolExhausted` - Warning: >90% connections used

### System Alerts
- `HighCPUUsage` - Warning: CPU >80%
- `HighMemoryUsage` - Warning: Memory >80%
- `DiskSpaceLow` - Warning: Disk <20% free
- `InstanceDown` - Critical: Service unavailable

## Configuration

### Prometheus

Main configuration: `prometheus/prometheus-enhanced.yml`
- Scrape interval: 15s
- Retention: 30 days / 50GB
- Recording rules: Pre-computed aggregations
- Alert rules: Comprehensive alert definitions

**Key Scrape Targets**:
- Nexus Router (port 8000)
- GPU Workers (ports 8001-8003)
- MCP Servers (ports 3100-3103)
- Node Exporter (port 9100)
- cAdvisor (port 8080)
- DCGM GPU Exporter (port 9400)

### Loki

Configuration: `loki/loki.yml`
- Retention: 31 days
- Max query length: 30 days
- Ingestion rate: 10MB/s

**Log Sources**:
- Docker containers (all services)
- System logs (/var/log)
- Application logs
- Nexus Router logs
- GPU Worker logs
- MCP Server logs

### AlertManager

Configuration: `alertmanager/alertmanager.yml`

**Notification Channels**:
- Slack (multiple channels by severity)
- Email (ops team)
- PagerDuty (critical only)

**Alert Routing**:
- Critical → PagerDuty + Slack
- Warning → Slack only
- Database → #alerts-database
- Application → #alerts-application
- Infrastructure → #alerts-infrastructure

### Grafana

Provisioning:
- Datasources: `grafana/provisioning/datasources/`
- Dashboards: `grafana/provisioning/dashboards/`

**Installed Plugins**:
- grafana-clock-panel
- grafana-piechart-panel
- grafana-simple-json-datasource

## Maintenance

### Prometheus

```bash
# Reload configuration
curl -X POST http://localhost:9090/-/reload

# Check configuration
docker exec nyra-prometheus promtool check config /etc/prometheus/prometheus.yml

# Check rules
docker exec nyra-prometheus promtool check rules /etc/prometheus/alerts/*.yml
```

### AlertManager

```bash
# Reload configuration
curl -X POST http://localhost:9093/-/reload

# Check configuration
docker exec nyra-alertmanager amtool check-config /etc/alertmanager/alertmanager.yml

# View alerts
curl http://localhost:9093/api/v2/alerts

# Silence alert
amtool silence add alertname=HighCPUUsage --duration=1h
```

### Loki

```bash
# Check health
curl http://localhost:3100/ready

# Query logs
curl -G -s "http://localhost:3100/loki/api/v1/query" \
  --data-urlencode 'query={container="nexus-router"}' | jq .

# Check metrics
curl http://localhost:3100/metrics
```

### Grafana

```bash
# Backup dashboards
docker exec nyra-grafana grafana-cli admin reset-admin-password newpassword

# Export dashboard
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/dashboards/uid/nexus-router
```

## Troubleshooting

### Prometheus Not Scraping

```bash
# Check targets
curl http://localhost:9090/api/v1/targets | jq .

# Check service discovery
curl http://localhost:9090/api/v1/targets/metadata

# View Prometheus logs
docker logs nyra-prometheus
```

### Loki Not Receiving Logs

```bash
# Check Promtail status
docker logs nyra-promtail

# Verify log files exist
docker exec nyra-promtail ls -l /var/log

# Check Loki ingestion
curl http://localhost:3100/metrics | grep loki_ingester
```

### Grafana Dashboard Not Loading

```bash
# Check datasource connection
curl http://localhost:3000/api/datasources

# Verify dashboard provisioning
docker exec nyra-grafana ls -l /var/lib/grafana/dashboards

# Check Grafana logs
docker logs nyra-grafana
```

### AlertManager Not Sending Notifications

```bash
# View alert status
curl http://localhost:9093/api/v2/alerts | jq .

# Check routing configuration
curl http://localhost:9093/api/v1/status | jq .

# Test notification
amtool alert add alertname=test severity=warning
```

## Resource Requirements

| Service | CPU | Memory | Disk |
|---------|-----|--------|------|
| Prometheus | 1-2 cores | 2-4GB | 50GB |
| Grafana | 0.5-1 core | 512MB-1GB | 5GB |
| Loki | 1-2 cores | 1-2GB | 30GB |
| Tempo | 1 core | 1GB | 20GB |
| AlertManager | 0.5 core | 256MB | 1GB |
| Exporters | 0.5 core | 512MB | - |
| **Total** | **5-8 cores** | **6-10GB** | **106GB** |

## Security Best Practices

1. **Change Default Credentials**
   ```bash
   # Grafana admin password
   GF_SECURITY_ADMIN_PASSWORD=your_secure_password
   ```

2. **Enable TLS**
   - Configure reverse proxy (nginx/traefik)
   - Use Let's Encrypt certificates

3. **Restrict Access**
   - Use firewall rules
   - Configure authentication
   - Enable RBAC in Grafana

4. **Secrets Management**
   - Use Docker secrets or vault
   - Don't commit credentials to git
   - Rotate credentials regularly

## Performance Tuning

### High Cardinality Issues

```yaml
# Prometheus - Drop high cardinality metrics
metric_relabel_configs:
  - source_labels: [__name__]
    regex: 'high_cardinality_metric.*'
    action: drop
```

### Long Query Times

```yaml
# Loki - Adjust query limits
limits_config:
  max_query_parallelism: 16
  split_queries_by_interval: 15m
```

### Memory Usage

```bash
# Increase Prometheus retention
--storage.tsdb.retention.size=100GB

# Limit Loki streams
max_streams_per_user: 10000
```

## Integration with Services

### Instrumenting Your Service

```javascript
// Node.js with prom-client
const prometheus = require('prom-client');
const register = prometheus.register;

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Adding Trace Context

```javascript
// OpenTelemetry tracing
const { trace } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Configure exporter
const exporter = new JaegerExporter({
  endpoint: 'http://tempo:14268/api/traces'
});
```

## Monitoring Costs

The monitoring stack itself has costs:

- **Infrastructure**: ~$50-100/month (cloud hosting)
- **Storage**: ~$20/month (100GB retention)
- **Network**: Minimal for local deployment
- **Maintenance**: ~2-4 hours/month

**Total**: ~$70-120/month + maintenance time

## Support

- **Documentation**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **Loki Docs**: https://grafana.com/docs/loki/
- **Issues**: Create issue in Project Nyra repo

## License

Part of Project Nyra - See main repository for license information.
