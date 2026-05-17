# Public Repo Readiness Audit - 2026-05-17

## Verdict

Project Nyra is **not ready to switch back to public**.

The current tree has improved ignore rules for active app source files, but
Infisical's scanner still reports secret-like findings in both Git history and
the filesystem. Git history must be rewritten or the repository must be
recreated from a sanitized tree before making it public.

## Commands Run

```bash
infisical scan --source . --redact --report-format json \
  --report-path /tmp/project-nyra-infisical-git-scan.json --exit-code 0

infisical scan --source . --no-git --redact --report-format json \
  --report-path /tmp/project-nyra-infisical-fs-scan.json --exit-code 0

git ls-files -ci --exclude-standard
git ls-files '*docker-compose*.yml' '*docker-compose*.yaml' \
  'compose*.yml' 'compose*.yaml' '*.compose.yml' '*.compose.yaml'
git check-ignore -v <sample app source/generated paths>
```

## Secret Scan Summary

### Git History

Infisical scanned 716 commits and found 1,032 historical findings.

Top rule categories:

- 610 generic API key findings
- 342 curl authorization header findings
- 21 GCP API key findings
- 20 JWT findings
- 17 GitHub fine-grained PAT findings
- 6 OpenAI API key findings
- 4 Stripe access token findings
- 3 Cloudflare API key findings
- 2 private key findings
- 2 GitHub PAT findings

High-risk historical paths include:

- `infra/docker-compose/.env.golden-stack-populated`
- `nyra-configs/.env`
- `apps/twenty-crm/.env.twenty`
- `infra/hosts/oracle-vps/resolved_config.yml`
- archived `mcp-*`, `nyra-mcp-*`, `bootstrap`, and `_backup` trees

Action required before public:

- Rotate every provider token that may have ever been committed.
- Rewrite history with `git filter-repo` or BFG, or create a new sanitized
  public repository from a clean export.
- Re-run `infisical scan` against the rewritten repository before flipping
  visibility.

### Current Filesystem

Infisical found 1,717 filesystem findings.

The filesystem scan includes ignored local files. Classification by tracked
status:

- 41 tracked files with scanner findings
- 224 untracked or ignored files with scanner findings

Highest-risk local ignored paths:

- `secrets/infisical/export-prod/*.env`
- `infra/hosts/*/.env`
- `infra/.env`
- `apps/projectnyra/.clerk/.tmp/*`
- `data/gitea/gitea/jwt/*`

Scanner caveat:

- `data/gitea/ssh/` and `data/gitea-db/` were skipped by the filesystem scan
  due to permission denied. Treat them as unsafe until scanned or removed from
  the repo checkout.

Tracked filesystem findings are concentrated in:

- generated `.open-next` snapshots under `apps/guidance/references/...`
- generated `.next.backup-*` snapshots under `apps/projectnyra/...`
- API examples and docs with fake-looking but scanner-detectable keys
- security docs with curl bearer-token examples

## .gitignore Audit

Active app source paths are no longer hidden.

Verified as trackable:

- `apps/projectnyra/src/lib/**`
- `apps/projectnyra/public/**`
- `apps/ratehunter/src/lib/**`
- `apps/ratehunter/public/**`
- `apps/*/src/app/**/logs/**`

Verified as ignored:

- `.next/**`
- `.open-next/**`
- `.next.backup-*/**`
- `.clerk/**`
- `data/gitea-db/**`
- `*:Zone.Identifier`

Preventive ignore rules added in this audit branch:

- `**/.next/`
- `**/.next.backup-*/`
- `**/.open-next/`
- `**/.clerk/`
- `data/gitea-db/`
- `*:Zone.Identifier`

Important limitation:

- Ignore rules do not remove files already tracked by Git. Existing tracked
  generated artifacts still require an explicit archive-and-remove pass.

## Items Requiring Human/Owner Judgment

These are not safe to delete blindly:

- `.codex/**`, `.omc/**`, `.omx/**`, `.letta/**`: some are runtime state, some
  are repo agent configuration. Decide which should remain source-controlled.
- `apps/guidance/references/**`: appears to contain large historical snapshots,
  build output, and possibly useful migration evidence. Recommend archiving
  outside the public repo.
- `docs/archive/**`: useful history, but scanner findings and generated files
  make it risky for public repo retention.
- `external/**`: vendored third-party projects with compose files and examples.
  Prefer submodules, pinned upstream references, or external archive storage.
- `data/project-requirements/**` and `data/app-guidance/**`: contains old app
  requirement snapshots and compose files outside `infra/hosts`; archive unless
  actively used.
- `infra/env/**/*.example` and service `.env.example` files: likely intended as
  templates, but scanners flag some placeholder values. Keep only if all values
  are clearly fake placeholders.
- `docs/apps/**`: desired target location exists, but the current folder mixes
  app docs, execution plans, and old comparisons. Needs curation by app.

## Compose File Placement Audit

Policy: runtime Compose files should live only under
`infra/hosts/<host-name>/`.

Current valid Compose locations:

- `infra/hosts/oracle-vps/**`
- `infra/hosts/orchestrator/**`
- `infra/hosts/worker-rtx3060/**`
- `infra/hosts/worker-rtx3090ti/**`
- `infra/hosts/worker-rtx5090/**`
- `infra/hosts/_templates/**`

Tracked Compose files outside valid host locations:

