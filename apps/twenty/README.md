# TwentyCRM (Temporary In-Repo Bootstrap Copy)

This folder currently hosts a **temporary in-repo TwentyCRM source copy** to support Project Nyra bootstrap and local integration testing.

## Current role
- Used by Oracle VM stack composition and early integration work.
- Kept in-repo temporarily to reduce bootstrap complexity while Gitea/separate repo provisioning is finalized.

## Detach plan (when ready)
1. Create a new standalone repo (GitHub/Gitea), e.g. `twentycrm-fork`.
2. Copy `apps/twenty/*` into that repo and preserve commit history if required (`git subtree split` recommended).
3. Add CI/build pipeline in the new repo and publish image tags.
4. In Project Nyra, replace local source dependency with:
   - pinned image references in `infra/oracle` compose files, or
   - git submodule/subtree pointer (if source pinning is preferred).
5. Validate Oracle stack boot + API compatibility.
6. Archive any remaining legacy in-repo artifacts under `archive/YYYYMMDD` and update `archive/INDEX.md`.

## Notes
- Do not delete this folder until detached workflow is verified end-to-end.
- This folder is intentionally isolated under `apps/twenty` so removal is low-risk and explicit.
