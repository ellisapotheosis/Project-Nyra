# Twenty Extraction Plan

## Upstream-owned

- `apps/twenty/*` upstream source and default scripts.

## Nyra-specific

- `packages/clients/twenty` API wrappers.
- Oracle compose env overlays and startup scripts.
- Object mapping docs and automation scripts.

## Future split steps

1. Move `apps/twenty` to sibling repository.
2. Keep API contract stable via `packages/clients/twenty`.
3. Move `scripts/twenty/*` into new repo and leave compatibility wrappers.
4. Update `infra/oracle/docker-compose.oracle.yml` image/build pointer.

## Minimize split pain

- No Nyra business logic inside upstream internals.
- All custom fields and sync mappings documented in one place.
