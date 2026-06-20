# Observability Setup Guide

## Overview
This guide covers the complete observability stack for Project-Nyra, including metrics collection, log aggregation, visualization, and alerting.

## Components

### Core Stack
- **Prometheus**: Time-series metrics collection and storage
- **Loki**: Log aggregation and querying
- **Grafana**: Visualization dashboards
- **Alertmanager**: Alert routing and notifications
- **Promtail**: Log shipping agent
- **Node Exporter**: System-level metrics
- **cAdvisor**: Container metrics

## Quick Start

### 1. Start Observability Stack
```bash
cd bootstrap/infra

# Start all observability services
docker-compose -f docker-compose.observability.yml up -d

# Verify services are running
docker-compose -f docker-compose.observability.yml ps
```

### 2. Access Dashboards

**Grafana**: http://localhost:3000
- Default credentials: admin/admin (change on first login)
- Pre-configured datasources for Prometheus and Loki
- Pre-loaded dashboards for all services

**Prometheus**: http://localhost:9090
- Query metrics directly
- View configured targets
- Check alerting rules

**Alertmanager**: http://localhost:9093
- View active alerts
- Manage silences
- Configure notification routing

### 3. Verify Metrics Collection
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check if services are being scraped
curl http://localhost:9090/api/v1/query?query=up

# View metrics from a specific service
curl http://localhost:8080/metrics  # Campaign Engine
curl http://localhost:8081/metrics  # Quote Engine
```

## Grafana Dashboards

### Service Health Dashboard
**URL**: http://localhost:3000/d/service-health

**Metrics:**
- Service availability (up/down status)
- Request rate per service
- Error rate (5xx responses)
- Response time (p95)
- CPU usage
- Memory usage
- Active alerts

**Use Cases:**
- Quick health overview
- Identify service outages
- Monitor system resources
- Track error trends

### Campaign Metrics Dashboard
**URL**: http://localhost:3000/d/campaign-metrics

**Metrics:**
- Campaigns processed per minute
- Campaign queue size
- Campaign success rate
- Processing duration (histogram)
- Failures by type
- Active workers
- Campaign type distribution

**Use Cases:**
- Monitor campaign processing
- Identify bottlenecks
- Track failure patterns
- Capacity planning

### Quote Engine Dashboard
**URL**: http://localhost:3000/d/quote-engine-perf

**Metrics:**
- Quotes calculated per minute
- Calculation success rate
- Average calculation time
- Cache hit rate
- Duration percentiles (p50, p95, p99)
- Formula execution times
- Validation failures
- Memory usage

**Use Cases:**
- Optimize quote calculations
- Monitor cache effectiveness
- Identify slow formulas
- Track validation issues

### Memory System Dashboard
**URL**: http://localhost:3000/d/memory-system

**Metrics:**
- Memory operations per second
- Storage usage (percentage)
- Retrieval success rate
- Average retrieval time
- Storage growth trend
- Vector search performance
- Embedding generation rate
- Entries by context

**Use Cases:**
- Monitor Mem0 performance
- Track storage capacity
- Optimize retrieval speed
- Manage memory entries

## Alert Configuration

### Critical Alerts
1. **ServiceDown**: Immediate notification when service is unavailable
2. **CampaignProcessingStalled**: No campaigns processed in 15 minutes
3. **DiskSpaceLow**: Less than 15% disk space remaining

### Warning Alerts
1. **HighErrorRate**: Error rate exceeds 5%
2. **HighLatency**: p95 latency exceeds 1 second
3. **CampaignProcessingBacklog**: Queue size exceeds 100
4. **QuoteCalculationTimeout**: Timeouts exceeding 1%

### Notification Channels
Configure in `bootstrap/infra/observability/alertmanager.yml`:

```yaml
receivers:
  - name: 'slack-critical'
    slack_configs:
      - channel: '#alerts-critical'
        # Add your Slack webhook URL

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
```

### Testing Alerts
```bash
# Manually trigger test alert
amtool alert add alertname=TestAlert severity=warning

# Check alert status
curl http://localhost:9093/api/v2/alerts

# Silence an alert
amtool silence add alertname=ServiceDown duration=1h
```

## Log Aggregation

### Query Logs with Loki

**Via Grafana:**
1. Go to Explore page
2. Select Loki datasource
3. Use LogQL queries:

```logql
# All errors from campaign-engine
{job="campaign-engine"} |= "ERROR"

# Logs for specific campaign
{job="campaign-engine"} | json | campaign_id="abc123"

# Count errors by service
sum(count_over_time({job=~".+"} |= "ERROR" [5m])) by (job)
```

**Via API:**
```bash
# Query recent errors
curl -G -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={job="campaign-engine"} |= "ERROR"' \
  --data-urlencode "start=$(date -d '1 hour ago' +%s)000000000" \
  --data-urlencode "end=$(date +%s)000000000"
```

### Log Retention
- Default: 30 days (configurable in `loki-config.yml`)
- Archive old logs to S3/GCS for long-term storage
- Compress logs to reduce storage costs

## Metrics Instrumentation

### Adding Metrics to Services

**Node.js Example (Express):**
```javascript
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status']
});

// Instrument routes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route.path, res.statusCode).observe(duration);
  });
  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

