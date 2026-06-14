# Home Assistant Host

Home Assistant integrations live here when Project Nyra needs home/office automation hooks.

## Secrets Contract

Do not create or depend on repo-local `.env` files in this directory. Runtime secrets belong in Infisical and are injected at process start by repo-root Makefile targets.

The expected flow is:

1. The operator or agent runs `make <target>` from the repo root.
2. The Makefile sources `~/.zsh/99-secrets.zsh` only when the current shell has no `INFISICAL_TOKEN`.
3. Host-specific compose commands run under `infisical run` with the matching Infisical path.
4. Docker Compose receives secrets only through that runtime environment.
5. Sidecar-managed services consume secrets from their runtime volume, not local env files.

The only local secret-bearing file for normal operations should be the user shell secret file outside the repo: `~/.zsh/99-secrets.zsh`.
