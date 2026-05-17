# Tailscale Notes

- Oracle, orchestrator, and all workers must join same tailnet.
- DB/cache services remain tailnet-internal only.
- Use ACLs to allow orchestrator->workers inference traffic.

## GitOps policy

- Source of truth: `infra/tailscale/policy.hujson`.
- GitHub workflow: `.github/workflows/tailscale-acl-gitops.yml`.
- Pull requests that change the policy run the Tailscale GitOps action in `test` mode.
- Pushes to `main` run the action in `apply` mode.
- Manual dispatch supports `test` or `apply`.

The policy uses tags instead of Tailscale IPs so ACLs survive device re-creation:

- `tag:admin-device` for trusted admin/operator endpoints.
- `tag:homeassistant` for the Home Assistant monitoring/control node.
- `tag:orchestrator` for the MinisForum control-plane host.
- `tag:worker` for GPU worker appliances.
- `tag:prod` for the Oracle cloud host.
- `tag:ci` for future CI-only tailnet devices, if used.

Device tags are owned by `group:admin` in the policy. Apply the tags in the Tailscale admin console or during device auth before relying on these ACL grants.

## GitHub Actions secrets

Infisical should inject these GitHub Actions secrets:

- `TS_TAILNET` or `TAILSCALE_TAILNET`: Tailscale tailnet name/ID.
- Preferred OAuth auth: `TS_OAUTH_ID` or `TS_OAUTH_CLIENT_ID`, plus `TS_OAUTH_SECRET`.
- API-key fallback: `TS_API_KEY` or `TAILSCALE_API_KEY`.

For the current API-key-only setup, the minimum GitHub Actions secret set is `TAILSCALE_TAILNET` plus `TAILSCALE_API_KEY`. A `TAILSCALE_API_KEY` exported in local shell startup files such as `.zshrc` is useful for local commands, but GitHub Actions will only see it after Infisical injects it as a GitHub Actions secret.

If both OAuth credentials and an API key are present, the workflow uses OAuth. The OAuth client needs Tailscale `policy_file` scope to apply policy changes. Use `policy_file:read` only for validation-only credentials.
