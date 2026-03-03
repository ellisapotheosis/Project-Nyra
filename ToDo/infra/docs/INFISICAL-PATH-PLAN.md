# Infisical Secret Path Plan

This document describes how secrets are organized in **Infisical** for Project Nyra.  By placing secrets under structured paths, you can import them into your docker containers with minimal configuration.

## Path Hierarchy

### `/shared`

Contains secrets that are common to all machines and services.  Examples:

* `NEXUS_JWT_SECRET` – JWT signing key for Nexus Router.
* `GRAFANA_ADMIN_PASSWORD` – Default Grafana admin password.
* `GOOGLE_GEMINI_API_KEY` – API key for Gemini MCP.
* `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` – Twilio credentials for SMS campaigns.

### `/machines/orchestrator`

Secrets specific to the orchestrator machine, such as:

* `ARCHON_DB_PASSWORD`, `INFISICAL_DB_PASSWORD`, `GITEA_DB_PASSWORD` – Database passwords.
* `N8N_DB_PASSWORD`, `ACTIVEPIECES_DB_PASSWORD` – Workflow DB passwords.
* `LETTA_DB_PASSWORD` – Letta memory DB password.
* `NYRA_AI_DB_PASSWORD` – Password for RuVector Postgres.

### `/machines/worker-rtx3060`, `/machines/worker-rtx3090ti`, `/machines/worker-rtx5090`

Secrets for GPU workers.  Typically just `NEXUS_JWT_SECRET` and any tokens needed for Composio or MCP clients.  You may also store worker‑specific API keys here if a worker communicates with external services.

## Usage

1. **Import**: Use the Infisical CLI to import your `.env` files into the appropriate paths.  For example:

   ```bash
   infisical secrets set --projectId $INFISICAL_PROJECT_ID --env production --path /shared --file infra/env/.env.template
   infisical secrets set --projectId $INFISICAL_PROJECT_ID --env production --path /machines/orchestrator --file infra/env/.env.orchestrator
   infisical secrets set --projectId $INFISICAL_PROJECT_ID --env production --path /machines/worker-rtx3060 --file infra/env/.env.worker-rtx3060
   ...
   ```

2. **Inject**: Run `infisical run` (or use the Infisical Agent + sidecar pattern) when starting your services.  The `nyra` script automatically loads the `.env.<node>` file, so ensure secrets referenced there exist in the corresponding Infisical path.

3. **Rotate**: Use Infisical’s rotation policies to rotate secrets periodically.  Update the `.env` templates if you add new variables.

For more details on using Infisical, see the official docs or the Nyra runbook.