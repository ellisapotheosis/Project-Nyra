# Apps Documentation Index

`docs/apps` is the product and application context hub for Project Nyra.
Use this folder for docs about the broker/customer webapp, CRM integration,
campaign automation, landing page, app-facing services, and UI consolidation.

## Routing Rule

Project Nyra's app data path is:

```text
WebApp -> CRM API -> Twenty CRM
```

Project Nyra's AI path is:

```text
WebApp -> Nexus Router -> model/tool backends
```

Place general product/app context directly in this folder. Place focused docs
in the numbered child folders below.

## Folders

- `01_Webapp_Nexus/` - the consolidated Next.js webapp, former admin UI pieces,
  Nexus Router UI/API context, OpenClaw-facing assistant surfaces, quote-service
  docs, MCP/server UI references, and app-facing API docs.
- `02_TwentyCRM_Core/` - Twenty CRM strategy, customization, extraction,
  CRM requirements, and CRM API/Twenty bridge integration docs.
- `03_Automation_Engine/` - n8n, Activepieces, mortgage drip campaign builder
  context, workflow JSON, campaign/compliance services, STOP/unsubscribe/reply
  guardrails, and campaign-engine prompts/specs.
- `04_Landing_Page/` - landing page, lead capture, RateHunter marketing site,
  and Cloudflare Pages setup docs.

## Consolidation Notes

- `apps/admin` is being absorbed into `apps/projectnyra` as internal pages and
  reusable components.
- Other app surfaces should be treated as webapp pages, webapp services, or
  extractable UI/components unless they are specifically n8n/Activepieces,
  landing page, or Twenty CRM.
- The webapp should expose efficient operational pages for campaign building,
  CRM lookup/status tracking, Nexus Router visibility, and available service UI
  surfaces such as OpenMemory MCP, Letta, OpenClaw, Nerve UI, ClawTeam, and
  Gastown where those UIs are useful.
- n8n remains execution glue. The mortgage lead drip campaign builder belongs
  in the webapp as a purpose-built UI over the campaign workflow pieces.
- Twenty CRM remains the system of record. The webapp may link to Twenty CRM,
  but business data flows through the CRM API boundary.
