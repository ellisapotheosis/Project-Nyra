# Nyra Secrets & Environment Reference

This document outlines how Project Nyra handles secrets and environment variables.

## Principles
- **Never commit secrets:** API keys, tokens, passwords and sensitive identifiers must not appear in source control.
- **Maintain an inventory:** Keep a master list of environment variables per service and environment. Use placeholder templates (`.env.template`) in the repo.
- **Use a secret manager:** Store actual secret values in Infisical or another vault. The free tier has limitations on projects and history; plan accordingly.

## Shared Secrets Script
The repository includes a PowerShell script to upload shared secrets to the vault. It reads environment variables from your local shell and writes them to a shared path. When using the script:
1. Source the helper that retrieves your Infisical API token【860511049078995†L23-L27】.
2. Export the necessary environment variables in your shell (API keys, domain names, repository token, environment flags).
3. Run the script with the appropriate environment argument to upload them. The script skips any variables that are unset and masks values in its output【860511049078995†L52-L59】.

## Creating `.env` Templates
For each service, create a `.env.template` file listing required variables with descriptive placeholder values. Example:

```dotenv
# Example placeholders for a service
API_KEY=<your-api-key-here>
DATABASE_URL=<postgres-connection-string>
JWT_SECRET=<random-secret>
DOMAIN_NAME=<project-domain>
ENVIRONMENT=development
```

Ensure these template files are committed to the repo and referenced in documentation. Team members should copy them to `.env` and fill in actual values locally or via the secret manager.

## Using Secrets
- Load secrets from environment variables at runtime. Validate that all required variables are defined.
- Avoid printing full secret values in logs. Mask or truncate them when reporting status.
- Use local `.env` files only for development or fallback; keep them out of version control.

## Free‑Plan Considerations
- The secret manager’s free tier may limit projects, users or versions. Consolidate secrets into a single project and avoid storing duplicate values.
- Document any manual steps (e.g., multi‑factor authentication, dashboard actions) in `docs/OWNER_MANUAL_ACTIONS.md` so that agents know when human intervention is required.

By following these practices, Project Nyra maintains secure and organised secret management across its services.
