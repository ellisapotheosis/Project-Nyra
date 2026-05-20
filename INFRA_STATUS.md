# Infrastructure Status & Health

This document provides instructions for monitoring and troubleshooting the Project Nyra infrastructure.

## 🚀 Smoke Testing

Run the smoke test script to verify core service reachability:

```bash
# From the project root
./infra/scripts/smoke-test.sh
```

## 📊 Monitoring Dashboards

The following dashboards are available (typically via Cloudflare Tunnels):

| Service                 | Public URL                         | Purpose                                      |
| :---------------------- | :--------------------------------- | :------------------------------------------- |
| **Portainer (Central)** | https://portainer.projectnyra.com  | Manage all Docker hosts and containers.      |
| **Grafana**             | https://grafana.projectnyra.com    | Metrics, logs (Loki), and status dashboards. |
| **Prometheus**          | https://prometheus.projectnyra.com | Raw metrics and alerting.                    |
| **Loki**                | https://loki.projectnyra.com       | Centralized log aggregation.                 |
| **cAdvisor**            | https://cadvisor.projectnyra.com   | Real-time container resource usage.          |

## 🛠 Troubleshooting

### 1. Check Container Logs

```bash
docker logs <container_name>
```

### 2. Verify Tunnel Status

```bash
cloudflared tunnel info ORCHESTRATOR_TUNNEL_ID
cloudflared tunnel info ORACLE_VPS_TUNNEL_ID
```

### 3. Service Health Endpoints

If a service is failing the smoke test, check its raw health endpoint:

- **n8n**: `http://localhost:5678/healthz`
- **LiteLLM**: `http://localhost:4000/health/readiness`
- **Nexus**: `http://localhost:3000/health`
- **CRM API**: `http://localhost:4001/api/leads?limit=1`
