# Secret Handling

Project Nyra treats secret management as a control-plane concern, not a convenience.

## Rules

- Real secrets live in Infisical or an approved runtime secret backend.
- Tracked files may contain only sanitized templates such as `.env.example`.
- Generated `.env` files, token caches, PEMs, and key material stay local and untracked.
- Any file that can carry credentials is scanned before commit.
- Any leak is treated as a rotation event until proven otherwise.

## Local workflow

1. Add or update values in Infisical.
2. Pull secrets at runtime with `infisical run` or the approved proxy layer.
3. Use `scripts/security/nyra-secret-scan.sh --staged` before every commit.
4. Use `scripts/security/audit-env-files.sh` when reviewing the repo for risky env files.

## Allowed tracked artifacts

- `.env.example`
- `.env.template`
- `.env.*.example`
- docs that describe secret handling without including real values

## Disallowed tracked artifacts

- `.env`
- `.env.local`
- private keys
- service tokens
- database URLs with passwords
- session/JWT secrets

## Incident trigger

Treat the following as a secret incident:

- a committed credential
- a credential in build logs
- a credential in a pasted code review or issue
- a public bind on an internal service that exposes protected admin paths

When in doubt, block the change and rotate the credential.
