# Prompt Run 08: CRM, Integrations, And Tool Routes

```text
You are Codex working in Project Nyra.

Run label: 08-crm-integrations-tools
Timebox: 90-150 minutes
Context budget: CRM and tool routes only
Primary scope: apps/nyra-webapp/app/crm/**, admin/integrations, tools/**

Read first:
- AGENTS.md
- apps/guidance/master-guidance/04-crm-twenty-integration-spec.md
- apps/guidance/master-guidance/05-ui-pages-tools-and-subdomains-spec.md
- apps/guidance/master-guidance/06-service-integration-map.md
- apps/guidance/master-guidance/12-webapp-route-implementation-blueprints.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Make CRM sync, integrations, and tool wrappers safe and clear.

Tasks:
- Deepen /crm with sync health, object map, recent writes, failures, queue depth, webhook status, Twenty deep link, and data freshness labels.
- Add /crm/settings with credential health placeholders, required secret list, field/object mapping, sync policy, dry-run tester, and owner manual actions.
- Expand /admin/integrations with health, required secrets, owner actions, failed jobs/runs, and tool/service grid.
- Add or deepen /tools/openclaw, /tools/nexus, /tools/n8n, /tools/activepieces, /tools/openmemory, /tools/paperclip.

Do not:
- Expose raw internal endpoints.
- Directly mutate Twenty.
- Treat n8n/Activepieces as broker-facing product UI.

Validation:
- pnpm --filter mortgage-assistant typecheck
- pnpm --filter mortgage-assistant lint
- pnpm --filter mortgage-assistant build
- rg -n "localhost:|127\\.0\\.0\\.1|FALKORDB|QDRANT|PORTAINER|LITELLM_BASE_URL|OPENROUTER_API_KEY" apps/nyra-webapp/app apps/nyra-webapp/components || true
- git diff --check -- apps/nyra-webapp

Final response:
- Files changed.
- Internal endpoint exposure scan evidence.
- Validation evidence.
- Remaining service wiring.
```
