# Project Nyra Public Readiness Audit - 2026-05-19

This audit captures the local cleanup and the separate history-rewritten public mirror prepared for making Project Nyra public again.

## Current Public-Ready Artifact

Use this cleaned mirror/check-out pair for the public repository, not the original dirty working repository:

- Clean mirror: `/home/ellisapotheosis/repos/project-nyra-public-clean.git`
- Clean checkout: `/home/ellisapotheosis/repos/project-nyra-public-clean`
- Clean branch: `codex/bootstrap-wave-cleanup`
- Clean checkout HEAD: `1daa3d18`

The original repository at `/home/ellisapotheosis/repos/project-nyra` was not history-rewritten in place because it has unrelated working-tree changes. Do not make that original repo public or push it as-is.

## Completed Cleanup

- Deleted local ignored `data/gitea-db/`; it is absent from `/home/ellisapotheosis/repos/project-nyra`.
- Added a repository `.gitignore` rule for `.omc/` so local OMC session/runtime state is not committed again.
- Removed tracked `.omc/` runtime/session files from the git index with `git rm --cached -r .omc`; the local files remain on disk and are ignored.
- Removed the obsolete root-level `generate_oracle_onevm_pack.sh` generator because it still generated a deprecated Oracle/RuVector stack.
- Generated the ignored-file inventory at `docs/public-readiness/gitignored-inventory-2026-05-19.txt`.
- Installed local cleanup tooling:
  - `$HOME/.local/bin/gitleaks`
  - `$HOME/.local/bin/git-filter-repo`
- Built a separate history-rewritten mirror at `/home/ellisapotheosis/repos/project-nyra-public-clean.git`.
- Removed temporary pre-filter public-clean checkout backups after final verification.

## History Rewrite Scope

The public-clean mirror removed confirmed public-risk paths and broad archive/binary classes from all refs, including:

- `data/gitea-db`
- `.omc/` directories at any depth
- `.wrangler/state/` directories at any depth
- `docs/configuration/env-backups`
- `docs/configuration/infisical-secrets-management/migration`
- `docs/configuration/master-env-inventory.md`
- `docs/security/INFRASTRUCTURE-SECURITY-AUDIT.md`
- `infra/hosts/oracle-vps/resolved_config.yml`
- `generate_oracle_onevm_pack.sh`
- `docs/ruvector`
- `docs/research/ruvector`
- historical Git LFS pointer paths
- high-risk generated/archive binary and upload paths: `*.pdf`, `*.mp4`, `*.zip`, `*.7z`, `*.xls`, `*.xlsx`, `*.xlsm`, `*.doc`, `*.docx`, `source_uploads/`, and `uploads/`
- every remaining path reported by repeated redacted `gitleaks git` scans until the history scan returned zero findings

## Verification Results

Final verification on the cleaned mirror and checkout:

| Check                                           |     Result |
| ----------------------------------------------- | ---------: |
| Clean checkout status entries                   |          0 |
| Git LFS paths in all history                    |          0 |
| `gitleaks dir` findings on clean checkout       |          0 |
| `gitleaks git` findings on clean mirror history |          0 |
| High-confidence secret-regex path matches       |          0 |
| Toxic-path history hits                         |          0 |
| Suspicious HEAD tree path hits                  |          0 |
| Clean mirror packed size                        | 569.27 MiB |

Notes:

- `gitleaks git` warned that exhaustive rename detection was skipped because the repository has many files. The scan still completed across 710 commits and returned zero leaks.
- `git diff --check` in the original repo returned no whitespace errors, only existing LF-to-CRLF warnings on several files.

## Gitignored Inventory Summary

Total ignored paths found by `git ls-files --others --ignored --exclude-standard`: 350,584.

Top ignored groups:

| Group          |   Count |
| -------------- | ------: |
| `node_modules` | 196,287 |
| `apps`         | 147,565 |
| `services`     |   5,423 |
| `packages`     |     576 |
| `.omc`         |     271 |
| `.omx`         |     189 |
| `.turbo`       |     147 |
| `bootstrap`    |      45 |
| `workflows`    |      27 |
| `infra`        |      21 |

## Remaining Risks Before Public Release

1. The original repo is not the public-safe artifact.
   - It still has a dirty working tree and unreduced original history.
   - Use `/home/ellisapotheosis/repos/project-nyra-public-clean.git` as the source for any public remote push.

2. Rotate credentials that ever existed in the original private history.
   - History cleanup prevents public exposure through the cleaned mirror, but it does not make previously committed secrets safe.

3. Review non-secret confidentiality before publishing.
   - Secret scans are clean, but public release may still require removing proprietary planning notes, customer-specific details, or private strategy material that is not detectable as a secret.

4. Coordinate the history rewrite.
   - A mirror push rewrites remote history. Existing collaborators will need to reclone or reset to the cleaned remote.

## Suggested Public Push Procedure

Only after confirming the target public remote URL:

```bash
git -C /home/ellisapotheosis/repos/project-nyra-public-clean.git remote add public <PUBLIC_REMOTE_URL>
git -C /home/ellisapotheosis/repos/project-nyra-public-clean.git push --mirror public
```

After the push, keep the public repo protected by enabling secret scanning, push protection, required CI checks, and branch protection before accepting public contributions.
