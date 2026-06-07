# Infisical Cloud/Local Split Guide

This guide separates the managed Cloud control plane at `app.infisical.com` from the self-hosted local Infisical stack on Oracle.

## Source-of-Truth Paths

| Path                        | Owner                                                  | Contents                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/security/infisical`       | Infisical Cloud                                        | Cloud operator access: `INFISICAL_TOKEN_CLOUD`, `INFISICAL_PROJECT_ID_CLOUD`, Cloud Universal Auth client credentials, Cloud API URL, Cloud organization/project metadata.                    |
| `/security/infisical/local` | Cloud-stored bootstrap for self-hosted local Infisical | Local container runtime config, local DB/Redis/bootstrap crypto, local SMTP, local sync token/project id, local scanner config, local PAM gateway credentials, and local feature-state flags. |

Do not store local self-hosted bootstrap secrets in `/security/infisical` except as a temporary migration backup. The sync script now reads Cloud credentials from `/security/infisical` and local credentials from `/security/infisical/local`.

## Recommended Local Setup Order

1. Finish local Universal Auth in the self-hosted UI.
   - Create a local Machine Identity in the self-hosted Infisical project.
   - Give it access to the environments and paths you want to sync.
   - Store the local token or local Universal Auth material in Cloud `/security/infisical/local`.
   - Required sync keys: `INFISICAL_TOKEN_LOCAL` and `INFISICAL_PROJECT_ID_LOCAL`.

2. Run a dry-run before any real sync.
   - `make infisical-cloud-status`
   - `make infisical-cloud-dry-run`
   - Keep Cloud authoritative at first. Use local-wins only after a deliberate local-first migration.

3. Enable local CLI/pre-commit secret scanning first.
   - Use `infisical scan` and `infisical scan git-changes --staged`.
   - This catches leaks immediately and does not require GitHub App/Radar setup.

4. Enable repository-connected secret scanning after GitHub App/Radar credentials exist.
   - Store real values in `/security/infisical/local`: `INFISICAL_SCAN_GIT_APP_ID`, `INFISICAL_SCAN_GIT_PRIVATE_KEY`, `INFISICAL_SCAN_GIT_APP_SLUG`, and `INFISICAL_SCAN_GIT_WEBHOOK_SECRET`.
   - Keep `SECRET_SCANNING_ENABLED=false` until the App ID, private key, and slug are real.

5. Defer PAM Gateway.
   - PAM is useful for audited just-in-time access to SSH, databases, Redis, and Kubernetes.
   - It requires a working gateway image/deployment path and local machine identity credentials.
   - Store `INFISICAL_GATEWAY_CLIENT_ID` and `INFISICAL_GATEWAY_CLIENT_SECRET` only after creating the local gateway identity.

6. Use SSH dynamic secrets before full PAM if you want quick SSH wins.
   - Configure hosts to trust the Infisical SSH CA once.
   - Generate short-lived SSH certificates for operators instead of spreading static SSH keys.

7. Defer KMS unless application code is ready to call it.
   - KMS is useful for encrypting loan documents, transcripts, and memory snapshots.
   - It is not needed to make basic secret storage, sync, SMTP, or CLI injection work.

## Current Feature Recommendation

| Capability                       | Start now?                                  | Reason                                                                                          |
| -------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Secret sync                      | Yes, after local Universal Auth is finished | Required to make Cloud and local self-hosted Infisical useful together.                         |
| CLI/pre-commit scanning          | Yes                                         | Low friction and immediately useful.                                                            |
| GitHub-connected secret scanning | Soon                                        | Valuable, but depends on real GitHub App/Radar credentials.                                     |
| SSH dynamic secrets / SSH CA     | Soon                                        | High value for cluster access, less infrastructure than full PAM.                               |
| PAM Gateway                      | Later                                       | Useful, but more moving parts and the current gateway image/deploy path still needs correction. |
| KMS                              | Later                                       | Best after specific app surfaces are ready to call KMS APIs.                                    |
