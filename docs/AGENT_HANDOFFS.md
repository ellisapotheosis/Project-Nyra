# Agent Handoffs

## Current Track

Executable Conductor track: `conductor/tracks/omni_prompting_pack_v3_20260524`.

Raw prompt pack provenance: `conductor/prompts/nyra-omni-prompting-pack-v3`.

Status: prompts 00-07 are executed locally. Prompt 08 has been executed only through the explicitly assigned safe slice: dependency validation plus theme registry/provider/switcher. Owner-gated live checks remain.

Z-drive reconciliation: `/mnt/z/nyra_omni_prompting_pack_v3` was mounted via drvfs on 2026-05-26 and preserved at `conductor/prompts/nyra-omni-prompting-pack-v3-zdrive-20260526`. Its only detected delta from the prior import was a retired workspace reference in Prompt 01, which is superseded by Gastown.

## Next Non-UI Work

1. Continue only owner-gated live checks after Infisical and Cloudflare/domain setup is ready.
2. Use `docs/reports/NON_UI_FOUNDATION_QA_REPORT.md` as the QA starting point.
3. Keep broader UI work limited to explicit UI assignments; completed safe slice is theme registry/provider/switcher only.

## CRM Progress

- ProjectNyra CRM page now derives broker action queues from CRM workspace data: compliance checks, campaign reviews, quote follow-up, and sync warnings.
- `/api/crm` now returns a generated CRM workspace snapshot instead of a deprecated placeholder.
- Broker command deck now reads `/api/crm` for headline stats and priority queue data.
- CRM-backed `/crm` and `/applications` pages are dynamic, preventing build-time credential failures while keeping runtime CRM reads fail-closed without `NYRA_ENABLE_MOCKS=true`.

## Safety Notes

- Gastown is the active workspace replacement.
- Activepieces is primary; n8n is constrained fallback.
- Do not expose raw worker/model/MCP/database endpoints publicly.
