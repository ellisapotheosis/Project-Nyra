# Project Nyra Build Guidance

This folder is the planning and execution hub for the current consolidation work.

Goals:
- Keep the public borrower-facing site isolated at `ratehunter.net`
- Consolidate broker-facing tools into a single multi-page app at `nyra.ratehunter.net`
- Preserve `/home/ellisapotheosis/repos/webapp-merge` as backup source material
- Create local copies of source material inside `project-nyra/apps` so agent work can reference stable in-repo paths

Important directories:
- Master brief: [00-master-build-brief.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/00-master-build-brief.md)
- Exact path map: [01-reference-map.md](/home/ellisapotheosis/repos/project-nyra/apps/guidance/01-reference-map.md)
- Agent prompts: [prompts](/home/ellisapotheosis/repos/project-nyra/apps/guidance/prompts)
- Component briefs: [components](/home/ellisapotheosis/repos/project-nyra/apps/guidance/components)
- Frozen backup/reference copy of `webapp-merge`: [references/webapp-merge-snapshot](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot)

Non-negotiable decisions:
- Public site: `apps/landing/ratehunter-landing`
- Internal broker webapp: `apps/webapp/app`
- Leave `apps/twenty` untouched
- Do not delete anything from `/home/ellisapotheosis/repos/webapp-merge`

