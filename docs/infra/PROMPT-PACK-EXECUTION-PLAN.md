# Prompt Pack Execution Plan

Source prompt pack:
`/home/ellisapotheosis/repos/cloudflared/nyra_ha_domain_prompt_pack`

Execution date: 2026-05-17

## Operating rule

The agent completes every local, reversible, non-credentialed task autonomously. The owner only performs dashboard, MFA, registrar, provider-account, or physical-device actions that cannot be completed from this shell.

## Completed locally

| Prompt                            | Local result                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 00 repo/compose/cloudflared audit | Generated compose, container, port, UI, tunnel, domain, and architecture docs under `docs/infra/`.             |
| 01 Spaceship/Cloudflare DNS setup | Generated `docs/infra/SPACESHIP-CLOUDFLARE-DNS-CHECKLIST.md` and `docs/infra/DOMAIN-ROUTING-MATRIX.md`.        |
| 02 tunnel routing migration       | Generated static migration/validation docs without mutating live tunnel configs.                               |
| 03 service registry               | Generated `infra/service-registry.yaml` and `docs/infra/SERVICE-REGISTRY.md`.                                  |
| 04 Portainer fleet                | Documented existing Portainer compose and environment enrollment plan.                                         |
| 05 Home Assistant dashboard       | Generated `infra/hosts/homeassistant/dashboards/nyra-command-deck.yaml` and HA policy docs.                    |
| 06 iframe/CSP/Access              | Generated iframe decision and Cloudflare Access policy docs with conservative defaults.                        |
| 07 OpenClaw/PicoClaw              | Generated compatibility matrix; PicoClaw is not proven compatible because no PicoClaw source/config was found. |
| 08 status bridge                  | Added `services/status-bridge/` and orchestrator compose overlay.                                              |
| 09 final validation/rollback      | Generated validation report and rollback runbook.                                                              |

## Owner-only actions

These are the only actions that require the owner:

1. Add or confirm `ratehunter.net` and `projectnyra.com` zones in Cloudflare.
2. Change Spaceship authoritative nameservers after checking DNSSEC.
3. Attach `ratehunter.net` and `ratehunter.net` to the correct Cloudflare Pages project.
4. Apply Cloudflare DNS, tunnel public hostnames, and Access policies from the generated plan.
5. Complete Portainer first-login/admin setup and enroll remote environments.
6. Import or paste the generated Home Assistant dashboard YAML into Home Assistant.
7. Set secret values, especially `NYRA_STATUS_BRIDGE_TOKEN`, through Infisical or gitignored env files.

## Stop condition

This plan is complete when:

- Cloudflare zone and DNS validation resolves for both domains.
- Tunnel ingress validation passes on the tunnel hosts.
- Admin/control UIs are protected by Access or tailnet-only policy.
- Portainer lists orchestrator, worker nodes, and Oracle VPS.
- Home Assistant loads the command deck and status bridge cards.
- No `ratehunter.net` tunnel route serves Project Nyra apps.
