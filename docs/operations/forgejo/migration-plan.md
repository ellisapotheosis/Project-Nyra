# Forgejo migration and delivery control plane

## Decision

Forgejo is the canonical Git, pull-request, issue, package, and native Actions
control plane. Renovate creates dependency update pull requests against Forgejo.
Komodo is the only continuous-delivery/deployment authority for Docker Compose
stacks. Forgejo Actions builds, tests, and publishes artifacts; it does not
independently deploy production.

Semaphore and doco-cd are intentionally not installed. Semaphore would require
an external repository mirror because its documented first-class providers are
GitHub, Bitbucket, and GitLab. Doco-cd would overlap Komodo's Compose/GitOps
deployment and create two trigger and rollback authorities.

References: [Forgejo Actions](https://forgejo.org/docs/latest/user/actions/overview/),
[Forgejo Gitea migration](https://forgejo.org/docs/v11.0/admin/upgrade/from-gitea/),
[Renovate Forgejo platform](https://docs.renovatebot.com/modules/platform/),
[Komodo](https://komo.do/docs/intro).

## Why cutover is currently blocked

The live Oracle source is Gitea 1.21.11 and is unhealthy: its container logs
show PostgreSQL password authentication failures for user `gitea`. The remote
deployment directory is not a Git worktree and its Compose file differs from the
repository copy. Do not overwrite it or attempt an in-place upgrade until a
consistent database/volume/configuration backup exists.

## Staged migration

1. Run `scripts/forgejo/backup-gitea.sh` against the Oracle alias. It exports
   PostgreSQL, volume archives, container metadata, and a redacted deployment
   manifest without printing secrets.
2. Repair the Gitea database credential from the original secret source, or
   restore the matching password into PostgreSQL. Verify `/api/healthz` and a
   read-only repository API call.
3. Start Forgejo **10.0.1** against a copy of the repaired Gitea database and
   repository data on staging ports. Forgejo's documented compatibility path
   requires this bridge before later major releases.
4. Verify users, organizations, repositories, LFS, packages, webhooks, SSH,
   Actions, and repository clone/push behavior. Register a pinned, isolated
   Forgejo runner only after the service is healthy.
5. Upgrade the staging instance to an exact Forgejo 16 patch image, run the
   Forgejo doctor/checks, and repeat the API and clone tests.
6. Export the existing Cloudflare DNS/Access configuration, then schedule a
   maintenance window. Stop Gitea, take one final backup, switch the private
   origin and Access hostname to Forgejo, and verify before removing any old
   volumes.

The compose file intentionally binds staging to `127.0.0.1:3101` and SSH
`127.0.0.1:2223` so it cannot collide with the live Gitea service.

## Rollback

Keep the original Gitea volumes and Compose file. If a staged Forgejo check
fails, stop only the Forgejo project and restart the original Gitea project from
its preserved deployment copy. Never delete the old database or repository
volumes during this migration. The guarded cutover script refuses to run unless
`CONFIRM_FORGEJO_CUTOVER=I_UNDERSTAND` is set and a recent backup is present.

## Secret boundary

Infisical is canonical. The inventory in `secret-inventory.md` describes the
required paths and keys; `scripts/infisical/sync-forgejo-secrets.sh` materializes
only allow-listed runtime files with mode `0600`. Do not commit Forgejo,
Renovate, Komodo, runner, OAuth, registry, or webhook secrets.
