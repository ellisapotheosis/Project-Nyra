# Komodo deployment control plane

Komodo is the sole CD authority for Nyra after Forgejo migration. Forgejo
Actions owns tests and artifact publishing; Komodo receives a signed webhook or
approved release event and deploys the pinned Compose artifact to Oracle,
orchestrator, and worker Periphery agents. No production deploy job in Forgejo
should call Docker directly.

Use a pinned Komodo `2.2.0` release and pinned Periphery agents. Do not use
`latest`. Keep the Komodo core UI/API private behind Tailscale or Cloudflare
Access. Register only the hosts that need deployment and give each resource a
least-privilege service account.

Required Infisical path: `/apps/komodo`. Required keys are listed in
`docs/operations/forgejo/secret-inventory.md`. Store registry credentials and
webhook secrets in Komodo's secret/variable store through the audited bootstrap
procedure; do not put them in Compose or Forgejo workflow YAML.

Deployment sequence:

1. Install Komodo core and Periphery using the official release instructions.
2. Create Oracle, orchestrator, and worker resources with read-only health
   checks first.
3. Import Compose stacks from this repository and pin image digests.
4. Add a protected `main`/release webhook with a manual production approval.
5. Test rollback to the previous artifact before enabling automatic staging.

Official documentation: https://komo.do/docs/setup and
https://komo.do/docs/resources.
