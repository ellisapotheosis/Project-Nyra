# Cloudflare Prompt Pack Completion Audit

Updated: 2026-05-11

Scope:

- `bootstrap/project-nyra-cloudflare-final-prompt-pack`
- generated Cloudflare desired-state artifacts under `infra/cloudflare/`
- related reports under `docs/`

## Summary

The prompt-pack workflow has been executed through desired-state generation, Cloudflare API apply, validation reporting, and rollback documentation.

All package deliverables listed by `prompts/99-MASTER-ONE-SHOT-PROMPT.md` exist.

Remaining work is owner/environment-bound, not repo generation work:

1. Replace the mismatched Oracle tunnel token in Infisical `/machines/oracle-vps`.
2. Validate the Home Assistant Green Linkwarden origin from the orchestrator tunnel container or a Tailscale-authenticated shell.

## Deliverable checklist

| Deliverable                      | Status                 | Evidence                                                                    |
| -------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Static discovery report          | Present                | `docs/cloudflare-tunnel-discovery-static.md`                                |
| Runtime discovery report         | Present                | `docs/cloudflare-tunnel-discovery-runtime.md`                               |
| Discovery delta report           | Present                | `docs/cloudflare-tunnel-discovery-delta.md`                                 |
| Infisical secret audit           | Present                | `docs/infisical-cloudflare-secret-audit.md`                                 |
| Exposure matrix                  | Present                | `infra/cloudflare/desired-state/exposure-matrix.yml`                        |
| Exposure review                  | Present                | `docs/cloudflare-exposure-review.md`                                        |
| Local orchestrator export        | Present                | `infra/cloudflare/generated-local/orchestrator/cloudflared.yml`             |
| Local Oracle export              | Present                | `infra/cloudflare/generated-local/oracle/cloudflared.yml`                   |
| Remote orchestrator payload      | Present and valid JSON | `infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json` |
| Remote Oracle payload            | Present and valid JSON | `infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json`       |
| Access desired state             | Present and valid JSON | `infra/cloudflare/generated-remote/access-apps.desired.json`                |
| DNS desired state                | Present and valid JSON | `infra/cloudflare/generated-remote/dns-records.desired.json`                |
| Home Assistant Linkwarden report | Present and updated    | `docs/homeassistant-linkwarden-links-ratehunter-report.md`                  |
| Worker tunnel decision report    | Present                | `docs/worker-tunnel-decision-report.md`                                     |
| Apply report                     | Present                | `docs/cloudflare-api-apply-report.md`                                       |
| Validation report                | Present                | `docs/cloudflare-validation-report.md`                                      |
| Rollback plan                    | Present                | `docs/cloudflare-rollback-plan.md`                                          |

## Applied Cloudflare state

Evidence in `docs/cloudflare-api-apply-report.md` states:

- Cloudflare API accepted both tunnel configuration updates.
- 22 proxied CNAME records were upserted.
- 15 Cloudflare Access applications were created or updated.
- `ratehunter.net` and `www.ratehunter.net` were left on Cloudflare Pages.

Evidence in `infra/cloudflare/apply-results/orchestrator-config-after.json` shows the active orchestrator tunnel routes:

- `links.projectnyra.com -> http://100.64.0.2:3007`
- `linkwarden.projectnyra.com -> http://100.64.0.2:3007`
- `openclaw-gateway.projectnyra.com -> http://nyra-openclaw-gateway:8001`

Evidence in `infra/cloudflare/apply-results/dns-records-after.json` shows `links.projectnyra.com` and `linkwarden.projectnyra.com` point to:

- `ae0bd53a-f22e-4414-8593-5b765dcd044b.cfargotunnel.com`

Evidence in `infra/cloudflare/apply-results/access-apps-after.json` shows Access apps exist for:

- `links.projectnyra.com`
- `linkwarden.projectnyra.com`

## Linkwarden / Home Assistant status

The route, DNS records, and Access apps are created. Origin health is not proven from the current Codex App session.

2026-05-11 local checks:

- `tailscale status` reported this session is logged out.
- `ping 100.64.0.2` had 100% packet loss.
- `curl -I --max-time 12 http://100.64.0.2:3007` timed out.
- `curl --http1.1 -I --max-time 12 https://links.projectnyra.com` returned an empty reply.

Inference:

- The prompt-pack Cloudflare-side work for Linkwarden is complete.
- The remaining Linkwarden task is origin reachability from the orchestrator tunnel container or a Tailscale-authenticated shell.

Next validation command from the orchestrator host:

```bash
docker exec nyra-cloudflared-orchestrator wget -S -O- http://100.64.0.2:3007
```

If that fails, validate Home Assistant Green's current Tailscale IP, Linkwarden port, and service bind interface. If orchestrator routing cannot be made reliable, use the documented fallback: create a dedicated Home Assistant tunnel only after explicit approval.

## Verification run

Fresh checks run on 2026-05-11:

```bash
jq empty \
  infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json \
  infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json \
  infra/cloudflare/generated-remote/access-apps.desired.json \
  infra/cloudflare/generated-remote/dns-records.desired.json \
  infra/cloudflare/apply-results/orchestrator-tunnel.apply.json \
  infra/cloudflare/apply-results/oracle-tunnel.apply.json \
  infra/cloudflare/apply-results/dns-records-after.json \
  infra/cloudflare/apply-results/access-apps-after.json
```

Result: JSON validation exited successfully.
