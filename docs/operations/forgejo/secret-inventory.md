# Forgejo secret inventory

Infisical is the source of truth. Use separate paths and environments; do not
copy the complete `/hosts/oracle-vps` tree into Forgejo.

| Infisical path                  | Required keys                                                                                                                                                              | Consumer                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `/infra/staging/forgejo`        | `FORGEJO_DB_PASSWORD`, `FORGEJO_SECRET_KEY`, `FORGEJO_INTERNAL_TOKEN`, `FORGEJO_JWT_SECRET`, `FORGEJO_ADMIN_TOKEN`, `FORGEJO_SMTP_PASSWORD`, `FORGEJO_OAUTH_CLIENT_SECRET` | Forgejo                  |
| `/infra/staging/forgejo-runner` | `FORGEJO_RUNNER_REGISTRATION_TOKEN`                                                                                                                                        | dedicated Actions runner |
| `/apps/renovate`                | `RENOVATE_TOKEN`, `RENOVATE_GITHUB_COM_TOKEN` (only if a dependency source needs it), registry credentials as required                                                     | Renovate                 |
| `/apps/komodo`                  | `KOMODO_API_TOKEN`, `KOMODO_WEBHOOK_SECRET`, provider/registry credentials                                                                                                 | Komodo                   |

The paths above must exist in each Infisical environment (`dev`, `staging`,
and `prod`). The sync script fails closed when any required key is absent and
never prints values. Forgejo Actions repository secrets should contain only short-lived or
non-sensitive bootstrap values. Prefer Forgejo OIDC for cloud credentials when
the target provider supports it.