**Custom Business Metrics:**
```javascript
// Campaign processing metrics
const campaignsProcessed = new promClient.Counter({
  name: 'campaigns_processed_total',
  help: 'Total campaigns processed',
  labelNames: ['campaign_type', 'status']
});

const campaignQueueSize = new promClient.Gauge({
  name: 'campaign_queue_size',
  help: 'Current campaign queue size'
});

const campaignDuration = new promClient.Histogram({
  name: 'campaign_processing_duration_seconds',
  help: 'Campaign processing duration',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});
```

## Performance Optimization

### Prometheus
1. **Tune retention:**
   ```yaml
   command:
     - '--storage.tsdb.retention.time=30d'
     - '--storage.tsdb.retention.size=10GB'
   ```

2. **Optimize scrape intervals:**
   - Standard services: 15s
   - High-frequency metrics: 10s
   - Low-priority metrics: 30s

3. **Use recording rules for expensive queries:**
   ```yaml
   groups:
     - name: request_rate
       interval: 30s
       rules:
         - record: job:http_requests:rate5m
           expr: rate(http_requests_total[5m])
   ```

### Loki
1. **Configure retention:**
   ```yaml
   limits_config:
     retention_period: 744h  # 31 days
   ```

2. **Optimize ingestion:**
   ```yaml
   limits_config:
     ingestion_rate_mb: 10
     ingestion_burst_size_mb: 20
   ```

3. **Use label filtering:**
   - Keep labels minimal (job, instance, level)
   - Move other metadata to structured log fields

### Grafana
1. **Use query caching:**
   ```ini
   [caching]
   enabled = true
   ```

2. **Optimize dashboard queries:**
   - Use recording rules
   - Limit time ranges
   - Use appropriate intervals

## Troubleshooting

### Prometheus Not Scraping Targets

**Check target status:**
```bash
curl http://localhost:9090/api/v1/targets
```

**Common issues:**
1. Service not exposing /metrics endpoint
2. Network connectivity issues
3. Wrong port in configuration
4. Service not running

**Solution:**
```bash
# Test metrics endpoint directly
curl http://campaign-engine:8080/metrics

# Check network connectivity
docker exec nyra-prometheus ping campaign-engine

# Verify Prometheus config
docker exec nyra-prometheus cat /etc/prometheus/prometheus.yml
```

### High Memory Usage

**Check metrics:**
```bash
# Prometheus memory usage
docker stats nyra-prometheus

# Check time series count
curl http://localhost:9090/api/v1/status/tsdb
```

**Solutions:**
1. Reduce retention period
2. Decrease scrape frequency
3. Use recording rules
4. Limit label cardinality

### Loki Query Timeout

**Check logs:**
```bash
docker logs nyra-loki
```

**Solutions:**
1. Reduce query time range
2. Add more specific filters
3. Increase timeout in Grafana
4. Scale Loki horizontally

## CI/CD Integration

### Pre-Deployment Checks
```bash
# Check Prometheus config
promtool check config bootstrap/infra/observability/prometheus.yml

# Check alerting rules
promtool check rules bootstrap/infra/observability/prometheus-alerts.yml

# Validate Loki config
docker run --rm -v $(pwd):/workspace grafana/loki:latest \
  -config.file=/workspace/bootstrap/infra/observability/loki-config.yml \
  -config.verify
```

### Post-Deployment Verification
```bash
# Run smoke tests
./bootstrap/ci/smoke-tests.sh

# Check metric availability
curl http://localhost:9090/api/v1/query?query=up

# Verify alerts are loaded
curl http://localhost:9090/api/v1/rules
```

## Best Practices

### 1. Naming Conventions
- Metrics: `service_component_action_unit` (e.g., `campaign_queue_size`)
- Labels: lowercase, snake_case (e.g., `campaign_type`)
- Dashboards: descriptive titles with context

### 2. Alert Design
- Make alerts actionable
- Include runbook links
- Set appropriate thresholds
- Test alert fatigue

### 3. Dashboard Design
- Start with overview, drill down to details
- Use consistent colors (red=error, yellow=warning, green=ok)
- Include time range selector
- Add description panels

### 4. Log Structuring
```json
{
  "timestamp": "2024-01-04T12:00:00Z",
  "level": "error",
  "service": "campaign-engine",
  "campaign_id": "abc123",
  "message": "Campaign processing failed",
  "error": "Database connection timeout"
}
```

### 5. Retention Policies
- Metrics: 30 days in Prometheus
- Logs: 30 days in Loki
- Archive to long-term storage for compliance
- Aggregate old data with recording rules

## Related Documentation
- [Runbooks](./runbooks/)
- [CI/CD Pipeline](../ci/README.md)
- [Deployment Guide](./runbooks/deployment.md)
- [Troubleshooting Guide](./runbooks/troubleshooting.md)

## Support
- Grafana Community: https://community.grafana.com
- Prometheus Docs: https://prometheus.io/docs
- Loki Docs: https://grafana.com/docs/loki

## Maintenance Schedule
- **Daily**: Review dashboards and alerts
- **Weekly**: Check disk space and retention
- **Monthly**: Review and update alert thresholds
- **Quarterly**: Dashboard and metric review
