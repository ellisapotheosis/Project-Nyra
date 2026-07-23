# Forgejo operations

Run `scripts/forgejo/backup-gitea.sh` before any migration work. Use
`scripts/forgejo/migrate-gitea-to-forgejo.sh --check` for a read-only readiness
check. The live Gitea source currently has a PostgreSQL authentication failure,
so `--cutover` is deliberately fail-closed.

After Infisical authentication is available, run
`scripts/infisical/sync-forgejo-secrets.sh` on the host that owns the runtime
secret directory. Do not pipe its output to a terminal or commit the generated
files.

The canonical CI workflow is `.forgejo/workflows/nyra-ci.yml`. Renovate is
configured in `renovate.json5`. Komodo is documented in `infra/komodo/README.md`.
