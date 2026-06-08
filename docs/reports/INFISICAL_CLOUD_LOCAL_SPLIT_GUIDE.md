# Infisical Cloud Guide

This guide reflects the cloud-only Infisical setup. The local self-hosted split has been retired.

## Source of Truth Paths

| Path                  | Owner           | Contents                                                                                                                                                                                                       |
| --------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/security/infisical` | Infisical Cloud | Cloud auth material: `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`, `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`, `INFISICAL_PROJECT_ID`, `INFISICAL_TOKEN` if needed, `INFISICAL_API_URL`, and Cloud org/project metadata. |

Do not store retired local self-host bootstrap secrets in `/security/infisical`. The sync script now reads Cloud credentials from `/security/infisical` only.

## Recommended Cloud Setup Order

1. Finish Cloud Universal Auth in the Infisical Cloud UI.
   - Create a Cloud Machine Identity in the project.
   - Give it access to the environments and paths you want to sync.
   - Store the Cloud Universal Auth material in `/security/infisical`.
   - Required sync keys: `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`, `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`, and `INFISICAL_PROJECT_ID`.

2. Run a dry-run before any real sync.
   - `make infisical-cloud-status`
   - `make infisical-cloud-dry-run`
   - Keep Cloud authoritative.

3. Enable CLI/pre-commit secret scanning first.
   - Use `infisical scan` and `infisical scan git-changes --staged`.
   - This catches leaks immediately and does not require GitHub App/Radar setup.

4. Enable repository-connected secret scanning after GitHub App/Radar credentials exist.
   - Store real values in `/security/infisical`: `INFISICAL_SCAN_GIT_APP_ID`, `INFISICAL_SCAN_GIT_PRIVATE_KEY`, `INFISICAL_SCAN_GIT_APP_SLUG`, and `INFISICAL_SCAN_GIT_WEBHOOK_SECRET`.
   - Keep `SECRET_SCANNING_ENABLED=false` until the App ID, private key, and slug are real.

5. Defer PAM Gateway.
   - PAM is useful for audited just-in-time access to SSH, databases, Redis, and Kubernetes.
   - It requires a working gateway image/deployment path and machine identity credentials.
   - Store `INFISICAL_GATEWAY_CLIENT_ID` and `INFISICAL_GATEWAY_CLIENT_SECRET` only after creating the gateway identity.

6. Use SSH dynamic secrets before full PAM if you want quick SSH wins.
   - Configure hosts to trust the Infisical SSH CA once.
   - Generate short-lived SSH certificates for operators instead of spreading static SSH keys.

7. Defer KMS unless application code is ready to call it.
   - KMS is useful for encrypting loan documents, transcripts, and memory snapshots.
   - It is not needed to make basic secret storage, sync, SMTP, or CLI injection work.

## Current Feature Recommendation

| Capability                       | Start now? | Reason                                                                             |
| -------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| Secret sync                      | Yes        | Required to keep Cloud authoritative.                                              |
| CLI/pre-commit scanning          | Yes        | Low friction and immediately useful.                                               |
| GitHub-connected secret scanning | Soon       | Valuable, but depends on real GitHub App/Radar credentials.                        |
| SSH dynamic secrets / SSH CA     | Soon       | High value for cluster access, less infrastructure than full PAM.                  |
| PAM Gateway                      | Later      | Useful, but more moving parts and the current gateway path still needs correction. |
| KMS                              | Later      | Best after specific app surfaces are ready to call KMS APIs.                       |
