# Agent Vault + Infisical setup

## Architecture

Agent Vault stores its own vaults and agent tokens. Infisical Cloud is used as
the source of truth for the Agent Vault token and any upstream credentials; it
is not configured as an Agent Vault storage backend. This keeps the broker
available locally over Tailscale while allowing credentials to be rotated from
Infisical.

## One-time Infisical setup

1. Open <https://app.infisical.com> and select the `project-nyra` project.
2. Create a Machine Identity named `agent-vault-sync`.
3. Grant it read access only to the required environment and paths, at minimum
   `/external/agent-vault` (and any upstream credential paths used by the
   selected Agent Vault services). Do not grant admin/project-management
   permissions.
4. Create a Universal Auth credential for the identity and save the client ID
   and client secret in a password manager. Do not commit them.
5. Log in to the Agent Vault web UI at `http://100.64.0.3:14321`, create or
   select the `project-nyra` vault, then create an agent named `nyra`
   with proxy access. Copy the one-time `av_agt_...` token.
6. Store that token in Infisical at `/external/agent-vault` as
   `AGENT_VAULT_TOKEN`. Store `AGENT_VAULT_VAULT=project-nyra` there too.

Agent Vault agent tokens are intentionally different from Infisical Machine
Identity credentials. Never put the Machine Identity client secret in a shell
export or LLM prompt.

## Local shell configuration

`~/.zsh/90-agent-vault.zsh` sets:

```sh
export AGENT_VAULT_ADDR="http://100.64.0.3:14321"
export AGENT_VAULT_VAULT="project-nyra"
```

Inject `AGENT_VAULT_TOKEN` only for the command/session that needs it. The
checked-in helper performs a short-lived Universal Auth login and emits shell
exports without writing the token to disk:

```sh
export INFISICAL_CLIENT_ID='REPLACE_ME_MACHINE_IDENTITY_CLIENT_ID'
export INFISICAL_CLIENT_SECRET='REPLACE_ME_MACHINE_IDENTITY_CLIENT_SECRET'
export INFISICAL_PROJECT_ID='REPLACE_ME_PROJECT_NYRA_ID'
eval "$(~/bin/agent-vault-infisical-env)"
test -n "$AGENT_VAULT_TOKEN" && test "$AGENT_VAULT_VAULT" = project-nyra
```

Prefer a short-lived CI/launcher environment over persisting the token in
`~/.zshrc`. The token is not written by this repository.

## Verification

```sh
curl -fsS http://100.64.0.3:14321/ >/dev/null
AGENT_VAULT_ADDR=http://100.64.0.3:14321 \
AGENT_VAULT_VAULT=project-nyra \
AGENT_VAULT_TOKEN="$AGENT_VAULT_TOKEN" \
agent-vault run -- claude --version
```

`agent-vault run` sets the proxy and CA variables for the child process; the
real upstream credentials remain in Agent Vault and are not placed in prompts.
