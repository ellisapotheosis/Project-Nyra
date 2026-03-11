# Runbook for Orchestrator and Workers

## Overview

This runbook provides step‑by‑step procedures for operating and maintaining the
Nyra orchestrator mini and GPU worker machines. It covers common tasks such as
starting and stopping the system, waking up workers, applying updates,
monitoring health and logs, and handling incidents.  The orchestrator is
deployed on a Minisforum UH680 running Ubuntu and serves as the always‑on
server.  Workers can be laptops (RTX 3060, RTX 5090) or desktops (RTX 3090 Ti)
that join the cluster when needed via Wake‑on‑LAN and Tailscale.

The default project root is `/opt/repos/project-nyra`, which can be overridden
by setting the `NYRA_REPO_ROOT` environment variable.  Logs are stored in
`/opt/repos/logs` by default.  All commands below assume you are running as the
`nyra` user on Linux or as an administrator on Windows.

## Orchestrator operations

### Starting the orchestrator services

1. Power on the orchestrator mini and log in as the `nyra` user.  The
   orchestrator runs Ubuntu and uses Docker to manage services.
2. Navigate to the project root:

   ```bash
   cd "${NYRA_REPO_ROOT:-/opt/repos/project-nyra}/infra"
   ```
3. Start all core services in the background:

   ```bash
   docker compose up -d
   ```
   This command launches Postgres with the RuVector extension, the Redis cache,
   the LiteLLM router (nexus), n8n/Activepieces, the AI service, and any
   additional services specified in the compose file.
4. Monitor startup logs:

   ```bash
   docker compose logs -f
   ```
   Wait until the database (`postgres`), the vector memory (`ruvector`), the
   message broker (`redis`), and the AI services report readiness.  You can
   press `Ctrl‑C` to detach from the logs.
5. Validate that containers are running:

   ```bash
   docker compose ps
   ```

### Stopping and restarting

To gracefully stop all services, run:

```bash
docker compose down
```

This stops and removes the running containers.  To restart services after
configuration changes or updates, run `docker compose up -d` again.

### Waking workers via Wake‑on‑LAN

Workers support Wake‑on‑LAN (WoL).  Use the included Python script from the
`scripts` directory to send magic packets to your worker machines:

```bash
python3 scripts/wol.py --config config/workers.json --wake worker-rtx3060
```

The `config/workers.json` file contains the MAC addresses and IP assignments
for each worker.  You can wake all workers at once using `--wake-all`.

### Updating the system

1. Pull the latest changes from the GitHub repository into your project root:

   ```bash
   cd "${NYRA_REPO_ROOT:-/opt/repos/project-nyra}"
   git pull origin main
   ```
2. Rebuild and restart the services:

   ```bash
   cd infra
   docker compose pull
   docker compose up -d --build
   ```
3. If database migrations are included, run them after the containers start:

   ```bash
   ./scripts/migrate.sh
   ```
   This script applies pending migrations to the `nyra_ai` and `twenty` databases.

### Monitoring and logging

* Logs for each service are stored in `/opt/repos/logs` (or the directory
  specified by `NYRA_LOG_DIR`).  Use `tail -f` to follow logs for a specific
  service:

  ```bash
  tail -f /opt/repos/logs/postgres.log
  ```
* `docker compose ps` lists running containers and their status.  Use
  `docker compose top` to view process information.
* For memory metrics, connect to the `nyra_ai` database using `psql` or
  visualize metrics via Grafana if configured.

### Incident handling

* **Service crash:** Run `docker compose logs <service>` to inspect why a
  container exited.  Restart the service with `docker compose restart <service>`.
* **Database issues:** Connect to the database using `psql` and inspect
  relevant tables.  Ensure the RuVector extension is loaded.  If necessary,
  restore from backups.
* **Worker connectivity:** If a GPU worker fails to connect, verify its
  network connectivity via Tailscale.  Ensure the worker is powered on and
  Docker is running.  Use `tailscale status` to check connectivity.

## Worker operations

Workers run GPU workloads for embeddings and AI tasks and can host UI
components when needed.  Workers may run Windows with WSL2 or Linux.

### Starting a worker

1. Wake the worker via the orchestrator using the Wake‑on‑LAN script or power
   it on manually.
2. Ensure the worker has an active Tailscale connection.  Run `tailscale up` if
   not yet connected.
3. Navigate to the project path.  On Windows, this might be:

   ```powershell
   cd C:\Dev\Projects\Repos\Project-Nyra
   ```
   On Linux, use:

   ```bash
   cd ~/nyra/project-nyra
   ```
4. Start the worker services:

   * **Windows/WSL2:** Run the PowerShell script in `scripts/windows`:

     ```powershell
     ./scripts/windows/start_worker.ps1
     ```
     This script starts Docker Desktop, ensures necessary images are pulled,
     and runs the worker compose file.
   * **Linux:** Use Docker compose:

     ```bash
     docker compose -f infra/worker-compose.yml up -d
     ```
5. Verify that the worker containers are running and that they can connect
   back to the orchestrator (via logs or health checks).

### Attaching and detaching workers

Workers are designed to be plug‑and‑play.  You can stop a worker by
running `docker compose down` in its project directory and shutting down the
machine.  Detaching a worker does not disrupt the orchestrator or other
workers, since all critical state is maintained in the orchestrator’s
database and message queues.

## Maintenance schedule

* **Weekly:** Pull latest code, update Docker images, review logs, and prune
  unused Docker volumes (`docker system prune -f`).  Confirm backups run as
  scheduled.
* **Monthly:** Backup the `nyra_ai` and `twenty` databases via `pg_dump` and
  verify restore procedures.  Review queue sizes and adjust Redis `maxmemory`.
* **Quarterly:** Review resource usage on the orchestrator and workers.
  Tune Postgres and Redis memory according to `04_RAM_BUDGET.md`.  Test
  disaster recovery by restoring from backups in a staging environment.

## Emergency procedures

* **Power outage:** The orchestrator mini should ideally run on a UPS.
  In case of sudden outage, wait for power to restore, then start services as
  described above.  Verify database integrity on restart.
* **Security incident:** If you suspect a breach, immediately isolate the
  affected host.  Rotate API keys in `.env` and Infisical secrets.  Review
  access logs and audit trails.  Follow the steps in `08_THREAT_MODEL.md`.
* **Hardware failure:** For orchestrator hardware failure, you can restore the
  Postgres databases and config files on a new machine.  Since the project
  root and logs are self‑contained in `/opt/repos/project-nyra` and
  `/opt/repos/logs`, copying these directories and restoring the database
  dumps will bring the system back online.