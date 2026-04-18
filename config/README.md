# Compatibility Configs

This directory is retained for compatibility with older tooling.

## Canonical runtime location

- `infra/configs/*` is the canonical runtime configuration tree.

## Contents here

- `config/nexus/nexus.toml` and `config/health-check/*` are legacy compatibility files.
- New infra-level config changes should be made in `infra/configs/*` first, then synced only when compatibility is required.

## Cleanup policy

- Do not add duplicate backups (for example `file (2).ext`) here.
- Prefer wrappers/symlinks or explicit generation scripts over manual copy/paste drift.
