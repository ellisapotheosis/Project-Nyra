# Project Nyra Build Guidance

This folder is the planning and execution hub for the current consolidation work.

Path note: legacy guidance in this folder may still mention `apps/webapp/app` and `apps/landing/ratehunter-landing`. The active consolidated app paths are `apps/nyra-webapp` and `apps/ratehunter-landing`.

Goals:
- Keep the public borrower-facing site isolated at `ratehunter.net`
- Consolidate broker-facing tools into a single multi-page app at `app.projectnyra.com`
- Preserve `/home/ellisapotheosis/repos/webapp-merge` as backup source material
- Create local copies of source material inside `project-nyra/apps` so agent work can reference stable in-repo paths

Important directories:
- Master planning package: [MASTER_PLAN.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/MASTER_PLAN.md)
- Master brief: [00-master-build-brief.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/00-master-build-brief.md)
- Exact path map: [01-reference-map.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/01-reference-map.md)
- Agent prompts: [prompts](/home/ellisapotheosis/repos/project-nyra/apps/guidance/prompts)
- Component briefs: [components](/home/ellisapotheosis/repos/project-nyra/apps/guidance/components)
- Frozen backup/reference copy of `webapp-merge`: [references/webapp-merge-snapshot](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot)

Master planning package:
- [MASTER_PLAN.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/MASTER_PLAN.md)
- [CURRENT_STATE_AUDIT.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/CURRENT_STATE_AUDIT.md)
- [FEATURE_MATRIX.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/FEATURE_MATRIX.md)
- [APP_BOUNDARIES.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/APP_BOUNDARIES.md)
- [ROUTE_ARCHITECTURE.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/ROUTE_ARCHITECTURE.md)
- [DESIGN_SYSTEM_PLAN.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/DESIGN_SYSTEM_PLAN.md)
- [DOMAIN_MODEL.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/DOMAIN_MODEL.md)
- [INTEGRATION_ARCHITECTURE.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/INTEGRATION_ARCHITECTURE.md)
- [BUILD_PHASES.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/BUILD_PHASES.md)
- [IMPLEMENTATION_PLAN.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/IMPLEMENTATION_PLAN.md)

Non-negotiable decisions:
- Public site: `apps/ratehunter-landing`
- Internal broker webapp: `apps/nyra-webapp`
- Leave `apps/twenty` untouched
- Do not delete anything from `/home/ellisapotheosis/repos/webapp-merge`
