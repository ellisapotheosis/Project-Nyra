# Project Nyra Prompt Package

Generated from the uploaded `BIG_Prompt_Condense(1).7z` archive.

## What this package is

This is a consolidated multi-agent prompting package created from 23 uploaded text/markdown source files. It converts scattered conversations, planning notes, agent prompts, infrastructure ideas, implementation details, and UI/design notes into large category-specific prompts designed to keep a capable agent working for 25+ minutes without constant micro-prompting.

## How to use

1. Start with `10_agent_handoff_notes.md`.
2. Read `02_canonical_project_context.md`.
3. Send category prompts from `05_category_prompts/` in the dispatch order from `09_dispatch_order.md`.
4. Keep `06_ui_design_quarantine/` separate until UI/design decisions are finalized in Claude Desktop or a design-focused agent.
5. Use `07_conflicts_and_missing_info.md` before destructive implementation.
6. Use `08_env_vars_and_secrets_register.md` when writing `.env`, Infisical, Docker Compose, or CI/CD configs.

## Strong recommendation

Use these prompts as **work orders**, not chatty requests. Each one includes mission, context, tasks, outputs, acceptance criteria, and completion report format.

## Agent mode note

For this consolidation task, normal file-processing mode was enough. Agent Mode would be better for a later phase where you want the system to actually inspect the live GitHub/Vercel state, modify repo files, create branches, run builds/tests, inspect deployment logs, and push PRs. This package did not modify your repo or Vercel deployment.

## Package tree

```text
prompt-package/
├─ README.md
├─ 00_executive_summary.md
├─ 01_source_map.md
├─ 02_canonical_project_context.md
├─ 03_consolidated_master_context.md
├─ 04_task_category_matrix.md
├─ 05_category_prompts/
├─ 06_ui_design_quarantine/
├─ 07_conflicts_and_missing_info.md
├─ 08_env_vars_and_secrets_register.md
├─ 09_dispatch_order.md
├─ 10_agent_handoff_notes.md
├─ MASTER_PROMPT_PACKAGE.md
└─ 99_raw_source_inventory/
```

## Non-negotiables


## Universal agent operating rules

- Treat this as a consolidated multi-agent project package, not a brainstorming note.
- Do not ask basic clarification questions. Make safe assumptions, document them, and continue.
- Prefer additive implementation: new files, overlays, wrappers, docs, interfaces, and tests before broad rewrites.
- Never hardcode secrets. Use Infisical, Vaultwarden, environment placeholders, or secret mounts.
- Never expose provider/API credentials to browser-side code.
- Keep visual UI/design decisions quarantined unless the prompt is explicitly in the UI quarantine folder.
- Preserve strict hostnames: `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Do not use the deprecated placeholder names `Titan` or `Atlas`.
- Do not implement Hermes containers unless a later explicit decision reverses the current final plan.
- Use vLLM/OpenAI-compatible endpoints for primary GPU inference and LiteLLM/Nexus/Hive-compatible routing where possible.
- Keep mortgage compliance constraints visible: rate/quote outputs are estimates, not binding commitments; opt-outs must be honored; borrower data must be protected.
- Use official/authorized CLIs and APIs only. Do not automate around access controls, metering, rate limits, or third-party terms of service.
