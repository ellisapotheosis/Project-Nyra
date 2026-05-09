# Infrastructure Rules

- **Source of Truth:** All active docker-compose files MUST be located within `infra/hosts/<host-name>/`.
- Do not create or move compose files outside of these host directories.
- **Naming Convention:** All `container_name` declarations must start with `${COMPOSE_PROJECT_NAME:-nyra}-`. Do not hardcode the full container name.
- **Makefile Sync:** If you add or modify a compose file, ensure any corresponding references in `/Makefile` are correctly mapped to `infra/hosts/<host-name>/...`.
- Reference `infra/INFRA_STRUCTURE.md` for the full directory layout and architecture.