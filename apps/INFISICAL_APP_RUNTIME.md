# App Infisical Runtime

Project Nyra host compose stacks use the root `Makefile` plus the Infisical runtime overlay:

- `infra/hosts/_templates/docker-compose.infisical-runtime.yml`
- `.infisical.json`
- root `Makefile`

Each app now has a thin local `Makefile` for app-scoped development. These files delegate host orchestration to the root Makefile and expose app-specific Infisical paths for local commands.

## App Secret Paths

```text
/apps/cockpit
/apps/ratehunter-landing
/apps/projectnyra-site
/apps/projectnyra-webapp
```

## Usage

From an app directory:

```bash
make infisical-env
make dev-with-secrets
make build-with-secrets
```

Host bring-up still runs from the repo root:

```bash
make orchestrator-up
make oracle-apps-up
make worker-5090-up
```

Do not place secrets in app source files. The app Makefiles only read through `infisical run` and the host sidecar overlay.
