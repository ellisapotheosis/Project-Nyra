# 20 Recovery Confidence Report

## Confirmed (file-backed)
- Primary base compose is `infra/docker-compose.yml` and is referenced by `Makefile` and `infra/scripts/nyra`.
- Root bootstrap compose files for Gitea/Infisical exist and validate with env templates:
  - `docker-compose.gitea.yml`
  - `docker-compose.infisical.yml`
- Cloudflared config is fail-closed and has a final 404 rule: `infra/cloudflared/config.yml`.
- `.env.gitea`, `.env.infisical`, and `.secrets/` are gitignored in `.gitignore`.

## Inferred (strong signal, indirect)
- Oracle node is the intended home for CRM/workflow/state-adjacent apps due to service definitions in `infra/hosts/oracle-vps/docker-compose.oracle.yml`.
- Orchestrator is the control-plane surface due to Gitea/Infisical/Archon/Nexus placement in root/infra compose files.
- Workers are inference-only private execution planes based on `infra/hosts/worker-*/docker-compose.gpu.yml`.

## Unknown (requires operator confirmation)
- Production tunnel UUID/name and final zone domain.
- Which Access policy groups (emails/service tokens) should gate each hostname.
- Whether legacy ingest compose paths are still used by any out-of-repo automation.

## Confidence score
- Inventory confidence: **high** (direct file evidence)
- Ports/exposure confidence: **high** (regenerated from active compose set)
- Runtime deployment parity confidence: **medium** (requires live environment verification)
