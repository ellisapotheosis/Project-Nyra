# 14 Infra Target Tree (Post-Move, Verified)

## Runtime control paths
- Primary stack orchestration: `Makefile`
- Distributed node orchestration: `infra/scripts/nyra`
- Node-specific local workflows: `infra/hosts/*/docker-compose.*.yml`

## Verified compose path tree

```text
.
├── docker-compose.crm-api.yml
├── docker-compose.dev.yml
├── docker-compose.gitea.yml
├── docker-compose.infisical.yml
├── docker-compose.prod.yml
└── infra/
    ├── docker-compose.yml
    ├── compose/
    │   ├── docker-compose.archon.yml
    │   ├── docker-compose.supabase.yml
    │   └── overrides/
    │       ├── docker-compose.dev-laptop.override.yml
    │       ├── docker-compose.oracle.override.yml
    │       ├── docker-compose.orchestrator.override.yml
    │       └── docker-compose.worker-rtx3060.override.yml
    └── hosts/
        ├── orchestrator/docker-compose.orchestrator.yml
        ├── oracle-vps/docker-compose.oracle.yml
        ├── worker-rtx3060/
        │   ├── docker-compose.gpu.yml
        │   └── docker-compose.worker.yml
        ├── worker-rtx3090ti/
        │   ├── docker-compose.gpu.yml
        │   └── docker-compose.worker.yml
        └── worker-rtx5090/
            ├── docker-compose.gpu.yml
            └── docker-compose.worker.yml
```

## Excluded paths
- `infra/ingest/**`
- `docs/**` examples/archive content
- `_archived/**` and `infra-archived/**`
