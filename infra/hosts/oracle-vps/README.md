# Oracle VPS Host

Oracle VPS is the canonical always-on host for Project Nyra server workloads, including Twenty CRM, Gitea, memory services, and public/private ingress support.

## Secrets Contract

Do not create or depend on repo-local `.env` files in this directory. Runtime secrets belong in Infisical and are injected at process start by repo-root Makefile targets.

The expected flow is:

1. The operator or agent runs `make <target>` from the repo root.
2. The Makefile sources `~/.zsh/99-secrets.zsh` only when the current shell has no `INFISICAL_TOKEN`.
3. The Makefile runs `infisical run --projectId ... --env ... --path /machines/oracle-vps -- docker --context oracle compose --env-file /dev/null ...`.
4. Docker Compose receives secrets only through that `infisical run` environment.
5. Host services that need sidecar secrets use the `secrets-init` / `infisical-agent` volume pattern defined in compose, not checked-in or local `.env` files.

The only local secret-bearing file for normal operations should be the user shell secret file outside the repo: `~/.zsh/99-secrets.zsh`.

## Gitea

Gitea is managed through `make gitea-up`, `make gitea-down`, and `make gitea-ps`. Its secret path is `/clients/gitea` in Infisical for service credentials and `/machines/oracle-vps` for host-level runtime composition.
