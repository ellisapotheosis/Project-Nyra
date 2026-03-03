# Ultimate Bootstrap (Orchestrator + Oracle + 3 Workers)

This is the definitive bring-up path using uploaded `infra/` assets.

## 1) Validate stack files

```bash
./infra/scripts/ultimate-bootstrap.sh orchestrator validate
```

## 2) Bring up orchestrator control plane

```bash
./infra/scripts/ultimate-bootstrap.sh orchestrator up
```

Profiles used: `core gateway workflow crm archon dev`

## 3) Bring up oracle-hosted services

```bash
./infra/scripts/ultimate-bootstrap.sh oracle up
```

Profiles used: `oracle apps observability edge`

## 4) Bring up each worker role

```bash
./infra/scripts/ultimate-bootstrap.sh worker-3060 up
./infra/scripts/ultimate-bootstrap.sh worker-3090ti up
./infra/scripts/ultimate-bootstrap.sh worker-5090 up
```

## 5) Status and health

```bash
./infra/scripts/ultimate-bootstrap.sh orchestrator status
make health
```

## 6) Browser-uploaded bootstrap file integration

1. Upload into `bootstrap/incoming/` from GitHub UI/Codespaces.
2. Dry-run import mapping:

```bash
./infra/scripts/bootstrap-import.sh bootstrap/incoming dry-run
```

3. Apply:

```bash
./infra/scripts/bootstrap-import.sh bootstrap/incoming apply
```

4. Regenerate infra inventory:

```bash
./infra/scripts/inventory-stack-assets.sh
```

## Notes

- Keep runtime orchestration in `infra/`.
- Keep service implementations in `services/`.
- Keep UIs in `apps/`.
- Keep shared libraries in `packages/`.
