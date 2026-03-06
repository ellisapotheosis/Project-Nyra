# 13 Infra Recovery Consolidation Plan

## Trigger

Post-move documentation contained placeholder outputs (timestamp-only docs) and polluted ports inventory from archive/example compose files.

## Recovery objectives

1. Rebuild empty docs from repository truth.
2. Regenerate active-only ports registry using authoritative compose scope.
3. Produce cloudflared edge pack with strict non-datastore exposure.
4. Integrate Gitea + Infisical bootstrap in fail-closed additive mode.

## Execution order

1. **Inventory first** (compose, secrets, Make targets, workflows).
2. **Docs rebuild** for low-content `docs/01..20` entries.
3. **Ports registry** regeneration + archive appendix split.
4. **Cloudflared edge pack** regeneration + ingress validation.
5. **Bootstrap integration** with additive make targets and bootstrap compose files.
6. **Validation gates** (compose config, workflow YAML validity, cloudflared ingress).

## Non-destructive policy

- No deletions performed.
- Existing compose files remain untouched for backwards compatibility.
- New bootstrap compose files created in parallel because canonical names already existed.

## Security policy applied

- No real secrets committed.
- `.env.gitea`, `.env.infisical`, and `.secrets/` retained in gitignore.
- Datastore services marked private in documentation and excluded from ingress.

## Output artifacts

- Regenerated docs in `docs/01..20` scope.
- `docs/02_ports_registry.appendix_legacy.md` for excluded legacy/reference compose paths.
- `infra/cloudflared/config.yml` + `infra/cloudflared/hostname-map.md`.
- `docs/edge/CLOUDFLARED_EXPORT.md` owner-facing summary.

## Exit criteria
- Placeholder docs replaced with evidence-backed content.
- Active ports registry excludes archive/reference trees.
- Cloudflared config validates and contains no datastore ingress rules.
- Additive Gitea/Infisical bootstrap targets exist and do not break prior targets.

## Deferred items
- End-to-end runtime smoke tests pending Docker-enabled environment.
- Broader cleanup of legacy references can be handled in a follow-up non-blocking PR.
