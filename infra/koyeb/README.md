# Deploying Nyra Services on Koyeb

This directory contains manifests and templates for running select Project Nyra services on the **Koyeb** serverless platform.  Use these to offload lightweight components from your orchestrator PC and leverage Koyeb’s free or low‑cost tiers.

## Contents

- `webapp-backend.yaml` – Deploys the mortgage webapp backend (API) as a service.  Includes build configuration, health checks, environment variables, and TLS settings.
- `n8n-orchestrator.yaml` – Deploys the n8n workflow orchestrator, along with a ConfigMap defining your mortgage drip campaigns and workflow integrations.  Runs continuously and integrates with Infisical for secrets.
- `scaling-policies.yaml` – Defines free, starter, and production tier scaling policies.  Adjust these to match your workload and cost goals.
- `cost-optimization-guide.md` – A human‑readable guide explaining how to optimize costs on Koyeb, when to upgrade tiers, and how to design a hybrid architecture.
- `infisical-template.yaml` – A template for synchronizing secrets from Infisical into Koyeb via a Secret resource.
- `environment-configs.yaml` – Defines environment‑specific `.env` contents (production, staging, development) as a ConfigMap.
- `feature-flags.json` – Feature flag definitions consumed by the web app or other services.
- `pg_hba.conf` – Sample PostgreSQL client authentication file restricting connections to private networks.

## Usage

1. **Prepare Infisical** – Ensure you have an Infisical project with a `/koyeb` secret path containing the required keys (database URL, API keys, JWT secrets, etc.).  The `infisical-template.yaml` defines which keys must be present.

2. **Export Secrets** – Use the Infisical CLI to export your secrets into a dotenv or JSON format.  Then create a Koyeb Secret from that export:

   ```bash
   # Example: export secrets to dotenv and create Koyeb secret
   infisical secrets export --env production --format dotenv > secrets.env
   koyeb secret create infisical-secrets --value "$(cat secrets.env)"
   ```

3. **Deploy Services** – Use the Koyeb CLI or web UI to deploy the manifests.  For example:

   ```bash
   koyeb service apply -f webapp-backend.yaml
   koyeb service apply -f n8n-orchestrator.yaml
   ```

   or upload via the Koyeb Dashboard.  Note that the free tier allows only one instance per service.

4. **Configure Scaling** – Apply the desired scaling policy from `scaling-policies.yaml`.  For the free tier, the `free-tier-scaling` policy will be used automatically if you annotate your service with `tier: free`.

5. **Monitor Costs** – Review `cost-optimization-guide.md` and the Koyeb dashboard to ensure you stay within the free tier limits.  Adjust scaling policies as you grow.

## Notes

- These manifests are tailored for Koyeb.  They assume you’ll continue to run heavy workloads (Claude Flow, Postgres, Redis, RuVector) on your own hardware or cloud VMs.
- Use the provided `feature-flags.json` and `environment-configs.yaml` to control behavior across environments.  The web app and orchestrator scripts can read these via the Koyeb ConfigMap API.
- If you need more advanced scaling or multiple regions, consider upgrading to the Starter or Production tiers; see `scaling-policies.yaml` for details.