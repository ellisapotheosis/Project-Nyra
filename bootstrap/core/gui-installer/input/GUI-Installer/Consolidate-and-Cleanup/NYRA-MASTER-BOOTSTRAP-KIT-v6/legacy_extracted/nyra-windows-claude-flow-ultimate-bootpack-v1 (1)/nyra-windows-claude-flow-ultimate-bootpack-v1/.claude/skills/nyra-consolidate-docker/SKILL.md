---
name: nyra-consolidate-docker
description: Unify all Docker Compose files, profiles, Dockerfiles, and configs under nyra-infra/compose with validation.
tags: [docker, compose, profiles, windows, validation, consolidation]
category: devops
---

# NYRA — Docker/Compose Consolidation

## Goal
Collect **all** Compose files (`*compose*.yml`, `docker-compose*.yml`, `compose/*.yml`), **Dockerfiles**, and **config** fragments and unify them into `nyra-infra/compose/`. Create canonical stacks: `compose.core.yml` and `compose.tools.yml`. Ensure profile naming: `dev`, `prod`, `ops`.

## Guardrails
- Validate each edit with `docker compose -f <file> config --env-file nyra-infra\.env` (hook enforces after write).
- Env externalization: enforce `env_file: ["../.env"]` for services.
- Ensure external network `nyra-network` exists.

## Steps
1. Inventory and classify by function: core (router/metamcp/openwebui) vs tools (lobechat/dify/archon/others).
2. Write/Update:
   - `nyra-infra/compose/compose.core.yml`
   - `nyra-infra/compose/compose.tools.yml`
3. Normalize volumes, ports, and networks; remove `version:` keys; switch any UI target to `http://metamcp:12008`.
4. Validate both compose files.
5. Create branch `infra/compose-consolidation`, move legacy files to `archive/<DATE>-repo-cleanup/`, commit.

## Outputs
- Canonical compose files
- Validation logs
- Migration list
