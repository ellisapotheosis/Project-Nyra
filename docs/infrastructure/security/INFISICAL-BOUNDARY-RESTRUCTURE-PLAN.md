# Infisical Boundary Restructure Plan

The only valid host boundary is `/hosts/<host-or-machine-name>`. Any old
`/machines/...` data is migration input only and must not remain after a
successful, value-verified migration.

Host boundaries:

- `/hosts/oracle-vps`
- `/hosts/orchestrator`
- `/hosts/worker-rtx5090`
- `/hosts/worker-rtx3090ti`
- `/hosts/homeassistant`

App boundaries:

- `/apps/projectnyra`
- `/apps/ratehunter`
- `/apps/projectnyra-landing`

Shared canonical service boundaries:

- `/clients/paperclip`, `/clients/searxng`, `/clients/browserless`, `/clients/letta`
- `/databases/qdrant-local`
- `/services/paperclip`, `/services/searxng`, `/services/browserless`, `/services/letta`, `/services/memory`
- Existing provider credentials remain under `/providers/<provider>`.

Host and app paths contain only values that differ for that host or app, or
verified imports/references to these shared canonical paths. They are not a
second copy of shared credentials.

Provider reference promotion is performed by
`scripts/infisical/apply-provider-references.sh`. For the audited `dev`
environment it writes references such as
`${dev.providers.litellm.LITELLM_API_KEY}` into the host and app boundaries;
the provider path remains the only value-bearing source. The script batches
updates per destination to reduce API churn. It does not delete destination
keys because a reference is the intended runtime alias; deleting the key
would remove the runtime binding rather than remove duplication.

The importer at `scripts/infisical/boundary-import.sh` imports real local env
files by default. The `--include-examples` option imports `.env.example` files
when a populated baseline is needed. The currently available host values and
the app example files are seeded into `dev`, `staging`, and `prod` as an initial
baseline and can be replaced later with production values.

Completed work:

- Created canonical host and app folders in `dev`, `staging`, and `prod`.
- Updated active Compose, Makefile, workflow, script, and documentation paths
  to use `/hosts/...` only.
- Imported available real host env files into all three environments.
- Imported `apps/projectnyra/.env.example` and `apps/ratehunter/.env.example`
  into their app boundaries in all three environments.
- Added populated Paperclip, SearXNG, Browserless, Letta, memory, and Qdrant
  values to their canonical service/client paths. Generated values replaced
  the supplied `replace-me` values; provider credentials were never replaced
  by template placeholders.
- Standardized operational service URLs on `*.projectnyra.com`. The only
  `ratehunter.net` exception is the public RateHunter landing page.

Remaining work:

- Replace the remaining example-derived app secret values with real credentials
  where no existing Infisical value was available. Template placeholders are
  audit findings, not valid runtime values.
- Run host runtime smoke tests on each actual host.
- Remove local real-value env files only after runtime pulls are confirmed.
- The requested Windows source directory was not mounted in this WSL session.
