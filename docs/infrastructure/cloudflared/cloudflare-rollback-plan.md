# Cloudflare Rollback Plan

Updated: 2026-05-08

Backups created before apply:

- `infra/cloudflare/backups/orchestrator-current-config.json`
- `infra/cloudflare/backups/oracle-current-config.json`
- `infra/cloudflare/backups/dns-records-current.json`
- `infra/cloudflare/backups/access-apps-current.json`

Rollback tunnel configs:

1. Use the same Infisical path used for apply: `/hosts/orchestrator`.
2. PUT the backed-up `.result.config` payloads back to:
   - `/accounts/{account_id}/cfd_tunnel/{ORCHESTRATOR_TUNNEL_ID}/configurations`
   - `/accounts/{account_id}/cfd_tunnel/{ORACLE_TUNNEL_ID}/configurations`
3. Re-check tunnel configs with the Cloudflare API.

Rollback DNS:

1. Compare `infra/cloudflare/backups/dns-records-current.json` with `infra/cloudflare/apply-results/dns-records-after.json`.
2. Delete records that were created by this apply if no longer wanted.
3. Restore changed records from backup using their prior record IDs and values.

Rollback Access:

1. Compare `infra/cloudflare/backups/access-apps-current.json` with `infra/cloudflare/apply-results/access-apps-after.json`.
2. Delete newly created self-hosted apps if needed.
3. Restore previous app policies from the backup JSON for any app that was updated.

Preferred operational rollback:

- Do not remove DNS for `ratehunter.net` or `www.ratehunter.net`; those were not changed by this apply and should remain Cloudflare Pages.
- If Oracle remains down, leave DNS in place and repair the Oracle connector rather than deleting subdomain records.
