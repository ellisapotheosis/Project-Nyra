# Oracle Setup Guide

This guide describes how to migrate parts of the Nyra stack to an Oracle Always Free
Ampere instance.  The goal is to offload memory‑intensive services from your
orchestrator PC while keeping latency sensitive services on‑premises.

## 1. Decide What to Offload

Oracle’s free tier offers up to **4 OCPUs** and **24 GB RAM**.  Services that
benefit from large memory and can tolerate higher network latency are good
candidates.  Recommended to host on Oracle:

* **Databases**: `postgres-twenty`, `postgres-nyra_ai`, `postgres-letta`, `postgres-activepieces`, `postgres-dify`.
* **Graphiti / FalkorDB**: moves graph workload out of the orchestrator.
* **Memory services**: `letta`, `ruvector-postgres`.
* **Workflow engines**: `n8n`, `activepieces` – these are stateful but not latency critical.
* **Twenty CRM** and **Quote API**: heavy query loads, good to offload.
* **Prometheus & Grafana**: monitoring can be centralized in the cloud.

Keep on the orchestrator:

* **Nexus Router** – needs low latency to route LLM calls.
* **Archon** – knowledge hub used by developers.
* **Infisical** – secret manager; best kept local for low‑latency injection.
* **Gitea** – internal repo.
* **Redis** – local cache for quick session storage.

GPU workers continue to run only inference services.

## 2. Provision an Oracle Instance

1. Create an Oracle Cloud account and verify your identity.
2. Choose your **home region** (compute resources must be in the home region to be free).
3. Open the OCI console and create a **Virtual Cloud Network (VCN)** if one does not exist.
4. Launch a **VM.Standard.A1.Flex** instance with **4 OCPUs** and **24 GB RAM**.  Use Ubuntu 24.04 image.
5. Upload your SSH public key and note the public IP address.
6. If the console reports "out of host capacity", try another availability domain or wait.

## 3. Bootstrap the Host

SSH into the VM and run the steps outlined in `infra/scripts/oracle-setup.sh`:

```bash
chmod +x oracle-setup.sh
./oracle-setup.sh
```

This installs Docker, Docker Compose, Tailscale, creates data directories, and prepares the system.  Join your tailnet using an auth key.

## 4. Deploy Services

Copy the compose files from `infra/compose/oracle/` to the Oracle host.  Use the
following commands on the host:

```bash
# Pull images and start core services (databases, memory, CRM)
docker compose -f docker-compose.oracle-core.yml up -d

# Pull images and start apps and workflows (optional)
docker compose -f docker-compose.oracle-apps.yml up -d
```

Ensure the `.env` files exist and that secrets are injected via Infisical.  The
Oracle compose files reference the same variables as your on‑prem stack.

## 5. Configure Connectivity

* **Tailscale** – Use Tailscale to connect your orchestrator and GPU workers to the Oracle VM.  Ensure the Oracle machine obtains a tailnet IP (e.g. 100.64.0.50).
* **Cloudflared** – If you want to expose CRM or workflow UIs publicly, install cloudflared and configure a tunnel pointing to the Oracle machine.  Alternatively, route via the orchestrator’s existing tunnel (preferred for simplicity).
* **Update Nexus Router** – Modify the Nexus configuration so that services hosted on Oracle (e.g. Letta, Quote API) are addressed via their tailnet IPs.  Update the `services` section in `intelligent-routing-config.json` accordingly.

## 6. Migration Steps

1. Backup existing data from your orchestrator (`pg_dump`, `redis-cli save`, etc.).
2. Restore the data into the new Postgres and Redis containers on Oracle using `docker exec` or `psql`.
3. Point your services to the new databases by updating environment variables in Infisical.
4. Validate that applications can read/write data from Oracle.
5. Monitor resource usage via Grafana and Oracle console.  Adjust CPU/memory allocation as necessary.

## 7. Rollback

If things go wrong, stop the Oracle containers and revert environment variables back to the on‑prem host.  Keep your original volumes intact for quick fallback.

## 8. Tips

* Use separate `docker-compose` projects (`oracle-core`, `oracle-apps`) so you can restart specific tiers without affecting others.
* Consider using **Oracle’s Object Storage** for backups (S3 compatible).  Configure `restic` or `pg_dump` cronjobs to push backups offsite.

---

Oracle provides generous resources for free; by offloading heavy services you can keep your orchestrator lean and still support large workloads like RuVector embeddings and CRM operations.  Follow this guide carefully and you’ll have a resilient hybrid architecture.