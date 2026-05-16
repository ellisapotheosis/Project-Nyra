# Infisical Runtime Contract

Project Nyra runtime secrets are sourced from Infisical. Do not hardcode secrets
in compose files, Make targets, or checked-in env files.

## Default Scope

The root `Makefile` defaults to:

```bash
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
AGENT_INFRA_ENV=dev
INFISICAL_SHARED_PATH=/shared
```

Every host compose invocation should load `/shared` first and then the matching
host path, for example `/machines/orchestrator` or `/machines/oracle-vps`.
Host-specific values override shared defaults.

## Runtime Pattern

Use the Make targets when possible. They run `infisical run` from the operator
shell and add the shared runtime sidecar overlay:

```bash
make up
make up-oracle
make up-workers
make oracle-webapp-twenty-up
make worker-5090-ai-up
```

The equivalent direct command shape is:

```bash
infisical run \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared" \
  --path="/machines/orchestrator" \
  -- docker --context orchestrator compose --env-file /dev/null \
    -f infra/hosts/orchestrator/docker-compose.yml \
    -f infra/hosts/_templates/docker-compose.infisical-runtime.yml \
    up -d
```

## Sidecar Overlay

`infra/hosts/_templates/docker-compose.infisical-runtime.yml` defines:

- `infisical-agent`: exports `/shared` and the host path into a runtime env file.
- `infisical-sidecar`: keeps the shared runtime secret volume mounted and visible.
- `nyra_runtime_secrets`: shared Docker volume for runtime env material.

The sidecar uses Infisical auth inherited from the shell environment running the
Make command. Do not write Infisical tokens into host `.env` files.

## Host Paths

Use these host paths for runtime compose:

```text
/machines/orchestrator
/machines/oracle-vps
/machines/worker-rtx5090
/machines/worker-rtx3090ti
/machines/worker-rtx3060
```

Provider- or client-specific paths, such as `/clients/paperclip`, may still be
read inside an Infisical-injected Make target when a service needs a narrow
secret that does not belong in `/shared`.
