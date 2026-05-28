# METRICS_AND_LOGGING_CONVENTIONS

Last updated: 2026-05-24

## Label Schema

All Prometheus metrics exported from Nyra services and exporters must include these labels
where applicable. Consistency enables cross-host dashboards and alert rules.

| Label               | Values / Format                                                                          | Required           |
| ------------------- | ---------------------------------------------------------------------------------------- | ------------------ |
| `host`              | `oracle-vps`, `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`     | Yes                |
| `service`           | Container name or service identifier (e.g. `letta`, `vllm`, `litellm`)                   | Yes                |
| `role`              | `inference`, `routing`, `memory`, `campaign`, `crm`, `voice`, `observability`            | Yes                |
| `worker_capability` | `vllm`, `ollama`, `tts`, `stt`, `embedding`                                              | Workers only       |
| `gpu`               | `rtx5090`, `rtx3090ti`, `rtx3060`                                                        | GPU hosts only     |
| `model`             | Active model slug (e.g. `qwen2.5-72b`, `mistral-7b`)                                     | Inference services |
| `stack`             | Compose project name (e.g. `nyra-network`, `nyra-memory`)                                | Yes                |
| `compose_profile`   | Compose file basename without extension (e.g. `docker-compose`, `docker-compose.memory`) | Yes                |

---

## Log Format

All application services must emit structured JSON logs to stdout/stderr. promtail
ships them to Loki without transformation beyond label injection.

Required fields:

```json
{
  "timestamp": "2026-05-24T12:00:00.000Z",
  "level": "info|warn|error|debug",
  "service": "<service-name>",
  "host": "<hostname>",
  "msg": "<human-readable message>",
  "trace_id": "<optional correlation ID>"
}
```

Additional fields are allowed. Do not log:

- Passwords, API keys, tokens, or any Infisical secret values
- SSNs, SINs, or full borrower financial documents
- Raw provider credentials or webhook signing secrets
- Full credit application payloads (log stable IDs + redacted summaries only)

Compliance and quote events must log:

- A stable entity ID (borrower_id, lead_id, quote_id)
- Action taken and outcome
- Redacted summary (no raw PII beyond name initials acceptable)
- Timestamp and operator/agent identity

---

## Retention Policy

| Storage             | Default Retention | Compliance Streams                 |
| ------------------- | ----------------- | ---------------------------------- |
| Loki                | 30 days           | 90 days (tagged `compliance=true`) |
| Prometheus TSDB     | 15 days           | —                                  |
| OpenLIT ClickHouse  | 60 days           | —                                  |
| Grafana annotations | 90 days           | —                                  |

Archive logs to cold storage before expiry if a compliance event is under review.

---

## How to Add a New Service to Scraping

### Metrics (Prometheus)

1. Expose a `/metrics` endpoint in Prometheus exposition format from the service.
2. Add a `scrape_configs` entry in the Prometheus config on oracle-vps:
   ```yaml
   - job_name: "<service-name>"
     static_configs:
       - targets: ["<tailscale-ip>:<port>"]
         labels:
           host: "<hostname>"
           service: "<service-name>"
           role: "<role>"
           stack: "<compose-project>"
   ```
3. Ensure the service container is reachable from oracle-vps over Tailscale.
4. Restart Prometheus: `docker compose restart prometheus` on oracle-vps.
5. Verify at `http://100.64.0.3:9090/targets` — target must show state `UP`.

### Logs (Loki via promtail)

1. promtail on the host auto-discovers Docker containers via the Docker socket.
2. To add custom parsing, add a pipeline stage in the promtail config on that host:
   ```yaml
   pipeline_stages:
     - json:
         expressions:
           level: level
           msg: msg
     - labels:
         level:
         service:
   ```
3. Redeploy promtail: `docker compose restart promtail` on the target host.
4. Verify in Grafana Explore → Loki → `{container_name="<name>"}`.

### Naming Conventions

- Metric names: `nyra_<service>_<noun>_<unit>` (e.g. `nyra_vllm_requests_total`)
- Counter suffix: `_total`
- Gauge suffix: none or `_ratio`, `_celsius`, `_bytes`
- Histogram suffix: `_seconds`, `_bytes`
- Do not use camelCase in metric names; use underscores only.
