# OBSERVABILITY_STACK

Last updated: 2026-05-26

## Overview

All hosts ship metrics and logs to the central observability stack on oracle-vps.
Workers and orchestrator run local exporters and promtail agents; no local Grafana
instances exist on workers.

---

## Services

| Service            | Image                                 | Host        | Port | Role                        |
| ------------------ | ------------------------------------- | ----------- | ---- | --------------------------- |
| Prometheus         | prom/prometheus:latest                | oracle-vps  | 9090 | Metrics scrape + storage    |
| Loki               | grafana/loki:3.4.3                    | oracle-vps  | 3100 | Log aggregation             |
| Grafana            | grafana/grafana:latest                | oracle-vps  | 3001 | Dashboards + alerting       |
| cAdvisor           | gcr.io/cadvisor/cadvisor              | all hosts   | 8088 | Container resource metrics  |
| node-exporter      | prom/node-exporter                    | all hosts   | 9100 | Host OS metrics             |
| gpu-exporter       | utkuozdemir/nvidia_gpu_exporter:1.4.1 | all workers | 9835 | GPU utilisation/temp/mem    |
| promtail           | grafana/promtail:latest               | all hosts   | push | Log shipping to Loki        |
| health-monitor     | curlimages/curl                       | all workers | —    | HTTP endpoint health checks |
| OpenLIT            | ghcr.io/openlit/openlit               | oracle-vps  | 3002 | LLM observability           |
| OpenLIT ClickHouse | clickhouse/clickhouse-server:24.4.1   | oracle-vps  | 9000 | OpenLIT backend store       |

---

## Scrape Targets

Prometheus scrapes the following endpoints (configured in `infra/hosts/oracle-vps/`
prometheus config):

| Target          | Host             | Port | Job Name              |
| --------------- | ---------------- | ---- | --------------------- |
| cAdvisor        | oracle-vps       | 8088 | cadvisor-oracle       |
| cAdvisor        | orchestrator     | 8088 | cadvisor-orchestrator |
| cAdvisor        | worker-rtx5090   | 8088 | cadvisor-5090         |
| cAdvisor        | worker-rtx3090ti | 8088 | cadvisor-3090ti       |
| cAdvisor        | worker-rtx3060   | 8088 | cadvisor-3060         |
| node-exporter   | all hosts        | 9100 | node-exporter-<host>  |
| gpu-exporter    | worker-rtx5090   | 9835 | gpu-5090              |
| gpu-exporter    | worker-rtx3090ti | 9835 | gpu-3090ti            |
| gpu-exporter    | worker-rtx3060   | 9835 | gpu-3060              |
| Prometheus self | oracle-vps       | 9090 | prometheus            |

---

## Log Collection (Loki + Promtail)

- promtail runs as a container on each host with Docker socket access.
- It ships stdout/stderr from all containers to Loki at `http://100.64.0.3:3100`.
- Labels added by promtail: `host`, `container_name`, `compose_project`, `log_level`.
- No PII, SSNs, or raw credentials must appear in container stdout.

2026-05-26 live reachability audit:

- Oracle Loki container is healthy and returns `ready` from both
  `127.0.0.1:3100` and `100.64.0.3:3100` on `oracle-vps`.
- `worker-rtx3060` promtail is running, but recent logs show repeated
  `context deadline exceeded` pushes to
  `http://oracle.trex-fiordland.ts.net:3100/loki/api/v1/push`.
- `worker-rtx3090ti` promtail is running without recent Loki push errors, but
  direct WSL curl to `100.64.0.3:3100/ready` times out.
- `worker-rtx5090` Docker context cannot reach the Docker daemon, and WSL
  Tailscale reports logged out.

Do not mark worker log shipping complete until worker WSL/Tailscale sessions
can reach Oracle Loki from all three worker hosts.

Retention:

- Loki: 30 days default; compliance-tagged streams retained 90 days.
- Prometheus: 15 days local TSDB; long-term via remote_write (if configured).

---

## Alert Classes

Alerts are defined in Prometheus alerting rules and surfaced in Grafana.

| Alert Class             | Condition                                             | Severity | Auto-Action                                                     |
| ----------------------- | ----------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `secret-missing`        | secrets-init exits non-zero; env placeholder detected | critical | Stop outbound automation                                        |
| `tunnel-down`           | cloudflared container unhealthy > 2 min               | critical | Notify Letta; attempt restart                                   |
| `worker-offline`        | node-exporter or cAdvisor unreachable > 3 min         | high     | Route inference to remaining workers                            |
| `GPU-hot`               | GPU temp > 85°C                                       | high     | Letta stack orchestrator triggers power API (orchestrator:8765) |
| `Redis-down`            | Redis container not responding                        | high     | Pause queue consumers                                           |
| `Letta-down`            | Letta health endpoint fails > 2 min                   | critical | Alert operator; OpenClaw fallback                               |
| `OpenClaw-down`         | OpenClaw gateway unhealthy                            | high     | Route agent tasks to Letta direct                               |
| `STOP-not-processed`    | STOP intent detected but not actioned within 60 s     | critical | Halt campaign engine; log event                                 |
| `outbound-blocked`      | Outbound webhook/SMS/email failing > 5 min            | high     | Suspend campaign sends                                          |
| `quote-engine-degraded` | quote-engine returns 5xx > 10% over 5 min             | high     | Return maintenance message to brokers                           |
| `tailscale-down`        | Tailscale node unreachable                            | high     | Check WireGuard tunnel status                                   |
| `qdrant-down`           | Qdrant health endpoint fails                          | high     | Memory writes queue locally                                     |
| `twenty-sync-failed`    | CRM sync job exits non-zero                           | medium   | Retry 3x; escalate to operator                                  |

---

## Adding a New Service to Scraping

1. Ensure the service exposes a `/metrics` endpoint in Prometheus format.
2. Add a scrape config entry to the Prometheus config on oracle-vps.
3. Add a promtail pipeline stage if custom log parsing is needed.
4. Redeploy: `docker compose -f docker-compose.yml restart prometheus` on oracle-vps.
5. Verify target appears in Prometheus UI at `http://100.64.0.3:9090/targets`.
6. Add a Grafana panel or dashboard in `infra/hosts/oracle-vps/` dashboards directory.
