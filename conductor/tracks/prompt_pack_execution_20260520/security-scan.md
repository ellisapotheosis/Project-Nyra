# Security Scan

## Scope

Metadata-first scan on 2026-05-20. The scan avoided printing secret values.

## Commands

```bash
git ls-files | rg '(^|/)\\.env($|\\.)|\\.env$|secret|credential|token'
git ls-files | rg -v '(^|/)(node_modules|\\.next|dist|build|coverage|docs/archive|docs/research|conductor/prompts)/' | xargs rg -l -i '(api[_-]?key|secret|password|token|TWILIO|SENDGRID|ANTHROPIC|OPENAI|SUPABASE)'
git check-ignore -v infra/hosts/orchestrator/.env infra/hosts/oracle-vps/.env infra/hosts/worker-rtx5090/.env infra/hosts/worker-rtx3090ti/.env infra/hosts/worker-rtx3060/.env
```

## Findings

- No tracked bare host `.env` files were found by `git ls-files`; tracked environment files are examples/templates.
- Host runtime `.env` files are ignored:
  - `infra/hosts/orchestrator/.env`
  - `infra/hosts/oracle-vps/.env`
  - `infra/hosts/worker-rtx5090/.env`
  - `infra/hosts/worker-rtx3090ti/.env`
  - `infra/hosts/worker-rtx3060/.env`
- Secret keyword hits remain high because the repo intentionally contains example env files, prompt packs, security docs, Infisical scripts, and auth/token utility code.
- Dedicated secret scanners such as `gitleaks` and `trufflehog` are not installed in this environment.

## Follow-Up

- Run `gitleaks detect --source . --no-git` or equivalent before public release.
- Keep production values in Infisical, ignored `.env` files, or provider secret stores.
- Do not paste raw scan matches into logs or chat unless values are redacted first.
