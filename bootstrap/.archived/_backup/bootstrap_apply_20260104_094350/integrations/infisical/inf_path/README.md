# infisical-path-plan-kit

## What this gives you
- A clean mapping from your taxonomy to Infisical folder paths
- A PowerShell script that bulk-imports **many env files** into their correct paths by mirroring the folder tree

## Use it

1) Put your real values into files under:
`envtree/<env>/...`

Example:
- `envtree/dev/shared/shared-network.env`
- `envtree/dev/machines/orchestrator-mini.env`
- `envtree/staging/...`
- `envtree/prod/...`

2) Import:

```powershell
PowerShell -NoProfile -ExecutionPolicy Bypass -File .\scripts\bulk-import-tree.ps1 -Env dev
.\scripts\bulk-import-tree.ps1 -Env staging
.\scripts\bulk-import-tree.ps1 -Env prod
```

Dry run:

```powershell
.\scripts\bulk-import-tree.ps1 -Env dev -DryRun
```

## Requirements
- `infisical` CLI must be logged in OR `INFISICAL_TOKEN` must be set.
