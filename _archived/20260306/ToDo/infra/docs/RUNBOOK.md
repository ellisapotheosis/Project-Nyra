# Nyra Runbook

This runbook provides quick reference commands for operating the Nyra stack across all nodes.  Use it alongside the `nyra` master script.

## 1. Pre-flight Checks

1. **Install prerequisites** – Ensure Docker, Docker Compose, and Tailscale are installed on each machine (or Oracle VM) and that the machine is joined to your tailnet.
2. **Import secrets** – Use Infisical to import your `.env` files into the appropriate paths (`/shared`, `/machines/<node>`).  Verify that no real secrets exist in version control.
3. **Check ports** – Run the port preflight script (see `PORT-MAP.md`) to ensure required ports are free on each node.

## 2. Bringing Up Services

### Orchestrator

Start the minimal control plane (core + databases):

```bash
infra/scripts/nyra up orchestrator
```

Start additional profiles (observability, workflows, CRM, memory, apps, UI):

```bash
infra/scripts/nyra up orchestrator core,databases,observability,workflows,crm,memory,apps,ui
```

### GPU Workers

Bring up inference services on a worker (e.g. RTX 3090 Ti):

```bash
infra/scripts/nyra up worker-rtx3090ti gpu-heavy,vector,mcp
```

To stop a worker:

```bash
infra/scripts/nyra down worker-rtx3090ti
```

### Oracle VM

SSH into the Oracle VM and run:

```bash
docker compose -f docker-compose.oracle-core.yml up -d
docker compose -f docker-compose.oracle-apps.yml up -d
```

## 3. Monitoring and Logs

Check the status of services for any node:

```bash
infra/scripts/nyra status orchestrator
infra/scripts/nyra status worker-rtx5090
```

Tail logs for a specific service:

```bash
infra/scripts/nyra logs orchestrator n8n
```

View Grafana dashboard:

* Local: `http://orchestrator.local:3005`
* Via tunnel: `https://grafana.ratehunter.net`

## 4. Workflow Import

1. Access n8n via its web UI (`http://orchestrator.local:5678` or the Cloudflare subdomain).
2. Create credentials for Postgres, Twilio, and Slack in the n8n credential manager.
3. Import the JSON files under `infra/n8n-workflows` to create the SMS campaign and mortgage lead intake workflows.
4. Activate the workflows and test by posting sample payloads.

## 5. Oracle Migration

Follow the steps in `ORACLE-SETUP-GUIDE.md`.  Once services are running on Oracle, update your Infisical secrets to point to the new database hosts and test connectivity.

## 6. Health Checks

All services expose a `/health` endpoint.  To verify health:

```bash
curl http://localhost:6000/health           # Nexus
curl http://localhost:4000/api/health       # Archon
curl http://localhost:3001/api/v1/version   # Gitea
curl http://localhost:5678/healthz          # n8n
```

Prometheus collects service health metrics automatically.  Alerts can be configured in Grafana as needed.

## 7. Backup & Restore

* Use `pg_dump` to backup Postgres databases.  Automate nightly backups with cron.
* Use `redis-cli --rdb` to snapshot Redis.  Copy the `dump.rdb` file to a safe location.
* Use `docker cp` to backup volumes for FalkorDB and RuVector data.
* Store backups in Oracle Object Storage or another cloud provider.

## 8. Troubleshooting

* **Service failing to start:** Run `infra/scripts/nyra logs <node> <service>` to inspect logs.
* **Port conflict:** Ensure no other processes are using the required ports (see `PORT-MAP.md`).
* **Secret not found:** Verify that the secret exists in Infisical and that it is mapped to the correct path and environment variable.
* **Oracle connectivity:** Check Tailscale status on both ends (`tailscale status`).  Make sure firewall rules allow traffic.

## 9. Disasters & Rollback

If the stack becomes unstable after an upgrade:

1. Stop the affected services using `nyra down`.
2. Restore data from the most recent backup (Postgres, Redis, etc.).
3. Redeploy the previous stable version of the compose file or images.

For a quick rollback from Oracle, point your environment variables back to the on‑prem databases and bring the local services up again.

---

This runbook is a living document; update it whenever new services are added or deployment procedures change.