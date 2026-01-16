# Cloudflare Tunnel Test Results

This directory contains test results, logs, and reports from the Cloudflare tunnel validation suite.

## Generated Files

### Log Files
- `test-run-YYYYMMDD-HHMMSS.log` - Detailed test execution logs with timestamps

### Reports
- `test-report-YYYYMMDD-HHMMSS.json` - Structured JSON report with test metrics
- `test-report-YYYYMMDD-HHMMSS.html` - Visual HTML report with charts

### Performance Metrics
- `latency-metrics.csv` - Latency measurements over time
- `throughput-metrics.csv` - Throughput test results

## Retention

Test results are automatically archived:
- Logs older than 10 test runs are removed
- Retention period: 30 days (configurable)

## Accessing Reports

### View Latest HTML Report
```bash
# Linux/macOS
open $(ls -t test-report-*.html | head -1)

# Windows
start (Get-ChildItem test-report-*.html | Sort-Object LastWriteTime -Descending | Select-Object -First 1).Name
```

### View Latest JSON Report
```bash
cat $(ls -t test-report-*.json | head -1) | jq
```

### Analyze Logs
```bash
# View errors from latest run
grep -i error $(ls -t test-run-*.log | head -1)

# View test results summary
grep -E "PASSED|FAILED|SKIPPED" $(ls -t test-run-*.log | head -1)
```

## CI/CD Integration

Test results can be uploaded to CI/CD artifacts:

```yaml
# GitHub Actions
- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: tunnel-test-results
    path: tests/results/cloudflare-tunnels/
```

## Monitoring

For continuous monitoring, consider:
- Importing CSV metrics to time-series database (Prometheus, InfluxDB)
- Setting up alerts based on performance thresholds
- Creating dashboards from JSON reports
