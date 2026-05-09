# Cloudflare Tunnel Discovery Delta

Updated: 2026-05-08

Desired model from the canonical prompt pack:

- Docker cloudflared connector containers on orchestrator and Oracle VPS.
- Cloudflare API-managed tunnel config, DNS records, Access apps, and policies.
- Infisical owns tunnel tokens and IDs.
- Generate local YAML as backup/review artifacts only.
- Stop before Cloudflare API apply unless explicitly approved.

Current live drift:

- Orchestrator tunnel is connected but only has `linkwarden.ratehunter.net`; all other desired hostnames are missing.
- `links.ratehunter.net` is the preferred Linkwarden hostname, but live config currently uses `linkwarden.ratehunter.net`.
- `nexus.ratehunter.net` returned Cloudflare `530` because no working public hostname/origin config exists for it.
- `openclaw-gateway.ratehunter.net` and `portainer.ratehunter.net` did not resolve.
- Oracle tunnel state was not verified from this local session.
- `infra/hosts/oracle-vps/cloudflared-config.yml` previously conflicted with the Pages decision by routing apex/www through Oracle; fixed in this working tree.

Next required action:

- Review `infra/cloudflare/desired-state/exposure-matrix.yml`.
- Confirm Oracle tunnel ID/token are present in Infisical path `/machines/oracle-vps`.
- Confirm orchestrator token is rotated because a token was pasted into chat.
- Approve Cloudflare API apply or manually create equivalent dashboard public hostnames and Access apps.