- `data/app-guidance/project-requirements/apps/nyra-voice/docker-compose.yml`
- `data/app-guidance/project-requirements/apps/nyra-webapp/nyra-CRM/docker-compose.yml`
- `data/app-guidance/project-requirements/apps/nyra-webapp/nyra-front-end/mortgage-services/docker-compose.yml`
- `data/project-requirements/apps/nyra-voice/docker-compose.yml`
- `data/project-requirements/apps/nyra-webapp/nyra-CRM/docker-compose.yml`
- `data/project-requirements/apps/nyra-webapp/nyra-front-end/mortgage-services/docker-compose.yml`
- `docs/archive/repo-history/archive-root/20260306/apps-web-legacy/webapp/mortgage-services/docker-compose.yml`
- `docs/archive/repo-history/archive-root/20260307/infra/RateHunter/docker-compose.ratehunter.yml`
- `docs/archive/repo-history/archive-root/20260307/infra/nyra-complete/infra/docker-compose.oracle.yml`
- `docs/archive/repo-history/archive-root/20260307/infra/nyra-complete/infra/docker-compose.workers.yml`
- `docs/archive/repo-history/archive-root/20260307/infra/project-nyra-scaffold/infra/docker-compose.oracle.yml`
- `docs/archive/repo-history/archive-root/20260307/infra/project-nyra-scaffold/infra/docker-compose.workers.yml`
- `external/openclaw-n8n-stack/docker-compose.yml`
- `external/pocket-tts-openai/docker-compose.yml`
- `external/pocket-tts/docker-compose.yaml`

Recommendation:

- Archive all non-runtime compose examples to
  `~/repos/repo-archived/project-nyra/2026-05-17/compose-snapshots/`.
- Keep only active runtime compose files under `infra/hosts`.
- If an external stack is still active, copy or adapt its runtime compose file
  into the appropriate `infra/hosts/<host-name>/` directory and archive the
  vendored source.

## Cleanup and Consolidation Plan

### Phase 0 - Freeze Public Visibility

- Keep the repository private.
- Do not invite GitHub public scanning until history is sanitized.
- Rotate tokens now if any historical finding could be real.

### Phase 1 - Secret and Generated Artifact Removal

- Archive tracked generated artifacts outside the repo:
  `~/repos/repo-archived/project-nyra/2026-05-17/generated-artifacts/`.
- Remove from Git tracking after archive:
  `.next`, `.open-next`, `.next.backup-*`, `.clerk/.tmp`, `Zone.Identifier`,
  and checked-in local env files.
- Convert real env files into `.env.example` templates with placeholder values.
- Re-run both Infisical scans.

### Phase 2 - History Sanitation

- Use `git filter-repo` or BFG to remove historical env files, private keys,
  generated build output, and vendored snapshot trees.
- Force-push only after a local backup exists.
- Re-run Infisical git-history scan and confirm zero high-confidence secrets.

### Phase 3 - Root Folder Consolidation

Keep:

- `apps/`
- `services/`
- `packages/`
- `infra/`
- `docs/`
- `scripts/`
- `.github/`
- `.circleci/`

Archive or convert:

- `bootstrap/`
- `external/`
- `data/project-requirements/`
- `data/app-guidance/`
- old agent/runtime state under `.omc`, `.omx`, `.letta` if not canonical config

### Phase 4 - Infra Consolidation

- Keep runtime compose files only in `infra/hosts/<host-name>/`.
- Keep reusable compose snippets in `infra/hosts/_templates/`.
- Move old examples to archive, not to another active infra folder.
- Keep Cloudflare, Infisical, and host documentation in `docs/infra` and
  `docs/security`.

### Phase 5 - Docs Consolidation

Target docs categories:

- `docs/architecture/`
- `docs/infra/`
- `docs/security/`
- `docs/runbooks/`
- `docs/apps/`
- `docs/integrations/`
- `docs/decisions/`
- `docs/reports/`
- `docs/archive/`

Required app doc folders:

- `docs/apps/projectnyra/`
- `docs/apps/ratehunter/`
- `docs/apps/nexusui/`
- `docs/apps/twenty-crm/`
- `docs/apps/openclaw/`
- `docs/apps/activepieces/`
- `docs/apps/gitea/`

Archive instead of deleting:

- deprecated root docs
- duplicate Cloudflare tunnel reports
- old setup guides superseded by current runbooks
- RuVector docs
- old bootstrap/consolidation docs

### Phase 6 - App Folder Consolidation

Current active app folders detected:

- `apps/projectnyra`
- `apps/ratehunter`

Potentially archival or reference-only:

- `apps/guidance`

Rules:

- Real deployable apps need their own `apps/<app-name>` folder with
  `package.json`.
- Simple pages that belong to Project Nyra should move under
  `apps/projectnyra`.
- RateHunter should remain `apps/ratehunter` unless another active RateHunter
  distribution is found.
- NexusUI should only exist as `apps/nexusui` or `apps/NexusUI` if it is a real
  deployable app. Otherwise its pages/docs should be folded into
  `apps/projectnyra` and `docs/apps/nexusui`.

## Public Switch Checklist

Do not make the repo public until all boxes are true:

- [ ] `infisical scan --source .` returns zero high-confidence historical leaks.
- [ ] `infisical scan --source . --no-git` returns no tracked high-confidence leaks.
- [ ] Local ignored secret exports are outside the repo checkout.
- [ ] `git ls-files` contains no `.env`, `.next`, `.open-next`, `.clerk/.tmp`,
      `Zone.Identifier`, or private-key files.
- [ ] Runtime compose files only exist under `infra/hosts/<host-name>/`.
- [ ] Deprecated docs are archived outside the repo or under a sanitized
      `docs/archive` without secrets/build outputs.
- [ ] GitHub push protection and secret scanning are enabled before visibility
      changes.
