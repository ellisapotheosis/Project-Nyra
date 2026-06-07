# Operations Release Checklist

Use this checklist for infra/runtime/security releases. It is host-scoped and
does not require direct production credentials for local dry runs.

## Preflight

```bash
git status --short
find infra -name 'docker-compose*.yml' -o -name 'compose*.yml' | sort
scripts/infra/assert-compose-source-of-truth.sh
scripts/infra/audit-runtime-security.sh
```

## Compose Validation

Validate the exact host stack before starting or restarting it:

```bash
docker compose -f infra/hosts/orchestrator/docker-compose.yml config >/tmp/nyra-orchestrator.compose.yml
docker compose -f infra/hosts/orchestrator/docker-compose.observability.yml config >/tmp/nyra-observability.compose.yml
docker compose -f infra/hosts/oracle-vps/docker-compose.yml config >/tmp/nyra-oracle.compose.yml
```

If a compose file fails because a required secret is missing, set the value in
Infisical, Portainer stack environment, or a gitignored host env file. Do not add
fallback passwords to source.

## Smoke Validation

```bash
scripts/deployment/health-check.sh --allow-down --json-out reports/health/release-smoke.json
pnpm -w test
pnpm -w lint
pnpm -w build
```

Use `--allow-down` only when the operator is validating from a workstation that
cannot reach all Tailscale hosts. A production release gate should review the
JSON report and treat unexpected `down` checks as blockers.

## Security Gate

```bash
scripts/security/scan.sh --quick
```

For production release candidates, run the full scan where Trivy, Semgrep,
TruffleHog, and Checkov are installed:

```bash
scripts/security/scan.sh --full
```

## Rollback

Prefer service-level rollback over repository-wide rollback:

```bash
docker compose -f infra/hosts/<host>/docker-compose.yml ps
docker compose -f infra/hosts/<host>/docker-compose.yml logs --tail=200 <service>
docker compose -f infra/hosts/<host>/docker-compose.yml up -d --no-deps <service>
```

If a release changes persisted data, capture a database backup before the change
and document the restore command in the release notes.

## Owner Actions

Record credential, DNS, MFA, OAuth, dashboard, and provider steps in
`docs/OWNER_MANUAL_ACTIONS.md`. Agents should not block on those steps unless
they are required for local validation evidence.
