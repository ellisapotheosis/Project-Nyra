# Project Nyra Infra (Stand-up Ready)

This `/infra` package is the canonical bootstrap layer for:
- Orchestrator control plane
- Oracle host service profiles
- 3 worker lanes (3060 / 3090ti / 5090)
- Nexus + LiteLLM as shared routing spine
- Workflow/CRM/observability stack

## Quick start

```bash
cp infra/env/nyra.env.example infra/env/nyra.env
# edit OPENROUTER_API_KEY at minimum
bash infra/scripts/bootstrap.sh
```

## Operator interface

Use root `Makefile` targets and infra scripts:
- `make bootstrap-ultimate`
- `make health`
- `./infra/scripts/ultimate-bootstrap.sh <role> <action>`

## Browser upload flow

1. Upload files into `bootstrap/incoming/` (GitHub UI/Codespaces).
2. Dry-run map:
   ```bash
   ./infra/scripts/bootstrap-import.sh bootstrap/incoming dry-run
   ```
3. Apply map:
   ```bash
   ./infra/scripts/bootstrap-import.sh bootstrap/incoming apply
   ```
