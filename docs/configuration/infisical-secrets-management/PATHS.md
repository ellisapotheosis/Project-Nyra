# Infisical Path Plan for Your Taxonomy

You gave these **top-level** paths:

/adapters
/base
/clients
/cloudflare
/databases
/github
/github-actions
/machines
/profiles
/providers
/router
/runs
/security
/shared

And these under `/shared/*`:
/shared/shared-attribution
/shared/shared-base
/shared/shared-network
/shared/shared-observability

## 1) Rules (so you never get lost again)

### Rule A — Use Infisical **Environments** for dev/staging/prod
Keep keys the same across envs (API_KEY, POSTGRES_URL, etc).
Do **not** use STAGING_API_KEY / PROD_API_KEY unless you have a hard reason.

### Rule B — Paths are for *scope*, not for *lifecycle*
- `dev/staging/prod` = environment lifecycle
- `/shared/*`, `/machines/*`, `/clients/*` = scope & ownership

### Rule C — What goes where
#### /shared/shared-base
Global defaults used by many services:
- DEFAULT_TIMEOUT_S
- LOG_LEVEL
- NYRA_STACK_NAME
- NAMESPACE_* variables

#### /shared/shared-network
Network constants used across machines:
- INTERNAL_NETWORK
- (optional) worker hostnames/subnets

#### /machines/<machine-name>
Machine-specific overrides:
- ORCHESTRATOR_IP (on orchestrator)
- WORKER_IP (one per worker) + GPU metadata

#### /clients/<tool-or-service>
Integrations you treat like “clients”/“tools”:
- /clients/archon-os, /clients/archon, /clients/ngrok, etc.

#### /github-actions
Only values needed by CI runners (tokens, models, automation knobs)

#### /adapters/<adapter-name>
Routing keys & endpoints for your model adapter layer (litellm/openrouter)

#### /router/<router-name>
Router/proxy config (litellm server/client, endpoints, auth to router)

#### /databases/<db-name>
DB URLs, user/pass, endpoints (postgres/qdrant/chromadb etc)

#### /cloudflare (top-level) vs /clients/cloudflare
You currently have both.
Pick one:
1) **Recommended**: `/cloudflare` = infra-level (tunnels, zones), `/clients/cloudflare` = app integration usage
2) Or: consolidate everything into `/clients/cloudflare` and delete the top-level one later

## 2) CI Variables — common extras you *might* need
Your list is strong. Common extras:
- GITHUB_TOKEN (many actions look specifically for this)
- CI=true (some tooling uses it)
- GITHUB_REPOSITORY / GH_REPO (sometimes assumed)
- NODE_AUTH_TOKEN / NPM_TOKEN (private npm)
- SENTRY_AUTH_TOKEN (sentry-cli)

## 3) Best bulk-upload strategy
Mirror your Infisical folder structure locally as files, then bulk-import.

Example file:
`envtree/dev/shared/shared-network.env`
→ uploaded to Infisical env=dev, path=`/shared/shared-network`

That’s what `scripts/bulk-import-tree.ps1` does.
