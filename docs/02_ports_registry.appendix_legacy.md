# 02 Ports Registry Appendix (Legacy / Archived References)

These compose files are intentionally excluded from ACTIVE registry and are listed for forensic reference only.

## Excluded paths
- `_archived/**`
- `infra-archived/**`
- `docs/**` and `docs/references/**`

## Discovery command
```bash
rg --files -g "docker-compose*.yml" -g "compose*.yml" | sort
```
