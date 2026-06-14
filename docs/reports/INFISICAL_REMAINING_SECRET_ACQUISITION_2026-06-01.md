# Infisical Remaining Secret Acquisition

Generated: 2026-06-01

This document lists the remaining Project Nyra secrets that cannot be safely generated locally because they must come from a provider dashboard, OAuth app, vendor contract, GitHub App, or Infisical license entitlement. Values are intentionally omitted.

## Already Created Or Imported

These paths and imports were created in Infisical Cloud for the active environment:

| Path                       | Keys populated                                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/clients/openlit`         | `OPENLIT_DB_PASSWORD`, `OPENLIT_NEXTAUTH_SECRET`, `OPENLIT_VAULT_ENCRYPTION_KEY`, `OPENLIT_NEXTAUTH_URL`, `OPENLIT_ALLOWED_CORS_ORIGINS`, `OPENLIT_DB_USER`, `OPENLIT_DB_NAME`, `OPENLIT_TELEMETRY_ENABLED` |
| `/clients/superset`        | `SUPERSET_ADMIN_PASSWORD`, `SUPERSET_SECRET_KEY`, `SUPERSET_ADMIN_USERNAME`, `SUPERSET_ADMIN_FIRSTNAME`, `SUPERSET_ADMIN_LASTNAME`, `SUPERSET_ADMIN_EMAIL`, `SUPERSET_ENV`, `SUPERSET_LOAD_EXAMPLES`        |
| `/clients/memOS`           | `MEMOS_API_KEY`, `MEMORYTENSOR_API_KEY`, `MEMOS_MCP_API_KEY`, `MEMOS_API_URL`, `MEMOS_PUBLIC_URL`, `MEMOS_MCP_URL`                                                                                          |
| `/clients/GasTown`         | `GASTOWN_API_KEY`, `GASTOWN_ACCESS_TOKEN`, `GASTOWN_PUBLIC_URL`, `GASTOWN_ORACLE_INTERNAL_URL`, `GASTOWN_ORCHESTRATOR_INTERNAL_URL`, `GASTOWN_TAILSCALE_URL`                                                |
| `/providers/credit-bureau` | `CERTIFIED_CREDIT_WEBHOOK_SECRET`, `EQUIFAX_WEBHOOK_SECRET`                                                                                                                                                 |
| `/security/infisical`      | `INFISICAL_SCAN_GIT_WEBHOOK_SECRET` already existed                                                                                                                                                         |

Host/service imports now in place:

| Target path                  | Imported paths                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/machines/oracle-vps`       | `/clients/openlit`, `/clients/superset`, `/clients/memOS`, `/clients/GasTown`, `/security/infisical` |
| `/machines/orchestrator`     | `/providers/credit-bureau`                                                                           |
| `/services/soft-pull-credit` | `/providers/credit-bureau`                                                                           |

Decision: these folders were imported directly into their host/service targets instead of `/shared`. OpenLIT, Superset, memOS, GasTown, and local Infisical scanning are Oracle surfaces. Credit-bureau access belongs to the orchestrator and the soft-pull-credit service, not every worker.

## Remaining Manual Values

### OpenLIT OAuth

Target path: `/clients/openlit`

| Key                            | Where to get it                                                                           | Notes                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `OPENLIT_GOOGLE_CLIENT_ID`     | Google Cloud Console OAuth credentials: https://console.cloud.google.com/apis/credentials | OpenLIT maps this into `GOOGLE_CLIENT_ID`.                                                             |
| `OPENLIT_GOOGLE_CLIENT_SECRET` | Google Cloud Console OAuth credentials: https://console.cloud.google.com/apis/credentials | Google notes OAuth client secrets may only be visible/downloadable at creation time for newer clients. |
| `OPENLIT_GITHUB_CLIENT_ID`     | GitHub Developer settings OAuth Apps: https://github.com/settings/developers              | Create or open the OAuth App used for `openlit.projectnyra.com`.                                       |
| `OPENLIT_GITHUB_CLIENT_SECRET` | GitHub Developer settings OAuth Apps: https://github.com/settings/developers              | Generate/copy the OAuth App client secret and store it in Infisical.                                   |

Useful docs:

- Google OAuth client management: https://support.google.com/cloud/answer/6158849
- OpenLIT configuration: https://docs.openlit.io/latest/openlit/configuration
- GitHub OAuth apps API/auth reference: https://docs.github.com/v3/oauth/

### Credit Bureau Providers

Target path: `/providers/credit-bureau`

