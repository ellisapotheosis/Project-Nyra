# Ignore Review - 2026-05-19

## Confirmed Ignored

- `.env`, `.env.*`, and runtime secret exports
- `.next/`, `.open-next/`, and `.next.backup-*`
- `.clerk/`
- `data/gitea/` and `data/gitea-db/`
- `secrets/`, `.secrets/`, and `credentials/`
- private key material such as `*.pem`, `*.key`, and `*.cert`
- Windows metadata such as `*:Zone.Identifier`

## Unsure / Needs Human Review

- `.codex/` and `.agents/` because they contain useful agent config but may also
  accumulate runtime state.
- `.omc/` because plans can be useful while logs can be transient.
- `.claude/` and `.gemini/` because only non-secret settings should be kept.
- `external/` because submodule worktrees should be audited separately from the
  Project Nyra superproject.
- `apps/guidance/references/` because source snapshots are useful but generated
  build outputs should stay out of Git.
- `docs/archive/` because historical docs are useful but embedded runtime files
  should be externalized.
- `infra/hosts/oracle-vps/migrated-compose/` because it is under the permitted
  host tree but looks historical rather than active.

## Archive Destination

```text
~/repos/nyra_archived/project-nyra/2026-05-19/
```
