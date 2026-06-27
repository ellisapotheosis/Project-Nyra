# Project Nyra Secrets & Environment Reference

Project Nyra uses environment variables and secret management tools to secure sensitive information while enabling local development.

## Principles

* **Separation of secrets from code** – All secrets (API keys, database credentials, tokens) are stored in environment variables or Infisical vaults; they are never committed to the repository.
* **Central registry** – Maintain a master `.env` template enumerating required variables for each service. Each service reads its own `.env` file via dotenv.
* **Environment isolation** – Distinct `.env` files exist for local, staging and production environments, ensuring minimal privileges in each environment.
* **Least privilege & rotation** – Secrets are scoped to the minimum set of permissions and rotated regularly.

## Infisical Setup

Infisical provides secret management and synchronization. For the free plan, the following capabilities are available:

* **Secret vault** – Store environment variables for each environment and pull them into local development.
* **Agent vault** – Access secrets programmatically via the Infisical CLI or API.
* **Secret scanning** – Prevent accidental commits of secrets to the repository.
* **Personal access management (PAM)** – Provide limited access tokens for developers where supported.
* **Local caching/proxy** – Use local caching to work offline when available.

Track any limitations such as API rate limits, maximum secret count or environment constraints. For secrets not supported by Infisical (e.g., local GPU hosts), document manual provisioning steps.

## Environment Variable Inventory

Every service should define its required environment variables in a `.env.example` file. Variables include, at a minimum:

- **Database connection strings** – For Postgres, Redis, Qdrant and other databases used in the Oracle‑VPS stack.
- **API keys** – Twilio, SendGrid, LOS integration and third‑party providers.
- **Internal service URLs** – Base URLs for n8n, Activepieces, CRM API, campaign engine and quote service.
- **Feature flags** – To enable or disable experimental features.

Use descriptive names and group variables logically. Comments should indicate whether a variable is required, optional or derived.

## Free‑Plan Considerations

On the free plan, some Infisical features may be limited (e.g., number of secrets, users or API calls). Track these limits and plan fallbacks:

- For variables exceeding limits, store them in local `.env` files protected by file permissions.
- Use a proxy or CLI caching to reduce API calls when pulling secrets.
- Where PAM is unavailable, rotate tokens manually and document the process.

## Compliance & Audit

All secret usage must be auditable. Use Infisical’s audit logs where available, and ensure that scripts avoid printing secrets. Combine environment scanning with CI checks to prevent secrets from leaking into logs or version control. For extremely sensitive credentials (banking or legal), consider hardware security modules or offline storage.
