# Operations Runbook: Deployment & Recovery

This guide covers the procedures for redeploying the Project Nyra stack and recovering from failures.

## 🚢 Deployment

### 1. Unified Sync

Before deploying, ensure the local environment is synced with GitHub:

```bash
git pull --rebase
```

### 2. Infrastructure Updates

Infrastructure changes are managed via `make` targets in the `infra/` directory.

**Oracle-VPS Deploy:**

```bash
make oracle-up
```

**Orchestrator Deploy:**

```bash
make cf-orch-up # Ensure tunnels are active
make orch-up
```

### 3. Application Deploy (CI/CD)

- **RateHunter**: Automatically deployed to Cloudflare Pages on push to `main`.
- **Project Nyra**: Triggered via GitHub Actions or manual deploy script (see `DEPLOY.sh`).

## 🔄 Rollback

### 1. Infrastructure Rollback

If a compose change causes instability, revert to the previous Git commit and redeploy:

```bash
git revert HEAD
make oracle-up
```

### 2. Application Rollback

**Cloudflare Pages (RateHunter):**

1. Navigate to the Cloudflare Pages dashboard.
2. Select the "Deployments" tab.
3. Find the last stable deployment and click "Rollback to this deployment".

**Internal App (Oracle-VPS):**

```bash
# Revert image tag in compose or .env and re-up
docker compose -f infra/hosts/oracle-vps/docker-compose.yml up -d
```

## 🚑 Recovery

### Container Failure

1. Identify the failing container: `docker ps`
2. Check logs: `docker logs <name>`
3. Restart: `docker restart <name>`

### Data Recovery

- **Postgres**: Backup scripts are located in `infra/hosts/oracle-vps/scripts/`.
- **Syncthing**: State is mirrored across 4 local nodes; if one node fails, data persists on the others.

## 🧑‍💻 Manual Owner Actions

Ellis must manually perform the following after major shifts:

1.  Verify Cloudflare Access policies for new hostnames.
2.  Review Infisical secret overrides for production environments.
3.  Manually confirm quote logic changes before broker release.
