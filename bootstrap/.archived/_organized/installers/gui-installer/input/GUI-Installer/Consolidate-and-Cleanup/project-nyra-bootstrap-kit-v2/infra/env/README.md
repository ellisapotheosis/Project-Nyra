# Env + Secrets (Nyra)

## Rules
- **Never commit** `.env` files.
- `.env.example` is allowed and should contain **keys only** (no values).
- Real secrets live in:
  - **Infisical** (machine-scoped and environment-scoped)
  - **Bitwarden Secrets Manager** (for human-access + cross-tool vaulting)

## Recommended layout (LAN)
- `infra/env/lan/shared/.env` (shared defaults; still keep secrets out)
- `infra/env/lan/machines/<machine>/.env` (machine overrides)
- Inject secrets at runtime via `infisical run -- <command>` or via MetaMCP tool calls.

## Infisical path convention
- shared: `shared/*`
- machine overrides: `machines/<machine-name>/*`

Your bootstrap scripts generate the **plan**; you fill the secrets in the manager.
