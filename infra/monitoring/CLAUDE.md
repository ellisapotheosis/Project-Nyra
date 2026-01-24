# Monitoring Stack - Prometheus + Grafana + Loki

## 🎯 INFRASTRUCTURE CONTEXT

**Purpose**: Comprehensive observability stack for Project Nyra providing metrics collection (Prometheus), visualization (Grafana), and log aggregation (Loki) across all 20+ services.

**Ports**:
- Prometheus: 9090
- Grafana: 3005
- Loki: 3100

**Technology**: Prometheus, Grafana, Loki, Promtail, AlertManager
**Template**: Docker Compose infrastructure

## 🚨 CRITICAL DEVELOPMENT RULES

### Observability-First Pattern
**MANDATORY**: All infrastructure changes must maintain monitoring coverage:

```yaml
# ✅ CORRECT: Batch monitoring configs in ONE message
[Single Message]:
  - Write("prometheus/prometheus.yml", prometheusConfig)
  - Write("grafana/dashboards/overview.json", overviewDashboard)
  - Write("loki/loki-config.yml", lokiConfig)
  - Write("alertmanager/alerts.yml", alertRules)
```

## 📊 MONITORING ARCHITECTURE

### Metrics Collection Flow
```
Service Metrics Endpoints (/metrics)
    ↓
Prometheus Scrape (15s interval)
    ↓
Time-Series Database (Prometheus TSDB)
    ↓
Grafana Query (PromQL)
    ↓
Dashboard Visualization
    ↓
AlertManager → Slack/Email if threshold breached
```

### Log Aggregation Flow
```
Service Logs (stdout/stderr)
    ↓
Promtail (log collector)
    ↓
Loki (log aggregation)
    ↓
Grafana Explore (LogQL queries)
    ↓
Centralized log search and analysis
```

## 🐝 MONITORING SWARM

### Agent Configuration
```yaml
topology: star  # Central observability hub
maxAgents: 4
strategy: specialized
framework: docker-compose

agents:
  metrics_engineer:
    role: Prometheus Configuration
    focus: [scrape-configs, recording-rules, retention-policies]
    concurrent_tasks: [multiple-targets, parallel-scraping]

  dashboard_designer:
    role: Grafana Dashboard Creation
    focus: [dashboard-json, panel-design, alerting]
    concurrent_tasks: [multiple-dashboards, parallel-design]

  log_specialist:
    role: Loki Configuration
    focus: [log-parsing, retention, query-optimization]
    concurrent_tasks: [multiple-sources, parallel-ingestion]

  alert_manager:
    role: Alert Configuration
    focus: [alert-rules, notification-channels, escalation]
    concurrent_tasks: [multiple-alerts, parallel-routing]
```

## 🔧 PROMETHEUS PATTERNS

### Prometheus Scrape Configuration
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'quote-engine'
    static_configs:
      - targets: ['quote-engine:8001']

  - job_name: 'campaign-engine'
    static_configs:
      - targets: ['campaign-engine:8002']

  - job_name: 'docker-metrics'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Grafana Dashboard Metrics
- **Business Metrics**: Leads converted, quotes generated, campaigns sent
- **System Metrics**: CPU, memory, disk usage per service
- **API Metrics**: Request rate, latency (p50/p95/p99), error rate
- **Database Metrics**: Query latency, connection pool usage
- **LLM Metrics**: Token usage, cost per day, local vs cloud ratio

## 📈 PERFORMANCE TARGETS

- Prometheus scrape interval: 15 seconds
- Metric retention: 30 days
- Grafana dashboard load: < 2 seconds
- Loki query latency: < 1 second
- Alert evaluation: < 30 seconds

## 🧪 CRITICAL ALERTS

```yaml
groups:
  - name: mortgage_critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate on {{ $labels.service }}"

      - alert: QuoteEngineDown
        expr: up{job="quote-engine"} == 0
        for: 1m
        annotations:
          summary: "Quote Engine is down"

      - alert: LowDiskSpace
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 5m
        annotations:
          summary: "Disk space below 10%"
```

---

**This monitoring stack provides visibility into every service in Project Nyra. When issues arise, Prometheus alerts fire, Grafana dashboards show the problem, and Loki logs reveal the root cause. Observability is non-negotiable for production mortgage operations.**