| Key                              | Where to get it                                                                                    | Notes                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `CERTIFIED_CREDIT_CLIENT_ID`     | Certified Credit account/vendor portal or implementation contact: https://www.certifiedcredit.com/ | Requires contracted access.                                                  |
| `CERTIFIED_CREDIT_CLIENT_SECRET` | Certified Credit account/vendor portal or implementation contact: https://www.certifiedcredit.com/ | Requires contracted access.                                                  |
| `EQUIFAX_CLIENT_ID`              | Equifax Developer Portal app credentials: https://developer.equifax.com/                           | Equifax assigns Client ID/Secret per app/environment after product approval. |
| `EQUIFAX_CLIENT_SECRET`          | Equifax Developer Portal app credentials: https://developer.equifax.com/                           | Store the environment-specific credential.                                   |

Webhook secrets already exist in `/providers/credit-bureau`. After vendor webhook endpoints are configured, paste the Infisical values into the vendor webhook settings so both sides match.

Useful docs:

- Equifax developer user guide: https://developer.equifax.com/help-support/user-guide
- Equifax developer documentation: https://developer.equifax.com/documentation

### Local Infisical Git Secret Scanning

Target path: `/security/infisical`

| Key                              | Where to get it                                                                       | Notes                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `INFISICAL_SCAN_GIT_APP_ID`      | GitHub App settings for the Infisical/local scanner: https://github.com/settings/apps | Must be the App ID from the GitHub App.                                               |
| `INFISICAL_SCAN_GIT_APP_SLUG`    | GitHub App settings for the Infisical/local scanner: https://github.com/settings/apps | Usually derived from the app name but should match GitHub exactly.                    |
| `INFISICAL_SCAN_GIT_PRIVATE_KEY` | GitHub App settings, private key download: https://github.com/settings/apps           | Download the PEM once and store the PEM in Infisical. Do not generate a random value. |
| `INFISICAL_LICENSE_KEY`          | Infisical account/sales entitlement: https://app.infisical.com/                       | Optional unless using licensed self-hosted features.                                  |

`INFISICAL_SCAN_GIT_WEBHOOK_SECRET` already exists in `/security/infisical`; paste that value into the GitHub App webhook secret field.

Useful docs:

- GitHub webhook secret validation: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
- Infisical self-host/cloud model: https://infisical.com/docs/documentation/getting-started/concepts/deployment-models

### Optional Or Future Provider Values

These were already identified in the broader missing-secret review and still require provider dashboards if they are active in production:

| Target path                   | Keys                                                     | Source                                                                                                                |
| ----------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/providers/aws`              | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`             | Prefer an IAM role where possible. If static keys are unavoidable, create least-privilege IAM access keys in AWS IAM. |
| `/providers/google`           | `GOOGLE_CLIENT_SECRET`, `GOOGLE_WORKSPACE_CLIENT_SECRET` | Google Cloud Console OAuth credentials.                                                                               |
| `/providers/microsoft`        | `MICROSOFT_CLIENT_SECRET`                                | Microsoft Entra app registration credentials.                                                                         |
| `/services/twenty-mcp-jezweb` | `CLERK_SECRET_KEY`, `ACCESS_TOKEN`                       | Clerk Dashboard and Twenty OAuth/token flow.                                                                          |
| `/clients/openlit`            | OpenLIT OAuth client IDs/secrets listed above            | Google and GitHub OAuth Apps.                                                                                         |

Useful docs:

- AWS IAM: https://aws.amazon.com/iam/
- Microsoft Entra app credentials: https://learn.microsoft.com/entra/identity-platform/how-to-add-credentials
- Clerk API key rotation and dashboard guidance: https://clerk.com/docs/guides/secure/rotate-api-keys

## Infisical API Notes

The import links were created via Infisical Secret Imports API. Infisical documents secret import creation as `POST /api/v2/secret-imports` with `projectId`, target `environment`, source `import.environment`, source `import.path`, and target `path`.

Reference: https://infisical.com/docs/api-reference/endpoints/secret-imports/create

## Follow-Up Checks

1. Add the remaining manual values in the target paths above.
2. Re-run the host env coverage scan with imports enabled.
3. Once workers and Oracle consistently load Infisical through the Makefile/sidecar path, remove live values from ignored local `.env` files and leave only empty placeholders or comments.
4. Keep `/shared` limited to secrets that are safe and useful on every machine. Do not import credit-bureau, OpenLIT, Superset, memOS, GasTown, or local Infisical scanner credentials into `/shared` unless the runtime topology changes.
