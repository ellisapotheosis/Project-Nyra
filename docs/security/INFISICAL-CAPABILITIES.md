# Infisical Capability Map

This repo uses Infisical as a set of distinct primitives, not as one generic vault.

## 1. Secrets Management

Use for:

- application secrets
- environment injection at runtime
- environment-scoped access control
- local development with `infisical run`

Repo pattern:

- use `infisical run` or `infisical export` for runtime injection
- keep `.env.example` files sanitized and tracked
- never commit generated `.env` files

## 2. Privileged Access Management

Use for:

- database access
- SSH access
- controlled operational access to private infrastructure
- session recording and audit trails

Good fit here:

- private admin access to Oracle VPS resources
- controlled access to internal databases or bastion-style workflows

Plan note:

- PAM is an Enterprise capability, not part of the free tier

Not a fit for:

- rewriting provider API keys in outgoing application requests
- replacing the local pre-commit leak block

## 3. Key Management Service

Use for:

- encrypt
- decrypt
- sign
- verify

Verified API surface:

- `kms/encryption/encrypt`
- `kms/encryption/decrypt`
- `kms/signing/sign`
- `kms/signing/verify`

Practical rule:

- use KMS only when the application truly needs remote cryptographic operations
- keep the local fallback if KMS is unavailable or too expensive for the chosen plan

Repo implementation:

- `scripts/infisical/kms.sh` wraps the official REST endpoints for list/get/create/rotate/delete plus encrypt/decrypt/sign/verify/public-key/private-key
- the wrapper requires an Infisical bearer token and keeps private-key export behind an explicit opt-in flag

Important:

- KMIP exists, but the docs mark it as enterprise-only
- do not base the repo’s default plan on KMIP

## 4. Secret Scanning

Use for:

- repository scanning
- directory scanning
- file scanning
- local developer-machine scanning

Repo pattern:

- `scripts/security/nyra-secret-scan.sh` blocks staged leaks locally
- `infisical scan` is used when available, but local fallback rules remain enforced
- `.infisicalignore` can suppress known-false-positive fingerprints in Infisical scans

## 5. Gateway

Use for:

- secure access to private resources
- private DB and server reachability without opening inbound access directly

Good fit here:

- private Oracle VPS resources
- internal databases
- SSH-style access paths

Plan note:

- Gateway is an Enterprise capability, not part of the free tier

## 6. Repo Decision Rules

- Use PAM for access to infrastructure.
- Use KMS for cryptographic operations.
- Use secret scanning for leak prevention.
- Use the gateway for private-resource reachability.
- Keep the local pre-commit scanner even if Infisical scanning is enabled.

## 7. Current repository posture

Current state:

- local secret scan and hook are implemented
- env-file audit is implemented
- runtime secret injection via Infisical already exists in several scripts and workflows
- KMS and PAM should be adopted only where they replace a real operational need, not just for feature parity
- Oracle Terraform now seeds Docker, permissions, and the `/opt/infisical` layout via cloud-init so the host is ready for the compose stack after provisioning

## 8. Pricing boundary

As of 2026-07-11:

- Free: $0/mo
- Pro: $18/mo per identity
- Enterprise: custom pricing

Practical implication:

- secret scanning and leak prevention are available on Free
- PAM, Gateway, and KMS/HSM capabilities are Enterprise-tier features
- a sub-$10 Infisical monthly plan is not currently the relevant threshold for those capabilities

Residual rule:

- no feature should assume secret values are safe to expose in process args, logs, or tracked files
